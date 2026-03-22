import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Salary Intelligence — Luxury Industry Compensation Data | JOBLUX',
  description: 'Salary benchmarks for 15 roles across 8 global markets. Compensation data for Louis Vuitton, Chanel, Hermès and 150+ luxury maisons.',
  alternates: { canonical: 'https://www.joblux.com/salaries' },
  openGraph: {
    title: 'Salary Intelligence | JOBLUX',
    description: 'Salary benchmarks across luxury. Compensation data for 150+ maisons.',
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
    description: 'Salary benchmarks across luxury. Compensation data for 150+ maisons.',
    images: ['/api/og?title=Salary+Intelligence&subtitle=Luxury+Industry+Compensation&type=page'],
  },
}

export default function SalaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
