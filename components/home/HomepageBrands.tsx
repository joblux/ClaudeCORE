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
            <div style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, color: '#fff' }}>
              Brand Intelligence &mdash; 180+ luxury brands
            </div>
            <p style={{ marginTop: 6, color: '#bbb', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
              Profiles, market context, and hiring signals across leading houses and groups.
            </p>
          </div>
          <Link href="/brands" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Explore 180+ brands &rarr;
          </Link>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginTop: 14 }}>
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              style={{
                fontSize: 13,
                color: '#888',
                paddingRight: 16,
                marginRight: 16,
                borderRight: '0.5px solid #2a2a2a',
                whiteSpace: 'nowrap',
                lineHeight: 2,
                textDecoration: 'none',
              }}
            >
              {brand.brand_name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
