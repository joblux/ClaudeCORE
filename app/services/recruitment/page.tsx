import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Confidential Executive Search for Luxury | JOBLUX',
  description:
    'JOBLUX operates as a confidential search consultancy for the luxury industry. Private executive search with full discretion.',
  alternates: { canonical: 'https://www.joblux.com/services/recruitment' },
  openGraph: {
    title: 'Confidential Executive Search | JOBLUX',
    description:
      'Private executive search for the luxury industry. Full discretion at every stage.',
    images: [
      {
        url: '/api/og?title=Confidential+Search&subtitle=Executive+Recruitment&type=page',
        width: 1200,
        height: 630,
        alt: 'Confidential Executive Search | JOBLUX',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Confidential Executive Search | JOBLUX',
    description:
      'Private executive search for the luxury industry. Full discretion at every stage.',
    images: ['/api/og?title=Confidential+Search&subtitle=Executive+Recruitment&type=page'],
  },
}

export default function RecruitmentPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="bg-[#1a1a1a] py-20 lg:py-28">
        <div className="jl-container">
          <div className="max-w-3xl">
            <div className="jl-overline-gold mb-4">Confidential Recruitment</div>
            <h1 className="jl-serif text-3xl md:text-5xl font-light text-white mb-6 leading-tight">
              Private executive search for luxury
            </h1>
            <p className="font-sans text-sm text-white/50 max-w-xl leading-relaxed">
              JOBLUX operates as a confidential search consultancy. We find, approach, and
              present the right candidates — with full discretion at every stage.
            </p>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="bg-[#f5f4f0]">
        <div className="jl-container py-14 lg:py-20">
          <div className="max-w-3xl">

            {/* ── How it works ── */}
            <div className="jl-section-label"><span>How It Works</span></div>

            <div className="space-y-4 mb-12">
              {[
                {
                  step: '01',
                  title: 'Brief',
                  desc: 'We begin with a confidential conversation to understand the role, the culture, the team dynamics, and the unspoken requirements that determine whether a placement succeeds. No templated intake forms — a genuine consultation.',
                },
                {
                  step: '02',
                  title: 'Identify',
                  desc: 'Using twenty years of luxury industry relationships and our proprietary intelligence, we identify and discreetly approach candidates who match the brief. Many of the strongest candidates are not actively looking — they are found, not applied.',
                },
                {
                  step: '03',
                  title: 'Present',
                  desc: 'A curated shortlist of qualified candidates, each personally assessed. We manage the entire process — interviews, feedback, negotiation, onboarding support — so the experience is seamless for both sides.',
                },
              ].map((item) => (
                <div key={item.step} className="jl-card group">
                  <div className="flex items-start gap-4">
                    <span className="font-sans text-xs font-semibold text-[#a58e28] mt-0.5 flex-shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] mb-1.5 group-hover:text-[#a58e28] transition-colors">
                        {item.title}
                      </h3>
                      <p className="font-sans text-sm text-[#888] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── What we cover ── */}
            <div className="jl-section-label"><span>What We Cover</span></div>

            <div className="jl-card mb-12">
              <p className="font-sans text-sm text-[#888] leading-relaxed mb-5">
                Manager to C-suite positions across the full spectrum of luxury. Every search
                is handled by consultants with genuine industry knowledge — not generalist
                recruiters with a luxury desk.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {[
                  'Fashion & leather goods',
                  'Jewellery & watches',
                  'Beauty & fragrance',
                  'Hospitality & travel',
                  'Design & interiors',
                  'Wine & spirits',
                  'Corporate & group functions',
                  'Digital & e-commerce',
                ].map((sector) => (
                  <div key={sector} className="flex items-center gap-2 font-sans text-sm text-[#1a1a1a]">
                    <span className="text-[#a58e28] text-xs">&bull;</span>
                    {sector}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Why JOBLUX ── */}
            <div className="jl-section-label"><span>Why JOBLUX</span></div>

            <div className="space-y-4 mb-12">
              {[
                {
                  title: 'Intelligence-informed recruitment',
                  desc: 'Every search is powered by two decades of salary data, market intelligence, and cultural insight. We know what the best candidates earn, where they are, and what it takes to move them.',
                },
                {
                  title: 'Industry-only focus',
                  desc: 'JOBLUX does not recruit outside luxury. This singular focus means deeper relationships, better candidate access, and an understanding of maison culture that generalist firms cannot match.',
                },
                {
                  title: 'Full discretion',
                  desc: 'Many of the positions we fill are never publicly posted. We operate with the same confidentiality expected inside the maisons themselves — protecting both employer and candidate at every stage.',
                },
              ].map((item) => (
                <div key={item.title} className="jl-card group">
                  <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] mb-1.5 group-hover:text-[#a58e28] transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-sans text-sm text-[#888] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* ── CTA ── */}
            <div className="p-6 bg-[#222222] text-center">
              <div className="jl-overline-gold mb-2">Start a Confidential Search</div>
              <p className="font-sans text-sm text-[#888] mb-4">
                Tell us about the role. Every conversation is fully confidential.
              </p>
              <Link href="/contact" className="jl-btn jl-btn-gold">
                Submit a confidential brief &rarr;
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
