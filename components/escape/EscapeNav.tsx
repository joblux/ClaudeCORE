'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Blog', href: '/escape' },
  { label: 'Itineraries', href: '/escape/itineraries' },
  { label: 'Hotels Reserve', href: '/escape/hotels' },
  { label: 'City Life', href: '/escape/cities' },
  { label: 'Cruises', href: '/escape/cruises' },
  { label: 'Plan Your Trip', href: '/escape/plan' },
]

export default function EscapeNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll when menu open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#FFFDF7', borderColor: '#E0D9CA' }}>
      <div className="jl-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 90 }}>
        {/* Left: JOBLUX link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" className="hover:opacity-70 transition-opacity" style={{ color: '#999', fontSize: 15, fontWeight: 600, letterSpacing: '0.025em', lineHeight: '1', display: 'inline-flex', alignItems: 'center' }}>
            ← JOBLUX
          </Link>
        </div>

        {/* Center: Nav links — desktop only */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 24 }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:opacity-80 transition-colors"
              style={{ color: '#555', fontSize: 15, fontWeight: 600, lineHeight: '1', display: 'inline-flex', alignItems: 'center' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Edition pill + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="hidden sm:inline-flex" style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 9999, backgroundColor: '#F7F3E8', color: '#B8975C', border: '1px solid #E0D9CA', lineHeight: '1', alignItems: 'center' }}>
            April 2026
          </span>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex items-center justify-center"
            style={{ width: 44, height: 44, color: '#555', fontSize: 33 }}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? '\u2715' : '\u2630'}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          style={{ backgroundColor: '#2B4A3E', top: 0 }}
        >
          {/* Close button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '24px 20px' }}>
            <button
              onClick={() => setOpen(false)}
              style={{ width: 44, height: 44, color: '#FFFDF7', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Nav links */}
          <div style={{ padding: '16px 28px' }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '14px 0',
                  fontSize: 18,
                  fontWeight: 500,
                  color: '#FFFDF7',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(255,253,247,0.12)',
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Back to JOBLUX */}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '14px 0',
                fontSize: 15,
                color: '#B8975C',
                textDecoration: 'none',
                marginTop: 16,
              }}
            >
              ← Back to JOBLUX
            </Link>

            {/* Edition */}
            <p style={{ fontSize: 11, color: 'rgba(255,253,247,0.35)', marginTop: 32 }}>
              April 2026 Edition
            </p>
          </div>
        </div>
      )}
    </nav>
  )
}
