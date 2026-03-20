import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Salary Intelligence — Luxury Industry Compensation Data | JOBLUX',
  description:
    'Salary benchmarks, comparisons, and personalised estimates for roles at Louis Vuitton, Chanel, Hermès and 150+ luxury maisons worldwide.',
  openGraph: {
    title: 'Salary Intelligence | JOBLUX',
    description: 'Luxury industry compensation data across 150+ maisons worldwide.',
  },
}

export default function SalaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
