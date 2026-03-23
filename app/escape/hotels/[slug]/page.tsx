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
    .from('escape_hotels')
    .select('name, description')
    .eq('slug', params.slug)
    .eq('status', 'active')
    .single()

  if (!data) return { title: 'Hotel | JOBLUX Escape' }
  return {
    title: `${data.name} | JOBLUX Escape`,
    description: data.description || `Discover ${data.name} with JOBLUX Escape.`,
  }
}

export default async function HotelPage({ params }: { params: { slug: string } }) {
  const { data: hotel, error } = await supabase
    .from('escape_hotels')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'active')
    .single()

  if (error || !hotel) notFound()

  const [sameCityRes, advisorRes] = await Promise.all([
    supabase
      .from('escape_hotels')
      .select('*')
      .eq('status', 'active')
      .eq('city', hotel.city)
      .neq('id', hotel.id)
      .limit(4),
    supabase.from('escape_advisors').select('*').eq('status', 'active').limit(1).single(),
  ])

  const sameCity = sameCityRes.data || []
  const advisor = advisorRes.data
  const photos: string[] = hotel.photos || []

  return (
    <div>
      {/* Hero photo */}
      <div
        className="relative h-[45vh] min-h-[320px]"
        style={{
          backgroundImage:
            photos.length > 0
              ? `url(${photos[0]})`
              : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Photo gallery strip */}
      {photos.length > 1 && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="overflow-x-auto flex gap-2">
            {photos.map((photo: string, i: number) => (
              <img
                key={i}
                src={photo}
                alt={`${hotel.name} photo ${i + 1}`}
                className={`w-16 h-16 rounded object-cover border-2 flex-shrink-0 ${
                  i === 0 ? 'border-[#B8975C]' : 'border-transparent'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main content wrapper */}
      <div className="max-w-3xl mx-auto px-4">
        {/* Badge + location */}
        <div className="pt-8">
          {hotel.is_preferred && (
            <span className="bg-[#B8975C] text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2 font-semibold">
              Fora Preferred
            </span>
          )}
          {(hotel.city || hotel.country) && (
            <p className="text-sm text-[#8B7A5E]">
              {hotel.city}{hotel.country ? `, ${hotel.country}` : ''}
            </p>
          )}
        </div>

        {/* Hotel name */}
        <h1
          className="text-3xl md:text-4xl font-light text-[#2B4A3E] mt-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {hotel.name}
        </h1>

        {/* Description */}
        {hotel.description && (
          <p className="text-[#5C5040] leading-relaxed mt-4">{hotel.description}</p>
        )}

        {/* Insider perks */}
        {hotel.perks && hotel.perks.length > 0 && (
          <div className="mt-8 bg-[#FFFDF7] border border-[#D4C9B4] rounded-lg p-6">
            <p className="text-[10px] uppercase tracking-wider text-[#B8975C] mb-3 font-semibold">
              Insider Perks — Book Through Us
            </p>
            <ul className="list-disc list-inside space-y-1">
              {hotel.perks.map((perk: string, i: number) => (
                <li key={i} className="text-sm text-[#5C5040]">{perk}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Book button */}
        <Link
          href={`/escape/consultation?destination=${encodeURIComponent(hotel.city || '')}&hotel=${encodeURIComponent(hotel.name)}`}
          className="mt-8 w-full bg-[#2B4A3E] text-white text-sm font-semibold py-3.5 rounded text-center hover:bg-[#1d3a2e] transition-colors block"
        >
          Plan a stay at {hotel.name}
        </Link>

        {/* Photo credit */}
        <p className="mt-4 text-[10px] italic text-[#D4C9B4]">
          Photo courtesy of {hotel.name}
        </p>
      </div>

      {/* Also in [city] */}
      {sameCity.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">
            Also in {hotel.city}
          </h2>
          <div className="overflow-x-auto flex gap-4 pb-4">
            {sameCity.map((h: any) => (
              <Link
                key={h.id}
                href={`/escape/hotels/${h.slug}`}
                className="w-[220px] flex-shrink-0 block group"
              >
                <div
                  className="h-[140px] rounded-t-lg relative overflow-hidden"
                  style={{
                    backgroundImage:
                      h.photos && h.photos.length > 0
                        ? `url(${h.photos[0]})`
                        : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {h.is_preferred && (
                    <span className="absolute top-2 left-2 bg-[#B8975C] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold">
                      Preferred
                    </span>
                  )}
                </div>
                <div className="p-3 bg-[#FFFDF7] border border-t-0 border-[#D4C9B4] rounded-b-lg">
                  <p className="font-medium text-[#2B4A3E] text-sm">{h.name}</p>
                  {h.description && (
                    <p className="text-xs text-[#5C5040] mt-1 line-clamp-2">{h.description}</p>
                  )}
                  {h.perks && h.perks.length > 0 && (
                    <p className="text-[10px] text-[#B8975C] mt-1.5">{h.perks[0]}</p>
                  )}
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
