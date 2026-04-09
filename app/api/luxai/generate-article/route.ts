import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkDuplicate } from '@/lib/duplicate-check'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { topic = 'career-trends' } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const topicMap: Record<string, string> = {
      'career-trends': 'luxury career trends and talent movement',
      'brand-analysis': 'deep analysis of a luxury brand strategy',
      'market-insights': 'luxury market analysis and industry shifts',
      'hiring-strategy': 'hiring and recruitment in luxury'
    }
    const topicDesc = topicMap[topic] || topicMap['career-trends']

    // Fetch JOBLUX platform data so the article is grounded in real counts, not invented figures
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

    const platformContextBlock = `JOBLUX PLATFORM CONTEXT — use only these figures when referencing platform data.
- Signals (published, total): ${signalsTotal}
  - contraction: ${signalCategoryCounts.contraction}
  - expansion: ${signalCategoryCounts.expansion}
  - growth: ${signalCategoryCounts.growth}
  - leadership: ${signalCategoryCounts.leadership}
  - merger_acquisition: ${signalCategoryCounts.merger_acquisition}
- Salary benchmarks (published): ${salaryTotal} rows across ${salaryDistinctBrands} distinct brands
- WikiLux brands (approved): ${wikiluxApproved}
- Bloglux articles (published, not deleted): ${blogluxPublished}`

    const prompt = `${platformContextBlock}

You are a luxury industry journalist writing for JOBLUX, a luxury careers intelligence platform. Write a thought leadership article about ${topicDesc}.

Return ONLY a JSON object (no markdown, no backticks):
{
  "title": "Compelling headline [max 80 chars]",
  "subtitle": "One-line hook [max 120 chars]",
  "slug": "url-friendly-slug",
  "content": "Full article in markdown format. 4-6 paragraphs. Professional tone. [800-1200 words] Ground any figures in the JOBLUX platform context above; reference real luxury brands by name without inventing statistics about them.",
  "excerpt": "2-3 sentence summary for cards [max 200 chars]",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "category": "Career Intelligence" | "Brand Analysis" | "Market Report" | "Hiring Strategy",
  "read_time": 5,
  "brand_mentions": ["BrandName1", "BrandName2"]
}

RULES:
- Tags should include brand names (lowercase with hyphens) and topic tags
- Content in markdown: use ## for subheadings, **bold** for emphasis
- Professional, authoritative tone | not promotional
- Must include career implications for luxury professionals
- Content must be relevant to luxury careers intelligence
- Only use statistics and figures explicitly provided in this prompt or in the injected JOBLUX platform context above
- Do not invent specific figures, percentages, headcounts, or market totals
- Use restrained claim language: suggests, indicates, may imply, points to
- Distinguish observation from interpretation throughout
- Never state inferred motives or outcomes as facts
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
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Claude API error: ${error}`)
    }

    const data = await response.json()
    const text = data.content[0].text
    const inputTokens = data.usage.input_tokens
    const outputTokens = data.usage.output_tokens
    const cost = (inputTokens * 1.00 / 1000000) + (outputTokens * 5.00 / 1000000)

    let article
    try {
      let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
      const firstBrace = cleaned.indexOf('{')
      const lastBrace = cleaned.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1)
      }
      article = JSON.parse(cleaned)
    } catch (e: any) {
      throw new Error(`JSON parse failed: ${e.message}`)
    }

    // Write to content_queue (canonical editorial gate) — not directly to bloglux_articles
    const slug = article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 80)
    const _dupe = await checkDuplicate({ content_type: 'article', title: article.title, slug })
    if (_dupe.isDuplicate) { console.warn('[JOBLUX DUPLICATE SKIPPED]', article.title); return NextResponse.json({ success: false, skipped: true, reason: 'duplicate', match: _dupe.match }) }
    const { error } = await supabase.from('content_queue').insert({
      content_type: 'article',
      source_type: 'joblux_generation',
      source_name: 'luxai',
      title: article.title,
      category: article.category,
      destination_table: 'bloglux_articles',
      status: 'draft',
      processed_content: {
        title: article.title,
        subtitle: article.subtitle,
        slug,
        body: article.content,
        excerpt: article.excerpt,
        tags: article.tags,
        category: article.category,
        read_time_minutes: article.read_time || 5,
        brand_mentions: article.brand_mentions || [],
      },
    })

    if (error) throw error

    await supabase.from('luxai_history').insert({
      type: 'article_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate article: ${topicDesc}`,
      response: { title: article.title, slug: article.slug },
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: `Article "${article.title}" queued for review`,
      data: { title: article.title, cost, tokens: inputTokens + outputTokens }
    })
  } catch (error: any) {
    console.error('Article generation error:', error)
    await supabase.from('luxai_history').insert({
      type: 'article_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: 'Generate article',
      response: { error: error.message },
      tokens_used: 0, cost_usd: 0, status: 'error'
    }).then(() => {})
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
