import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_SECTORS = [
  'Fashion & Accessories',
  'Watches & Jewellery',
  'Hospitality & Fine Food',
  'Art & Culture',
  'Automotive & Yachts',
  'Beauty',
  'Real Estate',
  'Wine & Spirits',
] as const

const BATCH_LIMIT = 10

interface BrandRow {
  slug: string
  brand_name: string
  sector: string | null
  headquarters: string | null
  description: string | null
}

interface PerBrandResult {
  slug: string
  brand_name: string
  success: boolean
  updated?: { sector?: string; headquarters?: string; description?: string }
  error?: string
}

function extractJson(text: string): any | null {
  const first = text.indexOf('{')
  const last = text.lastIndexOf('}')
  if (first === -1 || last === -1 || last <= first) return null
  try {
    return JSON.parse(text.slice(first, last + 1))
  } catch {
    return null
  }
}

function isValidHeadquarters(s: unknown): s is string {
  return typeof s === 'string' && /^[^,]+,\s*[^,]+$/.test(s.trim())
}

function isValidDescription(s: unknown): s is string {
  if (typeof s !== 'string') return false
  const t = s.trim()
  if (t.length < 10) return false
  // max 2 sentences — count sentence-ending punctuation
  const sentences = t.match(/[.!?](\s|$)/g) || []
  return sentences.length <= 2
}

function isValidSector(s: unknown): s is string {
  return typeof s === 'string' && (ALLOWED_SECTORS as readonly string[]).includes(s.trim())
}

async function generateMetadata(brandName: string): Promise<{ sector?: string; headquarters?: string; description?: string } | { error: string }> {
  const prompt = `You are a luxury industry researcher. For the brand "${brandName}", return ONLY a valid JSON object (no markdown, no backticks, no commentary) with exactly these three keys:

{
  "sector": "",
  "headquarters": "",
  "description": ""
}

Rules:
- "sector" MUST be exactly one of: ${ALLOWED_SECTORS.join(' | ')}
- "headquarters" MUST be in the exact format "City, Country" (e.g. "Paris, France")
- "description" MUST be factual, concise, and a maximum of 2 sentences. No marketing language. No invented facts. If uncertain, prefer the best-known factual summary over embellishment.

Return only the JSON object.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')

    const parsed = extractJson(text)
    if (!parsed || typeof parsed !== 'object') {
      return { error: 'Model returned invalid JSON' }
    }

    const result: { sector?: string; headquarters?: string; description?: string } = {}

    if (parsed.sector !== undefined && parsed.sector !== null && parsed.sector !== '') {
      if (!isValidSector(parsed.sector)) {
        return { error: `Invalid sector: "${parsed.sector}"` }
      }
      result.sector = String(parsed.sector).trim()
    }

    if (parsed.headquarters !== undefined && parsed.headquarters !== null && parsed.headquarters !== '') {
      if (!isValidHeadquarters(parsed.headquarters)) {
        return { error: `Invalid headquarters format: "${parsed.headquarters}"` }
      }
      result.headquarters = String(parsed.headquarters).trim()
    }

    if (parsed.description !== undefined && parsed.description !== null && parsed.description !== '') {
      if (!isValidDescription(parsed.description)) {
        return { error: 'Invalid description (empty or more than 2 sentences)' }
      }
      result.description = String(parsed.description).trim()
    }

    if (!result.sector && !result.headquarters && !result.description) {
      return { error: 'Model returned no usable fields' }
    }

    return result
  } catch (e: any) {
    return { error: e?.message || 'Anthropic API call failed' }
  }
}

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('wikilux_content')
      .select('slug', { count: 'exact', head: true })
      .eq('status', 'approved')
      .or('sector.is.null,headquarters.is.null,description.is.null')

    if (error) throw error
    return NextResponse.json({ incomplete: count ?? 0 })
  } catch (e: any) {
    console.error('[fill-brand-metadata] GET error:', e)
    return NextResponse.json({ incomplete: 0, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const { data: rows, error } = await supabase
      .from('wikilux_content')
      .select('slug, brand_name, sector, headquarters, description')
      .eq('status', 'approved')
      .or('sector.is.null,headquarters.is.null,description.is.null')
      .limit(BATCH_LIMIT)

    if (error) throw error

    const brands = (rows || []) as BrandRow[]
    const results: PerBrandResult[] = []
    let succeeded = 0
    let failed = 0

    for (const brand of brands) {
      const gen = await generateMetadata(brand.brand_name)

      if ('error' in gen) {
        console.warn(`[fill-brand-metadata] ${brand.slug}: ${gen.error}`)
        failed++
        results.push({ slug: brand.slug, brand_name: brand.brand_name, success: false, error: gen.error })
        continue
      }

      // Only overwrite null DB fields
      const update: Record<string, string> = {}
      if (brand.sector === null && gen.sector) update.sector = gen.sector
      if (brand.headquarters === null && gen.headquarters) update.headquarters = gen.headquarters
      if (brand.description === null && gen.description) update.description = gen.description

      if (Object.keys(update).length === 0) {
        failed++
        results.push({ slug: brand.slug, brand_name: brand.brand_name, success: false, error: 'No null fields to fill (or model returned only fields that are already populated)' })
        continue
      }

      const { error: updErr } = await supabase
        .from('wikilux_content')
        .update({ ...update, updated_at: new Date().toISOString() })
        .eq('slug', brand.slug)

      if (updErr) {
        console.warn(`[fill-brand-metadata] ${brand.slug}: db update failed: ${updErr.message}`)
        failed++
        results.push({ slug: brand.slug, brand_name: brand.brand_name, success: false, error: updErr.message })
        continue
      }

      succeeded++
      results.push({ slug: brand.slug, brand_name: brand.brand_name, success: true, updated: update })
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${brands.length} brand(s) | ${succeeded} succeeded | ${failed} failed`,
      attempted: brands.length,
      succeeded,
      failed,
      results,
    })
  } catch (e: any) {
    console.error('[fill-brand-metadata] error:', e)
    return NextResponse.json({ success: false, message: e?.message || 'Unknown error' }, { status: 500 })
  }
}
