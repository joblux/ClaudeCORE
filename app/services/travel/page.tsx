import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Private Travel Advisory for Luxury Executives | JOBLUX',
  description:
    'A private travel advisory service for luxury industry executives. Hotels, villas, private jets, and curated experiences.',
  alternates: { canonical: 'https://www.joblux.com/services/travel' },
  openGraph: {
    title: 'Private Travel Advisory | JOBLUX',
    description:
      'A private travel advisory service for luxury industry executives.',
    images: [
      {
        url: '/api/og?title=Travel+Advisory&subtitle=Private+%26+Bespoke&type=page',
        width: 1200,
        height: 630,
        alt: 'Private Travel Advisory | JOBLUX',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Private Travel Advisory | JOBLUX',
    description:
      'A private travel advisory service for luxury industry executives.',
    images: ['/api/og?title=Travel+Advisory&subtitle=Private+%26+Bespoke&type=page'],
  },
}

export default function TravelPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="bg-[#1a1a1a] py-20 lg:py-28">
        <div className="jl-container">
          <div className="max-w-3xl">
            <div className="jl-overline-gold mb-4">Private Travel Advisory</div>
            <h1 className="jl-serif text-3xl md:text-5xl font-light text-white mb-6 leading-tight">
              Bespoke travel for luxury executives
            </h1>
            <p className="font-sans text-sm text-white/50 max-w-xl leading-relaxed">
              A private travel advisory service — not a booking engine. Designed by a luxury
              travel advisor with two decades in the industry.
            </p>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="bg-[#f5f4f0]">
        <div className="jl-container py-14 lg:py-20">
          <div className="max-w-3xl">

            {/* ── What we arrange ── */}
            <div className="jl-section-label"><span>What We Arrange</span></div>

            <div className="space-y-4 mb-12">
              {[
                {
                  title: 'Hotels & resorts',
                  desc: 'Access to preferred rates, complimentary upgrades, resort credits, and VIP amenities at the world\'s finest hotels — from palace properties in Paris to private island resorts in the Indian Ocean.',
                },
                {
                  title: 'Private villas',
                  desc: 'Handpicked villa rentals across the Mediterranean, Caribbean, Southeast Asia, and beyond. Fully staffed, privately vetted, with concierge-level service arrangements.',
                },
                {
                  title: 'Private aviation',
                  desc: 'Jet charters, helicopter transfers, and seamless multi-leg travel planning. Coordinated with ground logistics for a completely frictionless journey.',
                },
                {
                  title: 'Curated experiences',
                  desc: 'Private museum viewings, vineyard tours with winemakers, backstage access to fashion weeks, Michelin-starred dining reservations, and cultural itineraries designed around your interests.',
                },
                {
                  title: 'Complex itineraries',
                  desc: 'Multi-destination journeys across time zones, combining business travel with personal escapes. Every detail managed — transfers, timing, contingencies, preferences.',
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

            {/* ── Why through JOBLUX ── */}
            <div className="jl-section-label"><span>Why Through JOBLUX</span></div>

            <div className="jl-card mb-12">
              <p className="font-sans text-sm text-[#888] leading-relaxed mb-5">
                JOBLUX is affiliated with <span className="text-[#1a1a1a] font-medium">Fora Travel</span> —
                one of the leading luxury travel advisory networks. This affiliation gives our
                members access to exclusive benefits that are not available through direct
                booking or online travel agencies.
              </p>

              <div className="space-y-3 mb-5">
                {[
                  'Preferred rates and complimentary upgrades at 3,000+ luxury properties',
                  'Resort credits, spa credits, and VIP welcome amenities',
                  'Early access to new property openings and seasonal offers',
                  'A dedicated travel advisor — not an algorithm, not a chatbot',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2 font-sans text-sm text-[#888]">
                    <span className="text-[#a58e28] mt-0.5 text-xs flex-shrink-0">&bull;</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <p className="font-sans text-sm text-[#888] leading-relaxed">
                This is not a comparison site or a booking platform. It is a real person
                building a real itinerary, with genuine industry access and relationships
                that translate into a measurably better travel experience.
              </p>
            </div>

            {/* ── CTA ── */}
            <div className="p-6 bg-[#222222] text-center">
              <div className="jl-overline-gold mb-2">Plan Your Next Journey</div>
              <p className="font-sans text-sm text-[#888] mb-4">
                Tell us where you want to go. We will handle everything else.
              </p>
              <Link href="/contact" className="jl-btn jl-btn-gold">
                Request a private itinerary &rarr;
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
