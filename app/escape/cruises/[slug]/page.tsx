import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import AdvisorCard from '@/components/escape/AdvisorCard'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = await supabase
    .from('escape_cruises')
    .select('name, description')
    .eq('slug', params.slug)
    .eq('status', 'active')
    .single()

  if (!data) return { title: 'Cruise | JOBLUX Escape' }
  return {
    title: `${data.name} | JOBLUX Escape`,
    description: data.description || `Discover ${data.name} with JOBLUX Escape.`,
  }
}

export default async function CruisePage({ params }: { params: { slug: string } }) {
  const { data: cruise, error } = await supabase
    .from('escape_cruises')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'active')
    .single()

  if (error || !cruise) notFound()

  const { data: advisor } = await supabase
    .from('escape_advisors')
    .select('*')
    .eq('status', 'active')
    .limit(1)
    .single()

  const photos: string[] = cruise.photos || []

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
                alt={`${cruise.name} photo ${i + 1}`}
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
        {/* Badge + line */}
        <div className="pt-8">
          {cruise.is_preferred && (
            <span className="bg-[#B8975C] text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2 font-semibold">
              Fora Preferred
            </span>
          )}
          {cruise.cruise_line && (
            <p className="text-sm text-[#8B7A5E]">{cruise.cruise_line}</p>
          )}
        </div>

        {/* Cruise name */}
        <h1
          className="text-3xl md:text-4xl font-light text-[#2B4A3E] mt-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {cruise.name}
        </h1>

        {/* Route info */}
        <div className="mt-2">
          {cruise.route_name && (
            <p className="text-[#5C5040]">{cruise.route_name}</p>
          )}
          {cruise.duration_nights && (
            <span className="bg-[#2B4A3E]/10 text-[#2B4A3E] text-xs px-3 py-1 rounded-full inline-block mt-2">
              {cruise.duration_nights} nights
            </span>
          )}
          {cruise.departure_ports && cruise.departure_ports.length > 0 && (
            <p className="text-sm text-[#8B7A5E] mt-2">
              Departing from: {cruise.departure_ports.join(', ')}
            </p>
          )}
        </div>

        {/* Description */}
        {cruise.description && (
          <p className="mt-6 text-[#5C5040] leading-relaxed">{cruise.description}</p>
        )}

        {/* Highlights */}
        {cruise.highlights && cruise.highlights.length > 0 && (
          <div className="mt-8">
            <h2 className="text-[10px] uppercase tracking-wider font-semibold text-[#8B7A5E] mb-3">
              Highlights
            </h2>
            <ul className="list-disc list-inside space-y-1">
              {cruise.highlights.map((h: string, i: number) => (
                <li key={i} className="text-sm text-[#5C5040]">{h}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Stateroom types */}
        {cruise.stateroom_types && cruise.stateroom_types.length > 0 && (
          <div className="mt-6">
            <h2 className="text-[10px] uppercase tracking-wider font-semibold text-[#8B7A5E] mb-3">
              Stateroom Options
            </h2>
            <div className="flex flex-wrap gap-2">
              {cruise.stateroom_types.map((type: string, i: number) => (
                <span
                  key={i}
                  className="bg-[#FFFDF7] border border-[#D4C9B4] text-sm text-[#5C5040] px-3 py-1 rounded-full"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ports of call */}
        {cruise.ports_of_call && cruise.ports_of_call.length > 0 && (
          <div className="mt-6">
            <h2 className="text-[10px] uppercase tracking-wider font-semibold text-[#8B7A5E] mb-3">
              Ports of Call
            </h2>
            <ol className="list-decimal list-inside space-y-1">
              {cruise.ports_of_call.map((port: string, i: number) => (
                <li key={i} className="text-sm text-[#5C5040]">{port}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Book button */}
        <Link
          href="/escape/consultation?tripType=cruise"
          className="mt-8 w-full bg-[#2B4A3E] text-white text-sm font-semibold py-3.5 rounded text-center hover:bg-[#1d3a2e] transition-colors block"
        >
          Plan this voyage
        </Link>

        {/* Photo credit */}
        <p className="mt-4 text-[10px] italic text-[#D4C9B4]">
          Photo courtesy of {cruise.name}
        </p>
      </div>

      {/* Advisor */}
      {advisor && (
        <div className="max-w-3xl mx-auto px-4 py-12">
          <AdvisorCard advisor={advisor} />
        </div>
      )}
    </div>
  )
}
