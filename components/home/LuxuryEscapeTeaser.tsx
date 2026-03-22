import Link from 'next/link'

const destinations = [
  {
    name: 'The Aman Tokyo Experience',
    description: 'Where minimalism meets Japanese luxury tradition',
  },
  {
    name: 'Lake Como — Beyond the Boutiques',
    description: 'Villa stays and private experiences for industry insiders',
  },
  {
    name: 'Marrakech for Maison Leaders',
    description: 'Riads, retreats, and creative inspiration',
  },
]

export function LuxuryEscapeTeaser() {
  return (
    <div>
      <div className="jl-section-label">
        <span>Private Travel Advisory</span>
      </div>

      <p className="font-sans text-xs text-[#888] leading-relaxed mb-4">
        Bespoke travel design for luxury industry executives. Hotels, private experiences, and itineraries arranged with the same discretion as our recruitment services.
      </p>

      <div className="space-y-0">
        {destinations.map((dest) => (
          <div
            key={dest.name}
            className="py-3 border-b border-[#f5f0e8] last:border-0"
          >
            <div className="font-sans text-xs font-medium text-[#1a1a1a] mb-0.5">
              {dest.name}
            </div>
            <div className="font-sans text-[0.65rem] text-[#aaa]">
              {dest.description}
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/services/travel"
        className="inline-block mt-3 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors"
      >
        Arrange private travel →
      </Link>
    </div>
  )
}
