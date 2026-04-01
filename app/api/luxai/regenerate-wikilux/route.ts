import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RegenerateRequest {
  mode: 'all' | 'single'
  brand_slug?: string
}

interface BrandResult {
  slug: string
  brand_name: string
  status: 'success' | 'error'
  tokens_used?: number
  cost_usd?: number
  error?: string
}

export async function POST(request: Request) {
  try {
    const body: RegenerateRequest = await request.json()
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: false,
        message: 'ANTHROPIC_API_KEY not configured'
      }, { status: 500 })
    }

    let brandsToProcess: any[] = []
    
    if (body.mode === 'single') {
      if (!body.brand_slug) {
        return NextResponse.json({
          success: false,
          message: 'brand_slug required for single mode'
        }, { status: 400 })
      }
      
      const { data, error } = await supabase
        .from('wikilux_content')
        .select('slug, brand_name')
        .eq('slug', body.brand_slug)
        .maybeSingle()
      
      if (error || !data) {
        return NextResponse.json({
          success: false,
          message: 'Brand not found'
        }, { status: 404 })
      }
      
      brandsToProcess = [data]
    } else {
      const { data, error } = await supabase
        .from('wikilux_content')
        .select('slug, brand_name')
        .order('slug')
      
      if (error) throw error
      brandsToProcess = data || []
    }

    const results: BrandResult[] = []
    let totalCost = 0
    let totalTokens = 0
    const startTime = Date.now()
    
    const BATCH_SIZE = 10
    const DELAY_MS = 5000
    
    for (let i = 0; i < brandsToProcess.length; i += BATCH_SIZE) {
      const batch = brandsToProcess.slice(i, i + BATCH_SIZE)
      
      const batchPromises = batch.map((brand: any) => generateBrandContent(brand.slug, brand.brand_name))
      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result, idx) => {
        const brand = batch[idx]
        if (result.status === 'fulfilled') {
          results.push({
            slug: brand.slug,
            brand_name: brand.brand_name,
            status: 'success',
            tokens_used: result.value.tokens,
            cost_usd: result.value.cost
          })
          totalCost += result.value.cost
          totalTokens += result.value.tokens
        } else {
          results.push({
            slug: brand.slug,
            brand_name: brand.brand_name,
            status: 'error',
            error: result.reason.message
          })
        }
      })
      
      if (i + BATCH_SIZE < brandsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS))
      }
    }
    
    const processingTime = Math.round((Date.now() - startTime) / 1000)
    const successCount = results.filter(r => r.status === 'success').length
    const failedCount = results.filter(r => r.status === 'error').length
    
    return NextResponse.json({
      success: true,
      message: `Processed ${successCount}/${brandsToProcess.length} brands`,
      data: {
        brands_processed: successCount,
        brands_failed: failedCount,
        total_cost_usd: totalCost,
        total_tokens: totalTokens,
        processing_time_seconds: processingTime,
        results
      }
    })
    
  } catch (error: any) {
    console.error('WikiLux regeneration error:', error)
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

async function generateBrandContent(slug: string, brandName: string) {
  const content = await callClaude(brandName)
  
  const { error } = await supabase
    .from('wikilux_content')
    .update({
      content: content.content,
      status: 'pending',
      last_regenerated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('slug', slug)
  
  if (error) throw error
  
  await supabase.from('luxai_history').insert({
    type: 'wikilux_regeneration',
    model: 'claude-haiku-4-5-20251001',
    prompt: `Generate WikiLux content for ${brandName}`,
    response: { slug, brand_name: brandName },
    tokens_used: content.tokens,
    cost_usd: content.cost,
    status: 'success'
  })
  
  return { tokens: content.tokens, cost: content.cost }
}

async function callClaude(brandName: string) {
  const prompt = `You are a luxury industry analyst writing for JOBLUX, a luxury careers intelligence platform. Generate encyclopedic content for ${brandName}.

Return ONLY a JSON object (no markdown, no explanation, no backticks) with this EXACT structure. Every field is MANDATORY — do not skip any:

{
  "tagline": "One sentence capturing the brand's essence (max 15 words)",
  "brand_dna": "120-word brand identity analysis. Codes, position in luxury universe, what makes it unique.",
  "history": [
    {"year": "1837", "event": "One-sentence milestone"},
    {"year": "1922", "event": "Another milestone"}
  ],
  "founder_name": "Full name of the founder (e.g. Louis-François Cartier)",
  "founder": "150-word founder biography. Birth, origins, how they started, legacy. Narrative prose.",
  "founder_facts": [
    "Interesting fact (1 sentence)",
    "Second fact",
    "Third fact",
    "Fourth fact",
    "Fifth fact"
  ],
  "key_facts": [
    {"label": "Founded", "value": "1837"},
    {"label": "Headquarters", "value": "Paris"},
    {"label": "Employees", "value": "~20,000"},
    {"label": "Revenue", "value": "$14.6B (2024)"},
    {"label": "Ownership", "value": "Family / Public / Conglomerate"}
  ],
  "key_executives": [
    {"name": "Full Name", "role": "CEO", "since": "2013"},
    {"name": "Full Name", "role": "Creative Director", "since": "2020"}
  ],
  "creative_directors": "120-word history of creative leadership. Past and present creative directors, their impact.",
  "careers": {
    "prose": "80-word overview of working at this brand. Culture, pace, reputation as employer.",
    "paths": ["Retail & boutique management", "Artisan & métiers", "Marketing & communications", "Digital & e-commerce", "Finance & strategy", "Supply chain", "HR & talent"]
  },
  "hiring_intelligence": {
    "values": [
      {"title": "Craftsmanship", "desc": "One sentence about this core value internally."},
      {"title": "Independence", "desc": "One sentence."},
      {"title": "Creativity", "desc": "One sentence."},
      {"title": "Discretion", "desc": "One sentence."}
    ],
    "culture": "60-word internal work culture description.",
    "growth": "60-word career growth and mobility description.",
    "pace": "60-word work pace and decision-making description.",
    "access": "60-word description of how to get hired — competitiveness, networking, referrals, interview process."
  },
  "quote": {
    "text": "A real, verifiable quote from the founder, CEO, or creative director.",
    "author": "Full Name, Title"
  },
  "market_position": "120-word competitive positioning. Where it sits vs peers, strengths, market segment.",
  "presence": [
    {"region": "Europe", "detail": "Headquarters + 120 boutiques"},
    {"region": "Asia Pacific", "detail": "85 boutiques, strongest in Japan and China"},
    {"region": "North America", "detail": "45 boutiques"}
  ],
  "facts": [
    "Brand trivia (1 sentence)",
    "Second fact",
    "Third fact",
    "Fourth fact",
    "Fifth fact",
    "Sixth fact"
  ],
  "stock": {
    "is_public": true,
    "exchange": "EPA",
    "ticker": "RMS",
    "parent_group": "Independent",
    "market_cap": "€220B"
  }
}

RULES:
- ALL 16 fields are MANDATORY. Do not omit any field, especially hiring_intelligence.access.
- history: 7-10 milestones, real years, real events.
- key_executives: 3-5 current executives with real names and real years.
- careers.paths: 6-8 departments relevant to this brand.
- hiring_intelligence.values: Exactly 4. Short title + one sentence each.
- hiring_intelligence: ALL four sub-fields (culture, growth, pace, access) are REQUIRED.
- quote: Real, verifiable quote only.
- stock.is_public: false for private companies — then set exchange/ticker/market_cap to null.
- Encyclopedic, factual tone. No marketing language. Respect word limits strictly.
- Output valid JSON only. No markdown. No backticks. No explanation.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${error}`)
  }

  const data = await response.json()
  const text = data.content[0].text
  const stopReason = data.stop_reason
  
  // If the model hit the token limit, the JSON is truncated and unparseable
  if (stopReason === 'max_tokens') {
    throw new Error(`Output truncated (hit max_tokens). stop_reason=${stopReason}, output_tokens=${data.usage.output_tokens}`)
  }
  
  let content
  try {
    let cleaned = text.trim()
    // Strip markdown code fences — handle all variations
    cleaned = cleaned.replace(/^```(?:json|JSON)?\s*\n?/, '')
    cleaned = cleaned.replace(/\n?```\s*$/, '')
    cleaned = cleaned.trim()
    // Extract from first { to last } as safety net
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1)
    }
    content = JSON.parse(cleaned)
  } catch (e: any) {
    // Log what we actually tried to parse so we can debug
    const preview = text.substring(0, 100)
    const ending = text.substring(Math.max(0, text.length - 100))
    throw new Error(`JSON parse failed. stop_reason=${stopReason}, len=${text.length}, start="${preview}", end="${ending}", parseError=${e.message}`)
  }
  
  const inputTokens = data.usage.input_tokens
  const outputTokens = data.usage.output_tokens
  const cost = (inputTokens * 1.00 / 1000000) + (outputTokens * 5.00 / 1000000)
  
  return { content, tokens: inputTokens + outputTokens, cost }
}
