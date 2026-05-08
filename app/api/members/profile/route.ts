import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Allowed fields for profile update
const ALLOWED_FIELDS = [
  'first_name', 'last_name', 'headline', 'bio', 'phone', 'city', 'country',
  'nationality', 'linkedin_url', 'date_of_birth', 'job_title', 'current_employer',
  'total_years_experience', 'years_in_luxury', 'seniority', 'department',
  'key_skills', 'software_tools', 'certifications', 'product_categories',
  'brands_worked_with', 'client_segment_experience', 'market_knowledge',
  'clienteling_experience', 'clienteling_description', 'availability',
  'desired_salary_min', 'desired_salary_max', 'desired_salary_currency',
  'open_to_relocation', 'relocation_preferences', 'desired_locations',
  'desired_contract_types', 'desired_departments',
]

/**
 * GET /api/members/profile
 * Returns the full member profile with related records.
 * Optional ?email= param for admin to view other profiles.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const requestedEmail = searchParams.get('email') || session.user.email

    // Only admins can view other members' profiles
    if (requestedEmail !== session.user.email && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch the member record
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('email', requestedEmail)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Fetch all related records in parallel
    const [workExp, education, languages, documents] = await Promise.all([
      supabase
        .from('work_experiences')
        .select('*')
        .eq('member_id', member.id)
        .order('is_current', { ascending: false })
        .order('start_date', { ascending: false }),
      supabase
        .from('education_records')
        .select('*')
        .eq('member_id', member.id)
        .order('graduation_year', { ascending: false, nullsFirst: false }),
      supabase
        .from('member_languages')
        .select('*')
        .eq('member_id', member.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('member_documents')
        .select('*')
        .eq('member_id', member.id)
        .order('uploaded_at', { ascending: false }),
    ])

    return NextResponse.json({
      member,
      work_experiences: workExp.data ?? [],
      education_records: education.data ?? [],
      languages: languages.data ?? [],
      documents: documents.data ?? [],
    })
  } catch (err) {
    console.error('GET /api/members/profile error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Core update logic shared by PUT and POST.
 */
async function handleProfileUpdate(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Determine which email/member to update
    const targetEmail = body.email || session.user.email

    // Only admins can edit other members' profiles
    if (targetEmail !== session.user.email && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Filter to only allowed fields
    const updateData: Record<string, unknown> = {}
    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Perform the update
    const { error: updateError } = await supabase
      .from('members')
      .update(updateData)
      .eq('email', targetEmail)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Profile update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/members/profile
 * Update member profile fields.
 */
export async function PUT(req: NextRequest) {
  return handleProfileUpdate(req)
}

/**
 * POST /api/members/profile
 * Backwards-compatible alias for PUT (used by old ProfileClient).
 */
export async function POST(req: NextRequest) {
  return handleProfileUpdate(req)
}
