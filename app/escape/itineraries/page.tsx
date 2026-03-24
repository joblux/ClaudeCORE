import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const revalidate = 0

export const metadata: Metadata = {
  title: 'April Itineraries — Luxury Travel Routes | JOBLUX Escape',
  description: 'Curated luxury itineraries for April 2026. Morocco, Japan, Kenya — day-by-day travel plans with preferred hotels and insider dining.',
}

export default async function ItinerariesPage() {
  const { data: edition } = await supabase
    .from('escape_editions')
    .select('*')
    .eq('is_current', true)
    .single()

  const { data: itineraries } = await supabase
    .from('escape_itineraries')
    .select('*')
    .eq('edition_id', edition?.id)
    .eq('published', true)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${edition?.month} Itineraries`,
    itemListElement: (itineraries ?? []).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://joblux.com/escape/itineraries/${item.slug}`,
      name: item.name,
    })),
  }

  return (
    <div style={{ backgroundColor: '#F7F3E8', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <Link
          href="/escape"
          style={{ fontSize: 14, color: '#B8975C', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}
        >
          &larr; Escape
        </Link>

        <p
          style={{
            fontSize: 10.5,
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            color: '#B8975C',
            margin: 0,
          }}
        >
          Curated routes
        </p>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 32,
            color: '#1A1A1A',
            margin: '8px 0 0',
            fontWeight: 400,
          }}
        >
          {edition?.month} Itineraries
        </h1>

        <p style={{ fontSize: 15, color: '#777', marginTop: 8 }}>
          Three curated routes for the destinations that shine this month.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: 24,
            marginTop: 40,
          }}
          className="itineraries-grid"
        >
          {(itineraries ?? []).map((itinerary) => (
            <Link
              key={itinerary.id}
              href={`/escape/itineraries/${itinerary.slug}`}
              style={{
                position: 'relative',
                height: 380,
                borderRadius: 8,
                overflow: 'hidden',
                display: 'block',
                textDecoration: 'none',
              }}
              className="group"
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${itinerary.card_image || itinerary.hero_image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 500ms',
                }}
                className="group-hover:scale-[1.04]"
              />

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 24,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: '#B8975C',
                    margin: '0 0 6px',
                  }}
                >
                  {itinerary.duration}
                </p>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 24,
                    color: '#fff',
                    margin: '0 0 4px',
                    fontWeight: 400,
                  }}
                >
                  {itinerary.name}
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.75)',
                    margin: 0,
                  }}
                >
                  {itinerary.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Responsive grid via inline style tag */}
      <style>{`
        @media (min-width: 768px) {
          .itineraries-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </div>
  )
}
