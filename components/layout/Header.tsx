'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'
import { useMember } from '@/lib/auth-hooks'

const navItems = [
  { label: 'WikiLux', href: '/wikilux' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Salaries', href: '/salaries' },
  { label: 'Coaching', href: '/coaching' },
  { label: 'Bloglux', href: '/bloglux' },
  { label: 'Travel', href: '/travel' },
  { label: 'The Brief', href: '/the-brief' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { isAuthenticated } = useMember()
  return (
    <header className="border-b border-[#e8e2d8]">

      {/* ROW 1 — Logo left, auth right */}
      <div className="jl-container">
        <div className="flex items-center justify-between py-3 border-b-2 border-[#1a1a1a]">
          <Link href="/" className="inline-block">
            <div className="text-[2.75rem] md:text-[2.5rem] font-semibold text-[#1a1a1a] leading-none" style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>JOBLUX.</div>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[#888] hover:text-[#1a1a1a] transition-colors"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <UserMenu />
            {!isAuthenticated && (
              <Link href="/join" className="jl-btn jl-btn-primary py-1.5 px-3 text-[0.6rem]">Request Access</Link>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2 — Desktop nav */}
      <div className="jl-container hidden md:block">
        <nav className="flex items-center justify-center border-b border-[#e8e2d8]">
          {navItems.map((item) => (<Link key={item.label} href={item.href} className="px-3 py-2 jl-overline hover:text-[#1a1a1a] border-b-2 border-transparent hover:border-[#1a1a1a] transition-all">{item.label}</Link>))}
        </nav>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden jl-container">
        <div className="flex items-center justify-between py-2">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="jl-overline flex items-center gap-2"><span className="text-lg">{mobileOpen ? '\u2715' : '\u2630'}</span>Menu</button>
        </div>
        {mobileOpen && (
          <nav className="pb-4 border-b border-[#e8e2d8]">
            {navItems.map((item) => (<Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="block py-2.5 jl-overline hover:text-[#a58e28] transition-colors border-b border-[#f5f0e8] last:border-0">{item.label}</Link>))}
          </nav>
        )}
      </div>

    </header>
  )
}
