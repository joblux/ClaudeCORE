export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    // Session check is optional — RLS handles access control
    // Unauthenticated users can still see salary_benchmarks via public read policy
    let _session: any = null
    try {
      _session = await getServerSession(authOptions)
    } catch { /* session check may fail in edge cases */ }

    const sp = req.nextUrl.searchParams
    const brand = sp.get('brand')
    const department = sp.get('department')
    const seniority = sp.get('seniority')
    const city = sp.get('city')
    const country = sp.get('country')
    const currency = sp.get('currency')
    const page = Math.max(1, parseInt(sp.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') || '20')))
    const offset = (page - 1) * limit

    const db = supabaseAdmin() as any

    // Fetch benchmarks
    let bmQuery = db
      .from('salary_benchmarks')
      .select('*')

    if (brand) bmQuery = bmQuery.ilike('brand_name', `%${brand}%`)
    if (department) bmQuery = bmQuery.eq('department', department)
    if (seniority) bmQuery = bmQuery.eq('seniority', seniority)
    if (city) bmQuery = bmQuery.eq('city', city)
    if (country) bmQuery = bmQuery.eq('country', country)
    if (currency) bmQuery = bmQuery.eq('currency', currency)

    const { data: benchmarks, error: bmError } = await bmQuery
    if (bmError) console.error('Salary benchmarks error:', bmError)
    const bms = benchmarks || []

    // Fetch approved salary contributions (may fail if table/join doesn't exist)
    let contribs: any[] = []
    try {
      let contribQuery = db
        .from('salary_contributions')
        .select(`
          *, contributions!inner (
            brand_name, brand_slug, status, contribution_type
          )
        `)
        .eq('contributions.status', 'approved')
        .eq('contributions.contribution_type', 'salary_data')

      if (department) contribQuery = contribQuery.eq('department', department)
      if (seniority) contribQuery = contribQuery.eq('seniority', seniority)
      if (city) contribQuery = contribQuery.eq('city', city)
      if (country) contribQuery = contribQuery.eq('country', country)
      if (currency) contribQuery = contribQuery.eq('salary_currency', currency)
      if (brand) {
        contribQuery = contribQuery.ilike('contributions.brand_name', `%${brand}%`)
      }

      const { data: contributions } = await contribQuery
      contribs = (contributions || []) as any[]
    } catch {
      // salary_contributions table may not exist yet — continue with benchmarks only
    }

    // Aggregate by role+brand+city
    const aggregateMap = new Map<string, any>()

    // Add benchmarks
    bms.forEach((b: any) => {
      const key = `${b.job_title}|${b.brand_name}|${b.city}|${b.currency}`
      const existing = aggregateMap.get(key)
      if (existing) {
        existing.salary_min = Math.min(existing.salary_min, b.salary_min)
        existing.salary_max = Math.max(existing.salary_max, b.salary_max)
        if (b.salary_median) existing.medians.push(b.salary_median)
        if (b.bonus_min != null) existing.bonus_min = Math.min(existing.bonus_min ?? Infinity, b.bonus_min)
        if (b.bonus_max != null) existing.bonus_max = Math.max(existing.bonus_max ?? 0, b.bonus_max)
        existing.sources.benchmark++
        existing.data_points++
      } else {
        aggregateMap.set(key, {
          brand_name: b.brand_name,
          brand_slug: b.brand_slug,
          job_title: b.job_title,
          department: b.department,
          seniority: b.seniority,
          city: b.city,
          country: b.country,
          currency: b.currency,
          salary_min: b.salary_min,
          salary_max: b.salary_max,
          medians: b.salary_median ? [b.salary_median] : [],
          bonus_min: b.bonus_min,
          bonus_max: b.bonus_max,
          total_comp_min: b.total_comp_min,
          total_comp_max: b.total_comp_max,
          confidence: b.confidence,
          sources: { benchmark: 1, contribution: 0 },
          data_points: 1,
        })
      }
    })

    // Add contributions (only aggregate if 3+ for privacy)
    const contribGroups = new Map<string, any[]>()
    contribs.forEach((c: any) => {
      const contrib = Array.isArray(c.contributions) ? c.contributions[0] : c.contributions
      const brandName = contrib?.brand_name || ''
      const curr = c.salary_currency || 'EUR'
      const key = `${c.job_title}|${brandName}|${c.city}|${curr}`
      if (!contribGroups.has(key)) contribGroups.set(key, [])
      contribGroups.get(key)!.push({ ...c, _brand_name: brandName, _brand_slug: contrib?.brand_slug })
    })

    contribGroups.forEach((group, key) => {
      if (group.length < 3) return // Privacy: minimum 3 data points
      const salaries = group.map(g => g.base_salary).sort((a: number, b: number) => a - b)
      const minSal = salaries[0]
      const maxSal = salaries[salaries.length - 1]
      const medianSal = salaries[Math.floor(salaries.length / 2)]
      const sample = group[0]

      const existing = aggregateMap.get(key)
      if (existing) {
        existing.salary_min = Math.min(existing.salary_min, minSal)
        existing.salary_max = Math.max(existing.salary_max, maxSal)
        existing.medians.push(medianSal)
        existing.sources.contribution += group.length
        existing.data_points += group.length
        existing.confidence = 'aggregated'
      } else {
        aggregateMap.set(key, {
          brand_name: sample._brand_name,
          brand_slug: sample._brand_slug,
          job_title: sample.job_title,
          department: sample.department,
          seniority: sample.seniority,
          city: sample.city,
          country: sample.country,
          currency: sample.salary_currency || 'EUR',
          salary_min: minSal,
          salary_max: maxSal,
          medians: [medianSal],
          bonus_min: null,
          bonus_max: null,
          total_comp_min: null,
          total_comp_max: null,
          confidence: 'aggregated',
          sources: { benchmark: 0, contribution: group.length },
          data_points: group.length,
        })
      }
    })

    // Convert to array and sort
    let entries = Array.from(aggregateMap.values()).map((e, i) => ({
      id: `agg-${i}`,
      brand_name: e.brand_name,
      brand_slug: e.brand_slug,
      job_title: e.job_title,
      department: e.department,
      seniority: e.seniority,
      city: e.city,
      country: e.country,
      currency: e.currency,
      salary_min: e.salary_min,
      salary_max: e.salary_max,
      salary_median: e.medians.length > 0
        ? Math.round(e.medians.reduce((a: number, b: number) => a + b, 0) / e.medians.length)
        : Math.round((e.salary_min + e.salary_max) / 2),
      bonus_min: e.bonus_min,
      bonus_max: e.bonus_max,
      total_comp_min: e.total_comp_min,
      total_comp_max: e.total_comp_max,
      data_points: e.data_points,
      confidence: e.confidence,
      sources: e.sources,
    }))

    entries.sort((a, b) => b.data_points - a.data_points)
    const totalEntries = entries.length
    entries = entries.slice(offset, offset + limit)

    // Build filter options from all data
    const allBrands = new Set<string>()
    const allDepts = new Set<string>()
    const allSeniority = new Set<string>()
    const allCities = new Set<string>()
    const allCountries = new Set<string>()
    const allCurrencies = new Set<string>()
    let totalDP = 0

    aggregateMap.forEach(e => {
      if (e.brand_name) allBrands.add(e.brand_name)
      if (e.department) allDepts.add(e.department)
      if (e.seniority) allSeniority.add(e.seniority)
      if (e.city) allCities.add(e.city)
      if (e.country) allCountries.add(e.country)
      if (e.currency) allCurrencies.add(e.currency)
      totalDP += e.data_points
    })

    return NextResponse.json({
      entries,
      total: totalEntries,
      page,
      limit,
      stats: {
        total_data_points: totalDP,
        unique_brands: allBrands.size,
        unique_cities: allCities.size,
        unique_roles: new Set(Array.from(aggregateMap.values()).map(e => e.job_title)).size,
      },
      filters: {
        brands: Array.from(allBrands).sort(),
        departments: Array.from(allDepts).sort(),
        seniority_levels: Array.from(allSeniority).sort(),
        cities: Array.from(allCities).sort(),
        countries: Array.from(allCountries).sort(),
        currencies: Array.from(allCurrencies).sort(),
      },
    })
  } catch (err) {
    console.error('Salary API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
