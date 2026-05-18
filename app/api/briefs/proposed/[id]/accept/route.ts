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
 * POST /api/briefs/proposed/[id]/accept — Pack E.3a
 *
 * Candidate-authenticated atomic accept of a proposed outreach. Delegates
 * to RPC accept_outreach which:
 *   - validates outreach exists, is owned by p_member_id, status='proposed'
 *   - creates an applications row (assignment-source only)
 *   - flips outreach to 'accepted'
 *   - marks parent match (if any) as 'converted'
 *   - logs application_stage_history row
 *
 * Brief-source outreach returns 501 BRIEF_ACCEPT_DEFERRED (Option C lock
 * 2026-05-18). Decline = E.3b separate endpoint.
 *
 * Auth contract:
 * - session.user.role in ('admin','business') → 403 FORBIDDEN
 * - members lookup by email, deleted_at IS NULL gate
 * - matching_opt_in NOT re-checked (consent enforced at outreach create time)
 */
export async function POST(
  _req: NextRequest,
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

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, deleted_at')
    .eq('email', session.user.email)
    .maybeSingle()

  if (memberError) {
    console.error('[POST /api/briefs/proposed/[id]/accept] Member lookup error:', memberError)
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

  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    'accept_outreach',
    {
      p_outreach_id: outreachId,
      p_member_id: member.id,
      p_moved_by: session.user.email,
    }
  )

  if (rpcError) {
    console.error('[POST /api/briefs/proposed/[id]/accept] RPC error:', rpcError)
    return NextResponse.json({ error: rpcError.message }, { status: 500 })
  }

  const result = rpcResult as {
    ok: boolean
    code?: string
    current_status?: string
    application_id?: string
    outreach_id?: string
    match_id?: string | null
  } | null

  if (!result) {
    console.error('[POST /api/briefs/proposed/[id]/accept] RPC returned null')
    return NextResponse.json(
      { error: 'Unexpected empty RPC result' },
      { status: 500 }
    )
  }

  if (result.ok === true) {
    return NextResponse.json(
      {
        application_id: result.application_id,
        outreach_id: result.outreach_id,
        match_id: result.match_id ?? null,
      },
      { status: 201, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  switch (result.code) {
    case 'OUTREACH_NOT_FOUND':
      return NextResponse.json(
        { error: 'Outreach not found', code: 'OUTREACH_NOT_FOUND' },
        { status: 404 }
      )
    case 'FORBIDDEN':
      return NextResponse.json(
        { error: 'Outreach does not belong to current member', code: 'FORBIDDEN' },
        { status: 403 }
      )
    case 'OUTREACH_NOT_ACCEPTABLE':
      return NextResponse.json(
        {
          error: 'Outreach is not in a proposable state',
          code: 'OUTREACH_NOT_ACCEPTABLE',
          current_status: result.current_status ?? null,
        },
        { status: 409 }
      )
    case 'BRIEF_ACCEPT_DEFERRED':
      return NextResponse.json(
        {
          error: 'Brief-source accept is not yet supported',
          code: 'BRIEF_ACCEPT_DEFERRED',
        },
        { status: 501 }
      )
    case 'APPLICATION_DUPLICATE':
      return NextResponse.json(
        {
          error: 'Application already exists for this assignment',
          code: 'APPLICATION_DUPLICATE',
        },
        { status: 409 }
      )
    case 'INVALID_REFERENCE':
      return NextResponse.json(
        { error: 'Referenced row not found', code: 'INVALID_REFERENCE' },
        { status: 400 }
      )
    default:
      console.error(
        '[POST /api/briefs/proposed/[id]/accept] Unknown RPC code:',
        result.code
      )
      return NextResponse.json(
        { error: 'Unexpected RPC result code', code: result.code ?? 'UNKNOWN' },
        { status: 500 }
      )
  }
}
