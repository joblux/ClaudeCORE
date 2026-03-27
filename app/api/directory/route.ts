import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { DIRECTORY_ACCESS_ROLES } from '@/types/directory'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId || session.user.status !== 'approved') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role || 'professional'
    if (!DIRECTORY_ACCESS_ROLES.includes(role as any)) {
      return NextResponse.json(
        {
          error: 'Directory access requires Business, Insider, or Executive tier',
          upgrade_required: true,
        },
        { status: 403 }
      )
    }

    const sp = req.nextUrl.searchParams
    const search = sp.get('search')
    const department = sp.get('department')
    const seniority = sp.get('seniority')
    const country = sp.get('country')
    const maison = sp.get('maison')
    const skill = sp.get('skill')
    const page = Math.max(1, parseInt(sp.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') || '20')))
    const offset = (page - 1) * limit

    const db = supabaseAdmin() as any

    // Build query
    let query = db
      .from('members')
      .select(
        'id, first_name, last_name, avatar_url, headline, job_title, maison, current_employer, department, seniority, city, country, years_in_luxury, key_skills, product_categories, profile_completeness, created_at',
        { count: 'exact' }
      )
      .eq('status', 'approved')
      .eq('registration_completed', true)
      .neq('role', 'admin')

    // Apply filters
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,headline.ilike.%${search}%,job_title.ilike.%${search}%,maison.ilike.%${search}%,current_employer.ilike.%${search}%,bio.ilike.%${search}%`
      )
    }
    if (department) query = query.eq('department', department)
    if (seniority) query = query.eq('seniority', seniority)
    if (country) query = query.eq('country', country)
    if (maison) {
      query = query.or(`maison.ilike.%${maison}%,current_employer.ilike.%${maison}%`)
    }
    if (skill) {
      query = query.contains('key_skills', [skill])
    }

    // Sort and paginate
    query = query
      .order('profile_completeness', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: rawMembers, count, error } = await query

    if (error) {
      console.error('Directory list error:', error)
      return NextResponse.json({ error: 'Failed to fetch directory' }, { status: 500 })
    }

    // Trim key_skills and product_categories for list view
    const members = (rawMembers || []).map((m: any) => ({
      ...m,
      key_skills: (m.key_skills || []).slice(0, 5),
      product_categories: (m.product_categories || []).slice(0, 3),
    }))

    // Get filter options from actual member data
    const { data: filterData } = await db
      .from('members')
      .select('country, department, seniority, maison, current_employer')
      .eq('status', 'approved')
      .eq('registration_completed', true)
      .neq('role', 'admin')

    const countries = new Set<string>()
    const departments = new Set<string>()
    const seniorityLevels = new Set<string>()
    const maisonCount: Record<string, number> = {}

    ;(filterData || []).forEach((m: any) => {
      if (m.country) countries.add(m.country)
      if (m.department) departments.add(m.department)
      if (m.seniority) seniorityLevels.add(m.seniority)
      const employer = m.maison || m.current_employer
      if (employer) maisonCount[employer] = (maisonCount[employer] || 0) + 1
    })

    const topMaisons = Object.entries(maisonCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name]) => name)

    return NextResponse.json({
      members,
      total: count || 0,
      page,
      limit,
      filters: {
        countries: Array.from(countries).sort(),
        departments: Array.from(departments).sort(),
        seniority_levels: Array.from(seniorityLevels).sort(),
        top_maisons: topMaisons,
      },
    })
  } catch (err) {
    console.error('Directory API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
