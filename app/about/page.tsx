import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About JOBLUX — Built by an Insider, for Insiders',
  description:
    'JOBLUX is a confidential careers intelligence gateway for the luxury industry, founded by executive search consultant Mohammed M\'zaour.',
  alternates: { canonical: 'https://www.joblux.com/about' },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white">

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <p className="text-[11px] tracking-[0.14em] uppercase text-[#a58e28] mb-4 font-medium">
          About JOBLUX
        </p>
        <h1 className="font-playfair text-4xl md:text-5xl font-normal leading-tight mb-8">
          Built by an insider.<br className="hidden md:block" /> For insiders.
        </h1>
        <p className="text-lg leading-relaxed text-white/60 border-l-2 border-[#a58e28] pl-6 max-w-2xl">
          JOBLUX was founded by Mohammed M&apos;zaour — an executive search consultant
          and travel advisor who has spent two decades placing senior leaders across
          the luxury industry.
        </p>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-white/10" />
      </div>

      {/* ── What JOBLUX is ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-[11px] tracking-[0.14em] uppercase text-[#a58e28] mb-4 font-medium">
          What JOBLUX is
        </p>
        <h2 className="font-playfair text-3xl font-normal mb-6 leading-snug">
          A confidential careers intelligence gateway
        </h2>
        <p className="text-sm leading-relaxed text-white/55 max-w-2xl">
          A confidential careers intelligence gateway for the luxury industry.
          Not a job board. Not a social network. Not a membership platform.
          A selective, intelligence-led portal where the industry&apos;s knowledge
          is gathered through contribution and returned as insight.
        </p>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-white/10" />
      </div>

      {/* ── How it works ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-[11px] tracking-[0.14em] uppercase text-[#a58e28] mb-4 font-medium">
          How it works
        </p>
        <h2 className="font-playfair text-3xl font-normal mb-6 leading-snug">
          Free intelligence, powered by contribution
        </h2>
        <p className="text-sm leading-relaxed text-white/55 mb-10 max-w-2xl">
          Professionals access salary data, interview intelligence, and brand
          insights — for free. In return, they contribute what they know. A salary
          figure. An interview experience. A market signal. This builds the most
          authoritative body of luxury industry careers intelligence available
          anywhere.
        </p>

        {/* Highlighted box */}
        <div className="border border-[#a58e28]/40 bg-[#a58e28]/[0.06] rounded-xl p-6 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#a58e28]">
            <span>Contribution</span>
            <span className="text-[#a58e28]/50">&rarr;</span>
            <span>Intelligence</span>
            <span className="text-[#a58e28]/50">&rarr;</span>
            <span>Authority</span>
            <span className="text-[#a58e28]/50">&rarr;</span>
            <span>Trust</span>
            <span className="text-[#a58e28]/50">&rarr;</span>
            <span>Private Services</span>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-white/10" />
      </div>

      {/* ── The business behind the intelligence ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-[11px] tracking-[0.14em] uppercase text-[#a58e28] mb-4 font-medium">
          The business behind the intelligence
        </p>
        <h2 className="font-playfair text-3xl font-normal mb-6 leading-snug">
          Intelligence is the front door
        </h2>
        <p className="text-sm leading-relaxed text-white/55 mb-5 max-w-2xl">
          JOBLUX is a private business, not a nonprofit. The intelligence gateway
          generates trust and inbound demand. That trust converts into two services:
          confidential executive search for luxury maisons, and bespoke travel
          advisory for luxury executives.
        </p>
        <p className="text-sm leading-relaxed text-white/55 mb-10 max-w-2xl">
          No ads. No membership fees. No job posting charges. The intelligence is
          the front door. The private services are the business.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
          <div className="border border-white/10 border-t-[#a58e28] border-t-2 rounded-xl p-6 bg-white/[0.02]">
            <p className="text-sm font-medium text-white mb-2">Executive search</p>
            <p className="text-sm leading-relaxed text-white/50">
              Confidential recruitment for luxury maisons — manager to C-suite, worldwide.
            </p>
          </div>
          <div className="border border-white/10 border-t-[#a58e28] border-t-2 rounded-xl p-6 bg-white/[0.02]">
            <p className="text-sm font-medium text-white mb-2">Travel advisory</p>
            <p className="text-sm leading-relaxed text-white/50">
              Bespoke itineraries for luxury industry professionals and executives.
            </p>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-white/10" />
      </div>

      {/* ── The founder ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-[11px] tracking-[0.14em] uppercase text-[#a58e28] mb-4 font-medium">
          The founder
        </p>
        <div className="flex items-start gap-6">
          <div className="w-12 h-12 rounded-full bg-[#a58e28]/20 border border-[#a58e28]/40 flex items-center justify-center text-[#a58e28] text-sm font-medium shrink-0">
            MM
          </div>
          <div>
            <h2 className="font-playfair text-3xl font-normal mb-2 leading-snug">
              Mohammed M&apos;zaour
            </h2>
            <p className="text-xs text-[#a58e28] tracking-wide mb-5">
              Founder &middot; Executive Search &middot; Travel Advisory
            </p>
            <p className="text-sm leading-relaxed text-white/55 max-w-2xl">
              Mohammed M&apos;zaour has worked as a confidential recruitment partner for
              luxury maisons across Europe and the Middle East since 2006. He is also an
              affiliated travel designer, arranging bespoke itineraries for luxury industry
              professionals. JOBLUX is the natural convergence of these two practices —
              intelligence, recruitment, and travel under one discreet roof.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA block ── */}
      <section className="max-w-4xl mx-auto px-6 pb-28">
        <div className="border border-white/10 rounded-xl p-8 bg-white/[0.02] text-center">
          <h2 className="font-playfair text-2xl font-normal mb-3">
            Ready to step inside?
          </h2>
          <p className="text-sm text-white/50 mb-8 max-w-md mx-auto">
            Whether you&apos;re seeking confidential career intelligence or exploring
            private services, the next step begins here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/join"
              className="inline-block border border-[#a58e28] text-[#a58e28] text-sm tracking-wide px-6 py-3 rounded hover:bg-[#a58e28]/10 transition-colors"
            >
              Request confidential access
            </Link>
            <Link
              href="/services"
              className="inline-block border border-white/20 text-white/60 text-sm tracking-wide px-6 py-3 rounded hover:bg-white/5 transition-colors"
            >
              Discuss private services
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
