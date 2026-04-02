import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Count generated brands
    const { count: generated } = await supabase
      .from('wikilux_content')
      .select('*', { count: 'exact', head: true })

    // Brands with insights
    const { data: insightBrands } = await supabase
      .from('contributions')
      .select('brand_slug')
      .eq('contribution_type', 'wikilux_insight')
      .eq('status', 'approved')

    const uniqueInsightBrands = new Set((insightBrands || []).map(c => c.brand_slug))

    // Brands with editorial notes
    const { count: withEditorial } = await supabase
      .from('wikilux_content')
      .select('*', { count: 'exact', head: true })
      .not('editorial_notes', 'is', null)

    // Top contributed brands
    const { data: topRaw } = await supabase
      .from('contributions')
      .select('brand_slug, brand_name')
      .eq('contribution_type', 'wikilux_insight')
      .eq('status', 'approved')

    const brandCounts: Record<string, { brand_name: string; count: number }> = {}
    for (const c of topRaw || []) {
      if (!brandCounts[c.brand_slug]) brandCounts[c.brand_slug] = { brand_name: c.brand_name, count: 0 }
      brandCounts[c.brand_slug].count++
    }
    const topBrands = Object.entries(brandCounts)
      .map(([slug, v]) => ({ slug, brand_name: v.brand_name, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Stale brands (60+ days old)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    const { data: staleBrands } = await supabase
      .from('wikilux_content')
      .select('slug, brand_name, updated_at')
      .lt('updated_at', sixtyDaysAgo)
      .order('updated_at', { ascending: true })
      .limit(20)

    // Last regeneration
    const { data: lastRegen } = await supabase
      .from('wikilux_content')
      .select('last_regenerated_at')
      .not('last_regenerated_at', 'is', null)
      .order('last_regenerated_at', { ascending: false })
      .limit(1)

    const totalInsights = (topRaw || []).length
    const avgInsights = uniqueInsightBrands.size > 0 ? Math.round(totalInsights / uniqueInsightBrands.size * 10) / 10 : 0

    return NextResponse.json({
      total_brands: generated || 0,
      generated: generated || 0,
      with_insights: uniqueInsightBrands.size,
      with_editorial: withEditorial || 0,
      avg_insights: avgInsights,
      top_brands: topBrands,
      stale_brands: staleBrands || [],
      last_regen: lastRegen?.[0]?.last_regenerated_at || null,
    })
  } catch (error) {
    console.error('WikiLux stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
