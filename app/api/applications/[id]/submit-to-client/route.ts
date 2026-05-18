import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * POST /api/applications/[id]/submit-to-client — Pack E.4
 *
 * Records the act of client submission. Admin-only.
 *
 * Writes:
 *   - applications.current_stage          = 'submitted_to_client'
 *   - applications.submitted_to_client_at = now()  (first time only)
 *   - applications.submission_method      = body.submission_method (optional)
 *   - applications.submission_cv_version  = body.submission_cv_version (optional)
 *   - applications.updated_at             = now()
 *   - application_stage_history INSERT row (from_stage, to_stage, moved_by, notes)
 *
 * Does NOT:
 *   - generate share_links
 *   - invoke projectFor('client')
 *   - send candidate or client emails (E.5 owns notifications)
 *
 * Idempotency:
 *   409 APPLICATION_ALREADY_SUBMITTED if submitted_to_client_at IS NOT NULL.
 *   First submission timestamp is preserved. Subsequent metadata edits go
 *   through PUT /api/applications/[id] (existing UPDATABLE_FIELDS path).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin-only endpoint', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  const applicationId = params?.id?.trim() ?? ''
  if (!UUID_REGEX.test(applicationId)) {
    return NextResponse.json(
      { error: 'Invalid application id', code: 'INVALID_ID' },
      { status: 400 }
    )
  }

  // Parse optional body. Empty body is allowed.
  let body: Record<string, unknown> = {}
  try {
    const raw = await req.text()
    if (raw && raw.trim().length > 0) {
      body = JSON.parse(raw)
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'INVALID_BODY' },
      { status: 400 }
    )
  }

  const trimOrNull = (v: unknown): string | null => {
    if (typeof v !== 'string') return null
    const t = v.trim()
    return t.length === 0 ? null : t
  }

  const submissionMethod = trimOrNull(body.submission_method)
  const submissionCvVersion = trimOrNull(body.submission_cv_version)
  const notes = trimOrNull(body.notes)

  // Fetch current state for guard + history from_stage capture
  const { data: current, error: fetchError } = await supabase
    .from('applications')
    .select('id, current_stage, submitted_to_client_at')
    .eq('id', applicationId)
    .maybeSingle()

  if (fetchError) {
    console.error('[POST /api/applications/[id]/submit-to-client] Fetch error:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!current) {
    return NextResponse.json(
      { error: 'Application not found', code: 'APPLICATION_NOT_FOUND' },
      { status: 404 }
    )
  }

  // Idempotency guard — first-submission timestamp is sacred.
  if (current.submitted_to_client_at) {
    return NextResponse.json(
      {
        error: 'Application already submitted to client',
        code: 'APPLICATION_ALREADY_SUBMITTED',
        submitted_to_client_at: current.submitted_to_client_at,
      },
      { status: 409 }
    )
  }

  const fromStage = current.current_stage
  const nowIso = new Date().toISOString()

  // Build update payload — only set metadata cols if caller provided them
  const updates: Record<string, unknown> = {
    current_stage: 'submitted_to_client',
    submitted_to_client_at: nowIso,
    updated_at: nowIso,
  }
  if (submissionMethod !== null) updates.submission_method = submissionMethod
  if (submissionCvVersion !== null) updates.submission_cv_version = submissionCvVersion

  const { data: updated, error: updateError } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', applicationId)
    .select('id, current_stage, submitted_to_client_at, submission_method, submission_cv_version, updated_at')
    .single()

  if (updateError) {
    console.error('[POST /api/applications/[id]/submit-to-client] Update error:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Stage history insert — non-fatal on error (sibling /stage pattern)
  const { error: historyError } = await supabase
    .from('application_stage_history')
    .insert({
      application_id: applicationId,
      from_stage: fromStage,
      to_stage: 'submitted_to_client',
      moved_by: session.user.email,
      notes: notes,
    })

  if (historyError) {
    console.error('[POST /api/applications/[id]/submit-to-client] History insert error:', historyError)
  }

  return NextResponse.json(updated, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
