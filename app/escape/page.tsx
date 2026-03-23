import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'
import DestinationCard from '@/components/escape/DestinationCard'
import AdvisorCard from '@/components/escape/AdvisorCard'
import EscapeCTA from '@/components/escape/EscapeCTA'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Private Travel Advisory | JOBLUX Escape',
  description: 'Curated travel intelligence from seasoned advisors. Cultural discovery, refined comfort, memorable experiences. In partnership with Fora Travel.',
}

const HERO_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80'

const CATEGORIES = ['Hotels & Resorts', 'Gastronomy', 'Wellness', 'Art & Culture', 'Adventure', 'Cruises', 'Family', 'Multi-destination']

export default async function EscapePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [featuredRes, allRes, articlesRes, advisorRes] = await Promise.all([
    supabase.from('escape_destinations').select('*').eq('status', 'published').eq('featured', true).order('updated_at', { ascending: false }).limit(3),
    supabase.from('escape_destinations').select('*').eq('status', 'published').order('name').limit(30),
    supabase.from('bloglux_articles').select('id, title, slug, excerpt, cover_image_url, published_at, tags').eq('status', 'published').contains('tags', ['travel']).order('published_at', { ascending: false }).limit(4),
    supabase.from('escape_advisors').select('*').eq('status', 'active').limit(1).single(),
  ])

  const featured = featuredRes.data || []
  const destinations = allRes.data || []
  const articles = articlesRes.data || []
  const advisor = advisorRes.data

  return (
    <div>
      {/* ── S1: HERO ── */}
      <div
        className="relative h-[50vh] min-h-[400px] flex items-center justify-center"
        style={{
          backgroundImage: `url(${HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(43,74,62,0.5) 0%, rgba(43,74,62,0.2) 50%, transparent 100%)' }} />
        <div className="relative text-center px-4 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90 mb-4">
            Private Travel Advisory · In partnership with Fora Travel
          </p>
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Your next chapter begins with a journey
          </h1>
          <p className="text-sm text-white/80 leading-relaxed max-w-xl mx-auto">
            Curated travel intelligence from seasoned advisors. Cultural discovery, refined comfort, memorable experiences.
          </p>
        </div>
      </div>

      {/* ── S2: FEATURED DESTINATIONS ── */}
      {featured.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">Featured Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-3">
              <DestinationCard destination={featured[0]} size="large" />
            </div>
            {featured.length > 1 && (
              <div className="md:col-span-2 flex flex-col gap-4">
                {featured.slice(1, 3).map((d: any) => (
                  <DestinationCard key={d.id} destination={d} size="small" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── S3: CATEGORY PILLS ── */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {/* TODO: Wire pills to filter destinations */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm border border-[#D4C9B4] text-[#5C5040] hover:bg-[#2B4A3E] hover:text-white hover:border-[#2B4A3E] transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── S4: DESTINATION GRID ── */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {destinations.length > 0 ? (
          <>
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">All Destinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {destinations.map((d: any) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#8B7A5E] text-sm">Destinations coming soon.</p>
          </div>
        )}
      </div>

      {/* ── S5: TRAVEL EDITORIAL ── */}
      {articles.length > 0 && (
        <div className="bg-[#FFFDF7] border-y border-[#D4C9B4] py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">Travel Intelligence</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {articles.map((a: any, i: number) => (
                <Link key={a.id} href={`/bloglux/${a.slug}`} className={`group ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                  <div className="bg-white border border-[#D4C9B4] rounded-lg overflow-hidden h-full hover:border-[#2B4A3E] transition-colors">
                    {a.cover_image_url && (
                      <div
                        className={`${i === 0 ? 'h-48 md:h-64' : 'h-32'}`}
                        style={{ backgroundImage: `url(${a.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      />
                    )}
                    <div className="p-4">
                      <h3 className={`font-semibold text-[#2B4A3E] group-hover:text-[#B8975C] transition-colors ${i === 0 ? 'text-lg' : 'text-sm'} leading-snug`}>
                        {a.title}
                      </h3>
                      {i === 0 && a.excerpt && (
                        <p className="text-sm text-[#5C5040] mt-2 line-clamp-2">{a.excerpt}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── S6: ADVISOR SNAPSHOT ── */}
      {advisor && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">Your Travel Advisor</h2>
          <div className="max-w-lg">
            <AdvisorCard advisor={advisor} />
          </div>
        </div>
      )}

      {/* ── S7: CTA STRIP ── */}
      <EscapeCTA variant="strip" />

      {/* ── S8: Partner logos — future ── */}
    </div>
  )
}
