import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

/**
 * POST /api/assignments/import/paste
 *
 * Accepts { text: string } — raw pasted text of a job posting.
 * Uses Claude to parse and extract structured assignment data.
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authorization check
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Truncate to ~15000 chars to stay within reasonable token limits
    const truncatedText = text.trim().slice(0, 15000)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: 'You are a job posting parser for a luxury recruitment platform. Extract structured job data from the following text. Return ONLY a valid JSON object with these fields: title, company, city, country, description, responsibilities, requirements, qualifications, salary_min, salary_max, salary_currency, department, seniority, contract_type, remote_policy, benefits, languages_required, nice_to_haves. For array fields (benefits, languages_required), return arrays. For missing fields, use null. Return valid JSON only.',
      messages: [{ role: 'user', content: truncatedText }],
    })

    // Extract text from the response
    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    // Parse the JSON response, handling potential markdown code blocks
    let jsonText = textBlock.text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7)
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3)
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3)
    }
    jsonText = jsonText.trim()

    let assignment: Record<string, any>
    try {
      assignment = JSON.parse(jsonText)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON', raw: textBlock.text },
        { status: 500 }
      )
    }

    // Rename 'company' to 'maison' if present
    if (assignment.company && !assignment.maison) {
      assignment.maison = assignment.company
      delete assignment.company
    }

    return NextResponse.json({ assignment })
  } catch (error: any) {
    console.error('Paste import error:', error)
    return NextResponse.json(
      { error: 'Failed to parse pasted text', details: error.message },
      { status: 500 }
    )
  }
}
