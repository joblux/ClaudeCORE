import Link from 'next/link'

// ── SALARY SNAPSHOT ────────────────────────────────────
const salaryData = [
  { role: 'Store Director',   city: 'Paris Flagship', range: '€95–130K', change: '+6%'  },
  { role: 'Buying Director',  city: 'RTW · Paris',    range: '€80–110K', change: '+8%'  },
  { role: 'Regional Director',city: 'Dubai',          range: 'AED 350K', change: '+11%' },
  { role: 'HR Director',      city: 'Group Level',    range: '€110–150K',change: '+9%'  },
  { role: 'Client Advisor',   city: 'Flagship Paris', range: '€32–45K',  change: '+5%'  },
]

export function SalarySnapshot() {
  return (
    <div>
      <div className="jl-section-label">
        <span>Salary Snapshot · Q1 2026</span>
      </div>

      <div className="space-y-0">
        {salaryData.map((item) => (
          <div
            key={item.role}
            className="flex items-center justify-between py-2.5 border-b border-[#f5f0e8] last:border-0"
          >
            <div>
              <div className="font-sans text-xs font-medium text-[#1a1a1a]">{item.role}</div>
              <div className="font-sans text-[0.65rem] text-[#aaa] mt-0.5">{item.city}</div>
            </div>
            <div className="text-right">
              <div className="font-sans text-xs font-semibold text-[#1a1a1a]">{item.range}</div>
              <div className="font-sans text-[0.65rem] text-green-600 mt-0.5">{item.change}</div>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/salaries"
        className="inline-block mt-3 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors"
      >
        Full salary guide →
      </Link>
    </div>
  )
}

// ── LATEST JOBS ────────────────────────────────────────
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

      <Link
        href="/jobs"
        className="inline-block mt-3 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors"
      >
        All positions →
      </Link>
    </div>
  )
}

// ── WIKILUX PREVIEW ────────────────────────────────────
const wikiBrands = [
  { initial: 'C', name: 'Chanel',       detail: 'Fashion · France · Est. 1910',      slug: 'chanel'        },
  { initial: 'H', name: 'Hermès',       detail: 'Leather Goods · France · Est. 1837',slug: 'hermes'        },
  { initial: 'R', name: 'Rolex',        detail: 'Watches · Switzerland · Est. 1905', slug: 'rolex'         },
  { initial: 'F', name: 'Ferrari',      detail: 'Automotive · Italy · Est. 1947',    slug: 'ferrari'       },
  { initial: 'A', name: 'Aman Resorts', detail: 'Hospitality · Est. 1988',           slug: 'aman-resorts'  },
]

export function WikiLuxPreview() {
  return (
    <div>
      <div className="jl-section-label">
        <span>WikiLux — Brand Intelligence</span>
      </div>

      <div className="space-y-0">
        {wikiBrands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/wikilux/${brand.slug}`}
            className="flex items-center gap-3 py-2.5 border-b border-[#f5f0e8] last:border-0 group"
          >
            <div className="w-8 h-8 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#a58e28] transition-colors">
              <span className="jl-serif text-sm text-[#a58e28] group-hover:text-[#1a1a1a]">
                {brand.initial}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-sans text-xs font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">
                {brand.name}
              </div>
              <div className="font-sans text-[0.65rem] text-[#aaa] truncate">{brand.detail}</div>
            </div>
            <span className="text-[#e8e2d8] group-hover:text-[#a58e28] transition-colors text-sm">→</span>
          </Link>
        ))}
      </div>

      <Link
        href="/wikilux"
        className="inline-block mt-3 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors"
      >
        All 500+ maisons →
      </Link>
    </div>
  )
}
