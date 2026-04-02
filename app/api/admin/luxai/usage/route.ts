import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

    // Content health counts — precise queries
    const [
      brandsLiveRes,
      brandsTotalRes,
      brandsEmptyRes,
      signalsRes,
      articlesRes,
      interviewsRes,
      eventsRes,
      mediaRes,
      salaryBrandsRes,
    ] = await Promise.all([
      supabase.from('wikilux_content').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('wikilux_content').select('id', { count: 'exact', head: true }),
      supabase.from('wikilux_content').select('id', { count: 'exact', head: true }).eq('status', 'draft').or('content.is.null,content.eq.{}'),
      supabase.from('signals').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('bloglux_articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('interview_experiences').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('media_library').select('id', { count: 'exact', head: true }),
      supabase.from('salary_benchmarks').select('brand_slug').not('brand_slug', 'is', null),
    ])

    const brandsLive = brandsLiveRes.count || 0
    const brandsTotal = brandsTotalRes.count || 0
    const brandsEmpty = brandsEmptyRes.count || 0

    // Count distinct brand slugs for salary
    const uniqueSlugs = new Set((salaryBrandsRes.data || []).map((r: any) => r.brand_slug).filter(Boolean))
    const salaryBrands = uniqueSlugs.size

    // Usage history
    const { data: thisMonthHistory } = await supabase.from('luxai_history')
      .select('*')
      .gte('created_at', startOfMonth)
      .order('created_at', { ascending: false })

    const { data: lastMonthHistory } = await supabase.from('luxai_history')
      .select('cost_usd, tokens_used')
      .gte('created_at', startOfLastMonth)
      .lte('created_at', endOfLastMonth)

    const thisMonthCost = (thisMonthHistory || []).reduce((s: number, h: any) => s + (h.cost_usd || 0), 0)
    const thisMonthRequests = (thisMonthHistory || []).length
    const lastMonthCost = (lastMonthHistory || []).reduce((s: number, h: any) => s + (h.cost_usd || 0), 0)
    const lastMonthRequests = (lastMonthHistory || []).length
    const avgCost = thisMonthRequests > 0 ? thisMonthCost / thisMonthRequests : 0

    return NextResponse.json({
      stats: {
        brands_total: brandsTotal,
        brands_live: brandsLive,
        brands_empty: brandsEmpty,
        signals: signalsRes.count || 0,
        articles: articlesRes.count || 0,
        salary_brands: salaryBrands,
        interviews: interviewsRes.count || 0,
        events: eventsRes.count || 0,
        media: mediaRes.count || 0,
        this_month: thisMonthCost,
        this_month_requests: thisMonthRequests,
        last_month: lastMonthCost,
        last_month_requests: lastMonthRequests,
        avg_cost: avgCost,
      },
      history: (thisMonthHistory || []).slice(0, 50)
    })
  } catch (error: any) {
    console.error('Usage endpoint error:', error)
    return NextResponse.json({
      stats: {
        brands_total: 0, brands_live: 0, brands_empty: 0,
        signals: 0, articles: 0, salary_brands: 0,
        interviews: 0, events: 0, media: 0,
        this_month: 0, this_month_requests: 0,
        last_month: 0, last_month_requests: 0, avg_cost: 0,
      },
      history: []
    })
  }
}
