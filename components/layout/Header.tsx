'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
  const { isAuthenticated } = useMember()
  const pathname = usePathname()

  return (
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
              <Link href="/access" style={{ fontSize: '12.5px', fontWeight: 600, color: '#171717', background: '#a58e28', padding: '10px 18px', borderRadius: 999, textDecoration: 'none', transition: 'background 0.18s ease' }}>
                Access &rarr;
              </Link>
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
              <Link href="/access" onClick={() => setMobileOpen(false)} style={{ fontSize: '12.5px', fontWeight: 600, color: '#171717', background: '#a58e28', padding: '10px 18px', borderRadius: 999, textDecoration: 'none', display: 'inline-block' }}>
                Access &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
