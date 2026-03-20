import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { ACCESS_RANK, COST_OF_LIVING_INDEX } from '@/types/salary'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId || session.user.status !== 'approved') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = supabaseAdmin() as any
    const { data: member } = await db.from('members').select('access_level').eq('id', session.user.memberId).single()
    const level = member?.access_level || 'basic'
    if ((ACCESS_RANK[level] ?? 0) < ACCESS_RANK['premium']) {
      return NextResponse.json({ error: 'Earn 25 points to unlock Salary Comparisons', upgrade_required: true }, { status: 403 })
    }

    const sp = req.nextUrl.searchParams
    const jobTitle = sp.get('job_title')
    const department = sp.get('department')
    const seniority = sp.get('seniority')
    const compareType = sp.get('compare_type') as 'city' | 'brand'
    const items = sp.getAll('items')

    if (!jobTitle || !compareType || items.length === 0) {
      return NextResponse.json({ error: 'job_title, compare_type, and items are required' }, { status: 400 })
    }
    if (items.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 items per comparison' }, { status: 400 })
    }

    const results = []

    for (const item of items) {
      let bmQuery = db.from('salary_benchmarks').select('*').ilike('job_title', `%${jobTitle}%`)
      if (department) bmQuery = bmQuery.eq('department', department)
      if (seniority) bmQuery = bmQuery.eq('seniority', seniority)

      if (compareType === 'city') {
        bmQuery = bmQuery.eq('city', item)
      } else {
        bmQuery = bmQuery.ilike('brand_name', `%${item}%`)
      }

      const { data: bms } = await bmQuery
      const benchmarks = bms || []

      if (benchmarks.length === 0) {
        results.push({
          label: item,
          salary_min: 0,
          salary_max: 0,
          salary_median: 0,
          bonus_min: null,
          bonus_max: null,
          total_comp_min: null,
          total_comp_max: null,
          data_points: 0,
          currency: 'EUR',
          cost_index: compareType === 'city' ? (COST_OF_LIVING_INDEX[item] || null) : null,
        })
        continue
      }

      const mins = benchmarks.map((b: any) => b.salary_min)
      const maxs = benchmarks.map((b: any) => b.salary_max)
      const medians = benchmarks.filter((b: any) => b.salary_median).map((b: any) => b.salary_median)
      const curr = benchmarks[0].currency || 'EUR'

      results.push({
        label: item,
        salary_min: Math.min(...mins),
        salary_max: Math.max(...maxs),
        salary_median: medians.length > 0
          ? Math.round(medians.reduce((a: number, b: number) => a + b, 0) / medians.length)
          : Math.round((Math.min(...mins) + Math.max(...maxs)) / 2),
        bonus_min: benchmarks.some((b: any) => b.bonus_min != null) ? Math.min(...benchmarks.filter((b: any) => b.bonus_min != null).map((b: any) => b.bonus_min)) : null,
        bonus_max: benchmarks.some((b: any) => b.bonus_max != null) ? Math.max(...benchmarks.filter((b: any) => b.bonus_max != null).map((b: any) => b.bonus_max)) : null,
        total_comp_min: benchmarks.some((b: any) => b.total_comp_min != null) ? Math.min(...benchmarks.filter((b: any) => b.total_comp_min != null).map((b: any) => b.total_comp_min)) : null,
        total_comp_max: benchmarks.some((b: any) => b.total_comp_max != null) ? Math.max(...benchmarks.filter((b: any) => b.total_comp_max != null).map((b: any) => b.total_comp_max)) : null,
        data_points: benchmarks.length,
        currency: curr,
        cost_index: compareType === 'city' ? (COST_OF_LIVING_INDEX[item] || null) : null,
      })
    }

    return NextResponse.json({
      compare_type: compareType,
      role: jobTitle,
      items: results,
    })
  } catch (err) {
    console.error('Compare API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
