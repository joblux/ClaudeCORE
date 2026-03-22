import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ & Contact — JOBLUX',
  description:
    'Frequently asked questions about JOBLUX — access, opportunities, contributions, privacy, and how to get in touch.',
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
