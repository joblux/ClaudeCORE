import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// POST /api/members/delete — member-initiated soft-delete (B.3.2)
//
// Order of operations (read top→bottom; cleanup steps are intentionally
// non-blocking; the members row is the canonical deletion signal, and B.3.2
// runtime gates read deleted_at):
//   a. Disable share visibility
//   b. Delete auth account links (so re-signup with the same email starts fresh)
//   c. Delete pending magic-link verification tokens for the email
//   d. Stamp members.deleted_at / deleted_by / updated_at
//
// The members row is NEVER hard-deleted. Trash/restore is admin scope.
// =============================================================================

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: member } = await supabaseAdmin
    .from('members')
    .select('id, email')
    .eq('email', session.user.email)
    .is('deleted_at', null)
    .maybeSingle()

  if (!member?.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const nowIso = new Date().toISOString()

  // a) Disable any active share link for this member.
  await supabaseAdmin
    .from('share_links')
    .update({ sharing_enabled: false, updated_at: nowIso })
    .eq('member_id', member.id)

  // b) Drop linked auth providers so subsequent sign-in cannot re-attach
  //    to a tombstoned member by email.
  await supabaseAdmin
    .from('nextauth_accounts')
    .delete()
    .eq('member_id', member.id)

  // c) Invalidate any outstanding magic-link tokens issued to this email.
  await supabaseAdmin
    .from('nextauth_verification_tokens')
    .delete()
    .eq('identifier', member.email)

  // d) Soft-delete the members row. Guarded by deleted_at IS NULL so a
  //    concurrent second call is a no-op rather than a clobber.
  const { error: softDeleteErr } = await supabaseAdmin
    .from('members')
    .update({
      deleted_at: nowIso,
      deleted_by: member.id,
      updated_at: nowIso,
    })
    .eq('id', member.id)
    .is('deleted_at', null)

  if (softDeleteErr) {
    return NextResponse.json({ error: softDeleteErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
