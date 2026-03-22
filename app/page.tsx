import { Ticker } from '@/components/home/Ticker'
import { FeaturedContent } from '@/components/home/FeaturedContent'
import { SalarySnapshot } from '@/components/home/SalarySnapshot'
import { LatestJobs } from '@/components/home/LatestJobs'
import { WikiLuxPreview } from '@/components/home/WikiLuxPreview'
import { LuxuryEscapeTeaser } from '@/components/home/LuxuryEscapeTeaser'
import { TheBriefSignup } from '@/components/home/TheBriefSignup'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JOBLUX | Luxury Talents Society',
  description: 'The society for luxury professionals. Salary data, brand insights, executive search, and career intelligence across 150+ maisons.',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'JOBLUX',
  alternateName: 'Luxury Talents Society',
  url: 'https://www.joblux.com',
  logo: 'https://www.joblux.com/favicon.svg',
  description: 'The society for luxury professionals. Executive search, salary intelligence, and career intelligence for the premium-to-ultra-luxury industry.',
  foundingDate: '2006',
  founder: { '@type': 'Person', name: "Mohammed M'zaour" },
  address: { '@type': 'PostalAddress', addressLocality: 'Paris', addressCountry: 'FR' },
  sameAs: [],
}

export default function HomePage() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      {/* INDUSTRY TICKER */}
      <Ticker />

      {/* MAIN CONTENT */}
      <div className="bg-[#f5f4f0] py-12 lg:py-16">
      <div className="jl-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT — Main content */}
          <div className="lg:col-span-2 space-y-10">
            <FeaturedContent />
          </div>

          {/* RIGHT — Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-5"><TheBriefSignup /></div>
            <div className="bg-white rounded-lg shadow-sm p-5"><SalarySnapshot /></div>
            <div className="bg-white rounded-lg shadow-sm p-5"><LatestJobs /></div>
            <div className="bg-white rounded-lg shadow-sm p-5"><WikiLuxPreview /></div>
            <div className="bg-white rounded-lg shadow-sm p-5"><LuxuryEscapeTeaser /></div>
          </div>

        </div>
      </div>
      </div>

    </div>
  )
}
