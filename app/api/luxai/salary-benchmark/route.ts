import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import {
  insertLuxaiQueueItem,
  QueueValidationError,
  queueValidationErrorResponse,
} from '@/lib/luxai-rules'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { job_title, city, department, seniority, brand, current_salary } = body

    // Build context
    const context = [
      `Job Title: ${job_title}`,
      `City: ${city}`,
      department && `Department: ${department}`,
      seniority && `Seniority: ${seniority}`,
      brand && `Brand: ${brand}`,
      current_salary && `Current Salary: ${current_salary}`,
    ].filter(Boolean).join('\n')

    const prompt = `You are LUXAI, the salary intelligence engine for JOBLUX | a luxury careers platform.

Generate a realistic salary benchmark for the following profile:

${context}

Respond ONLY in JSON format with these exact fields:
{
  "median": "€62K",
  "range": "€48K–78K",
  "percentile": "40th %ile",
  "analysis": "Based on 18 data points for Retail Manager in Paris (Mid-level, Retail). Your salary of €58K is below market median. Consider negotiating for €62K–68K range."
}

Guidelines:
- Use realistic luxury brand salary ranges (Paris €45K-€150K, London £40K-£120K, NYC $60K-$200K)
- Adjust for seniority: Junior (lower 25%), Mid-level (median), Senior (+25%), Director (+50%), VP (+75%), C-Suite (2-3x)
- Premium brands (Hermès, Chanel, LV) pay 10-15% above market
- Include specific data point count (10-30 points)
- If current_salary provided, calculate percentile and give negotiation advice
- Keep analysis under 100 words, factual, actionable`

    // Check cache first
    const promptHash = crypto.createHash('md5').update(prompt).digest('hex')
    const { data: cached } = await supabase
      .from('luxai_cache')
      .select('*')
      .eq('prompt_hash', promptHash)
      .maybeSingle()

    let result
    let tokensUsed = 0
    let costUsd = 0

    if (cached) {
      // Use cached result
      result = cached.response
      await supabase
        .from('luxai_cache')
        .update({ 
          hit_count: cached.hit_count + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', cached.id)
    } else {
      // Generate new result
      const message = await anthropic.messages.create({
        model: 'claude-haiku-3-5-20241022',
        max_tokens: 1000,
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

      result = JSON.parse(jsonMatch[0])
      tokensUsed = message.usage.input_tokens + message.usage.output_tokens
      costUsd = (message.usage.input_tokens * 0.0000008) + (message.usage.output_tokens * 0.000004) // Haiku 3.5 pricing

      // Cache the result
      await supabase.from('luxai_cache').insert({
        type: 'salary_benchmark',
        prompt_hash: promptHash,
        prompt,
        response: result,
      })
    }

    // Log to history
    await supabase.from('luxai_history').insert({
      type: 'salary_benchmark',
      model: 'claude-haiku-3-5-20241022',
      prompt,
      response: result,
      tokens_used: tokensUsed,
      cost_usd: costUsd,
      status: 'success',
    })

    // Check if approval required
    const { data: settings } = await supabase
      .from('luxai_settings')
      .select('value')
      .eq('key', 'require_approval_salary')
      .maybeSingle()

    const requireApproval = settings?.value === true

    if (requireApproval) {
      // Write to content_queue (canonical editorial gate)
      // NOTE: salary-benchmark is a documented temporary exception in this
      // patch — source_url is NOT enforced for salary_benchmark yet because
      // these payloads are fully internal and have no citable source URL.
      // processed_content is required and is populated below.
      await insertLuxaiQueueItem(supabase, {
        content_type: 'salary_benchmark',
        source_type: 'joblux_generation',
        source_name: 'luxai',
        title: `Salary Benchmark: ${job_title}, ${city}`,
        raw_content: { query: body, result },
        processed_content: { query: body, result },
        destination_table: 'salary_benchmarks',
      })
      return NextResponse.json({
        queued: true,
        message: 'Benchmark queued for approval'
      })
    }

    // Return directly
    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof QueueValidationError) {
      return queueValidationErrorResponse(error)
    }

    console.error('LUXAI Benchmark error:', error)

    // Log error
    await supabase.from('luxai_history').insert({
      type: 'salary_benchmark',
      model: 'claude-haiku-3-5-20241022',
      prompt: JSON.stringify(error),
      response: {},
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Failed to generate benchmark' },
      { status: 500 }
    )
  }
}
