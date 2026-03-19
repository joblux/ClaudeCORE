import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/members/work-experience
 * List all work experiences for the authenticated member.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('work_experiences')
      .select('*')
      .eq('member_id', session.user.memberId)
      .order('is_current', { ascending: false })
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Fetch work experiences error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ work_experiences: data })
  } catch (err) {
    console.error('GET /api/members/work-experience error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/members/work-experience
 * Create a new work experience record.
 * Required: job_title, company, start_date.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { job_title, company, start_date, end_date, is_current, description, location, department, brand } = body

    // Validate required fields
    if (!job_title?.trim() || !company?.trim() || !start_date) {
      return NextResponse.json(
        { error: 'job_title, company, and start_date are required' },
        { status: 400 }
      )
    }

    const record = {
      member_id: session.user.memberId,
      job_title: job_title.trim(),
      company: company.trim(),
      start_date,
      end_date: is_current ? null : (end_date || null),
      is_current: is_current || false,
      description: description?.trim() || null,
      location: location?.trim() || null,
      department: department?.trim() || null,
      brand: brand?.trim() || null,
    }

    const { data, error } = await supabase
      .from('work_experiences')
      .insert(record)
      .select()
      .single()

    if (error) {
      console.error('Create work experience error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ work_experience: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/members/work-experience error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
