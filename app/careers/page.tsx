'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const placeholderAssignments = [
  {
    id: '1',
    level: 'DIRECTOR',
    is_new: true,
    title: 'Director of retail operations, Europe',
    body: "A leading French maison with 15+ boutiques across EMEA is seeking a Director to own the retail P&L for Europe. Direct report to VP Retail Global. You'll lead a team of 12 store directors and drive the next phase of boutique expansion into secondary European cities.",
    location: 'Paris (HQ), Europe-wide',
    sector: 'Fashion & leather goods',
    experience: '15+ years experience',
    salary: '€120K–150K',
    salary_note: '+ bonus + car',
    region: 'Europe',
  },
  {
    id: '2',
    level: 'VP',
    is_new: true,
    title: 'VP merchandising, watches & jewelry',
    body: "A Swiss luxury group is building out its US direct-to-consumer strategy. This newly created role will own merchandising across 40+ North American points of sale for two of the world's most recognized watch and jewelry brands. Relocation to NYC supported.",
    location: 'New York',
    sector: 'Watches & jewelry',
    experience: '12+ years experience',
    salary: '$180K–220K',
    salary_note: '+ equity + relocation',
    region: 'Americas',
  },
  {
    id: '3',
    level: 'MANAGER',
    is_new: false,
    title: 'Regional marketing manager, Middle East',
    body: "An Italian fashion house is centralising its Middle East marketing in Dubai. You'll own brand strategy and campaigns across 5 markets (UAE, KSA, Qatar, Kuwait, Bahrain), managing an in-house team of 8 and coordinating with Milan HQ. Arabic fluency is a strong advantage.",
    location: 'Dubai',
    sector: 'Fashion',
    experience: '8+ years experience',
    salary: 'AED 35K–45K',
    salary_note: '/month + housing',
    region: 'Middle East',
  },
  {
    id: '4',
    level: 'C-SUITE',
    is_new: true,
    title: 'Chief merchandising officer, Asia Pacific',
    body: 'A leading multi-brand luxury retailer is appointing its first CMO for the APAC region. Based in Hong Kong, this role will oversee buying and merchandising strategy across 12 markets and 6 brands. Reporting directly to Group CEO.',
    location: 'Hong Kong',
    sector: 'Multi-brand retail',
    experience: '20+ years experience',
    salary: 'HKD 180K–220K',
    salary_note: '/month + bonus',
    region: 'Asia',
  },
]

const salaryRows = [
  { role: 'Store Director', brand: 'Louis Vuitton', location: 'Paris', reports: 24, trend: '+4%', trendPos: true, range: '€85K–110K', blurred: false },
  { role: 'Retail Manager', brand: 'Cartier', location: 'London', reports: 18, trend: '+6%', trendPos: true, range: '£52K–68K', blurred: false },
  { role: 'Buyer, RTW', brand: 'Hermès', location: 'Paris', reports: 11, trend: '—', trendPos: false, range: '€65K–85K', blurred: true },
  { role: 'Marketing Director', brand: 'Gucci', location: 'Milan', reports: 15, trend: '—', trendPos: false, range: '€90K–120K', blurred: true },
  { role: 'VP Merchandising', brand: 'Tiffany', location: 'New York', reports: 8, trend: '+8%', trendPos: true, range: '$140K–180K', blurred: true },
  { role: 'E-commerce Manager', brand: 'Burberry', location: 'London', reports: 12, trend: '—', trendPos: false, range: '£55K–72K', blurred: true },
  { role: 'Store Manager', brand: 'Dior', location: 'Dubai', reports: 9, trend: '+12%', trendPos: true, range: 'AED 28K–38K', blurred: true },
  { role: 'CRM Director', brand: 'Chanel', location: 'Paris', reports: 7, trend: '—', trendPos: false, range: '€95K–130K', blurred: true },
]

const levelFilters = ['All levels', 'Manager', 'Director', 'VP', 'C-suite', 'Europe', 'Americas', 'Asia', 'Middle East']
const regionFilters = ['All regions', 'Europe', 'Americas', 'Asia', 'Middle East']

export default function CareersPage() {
  const [activeTab, setActiveTab] = useState('opportunities')
  const [activeFilter, setActiveFilter] = useState('All levels')
  const [activeRegion, setActiveRegion] = useState('All regions')
  const [assignments, setAssignments] = useState(placeholderAssignments)

  useEffect(() => {
    async function fetchAssignments() {
      const { data } = await supabase
        .from('search_assignments')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      if (data && data.length > 0) setAssignments(data)
    }
    fetchAssignments()
  }, [])

  const filtered = assignments.filter(a => {
    if (activeFilter === 'All levels') return true
    const levelMap: Record<string, string> = {
      Manager: 'MANAGER',
      Director: 'DIRECTOR',
      VP: 'VP',
      'C-suite': 'C-SUITE',
    }
    const regionMap: Record<string, string> = {
      Europe: 'Europe',
      Americas: 'Americas',
      Asia: 'Asia',
      'Middle East': 'Middle East',
    }
    if (levelMap[activeFilter]) return a.level === levelMap[activeFilter]
    if (regionMap[activeFilter]) return a.region === regionMap[activeFilter]
    return true
  })

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-8 pt-10 pb-16">

        <h1 className="text-4xl font-normal text-white mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Careers
        </h1>
        <p className="text-sm text-[#999] mb-6">
          Confidential opportunities, salary intelligence, and interview preparation — everything for your next move.
        </p>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a2a] mb-6 gap-0">
          {[
            { id: 'opportunities', label: 'Assignments', count: String(assignments.length) },
            { id: 'salary', label: 'Salary intelligence', count: '1,840 data points' },
            { id: 'interview', label: 'Interview prep', count: '38 guides' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="pb-3 mr-8 text-sm relative transition-colors whitespace-nowrap"
              style={{ color: activeTab === tab.id ? '#fff' : '#555' }}
            >
              {tab.label}
              <span className="text-[11px] ml-1" style={{ color: '#444' }}>{tab.count}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#a58e28]" />
              )}
            </button>
          ))}
        </div>

        {/* OPPORTUNITIES TAB */}
        {activeTab === 'opportunities' && (
          <div>
            {/* Banner */}
            <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-4 flex items-start gap-4 mb-6">
              <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-base flex-shrink-0">🔒</div>
              <p className="text-xs text-[#999] leading-relaxed">
                <span className="text-[#bbb] font-medium">These are exclusive JOBLUX search assignments.</span> Brand names are disclosed after initial screening to protect the confidentiality of all parties. Every role is verified, active, and at manager level or above.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { num: '52', label: 'Active assignments' },
                { num: '8', label: 'New this week' },
                { num: '14', label: 'Countries' },
                { num: '23', label: 'Brands represented' },
              ].map(s => (
                <div key={s.label} className="bg-[#222] border border-[#2a2a2a] rounded-lg p-4 text-center">
                  <div className="text-2xl font-normal text-[#a58e28] mb-1">{s.num}</div>
                  <div className="text-[11px] text-[#999]">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {levelFilters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="rounded-full px-4 py-1.5 text-xs transition-colors"
                  style={{
                    border: activeFilter === f ? '1px solid #a58e28' : '1px solid #2a2a2a',
                    color: activeFilter === f ? '#a58e28' : '#666',
                    background: 'transparent',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Assignment cards */}
            <div className="space-y-3">
              {filtered.map(a => (
                <div key={a.id} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-[1.5px] text-[#a58e28]">{a.level}</span>
                      {a.is_new && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-[#4CAF50] text-[#4CAF50]" style={{ background: 'rgba(76,175,80,0.08)' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#a58e28]">{a.salary}</div>
                      <div className="text-[11px] text-[#999] mt-0.5">{a.salary_note}</div>
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-white mb-2 leading-snug">{a.title}</h3>
                  <p className="text-sm text-[#999] leading-relaxed mb-3">{a.body}</p>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-[11px] text-[#999]">{a.location}</span>
                    <span className="text-[11px] text-[#777]">·</span>
                    <span className="text-[11px] text-[#999]">{a.sector}</span>
                    <span className="text-[11px] text-[#777]">·</span>
                    <span className="text-[11px] text-[#999]">{a.experience}</span>
                  </div>
                  <span className="text-[10px] text-[#3a3a3a] border border-[#2a2a2a] rounded px-2 py-1">
                    Brand disclosed after screening
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SALARY TAB */}
        {activeTab === 'salary' && (
          <div>
            {/* Hero */}
            <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-10 text-center mb-6">
              <h2 className="text-2xl font-normal text-white mb-3" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                Unlock salary intelligence
              </h2>
              <p className="text-sm text-[#999] leading-relaxed max-w-md mx-auto mb-8">
                Real compensation data contributed by luxury professionals like you. Not estimates — verified numbers from people who actually earn them.
              </p>
              <div className="flex justify-center gap-12 mb-8">
                {[
                  { num: '1', label: 'Share your salary anonymously' },
                  { num: '2', label: 'Data verified by JOBLUX' },
                  { num: '3', label: 'Unlock all salary data' },
                ].map(s => (
                  <div key={s.num} className="text-center">
                    <div className="w-8 h-8 rounded-full border border-[#a58e28] text-[#a58e28] text-sm flex items-center justify-center mx-auto mb-2">
                      {s.num}
                    </div>
                    <div className="text-[11px] text-[#999] max-w-[80px] leading-relaxed">{s.label}</div>
                  </div>
                ))}
              </div>
              <button className="bg-[#a58e28] text-[#1a1a1a] text-sm font-semibold px-7 py-2.5 rounded-lg mb-4 hover:bg-[#c4a832] transition-colors">
                Contribute my salary
              </button>
              <p className="text-[11px] text-[#999] mb-5">Takes 30 seconds. Completely anonymous. Never shared with employers.</p>
              <div className="flex justify-center gap-6">
                {['1,840 verified contributions', '92 brands covered', '14 countries'].map(s => (
                  <span key={s} className="text-[11px] text-[#999] flex items-center gap-1">
                    <span className="text-[#a58e28]">•</span> {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#888]">Preview — top searched roles</span>
              <div className="flex gap-2">
                {regionFilters.map(r => (
                  <button
                    key={r}
                    onClick={() => setActiveRegion(r)}
                    className="text-[11px] px-3 py-1 rounded transition-colors"
                    style={{
                      background: activeRegion === r ? '#a58e28' : 'transparent',
                      border: activeRegion === r ? '1px solid #a58e28' : '1px solid #2a2a2a',
                      color: activeRegion === r ? '#1a1a1a' : '#555',
                      fontWeight: activeRegion === r ? '600' : '400',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  {['ROLE', 'BRAND', 'LOCATION', 'REPORTS', 'TREND', 'RANGE'].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold tracking-[1.5px] text-[#999] pb-3 px-3 last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salaryRows.map((row, i) => (
                  <tr key={i} className="border-b border-[#1e1e1e] hover:bg-[#1e1e1e]">
                    <td className="py-3.5 px-3 text-sm text-[#ccc]">{row.role}</td>
                    <td className="py-3.5 px-3 text-sm text-[#888]">{row.brand}</td>
                    <td className="py-3.5 px-3 text-sm text-[#888]">{row.location}</td>
                    <td className="py-3.5 px-3 text-sm text-[#888]">{row.reports}</td>
                    <td className="py-3.5 px-3 text-sm font-medium" style={{ color: row.trendPos ? '#4CAF50' : '#555' }}>{row.trend}</td>
                    <td
                      className="py-3.5 px-3 text-sm font-medium text-right"
                      style={{
                        color: row.blurred ? 'transparent' : '#a58e28',
                        textShadow: row.blurred ? '0 0 8px #a58e28' : 'none',
                        filter: row.blurred ? 'blur(4px)' : 'none',
                        userSelect: row.blurred ? 'none' : 'auto',
                      }}
                    >
                      {row.range}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INTERVIEW TAB */}
        {activeTab === 'interview' && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">INTERVIEW PREP</p>
            <p className="text-sm text-[#999]">Coming in the next phase</p>
          </div>
        )}

      </div>
    </div>
  )
}
