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
 * POST /api/matches — Pack E.1b
 *
 * Admin-curated match between a member and EITHER a business_brief OR a
 * search_assignment (XOR). Substrate-only: lifecycle stays minimal
 * (status defaults to 'pending') until E.3 ships accept/decline.
 *
 * Mirrors /api/applications POST admin branch:
 * - Admin-only auth.
 * - Candidate gate: matching_opt_in === true, not soft-deleted, exists.
 * - Same error codes: CANDIDATE_NOT_FOUND, CANDIDATE_DELETED, MATCHING_OPT_IN_REQUIRED.
 * - Dedup at 409 (DB unique partial indexes uniq_mbm_member_brief / uniq_mbm_member_assignment).
 *
 * NOT in scope this slice:
 * - GET list
 * - Auto-matching (computed_by stays 'admin_manual')
 * - Status transitions (E.3)
 * - Notifications (E.5)
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const memberIdRaw = body?.member_id
  const briefIdRaw = body?.business_brief_id ?? null
  const assignmentIdRaw = body?.search_assignment_id ?? null
  const notes = typeof body?.notes === 'string' && body.notes.trim() !== '' ? body.notes.trim() : null

  if (typeof memberIdRaw !== 'string' || memberIdRaw.trim() === '') {
    return NextResponse.json({ error: 'member_id is required' }, { status: 400 })
  }
  const memberId = memberIdRaw.trim()

  // XOR: exactly one source must be present.
  const briefPresent = typeof briefIdRaw === 'string' && briefIdRaw.trim() !== ''
  const assignmentPresent = typeof assignmentIdRaw === 'string' && assignmentIdRaw.trim() !== ''
  if (briefPresent === assignmentPresent) {
    return NextResponse.json(
      {
        error: 'Exactly one of business_brief_id or search_assignment_id is required',
        code: 'INVALID_SOURCE',
      },
      { status: 400 }
    )
  }
  const briefId = briefPresent ? (briefIdRaw as string).trim() : null
  const assignmentId = assignmentPresent ? (assignmentIdRaw as string).trim() : null

  // Candidate gate (mirrors /api/applications POST admin branch).
  const { data: candidate, error: candidateError } = await supabase
    .from('members')
    .select('matching_opt_in, deleted_at')
    .eq('id', memberId)
    .maybeSingle()

  if (candidateError) {
    console.error('[POST /api/matches] Candidate lookup error:', candidateError)
    return NextResponse.json({ error: candidateError.message }, { status: 500 })
  }
  if (!candidate) {
    return NextResponse.json(
      { error: 'Candidate not found', code: 'CANDIDATE_NOT_FOUND' },
      { status: 404 }
    )
  }
  if (candidate.deleted_at) {
    return NextResponse.json(
      { error: 'Candidate account has been deleted', code: 'CANDIDATE_DELETED' },
      { status: 410 }
    )
  }
  if (candidate.matching_opt_in !== true) {
    return NextResponse.json(
      { error: 'Candidate has not opted in to matching', code: 'MATCHING_OPT_IN_REQUIRED' },
      { status: 403 }
    )
  }

  const { data: match, error: insertError } = await supabase
    .from('member_brief_matches')
    .insert({
      member_id: memberId,
      business_brief_id: briefId,
      search_assignment_id: assignmentId,
      status: 'pending',
      computed_by: 'admin_manual',
      notes,
    })
    .select('id')
    .single()

  if (insertError) {
    // Unique partial index violation → dedup conflict.
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'Match already exists for this member and source', code: 'MATCH_DUPLICATE' },
        { status: 409 }
      )
    }
    // FK violation (member / brief / assignment id not found).
    if (insertError.code === '23503') {
      return NextResponse.json(
        { error: 'Referenced row not found', code: 'INVALID_REFERENCE' },
        { status: 400 }
      )
    }
    console.error('[POST /api/matches] Insert error:', insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(
    { success: true, match_id: match.id },
    { status: 201 }
  )
}
