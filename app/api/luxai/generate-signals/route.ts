import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { count = 5 } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const prompt = `You are a luxury industry intelligence analyst for JOBLUX. Generate ${count} realistic luxury industry news signals.

Each signal must be about a REAL luxury brand or group (LVMH, Kering, Hermès, Chanel, Richemont, Prada, Burberry, Cartier, Dior, Gucci, Rolex, Tiffany, etc.)

Return ONLY a JSON array (no markdown, no backticks):
[
  {
    "category": "TALENT" | "MARKET" | "BRAND" | "FINANCE",
    "headline": "Short punchy headline [max 80 chars]",
    "context_paragraph": "2-3 sentences of context explaining the signal [max 300 chars]",
    "career_implications": "1-2 sentences on what this means for luxury professionals [max 200 chars]",
    "source_name": "Reuters | BOF | WWD | FT | Bloomberg",
    "brand_tags": ["BrandName1", "BrandName2"],
    "confidence": "high" | "medium"
  }
]

RULES:
- ${count} signals exactly
- Mix of categories: at least 1 TALENT, 1 MARKET, 1 BRAND
- brand_tags: use exact brand names (Cartier not cartier)
- Realistic, plausible signals based on real industry dynamics
- No duplicate brands across signals
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

    let signals
    try {
      let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
      const firstBracket = cleaned.indexOf('[')
      const lastBracket = cleaned.lastIndexOf(']')
      if (firstBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1)
      }
      signals = JSON.parse(cleaned)
    } catch (e: any) {
      throw new Error(`JSON parse failed: ${e.message}`)
    }

    // Insert each signal as pending (unpublished)
    const inserted = []
    for (const s of signals) {
      const slug = s.headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80)
      const { data: row, error } = await supabase.from('signals').insert({
        category: s.category,
        headline: s.headline,
        context_paragraph: s.context_paragraph,
        career_implications: s.career_implications,
        source_name: s.source_name,
        source_url: null,
        brand_tags: s.brand_tags,
        confidence: s.confidence,
        is_published: false,
        content_origin: 'ai',
        is_pinned: false,
        slug
      }).select().maybeSingle()

      if (!error && row) inserted.push(row)
    }

    // Log to history
    await supabase.from('luxai_history').insert({
      type: 'signal_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate ${count} signals`,
      response: { count: inserted.length },
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: `${inserted.length} signals generated and pending approval`,
      data: { count: inserted.length, cost, tokens: inputTokens + outputTokens }
    })
  } catch (error: any) {
    console.error('Signal generation error:', error)
    await supabase.from('luxai_history').insert({
      type: 'signal_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: 'Generate signals',
      response: { error: error.message },
      tokens_used: 0,
      cost_usd: 0,
      status: 'error'
    }).then(() => {})
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
