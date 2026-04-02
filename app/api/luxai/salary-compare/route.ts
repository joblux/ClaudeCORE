import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { job_title, department, compare_by, seniority, locations } = body

    const locationsList = locations.split(',').map((l: string) => l.trim())

    const context = [
      `Job Title: ${job_title}`,
      department && `Department: ${department}`,
      seniority && `Seniority: ${seniority}`,
      `Compare By: ${compare_by}`,
      `Locations: ${locationsList.join(', ')}`,
    ].filter(Boolean).join('\n')

    const prompt = `You are LUXAI, the salary intelligence engine for JOBLUX | a luxury careers platform.

Generate a realistic salary comparison for the following:

${context}

Respond ONLY in JSON format with this exact structure:
{
  "comparisons": [
    {
      "location": "Paris",
      "median": "€65K",
      "range": "€52K–82K",
      "data_points": "24"
    },
    {
      "location": "London",
      "median": "£58K",
      "range": "£46K–74K",
      "data_points": "19"
    }
  ]
}

Guidelines:
- Generate one comparison object for each location
- Use realistic luxury brand salary ranges
- Adjust for city cost of living: Paris/London/NYC highest, Milan/Dubai mid, other cities lower
- Use appropriate currency for each location (€ for Europe except UK, £ for UK, $ for US, AED for Dubai)
- Data points: 10-30 per location
- Keep ranges tight (±25% of median)
- Premium cities pay 15-30% more than secondary cities`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-3-5-20241022',
      max_tokens: 1500,
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
    console.error('LUXAI Compare error:', error)
    return NextResponse.json(
      { error: 'Failed to generate comparison' },
      { status: 500 }
    )
  }
}
