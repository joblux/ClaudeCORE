'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'
import SearchOverlay from '@/components/SearchOverlay'
import { useMember } from '@/lib/auth-hooks'

const publicNavItems = [
  { label: 'Careers', href: '/opportunities' },
  { label: 'WikiLux', href: '/wikilux' },
  { label: 'BlogLux', href: '/bloglux' },
  { label: 'Career Intelligence', href: '/salaries' },
  { label: 'About', href: '/about' },
]

const authOnlyNavItems: { label: string; href: string }[] = []

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { isAuthenticated } = useMember()
  const navItems = [...publicNavItems, ...(isAuthenticated ? authOnlyNavItems : [])]

  return (
    <header className="bg-white border-b-2 border-[#1a1a1a]/10 sticky top-0 z-50">

      {/* Single header bar */}
      <div className="w-full px-4 sm:px-6 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between h-16 lg:h-24 max-w-[1400px] mx-auto">

          {/* Logo */}
          <Link href="/" className="inline-block flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/joblux-gold.svg"
              alt="JOBLUX"
              className="hidden lg:block w-[160px] h-auto"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/joblux-gold.svg"
              alt="JOBLUX"
              className="lg:hidden w-[120px] h-auto"
            />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-10 xl:gap-12 ml-12">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-base font-medium text-[#444] hover:text-[#a58e28] transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side — search, auth, mobile hamburger */}
          <div className="flex items-center gap-3 lg:gap-5">
            {/* Search button — proper circle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[#e8e2d8] hover:border-[#a58e28] transition-colors"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#888]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>

            {/* Desktop auth buttons */}
            {!isAuthenticated && (
              <>
                <Link
                  href="/members"
                  className="hidden lg:inline-flex px-7 py-3 border-2 border-[#a58e28] text-[#a58e28] text-sm font-semibold tracking-wider uppercase rounded-md hover:bg-[#a58e28] hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/join"
                  className="hidden lg:inline-flex px-7 py-3 bg-[#a58e28] text-white text-sm font-semibold tracking-wider uppercase rounded-md hover:bg-[#9a6f0a] transition-colors"
                >
                  Join
                </Link>
              </>
            )}

            {/* Mobile: UserMenu + Request Access */}
            <div className="lg:hidden">
              <UserMenu />
            </div>
            {!isAuthenticated && (
              <Link
                href="/join"
                className="hidden sm:inline-flex lg:hidden px-4 py-2 bg-[#a58e28] text-[#1a1a1a] text-[0.7rem] font-semibold tracking-wider uppercase rounded-md hover:bg-[#c4aa3a] transition-colors"
              >
                Request Access
              </Link>
            )}

            {/* Desktop: UserMenu (when authenticated) */}
            {isAuthenticated && (
              <div className="hidden lg:block">
                <UserMenu />
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-11 h-11 text-[#555] hover:text-[#1a1a1a]"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? '\u2715' : '\u2630'}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile nav drawer — unchanged */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#e8e2d8]">
          <nav className="w-full px-4 sm:px-6 py-4">
            <div className="max-w-[1200px] mx-auto space-y-1">
              {[
                { label: 'WikiLux', href: '/wikilux' },
                { label: 'Careers', href: '/opportunities' },
                { label: 'Interviews', href: '/interviews' },
                { label: 'Salaries', href: '/salaries' },
                { label: 'Coaching', href: '/coaching' },
                { label: 'Bloglux', href: '/bloglux' },
                { label: 'Travel', href: '/travel' },
                { label: 'The Brief', href: '/the-brief' },
              ].map((item) => (
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
                  Request Access
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
