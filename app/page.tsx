import Link from 'next/link'
import { Ticker } from '@/components/home/Ticker'
import { FeaturedContent } from '@/components/home/FeaturedContent'
import { SalarySnapshot } from '@/components/home/SalarySnapshot'
import { LatestJobs } from '@/components/home/LatestJobs'
import { WikiLuxPreview } from '@/components/home/WikiLuxPreview'
import { TheBriefSignup } from '@/components/home/TheBriefSignup'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JOBLUX — Luxury Talents Society',
  description: 'The private intelligence platform for luxury industry professionals. Executive search, salary intelligence, WikiLux brand encyclopedia and industry insights.',
}

export default function HomePage() {
  return (
    <div>

      {/* ── Hero ── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 sm:pb-14 text-center border-b-2 border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">

          <p className="text-[11px] tracking-[0.16em] uppercase text-[#a58e28] font-medium mb-5">
            Luxury Talents Society
          </p>

          <h1 className="font-playfair font-normal text-[#1a1a1a] mb-6">
            The intelligence platform<br className="hidden sm:block" />
            for luxury professionals.
          </h1>

          <p className="text-[#888] text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10">
            WikiLux. Bloglux. Salary intelligence. Executive search.
            Free against contribution — no ads, no noise.
          </p>

          <div className="flex flex-col xs:flex-row gap-3 justify-center items-stretch xs:items-center">
            <Link
              href="/join"
              className="px-8 py-3 bg-[#1a1a1a] text-[#a58e28] text-sm font-medium
                         hover:bg-[#111111] active:scale-[0.98] transition-all duration-200
                         text-center whitespace-nowrap"
            >
              Request Access
            </Link>
            <Link
              href="/wikilux"
              className="px-8 py-3 border border-[#1a1a1a] text-[#1a1a1a] text-sm font-medium
                         hover:bg-[#1a1a1a] hover:text-[#a58e28] active:scale-[0.98]
                         transition-all duration-200 text-center whitespace-nowrap"
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

      {/* PRE-FOOTER CTA */}
      <div className="border-t border-[#e8e2d8] mt-8">
        <div className="jl-container py-6 text-center">
          <p className="font-sans text-xs text-[#888] tracking-wide">
            JOBLUX &mdash; The private intelligence platform for luxury professionals.
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
