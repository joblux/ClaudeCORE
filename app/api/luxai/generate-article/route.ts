import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    const prompt = `You are a luxury industry journalist writing for JOBLUX, a luxury careers intelligence platform. Write a thought leadership article about ${topicDesc}.

Return ONLY a JSON object (no markdown, no backticks):
{
  "title": "Compelling headline [max 80 chars]",
  "subtitle": "One-line hook [max 120 chars]",
  "slug": "url-friendly-slug",
  "content": "Full article in markdown format. 4-6 paragraphs. Professional tone. Include specific brand names, data points, and industry insights. [800-1200 words]",
  "excerpt": "2-3 sentence summary for cards [max 200 chars]",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "category": "Career Intelligence" | "Brand Analysis" | "Market Report" | "Hiring Strategy",
  "read_time": 5,
  "brand_mentions": ["BrandName1", "BrandName2"]
}

RULES:
- Article must reference real luxury brands and plausible industry dynamics
- Tags should include brand names (lowercase with hyphens) and topic tags
- Content in markdown: use ## for subheadings, **bold** for emphasis
- Professional, authoritative tone — not promotional
- Must include career implications for luxury professionals
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

    const { data: row, error } = await supabase.from('bloglux_articles').insert({
      title: article.title,
      subtitle: article.subtitle,
      slug: article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 80),
      body: article.content,
      excerpt: article.excerpt,
      tags: article.tags,
      category: article.category,
      read_time_minutes: article.read_time || 5,
      status: 'draft',
      author_name: 'JOBLUX Intelligence'
    }).select().maybeSingle()

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
      message: `Article "${article.title}" generated as draft`,
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
