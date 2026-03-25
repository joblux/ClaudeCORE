import Link from 'next/link'

interface Assignment {
  id: string
  slug: string
  title: string
  description: string | null
  seniority: string | null
  location: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
}

const placeholderAssignments: Assignment[] = [
  {
    id: '1', slug: 'retail-director-paris', title: 'Retail Director — Flagship Operations',
    description: 'Lead the retail strategy for a prestigious Parisian maison across their European flagship network. You will oversee 12 boutiques and report directly to the CEO.',
    seniority: 'Director', location: 'Paris, France', salary_min: 120000, salary_max: 160000, salary_currency: 'EUR',
  },
  {
    id: '2', slug: 'vp-marketing-london', title: 'VP of Marketing — Global Brand',
    description: 'Shape the global marketing direction for a top-tier luxury group. This is a board-level hire that will define the brand\'s next chapter in digital and experiential.',
    seniority: 'VP', location: 'London, UK', salary_min: 150000, salary_max: 200000, salary_currency: 'GBP',
  },
  {
    id: '3', slug: 'merchandising-manager-milan', title: 'Merchandising Manager — Leather Goods',
    description: 'Join the buying and merchandising team of an iconic Italian house. You will manage a €30M category across wholesale and retail channels.',
    seniority: 'Manager', location: 'Milan, Italy', salary_min: 65000, salary_max: 90000, salary_currency: 'EUR',
  },
]

function formatSalary(min: number | null, max: number | null, currency: string | null): string {
  if (!min || !max) return ''
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
  const fmtMin = Math.round(min / 1000)
  const fmtMax = Math.round(max / 1000)
  return `${symbol}${fmtMin}K – ${symbol}${fmtMax}K`
}

export function HomepageOpportunities({ assignments }: { assignments: Assignment[] }) {
  const items = assignments.length > 0 ? assignments : placeholderAssignments

  return (
    <section className="px-7 py-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[22px] text-white font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
            Confidential opportunities
          </h2>
          <Link href="/careers" className="text-[12px] text-[#a58e28] hover:text-[#e4b042] transition-colors">
            View all careers →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.slice(0, 3).map((assignment) => (
            <Link
              key={assignment.id}
              href={assignment.slug ? `/opportunities/${assignment.slug}` : '/careers'}
              className="bg-[#222] border border-[#2a2a2a] rounded-[6px] p-5 hover:border-[#333] transition-colors group flex flex-col"
            >
              {assignment.seniority && (
                <div className="text-[10px] text-[#a58e28] uppercase tracking-wide font-semibold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {assignment.seniority}
                </div>
              )}

              <h3 className="text-[15px] text-white font-medium mb-2 group-hover:text-[#a58e28] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                {assignment.title}
              </h3>

              {assignment.description && (
                <p className="text-[13px] text-[#888] leading-relaxed mb-4 line-clamp-3 flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {assignment.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#2a2a2a]">
                {assignment.location && (
                  <span className="text-[12px] text-[#666]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {assignment.location}
                  </span>
                )}
                {assignment.salary_min && assignment.salary_max && (
                  <span className="text-[13px] text-[#a58e28] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formatSalary(assignment.salary_min, assignment.salary_max, assignment.salary_currency)}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#555] italic mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                Confidential — brand disclosed after screening
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
