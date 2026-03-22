import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { ACCESS_RANK } from '@/types/salary'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId || session.user.status !== 'approved') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = supabaseAdmin() as any
    const { data: member } = await db.from('members').select('access_level').eq('id', session.user.memberId).single()
    const level = member?.access_level || 'basic'
    if ((ACCESS_RANK[level] ?? 0) < ACCESS_RANK['full']) {
      return NextResponse.json({ error: 'Earn 50 points to unlock the Salary Calculator', upgrade_required: true }, { status: 403 })
    }

    const body = await req.json()
    const { job_title, department, seniority, city, country, brand, years_experience, skills } = body

    if (!job_title || !city) {
      return NextResponse.json({ error: 'job_title and city are required' }, { status: 400 })
    }

    // Fetch matching benchmarks
    let bmQuery = db.from('salary_benchmarks').select('*').ilike('job_title', `%${job_title}%`)
    if (city) bmQuery = bmQuery.eq('city', city)
    if (department) bmQuery = bmQuery.eq('department', department)
    if (seniority) bmQuery = bmQuery.eq('seniority', seniority)
    if (brand) bmQuery = bmQuery.ilike('brand_name', `%${brand}%`)
    const { data: exactBms } = await bmQuery

    // Broader search if not enough data
    let bmBroad: any[] = []
    if ((exactBms || []).length < 2) {
      const { data } = await db.from('salary_benchmarks').select('*').ilike('job_title', `%${job_title}%`).limit(20)
      bmBroad = data || []
    }

    // Fetch contributions
    let cQuery = db.from('salary_contributions').select('base_salary, bonus_amount, total_comp, salary_currency, years_experience, contributions!inner(status, contribution_type)')
      .eq('contributions.status', 'approved').eq('contributions.contribution_type', 'salary_data')
      .ilike('job_title', `%${job_title}%`)
    if (city) cQuery = cQuery.eq('city', city)
    const { data: contribs } = await cQuery
    const validContribs = (contribs || []).length >= 3 ? (contribs || []) : []

    const allBms = [...(exactBms || []), ...bmBroad]
    const salaries: number[] = []
    let currency = 'EUR'
    const factors: string[] = []
    const recommendations: string[] = []

    allBms.forEach((b: any) => {
      salaries.push(b.salary_min, b.salary_max)
      if (b.salary_median) salaries.push(b.salary_median)
      currency = b.currency || currency
    })
    validContribs.forEach((c: any) => {
      salaries.push(c.base_salary)
      currency = c.salary_currency || currency
    })

    if (salaries.length === 0) {
      return NextResponse.json({
        result: null,
        message: 'Not enough data to generate an estimate for this combination.',
      })
    }

    salaries.sort((a, b) => a - b)
    let baseLow = salaries[Math.floor(salaries.length * 0.25)]
    let baseMid = salaries[Math.floor(salaries.length * 0.5)]
    let baseHigh = salaries[Math.floor(salaries.length * 0.75)]

    // Experience adjustment
    const yrsExp = years_experience || 0
    if (yrsExp > 10) {
      const expMultiplier = 1 + Math.min((yrsExp - 5) * 0.02, 0.2)
      baseLow = Math.round(baseLow * expMultiplier)
      baseMid = Math.round(baseMid * expMultiplier)
      baseHigh = Math.round(baseHigh * expMultiplier)
      factors.push(`${yrsExp} years of experience places you in the upper range`)
    } else if (yrsExp > 5) {
      const expMultiplier = 1 + (yrsExp - 5) * 0.015
      baseMid = Math.round(baseMid * expMultiplier)
      baseHigh = Math.round(baseHigh * expMultiplier)
      factors.push(`${yrsExp} years of experience provides a moderate premium`)
    } else if (yrsExp > 0) {
      factors.push(`${yrsExp} years of experience — early career range`)
    }

    // Brand premium
    const premiumBrands = ['chanel', 'hermes', 'louis vuitton', 'dior', 'cartier', 'van cleef']
    if (brand && premiumBrands.some(pb => brand.toLowerCase().includes(pb))) {
      baseMid = Math.round(baseMid * 1.05)
      baseHigh = Math.round(baseHigh * 1.1)
      factors.push(`${brand} typically offers above-market compensation`)
    }

    // Skills premium
    const premiumSkills = ['clienteling', 'crm', 'high net worth', 'multilingual', 'p&l']
    const matchedSkills = (skills || []).filter((s: string) =>
      premiumSkills.some(ps => s.toLowerCase().includes(ps))
    )
    if (matchedSkills.length > 0) {
      const skillMultiplier = 1 + matchedSkills.length * 0.02
      baseMid = Math.round(baseMid * skillMultiplier)
      baseHigh = Math.round(baseHigh * skillMultiplier)
      factors.push(`In-demand skills (${matchedSkills.join(', ')}) command a premium`)
    }

    // Bonus estimates
    const bonusLow = Math.round(baseLow * 0.05)
    const bonusHigh = Math.round(baseHigh * 0.2)

    // Recommendations
    if (city !== 'Zurich' && city !== 'Geneva' && city !== 'New York') {
      recommendations.push('Consider markets like Zurich or New York where compensation for similar roles tends to be higher')
    }
    if (!matchedSkills.length) {
      recommendations.push('Developing skills in clienteling, CRM, or multilingual capabilities can increase your earning potential')
    }
    if (yrsExp < 5) {
      recommendations.push('Focus on building luxury-specific experience — compensation increases significantly after 5+ years in the sector')
    }
    recommendations.push('Contribute your own salary data to improve estimates for the entire ecosystem')

    const confidence = validContribs.length > 0 ? 'aggregated' : (exactBms || []).length > 3 ? 'estimated' : 'limited'

    return NextResponse.json({
      result: {
        estimated_low: baseLow,
        estimated_mid: baseMid,
        estimated_high: baseHigh,
        bonus_low: bonusLow,
        bonus_high: bonusHigh,
        total_comp_low: baseLow + bonusLow,
        total_comp_high: baseHigh + bonusHigh,
        currency,
        confidence,
        data_points: salaries.length,
        factors,
        recommendations,
      },
    })
  } catch (err) {
    console.error('Calculator API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
