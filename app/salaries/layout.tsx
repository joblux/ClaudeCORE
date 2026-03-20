import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Salary Intelligence — Luxury Industry Compensation Data | JOBLUX',
  description:
    'Salary benchmarks, comparisons, and personalised estimates for roles at Louis Vuitton, Chanel, Hermès and 150+ luxury maisons worldwide.',
  openGraph: {
    title: 'Salary Intelligence | JOBLUX',
    description: 'Luxury industry compensation data across 150+ maisons worldwide.',
    images: [
      {
        url: 'https://www.luxuryrecruiter.com/api/og?title=Salary+Intelligence&subtitle=Luxury+Industry+Compensation&type=page',
        width: 1200,
        height: 630,
        alt: 'Salary Intelligence | JOBLUX',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salary Intelligence | JOBLUX',
    description: 'Luxury industry compensation data across 150+ maisons worldwide.',
    images: ['https://www.luxuryrecruiter.com/api/og?title=Salary+Intelligence&subtitle=Luxury+Industry+Compensation&type=page'],
  },
}

export default function SalaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
