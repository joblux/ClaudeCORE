import Link from 'next/link'

interface Brand {
  id: string
  slug: string
  brand_name: string
  content: Record<string, unknown> | null
}

const placeholderBrands = [
  { id: '1', slug: 'hermes', brand_name: 'Hermès', parent: 'Hermès International', sector: 'Fashion & Leather', indicator: null },
  { id: '2', slug: 'louis-vuitton', brand_name: 'Louis Vuitton', parent: 'LVMH', sector: 'Fashion & Leather', indicator: null },
  { id: '3', slug: 'cartier', brand_name: 'Cartier', parent: 'Richemont', sector: 'Jewelry & Watches', indicator: null },
  { id: '4', slug: 'chanel', brand_name: 'Chanel', parent: 'Chanel Limited', sector: 'Fashion & Beauty', indicator: null },
  { id: '5', slug: 'gucci', brand_name: 'Gucci', parent: 'Kering', sector: 'Fashion & Leather', indicator: null },
  { id: '6', slug: 'dior', brand_name: 'Dior', parent: 'LVMH', sector: 'Fashion & Beauty', indicator: null },
  { id: '7', slug: 'burberry', brand_name: 'Burberry', parent: 'Burberry Group', sector: 'Fashion', indicator: null },
  { id: '8', slug: 'tiffany-co', brand_name: 'Tiffany & Co.', parent: 'LVMH', sector: 'Jewelry', indicator: null },
]

export function HomepageBrands({ brands }: { brands: Brand[] }) {
  const items = brands.length > 0
    ? brands.map((b) => {
        const c = (b.content || {}) as Record<string, unknown>
        return {
          id: b.id,
          slug: b.slug,
          brand_name: b.brand_name,
          parent: (c.parent_company as string) || '',
          sector: (c.sector as string) || '',
          indicator: null as { label: string; color: string } | null,
        }
      })
    : placeholderBrands

  return (
    <section className="px-7 py-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[22px] text-white font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
            Brand intelligence
          </h2>
          <Link href="/brands" className="text-[12px] text-[#a58e28] hover:text-[#e4b042] transition-colors">
            Explore 179 brands →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.slice(0, 8).map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="bg-[#222] border border-[#2a2a2a] rounded-[6px] p-5 text-center hover:border-[#333] transition-colors group"
            >
              {/* Circle initials */}
              <div className="w-12 h-12 rounded-full bg-[#333] border border-[#444] flex items-center justify-center mx-auto mb-3">
                <span className="text-[#888] text-[14px] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {brand.brand_name.substring(0, 2).toUpperCase()}
                </span>
              </div>

              <div className="text-[14px] text-white font-medium mb-1 group-hover:text-[#a58e28] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                {brand.brand_name}
              </div>

              {brand.parent && (
                <div className="text-[12px] text-[#888] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {brand.parent}
                </div>
              )}

              {brand.sector && (
                <div className="text-[10px] text-[#555] uppercase mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {brand.sector}
                </div>
              )}

              {brand.indicator && (
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: brand.indicator.color }} />
                  <span className="text-[11px]" style={{ color: brand.indicator.color, fontFamily: 'Inter, sans-serif' }}>
                    {brand.indicator.label}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
