import Link from 'next/link'

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
            <h2 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff' }}>Brands</h2>
            <p style={{ marginTop: 6, color: '#bbb', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
              Profiles, market context, and hiring signals across leading houses and groups.
            </p>
          </div>
          <Link href="/brands" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Explore 180+ brands &rarr;
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 8 }}>
          {brands.map((brand) => {
            const initials = brand.brand_name.substring(0, 2).toUpperCase()
            return (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                style={{ background: '#1e1e1e', border: '0.5px solid #2b2b2b', borderRadius: 6, padding: '10px 8px', textAlign: 'center', display: 'block', textDecoration: 'none' }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: 11, color: '#888', fontWeight: 600 }}>
                  {initials}
                </div>
                <div style={{ fontSize: 10, color: '#888', lineHeight: 1.3 }}>
                  {brand.brand_name}
                </div>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', margin: '4px auto 0' }} />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
