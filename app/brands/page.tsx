'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BRANDS } from '@/lib/wikilux-brands'

const signalColors: Record<string, string> = {
  growth: '#4CAF50',
  leadership: '#FF9800',
  contraction: '#f44336',
  expansion: '#2196F3',
  merger_acquisition: '#9C27B0',
}

// Map BRANDS array to the card shape the listing expects
const allBrands = BRANDS.map((b, i) => ({
  id: String(i + 1),
  name: b.name,
  slug: b.slug,
  parent_group: b.group,
  sectors: b.known_for ? b.known_for.split(',').slice(0, 3).map(s => s.trim()) : [b.sector],
  is_hiring: false,
  revenue_change: null as string | null,
  signal_label: null as string | null,
  signal_color: 'growth',
  extra: null as string | null,
}))

// Collect unique sectors from all brands for filter pills
const sectorSet = new Set<string>()
BRANDS.forEach(b => sectorSet.add(b.sector))
const sectors = ['All', ...Array.from(sectorSet).sort()]

function getInitials(name: string) {
  const words = name.split(' ')
  if (words.length === 1) return name.slice(0, 2)
  return words.slice(0, 2).map((w: string) => w[0]).join('')
}

export default function BrandsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = allBrands.filter(b => {
    const matchesSector = activeFilter === 'All' || b.sectors.some(s => s.toLowerCase().includes(activeFilter.toLowerCase())) || BRANDS.find(br => br.slug === b.slug)?.sector === activeFilter
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.slug.includes(search.toLowerCase())
    return matchesSector && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-8 pt-12 pb-16">

        {/* WikiLux badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-6 bg-[#a58e28]" />
          <span className="text-[10px] font-semibold tracking-[2.5px] text-[#a58e28]">WIKILUX</span>
          <div className="h-px w-6 bg-[#a58e28]" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-normal text-white mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Brand intelligence
        </h1>
        <p className="text-sm text-[#999] mb-7">
          Career intelligence across 150+ luxury brands. Salaries, culture, leadership, financial health — in 9 languages.
        </p>

        {/* Search + Filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white text-[#1a1a1a] text-sm rounded-lg px-3 h-[42px] w-[220px] outline-none flex-shrink-0"
          />
          {sectors.map(s => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className="h-[42px] px-5 rounded-full text-sm transition-colors whitespace-nowrap"
              style={{
                border: activeFilter === s ? '1px solid #a58e28' : '1px solid #333',
                color: activeFilter === s ? '#a58e28' : '#777',
                background: 'transparent',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-6">
          {[[String(BRANDS.length), 'brands'], [String(sectorSet.size), 'sectors'], ['9', 'languages']].map(([n, l]) => (
            <span key={l} className="text-xs">
              <span className="text-[#999]">{n}</span>
              <span className="text-[#999]"> {l}</span>
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filtered.map(brand => {
            const staticBrand = BRANDS.find(b => b.slug === brand.slug)
            const color = brand.signal_label ? (signalColors[brand.signal_color] || '#4CAF50') : '#555'
            return (
              <div
                key={brand.id}
                onClick={() => router.push(`/brands/${brand.slug}`)}
                className="bg-[#212121] border border-[#2a2a2a] rounded-xl p-4 cursor-pointer transition-colors hover:border-[#3a3a3a]"
              >
                {/* Top */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[11px] font-medium text-[#999] flex-shrink-0">
                    {getInitials(brand.name)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#e0e0e0]">{brand.name}</div>
                    <div className="text-[11px] text-[#999] mt-0.5">{brand.parent_group}</div>
                  </div>
                </div>

                {/* Sectors */}
                <div className="text-[11px] text-[#4a4a4a] mb-3">
                  {brand.sectors.join(' · ')}
                </div>

                {/* Sector pill */}
                <div className="flex items-center gap-3 flex-wrap">
                  {staticBrand && (
                    <span className="text-[11px] text-[#555]">{staticBrand.sector}</span>
                  )}
                  {brand.signal_label && (
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: color }} />
                      <span style={{ color }}>{brand.signal_label}</span>
                    </span>
                  )}
                  {brand.revenue_change && (
                    <span className="text-[11px]" style={{ color }}>{brand.revenue_change}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
