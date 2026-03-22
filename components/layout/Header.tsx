'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'
import SearchOverlay from '@/components/SearchOverlay'
import { useMember } from '@/lib/auth-hooks'

const publicNavItems = [
  { label: 'Intelligence', href: '/bloglux' },
  { label: 'Wiki', href: '/wikilux' },
  { label: 'Salaries', href: '/salaries' },
  { label: 'Interviews', href: '/interviews' },
  { label: 'The Brief', href: '/the-brief' },
  { label: 'Services', href: '/services' },
]

const authOnlyNavItems: { label: string; href: string }[] = []

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { isAuthenticated } = useMember()
  const navItems = [...publicNavItems, ...(isAuthenticated ? authOnlyNavItems : [])]
  return (
    <header className="border-b border-[#e8e2d8]">

      {/* Top row — Logo + right actions */}
      <div className="jl-container">
        <div className="flex items-center justify-between py-4 sm:py-5">

          {/* Logo */}
          <Link href="/" className="inline-block flex-shrink-0">
            <div className="text-3xl sm:text-[2.15rem] font-semibold text-[#1a1a1a] leading-none" style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>JOBLUX.</div>
          </Link>

          {/* Center search field — desktop */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 w-full max-w-md mx-6 px-4 py-2 border border-[#d5d0c8] rounded-full text-left hover:border-[#a58e28] transition-colors cursor-text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#999] flex-shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span className="text-sm text-[#999] truncate">Search intelligence, brands, salaries...</span>
          </button>

          {/* Center search field — mobile */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-4 sm:gap-5 flex-shrink-0">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Link href="/members" className="hidden sm:inline-flex text-sm font-medium text-[#a58e28] hover:text-[#1a1a1a] transition-colors">Access</Link>
            )}

            {/* Mobile hamburger */}
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

      {/* Bottom row — Nav links */}
      <div className="hidden md:block border-t border-[#e8e2d8]">
        <div className="jl-container">
          <nav className="flex items-center justify-center gap-9 py-2.5">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[0.8rem] leading-[1] font-semibold tracking-wide text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
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
                  Access
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
