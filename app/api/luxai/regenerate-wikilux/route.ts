import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateBrandContent } from '@/lib/luxai/regenerateBrand'

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
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
        .select('slug, brand_name, status')
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
        .select('slug, brand_name, status')
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
      
      const batchPromises = batch.map((brand: any) => generateBrandContent(brand.slug, brand.brand_name, brand.status))
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
