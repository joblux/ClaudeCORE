import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'
import EscapeHeroCarousel from '@/components/escape/EscapeHeroCarousel'
import EscapeArticleGrid from '@/components/escape/EscapeArticleGrid'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'April Knows Better | Travel Intelligence',
  description: 'Where to travel in April 2026. Cherry blossoms in Japan, spring in Morocco, green season safaris in Kenya. Curated by your private travel advisor.',
  openGraph: {
    title: 'April Knows Better | JOBLUX Escape',
    description: 'Where to travel in April 2026. Curated travel intelligence from your private advisor.',
    type: 'website',
  },
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function EscapePage() {
  // Fetch current edition
  const { data: edition } = await supabase
    .from('escape_editions')
    .select('*')
    .eq('is_current', true)
    .single()

  // Fetch published articles for this edition
  const { data: articles } = edition
    ? await supabase
        .from('escape_articles')
        .select('*')
        .eq('edition_id', edition.id)
        .eq('published', true)
        .order('published_at', { ascending: false })
    : { data: [] }

  const allArticles = articles || []
  const heroArticles = allArticles.slice(0, 3)
  const gridArticles = allArticles.slice(3)

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'JOBLUX Escape',
            description: 'Curated travel intelligence',
            url: 'https://joblux.com/escape',
          }),
        }}
      />

      {/* ── HERO CAROUSEL ── */}
      <div className="jl-container pt-8">
        <EscapeHeroCarousel articles={heroArticles} />
      </div>

      {/* ── ARTICLE GRID ── */}
      <div className="jl-container py-12">
        <EscapeArticleGrid articles={gridArticles} />
      </div>

      {/* ── SPLIT CTA STRIP ── */}
      <div className="jl-container pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 18 }}>
          {/* Left: Plan Your Trip */}
          <Link
            href="/escape/plan"
            className="block transition-all duration-300 hover:opacity-[0.92] hover:-translate-y-0.5"
            style={{
              backgroundColor: '#2B4A3E',
              borderRadius: 10,
              padding: '22px 28px',
            }}
          >
            <p
              className="uppercase"
              style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}
            >
              Private Advisory
            </p>
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 17,
                color: '#FFFDF7',
                marginBottom: 10,
              }}
            >
              Plan your trip
            </p>
            <p style={{ fontSize: 12, color: '#B8975C' }}>
              Talk to an advisor →
            </p>
          </Link>

          {/* Right: Itineraries */}
          <Link
            href="/escape/itineraries"
            className="block transition-all duration-300 hover:opacity-[0.92] hover:-translate-y-0.5"
            style={{
              backgroundColor: '#1B3A5C',
              borderRadius: 10,
              padding: '22px 28px',
            }}
          >
            <p
              className="uppercase"
              style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}
            >
              Curated Routes
            </p>
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 17,
                color: '#FFFDF7',
                marginBottom: 10,
              }}
            >
              Embark on a journey designed by us
            </p>
            <p style={{ fontSize: 12, color: '#85B7EB' }}>
              View itineraries →
            </p>
          </Link>
        </div>
      </div>
    </>
  )
}
