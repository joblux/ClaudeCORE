import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// WikiLux Engine — first real build, SLICE 1 (isolated prototype)
// Per docs/WIKILUX_ENGINE_DESIGN_V2.md.
//
// Pipeline: Source Discovery (Wikidata) -> Corpus Builder (fetch+extract) ->
// Reasoning Layer (analyst over corpus, sourced-or-empty) -> RETURN draft.
//
// THIS SLICE WRITES NOTHING. No supabase, no insert/update, no publish.
// Persisting the draft is the NEXT slice. regenerateBrand.ts is the engine
// reference the original 16-section schema was adapted from — NOT edited here.
//
// S1b (V2): schema realigned to the actual page contract in
// app/brands/[slug]/page.tsx (the page is the contract):
// - signature_products ADDED (page renders {name, year, note} cards)
// - values SPLIT OUT of hiring_intelligence as a top-level section
//   (maison identity / house DNA); hiring_intelligence keeps only the
//   employee-experience keys culture/growth/pace/access.
//   S2 PAGE-SIDE FOLLOW-UP (do not fix here): buildBrandData in
//   app/brands/[slug]/page.tsx still reads values from
//   content.hiring_intelligence.values — it must switch to top-level
//   content.values (with hi.values as legacy fallback).
// - creative_directors is now an ARRAY of {period, name, role} (the page
//   only renders arrays; the v1 prose string could never display).
// - market_position, presence, facts CUT — no UI consumer (audit verified).
// ---------------------------------------------------------------------------

import { callClaude } from '@/lib/anthropic/client'

// --- Wikidata plumbing (shared Source-Discovery module) ---------------------
// Resilient Wikidata helpers (B2a-hardened: wdFetch retries + returns WdResult,
// never throws). Previously a per-route copy here; now the single shared source.
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

// --- Corpus builder (fetch pattern adapted from import/url/route.ts) --------

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const CORPUS_CHAR_CAP = 12000

/**
 * Fetch a URL with a ~10-second timeout and browser User-Agent.
 */
async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Strip HTML to readable plain text (same approach as import/url AI fallback).
 */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// --- Reasoning layer (analyst over corpus; adapted from regenerateBrand) ----

// The 15 sections of the BRAND-PAGE-V2 contract (app/brands/[slug]/page.tsx
// is the contract — every key here has a verified UI consumer).
const SECTION_KEYS = [
  'tagline',
  'brand_dna',
  'history',
  'founder_name',
  'founder',
  'founder_facts',
  'key_facts',
  'key_executives',
  'signature_products',
  'creative_directors',
  'values',
  'careers',
  'hiring_intelligence',
  'quote',
  'stock',
] as const

const ANALYST_SYSTEM = `You are a luxury-industry analyst building a brand dossier for JOBLUX. You reason over a PROVIDED CORPUS of real sources and ONLY that corpus.

NON-NEGOTIABLE DOCTRINE:
- No source -> no fact. Reason ONLY over the corpus passed to you. Do NOT use any outside, prior, or memorized knowledge about the brand. If the corpus does not state it, you do not know it.
- Sourced-or-empty: any field the corpus does not support, you OMIT entirely (or set to null). NO field is mandatory. Do not invent a quote, a name, a date, a number, or prose to fill a slot.
- For every section you DO produce, you must record which corpus source_url supports it.
- Output VALID JSON ONLY. No markdown, no backticks, no commentary.`

/**
 * Build the analyst prompt: inject the corpus + the 15-section schema + rules.
 */
function buildAnalystPrompt(
  brand: string,
  corpus: { source_url: string; source_ref: string; family: string; text: string }[]
): string {
  const corpusBlock = corpus
    .map(
      (c, i) =>
        `--- SOURCE ${i + 1} ---\nsource_url: ${c.source_url}\nsource_ref: ${c.source_ref}\nfamily: ${c.family}\ntext:\n${c.text}`
    )
    .join('\n\n')

  const allowedUrls = corpus.map(c => c.source_url)

  return `BRAND: ${brand}

CORPUS (the ONLY information you may use):
${corpusBlock}

TASK: Produce a brand dossier as a single JSON object using the 15-section schema below. Reason ONLY over the corpus above.

15-SECTION SCHEMA (brand-page contract; ALL OPTIONAL here — include a key ONLY if the corpus supports it, else omit the key):
{
  "tagline": "One sentence capturing the brand's essence [max 80 chars]",
  "brand_dna": "Brand identity: codes, position, what makes it unique [max 500 chars]",
  "history": [{"year": "1837", "event": "One-sentence milestone [max 120 chars]"}],
  "founder_name": "Full name of the founder",
  "founder": "Founder biography: origins, how they started, legacy [max 500 chars]",
  "founder_facts": ["Short fact [max 80 chars]"],
  "key_facts": [{"label": "Founded", "value": "1837"}, {"label": "Headquarters", "value": "Paris"}, {"label": "Ownership", "value": "..."}],
  "key_executives": [{"name": "Full Name", "role": "CEO", "since": "2013"}],
  "signature_products": [{"name": "Product name", "year": "1984", "note": "One-sentence description of the product and its significance [max 120 chars]"}],
  "creative_directors": [{"period": "2014–present", "name": "Full Name", "role": "Artistic director, womenswear"}],
  "values": [{"title": "...", "desc": "One sentence [max 80 chars]"}],
  "careers": {"prose": "What it's like to work here [max 300 chars]", "paths": ["..."]},
  "hiring_intelligence": {"culture": "[max 250 chars]", "growth": "[max 250 chars]", "pace": "[max 250 chars]", "access": "[max 250 chars]"},
  "quote": {"text": "A real quote PRESENT IN THE CORPUS [max 120 chars]", "author": "Full Name, Title"},
  "stock": {"is_public": true, "exchange": "EPA", "ticker": "RMS", "parent_group": "...", "market_cap": "..."}
}

SECTION GUIDANCE:
- signature_products: the brand's emblematic products/objects named in the corpus, each with its introduction year when stated.
- creative_directors: the history of the brand's ARTISTIC/CREATIVE leadership over time — designers, artistic directors, creative directors — INCLUDING the current artistic/creative director(s) when the corpus supports it. Chronological array. Do NOT put CEOs or business executives here (those belong in key_executives).
- values: 4 cards expressing the maison's identity — house DNA: craftsmanship codes, heritage, savoir-faire, what the house stands for. NOT the employee experience.
- careers.paths: typical roles/pathways structuring the maison (retail, métiers d'art, ateliers, corporate, supply chain), derived from corpus; NEVER live job listings.
- hiring_intelligence: the EMPLOYEE experience only — culture, growth, pace, access.

PROVENANCE (required): add ONE extra top-level key "_provenance": an object mapping EACH section key you filled to { "source_url": "<one of the corpus source_urls>", "source_ref": "<that source's ref>" }. Only cite a source_url from this allowed list: ${JSON.stringify(allowedUrls)}.

RULES:
- Character limits are hard constraints. Shorter is better.
- Omit any section the corpus does not support. Do NOT fabricate to satisfy the schema.
- quote and facts must be literally supported by the corpus, or omitted.
- Encyclopedic, factual tone. No marketing language.
- Output valid JSON only. No markdown. No backticks. No explanation.`
}

/**
 * Clean a model response and JSON.parse it (regenerateBrand's approach).
 */
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

/**
 * Is a produced section actually filled (present, non-null, non-empty)?
 */
function isFilled(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

// --- Route -----------------------------------------------------------------

export async function POST(request: Request) {
  try {
    // 1. AUTH
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

    // 2. SOURCE DISCOVERY — resolve + anti-homonym verify on Wikidata.
    const searchUrl =
      `${WD_API}?action=wbsearchentities&search=${encodeURIComponent(name)}` +
      `&language=en&format=json&limit=5&origin=*`
    const search = await wdFetch(searchUrl)
    const candidates: any[] = Array.isArray(search.data?.search) ? search.data.search : []
    if (candidates.length === 0) {
      return NextResponse.json({
        matched: false,
        message: `No Wikidata entity found for "${name}". Nothing built.`,
      })
    }

    let qid: string | null = null
    let claims: Record<string, Claim[]> = {}
    let sitelinks: Record<string, any> = {}
    const inspected: string[] = []

    for (const cand of candidates) {
      const cid: string = cand.id
      const entityData = await wdFetch(
        `https://www.wikidata.org/wiki/Special:EntityData/${cid}.json`
      )
      const ent = entityData.data?.entities?.[cid] ?? {}
      const candClaims: Record<string, Claim[]> = ent?.claims ?? {}
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
        sitelinks = ent?.sitelinks ?? {}
        break
      }
    }

    if (!qid) {
      return NextResponse.json({
        matched: false,
        message:
          `No Wikidata candidate for "${name}" confidently resolves to a ` +
          `brand/organization. Nothing built.`,
        inspected,
      })
    }

    // Derive sources: wikidata entity, English Wikipedia, official site (P856).
    const wikidataUrl = `https://www.wikidata.org/wiki/${qid}`
    const officialSite = claimString(firstClaim(claims, P.WEBSITE))
    const enwikiTitle: string | null = sitelinks?.enwiki?.title ?? null
    const wikipediaUrl = enwikiTitle
      ? `https://en.wikipedia.org/wiki/${encodeURIComponent(enwikiTitle.replace(/ /g, '_'))}`
      : `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`

    const derivedSources: { url: string; family: string; source_ref: string }[] = [
      { url: wikidataUrl, family: 'wikidata', source_ref: `Wikidata ${qid}` },
      { url: wikipediaUrl, family: 'wikipedia', source_ref: 'Wikipedia (en)' },
    ]
    if (officialSite) {
      derivedSources.push({ url: officialSite, family: 'official', source_ref: 'Official site' })
    }

    // 3. CORPUS BUILDER — fetch each source, fail-isolated, truncate.
    const corpus: { source_url: string; source_ref: string; family: string; text: string }[] = []
    for (const src of derivedSources) {
      try {
        const html = await fetchPage(src.url)
        const text = htmlToText(html).slice(0, CORPUS_CHAR_CAP)
        if (text && text.length >= 50) {
          corpus.push({
            source_url: src.url,
            source_ref: src.source_ref,
            family: src.family,
            text,
          })
        }
      } catch {
        // dead source is skipped, not fatal
        continue
      }
    }

    if (corpus.length === 0) {
      return NextResponse.json({
        matched: true,
        corpus_empty: true,
        brand: name,
        slug,
        derived_sources: derivedSources.map(s => s.url),
      })
    }

    // 4. REASONING LAYER — analyst reasons over the corpus only.
    const aiText = await callClaude({
      system: ANALYST_SYSTEM,
      prompt: buildAnalystPrompt(name, corpus),
      maxTokens: 8000,
    })

    let content: Record<string, any>
    try {
      content = parseModelJson(aiText)
    } catch (e: any) {
      return NextResponse.json(
        { success: false, message: `Analyst output parse failed: ${e.message}` },
        { status: 500 }
      )
    }

    // Section fill audit over the 15 known keys.
    const sectionsFilled: string[] = []
    const sectionsEmpty: string[] = []
    for (const key of SECTION_KEYS) {
      if (isFilled(content?.[key])) sectionsFilled.push(key)
      else sectionsEmpty.push(key)
    }

    // 5. RETURN — WRITE NOTHING. No DB, no publish. Draft payload only.
    return NextResponse.json({
      matched: true,
      brand: name,
      slug,
      derived_sources: corpus.map(c => c.source_url),
      corpus_sources: corpus.length,
      content_origin: 'wikilux_sourced',
      content,
      sections_filled: sectionsFilled,
      sections_empty: sectionsEmpty,
    })
  } catch (error: any) {
    console.error('WikiLux build error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
