import Link from 'next/link'

const wikiBrands = [
  { initial: 'C', name: 'Chanel',           detail: 'Fashion · France · 1910',       slug: 'chanel'            },
  { initial: 'H', name: 'Hermès',           detail: 'Leather · France · 1837',       slug: 'hermes'            },
  { initial: 'R', name: 'Rolex',            detail: 'Watches · Switzerland · 1905',   slug: 'rolex'             },
  { initial: 'L', name: 'Louis Vuitton',    detail: 'Fashion · France · 1854',       slug: 'louis-vuitton'     },
  { initial: 'G', name: 'Gucci',            detail: 'Fashion · Italy · 1921',        slug: 'gucci'             },
  { initial: 'D', name: 'Dior',             detail: 'Fashion · France · 1946',       slug: 'dior'              },
  { initial: 'C', name: 'Cartier',          detail: 'Jewellery · France · 1847',     slug: 'cartier'           },
  { initial: 'F', name: 'Ferrari',          detail: 'Automotive · Italy · 1947',     slug: 'ferrari'           },
  { initial: 'P', name: 'Prada',            detail: 'Fashion · Italy · 1913',        slug: 'prada'             },
  { initial: 'A', name: 'Aman Resorts',     detail: 'Hospitality · 1988',            slug: 'aman-resorts'      },
]

export function WikiLuxPreview() {
  return (
    <div>
      <div className="jl-section-label">
        <span>Brand Intelligence</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {wikiBrands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/wikilux/${brand.slug}`}
            className="inline-flex items-center gap-1.5 border border-[#e8e2d8] px-2.5 py-1.5 hover:border-[#a58e28] transition-colors group text-xs"
          >
            <div className="w-6 h-6 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#a58e28] transition-colors">
              <span className="font-serif text-xs text-[#a58e28] group-hover:text-[#1a1a1a]">
                {brand.initial}
              </span>
            </div>
            <div>
              <span className="font-sans text-xs font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">
                {brand.name}
              </span>
              <span className="font-sans text-[0.6rem] text-[#bbb] ml-1.5">{brand.detail}</span>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/wikilux" className="font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors">
        All 500+ maisons →
      </Link>
    </div>
  )
}
