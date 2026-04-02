import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About JOBLUX | Twenty Years in Luxury',
  description:
    'JOBLUX is a luxury talent intelligence platform co-founded by Mohammed Alex Mazour and Alex Mason. Two decades of executive search and technology for the luxury industry.',
  alternates: { canonical: 'https://www.joblux.com/about' },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white">

      {/* ── Hero ── */}
      <section className="max-w-[880px] mx-auto px-7 pt-24 pb-16">
        <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] mb-4">
          About JOBLUX
        </p>
        <h1 className="text-4xl font-normal leading-tight mb-6 text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Twenty years in luxury.<br className="hidden md:block" /> One platform.
        </h1>
        <p className="text-[15px] leading-relaxed text-white/70 border-l-2 border-[#a58e28] pl-6 max-w-2xl">
          JOBLUX was co-founded by Mohammed Alex Mazour and Alex Mason | a manager-to-executive level search consultant and a web specialist
          who have spent two decades building dedicated tools and services for the
          luxury industry.
        </p>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-[880px] mx-auto px-7">
        <div className="border-t border-white/[0.06]" />
      </div>

      {/* ── Timeline ── */}
      <section className="max-w-[880px] mx-auto px-7 py-16">
        <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] mb-4">
          Our story
        </p>
        <h2 className="text-3xl font-normal mb-10 text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          From a Paris store floor to a global platform
        </h2>

        <div className="relative pl-12">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-[#a58e28]/25" />

          {/* 2006 */}
          <div className="relative mb-11">
            <div className="absolute -left-10 top-1 w-[9px] h-[9px] rounded-full bg-[#a58e28]" />
            <p className="text-[11px] tracking-[0.15em] text-[#a58e28] font-medium mb-1.5">
              2006
            </p>
            <p className="text-lg font-normal mb-2 text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Two worlds meet in London
            </p>
            <p className="text-sm leading-relaxed text-white/70 max-w-2xl">
              After a career in Parisian luxury retail, Mohammed Alex Mazour moves
              to London as a luxury retail recruitment consultant. He meets Alex Mason, a
              London-based developer with a sharp eye for building platforms.
              Together they see what the industry is missing: a recruitment service
              built exclusively for luxury.
            </p>
          </div>

          {/* 2012 */}
          <div className="relative mb-11">
            <div className="absolute -left-10 top-1 w-[9px] h-[9px] rounded-full bg-[#a58e28]" />
            <p className="text-[11px] tracking-[0.15em] text-[#a58e28] font-medium mb-1.5">
              2012
            </p>
            <p className="text-lg font-normal mb-2 text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              The first platform
            </p>
            <p className="text-sm leading-relaxed text-white/70 max-w-2xl">
              joblux.com launches as the first niche job board dedicated exclusively
              to luxury brands. Mohammed brings the industry expertise and client
              relationships. Alex builds the technology. Present in the UK, France,
              and the United States from day one.
            </p>
          </div>

          {/* 2018 */}
          <div className="relative mb-11">
            <div className="absolute -left-10 top-1 w-[9px] h-[9px] rounded-full bg-[#a58e28]" />
            <p className="text-[11px] tracking-[0.15em] text-[#a58e28] font-medium mb-1.5">
              2018
            </p>
            <p className="text-lg font-normal mb-2 text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Going global
            </p>
            <p className="text-sm leading-relaxed text-white/70 max-w-2xl">
              The job board evolves into a multilingual professional network for the
              luxury industry | profiles, connections, and industry discussions
              across fashion, hospitality, watches, beauty, and beyond.
            </p>
          </div>

          {/* 2019 */}
          <div className="relative mb-11">
            <div className="absolute -left-10 top-1 w-[9px] h-[9px] rounded-full bg-[#a58e28]" />
            <p className="text-[11px] tracking-[0.15em] text-[#a58e28] font-medium mb-1.5">
              2019
            </p>
            <p className="text-lg font-normal mb-2 text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Quality over volume
            </p>
            <p className="text-sm leading-relaxed text-white/70 max-w-2xl">
              JOBLUX opens an office in New York and narrows its recruiting services
              to management-level and executive positions only. No more volume
              hiring. Discretion, depth, and long-term fit become the only currency.
            </p>
          </div>

          {/* 2026 */}
          <div className="relative">
            <div className="absolute -left-10 top-1 w-[9px] h-[9px] rounded-full bg-white border-2 border-[#a58e28]" />
            <p className="text-[11px] tracking-[0.15em] text-[#a58e28] font-medium mb-1.5">
              2026
            </p>
            <p className="text-lg font-normal mb-2 text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Intelligence, not noise
            </p>
            <p className="text-sm leading-relaxed text-white/70 max-w-2xl">
              JOBLUX relaunches as a luxury talent intelligence platform. No social
              feed, no ads, no data reselling. A confidential space where
              professionals access brand intelligence on 500+ maisons, keep their
              details fully private, and connect with opportunities entirely on
              their own terms.
            </p>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-[880px] mx-auto px-7">
        <div className="border-t border-white/[0.06]" />
      </div>

      {/* ── What JOBLUX is today ── */}
      <section className="max-w-[880px] mx-auto px-7 py-16">
        <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] mb-4">
          What JOBLUX is today
        </p>
        <h2 className="text-3xl font-normal mb-5 text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Luxury talent intelligence
        </h2>
        <p className="text-sm leading-relaxed text-white/70 max-w-2xl mb-8">
          A career intelligence platform for the luxury industry | delivering brand
          intelligence, salary data, daily market signals, and confidential
          executive search to professionals worldwide.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl">
          {[
            { name: 'WikiLux', desc: '500+ luxury brands decoded' },
            { name: 'Signals', desc: 'Daily industry intelligence' },
            { name: 'Careers', desc: 'Confidential executive search' },
            { name: 'Profilux', desc: 'Profile builder for luxury' },
            { name: 'Escape', desc: 'Curated travel magazine' },
            { name: 'The Brief', desc: '250K+ biweekly briefing' },
          ].map((item) => (
            <div
              key={item.name}
              className="border border-white/[0.08] rounded-lg p-4"
            >
              <p className="text-[13px] font-medium text-white mb-1">
                {item.name}
              </p>
              <p className="text-xs text-white/60 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-[880px] mx-auto px-7">
        <div className="border-t border-white/[0.06]" />
      </div>

      {/* ── How we work ── */}
      <section className="max-w-[880px] mx-auto px-7 py-16">
        <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] mb-4">
          How we work
        </p>
        <h2 className="text-3xl font-normal mb-5 text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          No ads. No noise. No compromise.
        </h2>
        <p className="text-sm leading-relaxed text-white/70 max-w-2xl mb-7">
          JOBLUX is an independent, privately held business. The intelligence
          platform generates trust and inbound demand. That trust supports our core
          service: confidential executive search for luxury maisons | manager to
          C-suite, worldwide.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          {[
            {
              title: 'No data reselling',
              desc: 'Your information is never sold or shared with third parties.',
            },
            {
              title: 'No unwanted messaging',
              desc: 'No one can contact you unless you allow it. Full control.',
            },
            {
              title: 'No ads or sponsored content',
              desc: 'Intelligence only. Never advertising.',
            },
            {
              title: 'Your details stay private',
              desc: 'Your profile, your data, your terms.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border border-white/[0.08] rounded-lg px-5 py-4 flex items-start gap-3"
            >
              <span className="text-[#a58e28] text-base leading-none flex-shrink-0 mt-0.5">
                &#10005;
              </span>
              <div>
                <p className="text-[13px] font-medium text-white mb-0.5">
                  {item.title}
                </p>
                <p className="text-xs text-white/60 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-[880px] mx-auto px-7">
        <div className="border-t border-white/[0.06]" />
      </div>

      {/* ── Quote ── */}
      <section className="max-w-[880px] mx-auto px-7 pt-14 pb-16">
        <p className="text-xl italic text-[#a58e28] max-w-md leading-relaxed" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          &ldquo;Depth before scale. Intelligence before noise.&rdquo;
        </p>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-[880px] mx-auto px-7 pb-20">
        <div className="border border-white/[0.08] rounded-xl p-10 bg-white/[0.02] text-center">
          <h2 className="text-2xl font-normal mb-3 text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Connect with JOBLUX
          </h2>
          <p className="text-sm text-white/70 mb-7 max-w-sm mx-auto">
            Whether you&apos;re a luxury professional or an employer, the next step
            starts here.
          </p>
          <Link
            href="/connect"
            className="inline-block border border-[#a58e28]/50 text-[#a58e28] text-sm tracking-wide px-7 py-3 rounded hover:bg-[#a58e28]/10 transition-colors"
          >
            Request access
          </Link>
        </div>
      </section>

    </main>
  )
}
