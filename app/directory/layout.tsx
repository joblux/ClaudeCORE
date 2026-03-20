import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Member Directory — The Luxury Professional Network | JOBLUX',
  description:
    'Browse and connect with luxury industry professionals across the world\'s most prestigious maisons. Exclusive to JOBLUX members.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Member Directory | JOBLUX',
    description: 'The luxury professional network. Exclusive to JOBLUX members.',
  },
}

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
