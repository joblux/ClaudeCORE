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

export default function BrandsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [brands, setBrands] = useState<any[]>([])
  const [sectors, setSectors] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBrands() {
      try {
        const { data } = await supabase
          .from('wikilux_content')
          .select('slug, brand_name, content, status')
          .order('brand_name')

        if (!data) {
          setLoading(false)
          return
        }

        const mapped = data.map((b: any) => {
          const content = b.content || {}
          const keyFacts = content.key_facts || []
          const stock = content.stock || {}
          const ownership = getKeyFact(keyFacts, 'Ownership') || stock.parent_group || ''

          return {
            slug: b.slug,
            name: b.brand_name,
            parent_group: ownership,
            status: b.status,
            has_content: content && JSON.stringify(content) !== '{}',
            tagline: content.tagline || null,
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
          Career intelligence across {brands.length}+ luxury brands. Salaries, culture, leadership, financial health — in 9 languages.
        </p>

        {/* Search */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white text-[#1a1a1a] text-sm rounded-lg px-3 h-[42px] w-[220px] outline-none flex-shrink-0"
          />
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-6">
          <span className="text-xs">
            <span className="text-[#999]">{brands.length}</span>
            <span className="text-[#999]"> brands</span>
          </span>
          <span className="text-xs">
            <span className="text-[#999]">{brands.filter(b => b.status === 'approved' && b.has_content).length}</span>
            <span className="text-[#999]"> published</span>
          </span>
          <span className="text-xs">
            <span className="text-[#999]">9</span>
            <span className="text-[#999]"> languages</span>
          </span>
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
              <div
                key={brand.slug}
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
                    {brand.parent_group && (
                      <div className="text-[11px] text-[#999] mt-0.5">{brand.parent_group}</div>
                    )}
                  </div>
                </div>

                {/* Tagline */}
                {brand.tagline && (
                  <p className="text-[11px] text-[#555] leading-relaxed line-clamp-2">{brand.tagline}</p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
