import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { job_title, city, department, seniority, years_experience, brand, education, languages } = body

    const context = [
      `Job Title: ${job_title}`,
      `City: ${city}`,
      `Department: ${department}`,
      `Seniority: ${seniority}`,
      years_experience && `Years of Experience: ${years_experience}`,
      brand && `Brand: ${brand}`,
      education && `Education: ${education}`,
      languages && `Languages: ${languages}`,
    ].filter(Boolean).join('\n')

    const prompt = `You are LUXAI, the salary intelligence engine for JOBLUX | a luxury careers platform.

Calculate a personalized salary estimate for this profile:

${context}

Respond ONLY in JSON format with these exact fields:
{
  "low": "€92K",
  "target": "€108K",
  "high": "€125K",
  "analysis": "Based on your profile: 12 years experience, Director level, Merchandising at Chanel in Paris. Factors: +15% for multilingual, +8% for premium brand, +5% for advanced degree. Confidence: High (28 comparable data points)."
}

Guidelines:
- Base salary on job_title + city + department + seniority
- Adjust for years_experience: +3-5% per year above minimum for role
- Premium brands (Hermès, Chanel, LV): +10-15%
- Advanced education (Masters/MBA): +5-10%
- Multilingual (3+ languages): +10-15%
- Target = median, Low = -15%, High = +20%
- Use appropriate currency (€, £, $, AED)
- Analysis: explain adjustments, mention confidence level, state comparable data points (15-35)
- Keep analysis under 120 words`

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

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)

  } catch (error) {
    console.error('LUXAI Calculator error:', error)
    return NextResponse.json(
      { error: 'Failed to generate estimate' },
      { status: 500 }
    )
  }
}
