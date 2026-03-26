'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const searches = [
  { id: '1', status: 'ACTIVE', statusColor: '#4CAF50', statusBg: 'rgba(76,175,80,0.1)', statusBorder: 'rgba(76,175,80,0.2)', title: 'Director of retail operations, Europe', location: 'Paris, Europe-wide', salary: '€120K–150K', opened: 'Mar 10', updated: '2h ago', pipeline: [8, 4, 2, 0, 0] },
  { id: '2', status: 'OFFER STAGE', statusColor: '#FF9800', statusBg: 'rgba(255,152,0,0.1)', statusBorder: 'rgba(255,152,0,0.2)', title: 'Head of digital, Europe', location: 'Paris', salary: '€90K–110K', opened: 'Feb 28', updated: 'Today', pipeline: [14, 6, 3, 1, 0] },
  { id: '3', status: 'NEW', statusColor: '#2196F3', statusBg: 'rgba(33,150,243,0.1)', statusBorder: 'rgba(33,150,243,0.2)', title: 'Artisan workshop manager, Normandy', location: 'Normandy, France', salary: '€55K–70K', opened: 'Mar 24', updated: '1d ago', pipeline: [3, 0, 0, 0, 0] },
]

const pipelineStages = ['LONGLIST', 'SCREENING', 'INTERVIEW', 'OFFER', 'PLACED']

const candidates = [
  { initials: 'SM', name: 'Sophie M.', role: 'Director of Retail · 16 yrs exp', stage: 'INTERVIEW', stageColor: '#FF9800', stageBg: 'rgba(255,152,0,0.1)' },
  { initials: 'JP', name: 'Jean-Pierre L.', role: 'Head of Digital · 12 yrs exp', stage: 'OFFER', stageColor: '#4CAF50', stageBg: 'rgba(76,175,80,0.1)' },
  { initials: 'AK', name: 'Amira K.', role: 'Director of Retail · 14 yrs exp', stage: 'SCREENING', stageColor: '#2196F3', stageBg: 'rgba(33,150,243,0.1)' },
]

const signals = [
  { color: '#f44336', text: 'Burberry cuts 400 roles — strong candidates now in market', time: '6h ago' },
  { color: '#FF9800', text: 'Kering CD reshuffle — senior creative talent available', time: '5h ago' },
  { color: '#2196F3', text: 'Richemont YNAP sale — digital talent entering market', time: '2d ago' },
]

const contributions = [
  { icon: '💰', text: 'Salary data · Store Director, Paris · Hermès', status: 'VERIFIED' },
  { icon: '💰', text: 'Salary data · Retail Director, Europe · Hermès', status: 'VERIFIED' },
  { icon: '🏢', text: 'Culture insight · Work environment at Hermès Paris HQ', status: 'VERIFIED' },
  { icon: '🎤', text: 'Interview process · Director level hiring at Hermès', status: 'PENDING' },
]

const benchmarks = [
  { role: 'Store Director · Paris', range: '€85K–110K', trend: '+4% YoY' },
  { role: 'Head of Digital · Paris', range: '€90K–120K', trend: '+7% YoY' },
  { role: 'Retail Director · Europe', range: '€95K–130K', trend: '+3% YoY' },
  { role: 'Workshop Manager · France', range: '€55K–70K', trend: '+2% YoY' },
]

const navItems = [
  { section: 'SEARCHES', items: [{ icon: '⌂', label: 'Overview', id: 'overview', badge: null }, { icon: '◎', label: 'Active searches', id: 'searches', badge: '3' }, { icon: '◉', label: 'Candidate pipeline', id: 'pipeline', badge: null }] },
  { section: 'INTELLIGENCE', items: [{ icon: '⚡', label: 'Market signals', id: 'signals', badge: null }, { icon: '💰', label: 'Salary benchmarks', id: 'benchmarks', badge: null }, { icon: '◫', label: 'Brand page', id: 'brand', badge: null }] },
  { section: 'CONTRIBUTE', items: [{ icon: '✎', label: 'My contributions', id: 'contributions', badge: null }, { icon: '+', label: 'Add salary data', id: 'add-salary', badge: null }, { icon: '+', label: 'Add culture insight', id: 'add-culture', badge: null }, { icon: '+', label: 'Add interview data', id: 'add-interview', badge: null }] },
  { section: 'ACCOUNT', items: [{ icon: '✉', label: 'Inbox', id: 'inbox', badge: '2' }, { icon: '⚙', label: 'Settings', id: 'settings', badge: null }] },
]

export default function BusinessDashboard() {
  const { data: session } = useSession()
  const [activeNav, setActiveNav] = useState('overview')

  return (
    <div className="flex min-h-screen bg-[#1a1a1a]" style={{ marginTop: '-1px' }}>

      {/* Sidebar */}
      <div className="w-[220px] flex-shrink-0 bg-[#111] border-r border-[#222] flex flex-col">
        <div className="px-5 py-5 border-b border-[#222]">
          <span className="text-xs font-semibold tracking-[4px] text-white">JOBLUX.</span>
        </div>
        <div className="px-5 py-4 border-b border-[#222]">
          <div className="w-9 h-9 rounded-full bg-[#2196F3] flex items-center justify-center text-[11px] font-semibold text-white mb-2">HR</div>
          <div className="text-sm text-[#e0e0e0] mb-0.5">Hermès HR Team</div>
          <div className="text-[10px] text-[#2196F3] font-semibold tracking-wider">BUSINESS</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {navItems.map(group => (
            <div key={group.section}>
              <div className="px-5 pt-4 pb-1.5 text-[9px] font-semibold tracking-[2px] text-[#333]">{group.section}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className="w-full flex items-center gap-2.5 px-5 py-2.5 text-xs transition-colors"
                  style={{
                    color: activeNav === item.id ? '#fff' : '#555',
                    background: activeNav === item.id ? '#1e1e1e' : 'transparent',
                    borderLeft: activeNav === item.id ? '2px solid #2196F3' : '2px solid transparent',
                  }}
                >
                  <span className="w-4 text-center text-sm">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#FF9800] text-[#1a1a1a]">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#222]">
          <div className="rounded-lg p-3" style={{ background: 'rgba(165,142,40,0.08)', border: '1px solid rgba(165,142,40,0.2)' }}>
            <p className="text-[11px] text-[#555] leading-relaxed mb-2">Need to discuss a search or brief Mo on a new role?</p>
            <button className="w-full bg-[#a58e28] text-[#1a1a1a] text-[11px] font-semibold py-1.5 rounded">Contact Mo →</button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-xl font-normal text-white mb-1" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Hermès — Search overview</h1>
            <p className="text-sm text-[#555]">Thursday, March 26, 2026 · 3 active searches in progress</p>
          </div>
          <div className="border border-[#2196F3] text-[#2196F3] text-[10px] font-semibold tracking-[2px] px-3 py-1 rounded">BUSINESS</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-7">
          {[['3', 'Active searches', 'Managed by JOBLUX'], ['12', 'Candidates in pipeline', '↑ 3 new this week'], ['1', 'Offer pending', 'Head of Digital · Paris'], ['5', 'Contributions made', 'Salary + culture data']].map(([num, label, sub]) => (
            <div key={label} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-4">
              <div className="text-2xl font-normal text-[#a58e28] mb-1">{num}</div>
              <div className="text-[11px] text-[#555]">{label}</div>
              <div className="text-[11px] text-[#444] mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* Brand strip */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">YOUR BRAND PROFILE</span>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
          <Link href="/brands/hermes" className="text-xs text-[#555] hover:text-[#888]">View on WikiLux →</Link>
        </div>
        <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4 mb-7">
          <div className="w-11 h-11 rounded-full bg-[#2a2a2a] flex items-center justify-center text-base font-medium text-[#888] flex-shrink-0">H</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white mb-0.5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Hermès International</div>
            <div className="text-[11px] text-[#555]">Independent (public: RMS.PA) · Founded 1837, Paris · ~20,000 employees · 47 profile views this month</div>
          </div>
          <button className="text-[11px] text-[#666] border border-[#2a2a2a] rounded-lg px-3 py-1.5 hover:border-[#444] hover:text-[#888] transition-colors">Edit brand page →</button>
        </div>

        {/* Active searches */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">ACTIVE SEARCH ASSIGNMENTS</span>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
        </div>
        <div className="space-y-3 mb-7">
          {searches.map(s => (
            <div key={s.id} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded inline-block mb-2" style={{ background: s.statusBg, color: s.statusColor, border: `1px solid ${s.statusBorder}` }}>{s.status}</span>
                  <div className="text-sm font-medium text-[#e0e0e0] mb-1">{s.title}</div>
                  <div className="flex gap-2 text-[11px] text-[#444]">
                    <span>{s.location}</span><span>·</span><span>{s.salary}</span><span>·</span><span>Opened {s.opened}</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#444]">Updated {s.updated}</div>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {pipelineStages.map((stage, i) => (
                  <div key={stage} className="text-center bg-[#1a1a1a] border border-[#222] rounded-lg py-2">
                    <div className="text-lg font-normal mb-0.5" style={{ color: s.pipeline[i] > 0 && i === 3 ? '#FF9800' : '#fff' }}>{s.pipeline[i]}</div>
                    <div className="text-[9px] text-[#444] tracking-wide">{stage}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Candidates + Signals */}
        <div className="grid grid-cols-2 gap-5 mb-5">
          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">RECENT CANDIDATES</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <button className="text-xs text-[#555]">Full pipeline →</button>
            </div>
            <div className="divide-y divide-[#1e1e1e]">
              {candidates.map(c => (
                <div key={c.name} className="flex items-center py-3">
                  <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-medium text-[#666] mr-3 flex-shrink-0">{c.initials}</div>
                  <div className="flex-1">
                    <div className="text-sm text-[#ccc]">{c.name}</div>
                    <div className="text-[11px] text-[#444]">{c.role}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: c.stageBg, color: c.stageColor }}>{c.stage}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">MARKET SIGNALS</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <Link href="/signals" className="text-xs text-[#555]">All signals →</Link>
            </div>
            <div className="divide-y divide-[#1e1e1e]">
              {signals.map((s, i) => (
                <div key={i} className="flex gap-3 py-3">
                  <span className="w-[6px] h-[6px] rounded-full flex-shrink-0 mt-1" style={{ background: s.color }} />
                  <span className="text-xs text-[#777] flex-1 leading-relaxed">{s.text}</span>
                  <span className="text-[10px] text-[#444] whitespace-nowrap">{s.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contributions + Salary */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">MY CONTRIBUTIONS</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <button className="text-xs text-[#555]">Add data →</button>
            </div>
            <div className="divide-y divide-[#1e1e1e]">
              {contributions.map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style={{ background: 'rgba(165,142,40,0.08)', border: '1px solid rgba(165,142,40,0.15)' }}>{c.icon}</div>
                  <span className="text-xs text-[#777] flex-1">{c.text}</span>
                  <span className="text-[10px] font-semibold" style={{ color: c.status === 'VERIFIED' ? '#4CAF50' : '#FF9800' }}>{c.status}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 border border-dashed border-[#2a2a2a] rounded-lg p-3 text-center">
              <p className="text-[11px] text-[#444] mb-2">Contribute more data to strengthen your brand profile on WikiLux</p>
              <button className="text-[11px] text-[#a58e28] border border-[rgba(165,142,40,0.3)] rounded px-3 py-1">+ Add contribution</button>
            </div>
          </div>

          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">SALARY BENCHMARKS</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <Link href="/careers" className="text-xs text-[#555]">Full data →</Link>
            </div>
            <div className="divide-y divide-[#1e1e1e]">
              {benchmarks.map(b => (
                <div key={b.role} className="flex justify-between items-center py-3">
                  <span className="text-xs text-[#888]">{b.role}</span>
                  <span className="text-xs font-medium text-[#a58e28]">{b.range}</span>
                  <span className="text-[11px] text-[#4CAF50]">{b.trend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
