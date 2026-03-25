import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brands — JOBLUX',
  description: 'Explore 150+ luxury brands. Company profiles, career paths, culture, salary intelligence, and market signals.',
}

export default function BrandsPage() {
  return (
    <div className="bg-[#1a1a1a] min-h-[60vh] flex items-center justify-center px-7">
      <div className="text-center">
        <h1 className="text-[28px] text-white font-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Coming soon
        </h1>
        <p className="text-[13px] text-[#777] max-w-[360px] mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          WikiLux — 150+ luxury brand profiles with career paths, culture insights, salary data, and market signals. In 9 languages.
        </p>
      </div>
    </div>
  )
}
