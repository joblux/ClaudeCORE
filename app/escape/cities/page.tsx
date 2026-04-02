import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const revalidate = 0

export const metadata: Metadata = {
  title: 'City Life | City Guides',
  description: 'Curated city guides with insider recommendations on where to stay, eat, and explore in the world\'s most inspiring destinations.',
}

export default async function EscapeCitiesPage() {
  const { data: cities } = await supabase
    .from('escape_city_guides')
    .select('*')
    .eq('published', true)

  return (
    <div className="jl-container py-12">
      {/* Back link */}
      <Link
        href="/escape"
        style={{ fontSize: 14, color: '#B8975C', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}
      >
        &larr; Escape
      </Link>

      {/* Label */}
      <p style={{ textTransform: 'uppercase', fontSize: 10.5, letterSpacing: '2.5px', color: '#B8975C', marginBottom: 8 }}>
        City Life
      </p>

      {/* Title */}
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, color: '#1A1A1A', marginBottom: 8 }}>
        Cities of the Month
      </h1>

      {/* Subtitle */}
      <p style={{ fontSize: 15, color: '#777', marginBottom: 0 }}>
        Where to stay, where to eat, and what to know | from our advisor.
      </p>

      {cities && cities.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: 24,
            marginTop: 40,
          }}
          className="md:grid-cols-2"
        >
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/escape/cities/${city.slug}`}
              style={{
                position: 'relative',
                height: 280,
                borderRadius: 8,
                overflow: 'hidden',
                display: 'block',
                textDecoration: 'none',
              }}
              className="group"
            >
              {/* Background image */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${city.hero_image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 0.4s ease',
                }}
                className="group-hover:scale-105"
              />

              {/* Dark gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%)',
                }}
              />

              {/* Bottom content */}
              <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, color: '#fff', marginBottom: 4 }}>
                  {city.city_name}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  {city.country}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', marginTop: 40 }}>
          <p style={{ fontSize: 32, color: '#B8975C' }}>&#10022;</p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, marginTop: 16 }}>
            Coming soon
          </p>
          <p style={{ fontSize: 14, color: '#777', marginTop: 12, maxWidth: 448, margin: '12px auto 0' }}>
            City guides are being curated. Marrakech, Tokyo, Nairobi, Lisbon, Amsterdam, and Paris are on the way.
          </p>
          <Link
            href="/escape/plan"
            style={{
              display: 'inline-block',
              marginTop: 24,
              padding: '12px 28px',
              backgroundColor: '#2B4A3E',
              color: '#fff',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            Plan Your Trip
          </Link>
        </div>
      )}
    </div>
  )
}
