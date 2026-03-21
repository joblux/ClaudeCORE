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
      {/* Mobile: centered text hero / Desktop: two-column editorial */}
      <section className="w-full border-b-2 border-[#1a1a1a]">
        {/* Mobile hero */}
        <div className="lg:hidden px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-[11px] tracking-[0.16em] uppercase text-[#a58e28] font-medium mb-5">
              Luxury Talents Society
            </p>
            <h1 className="font-playfair font-normal text-[#1a1a1a] mb-6">
              The society for<br className="hidden sm:block" />
              luxury professionals.
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
        </div>

        {/* Desktop hero — two-column editorial grid */}
        <div className="hidden lg:grid lg:grid-cols-[1.4fr_1fr] lg:min-h-[400px] max-w-[1400px] mx-auto lg:px-8 xl:px-16">
          {/* Left panel — dark featured content */}
          <div className="bg-[#1a1a1a] p-10 xl:p-14 flex flex-col justify-center lg:rounded-l-xl">
            <span className="inline-block text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#a58e28] border border-[#a58e28]/30 px-3 py-1 w-fit mb-6">
              Featured
            </span>
            <h2 className="font-serif text-[1.65rem] xl:text-[1.85rem] font-light text-white leading-snug mb-4">
              The Hybrid Luxury Executive: What Maisons Are Hiring in 2026
            </h2>
            <p className="font-sans text-sm text-[#888] leading-relaxed mb-6 max-w-lg">
              JOBLUX analysis of 400 senior placements reveals a new leadership profile — operational rigour paired with creative brand fluency.
            </p>
            <Link
              href="/bloglux/hybrid-luxury-executive-2026"
              className="font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#e4b042] transition-colors w-fit"
            >
              Read on BlogLux →
            </Link>
          </div>
          {/* Right panel — hero image placeholder */}
          <div className="bg-[#f0ece4] lg:rounded-r-xl flex items-center justify-center overflow-hidden relative">
            <div className="text-center">
              <div className="font-serif text-4xl xl:text-5xl font-light tracking-[0.15em] text-[#a58e28]/30 uppercase">
                JOBLUX
              </div>
              <p className="font-sans text-xs text-[#bbb] mt-2 tracking-wider uppercase">Luxury Talents Society</p>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRY TICKER */}
      <Ticker />

      {/* ── Desktop: Category filter bar ── */}
      <div className="hidden lg:block border-b border-[#e8e2d8] bg-white">
        <div className="max-w-[1400px] mx-auto px-8 xl:px-16">
          <div className="flex items-center gap-8 py-3">
            {['All', 'Careers', 'Salary Data', 'Interviews', 'WikiLux', 'BlogLux'].map((tab, i) => (
              <button
                key={tab}
                className={`text-xs tracking-[0.12em] uppercase font-medium pb-2 border-b-2 transition-colors ${
                  i === 0
                    ? 'border-[#a58e28] text-[#a58e28]'
                    : 'border-transparent text-gray-400 hover:text-[#a58e28]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="jl-container py-10 lg:py-16">

        {/* ── Latest from the Society (Desktop: asymmetric two-col) ── */}
        <div className="mb-12 lg:mb-16">
          <p className="text-xs tracking-[0.15em] text-gray-400 uppercase mb-6">Latest from the Society</p>
          <div className="lg:hidden">
            {/* Mobile: stacked layout — reuse existing */}
            <FeaturedContent />
          </div>
          <div className="hidden lg:grid lg:grid-cols-[1.2fr_1fr] gap-6">
            {/* LEFT: Large feature card */}
            <div className="bg-white border border-gray-200/60 rounded-xl overflow-hidden group">
              <div className="bg-[#f0ece4] h-56 flex items-center justify-center">
                <span className="font-serif text-3xl font-light tracking-[0.2em] text-[#a58e28]/40 uppercase">Intelligence</span>
              </div>
              <div className="p-6">
                <span className="text-[0.6rem] font-semibold tracking-[0.12em] uppercase text-[#a58e28] mb-2 block">Intelligence · Talent Moves</span>
                <h3 className="font-serif text-xl font-light text-[#1a1a1a] leading-snug mb-3 group-hover:text-[#a58e28] transition-colors">
                  <Link href="/bloglux/hybrid-luxury-executive-2026">
                    The Hybrid Luxury Executive: What Maisons Are Hiring in 2026
                  </Link>
                </h3>
                <p className="font-sans text-sm text-[#666] leading-relaxed mb-3">
                  JOBLUX analysis of 400 senior placements reveals a new leadership profile — operational rigour paired with creative brand fluency and digital acumen.
                </p>
                <span className="font-sans text-[0.65rem] text-[#aaa]">March 16, 2026 · 8 min read</span>
              </div>
            </div>
            {/* RIGHT: Three horizontal cards stacked */}
            <div className="space-y-4">
              {[
                {
                  category: 'Career · LVMH',
                  title: 'How to Build a Career Across the World\'s Largest Luxury Group',
                  href: '/bloglux/lvmh-career-guide',
                  date: 'March 14, 2026',
                  readTime: '7 min read',
                },
                {
                  category: 'Markets · Gulf',
                  title: 'Why Dubai Has Become the Most Competitive Luxury Talent Market',
                  href: '/bloglux/dubai-luxury-talent-market',
                  date: 'March 12, 2026',
                  readTime: '6 min read',
                },
                {
                  category: 'Interview · Hermès',
                  title: '"What we look for has not changed in twenty years" — HR Director, Hermès Paris',
                  href: '/interviews/marie-dupont-hermes',
                  date: 'March 10, 2026',
                  readTime: '5 min read',
                },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex gap-4 bg-white border border-gray-200/60 rounded-xl p-4 group hover:border-[#a58e28] transition-colors">
                  <div className="w-[120px] h-[90px] bg-[#f0ece4] rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="font-serif text-lg text-[#a58e28]/30">JL</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[0.6rem] font-semibold tracking-[0.12em] uppercase text-[#a58e28] block mb-1">{item.category}</span>
                    <h4 className="font-serif text-sm font-light text-[#1a1a1a] leading-snug group-hover:text-[#a58e28] transition-colors line-clamp-2 mb-2">
                      {item.title}
                    </h4>
                    <span className="font-sans text-[0.6rem] text-[#aaa]">{item.date} · {item.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Open Opportunities ── */}
        <div className="mb-12 lg:mb-16">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs tracking-[0.15em] text-gray-400 uppercase">Open Opportunities</p>
            <Link href="/opportunities" className="font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors">
              View all →
            </Link>
          </div>
          {/* Mobile: stacked / Desktop: 3-col grid */}
          <div className="lg:hidden">
            <LatestJobs />
          </div>
          <div className="hidden lg:grid lg:grid-cols-3 gap-4">
            {[
              { maison: 'French Leather Maison', title: 'Store Director', city: 'Paris · France', badge: 'Confidential' },
              { maison: 'Swiss Watch Group', title: 'Regional Director', city: 'Dubai · UAE', badge: 'Senior' },
              { maison: 'LVMH Group Brand', title: 'HR Director APAC', city: 'Singapore', badge: 'Executive' },
            ].map((job, i) => (
              <div key={i} className="bg-white border border-gray-200/60 rounded-xl p-5 hover:border-[#a58e28] transition-colors">
                <span className="text-[0.6rem] font-semibold tracking-[0.12em] uppercase text-[#a58e28] block mb-2">{job.city}</span>
                <h4 className="font-serif text-base font-light text-[#1a1a1a] mb-1">{job.title}</h4>
                <p className="font-sans text-xs text-[#888] mb-3">{job.maison}</p>
                <span className="jl-badge text-[0.55rem]">{job.badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Explore WikiLux brand strip ── */}
        <div className="mb-12 lg:mb-16">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs tracking-[0.15em] text-gray-400 uppercase">Explore WikiLux</p>
            <Link href="/wikilux" className="font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors">
              All 500+ brands →
            </Link>
          </div>
          {/* Mobile: existing sidebar component / Desktop: 5-col grid */}
          <div className="lg:hidden">
            <WikiLuxPreview />
          </div>
          <div className="hidden lg:grid lg:grid-cols-5 gap-3">
            {[
              { initial: 'C', name: 'Chanel', sector: 'Fashion', slug: 'chanel' },
              { initial: 'H', name: 'Hermès', sector: 'Leather Goods', slug: 'hermes' },
              { initial: 'R', name: 'Rolex', sector: 'Watches', slug: 'rolex' },
              { initial: 'F', name: 'Ferrari', sector: 'Automotive', slug: 'ferrari' },
              { initial: 'A', name: 'Aman Resorts', sector: 'Hospitality', slug: 'aman-resorts' },
            ].map((brand) => (
              <Link key={brand.slug} href={`/wikilux/${brand.slug}`} className="bg-white border border-gray-200/60 rounded-xl p-4 flex flex-col items-center text-center group hover:border-[#a58e28] transition-colors">
                <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#a58e28] transition-colors">
                  <span className="font-serif text-lg text-[#a58e28] group-hover:text-[#1a1a1a]">{brand.initial}</span>
                </div>
                <span className="font-sans text-xs font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">{brand.name}</span>
                <span className="font-sans text-[0.6rem] text-[#aaa] mt-0.5">{brand.sector}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Salary Snapshot (mobile only, desktop gets its own section) ── */}
        <div className="lg:hidden mb-12">
          <SalarySnapshot />
        </div>

        {/* ── Desktop: Salary Snapshot in card ── */}
        <div className="hidden lg:block mb-16">
          <div className="bg-white border border-gray-200/60 rounded-xl p-8">
            <SalarySnapshot />
          </div>
        </div>

        {/* ── The Brief + For Luxury Brands — side by side on desktop ── */}
        <div className="lg:hidden space-y-8 mb-12">
          <TheBriefSignup />
        </div>
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 mb-16">
          {/* LEFT: The Brief newsletter signup — dark panel */}
          <div className="bg-[#1a1a1a] rounded-xl p-8 xl:p-10 flex flex-col justify-center">
            <span className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#a58e28] mb-4 block">The Brief</span>
            <h3 className="font-serif text-xl font-light text-white mb-3">
              The Brief
            </h3>
            <p className="font-sans text-sm text-[#888] leading-relaxed mb-6">
              Luxury industry moves · Salary insights · New positions · WikiLux updates. Delivered biweekly.
            </p>
            <div className="flex border border-[#333] rounded-lg overflow-hidden">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-transparent px-4 py-3 font-sans text-sm text-white placeholder-[#555] outline-none"
                readOnly
              />
              <Link
                href="/the-brief"
                className="bg-[#a58e28] text-[#1a1a1a] px-6 font-sans text-[0.65rem] font-bold tracking-widest uppercase flex items-center hover:bg-[#e4b042] transition-colors"
              >
                Subscribe
              </Link>
            </div>
            <p className="font-sans text-[0.6rem] text-[#555] mt-3">
              Free · No spam · Unsubscribe anytime
            </p>
          </div>
          {/* RIGHT: B2B value prop card */}
          <div className="bg-white border border-gray-200/60 rounded-xl p-8 xl:p-10 flex flex-col justify-center">
            <span className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#a58e28] mb-4 block">For Luxury Brands</span>
            <h3 className="font-serif text-xl font-light text-[#1a1a1a] mb-3">
              Executive Search & Talent Solutions
            </h3>
            <p className="font-sans text-sm text-[#666] leading-relaxed mb-6">
              From manager to C-suite, worldwide. Discreet, precise, conducted by people who have spent careers inside the industry.
            </p>
            <Link
              href="/join?type=employer"
              className="font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors w-fit"
            >
              Discuss your search →
            </Link>
          </div>
        </div>

      </div>

      {/* PRE-FOOTER CTA */}
      <div className="border-t border-[#e8e2d8] mt-8 bg-white">
        <div className="jl-container py-6 text-center">
          <p className="font-sans text-xs text-[#888] tracking-wide">
            JOBLUX | The society for luxury professionals.
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
