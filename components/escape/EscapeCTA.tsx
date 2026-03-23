import Link from 'next/link'

interface EscapeCTAProps {
  variant?: 'strip' | 'card' | 'inline'
}

export default function EscapeCTA({ variant = 'strip' }: EscapeCTAProps) {
  if (variant === 'card') {
    return (
      <div className="bg-[#FDF8EE] border border-[#D4C9B4] rounded-lg p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#2B4A3E] mb-2">Private Travel Advisory</p>
        <h3 className="text-lg font-semibold text-[#2B4A3E] mb-2">Your next escape</h3>
        <p className="text-sm text-[#5C5040] leading-relaxed mb-4">
          Curated travel intelligence from seasoned advisors.
        </p>
        <Link
          href="/escape"
          className="inline-block bg-[#2B4A3E] text-white text-sm font-medium px-5 py-2 rounded hover:bg-[#1d3a2e] transition-colors"
        >
          Explore
        </Link>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <Link href="/escape/consultation" className="text-sm text-[#2B4A3E] font-medium hover:text-[#1d3a2e] transition-colors">
        Plan your escape →
      </Link>
    )
  }

  // strip (default)
  return (
    <div className="bg-[#2B4A3E] py-12 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-light text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Your next escape, designed for you.
        </h2>
        <p className="text-sm text-white/80 leading-relaxed mb-6 max-w-xl mx-auto">
          A seasoned travel advisor will craft your perfect itinerary — from boutique hotels to cultural discoveries. Complimentary consultation, no commitment.
        </p>
        <Link
          href="/escape/consultation"
          className="inline-block bg-white text-[#2B4A3E] text-sm font-semibold px-8 py-3 rounded hover:bg-[#B8975C] hover:text-white transition-colors"
        >
          Plan Your Escape
        </Link>
      </div>
    </div>
  )
}
