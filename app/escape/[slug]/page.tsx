import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import AdvisorCard from '@/components/escape/AdvisorCard'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = await supabase
    .from('escape_destinations')
    .select('name, description')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!data) return { title: 'Destination | JOBLUX Escape' }
  return {
    title: `${data.name} | JOBLUX Escape`,
    description: data.description || `Discover ${data.name} with JOBLUX Escape — curated travel intelligence.`,
  }
}

export default async function DestinationPage({ params }: { params: { slug: string } }) {
  const { data: destination, error } = await supabase
    .from('escape_destinations')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (error || !destination) notFound()

  const [hotelsRes, itineraryRes, diningRes, advisorRes, relatedRes] = await Promise.all([
    supabase
      .from('escape_hotels')
      .select('*')
      .eq('destination_id', destination.id)
      .eq('status', 'active')
      .order('is_preferred', { ascending: false })
      .order('name', { ascending: true }),
    supabase
      .from('escape_itinerary_days')
      .select('*')
      .eq('destination_id', destination.id)
      .order('day_number', { ascending: true }),
    supabase
      .from('escape_dining')
      .select('*')
      .eq('destination_id', destination.id),
    supabase.from('escape_advisors').select('*').eq('status', 'active').limit(1).single(),
    supabase
      .from('escape_destinations')
      .select('*')
      .eq('status', 'published')
      .neq('id', destination.id)
      .limit(3),
  ])

  const hotels = hotelsRes.data || []
  const itineraryDays = itineraryRes.data || []
  const dining = diningRes.data || []
  const advisor = advisorRes.data
  const related = relatedRes.data || []

  const stats: string[] = []
  if (destination.days_count) stats.push(`${destination.days_count} DAYS`)
  if (hotels.length > 0) stats.push(`${hotels.length} HOTELS`)
  if (dining.length > 0) stats.push(`${dining.length} RESTAURANTS`)

  return (
    <div>
      {/* Hero */}
      <div
        className="relative h-[45vh] min-h-[320px] flex items-end"
        style={{
          backgroundImage: destination.hero_image
            ? `url(${destination.hero_image})`
            : 'linear-gradient(135deg, #2B4A3E 0%, #5C5040 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 pb-8 w-full">
          <h1
            className="text-4xl md:text-5xl font-light text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {destination.name}
          </h1>
          {(destination.region || destination.country) && (
            <p className="text-white/80 text-lg mt-1">
              {destination.region}{destination.country ? `, ${destination.country}` : ''}
            </p>
          )}
          {stats.length > 0 && (
            <p className="text-white/60 text-sm mt-2 tracking-wider">{stats.join(' · ')}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {destination.description && (
          <p className="text-lg text-[#5C5040] leading-relaxed">{destination.description}</p>
        )}
        {destination.content && (
          <div
            className="prose prose-lg max-w-none text-[#5C5040] mt-6"
            style={{ lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: destination.content }}
          />
        )}
      </div>

      {/* Where to Stay */}
      {hotels.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">
            Where to Stay
          </h2>
          <div className="overflow-x-auto flex gap-4 pb-4">
            {hotels.map((hotel: any) => (
              <Link
                key={hotel.id}
                href={`/escape/hotels/${hotel.slug}`}
                className="w-[220px] flex-shrink-0 block group"
              >
                <div
                  className="h-[140px] rounded-t-lg relative overflow-hidden"
                  style={{
                    backgroundImage:
                      hotel.photos && hotel.photos.length > 0
                        ? `url(${hotel.photos[0]})`
                        : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {hotel.is_preferred && (
                    <span className="absolute top-2 left-2 bg-[#B8975C] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold">
                      Preferred
                    </span>
                  )}
                </div>
                <div className="p-3 bg-[#FFFDF7] border border-t-0 border-[#D4C9B4] rounded-b-lg">
                  <p className="font-medium text-[#2B4A3E] text-sm">{hotel.name}</p>
                  {hotel.description && (
                    <p className="text-xs text-[#5C5040] mt-1 line-clamp-2">{hotel.description}</p>
                  )}
                  {hotel.perks && hotel.perks.length > 0 && (
                    <p className="text-[10px] text-[#B8975C] mt-1.5">{hotel.perks[0]}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Day-by-day Itinerary */}
      {itineraryDays.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pb-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">
            Day-by-Day Itinerary
          </h2>
          {itineraryDays.map((day: any) => (
            <div
              key={day.id}
              className="bg-[#FFFDF7] border border-[#D4C9B4] rounded-lg p-6 mb-4"
            >
              <h3 className="font-semibold text-[#2B4A3E]">
                Day {day.day_number}{day.title ? ` — ${day.title}` : ''}
              </h3>
              <div className="mt-4 space-y-3">
                {day.morning && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[#B8975C]">Morning</p>
                    <p className="text-sm text-[#5C5040] mt-0.5">{day.morning}</p>
                  </div>
                )}
                {day.afternoon && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[#B8975C]">Afternoon</p>
                    <p className="text-sm text-[#5C5040] mt-0.5">{day.afternoon}</p>
                  </div>
                )}
                {day.evening && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[#B8975C]">Evening</p>
                    <p className="text-sm text-[#5C5040] mt-0.5">{day.evening}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dining Highlights */}
      {dining.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pb-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">
            Dining Highlights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dining.map((d: any) => (
              <div key={d.id} className="bg-[#FFFDF7] border border-[#D4C9B4] rounded-lg p-4">
                <p className="font-medium text-[#2B4A3E]">{d.name}</p>
                {d.description && (
                  <p className="text-sm text-[#5C5040] mt-1">{d.description}</p>
                )}
                {d.cuisine_type && (
                  <span className="inline-block text-[10px] bg-[#2B4A3E]/10 text-[#2B4A3E] px-2 py-0.5 rounded-full mt-2">
                    {d.cuisine_type}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-[#2B4A3E] py-10 px-4 text-center">
        <h2
          className="text-2xl font-light text-white mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Plan your {destination.name} escape
        </h2>
        <Link
          href={`/escape/consultation?destination=${encodeURIComponent(destination.name)}`}
          className="inline-block bg-white text-[#2B4A3E] text-sm font-semibold px-8 py-3 rounded hover:bg-[#B8975C] hover:text-white transition-colors"
        >
          Start Planning
        </Link>
      </div>

      {/* Related Destinations */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">
            More Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((d: any) => (
              <Link
                key={d.id}
                href={`/escape/${d.slug}`}
                className="relative h-[180px] rounded-lg overflow-hidden group block"
                style={{
                  backgroundImage: d.hero_image
                    ? `url(${d.hero_image})`
                    : 'linear-gradient(135deg, #2B4A3E 0%, #5C5040 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p
                    className="text-white text-lg font-light"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {d.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Advisor */}
      {advisor && (
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="max-w-lg">
            <AdvisorCard advisor={advisor} />
          </div>
        </div>
      )}
    </div>
  )
}
