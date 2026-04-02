import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json()
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    // Fetch brand content to get context (name, sector, headquarters, careers)
    const { data: brand, error: brandError } = await supabaseAdmin
      .from('wikilux_content')
      .select('slug, brand_name, content')
      .eq('slug', slug)
      .maybeSingle()

    if (brandError || !brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const content = brand.content || {}
    const brandName = brand.brand_name || content.key_facts?.find((f: any) => f.label === 'Founder')?.value ? slug : slug
    const displayName = brand.brand_name || slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    
    // Extract context from existing content
    const headquarters = content.key_facts?.find((f: any) => f.label === 'Headquarters')?.value || 'Paris, France'
    const employees = content.key_facts?.find((f: any) => f.label === 'Employees')?.value || 'Unknown'
    const sector = content.key_facts?.find((f: any) => f.label === 'Sector')?.value || 'Luxury'
    const careerPaths = content.careers?.paths || []
    const parentGroup = content.stock?.parent_group || content.key_facts?.find((f: any) => f.label === 'Ownership')?.value || 'Independent'

    const prompt = `You are a luxury industry compensation analyst. Generate realistic salary intelligence data for ${displayName}.

BRAND CONTEXT:
- Name: ${displayName}
- Headquarters: ${headquarters}
- Employees: ${employees}
- Parent Group: ${parentGroup}
- Career Paths: ${careerPaths.join(', ')}

TASK: Generate salary data as a JSON object with this EXACT structure. Return ONLY valid JSON, no markdown, no backticks, no explanation.

{
  "roles": [
    {
      "title": "string [exact job title common at this brand]",
      "department": "string [Retail | Creative | Corporate | Marketing | Digital | Artisan | Operations | Finance | HR]",
      "level": "string [Entry | Mid | Senior | Director | Executive]",
      "ranges": {
        "paris": { "min": number, "max": number, "currency": "EUR" },
        "london": { "min": number, "max": number, "currency": "GBP" },
        "new_york": { "min": number, "max": number, "currency": "USD" },
        "dubai": { "min": number, "max": number, "currency": "AED" }
      },
      "bonus_pct": "string [e.g. '10-20%']",
      "benefits": ["string array of 3-4 common benefits for this role"]
    }
  ],
  "compensation_note": "string [max 200 chars — one sentence about this brand's compensation philosophy]",
  "common_benefits": ["string array of 5-6 benefits common across the brand"],
  "updated_quarter": "Q1 2026"
}

RULES:
- Generate exactly 10 roles spanning Entry to Executive levels
- Roles must be realistic for this specific brand and its sector
- Salary ranges must be realistic for the luxury industry in each city
- Use local currency for each city (EUR for Paris, GBP for London, USD for New York, AED for Dubai)
- If the brand has headquarters outside these 4 cities, still use these 4 as benchmark markets
- Ranges should reflect luxury industry premiums (typically 15-30% above general market)
- Entry roles: €28K-€45K range, Mid: €45K-€80K, Senior: €65K-€120K, Director: €90K-€160K, Executive: €140K-€300K+
- Bonus percentages should be realistic (5-15% for retail, 15-30% for corporate/executive)
- Benefits should include brand-specific perks (e.g. staff discount, product allowance)
- compensation_note: capture this brand's specific approach to comp (generous? conservative? equity-heavy?)
- All numbers in thousands (e.g. 65000 not 65)`

    console.log(`[LUXAI Salary] Generating for ${displayName} (${slug})`)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error(`[LUXAI Salary] API error: ${response.status}`, errText)
      return NextResponse.json({ error: 'API call failed', detail: errText }, { status: 500 })
    }

    const data = await response.json()
    
    // Check for truncation
    if (data.stop_reason === 'max_tokens') {
      console.error(`[LUXAI Salary] Response truncated for ${slug}`)
      return NextResponse.json({ error: 'Response truncated — salary data too long' }, { status: 500 })
    }

    const rawText = data.content?.[0]?.text || ''
    console.log(`[LUXAI Salary] Response length: ${rawText.length} chars, stop_reason: ${data.stop_reason}`)

    // Strip markdown backticks if present
    let cleanText = rawText.trim()
    if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7)
    else if (cleanText.startsWith('```')) cleanText = cleanText.slice(3)
    if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3)
    cleanText = cleanText.trim()

    let salaryData
    try {
      salaryData = JSON.parse(cleanText)
    } catch (parseError) {
      console.error(`[LUXAI Salary] JSON parse failed for ${slug}:`, cleanText.slice(0, 200))
      return NextResponse.json({ error: 'Failed to parse salary JSON', preview: cleanText.slice(0, 300) }, { status: 500 })
    }

    // Validate structure
    if (!salaryData.roles || !Array.isArray(salaryData.roles) || salaryData.roles.length === 0) {
      return NextResponse.json({ error: 'Invalid salary data structure — no roles array' }, { status: 500 })
    }

    // Merge salary data into existing content
    const updatedContent = { ...content, salaries: salaryData }

    const { error: updateError } = await supabaseAdmin
      .from('wikilux_content')
      .update({ 
        content: updatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)

    if (updateError) {
      console.error(`[LUXAI Salary] DB update error for ${slug}:`, updateError)
      return NextResponse.json({ error: 'DB update failed', detail: updateError.message }, { status: 500 })
    }

    // Log usage
    const inputTokens = data.usage?.input_tokens || 0
    const outputTokens = data.usage?.output_tokens || 0
    const totalTokens = inputTokens + outputTokens
    const cost = (inputTokens * 0.0000008) + (outputTokens * 0.000004) // Haiku 4.5 pricing

    await supabaseAdmin.from('luxai_history').insert({
      type: 'salary',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate salary data for ${displayName}`,
      response: salaryData,
      tokens_used: totalTokens,
      cost_usd: cost,
      status: 'success',
    }).then(() => {}).catch(() => {}) // fire and forget

    console.log(`[LUXAI Salary] ✓ ${displayName}: ${salaryData.roles.length} roles, cost: $${cost.toFixed(4)}`)

    return NextResponse.json({ 
      success: true, 
      slug,
      roles_count: salaryData.roles.length,
      cost: `$${cost.toFixed(4)}`,
      salary_data: salaryData
    })

  } catch (err: any) {
    console.error('[LUXAI Salary] Unexpected error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
