// app/[slug]/password/page.tsx
//
// B.1.2 password challenge page.
// Renders only when share_links.password_hash is set for the slug.

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const dynamic = 'force-dynamic'

export const metadata = {
  robots: { index: false, follow: false },
}

interface Props {
  params: { slug: string }
  searchParams: { error?: string }
}

export default async function PasswordChallengePage({ params, searchParams }: Props) {
  noStore()

  const { data: link } = await supabase
    .from('share_links')
    .select('sharing_enabled, password_hash, expires_at')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!link || !link.sharing_enabled || !link.password_hash) notFound()

  const hasError = searchParams.error === '1'

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <div style={{ background: '#0f0f0f', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '48px', maxWidth: '420px', width: '100%' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '24px', margin: '0 0 8px', color: '#fff' }}>
            Protected profile
          </h1>
          <p style={{ fontSize: '13px', color: '#fff', opacity: 0.6, margin: '0 0 28px', lineHeight: 1.6 }}>
            This profile is password-protected. Enter the password you received to view it.
          </p>
          <form method="POST" action={`/api/profilux/share/verify?slug=${encodeURIComponent(params.slug)}`}>
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="Password"
              style={{ width: '100%', background: '#0f0f0f', border: '0.5px solid #333', color: '#fff', padding: '12px 14px', fontSize: '14px', fontFamily: 'Inter, sans-serif', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '12px' }}
            />
            {hasError && (
              <div style={{ fontSize: '12px', color: '#d97a7a', margin: '0 0 12px' }}>
                Incorrect password.
              </div>
            )}
            <button
              type="submit"
              style={{ width: '100%', background: '#a58e28', color: '#0f0f0f', border: 'none', padding: '12px 16px', fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: 500, borderRadius: '4px', cursor: 'pointer' }}
            >
              Unlock
            </button>
          </form>
          <p style={{ fontSize: '11px', color: '#fff', opacity: 0.3, margin: '24px 0 0', textAlign: 'center' }}>
            joblux.com · Luxury talent intelligence
          </p>
        </div>
      </div>
    </>
  )
}
