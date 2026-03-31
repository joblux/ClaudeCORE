'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const signalColors: Record<string, string> = {
  growth: '#4CAF50',
  leadership: '#FF9800',
  contraction: '#f44336',
  expansion: '#2196F3',
  merger_acquisition: '#9C27B0',
}

const placeholderBrands = [
  { id: '1', name: 'Hermès', slug: 'hermes', parent_group: 'Independent', sectors: ['Leather goods', 'Fashion', 'Watches'], is_hiring: true, revenue_change: '+18%', signal_label: 'Hiring', signal_color: 'growth', extra: '4 new stores' },
  { id: '2', name: 'Cartier', slug: 'cartier', parent_group: 'Richemont', sectors: ['Jewelry', 'Watches'], is_hiring: true, revenue_change: '+9%', signal_label: 'Hiring', signal_color: 'growth', extra: null },
  { id: '3', name: 'Gucci', slug: 'gucci', parent_group: 'Kering', sectors: ['Fashion', 'Leather goods'], is_hiring: false, revenue_change: '-6%', signal_label: 'New CD', signal_color: 'leadership', extra: null },
  { id: '4', name: 'Louis Vuitton', slug: 'louis-vuitton', parent_group: 'LVMH', sectors: ['Fashion', 'Leather goods'], is_hiring: true, revenue_change: '+4%', signal_label: 'Stable', signal_color: 'growth', extra: null },
  { id: '5', name: 'Chanel', slug: 'chanel', parent_group: 'Independent (private)', sectors: ['Fashion', 'Beauty', 'Jewelry'], is_hiring: false, revenue_change: null, signal_label: 'Expanding', signal_color: 'expansion', extra: null },
  { id: '6', name: 'Rolex', slug: 'rolex', parent_group: 'Independent (private)', sectors: ['Watches'], is_hiring: false, revenue_change: null, signal_label: 'Stable', signal_color: 'growth', extra: null },
  { id: '7', name: 'Dior', slug: 'dior', parent_group: 'LVMH', sectors: ['Fashion', 'Beauty'], is_hiring: true, revenue_change: '+11%', signal_label: 'Hiring', signal_color: 'growth', extra: null },
  { id: '8', name: 'Burberry', slug: 'burberry', parent_group: 'Independent', sectors: ['Fashion'], is_hiring: false, revenue_change: '-14%', signal_label: '-400 roles', signal_color: 'contraction', extra: null },
  { id: '9', name: 'Prada', slug: 'prada', parent_group: 'Prada Group', sectors: ['Fashion', 'Leather goods'], is_hiring: true, revenue_change: '+8%', signal_label: 'Hiring', signal_color: 'growth', extra: null },
  { id: '10', name: 'Bottega Veneta', slug: 'bottega-veneta', parent_group: 'Kering', sectors: ['Fashion', 'Leather goods'], is_hiring: false, revenue_change: null, signal_label: 'Stable', signal_color: 'growth', extra: null },
  { id: '11', name: 'Saint Laurent', slug: 'saint-laurent', parent_group: 'Kering', sectors: ['Fashion'], is_hiring: true, revenue_change: null, signal_label: 'Hiring', signal_color: 'growth', extra: null },
  { id: '12', name: 'Chloé', slug: 'chloe', parent_group: 'Richemont', sectors: ['Fashion'], is_hiring: false, revenue_change: null, signal_label: 'New CD', signal_color: 'leadership', extra: null },
]

const sectors = ['All', 'Fashion', 'Jewelry', 'Watches', 'Beauty', 'Hospitality', 'Automotive', 'Spirits & Wine']

function getInitials(name: string) {
  const words = name.split(' ')
  if (words.length === 1) return name.slice(0, 2)
  return words.slice(0, 2).map((w: string) => w[0]).join('')
}

export default function BrandsPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<any[]>(placeholderBrands)
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchBrands() {
      const { data } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true })
      if (data && data.length > 0) setBrands(data)
    }
    fetchBrands()
  }, [])

  const filtered = brands.filter(b => {
    const matchesSector = activeFilter === 'All' || (b.sectors && b.sectors.includes(activeFilter))
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase())
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
          {[['154', 'brands'], ['12', 'sectors'], ['9', 'languages'], ['47', 'hiring now'], ['8', 'new signals today']].map(([n, l]) => (
            <span key={l} className="text-xs">
              <span className="text-[#999]">{n}</span>
              <span className="text-[#999]"> {l}</span>
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filtered.map(brand => {
            const color = signalColors[brand.signal_color] || '#4CAF50'
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
                  {(brand.sectors || []).join(' · ')}
                </div>

                {/* Indicators */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: color }} />
                    <span style={{ color }}>{brand.signal_label}</span>
                  </span>
                  {brand.revenue_change && (
                    <span className="text-[11px]" style={{ color }}>{brand.revenue_change}</span>
                  )}
                  {brand.extra && (
                    <span className="text-[11px]" style={{ color }}>{brand.extra}</span>
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
