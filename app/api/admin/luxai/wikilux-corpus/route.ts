import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// WikiLux Engine — SLICE B2a: Corpus Builder (3 live families, NO model)
// Per docs/WIKILUX_ENGINE_DESIGN_V2.md.
//
// POST { brand } → derive + fetch the 3 LIVE source families (wikidata,
// wikipedia, official-if-P856), return the raw corpus PLUS a mandatory
// ACQUISITION REPORT (one row per attempted family, including non-resolution).
//
// This slice measures COLLECTION mechanics only:
//   - NO model call (no callClaude / anthropic / messages.create).
//   - NO generation, NO interpretation. NO declared families (B2b).
//   - NO DB write, NO persistence.
// The derivation + fetch plumbing is COPIED verbatim from wikilux-build (Path A,
// locked Mo+GPT): copy keeps wikilux-build untouched and this slice isolated —
// the same isolation discipline as every prior slice. The ONE deliberate delta
// is fetchMeasured() (fetchPage adapted to RETURN http_status instead of
// throwing, so the acquisition report can record status on non-2xx); its
// timeout + User-Agent behaviour is byte-identical to fetchPage.
//
// Shared Source-Discovery extraction (kill the now-4th copy) is the NAMED next
// slice before B2b — NOT done here to keep B2a low-risk and wikilux-build out of
// scope/re-QA.
// ---------------------------------------------------------------------------

// --- Wikidata plumbing (COPIED verbatim from wikilux-build/route.ts) --------

const WD_API = 'https://www.wikidata.org/w/api.php'
const WD_HEADERS = { 'User-Agent': 'JOBLUX-WikiLux/1.0 (wikilux-corpus builder)' }

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

async function wdFetch(url: string): Promise<any> {
  const res = await fetch(url, { headers: WD_HEADERS, cache: 'no-store' })
  if (!res.ok) throw new Error(`Wikidata fetch failed (${res.status})`)
  return res.json()
}

async function getEntities(ids: string[]): Promise<Record<string, any>> {
  const unique = Array.from(new Set(ids.filter(Boolean)))
  if (unique.length === 0) return {}
  const url =
    `${WD_API}?action=wbgetentities&ids=${unique.join('|')}` +
    `&props=labels&languages=en&format=json&origin=*`
  const data = await wdFetch(url)
  return data?.entities ?? {}
}

function labelOf(entity: any): string | null {
  return entity?.labels?.en?.value ?? null
}

// --- Corpus builder plumbing (COPIED from wikilux-build) ---------------------

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const CORPUS_CHAR_CAP = 12000

// Minimum stripped length for a source to count as a usable corpus entry.
const MIN_TEXT_CHARS = 50

/**
 * Strip HTML to readable plain text (verbatim from wikilux-build).
 */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * fetchPage adapted for B2a: RETURNS the http status instead of throwing, so the
 * acquisition report can record status on non-2xx. Timeout (10s) + User-Agent are
 * byte-identical to wikilux-build's fetchPage.
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

// --- Output shapes ----------------------------------------------------------

interface CorpusItem {
  family: string
  source_url: string
  source_ref: string
  text: string
}

interface AcquisitionRow {
  family: string
  source_url: string | null
  source_ref: string
  resolved_via: string | null // HOW the url was derived (or null if unresolved)
  url_resolved: boolean
  fetch_ok: boolean
  http_status: number | null
  text_size: number // chars after strip (full, pre-cap)
  duration_ms: number
  error: string | null
}

// A derivation attempt for one family (url may be null = failed to resolve).
interface Attempt {
  family: string
  source_url: string | null
  source_ref: string
  resolved_via: string | null
}

// --- Route -----------------------------------------------------------------

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
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    // 2. SOURCE DISCOVERY — resolve + anti-homonym verify on Wikidata (verbatim).
    const searchUrl =
      `${WD_API}?action=wbsearchentities&search=${encodeURIComponent(name)}` +
      `&language=en&format=json&limit=5&origin=*`
    const search = await wdFetch(searchUrl)
    const candidates: any[] = Array.isArray(search?.search) ? search.search : []

    let qid: string | null = null
    let claims: Record<string, Claim[]> = {}
    let sitelinks: Record<string, any> = {}

    for (const cand of candidates) {
      const cid: string = cand.id
      const entityData = await wdFetch(
        `https://www.wikidata.org/wiki/Special:EntityData/${cid}.json`
      )
      const ent = entityData?.entities?.[cid] ?? {}
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
        sitelinks = ent?.sitelinks ?? {}
        break
      }
    }

    // 3. DERIVE the 3 live family URLs (or null when they cannot be resolved).
    const officialSite = qid ? claimString(firstClaim(claims, P.WEBSITE)) : null
    const enwikiTitle: string | null = sitelinks?.enwiki?.title ?? null
    const wikipediaUrl = qid
      ? enwikiTitle
        ? `https://en.wikipedia.org/wiki/${encodeURIComponent(enwikiTitle.replace(/ /g, '_'))}`
        : `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`
      : null

    const attempts: Attempt[] = [
      {
        family: 'wikidata',
        source_url: qid ? `https://www.wikidata.org/wiki/${qid}` : null,
        source_ref: qid ? `Wikidata ${qid}` : 'Wikidata',
        resolved_via: qid ? 'wikidata-qid' : null,
      },
      {
        family: 'wikipedia',
        source_url: wikipediaUrl,
        source_ref: 'Wikipedia (en)',
        resolved_via: qid ? (enwikiTitle ? 'enwiki-sitelink' : 'name-fallback') : null,
      },
      {
        family: 'official',
        source_url: officialSite,
        source_ref: 'Official site',
        resolved_via: officialSite ? 'P856' : null,
      },
    ]

    // 4. FETCH + STRIP + CAP + MEASURE. Fail-isolated: a dead/unresolved source is
    //    recorded in the report, never fatal.
    const corpus: CorpusItem[] = []
    const acquisition_report: AcquisitionRow[] = []

    for (const a of attempts) {
      if (!a.source_url) {
        // Could not resolve a URL — record the attempt, no fetch.
        const reason =
          a.family === 'official'
            ? qid
              ? 'no P856 official-site claim'
              : 'brand not resolved on Wikidata'
            : 'brand not resolved on Wikidata'
        acquisition_report.push({
          family: a.family,
          source_url: null,
          source_ref: a.source_ref,
          resolved_via: null,
          url_resolved: false,
          fetch_ok: false,
          http_status: null,
          text_size: 0,
          duration_ms: 0,
          error: reason,
        })
        continue
      }

      const started = Date.now()
      const res = await fetchMeasured(a.source_url)
      const duration_ms = Date.now() - started

      const stripped = res.text ? htmlToText(res.text) : ''
      const text_size = stripped.length
      let error = res.error

      if (res.ok && text_size >= MIN_TEXT_CHARS) {
        corpus.push({
          family: a.family,
          source_url: a.source_url,
          source_ref: a.source_ref,
          text: stripped.slice(0, CORPUS_CHAR_CAP),
        })
      } else if (res.ok && text_size < MIN_TEXT_CHARS) {
        error = `stripped text < ${MIN_TEXT_CHARS} chars (not added to corpus)`
      }

      acquisition_report.push({
        family: a.family,
        source_url: a.source_url,
        source_ref: a.source_ref,
        resolved_via: a.resolved_via,
        url_resolved: true,
        fetch_ok: res.ok,
        http_status: res.status,
        text_size,
        duration_ms,
        error,
      })
    }

    // 5. RETURN — WRITE NOTHING. Raw corpus + mandatory acquisition report.
    return NextResponse.json({
      brand: name,
      slug,
      matched: qid !== null,
      qid,
      corpus,
      acquisition_report,
    })
  } catch (error: any) {
    console.error('WikiLux corpus error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
