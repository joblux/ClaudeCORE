'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEscape = pathname.startsWith('/escape')

  return (
    <>
      {!isEscape && <Header />}
      {children}
      {!isEscape && <Footer />}
    </>
  )
}
