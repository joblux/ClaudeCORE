// app/[slug]/expired/page.tsx
//
// B.1.2 expired share hold page. Redirected here from /[slug]
// when share_links.expires_at < today.

import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

export const metadata = {
  robots: { index: false, follow: false },
}

export default function ExpiredSharePage() {
  noStore()
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <div style={{ background: '#0f0f0f', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '48px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '24px', margin: '0 0 12px', color: '#fff' }}>
            Profile share expired
          </h1>
          <p style={{ fontSize: '13px', color: '#fff', opacity: 0.6, margin: '0 0 28px', lineHeight: 1.6 }}>
            This profile share has expired. Please request a new link from the candidate.
          </p>
          <p style={{ fontSize: '11px', color: '#fff', opacity: 0.3, margin: 0 }}>
            joblux.com · Luxury talent intelligence
          </p>
        </div>
      </div>
    </>
  )
}
