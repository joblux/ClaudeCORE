export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { ACCESS_RANK } from '@/types/salary'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId || session.user.status !== 'approved') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = supabaseAdmin() as any
    const { data: member } = await db.from('members').select('access_level').eq('id', session.user.memberId).single()
    const level = member?.access_level || 'basic'
    if ((ACCESS_RANK[level] ?? 0) < ACCESS_RANK['standard']) {
      return NextResponse.json({ error: 'Earn 10 points to unlock Salary Benchmarks', upgrade_required: true }, { status: 403 })
    }

    const sp = req.nextUrl.searchParams
    const jobTitle = sp.get('job_title')
    const department = sp.get('department')
    const seniority = sp.get('seniority')
    const city = sp.get('city')
    const brand = sp.get('brand')
    const currentSalary = sp.get('current_salary') ? parseInt(sp.get('current_salary')!) : null

    if (!jobTitle || !city) {
      return NextResponse.json({ error: 'job_title and city are required' }, { status: 400 })
    }

    // Fetch matching benchmarks
    let bmQuery = db.from('salary_benchmarks').select('*').eq('is_published', true).ilike('job_title', `%${jobTitle}%`).eq('city', city)
    if (department) bmQuery = bmQuery.eq('department', department)
    if (seniority) bmQuery = bmQuery.eq('seniority', seniority)
    if (brand) bmQuery = bmQuery.ilike('brand_name', `%${brand}%`)
    const { data: benchmarks } = await bmQuery

    // Fetch matching contributions (3+ for privacy)
    let cQuery = db.from('salary_contributions').select('base_salary, salary_currency, contributions!inner(status, contribution_type)')
      .eq('contributions.status', 'approved').eq('contributions.contribution_type', 'salary_data')
      .ilike('job_title', `%${jobTitle}%`).eq('city', city)
    if (department) cQuery = cQuery.eq('department', department)
    if (seniority) cQuery = cQuery.eq('seniority', seniority)
    const { data: contribs } = await cQuery
    const validContribs = (contribs || []).length >= 3 ? (contribs || []) : []

    // Collect all salary values
    const allSalaries: number[] = []
    const bms = benchmarks || []
    let currency = 'EUR'

    bms.forEach((b: any) => {
      allSalaries.push(b.salary_min, b.salary_max)
      if (b.salary_median) allSalaries.push(b.salary_median)
      currency = b.currency || currency
    })
    validContribs.forEach((c: any) => {
      allSalaries.push(c.base_salary)
      currency = c.salary_currency || currency
    })

    if (allSalaries.length === 0) {
      return NextResponse.json({
        result: null,
        message: 'No salary data available for this combination. Try broadening your search.',
      })
    }

    allSalaries.sort((a, b) => a - b)
    const salMin = allSalaries[0]
    const salMax = allSalaries[allSalaries.length - 1]
    const salMedian = allSalaries[Math.floor(allSalaries.length / 2)]
    const p25 = allSalaries[Math.floor(allSalaries.length * 0.25)]
    const p75 = allSalaries[Math.floor(allSalaries.length * 0.75)]

    // Calculate user percentile
    let userPercentile: number | null = null
    if (currentSalary != null) {
      const below = allSalaries.filter(s => s <= currentSalary).length
      userPercentile = Math.round((below / allSalaries.length) * 100)
    }

    // Same role in other cities
    const { data: otherCityBms } = await db.from('salary_benchmarks').select('city, salary_median, currency')
      .eq('is_published', true).ilike('job_title', `%${jobTitle}%`).neq('city', city).not('salary_median', 'is', null).limit(10)

    const cityMap = new Map<string, { total: number; count: number; currency: string }>()
    ;(otherCityBms || []).forEach((b: any) => {
      const existing = cityMap.get(b.city)
      if (existing) { existing.total += b.salary_median; existing.count++ }
      else cityMap.set(b.city, { total: b.salary_median, count: 1, currency: b.currency })
    })

    const otherCities = Array.from(cityMap.entries())
      .map(([c, v]) => ({ city: c, median: Math.round(v.total / v.count), currency: v.currency }))
      .sort((a, b) => b.median - a.median)
      .slice(0, 5)

    return NextResponse.json({
      result: {
        role: jobTitle,
        city,
        salary_min: salMin,
        salary_max: salMax,
        salary_median: salMedian,
        percentile_25: p25,
        percentile_75: p75,
        currency,
        data_points: allSalaries.length,
        confidence: validContribs.length > 0 ? 'aggregated' : bms.length > 0 ? 'estimated' : 'limited',
        user_percentile: userPercentile,
        other_cities: otherCities,
      },
    })
  } catch (err) {
    console.error('Benchmark API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
