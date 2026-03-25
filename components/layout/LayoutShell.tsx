'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { SignalsTicker } from './SignalsTicker'
import { Footer } from './Footer'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEscape = pathname.startsWith('/escape')
  const isAdmin = pathname.startsWith('/admin')

  // Escape and Admin have their own layouts
  if (isEscape || isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <SignalsTicker />
      {children}
      <Footer />
    </>
  )
}
