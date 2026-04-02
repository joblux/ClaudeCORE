import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { slug } = await request.json()
    if (!slug) return NextResponse.json({ success: false, message: 'slug required' }, { status: 400 })
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

    // Get brand name
    const { data: brand } = await supabase.from('wikilux_content').select('brand_name').eq('slug', slug).maybeSingle()
    if (!brand) return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 })
    const brandName = brand.brand_name

    const prompt = `You are a luxury careers analyst for JOBLUX. Generate 5 realistic interview experiences at ${brandName}.

Return ONLY a JSON array (no markdown, no backticks):
[
  {
    "job_title": "Boutique Manager",
    "department": "Retail",
    "seniority": "mid" | "senior" | "executive" | "junior",
    "location": "Paris, France",
    "interview_year": 2025,
    "process_duration": "3 weeks",
    "number_of_rounds": 3,
    "interview_format": "In-person + video",
    "process_description": "Detailed description of the interview process, 2-3 sentences [max 300 chars]",
    "questions_asked": "Key questions that were asked, separated by semicolons [max 300 chars]",
    "tips": "Advice for candidates, 1-2 sentences [max 200 chars]",
    "outcome": "accepted" | "rejected" | "withdrew" | "pending",
    "difficulty": "easy" | "medium" | "hard" | "very_hard",
    "overall_experience": "positive" | "neutral" | "negative"
  }
]

RULES:
- 5 experiences covering different departments and seniority levels
- Realistic for ${brandName} specifically — reference their culture, values, interview style
- Mix of outcomes: 3 accepted, 1 rejected, 1 withdrew
- Locations: mix of cities where ${brandName} operates
- Questions should be specific to luxury industry and ${brandName}
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
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) throw new Error(`Claude API error: ${await response.text()}`)

    const data = await response.json()
    const text = data.content[0].text
    const inputTokens = data.usage.input_tokens
    const outputTokens = data.usage.output_tokens
    const cost = (inputTokens * 1.00 / 1000000) + (outputTokens * 5.00 / 1000000)

    let interviews
    try {
      let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
      const first = cleaned.indexOf('[')
      const last = cleaned.lastIndexOf(']')
      if (first !== -1 && last > first) cleaned = cleaned.substring(first, last + 1)
      interviews = JSON.parse(cleaned)
    } catch (e: any) {
      throw new Error(`JSON parse failed: ${e.message}`)
    }

    const inserted = []
    for (const iv of interviews) {
      const { data: row, error } = await supabase.from('interview_experiences').insert({
        brand_slug: slug,
        brand_name: brandName,
        job_title: iv.job_title,
        department: iv.department,
        seniority: iv.seniority,
        location: iv.location,
        interview_year: iv.interview_year,
        process_duration: iv.process_duration,
        number_of_rounds: iv.number_of_rounds,
        interview_format: iv.interview_format,
        process_description: iv.process_description,
        questions_asked: iv.questions_asked,
        tips: iv.tips,
        outcome: iv.outcome,
        difficulty: iv.difficulty,
        overall_experience: iv.overall_experience
      }).select().maybeSingle()
      if (!error && row) inserted.push(row)
    }

    await supabase.from('luxai_history').insert({
      type: 'interview_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate interviews for ${brandName}`,
      response: { slug, brand_name: brandName, count: inserted.length },
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: `${inserted.length} interview experiences generated for ${brandName}`,
      data: { count: inserted.length, cost, tokens: inputTokens + outputTokens }
    })
  } catch (error: any) {
    console.error('Interview generation error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
