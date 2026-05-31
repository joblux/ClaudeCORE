import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Escape — Curated Travels',
  description: 'A travel magazine for those who work to live well.',
}

export default function EscapeLayout({ children }: { children: ReactNode }) {
  redirect('/')
  return <>{children}</>
}
