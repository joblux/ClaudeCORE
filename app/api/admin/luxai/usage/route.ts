import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const period = req.nextUrl.searchParams.get('period') || '7d'
  const days = period === '90d' ? 90 : period === '30d' ? 30 : 7
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceISO = since.toISOString()

  try {
    // Total counts
    const { count: totalGenerated } = await supabase
      .from('luxai_queue')
      .select('*', { count: 'exact', head: true })
      .gte('generated_at', sinceISO)

    const { count: totalApproved } = await supabase
      .from('luxai_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('generated_at', sinceISO)

    const { count: totalRejected } = await supabase
      .from('luxai_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')
      .gte('generated_at', sinceISO)

    // All items in period for aggregation
    const { data: items } = await supabase
      .from('luxai_queue')
      .select('type, content_type, generated_at, tokens_used, cost, model')
      .gte('generated_at', sinceISO)
      .order('generated_at', { ascending: true })

    const allItems = items || []

    // Total cost
    const totalCost = allItems.reduce((sum, i) => sum + (i.cost || 0), 0)

    // Daily aggregation
    const dailyMap = new Map<string, { count: number; cost: number }>()
    for (const item of allItems) {
      const date = item.generated_at.split('T')[0]
      const existing = dailyMap.get(date) || { count: 0, cost: 0 }
      existing.count++
      existing.cost += item.cost || 0
      dailyMap.set(date, existing)
    }
    const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data }))

    // By type
    const typeMap = new Map<string, { count: number; cost: number }>()
    for (const item of allItems) {
      const type = item.content_type || item.type || 'unknown'
      const existing = typeMap.get(type) || { count: 0, cost: 0 }
      existing.count++
      existing.cost += item.cost || 0
      typeMap.set(type, existing)
    }
    const by_type = Array.from(typeMap.entries()).map(([type, data]) => ({ type, ...data }))

    // By model
    const modelMap = new Map<string, { tokens: number; cost: number }>()
    for (const item of allItems) {
      const model = item.model || 'unknown'
      const existing = modelMap.get(model) || { tokens: 0, cost: 0 }
      existing.tokens += item.tokens_used || 0
      existing.cost += item.cost || 0
      modelMap.set(model, existing)
    }
    const by_model = Array.from(modelMap.entries()).map(([model, data]) => ({ model, ...data }))

    return NextResponse.json({
      usage: {
        total_generated: totalGenerated || 0,
        total_approved: totalApproved || 0,
        total_rejected: totalRejected || 0,
        total_cost: totalCost,
        daily,
        by_type,
        by_model,
      },
    })
  } catch (error) {
    console.error('Failed to fetch LUXAI usage:', error)
    return NextResponse.json({ usage: null }, { status: 500 })
  }
}
