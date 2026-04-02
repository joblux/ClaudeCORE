import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
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
- Salaries must be realistic for luxury industry in each city
- All numbers are annual base salary in local currency
- 5-8 benefits relevant to ${brandName}
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

    // 1. Store in wikilux_content.content.salaries (for brand page Salaries tab)
    const { data: current } = await supabase
      .from('wikilux_content')
      .select('content')
      .eq('slug', slug)
      .maybeSingle()

    const updatedContent = { ...(current?.content || {}), salaries: salaryData }
    await supabase.from('wikilux_content')
      .update({ content: updatedContent, updated_at: new Date().toISOString() })
      .eq('slug', slug)

    // 2. NORMALIZE: Write to salary_benchmarks table (for standalone Salaries page)
    // First clear old AI-generated salary data for this brand
    await supabase.from('salary_benchmarks')
      .delete()
      .eq('brand_slug', slug)
      .eq('source', 'JOBLUX Intelligence')

    // Insert normalized rows
    let benchmarkCount = 0
    for (const role of (salaryData.roles || [])) {
      for (const city of (role.cities || [])) {
        const { error: bErr } = await supabase.from('salary_benchmarks').insert({
          brand_name: brandName,
          brand_slug: slug,
          job_title: role.title,
          department: role.department,
          seniority: role.seniority,
          city: city.city,
          country: city.country,
          currency: city.currency,
          salary_min: city.min,
          salary_max: city.max,
          salary_median: city.median,
          bonus_min: city.bonus_min,
          bonus_max: city.bonus_max,
          total_comp_min: city.min + (city.bonus_min || 0),
          total_comp_max: city.max + (city.bonus_max || 0),
          source: 'JOBLUX Intelligence',
          content_origin: 'ai',
          confidence: 'ai_estimated',
          year_of_data: new Date().getFullYear(),
          notes: `AI-generated salary estimate for ${brandName}`
        })
        if (!bErr) benchmarkCount++
      }
    }

    // Log to history
    await supabase.from('luxai_history').insert({
      type: 'salary_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate salary for ${brandName}`,
      response: { slug, brand_name: brandName, roles: salaryData.roles?.length || 0, benchmarks_written: benchmarkCount },
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: `Salary data generated for ${brandName}: ${salaryData.roles?.length || 0} roles, ${benchmarkCount} benchmarks written`,
      data: { roles: salaryData.roles?.length || 0, benchmarks: benchmarkCount, cost, tokens: inputTokens + outputTokens }
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
