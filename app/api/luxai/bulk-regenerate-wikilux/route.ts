import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { slugs } = body as { slugs?: string[] }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    let brandsToProcess: { slug: string; brand_name: string }[] = []

    if (slugs && slugs.length > 0) {
      // Regen specific slugs
      const { data, error } = await supabase
        .from('wikilux_content')
        .select('slug, brand_name')
        .in('slug', slugs)
        .order('slug')

      if (error) throw error
      brandsToProcess = data || []
    } else {
      // Regen all drafts with empty content
      const { data, error } = await supabase
        .from('wikilux_content')
        .select('slug, brand_name')
        .eq('is_published', false)
        .or('content.is.null,content.eq.{}')
        .order('slug')

      if (error) throw error
      brandsToProcess = data || []
    }

    if (brandsToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No brands to process',
        data: { processed: 0, succeeded: 0, failed: [] }
      })
    }

    const total = brandsToProcess.length
    let succeeded = 0
    const failed: { brand_name: string; error: string }[] = []

    // Process in batches of 15
    const BATCH_SIZE = 15

    for (let i = 0; i < brandsToProcess.length; i += BATCH_SIZE) {
      const batch = brandsToProcess.slice(i, i + BATCH_SIZE)

      for (const brand of batch) {
        try {
          const content = await callClaude(brand.brand_name)

          const { error: updateError } = await supabase
            .from('wikilux_content')
            .update({
              content: content.content,
              status: 'approved',
              is_published: true,
              last_regenerated_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('slug', brand.slug)

          if (updateError) throw updateError

          await supabase.from('luxai_history').insert({
            type: 'wikilux_regeneration',
            model: 'claude-haiku-4-5-20251001',
            prompt: `Bulk regen WikiLux content for ${brand.brand_name}`,
            response: { slug: brand.slug, brand_name: brand.brand_name },
            tokens_used: content.tokens,
            cost_usd: content.cost,
            status: 'success'
          })

          succeeded++
          console.log(`[BULK-REGEN] ✓ ${brand.brand_name} (${succeeded + failed.length}/${total})`)
        } catch (e: any) {
          console.error(`[BULK-REGEN] ✗ ${brand.brand_name}: ${e.message}`)
          failed.push({ brand_name: brand.brand_name, error: e.message })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Regenerated ${succeeded}/${total} brands${failed.length > 0 ? ` (${failed.length} failed)` : ''}`,
      data: {
        processed: total,
        succeeded,
        failed
      }
    })
  } catch (error: any) {
    console.error('[BULK-REGEN] Fatal error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

async function callClaude(brandName: string) {
  const prompt = `You are a luxury industry analyst writing for JOBLUX, a luxury careers intelligence platform. Generate encyclopedic content for ${brandName}.

Return ONLY a JSON object (no markdown, no explanation, no backticks) with this EXACT structure. Every field is MANDATORY | do not skip any.

CRITICAL: Each prose field has a STRICT CHARACTER LIMIT shown in brackets [max N chars]. Count characters carefully. If a field exceeds its limit, truncate it. This is a hard layout constraint.

{
  "tagline": "One sentence capturing the brand's essence [max 80 chars]",
  "brand_dna": "Brand identity analysis | codes, position, what makes it unique [max 500 chars]",
  "history": [
    {"year": "1837", "event": "One-sentence milestone [max 120 chars per event]"}
  ],
  "founder_name": "Full name of the founder",
  "founder": "Founder biography | birth, origins, how they started, legacy [max 500 chars]",
  "founder_facts": [
    "Short fact [max 80 chars each]",
    "Second fact",
    "Third fact",
    "Fourth fact",
    "Fifth fact"
  ],
  "key_facts": [
    {"label": "Founded", "value": "1837"},
    {"label": "Headquarters", "value": "Paris"},
    {"label": "Employees", "value": "~20,000"},
    {"label": "Revenue", "value": "$14.6B (2024)"},
    {"label": "Ownership", "value": "Family / Public / Conglomerate"}
  ],
  "key_executives": [
    {"name": "Full Name", "role": "CEO", "since": "2013"},
    {"name": "Full Name", "role": "Creative Director", "since": "2020"}
  ],
  "creative_directors": "History of creative leadership | past and present directors, impact [max 400 chars]",
  "careers": {
    "prose": "What it's like to work here | culture, pace, reputation [max 300 chars]",
    "paths": ["Retail & boutique management", "Artisan & métiers", "Marketing & communications", "Digital & e-commerce", "Finance & strategy", "Supply chain"]
  },
  "hiring_intelligence": {
    "values": [
      {"title": "Craftsmanship", "desc": "One sentence [max 80 chars]"},
      {"title": "Independence", "desc": "One sentence [max 80 chars]"},
      {"title": "Creativity", "desc": "One sentence [max 80 chars]"},
      {"title": "Discretion", "desc": "One sentence [max 80 chars]"}
    ],
    "culture": "Internal work culture | atmosphere, sentiment, turnover [max 250 chars]",
    "growth": "Career growth | expansion, mobility, training [max 250 chars]",
    "pace": "Work pace | fast/slow, bureaucratic/agile, work-life balance [max 250 chars]",
    "access": "How to get hired | competitiveness, networking, interview process [max 250 chars]"
  },
  "quote": {
    "text": "A real, verifiable quote from the founder or creative director [max 120 chars]",
    "author": "Full Name, Title"
  },
  "market_position": "Competitive positioning | peers, strengths, market segment [max 400 chars]",
  "presence": [
    {"region": "Europe", "detail": "Headquarters + N boutiques"},
    {"region": "Asia Pacific", "detail": "N boutiques, strongest in..."},
    {"region": "North America", "detail": "N boutiques"}
  ],
  "facts": [
    "Brand trivia [max 80 chars each]",
    "Second fact",
    "Third fact",
    "Fourth fact",
    "Fifth fact",
    "Sixth fact"
  ],
  "stock": {
    "is_public": true,
    "exchange": "EPA",
    "ticker": "RMS",
    "parent_group": "Independent",
    "market_cap": "€220B"
  }
}

RULES:
- CHARACTER LIMITS ARE HARD CONSTRAINTS. Do not exceed them. Shorter is better.
- ALL 16 fields are MANDATORY. Do not omit any, especially hiring_intelligence.access.
- history: 7-10 milestones, real years, real events.
- key_executives: 3-5 current executives with real names and years.
- careers.paths: 6-8 departments relevant to this brand.
- hiring_intelligence.values: Exactly 4. Short title + one sentence each.
- quote: Real, verifiable quote only.
- stock.is_public: false for private companies | set exchange/ticker/market_cap to null.
- Encyclopedic, factual tone. No marketing language.
- Output valid JSON only. No markdown. No backticks. No explanation.`

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

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${error}`)
  }

  const data = await response.json()
  const text = data.content[0].text
  const stopReason = data.stop_reason

  if (stopReason === 'max_tokens') {
    throw new Error(`Output truncated (hit max_tokens). stop_reason=${stopReason}, output_tokens=${data.usage.output_tokens}`)
  }

  let content
  try {
    // Strip markdown backticks if present
    let cleaned = text.trim()
    cleaned = cleaned.replace(/^```(?:json|JSON)?\s*\n?/, '')
    cleaned = cleaned.replace(/\n?```\s*$/, '')
    cleaned = cleaned.trim()

    // Find JSON boundaries — object first, fall back to array
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    const firstBracket = cleaned.indexOf('[')
    const lastBracket = cleaned.lastIndexOf(']')

    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1)
    } else if (firstBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1)
    }

    content = JSON.parse(cleaned)
  } catch (e: any) {
    console.error(`[BULK-REGEN] Raw text for ${brandName}:`, text.substring(0, 300))
    const preview = text.substring(0, 100)
    const ending = text.substring(Math.max(0, text.length - 100))
    throw new Error(`JSON parse failed. stop_reason=${stopReason}, len=${text.length}, start="${preview}", end="${ending}", parseError=${e.message}`)
  }

  const inputTokens = data.usage.input_tokens
  const outputTokens = data.usage.output_tokens
  const cost = (inputTokens * 1.00 / 1000000) + (outputTokens * 5.00 / 1000000)

  return { content, tokens: inputTokens + outputTokens, cost }
}
