import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import Link from 'next/link'
import EscapeShareBar from '@/components/escape/EscapeShareBar'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Mediterranean Cruise — Barcelona to Rome',
  description:
    '8-day Mediterranean cruise from Barcelona to Rome via Marseille, Genoa, and Portofino. Curated by your private travel advisor.',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function CruisePage() {
  const { data: cruise } = await supabase
    .from('escape_cruises')
    .select('*')
    .eq('published', true)
    .limit(1)
    .single()

  if (!cruise) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-3xl mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: '#2B4A3E' }}
          >
            Coming Soon
          </h1>
          <p className="text-[15px]" style={{ color: '#888' }}>
            Our Mediterranean cruise itinerary is being curated. Check back soon.
          </p>
          <Link
            href="/escape"
            className="inline-block mt-6 text-sm font-medium px-6 py-3 rounded"
            style={{ backgroundColor: '#2B4A3E', color: '#fff' }}
          >
            Back to Escape
          </Link>
        </div>
      </main>
    )
  }

  const { data: ports } = await supabase
    .from('escape_cruise_ports')
    .select('*')
    .eq('cruise_id', cruise.id)
    .order('sort_order', { ascending: true })

  const portList = ports ?? []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Trip',
    name: cruise.name,
    description: cruise.route_summary,
    itinerary: {
      '@type': 'ItemList',
      itemListElement: portList.map((port: any, i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Place',
          name: port.port_name,
        },
      })),
    },
  }

  return (
    <main>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section
        className="relative w-full h-[360px]"
        style={{
          backgroundImage: `url(${cruise.hero_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 absolute bottom-0 left-0 right-0 pb-8">
          <Link
            href="/escape"
            className="text-sm text-white/70 hover:text-white mb-3 inline-block transition-colors"
          >
            &larr; Escape
          </Link>
          <h1
            className="text-white mb-2"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '44px',
              lineHeight: 1.1,
            }}
          >
            {cruise.name}
          </h1>
          <p className="text-white/80 text-[16px]">{cruise.route_summary}</p>
        </div>
      </section>

      {/* Share Bar */}
      <div className="max-w-7xl mx-auto px-6">
        <EscapeShareBar title={cruise.name} />
      </div>

      {/* Trip Summary Bar */}
      <div className="border-y border-[#E0D9CA] py-4 my-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-center gap-10 flex-wrap">
          {[
            { label: 'Duration', value: cruise.duration },
            { label: 'Route', value: cruise.route_summary },
            { label: 'Style', value: cruise.style },
            { label: 'Ports', value: `${portList.length} ports` },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p
                className="uppercase tracking-wider mb-1"
                style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em' }}
              >
                {item.label}
              </p>
              <p className="font-semibold" style={{ fontSize: '15px', color: '#1A1A1A' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Route Visualization */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div
            className="absolute left-0 right-0 top-1/2 h-[2px]"
            style={{ backgroundColor: '#E0D9CA' }}
          />

          {portList.map((port: any) => {
            const isTerminal = port.is_embark || port.is_disembark
            return (
              <div key={port.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={`rounded-full border-2 ${
                    isTerminal ? 'w-3 h-3' : 'w-2.5 h-2.5'
                  }`}
                  style={{
                    borderColor: '#B8975C',
                    backgroundColor: isTerminal ? '#2B4A3E' : '#B8975C',
                  }}
                />
                <span
                  className="mt-2 whitespace-nowrap"
                  style={{ fontSize: '11px', color: '#555' }}
                >
                  {port.port_name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Port-by-Port Editorial */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {portList.map((port: any, index: number) => {
          const isOdd = index % 2 !== 0
          return (
            <div
              key={port.id}
              className={`grid grid-cols-1 md:grid-cols-2 gap-0 ${
                isOdd ? 'md:[direction:rtl]' : ''
              }`}
            >
              {/* Image Side */}
              <div
                className="relative min-h-[260px]"
                style={{
                  backgroundImage: `url(${port.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-white text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm bg-black/40">
                    {port.port_name}
                  </span>
                </div>
              </div>

              {/* Text Side */}
              <div
                className={`p-8 md:p-10 bg-white flex flex-col justify-center ${
                  isOdd ? 'md:[direction:ltr]' : ''
                }`}
              >
                <h3
                  className="mb-4"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '24px',
                    color: '#2B4A3E',
                  }}
                >
                  {port.port_name}
                </h3>
                <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#555' }}>
                  {port.body}
                </p>
                {port.is_embark && (
                  <span
                    className="inline-block mt-4 uppercase tracking-wider font-semibold"
                    style={{ fontSize: '10px', color: '#B8975C', letterSpacing: '0.1em' }}
                  >
                    Embarkation
                  </span>
                )}
                {port.is_disembark && (
                  <span
                    className="inline-block mt-4 uppercase tracking-wider font-semibold"
                    style={{ fontSize: '10px', color: '#B8975C', letterSpacing: '0.1em' }}
                  >
                    Disembarkation
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Signature + CTA */}
      <div
        className="rounded-lg p-12 mt-14 mx-auto max-w-[900px]"
        style={{ backgroundColor: '#FDF8EE' }}
      >
        <div className="flex justify-between items-center flex-wrap gap-6">
          {/* Left */}
          <div className="flex items-center gap-3">
            <div
              className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: '#B8975C' }}
            >
              MA
            </div>
            <div>
              <p className="font-semibold" style={{ fontSize: '13px', color: '#1A1A1A' }}>
                Travel designed by Mohammed Alex Mzaour
              </p>
              <p style={{ fontSize: '13px', color: '#888' }}>
                JOBLUX Private Travel Advisory
              </p>
            </div>
          </div>

          {/* Right */}
          <Link
            href="/escape/plan?source=Mediterranean+Cruise"
            className="px-6 py-3 rounded text-sm font-medium text-white"
            style={{ backgroundColor: '#2B4A3E' }}
          >
            Start planning
          </Link>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="mb-16" />
    </main>
  )
}
