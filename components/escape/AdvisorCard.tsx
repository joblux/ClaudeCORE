import Link from 'next/link'

interface Advisor {
  name: string
  photo_url?: string | null
  bases?: string[]
  min_budget_per_night?: string | null
}

export default function AdvisorCard({ advisor }: { advisor: Advisor }) {
  const initials = advisor.name.split(' ').map(n => n[0]).join('').slice(0, 2)
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#D4C9B4] px-4 py-3" style={{ background: '#FFFDF7' }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0" style={{ background: '#2B4A3E', color: '#B8975C' }}>
        {advisor.photo_url ? (
          <img src={advisor.photo_url} alt={advisor.name} className="w-10 h-10 rounded-full object-cover" />
        ) : initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: '#2B4A3E' }}>{advisor.name}</p>
        <p className="text-xs" style={{ color: '#8B7A5E' }}>
          {advisor.bases?.join(' · ')}{advisor.min_budget_per_night ? ` · From ${advisor.min_budget_per_night}/night` : ''}
        </p>
      </div>
      <Link href="/escape/consultation" className="text-xs font-medium flex-shrink-0 whitespace-nowrap hover:underline" style={{ color: '#2B4A3E' }}>
        Request consultation &gt;
      </Link>
    </div>
  )
}
