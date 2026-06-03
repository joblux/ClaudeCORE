import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  insertLuxaiQueueItem,
  checkLuxaiInterviewDuplicate,
  QueueValidationError,
  queueValidationErrorResponse,
  type LuxaiQueuePayload,
} from '@/lib/luxai-rules'

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

    const prompt = `You are a luxury careers analyst for JOBLUX. Generate 5 illustrative interview experience drafts based on known luxury industry hiring patterns. These are AI-generated drafts for editorial review, not verified candidate testimonials. The target brand is ${brandName}.

Return ONLY a JSON array (no markdown, no backticks):
[
  {
    "job_title": "Boutique Manager",
    "department": "Retail",
    "seniority": "intern" | "junior" | "mid-level" | "senior" | "director" | "vp" | "c-suite",
    "location": "Paris, France",
    "interview_year": 2025,
    "process_duration": "3 weeks",
    "number_of_rounds": 3,
    "interview_format": "In-person + video",
    "process_description": "Detailed description of the interview process, 2-3 sentences [max 300 chars]",
    "questions_asked": "Key questions that were asked, separated by semicolons [max 300 chars]",
    "tips": "Advice for candidates, 1-2 sentences [max 200 chars]",
    "outcome": "offered" | "rejected" | "withdrew" | "pending" | "prefer_not_to_say",
    "difficulty": "easy" | "moderate" | "challenging" | "very_challenging",
    "overall_experience": "positive" | "neutral" | "negative"
  }
]

RULES:
- 5 experience drafts covering different departments and seniority levels
- Grounded in general luxury industry interview patterns — do not invent brand-specific internal details not publicly known
- seniority MUST be exactly one of: intern, junior, mid-level, senior, director, vp, c-suite
- outcome MUST be exactly one of: offered, rejected, withdrew, pending, prefer_not_to_say
- difficulty MUST be exactly one of: easy, moderate, challenging, very_challenging
- Mix of outcomes: 3 offered, 1 rejected, 1 withdrew
- Locations: mix of cities where ${brandName} is known to operate
- These are AI-generated drafts, not verified candidate testimonials
- Do not invent specific internal company details, names, or proprietary processes
- Use restrained language: typical of, commonly reported, often includes
- Questions and processes should reflect general luxury industry patterns, not fabricated brand specifics
- Do not present outcomes, difficulty, or number of rounds as verified facts for the brand unless clearly framed as illustrative draft patterns
- Output valid JSON array only`

    // Dedup runs once, pre-generation, at the brand level — never per row.
    // A duplicate short-circuits before the Claude call and before any insert.
    const dupe = await checkLuxaiInterviewDuplicate(supabase, slug)
    if (dupe.isDuplicate) {
      return NextResponse.json({
        success: false,
        skipped: true,
        reason: 'duplicate',
        match: dupe.match,
      })
    }

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

    // Local canonical enum guard — reject (skip), never auto-correct. Defensive
    // normalization belongs in the mapper (Step 4), not here.
    const DIFFICULTY = ['easy', 'moderate', 'challenging', 'very_challenging']
    const OUTCOME = ['offered', 'rejected', 'withdrew', 'pending', 'prefer_not_to_say']
    const SENIORITY = ['intern', 'junior', 'mid-level', 'senior', 'director', 'vp', 'c-suite']

    const errors: string[] = []
    let insertedCount = 0

    // Option B: one queue row per interview. Each row is independently guarded,
    // titled from its own job_title, and inserted; failures are recorded and the
    // loop continues.
    for (let i = 0; i < interviews.length; i++) {
      const interview = interviews[i]
      const rowNum = i + 1

      if (interview.difficulty && !DIFFICULTY.includes(interview.difficulty)) {
        errors.push(`row ${rowNum}: non-canonical difficulty "${interview.difficulty}"`)
        continue
      }
      if (interview.outcome && !OUTCOME.includes(interview.outcome)) {
        errors.push(`row ${rowNum}: non-canonical outcome "${interview.outcome}"`)
        continue
      }
      if (interview.seniority && !SENIORITY.includes(interview.seniority)) {
        errors.push(`row ${rowNum}: non-canonical seniority "${interview.seniority}"`)
        continue
      }

      const jobTitle = interview.job_title
      const payload: LuxaiQueuePayload = {
        content_type: 'interview',
        source_type: 'joblux_generation',
        source_name: 'JOBLUX Intelligence',
        title: jobTitle
          ? `${jobTitle} interview — ${brandName}`
          : `Interview experience — ${brandName}`,
        category: 'Interview Experience',
        destination_table: 'interview_experiences',
        processed_content: {
          brand_slug: slug,
          brand_name: brandName,
          interview,
        },
      }

      try {
        const { error: queueError } = await insertLuxaiQueueItem(supabase, payload)
        if (queueError) {
          errors.push(`row ${rowNum}: insert failed — ${queueError.message}`)
          continue
        }
        insertedCount++
      } catch (e: any) {
        errors.push(`row ${rowNum}: insert failed — ${e.message}`)
        continue
      }
    }

    await supabase.from('luxai_history').insert({
      type: 'interview_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate interviews for ${brandName}`,
      response: { slug, brand_name: brandName, count: insertedCount },
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      status: 'success'
    })

    const resultData = { count: insertedCount, errors: errors.length, cost, tokens: inputTokens + outputTokens }

    if (insertedCount === 5) {
      return NextResponse.json({
        success: true,
        message: `5 interview drafts queued for ${brandName}`,
        data: resultData,
      })
    }
    if (insertedCount > 0) {
      return NextResponse.json({
        success: true,
        message: `PARTIAL: ${insertedCount}/5 interview drafts queued for ${brandName}`,
        data: resultData,
      })
    }
    return NextResponse.json({
      success: false,
      message: `No interview drafts queued for ${brandName}`,
      data: resultData,
    }, { status: 500 })
  } catch (error: any) {
    if (error instanceof QueueValidationError) {
      return queueValidationErrorResponse(error)
    }
    console.error('Interview generation error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
