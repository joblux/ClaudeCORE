import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    let body: any = {}
    try { body = await request.json() } catch {}
    const { brand_slugs = [] } = body

    // Fetch brands
    let query = supabase
      .from('wikilux_content')
      .select('slug, brand_name, content')
      .eq('is_published', true)
      .is('deleted_at', null)

    if (brand_slugs.length > 0) {
      query = query.in('slug', brand_slugs)
    }

    const { data: brands, error: brandsError } = await query.order('brand_name')
    if (brandsError) throw new Error(`Failed to fetch brands: ${brandsError.message}`)
    if (!brands || brands.length === 0) {
      return NextResponse.json({ success: true, processed: 0, written: 0, skipped: 0, results: [] })
    }

    const results: any[] = []
    let written = 0
    let skipped = 0

    for (const brand of brands) {
      const brandName = brand.brand_name || ''
      const content = brand.content || {}
      const stock = content.stock || {}

      // Find most recent published signal tagged to this brand (90-day window)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      const { data: sigData } = await supabase
        .from('signals')
        .select('id, category, what_happened, published_at, brand_tags')
        .eq('is_published', true)
        .contains('brand_tags', [brandName])
        .gte('published_at', ninetyDaysAgo)
        .order('published_at', { ascending: false })
        .limit(1)

      const sig = sigData?.[0] || null

      const signalCategory = sig?.category || 'none'
      const signalText = sig?.what_happened ? sig.what_happened.slice(0, 500) : 'none'
      const signalId = sig?.id || 'none'
      const isPublic = stock.is_public ?? stock.listed ?? false
      const ticker = stock.ticker || 'none'

      // Short-circuit: no signal and no meaningful market data
      if (!sig && ticker === 'none') {
        results.push({ brand: brandName, marker: null, confidence: null, status: 'skipped', reason: 'no_source' })
        skipped++
        await supabase.from('luxai_history').insert({
          type: 'card_intelligence',
          model: 'claude-haiku-4-5-20251001',
          prompt: `Enrich card intelligence: ${brandName}`,
          response: { reason: 'no_source' },
          tokens_used: 0,
          cost_usd: 0,
          status: 'skipped_no_source'
        })
        continue
      }

      // Stale write guard
      const existingIntel = content.card_intelligence
      if (existingIntel?.updated_at && sig?.published_at) {
        const existingTs = new Date(existingIntel.updated_at).getTime()
        const signalTs = new Date(sig.published_at).getTime()
        if (!Number.isNaN(existingTs) && !Number.isNaN(signalTs) && existingTs > signalTs) {
          results.push({ brand: brandName, marker: existingIntel.marker || null, confidence: existingIntel.confidence || null, status: 'skipped', reason: 'stale' })
          skipped++
          await supabase.from('luxai_history').insert({
            type: 'card_intelligence',
            model: 'claude-haiku-4-5-20251001',
            prompt: `Enrich card intelligence: ${brandName}`,
            response: { reason: 'stale', existing_updated_at: existingIntel.updated_at, signal_published_at: sig.published_at },
            tokens_used: 0,
            cost_usd: 0,
            status: 'skipped_stale'
          })
          continue
        }
      }

      // Category-only fallback: signal exists with category but no what_happened
      const isCategoryOnly = sig && sig.category && (!sig.what_happened || !sig.what_happened.trim())

      const prompt = isCategoryOnly
        ? `You are a luxury market intelligence system.
Output a card_intelligence JSON object using category only.

RULES (STRICT):
- marker: max 3 words, qualitative label only, no numbers, no invented facts
- derive marker from category using these mappings:
  expansion → Expanding
  growth → Strong performance
  leadership → Leadership move
  contraction → Contracting
  merger_acquisition → M&A activity
- Return ONLY valid JSON. No markdown. No preamble.

Input:
Brand: ${brandName}
Signal category: ${signalCategory}

Output format:
{
  "marker": "string or null",
  "marker_type": "growth|expansion|leadership|contraction|merger_acquisition|stable|none",
  "confidence": "medium",
  "source": "signal",
  "source_ref": "signal:${signalId}"
}`
        : `You are a luxury market intelligence system.
Given brand data, output a card_intelligence JSON object.

RULES (STRICT):
- marker: max 6 words, no full sentences, no punctuation at end
- numbers first when present explicitly in the input — never invent numbers
- if signal text mentions multiple brands or a group result without a clear brand-specific takeaway, prefer a qualitative group-safe marker and lower confidence to "medium"
- if signal is vague, weak, or prose-heavy without extractable facts: set marker to null and confidence to "low"
- marker_type: growth | expansion | leadership | contraction | merger_acquisition | stable | none
- source: "signal" if derived from signal, "market" if from stock data only, "none" if fallback
- Return ONLY valid JSON. No markdown. No preamble.

Input:
Brand: ${brandName}
Signal category: ${signalCategory}
Signal text: ${signalText}
Public: ${isPublic}
Ticker: ${ticker}
Signal ID: ${signalId}

Output format:
{
  "marker": "string or null",
  "marker_type": "growth|expansion|leadership|contraction|merger_acquisition|stable|none",
  "confidence": "high|medium|low",
  "source": "signal|market|none",
  "source_ref": "signal:{uuid} or stock_snapshot or none"
}`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error(`[LUXAI card-intel] API error for ${brandName}:`, errText)
        results.push({ brand: brandName, marker: null, confidence: null, status: 'error' })
        skipped++
        await supabase.from('luxai_history').insert({
          type: 'card_intelligence',
          model: 'claude-haiku-4-5-20251001',
          prompt: `Enrich card intelligence: ${brandName}`,
          response: { error: errText.substring(0, 500) },
          tokens_used: 0,
          cost_usd: 0,
          status: 'error_api'
        })
        continue
      }

      const data = await response.json()
      const text = data.content[0].text
      const inputTokens = data.usage.input_tokens
      const outputTokens = data.usage.output_tokens
      const cost = (inputTokens * 1.00 / 1000000) + (outputTokens * 5.00 / 1000000)

      // Parse JSON — strip markdown backticks if present
      let parsed: any
      try {
        let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
        const firstBrace = cleaned.indexOf('{')
        const lastBrace = cleaned.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1)
        }
        parsed = JSON.parse(cleaned)
      } catch (e: any) {
        console.error(`[LUXAI card-intel] JSON parse failed for ${brandName}:`, text.substring(0, 200))
        results.push({ brand: brandName, marker: null, confidence: null, status: 'error' })
        skipped++
        await supabase.from('luxai_history').insert({
          type: 'card_intelligence',
          model: 'claude-haiku-4-5-20251001',
          prompt: `Enrich card intelligence: ${brandName}`,
          response: { error: `JSON parse failed: ${e.message}`, raw: text.substring(0, 200) },
          tokens_used: inputTokens + outputTokens,
          cost_usd: cost,
          status: 'error_parse'
        })
        continue
      }

      // Override source_ref — do not trust model output
      if (parsed.source === 'signal' && signalId !== 'none') {
        parsed.source_ref = `signal:${signalId}`
      } else if (parsed.source === 'market') {
        parsed.source_ref = 'stock_snapshot'
      } else {
        parsed.source_ref = 'none'
      }

      // Category-only path: force confidence/source overrides
      if (isCategoryOnly && parsed.marker !== null) {
        parsed.confidence = 'medium'
        parsed.source = 'signal'
        parsed.source_ref = `signal:${signalId}`
      }

      // Confidence gate
      if (parsed.confidence === 'low' || parsed.marker === null) {
        console.log(`[LUXAI card-intel] Skipped ${brandName}: confidence=${parsed.confidence}, marker=${parsed.marker}`)
        results.push({ brand: brandName, marker: parsed.marker, confidence: parsed.confidence, status: 'skipped' })
        skipped++

        await supabase.from('luxai_history').insert({
          type: 'card_intelligence',
          model: 'claude-haiku-4-5-20251001',
          prompt: `Enrich card intelligence: ${brandName}`,
          response: parsed,
          tokens_used: inputTokens + outputTokens,
          cost_usd: cost,
          status: 'skipped'
        })
        continue
      }

      // Write card_intelligence into content JSONB
      const updatedContent = {
        ...content,
        card_intelligence: {
          marker: parsed.marker,
          marker_type: parsed.marker_type,
          confidence: parsed.confidence,
          source: parsed.source,
          source_ref: parsed.source_ref,
          updated_at: new Date().toISOString(),
        }
      }

      const { error: updateError } = await supabase
        .from('wikilux_content')
        .update({ content: updatedContent })
        .eq('slug', brand.slug)

      if (updateError) {
        console.error(`[LUXAI card-intel] Write failed for ${brandName}:`, updateError.message)
        results.push({ brand: brandName, marker: parsed.marker, confidence: parsed.confidence, status: 'error' })
        skipped++
      } else {
        results.push({ brand: brandName, marker: parsed.marker, confidence: parsed.confidence, status: 'written' })
        written++
      }

      await supabase.from('luxai_history').insert({
        type: 'card_intelligence',
        model: 'claude-haiku-4-5-20251001',
        prompt: `Enrich card intelligence: ${brandName}`,
        response: parsed,
        tokens_used: inputTokens + outputTokens,
        cost_usd: cost,
        status: updateError ? 'error' : 'success'
      })
    }

    return NextResponse.json({
      success: true,
      processed: brands.length,
      written,
      skipped,
      results,
    })
  } catch (error: any) {
    console.error('[LUXAI card-intel] Fatal error:', error)
    await supabase.from('luxai_history').insert({
      type: 'card_intelligence',
      model: 'claude-haiku-4-5-20251001',
      prompt: 'Enrich card intelligence',
      response: { error: error.message },
      tokens_used: 0,
      cost_usd: 0,
      status: 'error'
    }).then(() => {})
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
