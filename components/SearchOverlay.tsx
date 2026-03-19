'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type Category = 'All' | 'Jobs' | 'WikiLux' | 'Salaries' | 'Coaching'

interface SearchItem {
  category: 'Jobs' | 'WikiLux' | 'Salaries' | 'Coaching'
  title: string
  href: string
}

const searchData: SearchItem[] = [
  // Jobs
  { category: 'Jobs', title: 'Store Director Paris', href: '/jobs?q=store-director-paris' },
  { category: 'Jobs', title: 'Regional Director Dubai', href: '/jobs?q=regional-director-dubai' },
  { category: 'Jobs', title: 'HR Director Singapore', href: '/jobs?q=hr-director-singapore' },
  { category: 'Jobs', title: 'Buying Director Milan', href: '/jobs?q=buying-director-milan' },
  { category: 'Jobs', title: 'Country Manager London', href: '/jobs?q=country-manager-london' },
  // WikiLux
  { category: 'WikiLux', title: 'Chanel', href: '/wikilux/chanel' },
  { category: 'WikiLux', title: 'Herm\u00e8s', href: '/wikilux/hermes' },
  { category: 'WikiLux', title: 'Rolex', href: '/wikilux/rolex' },
  { category: 'WikiLux', title: 'Louis Vuitton', href: '/wikilux/louis-vuitton' },
  { category: 'WikiLux', title: 'Cartier', href: '/wikilux/cartier' },
  { category: 'WikiLux', title: 'Ferrari', href: '/wikilux/ferrari' },
  { category: 'WikiLux', title: 'LVMH', href: '/wikilux/lvmh' },
  { category: 'WikiLux', title: 'Richemont', href: '/wikilux/richemont' },
  { category: 'WikiLux', title: 'Kering', href: '/wikilux/kering' },
  // Salaries
  { category: 'Salaries', title: 'Store Director \u20ac95\u2013130K', href: '/coaching#salaries' },
  { category: 'Salaries', title: 'Buying Director \u20ac80\u2013110K', href: '/coaching#salaries' },
  { category: 'Salaries', title: 'Regional Director AED 350K', href: '/coaching#salaries' },
  // Coaching
  { category: 'Coaching', title: 'Herm\u00e8s Interview Guide', href: '/coaching' },
  { category: 'Coaching', title: 'LVMH Career Guide', href: '/coaching' },
  { category: 'Coaching', title: 'Luxury CV Writing', href: '/coaching' },
  { category: 'Coaching', title: 'Salary Negotiation', href: '/coaching' },
]

const filters: Category[] = ['All', 'Jobs', 'WikiLux', 'Salaries', 'Coaching']

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<Category>('All')
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveFilter('All')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    return searchData.filter((item) => {
      if (activeFilter !== 'All' && item.category !== activeFilter) return false
      if (!q) return true
      return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    })
  }, [query, activeFilter])

  const handleResultClick = (href: string) => {
    onClose()
    router.push(href)
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'searchOverlayIn 200ms ease-out',
      }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-2xl px-6 pt-24 md:pt-32">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#666] hover:text-white transition-colors text-2xl"
          aria-label="Close search"
        >
          &times;
        </button>

        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search positions, brands, salaries, guides..."
          className="w-full bg-transparent border-b border-[#333] pb-4 text-white text-xl md:text-2xl outline-none placeholder-[#555]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}
        />

        {/* Filter pills */}
        <div className="flex items-center gap-2 mt-5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`font-sans text-[0.65rem] font-medium tracking-wider uppercase px-3 py-1.5 border transition-colors ${
                activeFilter === f
                  ? 'border-[#a58e28] text-[#a58e28]'
                  : 'border-[#333] text-[#666] hover:border-[#555] hover:text-[#888]'
              }`}
            >
              {f === 'All' ? 'All' : f}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mt-6 max-h-[50vh] overflow-y-auto">
          {results.length === 0 && query.trim() ? (
            <p className="font-sans text-sm text-[#555] py-4">No results found.</p>
          ) : (
            results.map((item, i) => (
              <button
                key={`${item.category}-${item.title}-${i}`}
                onClick={() => handleResultClick(item.href)}
                className="w-full flex items-center gap-4 py-3 border-b border-[#222] text-left hover:bg-white/[0.03] transition-colors group"
              >
                <span className="font-sans text-[0.6rem] font-semibold tracking-wider uppercase text-[#a58e28] w-16 flex-shrink-0">
                  {item.category}
                </span>
                <span className="font-sans text-sm text-[#999] group-hover:text-white transition-colors">
                  {item.title}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Hint */}
        <div className="mt-4">
          <p className="font-sans text-[0.6rem] text-[#444] tracking-wide">
            ESC to close &middot; Type to search
          </p>
        </div>

      </div>

      <style jsx>{`
        @keyframes searchOverlayIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
