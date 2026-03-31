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
    const body = await req.json()
    const { interview_id } = body

    // Fetch interview from database
    const { data: interview } = await supabase
      .from('interview_experiences')
      .select('*')
      .eq('id', interview_id)
      .maybeSingle()

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    const context = [
      `Brand: ${interview.brand_name}`,
      `Job Title: ${interview.job_title}`,
      `Department: ${interview.department}`,
      `Seniority: ${interview.seniority}`,
      `Location: ${interview.location}`,
      `Year: ${interview.interview_year}`,
      `Rounds: ${interview.number_of_rounds}`,
      `Format: ${interview.interview_format}`,
      `Difficulty: ${interview.difficulty}/5`,
      `Overall Experience: ${interview.overall_experience}`,
      `Outcome: ${interview.outcome}`,
    ].join('\n')

    const prompt = `You are LUXAI, the interview intelligence engine for JOBLUX — a luxury careers platform.

Generate detailed interview intelligence for this experience:

${context}

Respond ONLY in JSON format with this exact structure:
{
  "sections": [
    {
      "title": "Overall Experience",
      "content": "The interview process was thorough and professional. The team was respectful and clearly invested in finding the right cultural fit. The process took approximately 6 weeks from initial screening to final offer."
    },
    {
      "title": "Interview Rounds",
      "content": "Round 1: Phone Screening (30 min) — HR conversation about background, motivations, and availability. Basic questions about luxury retail experience and French language proficiency.\\n\\nRound 2: Regional Manager Interview (60 min) — Deep dive into retail operations, team management experience, sales strategies. Scenario-based questions about handling difficult clients and underperforming team members.\\n\\nRound 3: Store Visit & Practical Exercise (2 hours) — Visited the flagship store, observed operations, met team. Presented a 15-minute analysis of store strengths/opportunities with improvement recommendations.\\n\\nRound 4: Final Interview with Country Director (45 min) — Strategic discussion about luxury market trends, brand vision, leadership philosophy. Questions about long-term career goals and alignment with brand values."
    },
    {
      "title": "Key Questions Asked",
      "content": "• \\"Describe a time you turned around an underperforming store or team.\\"\\n• \\"How do you balance commercial targets with maintaining the luxury client experience?\\"\\n• \\"What does the [brand name] brand mean to you?\\"\\n• \\"How would you handle a VIP client complaint about product quality?\\"\\n• \\"Where do you see luxury retail evolving in the next 5 years?\\""
    },
    {
      "title": "Preparation Tips",
      "content": "• Research brand history thoroughly — they expect deep knowledge of brand heritage\\n• Prepare concrete examples of team leadership and sales achievements with metrics\\n• Visit the store beforehand to understand operations and clientele\\n• Be ready to discuss luxury market trends and competitor positioning\\n• Practice presenting in the local language if applying for non-English speaking role"
    },
    {
      "title": "Outcome",
      "content": "Offer received. Accepted. Negotiated base salary +8% above initial offer. Start date flexible within 3-month window."
    }
  ]
}

Guidelines:
- Generate realistic, detailed content for each section
- Match tone and depth to the seniority level
- Include specific, actionable advice
- Use bullet points for lists (Interview Rounds, Questions, Tips)
- Keep each section content 80-150 words
- Make it feel authentic and helpful
- Adjust difficulty/rigor based on difficulty rating (1=easy, 5=very challenging)
- Premium brands (Hermès, Chanel, LV) = more rigorous process
- Match format (video/in-person/multi-stage) to reality`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-3-5-20241022',
      max_tokens: 2000,
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
    return NextResponse.json(result)

  } catch (error) {
    console.error('LUXAI Interview Detail error:', error)
    return NextResponse.json(
      { error: 'Failed to generate interview detail' },
      { status: 500 }
    )
  }
}
