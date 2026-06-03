import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  insertLuxaiQueueItem,
  QueueValidationError,
  queueValidationErrorResponse,
  type LuxaiQueuePayload,
} from '@/lib/luxai-rules'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await request.json()
    if (!slug) return NextResponse.json({ success: false, message: 'slug required' }, { status: 400 })
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

    const { data: brand } = await supabase.from('wikilux_content').select('brand_name').eq('slug', slug).maybeSingle()
    if (!brand) return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 })
    const brandName = brand.brand_name

    const prompt = `You are a luxury compensation analyst for JOBLUX. Generate salary intelligence for ${brandName}.

Return ONLY a JSON object (no markdown, no backticks):
{
  "brand": "${brandName}",
  "roles": [
    {
      "title": "Boutique Director",
      "department": "Retail",
      "seniority": "senior",
      "cities": [
        {"city": "Paris", "country": "France", "currency": "EUR", "min": 75000, "max": 110000, "median": 92000, "bonus_min": 8000, "bonus_max": 20000},
        {"city": "London", "country": "United Kingdom", "currency": "GBP", "min": 70000, "max": 105000, "median": 87000, "bonus_min": 7000, "bonus_max": 18000},
        {"city": "New York", "country": "United States", "currency": "USD", "min": 90000, "max": 140000, "median": 115000, "bonus_min": 10000, "bonus_max": 25000},
        {"city": "Dubai", "country": "UAE", "currency": "AED", "min": 280000, "max": 420000, "median": 350000, "bonus_min": 30000, "bonus_max": 60000}
      ]
    }
  ],
  "benefits": ["Health insurance", "Employee discount", "Annual bonus", "Relocation support"],
  "comp_notes": "Brief note on compensation philosophy at ${brandName} [max 200 chars]"
}

RULES:
- Generate exactly 10 roles spanning: Retail, Marketing, Digital, Finance, Creative, Operations, HR, Supply Chain
- Seniority mix: 2 junior, 3 mid, 3 senior, 2 executive
- Each role has exactly 4 cities: Paris, London, New York, Dubai
- Salaries must be credible estimates grounded in known luxury industry compensation patterns — these are AI-estimated figures, not verified market data
- All numbers are annual base salary in local currency
- 5-8 benefits relevant to ${brandName}
- These are AI-generated salary estimates for editorial reference only, not verified compensation data
- Do not present figures with false precision — use ranges that reflect general luxury industry patterns by city and function
- Avoid overly granular figures that imply exact knowledge (e.g. 73,500). Prefer rounded ranges (e.g. 70k–80k)
- comp_notes must be clearly framed as an AI estimate, not a verified statement about the brand
- Never invent brand-specific compensation policies or benefits not publicly known
- Output valid JSON only`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) throw new Error(`Claude API error: ${await response.text()}`)

    const data = await response.json()
    const text = data.content[0].text

    if (data.stop_reason === 'max_tokens') {
      throw new Error(`Output truncated at ${data.usage.output_tokens} tokens`)
    }

    const inputTokens = data.usage.input_tokens
    const outputTokens = data.usage.output_tokens
    const cost = (inputTokens * 1.00 / 1000000) + (outputTokens * 5.00 / 1000000)

    let salaryData
    try {
      let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
      const first = cleaned.indexOf('{')
      const last = cleaned.lastIndexOf('}')
      if (first !== -1 && last > first) cleaned = cleaned.substring(first, last + 1)
      salaryData = JSON.parse(cleaned)
    } catch (e: any) {
      throw new Error(`JSON parse failed: ${e.message}`)
    }

    // QUEUE-ONLY conformance: NO live write at generation. Flatten roles[].cities[]
    // into records[] (one row per role × city) for the salary_benchmarks insert that
    // happens ONLY at approval (see approve mapper salary_benchmark branch). The full
    // salaryData blob is carried VERBATIM as `salaries` so the brand-page Salaries tab
    // (content.salaries, roles[].cities[]) gets functional parity at approval.
    const records: any[] = []
    for (const role of (salaryData.roles || [])) {
      for (const city of (role.cities || [])) {
        records.push({
          job_title: role.title,
          department: role.department,
          seniority: role.seniority,
          city: city.city,
          country: city.country,
          currency: city.currency,
          salary_min: city.min,
          salary_max: city.max,
          salary_median: city.median,
        })
      }
    }

    const queuePayload: LuxaiQueuePayload = {
      content_type: 'salary_benchmark',
      source_type: 'joblux_generation',
      source_name: 'luxai',
      title: `Salary Intelligence: ${brandName}`,
      raw_content: { slug, brand_name: brandName, result: salaryData },
      processed_content: { brand_name: brandName, brand_slug: slug, records, salaries: salaryData },
      destination_table: 'salary_benchmarks',
    }

    try {
      const { error: queueError } = await insertLuxaiQueueItem(supabase, queuePayload)
      if (queueError) throw queueError
    } catch (e: any) {
      if (e instanceof QueueValidationError) return queueValidationErrorResponse(e)
      throw e
    }

    // Log to history — now QUEUED for review, not published live.
    await supabase.from('luxai_history').insert({
      type: 'salary_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate salary for ${brandName}`,
      response: { slug, brand_name: brandName, roles: salaryData.roles?.length || 0, records: records.length, queued: true },
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      queued: true,
      message: `Queued salary draft for ${brandName}: ${salaryData.roles?.length || 0} roles`,
      data: { roles: salaryData.roles?.length || 0, records: records.length, cost, tokens: inputTokens + outputTokens }
    })
  } catch (error: any) {
    console.error('Salary generation error:', error)
    await supabase.from('luxai_history').insert({
      type: 'salary_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: 'Generate salary',
      response: { error: error.message },
      tokens_used: 0, cost_usd: 0, status: 'error'
    }).then(() => {})
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
