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
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    let brandsToProcess: any[] = []
    
    if (body.mode === 'single') {
      if (!body.brand_slug) {
        return NextResponse.json({ success: false, message: 'brand_slug required for single mode' }, { status: 400 })
      }
      const { data } = await supabase.from('wikilux_content').select('slug, brand_name').eq('slug', body.brand_slug).maybeSingle()
      if (!data) return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 })
      brandsToProcess = [data]
    } else {
      const { data } = await supabase.from('wikilux_content').select('slug, brand_name').order('slug')
      brandsToProcess = data || []
    }

    const results: any[] = []
    let totalCost = 0
    let totalTokens = 0
    const startTime = Date.now()
    
    for (const brand of brandsToProcess) {
      try {
        const result = await generateBrandContent(brand.slug, brand.brand_name)
        results.push({ slug: brand.slug, brand_name: brand.brand_name, status: 'success', tokens_used: result.tokens, cost_usd: result.cost })
        totalCost += result.cost
        totalTokens += result.tokens
      } catch (err: any) {
        results.push({ slug: brand.slug, brand_name: brand.brand_name, status: 'error', error: err.message })
      }
      
      if (brandsToProcess.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    const successCount = results.filter(r => r.status === 'success').length
    
    return NextResponse.json({
      success: true,
      message: `Processed ${successCount}/${brandsToProcess.length} brands`,
      data: {
        brands_processed: successCount,
        brands_failed: results.filter(r => r.status === 'error').length,
        total_cost_usd: totalCost,
        total_tokens: totalTokens,
        processing_time_seconds: Math.round((Date.now() - startTime) / 1000),
        results
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}

async function generateBrandContent(slug: string, brandName: string) {
  const prompt = `Generate WikiLux encyclopedia content for ${brandName}.

Return ONLY a JSON object (no markdown, no explanation) with ALL of these fields:

{
  "tagline": "One compelling sentence capturing the brand essence (max 15 words)",
  "brand_dna": "200-word brand identity analysis",
  "history": "300-word brand history from founding to present",
  "founder": "250-word founder biography",
  "founder_facts": ["5 lesser-known facts about the founder as strings"],
  "key_facts": [{"label": "Founded", "value": "1845"}, {"label": "HQ", "value": "Glashütte, Germany"}],
  "key_executives": [{"name": "CEO Name", "role": "CEO", "since": "2020"}],
  "creative_directors": "200-word evolution of creative leadership",
  "signature_products": "200-word description of 3-5 iconic products",
  "careers": "150-word overview of working at this brand",
  "hiring_intelligence": {"culture": "150 words", "process": "100 words", "profiles": "100 words"},
  "market_position": "180-word competitive analysis",
  "current_strategy": "150-word current strategic direction",
  "presence": [{"region": "Europe", "detail": "45 boutiques"}, {"region": "Asia", "detail": "30 boutiques"}],
  "facts": ["6-8 interesting brand facts as strings"],
  "stock": {"is_public": true, "exchange": "PA", "ticker": "RMS", "parent_group": "Independent", "market_cap": "€250B"}
}

key_facts: 8-10 items with label/value. key_executives: 3-5 current leaders. founder_facts: exactly 5 strings. facts: 6-8 strings. presence: 4-6 regions.
For private companies: stock.is_public=false, exchange/ticker/market_cap=null.
Tone: encyclopedic, factual, authoritative.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
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
  
  const { error } = await supabase
    .from('wikilux_content')
    .update({
      content,
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
    tokens_used: inputTokens + outputTokens,
    cost_usd: cost,
    status: 'success'
  }).catch(() => {})
  
  return { tokens: inputTokens + outputTokens, cost }
}
