import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // This month stats
    const { data: thisMonth } = await supabase
      .from('luxai_history')
      .select('cost_usd, tokens_used')
      .gte('created_at', firstDayThisMonth.toISOString())
      .eq('status', 'success')

    // Last month stats
    const { data: lastMonth } = await supabase
      .from('luxai_history')
      .select('cost_usd')
      .gte('created_at', firstDayLastMonth.toISOString())
      .lte('created_at', lastDayLastMonth.toISOString())
      .eq('status', 'success')

    // Request history (last 50)
    const { data: history } = await supabase
      .from('luxai_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    const thisMonthCost = thisMonth?.reduce((sum, item) => sum + (item.cost_usd || 0), 0) || 0
    const lastMonthCost = lastMonth?.reduce((sum, item) => sum + (item.cost_usd || 0), 0) || 0
    const avgCost = thisMonth && thisMonth.length > 0 ? thisMonthCost / thisMonth.length : 0

    return NextResponse.json({
      stats: {
        this_month: thisMonthCost,
        last_month: lastMonthCost,
        avg_cost: avgCost,
        this_month_requests: thisMonth?.length || 0,
        last_month_requests: lastMonth?.length || 0,
      },
      history: history || [],
    })
  } catch (error) {
    return NextResponse.json({ 
      stats: { 
        this_month: 0, 
        last_month: 0, 
        avg_cost: 0,
        this_month_requests: 0,
        last_month_requests: 0
      }, 
      history: [] 
    })
  }
}
