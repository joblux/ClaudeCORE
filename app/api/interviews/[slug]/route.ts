import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Look up brand from DB instead of static array
    const { data: brand } = await supabase
      .from('wikilux_content')
      .select('slug, brand_name, sector')
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle()

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const sp = req.nextUrl.searchParams
    const page = Math.max(1, parseInt(sp.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') || '20')))
    const offset = (page - 1) * limit

    const db = supabaseAdmin()

    const { data: rawExperiences, count, error } = await db
      .from('interview_experiences' as any)
      .select(`
        id,
        job_title,
        department,
        seniority,
        location,
        interview_year,
        number_of_rounds,
        interview_format,
        difficulty,
        overall_experience,
        outcome,
        created_at,
        contributions!inner (
          id,
          brand_name,
          brand_slug,
          is_anonymous,
          status,
          contribution_type
        )
      `, { count: 'exact' })
      .eq('contributions.status', 'approved')
      .eq('contributions.contribution_type', 'interview_experience')
      .eq('contributions.brand_slug', slug)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Brand interview error:', error)
      return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 })
    }

    const experiences = (rawExperiences || []).map((exp: any) => {
      const contrib = Array.isArray(exp.contributions) ? exp.contributions[0] : exp.contributions
      return {
        id: exp.id,
        brand_name: contrib?.brand_name || brand.brand_name,
        brand_slug: contrib?.brand_slug || slug,
        job_title: exp.job_title,
        department: exp.department,
        seniority: exp.seniority,
        location: exp.location,
        interview_year: exp.interview_year,
        number_of_rounds: exp.number_of_rounds,
        interview_format: exp.interview_format,
        difficulty: exp.difficulty,
        overall_experience: exp.overall_experience,
        outcome: exp.outcome,
        is_anonymous: contrib?.is_anonymous ?? true,
        created_at: exp.created_at,
      }
    })

    // Compute summary stats
    const difficultyBreakdown: Record<string, number> = {}
    const formatCount: Record<string, number> = {}
    const deptSet = new Set<string>()
    let totalRounds = 0
    let roundsCount = 0
    let minYear = Infinity
    let maxYear = -Infinity

    // For full stats, fetch all (not just paginated)
    const { data: allBrandExps } = await db
      .from('interview_experiences' as any)
      .select(`
        difficulty, interview_format, department, number_of_rounds, interview_year,
        contributions!inner (status, contribution_type, brand_slug)
      `)
      .eq('contributions.status', 'approved')
      .eq('contributions.contribution_type', 'interview_experience')
      .eq('contributions.brand_slug', slug)

    ;(allBrandExps || []).forEach((e: any) => {
      if (e.difficulty) difficultyBreakdown[e.difficulty] = (difficultyBreakdown[e.difficulty] || 0) + 1
      if (e.interview_format) formatCount[e.interview_format] = (formatCount[e.interview_format] || 0) + 1
      if (e.department) deptSet.add(e.department)
      if (e.number_of_rounds) { totalRounds += e.number_of_rounds; roundsCount++ }
      if (e.interview_year) {
        minYear = Math.min(minYear, e.interview_year)
        maxYear = Math.max(maxYear, e.interview_year)
      }
    })

    const totalAll = (allBrandExps || []).length

    // Find most common format
    let commonFormat: string | null = null
    let maxFormatCount = 0
    Object.entries(formatCount).forEach(([fmt, cnt]) => {
      if (cnt > maxFormatCount) { commonFormat = fmt; maxFormatCount = cnt }
    })

    return NextResponse.json({
      brand: {
        name: brand.brand_name,
        slug: brand.slug,
        sector: brand.sector || null,
      },
      summary: {
        brand_name: brand.brand_name,
        brand_slug: brand.slug,
        brand_sector: brand.sector || null,
        total_experiences: totalAll,
        difficulty_breakdown: difficultyBreakdown,
        avg_rounds: roundsCount > 0 ? Math.round((totalRounds / roundsCount) * 10) / 10 : null,
        common_format: commonFormat,
        common_departments: Array.from(deptSet).slice(0, 5),
        year_range: minYear !== Infinity ? { min: minYear, max: maxYear } : null,
      },
      experiences,
      total: count || 0,
      page,
      limit,
    })
  } catch (err) {
    console.error('Brand interview API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
