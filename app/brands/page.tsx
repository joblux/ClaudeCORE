'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORY_COLORS: Record<string, string> = {
  growth: '#4CAF50',
  expansion: '#2196F3',
  leadership: '#FF9800',
  contraction: '#f44336',
  merger_acquisition: '#9C27B0',
}

const SECTOR_FILTERS = ['All', 'Fashion', 'Jewelry', 'Watches', 'Beauty', 'Hospitality', 'Automotive', 'Spirits & Wine', 'Art & Culture']

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '')
}

export default function BrandsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, sectors: 0, growth: 0, today: 0 })

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase
          .from('wikilux_content')
          .select('slug, brand_name, content, status, sectors')
          .eq('is_published', true)
          .is('deleted_at', null)
          .order('brand_name')

        if (!data) { setLoading(false); return }

        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

        const { data: signalsData } = await supabase
          .from('signals')
          .select('brand_tags, what_happened, category, published_at')
          .eq('is_published', true)
          .gte('published_at', ninetyDaysAgo)
          .order('published_at', { ascending: false })

        // Build signal map: brand name -> most recent signal
        const signalMap = new Map<string, { what_happened: string | null; category: string; published_at: string }>()
        const normalizedMap = new Map<string, { what_happened: string | null; category: string; published_at: string }>()

        for (const sig of signalsData || []) {
          for (const tag of (sig.brand_tags || []) as string[]) {
            const lower = tag.toLowerCase()
            if (!signalMap.has(lower)) {
              signalMap.set(lower, {
                what_happened: sig.what_happened,
                category: sig.category,
                published_at: sig.published_at,
              })
            }
            const norm = normalize(tag)
            if (!normalizedMap.has(norm)) {
              normalizedMap.set(norm, {
                what_happened: sig.what_happened,
                category: sig.category,
                published_at: sig.published_at,
              })
            }
          }
        }

        // Compute stats
        const todayStart = new Date()
        todayStart.setUTCHours(0, 0, 0, 0)
        const todayISO = todayStart.toISOString()

        const allSectors = new Set<string>()
        let growthCount = 0
        let todayCount = 0

        const mapped = data.map((b: any) => {
          const content = b.content || {}
          const keyFacts = content.key_facts || []
          const stock = content.stock || {}
          const name = b.name || b.brand_name || ''
          const parentGroup = b.parent_group || b.group_name || getKeyFact(keyFacts, 'Ownership') || stock.parent_group || ''
          const sectors: string[] = Array.isArray(b.sectors) ? b.sectors : (b.sector ? [b.sector] : [])

          sectors.forEach(s => allSectors.add(s))

          // Signal matching: exact case-insensitive first, then normalized fallback
          const sig = signalMap.get(name.toLowerCase()) || normalizedMap.get(normalize(name)) || null

          if (sig) {
            const cat = sig.category?.toLowerCase()
            if (cat === 'growth' || cat === 'expansion') growthCount++
            if (sig.published_at >= todayISO) todayCount++
          }

          return {
            slug: b.slug,
            name,
            sectors,
            parentGroup,
            signal: sig ? {
              what_happened: sig.what_happened,
              category: sig.category?.toLowerCase() || '',
              published_at: sig.published_at,
            } : null,
          }
        })

        // Sort: brands with signal first (by published_at desc), rest alphabetical
        mapped.sort((a: any, b: any) => {
          if (a.signal && !b.signal) return -1
          if (!a.signal && b.signal) return 1
          if (a.signal && b.signal) {
            return b.signal.published_at.localeCompare(a.signal.published_at)
          }
          return a.name.localeCompare(b.name)
        })

        setBrands(mapped)
        setStats({
          total: data.length,
          sectors: allSectors.size,
          growth: growthCount,
          today: todayCount,
        })
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = brands.filter(b => {
    const q = search.toLowerCase()
    const matchesSearch = b.name.toLowerCase().includes(q) || b.slug.includes(q)
    const matchesSector = activeFilter === 'All' || b.sectors.some((s: string) => s === activeFilter)
    return matchesSearch && matchesSector
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
        <p className="text-[13px] text-[#999] mb-3">
          Career intelligence across {stats.total}+ luxury brands. Salaries, culture, leadership, financial health.
        </p>

        {/* Stats bar */}
        <p className="text-[12px] text-[#777] mb-5">
          {stats.total} brands &middot; {stats.sectors} sectors &middot; {stats.growth} active growth signals &middot; {stats.today} new signals today
        </p>

        {/* Search + filter pills */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#222] border border-[#2a2a2a] text-white placeholder-[#555] rounded-lg px-4 h-10 w-[260px] outline-none text-sm"
          />
          {SECTOR_FILTERS.map(sector => {
            const active = activeFilter === sector
            return (
              <button
                key={sector}
                onClick={() => setActiveFilter(sector)}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? 'border-[#a58e28] text-[#1a1a1a] bg-[#a58e28]'
                    : 'border-[#2a2a2a] text-[#999]'
                }`}
              >
                {sector.toLowerCase()}
              </button>
            )
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-5 h-5 border-2 border-[#2a2a2a] border-t-[#a58e28] rounded-full animate-spin" />
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filtered.map(brand => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="bg-[#222] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#333] transition-colors min-h-[160px] flex flex-col justify-between"
              >
                {/* Top row */}
                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#2a2a2a] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-[13px] font-semibold text-[#a58e28]">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-white leading-tight">{brand.name}</div>
                      {brand.parentGroup && (
                        <div className="text-[11px] text-[#777] mt-0.5">{brand.parentGroup}</div>
                      )}
                    </div>
                  </div>

                  {/* Sectors */}
                  {brand.sectors.length > 0 && (
                    <div className="text-[11px] text-[#666] mt-3">
                      {brand.sectors.slice(0, 3).join(' \u00B7 ')}
                    </div>
                  )}
                </div>

                {/* Signal row */}
                <div className="mt-auto pt-3">
                  {brand.signal ? (
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[brand.signal.category] || '#777' }}
                      />
                      <span
                        className="text-[11px] truncate"
                        style={{ color: CATEGORY_COLORS[brand.signal.category] || '#777' }}
                      >
                        {brand.signal.what_happened
                          ? brand.signal.what_happened.length > 42
                            ? brand.signal.what_happened.slice(0, 39).trimEnd() + '...'
                            : brand.signal.what_happened
                          : 'No recent signal'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#444]">No recent signal</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function getKeyFact(keyFacts: any[], label: string): string | null {
  if (!Array.isArray(keyFacts)) return null
  const found = keyFacts.find((f: any) => f.label?.toLowerCase() === label.toLowerCase())
  return found?.value || null
}
