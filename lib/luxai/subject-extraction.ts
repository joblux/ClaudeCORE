// ---------------------------------------------------------------------------
// LuxAI Acquisition — Subject Extraction (V1 canon)
//
// Lifted VERBATIM from /tmp/adm3a-v3.ts Experiment B — ADM-3a v3 ACCEPTED
// Jun 11 2026 (all checks PASS; ledger 1003c355). Same canon-lift pattern as
// lib/luxai/wikidata.ts / lib/luxai/triage.ts: one canonical copy,
// behaviour-identical to the accepted lab run, deliberate deviations listed
// below.
//
// ROLE: brand-NEUTRAL subject_brands extraction. The lab proved (v1/v2/v3
// wording iterations) that subject extraction inside the brand-scoped triage
// prompt is ANCHORED on the swept brand — co-subject maisons read as
// comparison context regardless of wording. The fix is structural: this call
// carries NO brand framing anywhere. Output feeds the mechanical maison tag
// rule in queue-writer; no publish authority — Mo review remains the gate.
//
// Deviations from the /tmp source (nothing else):
//   1. Lab harness dropped (Supabase ground-truth load, per-draft card writer,
//      CHECKS evaluation, v1/v2 delta) — the module exports a callable
//      extraction fn only; the Anthropic SDK is imported repo-native instead
//      of via createRequire on /tmp paths.
//   2. API key sourcing: manual .env.local parse → process.env (caller owns
//      env loading); missing ANTHROPIC_API_KEY throws.
//   3. Type wiring to repo canon: input is Discovery from ./discovery-runner
//      (the lab read the same fields back out of stored raw_content.discovery).
//      System prompt and item shape (index, title, source, category, snippet
//      capped 600) are byte-identical to the accepted Experiment B run.
//   4. Defensive result handling promoted as validated: a missing/non-array
//      subject_brands in one result becomes [] — never a throw.
// ---------------------------------------------------------------------------

import Anthropic from '@anthropic-ai/sdk'
import type { Discovery } from './discovery-runner'

export type SubjectExtraction = { subject_brands: string[] }

// Brand-NEUTRAL by design — the swept brand must never appear in this prompt.
const SYSTEM = `You analyze luxury-industry news items for JOBLUX, a luxury-industry intelligence platform. For EACH input item you return exactly one JSON object: {"index": <input index>, "subject_brands": [...]}.

- subject_brands (string[]): the luxury maisons the story is actually ABOUT, as named in title/snippet. A story reporting substantive information about the business of MORE THAN ONE maison lists each of them. A maison mentioned only in passing (tenant list, comparison, market roundup context) is NOT a subject. Group names (LVMH, Richemont, Kering, Prada Group) are groups, not maisons — never include them; but corporate suffixes (Group, Plc, S.A., SpA) in a maison's own listed-company name do not make it a group. Empty array if no maison is the subject.

Hard rules:
- Unknown or unclear -> empty array. Never invent facts.
- Output ONLY JSON, shaped {"results":[{"index":0,"subject_brands":[...]}, ...]}, one result per input item, in input order. No prose, no markdown.`

function parseHaikuJson(text: string): { results: any[] } {
  // Haiku wraps JSON in markdown fences — parse from first { to last } (doctrine).
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) throw new Error('no JSON object in response')
  return JSON.parse(text.slice(start, end + 1))
}

// Haiku 4.5 canon (matches the repo-pinned id in lib/anthropic/client.ts).
// Never Sonnet/Opus.
const MODEL = 'claude-haiku-4-5-20251001'

export async function extractSubjects(discoveries: Discovery[]): Promise<SubjectExtraction[]> {
  if (discoveries.length === 0) return []

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('subject-extraction: ANTHROPIC_API_KEY is not set')
  const anthropic = new Anthropic({ apiKey })

  const items = discoveries.map((d, i) => ({
    index: i,
    title: d.title,
    source: d.source,
    category: d.category,
    snippet: (d.snippet ?? '').slice(0, 600) || null,
  }))
  const user = `ITEMS (${items.length} items). Return one result per item, in this order:\n${JSON.stringify(items, null, 1)}`

  let results: any[] | null = null
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const msg = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 16000,
        system: SYSTEM,
        messages: [{ role: 'user', content: user }],
      })
      if (msg.stop_reason === 'max_tokens') throw new Error('output truncated at max_tokens')
      const text = msg.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
      const p = parseHaikuJson(text)
      if (!Array.isArray(p.results) || p.results.length !== items.length) {
        throw new Error(`expected ${items.length} results, got ${Array.isArray(p.results) ? p.results.length : 'none'}`)
      }
      results = p.results
      break
    } catch (e) {
      if (attempt === 2) throw e
    }
  }

  return results!.map((r) => ({
    subject_brands: Array.isArray(r?.subject_brands) ? r.subject_brands.map((s: any) => String(s)) : [],
  }))
}
