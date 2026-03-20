'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BRANDS, type Brand } from '@/lib/wikilux-brands'

const sectors = ['All', ...Array.from(new Set(BRANDS.map((b) => b.sector))).sort()]

function groupByLetter(brands: Brand[]) {
  const groups: Record<string, Brand[]> = {}
  for (const brand of brands) {
    const letter = brand.name[0].toUpperCase()
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(brand)
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

export default function WikiLuxAllPage() {
  return (
    <Suspense fallback={<div className="jl-container py-20 text-center"><div className="inline-block w-8 h-8 border-2 border-[#e8e2d8] border-t-[#a58e28] rounded-full animate-spin" /></div>}>
      <WikiLuxAllContent />
    </Suspense>
  )
}

function WikiLuxAllContent() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialSector = searchParams.get('sector') || 'All'

  const [activeSector, setActiveSector] = useState(() => {
    if (initialSector === 'All') return 'All'
    // Match sector slug to sector name
    const match = BRANDS.find(b => b.sector.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') === initialSector.replace(/&/g, ''))
    return match ? match.sector : 'All'
  })
  const [search, setSearch] = useState(initialSearch)

  const filtered = useMemo(() => {
    let list = activeSector === 'All'
      ? BRANDS
      : BRANDS.filter((b) => b.sector === activeSector)

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.sector.toLowerCase().includes(q) ||
          b.country.toLowerCase().includes(q) ||
          b.group.toLowerCase().includes(q) ||
          b.known_for.toLowerCase().includes(q)
      )
    }

    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [activeSector, search])

  const grouped = useMemo(() => groupByLetter(filtered), [filtered])

  return (
    <div>
      {/* HERO */}
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <Link href="/wikilux" className="jl-overline text-[#a58e28] hover:underline mb-4 inline-block">&larr; WikiLux</Link>
          <div className="jl-overline-gold mb-3">WikiLux Encyclopedia</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
            {activeSector === 'All' ? `All ${BRANDS.length} Maisons` : `${activeSector} — ${filtered.length} Maisons`}
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-xl">
            The complete A&ndash;Z directory of luxury brands across fashion, watches, jewellery, automotive, hospitality, beauty, spirits, aviation and art.
          </p>
        </div>
      </div>

      <div className="jl-container py-10">

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand, sector, country..."
            className="jl-input w-full max-w-md"
          />
        </div>

        {/* Sector filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {sectors.map((sector) => (
            <button
              key={sector}
              onClick={() => setActiveSector(sector)}
              className={`font-sans text-[0.65rem] font-medium tracking-wider uppercase px-3 py-1.5 border transition-colors ${
                activeSector === sector
                  ? 'border-[#a58e28] text-[#a58e28] bg-[#a58e28]/5'
                  : 'border-[#e8e2d8] text-[#888] hover:border-[#aaa] hover:text-[#555]'
              }`}
            >
              {sector === 'All' ? `All (${BRANDS.length})` : `${sector} (${BRANDS.filter((b) => b.sector === sector).length})`}
            </button>
          ))}
        </div>

        {/* Letter jump nav */}
        <div className="flex flex-wrap gap-1 mb-10 border-b border-[#e8e2d8] pb-4">
          {grouped.map(([letter]) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="w-8 h-8 flex items-center justify-center font-sans text-xs font-semibold text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#a58e28] transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>

        {/* A–Z Groups */}
        {grouped.length === 0 ? (
          <p className="font-sans text-sm text-[#888] py-8 text-center">No brands found in this category.</p>
        ) : (
          grouped.map(([letter, brands]) => (
            <div key={letter} id={`letter-${letter}`} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="jl-serif text-3xl font-light text-[#a58e28]">{letter}</span>
                <div className="flex-1 h-px bg-[#e8e2d8]" />
                <span className="font-sans text-[0.6rem] text-[#aaa]">{brands.length} brand{brands.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {brands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/wikilux/${brand.slug}`}
                    className="flex items-center gap-3 p-3 border border-[#f0ece4] hover:border-[#a58e28] transition-colors group"
                  >
                    <div className="w-9 h-9 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#a58e28] transition-colors">
                      <span className="jl-serif text-sm text-[#a58e28] group-hover:text-[#1a1a1a]">
                        {brand.name[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-sans text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">
                        {brand.name}
                      </div>
                      <div className="font-sans text-[0.6rem] text-[#aaa] truncate">
                        {brand.sector} &middot; {brand.country} &middot; Est. {brand.founded}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Back to top */}
        <div className="text-center pt-6 border-t border-[#e8e2d8]">
          <a href="#" className="jl-overline text-[#a58e28] hover:underline">&uarr; Back to top</a>
        </div>

      </div>
    </div>
  )
}
