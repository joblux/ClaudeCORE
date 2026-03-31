import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { job_title, city, department, seniority, brand, current_salary } = body

    // Build context for Claude
    const context = [
      `Job Title: ${job_title}`,
      `City: ${city}`,
      department && `Department: ${department}`,
      seniority && `Seniority: ${seniority}`,
      brand && `Brand: ${brand}`,
      current_salary && `Current Salary: ${current_salary}`,
    ].filter(Boolean).join('\n')

    const prompt = `You are LUXAI, the salary intelligence engine for JOBLUX — a luxury careers platform.

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

    const message = await anthropic.messages.create({
      model: 'claude-haiku-3-5-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Parse JSON from Claude's response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from response')
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)

  } catch (error) {
    console.error('LUXAI Benchmark error:', error)
    return NextResponse.json(
      { error: 'Failed to generate benchmark' },
      { status: 500 }
    )
  }
}
