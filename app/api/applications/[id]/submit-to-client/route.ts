import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  || process.env.NEXTAUTH_URL
  || 'https://joblux.com'

function mintToken(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * POST /api/applications/[id]/submit-to-client — Pack E.6.1b
 *
 * Records the act of client submission. Admin-only.
 * Mints a token + inserts client_submissions row on every successful call.
 * 1:N per application. First call: 201. Subsequent: 200.
 * submitted_to_client_at is set on first call only and preserved thereafter.
 * submission_method defaults to 'platform' on first call only when absent.
 *
 * Writes:
 *   - applications.current_stage          = 'submitted_to_client' (first call)
 *   - applications.submitted_to_client_at = now()  (first call only)
 *   - applications.submission_method      = body.submission_method (first call)
 *   - applications.submission_cv_version  = body.submission_cv_version (first call)
 *   - applications.updated_at             = now()
 *   - application_stage_history INSERT row (first call only)
 *   - client_submissions INSERT row (every call)
 *
 * Does NOT:
 *   - invoke projectFor('client')
 *   - send candidate or client emails (E.5 owns notifications)
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
  const clientBusinessName  = trimOrNull(body.client_business_name)
  const clientRecipientName = trimOrNull(body.client_recipient_name)
  const clientRecipientRole = trimOrNull(body.client_recipient_role)
  const recruiterNote       = trimOrNull(body.recruiter_note)
  const businessMemberId    = trimOrNull(body.business_member_id)
  let   expiresAtInput: string | null = null
  if (typeof body.expires_at === 'string' && body.expires_at.trim().length > 0) {
    const d = new Date(body.expires_at)
    if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'Invalid expires_at — must be a future ISO8601 timestamp',
          code: 'INVALID_EXPIRY' },
        { status: 400 }
      )
    }
    expiresAtInput = d.toISOString()
  }

  if (!clientBusinessName || !clientRecipientName) {
    return NextResponse.json(
      { error: 'client_business_name and client_recipient_name are required',
        code: 'MISSING_CLIENT_FIELDS' },
      { status: 400 }
    )
  }

  if (!businessMemberId) {
    return NextResponse.json(
      { error: 'business_member_id is required', code: 'MISSING_BUSINESS_MEMBER' },
      { status: 400 }
    )
  }
  if (!UUID_REGEX.test(businessMemberId)) {
    return NextResponse.json(
      { error: 'Invalid business_member_id', code: 'INVALID_BUSINESS_MEMBER' },
      { status: 400 }
    )
  }

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

  const { data: biz, error: bizErr } = await supabase
    .from('members')
    .select('id, role')
    .eq('id', businessMemberId)
    .maybeSingle()
  if (bizErr) {
    console.error('[submit-to-client] business lookup error:', bizErr)
    return NextResponse.json({ error: bizErr.message }, { status: 500 })
  }
  if (!biz) {
    return NextResponse.json(
      { error: 'Business account not found', code: 'BUSINESS_NOT_FOUND' },
      { status: 404 }
    )
  }
  if (biz.role !== 'business') {
    return NextResponse.json(
      { error: 'Selected member is not a business account', code: 'NOT_A_BUSINESS' },
      { status: 400 }
    )
  }

  const isFirstSubmission = !current.submitted_to_client_at
  const nowIso = new Date().toISOString()

  let updated: any = null

  if (isFirstSubmission) {
    // First-call path: flip stage, set timestamp, write meta + history.
    const fromStage = current.current_stage

    // submission_method default 'platform' ONLY on first call ONLY when absent.
    const effectiveSubmissionMethod =
      submissionMethod !== null ? submissionMethod : 'platform'

    const updates: Record<string, unknown> = {
      current_stage: 'submitted_to_client',
      submitted_to_client_at: nowIso,
      submission_method: effectiveSubmissionMethod,
      updated_at: nowIso,
    }
    if (submissionCvVersion !== null) {
      updates.submission_cv_version = submissionCvVersion
    }

    const { data: u, error: updateError } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', applicationId)
      .select('id, current_stage, submitted_to_client_at, submission_method, submission_cv_version, updated_at')
      .single()

    if (updateError) {
      console.error('[submit-to-client] Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    updated = u

    // Stage history — non-fatal (preserves existing E.4 pattern)
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
      console.error('[submit-to-client] History insert error:', historyError)
    }
  } else {
    // Subsequent-call path: do NOT touch submitted_to_client_at.
    // Touch updated_at only so the row reflects activity.
    const { data: u, error: updateError } = await supabase
      .from('applications')
      .update({ updated_at: nowIso })
      .eq('id', applicationId)
      .select('id, current_stage, submitted_to_client_at, submission_method, submission_cv_version, updated_at')
      .single()

    if (updateError) {
      console.error('[submit-to-client] Touch updated_at error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    updated = u
  }

  const buildSubmissionRow = () => {
    const row: Record<string, unknown> = {
      application_id: applicationId,
      token: mintToken(),
      client_business_name: clientBusinessName,
      client_recipient_name: clientRecipientName,
      client_recipient_role: clientRecipientRole,
      recruiter_email: session.user.email,
      recruiter_note: recruiterNote,
      business_member_id: businessMemberId,
    }
    if (expiresAtInput !== null) row.expires_at = expiresAtInput
    return row
  }

  let inserted: any = null
  let insertError: any = null
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: ins, error } = await supabase
      .from('client_submissions')
      .insert(buildSubmissionRow())
      .select('id, token, client_business_name, client_recipient_name, client_recipient_role, recruiter_email, recruiter_note, business_member_id, expires_at, revoked_at, created_at')
      .single()
    if (!error) { inserted = ins; insertError = null; break }
    insertError = error
    // Retry only on unique violation (token collision)
    if (error.code !== '23505') break
  }

  if (!inserted) {
    console.error('[submit-to-client] client_submissions insert failed:', insertError)
    return NextResponse.json(
      { error: insertError?.message || 'Failed to create client submission',
        code: 'CLIENT_SUBMISSION_INSERT_FAILED',
        application_already_advanced: isFirstSubmission },
      { status: 500 }
    )
  }

  const url = `${SITE_URL.replace(/\/$/, '')}/client-submissions/${inserted.token}`

  const responseBody = {
    application: updated,
    client_submission: {
      id: inserted.id,
      token: inserted.token,
      url,
      client_business_name: inserted.client_business_name,
      client_recipient_name: inserted.client_recipient_name,
      client_recipient_role: inserted.client_recipient_role,
      recruiter_email: inserted.recruiter_email,
      recruiter_note: inserted.recruiter_note,
      business_member_id: inserted.business_member_id,
      expires_at: inserted.expires_at,
      revoked_at: inserted.revoked_at,
      created_at: inserted.created_at,
    },
  }

  return NextResponse.json(responseBody, {
    status: isFirstSubmission ? 201 : 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
