import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Confidential Executive Search for Luxury | JOBLUX',
  description: 'An international boutique executive search firm. Twenty years. Forty markets. One industry. Private executive search with full discretion.',
  alternates: { canonical: 'https://www.joblux.com/services/recruitment' },
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Confidential Executive Search | JOBLUX',
    description: 'Private executive search for the luxury market. Full discretion at every stage.',
    images: [{ url: '/api/og?title=Confidential+Search&subtitle=Executive+Recruitment&type=page', width: 1200, height: 630, alt: 'Confidential Executive Search | JOBLUX' }],
  },
}

export default function RecruitmentPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">

      {/* HERO */}
      <section className="border-b border-[#1e1e1e] py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-7">
          <div className="max-w-[760px]">
            <p className="text-[0.6rem] tracking-[3px] uppercase text-[#a58e28] mb-5">Confidential Recruitment</p>
            <h1 className="text-4xl lg:text-5xl font-light text-white leading-tight mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Manager &amp; executives<br />search services
            </h1>
            <p className="text-sm text-[#999] leading-relaxed max-w-xl">
              We find, approach, and present the right candidates — with full discretion at every stage. No job boards. No noise. One placement at a time.
            </p>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-7">
          <div className="max-w-[760px]">

            {/* INTRO */}
            <div className="border-l-2 border-[#a58e28] pl-5 mb-12">
              <p className="text-[15px] text-[#ccc] leading-relaxed mb-4 italic">
                An international boutique executive search firm. Twenty years. Forty markets. One industry.
              </p>
              <p className="text-sm text-[#777] leading-relaxed mb-3">
                We start the same way every time — with a conversation. Not a form, not a brief template. A real conversation about the role, the team, the culture, and what it actually takes to succeed in that seat.
              </p>
              <p className="text-sm text-[#777] leading-relaxed mb-4">
                Twenty years of working exclusively inside the luxury market has taught us one thing: the best hire is rarely the one who applied. They are the one who wasn't looking — until we reached them. We have built the relationships and the intelligence to find that person, in any market, at any level from manager to Chief Executive.
              </p>
              <Link href="/about" className="text-sm text-[#888] underline underline-offset-4 decoration-[#444] hover:text-[#ccc] transition-colors">
                Read about us and our DNA →
              </Link>
            </div>

            {/* HOW IT WORKS */}
            <p className="text-[0.6rem] tracking-[3px] uppercase text-[#3a3a3a] border-t border-[#1e1e1e] pt-5 mb-6">How it works</p>
            <div className="space-y-3 mb-12">
              {[
                { step: '01', title: 'Brief', desc: 'A confidential conversation to understand the role, the culture, and the unspoken requirements that determine whether a placement succeeds. No templated intake forms — a genuine consultation.' },
                { step: '02', title: 'Identify', desc: 'Using deep luxury market relationships and our proprietary intelligence, we identify and discreetly approach candidates who match the brief. The strongest candidates are not actively looking — they are found, not applied.' },
                { step: '03', title: 'Present', desc: 'A curated shortlist of qualified candidates, each personally assessed. We manage the entire process — interviews, feedback, negotiation, onboarding support — seamlessly for both sides.' },
              ].map((item) => (
                <div key={item.step} className="border border-[#1e1e1e] rounded-lg p-6 bg-[#111]">
                  <p className="text-[10px] font-semibold tracking-widest text-[#a58e28] mb-2">{item.step}</p>
                  <h3 className="text-[15px] font-medium text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[#999] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* WHAT WE COVER */}
            <p className="text-[0.6rem] tracking-[3px] uppercase text-[#3a3a3a] border-t border-[#1e1e1e] pt-5 mb-6">What we cover</p>
            <div className="border border-[#1e1e1e] rounded-lg p-6 bg-[#111] mb-12">
              <p className="text-sm text-[#999] leading-relaxed mb-6">
                Manager to C-suite positions across the full spectrum of luxury. Every search handled by consultants with genuine industry knowledge — not generalist recruiters with a luxury desk.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
                {['Fashion & leather goods','Jewellery & watches','Beauty & fragrance','Hospitality & travel','Design & interiors','Wine & spirits','Corporate & group functions','Digital & e-commerce'].map((s) => (
                  <div key={s} className="flex items-center gap-3 text-sm text-[#aaa]">
                    <span className="text-[#2a2a2a]">—</span>{s}
                  </div>
                ))}
              </div>
            </div>

            {/* WHY JOBLUX */}
            <p className="text-[0.6rem] tracking-[3px] uppercase text-[#3a3a3a] border-t border-[#1e1e1e] pt-5 mb-6">Why JOBLUX</p>
            <div className="space-y-3">
              <div className="border border-[#1e1e1e] rounded-lg p-6 bg-[#111]">
                <h3 className="text-[14px] font-medium text-white mb-2">Intelligence-informed recruitment</h3>
                <p className="text-sm text-[#999] leading-relaxed">Every search is powered by proprietary salary data, market intelligence, and cultural insight. We know what the best candidates earn, where they are, and what it takes to move them.</p>
              </div>

              <div className="border border-[#1e1e1e] rounded-lg p-6 bg-[#111]">
                <h3 className="text-[14px] font-medium text-white mb-2">Luxury-only focus</h3>
                <p className="text-sm text-[#999] leading-relaxed mb-5">JOBLUX does not recruit outside the luxury market. This singular focus means deeper relationships, better candidate access, and an understanding of maison culture that generalist firms cannot match.</p>
                <p className="text-[10px] tracking-widest uppercase text-[#3a3a3a] mb-3 italic">A sample of what is currently active — most assignments are never advertised.</p>
                <div className="space-y-2">
                  {[
                    { level: 'Director', title: 'Director of Retail Operations, Europe', meta: 'Paris · Fashion & leather goods', salary: '€120K–150K' },
                    { level: 'VP', title: 'VP Merchandising, Watches & Jewelry', meta: 'New York · Watches & jewellery', salary: '$180K–220K' },
                    { level: 'C-Suite', title: 'Chief Merchandising Officer, Asia Pacific', meta: 'Hong Kong · Multi-brand retail', salary: 'Confidential' },
                  ].map((a) => (
                    <div key={a.title} className="flex items-start justify-between gap-4 border border-[#1a1a1a] rounded p-4 bg-[#0d0d0d]">
                      <div>
                        <p className="text-[9px] font-semibold tracking-[2px] uppercase text-[#a58e28] mb-1">{a.level}</p>
                        <p className="text-[13px] text-[#ccc] mb-1">{a.title}</p>
                        <p className="text-[11px] text-[#999]">{a.meta}</p>
                      </div>
                      <span className="text-[12px] text-[#999] whitespace-nowrap">{a.salary}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#777] italic mt-3">
                  Brand names disclosed after initial conversation.{' '}
                  <Link href="/careers" className="text-[#999] underline underline-offset-3 hover:text-[#888] transition-colors">See all active assignments →</Link>
                </p>
              </div>

              <div className="border border-[#1e1e1e] rounded-lg p-6 bg-[#111]">
                <h3 className="text-[14px] font-medium text-white mb-2">Full discretion, always</h3>
                <p className="text-sm text-[#999] leading-relaxed">Many positions we fill are never publicly posted. We operate with the same confidentiality expected inside the maisons themselves — protecting both employer and candidate at every stage.</p>
              </div>
            </div>

            {/* CTA */}
            <div className="border border-[#1e1e1e] rounded-lg p-10 text-center bg-[#111] mt-12">
              <p className="text-[0.6rem] tracking-[3px] uppercase text-[#a58e28] mb-3">Start a confidential search</p>
              <p className="text-sm text-[#999] mb-6">Tell us about the role. Every conversation is fully confidential.</p>
              <Link href="/connect" className="inline-block text-[0.75rem] font-medium tracking-wide text-[#a58e28] border border-[rgba(165,142,40,0.35)] rounded px-6 py-3 hover:bg-[rgba(165,142,40,0.06)] transition-colors">
                Get in touch →
              </Link>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
