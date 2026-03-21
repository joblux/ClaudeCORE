import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help & Contact | JOBLUX',
  description: 'Frequently asked questions and contact form for JOBLUX, the luxury talents society.',
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
