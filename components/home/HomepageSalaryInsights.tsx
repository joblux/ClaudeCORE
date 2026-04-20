import Link from 'next/link'

interface Salary {
  job_title: string
  brand_name: string
  city: string
  salary_min: number
  salary_max: number
  currency: string
}

interface Article {
  slug: string
  title: string
  category: string | null
  read_time_minutes: number | null
  published_at: string | null
  cover_image_url: string | null
}

function formatDate(d: string | null): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatSalary(min: number, max: number, currency: string): string {
  const symbol = currency === 'EUR' ? '\u20ac' : currency === 'GBP' ? '\u00a3' : '$'
  const fmtMin = Math.round(min / 1000)
  const fmtMax = Math.round(max / 1000)
  return `${symbol}${fmtMin}K \u2013 ${symbol}${fmtMax}K`
}

export function HomepageSalaryInsights({ salaries, articles }: { salaries: Salary[]; articles: Article[] }) {
  return (
    <section style={{ padding: '44px 0', borderTop: '0.5px solid #2b2b2b' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
          <strong style={{ color: '#fff', fontSize: 14 }}>7,076 salary records</strong>
          {' '}&mdash; verified across functions, levels, and markets.
          <Link href="/careers?tab=salaries" style={{ float: 'right', fontSize: 12, color: '#a58e28', textDecoration: 'none' }}>
            Full data &rarr;
          </Link>
        </div>

        {salaries.length > 0 && (
          <div>
            {salaries.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 160px 130px', gap: 16,
                  padding: '10px 0', borderBottom: '0.5px solid #1e1e1e',
                  ...(i >= 3 ? { filter: 'blur(5px)', opacity: 0.4, userSelect: 'none', pointerEvents: 'none' as const } : {}),
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', color: '#ccc', marginBottom: 3 }}>{s.job_title}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{s.brand_name}</div>
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>{s.city}</div>
                <div style={{ fontSize: '13.5px', color: '#a58e28', fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {formatSalary(s.salary_min, s.salary_max, s.currency)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/careers?tab=salaries" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '0 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: '#2a2a2a', border: '1px solid #383838', color: 'rgba(255,255,255,0.88)', textDecoration: 'none' }}>
            Unlock full benchmarks
          </Link>
          <p style={{ fontSize: 12, color: '#888' }}>Anonymous. Verified. 30 seconds.</p>
        </div>

        {articles.length > 0 && (
          <div style={{ marginTop: 40 }}>
            {/* Eyebrow + All link (mirrors /insights LATEST INTELLIGENCE framing + salary block CTA pattern) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '1.5px', color: '#777', textTransform: 'uppercase' }}>
                Latest Insights
              </span>
              <div style={{ flex: 1, height: 1, background: '#222' }} />
              <Link href="/insights" style={{ fontSize: 12, color: '#a58e28', textDecoration: 'none' }}>
                All insights &rarr;
              </Link>
            </div>

            {/* 3-card grid (mirrors /insights latest-intelligence pattern) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {articles.map(article => (
                <Link key={article.slug} href={`/insights/${article.slug}`} className="group cursor-pointer">
                  <div className="bg-[#222] border border-[#2a2a2a] rounded-lg h-44 mb-3 overflow-hidden relative">
                    {article.cover_image_url && (
                      <img
                        src={article.cover_image_url}
                        alt={article.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  {article.category && (
                    <div className="text-[10px] font-semibold tracking-[1.5px] text-[#a58e28] mb-1 uppercase">
                      {article.category}
                    </div>
                  )}
                  <h3
                    className="text-sm font-normal text-[#e0e0e0] leading-snug mb-2 group-hover:text-white transition-colors"
                    style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                  >
                    {article.title}
                  </h3>
                  <div className="flex gap-2 text-[11px] text-[#999]">
                    {article.published_at && <span>{formatDate(article.published_at)}</span>}
                    {article.published_at && article.read_time_minutes && <span>&middot;</span>}
                    {article.read_time_minutes && <span>{article.read_time_minutes} min read</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
