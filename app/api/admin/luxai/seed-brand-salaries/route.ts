import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TARGET_BRANDS = [
  'tod-s',
  'tom-ford',
  'tom-ford-beauty',
  'tumi',
  'vacheron-constantin',
  'valentino',
  'van-cleef-arpels',
  'versace',
  'veuve-clicquot',
  'zenith',
] as const

const ALLOWED_CURRENCIES = ['EUR', 'GBP', 'USD'] as const
const ALLOWED_SENIORITY = ['junior', 'mid', 'senior', 'director', 'vp', 'c-suite'] as const

interface SalaryRecord {
  job_title: string
  department: string
  seniority: string
  city: string
  country: string
  currency: string
  salary_min: number
  salary_max: number
  salary_median: number
}

function extractJsonArray(text: string): any[] | null {
  const first = text.indexOf('[')
  const last = text.lastIndexOf(']')
  if (first === -1 || last === -1 || last <= first) return null
  try {
    const parsed = JSON.parse(text.slice(first, last + 1))
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function deriveCity(headquarters: string | null | undefined): string | null {
  if (!headquarters) return null
  const parts = headquarters.split(',').map((s) => s.trim()).filter(Boolean)
  return parts[0] || null
}

function validateRecord(r: any): { ok: true; record: SalaryRecord } | { ok: false; reason: string } {
  if (!r || typeof r !== 'object') return { ok: false, reason: 'not an object' }
  const job_title = typeof r.job_title === 'string' ? r.job_title.trim() : ''
  const department = typeof r.department === 'string' ? r.department.trim() : ''
  const seniority = typeof r.seniority === 'string' ? r.seniority.trim().toLowerCase() : ''
  const city = typeof r.city === 'string' ? r.city.trim() : ''
  const country = typeof r.country === 'string' ? r.country.trim() : ''
  const currency = typeof r.currency === 'string' ? r.currency.trim().toUpperCase() : ''
  const salary_min = Number(r.salary_min)
  const salary_max = Number(r.salary_max)
  const salary_median = Number(r.salary_median)

  if (!job_title) return { ok: false, reason: 'missing job_title' }
  if (!department) return { ok: false, reason: 'missing department' }
  if (!city) return { ok: false, reason: 'missing city' }
  if (!country) return { ok: false, reason: 'missing country' }
  if (!(ALLOWED_SENIORITY as readonly string[]).includes(seniority)) return { ok: false, reason: `invalid seniority "${seniority}"` }
  if (!(ALLOWED_CURRENCIES as readonly string[]).includes(currency)) return { ok: false, reason: `invalid currency "${currency}"` }
  if (!Number.isFinite(salary_median) || salary_median < 25000 || salary_median > 500000) {
    return { ok: false, reason: `salary_median out of range (${salary_median})` }
  }
  if (!Number.isFinite(salary_min) || !Number.isFinite(salary_max)) {
    return { ok: false, reason: 'salary_min/salary_max not numeric' }
  }

  return {
    ok: true,
    record: { job_title, department, seniority, city, country, currency, salary_min, salary_max, salary_median },
  }
}

async function isBrandPending(slug: string): Promise<boolean> {
  // Already has published salary benchmarks?
  const { count: benchCount } = await supabase
    .from('salary_benchmarks')
    .select('id', { count: 'exact', head: true })
    .eq('brand_slug', slug)
  if ((benchCount ?? 0) > 0) return false

  // Already has a non-rejected/non-published draft in content_queue?
  // Match by processed_content->>brand_slug to be precise.
  const { data: queued } = await supabase
    .from('content_queue')
    .select('id, status')
    .eq('content_type', 'salary_benchmark')
    .in('status', ['draft', 'under_review', 'approved'])
    .filter('processed_content->>brand_slug', 'eq', slug)
    .limit(1)
  if (queued && queued.length > 0) return false

  return true
}

async function findNextTargetSlug(): Promise<string | null> {
  for (const slug of TARGET_BRANDS) {
    if (await isBrandPending(slug)) return slug
  }
  return null
}

export async function GET() {
  try {
    let remaining = 0
    for (const slug of TARGET_BRANDS) {
      if (await isBrandPending(slug)) remaining++
    }
    return NextResponse.json({ remaining })
  } catch (e: any) {
    return NextResponse.json({ remaining: 0, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    let body: any = {}
    try { body = await request.json() } catch { /* no body */ }
    const requestedSlug: string | undefined = body?.brand_slug

    const slug = requestedSlug || (await findNextTargetSlug())
    if (!slug) {
      return NextResponse.json({ success: false, message: 'All target brands already have salary data' }, { status: 200 })
    }

    const { data: brand, error: brandErr } = await supabase
      .from('wikilux_content')
      .select('slug, brand_name, sector, headquarters')
      .eq('slug', slug)
      .maybeSingle()

    if (brandErr || !brand) {
      return NextResponse.json({ success: false, message: `Brand not found in wikilux_content: ${slug}` }, { status: 404 })
    }

    const city = deriveCity(brand.headquarters) || 'Paris'
    const sector = brand.sector || 'Luxury'

    const prompt = `You are a luxury industry compensation analyst. Generate 10 realistic salary benchmark records for ${brand.brand_name} (${sector} sector, headquartered in ${brand.headquarters || 'unknown'}).

Use 5 distinct job titles appropriate to the brand's sector, with 2 seniority levels each (one "mid" and one "senior"). Set city = "${city}".

Pick currency based on country: EUR for European countries, GBP for UK, USD for United States. Use realistic luxury market ranges.

Return ONLY a valid JSON array (no markdown, no backticks, no commentary) of 10 objects with EXACTLY these keys:

[
  {
    "job_title": "",
    "department": "",
    "seniority": "",
    "city": "",
    "country": "",
    "currency": "",
    "salary_min": 0,
    "salary_max": 0,
    "salary_median": 0
  }
]

Rules:
- seniority must be exactly "mid" or "senior"
- currency must be exactly "EUR", "GBP", or "USD"
- salary_median must be between 25000 and 500000
- salary_min < salary_median < salary_max
- All string fields must be non-empty
- Return exactly 10 records. JSON array only.`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')

    const arr = extractJsonArray(text)
    if (!arr) {
      return NextResponse.json({ success: false, message: 'Model returned invalid JSON array' }, { status: 500 })
    }

    const records_generated = arr.length
    const valid: SalaryRecord[] = []
    let records_skipped = 0
    for (const raw of arr) {
      const v = validateRecord(raw)
      if (v.ok) {
        valid.push(v.record)
      } else {
        records_skipped++
        console.warn(`[seed-brand-salaries] ${slug}: skipped — ${v.reason}`)
      }
    }

    if (valid.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid records after validation',
        brand_slug: slug,
        brand_name: brand.brand_name,
        records_generated,
        records_valid: 0,
        records_skipped,
      }, { status: 200 })
    }

    const { error: queueErr } = await supabase.from('content_queue').insert({
      content_type: 'salary_benchmark',
      source_type: 'joblux_generation',
      source_name: 'luxai',
      title: `Salary Benchmarks: ${brand.brand_name}`,
      processed_content: {
        brand_slug: slug,
        brand_name: brand.brand_name,
        records: valid,
      },
      destination_table: 'salary_benchmarks',
      status: 'draft',
    })

    if (queueErr) {
      return NextResponse.json({ success: false, message: `Failed to queue: ${queueErr.message}` }, { status: 500 })
    }

    await supabase.from('luxai_history').insert({
      type: 'salary_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt,
      response: { records: valid },
      tokens_used: (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0),
      status: 'success',
    })

    return NextResponse.json({
      success: true,
      brand_name: brand.brand_name,
      brand_slug: slug,
      records_generated,
      records_valid: valid.length,
      records_skipped,
    })
  } catch (e: any) {
    console.error('[seed-brand-salaries] error:', e)
    return NextResponse.json({ success: false, message: e?.message || 'Unknown error' }, { status: 500 })
  }
}
