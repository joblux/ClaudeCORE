import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ & Contact | JOBLUX',
  description: 'Frequently asked questions about JOBLUX membership, recruitment, contributions, and the luxury talents society.',
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
