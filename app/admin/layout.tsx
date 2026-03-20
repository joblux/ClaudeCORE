'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRequireAdmin } from '@/lib/auth-hooks'
import {
  LayoutDashboard, BarChart3, Briefcase, Kanban, MessageSquare,
  Users, Star, Send, FileText, BookOpen, DollarSign, FileCode,
  Menu, X, LogOut
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'RECRUITMENT',
    items: [
      { label: 'Search Assignments', href: '/admin/assignments', icon: Briefcase },
      { label: 'ATS Pipeline', href: '/admin/ats', icon: Kanban },
      { label: 'Messages', href: '/admin/messages', icon: MessageSquare, countKey: 'unread_messages' },
    ],
  },
  {
    label: 'SOCIETY',
    items: [
      { label: 'Members', href: '/admin', icon: Users, exact: true },
      { label: 'Contributions', href: '/admin/contributions', icon: Star, countKey: 'pending_contributions' },
      { label: 'Invitations', href: '/admin/invitations', icon: Send },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { label: 'BlogLux', href: '/admin/articles', icon: FileText },
      { label: 'WikiLux', href: '/admin/wikilux', icon: BookOpen },
      { label: 'Salary Data', href: '/salaries', icon: DollarSign },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { label: 'Message Templates', href: '/admin/messages/templates', icon: FileCode },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading, name, email } = useRequireAdmin()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [counts, setCounts] = useState<Record<string, number>>({})

  // Fetch counts for badges (unread messages, pending contributions)
  useEffect(() => {
    fetch('/api/admin/sidebar-counts')
      .then(r => r.ok ? r.json() : {})
      .then(data => setCounts(data))
      .catch(() => {})
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <div className="text-sm text-[#888]">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) return null

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const sidebar = (
    <aside className="w-[260px] min-h-screen bg-[#1a1a1a] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#2a2a2a]">
        <Link href="/admin/dashboard" className="block">
          <span className="text-xl font-semibold text-[#a58e28]" style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>
            JOBLUX.
          </span>
          <span className="text-[0.6rem] tracking-[0.2em] uppercase text-[#555] ml-2">Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <div className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#555] px-3 mb-2">
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href, (item as any).exact)
              const count = (item as any).countKey ? counts[(item as any).countKey] : 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors mb-0.5 ${
                    active
                      ? 'text-[#a58e28] bg-[#a58e28]/10 border-l-2 border-[#a58e28]'
                      : 'text-[#999] hover:text-[#ddd] hover:bg-[#a58e28]/5 border-l-2 border-transparent'
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {count > 0 && (
                    <span className="text-[0.6rem] font-bold bg-[#a58e28] text-[#1a1a1a] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom -- admin info + exit */}
      <div className="px-4 py-4 border-t border-[#2a2a2a]">
        <div className="text-xs text-[#888] truncate mb-1">{name || email || 'Admin'}</div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs text-[#666] hover:text-[#a58e28] transition-colors"
        >
          <LogOut size={12} />
          Exit Admin
        </Link>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-[#fafaf5]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{sidebar}</div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-[260px] h-full">{sidebar}</div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header with hamburger */}
        <div className="lg:hidden bg-[#1a1a1a] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <span className="text-lg font-semibold text-[#a58e28]" style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>
            JOBLUX.
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-[#888] hover:text-white p-2"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
