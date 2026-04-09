import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { XMLParser } from 'fast-xml-parser'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const LUXURY_KEYWORDS = [
  'luxury', 'lvmh', 'kering', 'richemont', 'hermès', 'hermes', 'chanel', 'dior',
  'gucci', 'prada', 'burberry', 'cartier', 'tiffany', 'rolex', 'fashion', 'retail',
  'executive', 'ceo', 'creative director', 'acquisition', 'expansion', 'hiring',
]

const MAX_ITEMS_PER_SOURCE = 5

function isLuxuryRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  return LUXURY_KEYWORDS.some(kw => text.includes(kw))
}

function parseItems(xml: string): { title: string; link: string; description: string; pubDate: string }[] {
  const parser = new XMLParser({ ignoreAttributes: false })
  const parsed = parser.parse(xml)

  // RSS 2.0: rss.channel.item
  let items = parsed?.rss?.channel?.item
  // Atom: feed.entry
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

async function structureWithLuxai(sourceName: string, title: string, link: string, description: string) {
  if (!process.env.ANTHROPIC_API_KEY) return null

  const prompt = `You are a luxury industry intelligence analyst for JOBLUX. Structure this news item into a signal.

Source: ${sourceName}
Title: ${title}
URL: ${link}
Summary: ${description.substring(0, 500)}

Return ONLY valid JSON (no markdown):
{
  "headline": "Headline that accurately reflects the source article, max 80 chars",
  "category": "growth|leadership|contraction|expansion|merger_acquisition",
  "context_paragraph": "2-3 sentences: what happened and the immediate facts. Max 300 chars.",
  "strategic_read": "1 tight paragraph: what this development may suggest, based only on what the source article states. Max 400 chars.",
  "career_implications": "2-3 sentences: what career or talent implications this may suggest, if the source indicates any. Max 250 chars.",
  "brand_tags": ["BrandName1"],
  "confidence": "high|medium"
}

RULES:
- Summarize only what the source article actually states — do not add context not present in the source
- Use restrained claim language: suggests, indicates, may imply, according to this source
- Do not present speculative implications as confirmed facts
- If the source does not mention career implications, leave career_implications brief and clearly framed as contextual
- confidence: use "high" only when the source is explicit and specific; use "medium" when interpretation is limited; never use confidence to justify unsupported claims`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
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
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

export async function POST() {
  try {
    // Step 1 — Fetch active RSS sources
    const { data: sources } = await supabase
      .from('rss_sources')
      .select('id, name, feed_url')
      .eq('is_active', true)

    if (!sources || sources.length === 0) {
      return NextResponse.json({ success: true, processed: 0, inserted: 0, skipped: 0, message: 'No active RSS sources' })
    }

    let totalProcessed = 0
    let totalInserted = 0
    let totalSkipped = 0

    for (const source of sources) {
      try {
        // Step 2 — Fetch and parse RSS feed
        const feedRes = await fetch(source.feed_url, { next: { revalidate: 0 } })
        if (!feedRes.ok) continue

        const xml = await feedRes.text()
        const items = parseItems(xml)

        let sourceProcessed = 0

        for (const item of items) {
          if (sourceProcessed >= MAX_ITEMS_PER_SOURCE) break
          if (!item.link) { totalSkipped++; continue }

          // Step 3 — Deduplicate
          const { data: existing } = await supabase
            .from('content_queue')
            .select('id')
            .eq('source_url', item.link)
            .limit(1)

          if (existing && existing.length > 0) { totalSkipped++; continue }

          // Step 4 — Filter for luxury relevance
          if (!isLuxuryRelevant(item.title, item.description)) { totalSkipped++; continue }

          totalProcessed++
          sourceProcessed++

          // Step 5 — LUXAI structuring
          const structured = await structureWithLuxai(source.name, item.title, item.link, item.description)
          if (!structured) { totalSkipped++; continue }

          // Step 6 — Insert into content_queue
          const { error: insertError } = await supabase.from('content_queue').insert({
            content_type: 'signal',
            source_type: 'external_feed',
            title: structured.headline || item.title,
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
            category: structured.category,
            brand_tags: structured.brand_tags,
            target_surfaces: ['signals', 'homepage'],
            status: 'draft',
          })

          if (insertError) {
            console.error(`[RSS ingest] Insert failed for "${item.title}":`, insertError.message)
            totalSkipped++
          } else {
            totalInserted++
          }
        }

        // Step 7 — Update last_fetched_at
        await supabase
          .from('rss_sources')
          .update({ last_fetched_at: new Date().toISOString() })
          .eq('id', source.id)

      } catch (err: any) {
        console.error(`[RSS ingest] Source "${source.name}" failed:`, err.message)
      }
    }

    return NextResponse.json({
      success: true,
      processed: totalProcessed,
      inserted: totalInserted,
      skipped: totalSkipped,
    })
  } catch (error: any) {
    console.error('[RSS ingest] Fatal error:', error.message)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
