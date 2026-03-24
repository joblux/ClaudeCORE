import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { default: 'JOBLUX Escape — Travel Intelligence', template: '%s | JOBLUX Escape' },
  description: 'Curated travel intelligence from your private advisor. Destinations, hotels, itineraries, and city guides.',
}

const NAV_LINKS = [
  { label: 'Blog', href: '/escape' },
  { label: 'Itineraries', href: '/escape/itineraries' },
  { label: 'Hotels Reserve', href: '/escape/hotels' },
  { label: 'City Life', href: '/escape/cities' },
  { label: 'Deals', href: '/escape/deals' },
  { label: 'Plan Your Trip', href: '/escape/plan' },
]

export default function EscapeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F3E8', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Escape Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#FFFDF7', borderColor: '#E0D9CA' }}>
        <div className="jl-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 90 }}>
          {/* Left: JOBLUX link + separator + Escape */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" className="hover:opacity-70 transition-opacity" style={{ color: '#999', fontSize: 14, fontWeight: 600, letterSpacing: '0.025em', lineHeight: '1', display: 'inline-flex', alignItems: 'center' }}>
              ← JOBLUX
            </Link>
            <span style={{ color: '#E0D9CA', fontSize: 14, lineHeight: '1', display: 'inline-flex', alignItems: 'center' }}>|</span>
            <Link href="/escape" style={{ color: '#B8975C', fontSize: 14, fontWeight: 600, letterSpacing: '0.025em', lineHeight: '1', display: 'inline-flex', alignItems: 'center' }}>
              Escape
            </Link>
          </div>

          {/* Center: Nav links */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 24 }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:opacity-80 transition-colors"
                style={{ color: '#555', fontSize: 14, fontWeight: 600, lineHeight: '1', display: 'inline-flex', alignItems: 'center' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Edition pill */}
          <span style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 9999, backgroundColor: '#F7F3E8', color: '#B8975C', border: '1px solid #E0D9CA', lineHeight: '1', display: 'inline-flex', alignItems: 'center' }}>
            April 2026
          </span>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p style={{ fontSize: '10.5px', color: '#bbb', fontFamily: "'DM Sans', sans-serif" }}>
          JOBLUX Escape · April 2026 Edition
        </p>
      </footer>
    </div>
  )
}
