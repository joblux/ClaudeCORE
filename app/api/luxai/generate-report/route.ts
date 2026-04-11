import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  insertLuxaiQueueItem,
  QueueValidationError,
  queueValidationErrorResponse,
} from '@/lib/luxai-rules'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { report_type = 'salary' } = await request.json()
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

    const typeMap: Record<string, string> = {
      'salary': 'Luxury Compensation Report | salary ranges, bonus structures, and compensation trends across luxury brands and cities',
      'hiring': 'State of Luxury Hiring | which brands are growing, cutting, restructuring, and what roles are in demand',
      'market': 'Luxury Market Expansion Index | retail expansion, new markets, and talent demand by region',
      'career': 'Luxury Career Ladder | how professionals progress across maisons, average tenure, and career path analysis'
    }
    const reportDesc = typeMap[report_type] || typeMap['salary']

    // Fetch JOBLUX platform data so the report is grounded in real counts, not invented figures
    const [
      signalsTotalRes,
      signalsCategoryRes,
      salaryTotalRes,
      salaryBrandsRes,
      wikiluxRes,
      blogluxRes,
    ] = await Promise.all([
      supabase.from('signals').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('signals').select('category').eq('is_published', true),
      supabase.from('salary_benchmarks').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('salary_benchmarks').select('brand_slug').eq('is_published', true),
      supabase.from('wikilux_content').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('bloglux_articles').select('*', { count: 'exact', head: true }).eq('status', 'published').is('deleted_at', null),
    ])

    const signalsTotal = signalsTotalRes.count || 0
    const signalCategoryCounts: Record<string, number> = {
      contraction: 0,
      expansion: 0,
      growth: 0,
      leadership: 0,
      merger_acquisition: 0,
    }
    for (const row of (signalsCategoryRes.data || []) as Array<{ category: string | null }>) {
      const key = row.category || ''
      if (key in signalCategoryCounts) signalCategoryCounts[key]++
    }
    const salaryTotal = salaryTotalRes.count || 0
    const salaryDistinctBrands = new Set(
      ((salaryBrandsRes.data || []) as Array<{ brand_slug: string | null }>)
        .map(r => r.brand_slug)
        .filter((s): s is string => !!s)
    ).size
    const wikiluxApproved = wikiluxRes.count || 0
    const blogluxPublished = blogluxRes.count || 0

    const platformDataBlock = `JOBLUX PLATFORM DATA — use only these figures when referencing platform statistics:
- Signals (published, total): ${signalsTotal}
  - contraction: ${signalCategoryCounts.contraction}
  - expansion: ${signalCategoryCounts.expansion}
  - growth: ${signalCategoryCounts.growth}
  - leadership: ${signalCategoryCounts.leadership}
  - merger_acquisition: ${signalCategoryCounts.merger_acquisition}
- Salary benchmarks (published): ${salaryTotal} rows across ${salaryDistinctBrands} distinct brands
- WikiLux brands (approved): ${wikiluxApproved}
- Bloglux articles (published, not deleted): ${blogluxPublished}`

    const emphasis = (report_type === 'hiring' || report_type === 'market')
      ? 'Emphasize the signal totals and category breakdown above when characterizing hiring momentum, expansion, contraction, leadership movement, and M&A activity. Do not state figures beyond the signal counts provided.'
      : (report_type === 'salary')
      ? 'Emphasize the salary_benchmarks row count and distinct brand coverage above when characterizing compensation data. Do not state salary figures beyond what the platform data covers.'
      : 'Reference the platform data above where relevant. Do not state figures beyond what is provided.'

    const prompt = `${platformDataBlock}

You are a senior luxury industry analyst writing for JOBLUX. The current year is 2026. Write a substantial research report dated 2026: ${reportDesc}

${emphasis}

Return ONLY a JSON object (no markdown, no backticks):
{
  "title": "Report title [max 100 chars]",
  "subtitle": "One-line summary [max 150 chars]",
  "slug": "url-friendly-slug",
  "report_type": "${report_type}",
  "content": "Full report in markdown. 8-12 sections with ## headings. 1500-2500 words. Professional, data-driven tone, grounded only in the JOBLUX platform data above.",
  "excerpt": "3-4 sentence executive summary [max 300 chars]",
  "key_findings": ["Finding 1 [max 80 chars]", "Finding 2", "Finding 3", "Finding 4", "Finding 5"],
  "brands_covered": ["Brand1", "Brand2", "Brand3"],
  "tags": ["tag1", "tag2", "tag3"],
  "read_time": 12,
  "brand_mentions": ["Brand1", "Brand2"]
}

RULES:
- Only use facts and figures explicitly provided in this prompt (the JOBLUX PLATFORM DATA block above)
- Do not invent market-wide totals, percentages, or counts not present in the provided data
- Do not derive, extrapolate, or invent any figure beyond what is fetched
- Distinguish observation from interpretation
- Use restrained claim language: suggests, indicates, may imply, points to
- Never state inferred motives as facts
- All reports must reference 2026 as the current year | never 2024 or 2025
- Professional tone | this is a premium intelligence product
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
    const inputTokens = data.usage.input_tokens
    const outputTokens = data.usage.output_tokens
    const cost = (inputTokens * 1.00 / 1000000) + (outputTokens * 5.00 / 1000000)

    let report
    try {
      let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
      const first = cleaned.indexOf('{')
      const last = cleaned.lastIndexOf('}')
      if (first !== -1 && last > first) cleaned = cleaned.substring(first, last + 1)
      report = JSON.parse(cleaned)
    } catch (e: any) {
      throw new Error(`JSON parse failed: ${e.message}`)
    }

    // Route to content_queue (canonical editorial gate) — not directly to bloglux_articles
    const slug = report.slug || report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 80)
    const { error } = await insertLuxaiQueueItem(supabase, {
      content_type: 'article',
      source_type: 'joblux_generation',
      source_name: 'JOBLUX Intelligence',
      title: report.title,
      category: 'Research Report',
      destination_table: 'bloglux_articles',
      processed_content: {
        title: report.title,
        subtitle: report.subtitle,
        slug,
        body: report.content,
        excerpt: report.excerpt,
        tags: report.tags,
        category: 'Research Report',
        read_time_minutes: report.read_time || 12,
        brand_mentions: report.brand_mentions || [],
      },
    })

    if (error) throw error

    await supabase.from('luxai_history').insert({
      type: 'report_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate ${report_type} report`,
      response: { title: report.title },
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: `Research report "${report.title}" generated as draft`,
      data: { title: report.title, cost, tokens: inputTokens + outputTokens }
    })
  } catch (error: any) {
    if (error instanceof QueueValidationError) {
      return queueValidationErrorResponse(error)
    }
    console.error('Report generation error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
