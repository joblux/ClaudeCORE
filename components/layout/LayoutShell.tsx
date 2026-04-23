'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEscape = pathname.startsWith('/escape')
  const isAdmin = pathname.startsWith('/admin')
  const isHolding = pathname.startsWith('/holding')
  const isDashboard = pathname.startsWith('/dashboard')

  // Escape, Admin, Holding, and Dashboard have their own layouts
  if (isEscape || isAdmin || isHolding || isDashboard) {
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
