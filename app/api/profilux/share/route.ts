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

  // Resolve member_id from session email
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .ilike('email', session.user.email)
    .maybeSingle()

  let share_slug: string | null = null
  let sharing_enabled: boolean = false

  // Path A: share_links (source of truth)
  if (member?.id) {
    const { data: link } = await supabase
      .from('share_links')
      .select('slug, sharing_enabled')
      .eq('member_id', member.id)
      .maybeSingle()

    if (link) {
      share_slug = link.slug
      sharing_enabled = link.sharing_enabled === true
    }
  }

  // Path B: legacy profilux fallback
  if (!share_slug) {
    const { data, error } = await supabase
      .from('profilux')
      .select('share_slug, sharing_enabled')
      .eq('email', session.user.email)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    share_slug = data?.share_slug ?? null
    sharing_enabled = data?.sharing_enabled === true
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
  })
}

// =============================================================================
// POST /api/profilux/share — toggle sharing_enabled on legacy profilux row
//
// Body: { sharing_enabled: boolean }
//
// Writes ONLY profilux.sharing_enabled.
// Does NOT touch share_slug (slug lifecycle is owned by /api/profilux/reset-link).
// Does NOT touch identity / profile fields.
// Does NOT create the row — if no profilux row exists for this email,
// returns 400 (user must reserve a slug first via reset-link).
//
// Unauthenticated → 401.
// No row → 400 with code 'NO_PROFILUX_ROW'.
// No slug on row → 400 with code 'NO_SLUG_RESERVED'
// (cannot enable sharing without a slug to share).
//
// Returns: { sharing_enabled: boolean }
// =============================================================================

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const next = (body as { sharing_enabled?: unknown })?.sharing_enabled
  if (typeof next !== 'boolean') {
    return NextResponse.json({ error: 'sharing_enabled must be boolean' }, { status: 400 })
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
    // Legacy-only path (no share_links row yet)
    const { data: existing, error: readErr } = await supabase
      .from('profilux')
      .select('share_slug, sharing_enabled')
      .eq('email', session.user.email)
      .maybeSingle()

    if (readErr) {
      return NextResponse.json({ error: readErr.message }, { status: 500 })
    }
    if (!existing) {
      return NextResponse.json(
        { error: 'No profilux row. Reserve a public link first.', code: 'NO_PROFILUX_ROW' },
        { status: 400 },
      )
    }
    if (next === true && !existing.share_slug) {
      return NextResponse.json(
        { error: 'Reserve a public link first to enable sharing.', code: 'NO_SLUG_RESERVED' },
        { status: 400 },
      )
    }

    const { error: updateErr } = await supabase
      .from('profilux')
      .update({ sharing_enabled: next })
      .eq('email', session.user.email)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({ sharing_enabled: next })
  }

  // share_links path
  if (next === true && !link.slug) {
    return NextResponse.json(
      { error: 'Reserve a public link first to enable sharing.', code: 'NO_SLUG_RESERVED' },
      { status: 400 },
    )
  }

  const { error: linkUpdateErr } = await supabase
    .from('share_links')
    .update({ sharing_enabled: next, updated_at: new Date().toISOString() })
    .eq('id', link.id)

  if (linkUpdateErr) {
    return NextResponse.json({ error: linkUpdateErr.message }, { status: 500 })
  }

  // Shadow write to legacy profilux (best-effort during dual-read window)
  await supabase
    .from('profilux')
    .update({ sharing_enabled: next })
    .eq('email', session.user.email)

  return NextResponse.json({ sharing_enabled: next })
}

