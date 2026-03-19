import Link from 'next/link'

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
