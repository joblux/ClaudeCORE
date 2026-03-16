import Link from 'next/link'

const wikiBrands = [
  { initial: 'C', name: 'Chanel',       detail: 'Fashion · France · Est. 1910',       slug: 'chanel'       },
  { initial: 'H', name: 'Hermès',       detail: 'Leather Goods · France · Est. 1837', slug: 'hermes'       },
  { initial: 'R', name: 'Rolex',        detail: 'Watches · Switzerland · Est. 1905',  slug: 'rolex'        },
  { initial: 'F', name: 'Ferrari',      detail: 'Automotive · Italy · Est. 1947',     slug: 'ferrari'      },
  { initial: 'A', name: 'Aman Resorts', detail: 'Hospitality · Est. 1988',            slug: 'aman-resorts' },
]

export function WikiLuxPreview() {
  return (
    <div>
      <div className="jl-section-label">
        <span>WikiLux — Brand Intelligence</span>
      </div>
      <div className="space-y-0">
        {wikiBrands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/wikilux/${brand.slug}`}
            className="flex items-center gap-3 py-2.5 border-b border-[#f5f0e8] last:border-0 group"
          >
            <div className="w-8 h-8 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#c8960c] transition-colors">
              <span className="jl-serif text-sm text-[#c8960c] group-hover:text-[#1a1a1a]">
                {brand.initial}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-sans text-xs font-medium text-[#1a1a1a] group-hover:text-[#c8960c] transition-colors">
                {brand.name}
              </div>
              <div className="font-sans text-[0.65rem] text-[#aaa] truncate">{brand.detail}</div>
            </div>
            <span className="text-[#e8e2d8] group-hover:text-[#c8960c] transition-colors text-sm">→</span>
          </Link>
        ))}
      </div>
      <Link href="/wikilux" className="inline-block mt-3 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#c8960c] hover:text-[#9a6f0a] transition-colors">
        All 500+ maisons →
      </Link>
    </div>
  )
}
