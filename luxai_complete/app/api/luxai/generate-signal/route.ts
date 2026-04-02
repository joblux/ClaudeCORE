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
    const prompt = `You are LUXAI, the luxury industry intelligence engine for JOBLUX — a careers platform.

Generate ONE realistic luxury industry signal (news/intelligence) for today (${new Date().toLocaleDateString()}).

Choose ONE of these categories:
- TALENT: Leadership appointments, exits, team moves
- MARKET: Earnings, sales data, market trends
- BRAND: New products, campaigns, partnerships
- FINANCE: Acquisitions, investments, stock movements

Respond ONLY in JSON format:
{
  "category": "TALENT",
  "title": "Hermès appoints former Chanel exec as new Chief People Officer",
  "content": "Hermès has appointed Marie Dubois, formerly VP of Talent at Chanel, as its new Chief People Officer. Dubois spent 12 years at Chanel, most recently leading global talent acquisition and development. The move signals Hermès' continued investment in leadership development as the maison scales its retail footprint. Dubois will report directly to CEO Axel Dumas and joins the executive committee. Industry sources suggest the appointment reflects growing competition for C-suite talent among LVMH, Kering, and independent luxury houses."
}

Guidelines:
- Must be realistic and plausible for luxury industry
- Include specific names, brands, numbers, dates
- 80-120 words
- Professional Bloomberg-style tone
- Focus on: LVMH brands, Kering brands, Richemont, Hermès, Chanel, independent maisons
- Make it feel current and newsy`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-3-5-20241022',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from response')
    }

    const result = JSON.parse(jsonMatch[0])
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

    // Add to queue
    await supabase.from('luxai_queue').insert({
      type: 'signal',
      content_type: result.category,
      title: result.title,
      content: { content: result.content },
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
