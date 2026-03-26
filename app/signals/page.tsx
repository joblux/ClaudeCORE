'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const categoryColors: Record<string, string> = {
  growth: '#4CAF50',
  leadership: '#FF9800',
  contraction: '#f44336',
  expansion: '#2196F3',
  merger_acquisition: '#9C27B0',
}

const categoryLabels: Record<string, string> = {
  growth: 'GROWTH',
  leadership: 'LEADERSHIP',
  contraction: 'CONTRACTION',
  expansion: 'EXPANSION',
  merger_acquisition: 'M&A',
}

const placeholderSignals = [
  {
    id: '1',
    category: 'leadership',
    headline: 'Kering appoints Matthieu Blazy as creative director of Chanel — leaves Bottega Veneta after 3 years',
    body: "The third creative director change at Bottega in five years. Blazy's departure to Chanel marks a rare cross-group move at this level. Expect a restructuring period at Bottega and potential leadership reshuffling at Kering's other houses.",
    brands: ['Kering', 'Bottega Veneta', 'Chanel'],
    sources: ['BoF', 'WWD'],
    confidence: 'High confidence',
    time_ago: '5h ago',
    is_pinned: false,
  },
  {
    id: '2',
    category: 'contraction',
    headline: 'Burberry confirms 400 role reductions across UK corporate offices',
    body: "Part of CEO Joshua Schulman's turnaround strategy. Retail and manufacturing roles are not affected — cuts focused on HQ functions. This is the second round; the first eliminated 150 roles in Q3 2025. If you're in Burberry corporate, negotiate retention packages now.",
    brands: ['Burberry'],
    sources: ['Reuters', 'FT'],
    confidence: 'High confidence',
    time_ago: '6h ago',
    is_pinned: false,
  },
  {
    id: '3',
    category: 'expansion',
    headline: 'Hermès opens 4 stores in Asia Pacific — Seoul flagship is largest in the region',
    body: 'Hermès now operates 340+ stores globally. The Asia expansion is driven by exceptional demand in South Korea and India. New stores mean 200+ retail and support roles across the four markets. Hermès rarely advertises these openings publicly — internal referrals are the primary channel.',
    brands: ['Hermès'],
    sources: ['Hermès press release'],
    confidence: 'High confidence',
    time_ago: '1d ago',
    is_pinned: false,
  },
  {
    id: '4',
    category: 'merger_acquisition',
    headline: 'Richemont reportedly exploring sale of YNAP online platform — focus returns to hard luxury',
    body: 'After years of losses, Richemont may finally exit e-commerce distribution. This signals deeper investment into Cartier, Van Cleef, and IWC direct retail. Digital and e-commerce roles at YNAP are at risk; hard luxury retail roles at Richemont maisons will expand.',
    brands: ['Richemont', 'Cartier', 'Van Cleef'],
    sources: ['Bloomberg', 'Reuters'],
    confidence: 'Medium confidence',
    time_ago: '2d ago',
    is_pinned: false,
  },
  {
    id: '5',
    category: 'growth',
    headline: 'Miu Miu posts +56% revenue growth — best performing luxury brand of 2025',
    body: 'Unprecedented growth driven by Gen Z appeal and strategic pricing below Prada mainline. Hiring across retail, buying, and communications globally. Prada Group is accelerating Miu Miu standalone positioning — expect more flagship openings in 2026.',
    brands: ['Miu Miu', 'Prada Group'],
    sources: ['Prada Group earnings'],
    confidence: 'High confidence',
    time_ago: '3d ago',
    is_pinned: false,
  },
]

const pinnedSignal = {
  headline: 'LVMH Q4 results reveal a tale of two luxury sectors',
  body: 'Watches & Jewelry surged +12% while Fashion & Leather grew only +3%. The divergence signals a shift in hiring priorities across the group — Tiffany, Bulgari, and TAG Heuer are expanding aggressively while Louis Vuitton and Dior hold steady. For candidates, the message is clear: hard luxury is the growth story of 2026.',
  brands: ['LVMH', 'Tiffany', 'Bulgari', 'TAG Heuer'],
  meta: 'Pinned March 24, 2026 · Source: LVMH investor relations',
}

const marketPulse = [
  { name: 'LVMH', change: '+2.3%', positive: true, width: 70 },
  { name: 'Kering', change: '-1.8%', positive: false, width: 30 },
  { name: 'Richemont', change: '+0.9%', positive: true, width: 45 },
  { name: 'Hermès', change: '+1.4%', positive: true, width: 55 },
  { name: 'Prada', change: '+3.1%', positive: true, width: 80 },
  { name: 'Burberry', change: '-2.6%', positive: false, width: 20 },
]

const trendingBrands = [
  { name: 'Miu Miu', reason: '+56% revenue, highest in sector' },
  { name: 'Bottega Veneta', reason: 'Creative director departure' },
  { name: 'Tiffany & Co.', reason: 'LVMH expansion push' },
  { name: 'Chanel', reason: 'Blazy appointment' },
]

const weekStats = [
  { num: 14, label: 'Growth', color: '#4CAF50' },
  { num: 6, label: 'Leadership', color: '#FF9800' },
  { num: 3, label: 'Cuts', color: '#f44336' },
  { num: 5, label: 'Expansion', color: '#2196F3' },
]

const filters = ['All signals', 'Growth', 'Leadership', 'Contraction', 'Expansion', 'M&A']

export default function SignalsPage() {
  const [activeFilter, setActiveFilter] = useState('All signals')
  const [signals, setSignals] = useState(placeholderSignals)

  useEffect(() => {
    async function fetchSignals() {
      const { data } = await supabase
        .from('signals')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(20)
      if (data && data.length > 0) setSignals(data)
    }
    fetchSignals()
  }, [])

  const filtered = signals.filter(s => {
    if (activeFilter === 'All signals') return true
    const map: Record<string, string> = {
      Growth: 'growth',
      Leadership: 'leadership',
      Contraction: 'contraction',
      Expansion: 'expansion',
      'M&A': 'merger_acquisition',
    }
    return s.category === map[activeFilter]
  })

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-8 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">

          {/* LEFT */}
          <div className="min-w-0">
            {/* Heading */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#4CAF50] flex-shrink-0" />
              <h1 className="text-3xl font-normal text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                Market signals
              </h1>
            </div>
            <p className="text-sm text-[#555] mb-6 leading-relaxed">
              Real-time intelligence across 150+ luxury brands. Leadership moves, financial shifts, hiring signals, expansion — verified and contextualized.
            </p>

            {/* Filters */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="rounded-full px-4 py-1.5 text-xs transition-colors"
                  style={{
                    border: activeFilter === f ? '1px solid #a58e28' : '1px solid #2e2e2e',
                    color: activeFilter === f ? '#a58e28' : '#666',
                    background: 'transparent',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Pinned */}
            <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 mb-4">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[#a58e28] text-xs">↑</span>
                <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">PINNED BY EDITORIAL</span>
              </div>
              <h2 className="text-lg font-medium text-white mb-3 leading-snug" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                {pinnedSignal.headline}
              </h2>
              <p className="text-sm text-[#777] leading-relaxed mb-4">{pinnedSignal.body}</p>
              <div className="flex gap-2 flex-wrap mb-3">
                {pinnedSignal.brands.map(b => (
                  <span key={b} className="text-[11px] px-2 py-0.5 rounded bg-[#2a2a2a] text-[#a58e28]">{b}</span>
                ))}
              </div>
              <p className="text-[11px] text-[#444]">{pinnedSignal.meta}</p>
            </div>

            {/* Signal feed */}
            <div>
              {filtered.map(signal => {
                const color = categoryColors[signal.category] || '#888'
                const label = categoryLabels[signal.category] || signal.category.toUpperCase()
                return (
                  <div key={signal.id} className="border-b border-[#222] py-5 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="text-[11px] font-semibold tracking-[1.5px]" style={{ color }}>{label}</span>
                      </div>
                      <span className="text-[11px] text-[#444]">{signal.confidence}</span>
                    </div>
                    <h3 className="text-[15px] font-medium text-[#e0e0e0] mb-2 leading-snug hover:text-white cursor-pointer">
                      {signal.headline}
                    </h3>
                    <p className="text-sm text-[#666] leading-relaxed mb-3">{signal.body}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {(signal.brands || []).map((b: string) => (
                          <span key={b} className="text-[11px] px-2 py-0.5 rounded bg-[#2a2a2a] text-[#a58e28]">{b}</span>
                        ))}
                        {(signal.sources || []).map((s: string) => (
                          <span key={s} className="text-[11px] text-[#3a3a3a]">{s}</span>
                        ))}
                      </div>
                      <span className="text-[11px] text-[#444] flex-shrink-0 ml-4">{signal.time_ago}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-8">

            {/* Market Pulse */}
            <div>
              <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">MARKET PULSE</p>
              <div className="space-y-3">
                {marketPulse.map(p => (
                  <div key={p.name} className="flex items-center gap-2">
                    <span className="text-sm text-[#888] w-24 flex-shrink-0">{p.name}</span>
                    <span className="text-sm font-medium w-12 text-right flex-shrink-0" style={{ color: p.positive ? '#4CAF50' : '#f44336' }}>
                      {p.change}
                    </span>
                    <div className="flex-1 h-[3px] bg-[#2a2a2a] rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.width}%`, background: p.positive ? '#4CAF50' : '#f44336' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Brands */}
            <div>
              <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">TRENDING BRANDS</p>
              <div className="space-y-3">
                {trendingBrands.map(b => (
                  <div key={b.name}>
                    <p className="text-sm text-[#ccc]">{b.name}</p>
                    <p className="text-[11px] text-[#444] mt-0.5">{b.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Signals this week */}
            <div>
              <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">SIGNALS THIS WEEK</p>
              <div className="grid grid-cols-4 gap-2">
                {weekStats.map(w => (
                  <div key={w.label} className="text-center">
                    <div className="text-2xl font-normal mb-1" style={{ color: w.color }}>{w.num}</div>
                    <div className="text-[10px] text-[#555]">{w.label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
