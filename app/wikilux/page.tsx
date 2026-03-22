import Link from 'next/link'
import type { Metadata } from 'next'
import { BRANDS } from '@/lib/wikilux-brands'
import { WIKILUX_CATEGORY_ICONS } from '@/lib/sector-icons'
import WikiLuxSearch from './WikiLuxSearch'

export const metadata: Metadata = {
  title: 'WikiLux — 500+ Luxury Maisons Directory | JOBLUX',
  description: 'Explore career intelligence, salary data, and interview insights for over 500 luxury brands including LVMH, Kering, Richemont, Hermès, Chanel and more.',
  alternates: { canonical: 'https://www.joblux.com/wikilux' },
  openGraph: {
    title: 'WikiLux | JOBLUX',
    description: 'The definitive directory of luxury maisons. Career intelligence for 500+ brands.',
    images: ['/api/og?title=WikiLux&subtitle=500%2B+Luxury+Maisons&type=wikilux'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WikiLux — The Luxury Encyclopedia | JOBLUX',
    description: 'The definitive directory of luxury maisons. Career intelligence for 500+ brands.',
    images: ['/api/og?title=WikiLux&subtitle=500%2B+Luxury+Maisons&type=wikilux'],
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

        <WikiLuxSearch brands={BRANDS} categories={categories} />

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
