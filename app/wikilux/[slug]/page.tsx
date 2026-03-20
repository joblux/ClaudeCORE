'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BRANDS } from '@/lib/wikilux-brands'
import { useMember } from '@/lib/auth-hooks'

interface WikiContent {
  tagline?: string
  history?: string
  founder?: { name: string; birth: string; portrait: string; legacy: string }
  iconic_products?: { name: string; year: string; description: string }[]
  brand_dna?: string
  market_position?: string
  current_strategy?: string
  hiring_intelligence?: {
    culture: string
    profiles: string
    process: string
    tips: string[]
  }
  key_executives?: { role: string; note: string }[]
  presence?: { headquarters: string; key_markets: string[]; boutiques: string }
  stock?: { listed: boolean; exchange: string | null; ticker: string | null; parent_group: string }
  facts?: string[]
  error?: string
}

export default function BrandPage() {
  const params = useParams()
  const slug = params.slug as string
  const brand = BRANDS.find((b) => b.slug === slug)
  const { isAuthenticated } = useMember()
  const [content, setContent] = useState<WikiContent | null>(null)
  const [loading, setLoading] = useState(true)

  const related = useMemo(() => {
    if (!brand) return []
    return BRANDS
      .filter((b) => b.sector === brand.sector && b.slug !== brand.slug)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
  }, [brand])

  useEffect(() => {
    if (!brand) return
    fetch('/api/wikilux/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: brand.slug,
        brandName: brand.name,
        sector: brand.sector,
        founded: brand.founded,
        country: brand.country,
        group: brand.group,
      }),
    })
      .then((r) => r.json())
      .then((data) => setContent(data.content))
      .catch(() => setContent({ error: 'Failed to load' }))
      .finally(() => setLoading(false))
  }, [brand])

  if (!brand) {
    return (
      <div className="jl-container py-20 text-center">
        <p className="font-sans text-sm text-[#888]">Brand not found.</p>
        <Link href="/wikilux" className="jl-overline-gold mt-4 inline-block hover:underline">&larr; WikiLux</Link>
      </div>
    )
  }

  const knownForTags = brand.known_for.split(',').map((t) => t.trim())

  return (
    <div>

      {/* ── SECTION 1: HERO ──────────────────────────────── */}
      <div className="bg-[#222222] py-14 border-b-2 border-[#a58e28]">
        <div className="jl-container">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/wikilux" className="jl-overline text-[#888] hover:text-[#a58e28] transition-colors">WikiLux</Link>
            <span className="text-[#555] text-xs">/</span>
            <span className="jl-overline text-[#a58e28]">{brand.name}</span>
          </div>

          <h1 className="jl-serif text-[2.5rem] md:text-[4rem] font-light text-white mb-3 leading-tight">
            {brand.name}
          </h1>

          {content?.tagline && (
            <p className="jl-editorial text-[#a58e28] mb-6 max-w-2xl">{content.tagline}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-sans text-[0.65rem] text-[#999] border border-[#444] px-3 py-1.5 tracking-wider uppercase">Est. {brand.founded}</span>
            <span className="font-sans text-[0.65rem] text-[#999] border border-[#444] px-3 py-1.5 tracking-wider uppercase">{brand.country}</span>
            <span className="font-sans text-[0.65rem] text-[#999] border border-[#444] px-3 py-1.5 tracking-wider uppercase">{brand.sector}</span>
            <span className="font-sans text-[0.65rem] text-[#a58e28] border border-[#a58e28] px-3 py-1.5 tracking-wider uppercase">{brand.group}</span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="jl-container py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#e8e2d8] border-t-[#a58e28] rounded-full animate-spin mb-4" />
          <p className="font-sans text-sm text-[#888]">Building intelligence profile for {brand.name}...</p>
        </div>
      )}

      {content?.error && !loading && (
        <div className="jl-container py-10">
          <div className="jl-prose">
            <h2>About</h2>
            <p>{brand.description}</p>
          </div>
          <blockquote className="border-l-2 border-[#a58e28] pl-5 py-2 mt-6 bg-[#fafaf5]">
            <p className="jl-editorial">{brand.hiring_profile}</p>
          </blockquote>
        </div>
      )}

      {content && !content.error && !loading && (
        <>
          {/* ── SECTION 2: BRAND DNA + SIDEBAR ───────────── */}
          <div className="jl-container py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <div className="jl-section-label"><span>Brand DNA</span></div>
                <div className="jl-prose mb-8">
                  {content.brand_dna?.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>

                <div className="jl-section-label"><span>Market Position</span></div>
                <div className="jl-prose">
                  {content.market_position?.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>

              <div className="space-y-6">
                {/* Key Facts */}
                {content.facts && content.facts.length > 0 && (
                  <div className="border border-[#e8e2d8] p-5">
                    <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-4">Key Facts</span>
                    <ul className="space-y-3">
                      {content.facts.map((fact, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span>
                          <span className="font-sans text-xs text-[#555] leading-relaxed">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stock info */}
                {content.stock && (
                  <div className="border border-[#e8e2d8] p-5">
                    <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-3">Corporate</span>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-sans text-xs text-[#888]">Parent Group</span>
                        <span className="font-sans text-xs font-medium text-[#1a1a1a]">{content.stock.parent_group}</span>
                      </div>
                      {content.stock.listed && content.stock.exchange && (
                        <div className="flex justify-between">
                          <span className="font-sans text-xs text-[#888]">Exchange</span>
                          <span className="jl-badge-gold text-[0.5rem]">{content.stock.exchange} {content.stock.ticker && `· ${content.stock.ticker}`}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Key Markets */}
                {content.presence?.key_markets && (
                  <div className="border border-[#e8e2d8] p-5">
                    <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-3">Key Markets</span>
                    <div className="flex flex-wrap gap-2">
                      {content.presence.key_markets.map((m) => (
                        <span key={m} className="font-sans text-[0.6rem] text-[#a58e28] border border-[#e8e2d8] px-2.5 py-1">{m}</span>
                      ))}
                    </div>
                    {content.presence.boutiques && (
                      <p className="font-sans text-[0.65rem] text-[#aaa] mt-3">{content.presence.boutiques}</p>
                    )}
                  </div>
                )}

                {/* Known For */}
                <div className="border border-[#e8e2d8] p-5">
                  <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-3">Known For</span>
                  <div className="flex flex-wrap gap-2">
                    {knownForTags.map((tag) => (
                      <span key={tag} className="font-sans text-[0.6rem] text-[#a58e28] border border-[#e8e2d8] px-2.5 py-1">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: HISTORY ───────────────────────── */}
          {content.history && (
            <div className="border-t border-[#e8e2d8]">
              <div className="jl-container py-10">
                <div className="jl-section-label"><span>History &amp; Heritage</span></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 jl-prose">
                    {content.history.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                  </div>

                  {content.founder && (
                    <div>
                      <div className="bg-[#fafaf5] border-l-2 border-[#a58e28] p-5">
                        <span className="font-sans text-[0.65rem] text-[#a58e28] uppercase tracking-wider block mb-3">Founder</span>
                        <h3 className="jl-serif text-lg font-light text-[#1a1a1a] mb-1">{content.founder.name}</h3>
                        <p className="font-sans text-[0.65rem] text-[#aaa] mb-3">{content.founder.birth}</p>
                        <p className="font-sans text-xs text-[#555] leading-relaxed mb-3">{content.founder.portrait}</p>
                        <p className="jl-editorial text-xs">{content.founder.legacy}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 4: ICONIC PRODUCTS ───────────────── */}
          {content.iconic_products && content.iconic_products.length > 0 && (
            <div className="border-t border-[#e8e2d8]">
              <div className="jl-container py-10">
                <div className="jl-section-label"><span>Iconic Creations</span></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {content.iconic_products.map((product) => (
                    <div key={product.name} className="jl-card group">
                      <h3 className="jl-serif text-base font-light text-[#1a1a1a] mb-1 group-hover:text-[#a58e28] transition-colors">{product.name}</h3>
                      <span className="font-sans text-[0.6rem] text-[#a58e28] tracking-wider uppercase">{product.year}</span>
                      <p className="font-sans text-xs text-[#888] leading-relaxed mt-2">{product.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 5: STRATEGY & DIRECTION ──────────── */}
          {content.current_strategy && (
            <div className="border-t border-[#e8e2d8]">
              <div className="jl-container py-10">
                <div className="jl-section-label"><span>Strategy &amp; Direction</span></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 jl-prose">
                    {content.current_strategy.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                  </div>

                  {content.key_executives && content.key_executives.length > 0 && (
                    <div>
                      <div className="border border-[#e8e2d8] p-5">
                        <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-4">Key Executives</span>
                        <div className="space-y-3">
                          {content.key_executives.map((exec, i) => (
                            <div key={i} className="border-b border-[#f0ece4] pb-3 last:border-0 last:pb-0">
                              <div className="font-sans text-xs font-semibold text-[#1a1a1a]">{exec.role}</div>
                              <div className="font-sans text-[0.65rem] text-[#888] mt-0.5">{exec.note}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 6: HIRING INTELLIGENCE ───────────── */}
          {content.hiring_intelligence && (
            <div className="border-t-2 border-[#a58e28] bg-[#fafaf5]">
              <div className="jl-container py-10">
                <div className="jl-section-label"><span>&#10022; Hiring Intelligence</span></div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-sans text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">Culture</h3>
                    <div className="font-sans text-sm text-[#555] leading-relaxed space-y-3">
                      {content.hiring_intelligence.culture.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-sans text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">Candidate Profiles</h3>
                    <div className="font-sans text-sm text-[#555] leading-relaxed space-y-3">
                      {content.hiring_intelligence.profiles.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                  </div>
                </div>

                {content.hiring_intelligence.process && (
                  <div className="mb-8">
                    <h3 className="font-sans text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">Recruitment Process</h3>
                    <p className="font-sans text-sm text-[#555] leading-relaxed">{content.hiring_intelligence.process}</p>
                  </div>
                )}

                {content.hiring_intelligence.tips && content.hiring_intelligence.tips.length > 0 && (
                  <div className="relative">
                    <h3 className="font-sans text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">Insider Tips</h3>
                    <div className={!isAuthenticated ? 'blur-sm select-none' : ''}>
                      <ol className="space-y-3">
                        {content.hiring_intelligence.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="jl-serif text-lg text-[#a58e28] leading-none mt-0.5 flex-shrink-0 w-6">{i + 1}</span>
                            <span className="font-sans text-sm text-[#555] leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ol>
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

          {/* ── INTERVIEW EXPERIENCES CROSS-LINK ──────────── */}
          <div className="border-t border-[#e8e2d8]">
            <div className="jl-container py-8">
              <Link
                href={`/interviews/${brand.slug}`}
                className="jl-card group flex items-center justify-between border-[#a58e28] bg-[#fafaf5]"
              >
                <div>
                  <div className="jl-overline-gold mb-1">Interview Intelligence</div>
                  <div className="font-sans text-sm font-semibold text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">
                    Interview experiences at {brand.name} &rarr;
                  </div>
                </div>
                <span className="jl-badge-gold text-[0.6rem] hidden sm:inline-block">View</span>
              </Link>
            </div>
          </div>

          {/* ── SECTION 7: EXPLORE MORE ──────────────────── */}
          {related.length > 0 && (
            <div className="border-t border-[#e8e2d8]">
              <div className="jl-container py-10">
                <div className="jl-section-label"><span>Explore More in {brand.sector}</span></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {related.map((r) => (
                    <Link key={r.slug} href={`/wikilux/${r.slug}`} className="jl-card flex items-start gap-4 group">
                      <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#a58e28] transition-colors">
                        <span className="jl-serif text-base text-[#a58e28] group-hover:text-[#1a1a1a]">{r.name[0]}</span>
                      </div>
                      <div>
                        <div className="font-sans text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">{r.name}</div>
                        <div className="font-sans text-[0.65rem] text-[#aaa] mt-0.5">{r.sector} &middot; {r.country} &middot; Est. {r.founded}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="text-center">
                  <Link href="/wikilux" className="jl-overline-gold hover:underline">&larr; Back to WikiLux</Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
