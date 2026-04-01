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

// SVG illustration: Carré scarf
function IllustrationCarre() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect x="8" y="8" width="184" height="184" rx="1" fill="none" stroke="#2c3e50" strokeWidth="1.8"/>
      <rect x="14" y="14" width="172" height="172" rx="1" fill="none" stroke="#2c3e50" strokeWidth="0.6" opacity="0.5"/>
      <rect x="20" y="20" width="160" height="160" rx="1" fill="none" stroke="#2c3e50" strokeWidth="0.3" opacity="0.28"/>
      <path d="M8 26 Q12 10 26 8" fill="none" stroke="#2c3e50" strokeWidth="0.9" opacity="0.65"/>
      <path d="M174 8 Q188 12 192 26" fill="none" stroke="#2c3e50" strokeWidth="0.9" opacity="0.65"/>
      <path d="M8 174 Q12 190 26 192" fill="none" stroke="#2c3e50" strokeWidth="0.9" opacity="0.65"/>
      <path d="M192 174 Q188 190 174 192" fill="none" stroke="#2c3e50" strokeWidth="0.9" opacity="0.65"/>
      <circle cx="100" cy="100" r="48" fill="none" stroke="#2c3e50" strokeWidth="0.8" opacity="0.4"/>
      <circle cx="100" cy="100" r="38" fill="none" stroke="#2c3e50" strokeWidth="0.4" opacity="0.25"/>
      <ellipse cx="100" cy="52" rx="6" ry="9" fill="none" stroke="#2c3e50" strokeWidth="1"/>
      <ellipse cx="100" cy="148" rx="6" ry="9" fill="none" stroke="#2c3e50" strokeWidth="1"/>
      <ellipse cx="52" cy="100" rx="9" ry="6" fill="none" stroke="#2c3e50" strokeWidth="1"/>
      <ellipse cx="148" cy="100" rx="9" ry="6" fill="none" stroke="#2c3e50" strokeWidth="1"/>
      <text x="100" y="205" fontFamily="Georgia, serif" fontStyle="italic" fontSize="11" fill="#2c3e50" opacity="0.8" textAnchor="middle">Le Carré, 1937</text>
    </svg>
  )
}

// SVG illustration: Birkin bag
function IllustrationBirkin() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <path d="M24 82 Q24 165 24 170 Q24 178 36 178 Q100 178 164 178 Q176 178 176 170 L176 82 Z" fill="none" stroke="#2c3e50" strokeWidth="1.8"/>
      <path d="M24 82 Q100 62 176 82" fill="none" stroke="#2c3e50" strokeWidth="1.8"/>
      <rect x="80" y="70" width="40" height="24" rx="3.5" fill="#e8d8d0" stroke="#2c3e50" strokeWidth="1.1"/>
      <circle cx="100" cy="82" r="5.5" fill="none" stroke="#2c3e50" strokeWidth="0.9"/>
      <line x1="100" y1="77" x2="100" y2="70" stroke="#2c3e50" strokeWidth="0.7"/>
      <path d="M52 82 C52 46 148 46 148 82" fill="none" stroke="#2c3e50" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="52" cy="82" r="5.5" fill="#e8d8d0" stroke="#2c3e50" strokeWidth="1.1"/>
      <circle cx="148" cy="82" r="5.5" fill="#e8d8d0" stroke="#2c3e50" strokeWidth="1.1"/>
      <line x1="28" y1="88" x2="28" y2="174" stroke="#2c3e50" strokeWidth="0.55" opacity="0.4" strokeDasharray="4 3"/>
      <line x1="172" y1="88" x2="172" y2="174" stroke="#2c3e50" strokeWidth="0.55" opacity="0.4" strokeDasharray="4 3"/>
      <text x="100" y="200" fontFamily="Georgia, serif" fontStyle="italic" fontSize="11" fill="#2c3e50" opacity="0.8" textAnchor="middle">Birkin, 1984</text>
    </svg>
  )
}

// SVG illustration: Sellerie harness
function IllustrationSellerie() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <path d="M36 36 Q100 24 164 36" fill="none" stroke="#2c3e50" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M44 50 Q100 42 156 50" fill="none" stroke="#2c3e50" strokeWidth="1.3"/>
      <line x1="40" y1="38" x2="32" y2="106" stroke="#2c3e50" strokeWidth="1.8"/>
      <line x1="160" y1="38" x2="168" y2="106" stroke="#2c3e50" strokeWidth="1.8"/>
      <path d="M34 78 Q100 68 166 78" fill="none" stroke="#2c3e50" strokeWidth="1.3"/>
      <circle cx="32" cy="110" r="15" fill="none" stroke="#2c3e50" strokeWidth="1.5"/>
      <circle cx="32" cy="110" r="10" fill="none" stroke="#2c3e50" strokeWidth="0.5" opacity="0.38"/>
      <circle cx="168" cy="110" r="15" fill="none" stroke="#2c3e50" strokeWidth="1.5"/>
      <circle cx="168" cy="110" r="10" fill="none" stroke="#2c3e50" strokeWidth="0.5" opacity="0.38"/>
      <path d="M17 110 Q10 132 20 150 Q30 166 50 164" fill="none" stroke="#2c3e50" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M183 110 Q190 132 180 150 Q170 166 150 164" fill="none" stroke="#2c3e50" strokeWidth="1.1" strokeLinecap="round"/>
      <ellipse cx="100" cy="108" rx="14" ry="8" fill="none" stroke="#2c3e50" strokeWidth="1"/>
      <text x="100" y="200" fontFamily="Georgia, serif" fontStyle="italic" fontSize="11" fill="#2c3e50" opacity="0.8" textAnchor="middle">Sellerie, 1837</text>
    </svg>
  )
}

// Build display data from static BRANDS array + DB wikilux_content
function buildBrandData(staticBrand: any, content: any) {
  const hi = content?.hiring_intelligence || {}
  const stock = content?.stock || {}
  const execs = content?.key_executives || []
  const isPublic = stock?.is_public === true

  // Leadership cards
  const leadership = execs.map((e: any) => ({
    initials: getInitials(e.name || ''),
    name: e.name || '',
    role: e.role || '',
    since: e.since || '',
  }))

  // Sectors from known_for
  const sectors = staticBrand.known_for
    ? staticBrand.known_for.split(',').map((s: string) => s.trim())
    : [staticBrand.sector]

  // Career paths pills
  const careerPaths = content?.careers?.paths || []

  // Work culture accordions — must be Culture, Growth, Pace, Access
  const workCulture = []
  if (hi.culture) workCulture.push({ label: 'Culture', text: hi.culture })
  if (hi.growth) workCulture.push({ label: 'Growth', text: hi.growth })
  if (hi.pace) workCulture.push({ label: 'Pace', text: hi.pace })
  if (hi.access) workCulture.push({ label: 'Access', text: hi.access })

  // Core values cards
  const values = hi.values || []

  // Heritage timeline
  const timeline = Array.isArray(content?.history) ? content.history : []

  // Founder
  const founder = content?.founder
    ? {
        name: (content.founder_facts && Array.isArray(content.founder_facts)) ? 'Founder' : 'Founder',
        dates: '',
        bio: typeof content.founder === 'string' ? content.founder : '',
      }
    : null

  // Quote
  const quote = content?.quote || null

  // Financial
  const financial = isPublic
    ? {
        stock: `${stock.exchange || ''}: ${stock.ticker || ''} ${stock.market_cap ? '(' + stock.market_cap + ')' : ''}`.trim(),
        revenue: stock.market_cap || '—',
        margin: '—',
      }
    : null

  return {
    name: staticBrand.name,
    slug: staticBrand.slug,
    parent_group: staticBrand.group,
    is_public: isPublic,
    stock_ticker: stock.ticker || null,
    stock_exchange: stock.exchange || null,
    stock_price: isPublic ? `${stock.exchange}.${stock.ticker}` : null,
    revenue_change: null,
    hiring_status: null,
    founded_year: staticBrand.founded,
    founded_city: staticBrand.headquarters,
    employee_count: null,
    sectors,
    // Overview: Company Profile
    description1: content?.brand_dna || staticBrand.description,
    description2: !content?.brand_dna ? staticBrand.hiring_profile : null,
    // Overview: Career paths pills
    career_paths: careerPaths,
    // Overview: Recent Signals
    signals: [],
    // Sidebar: Leadership
    leadership,
    // Sidebar: Salary Ranges
    salaries: [],
    // Sidebar: Financial Health
    financial,
    // Culture: Founder
    founder,
    founder_facts: content?.founder_facts || [],
    // Culture: Quote
    quote,
    // Culture: Heritage Timeline
    timeline,
    // Culture: Core Values
    values,
    // Culture: Work Culture accordions
    workCulture,
    // Career paths tab
    careers_prose: content?.careers?.prose || (typeof content?.careers === 'string' ? content.careers : null),
    // Tagline
    tagline: content?.tagline || null,
  }
}

export default function BrandDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [activeTab, setActiveTab] = useState('Overview')
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [brand, setBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
        setBrand(buildBrandData(staticBrand, data?.content || null))
      } catch {
        setBrand(buildBrandData(staticBrand, null))
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [slug])

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

          {/* Metrics */}
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

        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-8">
              {/* Company Profile */}
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">COMPANY PROFILE</p>
                <p className="text-sm text-[#888] leading-relaxed mb-3">{brand.description1}</p>
                {brand.description2 && <p className="text-sm text-[#888] leading-relaxed">{brand.description2}</p>}
              </div>

              {/* Career Paths pills */}
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

              {/* Recent Signals */}
              {brand.signals && brand.signals.length > 0 ? (
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
              ) : (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">RECENT SIGNALS</p>
                  <p className="text-sm text-[#777]">No signals yet for {brand.name}.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Leadership */}
              <div className="bg-[#222] rounded-xl p-4">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">LEADERSHIP</p>
                {brand.leadership && brand.leadership.length > 0 ? (
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
                ) : (
                  <p className="text-xs text-[#777]">Leadership data coming soon.</p>
                )}
              </div>

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
                <a href="/careers" className="block mt-3 text-xs text-[#a58e28] hover:underline">Contribute your salary to see all →</a>
              </div>

              {/* Financial Health */}
              <div className="bg-[#222] rounded-xl p-4">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">FINANCIAL HEALTH</p>
                {brand.financial ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Stock</span><span className="text-xs text-[#888]">{brand.financial.stock}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Market cap</span><span className="text-xs text-[#888]">{brand.financial.revenue}</span></div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Status</span><span className="text-xs text-[#888]">{brand.is_public ? 'Public' : 'Privately Held'}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-[#999]">Group</span><span className="text-xs text-[#888]">{brand.parent_group}</span></div>
                  </div>
                )}
                <p className="text-[10px] text-[#777] mt-3">Source: public filings, last updated March 2026</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ CULTURE TAB ═══════════════ */}
        {activeTab === 'Culture' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left col */}
            <div className="space-y-6">
              {/* Founder */}
              {brand.founder && brand.founder.bio && (
                <div className="flex gap-4">
                  <div className="w-32 h-36 bg-[#222] rounded-lg flex-shrink-0 flex items-center justify-center border border-[#2a2a2a]">
                    <svg width="48" height="60" viewBox="0 0 48 60" fill="none">
                      <circle cx="24" cy="18" r="12" stroke="#444" strokeWidth="1.5"/>
                      <path d="M4 56c0-11 9-20 20-20s20 9 20 20" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-normal text-white mb-0.5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                      {brand.founder.name !== 'Founder' ? brand.founder.name : `Founder of ${brand.name}`}
                    </h3>
                    <p className="text-xs text-[#999] mb-2">
                      Founder{brand.founder.dates ? ` · ${brand.founder.dates}` : ''} · Est. {brand.founded_year}, {brand.founded_city}
                    </p>
                    {brand.founder.bio.split('\n\n').slice(0, 3).map((p: string, i: number) => (
                      <p key={i} className="text-sm text-[#777] leading-relaxed mb-2">{p}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Founder facts */}
              {brand.founder_facts && Array.isArray(brand.founder_facts) && brand.founder_facts.length > 0 && (
                <div className="space-y-1.5 ml-36">
                  {brand.founder_facts.map((fact: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-[4px] h-[4px] rounded-full bg-[#a58e28] mt-1.5 flex-shrink-0" />
                      <span className="text-xs text-[#777]">{fact}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quote */}
              {brand.quote && brand.quote.text && (
                <div className="border-l-2 border-[#a58e28] pl-4 py-2">
                  <p className="text-base italic text-[#ccc] mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                    &ldquo;{brand.quote.text}&rdquo;
                  </p>
                  <p className="text-xs text-[#999]">— {brand.quote.author}</p>
                </div>
              )}

              {/* Heritage Timeline */}
              {brand.timeline && brand.timeline.length > 0 ? (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">HERITAGE TIMELINE</p>
                  <div className="space-y-4">
                    {brand.timeline.map((t: any, i: number) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="w-[7px] h-[7px] rounded-full bg-[#a58e28] flex-shrink-0 mt-1" />
                          {i < brand.timeline.length - 1 && <span className="w-px flex-1 bg-[#2a2a2a] mt-1" />}
                        </div>
                        <div className="pb-3">
                          <span className="text-xs font-medium text-[#a58e28]">{t.year}</span>
                          <p className="text-sm text-[#777] mt-0.5">{t.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">HERITAGE</p>
                  <p className="text-sm text-[#777] leading-relaxed">{staticBrand?.description || ''}</p>
                </div>
              )}
            </div>

            {/* Right col */}
            <div className="space-y-6">
              {/* Core Values */}
              {brand.values && brand.values.length > 0 ? (
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
              ) : (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CORE VALUES</p>
                  <p className="text-sm text-[#777]">Core values data coming soon.</p>
                </div>
              )}

              {/* What it's like to work there — 4 accordions */}
              {brand.workCulture && brand.workCulture.length > 0 ? (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">WHAT IT&apos;S LIKE TO WORK THERE</p>
                  <div className="space-y-2">
                    {brand.workCulture.map((w: any) => (
                      <div key={w.label} className="bg-[#222] rounded-lg border border-[#2a2a2a] overflow-hidden">
                        <button onClick={() => setOpenAccordion(openAccordion === w.label ? null : w.label)} className="w-full flex items-center justify-between px-4 py-3">
                          <span className="text-xs font-medium text-[#a58e28] tracking-wider">{w.label}</span>
                          <span className="text-[#999] text-lg leading-none">{openAccordion === w.label ? '−' : '+'}</span>
                        </button>
                        {openAccordion === w.label && (
                          <div className="px-4 pb-4"><p className="text-sm text-[#777] leading-relaxed">{w.text}</p></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">WHAT IT&apos;S LIKE TO WORK THERE</p>
                  <p className="text-sm text-[#777]">Work culture data coming soon.</p>
                </div>
              )}

              {/* Maison World — 3 illustrations */}
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">MAISON WORLD</p>
                <div className="grid grid-cols-3 gap-[3px] rounded-lg overflow-hidden border border-[#2a2a2a]">
                  <div className="aspect-square flex items-center justify-center p-2" style={{ background: '#e8d8d0' }}>
                    <IllustrationCarre />
                  </div>
                  <div className="aspect-square flex items-center justify-center p-2" style={{ background: '#e8d8d0' }}>
                    <IllustrationBirkin />
                  </div>
                  <div className="aspect-square flex items-center justify-center p-2" style={{ background: '#e8d8d0' }}>
                    <IllustrationSellerie />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ CAREER PATHS TAB ═══════════════ */}
        {activeTab === 'Career paths' && (
          <div className="max-w-3xl space-y-8">
            {/* Career paths pills */}
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

            {/* Careers prose */}
            {brand.careers_prose && (
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">WORKING AT {brand.name.toUpperCase()}</p>
                {typeof brand.careers_prose === 'string' && brand.careers_prose.split('\n\n').map((p: string, i: number) => (
                  <p key={i} className="text-sm text-[#888] leading-relaxed mb-3">{p}</p>
                ))}
              </div>
            )}

            {/* Work culture accordions */}
            {brand.workCulture && brand.workCulture.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">WHAT IT&apos;S LIKE TO WORK THERE</p>
                <div className="space-y-2">
                  {brand.workCulture.map((w: any) => (
                    <div key={w.label} className="bg-[#222] rounded-lg border border-[#2a2a2a] overflow-hidden">
                      <button onClick={() => setOpenAccordion(openAccordion === w.label ? null : w.label)} className="w-full flex items-center justify-between px-4 py-3">
                        <span className="text-xs font-medium text-[#a58e28] tracking-wider">{w.label}</span>
                        <span className="text-[#999] text-lg leading-none">{openAccordion === w.label ? '−' : '+'}</span>
                      </button>
                      {openAccordion === w.label && (
                        <div className="px-4 pb-4"><p className="text-sm text-[#777] leading-relaxed">{w.text}</p></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!brand.careers_prose && (!brand.career_paths || brand.career_paths.length === 0) && (
              <div className="flex flex-col items-center justify-center py-24">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CAREER PATHS</p>
                <p className="text-sm text-[#999]">Full career intelligence coming soon</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ SALARIES TAB ═══════════════ */}
        {activeTab === 'Salaries' && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SALARIES</p>
            <p className="text-sm text-[#999]">Coming in the next phase</p>
          </div>
        )}

        {/* ═══════════════ SIGNALS TAB ═══════════════ */}
        {activeTab === 'Signals' && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SIGNALS</p>
            <p className="text-sm text-[#999]">Coming in the next phase</p>
          </div>
        )}

      </div>
    </div>
  )
}
