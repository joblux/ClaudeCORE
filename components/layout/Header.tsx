'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import UserMenu from '@/components/UserMenu'
import { useMember } from '@/lib/auth-hooks'

const navItems = [
  { label: 'Brands', href: '/brands' },
  { label: 'Insights', href: '/insights' },
  { label: 'Signals', href: '/signals' },
  { label: 'Careers', href: '/careers' },
  { label: 'Events', href: '/events' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accessOpen, setAccessOpen] = useState(false)
  const { isAuthenticated } = useMember()
  const pathname = usePathname()
  const router = useRouter()

  const handleAccessCard = (href: string) => {
    setAccessOpen(false)
    setMobileOpen(false)
    router.push(href)
  }

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(23,23,23,0.9)', borderBottom: '0.5px solid #2b2b2b' }}>
        <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ height: 78, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

            {/* Logo */}
            <Link href="/" style={{ flexShrink: 0 }}>
              <Image src="/logos/joblux-header.png" height={22} width={88} alt="JOBLUX" style={{ height: 22, width: 'auto' }} />
            </Link>

            {/* Center nav — desktop */}
            <nav className="hidden md:flex" style={{ gap: 26, alignItems: 'center' }}>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{ fontSize: 13, color: isActive ? '#fff' : 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.18s ease' }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side — desktop */}
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: 14, flexShrink: 0 }}>
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setAccessOpen(true)}
                  style={{ fontSize: '12.5px', fontWeight: 600, color: '#171717', background: '#a58e28', padding: '10px 18px', borderRadius: 999, border: 'none', cursor: 'pointer', transition: 'background 0.18s ease' }}
                >
                  Access &rarr;
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, fontSize: 24, color: 'rgba(255,255,255,0.82)', background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? '\u2715' : '\u2630'}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile nav overlay */}
        {mobileOpen && (
          <div className="md:hidden" style={{ position: 'fixed', inset: 0, top: 78, background: 'rgba(23,23,23,0.98)', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
            <nav style={{ flex: 1, padding: '32px 28px' }}>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{ display: 'block', padding: '16px 0', fontSize: 15, borderBottom: '1px solid #2b2b2b', color: isActive ? '#fff' : 'rgba(255,255,255,0.82)', textDecoration: 'none' }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            {!isAuthenticated && (
              <div style={{ padding: '0 28px 40px' }}>
                <button
                  onClick={() => { setMobileOpen(false); setAccessOpen(true) }}
                  style={{ fontSize: '12.5px', fontWeight: 600, color: '#171717', background: '#a58e28', padding: '10px 18px', borderRadius: 999, border: 'none', cursor: 'pointer', display: 'inline-block' }}
                >
                  Access &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Access modal */}
      {accessOpen && (
        <div
          onClick={() => setAccessOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#171717', border: '1px solid #2b2b2b', borderRadius: 16, padding: '32px 28px 28px', maxWidth: 420, width: '100%', position: 'relative' }}
          >
            {/* Close button */}
            <button
              onClick={() => setAccessOpen(false)}
              style={{ position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
            >
              &times;
            </button>

            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, color: '#fff', textAlign: 'center', margin: '0 0 24px' }}>
              Luxury Talent Intelligence
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Returning */}
              <div
                onClick={() => handleAccessCard('/join')}
                style={{ border: '1px solid #2b2b2b', background: '#202020', borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'border-color 0.18s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#383838' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2b2b2b' }}
              >
                <div style={{ fontSize: 9, color: '#a58e28', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>RETURNING</div>
                <div style={{ fontSize: 14, color: '#fff', fontWeight: 500, marginBottom: 4 }}>Already have access</div>
                <div style={{ fontSize: 12, color: '#666' }}>Sign in to your dashboard</div>
              </div>

              {/* New */}
              <div
                onClick={() => handleAccessCard('/connect')}
                style={{ border: '1px solid #a58e28', background: 'rgba(165,142,40,0.05)', borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'background 0.18s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(165,142,40,0.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(165,142,40,0.05)' }}
              >
                <div style={{ fontSize: 9, color: '#a58e28', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>NEW</div>
                <div style={{ fontSize: 14, color: '#fff', fontWeight: 500, marginBottom: 4 }}>New to JOBLUX</div>
                <div style={{ fontSize: 12, color: '#666' }}>Request access</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
