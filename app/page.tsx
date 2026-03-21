import Link from 'next/link'
import { Ticker } from '@/components/home/Ticker'
import { FeaturedContent } from '@/components/home/FeaturedContent'
import { SalarySnapshot } from '@/components/home/SalarySnapshot'
import { LatestJobs } from '@/components/home/LatestJobs'
import { WikiLuxPreview } from '@/components/home/WikiLuxPreview'
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
  url: 'https://www.luxuryrecruiter.com',
  logo: 'https://www.luxuryrecruiter.com/favicon.svg',
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

      {/* ── Hero ── */}
      <section className="w-full bg-[#1a1a1a] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8 text-center">
        <div className="max-w-3xl mx-auto">

          <p className="text-sm sm:text-base tracking-[0.14em] uppercase text-[#a58e28] font-medium mb-6">
            Luxury Talents Society
          </p>

          <div className="flex flex-row gap-2 justify-center items-center">
            <Link
              href="/join"
              className="px-3 py-1.5 bg-[#a58e28] text-[#1a1a1a] text-xs font-medium
                         hover:bg-[#c4aa3a] active:scale-[0.98] transition-all duration-200
                         whitespace-nowrap"
            >
              Request Access
            </Link>
            <Link
              href="/wikilux"
              className="px-3 py-1.5 border border-white/30 text-white text-xs font-medium
                         hover:border-white/60 active:scale-[0.98]
                         transition-all duration-200 whitespace-nowrap"
            >
              Explore WikiLux
            </Link>
          </div>

        </div>
      </section>

      {/* INDUSTRY TICKER */}
      <Ticker />

      {/* MAIN CONTENT */}
      <div className="jl-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT — Main content */}
          <div className="lg:col-span-2 space-y-10">
            <FeaturedContent />
          </div>

          {/* RIGHT — Sidebar */}
          <div className="space-y-8">
            <TheBriefSignup />
            <SalarySnapshot />
            <LatestJobs />
            <WikiLuxPreview />
          </div>

        </div>
      </div>

    </div>
  )
}
