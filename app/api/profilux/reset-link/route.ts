import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateSlug(firstName: string, lastName: string, suffix?: number): string {
  const base = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return suffix ? `${base}-${suffix}` : base
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('members')
    .select('id, first_name, last_name')
    .eq('email', session.user.email)
    .single()

  if (!profile?.first_name || !profile?.last_name) {
    return NextResponse.json({ error: 'Please complete your personal info first' }, { status: 400 })
  }

  if (!profile.id) {
    return NextResponse.json({ error: 'No member row' }, { status: 400 })
  }

  // Find a unique slug across BOTH share_links and legacy profilux
  let slug = generateSlug(profile.first_name, profile.last_name)
  let suffix = 2

  while (true) {
    const [linkColl, legacyColl] = await Promise.all([
      supabase
        .from('share_links')
        .select('member_id')
        .eq('slug', slug)
        .maybeSingle(),
      supabase
        .from('profilux')
        .select('email')
        .eq('share_slug', slug)
        .maybeSingle(),
    ])

    const linkRow = linkColl.data
    const legacyRow = legacyColl.data

    const linkOwnedByMe = !linkRow || linkRow.member_id === profile.id
    const legacyOwnedByMe = !legacyRow || legacyRow.email === session.user.email

    if (linkOwnedByMe && legacyOwnedByMe) break

    slug = generateSlug(profile.first_name, profile.last_name, suffix)
    suffix++

    if (suffix > 200) {
      return NextResponse.json({ error: 'Could not generate unique slug' }, { status: 500 })
    }
  }

  // Read existing share_links row (if any) to capture rotated_from
  const { data: existing } = await supabase
    .from('share_links')
    .select('id, slug')
    .eq('member_id', profile.id)
    .maybeSingle()

  const previousSlug = existing?.slug ?? null
  const isRotation = previousSlug !== null && previousSlug !== slug

  if (existing) {
    const updatePayload: Record<string, unknown> = {
      slug,
      rotated_from: isRotation ? previousSlug : null,
      updated_at: new Date().toISOString(),
    }

    // On rotation, clear password + expiry (operator intent: fresh share).
    // Keep sharing_enabled state — rotation does not flip visibility.
    if (isRotation) {
      updatePayload.password_hash = null
      updatePayload.password_salt = null
      updatePayload.expires_at = null
    }

    const { error: updErr } = await supabase
      .from('share_links')
      .update(updatePayload)
      .eq('id', existing.id)

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }
  } else {
    const { error: insErr } = await supabase
      .from('share_links')
      .insert({ member_id: profile.id, slug })

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 })
    }
  }

  await supabase
    .from('profilux')
    .upsert(
      { email: session.user.email, share_slug: slug },
      { onConflict: 'email' }
    )

  return NextResponse.json({ slug })
}
