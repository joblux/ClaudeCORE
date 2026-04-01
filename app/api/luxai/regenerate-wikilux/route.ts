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
    
    return NextResponse.json({
      success: true,
      message: `Processed ${successCount}/${brandsToProcess.length} brands`,
      data: {
        brands_processed: successCount,
        brands_failed: results.filter(r => r.status === 'error').length,
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
  const englishContent = await callClaude({
    brand_name: brandName,
    language: 'English'
  })
  
  const translations = await Promise.all([
    callClaude({ brand_name: brandName, language: 'Chinese (Simplified)', source_content: englishContent.content }),
    callClaude({ brand_name: brandName, language: 'Arabic', source_content: englishContent.content }),
    callClaude({ brand_name: brandName, language: 'Japanese', source_content: englishContent.content })
  ])
  
  const totalTokens = englishContent.tokens + translations.reduce((sum, t) => sum + t.tokens, 0)
  const totalCost = englishContent.cost + translations.reduce((sum, t) => sum + t.cost, 0)
  
  const { error } = await supabase
    .from('wikilux_content')
    .update({
      content: englishContent.content,
      translations: {
        zh: translations[0].content,
        ar: translations[1].content,
        ja: translations[2].content
      },
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
    tokens_used: totalTokens,
    cost_usd: totalCost,
    status: 'success'
  })
  
  return { tokens: totalTokens, cost: totalCost }
}

async function callClaude(params: { brand_name: string, language: string, source_content?: any }) {
  const isTranslation = !!params.source_content
  
  const prompt = isTranslation
    ? `Translate this WikiLux brand content to ${params.language}. Maintain the exact same JSON structure and all keys. Translate all string values.

${JSON.stringify(params.source_content, null, 2)}

Output only the translated JSON with no additional text.`
    : `Generate WikiLux encyclopedia content for ${params.brand_name} in ${params.language}.

Return ONLY a JSON object (no markdown, no explanation) with this exact structure. Fill ALL fields:

{
  "tagline": "One compelling sentence capturing the brand essence (max 15 words)",
  "brand_dna": "200-word brand identity analysis — what makes this house unique, its codes, its aesthetic philosophy",
  "history": "300-word brand history from founding to present day, key milestones and turning points",
  "founder": "250-word founder biography — origins, vision, key achievements, legacy",
  "founder_facts": "5 fascinating lesser-known facts about the founder, as a JSON array of strings",
  "key_facts": "8-10 key facts about the brand (founding year, HQ, employees, revenue, stores, etc.), as a JSON array of objects with 'label' and 'value' keys",
  "key_executives": "Current leadership team, as a JSON array of objects with 'name', 'role', and 'since' keys (3-5 executives)",
  "creative_directors": "200-word evolution of creative leadership from founding to present, key creative figures and their contributions",
  "signature_products": "200-word description of 3-5 most iconic products, their origin stories and cultural significance",
  "careers": "150-word overview of what it is like to work at this brand — culture, expectations, growth",
  "hiring_intelligence": {
    "culture": "150-word description of company culture and work environment",
    "process": "100-word overview of typical hiring process and what to expect",
    "profiles": "100-word description of ideal candidate profiles they look for"
  },
  "market_position": "180-word analysis of competitive positioning, market share, strengths vs peers",
  "current_strategy": "150-word overview of current strategic initiatives, recent moves, future direction",
  "presence": "Global presence summary, as a JSON array of objects with 'region' and 'detail' keys (e.g. Europe: 45 stores, Asia: 30 stores)",
  "facts": "6-8 interesting brand facts or milestones, as a JSON array of strings",
  "stock": {
    "is_public": true or false,
    "exchange": "Stock exchange name or null if private",
    "ticker": "Stock ticker or null if private",
    "parent_group": "Parent company name or 'Independent'",
    "market_cap": "Approximate market cap or null"
  }
}

Tone: encyclopedic, factual, authoritative. Focus on accuracy. For private companies, set stock.is_public to false and null for exchange/ticker/market_cap.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: isTranslation ? 8000 : 6000,
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
