'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRequireAdmin } from '@/lib/auth-hooks'
import {
  LayoutDashboard, BarChart3, Briefcase, Kanban, MessageSquare,
  Users, Star, Send, FileText, BookOpen, DollarSign, FileCode,
  Menu, X, LogOut, Power, Images, PenLine, MessageCircle, GraduationCap, Mail
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'ADMIN',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Members', href: '/admin', icon: Users, exact: true },
      { label: 'Search Assignments', href: '/admin/assignments', icon: Briefcase },
      { label: 'Internships', href: '/admin/internships', icon: GraduationCap, countKey: 'pending_internships' },
      { label: 'ATS Pipeline', href: '/admin/ats', icon: Kanban },
      { label: 'Messages', href: '/admin/messages', icon: MessageSquare, countKey: 'unread_messages' },
      { label: 'Contributions', href: '/admin/contributions', icon: Star, countKey: 'pending_contributions' },
      { label: 'Invitations', href: '/admin/invitations', icon: Send },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { label: 'BlogLux', href: '/admin/articles', icon: FileText },
      { label: 'New Article', href: '/admin/articles/new', icon: PenLine },
      { label: 'Comments', href: '/admin/bloglux/comments', icon: MessageCircle, countKey: 'pending_comments' },
      { label: 'WikiLux', href: '/admin/wikilux', icon: BookOpen },
      { label: 'Salary Data', href: '/salaries', icon: DollarSign },
      { label: 'Media Library', href: '/admin/media', icon: Images },
    ],
  },
  {
    label: 'SUPPORT',
    items: [
      { label: 'Contact Messages', href: '/admin/contact', icon: Mail, countKey: 'new_contact' },
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
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceLoading, setMaintenanceLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/sidebar-counts')
      .then(r => r.ok ? r.json() : {})
      .then(data => setCounts(data))
      .catch(() => {})
    fetch('/api/admin/maintenance')
      .then(r => r.ok ? r.json() : {})
      .then((data: any) => { if (data.maintenance_mode !== undefined) setMaintenanceMode(data.maintenance_mode) })
      .catch(() => {})
  }, [])

  const toggleMaintenance = async () => {
    setMaintenanceLoading(true)
    try {
      const res = await fetch('/api/admin/maintenance', { method: 'POST' })
      const data = await res.json()
      if (data.maintenance_mode !== undefined) setMaintenanceMode(data.maintenance_mode)
    } catch { /* toggle may fail if API is unreachable */ }
    setMaintenanceLoading(false)
  }

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

  const initials = (name || email || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  // Dashboard route gets compact sidebar (180px, tighter spacing)
  const isDashboard = pathname === '/admin/dashboard'
  const sidebarWidth = isDashboard ? 'w-[180px]' : 'w-[200px]'
  const itemPadding = isDashboard ? 'py-1.5 px-2.5 text-xs' : 'py-2 px-3 text-sm'
  const iconSize = isDashboard ? 13 : 15

  /* ── Desktop sidebar (light theme) ── */
  const desktopSidebar = (
    <aside className={`hidden lg:flex lg:flex-col ${sidebarWidth} min-h-screen bg-white border-r border-gray-200 flex-shrink-0 transition-all`}>
      {/* Logo + badge */}
      <div className={`px-3 ${isDashboard ? 'py-3' : 'py-4'} border-b border-gray-100`}>
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className={`${isDashboard ? 'text-base' : 'text-lg'} font-semibold text-[#1a1a1a]`} style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>
            JOBLUX.
          </span>
          <span className="text-[10px] tracking-wide px-2 py-0.5 bg-[#a58e28]/15 text-[#a58e28] rounded font-medium">
            {isDashboard ? 'CMD' : 'ADMIN'}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-1.5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className={isDashboard ? 'mb-2' : 'mb-4'}>
            {/* Divider before SETTINGS section */}
            {section.label === 'SETTINGS' && <div className="border-t border-gray-100 my-2" />}
            <div className={`text-[10px] tracking-[0.15em] uppercase text-gray-400 px-2.5 ${isDashboard ? 'mb-1.5' : 'mb-3'} font-medium`}>
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
                  className={`flex items-center gap-2 ${itemPadding} rounded-lg mb-0.5 transition-colors ${
                    active
                      ? 'bg-[#a58e28]/10 text-[#a58e28] font-medium'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={iconSize} className="flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {count > 0 && (
                    <span className="text-[9px] font-bold bg-[#a58e28] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Offline Mode Toggle */}
      <div className="px-3 py-2.5 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Power size={12} className={maintenanceMode ? 'text-red-400' : 'text-green-500'} />
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
              {maintenanceMode ? 'Offline' : 'Live'}
            </span>
          </div>
          <button
            onClick={toggleMaintenance}
            disabled={maintenanceLoading}
            className={`relative w-8 h-[18px] rounded-full transition-colors ${
              maintenanceMode ? 'bg-red-400' : 'bg-green-500'
            } ${maintenanceLoading ? 'opacity-50' : ''}`}
            title={maintenanceMode ? 'Site is offline — click to go live' : 'Site is live — click to go offline'}
          >
            <span
              className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform shadow-sm ${
                maintenanceMode ? 'translate-x-[14px]' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Admin info + exit */}
      <div className="px-3 py-2.5 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-full bg-[#1a1a1a] text-[#a58e28] text-[9px] font-medium flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div className="text-[11px] text-gray-600 truncate">{name || email || 'Admin'}</div>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-[#a58e28] transition-colors"
        >
          <LogOut size={10} />
          Exit Admin
        </Link>
      </div>
    </aside>
  )

  /* ── Mobile sidebar (dark theme — unchanged) ── */
  const mobileSidebar = (
    <aside className="w-[260px] min-h-screen bg-[#1a1a1a] flex flex-col flex-shrink-0">
      <div className="px-6 py-5 border-b border-[#2a2a2a]">
        <Link href="/admin/dashboard" className="block">
          <span className="text-xl font-semibold text-[#a58e28]" style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>
            JOBLUX.
          </span>
          <span className="text-[0.6rem] tracking-[0.2em] uppercase text-[#555] ml-2">Admin</span>
        </Link>
      </div>
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
      <div className="px-4 py-3 border-t border-[#2a2a2a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Power size={14} className={maintenanceMode ? 'text-red-400' : 'text-green-400'} />
            <span className="text-[0.65rem] text-[#999] uppercase tracking-wider">
              {maintenanceMode ? 'Offline' : 'Live'}
            </span>
          </div>
          <button
            onClick={toggleMaintenance}
            disabled={maintenanceLoading}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              maintenanceMode ? 'bg-red-500/60' : 'bg-green-500/60'
            } ${maintenanceLoading ? 'opacity-50' : ''}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
      <div className="px-4 py-4 border-t border-[#2a2a2a]">
        <div className="text-xs text-[#888] truncate mb-1">{name || email || 'Admin'}</div>
        <Link href="/dashboard" className="flex items-center gap-2 text-xs text-[#666] hover:text-[#a58e28] transition-colors">
          <LogOut size={12} />
          Exit Admin
        </Link>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-[#fafaf5]">
      {/* Desktop sidebar */}
      {desktopSidebar}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-[260px] h-full">{mobileSidebar}</div>
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

        {/* Desktop top bar — compact on dashboard, standard elsewhere */}
        <div className={`hidden lg:flex items-center justify-between px-6 ${isDashboard ? 'py-2' : 'py-3'} bg-white border-b border-gray-200`}>
          <div className="flex items-center gap-3">
            {isDashboard && (
              <>
                <span className="text-[10px] tracking-wide px-2 py-0.5 bg-[#a58e28]/15 text-[#a58e28] rounded font-medium">
                  COMMAND CENTRE
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Site URL + live indicator */}
            <span className="text-[11px] text-gray-400">luxuryrecruiter.com</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className={`text-[10px] font-medium ${maintenanceMode ? 'text-red-500' : 'text-green-600'}`}>
                {maintenanceMode ? 'Offline' : 'Live'}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <span className="text-[10px] tracking-wide px-2 py-0.5 bg-[#a58e28]/15 text-[#a58e28] rounded font-medium">
              ADMIN
            </span>
            <div className="w-[28px] h-[28px] rounded-full bg-[#1a1a1a] text-[#a58e28] text-[10px] font-medium flex items-center justify-center">
              {initials}
            </div>
          </div>
        </div>

        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
