import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ---------------------------------------------------------------------------
// IQ Capability #1 — Key Facts Generator (Phase 1, Wikidata-only)
//
// Proves the plumbing: resolve entity -> extract structured facts ->
// attach source_url -> draft -> review. NO publish. NO LLM.
//
// Wikidata is the Phase-1 ACQUISITION SOURCE, not the final Key Facts
// doctrine. Official-source cross-check arrives in Phase 2.
//
// RED LINE: any value absent from Wikidata is left NULL. Never guess,
// never fabricate. source_url (Wikidata entity URL + QID) is required
// provenance for every fact written.
// ---------------------------------------------------------------------------

const WD_API = 'https://www.wikidata.org/w/api.php'
const WD_HEADERS = { 'User-Agent': 'JOBLUX-WikiLux/1.0 (key-facts pipeline)' }

// Properties used for extraction (extraction only — no interpretation).
const P = {
  INCEPTION: 'P571',   // Founded
  HQ: 'P159',          // Headquarters location (a place)
  COUNTRY: 'P17',      // Country
  PLACE_COUNTRY: 'P17',// Country of a place (resolved on HQ entity)
  PARENT: 'P749',      // Parent organization
  INDUSTRY: 'P452',    // Industry (Sector)
  WEBSITE: 'P856',     // Official website
  INSTANCE_OF: 'P31',  // instance of (used for entity verification)
}

// instance-of labels that confirm the entity is a brand / organization
// rather than a homonym (a person, a place, a song, etc).
const ORG_LABEL_RE =
  /\b(compan|business|brand|enterprise|corporation|manufactur|conglomerate|retailer|maison|firm|group|holding|marque|producer)\b/i

type Claim = any

function firstClaim(claims: Record<string, Claim[]> | undefined, prop: string): Claim | null {
  const arr = claims?.[prop]
  if (!Array.isArray(arr) || arr.length === 0) return null
  // Prefer a "preferred" rank claim, else the first non-deprecated one.
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

function claimYear(claim: Claim | null): number | null {
  const time = claim?.mainsnak?.datavalue?.value?.time
  if (typeof time !== 'string') return null
  const m = time.match(/^[+-]?(\d{1,4})-/)
  if (!m) return null
  const year = parseInt(m[1], 10)
  return Number.isFinite(year) && year > 0 ? year : null
}

async function wdFetch(url: string): Promise<any> {
  const res = await fetch(url, { headers: WD_HEADERS, cache: 'no-store' })
  if (!res.ok) throw new Error(`Wikidata fetch failed (${res.status})`)
  return res.json()
}

// Resolve English labels (and claims, for chained lookups) for a set of QIDs.
async function getEntities(ids: string[]): Promise<Record<string, any>> {
  const unique = Array.from(new Set(ids.filter(Boolean)))
  if (unique.length === 0) return {}
  const url =
    `${WD_API}?action=wbgetentities&ids=${unique.join('|')}` +
    `&props=labels|claims&languages=en&format=json&origin=*`
  const data = await wdFetch(url)
  return data?.entities ?? {}
}

function labelOf(entity: any): string | null {
  return entity?.labels?.en?.value ?? null
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as { role?: string } | undefined)?.role
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { brand_name } = await request.json()
    if (!brand_name || brand_name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Brand name required (min 2 characters)' },
        { status: 400 }
      )
    }

    const name = brand_name.trim()

    // 1. Resolve the entity via wbsearchentities.
    const searchUrl =
      `${WD_API}?action=wbsearchentities&search=${encodeURIComponent(name)}` +
      `&language=en&format=json&limit=5&origin=*`
    const search = await wdFetch(searchUrl)
    const candidates: any[] = Array.isArray(search?.search) ? search.search : []
    if (candidates.length === 0) {
      return NextResponse.json({
        success: false,
        matched: false,
        message: `No Wikidata entity found for "${name}". Nothing written.`,
      })
    }

    // 2. Walk the candidates in relevance order and pick the FIRST that
    //    VERIFIES as a brand/organization (instance-of org-like, or has an
    //    industry claim). Search rank #1 is often a homonym (e.g. "Cartier"
    //    resolves first to a family name), so trusting candidates[0] blindly
    //    would mis-resolve. If none verify -> write NOTHING, no fabrication.
    let qid: string | null = null
    let claims: Record<string, Claim[]> = {}
    let instanceLabels: string[] = []
    const inspected: string[] = []

    for (const cand of candidates) {
      const cid: string = cand.id
      const entityData = await wdFetch(
        `https://www.wikidata.org/wiki/Special:EntityData/${cid}.json`
      )
      const candClaims: Record<string, Claim[]> = entityData?.entities?.[cid]?.claims ?? {}
      const instanceIds = (candClaims[P.INSTANCE_OF] ?? [])
        .map((c: Claim) => claimItemId(c))
        .filter(Boolean) as string[]
      const instanceEntities = await getEntities(instanceIds)
      const candInstanceLabels = instanceIds
        .map(id => labelOf(instanceEntities[id]))
        .filter(Boolean) as string[]
      inspected.push(`${cid}[${candInstanceLabels[0] || '—'}]`)
      const looksLikeOrg =
        candInstanceLabels.some(l => ORG_LABEL_RE.test(l)) || !!candClaims[P.INDUSTRY]
      if (looksLikeOrg) {
        qid = cid
        claims = candClaims
        instanceLabels = candInstanceLabels
        break
      }
    }

    if (!qid) {
      return NextResponse.json({
        success: false,
        matched: false,
        message:
          `No Wikidata candidate for "${name}" confidently resolves to a ` +
          `brand/organization. Nothing written.`,
        data: { inspected },
      })
    }

    // 3. Extract the 6 Key Facts fields. Unfound -> null. Never guess.
    const foundedYear = claimYear(firstClaim(claims, P.INCEPTION))
    const websiteUrl = claimString(firstClaim(claims, P.WEBSITE))
    const hqId = claimItemId(firstClaim(claims, P.HQ))
    const countryId = claimItemId(firstClaim(claims, P.COUNTRY))
    const parentId = claimItemId(firstClaim(claims, P.PARENT))
    const industryId = claimItemId(firstClaim(claims, P.INDUSTRY))

    // Resolve referenced QIDs (HQ place, country, parent, industry) to labels.
    const refEntities = await getEntities([hqId, countryId, parentId, industryId].filter(Boolean) as string[])

    let hqCity = hqId ? labelOf(refEntities[hqId]) : null
    // HQ "city + country": the HQ place's own country (P17) gives the country.
    let hqCountry: string | null = null
    if (hqId && refEntities[hqId]) {
      const hqCountryId = claimItemId(firstClaim(refEntities[hqId].claims, P.PLACE_COUNTRY))
      if (hqCountryId) {
        const hqCountryEntities = await getEntities([hqCountryId])
        hqCountry = labelOf(hqCountryEntities[hqCountryId])
      }
    }
    const hq =
      hqCity && hqCountry ? `${hqCity}, ${hqCountry}` : hqCity || null

    const country = countryId ? labelOf(refEntities[countryId]) : null
    const parentGroup = parentId ? labelOf(refEntities[parentId]) : null
    const sector = industryId ? labelOf(refEntities[industryId]) : null

    const key_facts = {
      founded: foundedYear,        // P571
      hq,                          // P159 (+ place P17 for country)
      country,                     // P17
      parent_group: parentGroup,   // P749
      sector,                      // P452
      website: websiteUrl,         // P856
    }

    const wikidata_url = `https://www.wikidata.org/wiki/${qid}`

    // 4. Write a DRAFT. NEVER publish. NEVER auto-approve.
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const content = {
      key_facts,
      _sources: {
        wikidata_qid: qid,
        wikidata_url,
        acquired_at: new Date().toISOString(),
        source: 'wikidata',
        phase: 1,
      },
    }

    const { data: existing } = await supabase
      .from('wikilux_content')
      .select('id, slug')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      // Update the existing draft's content only — do not touch publish state.
      const { error } = await supabase
        .from('wikilux_content')
        .update({ content, status: 'pending', is_published: false, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('wikilux_content').insert({
        slug,
        brand_name: name,
        content,
        status: 'pending',
        is_published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
    }

    return NextResponse.json({
      success: true,
      matched: true,
      message: `Key Facts draft for "${name}" written (unpublished, in review).`,
      data: {
        slug,
        brand_name: name,
        wikidata_qid: qid,
        wikidata_url,
        instance_of: instanceLabels,
        key_facts,
        is_published: false,
        status: 'pending',
      },
    })
  } catch (error: any) {
    console.error('Key Facts generator error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
