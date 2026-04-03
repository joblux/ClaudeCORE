import Link from 'next/link'

const categoryColors: Record<string, string> = {
  growth: '#4CAF50',
  leadership: '#FF9800',
  contraction: '#f44336',
  expansion: '#2196F3',
  merger_acquisition: '#9C27B0',
}

const signalLabels: Record<string, string> = {
  growth: 'Active signal',
  expansion: 'Active signal',
  leadership: 'Leadership shift',
  contraction: 'Contraction',
  merger_acquisition: 'Strategic move',
}

interface Brand {
  slug: string
  brand_name: string
  tagline: string
  parent_group: string
  latest_signal: string
}

export function HomepageBrands({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null

  return (
    <section style={{ padding: '44px 0', borderTop: '0.5px solid #2b2b2b' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff' }}>Brand intelligence</h2>
            <p style={{ marginTop: 6, color: '#989898', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
              Profiles, market context, and hiring signals across leading houses and groups.
            </p>
          </div>
          <Link href="/brands" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Explore 179 brands &rarr;
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {brands.map((brand) => {
            const color = categoryColors[brand.latest_signal] || '#888'
            const label = signalLabels[brand.latest_signal] || 'Active signal'
            const initials = brand.brand_name.substring(0, 2).toUpperCase()
            const sector = [brand.tagline, brand.parent_group].filter(Boolean).join(' \u00b7 ')

            return (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                style={{ background: '#202020', border: '1px solid #2b2b2b', borderRadius: 10, padding: '20px 15px', textAlign: 'center', transition: 'all 0.2s ease', textDecoration: 'none', display: 'block' }}
              >
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#2a2a2a', border: '1px solid #353535', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 13px', fontSize: 13, color: '#9b9b9b', fontWeight: 600, letterSpacing: '0.5px' }}>
                  {initials}
                </div>

                <div style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: 5, color: '#fff' }}>
                  {brand.brand_name}
                </div>

                <div style={{ fontSize: 11, color: '#707070', lineHeight: 1.5, minHeight: 32 }}>
                  {sector}
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, fontSize: 10, color: '#8a8a8a' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  {label}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
