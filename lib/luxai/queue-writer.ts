// ---------------------------------------------------------------------------
// LuxAI Acquisition — Queue Writer (THIN slice, first DB writes of the lane)
//
// Consumes Discovery objects + their TriageResults and writes content_queue
// DRAFT rows only. Per locked cadrage (Mo+GPT):
//   - Only recommended=true AND signal_type !== 'other' enter the queue.
//   - processed_content stays NULL — synthesis is a later slice. The approve
//     route's completeness gate therefore blocks publish until synthesis runs.
//   - NO publish, NO approve, NO signals write, NO scheduler.
//   - Idempotent by source_url across ALL statuses (rejected included — a
//     rejected story is never resurrected by a re-run).
//   - category literals are read from the LIVE signals table — never invented.
// ---------------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js'
import type { Discovery } from './discovery-runner'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type TriageSignalType =
  | 'growth'
  | 'leadership'
  | 'contraction'
  | 'expansion'
  | 'ma'
  | 'other'

export type TriageResult = {
  url: string
  luxury_relevance: number
  brand_relevance: number
  signal_type: TriageSignalType
  importance: 'low' | 'medium' | 'high'
  published_date: string | null
  date_source: 'url' | 'source' | 'snippet' | null
  duplicate_group: string | null
  recommended: boolean
  reasoning: string
  // Observation-only (ADM-3b, ledger 1003c355): stored, never routed on.
  content_nature?: 'signal' | 'event' | null
}

export type QueueWriteReport = {
  inserted: number
  skipped_existing: number
  skipped_stale: number
  skipped_undated: number
  skipped_low_relevance: number
  not_recommended: number
  untagged: number
  category_mapping: Record<string, string>
}

// Queue ADMISSION rule (locked cadrage): only stories published within the
// rolling window enter the queue. This is mechanical and code-side — it gates
// what is ADMITTED, it does not rewrite the Signals freshness doctrine.
const FRESHNESS_WINDOW_DAYS = 30

// Queue ADMISSION rule: recommended results must also carry a numeric
// brand_relevance at or above this threshold — below (or missing/non-numeric)
// is counted as skipped_low_relevance, never as not_recommended.
const MIN_BRAND_RELEVANCE = 0.7

// Maison tag rule (ADM-3b, lab-validated /tmp/adm3a-v3.ts Experiment B,
// ledger 1003c355): brand_tags is the case-insensitive intersection of the
// brand-NEUTRAL subject extraction with the pilot perimeter. Named V1
// limitation: pilot perimeter only — a legitimate subject maison off this
// list (Burberry, Lanvin, Prada, ...) yields untagged, never a wrong tag.
const KNOWN_MAISONS = ['Cartier', 'Rolex', 'Louis Vuitton', 'Gucci', 'Hermès']
// Groups are never maison tags — DB brand pages are maisons.
const GROUP_BLOCKLIST = ['LVMH', 'Richemont', 'Kering', 'Prada Group']

const MAISON_BY_LOWER = new Map(KNOWN_MAISONS.map((m) => [m.toLowerCase(), m]))
const GROUP_LOWER = new Set(GROUP_BLOCKLIST.map((g) => g.toLowerCase()))

function computeMaisonTags(subjectBrands: string[]): string[] {
  const out: string[] = []
  for (const s of subjectBrands) {
    const lower = String(s).toLowerCase().trim()
    if (GROUP_LOWER.has(lower)) continue
    const hit = MAISON_BY_LOWER.get(lower)
    if (hit && !out.includes(hit)) out.push(hit)
  }
  return out
}

const SIGNAL_TYPES: Exclude<TriageSignalType, 'other'>[] = [
  'growth',
  'leadership',
  'contraction',
  'expansion',
  'ma',
]

// Aliases accepted when matching the 'ma' signal_type onto a live literal.
const MA_ALIASES = ['ma', 'm&a', 'm_a', 'merger_acquisition', 'mergers_acquisitions']

// Map our 5 signal_type values onto the category literals that actually exist
// in the live signals table. Throws BEFORE any insert if one cannot be mapped —
// inventing a category literal is forbidden (DB is the single source of truth).
async function buildCategoryMapping(): Promise<Record<string, string>> {
  const { data, error } = await supabaseAdmin.from('signals').select('category')
  if (error) throw new Error(`queue-writer: cannot read signals categories: ${error.message}`)

  const live = [...new Set((data || []).map((r) => r.category).filter(Boolean))] as string[]
  const byLower = new Map(live.map((c) => [c.toLowerCase(), c]))

  const mapping: Record<string, string> = {}
  for (const t of SIGNAL_TYPES) {
    let hit = byLower.get(t)
    if (!hit && t === 'ma') {
      for (const alias of MA_ALIASES) {
        if (byLower.has(alias)) { hit = byLower.get(alias); break }
      }
      if (!hit) hit = live.find((c) => /merger|acquisition/i.test(c))
    }
    if (!hit) {
      throw new Error(
        `queue-writer: no safe category mapping for signal_type "${t}" — live signals categories: [${live.join(', ')}]. STOP, no insert.`
      )
    }
    mapping[t] = hit
  }
  return mapping
}

// Singleton duplicate_groups carry no dedup information — normalize to null so
// stored raw_content never seeds false soft-dup matches on later runs.
function normalizeSingletonGroups(triage: TriageResult[]): TriageResult[] {
  const counts = new Map<string, number>()
  for (const t of triage) {
    if (t.duplicate_group) counts.set(t.duplicate_group, (counts.get(t.duplicate_group) ?? 0) + 1)
  }
  return triage.map((t) =>
    t.duplicate_group && counts.get(t.duplicate_group) === 1
      ? { ...t, duplicate_group: null }
      : t
  )
}

export async function writeTriageToQueue(
  discoveries: Discovery[],
  triageResults: TriageResult[],
  // url -> subject_brands from the brand-neutral extraction pass. A url
  // ABSENT from the map means extraction failed for that batch — the row is
  // still admitted (non-blocking), visibly tag_state='extraction_failed'.
  subjectsByUrl: Map<string, string[]>
): Promise<QueueWriteReport> {
  const discoveryByUrl = new Map(discoveries.map((d) => [d.url, d]))
  const triage = normalizeSingletonGroups(triageResults)

  const modelRecommended = triage.filter((t) => t.recommended && t.signal_type !== 'other')
  let skippedLowRelevance = 0
  const recommendedSet = modelRecommended.filter((t) => {
    if (typeof t.brand_relevance === 'number' && t.brand_relevance >= MIN_BRAND_RELEVANCE) return true
    skippedLowRelevance++
    return false
  })

  // Freshness admission (STRICT): null/unparseable published_date never enters.
  const now = Date.now()
  const windowMs = FRESHNESS_WINDOW_DAYS * 24 * 60 * 60 * 1000
  const eligible: TriageResult[] = []
  let skippedStale = 0
  let skippedUndated = 0
  for (const t of recommendedSet) {
    const ts = t.published_date ? Date.parse(t.published_date) : NaN
    if (Number.isNaN(ts)) skippedUndated++
    else if (now - ts > windowMs) skippedStale++
    else eligible.push(t)
  }

  const report: QueueWriteReport = {
    inserted: 0,
    skipped_existing: 0,
    skipped_stale: skippedStale,
    skipped_undated: skippedUndated,
    skipped_low_relevance: skippedLowRelevance,
    not_recommended: triage.length - modelRecommended.length,
    untagged: 0,
    category_mapping: await buildCategoryMapping(), // throws before any insert if unmappable
  }

  if (report.skipped_low_relevance > 0) {
    console.log(`queue-writer: skipped_low_relevance=${report.skipped_low_relevance} (brand_relevance < ${MIN_BRAND_RELEVANCE})`)
  }

  for (const t of eligible) {
    const d = discoveryByUrl.get(t.url)
    if (!d) throw new Error(`queue-writer: triage result url has no matching discovery: ${t.url}`)

    // Idempotence: source_url across ALL statuses — rejected is never resurrected.
    const { data: existing, error: selErr } = await supabaseAdmin
      .from('content_queue')
      .select('id, status')
      .eq('content_type', 'signal')
      .eq('source_url', d.url)
      .limit(1)
      .maybeSingle()
    if (selErr) throw new Error(`queue-writer: idempotence check failed for ${d.url}: ${selErr.message}`)
    if (existing) {
      report.skipped_existing++
      continue
    }

    // Soft dup flag: same non-null duplicate_group already in the queue → flag, never block.
    let duplicate_state: string | null = null
    let duplicate_match: { queue_id: string; group: string } | null = null
    if (t.duplicate_group) {
      const { data: dupRow } = await supabaseAdmin
        .from('content_queue')
        .select('id')
        .eq('content_type', 'signal')
        .eq('raw_content->triage_result->>duplicate_group', t.duplicate_group)
        .limit(1)
        .maybeSingle()
      if (dupRow) {
        duplicate_state = 'possible_duplicate'
        duplicate_match = { queue_id: dupRow.id, group: t.duplicate_group }
      }
    }

    // Maison tag rule — mechanical, from the brand-neutral extraction. The
    // swept brand is NEVER a fallback tag: empty intersection -> brand_tags=[].
    const subject_brands = subjectsByUrl.get(t.url)
    const computed_tags = subject_brands ? computeMaisonTags(subject_brands) : []
    const tag_state: 'tagged' | 'untagged' | 'extraction_failed' =
      subject_brands === undefined ? 'extraction_failed' : computed_tags.length > 0 ? 'tagged' : 'untagged'
    if (tag_state !== 'tagged') report.untagged++

    const { error: insErr } = await supabaseAdmin.from('content_queue').insert({
      content_type: 'signal',
      source_type: 'external_feed',
      title: d.title,
      source_name: d.source,
      source_url: d.url,
      brand_tags: computed_tags,
      category: report.category_mapping[t.signal_type],
      raw_content: {
        discovery: d,
        triage_result: t,
        tagging: { subject_brands: subject_brands ?? [], computed_tags, tag_state },
      },
      processed_content: null, // THIN — synthesis is a later slice
      status: 'draft',
      ...(duplicate_state ? { duplicate_state, duplicate_match } : {}),
    })
    if (insErr) throw new Error(`queue-writer: insert failed for ${d.url}: ${insErr.message}`)
    report.inserted++
  }

  if (report.untagged > 0) {
    console.log(`queue-writer: untagged=${report.untagged} (no maison tag — admitted with brand_tags=[])`)
  }

  return report
}
