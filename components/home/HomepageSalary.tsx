import Link from 'next/link'

interface Salary {
  job_title: string
  brand_name: string
  city: string
  country: string | null
  currency: string
  salary_min: number
  salary_max: number
}

function formatSalary(min: number, max: number, currency: string): string {
  const symbol = currency === 'EUR' ? '\u20ac' : currency === 'GBP' ? '\u00a3' : '$'
  const fmtMin = Math.round(min / 1000)
  const fmtMax = Math.round(max / 1000)
  return `${symbol}${fmtMin}K \u2013 ${symbol}${fmtMax}K`
}

export function HomepageSalary({ salaries }: { salaries: Salary[] }) {
  if (salaries.length === 0) return null

  return (
    <section style={{ padding: '44px 0', borderTop: '0.5px solid #2b2b2b' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, color: '#fff' }}>
              Salary Intelligence
            </div>
            <p style={{ marginTop: 6, color: '#bbb', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
              Contributed salary intelligence from luxury professionals.
            </p>
          </div>
          <Link href="/contribute" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Contribute your salary &rarr;
          </Link>
        </div>

        {salaries.map((s, i) => (
          <div
            key={`${s.job_title}-${s.brand_name}-${s.city}-${i}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 160px 130px',
              gap: 16,
              padding: '10px 0',
              borderBottom: '0.5px solid #1e1e1e',
            }}
          >
            <div>
              <div style={{ fontSize: '13.5px', color: '#ccc', marginBottom: 3 }}>{s.job_title}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{s.brand_name}</div>
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {s.country ? `${s.city}, ${s.country}` : s.city}
            </div>
            <div style={{ fontSize: '13.5px', color: '#a58e28', fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }}>
              {formatSalary(s.salary_min, s.salary_max, s.currency)}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 16 }}>
          <Link href="/careers?tab=salaries" style={{ fontSize: 12, color: '#a58e28', textDecoration: 'none' }}>
            Browse full intelligence &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
