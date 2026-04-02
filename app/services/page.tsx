import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Private Services | Confidential Recruitment & Travel Advisory | JOBLUX',
  description:
    'JOBLUX operates as a confidential search consultancy and private travel advisory for the luxury industry.',
  alternates: { canonical: 'https://www.joblux.com/services' },
  openGraph: {
    title: 'Private Services | JOBLUX',
    description:
      'JOBLUX operates as a confidential search consultancy and private travel advisory for the luxury industry.',
    images: [
      {
        url: '/api/og?title=Private+Services&subtitle=Recruitment+%26+Travel&type=page',
        width: 1200,
        height: 630,
        alt: 'Private Services | JOBLUX',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Private Services | JOBLUX',
    description:
      'JOBLUX operates as a confidential search consultancy and private travel advisory for the luxury industry.',
    images: ['/api/og?title=Private+Services&subtitle=Recruitment+%26+Travel&type=page'],
  },
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* ── Hero ── */}
      <section className="py-20 lg:py-28">
        <div className="jl-container">
          <div className="max-w-3xl">
            <div className="jl-overline-gold mb-4">Private Services</div>
            <h1 className="jl-serif text-3xl md:text-5xl font-light text-white mb-6 leading-tight">
              The business behind the intelligence
            </h1>
            <p className="font-sans text-sm text-[#999] max-w-xl leading-relaxed">
              JOBLUX is a confidential careers intelligence gateway. The intelligence is
              free. The private services are the business.
            </p>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="jl-container pb-14 lg:pb-20">
        <div className="max-w-3xl">

          {/* ── Section 1: Confidential Recruitment ── */}
          <div className="flex items-center gap-4 mb-5">
            <span className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a58e28]">Confidential Recruitment</span>
            <div className="flex-1 h-px bg-[#333]" />
          </div>

          <div className="bg-[#222] border border-[#333] p-6 md:p-8 mb-10 rounded">
            <h2 className="jl-serif text-xl font-light text-white mb-4">
              Private executive search for luxury
            </h2>
            <p className="font-sans text-sm text-[#999] leading-relaxed mb-6">
              JOBLUX operates as a confidential search consultancy for the luxury industry.
              We find, approach, and present the right candidates for your organization —
              with full discretion at every stage. From manager-level to C-suite, across
              fashion, jewellery, watches, beauty, hospitality, and design. Every search is
              conducted by people who have spent careers inside the industry.
            </p>

            <h3 className="font-sans text-sm font-semibold text-white mb-2">What we cover</h3>
            <ul className="font-sans text-sm text-[#999] leading-relaxed space-y-1.5 mb-6 list-none">
              {[
                'Fashion & leather goods | creative, retail, buying, merchandising',
                'Jewellery & watches | retail, wholesale, trade marketing',
                'Beauty & fragrance | brand management, retail, training',
                'Hospitality & travel | hotel operations, F&B, guest relations',
                'Design & interiors | project management, studio, client advisory',
                'Corporate & group | HR, finance, legal, communications, digital',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#a58e28] mt-0.5 text-xs">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="font-sans text-sm font-semibold text-white mb-2">Why JOBLUX</h3>
            <p className="font-sans text-sm text-[#999] leading-relaxed mb-6">
              Most recruitment firms cover luxury as a side category. JOBLUX exists only in
              this space. Two decades of industry relationships, compensation intelligence,
              and cultural understanding give us access to candidates who do not appear on
              the open market | and a perspective that generalist firms cannot replicate.
            </p>

            <Link
              href="/services/recruitment"
              className="font-sans text-sm font-medium text-[#a58e28] hover:text-[#c4a830] transition-colors"
            >
              Discuss a confidential search &rarr;
            </Link>
          </div>

          {/* ── Section 2: Private Travel Advisory ── */}
          <div className="flex items-center gap-4 mb-5">
            <span className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-[#a58e28]">Private Travel Advisory</span>
            <div className="flex-1 h-px bg-[#333]" />
          </div>

          <div className="bg-[#222] border border-[#333] p-6 md:p-8 mb-10 rounded">
            <h2 className="jl-serif text-xl font-light text-white mb-4">
              Bespoke travel for luxury executives
            </h2>
            <p className="font-sans text-sm text-[#999] leading-relaxed mb-6">
              A private travel advisory service | not a booking engine. Designed by a luxury
              travel advisor with two decades in the industry. Hotels, private villas,
              jet charters, curated experiences, and complex multi-destination itineraries
              arranged with the same discretion and attention to detail that defines
              everything JOBLUX does.
            </p>

            <h3 className="font-sans text-sm font-semibold text-white mb-2">Why through JOBLUX</h3>
            <p className="font-sans text-sm text-[#999] leading-relaxed mb-6">
              JOBLUX is affiliated with Fora Travel | giving our users access to
              preferred rates, room upgrades, resort credits, and VIP amenities at the
              world&apos;s finest hotels and resorts. This is not a comparison site or a
              booking platform. It is a real person building a real itinerary, with genuine
              industry access and relationships.
            </p>

            <Link
              href="/escape"
              className="font-sans text-sm font-medium text-[#a58e28] hover:text-[#c4a830] transition-colors"
            >
              Request a private itinerary &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
