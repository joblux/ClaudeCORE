import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { count = 3 } = await request.json()
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

    const prompt = `You are curating insider perspectives for JOBLUX, a luxury careers intelligence platform. Generate ${count} insider voice quotes from luxury industry professionals.

Return ONLY a JSON array (no markdown, no backticks):
[
  {
    "quote": "A substantial, insightful quote about working in luxury, hiring, careers, or industry direction. 2-3 sentences. Must sound like a real senior executive speaking candidly. [max 300 chars]",
    "author_name": "First Initial. Last Name",
    "author_initials": "FL",
    "author_title": "Their real-sounding title",
    "author_company": "Company or 'Independent Maison'",
    "topic_tags": ["hiring", "careers", "luxury-retail"]
  }
]

RULES:
- ${count} quotes exactly
- Use plausible but fictional names — not real people
- Titles: SVP, VP, Director, Chief People Officer, Head of Retail, Creative Director, Managing Director
- Companies: use real luxury groups (LVMH, Kering, Richemont, Hermès) or "Independent Maison"
- Topics: hiring, talent, digital transformation, retail, craftsmanship, leadership, culture
- Quotes must feel genuine — specific, opinionated, insider-knowledge tone
- Output valid JSON array only`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) throw new Error(`Claude API error: ${await response.text()}`)

    const data = await response.json()
    const text = data.content[0].text
    const inputTokens = data.usage.input_tokens
    const outputTokens = data.usage.output_tokens
    const cost = (inputTokens * 1.00 / 1000000) + (outputTokens * 5.00 / 1000000)

    let voices
    try {
      let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
      const first = cleaned.indexOf('[')
      const last = cleaned.lastIndexOf(']')
      if (first !== -1 && last > first) cleaned = cleaned.substring(first, last + 1)
      voices = JSON.parse(cleaned)
    } catch (e: any) {
      throw new Error(`JSON parse failed: ${e.message}`)
    }

    // Store as bloglux_articles with category "Insider Voice"
    const inserted = []
    for (const v of voices) {
      const slug = `insider-${v.author_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
      const { data: row, error } = await supabase.from('bloglux_articles').insert({
        title: `"${v.quote.substring(0, 60)}..."`,
        slug,
        body: v.quote,
        category: 'Insider Voice',
        tags: v.topic_tags,
        status: 'draft',
        content_origin: 'ai',
        author_name: v.author_name,
        author_role: `${v.author_title}, ${v.author_company}`
      }).select().maybeSingle()
      if (!error && row) inserted.push(row)
    }

    await supabase.from('luxai_history').insert({
      type: 'insider_voice_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate ${count} insider voices`,
      response: { count: inserted.length },
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: `${inserted.length} insider voices generated as drafts`,
      data: { count: inserted.length, cost, tokens: inputTokens + outputTokens }
    })
  } catch (error: any) {
    console.error('Insider voice generation error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
