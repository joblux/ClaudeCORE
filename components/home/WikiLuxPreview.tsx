import Link from 'next/link'

const wikiBrands = [
  { initial: 'C', name: 'Chanel',        slug: 'chanel'        },
  { initial: 'H', name: 'Hermès',        slug: 'hermes'        },
  { initial: 'R', name: 'Rolex',         slug: 'rolex'         },
  { initial: 'L', name: 'Louis Vuitton', slug: 'louis-vuitton'  },
  { initial: 'G', name: 'Gucci',         slug: 'gucci'         },
  { initial: 'D', name: 'Dior',          slug: 'dior'          },
  { initial: 'C', name: 'Cartier',       slug: 'cartier'       },
  { initial: 'F', name: 'Ferrari',       slug: 'ferrari'       },
  { initial: 'P', name: 'Prada',         slug: 'prada'         },
  { initial: 'A', name: 'Aman',          slug: 'aman'          },
]

export function WikiLuxPreview() {
  return (
    <div>
      <div className="jl-section-label"><span>Brand Intelligence</span></div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {wikiBrands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/brands/${brand.slug}`}
            className="inline-flex items-center gap-1 border border-[#e8e2d8] px-2 py-1 hover:border-[#a58e28] transition-colors group"
          >
            <span className="w-5 h-5 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#a58e28] transition-colors">
              <span className="font-serif text-[0.6rem] text-[#a58e28] group-hover:text-[#1a1a1a]">{brand.initial}</span>
            </span>
            <span className="font-sans text-[0.7rem] font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">{brand.name}</span>
          </Link>
        ))}
      </div>
      <Link href="/brands" className="font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors">
        All 179 brands →
      </Link>
    </div>
  )
}
