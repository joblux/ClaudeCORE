import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Hotels Reserve — Preferred Luxury Hotels',
  description: 'Our curated collection of the world\'s finest hotels with exclusive perks. Suite upgrades, daily breakfast, spa credits — book through JOBLUX.',
}

export default async function HotelsPage() {
  const { data: hotels } = await supabase
    .from('escape_hotels')
    .select('*')
    .eq('published', true)
    .order('preferred', { ascending: false })
    .order('name', { ascending: true })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: (hotels ?? []).map((hotel: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Hotel',
        name: hotel.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: hotel.city,
          addressCountry: hotel.country,
        },
        image: hotel.image,
        url: `https://joblux.com/escape/hotels/${hotel.slug}`,
      },
    })),
  }

  return (
    <div style={{ backgroundColor: '#F7F3E8', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="jl-container py-12">
        <Link
          href="/escape"
          style={{ color: '#B8975C', fontSize: '0.875rem', textDecoration: 'none' }}
        >
          &larr; Escape
        </Link>

        <div style={{ marginBottom: '1.5rem' }} />

        <p
          style={{
            fontSize: '10.5px',
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            color: '#B8975C',
            margin: 0,
          }}
        >
          Curated collection
        </p>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '32px',
            color: '#1A1A1A',
            margin: '0.5rem 0 0 0',
            fontWeight: 700,
          }}
        >
          Hotels Reserve
        </h1>

        <p style={{ fontSize: '15px', color: '#777', marginTop: '0.5rem' }}>
          Our preferred properties worldwide, handpicked by your advisor.
        </p>

        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            marginTop: '2.5rem',
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {(hotels ?? []).map((hotel: any) => (
            <Link
              key={hotel.slug}
              href={`/escape/hotels/${hotel.slug}`}
              className="group hover:-translate-y-1 hover:shadow-md"
              style={{
                display: 'block',
                borderRadius: '0.375rem',
                overflow: 'hidden',
                border: '1px solid #E0D9CA',
                backgroundColor: '#FFFDF7',
                transition: 'all 300ms',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  height: '180px',
                  backgroundImage: `url(${hotel.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div style={{ padding: '1rem' }}>
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    margin: 0,
                  }}
                >
                  {hotel.name}
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '2px',
                    marginBottom: 0,
                  }}
                >
                  {hotel.city}, {hotel.country}
                </p>
                {hotel.preferred && (
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      fontSize: '8.5px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      backgroundColor: '#B8975C',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontWeight: 600,
                    }}
                  >
                    Preferred
                  </span>
                )}
                {hotel.perks && hotel.perks.length > 0 && (
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#B8975C',
                      marginTop: '0.5rem',
                      marginBottom: 0,
                    }}
                  >
                    {hotel.perks.length} exclusive perk{hotel.perks.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
