import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Escape — Private Travel Advisory | JOBLUX', template: '%s | JOBLUX Escape' },
}

export default function EscapeLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen" style={{ backgroundColor: '#FDF8EE' }}>{children}</div>
}
