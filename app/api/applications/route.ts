import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resolveProfiLux } from '@/lib/profilux/resolveProfiLux'
import { projectFor } from '@/lib/profilux/projectFor'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Shared select query for applications with joined search_assignment data.
// Member fields are resolved per-row via resolveAtsMember (Phase 3 Surface 3).
const APPLICATION_SELECT = `
  *,
  search_assignment:search_assignments!search_assignment_id(id, title, maison, is_confidential, city, country, reference_number, status)
`

/**
 * ATS member adapter — Phase 3 Surface 3.
 * Wraps applications.member_id through resolveProfiLux + projectFor('ats')
 * and projects the 11-field shape the ATS UI consumes.
 * full_name derived from first_name + last_name (NULL-safe).
 * Returns null when the member row is missing (orphan application).
 */
async function resolveAtsMember(memberId: string, supabase: any) {
  const resolved = await resolveProfiLux(memberId, supabase)
  if (!resolved) return null
  const projection = projectFor(resolved, 'ats')
  if (projection.surface !== 'ats') return null
  const v = projection.view
  const fullName = [v.first_name, v.last_name].filter(Boolean).join(' ') || null
  return {
    id: v.id,
    full_name: fullName,
    email: v.email,
    avatar_url: v.avatar_url,
    job_title: v.job_title,
    maison: v.maison,
    city: v.city,
    country: v.country,
    headline: v.headline,
    seniority: v.seniority,
    years_in_luxury: v.years_in_luxury,
  }
}

/**
 * GET /api/applications
 * List applications with filtering, sorting, and pagination. Admin only.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const searchAssignmentId = searchParams.get('search_assignment_id')
  const stage = searchParams.get('stage')
  const memberId = searchParams.get('member_id')
  const source = searchParams.get('source')
  const assignedRecruiter = searchParams.get('assigned_recruiter')
  const sort = searchParams.get('sort') || 'applied_at_desc'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))

  try {
    let query = supabase
      .from('applications')
      .select(APPLICATION_SELECT, { count: 'exact' })

    // Apply filters
    if (searchAssignmentId) {
      query = query.eq('search_assignment_id', searchAssignmentId)
    }
    if (stage) {
      // Support comma-separated stages: "applied,screening,shortlisted"
      const stages = stage.split(',').map((s) => s.trim())
      query = query.in('current_stage', stages)
    }
    if (memberId) {
      query = query.eq('member_id', memberId)
    }
    if (source) {
      query = query.eq('source', source)
    }
    if (assignedRecruiter) {
      query = query.eq('assigned_recruiter', assignedRecruiter)
    }

    // Apply sorting
    switch (sort) {
      case 'applied_at_asc':
        query = query.order('applied_at', { ascending: true })
        break
      case 'updated_at_desc':
        query = query.order('updated_at', { ascending: false })
        break
      case 'rating_desc':
        query = query.order('rating', { ascending: false, nullsFirst: false })
        break
      case 'applied_at_desc':
      default:
        query = query.order('applied_at', { ascending: false })
        break
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, count, error } = await query

    if (error) {
      console.error('[GET /api/applications] Query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // N+1 accepted for admin-only ATS list (parked optimization,
    // post-Phase-3). Promise.all keeps round-trips parallel.
    const rows = data || []
    const enriched = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        member: await resolveAtsMember(row.member_id, supabase),
      }))
    )

    return NextResponse.json({
      applications: enriched,
      total: count || 0,
      page,
      limit,
    })
  } catch (err) {
    console.error('[GET /api/applications] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/applications
 * Create a new application.
 * - Non-admin users: self-apply (member_id = own ID, source = 'self_applied')
 * - Admin users: can specify member_id, source, assigned_recruiter, etc.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !session.user.memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const isAdmin = session.user.role === 'admin'

    // Determine application fields based on role
    let memberId: string
    let searchAssignmentId: string
    let applicationSource: string
    let assignedRecruiter: string | null = null
    let initialNote: string | null = null

    if (isAdmin) {
      // Admin can create applications for any member
      if (!body.member_id || !body.search_assignment_id) {
        return NextResponse.json(
          { error: 'member_id and search_assignment_id are required' },
          { status: 400 }
        )
      }
      memberId = body.member_id
      searchAssignmentId = body.search_assignment_id
      applicationSource = body.source || 'sourced_by_recruiter'
      assignedRecruiter = body.assigned_recruiter || null
      initialNote = body.note || null
    } else {
      // Non-admin: self-apply only
      if (!body.search_assignment_id) {
        return NextResponse.json(
          { error: 'search_assignment_id is required' },
          { status: 400 }
        )
      }
      memberId = session.user.memberId
      searchAssignmentId = body.search_assignment_id
      applicationSource = 'self_applied'
    }

    // Check for duplicate application (same member + same assignment)
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('member_id', memberId)
      .eq('search_assignment_id', searchAssignmentId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'An application already exists for this candidate and position' },
        { status: 409 }
      )
    }

    // Insert the application
    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert({
        member_id: memberId,
        search_assignment_id: searchAssignmentId,
        source: applicationSource,
        current_stage: 'applied',
        assigned_recruiter: assignedRecruiter,
      })
      .select('id')
      .single()

    if (insertError) {
      // Handle unique constraint violation at DB level as well
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'An application already exists for this candidate and position' },
          { status: 409 }
        )
      }
      console.error('[POST /api/applications] Insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Record stage history entry for initial "applied" stage
    const { error: historyError } = await supabase
      .from('application_stage_history')
      .insert({
        application_id: application.id,
        from_stage: null,
        to_stage: 'applied',
        moved_by: session.user.email,
      })

    if (historyError) {
      console.error('[POST /api/applications] Stage history insert error:', historyError)
    }

    // If admin provided an initial note, insert it
    if (isAdmin && initialNote) {
      const { error: noteError } = await supabase
        .from('application_notes')
        .insert({
          application_id: application.id,
          author: session.user.email,
          content: initialNote,
          note_type: 'general',
        })

      if (noteError) {
        console.error('[POST /api/applications] Note insert error:', noteError)
      }
    }

    return NextResponse.json(
      { success: true, application_id: application.id },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/applications] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
