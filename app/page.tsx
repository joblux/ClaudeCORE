import Link from 'next/link'
import { SearchHero } from '@/components/home/SearchHero'
import { Ticker } from '@/components/home/Ticker'
import { FeaturedContent } from '@/components/home/FeaturedContent'
import { SalarySnapshot } from '@/components/home/SalarySnapshot'
import { LatestJobs } from '@/components/home/LatestJobs'
import { WikiLuxPreview } from '@/components/home/WikiLuxPreview'
import { TheBriefSignup } from '@/components/home/TheBriefSignup'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JOBLUX — Luxury Talents Intelligence',
  description: 'The private intelligence platform for luxury industry professionals. Executive search, salary intelligence, WikiLux brand encyclopedia and industry insights. Est. Paris 2006.',
}

export default function HomePage() {
  return (
    <div>

      {/* SEARCH HERO */}
      <SearchHero />

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

      {/* MEMBERSHIP CTA */}
      <div className="bg-[#1a1a1a] py-12 mt-8">
        <div className="jl-container-sm text-center">
          <div className="jl-overline-gold mb-4">Members Only</div>
          <h2 className="jl-serif text-3xl font-light text-white mb-4">
            The Private Platform for Luxury's Senior Professionals
          </h2>
          <p className="font-sans text-sm text-[#888] mb-8 max-w-lg mx-auto leading-relaxed">
            Manager to Executive level · €100K+ · By invitation or application only.
            Join 100,000+ luxury professionals on the world's most exclusive recruitment intelligence platform.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/join" className="jl-btn jl-btn-gold">
              Request Access
            </Link>
            <Link href="/about" className="jl-btn jl-btn-ghost">
              Learn More
            </Link>
          </div>
          <p className="font-sans text-xs text-[#555] mt-6">
            Est. Paris 2006 · Paris · London · New York · Dubai · Singapore
          </p>
        </div>
      </div>

    </div>
  )
}
