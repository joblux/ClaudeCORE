import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import AdvisorCard from '@/components/escape/AdvisorCard'
import DestinationCard from '@/components/escape/DestinationCard'

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

  const [advisorRes, relatedRes] = await Promise.all([
    supabase.from('escape_advisors').select('*').eq('status', 'active').limit(1).single(),
    supabase.from('escape_destinations').select('*').eq('status', 'published').neq('id', destination.id).limit(3),
  ])

  const advisor = advisorRes.data
  const related = relatedRes.data || []

  return (
    <div>
      {/* Hero */}
      <div
        className="relative h-[45vh] min-h-[320px] flex items-end"
        style={{
          backgroundImage: destination.hero_image ? `url(${destination.hero_image})` : 'linear-gradient(135deg, #2B4A3E 0%, #5C5040 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 pb-8 w-full">
          <h1 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {destination.name}
          </h1>
          {destination.region && (
            <p className="text-white/80 text-lg mt-1">{destination.region}{destination.country ? `, ${destination.country}` : ''}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {destination.description && (
          <p className="text-lg text-[#5C5040] leading-relaxed mb-8">{destination.description}</p>
        )}

        {destination.content && (
          <div
            className="prose prose-lg max-w-none text-[#5C5040]"
            style={{ lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: destination.content }}
          />
        )}

        {(destination.experience_count ?? 0) > 0 && (
          <div className="mt-8 p-4 bg-[#FFFDF7] border border-[#D4C9B4] rounded-lg inline-block">
            <span className="text-sm text-[#2B4A3E] font-medium">{destination.experience_count} curated experiences</span>
          </div>
        )}
      </div>

      {/* Advisor */}
      {advisor && (
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="max-w-lg">
            <AdvisorCard advisor={advisor} />
          </div>
        </div>
      )}

      {/* Plan CTA */}
      <div className="bg-[#2B4A3E] py-10 px-4 text-center">
        <h2 className="text-2xl font-light text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Plan this escape
        </h2>
        <p className="text-sm text-white/80 mb-6">Complimentary consultation, no commitment.</p>
        <Link
          href={`/escape/consultation?destination=${encodeURIComponent(destination.name)}`}
          className="inline-block bg-white text-[#2B4A3E] text-sm font-semibold px-8 py-3 rounded hover:bg-[#B8975C] hover:text-white transition-colors"
        >
          Start Planning
        </Link>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8B7A5E] mb-6">More Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((d: any) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
