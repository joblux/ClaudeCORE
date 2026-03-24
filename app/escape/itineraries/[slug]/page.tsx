import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import EscapeShareBar from '@/components/escape/EscapeShareBar'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const revalidate = 0

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: itinerary } = await supabase
    .from('escape_itineraries')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!itinerary) return {}

  return {
    title: `${itinerary.duration} in ${itinerary.name} — Luxury Itinerary | JOBLUX Escape`,
    description: itinerary.tagline,
  }
}

export default async function ItineraryDetailPage({ params }: { params: { slug: string } }) {
  const { data: itinerary } = await supabase
    .from('escape_itineraries')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!itinerary) notFound()

  const { data: days } = await supabase
    .from('escape_itinerary_days')
    .select('*')
    .eq('itinerary_id', itinerary.id)
    .order('sort_order', { ascending: true })

  // Fetch hotels for days that have a hotel_id
  const hotelIds = (days ?? []).filter((d) => d.hotel_id).map((d) => d.hotel_id)
  const uniqueHotelIds = [...new Set(hotelIds)]

  let hotelsMap: Record<string, any> = {}
  if (uniqueHotelIds.length > 0) {
    const { data: hotels } = await supabase
      .from('escape_hotels')
      .select('*')
      .in('id', uniqueHotelIds)

    ;(hotels ?? []).forEach((h) => {
      hotelsMap[h.id] = h
    })
  }

  // Fetch all hotels for this itinerary
  const { data: allHotels } = await supabase
    .from('escape_hotels')
    .select('*')
    .eq('itinerary_id', itinerary.id)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Trip',
    name: itinerary.name,
    description: itinerary.tagline,
    itinerary: {
      '@type': 'ItemList',
      itemListElement: (days ?? []).map((day, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: day.title,
      })),
    },
  }

  return (
    <div style={{ backgroundColor: '#F7F3E8', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back link */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 0' }}>
        <Link
          href="/escape/itineraries"
          style={{ fontSize: 14, color: '#B8975C', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}
        >
          &larr; All itineraries
        </Link>
      </div>

      {/* Hero */}
      <div
        style={{
          position: 'relative',
          height: 450,
          width: '100%',
          backgroundImage: `url(${itinerary.hero_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 40,
            right: 40,
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 52,
              color: '#fff',
              margin: '0 0 8px',
              fontWeight: 400,
            }}
          >
            {itinerary.name}
          </h1>
          <p
            style={{
              fontSize: 16,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.8)',
              margin: '0 0 8px',
            }}
          >
            {itinerary.tagline}
          </p>
          <p
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.65)',
              margin: 0,
            }}
          >
            {itinerary.duration}{itinerary.season_note ? ` \u00B7 ${itinerary.season_note}` : ''}
          </p>
        </div>
      </div>

      {/* Share bar */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 24px' }}>
        <EscapeShareBar title={itinerary.name} />
      </div>

      {/* Trip summary bar */}
      <div
        style={{
          borderTop: '1px solid #E0D9CA',
          borderBottom: '1px solid #E0D9CA',
          padding: '16px 0',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 40,
            flexWrap: 'wrap',
            padding: '0 24px',
          }}
        >
          {[
            { label: 'Duration', value: itinerary.duration },
            { label: 'Best Season', value: itinerary.best_season },
            { label: 'Style', value: itinerary.style },
            { label: 'From', value: itinerary.from_price },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#888',
                  margin: '0 0 4px',
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#1A1A1A',
                  margin: 0,
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Day-by-day */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        {(days ?? []).map((day, index) => {
          const hotel = day.hotel_id ? hotelsMap[day.hotel_id] : null
          const isLast = index === (days ?? []).length - 1

          return (
            <div
              key={day.id}
              style={{
                padding: '56px 0',
                borderBottom: isLast ? 'none' : '1px solid #E0D9CA',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 2.5,
                  color: '#B8975C',
                  margin: '0 0 8px',
                }}
              >
                Day {day.day_number}
              </p>

              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 26,
                  color: '#1A1A1A',
                  margin: '0 0 20px',
                  fontWeight: 400,
                }}
              >
                {day.title}
              </h2>

              {day.image && (
                <img
                  src={day.image}
                  alt={day.title}
                  style={{
                    width: '100%',
                    height: 380,
                    borderRadius: 6,
                    objectFit: 'cover',
                    marginBottom: 20,
                    display: 'block',
                  }}
                />
              )}

              <p
                style={{
                  fontSize: 15.5,
                  lineHeight: 1.8,
                  color: '#333',
                  margin: '0 0 20px',
                  whiteSpace: 'pre-line',
                }}
              >
                {day.body}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                {hotel && (
                  <Link
                    href={`/escape/hotels/${hotel.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      border: '1px solid #B8975C',
                      borderRadius: 9999,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#B8975C',
                      textDecoration: 'none',
                      transition: 'all 200ms',
                    }}
                    className="hotel-pill"
                  >
                    {hotel.preferred && (
                      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                        PREFERRED
                      </span>
                    )}
                    {hotel.preferred && <span style={{ color: '#B8975C' }}>&middot;</span>}
                    {hotel.name}
                  </Link>
                )}

                {day.dining_note && (
                  <span style={{ fontSize: 13, fontStyle: 'italic', color: '#888' }}>
                    {day.dining_note}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {/* Signature + CTA block */}
        <div
          style={{
            backgroundColor: '#FDF8EE',
            borderRadius: 8,
            padding: 48,
            marginTop: 56,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: '#B8975C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              MA
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#1A1A1A' }}>
                Travel designed by Mohammed Alex Mzaour
              </p>
              <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
                JOBLUX Private Travel Advisory
              </p>
            </div>
          </div>

          <Link
            href={`/escape/plan?source=${encodeURIComponent(itinerary.name)}`}
            style={{
              backgroundColor: '#2B4A3E',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'opacity 200ms',
            }}
            className="cta-button"
          >
            Start planning
          </Link>
        </div>
      </div>

      {/* Hover styles */}
      <style>{`
        .hotel-pill:hover {
          background-color: #B8975C !important;
          color: #fff !important;
        }
        .cta-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  )
}
