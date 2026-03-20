import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Interview Intelligence — Inside Luxury Maisons | JOBLUX',
  description:
    'Real interview experiences at top luxury brands. Discover what to expect at Louis Vuitton, Chanel, Hermès and 150+ maisons.',
  openGraph: {
    title: 'Interview Intelligence — Inside Luxury Maisons | JOBLUX',
    description:
      'Real interview experiences at top luxury brands. Discover what to expect at Louis Vuitton, Chanel, Hermès and 150+ maisons.',
    type: 'website',
  },
}

export default function InterviewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
