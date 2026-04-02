import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { report_type = 'salary' } = await request.json()
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

    const typeMap: Record<string, string> = {
      'salary': 'Luxury Compensation Report — salary ranges, bonus structures, and compensation trends across luxury brands and cities',
      'hiring': 'State of Luxury Hiring — which brands are growing, cutting, restructuring, and what roles are in demand',
      'market': 'Luxury Market Expansion Index — retail expansion, new markets, and talent demand by region',
      'career': 'Luxury Career Ladder — how professionals progress across maisons, average tenure, and career path analysis'
    }
    const reportDesc = typeMap[report_type] || typeMap['salary']

    const prompt = `You are a senior luxury industry analyst writing for JOBLUX. Write a substantial research report: ${reportDesc}

Return ONLY a JSON object (no markdown, no backticks):
{
  "title": "Report title [max 100 chars]",
  "subtitle": "One-line summary [max 150 chars]",
  "slug": "url-friendly-slug",
  "report_type": "${report_type}",
  "content": "Full report in markdown. 8-12 sections with ## headings. Include data points, percentages, brand names, city comparisons. 1500-2500 words. Professional, data-driven tone.",
  "excerpt": "3-4 sentence executive summary [max 300 chars]",
  "key_findings": ["Finding 1 [max 80 chars]", "Finding 2", "Finding 3", "Finding 4", "Finding 5"],
  "brands_covered": ["Brand1", "Brand2", "Brand3"],
  "data_points": "1,200+",
  "tags": ["tag1", "tag2", "tag3"],
  "read_time": 12
}

RULES:
- Reference 10+ real luxury brands with specific plausible data
- Include city-level comparisons (Paris, Milan, London, New York, Dubai, Hong Kong)
- Key findings must be specific and data-backed (percentages, figures)
- Professional tone — this is a premium intelligence product
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

    // Store in bloglux_articles with category "Research Report"
    const { error } = await supabase.from('bloglux_articles').insert({
      title: report.title,
      subtitle: report.subtitle,
      slug: report.slug || report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 80),
      body: report.content,
      excerpt: report.excerpt,
      tags: report.tags,
      category: 'Research Report',
      read_time_minutes: report.read_time || 12,
      status: 'draft',
      author_name: 'JOBLUX Intelligence'
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
    console.error('Report generation error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
