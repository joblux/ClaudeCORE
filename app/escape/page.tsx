import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'
import AdvisorCard from '@/components/escape/AdvisorCard'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Private Travel Advisory | JOBLUX Escape',
  description: 'Curated travel intelligence from seasoned advisors. Destination guides, curated hotels, day-by-day itineraries. In partnership with Fora Travel.',
}

export default async function EscapePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [featuredRes, hotelsRes, cruisesRes, moreDestinationsRes, articlesRes, advisorRes] = await Promise.all([
    supabase.from('escape_destinations').select('*').eq('status', 'published').eq('featured', true).order('updated_at', { ascending: false }).limit(3),
    supabase.from('escape_hotels').select('*').eq('status', 'active').order('is_preferred', { ascending: false }).order('name').limit(10),
    supabase.from('escape_cruises').select('*').eq('status', 'active').order('is_preferred', { ascending: false }).order('name').limit(6),
    supabase.from('escape_destinations').select('*').eq('status', 'published').eq('featured', false).limit(6),
    supabase.from('bloglux_articles').select('id, title, slug, excerpt, cover_image_url, published_at, tags').eq('status', 'published').contains('tags', ['travel']).order('published_at', { ascending: false }).limit(4),
    supabase.from('escape_advisors').select('*').eq('status', 'active').limit(1).single(),
  ])

  const featured = featuredRes.data || []
  const hotels = hotelsRes.data || []
  const cruises = cruisesRes.data || []
  const moreDestinations = moreDestinationsRes.data || []
  const articles = articlesRes.data || []
  const advisor = advisorRes.data

  const itineraryDays = featured.length > 0
    ? (await supabase.from('escape_itinerary_days').select('*').eq('destination_id', featured[0].id).order('day_number').limit(2)).data || []
    : []

  return (
    <div style={{ backgroundColor: '#FDF8EE' }}>
      {/* ── S1: HERO ── */}
      <div
        className="relative h-[50vh] min-h-[400px] flex items-center justify-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B4A3E]/30 to-[#2B4A3E]/85" />
        <div className="relative text-center px-4 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8975C] mb-4">
            Private Travel Advisory · In partnership with Fora Travel
          </p>
          <h1
            className="text-4xl md:text-5xl font-light text-white mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Discover the world, one journey at a time.
          </h1>
          <p className="text-sm text-white/60">
            Destination guides · Curated hotels · Day-by-day itineraries
          </p>
        </div>
      </div>

      {/* ── S2: DESTINATION GUIDES ── */}
      {featured.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">
            Destination Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Large card — featured[0] */}
            <Link href={`/escape/${featured[0].slug}`} className="md:col-span-3 block">
              <div
                className="relative h-[320px] md:h-[400px] rounded-lg overflow-hidden"
                style={{
                  backgroundImage: featured[0].hero_image
                    ? `url(${featured[0].hero_image})`
                    : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">
                    {[
                      featured[0].days_count && `${featured[0].days_count} DAYS`,
                      featured[0].hotel_count && `${featured[0].hotel_count} HOTELS`,
                      featured[0].restaurant_count && `${featured[0].restaurant_count} RESTAURANTS`,
                    ].filter(Boolean).join(' · ')}
                  </p>
                  <h3 className="text-2xl text-white font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                    {featured[0].name}
                  </h3>
                  {featured[0].description && (
                    <p className="text-sm text-white/80 line-clamp-2 mt-1">{featured[0].description}</p>
                  )}
                </div>
              </div>
            </Link>

            {/* Right column — featured[1] and featured[2] */}
            {featured.length > 1 && (
              <div className="md:col-span-2 flex flex-col gap-4">
                {featured.slice(1, 3).map((d: any) => (
                  <Link key={d.id} href={`/escape/${d.slug}`} className="block">
                    <div
                      className="relative h-[190px] rounded-lg overflow-hidden"
                      style={{
                        backgroundImage: d.hero_image
                          ? `url(${d.hero_image})`
                          : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">
                          {[
                            d.days_count && `${d.days_count} DAYS`,
                            d.hotel_count && `${d.hotel_count} HOTELS`,
                            d.restaurant_count && `${d.restaurant_count} RESTAURANTS`,
                          ].filter(Boolean).join(' · ')}
                        </p>
                        <h3 className="text-lg text-white font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                          {d.name}
                        </h3>
                        {d.description && (
                          <p className="text-sm text-white/80 line-clamp-2 mt-1">{d.description}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── S3: CURATED HOTELS ── */}
      {hotels.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-2">
            Curated Hotels
          </h2>
          <p className="text-sm text-[#5C5040] mb-6">
            Hand-selected properties with insider perks. Each one personally vetted by our advisors.
          </p>
          <div className="overflow-x-auto flex gap-4 pb-4">
            {hotels.map((hotel: any, idx: number) => {
              const gradients = [
                'linear-gradient(135deg, #3D6B5E 0%, #2B4A3E 50%, #1d3a2e 100%)',
                'linear-gradient(135deg, #8B6B4A 0%, #6a5030 100%)',
                'linear-gradient(135deg, #5a8a6f 0%, #3D6B5E 100%)',
                'linear-gradient(135deg, #C49567 0%, #8B6B4A 100%)',
                'linear-gradient(135deg, #4a7a6a 0%, #2B4A3E 100%)',
              ]
              return (
              <div key={hotel.id} className="w-[200px] flex-shrink-0">
                <div
                  className="relative h-[140px] rounded-t-lg"
                  style={{
                    backgroundImage: hotel.photos?.[0]
                      ? `url(${hotel.photos[0]})`
                      : gradients[idx % gradients.length],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {hotel.is_preferred && (
                    <span className="absolute top-2 left-2 bg-[#B8975C] text-white text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
                      Preferred
                    </span>
                  )}
                </div>
                <div className="p-3 bg-[#FFFDF7] border border-t-0 border-[#D4C9B4] rounded-b-lg">
                  <p className="text-sm font-medium text-[#2B4A3E]">{hotel.name}</p>
                  <p className="text-xs text-[#8B7A5E]">
                    {[hotel.city, hotel.country].filter(Boolean).join(', ')}
                  </p>
                  {hotel.description && (
                    <p className="text-xs text-[#5C5040] line-clamp-2 mt-1">{hotel.description}</p>
                  )}
                  {hotel.perks?.length > 0 && (
                    <p className="text-[10px] text-[#B8975C] mt-1">{hotel.perks[0]}</p>
                  )}
                  {hotel.photo_credit && (
                    <p className="text-[9px] italic text-[#D4C9B4] mt-1">{hotel.photo_credit}</p>
                  )}
                </div>
              </div>
              )
            })}
          </div>
          <div className="text-center mt-4">
            <Link href="/escape/hotels" className="text-sm text-[#B8975C] hover:underline">
              Browse all hotels by destination &gt;
            </Link>
          </div>
        </div>
      )}

      {/* ── S4: VOYAGES ── */}
      {cruises.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-2">
            Voyages
          </h2>
          <p className="text-sm text-[#5C5040] mb-6">
            Curated cruise experiences from the world&apos;s finest lines.
          </p>
          <div className="overflow-x-auto flex gap-4 pb-4">
            {cruises.map((cruise: any) => (
              <Link key={cruise.id} href={`/escape/cruises/${cruise.slug}`} className="w-[220px] flex-shrink-0 block">
                <div
                  className="relative h-[140px] rounded-t-lg"
                  style={{
                    backgroundImage: cruise.photos?.[0]
                      ? `url(${cruise.photos[0]})`
                      : 'linear-gradient(135deg, #2B4A3E 0%, #5C5040 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {cruise.is_preferred && (
                    <span className="absolute top-2 left-2 bg-[#B8975C] text-white text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
                      Preferred
                    </span>
                  )}
                </div>
                <div className="p-3 bg-[#FFFDF7] border border-t-0 border-[#D4C9B4] rounded-b-lg">
                  {cruise.cruise_line && (
                    <p className="text-[10px] uppercase tracking-wider text-[#8B7A5E]">{cruise.cruise_line}</p>
                  )}
                  <p className="text-sm font-medium text-[#2B4A3E]">{cruise.name}</p>
                  {cruise.route_name && (
                    <p className="text-xs text-[#5C5040]">{cruise.route_name}</p>
                  )}
                  {cruise.duration_nights && (
                    <span className="inline-block bg-[#2B4A3E]/10 text-[#2B4A3E] text-[10px] px-2 py-0.5 rounded-full mt-1">
                      {cruise.duration_nights} nights
                    </span>
                  )}
                  {cruise.departure_ports?.length > 0 && (
                    <p className="text-[10px] text-[#8B7A5E] mt-1">{cruise.departure_ports.join(' · ')}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/escape/cruises" className="text-sm text-[#B8975C] hover:underline">
              Browse all voyages &gt;
            </Link>
          </div>
        </div>
      )}

      {/* ── S5: INSIDE THE GUIDE ── */}
      {featured.length > 0 && itineraryDays.length > 0 && (
        <div className="bg-[#FFFDF7] border-y border-[#D4C9B4] py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">
              Inside the Guide — {featured[0].name.toUpperCase()}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {itineraryDays.map((day: any) => (
                <div key={day.id} className="bg-white border border-[#D4C9B4] rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-[#2B4A3E] mb-3 pb-2 border-b border-[#e8e2d8]">
                    Day {day.day_number}: {day.title}
                  </h4>
                  {day.morning_text && (
                    <div className="mb-3">
                      <p className="text-[10px] tracking-widest text-[#B8975C] mb-1">MORNING</p>
                      <p className="text-sm text-[#5C5040] leading-relaxed">{day.morning_text}</p>
                    </div>
                  )}
                  {day.afternoon_text && (
                    <div className="mb-3">
                      <p className="text-[10px] tracking-widest text-[#B8975C] mb-1">AFTERNOON</p>
                      <p className="text-sm text-[#5C5040] leading-relaxed">{day.afternoon_text}</p>
                    </div>
                  )}
                  {day.evening_text && (
                    <div>
                      <p className="text-[10px] tracking-widest text-[#B8975C] mb-1">EVENING</p>
                      <p className="text-sm text-[#5C5040] leading-relaxed">{day.evening_text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href={`/escape/${featured[0].slug}`} className="text-sm text-[#B8975C] hover:underline">
                Read the full {featured[0].days_count || ''}-day guide &gt;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── S6: MORE DESTINATIONS ── */}
      {moreDestinations.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">
            More Destinations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {moreDestinations.map((d: any) => (
              <Link key={d.id} href={`/escape/${d.slug}`} className="block">
                <div
                  className="relative h-[160px] rounded-lg overflow-hidden"
                  style={{
                    backgroundImage: d.hero_image
                      ? `url(${d.hero_image})`
                      : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                  <p className="absolute bottom-0 left-0 text-white font-medium text-sm p-3">
                    {d.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── S7: TRAVEL EDITORIAL ── */}
      {articles.length > 0 && (
        <div className="bg-[#FFFDF7] border-y border-[#D4C9B4] py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">
              Travel Editorial
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((a: any) => (
                <Link key={a.id} href={`/bloglux/${a.slug}`} className="block">
                  <div className="bg-white border border-[#D4C9B4] rounded-lg overflow-hidden hover:border-[#2B4A3E] transition-colors">
                    {a.cover_image_url && (
                      <div
                        className="h-32"
                        style={{
                          backgroundImage: `url(${a.cover_image_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-[#2B4A3E]">{a.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── S8: ADVISOR WIDGET ── */}
      {advisor && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">
            Your Travel Advisor
          </h2>
          <div className="max-w-lg">
            <AdvisorCard advisor={advisor} />
          </div>
        </div>
      )}

      {/* ── S9: CTA ── */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-[#2B4A3E] rounded-lg p-10 text-center">
          <h2 className="text-2xl text-white" style={{ fontFamily: 'Georgia, serif' }}>
            Ready to plan your escape?
          </h2>
          <p className="text-sm text-white/50 mt-2">
            Complimentary video consultation. No commitment.
          </p>
          <Link
            href="/escape/consultation"
            className="inline-block bg-[#B8975C] text-[#2B4A3E] font-semibold px-8 py-3 rounded hover:bg-[#a07d4a] transition-colors mt-6"
          >
            Book a consultation
          </Link>
        </div>
      </div>

      {/* ── S10: LEGAL FOOTER ── */}
      <div className="text-center py-8 px-4">
        <p className="text-xs text-[#8B7A5E]">
          Alex Mason on behalf of Joblux US LLC · Registered in Delaware · Joblux is an online media
        </p>
        <p className="text-xs text-[#B8975C] mt-1">
          Travel advisory services provided by independent advisors affiliated with Fora Travel, Inc.
        </p>
        <p className="text-xs text-[#8B7A5E] mt-2">
          <Link href="/help" className="hover:text-[#2B4A3E] transition-colors">Help centre</Link>
          {' · '}
          <Link href="/terms" className="hover:text-[#2B4A3E] transition-colors">Terms</Link>
          {' · '}
          <Link href="/" className="hover:text-[#2B4A3E] transition-colors">JOBLUX</Link>
        </p>
      </div>
    </div>
  )
}
