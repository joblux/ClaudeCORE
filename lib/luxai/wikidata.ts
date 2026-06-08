// ---------------------------------------------------------------------------
// WikiLux Engine — Shared Source-Discovery: Wikidata plumbing
// Per docs/WIKILUX_ENGINE_DESIGN_V2.md.
//
// Extracted VERBATIM from wikilux-corpus/route.ts (the B2a-hardened canon) so a
// single resilient copy is shared across consumers — killing the per-route
// duplication ("kill the 4th copy"). Behaviour-identical to the canon, with ONE
// deliberate deviation: WD_HEADERS uses a neutral shared User-Agent
// ('source-discovery') now that the plumbing is no longer route-specific.
// ---------------------------------------------------------------------------

const WD_API = 'https://www.wikidata.org/w/api.php'
const WD_HEADERS = { 'User-Agent': 'JOBLUX-WikiLux/1.0 (source-discovery)' }

const P = {
  INSTANCE_OF: 'P31',
  INDUSTRY: 'P452',
  WEBSITE: 'P856',
}

// instance-of labels that confirm the entity is a brand / organization
// rather than a homonym (a person, a place, a song, etc).
const ORG_LABEL_RE =
  /\b(compan|business|brand|enterprise|corporation|manufactur|conglomerate|retailer|maison|firm|group|holding|marque|producer)\b/i

type Claim = any

function firstClaim(claims: Record<string, Claim[]> | undefined, prop: string): Claim | null {
  const arr = claims?.[prop]
  if (!Array.isArray(arr) || arr.length === 0) return null
  const preferred = arr.find(c => c?.rank === 'preferred')
  const candidate = preferred || arr.find(c => c?.rank !== 'deprecated') || arr[0]
  return candidate?.mainsnak?.snaktype === 'value' ? candidate : null
}

function claimItemId(claim: Claim | null): string | null {
  return claim?.mainsnak?.datavalue?.value?.id ?? null
}

function claimString(claim: Claim | null): string | null {
  const v = claim?.mainsnak?.datavalue?.value
  return typeof v === 'string' ? v : null
}

// Wikidata resilience (B2a-hardening). wdFetch NO LONGER THROWS: it retries
// transient failures with bounded backoff, then returns a typed failure the
// caller records — so a Wikidata 429/5xx can never crash the request into a 500.
const WD_MAX_ATTEMPTS = 3 // total tries (initial + 2 retries)
const WD_BACKOFF_MS = [500, 1000, 2000] // wait BEFORE the next attempt
const WD_MAX_BACKOFF_MS = 2000 // cap any single wait (incl. Retry-After) well under 10s

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Backoff for the wait before attempt n+1. Honors Retry-After (seconds form),
// capped; otherwise the fixed 500/1000/2000ms schedule. Total wait across the
// 2 possible retries stays <= 4s — well under the 10s per-fetch ceiling.
function wdBackoffMs(attempt: number, retryAfter: string | null): number {
  if (retryAfter) {
    const secs = Number(retryAfter)
    if (Number.isFinite(secs) && secs > 0) {
      return Math.min(secs * 1000, WD_MAX_BACKOFF_MS)
    }
    // HTTP-date form is ignored — fall through to the fixed schedule.
  }
  return Math.min(WD_BACKOFF_MS[attempt - 1] ?? WD_MAX_BACKOFF_MS, WD_MAX_BACKOFF_MS)
}

interface WdResult {
  data: any | null
  ok: boolean
  status: number | null
  error: string | null
}

async function wdFetch(url: string): Promise<WdResult> {
  let lastStatus: number | null = null
  let lastError = 'Wikidata fetch failed'
  for (let attempt = 1; attempt <= WD_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { headers: WD_HEADERS, cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        return { data, ok: true, status: res.status, error: null }
      }
      lastStatus = res.status
      lastError = `Wikidata fetch failed (${res.status})`
      // Non-retryable 4xx (except 429): retrying won't help — surface immediately.
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        return { data: null, ok: false, status: res.status, error: lastError }
      }
      // Retryable (429 or 5xx): back off before the next attempt, if any remain.
      if (attempt < WD_MAX_ATTEMPTS) {
        await sleep(wdBackoffMs(attempt, res.headers.get('retry-after')))
      }
    } catch (e: any) {
      // Network/abort/JSON-parse error — treat as transient and retry.
      lastStatus = null
      lastError = e?.message || 'Wikidata fetch error'
      if (attempt < WD_MAX_ATTEMPTS) {
        await sleep(wdBackoffMs(attempt, null))
      }
    }
  }
  return {
    data: null,
    ok: false,
    status: lastStatus,
    error: `${lastError} after ${WD_MAX_ATTEMPTS} attempts`,
  }
}

async function getEntities(ids: string[]): Promise<Record<string, any>> {
  const unique = Array.from(new Set(ids.filter(Boolean)))
  if (unique.length === 0) return {}
  const url =
    `${WD_API}?action=wbgetentities&ids=${unique.join('|')}` +
    `&props=labels&languages=en&format=json&origin=*`
  const r = await wdFetch(url)
  return r.data?.entities ?? {}
}

function labelOf(entity: any): string | null {
  return entity?.labels?.en?.value ?? null
}

export {
  WD_API,
  WD_HEADERS,
  P,
  ORG_LABEL_RE,
  firstClaim,
  claimItemId,
  claimString,
  WD_MAX_ATTEMPTS,
  WD_BACKOFF_MS,
  WD_MAX_BACKOFF_MS,
  sleep,
  wdBackoffMs,
  wdFetch,
  getEntities,
  labelOf,
}
export type { Claim, WdResult }
