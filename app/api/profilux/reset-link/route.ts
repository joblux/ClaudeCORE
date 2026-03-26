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
    .from('profilux')
    .select('first_name, last_name')
    .eq('email', session.user.email)
    .single()

  if (!profile?.first_name || !profile?.last_name) {
    return NextResponse.json({ error: 'Please complete your personal info first' }, { status: 400 })
  }

  // Find a unique slug
  let slug = generateSlug(profile.first_name, profile.last_name)
  let suffix = 2

  while (true) {
    const { data: existing } = await supabase
      .from('profilux')
      .select('id, email')
      .eq('share_slug', slug)
      .single()

    if (!existing || existing.email === session.user.email) break
    slug = generateSlug(profile.first_name, profile.last_name, suffix)
    suffix++
  }

  await supabase
    .from('profilux')
    .update({ share_slug: slug })
    .eq('email', session.user.email)

  return NextResponse.json({ slug })
}
