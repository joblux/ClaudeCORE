import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { BRANDS } from '@/lib/wikilux-brands'
import { WIKILUX_CATEGORY_ICONS } from '@/lib/sector-icons'

export const metadata: Metadata = {
  title: 'WikiLux — Luxury Brand Encyclopedia | JOBLUX',
  description: `${BRANDS.length}+ luxury brand encyclopedias. Fashion, watches, jewellery, automotive, hospitality, beauty and more. By JOBLUX.`,
  openGraph: {
    title: 'WikiLux — The Luxury Encyclopedia',
    description: `${BRANDS.length}+ luxury brand profiles with hiring intelligence, salary data and interview insights.`,
    images: [{ url: 'https://www.luxuryrecruiter.com/api/og?title=WikiLux&subtitle=The+Luxury+Encyclopedia&type=brand', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WikiLux — The Luxury Encyclopedia | JOBLUX',
    description: `${BRANDS.length}+ luxury brand profiles with hiring intelligence.`,
    images: ['https://www.luxuryrecruiter.com/api/og?title=WikiLux&subtitle=The+Luxury+Encyclopedia&type=brand'],
  },
}

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
  sector,
  label: sectorLabels[sector] || sector,
  slug: sectorSlugs[sector] || sector.toLowerCase().replace(/\s+/g, '-'),
  count,
  icon: WIKILUX_CATEGORY_ICONS[sector],
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
            {BRANDS.length}+ maisons &middot; Fashion &middot; Watches &middot; Jewellery &middot; Automotive &middot; Hospitality &middot; Beauty
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { n: `${BRANDS.length}+`, l: 'Brands' },
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
                href={`/wikilux/all?sector=${cat.slug}`}
                className="jl-card flex items-center gap-3 group"
              >
                {cat.icon && (
                  <div className="w-8 h-8 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Image src={cat.icon} alt={cat.label} width={32} height={32} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
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
                    {brand.sector} &middot; {brand.country}
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
