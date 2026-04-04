'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useRequireAdmin } from '@/lib/auth-hooks'
import {
  LayoutDashboard, Briefcase, Kanban, MessageSquare,
  Users, Building2, Star, FileText, BookOpen,
  Menu, X, LogOut, Mail, Newspaper,
  Compass, ClipboardList, Settings, Sparkles, MessageCircle, Image
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Members',
    items: [
      { label: 'Profiles', href: '/admin', icon: Users, exact: true, countKey: 'pending_members' },
      { label: 'Businesses', href: '/admin?view=business', icon: Building2, exact: true, countKey: 'pending_businesses' },
      { label: 'Messages', href: '/admin/messages', icon: MessageSquare, countKey: 'unread_messages' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'WikiLux', href: '/admin/wikilux', icon: BookOpen },
      { label: 'Insights', href: '/admin/articles', icon: FileText },
      { label: 'Comments', href: '/admin/bloglux/comments', icon: MessageCircle, countKey: 'pending_comments' },
      { label: 'The Brief', href: '/admin/the-brief', icon: Newspaper },
    ],
  },
  {
    label: 'LuxAI',
    items: [
      { label: 'Command Center', href: '/admin/luxai', icon: Sparkles, exact: true },
      { label: 'Approval Queue', href: '/admin/luxai/queue', icon: ClipboardList },
    ],
  },
  {
    label: 'Contributions',
    items: [
      { label: 'Command Center', href: '/admin/contributions', icon: Star, countKey: 'pending_contributions' },
    ],
  },
  {
    label: 'Recruiting',
    items: [
      { label: 'Assignments', href: '/admin/assignments', icon: Briefcase },
      { label: 'ATS Pipeline', href: '/admin/ats', icon: Kanban },
      { label: 'Briefs', href: '/admin/briefs', icon: ClipboardList },
    ],
  },
  {
    label: 'Escape',
    items: [
      { label: 'Content', href: '/admin/escape', icon: Compass },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Media Library', href: '/admin/media', icon: Image },
      { label: 'Contact Messages', href: '/admin/contact', icon: Mail, countKey: 'new_contact' },
      { label: 'Email Templates', href: '/admin/emails', icon: Mail },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
]

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/admin/dashboard': { title: 'Dashboard', subtitle: 'Platform overview' },
  '/admin': { title: 'Members', subtitle: 'Member directory' },
  '/admin/assignments': { title: 'Assignments', subtitle: 'Search assignments' },
  '/admin/ats': { title: 'ATS Pipeline', subtitle: 'Applicant tracking' },
  '/admin/briefs': { title: 'Briefs', subtitle: 'Recruiting requests' },
  '/admin/messages': { title: 'Messages', subtitle: 'Member communications' },
  '/admin/contributions': { title: 'Contributions', subtitle: 'Command center' },
  '/admin/articles': { title: 'Insights', subtitle: 'BlogLux articles' },
  '/admin/bloglux/comments': { title: 'Comments', subtitle: 'Moderation queue' },
  '/admin/the-brief': { title: 'The Brief', subtitle: 'Newsletter management' },
  '/admin/wikilux': { title: 'WikiLux', subtitle: 'Brand encyclopedia' },
  '/admin/escape': { title: 'Escape', subtitle: 'Travel content' },
  '/admin/luxai': { title: 'LuxAI', subtitle: 'Command center' },
  '/admin/luxai/queue': { title: 'Approval Queue', subtitle: 'Pending AI content' },
  '/admin/luxai/usage': { title: 'LuxAI Usage', subtitle: 'Volume & cost tracking' },
  '/admin/media': { title: 'Media Library', subtitle: 'Files and images' },
  '/admin/contact': { title: 'Contact Messages', subtitle: 'Inbound enquiries' },
  '/admin/emails': { title: 'Email Templates', subtitle: 'Transactional emails' },
  '/admin/messages/templates': { title: 'Message Templates', subtitle: 'Saved responses' },
  '/admin/settings': { title: 'Settings', subtitle: 'Platform configuration' },
}

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
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#e8e8e8] border-t-[#111] rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null

  const isActive = (href: string, exact?: boolean) => {
    if (href.includes('?')) {
      const [path, qs] = href.split('?')
      return pathname === path && typeof window !== 'undefined' && window.location.search.includes(qs)
    }
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const initials = (name || email || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const currentPage = PAGE_TITLES[pathname] || { title: 'Admin', subtitle: 'JOBLUX command centre' }

  /* ── Sidebar nav renderer ── */
  const renderNav = (mobile?: boolean) => (
    <nav className="flex-1 overflow-y-auto py-3 px-2.5">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-5">
          <div className="text-[10px] tracking-[0.14em] uppercase text-[#aaa] px-2.5 mb-2 font-semibold">
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
                onClick={mobile ? () => setMobileOpen(false) : undefined}
                className={`flex items-center gap-2.5 py-[7px] px-2.5 rounded-md mb-[1px] text-[13px] transition-colors no-underline ${
                  active
                    ? 'bg-[#f0f0f0] text-[#111] font-medium'
                    : 'text-[#666] hover:bg-[#f5f5f5] hover:text-[#111]'
                }`}
              >
                <Icon size={15} className="flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {count > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-[1px] rounded-full min-w-[18px] text-center bg-[#111] text-white">
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )

  /* ── Sidebar footer ── */
  const renderSidebarFooter = () => (
    <>
      {/* Live indicator */}
      <div className="px-4 py-3 border-t border-[#e8e8e8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-[11px] text-[#999]">
              {maintenanceMode ? 'Offline' : 'Live'} &middot; joblux.com
            </span>
          </div>
          <button
            onClick={toggleMaintenance}
            disabled={maintenanceLoading}
            className={`relative w-8 h-[18px] rounded-full transition-colors ${
              maintenanceMode ? 'bg-red-400' : 'bg-green-400'
            } ${maintenanceLoading ? 'opacity-50' : ''}`}
            title={maintenanceMode ? 'Site is offline | click to go live' : 'Site is live | click to go offline'}
          >
            <span
              className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform shadow-sm ${
                maintenanceMode ? 'translate-x-[14px]' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Admin profile + sign out */}
      <div className="px-4 py-3 border-t border-[#e8e8e8]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#e8e8e8] text-[#666] text-[11px] font-medium flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] text-[#111] truncate">{name || email || 'Admin'}</div>
            <div className="text-[11px] text-[#999]">Administrator</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ redirect: false }).then(() => { window.location.href = '/'; })}
          className="w-full flex items-center justify-center gap-2 py-2 text-[12px] text-[#dc2626] border border-[#fecaca] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </>
  )

  /* ── Desktop sidebar ── */
  const desktopSidebar = (
    <aside className="hidden lg:flex lg:flex-col w-[220px] min-h-screen bg-white border-r border-[#e8e8e8] flex-shrink-0">
      {/* Logo + badge */}
      <div className="px-4 py-4 border-b border-[#e8e8e8]">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 no-underline">
          <span className="text-[16px] font-bold tracking-[0.08em] text-[#111]">JOBLUX</span>
          <span className="text-[10px] tracking-wide px-2 py-0.5 bg-[#f5f5f5] text-[#555] border border-[#e8e8e8] rounded font-medium">
            ADMIN
          </span>
        </Link>
      </div>

      {renderNav()}
      {renderSidebarFooter()}
    </aside>
  )

  /* ── Mobile sidebar ── */
  const mobileSidebar = (
    <aside className="w-[280px] min-h-screen bg-white flex flex-col flex-shrink-0">
      <div className="px-5 py-4 border-b border-[#e8e8e8] flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 no-underline">
          <span className="text-[16px] font-bold tracking-[0.08em] text-[#111]">JOBLUX</span>
          <span className="text-[10px] tracking-wide px-2 py-0.5 bg-[#f5f5f5] text-[#555] border border-[#e8e8e8] rounded font-medium">
            ADMIN
          </span>
        </Link>
        <button onClick={() => setMobileOpen(false)} className="text-[#999] hover:text-[#111] p-1">
          <X size={18} />
        </button>
      </div>
      {renderNav(true)}
      {renderSidebarFooter()}
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {/* Global admin style overrides */}
      <style>{`
        .admin-content [style*="color: #a58e28"],
        .admin-content [style*="color:#a58e28"] { color: #444 !important; }
        .admin-content [style*="color: rgb(165, 142, 40)"] { color: #444 !important; }
        .admin-content [style*="border-color: #a58e28"],
        .admin-content [style*="border-color:#a58e28"] { border-color: #e8e8e8 !important; }
        .admin-content [style*="border-top-color: #a58e28"],
        .admin-content [style*="border-top-color:#a58e28"] { border-top-color: #111 !important; }
        .admin-content [style*="background-color: #a58e28"],
        .admin-content [style*="background-color:#a58e28"],
        .admin-content [style*="background: #a58e28"],
        .admin-content [style*="background:#a58e28"] { background-color: #111 !important; }
        .admin-content [style*="background: #0d1117"],
        .admin-content [style*="background:#0d1117"],
        .admin-content [style*="background-color: #0d1117"],
        .admin-content [style*="background-color:#0d1117"] { background-color: #f5f5f5 !important; }
        .admin-content [style*="background: #161b22"],
        .admin-content [style*="background:#161b22"],
        .admin-content [style*="background-color: #161b22"],
        .admin-content [style*="background-color:#161b22"] { background-color: #fff !important; }
        .admin-content [style*="background: #1a1a1a"],
        .admin-content [style*="background:#1a1a1a"],
        .admin-content [style*="background-color: #1a1a1a"],
        .admin-content [style*="background-color:#1a1a1a"] { background-color: #111 !important; }
        .admin-content [style*="background: #0f0f0f"],
        .admin-content [style*="background:#0f0f0f"],
        .admin-content [style*="background-color: #0f0f0f"],
        .admin-content [style*="background-color:#0f0f0f"] { background-color: #f5f5f5 !important; }
        .admin-content [style*="background: #141414"],
        .admin-content [style*="background:#141414"],
        .admin-content [style*="background-color: #141414"],
        .admin-content [style*="background-color:#141414"] { background-color: #f5f5f5 !important; }
        .admin-content [style*="border-color: #30363d"],
        .admin-content [style*="border-color:#30363d"],
        .admin-content [style*="border: 1px solid #30363d"] { border-color: #e8e8e8 !important; }
        .admin-content [style*="color: #e6edf3"],
        .admin-content [style*="color:#e6edf3"] { color: #111 !important; }
        .admin-content [style*="color: #8b949e"],
        .admin-content [style*="color:#8b949e"] { color: #999 !important; }
        .admin-content [style*="color: #484f58"],
        .admin-content [style*="color:#484f58"] { color: #999 !important; }
        .admin-content [style*="font-family: Playfair"],
        .admin-content [style*="font-family:Playfair"],
        .admin-content [style*="font-family: 'Playfair"] { font-family: system-ui, -apple-system, sans-serif !important; }
        .admin-content [style*="background: #fafaf5"],
        .admin-content [style*="background:#fafaf5"],
        .admin-content [style*="background-color: #fafaf5"],
        .admin-content [style*="background-color:#fafaf5"] { background-color: #f5f5f5 !important; }
        .admin-content [style*="border-color: #e8e2d8"],
        .admin-content [style*="border-color:#e8e2d8"],
        .admin-content [style*="border: 1px solid #e8e2d8"] { border-color: #e8e8e8 !important; }
      `}</style>

      {/* Desktop sidebar */}
      {desktopSidebar}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-[280px] h-full">{mobileSidebar}</div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-[#e8e8e8]">
          <span className="text-[15px] font-bold tracking-[0.08em] text-[#111]">JOBLUX</span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-[#999] hover:text-[#111] p-2"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-between px-6 h-[52px] bg-white border-b border-[#e8e8e8]">
          <div className="flex items-center gap-3">
            <h1 className="text-[14px] font-semibold text-[#111]">{currentPage.title}</h1>
            <span className="text-[12px] text-[#999]">{currentPage.subtitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#999]">joblux.com</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className={`text-[10px] font-medium ${maintenanceMode ? 'text-red-500' : 'text-green-600'}`}>
                {maintenanceMode ? 'Offline' : 'Live'}
              </span>
            </div>
            <div className="w-px h-4 bg-[#e8e8e8]" />
            <span className="text-[10px] tracking-wide px-2 py-0.5 bg-[#f5f5f5] text-[#555] border border-[#e8e8e8] rounded font-medium">
              ADMIN
            </span>
            <div className="w-[28px] h-[28px] rounded-full bg-[#e8e8e8] text-[#666] text-[10px] font-medium flex items-center justify-center">
              {initials}
            </div>
          </div>
        </div>

        <main className="admin-content min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
