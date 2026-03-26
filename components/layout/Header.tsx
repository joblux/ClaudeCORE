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
        className="max-w-[1200px] mx-auto px-7 py-[28px]"
        style={{ display: 'grid', gridTemplateColumns: '160px 1fr 220px', alignItems: 'center' }}
      >

        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <img
            src="/logos/joblux-header.png"
            alt="JOBLUX"
            className="h-[26px] w-auto block"
          />
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center justify-center gap-9">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-[15px] font-normal tracking-wide transition-colors ${
                  isActive
                    ? 'text-white underline underline-offset-[6px] decoration-[1.5px]'
                    : 'text-[rgba(255,255,255,0.82)] hover:text-white'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center justify-end gap-4 flex-shrink-0">
          <Link
            href="/escape"
            className="hidden sm:inline text-[15px] italic text-[#a58e28] hover:text-[#e4b042] transition-colors"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Escape
          </Link>

          {/* Separator */}
          <div className="hidden sm:block w-px h-4 bg-[#333]" />

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Link
              href="/members"
              className="hidden sm:inline text-[15px] text-[rgba(255,255,255,0.82)] hover:text-white transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Connect
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 text-[24px] text-[rgba(255,255,255,0.82)] hover:text-white"
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
                    isActive ? 'text-white' : 'text-[rgba(255,255,255,0.82)] hover:text-white'
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
              <Link
                href="/members"
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-[15px] text-[rgba(255,255,255,0.82)]"
              >
                Connect
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
