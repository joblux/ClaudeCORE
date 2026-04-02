import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EscapeShareBar from '@/components/escape/EscapeShareBar'
import HotelGallery from '@/components/escape/HotelGallery'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const revalidate = 0

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: hotel } = await supabase
    .from('escape_hotels')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!hotel) {
    return { title: 'Hotel Not Found' }
  }

  return {
    title: `${hotel.name}, ${hotel.city} | Preferred Hotel`,
    description: hotel.advisor_note || `Discover ${hotel.name} in ${hotel.city}, ${hotel.country} | a preferred JOBLUX hotel.`,
  }
}

export default async function HotelDetailPage({ params }: { params: { slug: string } }) {
  const { data: hotel } = await supabase
    .from('escape_hotels')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!hotel) notFound()

  const { data: relatedHotels } = await supabase
    .from('escape_hotels')
    .select('*')
    .eq('published', true)
    .eq('destination_tag', hotel.destination_tag)
    .neq('slug', hotel.slug)
    .limit(3)

  // Fetch gallery photos
  const { data: photos } = await supabase
    .from('escape_hotel_photos')
    .select('id, url, caption, credit, is_cover')
    .eq('hotel_id', hotel.id)
    .order('sort_order')

  const galleryPhotos = photos || []
  const coverPhoto = galleryPhotos.find((p: any) => p.is_cover)
  const heroImage = coverPhoto?.url || hotel.hero_image || hotel.image

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: hotel.city,
      addressCountry: hotel.country,
    },
    image: heroImage,
    ...(hotel.perks && hotel.perks.length > 0
      ? {
          amenityFeature: hotel.perks.map((perk: string) => ({
            '@type': 'LocationFeatureSpecification',
            name: perk,
            value: true,
          })),
        }
      : {}),
  }

  return (
    <div style={{ backgroundColor: '#F7F3E8', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="jl-container pt-6">
        <Link
          href="/escape/hotels"
          style={{ color: '#B8975C', fontSize: '0.875rem', textDecoration: 'none' }}
        >
          &larr; Hotels Reserve
        </Link>
      </div>

      {/* Hero */}
      <div className="jl-container mt-4">
        <div style={{ borderRadius: 10, overflow: 'hidden' }}>
          <img
            src={heroImage}
            alt={hotel.name}
            style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
          />
        </div>
        {coverPhoto?.credit && (
          <p style={{ fontSize: 11, color: '#999', marginTop: 6, textAlign: 'right' }}>{coverPhoto.credit}</p>
        )}
      </div>

      {/* Share bar */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 1.5rem' }}>
        <EscapeShareBar title={hotel.name} />
      </div>

      {/* Hotel info */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 2.5rem' }}>
        {hotel.preferred && (
          <p
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#B8975C',
              marginBottom: '0.5rem',
            }}
          >
            Preferred partner
          </p>
        )}

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '34px',
            color: '#1A1A1A',
            margin: 0,
            fontWeight: 700,
          }}
        >
          {hotel.name}
        </h1>

        <p style={{ fontSize: '14px', color: '#888', marginTop: '0.25rem' }}>
          {hotel.city}, {hotel.country}
        </p>

        {hotel.advisor_note && (
          <blockquote
            style={{
              marginTop: '2rem',
              borderLeft: '3px solid #B8975C',
              paddingLeft: '22px',
              fontStyle: 'italic',
              fontSize: '15px',
              color: '#444',
              lineHeight: 1.75,
              margin: '2rem 0 0 0',
            }}
          >
            {hotel.advisor_note}
          </blockquote>
        )}

        {/* Perks */}
        {hotel.perks && hotel.perks.length > 0 && (
          <div style={{ marginTop: '2.5rem' }}>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#1A1A1A',
                marginBottom: '1rem',
                marginTop: 0,
              }}
            >
              Exclusive perks through JOBLUX
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {hotel.perks.map((perk: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '9999px',
                      backgroundColor: '#B8975C',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#333' }}>{perk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {galleryPhotos.length > 1 && (
          <div style={{ marginTop: '2.5rem' }}>
            <HotelGallery photos={galleryPhotos} />
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: '2.5rem' }}>
          <Link
            href={`/escape/plan?source=${encodeURIComponent(hotel.name + ', ' + hotel.city)}`}
            style={{
              display: 'block',
              backgroundColor: '#2B4A3E',
              color: '#fff',
              textAlign: 'center',
              padding: '0.875rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'opacity 150ms',
            }}
            className="hover:opacity-90"
          >
            Plan a stay
          </Link>
        </div>

        {/* Related hotels */}
        {relatedHotels && relatedHotels.length > 0 && (
          <div
            style={{
              marginTop: '4rem',
              paddingTop: '2.5rem',
              borderTop: '1px solid #E0D9CA',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#888',
                marginBottom: '1.5rem',
                marginTop: 0,
              }}
            >
              More in {hotel.destination_tag}
            </p>

            <div
              className="grid grid-cols-1 sm:grid-cols-3"
              style={{ gap: '1.25rem' }}
            >
              {relatedHotels.map((related: any) => (
                <Link
                  key={related.slug}
                  href={`/escape/hotels/${related.slug}`}
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
                      backgroundImage: `url(${related.image})`,
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
                      {related.name}
                    </p>
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#888',
                        marginTop: '2px',
                        marginBottom: 0,
                      }}
                    >
                      {related.city}, {related.country}
                    </p>
                    {related.preferred && (
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
                    {related.perks && related.perks.length > 0 && (
                      <p
                        style={{
                          fontSize: '11px',
                          color: '#B8975C',
                          marginTop: '0.5rem',
                          marginBottom: 0,
                        }}
                      >
                        {related.perks.length} exclusive perk{related.perks.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
