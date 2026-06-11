// ---------------------------------------------------------------------------
// LuxAI Acquisition — Haiku Triage (V1 canon)
//
// Lifted VERBATIM from /tmp/triage-cartier.ts — Triage V1 ACCEPTED Jun 10 2026
// (single-call full-corpus shape LOCKED, Mo+GPT; ledger b5c3f03c). Same
// extraction pattern as lib/luxai/wikidata.ts: one canonical copy,
// behaviour-identical to the accepted run, deliberate deviations listed below.
//
// ROLE: discovery triage → queue admission ONLY. Output feeds
// writeTriageToQueue (content_queue DRAFT rows); no publish authority —
// Mo review remains the gate.
//
// Deviations from the /tmp source (nothing else):
//   1. CLI/runner harness dropped (corpus cache, /tmp artifacts, console
//      logging, run summary, exit codes) — the module exports a callable
//      triage fn + helpers only; the Anthropic SDK is imported repo-native
//      instead of via createRequire on /tmp paths.
//   2. API key sourcing: manual .env.local parse → process.env (caller owns
//      env loading); missing ANTHROPIC_API_KEY now throws instead of writing
//      a pretriage artifact and exiting 2.
//   3. Type wiring to repo canon: TriageResult imported from ./queue-writer
//      (single definition, never duplicated); input is Discovery from
//      ./discovery-runner (the /tmp structural mirror `Disc` dropped).
//   4. Brand parameterized in the system prompt — the accepted run hardcoded
//      "Cartier"/"CARTIER"; the radar serves 5 brands, so those tokens become
//      the `brand` argument. All other prompt wording is byte-identical,
//      including the Richemont / Van Cleef & Arpels group-and-sibling
//      examples from the accepted Cartier run.
//   5. content_nature field spec appended to the TriageResult list — wording
//      lifted VERBATIM from /tmp/adm3a-v3.ts Experiment A (ADM-3a v3 ACCEPTED
//      Jun 11 2026, ledger 1003c355). Observation-only: stored, never routed
//      on. Missing/invalid in a response is normalized to null. Nothing else
//      in the prompt changed. (subject_brands deliberately NOT added here —
//      the lab proved brand-scoped extraction is anchored; see
//      ./subject-extraction.ts.)
// ---------------------------------------------------------------------------

import Anthropic from '@anthropic-ai/sdk'
import type { Discovery } from './discovery-runner'
import type { TriageResult } from './queue-writer'

type DateSource = TriageResult['date_source']

// --- rung 1: publication date from URL patterns (code-side, pre-Haiku) -------
function dateFromUrl(url: string): string | null {
  let path = ''
  try { const u = new URL(url); path = u.pathname } catch { return null }

  const valid = (y: number, mo: number, d?: number) =>
    y >= 2015 && y <= 2026 && mo >= 1 && mo <= 12 && (d === undefined || (d >= 1 && d <= 31))

  // /2026/06/09/ style
  let m = path.match(/\/(20\d{2})\/(\d{1,2})\/(\d{1,2})(?:\/|$)/)
  if (m) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
    if (valid(y, mo, d)) return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  // -2026-06-09 / _2026-06-09 / 2026-06-09 in slug
  m = path.match(/(20\d{2})-(\d{2})-(\d{2})/)
  if (m) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
    if (valid(y, mo, d)) return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  // /2026/06/ month-level — month precision only, never invent a day
  m = path.match(/\/(20\d{2})\/(\d{1,2})(?:\/|$)/)
  if (m) {
    const [y, mo] = [Number(m[1]), Number(m[2])]
    if (valid(y, mo)) return `${y}-${String(mo).padStart(2, '0')}`
  }
  return null
}

// --- rung 2: Discovery.date if non-null --------------------------------------
function dateFromSource(date: string | null): string | null {
  if (date === null) return null
  const t = Date.parse(date)
  if (Number.isNaN(t)) return null
  return new Date(t).toISOString().slice(0, 10)
}

// --- Haiku prompt (judgment rules per locked cadrage, Mo+GPT Jun 10) ---------
// Deviation 4: brand parameterized; wording otherwise byte-identical to the
// accepted Cartier run.
function buildSystemPrompt(brand: string): string {
  const BRAND = brand.toUpperCase()
  return `You are the LuxAI triage layer for JOBLUX, a luxury-industry intelligence platform. You receive discovery hits from a scoped, read-only retrieval run for the brand "${brand}". For EACH input item you return exactly one TriageResult JSON object.

TriageResult fields:
- url: copy the item's url verbatim.
- luxury_relevance (0-1): relevance to the luxury industry.
- brand_relevance (0-1): how specifically the item is about ${BRAND} the brand. Stories about Richemont group-wide, sibling brands (Van Cleef & Arpels, etc.), or the luxury industry at large score LOW (<= 0.4) even if ${brand} is mentioned. ${brand}-specific stories score high.
- signal_type: growth (positive results/sales/revenue) | leadership (executive appointments/departures) | contraction (closures/layoffs/decline) | expansion (openings/new markets/launches/events) | ma (mergers, acquisitions, stakes) | other.
- importance: low | medium | high — business significance for luxury-industry intelligence.
- published_date (ISO string or null) and date_source ("url" | "source" | "snippet" | null):
  * If the item arrives with a prefilled published_date/date_source, COPY BOTH VERBATIM.
  * If prefilled values are null, extract a publication date ONLY if it is explicitly present in the snippet -> ISO format, date_source = "snippet".
  * If no explicit date exists, published_date = null and date_source = null. NEVER guess or infer a date.
- duplicate_group: you see the ENTIRE corpus in this one prompt. Items covering the SAME underlying story share ONE short kebab-case key (e.g. "ferla-ceo-appointment") — the same story reported by different outlets or under different titles is still ONE group. Items not duplicating anything -> null.
- recommended (boolean): true ONLY if brand_relevance >= 0.7 AND importance is medium or high. Within each duplicate_group EXACTLY ONE item — the best (most primary source, most complete) — may be recommended; all other members of that group are recommended=false. Additionally, signal_type "other" -> recommended=false unless importance is high.
- reasoning: 1-2 short sentences.
- content_nature ("signal" | "event"): "event" ONLY when the primary news value is a dated public happening that people attend, visit, watch, or experience (exhibition, show, race, gala). Business moves — acquisitions, store openings, leadership changes, results, investments, market recoveries — stay "signal" even when announced at such a happening. Store/boutique openings are signal.

Hard rules:
- access "premium_or_blocked" or "snippet_first" (walled) is CONTEXT, not a reason to reject or lower relevance — judge on what the title/snippet shows.
- Unknown or unclear -> null / low scores. Never invent facts.
- Hub/index pages (Investors, Careers, search listings, tag pages) are not signals: low importance, signal_type "other".
- Output ONLY JSON, shaped {"results":[TriageResult, ...]}, one result per input item, in input order. No prose, no markdown.`
}

function buildUserPrompt(items: Array<Record<string, unknown>>): string {
  return `ITEMS — the FULL corpus (${items.length} items). Return one TriageResult per item, in this order. Assign duplicate_group keys across the whole corpus:
${JSON.stringify(items, null, 1)}`
}

function parseHaikuJson(text: string): { results: TriageResult[] } {
  // Haiku wraps JSON in markdown fences — parse from first { to last } (doctrine).
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) throw new Error('no JSON object in response')
  return JSON.parse(text.slice(start, end + 1))
}

// Option A (Mo+GPT approved): ONE call, full corpus visible — cross-batch dups
// can't escape. Model = Haiku 4.5 canon (matches the repo-pinned id in
// lib/anthropic/client.ts). Never Sonnet/Opus.
const MODEL = 'claude-haiku-4-5-20251001'

export async function triageDiscoveries(
  brand: string,
  discoveries: Discovery[]
): Promise<TriageResult[]> {
  // Rungs 1-2 (code-side): url -> source -> (snippet via Haiku later) -> null.
  const preDated = discoveries.map((d) => {
    let published_date: string | null = dateFromUrl(d.url)
    let date_source: DateSource = published_date ? 'url' : null
    if (!published_date) {
      published_date = dateFromSource(d.date)
      date_source = published_date ? 'source' : null
    }
    return { d, published_date, date_source }
  })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('triage: ANTHROPIC_API_KEY is not set')
  const anthropic = new Anthropic({ apiKey })

  // Single-call triage over the entire corpus.
  const items = preDated.map(({ d, published_date, date_source }, i) => ({
    index: i,
    title: d.title,
    url: d.url,
    source: d.source,
    access: d.access ?? null,
    category: d.category,
    snippet: (d.snippet ?? '').slice(0, 600) || null,
    published_date,
    date_source,
  }))
  const user = buildUserPrompt(items)
  const system = buildSystemPrompt(brand)

  let results: TriageResult[] | null = null
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const msg = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 16000,
        system,
        messages: [{ role: 'user', content: user }],
      })
      if (msg.stop_reason === 'max_tokens') throw new Error('output truncated at max_tokens')
      const text = msg.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
      const p = parseHaikuJson(text)
      if (!Array.isArray(p.results) || p.results.length !== preDated.length) {
        throw new Error(`expected ${preDated.length} results, got ${Array.isArray(p.results) ? p.results.length : 'none'}`)
      }
      results = p.results
      break
    } catch (e) {
      if (attempt === 2) throw e
    }
  }

  for (let i = 0; i < preDated.length; i++) {
    const r = results![i]
    r.url = preDated[i].d.url // url is positional truth — never trust echo drift
    // content_nature is observation-only — defensive normalize, never throw
    if (r.content_nature !== 'signal' && r.content_nature !== 'event') r.content_nature = null
    // rungs 1-2 are code-side truth; Haiku only fills the snippet rung
    if (preDated[i].published_date) {
      r.published_date = preDated[i].published_date
      r.date_source = preDated[i].date_source
    } else if (r.published_date) {
      r.date_source = 'snippet'
    } else {
      r.published_date = null
      r.date_source = null
    }
  }

  return results!
}
