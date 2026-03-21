'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
    <header className="bg-white border-b border-[#e8e2d8] sticky top-0 z-50">

      {/* Single header bar */}
      <div className="w-full px-4 sm:px-6 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between h-16 lg:h-[72px] max-w-[1400px] mx-auto">

          {/* Logo */}
          <Link href="/" className="inline-block flex-shrink-0">
            {/* Mobile: text logo */}
            <div className="lg:hidden text-2xl sm:text-3xl font-semibold text-[#1a1a1a] leading-none" style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>JOBLUX.</div>
            {/* Desktop: gold SVG logo */}
            <Image
              src="/logos/joblux-gold.svg"
              alt="JOBLUX"
              width={140}
              height={32}
              className="hidden lg:block"
              priority
            />
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-8 ml-12">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-gray-500 hover:text-[#a58e28] transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side — search, auth, mobile hamburger */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Search icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center justify-center w-9 h-9 text-[#888] hover:text-[#1a1a1a] transition-colors"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>

            {/* Desktop auth buttons */}
            {!isAuthenticated && (
              <>
                <Link
                  href="/members"
                  className="hidden lg:inline-flex px-5 py-2 border border-[#a58e28] text-[#a58e28] text-[0.7rem] font-semibold tracking-wider uppercase rounded-md hover:bg-[#a58e28] hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/join"
                  className="hidden lg:inline-flex px-5 py-2 bg-[#a58e28] text-white text-[0.7rem] font-semibold tracking-wider uppercase rounded-md hover:bg-[#9a6f0a] transition-colors"
                >
                  Join the Society
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

            {/* Mobile hamburger — visible only on mobile */}
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
