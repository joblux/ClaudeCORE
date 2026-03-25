import Link from 'next/link'

interface Salary {
  id: string
  job_title: string
  brand_name: string
  city: string
  currency: string
  salary_min: number
  salary_max: number
}

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string | null
  category: string | null
  published_at: string | null
}

const placeholderSalaries: Salary[] = [
  { id: '1', job_title: 'Store Director', brand_name: 'Louis Vuitton', city: 'Paris', currency: 'EUR', salary_min: 85000, salary_max: 120000 },
  { id: '2', job_title: 'CRM Manager', brand_name: 'Cartier', city: 'London', currency: 'GBP', salary_min: 55000, salary_max: 75000 },
  { id: '3', job_title: 'Buyer — RTW', brand_name: 'Hermès', city: 'Paris', currency: 'EUR', salary_min: 60000, salary_max: 85000 },
  { id: '4', job_title: 'Visual Merchandiser', brand_name: 'Dior', city: 'Milan', currency: 'EUR', salary_min: 42000, salary_max: 58000 },
  { id: '5', job_title: 'E-Commerce Director', brand_name: 'Gucci', city: 'London', currency: 'GBP', salary_min: 95000, salary_max: 140000 },
]

const placeholderArticles: Article[] = [
  { id: '1', slug: 'luxury-salary-trends-2026', title: 'Luxury salary trends: what changed in 2026', excerpt: 'A deep dive into compensation shifts across fashion, jewelry, and hospitality sectors.', category: 'Report', published_at: '2026-03-20' },
  { id: '2', slug: 'kering-leadership-shakeup', title: 'What Kering\'s leadership shakeup means for careers', excerpt: 'New CEO at Gucci signals a strategic pivot. Here\'s what it means for talent.', category: 'Analysis', published_at: '2026-03-18' },
  { id: '3', slug: 'asia-pacific-luxury-hiring', title: 'Asia-Pacific luxury hiring is accelerating', excerpt: 'APAC expansion is creating unprecedented demand for senior retail and CRM talent.', category: 'Insight', published_at: '2026-03-15' },
]

function formatSalary(min: number, max: number, currency: string): string {
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
  const fmtMin = Math.round(min / 1000)
  const fmtMax = Math.round(max / 1000)
  return `${symbol}${fmtMin}K – ${symbol}${fmtMax}K`
}

export function HomepageSalaryInsights({ salaries, articles }: { salaries: Salary[]; articles: Article[] }) {
  const salaryItems = salaries.length > 0 ? salaries : placeholderSalaries
  const articleItems = articles.length > 0 ? articles : placeholderArticles

  return (
    <section className="px-7 py-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left: Salary Intelligence */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[22px] text-white font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                Salary intelligence
              </h2>
              <Link href="/careers" className="text-[12px] text-[#a58e28] hover:text-[#e4b042] transition-colors">
                Full data →
              </Link>
            </div>

            <div className="relative">
              {salaryItems.slice(0, 5).map((salary, index) => (
                <div
                  key={salary.id}
                  className={`flex items-start justify-between py-3 border-b border-[#2a2a2a] ${
                    index >= 2 ? 'select-none' : ''
                  }`}
                  style={index >= 2 ? { filter: `blur(${index === 2 ? 2 : index === 3 ? 4 : 6}px)`, opacity: index === 2 ? 0.7 : index === 3 ? 0.4 : 0.2 } : {}}
                >
                  <div>
                    <div className="text-[14px] text-white" style={{ fontFamily: 'Inter, sans-serif' }}>{salary.job_title}</div>
                    <div className="text-[12px] text-[#888]" style={{ fontFamily: 'Inter, sans-serif' }}>{salary.brand_name} · {salary.city}</div>
                  </div>
                  <div className="text-[14px] text-[#a58e28] font-medium flex-shrink-0 ml-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formatSalary(salary.salary_min, salary.salary_max, salary.currency)}
                  </div>
                </div>
              ))}

              {/* Gradient overlay for blurred rows */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none" />
            </div>

            <div className="mt-6">
              <Link
                href="/careers"
                className="inline-block border border-[#a58e28] text-[#a58e28] text-[11px] tracking-wide px-5 py-2.5 rounded-[3px] hover:bg-[#a58e28] hover:text-[#1a1a1a] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Contribute your salary to unlock all data
              </Link>
              <p className="text-[12px] text-[#555] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Anonymous. Verified. 30 seconds.
              </p>
            </div>
          </div>

          {/* Right: Latest Insights */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[22px] text-white font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                Latest insights
              </h2>
              <Link href="/insights" className="text-[12px] text-[#a58e28] hover:text-[#e4b042] transition-colors">
                All insights →
              </Link>
            </div>

            <div className="space-y-4">
              {articleItems.slice(0, 3).map((article) => (
                <Link
                  key={article.id}
                  href={`/bloglux/${article.slug}`}
                  className="block bg-[#222] border border-[#2a2a2a] rounded-[6px] p-4 hover:border-[#333] transition-colors group"
                >
                  {article.category && (
                    <div className="text-[10px] text-[#a58e28] uppercase tracking-wide mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {article.category}
                    </div>
                  )}
                  <div className="text-[14px] text-white font-medium mb-1.5 group-hover:text-[#a58e28] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {article.title}
                  </div>
                  {article.excerpt && (
                    <p className="text-[12px] text-[#888] leading-relaxed line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {article.excerpt}
                    </p>
                  )}
                  {article.published_at && (
                    <div className="text-[11px] text-[#555] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
