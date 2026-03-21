'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BRANDS, Brand } from '@/lib/wikilux-brands'
import { SUPPORTED_LANGUAGES } from '@/lib/wikilux-prompt'
import { HreflangTags } from '@/components/wikilux/HreflangTags'

function renderParagraphs(text: string | undefined) {
  if (!text) return null
  return text.split('\n\n').map((p, i) => <p key={i}>{p}</p>)
}

const STOCK_TICKERS: Record<string, { exchange: string; ticker: string }> = {
  'LVMH': { exchange: 'Euronext Paris', ticker: 'MC' },
  'Hermès': { exchange: 'Euronext Paris', ticker: 'RMS' },
  'Hermes': { exchange: 'Euronext Paris', ticker: 'RMS' },
  'Kering': { exchange: 'Euronext Paris', ticker: 'KER' },
  'Richemont': { exchange: 'SIX Swiss', ticker: 'CFR' },
  'Prada': { exchange: 'HKEX', ticker: '1913' },
  'Burberry': { exchange: 'LSE', ticker: 'BRBY' },
  'Moncler': { exchange: 'MTA', ticker: 'MONC' },
  'Ferrari': { exchange: 'NYSE', ticker: 'RACE' },
  'Brunello Cucinelli': { exchange: 'MTA', ticker: 'BC' },
  'Salvatore Ferragamo': { exchange: 'MTA', ticker: 'SFER' },
  'Ralph Lauren': { exchange: 'NYSE', ticker: 'RL' },
  'Tapestry': { exchange: 'NYSE', ticker: 'TPR' },
  'Capri Holdings': { exchange: 'NYSE', ticker: 'CPRI' },
  'Swatch Group': { exchange: 'SIX Swiss', ticker: 'UHR' },
}

const PRIVATE_BRANDS = new Set([
  'Independent', 'Chanel', 'Rolex', 'Giorgio Armani', 'Patek Philippe',
  'Goyard', 'Audemars Piguet', 'Bovet', 'Chopard',
])

function getStockInfo(group: string, brandName: string): { exchange: string; ticker: string } | 'private' | null {
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

interface TranslatedBrandPageProps {
  brand: Brand
  content: Record<string, unknown>
  lang: string
  slug: string
}

export function TranslatedBrandPage({ brand, content, lang, slug }: TranslatedBrandPageProps) {
  const isRtl = lang === 'ar'
  const knownForTags = brand.known_for.split(',').map((t) => t.trim())

  const related = useMemo(() => {
    return BRANDS.filter((b) => b.sector === brand.sector && b.slug !== brand.slug)
      .sort(() => 0.5 - Math.random()).slice(0, 3)
  }, [brand])

  const c = content as Record<string, any>

  const founderText = typeof c.founder === 'string'
    ? c.founder
    : c.founder?.portrait ? `${c.founder.portrait} ${c.founder.legacy || ''}` : undefined

  const founderFacts = c.founder_facts || (typeof c.founder === 'object' && c.founder?.name
    ? { name: c.founder.name, birth: c.founder.birth, legacy: c.founder.legacy }
    : undefined)

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <HreflangTags slug={slug} />

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="bg-[#222222] border-b-2 border-[#a58e28] relative overflow-hidden">
        <div className="jl-container py-14 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/wikilux" className="jl-overline text-[#888] hover:text-[#a58e28] transition-colors">WikiLux</Link>
            <span className="text-[#555] text-xs">/</span>
            <Link href={`/wikilux/${slug}`} className="jl-overline text-[#888] hover:text-[#a58e28] transition-colors">{brand.name}</Link>
            <span className="text-[#555] text-xs">/</span>
            <span className="jl-overline text-[#a58e28]">{lang.toUpperCase()}</span>
          </div>
          <h1 className="jl-serif text-[2.5rem] md:text-[4rem] font-light text-white mb-3 leading-tight">{brand.name}</h1>
          {c.tagline && <p className="jl-editorial text-[#a58e28] mb-6 max-w-2xl">{c.tagline}</p>}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-sans text-[0.65rem] text-[#999] border border-[#444] px-3 py-1.5 tracking-wider uppercase">Est. {brand.founded}</span>
            <span className="font-sans text-[0.65rem] text-[#999] border border-[#444] px-3 py-1.5 tracking-wider uppercase">{brand.country}</span>
            <span className="font-sans text-[0.65rem] text-[#999] border border-[#444] px-3 py-1.5 tracking-wider uppercase">{brand.sector}</span>
            <span className="font-sans text-[0.65rem] text-[#a58e28] border border-[#a58e28] px-3 py-1.5 tracking-wider uppercase">{brand.group}</span>
            {(() => {
              const stockInfo = getStockInfo(brand.group, brand.name)
              if (stockInfo === 'private') return <span className="font-sans text-[0.65rem] text-[#777] border border-[#444] px-3 py-1.5 tracking-wider uppercase">Privately Held</span>
              if (stockInfo) return <span className="font-sans text-[0.65rem] text-[#a58e28] border border-[#a58e28] px-3 py-1.5 tracking-wider">{stockInfo.exchange}: {stockInfo.ticker}</span>
              return null
            })()}
          </div>
        </div>
      </div>

      {/* ── LANGUAGE SWITCHER ─────────────────────────────── */}
      <div className="jl-container pt-6 pb-2">
        <div className="flex items-center gap-1 flex-wrap">
          {SUPPORTED_LANGUAGES.map((l, i) => (
            <span key={l.code} className="flex items-center">
              {l.code === lang ? (
                <span className="font-sans text-[0.7rem] px-1.5 py-0.5 text-[#a58e28] font-semibold">{l.code.toUpperCase()}</span>
              ) : (
                <Link
                  href={l.code === 'en' ? `/wikilux/${slug}` : `/wikilux/${slug}/${l.code}`}
                  className="font-sans text-[0.7rem] px-1.5 py-0.5 text-[#aaa] hover:text-[#a58e28] transition-colors"
                >
                  {l.code.toUpperCase()}
                </Link>
              )}
              {i < SUPPORTED_LANGUAGES.length - 1 && <span className="text-[#ddd] text-[0.6rem] mx-0.5">|</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── CONTENT SECTIONS ──────────────────────────────── */}

      {/* HISTORY */}
      {c.history && (
        <div className="border-t border-[#e8e2d8]">
          <div className="jl-container py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <div className="jl-section-label"><span>History</span></div>
                <div className="jl-prose">{renderParagraphs(c.history)}</div>
              </div>
              <div className="space-y-6">
                {c.key_facts && (
                  <div className="border border-[#e8e2d8] p-5">
                    <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-4">Key Facts</span>
                    <div className="space-y-2.5">
                      {c.key_facts.founded_year && <div className="flex justify-between"><span className="font-sans text-xs text-[#888]">Founded</span><span className="font-sans text-xs font-medium text-[#1a1a1a]">{c.key_facts.founded_year}</span></div>}
                      {c.key_facts.founder_name && <div className="flex justify-between"><span className="font-sans text-xs text-[#888]">Founder</span><span className="font-sans text-xs font-medium text-[#1a1a1a]">{c.key_facts.founder_name}</span></div>}
                      {c.key_facts.headquarters_city && <div className="flex justify-between"><span className="font-sans text-xs text-[#888]">HQ</span><span className="font-sans text-xs font-medium text-[#1a1a1a]">{c.key_facts.headquarters_city}, {c.key_facts.headquarters_country}</span></div>}
                      {c.key_facts.parent_group && <div className="flex justify-between"><span className="font-sans text-xs text-[#888]">Group</span><span className="font-sans text-xs font-medium text-[#1a1a1a]">{c.key_facts.parent_group}</span></div>}
                      {c.key_facts.estimated_employees && <div className="flex justify-between"><span className="font-sans text-xs text-[#888]">Employees</span><span className="font-sans text-xs font-medium text-[#1a1a1a]">{c.key_facts.estimated_employees}</span></div>}
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
                  <div className="w-20 h-20 bg-[#222222] rounded flex-shrink-0 flex items-center justify-center">
                    <span className="jl-serif text-2xl text-[#a58e28] font-light">{getFounderInitials(founderFacts?.name || c.key_facts?.founder_name)}</span>
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
      {c.signature_products && (
        <div className="border-t border-[#e8e2d8]">
          <div className="jl-container py-8">
            <div className="jl-section-label"><span>Signature Products</span></div>
            <div className="jl-prose">{renderParagraphs(c.signature_products)}</div>
          </div>
        </div>
      )}

      {/* CREATIVE DIRECTORS */}
      {c.creative_directors && (
        <div className="border-t border-[#e8e2d8]">
          <div className="jl-container py-8">
            <div className="jl-section-label"><span>Creative Directors</span></div>
            <div className="jl-prose">{renderParagraphs(c.creative_directors)}</div>
          </div>
        </div>
      )}

      {/* BRAND DNA */}
      {c.brand_dna && (
        <div className="border-t border-[#e8e2d8]">
          <div className="jl-container py-8">
            <div className="jl-section-label"><span>Brand DNA</span></div>
            <div className="jl-prose">{renderParagraphs(c.brand_dna)}</div>
          </div>
        </div>
      )}

      {/* CAREERS */}
      {c.careers && (
        <div className="border-t border-[#e8e2d8]">
          <div className="jl-container py-8">
            <div className="jl-section-label"><span>Careers at {brand.name}</span></div>
            <div className="jl-prose">{renderParagraphs(c.careers)}</div>
          </div>
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

      {/* EXPLORE MORE */}
      {related.length > 0 && (
        <div className="border-t border-[#e8e2d8]">
          <div className="jl-container py-10">
            <div className="jl-section-label"><span>Explore More in {brand.sector}</span></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">{related.map((r) => (
              <Link key={r.slug} href={`/wikilux/${r.slug}/${lang}`} className="jl-card flex items-start gap-4 group">
                <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#a58e28] transition-colors"><span className="jl-serif text-base text-[#a58e28] group-hover:text-[#1a1a1a]">{r.name[0]}</span></div>
                <div><div className="font-sans text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">{r.name}</div><div className="font-sans text-[0.65rem] text-[#aaa] mt-0.5">{r.sector} &middot; {r.country} &middot; Est. {r.founded}</div></div>
              </Link>
            ))}</div>
            <div className="text-center"><Link href="/wikilux" className="jl-overline-gold hover:underline">&larr; Back to WikiLux</Link></div>
          </div>
        </div>
      )}
    </div>
  )
}
