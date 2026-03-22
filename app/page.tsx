import Link from 'next/link'
import { Ticker } from '@/components/home/Ticker'
import { FeaturedContent } from '@/components/home/FeaturedContent'
import { SalarySnapshot } from '@/components/home/SalarySnapshot'
import { LatestJobs } from '@/components/home/LatestJobs'
import { WikiLuxPreview } from '@/components/home/WikiLuxPreview'
import { LuxuryEscapeTeaser } from '@/components/home/LuxuryEscapeTeaser'
import { TheBriefSignup } from '@/components/home/TheBriefSignup'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JOBLUX — Luxury Industry Careers Intelligence',
  description: 'The confidential gateway for luxury industry careers intelligence, private recruitment, and travel advisory. Salary data, interview insights, and brand intelligence across 500+ maisons.',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'JOBLUX',
  alternateName: 'Luxury Industry Careers Intelligence',
  url: 'https://www.joblux.com',
  logo: 'https://www.joblux.com/favicon.svg',
  description: 'The confidential gateway for luxury industry careers intelligence, private recruitment, and travel advisory.',
  foundingDate: '2006',
  founder: { '@type': 'Person', name: "Mohammed M'zaour" },
  address: { '@type': 'PostalAddress', addressLocality: 'Paris', addressCountry: 'FR' },
  sameAs: [],
}

export default function HomePage() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      {/* POSITIONING BLOCK */}
      <div className="bg-[#1a1a1a] py-8 md:py-12">
        <div className="jl-container text-center">
          <div className="jl-overline-gold mb-4 tracking-[0.2em]">Luxury, decoded.</div>
          <h1 className="jl-serif text-3xl md:text-5xl font-light text-white mb-5 leading-tight max-w-3xl mx-auto">
            Luxury Talent Intelligence, Powered by Contribution.
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-2xl mx-auto leading-relaxed mb-8">
            Salary intelligence, interview insight, brand knowledge, recruitment, and travel for the global luxury world.
          </p>
          <Link href="/join" className="jl-btn jl-btn-gold">Access</Link>
        </div>
      </div>

      {/* INDUSTRY TICKER */}
      <Ticker />

      {/* MAIN CONTENT */}
      <div className="bg-[#f5f4f0] py-12 lg:py-16">
      <div className="jl-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT — Main content */}
          <div className="lg:col-span-2 space-y-10">
            <FeaturedContent />

            {/* CONTRIBUTION MODEL */}
            <div className="border-t border-[#e8e2d8] pt-10">
              <div className="jl-overline-gold mb-3">The contribution model</div>
              <h2 className="jl-serif text-xl font-light text-[#1a1a1a] mb-3">Intelligence is built on contribution</h2>
              <p className="font-sans text-sm text-[#666] leading-relaxed mb-5">
                JOBLUX is free to access. In return, we ask professionals to share what they know — a salary data point, an interview experience, a market signal. Every contribution sharpens the intelligence for everyone.
              </p>
              <Link href="/contribute" className="jl-btn jl-btn-outline text-xs">Contribute an insight</Link>
            </div>

            {/* SEARCH ASSIGNMENTS */}
            <div className="border-t border-[#e8e2d8] pt-10">
              <div className="bg-white rounded-lg shadow-sm p-5"><LatestJobs /></div>
            </div>

            {/* BRAND INTELLIGENCE */}
            <div className="bg-white rounded-lg shadow-sm p-5"><WikiLuxPreview /></div>
          </div>

          {/* RIGHT — Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-5"><TheBriefSignup /></div>
            <div className="bg-white rounded-lg shadow-sm p-5"><SalarySnapshot /></div>
            <div className="bg-white rounded-lg shadow-sm p-5"><LuxuryEscapeTeaser /></div>
          </div>

        </div>
      </div>
      </div>

      {/* PRIVATE SERVICES BLOCK */}
      <div className="bg-[#1a1a1a] py-14">
        <div className="jl-container">
          <div className="jl-overline-gold mb-8 text-center tracking-[0.2em]">Private Services</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#333] p-6 md:p-8">
              <div className="jl-overline text-[#888] mb-3">Confidential Recruitment</div>
              <h3 className="jl-serif text-xl font-light text-white mb-3">Private executive search for luxury</h3>
              <p className="font-sans text-xs text-[#888] leading-relaxed mb-5">
                We identify, approach, and present pre-vetted candidates for senior and specialist positions across the luxury industry. No direct contact between parties until both sides are ready. Full discretion on every assignment.
              </p>
              <Link href="/services/recruitment" className="font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#e4b042] transition-colors">
                Discuss a confidential search →
              </Link>
            </div>
            <div className="border border-[#333] p-6 md:p-8">
              <div className="jl-overline text-[#888] mb-3">Private Travel Advisory</div>
              <h3 className="jl-serif text-xl font-light text-white mb-3">Bespoke travel for luxury executives</h3>
              <p className="font-sans text-xs text-[#888] leading-relaxed mb-5">
                Hotels, private jets, villa stays, and curated itineraries — designed by a luxury travel advisor with two decades in the industry. Not a booking engine. A private advisory service.
              </p>
              <Link href="/services/travel" className="font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#e4b042] transition-colors">
                Request a private itinerary →
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
