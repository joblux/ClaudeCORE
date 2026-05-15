import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// POST /api/members/cv-merge/reject — Phase C.2
//
// Discards the pending parse: sets members.cv_parsed_pending = NULL and
// closes any open cv_parse_history rows for this member with
// applied_by_user = false. cv_parsed_data is NOT touched.
//
// Body: { reason?: string } — accepted but currently unused (forward-compat).
// =============================================================================

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Body is optional; tolerate missing/invalid JSON.
  try {
    await req.json()
  } catch {
    // ignore — reason field is forward-compat
  }

  const { data: member, error: memberErr } = await supabase
    .from('members')
    .select('id, cv_parsed_pending')
    .eq('email', session.user.email)
    .maybeSingle()

  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 })
  }
  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }
  if (member.cv_parsed_pending == null) {
    return NextResponse.json({ error: 'NOTHING_TO_REJECT' }, { status: 409 })
  }

  const nowIso = new Date().toISOString()

  const { error: updErr } = await supabase
    .from('members')
    .update({ cv_parsed_pending: null, updated_at: nowIso })
    .eq('id', member.id)

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  const { error: histErr } = await supabase
    .from('cv_parse_history')
    .update({ applied_at: nowIso, applied_by_user: false })
    .eq('member_id', member.id)
    .is('applied_at', null)

  if (histErr) {
    // History close is best-effort; the pending column is the source of truth.
    console.error('[cv-merge/reject] history close failed:', histErr.message)
  }

  return NextResponse.json({ ok: true })
}
