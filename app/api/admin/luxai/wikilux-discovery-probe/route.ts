import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// WikiLux Engine — B2b SLICE 0: Discovery Probe (MEASUREMENT ONLY, NO engine)
// Per docs/WIKILUX_ENGINE_DESIGN_V2.md + STATE B2b discipline.
//
// POST { brands? } → for each brand, measure TWO families and return an
// acquisition_report (one row per brand × family) + aggregate metrics:
//   - OFFICIAL: real resolution via Wikidata P856 + measured fetch.
//   - REUTERS:  declared family with NO resolver yet → reported as
//     unresolved-by-design (resolver_exists:false). DO NOT guess/search a URL.
//
// This slice proves resolution + acquisition mechanics BEFORE any family is
// wired into the engine. It is deliberately isolated:
//   - NO corpus builder, NO model call, NO DB write, NO persistence.
//   - Does NOT touch wikilux-build / wikilux-corpus / key-facts.
//   - Wikidata primitives consumed from the shared module (@/lib/luxai/wikidata);
//     the resolve + anti-homonym ORCHESTRATION is copied here (Path A isolation),
//     adapted to read wdFetch's WdResult (.data) — wikilux-build stays untouched.
//   - fetchMeasured / USER_AGENT / htmlToText mirror wikilux-corpus byte-faithful.
// ---------------------------------------------------------------------------

import {
  WD_API,
  P,
  ORG_LABEL_RE,
  firstClaim,
  claimItemId,
  claimString,
  wdFetch,
  getEntities,
  labelOf,
} from '@/lib/luxai/wikidata'
import type { Claim } from '@/lib/luxai/wikidata'

// --- Fetch + strip plumbing (mirrors wikilux-corpus, byte-faithful) ---------

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Below this stripped length a 200 OK is treated as a likely JS-rendered shell.
const JS_FAILURE_MIN_CHARS = 500

// Default measurement set when the caller passes no brands.
const DEFAULT_BRANDS = ['Baccarat', 'Chanel', 'Rolex']

// Sane cap so the probe cannot be turned into a Wikidata/fetch hammer.
const MAX_BRANDS = 10

// Coarse paywall markers (heuristic — flag, do not over-engineer).
const PAYWALL_MARKERS = ['paywall', 'subscribe']

/**
 * fetchMeasured — RETURNS the http status instead of throwing (so the report can
 * record status on non-2xx). Timeout (10s) + User-Agent mirror wikilux-corpus.
 */
async function fetchMeasured(
  url: string
): Promise<{ ok: boolean; status: number | null; text: string | null; error: string | null }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    })
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        text: null,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }
    const text = await response.text()
    return { ok: true, status: response.status, text, error: null }
  } catch (e: any) {
    const error = e?.name === 'AbortError' ? 'timeout (10s)' : e?.message || 'fetch failed'
    return { ok: false, status: null, text: null, error }
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Strip HTML to readable plain text (verbatim from wikilux-corpus).
 */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// --- Output shapes ----------------------------------------------------------

// Base = wikilux-corpus AcquisitionRow, EXTENDED for this diagnostic with:
//   brand, resolver_exists, fetch_attempted, reason, paywall, js_failure.
interface ProbeRow {
  brand: string
  family: string
  source_url: string | null
  source_ref: string
  resolved_via: string | null
  resolver_exists: boolean
  url_resolved: boolean
  fetch_attempted: boolean
  fetch_ok: boolean
  http_status: number | null
  text_size: number // chars after strip (full, pre-cap)
  duration_ms: number
  paywall: boolean
  js_failure: boolean
  reason: string | null
  error: string | null
}

interface FamilyMetrics {
  resolution_rate: number
  fetch_rate: number
  paywall_rate: number
  js_failure_rate: number
}

// --- Wikidata resolution (copied orchestration; adapted to WdResult) ---------

// Resolve a brand name to a confirmed brand/organization Wikidata entity using
// the same search -> EntityData -> anti-homonym verify pattern as wikilux-build,
// reading wdFetch's WdResult (.data) and surfacing the discovery error so a
// transient 429 can be told apart from a genuine not-found.
async function resolveBrand(name: string): Promise<{
  qid: string | null
  claims: Record<string, Claim[]>
  discoveryError: string | null
}> {
  const searchUrl =
    `${WD_API}?action=wbsearchentities&search=${encodeURIComponent(name)}` +
    `&language=en&format=json&limit=5&origin=*`
  let discoveryError: string | null = null

  const searchRes = await wdFetch(searchUrl)
  if (!searchRes.ok) discoveryError = `Wikidata search: ${searchRes.error}`
  const candidates: any[] = Array.isArray(searchRes.data?.search) ? searchRes.data.search : []

  let qid: string | null = null
  let claims: Record<string, Claim[]> = {}

  for (const cand of candidates) {
    const cid: string = cand.id
    const entityRes = await wdFetch(
      `https://www.wikidata.org/wiki/Special:EntityData/${cid}.json`
    )
    if (!entityRes.ok && !discoveryError) {
      discoveryError = `Wikidata entity ${cid}: ${entityRes.error}`
    }
    const ent = entityRes.data?.entities?.[cid] ?? {}
    const candClaims: Record<string, Claim[]> = ent?.claims ?? {}
    const instanceIds = (candClaims[P.INSTANCE_OF] ?? [])
      .map((c: Claim) => claimItemId(c))
      .filter(Boolean) as string[]
    const instanceEntities = await getEntities(instanceIds)
    const candInstanceLabels = instanceIds
      .map(id => labelOf(instanceEntities[id]))
      .filter(Boolean) as string[]
    const looksLikeOrg =
      candInstanceLabels.some(l => ORG_LABEL_RE.test(l)) || !!candClaims[P.INDUSTRY]
    if (looksLikeOrg) {
      qid = cid
      claims = candClaims
      break
    }
  }

  return { qid, claims, discoveryError }
}

// --- Per-family measurement -------------------------------------------------

// OFFICIAL: real resolution (Wikidata P856) + measured fetch.
async function measureOfficial(
  brand: string,
  resolved: { qid: string | null; claims: Record<string, Claim[]>; discoveryError: string | null }
): Promise<ProbeRow> {
  const officialSite = resolved.qid
    ? claimString(firstClaim(resolved.claims, P.WEBSITE))
    : null

  const base: ProbeRow = {
    brand,
    family: 'official',
    source_url: officialSite,
    source_ref: 'Official site',
    resolved_via: officialSite ? 'P856' : null,
    resolver_exists: true,
    url_resolved: false,
    fetch_attempted: false,
    fetch_ok: false,
    http_status: null,
    text_size: 0,
    duration_ms: 0,
    paywall: false,
    js_failure: false,
    reason: null,
    error: null,
  }

  if (!officialSite) {
    // Could not resolve a URL. Distinguish "resolved brand, no P856" from
    // "brand not resolved" — and surface a transient Wikidata failure honestly.
    base.url_resolved = false
    base.reason = resolved.qid
      ? 'no P856 official-site claim'
      : resolved.discoveryError ?? 'brand not resolved on Wikidata'
    return base
  }

  base.url_resolved = true
  base.fetch_attempted = true

  const started = Date.now()
  const res = await fetchMeasured(officialSite)
  base.duration_ms = Date.now() - started
  base.fetch_ok = res.ok
  base.http_status = res.status
  base.error = res.error

  const stripped = res.text ? htmlToText(res.text) : ''
  base.text_size = stripped.length

  // Paywall heuristic: 401/403, OR a 200 whose body carries paywall markers.
  const bodyLower = res.text ? res.text.toLowerCase() : ''
  base.paywall =
    res.status === 401 ||
    res.status === 403 ||
    (res.ok && PAYWALL_MARKERS.some(m => bodyLower.includes(m)))

  // JS-failure heuristic: 200 OK but almost no text after strip.
  base.js_failure = res.ok && res.status === 200 && base.text_size < JS_FAILURE_MIN_CHARS

  return base
}

// REUTERS: declared family with NO resolver yet — unresolved-by-design.
// DO NOT guess a URL, DO NOT build a search URL, DO NOT fetch.
function measureReuters(brand: string): ProbeRow {
  return {
    brand,
    family: 'reuters',
    source_url: null,
    source_ref: 'Reuters',
    resolved_via: null,
    resolver_exists: false,
    url_resolved: false,
    fetch_attempted: false,
    fetch_ok: false,
    http_status: null,
    text_size: 0,
    duration_ms: 0,
    paywall: false,
    js_failure: false,
    reason: 'no_reuters_resolver_yet',
    error: null,
  }
}

// --- Aggregate metrics (per family, denominator = number of brands) ---------

function metricsFor(rows: ProbeRow[], family: string, brandCount: number): FamilyMetrics {
  if (brandCount === 0) {
    return { resolution_rate: 0, fetch_rate: 0, paywall_rate: 0, js_failure_rate: 0 }
  }
  const fam = rows.filter(r => r.family === family)
  const rate = (n: number) => Math.round((n / brandCount) * 1000) / 1000
  return {
    resolution_rate: rate(fam.filter(r => r.url_resolved).length),
    fetch_rate: rate(fam.filter(r => r.fetch_ok).length),
    paywall_rate: rate(fam.filter(r => r.paywall).length),
    js_failure_rate: rate(fam.filter(r => r.js_failure).length),
  }
}

// --- Route -----------------------------------------------------------------

export async function POST(request: Request) {
  try {
    // 1. AUTH — same gate as wikilux-corpus.
    const session = await getServerSession(authOptions)
    const role = (session?.user as { role?: string } | undefined)?.role
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. INPUT — optional brands[], else the default measurement set.
    const body = await request.json().catch(() => ({}))
    let brands: string[] = DEFAULT_BRANDS
    if (body && body.brands !== undefined) {
      if (
        !Array.isArray(body.brands) ||
        !body.brands.every((b: unknown) => typeof b === 'string')
      ) {
        return NextResponse.json(
          { success: false, message: 'brands must be an array of strings' },
          { status: 400 }
        )
      }
      const cleaned = (body.brands as string[]).map(b => b.trim()).filter(b => b.length >= 2)
      if (cleaned.length === 0) {
        return NextResponse.json(
          { success: false, message: 'brands array has no valid entry (min 2 chars each)' },
          { status: 400 }
        )
      }
      if (cleaned.length > MAX_BRANDS) {
        return NextResponse.json(
          { success: false, message: `too many brands (max ${MAX_BRANDS})` },
          { status: 400 }
        )
      }
      brands = cleaned
    }

    // 3. MEASURE — sequentially (gentle on Wikidata). Per-brand fail-isolated:
    //    a resolution failure is RECORDED as an unresolved row, never fatal.
    const rows: ProbeRow[] = []
    for (const brand of brands) {
      const resolved = await resolveBrand(brand)
      rows.push(await measureOfficial(brand, resolved))
      rows.push(measureReuters(brand))
    }

    // 4. RETURN — WRITE NOTHING. acquisition_report + aggregate metrics only.
    return NextResponse.json({
      brands,
      families: ['official', 'reuters'],
      rows,
      metrics: {
        official: metricsFor(rows, 'official', brands.length),
        reuters: metricsFor(rows, 'reuters', brands.length),
      },
    })
  } catch (error: any) {
    console.error('WikiLux discovery-probe error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
