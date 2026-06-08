import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { callClaude } from '@/lib/anthropic/client'
import {
  SECTION_GOVERNANCE,
  SOURCE_FAMILIES,
  type SourceFamily,
  type SectionKey,
  type SectionRule,
} from '@/lib/luxai/source-governance'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// WikiLux Engine — SLICE B1: Discovery Planner (read-only, contract-constrained)
// Per docs/WIKILUX_ENGINE_DESIGN_V2.md. First consumer of source-governance.ts.
//
// Given a brand NAME (context only — no facts fetched), Haiku produces a
// per-section SOURCING PLAN by reasoning ONLY WITHIN each section's allowed
// families. It may reorder + justify; it may NOT add/invent/substitute a family.
// A programmatic guard enforces the contract after parse: any out-of-contract
// family is DROPPED from the plan and recorded in violations[] with Haiku's
// original intent preserved (calibration data for the later Baccarat run).
//
// THIS SLICE FETCHES NOTHING and WRITES NOTHING. No Wikidata/Wikipedia/official
// fetch, no corpus, no brand-content generation, no supabase, no persistence.
// The ONLY model call is the planner reasoning over the CONTRACT.
// ---------------------------------------------------------------------------

// --- Contract-derived planner input (per section) --------------------------
// Built from SECTION_GOVERNANCE + SOURCE_FAMILIES ONLY. No brand facts.
interface PlannerSectionInput {
  section: SectionKey
  primary_only: boolean
  baseline_confidence: string
  allowed_families: { family: SourceFamily; trust: string }[]
  fallback: { family: SourceFamily; fallback_use: string }[]
}

function buildPlannerInputs(): PlannerSectionInput[] {
  return (Object.values(SECTION_GOVERNANCE) as SectionRule[]).map(rule => ({
    section: rule.section,
    primary_only: rule.primary_only,
    baseline_confidence: rule.confidence,
    allowed_families: rule.allowed_families.map(f => ({
      family: f,
      trust: SOURCE_FAMILIES[f].trust,
    })),
    fallback: rule.fallback.map(fb => ({
      family: fb.family,
      fallback_use: fb.fallback_use,
    })),
  }))
}

// The set of families the contract permits for a section = allowed ∪ fallback.
function allowedSetFor(rule: SectionRule): Set<SourceFamily> {
  const set = new Set<SourceFamily>(rule.allowed_families)
  for (const fb of rule.fallback) set.add(fb.family)
  return set
}

const VALID_CONFIDENCE = new Set([
  'primary_support',
  'multi_source_support',
  'fallback_only',
  'context_only',
  'unsupported',
])

const PLANNER_SYSTEM = `You are a contract-constrained SOURCING ANALYST for the JOBLUX WikiLux engine. You do NOT know any brand facts and you do NOT fetch anything. Your only job: for each brand-page section, decide the ORDER in which its ALLOWED source families should be queried, and justify it.

NON-NEGOTIABLE CONTRACT RULE:
- For each section you are given an explicit allowed_families list (with trust) and a fallback list. You may ONLY use families from that section's allowed_families ∪ fallback. You may REORDER them and you may JUSTIFY the order. You may NOT add, invent, rename, or substitute any family outside that list. There is no "other" family.
- primary_only sections REQUIRE a primary-trust family to anchor them — mark those as mandatory. Tertiary/crowd-sourced families may never be the sole support there.
- fallback families (especially fallback_use=context_only) are colour/round-out, never load-bearing — list them under fallback, not as the lead.
- Output VALID JSON ONLY. No markdown, no backticks, no commentary.`

function buildPlannerPrompt(brand: string, inputs: PlannerSectionInput[]): string {
  return `BRAND (context only — you have NO facts about it, do not invent any): ${brand}

SECTIONS + THEIR CONTRACT (the ONLY families you may use per section):
${JSON.stringify(inputs, null, 2)}

TASK: Produce a single JSON object keyed by section name. For EACH of the ${inputs.length} sections above, output:
{
  "order": ["family", ...],        // the allowed families, RANKED in the order you would query them (best source first)
  "mandatory": ["family", ...],    // families that MUST anchor this section (primary_only -> the primary-trust ones); [] if none
  "fallback": ["family", ...],     // context_only / fallback families, used only to round out
  "confidence": "primary_support" | "multi_source_support" | "fallback_only" | "context_only" | "unsupported",
  "rationale": "one line: WHY these families, in this order, for THIS section"
}

RULES:
- Use ONLY families from that section's allowed_families ∪ fallback. Never add or substitute.
- Every family you place MUST come from that section's lists. If you are tempted to reach outside, you are wrong — stay inside the contract.
- Keep rationale to one sentence. Encyclopedic, factual tone.
- Output valid JSON only. No markdown. No backticks. No explanation.`
}

// Strip markdown fences + isolate the JSON object (Haiku wraps in backticks).
function parseModelJson(text: string): any {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```(?:json|JSON)?\s*\n?/, '')
  cleaned = cleaned.replace(/\n?```\s*$/, '')
  cleaned = cleaned.trim()
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1)
  }
  return JSON.parse(cleaned)
}

// --- Output shapes ----------------------------------------------------------
interface SectionPlan {
  order: SourceFamily[]
  mandatory: SourceFamily[]
  fallback: SourceFamily[]
  confidence: string
  rationale: string
  source: 'haiku' | 'contract_fallback'
}

interface Violation {
  section: SectionKey
  family: string
  reason: 'not_allowed'
  proposed_rank: number | null
  proposed_rationale: string
}

// Coerce an unknown value into a clean string[] (drops non-strings).
function asStringArray(v: any): string[] {
  if (!Array.isArray(v)) return []
  return v.filter(x => typeof x === 'string')
}

export async function POST(request: Request) {
  try {
    // 1. AUTH — same gate as wikilux-build.
    const session = await getServerSession(authOptions)
    const role = (session?.user as { role?: string } | undefined)?.role
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { brand } = await request.json()
    if (!brand || typeof brand !== 'string' || brand.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'brand required (min 2 characters)' },
        { status: 400 }
      )
    }
    const name = brand.trim()

    // 2. CONTRACT INPUTS — built from the governance contract ONLY (no fetch).
    const inputs = buildPlannerInputs()

    // 3. PLANNER — ONE Haiku call reasoning over the contract.
    const aiText = await callClaude({
      system: PLANNER_SYSTEM,
      prompt: buildPlannerPrompt(name, inputs),
      maxTokens: 4000,
    })

    let raw: Record<string, any>
    try {
      raw = parseModelJson(aiText)
    } catch (e: any) {
      return NextResponse.json(
        { success: false, message: `Planner output parse failed: ${e.message}` },
        { status: 500 }
      )
    }

    // 4. CONTRACT GUARD — the teeth. For every section, validate every family
    //    Haiku proposed against allowed ∪ fallback. Out-of-contract families are
    //    DROPPED from the live plan and recorded in violations[] with intent kept.
    const plan: Record<string, SectionPlan> = {}
    const violations: Violation[] = []

    for (const rule of Object.values(SECTION_GOVERNANCE) as SectionRule[]) {
      const section = rule.section
      const allowed = allowedSetFor(rule)
      const proposed = (raw && typeof raw[section] === 'object' && raw[section]) || {}

      const proposedOrder = asStringArray(proposed.order)
      const proposedMandatory = asStringArray(proposed.mandatory)
      const proposedFallback = asStringArray(proposed.fallback)
      const proposedRationale =
        typeof proposed.rationale === 'string' ? proposed.rationale : ''

      // Rank lookup for violation reporting: 1-based position in Haiku's order.
      const rankOf = (fam: string): number | null => {
        const idx = proposedOrder.indexOf(fam)
        return idx === -1 ? null : idx + 1
      }

      // Record any out-of-contract family ONCE per section (union of all 3 lists).
      const seenViolators = new Set<string>()
      for (const fam of [
        ...proposedOrder,
        ...proposedMandatory,
        ...proposedFallback,
      ]) {
        if (!allowed.has(fam as SourceFamily) && !seenViolators.has(fam)) {
          seenViolators.add(fam)
          violations.push({
            section,
            family: fam,
            reason: 'not_allowed',
            proposed_rank: rankOf(fam),
            proposed_rationale: proposedRationale,
          })
        }
      }

      // Keep only in-contract families (drop violators from the live plan).
      const keep = (arr: string[]): SourceFamily[] =>
        arr.filter(f => allowed.has(f as SourceFamily)) as SourceFamily[]

      // If the planner gave nothing usable for this section, fall back to the
      // contract's own ordering so the plan still covers all 16 sections.
      // The source marker records which path filled the order.
      const haikuOrder = keep(proposedOrder)
      const usedFallback = haikuOrder.length === 0
      const order = usedFallback ? [...rule.allowed_families] : haikuOrder

      const confidence = VALID_CONFIDENCE.has(proposed.confidence)
        ? (proposed.confidence as string)
        : rule.confidence

      plan[section] = {
        order,
        mandatory: keep(proposedMandatory),
        fallback: keep(proposedFallback),
        confidence,
        rationale: proposedRationale,
        source: usedFallback ? 'contract_fallback' : 'haiku',
      }
    }

    // 5. RETURN — WRITE NOTHING. Plan + intent-preserving violations only.
    return NextResponse.json({
      brand: name,
      sections_planned: Object.keys(plan).length,
      plan,
      violations,
    })
  } catch (error: any) {
    console.error('WikiLux plan error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
