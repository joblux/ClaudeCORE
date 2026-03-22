import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Interview Intelligence — Luxury Industry Interview Experiences | JOBLUX',
  description:
    'Confidential interview experiences shared by professionals who have been through the process at the industry\'s most selective maisons.',
  alternates: { canonical: 'https://www.joblux.com/interviews' },
  openGraph: {
    title: 'Interview Intelligence | JOBLUX',
    description: 'Confidential interview experiences from luxury professionals.',
    type: 'website',
    images: [
      {
        url: '/api/og?title=Interview+Intelligence&subtitle=Inside+Luxury+Maisons&type=page',
        width: 1200,
        height: 630,
        alt: 'Interview Intelligence | JOBLUX',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interview Intelligence | JOBLUX',
    description: 'Confidential interview experiences from luxury professionals.',
    images: ['/api/og?title=Interview+Intelligence&subtitle=Inside+Luxury+Maisons&type=page'],
  },
}

export default function InterviewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
