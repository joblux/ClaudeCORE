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
      <div className="px-7 py-[14px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <img
            src="/logos/joblux-header.png"
            alt="JOBLUX"
            className="h-[22px] w-auto block"
          />
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center justify-center gap-7">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-[13px] font-normal tracking-wide transition-colors ${
                  isActive
                    ? 'text-white underline underline-offset-[6px] decoration-[1.5px]'
                    : 'text-[#888] hover:text-white'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-5 flex-shrink-0">
          <Link
            href="/escape"
            className="hidden sm:inline text-[14px] italic text-[#a58e28] hover:text-[#e4b042] transition-colors"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Escape
          </Link>

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link
                href="/members"
                className="hidden sm:inline text-[13px] text-[#888] hover:text-white transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Sign in
              </Link>
              <Link
                href="/members"
                className="hidden sm:inline-block border border-[#a58e28] text-[#a58e28] text-[11px] tracking-wide px-5 py-2 rounded-[3px] hover:bg-[#a58e28] hover:text-[#1a1a1a] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Request access
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 text-[24px] text-[#888] hover:text-white"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? '\u2715' : '\u2630'}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] bg-[#1a1a1a] z-50 flex flex-col">
          <nav className="flex-1 px-7 py-8 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-4 text-[15px] border-b border-[#2a2a2a] transition-colors ${
                    isActive ? 'text-white' : 'text-[#888] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="px-7 pb-10 space-y-4">
            <Link
              href="/escape"
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-[15px] italic text-[#a58e28]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Escape
            </Link>
            {!isAuthenticated && (
              <>
                <Link
                  href="/members"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-[15px] text-[#888]"
                >
                  Sign in
                </Link>
                <Link
                  href="/members"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center border border-[#a58e28] text-[#a58e28] text-[13px] tracking-wide px-5 py-3 rounded-[3px]"
                >
                  Request access
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
