import Link from 'next/link'

const latestJobs = [
  { maison: 'French Leather Maison', title: 'Store Director',      city: 'Paris · France',   badge: 'Confidential' },
  { maison: 'Swiss Watch Group',     title: 'Regional Director',   city: 'Dubai · UAE',      badge: 'Senior'       },
  { maison: 'LVMH Group Brand',      title: 'HR Director APAC',    city: 'Singapore',        badge: 'Executive'    },
  { maison: 'Italian Fashion House', title: 'Buying Director RTW', city: 'Milan · Italy',    badge: 'Confidential' },
]

export function LatestJobs() {
  return (
    <div>
      <div className="jl-section-label">
        <span>Confidential Positions</span>
      </div>
      <div className="space-y-0">
        {latestJobs.map((job, i) => (
          <div key={i} className="py-3 border-b border-[#f5f0e8] last:border-0">
            <div className="jl-overline-gold mb-1">{job.maison}</div>
            <div className="jl-serif text-sm text-[#1a1a1a] mb-1">{job.title}</div>
            <div className="flex items-center justify-between">
              <div className="font-sans text-[0.65rem] text-[#aaa]">{job.city}</div>
              <span className="jl-badge text-[0.55rem]">{job.badge}</span>
            </div>
          </div>
        ))}
      </div>
      <Link href="/opportunities" className="inline-block mt-3 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors">
        All opportunities →
      </Link>
    </div>
  )
}
