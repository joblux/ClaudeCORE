import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { DIRECTORY_ACCESS_ROLES } from '@/types/directory'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId || session.user.status !== 'approved') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role || 'professional'
    if (!(DIRECTORY_ACCESS_ROLES as readonly string[]).includes(role)) {
      return NextResponse.json(
        { error: 'Directory access requires Business, Insider, or Executive tier', upgrade_required: true },
        { status: 403 }
      )
    }

    const { id } = params
    const db = supabaseAdmin() as any

    // Fetch member profile (safe fields only)
    const { data: member, error } = await db
      .from('members')
      .select(
        'id, full_name, first_name, last_name, avatar_url, headline, job_title, maison, current_employer, department, seniority, city, country, years_in_luxury, key_skills, product_categories, profile_completeness, created_at, bio, nationality, total_years_experience, brands_worked_with, client_segment_experience, market_knowledge, areas_of_expertise, speciality, linkedin_url, role, status'
      )
      .eq('id', id)
      .eq('status', 'approved')
      .neq('role', 'admin')
      .single()

    if (error || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const m = member as any

    // Build profile response
    const profile: Record<string, any> = {
      id: m.id,
      full_name: m.full_name,
      first_name: m.first_name,
      last_name: m.last_name,
      avatar_url: m.avatar_url,
      headline: m.headline,
      job_title: m.job_title,
      maison: m.maison,
      current_employer: m.current_employer,
      department: m.department,
      seniority: m.seniority,
      city: m.city,
      country: m.country,
      years_in_luxury: m.years_in_luxury,
      key_skills: m.key_skills || [],
      product_categories: m.product_categories || [],
      profile_completeness: m.profile_completeness,
      created_at: m.created_at,
      bio: m.bio,
      nationality: m.nationality,
      total_years_experience: m.total_years_experience,
      brands_worked_with: m.brands_worked_with || [],
      client_segment_experience: m.client_segment_experience || [],
      market_knowledge: m.market_knowledge || [],
      areas_of_expertise: m.areas_of_expertise,
      speciality: m.speciality,
      role: m.role,
    }

    // LinkedIn only for admin and business viewers
    if (role === 'admin' || role === 'business') {
      profile.linkedin_url = m.linkedin_url
    }

    // Fetch work experiences
    const { data: workExps } = await db
      .from('work_experiences')
      .select('id, company, job_title, city, country, start_date, end_date, is_current')
      .eq('member_id', id)
      .order('is_current', { ascending: false })
      .order('start_date', { ascending: false })

    // Fetch education
    const { data: education } = await db
      .from('education_records')
      .select('id, institution, degree_level, field_of_study, graduation_year')
      .eq('member_id', id)
      .order('graduation_year', { ascending: false })

    // Fetch languages
    const { data: languages } = await db
      .from('member_languages')
      .select('id, language, proficiency')
      .eq('member_id', id)

    // Fetch contribution count
    const { count: contributionCount } = await db
      .from('contributions')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', id)
      .eq('status', 'approved')

    profile.work_experiences = (workExps || []).map((w: any) => ({
      id: w.id,
      company: w.company,
      job_title: w.job_title,
      city: w.city,
      country: w.country,
      start_date: w.start_date,
      end_date: w.end_date,
      is_current: w.is_current,
    }))
    profile.education_records = education || []
    profile.languages = languages || []
    profile.contribution_count = contributionCount || 0

    return NextResponse.json({ member: profile })
  } catch (err) {
    console.error('Directory profile API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
