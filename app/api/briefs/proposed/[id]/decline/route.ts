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

const MAX_DECLINE_REASON_LEN = 1000

/**
 * POST /api/briefs/proposed/[id]/decline — Pack E.3b
 *
 * Candidate-authenticated decline of a proposed outreach. Works for both
 * business_brief and search_assignment sources uniformly. Single UPDATE
 * on brief_outreach; no applications row, no match update, no stage
 * history (decline is on the outreach trail only).
 *
 * Decline is final for THIS outreach row per E.2 doctrine Q4. Re-proposal
 * would require a new admin action (uniq_outreach_*_live indexes ignore
 * declined rows, so a fresh row is permitted).
 *
 * Auth contract mirrors GET /api/briefs/proposed and POST .../accept.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role === 'admin' || session.user.role === 'business') {
    return NextResponse.json(
      { error: 'Candidate-only endpoint', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  const outreachId = params?.id?.trim() ?? ''
  if (!UUID_REGEX.test(outreachId)) {
    return NextResponse.json(
      { error: 'Invalid outreach id', code: 'INVALID_ID' },
      { status: 400 }
    )
  }

  let body: any = null
  try {
    const raw = await req.text()
    body = raw && raw.trim() !== '' ? JSON.parse(raw) : null
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body', code: 'INVALID_BODY' },
      { status: 400 }
    )
  }

  let declineReason: string | null = null
  const rawReason = body?.decline_reason
  if (typeof rawReason === 'string') {
    const trimmed = rawReason.trim()
    if (trimmed !== '') {
      if (trimmed.length > MAX_DECLINE_REASON_LEN) {
        return NextResponse.json(
          {
            error: 'decline_reason exceeds 1000 characters',
            code: 'DECLINE_REASON_TOO_LONG',
          },
          { status: 400 }
        )
      }
      declineReason = trimmed
    }
  }

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, deleted_at')
    .eq('email', session.user.email)
    .maybeSingle()

  if (memberError) {
    console.error('[POST /api/briefs/proposed/[id]/decline] Member lookup error:', memberError)
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }
  if (!member) {
    return NextResponse.json(
      { error: 'Candidate not found', code: 'CANDIDATE_NOT_FOUND' },
      { status: 404 }
    )
  }
  if (member.deleted_at) {
    return NextResponse.json(
      { error: 'Candidate account has been deleted', code: 'CANDIDATE_DELETED' },
      { status: 410 }
    )
  }

  const { data: outreach, error: fetchError } = await supabase
    .from('brief_outreach')
    .select('id, member_id, status, business_brief_id, search_assignment_id')
    .eq('id', outreachId)
    .maybeSingle()

  if (fetchError) {
    console.error('[POST /api/briefs/proposed/[id]/decline] Outreach fetch error:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!outreach) {
    return NextResponse.json(
      { error: 'Outreach not found', code: 'OUTREACH_NOT_FOUND' },
      { status: 404 }
    )
  }
  if (outreach.member_id !== member.id) {
    return NextResponse.json(
      { error: 'Outreach does not belong to current member', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }
  if (outreach.status !== 'proposed') {
    return NextResponse.json(
      {
        error: 'Outreach is not in a declinable state',
        code: 'OUTREACH_NOT_DECLINABLE',
        current_status: outreach.status,
      },
      { status: 409 }
    )
  }

  const nowIso = new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from('brief_outreach')
    .update({
      status: 'declined',
      responded_at: nowIso,
      decline_reason: declineReason,
      updated_at: nowIso,
    })
    .eq('id', outreachId)
    .eq('status', 'proposed')
    .select('id')

  if (updateError) {
    console.error('[POST /api/briefs/proposed/[id]/decline] Update error:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }
  if (!updated || updated.length === 0) {
    return NextResponse.json(
      {
        error: 'Outreach is no longer in a declinable state',
        code: 'OUTREACH_NOT_DECLINABLE',
      },
      { status: 409 }
    )
  }

  const source: 'business_brief' | 'search_assignment' =
    outreach.business_brief_id != null ? 'business_brief' : 'search_assignment'

  return NextResponse.json(
    {
      outreach_id: outreachId,
      status: 'declined',
      source,
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  )
}
