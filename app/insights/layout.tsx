import type { ReactNode } from 'react'

export const metadata = {
  alternates: { canonical: '/' },
}

export default function InsightsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
