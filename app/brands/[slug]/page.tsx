'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

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
  unsplashImages: [
    {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      photographer: 'Anomaly',
      photographer_url: 'https://unsplash.com/@anomaly?utm_source=joblux&utm_medium=referral',
      unsplash_url: 'https://unsplash.com/photos/fashion?utm_source=joblux&utm_medium=referral',
    },
    {
      url: 'https://images.unsplash.com/photo-1605517288786-8e9b35f9e6e3?w=600&q=80',
      photographer: 'Carla Oliveira',
      photographer_url: 'https://unsplash.com/@carla?utm_source=joblux&utm_medium=referral',
      unsplash_url: 'https://unsplash.com/photos/atelier?utm_source=joblux&utm_medium=referral',
    },
  ],
}

function getInitials(name: string) {
  const words = name.split(' ')
  if (words.length === 1) return name.slice(0, 2)
  return words.slice(0, 2).map((w: string) => w[0]).join('')
}

// SVG illustration: Carré scarf
function IllustrationCarre() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect x="20" y="10" width="120" height="120" rx="1" fill="none" stroke="#a58e28" strokeWidth="1.2"/>
      <rect x="26" y="16" width="108" height="108" rx="1" fill="none" stroke="#a58e28" strokeWidth="0.4" opacity="0.45"/>
      <rect x="32" y="22" width="96" height="96" rx="1" fill="none" stroke="#a58e28" strokeWidth="0.3" opacity="0.25"/>
      {/* Corner flourishes */}
      <path d="M20 32 Q27 25 34 18" fill="none" stroke="#a58e28" strokeWidth="0.6" opacity="0.6"/>
      <path d="M126 18 Q133 25 140 32" fill="none" stroke="#a58e28" strokeWidth="0.6" opacity="0.6"/>
      <path d="M20 108 Q27 115 34 122" fill="none" stroke="#a58e28" strokeWidth="0.6" opacity="0.6"/>
      <path d="M140 108 Q133 115 126 122" fill="none" stroke="#a58e28" strokeWidth="0.6" opacity="0.6"/>
      {/* Central medallion */}
      <circle cx="80" cy="70" r="28" fill="none" stroke="#a58e28" strokeWidth="0.6" opacity="0.4"/>
      <circle cx="80" cy="70" r="20" fill="none" stroke="#a58e28" strokeWidth="0.4" opacity="0.3"/>
      {/* Chain link motif */}
      <ellipse cx="80" cy="42" rx="5" ry="7" fill="none" stroke="#a58e28" strokeWidth="0.8" opacity="0.55"/>
      <ellipse cx="80" cy="98" rx="5" ry="7" fill="none" stroke="#a58e28" strokeWidth="0.8" opacity="0.55"/>
      <ellipse cx="52" cy="70" rx="7" ry="5" fill="none" stroke="#a58e28" strokeWidth="0.8" opacity="0.55"/>
      <ellipse cx="108" cy="70" rx="7" ry="5" fill="none" stroke="#a58e28" strokeWidth="0.8" opacity="0.55"/>
      {/* Border tick marks */}
      <line x1="20" y1="44" x2="20" y2="50" stroke="#a58e28" strokeWidth="0.4" opacity="0.35"/>
      <line x1="20" y1="56" x2="20" y2="62" stroke="#a58e28" strokeWidth="0.4" opacity="0.35"/>
      <line x1="20" y1="78" x2="20" y2="84" stroke="#a58e28" strokeWidth="0.4" opacity="0.35"/>
      <line x1="20" y1="90" x2="20" y2="96" stroke="#a58e28" strokeWidth="0.4" opacity="0.35"/>
      <line x1="140" y1="44" x2="140" y2="50" stroke="#a58e28" strokeWidth="0.4" opacity="0.35"/>
      <line x1="140" y1="56" x2="140" y2="62" stroke="#a58e28" strokeWidth="0.4" opacity="0.35"/>
      <line x1="140" y1="78" x2="140" y2="84" stroke="#a58e28" strokeWidth="0.4" opacity="0.35"/>
      <line x1="140" y1="90" x2="140" y2="96" stroke="#a58e28" strokeWidth="0.4" opacity="0.35"/>
      <text x="80" y="148" fontFamily="Georgia, serif" fontStyle="italic" fontSize="11" fill="#a58e28" opacity="0.75" textAnchor="middle">Le Carré, 1937</text>
    </svg>
  )
}

// SVG illustration: Birkin bag
function IllustrationBirkin() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {/* Bag body */}
      <path d="M30 62 Q30 130 30 134 Q30 142 38 142 Q100 142 162 142 Q170 142 170 134 L170 62 Z" fill="none" stroke="#a58e28" strokeWidth="1.4"/>
      {/* Top flap */}
      <path d="M30 62 Q100 46 170 62" fill="none" stroke="#a58e28" strokeWidth="1.4"/>
      {/* Flap inner line */}
      <path d="M38 66 Q100 52 162 66" fill="none" stroke="#a58e28" strokeWidth="0.4" opacity="0.45"/>
      {/* Turn lock */}
      <rect x="86" y="54" width="28" height="18" rx="2.5" fill="none" stroke="#a58e28" strokeWidth="1"/>
      <circle cx="100" cy="63" r="4" fill="none" stroke="#a58e28" strokeWidth="0.7"/>
      <line x1="100" y1="59" x2="100" y2="54" stroke="#a58e28" strokeWidth="0.6"/>
      {/* Handle */}
      <path d="M56 62 C56 34 144 34 144 62" fill="none" stroke="#a58e28" strokeWidth="1.4" strokeLinecap="round"/>
      {/* Handle rings */}
      <circle cx="56" cy="62" r="4" fill="none" stroke="#a58e28" strokeWidth="0.9"/>
      <circle cx="144" cy="62" r="4" fill="none" stroke="#a58e28" strokeWidth="0.9"/>
      {/* Saddle stitch sides */}
      <line x1="34" y1="68" x2="34" y2="138" stroke="#a58e28" strokeWidth="0.4" opacity="0.4" strokeDasharray="3 3"/>
      <line x1="166" y1="68" x2="166" y2="138" stroke="#a58e28" strokeWidth="0.4" opacity="0.4" strokeDasharray="3 3"/>
      {/* Subtle shading */}
      <line x1="42" y1="76" x2="42" y2="136" stroke="#a58e28" strokeWidth="0.2" opacity="0.12"/>
      <line x1="56" y1="70" x2="56" y2="138" stroke="#a58e28" strokeWidth="0.2" opacity="0.12"/>
      <line x1="144" y1="70" x2="144" y2="138" stroke="#a58e28" strokeWidth="0.2" opacity="0.12"/>
      <line x1="158" y1="76" x2="158" y2="136" stroke="#a58e28" strokeWidth="0.2" opacity="0.12"/>
      {/* Bottom gusset line */}
      <line x1="32" y1="138" x2="168" y2="138" stroke="#a58e28" strokeWidth="0.4" opacity="0.3"/>
      <text x="100" y="155" fontFamily="Georgia, serif" fontStyle="italic" fontSize="11" fill="#a58e28" opacity="0.75" textAnchor="middle">Birkin, 1984</text>
    </svg>
  )
}

export default function BrandDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [activeTab, setActiveTab] = useState('Overview')
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
            <div className="space-y-4">
              <div className="bg-[#222] rounded-xl p-4">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">LEADERSHIP</p>
                <div className="space-y-3">
                  {(brand.leadership || []).map((l: any) => (
                    <div key={l.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-medium text-[#666] flex-shrink-0">{l.initials}</div>
                      <div className="flex-1">
                        <div className="text-sm text-white">{l.name}</div>
                        <div className="text-[11px] text-[#555]">{l.role}</div>
                      </div>
                      <div className="text-[11px] text-[#555]">Since {l.since}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#222] rounded-xl p-4">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SALARY RANGES AT {brand.name.toUpperCase()}</p>
                <div className="space-y-2">
                  {(brand.salaries || []).map((s: any) => (
                    <div key={s.role} className="flex justify-between items-center">
                      <span className="text-xs text-[#888]">{s.role}</span>
                      <span className="text-xs font-medium" style={{ color: s.blurred ? 'transparent' : '#a58e28', textShadow: s.blurred ? '0 0 8px #a58e28' : 'none', filter: s.blurred ? 'blur(4px)' : 'none', userSelect: s.blurred ? 'none' : 'auto' }}>{s.range}</span>
                    </div>
                  ))}
                </div>
                <a href="/careers" className="block mt-3 text-xs text-[#a58e28] hover:underline">Contribute your salary to see all →</a>
              </div>
              <div className="bg-[#222] rounded-xl p-4">
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">FINANCIAL HEALTH</p>
                {brand.financial && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-xs text-[#555]">Stock</span><span className="text-xs text-[#888]">{brand.financial.stock}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-[#555]">Revenue</span><span className="text-xs text-[#888]">{brand.financial.revenue}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-[#555]">Operating margin</span><span className="text-xs text-[#888]">{brand.financial.margin}</span></div>
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
                    <p className="text-xs text-[#555] mb-2">Founder · {brand.founder.dates} · Est. {brand.founded_year}, {brand.founded_city}</p>
                    {brand.founder.bio.split('\n\n').map((p: string, i: number) => (
                      <p key={i} className="text-sm text-[#777] leading-relaxed mb-2">{p}</p>
                    ))}
                    <p className="text-xs text-[#555] mt-2">Thierry Hermès ({brand.founder.dates})</p>
                  </div>
                </div>
              )}
              {brand.quote && (
                <div className="border-l-2 border-[#a58e28] pl-4 py-2">
                  <p className="text-base italic text-[#ccc] mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>"{brand.quote.text}"</p>
                  <p className="text-xs text-[#555]">{brand.quote.author}</p>
                </div>
              )}
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

            {/* Right col */}
            <div className="space-y-6">
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

              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">WHAT IT'S LIKE TO WORK THERE</p>
                <div className="space-y-2">
                  {(brand.workCulture || []).map((w: any) => (
                    <div key={w.label} className="bg-[#222] rounded-lg border border-[#2a2a2a] overflow-hidden">
                      <button onClick={() => setOpenAccordion(openAccordion === w.label ? null : w.label)} className="w-full flex items-center justify-between px-4 py-3">
                        <span className="text-xs font-medium text-[#a58e28] tracking-wider">{w.label}</span>
                        <span className="text-[#555] text-lg leading-none">{openAccordion === w.label ? '−' : '+'}</span>
                      </button>
                      {openAccordion === w.label && (
                        <div className="px-4 pb-4"><p className="text-sm text-[#777] leading-relaxed">{w.text}</p></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* MAISON WORLD — 3 atelier illustrations */}
              <div>
                <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">MAISON WORLD</p>
                <div className="grid grid-cols-3 gap-[3px] rounded-lg overflow-hidden border border-[#2a2a2a]">
                  <div className="aspect-square flex items-center justify-center p-2" style={{ background: '#e8d8d0' }}>
                    <svg width="100%" height="100%" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg">
                      <rect x="8" y="8" width="184" height="184" rx="1" fill="none" stroke="#2c3e50" strokeWidth="1.8"/>
                      <rect x="14" y="14" width="172" height="172" rx="1" fill="none" stroke="#2c3e50" strokeWidth="0.6" opacity="0.5"/>
                      <rect x="20" y="20" width="160" height="160" rx="1" fill="none" stroke="#2c3e50" strokeWidth="0.3" opacity="0.28"/>
                      <path d="M8 26 Q12 10 26 8" fill="none" stroke="#2c3e50" strokeWidth="0.9" opacity="0.65"/>
                      <path d="M174 8 Q188 12 192 26" fill="none" stroke="#2c3e50" strokeWidth="0.9" opacity="0.65"/>
                      <path d="M8 174 Q12 190 26 192" fill="none" stroke="#2c3e50" strokeWidth="0.9" opacity="0.65"/>
                      <path d="M192 174 Q188 190 174 192" fill="none" stroke="#2c3e50" strokeWidth="0.9" opacity="0.65"/>
                      <path d="M8 18 L18 8 L28 18 L18 28 Z" fill="none" stroke="#2c3e50" strokeWidth="0.6" opacity="0.55"/>
                      <path d="M172 8 L182 18 L192 8 L182 -2" fill="none" stroke="#2c3e50" strokeWidth="0.6" opacity="0.55"/>
                      <path d="M8 172 L18 182 L28 172 L18 162 Z" fill="none" stroke="#2c3e50" strokeWidth="0.6" opacity="0.55"/>
                      <circle cx="100" cy="100" r="48" fill="none" stroke="#2c3e50" strokeWidth="0.8" opacity="0.4"/>
                      <circle cx="100" cy="100" r="38" fill="none" stroke="#2c3e50" strokeWidth="0.4" opacity="0.25"/>
                      <ellipse cx="100" cy="52" rx="6" ry="9" fill="none" stroke="#2c3e50" strokeWidth="1"/>
                      <ellipse cx="100" cy="148" rx="6" ry="9" fill="none" stroke="#2c3e50" strokeWidth="1"/>
                      <ellipse cx="52" cy="100" rx="9" ry="6" fill="none" stroke="#2c3e50" strokeWidth="1"/>
                      <ellipse cx="148" cy="100" rx="9" ry="6" fill="none" stroke="#2c3e50" strokeWidth="1"/>
                      <circle cx="72" cy="72" r="5.5" fill="none" stroke="#2c3e50" strokeWidth="0.75"/>
                      <circle cx="128" cy="72" r="5.5" fill="none" stroke="#2c3e50" strokeWidth="0.75"/>
                      <circle cx="72" cy="128" r="5.5" fill="none" stroke="#2c3e50" strokeWidth="0.75"/>
                      <circle cx="128" cy="128" r="5.5" fill="none" stroke="#2c3e50" strokeWidth="0.75"/>
                      <line x1="36" y1="8" x2="36" y2="18" stroke="#2c3e50" strokeWidth="0.4" opacity="0.3"/>
                      <line x1="64" y1="8" x2="64" y2="18" stroke="#2c3e50" strokeWidth="0.4" opacity="0.3"/>
                      <line x1="100" y1="8" x2="100" y2="18" stroke="#2c3e50" strokeWidth="0.4" opacity="0.3"/>
                      <line x1="136" y1="8" x2="136" y2="18" stroke="#2c3e50" strokeWidth="0.4" opacity="0.3"/>
                      <line x1="164" y1="8" x2="164" y2="18" stroke="#2c3e50" strokeWidth="0.4" opacity="0.3"/>
                      <line x1="8" y1="52" x2="18" y2="52" stroke="#2c3e50" strokeWidth="0.4" opacity="0.3"/>
                      <line x1="8" y1="100" x2="18" y2="100" stroke="#2c3e50" strokeWidth="0.4" opacity="0.3"/>
                      <line x1="8" y1="148" x2="18" y2="148" stroke="#2c3e50" strokeWidth="0.4" opacity="0.3"/>
                      <text x="100" y="205" fontFamily="Georgia, serif" fontStyle="italic" fontSize="11" fill="#2c3e50" opacity="0.8" textAnchor="middle">Le Carré, 1937</text>
                    </svg>
                  </div>
                  <div className="aspect-square flex items-center justify-center p-2" style={{ background: '#e8d8d0' }}>
                    <svg width="100%" height="100%" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 82 Q24 165 24 170 Q24 178 36 178 Q100 178 164 178 Q176 178 176 170 L176 82 Z" fill="none" stroke="#2c3e50" strokeWidth="1.8"/>
                      <path d="M24 82 Q100 62 176 82" fill="none" stroke="#2c3e50" strokeWidth="1.8"/>
                      <path d="M32 86 Q100 68 168 86" fill="none" stroke="#2c3e50" strokeWidth="0.5" opacity="0.4"/>
                      <path d="M40 89 Q100 73 160 89" fill="none" stroke="#2c3e50" strokeWidth="0.3" opacity="0.22"/>
                      <rect x="80" y="70" width="40" height="24" rx="3.5" fill="#e8d8d0" stroke="#2c3e50" strokeWidth="1.1"/>
                      <rect x="85" y="75" width="30" height="14" rx="2" fill="none" stroke="#2c3e50" strokeWidth="0.45" opacity="0.5"/>
                      <circle cx="100" cy="82" r="5.5" fill="none" stroke="#2c3e50" strokeWidth="0.9"/>
                      <circle cx="100" cy="82" r="2.5" fill="none" stroke="#2c3e50" strokeWidth="0.4" opacity="0.5"/>
                      <line x1="100" y1="77" x2="100" y2="70" stroke="#2c3e50" strokeWidth="0.7"/>
                      <path d="M52 82 C52 46 148 46 148 82" fill="none" stroke="#2c3e50" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M56 82 C56 51 144 51 144 82" fill="none" stroke="#2c3e50" strokeWidth="0.5" opacity="0.38" strokeLinecap="round"/>
                      <circle cx="52" cy="82" r="5.5" fill="#e8d8d0" stroke="#2c3e50" strokeWidth="1.1"/>
                      <circle cx="148" cy="82" r="5.5" fill="#e8d8d0" stroke="#2c3e50" strokeWidth="1.1"/>
                      <line x1="28" y1="88" x2="28" y2="174" stroke="#2c3e50" strokeWidth="0.55" opacity="0.4" strokeDasharray="4 3"/>
                      <line x1="172" y1="88" x2="172" y2="174" stroke="#2c3e50" strokeWidth="0.55" opacity="0.4" strokeDasharray="4 3"/>
                      <line x1="40" y1="96" x2="40" y2="174" stroke="#2c3e50" strokeWidth="0.22" opacity="0.18"/>
                      <line x1="56" y1="90" x2="56" y2="176" stroke="#2c3e50" strokeWidth="0.22" opacity="0.14"/>
                      <line x1="144" y1="90" x2="144" y2="176" stroke="#2c3e50" strokeWidth="0.22" opacity="0.14"/>
                      <line x1="160" y1="96" x2="160" y2="174" stroke="#2c3e50" strokeWidth="0.22" opacity="0.18"/>
                      <line x1="26" y1="173" x2="174" y2="173" stroke="#2c3e50" strokeWidth="0.55" opacity="0.38"/>
                      <circle cx="42" cy="176" r="3" fill="#e8d8d0" stroke="#2c3e50" strokeWidth="0.8"/>
                      <circle cx="158" cy="176" r="3" fill="#e8d8d0" stroke="#2c3e50" strokeWidth="0.8"/>
                      <text x="100" y="200" fontFamily="Georgia, serif" fontStyle="italic" fontSize="11" fill="#2c3e50" opacity="0.8" textAnchor="middle">Birkin, 1984</text>
                    </svg>
                  </div>
                  <div className="aspect-square flex items-center justify-center p-2" style={{ background: '#e8d8d0' }}>
                    <svg width="100%" height="100%" viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg">
                      <path d="M36 36 Q100 24 164 36" fill="none" stroke="#2c3e50" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M36 42 Q100 30 164 42" fill="none" stroke="#2c3e50" strokeWidth="0.55" opacity="0.38"/>
                      <path d="M38 39 Q100 27 162 39" fill="none" stroke="#2c3e50" strokeWidth="0.28" opacity="0.18" strokeDasharray="3 3"/>
                      <path d="M44 50 Q100 42 156 50" fill="none" stroke="#2c3e50" strokeWidth="1.3"/>
                      <path d="M44 56 Q100 48 156 56" fill="none" stroke="#2c3e50" strokeWidth="0.38" opacity="0.32"/>
                      <line x1="40" y1="38" x2="32" y2="106" stroke="#2c3e50" strokeWidth="1.8"/>
                      <line x1="46" y1="38" x2="38" y2="106" stroke="#2c3e50" strokeWidth="0.55" opacity="0.38"/>
                      <line x1="160" y1="38" x2="168" y2="106" stroke="#2c3e50" strokeWidth="1.8"/>
                      <line x1="154" y1="38" x2="162" y2="106" stroke="#2c3e50" strokeWidth="0.55" opacity="0.38"/>
                      <path d="M34 78 Q100 68 166 78" fill="none" stroke="#2c3e50" strokeWidth="1.3"/>
                      <path d="M34 84 Q100 74 166 84" fill="none" stroke="#2c3e50" strokeWidth="0.38" opacity="0.32"/>
                      <circle cx="32" cy="110" r="15" fill="none" stroke="#2c3e50" strokeWidth="1.5"/>
                      <circle cx="32" cy="110" r="10" fill="none" stroke="#2c3e50" strokeWidth="0.5" opacity="0.38"/>
                      <circle cx="32" cy="110" r="5" fill="none" stroke="#2c3e50" strokeWidth="0.35" opacity="0.25"/>
                      <line x1="19" y1="97" x2="45" y2="123" stroke="#2c3e50" strokeWidth="0.22" opacity="0.14"/>
                      <line x1="19" y1="104" x2="43" y2="128" stroke="#2c3e50" strokeWidth="0.22" opacity="0.14"/>
                      <circle cx="168" cy="110" r="15" fill="none" stroke="#2c3e50" strokeWidth="1.5"/>
                      <circle cx="168" cy="110" r="10" fill="none" stroke="#2c3e50" strokeWidth="0.5" opacity="0.38"/>
                      <circle cx="168" cy="110" r="5" fill="none" stroke="#2c3e50" strokeWidth="0.35" opacity="0.25"/>
                      <line x1="155" y1="97" x2="181" y2="123" stroke="#2c3e50" strokeWidth="0.22" opacity="0.14"/>
                      <line x1="155" y1="104" x2="179" y2="128" stroke="#2c3e50" strokeWidth="0.22" opacity="0.14"/>
                      <rect x="29" y="64" width="10" height="14" rx="1.5" fill="#e8d8d0" stroke="#2c3e50" strokeWidth="0.85"/>
                      <line x1="34" y1="64" x2="34" y2="78" stroke="#2c3e50" strokeWidth="0.5"/>
                      <rect x="161" y="64" width="10" height="14" rx="1.5" fill="#e8d8d0" stroke="#2c3e50" strokeWidth="0.85"/>
                      <line x1="166" y1="64" x2="166" y2="78" stroke="#2c3e50" strokeWidth="0.5"/>
                      <path d="M17 110 Q10 132 20 150 Q30 166 50 164" fill="none" stroke="#2c3e50" strokeWidth="1.1" strokeLinecap="round"/>
                      <path d="M19 110 Q13 131 22 148 Q32 163 50 161" fill="none" stroke="#2c3e50" strokeWidth="0.38" opacity="0.32"/>
                      <path d="M183 110 Q190 132 180 150 Q170 166 150 164" fill="none" stroke="#2c3e50" strokeWidth="1.1" strokeLinecap="round"/>
                      <path d="M181 110 Q187 131 178 148 Q168 163 150 161" fill="none" stroke="#2c3e50" strokeWidth="0.38" opacity="0.32"/>
                      <ellipse cx="100" cy="108" rx="14" ry="8" fill="none" stroke="#2c3e50" strokeWidth="1"/>
                      <ellipse cx="100" cy="108" rx="10" ry="5" fill="none" stroke="#2c3e50" strokeWidth="0.38" opacity="0.38"/>
                      <text x="100" y="200" fontFamily="Georgia, serif" fontStyle="italic" fontSize="11" fill="#2c3e50" opacity="0.8" textAnchor="middle">Sellerie, 1837</text>
                    </svg>
                  </div>
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
