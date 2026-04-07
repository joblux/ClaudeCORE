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

export function HomepageSalaryInsights({ salaries }: { salaries: Salary[]; articles: Article[] }) {
  return (
    <section style={{ padding: '44px 0', borderTop: '0.5px solid #2b2b2b' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, color: '#fff', marginBottom: 8 }}>
              Live Salary Benchmarks
            </div>
            <h2 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff' }}>Salary intelligence</h2>
            <p style={{ marginTop: 6, color: '#bbb', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
              Verified benchmarks across functions, levels, and markets.
            </p>
          </div>
          <Link href="/careers?tab=salaries" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Full data &rarr;
          </Link>
        </div>

        {salaries.length > 0 && (
          <div>
            {salaries.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  padding: '10px 0', borderBottom: '0.5px solid #1e1e1e',
                  ...(i >= 3 ? { filter: 'blur(5px)', opacity: 0.4, userSelect: 'none', pointerEvents: 'none' as const } : {}),
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', color: '#ccc', marginBottom: 3 }}>{s.job_title}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{s.brand_name} &middot; {s.city}</div>
                </div>
                <div style={{ fontSize: '13.5px', color: '#a58e28', fontWeight: 600, whiteSpace: 'nowrap' }}>
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
      </div>
    </section>
  )
}
