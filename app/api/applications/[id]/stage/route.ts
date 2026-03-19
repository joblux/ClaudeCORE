import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Valid pipeline stages (mirroring types/application.ts)
const VALID_STAGES = [
  'applied',
  'screening',
  'shortlisted',
  'submitted_to_client',
  'client_reviewing',
  'interview_1',
  'interview_2',
  'interview_final',
  'offer_made',
  'offer_accepted',
  'offer_declined',
  'rejected',
  'on_hold',
  'withdrawn',
]

const APPLICATION_SELECT = `
  *,
  member:members!member_id(id, full_name, email, avatar_url, job_title, maison, city, country, headline, seniority, years_in_luxury),
  job_brief:job_briefs!job_brief_id(id, title, maison, is_confidential, city, country, reference_number, status)
`

/**
 * PUT /api/applications/[id]/stage
 * Move an application to a new pipeline stage. Admin only.
 *
 * Body: { stage: string, notes?: string, rejection_reason?: string, submission_method?: string }
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
    const { stage, notes, rejection_reason, submission_method } = body

    // Validate the target stage
    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch current application to get the current stage
    const { data: current, error: fetchError } = await supabase
      .from('applications')
      .select('id, current_stage')
      .eq('id', id)
      .single()

    if (fetchError || !current) {
      if (fetchError?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      }
      console.error('[PUT /api/applications/[id]/stage] Fetch error:', fetchError)
      return NextResponse.json({ error: fetchError?.message || 'Not found' }, { status: 500 })
    }

    const fromStage = current.current_stage

    // Build the update payload
    const updates: Record<string, unknown> = {
      current_stage: stage,
      updated_at: new Date().toISOString(),
    }

    // Set submitted_to_client_at when moving to that stage
    if (stage === 'submitted_to_client') {
      updates.submitted_to_client_at = new Date().toISOString()
    }

    // Set rejection_reason if moving to rejected
    if (stage === 'rejected' && rejection_reason) {
      updates.rejection_reason = rejection_reason
    }

    // Set submission_method if provided
    if (submission_method) {
      updates.submission_method = submission_method
    }

    // Update the application
    const { data: updated, error: updateError } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select(APPLICATION_SELECT)
      .single()

    if (updateError) {
      console.error('[PUT /api/applications/[id]/stage] Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Record the stage transition in history
    const { error: historyError } = await supabase
      .from('application_stage_history')
      .insert({
        application_id: id,
        from_stage: fromStage,
        to_stage: stage,
        moved_by: session.user.email,
        notes: notes || null,
      })

    if (historyError) {
      console.error('[PUT /api/applications/[id]/stage] History insert error:', historyError)
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PUT /api/applications/[id]/stage] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
