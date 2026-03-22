'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'
import { useMember } from '@/lib/auth-hooks'

const navItems = [
  { label: 'Intelligence', href: '/bloglux' },
  { label: 'Wiki', href: '/wikilux' },
  { label: 'Salaries', href: '/salaries' },
  { label: 'Interviews', href: '/interviews' },
  { label: 'Escape', href: '/services/travel' },
  { label: 'Services', href: '/services' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated } = useMember()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e8e2d8]">
      <div className="jl-container">
        <div className="flex items-center justify-between py-4">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <img
              src="/logos/joblux-header.png"
              alt="JOBLUX"
              className="h-6 sm:h-7 w-auto block"
            />
          </Link>

          {/* Center nav — desktop */}
          <nav className="hidden md:flex items-center justify-center gap-5">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center text-[0.8rem] leading-none font-semibold tracking-wide text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Link href="/members" className="hidden sm:flex items-center text-sm font-medium leading-none text-[#a58e28] hover:text-[#1a1a1a] transition-colors">Access</Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-[#555] hover:text-[#1a1a1a]"
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
                  href="/members"
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
    </header>
  )
}
