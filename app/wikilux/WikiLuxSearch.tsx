'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { WIKILUX_CATEGORY_ICONS } from '@/lib/sector-icons'

interface Brand {
  slug: string
  name: string
  country: string
  founded: number
  sector: string
  group: string
  headquarters: string
  description: string
  hiring_profile: string
  known_for: string
}

interface Props {
  brands: Brand[]
  categories: { sector: string; label: string; slug: string; count: number; icon: string | undefined }[]
}

export default function WikiLuxSearch({ brands, categories }: Props) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const featuredBrands = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return brands.slice(0, 6)
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.sector.toLowerCase().includes(q) ||
        b.country.toLowerCase().includes(q) ||
        b.group.toLowerCase().includes(q)
    ).slice(0, 12)
  }, [brands, query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/wikilux/all?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <>
      {/* SEARCH */}
      <div className="mb-10 text-center">
        <form onSubmit={handleSearch} className="jl-search mx-auto" style={{ maxWidth: 480 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands | Chanel, Rolex, Aman..."
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* CATEGORIES */}
      <div className="mb-10">
        <div className="jl-section-label"><span>Browse by Category</span></div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/wikilux/all?sector=${cat.slug}`}
              className="jl-card flex items-center gap-3 group"
            >
              {cat.icon && (
                <div className="w-8 h-8 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Image src={cat.icon} alt={cat.label} width={32} height={32} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-sans text-xs font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">
                  {cat.label}
                </div>
                <div className="font-sans text-[0.65rem] text-[#aaa] mt-0.5">{cat.count} brands</div>
              </div>
              <span className="text-[#e8e2d8] group-hover:text-[#a58e28] transition-colors">&rarr;</span>
            </Link>
          ))}
        </div>
      </div>

      {/* FEATURED / FILTERED BRANDS */}
      <div className="mb-10">
        <div className="jl-section-label">
          <span>{query.trim() ? `Results for "${query}"` : 'Featured Maisons'}</span>
        </div>
        {featuredBrands.length === 0 ? (
          <p className="font-sans text-sm text-[#888] py-4 text-center">
            No brands match &ldquo;{query}&rdquo;. <Link href="/wikilux/all" className="text-[#a58e28] hover:underline">Browse A&ndash;Z &rarr;</Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredBrands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/wikilux/${brand.slug}`}
                className="jl-card flex items-start gap-4 group"
              >
                <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#a58e28] transition-colors">
                  <span className="jl-serif text-base text-[#a58e28] group-hover:text-[#1a1a1a]">
                    {brand.name[0]}
                  </span>
                </div>
                <div>
                  <div className="font-sans text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">
                    {brand.name}
                  </div>
                  <div className="font-sans text-[0.65rem] text-[#aaa] mt-0.5">
                    {brand.sector} &middot; {brand.country}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
