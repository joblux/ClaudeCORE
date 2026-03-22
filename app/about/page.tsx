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

      {/* ── The story behind the relaunch ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-[11px] tracking-[0.14em] uppercase text-[#a58e28] mb-4 font-medium">
          The story behind the relaunch
        </p>
        <h2 className="font-playfair text-3xl font-normal mb-6 leading-snug">
          Twenty years in the making
        </h2>
        <div className="space-y-5 text-sm leading-relaxed text-white/55 max-w-2xl">
          <p>
            Luxury Recruiter began more than twenty years ago when a luxury retail professional
            in Paris met a web developer in London and together created one of the first specialist
            recruitment consultancies dedicated to the luxury sector. Over time, that consultancy
            evolved into a global luxury job board, then into a niche professional platform. Each
            phase answered the market at a particular moment.
          </p>
          <p>
            This relaunch is a further evolution — and a clarification. Today, the need is no longer
            for more noise, more generic listings, or another social platform. The need is for better
            intelligence, greater discretion, and a more trusted ecosystem around luxury careers,
            hiring, and professional life.
          </p>
          <p>
            Luxury Recruiter is now being shaped as a confidential, contribution-led platform where
            access is free for now and depth is earned through contribution. By gathering salary
            insight, interview intelligence, market perspective, and sector knowledge, the ecosystem
            becomes more valuable to professionals, brands, and decision-makers alike. That authority
            supports two private service businesses: manager-and-up recruitment mandates and
            high-touch travel advisory.
          </p>
          <p>
            If, in time, this evolves into something larger, it will not be by imitating LinkedIn or
            Indeed. It will be by building something quieter, smarter, and more valuable first.
          </p>
        </div>

        {/* Closing quote */}
        <p className="font-playfair text-xl italic text-[#a58e28] mt-10 max-w-xl">
          &ldquo;Depth before scale. Intelligence before noise.&rdquo;
        </p>
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
