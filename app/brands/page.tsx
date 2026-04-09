'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function getInitials(name: string) {
  const words = name.split(' ')
  if (words.length === 1) return name.slice(0, 2)
  return words.slice(0, 2).map((w: string) => w[0]).join('')
}

// Helper: extract a value from key_facts array
function getKeyFact(keyFacts: any[], label: string): string | null {
  if (!Array.isArray(keyFacts)) return null
  const found = keyFacts.find((f: any) => f.label?.toLowerCase() === label.toLowerCase())
  return found?.value || null
}

const CATEGORY_COLORS: Record<string, string> = {
  growth: '#4ade80',
  leadership: '#f59e0b',
  contraction: '#f87171',
  expansion: '#60a5fa',
  merger_acquisition: '#a78bfa',
}

const CATEGORY_LABELS: Record<string, string> = {
  growth: 'Growth',
  expansion: 'Expanding',
  leadership: 'Leadership move',
  contraction: 'Contraction',
  merger_acquisition: 'M&A activity',
}

export default function BrandsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [brands, setBrands] = useState<any[]>([])
  const [sectors, setSectors] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)
  const [brandStats, setBrandStats] = useState<{ total: number; published: number; languages: number }>({ total: 0, published: 0, languages: 9 })

  useEffect(() => {
    async function fetchBrands() {
      try {
        const { data } = await supabase
          .from('wikilux_content')
          .select('slug, brand_name, content, status')
          .eq('is_published', true)
          .is('deleted_at', null)
          .order('brand_name')

        if (!data) {
          setLoading(false)
          return
        }

        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

        const { data: signalsData } = await supabase
          .from('signals')
          .select('brand_tags, headline, what_happened, category, published_at')
          .eq('is_published', true)
          .gte('published_at', ninetyDaysAgo)
          .order('published_at', { ascending: false })

        const signalMap = new Map<string, { headline: string; what_happened: string | null; category: string }>()
        for (const sig of signalsData || []) {
          for (const tag of (sig.brand_tags || []) as string[]) {
            if (!signalMap.has(tag)) {
              signalMap.set(tag, {
                headline: sig.headline,
                what_happened: sig.what_happened,
                category: sig.category,
              })
            }
          }
        }

        const mapped = data.map((b: any) => {
          const content = b.content || {}
          const keyFacts = content.key_facts || []
          const stock = content.stock || {}
          const ownership = getKeyFact(keyFacts, 'Ownership') || stock.parent_group || ''

          const sig = signalMap.get(b.brand_name)
          let intel_line: string | null = null
          let signal_category: string | null = null

          if (sig) {
            signal_category = sig.category?.toLowerCase() || null
            const label = signal_category ? CATEGORY_LABELS[signal_category] : null
            const context = sig.headline || ''
            const clipped = context.length > 48 ? context.slice(0, 45) + '…' : context
            intel_line = label ? (clipped ? `${label} · ${clipped}` : label) : clipped
          }

          return {
            slug: b.slug,
            name: b.brand_name,
            parent_group: ownership,
            status: b.status,
            has_content: content && JSON.stringify(content) !== '{}',
            tagline: content.tagline || null,
            intel_line,
            signal_category,
          }
        })

        setBrands(mapped)

        // We don't have sector data in the DB content yet, so no sector filters for now
        // Once we add a sector field to the prompt, this will populate automatically
        setSectors(['All'])
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }
    fetchBrands()
    fetch('/api/brands/stats', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setBrandStats({ total: d.total || 0, published: d.published || 0, languages: d.languages || 9 }))
      .catch(() => {})
  }, [])

  const filtered = brands.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.slug.includes(search.toLowerCase())
    return matchesSearch
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
          Career intelligence across {brandStats.published}+ luxury brands. Salaries, culture, leadership, financial health.
        </p>

        {/* Search */}
        <div className="flex items-center gap-2 py-6 flex-wrap">
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white text-[#1a1a1a] text-base rounded-lg px-4 h-[48px] w-full max-w-lg outline-none"
          />
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
            {filtered.map((brand, idx) => (
              <div
                key={brand.slug}
                onClick={() => router.push(`/brands/${brand.slug}`)}
                className={`${idx < 4 ? 'bg-[#262626] border-[#383838]' : 'bg-[#212121] border-[#2a2a2a]'} border rounded-xl p-4 cursor-pointer transition-colors hover:border-[#3a3a3a]`}
              >
                {/* Top */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[11px] font-medium text-[#999] flex-shrink-0">
                    {getInitials(brand.name)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{brand.name}</div>
                    {brand.parent_group && (
                      <div className="text-[11px] text-[#999] mt-0.5">{brand.parent_group}</div>
                    )}
                  </div>
                </div>

                {brand.intel_line ? (
                  <div className="flex items-start gap-1.5 mt-1">
                    {brand.signal_category && CATEGORY_COLORS[brand.signal_category] && (
                      <span
                        className="mt-[3px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[brand.signal_category] }}
                      />
                    )}
                    <p className="text-[11px] leading-snug line-clamp-1" style={{ color: brand.signal_category && CATEGORY_COLORS[brand.signal_category] ? CATEGORY_COLORS[brand.signal_category] : '#999' }}>{brand.intel_line}</p>
                  </div>
                ) : brand.tagline ? (
                  <p className="text-[11px] text-[#777] leading-snug line-clamp-2">{brand.tagline}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
