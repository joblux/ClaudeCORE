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

// Build display data from BRANDS static array + wikilux_content DB content
function buildBrandData(brand: any, content: any) {
  const kf = content?.key_facts || {}
  const stock = content?.stock || {}
  const presence = content?.presence || {}
  const founderFacts = content?.founder_facts || {}
  const hiringIntel = content?.hiring_intelligence || {}
  const executives = content?.key_executives || []

  // Stock & metrics
  const isPublic = stock?.listed === true
  const stockPrice = isPublic ? `${stock.exchange}: ${stock.ticker}` : null
  const revenueChange = null // Will come from signals/real data later
  const hiringStatus = null // Will come from signals/real data later

  // Leadership: map from DB key_executives to prototype shape
  const leadership = executives.map((exec: any, i: number) => {
    const name = exec.name || `Executive ${i + 1}`
    return {
      initials: getInitials(name),
      name,
      role: exec.role || '',
      since: exec.since || '',
      note: exec.note || '',
    }
  })

  // Sectors from known_for
  const sectors = brand.known_for
    ? brand.known_for.split(',').map((s: string) => s.trim())
    : [brand.sector]

  // Career paths from hiring_intelligence or fallback
  const careerPaths = hiringIntel.profiles
    ? [] // Will render as prose instead
    : []

  // Founder
  const founder = content?.founder
    ? {
        name: founderFacts.name || kf.founder_name || 'Founder',
        dates: founderFacts.birth || '',
        bio: typeof content.founder === 'string' ? content.founder : '',
      }
    : null

  // Financial
  const financial = isPublic
    ? {
        stock: `${stock.exchange}: ${stock.ticker}`,
        revenue: kf.parent_group || brand.group,
        margin: stock.parent_group || '—',
      }
    : null

  return {
    name: brand.name,
    slug: brand.slug,
    parent_group: brand.group,
    is_public: isPublic,
    stock_ticker: stock.ticker || null,
    stock_exchange: stock.exchange || null,
    stock_price: stockPrice,
    revenue_change: revenueChange,
    hiring_status: hiringStatus,
    founded_year: brand.founded,
    founded_city: brand.headquarters,
    employee_count: kf.estimated_employees ? `~${kf.estimated_employees}` : null,
    sectors,
    description1: brand.description,
    description2: content?.history
      ? (typeof content.history === 'string' ? content.history.substring(0, 400) + '...' : '')
      : brand.hiring_profile,
    career_paths: careerPaths,
    careers_prose: content?.careers || null,
    signals: [], // Will be populated from real signals DB later
    leadership,
    salaries: [], // Will come from salary DB later
    financial,
    founder,
    quote: null, // Will come from DB content later
    timeline: [], // Will come from DB content later
    values: [], // Will come from DB content later
    workCulture: hiringIntel.culture
      ? [
          { label: 'Culture', text: hiringIntel.culture },
          ...(hiringIntel.profiles ? [{ label: 'Ideal Profiles', text: hiringIntel.profiles }] : []),
          ...(hiringIntel.process ? [{ label: 'Hiring Process', text: hiringIntel.process }] : []),
        ].filter(w => w.text)
      : [],
    hiringTips: hiringIntel.tips || [],
    brand_dna: content?.brand_dna || null,
    market_position: content?.market_position || null,
    current_strategy: content?.current_strategy || null,
    signature_products: content?.signature_products || null,
    creative_directors: content?.creative_directors || null,
    tagline: content?.tagline || null,
    facts: content?.facts || [],
    presence,
  }
}

export default function BrandDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [activeTab, setActiveTab] = useState('Overview')
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [brand, setBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Find brand in static BRANDS array
  const staticBrand = BRANDS.find(b => b.slug === slug)

  useEffect(() => {
    if (!slug || !staticBrand) {
      setLoading(false)
      return
    }

    async function fetchContent() {
      try {
        const { data } = await supabase
          .from('wikilux_content')
          .select('content')
          .eq('slug', slug)
          .maybeSingle()

        const builtData = buildBrandData(staticBrand, data?.content || null)
        setBrand(builtData)
      } catch (err) {
        // Fallback to static data only
        const builtData = buildBrandData(staticBrand, null)
        setBrand(builtData)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [slug])

  // 404
  if (!loading && !staticBrand) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Brand not found</h1>
          <a href="/brands" className="text-sm text-[#a58e28] hover:underline">← Back to all brands</a>
        </div>
      </div>
    )
  }

  // Loading
  if (loading || !brand) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#2a2a2a] border-t-[#a58e28] rounded-full animate-spin" />
      </div>
    )
  }

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
                {brand.is_public ? `${brand.parent_group} (public: ${brand.stock_exchange}.${brand.stock_ticker})` : brand.parent_group}
                {brand.founded_year && ` · Founded ${brand.founded_year}, ${brand.founded_city}`}
                {brand.employee_count && ` · ${brand.employee_count} employees`}
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(brand.sectors || []).map((s: string) => (
                  <span key={s} className="text-xs px-2 py-0.5 border border-[#2a2a2a] rounded text-[#999]">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics - green pills */}
          <div className="flex gap-3">
            {brand.revenue_change && (
              <div className="text-center">
                <div className="text-lg font-medium text-[#4CAF50]">{brand.revenue_change}</div>
                <div className="text-[10px] text-[#999] uppercase tracking-wider">Revenue</div>
              </div>
            )}
            {brand.stock_price && (
              <div className="text-center">
                <div className="text-lg font-medium text-[#4CAF50]">{brand.stock_price}</div>
                <div className="text-[10px] text-[#999] uppercase tracking-wider">Stock</div>
              </div>
            )}
            {brand.hiring_status && (
              <div className="text-center">
                <div className="text-lg font-medium text-[#4CAF50]">{brand.hiring_status}</div>
                <div className="text-[10px] text-[#999] uppercase tracking-wider">Status</div>
              </div>
            )}
          </div>
        </div>

        {/* Tagline */}
        {brand.tagline && (
          <p className="text-base italic text-[#a58e28] mb-6 max-w-3xl" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            {brand.tagline}
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

        {/* Overview Tab */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">COMPANY PROFILE</p>
                <p className="text-sm text-[#888] leading-relaxed mb-3">{brand.description1}</p>
                {brand.description2 && <p className="text-sm text-[#888] leading-relaxed">{brand.description2}</p>}
              </div>

              {/* Career Paths - pills or prose */}
              {brand.career_paths && brand.career_paths.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CAREER PATHS AT {brand.name.toUpperCase()}</p>
                  <div className="flex flex-wrap gap-2">
                    {brand.career_paths.map((cp: string) => (
                      <span key={cp} className="text-xs px-3 py-1.5 border border-[#2a2a2a] rounded-full text-[#999]">{cp}</span>
                    ))}
                  </div>
                </div>
              )}
              {!brand.career_paths?.length && brand.careers_prose && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CAREERS AT {brand.name.toUpperCase()}</p>
                  <p className="text-sm text-[#888] leading-relaxed">{typeof brand.careers_prose === 'string' ? brand.careers_prose.substring(0, 600) + '...' : ''}</p>
                </div>
              )}

              {/* Market Position */}
              {brand.market_position && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">MARKET POSITION</p>
                  <p className="text-sm text-[#888] leading-relaxed">{typeof brand.market_position === 'string' ? brand.market_position.substring(0, 500) + '...' : ''}</p>
                </div>
              )}

              {/* Recent Signals */}
              {brand.signals && brand.signals.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">RECENT SIGNALS</p>
                  <div className="space-y-3">
                    {brand.signals.map((s: any, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-[6px] h-[6px] rounded-full mt-1.5 flex-shrink-0" style={{ background: s.color }} />
                        <span className="text-sm text-[#888] flex-1">{s.text}</span>
                        <span className="text-xs text-[#999] flex-shrink-0">{s.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Facts */}
              {brand.facts && Array.isArray(brand.facts) && brand.facts.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">DID YOU KNOW</p>
                  <div className="space-y-3">
                    {brand.facts.map((fact: string, i: number) => (
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
              {brand.leadership && brand.leadership.length > 0 && (
                <div className="bg-[#222] rounded-xl p-4">
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">LEADERSHIP</p>
                  <div className="space-y-3">
                    {brand.leadership.map((l: any) => (
                      <div key={l.name} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-medium text-[#999] flex-shrink-0">{l.initials}</div>
                        <div className="flex-1">
                          <div className="text-sm text-white">{l.name}</div>
                          <div className="text-[11px] text-[#999]">{l.role}</div>
                        </div>
                        {l.since && <div className="text-[11px] text-[#999]">Since {l.since}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Salary Ranges */}
              <div className="bg-[#222] rounded-xl p-4">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SALARY RANGES AT {brand.name.toUpperCase()}</p>
                {brand.salaries && brand.salaries.length > 0 ? (
                  <div className="space-y-2">
                    {brand.salaries.map((s: any) => (
                      <div key={s.role} className="flex justify-between items-center">
                        <span className="text-xs text-[#888]">{s.role}</span>
                        <span className="text-xs font-medium" style={{ color: s.blurred ? 'transparent' : '#a58e28', textShadow: s.blurred ? '0 0 8px #a58e28' : 'none', filter: s.blurred ? 'blur(4px)' : 'none', userSelect: s.blurred ? 'none' : 'auto' }}>{s.range}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#777]">Salary data is contribution-gated. Share your compensation to unlock ranges at {brand.name}.</p>
                )}
                <a href={`/salaries?brand=${encodeURIComponent(brand.name)}`} className="block mt-3 text-xs text-[#a58e28] hover:underline">Contribute your salary to see all →</a>
              </div>

              {/* Financial Health */}
              <div className="bg-[#222] rounded-xl p-4">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">FINANCIAL HEALTH</p>
                {brand.financial ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Stock</span><span className="text-xs text-[#888]">{brand.financial.stock}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Group</span><span className="text-xs text-[#888]">{brand.financial.revenue}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Parent</span><span className="text-xs text-[#888]">{brand.financial.margin}</span></div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Status</span><span className="text-xs text-[#888]">{brand.is_public ? 'Public' : 'Privately Held'}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Group</span><span className="text-xs text-[#888]">{brand.parent_group}</span></div>
                  </div>
                )}
                <p className="text-[10px] text-[#555] mt-3">Source: public filings</p>
              </div>

              {/* Key Markets */}
              {brand.presence?.key_markets && Array.isArray(brand.presence.key_markets) && (
                <div className="bg-[#222] rounded-xl p-4">
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">KEY MARKETS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {brand.presence.key_markets.map((m: string) => (
                      <span key={m} className="text-xs px-2 py-0.5 border border-[#2a2a2a] rounded text-[#999]">{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Culture Tab */}
        {activeTab === 'Culture' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left col */}
            <div className="space-y-6">
              {brand.founder && (
                <div className="flex gap-4">
                  <div className="w-32 h-36 bg-[#222] rounded-lg flex-shrink-0 flex items-center justify-center border border-[#2a2a2a]">
                    <svg width="48" height="60" viewBox="0 0 48 60" fill="none">
                      <circle cx="24" cy="18" r="12" stroke="#444" strokeWidth="1.5"/>
                      <path d="M4 56c0-11 9-20 20-20s20 9 20 20" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-normal text-white mb-0.5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>{brand.founder.name}</h3>
                    <p className="text-xs text-[#999] mb-2">Founder{brand.founder.dates ? ` · ${brand.founder.dates}` : ''} · Est. {brand.founded_year}, {brand.founded_city}</p>
                    {brand.founder.bio && brand.founder.bio.split('\n\n').slice(0, 3).map((p: string, i: number) => (
                      <p key={i} className="text-sm text-[#777] leading-relaxed mb-2">{p}</p>
                    ))}
                  </div>
                </div>
              )}
              {brand.quote && (
                <div className="border-l-2 border-[#a58e28] pl-4 py-2">
                  <p className="text-base italic text-[#ccc] mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>"{brand.quote.text}"</p>
                  <p className="text-xs text-[#999]">{brand.quote.author}</p>
                </div>
              )}

              {/* Brand DNA */}
              {brand.brand_dna && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">BRAND DNA</p>
                  <p className="text-sm text-[#777] leading-relaxed">{typeof brand.brand_dna === 'string' ? brand.brand_dna : ''}</p>
                </div>
              )}

              {/* Heritage Timeline */}
              {brand.timeline && brand.timeline.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">HERITAGE TIMELINE</p>
                  <div className="space-y-4">
                    {brand.timeline.map((t: any) => (
                      <div key={t.year} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="w-[7px] h-[7px] rounded-full bg-[#a58e28] flex-shrink-0 mt-1" />
                          <span className="w-px flex-1 bg-[#2a2a2a] mt-1" />
                        </div>
                        <div className="pb-3">
                          <span className="text-xs font-medium text-[#a58e28]">{t.year}</span>
                          <p className="text-sm text-[#777] mt-0.5">{t.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History fallback if no timeline */}
              {(!brand.timeline || brand.timeline.length === 0) && brand.description2 && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">HERITAGE</p>
                  <p className="text-sm text-[#777] leading-relaxed">{brand.description2}</p>
                </div>
              )}
            </div>

            {/* Right col */}
            <div className="space-y-6">
              {/* Core Values */}
              {brand.values && brand.values.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CORE VALUES</p>
                  <div className="grid grid-cols-2 gap-3">
                    {brand.values.map((v: any) => (
                      <div key={v.title} className="bg-[#222] rounded-lg p-3 border border-[#2a2a2a]">
                        <p className="text-sm font-medium text-white mb-1">{v.title}</p>
                        <p className="text-xs text-[#999] leading-relaxed">{v.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What it's like to work there */}
              {brand.workCulture && brand.workCulture.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">WHAT IT'S LIKE TO WORK THERE</p>
                  <div className="space-y-2">
                    {brand.workCulture.map((w: any) => (
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
              {brand.hiringTips && brand.hiringTips.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">INTERVIEW TIPS</p>
                  <div className="space-y-2">
                    {brand.hiringTips.map((tip: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-[6px] h-[6px] rounded-full mt-1.5 flex-shrink-0 bg-[#a58e28]" />
                        <span className="text-sm text-[#777]">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creative Directors */}
              {brand.creative_directors && typeof brand.creative_directors === 'string' && (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CREATIVE LEADERSHIP</p>
                  <p className="text-sm text-[#777] leading-relaxed">{brand.creative_directors.substring(0, 500)}...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Career Paths Tab */}
        {activeTab === 'Career paths' && (
          <div className="max-w-3xl space-y-8">
            {brand.careers_prose && (
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CAREERS AT {brand.name.toUpperCase()}</p>
                {typeof brand.careers_prose === 'string' && brand.careers_prose.split('\n\n').map((p: string, i: number) => (
                  <p key={i} className="text-sm text-[#888] leading-relaxed mb-3">{p}</p>
                ))}
              </div>
            )}
            {brand.current_strategy && (
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CURRENT STRATEGY</p>
                <p className="text-sm text-[#888] leading-relaxed">{typeof brand.current_strategy === 'string' ? brand.current_strategy : ''}</p>
              </div>
            )}
            {brand.signature_products && typeof brand.signature_products === 'string' && (
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SIGNATURE PRODUCTS</p>
                <p className="text-sm text-[#888] leading-relaxed">{brand.signature_products}</p>
              </div>
            )}
            {!brand.careers_prose && !brand.current_strategy && (
              <div className="flex flex-col items-center justify-center py-24">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CAREER PATHS</p>
                <p className="text-sm text-[#999]">Full career intelligence coming soon</p>
              </div>
            )}
          </div>
        )}

        {/* Salaries Tab */}
        {activeTab === 'Salaries' && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SALARIES</p>
            <p className="text-sm text-[#999] mb-4">Salary intelligence at {brand.name} is contribution-gated.</p>
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
