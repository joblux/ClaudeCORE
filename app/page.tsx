import Link from 'next/link'
import { Ticker } from '@/components/home/Ticker'
import { FeaturedArticle, ArticleList, InterviewIntelligence } from '@/components/home/FeaturedContent'
import { SalarySnapshot } from '@/components/home/SalarySnapshot'
import { LatestJobs } from '@/components/home/LatestJobs'
import { WikiLuxPreview } from '@/components/home/WikiLuxPreview'
import { TheBriefSignup } from '@/components/home/TheBriefSignup'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JOBLUX — Luxury, decoded.',
  description: 'JOBLUX brings together luxury intelligence, salary insight, interviews, recruitment, and travel for the global luxury world. Free to access, with deeper value shaped by contribution.',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'JOBLUX',
  alternateName: 'Luxury Industry Careers Intelligence',
  url: 'https://www.joblux.com',
  logo: 'https://www.joblux.com/favicon.svg',
  description: 'JOBLUX brings together luxury intelligence, salary insight, interviews, recruitment, and travel for the global luxury world.',
  foundingDate: '2006',
  founder: { '@type': 'Person', name: "Mohammed M'zaour" },
  address: { '@type': 'PostalAddress', addressLocality: 'Paris', addressCountry: 'FR' },
  sameAs: [],
}

export default function HomePage() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      {/* ── S1: HERO ── */}
      <div className="bg-[#1a1a1a] py-6 md:py-10">
        <div className="jl-container text-center">
          <div className="jl-overline-gold mb-3 tracking-[0.2em]">Luxury, decoded.</div>
          <h1 className="jl-serif text-3xl md:text-5xl font-light text-white mb-4 leading-tight max-w-3xl mx-auto">
            Luxury Talent Intelligence, Powered by Contribution.
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-2xl mx-auto leading-relaxed">
            Salary intelligence, interview insight, brand knowledge, recruitment, and travel for the global luxury world.
          </p>
        </div>
      </div>

      {/* ── S2: TICKER ── */}
      <Ticker />

      {/* ── S3: FEATURED ARTICLE + SALARY SNAPSHOT (side by side) ── */}
      <div className="bg-[#f5f4f0] py-5 lg:py-6">
        <div className="jl-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <FeaturedArticle />
            <div className="bg-white border border-[#e8e2d8] p-5">
              <SalarySnapshot />
            </div>
          </div>
        </div>
      </div>

      {/* ── S4: ARTICLE LIST + SEARCH ASSIGNMENTS (side by side) ── */}
      <div className="bg-white py-4 lg:py-5 border-t border-[#e8e2d8]">
        <div className="jl-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <ArticleList />
            <LatestJobs />
          </div>
        </div>
      </div>

      {/* ── S5: BRAND INTELLIGENCE (compact pills) ── */}
      <div className="bg-[#f5f4f0] py-3 lg:py-4 border-t border-[#e8e2d8]">
        <div className="jl-container">
          <WikiLuxPreview />
        </div>
      </div>

      {/* ── S6: THE BRIEF + CONTRIBUTE (dark band) ── */}
      <div className="bg-[#222]">
        <div className="jl-container py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div><TheBriefSignup /></div>
            <div className="flex flex-col justify-center">
              <div className="jl-overline-gold mb-1">Contribute</div>
              <p className="font-sans text-xs text-[#888] leading-relaxed mb-3">
                Share salary data, interviews, market signals.
              </p>
              <div>
                <Link href="/contribute" className="inline-block border border-[#555] text-[#888] text-[0.65rem] font-semibold tracking-[0.1em] uppercase px-4 py-2 hover:border-[#a58e28] hover:text-[#a58e28] transition-colors">
                  Contribute an insight
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── S7: PRIVATE SERVICES ── */}
      <div className="bg-[#1a1a1a] py-4">
        <div className="jl-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-[#333] p-5">
              <div className="jl-overline text-[#888] mb-2">Recruitment</div>
              <h3 className="jl-serif text-lg font-light text-white mb-2">Private executive search</h3>
              <p className="font-sans text-xs text-[#888] leading-relaxed mb-3">
                Manager-and-up. Full discretion.
              </p>
              <Link href="/services/recruitment" className="font-sans text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#e4b042] transition-colors">
                Discuss a search →
              </Link>
            </div>
            <div className="border border-[#333] p-5">
              <div className="jl-overline text-[#888] mb-2">Escape</div>
              <h3 className="jl-serif text-lg font-light text-white mb-2">Bespoke travel for executives</h3>
              <p className="font-sans text-xs text-[#888] leading-relaxed mb-3">
                Hotels, villas, private experiences.
              </p>
              <Link href="/services/travel" className="font-sans text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#e4b042] transition-colors">
                Arrange travel →
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
