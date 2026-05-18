import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/briefs/proposed — Pack E.2b
 *
 * Candidate-authenticated read of live proposed outreach for the current
 * member. Returns minimal, safe projection of joined source (business_brief
 * OR search_assignment) per Mo lock 2026-05-18.
 *
 * Auth contract:
 * - session.user.role !== 'candidate' → 403 FORBIDDEN
 * - members lookup by email, deleted_at IS NULL gate
 * - matching_opt_in NOT re-checked (consent enforced at outreach create time)
 *
 * Projection rules:
 * - Excluded: client/recruiter contact info, internal notes, fees, salaries,
 *   admin notes, attachments, sa.maison, compensation_range, brief_summary.
 * - sa.show_location=false → location returned as null.
 * - Closed/archived sources filtered out post-fetch (JS, not WHERE).
 *
 * NOT in scope this slice:
 * - POST outreach create (E.3)
 * - Accept/decline (E.3)
 * - Client send (E.4)
 * - Notifications (E.5)
 */
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'candidate') {
    return NextResponse.json(
      { error: 'Candidate-only endpoint', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, deleted_at')
    .eq('email', session.user.email)
    .maybeSingle()

  if (memberError) {
    console.error('[GET /api/briefs/proposed] Member lookup error:', memberError)
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

  const { data: rows, error: outreachError } = await supabase
    .from('brief_outreach')
    .select(
      `
        id,
        status,
        proposed_at,
        business_brief_id,
        search_assignment_id,
        business_brief:business_briefs (
          id,
          mandate_title,
          sector,
          function,
          seniority_level,
          location,
          status
        ),
        search_assignment:search_assignments (
          id,
          title,
          sector,
          department,
          seniority,
          location,
          show_location,
          status
        )
      `
    )
    .eq('member_id', member.id)
    .eq('status', 'proposed')
    .order('proposed_at', { ascending: false })

  if (outreachError) {
    console.error('[GET /api/briefs/proposed] Outreach fetch error:', outreachError)
    return NextResponse.json({ error: outreachError.message }, { status: 500 })
  }

  const outreach = (rows ?? [])
    .map((row: any) => {
      if (row.business_brief_id && row.business_brief) {
        const bb = row.business_brief
        if (bb.status === 'closed' || bb.status === 'archived') return null
        return {
          id: row.id,
          source: 'business_brief' as const,
          source_id: bb.id,
          title: bb.mandate_title ?? null,
          sector: bb.sector ?? null,
          department: bb.function ?? null,
          seniority: bb.seniority_level ?? null,
          location: bb.location ?? null,
          status: 'proposed' as const,
          proposed_at: row.proposed_at,
        }
      }
      if (row.search_assignment_id && row.search_assignment) {
        const sa = row.search_assignment
        if (sa.status === 'closed') return null
        return {
          id: row.id,
          source: 'search_assignment' as const,
          source_id: sa.id,
          title: sa.title ?? null,
          sector: sa.sector ?? null,
          department: sa.department ?? null,
          seniority: sa.seniority ?? null,
          location: sa.show_location ? sa.location ?? null : null,
          status: 'proposed' as const,
          proposed_at: row.proposed_at,
        }
      }
      return null
    })
    .filter((x) => x !== null)

  return NextResponse.json(
    { outreach },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  )
}
