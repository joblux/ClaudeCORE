import Link from 'next/link'
import type { Metadata } from 'next'
import { BRANDS } from '@/lib/wikilux-brands'

export const metadata: Metadata = {
  title:       'WikiLux — Luxury Brand Encyclopedia',
  description: `${BRANDS.length}+ luxury brand encyclopedias in 9 languages. Fashion, watches, jewellery, automotive, hospitality, beauty and more. By JOBLUX.`,
}

// Build categories from real data
const sectorLabels: Record<string, string> = {
  'Fashion': 'Fashion & Leather',
  'Watches & Jewellery': 'Watches & Jewellery',
  'Automotive': 'Automotive',
  'Hospitality': 'Hospitality & Travel',
  'Beauty & Fragrance': 'Beauty & Fragrance',
  'Spirits & Dining': 'Spirits & Fine Dining',
  'Aviation & Yachting': 'Aviation & Yachting',
  'Art & Culture': 'Art & Collectibles',
}

const sectorSlugs: Record<string, string> = {
  'Fashion': 'fashion',
  'Watches & Jewellery': 'watches-jewellery',
  'Automotive': 'automotive',
  'Hospitality': 'hospitality',
  'Beauty & Fragrance': 'beauty',
  'Spirits & Dining': 'spirits',
  'Aviation & Yachting': 'aviation',
  'Art & Culture': 'art',
}

const sectorCounts = BRANDS.reduce<Record<string, number>>((acc, b) => {
  acc[b.sector] = (acc[b.sector] || 0) + 1
  return acc
}, {})

const categories = Object.entries(sectorCounts).map(([sector, count]) => ({
  label: sectorLabels[sector] || sector,
  slug: sectorSlugs[sector] || sector.toLowerCase().replace(/\s+/g, '-'),
  count,
}))

const featuredBrands = BRANDS.slice(0, 6)

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
            {BRANDS.length}+ maisons &middot; 9 languages &middot; Fashion &middot; Watches &middot; Jewellery &middot; Automotive &middot; Hospitality &middot; Beauty
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { n: `${BRANDS.length}+`, l: 'Brands' },
              { n: '9',                 l: 'Languages' },
              { n: `${BRANDS.length * 30}+`, l: 'Pages' },
              { n: String(categories.length), l: 'Categories' },
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
                <span className="text-[#e8e2d8] group-hover:text-[#a58e28] transition-colors">&rarr;</span>
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
                    {brand.sector} &middot; {brand.country} &middot; Est. {brand.founded}
                  </div>
                  <div className="font-sans text-[0.6rem] text-[#a58e28] mt-1 tracking-wide">
                    EN &middot; FR &middot; AR &middot; ZH &middot; JA &middot; RU &middot; IT &middot; ES &middot; DE
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* A-Z NOTE */}
        <div className="text-center py-8 border-t border-[#e8e2d8]">
          <p className="font-sans text-sm text-[#888]">
            Full A&ndash;Z directory of {BRANDS.length}+ luxury brands available.
            <br />
            <Link href="/wikilux/all" className="text-[#a58e28] hover:underline">
              Browse all {BRANDS.length} maisons &rarr;
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
