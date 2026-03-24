import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import EscapeShareBar from '@/components/escape/EscapeShareBar'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const revalidate = 0

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: cityGuide } = await supabase
    .from('escape_city_guides')
    .select('city_name, intro')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!cityGuide) return {}

  return {
    title: `${cityGuide.city_name} — City Guide`,
    description: cityGuide.intro,
  }
}

export default async function EscapeCityGuidePage({ params }: { params: { slug: string } }) {
  const { data: cityGuide } = await supabase
    .from('escape_city_guides')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!cityGuide) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: cityGuide.city_name,
    description: cityGuide.intro,
    image: cityGuide.hero_image,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div
        style={{
          height: 380,
          width: '100%',
          backgroundImage: `url(${cityGuide.hero_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* Dark gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 60%)',
          }}
        />

        {/* Bottom-left content */}
        <div style={{ position: 'absolute', bottom: 32, left: 32 }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '2px', color: '#B8975C', marginBottom: 8 }}>
            City Life &middot; April
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 44, color: '#fff', marginBottom: 6 }}>
            {cityGuide.city_name}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
            {cityGuide.country}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        {/* Share bar */}
        <EscapeShareBar title={cityGuide.city_name} />

        {/* Intro */}
        {cityGuide.intro && (
          <p
            style={{
              marginTop: 32,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 16,
              lineHeight: 1.8,
              color: '#444',
            }}
          >
            {cityGuide.intro}
          </p>
        )}

        {/* Body */}
        {cityGuide.body && (
          <div
            dangerouslySetInnerHTML={{ __html: cityGuide.body }}
            style={{ marginTop: 32, fontSize: 16, lineHeight: 1.8, color: '#333' }}
          />
        )}

        {/* CTA */}
        <div style={{ marginTop: 64, padding: 40, borderRadius: 8, backgroundColor: '#FDF8EE', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20 }}>
            Planning a trip to {cityGuide.city_name}?
          </p>
          <Link
            href={`/escape/plan?source=${encodeURIComponent(cityGuide.city_name)}`}
            style={{
              display: 'inline-block',
              marginTop: 16,
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
      </div>
    </>
  )
}
