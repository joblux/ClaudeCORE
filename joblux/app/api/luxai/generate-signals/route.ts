import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { count = 5 } = await req.json()

    // Check if ANTHROPIC_API_KEY is set
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'ANTHROPIC_API_KEY not configured in environment variables'
      }, { status: 500 })
    }

    // Check settings
    const { data: settingsData } = await supabase
      .from('luxai_settings')
      .select('*')
    
    const settings: Record<string, any> = {}
    settingsData?.forEach(item => { settings[item.key] = item.value })

    // Check if generation is enabled
    if (!settings.signal_generation_enabled) {
      return NextResponse.json({ 
        success: false, 
        error: 'Signal generation is disabled in settings' 
      }, { status: 400 })
    }

    // Check daily limit
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: todaySignals } = await supabase
      .from('luxai_queue')
      .select('id')
      .eq('type', 'signal')
      .gte('generated_at', today.toISOString())
    
    const generatedToday = todaySignals?.length || 0
    const dailyTarget = settings.signal_daily_target || 6
    
    if (generatedToday >= dailyTarget) {
      return NextResponse.json({ 
        success: false, 
        error: `Daily limit reached (${generatedToday}/${dailyTarget})` 
      }, { status: 400 })
    }

    // Generate signals using Claude Haiku 3.5
    const signals = []
    
    for (let i = 0; i < Math.min(count, dailyTarget - generatedToday); i++) {
      const prompt = `Generate a luxury industry news signal. Focus on executive moves, brand launches, financial earnings, or market trends from major luxury houses (LVMH, Kering, Richemont, Hermès, Chanel, Prada, Burberry, etc).

Return ONLY a JSON object with this exact structure:
{
  "category": "TALENT" | "MARKET" | "BRAND" | "FINANCE",
  "title": "Headline (80-100 characters)",
  "content": "Signal content (80-120 words, Bloomberg-style professional tone)"
}

Make it realistic, timely, and career-relevant for luxury professionals. No JSON formatting, just the raw object.`

      const startTime = Date.now()
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: settings.model || 'claude-haiku-3-5-20241022',
          max_tokens: settings.max_tokens || 2000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`)
      }

      const data = await response.json()
      const responseText = data.content[0].text
      
      // Parse JSON response
      let signalData
      try {
        signalData = JSON.parse(responseText)
      } catch (e) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/)
        if (jsonMatch) {
          signalData = JSON.parse(jsonMatch[1])
        } else {
          throw new Error('Failed to parse AI response as JSON')
        }
      }

      // Calculate cost (approximate)
      const tokensUsed = data.usage.input_tokens + data.usage.output_tokens
      const costPer1kTokens = 0.00025 // Claude Haiku 3.5 pricing
      const costUsd = (tokensUsed / 1000) * costPer1kTokens

      // Log to luxai_history
      await supabase.from('luxai_history').insert({
        type: 'signal',
        model: settings.model || 'claude-haiku-3-5-20241022',
        prompt,
        response: signalData,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        status: 'success',
        created_at: new Date().toISOString()
      })

      // Save to luxai_queue
      const { data: queueItem } = await supabase
        .from('luxai_queue')
        .insert({
          type: 'signal',
          content_type: signalData.category,
          title: signalData.title,
          content: signalData.content,
          status: 'pending',
          generated_at: new Date().toISOString()
        })
        .select()
        .single()

      signals.push(queueItem)
    }

    return NextResponse.json({ 
      success: true, 
      count: signals.length,
      signals,
      generated_today: generatedToday + signals.length,
      daily_target: dailyTarget
    })

  } catch (error: any) {
    console.error('Signal generation error:', error)
    
    // Log error to history
    await supabase.from('luxai_history').insert({
      type: 'signal',
      model: 'claude-haiku-3-5-20241022',
      status: 'error',
      error_message: error.message,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to generate signal' 
    }, { status: 500 })
  }
}
