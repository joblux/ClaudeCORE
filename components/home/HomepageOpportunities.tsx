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
            <h2 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff' }}>Confidential opportunities</h2>
            <p style={{ marginTop: 6, color: '#989898', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
              Selected assignments across retail, brand, commercial, and leadership functions.
            </p>
          </div>
          <Link href="/careers" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            View all careers &rarr;
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {assignments.slice(0, 3).map((a) => (
            <Link
              key={a.slug}
              href={`/careers/${a.slug}`}
              style={{ background: '#202020', border: '1px solid #2b2b2b', borderRadius: 10, padding: 21, transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', minHeight: 220, textDecoration: 'none' }}
            >
              {a.seniority && (
                <div style={{ fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, color: '#a58e28', marginBottom: 10 }}>
                  {a.seniority}
                </div>
              )}

              <div style={{ fontSize: 16, lineHeight: 1.35, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
                {a.title}
              </div>

              {a.description && (
                <div style={{ fontSize: '12.8px', lineHeight: 1.65, color: '#989898', marginBottom: 'auto' }}>
                  {a.description}
                </div>
              )}

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '0.5px solid #2b2b2b', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {a.location && (
                  <div style={{ fontSize: '11.5px', color: '#8d8d8d' }}>{a.location}</div>
                )}
                <div style={{ fontSize: '10.5px', color: '#777' }}>Brand disclosed after screening</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
