import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { BRANDS } from '@/lib/wikilux-brands'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const brand = sp.get('brand')
    const department = sp.get('department')
    const seniority = sp.get('seniority')
    const year = sp.get('year')
    const difficulty = sp.get('difficulty')
    const page = Math.max(1, parseInt(sp.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') || '12')))
    const offset = (page - 1) * limit

    const db = supabaseAdmin()

    // Build query for listing
    let query = db
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
      .order('created_at', { ascending: false })

    if (brand) query = query.eq('contributions.brand_slug', brand)
    if (department) query = query.eq('department', department)
    if (seniority) query = query.eq('seniority', seniority)
    if (year) query = query.eq('interview_year', parseInt(year))
    if (difficulty) query = query.eq('difficulty', difficulty)

    query = query.range(offset, offset + limit - 1)

    const { data: rawExperiences, count, error } = await query

    if (error) {
      console.error('Interview list error:', error)
      return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 })
    }

    const experiences = (rawExperiences || []).map((exp: any) => {
      const contrib = Array.isArray(exp.contributions) ? exp.contributions[0] : exp.contributions
      return {
        id: exp.id,
        brand_name: contrib?.brand_name || '',
        brand_slug: contrib?.brand_slug || '',
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

    // Aggregated stats — fetch all approved for stats (unfiltered)
    const { data: allExperiences } = await db
      .from('interview_experiences' as any)
      .select(`
        difficulty,
        interview_format,
        contributions!inner (
          brand_slug,
          status,
          contribution_type
        )
      `)
      .eq('contributions.status', 'approved')
      .eq('contributions.contribution_type', 'interview_experience')

    const allExp = allExperiences || []

    const difficultyDist: Record<string, number> = {}
    const formatDist: Record<string, number> = {}
    const brandSlugs = new Set<string>()

    allExp.forEach((e: any) => {
      const contrib = Array.isArray(e.contributions) ? e.contributions[0] : e.contributions
      if (e.difficulty) difficultyDist[e.difficulty] = (difficultyDist[e.difficulty] || 0) + 1
      if (e.interview_format) formatDist[e.interview_format] = (formatDist[e.interview_format] || 0) + 1
      if (contrib?.brand_slug) brandSlugs.add(contrib.brand_slug)
    })

    // Build distinct brand list for filter dropdown
    const brandList = Array.from(brandSlugs).map(slug => {
      const b = BRANDS.find(br => br.slug === slug)
      return { name: b?.name || slug, slug }
    }).sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({
      experiences,
      stats: {
        total_experiences: allExp.length,
        unique_brands: brandSlugs.size,
        difficulty_distribution: difficultyDist,
        common_formats: formatDist,
      },
      brands: brandList,
      total: count || 0,
      page,
      limit,
    })
  } catch (err) {
    console.error('Interview API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
