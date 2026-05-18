import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/ses'
import { adminBriefAcceptedEmail, RECRUITING_ALERT_EMAIL } from '@/lib/email-templates'

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
    // E.5a — Recruiting alert. Best-effort, never blocks the 201.
    // All enrichment SELECTs are tolerant: failures log + fallback.
    try {
      const acceptedAt = new Date().toISOString()
      let candidateName = 'Unknown candidate'
      let candidateEmail = 'unknown'
      let sourceType: 'search_assignment' | 'business_brief' = 'search_assignment'
      let title = '[unknown]'
      let location: string | null = null
      let sector: string | null = null
      let isConfidential: boolean | undefined
      let showLocation: boolean | undefined

      const { data: memberRow, error: memberErr } = await supabase
        .from('members')
        .select('full_name, email')
        .eq('id', member.id)
        .maybeSingle()
      if (memberErr) {
        console.error('[E.5a] Member enrichment error:', memberErr)
      } else if (memberRow) {
        candidateName = memberRow.full_name || candidateName
        candidateEmail = memberRow.email || candidateEmail
      }

      const { data: outreachRow, error: outreachErr } = await supabase
        .from('brief_outreach')
        .select('business_brief_id, search_assignment_id')
        .eq('id', outreachId)
        .maybeSingle()
      if (outreachErr) {
        console.error('[E.5a] Outreach enrichment error:', outreachErr)
      } else if (outreachRow) {
        if (outreachRow.business_brief_id) {
          sourceType = 'business_brief'
          const { data: brief, error: briefErr } = await supabase
            .from('business_briefs')
            .select('mandate_title, sector, location')
            .eq('id', outreachRow.business_brief_id)
            .maybeSingle()
          if (briefErr) {
            console.error('[E.5a] Brief enrichment error:', briefErr)
          } else if (brief) {
            title = brief.mandate_title || title
            sector = brief.sector ?? null
            location = brief.location ?? null
          }
        } else if (outreachRow.search_assignment_id) {
          sourceType = 'search_assignment'
          const { data: asg, error: asgErr } = await supabase
            .from('search_assignments')
            .select('title, city, country, is_confidential, show_location')
            .eq('id', outreachRow.search_assignment_id)
            .maybeSingle()
          if (asgErr) {
            console.error('[E.5a] Assignment enrichment error:', asgErr)
          } else if (asg) {
            title = asg.title || title
            const loc = [asg.city, asg.country].filter(Boolean).join(', ')
            location = loc || null
            isConfidential = typeof asg.is_confidential === 'boolean' ? asg.is_confidential : undefined
            showLocation = typeof asg.show_location === 'boolean' ? asg.show_location : undefined
          }
        }
      }

      const tpl = adminBriefAcceptedEmail({
        candidateName,
        candidateEmail,
        sourceType,
        title,
        location,
        sector,
        isConfidential,
        showLocation,
        applicationId: result.application_id ?? null,
        outreachId: outreachId,
        matchId: result.match_id ?? null,
        acceptedAt,
      })

      const subject = `Outreach accepted: ${candidateName} — ${title}`
      const sendResult = await sendEmail({
        to: RECRUITING_ALERT_EMAIL,
        subject,
        body: tpl.text,
        bodyHtml: tpl.html,
      })
      if (!sendResult.success) {
        console.error('[E.5a] Recruiting alert send failed:', {
          error: sendResult.error,
          recipient: RECRUITING_ALERT_EMAIL,
          outreach_id: outreachId,
          application_id: result.application_id,
        })
      }
    } catch (notifyErr) {
      console.error('[E.5a] Unexpected enrichment error:', notifyErr)
    }

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
