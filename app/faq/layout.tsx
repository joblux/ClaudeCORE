import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help & FAQ | JOBLUX',
  description:
    'Everything you need to know about JOBLUX | access, careers intelligence, contributions, privacy, and how to reach us.',
  alternates: { canonical: 'https://www.joblux.com/faq' },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
