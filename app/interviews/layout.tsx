import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Interview Intelligence — Luxury Industry Interview Experiences | JOBLUX',
  description:
    'Real interview experiences at Van Cleef & Arpels, Bulgari, Cartier, Dior and more. Tips, process details, and preparation guides contributed by professionals.',
  alternates: { canonical: 'https://www.joblux.com/interviews' },
  openGraph: {
    title: 'Interview Intelligence | JOBLUX',
    description: 'Real interview experiences from luxury professionals.',
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
    description: 'Real interview experiences from luxury professionals.',
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
