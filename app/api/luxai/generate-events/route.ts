import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { count = 10, sector } = await request.json()
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

    const sectorFilter = sector ? `Focus on the ${sector} sector.` : 'Cover a mix of sectors: Fashion, Watches & Jewellery, Art & Culture, Hospitality, Business, Automotive & Yachts, Beauty, Real Estate.'

    const prompt = `You are a luxury industry calendar curator for JOBLUX. Generate ${count} upcoming luxury industry events for 2026.

${sectorFilter}

Return ONLY a JSON array (no markdown, no backticks):
[
  {
    "name": "Event name [max 80 chars]",
    "title": "Full title with subtitle if any [max 100 chars]",
    "sector": "Fashion" | "Watches & Jewellery" | "Art & Culture" | "Hospitality" | "Business" | "Automotive & Yachts" | "Beauty" | "Real Estate",
    "location_city": "Milan",
    "location_country": "Italy",
    "start_date": "2026-06-15",
    "end_date": "2026-06-18",
    "description": "What this event is, who attends, why it matters [max 300 chars]",
    "career_context": "Why luxury professionals should care [max 200 chars]",
    "organizer": "Organizer name",
    "attendance": "~5,000",
    "type": "trade_show" | "fashion_week" | "conference" | "exhibition" | "awards" | "summit",
    "website_url": "https://example.com"
  }
]

RULES:
- ${count} events exactly
- Real or highly realistic events based on actual luxury industry calendar
- Dates between April 2026 and March 2027
- Mix of cities: Paris, Milan, London, Geneva, New York, Hong Kong, Dubai, Shanghai
- Include major fashion weeks, watch fairs, art fairs, hospitality summits
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

    if (!response.ok) throw new Error(`Claude API error: ${await response.text()}`)

    const data = await response.json()
    const text = data.content[0].text
    const inputTokens = data.usage.input_tokens
    const outputTokens = data.usage.output_tokens
    const cost = (inputTokens * 1.00 / 1000000) + (outputTokens * 5.00 / 1000000)

    let events
    try {
      let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
      const first = cleaned.indexOf('[')
      const last = cleaned.lastIndexOf(']')
      if (first !== -1 && last > first) cleaned = cleaned.substring(first, last + 1)
      events = JSON.parse(cleaned)
    } catch (e: any) {
      throw new Error(`JSON parse failed: ${e.message}`)
    }

    const inserted = []
    for (const ev of events) {
      const slug = ev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80)
      const { data: row, error } = await supabase.from('events').insert({
        name: ev.name,
        title: ev.title || ev.name,
        slug,
        sector: ev.sector,
        location_city: ev.location_city,
        location_country: ev.location_country,
        city: ev.location_city,
        location: `${ev.location_city}, ${ev.location_country}`,
        start_date: ev.start_date,
        end_date: ev.end_date,
        event_date: ev.start_date,
        description: ev.description,
        career_context: ev.career_context,
        organizer: ev.organizer,
        attendance: ev.attendance,
        type: ev.type,
        website_url: ev.website_url,
        is_published: false,
        is_featured: false,
        source: 'luxai'
      }).select().maybeSingle()
      if (!error && row) inserted.push(row)
    }

    await supabase.from('luxai_history').insert({
      type: 'event_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate ${count} events`,
      response: { count: inserted.length },
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: `${inserted.length} events generated`,
      data: { count: inserted.length, cost, tokens: inputTokens + outputTokens }
    })
  } catch (error: any) {
    console.error('Event generation error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
