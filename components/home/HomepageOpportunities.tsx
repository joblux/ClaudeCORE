import Link from 'next/link'

interface Assignment {
  slug: string
  title: string
  description: string | null
  location: string | null
  seniority: string | null
}

export function HomepageOpportunities({ assignments }: { assignments: Assignment[] }) {
  if (assignments.length === 0) return null

  return (
    <section style={{ padding: '44px 0', borderTop: '0.5px solid #2b2b2b' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, color: '#fff' }}>
              Opportunities
            </div>
            <p style={{ marginTop: 6, color: '#bbb', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
              Selected assignments across retail, brand, and leadership functions.
            </p>
          </div>
          <Link href="/careers" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            View all careers &rarr;
          </Link>
        </div>
        {assignments.slice(0, 3).map((a) => (
          <Link
            key={a.slug}
            href={`/careers/${a.slug}`}
            style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px', gap: 16, alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid #2b2b2b', textDecoration: 'none' }}
          >
            <div style={{ fontSize: '13.5px', color: '#ccc' }}>{a.title}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{a.location || ''}</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#a58e28', textAlign: 'right' }}>{a.seniority || ''}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
