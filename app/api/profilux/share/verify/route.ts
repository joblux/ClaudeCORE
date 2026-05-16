// app/api/profilux/share/verify/route.ts
//
// B.1.2 password verify endpoint.
// Query: ?slug=<slug>. Body: form-encoded `password`.
// On success → set HMAC cookie + 303 to /{slug}.
// On failure → 303 to /{slug}/password?error=1.

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  verifyPassword,
  signUnlockCookie,
  UNLOCK_COOKIE_NAME,
  UNLOCK_COOKIE_MAX_AGE_SECONDS,
} from '@/lib/share/auth'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')
  if (!slug || !/^[a-z0-9-]{1,128}$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  let password: string | null = null
  const ct = req.headers.get('content-type') || ''
  if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
    const form = await req.formData()
    const v = form.get('password')
    password = typeof v === 'string' ? v : null
  } else {
    try {
      const body = await req.json()
      password = typeof body?.password === 'string' ? body.password : null
    } catch {
      password = null
    }
  }

  if (!password) {
    return NextResponse.redirect(new URL(`/${slug}/password?error=1`, req.url), { status: 303 })
  }

  const { data: link } = await supabase
    .from('share_links')
    .select('sharing_enabled, password_hash, password_salt, expires_at')
    .eq('slug', slug)
    .maybeSingle()

  if (!link || !link.sharing_enabled || !link.password_hash || !link.password_salt) {
    return NextResponse.redirect(new URL(`/${slug}/password?error=1`, req.url), { status: 303 })
  }

  if (link.expires_at) {
    const todayIso = new Date().toISOString().slice(0, 10)
    if (link.expires_at < todayIso) {
      return NextResponse.redirect(new URL(`/${slug}/expired`, req.url), { status: 303 })
    }
  }

  const ok = verifyPassword(password, link.password_hash, link.password_salt)
  if (!ok) {
    return NextResponse.redirect(new URL(`/${slug}/password?error=1`, req.url), { status: 303 })
  }

  let cookieValue: string
  try {
    cookieValue = signUnlockCookie(slug)
  } catch {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const res = NextResponse.redirect(new URL(`/${slug}`, req.url), { status: 303 })
  res.cookies.set({
    name: UNLOCK_COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: UNLOCK_COOKIE_MAX_AGE_SECONDS,
  })
  return res
}
