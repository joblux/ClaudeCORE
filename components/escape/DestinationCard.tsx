import Link from 'next/link'

interface Destination {
  slug: string
  name: string
  region?: string | null
  hero_image?: string | null
  description?: string | null
  experience_count?: number
}

interface DestinationCardProps {
  destination: Destination
  size?: 'small' | 'large'
}

export default function DestinationCard({ destination, size = 'small' }: DestinationCardProps) {
  const isLarge = size === 'large'
  return (
    <Link href={`/escape/${destination.slug}`} className="block group">
      <div
        className={`relative overflow-hidden rounded-lg ${isLarge ? 'h-[360px]' : 'h-[240px]'}`}
        style={{
          backgroundImage: destination.hero_image ? `url(${destination.hero_image})` : 'linear-gradient(135deg, #2B4A3E 0%, #5C5040 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className={`text-white font-semibold ${isLarge ? 'text-2xl' : 'text-lg'} group-hover:text-[#B8975C] transition-colors`}>
            {destination.name}
          </h3>
          {destination.region && (
            <p className="text-white/80 text-sm mt-0.5">{destination.region}</p>
          )}
          {(destination.experience_count ?? 0) > 0 && (
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
              {destination.experience_count} experiences
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
