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
        <div className="jl-container">
          <div className="flex items-center justify-between" style={{ height: 80 }}>
            {/* Left: JOBLUX link + Escape */}
            <div className="flex items-center gap-3 flex-shrink-0" style={{ lineHeight: 1 }}>
              <Link href="/" className="font-medium tracking-wide hover:opacity-70 transition-opacity" style={{ color: '#999', fontSize: 13 }}>
                ← JOBLUX
              </Link>
              <span style={{ color: '#E0D9CA', fontSize: 13 }}>|</span>
              <Link href="/escape" className="font-medium tracking-wide" style={{ color: '#B8975C', fontSize: 13 }}>
                Escape
              </Link>
            </div>

            {/* Center: Nav links */}
            <div className="hidden md:flex items-center gap-6" style={{ lineHeight: 1 }}>
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-medium transition-colors hover:opacity-80"
                  style={{ color: '#555', fontSize: 13 }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right: Edition pill */}
            <div className="flex-shrink-0" style={{ lineHeight: 1 }}>
              <span className="font-medium px-3 py-1 rounded-full" style={{ fontSize: 11, backgroundColor: '#F7F3E8', color: '#B8975C', border: '1px solid #E0D9CA' }}>
                April 2026
              </span>
            </div>
          </div>
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
