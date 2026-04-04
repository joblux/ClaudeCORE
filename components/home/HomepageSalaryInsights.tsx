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
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48 }}>

          {/* Salary Intelligence */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff' }}>Salary intelligence</h2>
                <p style={{ marginTop: 6, color: '#989898', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
                  Verified benchmarks across functions, levels, and markets.
                </p>
              </div>
              <Link href="/careers" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
                Full data &rarr;
              </Link>
            </div>

            {salaries.length > 0 && (
              <div style={{ background: '#202020', border: '1px solid #2b2b2b', borderRadius: 16, overflow: 'hidden' }}>
                {salaries.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                      padding: '15px 18px', borderBottom: i < salaries.length - 1 ? '0.5px solid #2b2b2b' : 'none',
                      ...(i >= 2 ? { filter: 'blur(5px)', opacity: 0.4, userSelect: 'none', pointerEvents: 'none' as const } : {}),
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#fff', marginBottom: 3 }}>{s.job_title}</div>
                      <div style={{ fontSize: 11, color: '#6e6e6e' }}>{s.brand_name} &middot; {s.city}</div>
                    </div>
                    <div style={{ fontSize: '13.5px', color: '#a58e28', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {formatSalary(s.salary_min, s.salary_max, s.currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/contribute" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '0 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: '#2a2a2a', border: '1px solid #383838', color: 'rgba(255,255,255,0.88)', textDecoration: 'none' }}>
                Unlock full benchmarks
              </Link>
              <p style={{ fontSize: 12, color: '#6f6f6f' }}>Anonymous. Verified. 30 seconds.</p>
            </div>
          </div>

          {/* Latest Insights */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff' }}>Latest insights</h2>
                <p style={{ marginTop: 6, color: '#989898', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
                  Research, commentary, and analysis on the forces shaping careers.
                </p>
              </div>
              <Link href="/insights" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
                All insights &rarr;
              </Link>
            </div>

            {articles.map((article) => {
              const meta = article.read_time_minutes
                ? `${article.read_time_minutes} min read`
                : article.published_at
                  ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : ''

              return (
                <Link
                  key={article.slug}
                  href={`/insights/${article.slug}`}
                  style={{ display: 'block', background: '#202020', border: '1px solid #2b2b2b', borderRadius: 10, padding: 17, marginBottom: 12, textDecoration: 'none', transition: 'all 0.2s ease' }}
                >
                  {article.category && (
                    <div style={{ fontSize: 10, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#a58e28', fontWeight: 700, marginBottom: 8 }}>
                      {article.category}
                    </div>
                  )}
                  <div style={{ fontSize: '13.8px', lineHeight: 1.45, color: 'rgba(255,255,255,0.9)', marginBottom: 8 }}>
                    {article.title}
                  </div>
                  {meta && (
                    <div style={{ fontSize: 11, color: '#656565' }}>{meta}</div>
                  )}
                </Link>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
