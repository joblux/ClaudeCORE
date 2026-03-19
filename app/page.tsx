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

      {/* SUBTLE PRE-FOOTER CTA */}
      <div className="border-t border-[#a58e28] mt-8">
        <div className="jl-container py-6 text-center">
          <p className="font-sans text-xs text-[#888] tracking-wide">
            JOBLUX &mdash; The private intelligence platform for luxury professionals. Est. Paris 2006.
          </p>
          <div className="flex items-center justify-center gap-6 mt-3">
            <Link href="/join" className="font-sans text-[0.65rem] text-[#a58e28] tracking-wider uppercase hover:text-[#1a1a1a] transition-colors">Request Access</Link>
            <Link href="/about" className="font-sans text-[0.65rem] text-[#a58e28] tracking-wider uppercase hover:text-[#1a1a1a] transition-colors">Learn More</Link>
          </div>
        </div>
      </div>

    </div>
  )
}
