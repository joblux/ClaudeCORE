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

Return ONLY a JSON object (no markdown, no explanation, no backticks) with this EXACT structure:

{
  "tagline": "One compelling sentence capturing the brand's essence (max 15 words)",
  "brand_dna": "200-word brand identity analysis. What makes this house unique, its codes, its position in the luxury universe.",
  "history": [
    {"year": "1837", "event": "Short description of milestone (1 sentence)"},
    {"year": "1922", "event": "Another milestone"}
  ],
  "founder": "250-word founder biography. Birth, origins, how they started, key life events, legacy. Write as narrative prose.",
  "founder_facts": [
    "Interesting fact about the founder (1 sentence)",
    "Another surprising fact",
    "Third fact",
    "Fourth fact",
    "Fifth fact"
  ],
  "key_facts": [
    {"label": "Founded", "value": "1837"},
    {"label": "Headquarters", "value": "Paris"},
    {"label": "Employees", "value": "~20,000"},
    {"label": "Revenue", "value": "$14.6B (2024)"},
    {"label": "Ownership", "value": "Family-controlled / Public / Conglomerate"}
  ],
  "key_executives": [
    {"name": "Full Name", "role": "CEO", "since": "2013"},
    {"name": "Full Name", "role": "Creative Director", "since": "2020"}
  ],
  "creative_directors": "200-word history of creative leadership at the house. Past and present creative directors, their impact, transitions.",
  "careers": {
    "prose": "150-word overview of what it's like to work at this brand. Culture, pace, opportunities, reputation as employer.",
    "paths": ["Retail & boutique management", "Artisan & métiers", "Marketing & communications", "Digital & e-commerce", "Finance & strategy", "Supply chain", "HR & talent"]
  },
  "hiring_intelligence": {
    "values": [
      {"title": "Craftsmanship", "desc": "One sentence describing this core value and how it manifests internally."},
      {"title": "Independence", "desc": "One sentence."},
      {"title": "Creativity", "desc": "One sentence."},
      {"title": "Discretion", "desc": "One sentence."}
    ],
    "culture": "150-word description of internal work culture — atmosphere, pace, what employees say, turnover, promotion culture.",
    "process": "100-word overview of typical hiring process — number of rounds, timeline, what they look for, how to get noticed.",
    "profiles": "100-word description of ideal candidate profiles — background, skills, languages, personality traits they recruit for."
  },
  "quote": {
    "text": "A famous or defining quote from the founder, CEO, or creative director (real, verified quote only).",
    "author": "Full Name, Title"
  },
  "market_position": "180-word competitive positioning analysis. Where the brand sits vs peers, strengths, vulnerabilities, market segment.",
  "presence": [
    {"region": "Europe", "detail": "Headquarters + 120 boutiques"},
    {"region": "Asia Pacific", "detail": "85 boutiques, strongest in Japan and China"},
    {"region": "North America", "detail": "45 boutiques"}
  ],
  "facts": [
    "Interesting brand fact or trivia (1 sentence)",
    "Another fact",
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
- history: Include 7-10 milestones from founding to present day. Use real years and real events only.
- key_executives: Include 3-5 current executives. Use real names and real appointment years.
- careers.paths: Include 6-8 department/function names relevant to this specific brand.
- hiring_intelligence.values: Exactly 4 values that define the brand's internal culture. Short title + one sentence each.
- quote: Must be a real, verifiable quote. If unsure, use a well-known quote from the founder.
- stock.is_public: Set false for private companies. If false, set exchange/ticker/market_cap to null.
- All prose sections: encyclopedic, factual, authoritative tone. No marketing language.
- Output valid JSON only. No markdown. No explanation. No backticks.`

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

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${error}`)
  }

  const data = await response.json()
  const text = data.content[0].text
  
  let content
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    content = JSON.parse(cleaned)
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${text.substring(0, 200)}`)
  }
  
  const inputTokens = data.usage.input_tokens
  const outputTokens = data.usage.output_tokens
  const cost = (inputTokens * 1.00 / 1000000) + (outputTokens * 5.00 / 1000000)
  
  return { content, tokens: inputTokens + outputTokens, cost }
}
