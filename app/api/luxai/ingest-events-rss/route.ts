import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { XMLParser } from 'fast-xml-parser'
import {
  insertLuxaiQueueItem,
  QueueValidationError,
} from '@/lib/luxai-rules'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Focused Google News RSS searches for luxury industry events
// TODO: migrate to rss_sources table once it has a content_type column
const EVENT_FEEDS = [
  {
    name: 'Google News — Luxury Fashion Events',
    feed_url: 'https://news.google.com/rss/search?q=%22luxury+fashion%22+%22event%22+OR+%22fashion+week%22+OR+%22trade+show%22&hl=en&gl=US&ceid=US:en',
  },
  {
    name: 'Google News — Luxury Watch & Jewellery Fairs',
    feed_url: 'https://news.google.com/rss/search?q=%22watches+and+wonders%22+OR+%22baselworld%22+OR+%22jewellery+fair%22+OR+%22haute+horlogerie%22&hl=en&gl=US&ceid=US:en',
  },
  {
    name: 'Google News — Luxury Industry Conferences',
    feed_url: 'https://news.google.com/rss/search?q=%22luxury+conference%22+OR+%22luxury+summit%22+OR+%22luxury+expo%22+OR+%22art+fair+luxury%22&hl=en&gl=US&ceid=US:en',
  },
]

const EVENT_KEYWORDS = [
  'event', 'fair', 'exhibition', 'conference', 'summit', 'week', 'show',
  'expo', 'gala', 'awards', 'ceremony', 'launch', 'opening', 'preview',
  'salon', 'biennale', 'festival', 'forum',
]

const LUXURY_KEYWORDS = [
  'luxury', 'lvmh', 'kering', 'richemont', 'hermès', 'hermes', 'chanel', 'dior',
  'gucci', 'prada', 'burberry', 'cartier', 'tiffany', 'rolex', 'fashion',
  'haute couture', 'watches and wonders', 'baselworld', 'art basel',
  'frieze', 'tefaf', 'salone del mobile', 'maison et objet',
]

const MAX_ITEMS_PER_SOURCE = 5

function isEventRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  const hasLuxury = LUXURY_KEYWORDS.some(kw => text.includes(kw))
  const hasEvent = EVENT_KEYWORDS.some(kw => text.includes(kw))
  return hasLuxury && hasEvent
}

function parseItems(xml: string): { title: string; link: string; description: string; pubDate: string }[] {
  const parser = new XMLParser({ ignoreAttributes: false })
  const parsed = parser.parse(xml)

  let items = parsed?.rss?.channel?.item
  if (!items) items = parsed?.feed?.entry
  if (!items) return []
  if (!Array.isArray(items)) items = [items]

  return items.map((item: any) => ({
    title: item.title || '',
    link: item.link?.['@_href'] || item.link || '',
    description: item.description || item.summary || item.content || '',
    pubDate: item.pubDate || item.published || item.updated || '',
  })).filter((i: any) => i.link)
}

async function structureEventWithLuxai(sourceName: string, title: string, link: string, description: string) {
  if (!process.env.ANTHROPIC_API_KEY) return null

  const prompt = `You are a luxury industry event curator for JOBLUX. Structure this news item into a luxury industry event listing.

Source: ${sourceName}
Title: ${title}
URL: ${link}
Summary: ${description.substring(0, 500)}

If this describes a real upcoming event, extract or infer the details below.
If this is NOT about a specific event (just general news), return {"skip": true}.

Return ONLY valid JSON (no markdown):
{
  "name": "Event name [max 80 chars]",
  "title": "Full title [max 100 chars]",
  "sector": "Fashion|Watches & Jewellery|Art & Culture|Hospitality|Business|Automotive & Yachts|Beauty|Real Estate",
  "city": "City name",
  "country": "Country name",
  "slug": "url-friendly-slug-from-event-name",
  "start_date": "YYYY-MM-DD (REQUIRED — see rules below)",
  "end_date": "YYYY-MM-DD or null",
  "description": "What this event is and why it matters for luxury professionals [max 300 chars]",
  "long_description": "200-400 word editorial overview: history, significance, what to expect, key attendees",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "brands_present": ["Brand1", "Brand2"],
  "career_opportunities": ["opportunity 1", "opportunity 2"],
  "networking_tips": ["tip 1", "tip 2"],
  "career_context": "Why luxury professionals should attend [max 200 chars]",
  "organizer": "Organizer name or null",
  "attendance": "Estimated attendance or null",
  "type": "trade_show|fashion_week|conference|exhibition|awards|summit",
  "website_url": "${link}",
  "meta_title": "Event Name | City | JOBLUX Events",
  "meta_description": "150-char SEO description"
}

RULES:
- You MUST extract or infer start_date. If the article mentions a month and year but no exact day, use the 1st of that month (e.g. "June 2026" → "2026-06-01"). If only a year is mentioned, use January 1st. Only return null if absolutely no date reference exists.
- Always generate a URL-friendly slug from the event name (lowercase, hyphens, no special chars, max 80 chars).`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) return null

  const data = await response.json()
  const text = data.content?.[0]?.text || ''

  try {
    let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1)
    }
    const parsed = JSON.parse(cleaned)
    if (parsed.skip) return null
    return parsed
  } catch {
    return null
  }
}

export async function POST() {
  try {
    let totalProcessed = 0
    let totalInserted = 0
    let totalSkipped = 0

    for (const source of EVENT_FEEDS) {
      try {
        const feedRes = await fetch(source.feed_url, { next: { revalidate: 0 } })
        if (!feedRes.ok) continue

        const xml = await feedRes.text()
        const items = parseItems(xml)

        let sourceProcessed = 0

        for (const item of items) {
          if (sourceProcessed >= MAX_ITEMS_PER_SOURCE) break
          if (!item.link) { totalSkipped++; continue }

          // Deduplicate by source_url
          const { data: existing } = await supabase
            .from('content_queue')
            .select('id')
            .eq('source_url', item.link)
            .limit(1)

          if (existing && existing.length > 0) { totalSkipped++; continue }

          // Filter for luxury event relevance
          if (!isEventRelevant(item.title, item.description)) { totalSkipped++; continue }

          totalProcessed++
          sourceProcessed++

          // LUXAI structuring
          const structured = await structureEventWithLuxai(source.name, item.title, item.link, item.description)
          if (!structured) { totalSkipped++; continue }

          // Insert into content_queue
          let insertError: any = null
          try {
            const res = await insertLuxaiQueueItem(supabase, {
              content_type: 'event',
              source_type: 'external_feed',
              title: structured.title || structured.name || item.title,
              raw_content: {
                title: item.title,
                link: item.link,
                description: item.description,
                pubDate: item.pubDate,
                source_name: source.name,
                feed_url: source.feed_url,
              },
              processed_content: structured,
              source_name: source.name,
              source_url: item.link,
              byline: source.name,
              category: structured.sector,
              target_surfaces: ['events', 'homepage'],
              destination_table: 'events',
            })
            insertError = res.error
          } catch (e: any) {
            if (e instanceof QueueValidationError) {
              console.error(`[Events RSS] Validation failed for "${item.title}":`, e.message)
              totalSkipped++
              continue
            }
            throw e
          }

          if (insertError) {
            console.error(`[Events RSS] Insert failed for "${item.title}":`, insertError.message)
            totalSkipped++
          } else {
            totalInserted++
          }
        }
      } catch (err: any) {
        console.error(`[Events RSS] Source "${source.name}" failed:`, err.message)
      }
    }

    return NextResponse.json({
      success: true,
      processed: totalProcessed,
      inserted: totalInserted,
      skipped: totalSkipped,
    })
  } catch (error: any) {
    console.error('[Events RSS] Fatal error:', error.message)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
