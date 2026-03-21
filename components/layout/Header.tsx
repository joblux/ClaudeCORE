'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'
import SearchOverlay from '@/components/SearchOverlay'
import { useMember } from '@/lib/auth-hooks'

const publicNavItems = [
  { label: 'WikiLux', href: '/wikilux' },
  { label: 'Careers', href: '/opportunities' },
  { label: 'Interviews', href: '/interviews' },
  { label: 'Salaries', href: '/salaries' },
  { label: 'Coaching', href: '/coaching' },
  { label: 'Bloglux', href: '/bloglux' },
  { label: 'Travel', href: '/travel' },
  { label: 'The Brief', href: '/the-brief' },
]

const authOnlyNavItems: { label: string; href: string }[] = []

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { isAuthenticated } = useMember()
  const navItems = [...publicNavItems, ...(isAuthenticated ? authOnlyNavItems : [])]
  return (
    <header className="border-b border-[#e8e2d8]">

      {/* Single header bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 max-w-[1200px] mx-auto">

          {/* Logo */}
          <Link href="/" className="inline-block flex-shrink-0">
            <div className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] leading-none" style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>JOBLUX.</div>
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#1a1a1a]/70">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-[#1a1a1a] transition-colors text-[0.8rem] tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side — search, auth, mobile hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center justify-center w-9 h-9 text-[#888] hover:text-[#1a1a1a] transition-colors"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <UserMenu />
            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href="/members"
                  className="text-[0.8rem] tracking-wide text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/join"
                  className="text-[0.8rem] tracking-wide text-[#a58e28] hover:text-[#1a1a1a] transition-colors"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile hamburger — visible only on mobile */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-11 h-11 text-[#555] hover:text-[#1a1a1a]"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? '\u2715' : '\u2630'}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e8e2d8]">
          <nav className="w-full px-4 sm:px-6 py-4">
            <div className="max-w-[1200px] mx-auto space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm text-[#555] hover:text-[#a58e28] transition-colors border-b border-[#f0ece4] last:border-0"
                >
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  href="/join"
                  onClick={() => setMobileOpen(false)}
                  className="block mt-3 py-3 text-center bg-[#a58e28] text-[#1a1a1a] text-sm font-semibold rounded-md"
                >
                  Join
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
