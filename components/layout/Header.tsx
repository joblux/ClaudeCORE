'use client'

import { useState } from 'react'
import Link from 'next/link'
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
    <header className="sticky top-0 z-50 bg-[#1a1a1a] border-b border-[#2a2a2a]">
      <div
        className="max-w-[1200px] mx-auto px-7"
        style={{ display: 'grid', gridTemplateColumns: '160px 1fr 200px', alignItems: 'center', height: '71px' }}
      >

        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <img
            src="/logos/joblux-header.png"
            alt="JOBLUX"
            className="h-[30px] w-auto block"
          />
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center justify-center gap-7 h-full">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center gap-[5px] h-full"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <span className={`text-[15px] font-normal tracking-wide transition-colors ${
                  isActive ? 'text-white' : 'text-[rgba(255,255,255,0.82)] hover:text-white'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="block h-[1.5px] w-full bg-white rounded-sm" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center justify-end flex-shrink-0" style={{ height: '71px' }}>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Link
                href="/join"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: '1', display: 'flex', alignItems: 'center', height: '100%' }}
              >
                Sign in
              </Link>
              <div style={{ width: '2px', height: '18px', background: '#a58e28', borderRadius: '2px', margin: '0 18px', flexShrink: 0, alignSelf: 'center' }} />
              <Link
                href="/connect"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '500', color: 'rgba(255,255,255,0.9)', lineHeight: '1', display: 'flex', alignItems: 'center', height: '100%' }}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center justify-end">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center w-10 h-10 text-[24px] text-[rgba(255,255,255,0.82)] hover:text-white"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? '\u2715' : '\u2630'}
          </button>
        </div>

      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[71px] bg-[#1a1a1a] z-50 flex flex-col">
          <nav className="flex-1 px-7 py-8 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-4 text-[15px] border-b border-[#2a2a2a] transition-colors ${
                    isActive ? 'text-white' : 'text-[rgba(255,255,255,0.82)] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="px-7 pb-10 flex gap-6">
            {!isAuthenticated && (
              <>
                <Link href="/join" onClick={() => setMobileOpen(false)} className="text-[15px] text-[rgba(255,255,255,0.82)]">Sign in</Link>
                <Link href="/connect" onClick={() => setMobileOpen(false)} className="text-[15px] font-medium text-white">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
