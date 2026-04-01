'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { BRANDS } from '@/lib/wikilux-brands'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const languageOptions = [
  { code: 'en', label: 'EN', display: 'EN' },
  { code: 'ar', label: 'AR', display: 'ع' },
  { code: 'zh', label: 'ZH', display: '中' },
  { code: 'ja', label: 'JA', display: '日' },
]
const tabs = ['Overview', 'Culture', 'Career paths', 'Salaries', 'Signals']

function getInitials(name: string) {
  const words = name.split(' ')
  if (words.length === 1) return name.slice(0, 2)
  return words.slice(0, 2).map((w: string) => w[0]).join('')
}

export default function BrandDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [activeTab, setActiveTab] = useState('Overview')
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Get brand metadata from static BRANDS array
  const brand = BRANDS.find(b => b.slug === slug)

  useEffect(() => {
    if (!slug) return
    async function fetchContent() {
      try {
        const { data } = await supabase
          .from('wikilux_content')
          .select('content, status, is_published')
          .eq('slug', slug)
          .maybeSingle()
        if (data?.content) setContent(data.content)
      } catch (err) {
        console.error('Failed to fetch content:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [slug])

  // 404 if brand not in BRANDS array
  if (!brand) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Brand not found</h1>
          <p className="text-sm text-[#999] mb-4">The brand "{slug}" doesn't exist in WikiLux.</p>
          <a href="/brands" className="text-sm text-[#a58e28] hover:underline">← Back to all brands</a>
        </div>
      </div>
    )
  }

  // Derived data from content JSON
  const keyFacts = content?.key_facts || {}
  const stock = content?.stock || {}
  const presence = content?.presence || {}
  const founderData = content?.founder_facts || {}
  const hiringIntel = content?.hiring_intelligence || {}
  const executives = content?.key_executives || []

  // Build sectors from known_for
  const sectors = brand.known_for.split(',').map((s: string) => s.trim())

  // Stock display
  const isPublic = stock?.listed === true
  const stockDisplay = isPublic ? `${stock.exchange}: ${stock.ticker}` : null

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-8 pt-8 pb-16">

        {/* Breadcrumb */}
        <div className="text-xs text-[#999] mb-4">
          <a href="/brands" className="hover:text-[#888]">Brands</a>
          <span className="mx-2">/</span>
          <span>WikiLux</span>
          <span className="mx-2">/</span>
          <span className="text-[#888]">{brand.name}</span>
        </div>

        {/* hreflang tags */}
        <link rel="alternate" hrefLang="en" href={`/brands/${slug}`} />
        <link rel="alternate" hrefLang="ar" href={`/brands/${slug}/ar`} />
        <link rel="alternate" hrefLang="zh" href={`/brands/${slug}/zh`} />
        <link rel="alternate" hrefLang="ja" href={`/brands/${slug}/ja`} />
        <link rel="alternate" hrefLang="x-default" href={`/brands/${slug}`} />

        {/* Language switcher */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {languageOptions.map(l => {
            const href = l.code === 'en' ? `/brands/${slug}` : `/brands/${slug}/${l.code}`
            const isActive = l.code === 'en'
            return (
              <Link
                key={l.code}
                href={href}
                className="text-xs px-3 py-1 rounded transition-colors"
                style={{
                  border: isActive ? '1px solid #a58e28' : '1px solid #2a2a2a',
                  color: isActive ? '#a58e28' : '#555',
                  background: isActive ? 'rgba(165,142,40,0.1)' : 'transparent',
                }}
              >
                {l.display}
              </Link>
            )
          })}
        </div>

        {/* Brand header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xl font-medium text-[#999]">
              {getInitials(brand.name)}
            </div>
            <div>
              <h1 className="text-4xl font-normal text-white mb-1" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                {brand.name}
              </h1>
              <p className="text-sm text-[#999]">
                {brand.group}{isPublic ? ` (public: ${stockDisplay})` : ''}
                {` · Founded ${brand.founded}, ${brand.headquarters}`}
                {keyFacts.estimated_employees && ` · ~${keyFacts.estimated_employees} employees`}
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {sectors.slice(0, 6).map((s: string) => (
                  <span key={s} className="text-xs px-2 py-0.5 border border-[#2a2a2a] rounded text-[#999]">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics - from stock data if available */}
          {isPublic && (
            <div className="flex gap-3">
              <div className="text-center">
                <div className="text-lg font-medium text-[#4CAF50]">{stock.exchange}</div>
                <div className="text-[10px] text-[#999] uppercase tracking-wider">Exchange</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-[#4CAF50]">{stock.ticker}</div>
                <div className="text-[10px] text-[#999] uppercase tracking-wider">Ticker</div>
              </div>
            </div>
          )}
        </div>

        {/* Tagline */}
        {content?.tagline && (
          <p className="text-base italic text-[#a58e28] mb-6 max-w-3xl" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            {content.tagline}
          </p>
        )}

        {/* Tabs */}
        <div className="flex gap-6 border-b border-[#2a2a2a] mb-8">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 text-sm transition-colors relative"
              style={{ color: activeTab === tab ? '#fff' : '#555' }}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#a58e28]" />
              )}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-5 h-5 border-2 border-[#2a2a2a] border-t-[#a58e28] rounded-full animate-spin" />
          </div>
        )}

        {/* No content state */}
        {!loading && !content && (
          <div className="py-16 text-center">
            <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">WIKILUX</p>
            <h2 className="text-xl text-white mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>{brand.name}</h2>
            <p className="text-sm text-[#888] leading-relaxed max-w-2xl mx-auto mb-6">{brand.description}</p>
            <p className="text-xs text-[#555]">Full intelligence profile coming soon.</p>
          </div>
        )}

        {/* Overview Tab */}
        {!loading && content && activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-8">
              {/* Company Profile */}
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">COMPANY PROFILE</p>
                <p className="text-sm text-[#888] leading-relaxed mb-3">{brand.description}</p>
                {content.history && (
                  <p className="text-sm text-[#888] leading-relaxed">{typeof content.history === 'string' ? content.history.substring(0, 400) + '...' : ''}</p>
                )}
              </div>

              {/* Career Paths */}
              {content.careers && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CAREER PATHS AT {brand.name.toUpperCase()}</p>
                  <p className="text-sm text-[#888] leading-relaxed">{typeof content.careers === 'string' ? content.careers.substring(0, 500) + '...' : ''}</p>
                </div>
              )}

              {/* Brand DNA */}
              {content.brand_dna && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">BRAND DNA</p>
                  <p className="text-sm text-[#888] leading-relaxed">{typeof content.brand_dna === 'string' ? content.brand_dna.substring(0, 500) + '...' : ''}</p>
                </div>
              )}

              {/* Market Position */}
              {content.market_position && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">MARKET POSITION</p>
                  <p className="text-sm text-[#888] leading-relaxed">{typeof content.market_position === 'string' ? content.market_position.substring(0, 500) + '...' : ''}</p>
                </div>
              )}

              {/* Facts */}
              {content.facts && Array.isArray(content.facts) && content.facts.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">KEY FACTS</p>
                  <div className="space-y-3">
                    {content.facts.map((fact: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-[6px] h-[6px] rounded-full mt-1.5 flex-shrink-0 bg-[#a58e28]" />
                        <span className="text-sm text-[#888] flex-1">{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Leadership */}
              {executives.length > 0 && (
                <div className="bg-[#222] rounded-xl p-4">
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">LEADERSHIP</p>
                  <div className="space-y-3">
                    {executives.map((exec: any, i: number) => {
                      const name = exec.name || `Executive ${i + 1}`
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-medium text-[#999] flex-shrink-0">
                            {getInitials(name)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-white">{name}</div>
                            <div className="text-[11px] text-[#999]">{exec.role}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Key Facts Card */}
              <div className="bg-[#222] rounded-xl p-4">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">KEY INFORMATION</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between"><span className="text-xs text-[#999]">Sector</span><span className="text-xs text-[#888]">{brand.sector}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-[#999]">Group</span><span className="text-xs text-[#888]">{brand.group}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-[#999]">Founded</span><span className="text-xs text-[#888]">{brand.founded}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-[#999]">Headquarters</span><span className="text-xs text-[#888]">{brand.headquarters}, {brand.country}</span></div>
                  {keyFacts.estimated_employees && (
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Employees</span><span className="text-xs text-[#888]">~{keyFacts.estimated_employees}</span></div>
                  )}
                  {keyFacts.website_url && (
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Website</span><a href={keyFacts.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#a58e28] hover:underline">{keyFacts.website_url.replace('https://', '').replace('www.', '')}</a></div>
                  )}
                </div>
              </div>

              {/* Presence / Key Markets */}
              {presence.key_markets && Array.isArray(presence.key_markets) && (
                <div className="bg-[#222] rounded-xl p-4">
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">KEY MARKETS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {presence.key_markets.map((m: string) => (
                      <span key={m} className="text-xs px-2 py-0.5 border border-[#2a2a2a] rounded text-[#999]">{m}</span>
                    ))}
                  </div>
                  {presence.boutiques && (
                    <p className="text-xs text-[#777] mt-3">{presence.boutiques}</p>
                  )}
                </div>
              )}

              {/* Financial Health */}
              {isPublic && (
                <div className="bg-[#222] rounded-xl p-4">
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">FINANCIAL</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Exchange</span><span className="text-xs text-[#888]">{stock.exchange}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Ticker</span><span className="text-xs text-[#888]">{stock.ticker}</span></div>
                    {stock.parent_group && (
                      <div className="flex justify-between"><span className="text-xs text-[#999]">Parent</span><span className="text-xs text-[#888]">{stock.parent_group}</span></div>
                    )}
                  </div>
                  <p className="text-[10px] text-[#555] mt-3">Source: public filings</p>
                </div>
              )}

              {/* Salary CTA */}
              <div className="bg-[#222] rounded-xl p-4">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SALARY RANGES AT {brand.name.toUpperCase()}</p>
                <p className="text-xs text-[#777] mb-3">Salary data is contribution-gated. Share your salary to unlock ranges at {brand.name}.</p>
                <a href={`/salaries?brand=${encodeURIComponent(brand.name)}`} className="block text-xs text-[#a58e28] hover:underline">Contribute your salary to see all →</a>
              </div>
            </div>
          </div>
        )}

        {/* Culture Tab */}
        {!loading && content && activeTab === 'Culture' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left col */}
            <div className="space-y-6">
              {/* Founder */}
              {content.founder && (
                <div>
                  <div className="flex gap-4">
                    <div className="w-32 h-36 bg-[#222] rounded-lg flex-shrink-0 flex items-center justify-center border border-[#2a2a2a]">
                      <svg width="48" height="60" viewBox="0 0 48 60" fill="none">
                        <circle cx="24" cy="18" r="12" stroke="#444" strokeWidth="1.5"/>
                        <path d="M4 56c0-11 9-20 20-20s20 9 20 20" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-normal text-white mb-0.5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                        {founderData.name || keyFacts.founder_name || 'Founder'}
                      </h3>
                      {founderData.birth && (
                        <p className="text-xs text-[#999] mb-2">Founder · {founderData.birth} · Est. {brand.founded}, {brand.headquarters}</p>
                      )}
                      {typeof content.founder === 'string' && content.founder.split('\n\n').slice(0, 3).map((p: string, i: number) => (
                        <p key={i} className="text-sm text-[#777] leading-relaxed mb-2">{p}</p>
                      ))}
                    </div>
                  </div>
                  {founderData.legacy && (
                    <div className="border-l-2 border-[#a58e28] pl-4 py-2 mt-4">
                      <p className="text-sm italic text-[#ccc] leading-relaxed" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>{founderData.legacy}</p>
                    </div>
                  )}
                </div>
              )}

              {/* History */}
              {content.history && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">HERITAGE</p>
                  {typeof content.history === 'string' && content.history.split('\n\n').slice(0, 4).map((p: string, i: number) => (
                    <p key={i} className="text-sm text-[#777] leading-relaxed mb-3">{p}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Right col */}
            <div className="space-y-6">
              {/* Brand DNA */}
              {content.brand_dna && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">BRAND DNA</p>
                  <p className="text-sm text-[#777] leading-relaxed">{typeof content.brand_dna === 'string' ? content.brand_dna : ''}</p>
                </div>
              )}

              {/* Hiring Intelligence - Culture section */}
              {hiringIntel.culture && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">WHAT IT'S LIKE TO WORK THERE</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Culture', text: hiringIntel.culture },
                      { label: 'Ideal Profiles', text: hiringIntel.profiles },
                      { label: 'Hiring Process', text: hiringIntel.process },
                    ].filter(item => item.text).map((w: any) => (
                      <div key={w.label} className="bg-[#222] rounded-lg border border-[#2a2a2a] overflow-hidden">
                        <button onClick={() => setOpenAccordion(openAccordion === w.label ? null : w.label)} className="w-full flex items-center justify-between px-4 py-3">
                          <span className="text-xs font-medium text-[#a58e28] tracking-wider">{w.label}</span>
                          <span className="text-[#999] text-lg leading-none">{openAccordion === w.label ? '−' : '+'}</span>
                        </button>
                        {openAccordion === w.label && (
                          <div className="px-4 pb-4">
                            {w.text.split('\\n\\n').map((p: string, i: number) => (
                              <p key={i} className="text-sm text-[#777] leading-relaxed mb-2">{p}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview Tips */}
              {hiringIntel.tips && Array.isArray(hiringIntel.tips) && hiringIntel.tips.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">INTERVIEW TIPS</p>
                  <div className="space-y-2">
                    {hiringIntel.tips.map((tip: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-[6px] h-[6px] rounded-full mt-1.5 flex-shrink-0 bg-[#a58e28]" />
                        <span className="text-sm text-[#777]">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creative Directors */}
              {content.creative_directors && typeof content.creative_directors === 'string' && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CREATIVE LEADERSHIP</p>
                  <p className="text-sm text-[#777] leading-relaxed">{content.creative_directors.substring(0, 500)}...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Career Paths Tab */}
        {!loading && content && activeTab === 'Career paths' && (
          <div className="max-w-3xl space-y-8">
            {content.careers && (
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CAREERS AT {brand.name.toUpperCase()}</p>
                {typeof content.careers === 'string' && content.careers.split('\n\n').map((p: string, i: number) => (
                  <p key={i} className="text-sm text-[#888] leading-relaxed mb-3">{p}</p>
                ))}
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">HIRING PROFILE</p>
              <p className="text-sm text-[#888] leading-relaxed">{brand.hiring_profile}</p>
            </div>
            {content.current_strategy && (
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CURRENT STRATEGY</p>
                <p className="text-sm text-[#888] leading-relaxed">{typeof content.current_strategy === 'string' ? content.current_strategy : ''}</p>
              </div>
            )}
            {content.signature_products && typeof content.signature_products === 'string' && (
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SIGNATURE PRODUCTS</p>
                <p className="text-sm text-[#888] leading-relaxed">{content.signature_products}</p>
              </div>
            )}
          </div>
        )}

        {/* Salaries Tab */}
        {activeTab === 'Salaries' && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SALARY INTELLIGENCE</p>
            <p className="text-sm text-[#999] mb-4">Salary data at {brand.name} is contribution-gated.</p>
            <a href={`/salaries?brand=${encodeURIComponent(brand.name)}`} className="text-sm text-[#a58e28] hover:underline">Contribute your salary to unlock →</a>
          </div>
        )}

        {/* Signals Tab */}
        {activeTab === 'Signals' && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SIGNALS</p>
            <p className="text-sm text-[#999] mb-4">Intelligence signals for {brand.name} will appear here.</p>
            <a href="/signals" className="text-sm text-[#a58e28] hover:underline">View all signals →</a>
          </div>
        )}

      </div>
    </div>
  )
}
