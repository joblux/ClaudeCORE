import Link from 'next/link'

interface Advisor {
  name: string
  photo_url?: string | null
  bases?: string[]
  languages?: string[]
  specialties?: string[]
  travel_style?: string | null
  min_budget_per_night?: string | null
}

interface AdvisorCardProps {
  advisor: Advisor
  showCTA?: boolean
}

export default function AdvisorCard({ advisor, showCTA = true }: AdvisorCardProps) {
  const initials = advisor.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="bg-[#FFFDF7] border border-[#D4C9B4] rounded-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        {advisor.photo_url ? (
          <img src={advisor.photo_url} alt={advisor.name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#2B4A3E] text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
            {initials}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-[#2B4A3E]">{advisor.name}</h3>
          {advisor.bases && advisor.bases.length > 0 && (
            <p className="text-sm text-[#8B7A5E]">{advisor.bases.join(' · ')}</p>
          )}
          {advisor.languages && advisor.languages.length > 0 && (
            <p className="text-xs text-[#8B7A5E] mt-0.5">{advisor.languages.join(', ')}</p>
          )}
        </div>
      </div>

      {advisor.specialties && advisor.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {advisor.specialties.slice(0, 4).map((s) => (
            <span key={s} className="px-2.5 py-1 bg-[#2B4A3E]/10 text-[#2B4A3E] text-xs rounded-full">
              {s}
            </span>
          ))}
        </div>
      )}

      {advisor.travel_style && (
        <p className="text-sm text-[#5C5040] italic leading-relaxed mb-3">
          &ldquo;{advisor.travel_style}&rdquo;
        </p>
      )}

      {advisor.min_budget_per_night && (
        <p className="text-xs text-[#8B7A5E] mb-4">From {advisor.min_budget_per_night}/night</p>
      )}

      {showCTA && (
        <Link
          href="/escape/consultation"
          className="inline-block bg-[#2B4A3E] text-white text-sm font-medium px-6 py-2.5 rounded hover:bg-[#1d3a2e] transition-colors"
        >
          Start your consultation
        </Link>
      )}
    </div>
  )
}
