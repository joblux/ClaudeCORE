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
 * GET /api/applications/[id]
 * Fetch full application detail with stage history and notes. Admin only.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Fetch application with joined member and search_assignment
    const { data: application, error } = await supabase
      .from('applications')
      .select(APPLICATION_SELECT)
      .eq('id', id)
      .single()

    if (error || !application) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      }
      console.error('[GET /api/applications/[id]] Query error:', error)
      return NextResponse.json({ error: error?.message || 'Not found' }, { status: 500 })
    }

    const member = await resolveAtsMember(application.member_id, supabase)

    // Fetch stage history (chronological order)
    const { data: stageHistory, error: historyError } = await supabase
      .from('application_stage_history')
      .select('*')
      .eq('application_id', id)
      .order('created_at', { ascending: true })

    if (historyError) {
      console.error('[GET /api/applications/[id]] Stage history error:', historyError)
    }

    // Fetch notes (newest first)
    const { data: notes, error: notesError } = await supabase
      .from('application_notes')
      .select('*')
      .eq('application_id', id)
      .order('created_at', { ascending: false })

    if (notesError) {
      console.error('[GET /api/applications/[id]] Notes error:', notesError)
    }

    return NextResponse.json({
      ...application,
      member,
      stage_history: stageHistory || [],
      notes: notes || [],
    })
  } catch (err) {
    console.error('[GET /api/applications/[id]] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Fields that can be updated via PUT
const UPDATABLE_FIELDS = [
  'rating',
  'assigned_recruiter',
  'offer_salary',
  'offer_currency',
  'offer_start_date',
  'offer_contract_type',
  'offer_benefits',
  'offer_notes',
  'rejection_reason',
  'rejection_notes',
  'submission_method',
  'submission_cv_version',
  'client_response',
  'client_response_at',
]

/**
 * PUT /api/applications/[id]
 * Update application fields (partial update). Admin only.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()

    // Only allow updating whitelisted fields
    const updates: Record<string, unknown> = {}
    for (const field of UPDATABLE_FIELDS) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Always update the timestamp
    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select(APPLICATION_SELECT)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      }
      console.error('[PUT /api/applications/[id]] Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const member = await resolveAtsMember(data.member_id, supabase)
    return NextResponse.json({ ...data, member })
  } catch (err) {
    console.error('[PUT /api/applications/[id]] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/applications/[id]
 * Delete an application. Admin only. DB cascades handle related records.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[DELETE /api/applications/[id]] Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/applications/[id]] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
