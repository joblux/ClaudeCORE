import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// GET /api/profilux/share — Manage tab v0 read-only visibility status
//
// Reads ONLY legacy profilux.share_slug + profilux.sharing_enabled.
// Does not read identity/profile fields from profilux.
// Does not resolve or project the canonical members.* object.
// Does not write. Does not touch reset-link.
//
// Returns:
//   { share_slug: string | null,
//     sharing_enabled: boolean,
//     public_url: string | null,
//     can_share: boolean }
//
// Unauthenticated → 401.
// No profilux row for session email → returns the all-null/false default
// shape (200), so the UI can render "Private" without an error state.
// =============================================================================

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('profilux')
    .select('share_slug, sharing_enabled')
    .eq('email', session.user.email)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const share_slug: string | null = data?.share_slug ?? null
  const sharing_enabled: boolean = data?.sharing_enabled === true
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://joblux.com'
  const public_url: string | null = share_slug ? `${siteUrl.replace(/\/$/, '')}/${share_slug}` : null
  const can_share: boolean = share_slug !== null

  return NextResponse.json({
    share_slug,
    sharing_enabled,
    public_url,
    can_share,
  })
}
