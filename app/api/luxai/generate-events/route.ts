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
    "long_description": "A 200-400 word editorial overview of the event. Cover its history, significance in the luxury calendar, what to expect this edition, who the key attendees are, and what makes it unmissable for luxury professionals. Write in an authoritative editorial tone.",
    "highlights": [
      "Key highlight or feature #1",
      "Key highlight or feature #2",
      "Key highlight or feature #3",
      "Key highlight or feature #4",
      "Key highlight or feature #5"
    ],
    "brands_present": ["Brand 1", "Brand 2", "Brand 3", "Brand 4", "Brand 5", "Brand 6", "Brand 7", "Brand 8"],
    "career_opportunities": [
      "Specific career opportunity this event creates #1",
      "Specific career opportunity #2",
      "Specific career opportunity #3",
      "Specific career opportunity #4"
    ],
    "networking_tips": [
      "Actionable networking tip #1 for this specific event",
      "Networking tip #2",
      "Networking tip #3"
    ],
    "practical_info": {
      "venue": "Name and address of the venue",
      "access": "How to get access or register (trade only, public, invitation, etc.)",
      "transport": "Nearest metro/airport, transport advice",
      "dress_code": "Expected dress code for the event",
      "language": "Primary language(s) spoken"
    },
    "career_context": "Why luxury professionals should care [max 200 chars]",
    "organizer": "Organizer name",
    "attendance": "~5,000",
    "type": "trade_show" | "fashion_week" | "conference" | "exhibition" | "awards" | "summit",
    "website_url": "https://example.com",
    "meta_title": "Event Name | City | JOBLUX Events",
    "meta_description": "150-char SEO description of the event, its dates, and why luxury professionals attend"
  }
]

RULES:
- ${count} events exactly
- Real or highly realistic events based on actual luxury industry calendar
- Dates between April 2026 and March 2027
- Mix of cities: Paris, Milan, London, Geneva, New York, Hong Kong, Dubai, Shanghai
- Include major fashion weeks, watch fairs, art fairs, hospitality summits
- highlights: 4-6 items per event
- brands_present: 6-10 realistic brands per event
- career_opportunities: 3-5 items per event
- networking_tips: 3-4 items per event
- practical_info: all 5 fields filled for each event
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

    console.log('[LUXAI events] Raw Claude response:', text.substring(0, 500))

    let events
    try {
      // Strip markdown backticks if present
      let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()

      // Try array first, fall back to object
      const firstBracket = cleaned.indexOf('[')
      const lastBracket = cleaned.lastIndexOf(']')
      const firstBrace = cleaned.indexOf('{')
      const lastBrace = cleaned.lastIndexOf('}')

      if (firstBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1)
      } else if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1)
      }

      events = JSON.parse(cleaned)

      // Wrap single object in array
      if (!Array.isArray(events)) {
        events = [events]
      }
    } catch (e: any) {
      console.error('[LUXAI events] Raw text that failed parsing:', text)
      throw new Error(`JSON parse failed: ${e.message} — raw starts with: ${text.substring(0, 200)}`)
    }

    console.log(`[LUXAI events] Parsed ${events.length} events from Claude response`)

    const inserted = []
    const insertErrors = []
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
        long_description: ev.long_description,
        highlights: ev.highlights,
        brands_present: ev.brands_present,
        career_opportunities: ev.career_opportunities,
        networking_tips: ev.networking_tips,
        practical_info: ev.practical_info,
        career_context: ev.career_context,
        organizer: ev.organizer,
        attendance: ev.attendance,
        type: ev.type,
        website_url: ev.website_url,
        meta_title: ev.meta_title,
        meta_description: ev.meta_description,
        is_published: false,
        content_origin: 'ai',
        is_featured: false,
        source: 'luxai'
      }).select().maybeSingle()

      if (error) {
        console.error(`[LUXAI events] Insert failed for "${ev.name}":`, error.message, error.details)
        insertErrors.push({ name: ev.name, error: error.message })
      } else if (row) {
        inserted.push(row)
      }
    }

    if (insertErrors.length > 0) {
      console.error(`[LUXAI events] ${insertErrors.length}/${events.length} inserts failed:`, JSON.stringify(insertErrors))
    }

    await supabase.from('luxai_history').insert({
      type: 'event_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate ${count} events`,
      response: {
        count: inserted.length,
        parsed: events.length,
        errors: insertErrors.length > 0 ? insertErrors : undefined
      },
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      status: inserted.length > 0 ? 'success' : 'error'
    })

    return NextResponse.json({
      success: inserted.length > 0,
      message: inserted.length > 0
        ? `${inserted.length} events generated`
        : `Parsed ${events.length} events but all inserts failed — check logs`,
      data: {
        count: inserted.length,
        parsed: events.length,
        failed: insertErrors.length,
        cost,
        tokens: inputTokens + outputTokens,
        errors: insertErrors.length > 0 ? insertErrors : undefined
      }
    })
  } catch (error: any) {
    console.error('[LUXAI events] Fatal error:', error)
    await supabase.from('luxai_history').insert({
      type: 'event_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: 'Generate events',
      response: { error: error.message },
      tokens_used: 0,
      cost_usd: 0,
      status: 'error'
    }).catch((e) => console.error('[LUXAI events] Failed to log error to history:', e))
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
