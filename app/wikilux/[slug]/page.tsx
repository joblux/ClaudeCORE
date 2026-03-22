'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { BRANDS } from '@/lib/wikilux-brands'
import { useMember } from '@/lib/auth-hooks'
import { WIKILUX_CATEGORY_ICONS } from '@/lib/sector-icons'
import { SUPPORTED_LANGUAGES } from '@/lib/wikilux-prompt'
import { HreflangTags } from '@/components/wikilux/HreflangTags'

interface WikiContent {
  tagline?: string
  history?: string
  founder?: string | { name: string; birth: string; portrait: string; legacy: string }
  founder_facts?: { name: string; birth: string; legacy: string }
  signature_products?: string
  creative_directors?: string
  iconic_products?: { name: string; year: string; description: string }[]
  brand_dna?: string
  market_position?: string
  current_strategy?: string
  careers?: string
  hiring_intelligence?: { culture: string; profiles: string; process: string; tips: string[] }
  key_executives?: { role: string; note: string }[]
  key_facts?: {
    headquarters_city?: string
    headquarters_country?: string
    founded_year?: number
    founder_name?: string
    parent_group?: string
    sector?: string
    subsectors?: string[]
    estimated_employees?: string
    key_markets?: string[]
    website_url?: string
  }
  presence?: { headquarters: string; key_markets: string[]; boutiques: string }
  stock?: { listed: boolean; exchange: string | null; ticker: string | null; parent_group: string }
  facts?: string[]
  error?: string
}

interface BrandImage {
  id: string; url: string; thumb: string; alt: string | null
  photographer: string; photographer_url: string; unsplash_url: string
}

interface MemberInsight {
  id: string; insight_type: string; content: string
  contributor_name: string; contributor_tier: string; is_anonymous: boolean; created_at: string
}

const INSIGHT_CATEGORIES = [
  'Work Culture', 'Career Growth', 'Compensation', 'Interview Process',
  'Company Values', 'Day-to-Day', 'Management Style', 'Other',
]

const TIER_LABELS: Record<string, string> = {
  basic: 'Member', rising: 'Rising', pro: 'Pro', professional: 'Pro+',
  executive: 'Executive', business: 'Business', insider: 'Insider',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function renderParagraphs(text: string | undefined) {
  if (!text) return null
  return text.split('\n\n').map((p, i) => <p key={i}>{p}</p>)
}

// Stock ticker mapping by brand group or brand name
const STOCK_TICKERS: Record<string, { exchange: string; ticker: string }> = {
  'LVMH': { exchange: 'Euronext Paris', ticker: 'MC' },
  'Hermès': { exchange: 'Euronext Paris', ticker: 'RMS' },
  'Hermes': { exchange: 'Euronext Paris', ticker: 'RMS' },
  'Kering': { exchange: 'Euronext Paris', ticker: 'KER' },
  'Richemont': { exchange: 'SIX Swiss', ticker: 'CFR' },
  'Prada': { exchange: 'HKEX', ticker: '1913' },
  'Prada Group': { exchange: 'HKEX', ticker: '1913' },
  'Burberry': { exchange: 'LSE', ticker: 'BRBY' },
  'Burberry Group': { exchange: 'LSE', ticker: 'BRBY' },
  'Moncler': { exchange: 'MTA', ticker: 'MONC' },
  'Moncler Group': { exchange: 'MTA', ticker: 'MONC' },
  'Ferrari': { exchange: 'NYSE', ticker: 'RACE' },
  'Ferrari N.V.': { exchange: 'NYSE', ticker: 'RACE' },
  'Brunello Cucinelli': { exchange: 'MTA', ticker: 'BC' },
  'Salvatore Ferragamo': { exchange: 'MTA', ticker: 'SFER' },
  'Ferragamo': { exchange: 'MTA', ticker: 'SFER' },
  'Ralph Lauren': { exchange: 'NYSE', ticker: 'RL' },
  'Ralph Lauren Corporation': { exchange: 'NYSE', ticker: 'RL' },
  'Tapestry': { exchange: 'NYSE', ticker: 'TPR' },
  'Capri Holdings': { exchange: 'NYSE', ticker: 'CPRI' },
  'Swatch Group': { exchange: 'SIX Swiss', ticker: 'UHR' },
  'EssilorLuxottica': { exchange: 'Euronext Paris', ticker: 'EL' },
  'Estée Lauder': { exchange: 'NYSE', ticker: 'EL' },
  'Compagnie Financière Rupert': { exchange: 'SIX Swiss', ticker: 'CFR' },
}

const PRIVATE_BRANDS = new Set([
  'Independent', 'Chanel', 'Rolex', 'Giorgio Armani', 'Patek Philippe',
  'Goyard', 'Audemars Piguet', 'Bovet', 'Chopard',
])

function getStockInfo(group: string, brandName: string): { exchange: string; ticker: string } | 'private' | null {
  // Check brand name first, then group
  if (STOCK_TICKERS[brandName]) return STOCK_TICKERS[brandName]
  if (STOCK_TICKERS[group]) return STOCK_TICKERS[group]
  if (PRIVATE_BRANDS.has(group) || PRIVATE_BRANDS.has(brandName)) return 'private'
  return null
}

function getFounderInitials(name: string | undefined): string {
  if (!name) return '?'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return '?'
}

function SkeletonSection() {
  return (
    <div className="py-8">
      <div className="h-4 w-40 bg-[#e8e6df] rounded animate-pulse mb-6" />
      <div className="space-y-3">
        <div className="h-3 w-full bg-[#e8e6df] rounded animate-pulse" />
        <div className="h-3 w-[95%] bg-[#e8e6df] rounded animate-pulse" />
        <div className="h-3 w-[88%] bg-[#e8e6df] rounded animate-pulse" />
        <div className="h-3 w-[92%] bg-[#e8e6df] rounded animate-pulse" />
        <div className="h-3 w-[70%] bg-[#e8e6df] rounded animate-pulse" />
      </div>
    </div>
  )
}

export default function BrandPage() {
  const params = useParams()
  const slug = params.slug as string
  const brand = BRANDS.find((b) => b.slug === slug)
  const { isAuthenticated, isApproved, isAdmin, isLoading: authLoading } = useMember()
  const [content, setContent] = useState<WikiContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<BrandImage[]>([])
  const [insights, setInsights] = useState<MemberInsight[]>([])
  const [insightsTotal, setInsightsTotal] = useState(0)
  const [showAllInsights, setShowAllInsights] = useState(false)
  const [editorialNotes, setEditorialNotes] = useState<string | null>(null)
  const [contentUpdatedAt, setContentUpdatedAt] = useState<string | null>(null)
  const [productImages, setProductImages] = useState<Record<string, BrandImage | null>>({})

  // Admin state
  const [regenerating, setRegenerating] = useState(false)
  const [regenSuccess, setRegenSuccess] = useState(false)

  // Contribute modal state
  const [showContribute, setShowContribute] = useState(false)
  const [contributeCategory, setContributeCategory] = useState('')
  const [contributeText, setContributeText] = useState('')
  const [contributeAnon, setContributeAnon] = useState(false)
  const [contributing, setContributing] = useState(false)
  const [contributeSuccess, setContributeSuccess] = useState(false)
  const [contributeError, setContributeError] = useState('')

  const related = useMemo(() => {
    if (!brand) return []
    return BRANDS.filter((b) => b.sector === brand.sector && b.slug !== brand.slug)
      .sort(() => 0.5 - Math.random()).slice(0, 3)
  }, [brand])

  useEffect(() => {
    if (!brand) return

    fetch('/api/wikilux/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: brand.slug, brandName: brand.name, sector: brand.sector, founded: brand.founded, country: brand.country, group: brand.group }),
    })
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data?.error || `API returned ${r.status}`)
        return data
      })
      .then((data) => {
        if (!data.content || data.content.error) {
          setContent({ error: data.content?.error || 'Content is being generated. Please refresh in a moment.' })
          return
        }
        setContent(data.content)
        if (data.updated_at) setContentUpdatedAt(data.updated_at)
        if (data.editorial_notes) setEditorialNotes(data.editorial_notes)
      })
      .catch(() => {
        setContent({ error: 'Content generation failed. Please refresh to try again.' })
      })
      .finally(() => setLoading(false))

    fetch(`/api/wikilux/images?brand=${encodeURIComponent(brand.name)}&sector=${encodeURIComponent(brand.sector)}`)
      .then((r) => r.json()).then((data) => setImages(data.images || [])).catch(() => {})

    fetch(`/api/wikilux/insights?slug=${encodeURIComponent(brand.slug)}&limit=20`)
      .then((r) => r.json()).then((data) => { setInsights(data.insights || []); setInsightsTotal(data.total || 0) }).catch(() => {})
  }, [brand])

  // Fetch product images when iconic_products are available
  const fetchProductImages = useCallback(async (products: { name: string; year: string }[], brandName: string) => {
    const results: Record<string, BrandImage | null> = {}
    // Fetch up to 4 product images in parallel
    const toFetch = products.slice(0, 4)
    await Promise.all(
      toFetch.map(async (p) => {
        try {
          const query = `${brandName} ${p.name} luxury product`
          const res = await fetch(`/api/wikilux/images?brand=${encodeURIComponent(query)}&sector=product`)
          const data = await res.json()
          if (data.images && data.images.length > 0) {
            results[p.name] = data.images[0]
          } else {
            results[p.name] = null
          }
        } catch {
          results[p.name] = null
        }
      })
    )
    setProductImages(results)
  }, [])

  useEffect(() => {
    if (content?.iconic_products && content.iconic_products.length > 0 && brand) {
      fetchProductImages(content.iconic_products, brand.name)
    }
  }, [content, brand, fetchProductImages])

  // Admin: regenerate content
  const handleRegenerate = async () => {
    setRegenerating(true)
    setRegenSuccess(false)
    try {
      const res = await fetch('/api/wikilux/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (res.ok) {
        // Re-fetch content
        const genRes = await fetch('/api/wikilux/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: brand!.slug, brandName: brand!.name, sector: brand!.sector, founded: brand!.founded, country: brand!.country, group: brand!.group }),
        })
        const data = await genRes.json()
        setContent(data.content)
        setRegenSuccess(true)
      }
    } catch {}
    setRegenerating(false)
  }

  const handleContribute = async () => {
    if (!contributeCategory || contributeText.length < 50) {
      setContributeError('Please select a category and write at least 50 characters.')
      return
    }
    setContributing(true)
    setContributeError('')
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contribution_type: 'wikilux_insight',
          brand_slug: brand!.slug,
          brand_name: brand!.name,
          is_anonymous: contributeAnon,
          detail: { insight_type: contributeCategory, content: contributeText },
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      setContributeSuccess(true)
      setContributeCategory('')
      setContributeText('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setContributeError(message)
    }
    setContributing(false)
  }

  if (!brand) {
    return (
      <div className="jl-container py-20 text-center">
        <p className="font-sans text-sm text-[#888]">Brand not found.</p>
        <Link href="/wikilux" className="jl-overline-gold mt-4 inline-block hover:underline">&larr; WikiLux</Link>
      </div>
    )
  }

  const knownForTags = brand.known_for.split(',').map((t) => t.trim())
  const heroImage = images[0]
  const galleryImages = images.slice(1, 4)
  const sectorIcon = WIKILUX_CATEGORY_ICONS[brand.sector]
  const visibleInsights = showAllInsights ? insights : insights.slice(0, 3)

  const displayContent = content

  // Helper: get founder text (handles both string and object formats)
  const founderText = displayContent
    ? typeof displayContent.founder === 'string'
      ? displayContent.founder
      : displayContent.founder
        ? `${displayContent.founder.portrait || ''} ${displayContent.founder.legacy || ''}`
        : undefined
    : undefined

  // Founder facts card (from founder_facts or from founder object)
  const founderFacts = displayContent?.founder_facts
    || (typeof displayContent?.founder === 'object' && displayContent.founder
      ? { name: displayContent.founder.name, birth: displayContent.founder.birth, legacy: displayContent.founder.legacy }
      : undefined)

  return (
    <div className="bg-[#f5f4f0] min-h-screen">
      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="bg-[#222222] border-b-2 border-[#a58e28] relative overflow-hidden">
        {heroImage && (
          <div className="absolute inset-0">
            <Image src={heroImage.url + '&w=1400&q=80&fm=webp'} alt={heroImage.alt || `${brand.name} luxury`} fill className="object-cover opacity-40" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#222222]/60 to-[#222222]/30" />
          </div>
        )}
        <div className="jl-container py-14 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/wikilux" className="jl-overline text-[#888] hover:text-[#a58e28] transition-colors">WikiLux</Link>
            <span className="text-[#555] text-xs">/</span>
            <span className="jl-overline text-[#a58e28]">{brand.name}</span>
          </div>
          <div className="flex items-start gap-6">
            {sectorIcon && !heroImage && (
              <div className="hidden md:flex w-16 h-16 items-center justify-center flex-shrink-0 opacity-40">
                <Image src={sectorIcon} alt={brand.sector} width={48} height={48} />
              </div>
            )}
            <div>
              <h1 className="jl-serif text-[2.5rem] md:text-[4rem] font-light text-white mb-3 leading-tight">{brand.name}</h1>
              {displayContent?.tagline && <p className="jl-editorial text-[#a58e28] mb-6 max-w-2xl">{displayContent.tagline}</p>}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-sans text-[0.65rem] text-[#999] border border-[#444] px-3 py-1.5 tracking-wider uppercase">Est. {brand.founded}</span>
                <span className="font-sans text-[0.65rem] text-[#999] border border-[#444] px-3 py-1.5 tracking-wider uppercase">{brand.country}</span>
                <span className="font-sans text-[0.65rem] text-[#999] border border-[#444] px-3 py-1.5 tracking-wider uppercase">{brand.sector}</span>
                <span className="font-sans text-[0.65rem] text-[#a58e28] border border-[#a58e28] px-3 py-1.5 tracking-wider uppercase">{brand.group}</span>
                {(() => {
                  const stockInfo = getStockInfo(brand.group, brand.name)
                  if (stockInfo === 'private') {
                    return <span className="font-sans text-[0.65rem] text-[#777] border border-[#444] px-3 py-1.5 tracking-wider uppercase">Privately Held</span>
                  }
                  if (stockInfo) {
                    return <span className="font-sans text-[0.65rem] text-[#a58e28] border border-[#a58e28] px-3 py-1.5 tracking-wider">{stockInfo.exchange}: {stockInfo.ticker}</span>
                  }
                  return null
                })()}
              </div>
            </div>
          </div>
        </div>
        {heroImage && (
          <div className="absolute bottom-2 right-4 z-10">
            <span className="text-[0.55rem] text-[#666]">Photo by <a href={heroImage.photographer_url + '?utm_source=joblux&utm_medium=referral'} target="_blank" rel="noopener noreferrer" className="text-[#888] hover:text-[#a58e28]">{heroImage.photographer}</a> on <a href={heroImage.unsplash_url + '?utm_source=joblux&utm_medium=referral'} target="_blank" rel="noopener noreferrer" className="text-[#888] hover:text-[#a58e28]">Unsplash</a></span>
          </div>
        )}
      </div>

      {/* ── SKELETON LOADING ──────────────────────────────── */}
      {loading && (
        <div className="jl-container">
          <SkeletonSection />
          <div className="border-t border-[#e8e2d8]"><SkeletonSection /></div>
          <div className="border-t border-[#e8e2d8]"><SkeletonSection /></div>
          <div className="border-t border-[#e8e2d8]"><SkeletonSection /></div>
          <div className="border-t border-[#e8e2d8]"><SkeletonSection /></div>
          <div className="border-t border-[#e8e2d8]"><SkeletonSection /></div>
        </div>
      )}

      {content?.error && !loading && (
        <div className="jl-container py-10">
          <div className="border border-[#e8e2d8] bg-[#fafaf5] p-6 mb-8 text-center">
            <p className="font-sans text-sm text-[#888] mb-2">{typeof content.error === 'string' ? content.error : 'Content is being generated.'}</p>
            <button onClick={() => window.location.reload()} className="jl-btn jl-btn-outline text-xs mt-2">Refresh Page</button>
          </div>
          <div className="jl-prose"><h2>About</h2><p>{brand.description}</p></div>
          <blockquote className="border-l-2 border-[#a58e28] pl-5 py-2 mt-6 bg-[#fafaf5]"><p className="jl-editorial">{brand.hiring_profile}</p></blockquote>
        </div>
      )}

      {content && !content.error && !loading && (
        <>
          {/* IMAGE GALLERY */}
          {galleryImages.length > 0 && (
            <div className="jl-container py-8">
              <div className={`grid gap-3 ${galleryImages.length === 1 ? 'grid-cols-1 max-w-lg' : galleryImages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {galleryImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <Image src={img.url + '&w=600&q=80&fm=webp'} alt={img.alt || brand.name} fill className="object-cover" loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                    <div className="mt-1"><span className="text-[0.55rem] text-[#bbb]">Photo by <a href={img.photographer_url + '?utm_source=joblux&utm_medium=referral'} target="_blank" rel="noopener noreferrer" className="text-[#aaa] hover:text-[#a58e28]">{img.photographer}</a> on Unsplash</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ADMIN CONTROLS ────────────────────────────── */}
          {isAdmin && (
            <div className="jl-container py-4">
              <div className="flex items-center gap-3 flex-wrap border border-[#e8e2d8] bg-[#fafaf5] p-4">
                <span className="jl-badge text-[0.5rem]">Admin</span>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="jl-btn jl-btn-outline text-[0.65rem] py-1.5 px-3"
                >
                  {regenerating ? 'Regenerating...' : 'Regenerate Content'}
                </button>
                {regenSuccess && <span className="text-xs text-[#a58e28]">Content regenerated</span>}
              </div>
            </div>
          )}

          {/* ── HREFLANG TAGS ──────────────────────────────── */}
          <HreflangTags slug={slug} />

          {/* ── LANGUAGE SWITCHER (navigation links) ─────── */}
          <div className="jl-container pt-6 pb-2">
            <div className="flex items-center gap-1 flex-wrap">
              {SUPPORTED_LANGUAGES.map((lang, i) => (
                <span key={lang.code} className="flex items-center">
                  {lang.code === 'en' ? (
                    <span className="font-sans text-[0.7rem] px-1.5 py-0.5 text-[#a58e28] font-semibold">EN</span>
                  ) : (
                    <Link
                      href={`/wikilux/${slug}/${lang.code}`}
                      className="font-sans text-[0.7rem] px-1.5 py-0.5 text-[#aaa] hover:text-[#a58e28] transition-colors"
                    >
                      {lang.code.toUpperCase()}
                    </Link>
                  )}
                  {i < SUPPORTED_LANGUAGES.length - 1 && <span className="text-[#ddd] text-[0.6rem] mx-0.5">|</span>}
                </span>
              ))}
            </div>
          </div>

          {/* ── STRUCTURED EDITORIAL SECTIONS ──────────────── */}

          {/* HISTORY */}
          {displayContent?.history && (
            <div className="border-t border-[#e8e2d8]">
              <div className="jl-container py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2">
                    <div className="jl-section-label"><span>History</span></div>
                    <div className="jl-prose">{renderParagraphs(displayContent.history)}</div>
                  </div>
                  <div className="space-y-6">
                    {/* Key Facts sidebar */}
                    {displayContent.key_facts && (
                      <div className="border border-[#e8e2d8] p-5">
                        <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-4">Key Facts</span>
                        <div className="space-y-2.5">
                          {displayContent.key_facts.founded_year && (
                            <div className="flex justify-between"><span className="font-sans text-xs text-[#888]">Founded</span><span className="font-sans text-xs font-medium text-[#1a1a1a]">{displayContent.key_facts.founded_year}</span></div>
                          )}
                          {displayContent.key_facts.founder_name && (
                            <div className="flex justify-between"><span className="font-sans text-xs text-[#888]">Founder</span><span className="font-sans text-xs font-medium text-[#1a1a1a]">{displayContent.key_facts.founder_name}</span></div>
                          )}
                          {displayContent.key_facts.headquarters_city && (
                            <div className="flex justify-between"><span className="font-sans text-xs text-[#888]">Headquarters</span><span className="font-sans text-xs font-medium text-[#1a1a1a]">{displayContent.key_facts.headquarters_city}, {displayContent.key_facts.headquarters_country}</span></div>
                          )}
                          {displayContent.key_facts.parent_group && (
                            <div className="flex justify-between"><span className="font-sans text-xs text-[#888]">Group</span><span className="font-sans text-xs font-medium text-[#1a1a1a]">{displayContent.key_facts.parent_group}</span></div>
                          )}
                          {displayContent.key_facts.estimated_employees && (
                            <div className="flex justify-between"><span className="font-sans text-xs text-[#888]">Employees</span><span className="font-sans text-xs font-medium text-[#1a1a1a]">{displayContent.key_facts.estimated_employees}</span></div>
                          )}
                          {displayContent.key_facts.website_url && (
                            <div className="flex justify-between"><span className="font-sans text-xs text-[#888]">Website</span><a href={displayContent.key_facts.website_url} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-[#a58e28] hover:underline truncate ml-2">{displayContent.key_facts.website_url.replace(/^https?:\/\/(www\.)?/, '')}</a></div>
                          )}
                        </div>
                        {displayContent.key_facts.key_markets && displayContent.key_facts.key_markets.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-[#f0ece4]">
                            <span className="font-sans text-[0.6rem] text-[#888] uppercase tracking-wider block mb-2">Key Markets</span>
                            <div className="flex flex-wrap gap-1.5">{displayContent.key_facts.key_markets.map((m) => (<span key={m} className="font-sans text-[0.6rem] text-[#a58e28] border border-[#e8e2d8] px-2 py-0.5">{m}</span>))}</div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Fallback: facts, corporate, markets from old format */}
                    {!displayContent.key_facts && displayContent.facts && displayContent.facts.length > 0 && (
                      <div className="border border-[#e8e2d8] p-5">
                        <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-4">Key Facts</span>
                        <ul className="space-y-3">{displayContent.facts.map((fact, i) => (<li key={i} className="flex items-start gap-2"><span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span><span className="font-sans text-xs text-[#555] leading-relaxed">{fact}</span></li>))}</ul>
                      </div>
                    )}
                    {displayContent.stock && (
                      <div className="border border-[#e8e2d8] p-5">
                        <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-3">Corporate</span>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="font-sans text-xs text-[#888]">Parent Group</span><span className="font-sans text-xs font-medium text-[#1a1a1a]">{displayContent.stock.parent_group}</span></div>
                          {displayContent.stock.listed && displayContent.stock.exchange && (<div className="flex justify-between"><span className="font-sans text-xs text-[#888]">Exchange</span><span className="jl-badge-gold text-[0.5rem]">{displayContent.stock.exchange} {displayContent.stock.ticker && `· ${displayContent.stock.ticker}`}</span></div>)}
                        </div>
                      </div>
                    )}
                    <div className="border border-[#e8e2d8] p-5">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-3">Known For</span>
                      <div className="flex flex-wrap gap-2">{knownForTags.map((tag) => (<span key={tag} className="font-sans text-[0.6rem] text-[#a58e28] border border-[#e8e2d8] px-2.5 py-1">{tag}</span>))}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FOUNDER */}
          {founderText && (
            <div className="border-t border-[#e8e2d8]">
              <div className="jl-container py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2">
                    <div className="jl-section-label"><span>Founder</span></div>
                    <div className="flex gap-5 items-start">
                      {/* Founder portrait placeholder */}
                      <div className="w-20 h-20 bg-[#222222] rounded flex-shrink-0 flex items-center justify-center">
                        <span className="jl-serif text-2xl text-[#a58e28] font-light">
                          {getFounderInitials(founderFacts?.name || displayContent?.key_facts?.founder_name)}
                        </span>
                      </div>
                      <div className="jl-prose flex-1">{renderParagraphs(founderText)}</div>
                    </div>
                  </div>
                  {founderFacts && (
                    <div>
                      <div className="bg-[#fafaf5] border-l-2 border-[#a58e28] p-5">
                        <span className="font-sans text-[0.65rem] text-[#a58e28] uppercase tracking-wider block mb-3">Founder</span>
                        <h3 className="jl-serif text-lg font-light text-[#1a1a1a] mb-1">{founderFacts.name}</h3>
                        {founderFacts.birth && <p className="font-sans text-[0.65rem] text-[#aaa] mb-3">{founderFacts.birth}</p>}
                        {founderFacts.legacy && <p className="jl-editorial text-xs">{founderFacts.legacy}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SIGNATURE PRODUCTS */}
          {(displayContent?.signature_products || displayContent?.iconic_products) && (
            <div className="border-t border-[#e8e2d8]">
              <div className="jl-container py-8">
                <div className="jl-section-label"><span>Signature Products</span></div>
                {/* Product illustration strip */}
                {Object.values(productImages).some(Boolean) && (
                  <div className="flex gap-3 overflow-x-auto pb-4 mb-6 -mx-1 px-1">
                    {displayContent?.iconic_products?.slice(0, 4).map((p) => {
                      const img = productImages[p.name]
                      if (!img) return null
                      return (
                        <div key={p.name} className="flex-shrink-0 group">
                          <div className="w-[120px] h-[120px] relative overflow-hidden border border-[#e8e2d8] group-hover:border-[#a58e28] transition-colors">
                            <Image
                              src={img.thumb + '&w=240&q=80&fm=webp'}
                              alt={p.name}
                              fill
                              className="object-cover grayscale-[30%] contrast-[1.1]"
                              sizes="120px"
                            />
                          </div>
                          <p className="font-sans text-[0.55rem] text-[#888] mt-1.5 text-center max-w-[120px] truncate">{p.name}</p>
                          <p className="font-sans text-[0.5rem] text-[#a58e28] text-center">{p.year}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
                {displayContent.signature_products && (
                  <div className="jl-prose mb-6">{renderParagraphs(displayContent.signature_products)}</div>
                )}
                {displayContent.iconic_products && displayContent.iconic_products.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{displayContent.iconic_products.map((p) => (
                    <div key={p.name} className="jl-card group"><h3 className="jl-serif text-base font-light text-[#1a1a1a] mb-1 group-hover:text-[#a58e28] transition-colors">{p.name}</h3><span className="font-sans text-[0.6rem] text-[#a58e28] tracking-wider uppercase">{p.year}</span><p className="font-sans text-xs text-[#888] leading-relaxed mt-2">{p.description}</p></div>
                  ))}</div>
                )}
              </div>
            </div>
          )}

          {/* CREATIVE DIRECTORS */}
          {displayContent?.creative_directors && (
            <div className="border-t border-[#e8e2d8]">
              <div className="jl-container py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2">
                    <div className="jl-section-label"><span>Creative Directors</span></div>
                    <div className="jl-prose">{renderParagraphs(displayContent.creative_directors)}</div>
                  </div>
                  {displayContent.key_executives && displayContent.key_executives.length > 0 && (
                    <div>
                      <div className="border border-[#e8e2d8] p-5">
                        <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-4">Key Executives</span>
                        <div className="space-y-3">{displayContent.key_executives.map((exec, i) => (
                          <div key={i} className="border-b border-[#f0ece4] pb-3 last:border-0 last:pb-0">
                            <div className="font-sans text-xs font-semibold text-[#1a1a1a]">{exec.role}</div>
                            <div className="font-sans text-[0.65rem] text-[#888] mt-0.5">{exec.note}</div>
                          </div>
                        ))}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BRAND DNA */}
          {displayContent?.brand_dna && (
            <div className="border-t border-[#e8e2d8]">
              <div className="jl-container py-8">
                <div className="jl-section-label"><span>Brand DNA</span></div>
                <div className="jl-prose">{renderParagraphs(displayContent.brand_dna)}</div>
                {displayContent.market_position && (
                  <div className="mt-8">
                    <div className="jl-section-label"><span>Market Position</span></div>
                    <div className="jl-prose">{renderParagraphs(displayContent.market_position)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CAREERS */}
          {displayContent?.careers && (
            <div className="border-t border-[#e8e2d8]">
              <div className="jl-container py-8">
                <div className="jl-section-label"><span>Careers at {brand.name}</span></div>
                <div className="jl-prose">{renderParagraphs(displayContent.careers)}</div>
                {displayContent.current_strategy && (
                  <div className="mt-8">
                    <div className="jl-section-label"><span>Strategy &amp; Direction</span></div>
                    <div className="jl-prose">{renderParagraphs(displayContent.current_strategy)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HIRING INTELLIGENCE */}
          {displayContent?.hiring_intelligence && (
            <div className="border-t-2 border-[#a58e28] bg-[#fafaf5]">
              <div className="jl-container py-10">
                <div className="jl-section-label"><span>&#10022; Hiring Intelligence</span></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div><h3 className="font-sans text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">Culture</h3><div className="font-sans text-sm text-[#555] leading-relaxed space-y-3">{displayContent.hiring_intelligence.culture.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div></div>
                  <div><h3 className="font-sans text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">Candidate Profiles</h3><div className="font-sans text-sm text-[#555] leading-relaxed space-y-3">{displayContent.hiring_intelligence.profiles.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div></div>
                </div>
                {displayContent.hiring_intelligence.process && (<div className="mb-8"><h3 className="font-sans text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">Recruitment Process</h3><p className="font-sans text-sm text-[#555] leading-relaxed">{displayContent.hiring_intelligence.process}</p></div>)}
                {displayContent.hiring_intelligence.tips && displayContent.hiring_intelligence.tips.length > 0 && (
                  <div className="relative">
                    <h3 className="font-sans text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">Insider Tips</h3>
                    <div className={!isAuthenticated ? 'blur-sm select-none' : ''}>
                      <ol className="space-y-3">{displayContent.hiring_intelligence.tips.map((tip, i) => (<li key={i} className="flex items-start gap-3"><span className="jl-serif text-lg text-[#a58e28] leading-none mt-0.5 flex-shrink-0 w-6">{i + 1}</span><span className="font-sans text-sm text-[#555] leading-relaxed">{tip}</span></li>))}</ol>
                    </div>
                    {!isAuthenticated && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white border border-[#e8e2d8] px-6 py-4 text-center shadow-sm">
                          <div className="jl-overline-gold mb-2">Members Only</div>
                          <p className="font-sans text-xs text-[#888] mb-3">Sign in to access full hiring intelligence</p>
                          <div className="flex items-center justify-center gap-2">
                            <Link href="/members" className="jl-btn jl-btn-gold text-[0.6rem] py-1.5 px-3">Sign In</Link>
                            <Link href="/join" className="jl-btn jl-btn-ghost text-[0.6rem] py-1.5 px-3">Join</Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── EDITORIAL NOTES ──────────────────────────── */}
          {editorialNotes && (
            <div className="border-t border-[#e8e2d8]">
              <div className="jl-container py-8">
                <div className="border-l-2 border-[#a58e28] bg-[#fafaf5] p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="jl-badge text-[0.5rem]">Editorial</span>
                    <span className="font-sans text-[0.6rem] text-[#888]">Editor&rsquo;s Note</span>
                  </div>
                  <div className="font-sans text-sm text-[#555] leading-relaxed whitespace-pre-line">{editorialNotes}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── FROM THE SOCIETY (Member Insights) ────────── */}
          <div className="border-t border-[#e8e2d8]">
            <div className="jl-container py-10">
              <div className="jl-section-label"><span>From the Society</span></div>

              {insights.length > 0 ? (
                <div className="space-y-4">
                  {visibleInsights.map((insight) => (
                    <div key={insight.id} className="jl-card">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="jl-badge text-[0.5rem]">{insight.insight_type}</span>
                        <span className="jl-badge-outline text-[0.5rem]">{TIER_LABELS[insight.contributor_tier] || 'Member'}</span>
                      </div>
                      <p className="font-sans text-sm text-[#555] leading-relaxed mb-3">{insight.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-[0.65rem] text-[#aaa]">
                          {insight.contributor_name}
                        </span>
                        <span className="font-sans text-[0.6rem] text-[#ccc]">{timeAgo(insight.created_at)}</span>
                      </div>
                    </div>
                  ))}
                  {insightsTotal > 3 && !showAllInsights && (
                    <button onClick={() => setShowAllInsights(true)} className="text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors tracking-wide">
                      Show all {insightsTotal} insights &darr;
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-sans text-sm text-[#888] mb-3">Be the first to share your experience at {brand.name}</p>
                </div>
              )}

              {/* CONTRIBUTE BUTTON */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    if (!isAuthenticated) { window.location.href = `/join?brand=${encodeURIComponent(brand.name)}`; return }
                    if (!isApproved && !authLoading) { setContributeError('Your account is pending approval.'); return }
                    setShowContribute(true)
                    setContributeSuccess(false)
                    setContributeError('')
                  }}
                  className="jl-btn jl-btn-gold"
                >
                  Share Your Experience at {brand.name}
                </button>
                <p className="font-sans text-[0.65rem] text-[#aaa] mt-2">
                  Help the society by sharing your insider knowledge. Earn 5 points per approved contribution.
                </p>
                {contributeError && !showContribute && (
                  <p className="font-sans text-xs text-red-500 mt-2">{contributeError}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── CONTENT FRESHNESS ─────────────────────────── */}
          {contentUpdatedAt && (
            <div className="jl-container pb-4">
              <p className="font-sans text-[0.6rem] text-[#ccc] text-right">
                Last updated: {new Date(contentUpdatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                {Date.now() - new Date(contentUpdatedAt).getTime() > 60 * 24 * 60 * 60 * 1000 && (
                  <span className="text-[#a58e28] ml-2">Content refresh scheduled</span>
                )}
              </p>
            </div>
          )}

          {/* CROSS-LINKS */}
          <div className="border-t border-[#e8e2d8]">
            <div className="jl-container py-8">
              <Link href={`/interviews/${brand.slug}`} className="jl-card group flex items-center justify-between border-[#a58e28] bg-[#fafaf5]">
                <div><div className="jl-overline-gold mb-1">Interview Intelligence</div><div className="font-sans text-sm font-semibold text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">Interview experiences at {brand.name} &rarr;</div></div>
                <span className="jl-badge-gold text-[0.6rem] hidden sm:inline-block">View</span>
              </Link>
            </div>
          </div>
          <div className="border-t border-[#e8e2d8]">
            <div className="jl-container py-8">
              <Link href={`/salaries?brand=${encodeURIComponent(brand.name)}`} className="jl-card group flex items-center justify-between border-[#a58e28] bg-[#fafaf5]">
                <div><div className="jl-overline-gold mb-1">Salary Intelligence</div><div className="font-sans text-sm font-semibold text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">Compensation data at {brand.name} &rarr;</div></div>
                <span className="jl-badge-gold text-[0.6rem] hidden sm:inline-block">View</span>
              </Link>
            </div>
          </div>

          {/* EXPLORE MORE */}
          {related.length > 0 && (
            <div className="border-t border-[#e8e2d8]">
              <div className="jl-container py-10">
                <div className="jl-section-label"><span>Explore More in {brand.sector}</span></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">{related.map((r) => (
                  <Link key={r.slug} href={`/wikilux/${r.slug}`} className="jl-card flex items-start gap-4 group">
                    <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#a58e28] transition-colors"><span className="jl-serif text-base text-[#a58e28] group-hover:text-[#1a1a1a]">{r.name[0]}</span></div>
                    <div><div className="font-sans text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">{r.name}</div><div className="font-sans text-[0.65rem] text-[#aaa] mt-0.5">{r.sector} &middot; {r.country} &middot; Est. {r.founded}</div></div>
                  </Link>
                ))}</div>
                <div className="text-center"><Link href="/wikilux" className="jl-overline-gold hover:underline">&larr; Back to WikiLux</Link></div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── CONTRIBUTE MODAL ─────────────────────────────── */}
      {showContribute && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#1a1a1a]/60" onClick={() => setShowContribute(false)} />
          <div className="relative bg-white border-t sm:border border-[#e8e2d8] w-full sm:max-w-lg sm:rounded-sm max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="jl-overline-gold mb-1">WikiLux Contribution</div>
                  <h2 className="jl-serif text-xl font-light text-[#1a1a1a]">Share Your Experience at {brand.name}</h2>
                </div>
                <button onClick={() => setShowContribute(false)} className="text-[#999] hover:text-[#1a1a1a] text-lg">&times;</button>
              </div>

              {contributeSuccess ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#a58e28]/10 flex items-center justify-center">
                    <span className="text-[#a58e28] text-xl">&#10003;</span>
                  </div>
                  <h3 className="jl-serif text-lg text-[#1a1a1a] mb-2">Thank you!</h3>
                  <p className="font-sans text-sm text-[#888]">Your insight will be reviewed and published shortly. You&rsquo;ll earn 5 points once approved.</p>
                  <button onClick={() => setShowContribute(false)} className="jl-btn jl-btn-outline mt-6 text-xs">Close</button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="jl-label">Category</label>
                      <select value={contributeCategory} onChange={(e) => setContributeCategory(e.target.value)} className="jl-select w-full">
                        <option value="">Select a category</option>
                        {INSIGHT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="jl-label">Your Insight</label>
                      <textarea
                        value={contributeText}
                        onChange={(e) => setContributeText(e.target.value)}
                        placeholder={`Share what it's like to work at ${brand.name} — culture, career growth, hiring process, compensation insights...`}
                        className="jl-input w-full min-h-[140px] resize-y"
                        maxLength={1000}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[0.6rem] text-[#ccc]">Min 50 characters</span>
                        <span className={`text-[0.6rem] ${contributeText.length < 50 ? 'text-[#ccc]' : 'text-[#a58e28]'}`}>{contributeText.length}/1000</span>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={contributeAnon} onChange={(e) => setContributeAnon(e.target.checked)} className="accent-[#a58e28]" />
                      <span className="font-sans text-xs text-[#888]">Post anonymously — your name won&rsquo;t appear</span>
                    </label>
                  </div>
                  {contributeError && <p className="font-sans text-xs text-red-500 mt-3">{contributeError}</p>}
                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#e8e2d8]">
                    <button onClick={() => setShowContribute(false)} className="jl-btn jl-btn-outline text-xs">Cancel</button>
                    <button onClick={handleContribute} disabled={contributing} className="jl-btn jl-btn-primary text-xs">
                      {contributing ? 'Submitting...' : 'Submit Insight'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
