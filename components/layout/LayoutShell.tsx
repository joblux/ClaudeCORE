'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

// Root-level route segments that own their own chrome (do NOT match these).
// Mirrors app/* folder structure. Anything single-segment NOT in this list
// is treated as a public ProfiLux slug (catch-all route app/[slug]/page.tsx)
// and renders without the global header/footer.
const KNOWN_ROOT_SEGMENTS = new Set([
  'about', 'access', 'account', 'admin', 'api', 'auth', 'bloglux', 'brands',
  'careers', 'coaching', 'connect', 'contribute', 'dashboard', 'directory',
  'escape', 'events', 'faq', 'feed.xml', 'holding', 'insights', 'interviews',
  'invite', 'jobs', 'join', 'members', 'offline', 'opportunities', 'privacy',
  'profile', 'r', 'rss.xml', 'salaries', 'select-profile', 'services',
  'signals', 'terms', 'the-brief', 'wikilux',
])

function isPublicProfileSlug(pathname: string): boolean {
  if (!pathname || pathname === '/') return false
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length !== 1) return false
  return !KNOWN_ROOT_SEGMENTS.has(segments[0])
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEscape = pathname.startsWith('/escape')
  const isAdmin = pathname.startsWith('/admin')
  const isHolding = pathname.startsWith('/holding')
  const isPublicProfile = isPublicProfileSlug(pathname)

  if (isEscape || isAdmin || isHolding || isPublicProfile) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
