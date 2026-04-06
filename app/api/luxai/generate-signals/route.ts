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

    const prompt = `You are a luxury industry intelligence analyst for JOBLUX. Generate ${count} luxury industry intelligence signals. These are JOBLUX Intelligence draft items, not press clippings. Do not attribute to any external publication.

Each signal must be about a REAL luxury brand or group (LVMH, Kering, Hermès, Chanel, Richemont, Prada, Burberry, Cartier, Dior, Gucci, Rolex, Tiffany, etc.)

Return ONLY a JSON array (no markdown, no backticks):
[
  {
    "category": "growth" | "leadership" | "contraction" | "expansion" | "merger_acquisition",
    "headline": "Short punchy headline [max 80 chars]",
    "context_paragraph": "2-3 sentences of context explaining the signal [max 300 chars]",
    "career_implications": "1-2 sentences on what this means for luxury professionals [max 200 chars]",
    "long_context": "A detailed 150-250 word editorial analysis. Cover the background, what triggered this signal, the strategic context, and what industry observers are noting. Write in an authoritative, precise editorial tone.",
    "what_happened": "One clear sentence describing the event or development [max 150 chars]",
    "why_it_matters": "One clear sentence on the broader industry significance [max 150 chars]",
    "career_detail": ["Specific career impact #1", "Specific career impact #2", "Specific career impact #3"],
    "brand_impact": ["Impact on brand/group #1", "Impact on brand/group #2", "Impact on brand/group #3"],
    "brand_tags": ["BrandName1", "BrandName2"],
    "confidence": "high" | "medium",
    "meta_title": "Headline — Category Signal | JOBLUX Signals",
    "meta_description": "150-char SEO description summarizing the signal and its career implications"
  }
]

CATEGORIES (use exactly these lowercase values):
- growth: revenue increases, record results, market gains (green dot)
- leadership: C-suite changes, creative director moves, board reshuffles (amber dot)
- contraction: layoffs, store closures, declining revenue, cost cuts (red dot)
- expansion: new stores, new markets, geographic growth, new product lines (blue dot)
- merger_acquisition: M&A activity, acquisitions, mergers, stake purchases (purple dot)

RULES:
- ${count} signals exactly
- Mix of categories: use at least 3 different categories
- brand_tags: use exact brand names (Cartier not cartier)
- career_detail: 2-4 specific career impacts as string array
- brand_impact: 2-4 specific brand/group impacts as string array
- Plausible signals based on real industry dynamics
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
    const inputTokens = data.usage.input_tokens
    const outputTokens = data.usage.output_tokens
    const cost = (inputTokens * 1.00 / 1000000) + (outputTokens * 5.00 / 1000000)

    console.log('[LUXAI signals] Raw Claude response:', text.substring(0, 500))

    let signals
    try {
      // Strip markdown backticks if present
      let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()

      // Try array first (signals return [...]), fall back to object
      const firstBracket = cleaned.indexOf('[')
      const lastBracket = cleaned.lastIndexOf(']')
      const firstBrace = cleaned.indexOf('{')
      const lastBrace = cleaned.lastIndexOf('}')

      if (firstBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1)
      } else if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1)
      }

      signals = JSON.parse(cleaned)

      // Wrap single object in array
      if (!Array.isArray(signals)) {
        signals = [signals]
      }
    } catch (e: any) {
      console.error('[LUXAI signals] Raw text that failed parsing:', text)
      throw new Error(`JSON parse failed: ${e.message} — raw starts with: ${text.substring(0, 200)}`)
    }

    console.log(`[LUXAI signals] Parsed ${signals.length} signals from Claude response`)

    // Insert each signal as pending (unpublished)
    const inserted = []
    const insertErrors = []
    for (const s of signals) {
      const slug = s.headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80)
      const { data: row, error } = await supabase.from('signals').insert({
        category: s.category,
        headline: s.headline,
        context_paragraph: s.context_paragraph,
        career_implications: s.career_implications,
        long_context: s.long_context,
        what_happened: s.what_happened,
        why_it_matters: s.why_it_matters,
        career_detail: s.career_detail,
        brand_impact: s.brand_impact,
        source_name: 'JOBLUX Intelligence',
        source_url: null,
        brand_tags: s.brand_tags,
        confidence: s.confidence,
        meta_title: s.meta_title,
        meta_description: s.meta_description,
        is_published: false,
        content_origin: 'ai',
        is_pinned: false,
        slug
      }).select().maybeSingle()

      if (error) {
        console.error(`[LUXAI signals] Insert failed for "${s.headline}":`, error.message, error.details)
        insertErrors.push({ headline: s.headline, error: error.message })
      } else if (row) {
        inserted.push(row)
      }
    }

    if (insertErrors.length > 0) {
      console.error(`[LUXAI signals] ${insertErrors.length}/${signals.length} inserts failed:`, JSON.stringify(insertErrors))
    }

    // Log to history
    await supabase.from('luxai_history').insert({
      type: 'signal_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate ${count} signals`,
      response: {
        count: inserted.length,
        parsed: signals.length,
        errors: insertErrors.length > 0 ? insertErrors : undefined
      },
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      status: inserted.length > 0 ? 'success' : 'error'
    })

    return NextResponse.json({
      success: inserted.length > 0,
      message: inserted.length > 0
        ? `${inserted.length} signals generated and pending approval`
        : `Parsed ${signals.length} signals but all inserts failed — check logs`,
      data: {
        count: inserted.length,
        parsed: signals.length,
        failed: insertErrors.length,
        cost,
        tokens: inputTokens + outputTokens,
        errors: insertErrors.length > 0 ? insertErrors : undefined
      }
    })
  } catch (error: any) {
    console.error('[LUXAI signals] Fatal error:', error)
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
