import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/members/education
 * List all education records for the authenticated member.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('education_records')
      .select('*')
      .eq('member_id', session.user.memberId)
      .order('graduation_year', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('Fetch education records error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ education_records: data })
  } catch (err) {
    console.error('GET /api/members/education error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/members/education
 * Create a new education record.
 * Required: institution, degree_level, field_of_study.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { institution, degree_level, field_of_study, graduation_year, description } = body

    // Validate required fields
    if (!institution?.trim() || !degree_level?.trim() || !field_of_study?.trim()) {
      return NextResponse.json(
        { error: 'institution, degree_level, and field_of_study are required' },
        { status: 400 }
      )
    }

    const record = {
      member_id: session.user.memberId,
      institution: institution.trim(),
      degree_level: degree_level.trim(),
      field_of_study: field_of_study.trim(),
      graduation_year: graduation_year || null,
      description: description?.trim() || null,
    }

    const { data, error } = await supabase
      .from('education_records')
      .insert(record)
      .select()
      .single()

    if (error) {
      console.error('Create education record error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ education_record: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/members/education error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
