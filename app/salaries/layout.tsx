import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Salary Intelligence | Luxury Industry Compensation Data | JOBLUX',
  description: 'Confidential salary benchmarks across 15 roles, 8 global markets, and 500+ maisons. Built on real data contributed by industry professionals.',
  alternates: { canonical: 'https://www.joblux.com/salaries' },
  openGraph: {
    title: 'Salary Intelligence | JOBLUX',
    description: 'Confidential salary benchmarks across 500+ luxury maisons.',
    images: [
      {
        url: '/api/og?title=Salary+Intelligence&subtitle=Luxury+Industry+Compensation&type=page',
        width: 1200,
        height: 630,
        alt: 'Salary Intelligence | JOBLUX',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salary Intelligence | JOBLUX',
    description: 'Confidential salary benchmarks across 500+ luxury maisons.',
    images: ['/api/og?title=Salary+Intelligence&subtitle=Luxury+Industry+Compensation&type=page'],
  },
}

export default function SalaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
