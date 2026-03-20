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
    images: [
      {
        url: 'https://www.luxuryrecruiter.com/api/og?title=Interview+Intelligence&subtitle=Inside+Luxury+Maisons&type=page',
        width: 1200,
        height: 630,
        alt: 'Interview Intelligence — Inside Luxury Maisons | JOBLUX',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interview Intelligence — Inside Luxury Maisons | JOBLUX',
    description:
      'Real interview experiences at top luxury brands. Discover what to expect at Louis Vuitton, Chanel, Hermès and 150+ maisons.',
    images: ['https://www.luxuryrecruiter.com/api/og?title=Interview+Intelligence&subtitle=Inside+Luxury+Maisons&type=page'],
  },
}

export default function InterviewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
