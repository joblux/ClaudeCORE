// ---------------------------------------------------------------------------
// LuxAI Signals — Sourced-Signal Synthesis (633d6f8c Slice B1)
//
// ROLE: transform one approved sourced draft (Discovery + TriageResult +
// fetched page text) into publishable signal editorial fields. Library only —
// no route, no DB, no queue write; the approve-path merge happens in B2.
//
// Editorial format (LOCKED Mo+GPT Jun 11): signal = verified fact + market
// read + career implication, 120–200 words TOTAL, sourced-or-empty per field.
//
// SOURCED-OR-EMPTY is the hard rule: every field derives ONLY from the page
// text + discovery title/snippet. No outside knowledge, no invention — a
// field the source cannot support comes back null, never fabricated.
//
// The model does NOT output category, brand_tags, confidence, or source
// fields — those are mechanical and merged later at the route (B2).
// source_read is set by CODE from the pageText argument, never by the model.
// ---------------------------------------------------------------------------

import { callClaude } from '@/lib/anthropic/client'
import type { Discovery } from './discovery-runner'
import type { TriageResult } from './queue-writer'

export type SynthesisResult = {
  headline: string | null
  what_happened: string | null
  why_it_matters: string | null
  career_implications: string | null
  context_paragraph: string | null
  brand_impact: string[] | null
  meta_title: string | null
  meta_description: string | null
  source_read: boolean
  word_count: number
}

const MODEL_FIELDS = [
  'headline',
  'what_happened',
  'why_it_matters',
  'career_implications',
  'context_paragraph',
  'brand_impact',
  'meta_title',
  'meta_description',
] as const

function buildSystemPrompt(sourceRead: boolean): string {
  return `You are the JOBLUX Intelligence signal synthesizer. JOBLUX covers luxury-industry careers. You turn ONE verified news story into ONE short career-intelligence signal.

HARD RULES — SOURCED-OR-EMPTY:
- Every field must derive ONLY from the source material provided below (page text, title, snippet). No outside knowledge. No invention. No assumption beyond what the source states.
- If the source does not support a field, return null for that field. Null is always better than fabrication.
- Never speculate about people, numbers, dates, or plans not stated in the source.
- NEVER state a specific (job titles, role names, numbers, locations, dates) that does not appear verbatim or near-verbatim in the input. Grounded analyst reasoning is allowed — invented specifics are not. Example of a violation: the source says a store reopened, and you name role types like "bilingual client advisors" that appear nowhere in the input.
${sourceRead ? '' : '- IMPORTANT: only the title and snippet are available (the page itself could not be read). Stay descriptive and cautious — synthesize only what the title and snippet directly state, keep analysis general rather than specific, and null any field they cannot support.\n'}
EDITORIAL SHAPE (this is a signal, not an article — 120–200 words TOTAL across what_happened + why_it_matters + career_implications):
- headline: a JOBLUX-written signal headline — factual, short (max ~12 words), neutral, signal-first, American English. NEVER copy or lightly rephrase the source headline. Never a question, never clickbait or marketing tone. State the verified move plainly (e.g. 'LVMH agrees sale of Marc Jacobs to WHP Global and G-III').
- what_happened: the verified fact, 2-3 sentences. What the source reports, nothing more.
- why_it_matters: the market read — what this means for the luxury industry, grounded in the source.
- career_implications: what the fact MEANS for professionals — expertise profile, skills exposure, weight/significance of the posting or function. NEVER predict hiring, staffing needs, or job openings ('roles likely needed', 'creates staffing opportunities' are violations). Describe significance, never recruitment.
- context_paragraph: optional one-paragraph background ONLY if the source itself provides background context; else null.
- brand_impact: array of short statements on impact per brand named in the source; else null.
- meta_title: SEO title (≤60 chars) restating the verified fact; null if the fact is unclear.
- meta_description: SEO description (≤155 chars) from the source only; null if unsupported.

LANGUAGE: AMERICAN ENGLISH spelling and usage in ALL output, even when the source is UK/French/European (jewelry not jewellery, modernizes not modernises, etc.). Normalize source spellings.

STYLE: Precise, sober, intelligence-brief tone. No hype, no marketing language. Prefer plain professional language over consulting, agency, MBA, or corporate-jargon phrasing. Clarity beats sophistication.

OUTPUT: a single JSON object with EXACTLY these keys: headline, what_happened, why_it_matters, career_implications, context_paragraph, brand_impact, meta_title, meta_description. String or null for each except brand_impact (array of strings or null). Do NOT output category, brand_tags, confidence, source name/url, or any other key. JSON only.`
}

function buildUserPrompt(discovery: Discovery, triage: TriageResult, pageText: string | null): string {
  const parts = [
    `BRAND: ${discovery.brand}`,
    `TITLE: ${discovery.title}`,
    discovery.snippet ? `SNIPPET: ${discovery.snippet}` : null,
    triage.published_date ? `PUBLISHED DATE (triage): ${triage.published_date}` : null,
    `TRIAGE READING (orientation only — not a source of facts): ${triage.reasoning}`,
    pageText
      ? `PAGE TEXT (the source — facts come from here):\n${pageText}`
      : `PAGE TEXT: UNAVAILABLE (page could not be read — title and snippet are the only source).`,
  ]
  return parts.filter(Boolean).join('\n\n')
}

// Count words across the three main editorial fields (code-side, never the model).
function countWords(r: Pick<SynthesisResult, 'what_happened' | 'why_it_matters' | 'career_implications'>): number {
  return [r.what_happened, r.why_it_matters, r.career_implications]
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .map((s) => s.trim().split(/\s+/).length)
    .reduce((a, b) => a + b, 0)
}

function asStringOrNull(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null
}

function asStringArrayOrNull(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null
  const items = v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim())
  return items.length > 0 ? items : null
}

/**
 * Synthesize publishable signal editorial fields from one sourced draft.
 * pageText null → title+snippet-only synthesis, source_read=false (set here,
 * mechanically — the model has no authority over source_read).
 */
export async function synthesizeSignal(
  discovery: Discovery,
  triage: TriageResult,
  pageText: string | null
): Promise<SynthesisResult> {
  const sourceRead = pageText !== null

  const raw = await callClaude({
    system: buildSystemPrompt(sourceRead),
    prompt: buildUserPrompt(discovery, triage, pageText),
    maxTokens: 1500,
  })

  // Haiku wraps JSON in markdown fences — strip by first '{' / last '}'.
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`Synthesis returned no JSON object (got: ${raw.slice(0, 200)})`)
  }
  const parsed = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>

  const unexpected = Object.keys(parsed).filter((k) => !(MODEL_FIELDS as readonly string[]).includes(k))
  if (unexpected.length > 0) {
    // Mechanical fields (category/brand_tags/confidence/source) belong to the
    // route merge — drop anything the model was told not to produce.
    for (const k of unexpected) delete parsed[k]
  }

  const result: SynthesisResult = {
    headline: asStringOrNull(parsed.headline),
    what_happened: asStringOrNull(parsed.what_happened),
    why_it_matters: asStringOrNull(parsed.why_it_matters),
    career_implications: asStringOrNull(parsed.career_implications),
    context_paragraph: asStringOrNull(parsed.context_paragraph),
    brand_impact: asStringArrayOrNull(parsed.brand_impact),
    meta_title: asStringOrNull(parsed.meta_title),
    meta_description: asStringOrNull(parsed.meta_description),
    source_read: sourceRead,
    word_count: 0,
  }
  result.word_count = countWords(result)

  return result
}
