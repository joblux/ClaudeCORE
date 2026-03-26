'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const languages = ['EN', 'FR', 'ES', 'AR', 'ZH', 'RU', 'JA', 'IT']
const tabs = ['Overview', 'Culture', 'Career paths', 'Salaries', 'Signals']

const hermesData = {
  name: 'Hermès',
  slug: 'hermes',
  parent_group: 'Independent',
  is_public: true,
  stock_ticker: 'RMS',
  stock_exchange: 'PA',
  stock_price: '€2,482',
  revenue_change: '+18%',
  hiring_status: 'Hiring',
  founded_year: 1837,
  founded_city: 'Paris',
  employee_count: '~20,000',
  sectors: ['Leather goods', 'Fashion', 'Watches', 'Jewelry', 'Home', 'Beauty'],
  description1: 'Hermès International is a French luxury goods manufacturer renowned for its leather goods, silk scarves, perfumes, jewelry, watches, and ready-to-wear. One of the few major luxury brands to remain independent and family-controlled, Hermès has consistently outperformed the broader luxury market through strict control of production, limited distribution, and a refusal to discount.',
  description2: 'The company operates over 300 stores worldwide and has significantly expanded its manufacturing capacity in France, with several new workshops opened since 2020. Known for exceptionally low employee turnover in the luxury sector.',
  career_paths: ['Retail & boutique management', 'Artisan & métiers', 'Merchandising', 'Marketing & communications', 'Supply chain', 'Digital & e-commerce', 'Finance & strategy', 'HR & talent'],
  signals: [
    { color: '#4CAF50', text: '4 new stores opened in Asia Pacific: Seoul, Chengdu, Osaka, Mumbai', time: '2w ago' },
    { color: '#4CAF50', text: 'Q4 2025 revenue +18% YoY — all divisions growing', time: '2w ago' },
    { color: '#4CAF50', text: 'New leather workshop opened in Normandy — 250 artisan positions', time: '1mo ago' },
  ],
  leadership: [
    { initials: 'AD', name: 'Axel Dumas', role: 'CEO', since: '2013' },
    { initials: 'NV', name: 'Nadège Vanhée', role: "Artistic Director, Women's", since: '2014' },
    { initials: 'VB', name: 'Véronique Baud', role: 'Artistic Director, Leather', since: '2019' },
  ],
  salaries: [
    { role: 'Store Manager, Paris', range: '€55K–€75K', blurred: false },
    { role: 'Retail Director, Europe', range: '€95K–€130K', blurred: false },
    { role: 'Marketing Manager', range: '€65K–€90K', blurred: true },
    { role: 'Buyer, RTW', range: '€50K–€70K', blurred: true },
  ],
  financial: {
    stock: '€2,482 (+23% YTD)',
    revenue: '€14.6B (FY 2025, +18%)',
    margin: '42.1%',
  },
  founder: {
    name: 'Thierry Hermès',
    dates: '1801–1878',
    bio: 'Born in Krefeld, Germany, Thierry Hermès moved to France and established a harness workshop on the Grands Boulevards in Paris in 1837. The business served European nobility, crafting the finest harnesses and bridles — work that demanded an obsessive attention to leather quality and hand-stitching that would define the house for nearly two centuries.\n\nWhat began as equestrian equipment evolved under subsequent generations into travel goods, handbags, silk scarves, and eventually a full luxury universe. The family\'s sixth generation still controls the company — a rarity in an industry dominated by conglomerates.',
  },
  quote: {
    text: 'We don\'t have a marketing department. We have a dream department.',
    author: '— Axel Dumas, CEO, Hermès International',
  },
  timeline: [
    { year: '1837', event: 'Thierry Hermès opens harness workshop in Paris' },
    { year: '1922', event: 'First leather handbag introduced (Haut à Courroies)' },
    { year: '1937', event: 'First silk scarf — the Carré — launched' },
    { year: '1984', event: 'Birkin bag created for Jane Birkin' },
    { year: '1993', event: 'IPO on Paris Bourse' },
    { year: '2014', event: "Successfully fights off LVMH's acquisition attempt" },
    { year: '2025', event: 'Revenue crosses €14B — largest independent luxury house by market cap' },
  ],
  values: [
    { title: 'Craftsmanship', desc: 'Every artisan trains 2+ years before touching a product. Quality over volume, always.' },
    { title: 'Independence', desc: 'Family-controlled since 1837. No conglomerate backing. Decisions made for the long term.' },
    { title: 'Creativity', desc: 'Artisans encouraged to explore. Annual internal exhibition showcases personal projects.' },
    { title: 'Discretion', desc: 'No celebrity endorsements. No logo-heavy products. The product speaks for itself.' },
  ],
  workCulture: [
    { label: 'Culture', text: 'Exceptionally low turnover for luxury. Employees describe a "family" atmosphere even at scale. Strong internal promotion culture.' },
    { label: 'Growth', text: 'Rapid expansion creates genuine career opportunities. New workshops in France mean artisan roles are opening regularly.' },
    { label: 'Pace', text: 'Decision-making can be slow due to family governance. If you want fast-moving startup energy, this isn\'t it.' },
    { label: 'Access', text: 'Roles are competitive and rarely advertised publicly. Networking and referrals are essential to get in.' },
  ],
}

function getInitials(name: string) {
  const words = name.split(' ')
  if (words.length === 1) return name.slice(0, 2)
  return words.slice(0, 2).map((w: string) => w[0]).join('')
}

export default function BrandDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [activeTab, setActiveTab] = useState('Overview')
  const [activeLang, setActiveLang] = useState('EN')
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [brand, setBrand] = useState<any>(hermesData)

  useEffect(() => {
    async function fetchBrand() {
      const { data } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .single()
      if (data) setBrand(data)
    }
    if (slug && slug !== 'hermes') fetchBrand()
  }, [slug])

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-8 pt-8 pb-16">

        {/* Breadcrumb */}
        <div className="text-xs text-[#555] mb-4">
          <a href="/brands" className="hover:text-[#888]">Brands</a>
          <span className="mx-2">/</span>
          <span>WikiLux</span>
          <span className="mx-2">/</span>
          <span className="text-[#888]">{brand.name}</span>
        </div>

        {/* Language switcher */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {languages.map(l => (
            <button
              key={l}
              onClick={() => setActiveLang(l)}
              className="text-xs px-3 py-1 rounded transition-colors"
              style={{
                border: activeLang === l ? '1px solid #a58e28' : '1px solid #2a2a2a',
                color: activeLang === l ? '#a58e28' : '#555',
                background: activeLang === l ? 'rgba(165,142,40,0.1)' : 'transparent',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Brand header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xl font-medium text-[#666]">
              {getInitials(brand.name)}
            </div>
            <div>
              <h1 className="text-4xl font-normal text-white mb-1" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                {brand.name}
              </h1>
              <p className="text-sm text-[#555]">
                {brand.is_public ? `Independent (public: ${brand.stock_exchange}.${brand.stock_ticker})` : brand.parent_group}
                {brand.founded_year && ` · Founded ${brand.founded_year}, ${brand.founded_city}`}
                {brand.employee_count && ` · ${brand.employee_count} employees`}
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(brand.sectors || []).map((s: string) => (
                  <span key={s} className="text-xs px-2 py-0.5 border border-[#2a2a2a] rounded text-[#555]">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex gap-3">
            {brand.revenue_change && (
              <div className="text-center">
                <div className="text-lg font-medium text-[#4CAF50]">{brand.revenue_change}</div>
                <div className="text-[10px] text-[#555] uppercase tracking-wider">Revenue</div>
              </div>
            )}
            {brand.stock_price && (
              <div className="text-center">
                <div className="text-lg font-medium text-[#4CAF50]">{brand.stock_price}</div>
                <div className="text-[10px] text-[#555] uppercase tracking-wider">Stock</div>
              </div>
            )}
            {brand.hiring_status && (
              <div className="text-center">
                <div className="text-lg font-medium text-[#4CAF50]">{brand.hiring_status}</div>
                <div className="text-[10px] text-[#555] uppercase tracking-wider">Status</div>
              </div>
            )}
          </div>
        </div>

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
            {/* Left col */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">COMPANY PROFILE</p>
                <p className="text-sm text-[#888] leading-relaxed mb-3">{brand.description1}</p>
                <p className="text-sm text-[#888] leading-relaxed">{brand.description2}</p>
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CAREER PATHS AT {brand.name.toUpperCase()}</p>
                <div className="flex flex-wrap gap-2">
                  {(brand.career_paths || []).map((cp: string) => (
                    <span key={cp} className="text-xs px-3 py-1.5 border border-[#2a2a2a] rounded-full text-[#666]">{cp}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">RECENT SIGNALS</p>
                <div className="space-y-3">
                  {(brand.signals || []).map((s: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-[6px] h-[6px] rounded-full mt-1.5 flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-sm text-[#888] flex-1">{s.text}</span>
                      <span className="text-xs text-[#444] flex-shrink-0">{s.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right col */}
            <div className="space-y-4">
              {/* Leadership */}
              <div className="bg-[#222] rounded-xl p-4">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">LEADERSHIP</p>
                <div className="space-y-3">
                  {(brand.leadership || []).map((l: any) => (
                    <div key={l.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-medium text-[#666] flex-shrink-0">
                        {l.initials}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white">{l.name}</div>
                        <div className="text-[11px] text-[#555]">{l.role}</div>
                      </div>
                      <div className="text-[11px] text-[#555]">Since {l.since}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salaries */}
              <div className="bg-[#222] rounded-xl p-4">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SALARY RANGES AT {brand.name.toUpperCase()}</p>
                <div className="space-y-2">
                  {(brand.salaries || []).map((s: any) => (
                    <div key={s.role} className="flex justify-between items-center">
                      <span className="text-xs text-[#888]">{s.role}</span>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: s.blurred ? 'transparent' : '#a58e28',
                          textShadow: s.blurred ? '0 0 8px #a58e28' : 'none',
                          filter: s.blurred ? 'blur(4px)' : 'none',
                          userSelect: s.blurred ? 'none' : 'auto',
                        }}
                      >
                        {s.range}
                      </span>
                    </div>
                  ))}
                </div>
                <a href="/careers" className="block mt-3 text-xs text-[#a58e28] hover:underline">
                  Contribute your salary to see all →
                </a>
              </div>

              {/* Financial */}
              <div className="bg-[#222] rounded-xl p-4">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">FINANCIAL HEALTH</p>
                {brand.financial && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-[#555]">Stock</span>
                      <span className="text-xs text-[#888]">{brand.financial.stock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#555]">Revenue</span>
                      <span className="text-xs text-[#888]">{brand.financial.revenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#555]">Operating margin</span>
                      <span className="text-xs text-[#888]">{brand.financial.margin}</span>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-[#333] mt-3">Source: public filings, last updated March 2026</p>
              </div>
            </div>
          </div>
        )}

        {/* Culture Tab */}
        {activeTab === 'Culture' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left */}
            <div className="space-y-6">
              {/* Founder */}
              {brand.founder && (
                <div className="flex gap-4">
                  <div className="w-32 h-36 bg-[#222] rounded-lg flex-shrink-0 flex items-center justify-center border border-[#2a2a2a]">
                    <svg width="48" height="60" viewBox="0 0 48 60" fill="none">
                      <circle cx="24" cy="18" r="12" stroke="#444" strokeWidth="1.5"/>
                      <path d="M4 56c0-11 9-20 20-20s20 9 20 20" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-normal text-white mb-0.5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                      {brand.founder.name}
                    </h3>
                    <p className="text-xs text-[#555] mb-2">Founder · {brand.founder.dates} · Est. {brand.founded_year}, {brand.founded_city}</p>
                    {brand.founder.bio.split('\n\n').map((p: string, i: number) => (
                      <p key={i} className="text-sm text-[#777] leading-relaxed mb-2">{p}</p>
                    ))}
                    <p className="text-xs text-[#555] mt-2">Thierry Hermès ({brand.founder.dates})</p>
                  </div>
                </div>
              )}

              {/* Quote */}
              {brand.quote && (
                <div className="border-l-2 border-[#a58e28] pl-4 py-2">
                  <p className="text-base italic text-[#ccc] mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                    "{brand.quote.text}"
                  </p>
                  <p className="text-xs text-[#555]">{brand.quote.author}</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">HERITAGE TIMELINE</p>
                <div className="space-y-4">
                  {(brand.timeline || []).map((t: any) => (
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
            </div>

            {/* Right */}
            <div className="space-y-6">
              {/* Core values */}
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">CORE VALUES</p>
                <div className="grid grid-cols-2 gap-3">
                  {(brand.values || []).map((v: any) => (
                    <div key={v.title} className="bg-[#222] rounded-lg p-3 border border-[#2a2a2a]">
                      <p className="text-sm font-medium text-white mb-1">{v.title}</p>
                      <p className="text-xs text-[#555] leading-relaxed">{v.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work culture accordion */}
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">WHAT IT'S LIKE TO WORK THERE</p>
                <div className="space-y-2">
                  {(brand.workCulture || []).map((w: any) => (
                    <div key={w.label} className="bg-[#222] rounded-lg border border-[#2a2a2a] overflow-hidden">
                      <button
                        onClick={() => setOpenAccordion(openAccordion === w.label ? null : w.label)}
                        className="w-full flex items-center justify-between px-4 py-3"
                      >
                        <span className="text-xs font-medium text-[#a58e28] tracking-wider">{w.label}</span>
                        <span className="text-[#555] text-lg leading-none">{openAccordion === w.label ? '−' : '+'}</span>
                      </button>
                      {openAccordion === w.label && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-[#777] leading-relaxed">{w.text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coming soon tabs */}
        {(activeTab === 'Career paths' || activeTab === 'Salaries' || activeTab === 'Signals') && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">{activeTab.toUpperCase()}</p>
            <p className="text-sm text-[#444]">Coming in the next phase</p>
          </div>
        )}

      </div>
    </div>
  )
}
