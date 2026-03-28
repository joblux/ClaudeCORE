'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from './Header'
import { SignalsTicker } from './SignalsTicker'
import { Footer } from './Footer'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEscape = pathname.startsWith('/escape')
  const isAdmin = pathname.startsWith('/admin')
  const isHolding = pathname.startsWith('/holding')
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  // Escape, Admin, and Holding have their own layouts
  if (isEscape || isAdmin || isHolding) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      {!isAuthenticated && <SignalsTicker />}
      {children}
      <Footer />
    </>
  )
}
