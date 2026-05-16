import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { hashPassword } from '@/lib/share/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// GET /api/profilux/share — Manage tab v0 read-only visibility status
//
// Reads ONLY share_links (source of truth).
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
// No share_links row for the session member → returns the all-null/false
// default shape (200), so the UI can render "Private" without an error state.
// =============================================================================

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Resolve member_id from session email
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .ilike('email', session.user.email)
    .maybeSingle()

  let share_slug: string | null = null
  let sharing_enabled: boolean = false
  let password_set: boolean = false
  let expires_at: string | null = null
  let view_count: number = 0

  // Source of truth: share_links
  if (member?.id) {
    const { data: link } = await supabase
      .from('share_links')
      .select('id, slug, sharing_enabled, password_hash, expires_at')
      .eq('member_id', member.id)
      .maybeSingle()

    if (link) {
      share_slug = link.slug
      sharing_enabled = link.sharing_enabled === true
      password_set = !!link.password_hash
      expires_at = link.expires_at ?? null

      const { count } = await supabase
        .from('share_views')
        .select('id', { count: 'exact', head: true })
        .eq('share_link_id', link.id)

      view_count = typeof count === 'number' ? count : 0
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://joblux.com'
  // public_url reflects active reachability: only emit a URL when the slug is
  // BOTH reserved AND sharing is enabled. share_slug is still returned so the
  // UI can show the reserved-but-disabled state without claiming a live link.
  const public_url: string | null = sharing_enabled && share_slug
    ? `${siteUrl.replace(/\/$/, '')}/${share_slug}`
    : null
  const can_share: boolean = share_slug !== null

  return NextResponse.json({
    share_slug,
    sharing_enabled,
    public_url,
    can_share,
    password_set,
    expires_at,
    view_count,
  })
}

// =============================================================================
// POST /api/profilux/share — update sharing controls on share_links
//
// Body accepts any subset of:
//   { sharing_enabled?: boolean,
//     password?: string | null,
//     expires_at?: string | null }
//
// At least one field must be present.
//   - sharing_enabled: toggles share visibility.
//   - password: string → scrypt-hashed via lib/share/auth.hashPassword.
//               null   → clears password_hash + password_salt.
//               Minimum 4 chars.
//   - expires_at: 'YYYY-MM-DD' (must be today or later) or null to clear.
//
// All writes REQUIRE a share_links row → NO_SHARE_LINK.
//
// Returns: { ok: true }
// =============================================================================

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const hasSharing = body && Object.prototype.hasOwnProperty.call(body, 'sharing_enabled')
  const hasPassword = body && Object.prototype.hasOwnProperty.call(body, 'password')
  const hasExpiry = body && Object.prototype.hasOwnProperty.call(body, 'expires_at')

  if (!hasSharing && !hasPassword && !hasExpiry) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  let nextSharing: boolean | undefined
  if (hasSharing) {
    if (typeof body.sharing_enabled !== 'boolean') {
      return NextResponse.json({ error: 'sharing_enabled must be boolean' }, { status: 400 })
    }
    nextSharing = body.sharing_enabled
  }

  let nextPasswordHash: string | null | undefined
  let nextPasswordSalt: string | null | undefined
  if (hasPassword) {
    if (body.password === null) {
      nextPasswordHash = null
      nextPasswordSalt = null
    } else if (typeof body.password === 'string') {
      if (body.password.length < 4) {
        return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 })
      }
      const { hash, salt } = hashPassword(body.password)
      nextPasswordHash = hash
      nextPasswordSalt = salt
    } else {
      return NextResponse.json({ error: 'password must be string or null' }, { status: 400 })
    }
  }

  let nextExpiresAt: string | null | undefined
  if (hasExpiry) {
    if (body.expires_at === null) {
      nextExpiresAt = null
    } else if (typeof body.expires_at === 'string' && DATE_RE.test(body.expires_at)) {
      const todayIso = new Date().toISOString().slice(0, 10)
      if (body.expires_at < todayIso) {
        return NextResponse.json({ error: 'expires_at must be today or later' }, { status: 400 })
      }
      nextExpiresAt = body.expires_at
    } else {
      return NextResponse.json({ error: 'expires_at must be YYYY-MM-DD or null' }, { status: 400 })
    }
  }

  // Resolve member_id
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .ilike('email', session.user.email)
    .maybeSingle()

  if (!member?.id) {
    return NextResponse.json(
      { error: 'No member row.', code: 'NO_MEMBER' },
      { status: 400 },
    )
  }

  // Source of truth: share_links
  const { data: link } = await supabase
    .from('share_links')
    .select('id, slug')
    .eq('member_id', member.id)
    .maybeSingle()

  if (!link) {
    return NextResponse.json(
      { error: 'No share link. Reserve a public link first.', code: 'NO_SHARE_LINK' },
      { status: 400 },
    )
  }

  if (nextSharing === true && !link.slug) {
    return NextResponse.json(
      { error: 'Reserve a public link first to enable sharing.', code: 'NO_SLUG_RESERVED' },
      { status: 400 },
    )
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (hasSharing) updatePayload.sharing_enabled = nextSharing
  if (hasPassword) {
    updatePayload.password_hash = nextPasswordHash
    updatePayload.password_salt = nextPasswordSalt
  }
  if (hasExpiry) updatePayload.expires_at = nextExpiresAt

  const { error: linkUpdateErr } = await supabase
    .from('share_links')
    .update(updatePayload)
    .eq('id', link.id)

  if (linkUpdateErr) {
    return NextResponse.json({ error: linkUpdateErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

