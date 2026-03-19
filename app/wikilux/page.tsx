import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'WikiLux — Luxury Brand Encyclopedia',
  description: '500+ luxury brand encyclopedias in 9 languages. Fashion, watches, jewellery, automotive, hospitality, beauty and more. By JOBLUX.',
}

const categories = [
  { label: 'Fashion & Leather',    slug: 'fashion',      count: 120 },
  { label: 'Watches',              slug: 'watches',      count: 60  },
  { label: 'Jewellery',            slug: 'jewellery',    count: 40  },
  { label: 'Automotive',           slug: 'automotive',   count: 25  },
  { label: 'Hospitality',          slug: 'hospitality',  count: 50  },
  { label: 'Beauty & Fragrance',   slug: 'beauty',       count: 60  },
  { label: 'Spirits & Fine Dining',slug: 'spirits',      count: 40  },
  { label: 'Aviation & Yachting',  slug: 'aviation',     count: 20  },
  { label: 'Retail',               slug: 'retail',       count: 20  },
  { label: 'Real Estate',          slug: 'real-estate',  count: 15  },
  { label: 'Art & Collectibles',   slug: 'art',          count: 20  },
  { label: 'Education',            slug: 'education',    count: 10  },
]

const featuredBrands = [
  { name: 'Chanel',        country: 'France',      sector: 'Fashion',    founded: 1910, slug: 'chanel'        },
  { name: 'Hermès',        country: 'France',      sector: 'Leather',    founded: 1837, slug: 'hermes'        },
  { name: 'Rolex',         country: 'Switzerland', sector: 'Watches',    founded: 1905, slug: 'rolex'         },
  { name: 'Ferrari',       country: 'Italy',       sector: 'Automotive', founded: 1947, slug: 'ferrari'       },
  { name: 'Louis Vuitton', country: 'France',      sector: 'Fashion',    founded: 1854, slug: 'louis-vuitton' },
  { name: 'Cartier',       country: 'France',      sector: 'Jewellery',  founded: 1847, slug: 'cartier'       },
]

export default function WikiLuxPage() {
  return (
    <div>
      {/* HERO */}
      <div className="bg-[#222222] py-14">
        <div className="jl-container-sm text-center">
          <div className="jl-overline-gold mb-4">WikiLux by JOBLUX</div>
          <h1 className="jl-serif text-4xl md:text-5xl font-light text-white mb-4">
            The Luxury Brand Encyclopedia
          </h1>
          <p className="font-sans text-sm text-[#888] mb-8 max-w-lg mx-auto">
            500+ maisons · 9 languages · Fashion · Watches · Jewellery · Automotive · Hospitality · Beauty
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { n: '500+', l: 'Brands'    },
              { n: '9',    l: 'Languages' },
              { n: '4,500',l: 'Pages'     },
              { n: '12',   l: 'Categories'},
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="jl-serif text-2xl font-light text-[#a58e28]">{s.n}</div>
                <div className="jl-overline mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="jl-container py-10">

        {/* SEARCH */}
        <div className="mb-10 text-center">
          <div className="jl-search mx-auto" style={{ maxWidth: 480 }}>
            <input type="text" placeholder="Search brands — Chanel, Rolex, Aman..." />
            <button>Search</button>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="mb-10">
          <div className="jl-section-label"><span>Browse by Category</span></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/wikilux?category=${cat.slug}`}
                className="jl-card flex items-center justify-between group"
              >
                <div>
                  <div className="font-sans text-xs font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">
                    {cat.label}
                  </div>
                  <div className="font-sans text-[0.65rem] text-[#aaa] mt-0.5">{cat.count} brands</div>
                </div>
                <span className="text-[#e8e2d8] group-hover:text-[#a58e28] transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* FEATURED BRANDS */}
        <div className="mb-10">
          <div className="jl-section-label"><span>Featured Maisons</span></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredBrands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/wikilux/${brand.slug}`}
                className="jl-card flex items-start gap-4 group"
              >
                <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#a58e28] transition-colors">
                  <span className="jl-serif text-base text-[#a58e28] group-hover:text-[#1a1a1a]">
                    {brand.name[0]}
                  </span>
                </div>
                <div>
                  <div className="font-sans text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">
                    {brand.name}
                  </div>
                  <div className="font-sans text-[0.65rem] text-[#aaa] mt-0.5">
                    {brand.sector} · {brand.country} · Est. {brand.founded}
                  </div>
                  <div className="font-sans text-[0.6rem] text-[#a58e28] mt-1 tracking-wide">
                    EN · FR · AR · ZH · JA · RU · IT · ES · DE
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* A-Z NOTE */}
        <div className="text-center py-8 border-t border-[#e8e2d8]">
          <p className="font-sans text-sm text-[#888]">
            Full A–Z directory of 500+ luxury brands available.
            <br />
            <Link href="/wikilux/all" className="text-[#a58e28] hover:underline">
              Browse all maisons →
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
