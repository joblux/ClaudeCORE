import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Check if signal generation is enabled
    const { data: settings } = await supabase
      .from('luxai_settings')
      .select('value')
      .eq('key', 'signal_generation_enabled')
      .maybeSingle()

    if (settings?.value === false) {
      return NextResponse.json({ error: 'Signal generation disabled' }, { status: 403 })
    }

    // Get daily target
    const { data: targetSettings } = await supabase
      .from('luxai_settings')
      .select('value')
      .eq('key', 'signal_daily_target')
      .maybeSingle()

    const dailyTarget = parseInt(targetSettings?.value || '6')

    // Check how many signals generated today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('luxai_queue')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'signal')
      .gte('generated_at', today.toISOString())

    if (count && count >= dailyTarget) {
      return NextResponse.json({
        message: `Daily target of ${dailyTarget} signals already reached`,
        generated_today: count
      })
    }

    // Generate signal
    const prompt = `You are LUXAI, the luxury industry intelligence engine for JOBLUX | a careers platform.

Generate ONE realistic luxury industry signal (news/intelligence) for today (${new Date().toLocaleDateString()}).

Choose ONE of these categories:
- TALENT: Leadership appointments, exits, team moves
- MARKET: Earnings, sales data, market trends
- BRAND: New products, campaigns, partnerships
- FINANCE: Acquisitions, investments, stock movements

Respond ONLY in JSON format (no markdown backticks):
{
  "category": "TALENT",
  "title": "Hermès appoints former Chanel exec as new Chief People Officer",
  "content": "Summary paragraph, 80-120 words, Bloomberg-style tone",
  "what_happened": "A clear, factual 1-2 sentence summary of the event itself",
  "why_it_matters": "2-3 sentences explaining significance for the luxury industry and professionals",
  "long_context": "A 150-250 word deep analysis providing full context: market dynamics, historical precedent, competitive implications, and what this signals about broader trends in luxury",
  "career_detail": [
    "Specific career implication #1 for luxury professionals",
    "Specific career implication #2",
    "Specific career implication #3"
  ],
  "brand_impact": [
    "Impact on brand/group #1",
    "Impact on competitor or related brand #2",
    "Wider sector impact #3"
  ],
  "meta_title": "Signal headline | JOBLUX Signals",
  "meta_description": "150-char SEO description summarising the signal and its career implications"
}

Guidelines:
- Must be realistic and plausible for luxury industry
- Include specific names, brands, numbers, dates
- content: 80-120 words, professional Bloomberg-style tone
- what_happened: factual, concise
- why_it_matters: analytical, career-focused
- long_context: thorough, editorial depth
- career_detail: 3-5 actionable items for luxury professionals
- brand_impact: 3-5 items on affected brands/groups
- Focus on: LVMH brands, Kering brands, Richemont, Hermès, Chanel, independent maisons
- Make it feel current and newsy`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-3-5-20241022',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Strip markdown backticks and find JSON
    const cleaned = content.text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
    const first = cleaned.indexOf('{')
    const last = cleaned.lastIndexOf('}')
    if (first === -1 || last <= first) {
      throw new Error('Failed to parse JSON from response')
    }

    const result = JSON.parse(cleaned.substring(first, last + 1))
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens
    const costUsd = (message.usage.input_tokens * 0.0000008) + (message.usage.output_tokens * 0.000004)

    // Log to history
    await supabase.from('luxai_history').insert({
      type: 'signal',
      model: 'claude-haiku-3-5-20241022',
      prompt,
      response: result,
      tokens_used: tokensUsed,
      cost_usd: costUsd,
      status: 'success',
    })

    // Add to queue with full rich content
    await supabase.from('luxai_queue').insert({
      type: 'signal',
      content_type: result.category,
      title: result.title,
      content: {
        content: result.content,
        what_happened: result.what_happened,
        why_it_matters: result.why_it_matters,
        long_context: result.long_context,
        career_detail: result.career_detail,
        brand_impact: result.brand_impact,
        meta_title: result.meta_title,
        meta_description: result.meta_description,
      },
      status: 'pending',
    })

    return NextResponse.json({
      success: true,
      signal: result,
      generated_today: (count || 0) + 1,
      daily_target: dailyTarget,
    })

  } catch (error) {
    console.error('LUXAI Signal Generator error:', error)

    await supabase.from('luxai_history').insert({
      type: 'signal',
      model: 'claude-haiku-3-5-20241022',
      prompt: 'Signal generation failed',
      response: {},
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Failed to generate signal' },
      { status: 500 }
    )
  }
}
