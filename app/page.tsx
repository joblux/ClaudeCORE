import type { Metadata } from 'next'
import InsightsPage from './insights/page'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'JOBLUX | Luxury career intelligence',
  description: 'Real salary data. Confidential opportunities. Market signals across 180+ luxury brands. The intelligence you need to make your next move.',
  alternates: { canonical: '/' },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'JOBLUX',
  url: 'https://www.joblux.com',
  logo: 'https://www.joblux.com/favicon.svg',
  description: 'Luxury career intelligence. Real salary data, confidential opportunities, and market signals across 180+ luxury brands.',
  foundingDate: '2006',
  founder: { '@type': 'Person', name: "Mohammed M'zaour" },
  address: { '@type': 'PostalAddress', addressLocality: 'Paris', addressCountry: 'FR' },
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <InsightsPage />
    </>
  )
}
