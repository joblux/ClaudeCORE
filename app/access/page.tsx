'use client'

import { useRouter } from 'next/navigation'

export default function AccessPage() {
  const router = useRouter()

  return (
    <main style={{ minHeight: '100vh', background: '#171717', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 32, fontWeight: 400, color: '#fff', textAlign: 'center', margin: 0 }}>
        Access JOBLUX
      </h1>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#989898', fontStyle: 'italic', textAlign: 'center', marginTop: 8, marginBottom: 32 }}>
        Luxury, decoded.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 480, width: '100%' }}>
        {/* Returning */}
        <div
          onClick={() => router.push('/join')}
          style={{ border: '1px solid #2b2b2b', background: '#202020', borderRadius: 12, padding: 24, cursor: 'pointer', transition: 'border-color 0.18s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#383838' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2b2b2b' }}
        >
          <div style={{ fontSize: 10, color: '#a58e28', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>RETURNING</div>
          <div style={{ fontSize: 15, color: '#fff', fontWeight: 500, marginBottom: 4 }}>Already have access</div>
          <div style={{ fontSize: 12, color: '#989898' }}>Sign in to your dashboard</div>
        </div>

        {/* New */}
        <div
          onClick={() => router.push('/connect')}
          style={{ border: '1px solid #a58e28', background: 'rgba(165,142,40,0.04)', borderRadius: 12, padding: 24, cursor: 'pointer', transition: 'background 0.18s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(165,142,40,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(165,142,40,0.04)' }}
        >
          <div style={{ fontSize: 10, color: '#a58e28', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>NEW</div>
          <div style={{ fontSize: 15, color: '#fff', fontWeight: 500, marginBottom: 4 }}>New to JOBLUX</div>
          <div style={{ fontSize: 12, color: '#989898' }}>Request access</div>
        </div>
      </div>
    </main>
  )
}
