import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Points awarded per contribution type
const POINTS_MAP: Record<string, number> = {
  wikilux_insight: 5,
  salary_data: 10,
  interview_experience: 10,
}

// GET /api/contributions — list contributions
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'
  const memberId = (session?.user as any)?.memberId

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const brandSlug = searchParams.get('brand')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  let query = supabase
    .from('contributions')
    .select('*, members!contributions_member_id_fkey(full_name, first_name, last_name, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Filters
  if (isAdmin && status) {
    query = query.eq('status', status)
  } else if (!isAdmin) {
    // Non-admins see only approved contributions or their own
    if (memberId) {
      query = query.or(`status.eq.approved,member_id.eq.${memberId}`)
    } else {
      query = query.eq('status', 'approved')
    }
  }

  if (type) query = query.eq('contribution_type', type)
  if (brandSlug) query = query.eq('brand_slug', brandSlug)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ contributions: data, total: count, page, limit })
}

// POST /api/contributions — submit a new contribution
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId
  const memberStatus = (session?.user as any)?.status

  if (!memberId || memberStatus !== 'approved') {
    return NextResponse.json({ error: 'You must be an approved member to contribute' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { contribution_type, brand_slug, brand_name, is_anonymous, data: contributionData } = body

    if (!contribution_type || !contributionData) {
      return NextResponse.json({ error: 'Missing contribution_type or data' }, { status: 400 })
    }

    // 1. Create the contribution record
    const { data: contribution, error: contribError } = await supabase
      .from('contributions')
      .insert({
        member_id: memberId,
        contribution_type,
        brand_slug: brand_slug || null,
        brand_name: brand_name || null,
        is_anonymous: is_anonymous || false,
        status: 'pending',
      })
      .select()
      .single()

    if (contribError) {
      return NextResponse.json({ error: contribError.message }, { status: 500 })
    }

    // 2. Insert the type-specific data
    let detailError = null

    if (contribution_type === 'wikilux_insight') {
      const { error } = await supabase
        .from('wikilux_insights')
        .insert({
          contribution_id: contribution.id,
          insight_type: contributionData.insight_type,
          title: contributionData.title || null,
          content: contributionData.content,
          role_held: contributionData.role_held || null,
          years_at_maison: contributionData.years_at_maison || null,
          department: contributionData.department || null,
          location: contributionData.location || null,
        })
      detailError = error
    } else if (contribution_type === 'salary_data') {
      const { error } = await supabase
        .from('salary_contributions')
        .insert({
          contribution_id: contribution.id,
          job_title: contributionData.job_title,
          department: contributionData.department || null,
          seniority: contributionData.seniority || null,
          city: contributionData.city,
          country: contributionData.country,
          base_salary: parseInt(contributionData.base_salary),
          salary_currency: contributionData.salary_currency || 'EUR',
          bonus_amount: contributionData.bonus_amount ? parseInt(contributionData.bonus_amount) : null,
          bonus_type: contributionData.bonus_type || null,
          total_comp: contributionData.total_comp ? parseInt(contributionData.total_comp) : null,
          benefits_notes: contributionData.benefits_notes || null,
          year_of_data: contributionData.year_of_data ? parseInt(contributionData.year_of_data) : null,
          employment_type: contributionData.employment_type || null,
          years_experience: contributionData.years_experience ? parseInt(contributionData.years_experience) : null,
        })
      detailError = error
    } else if (contribution_type === 'interview_experience') {
      const { error } = await supabase
        .from('interview_experiences')
        .insert({
          contribution_id: contribution.id,
          job_title: contributionData.job_title,
          department: contributionData.department || null,
          seniority: contributionData.seniority || null,
          location: contributionData.location || null,
          interview_year: contributionData.interview_year ? parseInt(contributionData.interview_year) : null,
          process_duration: contributionData.process_duration || null,
          number_of_rounds: contributionData.number_of_rounds ? parseInt(contributionData.number_of_rounds) : null,
          interview_format: contributionData.interview_format || null,
          process_description: contributionData.process_description,
          questions_asked: contributionData.questions_asked || null,
          tips: contributionData.tips || null,
          outcome: contributionData.outcome || null,
          difficulty: contributionData.difficulty || null,
          overall_experience: contributionData.overall_experience || null,
        })
      detailError = error
    }

    if (detailError) {
      // Clean up the parent contribution if detail insert failed
      await supabase.from('contributions').delete().eq('id', contribution.id)
      return NextResponse.json({ error: detailError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      contribution_id: contribution.id,
      message: 'Contribution submitted for review. Thank you!',
    }, { status: 201 })

  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
