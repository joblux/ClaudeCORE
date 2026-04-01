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

export async function POST(request: Request) {
  try {
    const body: RegenerateRequest = await request.json()
    
    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: false,
        message: 'ANTHROPIC_API_KEY not configured'
      }, { status: 500 })
    }

    // Get brands to process
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

    // Process brands in batches
    const results = []
    let totalCost = 0
    let totalTokens = 0
    const startTime = Date.now()
    
    const BATCH_SIZE = 10
    const DELAY_MS = 5000
    
    for (let i = 0; i < brandsToProcess.length; i += BATCH_SIZE) {
      const batch = brandsToProcess.slice(i, i + BATCH_SIZE)
      
      const batchPromises = batch.map(brand => generateBrandContent(brand.slug, brand.brand_name))
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
      
      // Delay between batches (except after last batch)
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
  const startTime = Date.now()
  
  // Generate English content
  const englishContent = await callClaude({
    brand_name: brandName,
    language: 'English'
  })
  
  // Generate translations
  const translations = await Promise.all([
    callClaude({ brand_name: brandName, language: 'Chinese (Simplified)', source_content: englishContent.content }),
    callClaude({ brand_name: brandName, language: 'Arabic', source_content: englishContent.content }),
    callClaude({ brand_name: brandName, language: 'Japanese', source_content: englishContent.content })
  ])
  
  const totalTokens = englishContent.tokens + translations.reduce((sum, t) => sum + t.tokens, 0)
  const totalCost = englishContent.cost + translations.reduce((sum, t) => sum + t.cost, 0)
  
  // Save to database
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
      regeneration_count: supabase.raw('COALESCE(regeneration_count, 0) + 1'),
      content_version: supabase.raw('COALESCE(content_version, 0) + 1'),
      updated_at: new Date().toISOString()
    })
    .eq('slug', slug)
  
  if (error) throw error
  
  // Log to luxai_history
  await supabase.from('luxai_history').insert({
    type: 'wikilux_regeneration',
    model: 'claude-haiku-3-5-20241022',
    prompt: `Generate WikiLux content for ${brandName}`,
    response: { slug, brand_name: brandName },
    tokens_used: totalTokens,
    cost_usd: totalCost,
    status: 'success'
  })
  
  return {
    tokens: totalTokens,
    cost: totalCost
  }
}

async function callClaude(params: { brand_name: string, language: string, source_content?: any }) {
  const isTranslation = !!params.source_content
  
  const prompt = isTranslation
    ? `Translate this WikiLux brand content to ${params.language}. Maintain the exact same JSON structure:

${JSON.stringify(params.source_content, null, 2)}

Output only the translated JSON with no additional text.`
    : `Generate WikiLux encyclopedia content for ${params.brand_name} in ${params.language}.

Return ONLY a JSON object (no markdown, no explanation) with this exact structure:

{
  "history": "300-word brand history from founding to present, covering key milestones, evolution, ownership changes, and current position",
  "founder": "250-word founder biography including birth, background, philosophy, innovations, and lasting impact on the brand and industry",
  "brand_dna": "200-word brand identity analysis covering core values, aesthetic codes, positioning, what distinguishes the brand, and target clientele",
  "careers": "150-word overview of working at this brand, covering culture, career paths, typical roles, and what the company values in candidates",
  "creative_directors": "200-word evolution of creative leadership, covering historical directors, current director, their vision, and impact on brand direction",
  "signature_products": "200-word description of 2-3 iconic products with their history, significance, price positioning, and what makes them special",
  "current_strategy": "150-word overview of recent initiatives, digital transformation, sustainability efforts, market expansion, and strategic priorities",
  "market_position": "180-word analysis of brand positioning in luxury market, target segments, key competitors, and differentiating factors",
  "hiring_intelligence": {
    "culture": "150-word description of company culture, working environment, values, and what it's like to work there",
    "process": "100-word overview of typical interview and hiring process",
    "profiles": "100-word description of ideal candidate profiles and what the brand looks for"
  }
}

Important: Tone should be encyclopedic, factual, and authoritative. Focus on accuracy of dates, names, and facts.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-3-5-20241022',
      max_tokens: isTranslation ? 8000 : 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${error}`)
  }

  const data = await response.json()
  const text = data.content[0].text
  
  // Parse JSON from response
  let content
  try {
    // Remove any markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    content = JSON.parse(cleaned)
  } catch (e) {
    throw new Error(`Failed to parse JSON response: ${text.substring(0, 200)}...`)
  }
  
  // Calculate cost (Haiku pricing: $0.80/1M input, $4.00/1M output)
  const inputTokens = data.usage.input_tokens
  const outputTokens = data.usage.output_tokens
  const cost = (inputTokens * 0.80 / 1000000) + (outputTokens * 4.00 / 1000000)
  
  return {
    content,
    tokens: inputTokens + outputTokens,
    cost
  }
}
