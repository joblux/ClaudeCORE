import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Deals — Exclusive Travel Offers | JOBLUX Escape',
  description: 'Exclusive rates and seasonal travel offers curated by JOBLUX Escape — time-sensitive opportunities for those who plan ahead.',
}

export default function EscapeDealsPage() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
      {/* Back link */}
      <Link
        href="/escape"
        style={{ fontSize: 14, color: '#B8975C', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}
      >
        &larr; Escape
      </Link>

      {/* Title */}
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, color: '#1A1A1A', marginBottom: 40 }}>
        Deals
      </h1>

      {/* Placeholder */}
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ fontSize: 32, color: '#B8975C' }}>&#10022;</p>
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, marginTop: 16 }}>
          Coming soon
        </p>
        <p style={{ fontSize: 14, color: '#777', marginTop: 12, maxWidth: 512, margin: '12px auto 0' }}>
          We're curating exclusive rates and seasonal offers with our hotel partners. This section will feature time-sensitive opportunities — the kind that reward those who plan ahead.
        </p>
        <Link
          href="/escape/plan"
          style={{
            display: 'inline-block',
            marginTop: 24,
            padding: '12px 28px',
            backgroundColor: '#2B4A3E',
            color: '#fff',
            borderRadius: 6,
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          Plan Your Trip
        </Link>
      </div>
    </div>
  )
}
