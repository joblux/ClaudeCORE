'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const contributionQueue = [
  { id: '1', type: 'SALARY DATA', typeColor: '#a58e28', typeBg: 'rgba(165,142,40,0.1)', typeBorder: 'rgba(165,142,40,0.2)', title: 'VP Merchandising · Paris · Hermès', meta: '€95K–120K · Awaiting verification', status: 'Under review', statusColor: '#FF9800', verified: false },
  { id: '2', type: 'CULTURE INSIGHT', typeColor: '#4CAF50', typeBg: 'rgba(76,175,80,0.1)', typeBorder: 'rgba(76,175,80,0.2)', title: 'Work culture at LVMH Fashion Group, Paris', meta: 'Published on WikiLux · 234 views', status: 'Verified', statusColor: '#4CAF50', verified: true },
  { id: '3', type: 'INTERVIEW DATA', typeColor: '#2196F3', typeBg: 'rgba(33,150,243,0.1)', typeBorder: 'rgba(33,150,243,0.2)', title: 'Director-level interview process · Cartier Paris', meta: 'Published on Careers · 612 views', status: 'Verified', statusColor: '#4CAF50', verified: true },
]

const editorialItems = [
  { id: '1', title: 'Why the next wave of luxury talent will come from hospitality, not fashion', status: 'UNDER REVIEW', statusColor: '#FF9800', statusBg: 'rgba(255,152,0,0.1)', date: 'Submitted Mar 24', views: null, isDraft: false },
  { id: '2', title: 'The Richemont management school — why its alumni are in demand everywhere', status: 'PUBLISHED', statusColor: '#4CAF50', statusBg: 'rgba(76,175,80,0.1)', date: 'Mar 10, 2026', views: '1,243 views', isDraft: false },
  { id: '3', title: 'What Hermès really looks for in senior hires — an insider perspective', status: 'PUBLISHED', statusColor: '#4CAF50', statusBg: 'rgba(76,175,80,0.1)', date: 'Feb 28, 2026', views: '892 views', isDraft: false },
  { id: '4', title: 'Draft — The LVMH vs Kering career path debate', status: 'DRAFT', statusColor: '#666', statusBg: 'rgba(96,96,96,0.2)', date: 'Last edited Mar 25', views: null, isDraft: true },
]

const signalComments = [
  { id: '1', signalColor: '#FF9800', signal: 'Kering appoints Blazy as CD of Chanel', comment: '"This is the most significant cross-group move in a decade. Expect Bottega to struggle for 18 months while a new creative vision is established..."', views: '312 views' },
  { id: '2', signalColor: '#f44336', signal: 'Burberry confirms 400 role reductions', comment: '"The cuts are deeper than reported. HQ functions are affected but so are regional director roles in EMEA. If you\'re at manager level in London..."', views: '487 views' },
]

const impactStats = [
  { label: 'Contributions verified', value: '11 / 12', delta: null },
  { label: 'Salary data points', value: '8 entries', delta: '+2 this month' },
  { label: 'Culture insights', value: '2 published', delta: null },
  { label: 'Interview guides', value: '2 published', delta: null },
  { label: 'Total data views', value: '1,847', delta: '↑ 12%' },
  { label: 'Insider rank', value: 'Top 15%', delta: null, highlight: true },
]

const navItems = [
  { section: 'DASHBOARD', items: [{ icon: '⌂', label: 'Overview', id: 'overview', badge: null }, { icon: '◎', label: 'My contributions', id: 'contributions', badge: '12' }, { icon: '✎', label: 'Editorial queue', id: 'editorial', badgeGold: '2' }, { icon: '📊', label: 'Impact tracker', id: 'impact', badge: null }] },
  { section: 'CONTRIBUTE', items: [{ icon: '+', label: 'Add salary data', id: 'add-salary', badge: null }, { icon: '+', label: 'Add culture insight', id: 'add-culture', badge: null }, { icon: '+', label: 'Add interview data', id: 'add-interview', badge: null }, { icon: '✍', label: 'Write Insider voice', id: 'write', badge: null }, { icon: '💬', label: 'Comment on signal', id: 'comment', badge: null }] },
  { section: 'EXPLORE', items: [{ icon: '⚡', label: 'Signals', id: 'signals-link', badge: null }, { icon: '◫', label: 'Brands', id: 'brands-link', badge: null }, { icon: '◷', label: 'Events', id: 'events-link', badge: null }] },
  { section: 'ACCOUNT', items: [{ icon: '✉', label: 'Inbox', id: 'inbox', badge: '1' }, { icon: '⚙', label: 'Settings', id: 'settings', badge: null }] },
]

export default function InsiderDashboard() {
  const { data: session } = useSession()
  const [activeNav, setActiveNav] = useState('overview')
  const firstName = (session?.user?.name || 'there').split(' ')[0]

  return (
    <div className="flex min-h-screen bg-[#1a1a1a]">

      {/* Sidebar */}
      <div className="w-[220px] flex-shrink-0 bg-[#111] border-r border-[#222] flex flex-col">
        <div className="px-5 py-5 border-b border-[#222]">
          <span className="text-xs font-semibold tracking-[4px] text-white">JOBLUX.</span>
        </div>
        <div className="px-5 py-4 border-b border-[#222]">
          <div className="w-9 h-9 rounded-full bg-[#9C27B0] flex items-center justify-center text-[11px] font-semibold text-white mb-2">JD</div>
          <div className="text-sm text-[#e0e0e0] mb-0.5">{firstName}</div>
          <div className="text-[10px] text-[#9C27B0] font-semibold tracking-wider">INSIDER CONTRIBUTOR</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {navItems.map(group => (
            <div key={group.section}>
              <div className="px-5 pt-4 pb-1.5 text-[9px] font-semibold tracking-[2px] text-[#333]">{group.section}</div>
              {group.items.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className="w-full flex items-center gap-2.5 px-5 py-2.5 text-xs transition-colors"
                  style={{
                    color: activeNav === item.id ? '#fff' : '#555',
                    background: activeNav === item.id ? '#1e1e1e' : 'transparent',
                    borderLeft: activeNav === item.id ? '2px solid #9C27B0' : '2px solid transparent',
                  }}
                >
                  <span className="w-4 text-center text-sm">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#9C27B0] text-white">{item.badge}</span>}
                  {item.badgeGold && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#a58e28] text-[#1a1a1a]">{item.badgeGold}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#222]">
          <div className="rounded-lg p-3" style={{ background: 'rgba(156,39,176,0.08)', border: '1px solid rgba(156,39,176,0.2)' }}>
            <p className="text-[11px] text-[#555] leading-relaxed mb-2">Your contributions power the JOBLUX intelligence engine.</p>
            <button className="w-full bg-[#9C27B0] text-white text-[11px] font-semibold py-1.5 rounded">+ Add contribution</button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-xl font-normal text-white mb-1" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Welcome back, {firstName}</h1>
            <p className="text-sm text-[#555]">Thursday, March 26, 2026 · Your intelligence contributions at a glance</p>
          </div>
          <div className="border border-[#9C27B0] text-[#9C27B0] text-[10px] font-semibold tracking-[2px] px-3 py-1 rounded">INSIDER CONTRIBUTOR</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-7">
          {[['12', 'Total contributions', 'Salary, culture, interview'], ['847', 'Data points unlocked', 'By your contributions'], ['3', 'Articles published', 'Insider voice'], ['2.4K', 'Article views', '↑ 18% this month']].map(([num, label, sub]) => (
            <div key={label} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-4">
              <div className="text-2xl font-normal text-[#a58e28] mb-1">{num}</div>
              <div className="text-[11px] text-[#555]">{label}</div>
              <div className="text-[11px] text-[#444] mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* Contribution queue + Impact tracker */}
        <div className="grid grid-cols-[2fr_1fr] gap-5 mb-5">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">CONTRIBUTION QUEUE</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <button className="text-xs text-[#555]">View all →</button>
            </div>
            <div className="space-y-3">
              {contributionQueue.map(c => (
                <div key={c.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded" style={{ background: c.typeBg, color: c.typeColor, border: `1px solid ${c.typeBorder}` }}>{c.type}</span>
                    <span className="text-[11px]" style={{ color: c.statusColor }}>{c.status}</span>
                  </div>
                  <div className="text-sm text-[#ccc] mb-1 font-medium">{c.title}</div>
                  <div className="text-[11px] text-[#444] mb-3">{c.meta}</div>
                  {c.verified ? (
                    <button className="text-[11px] text-[#a58e28] border border-[rgba(165,142,40,0.3)] rounded px-3 py-1">View →</button>
                  ) : (
                    <span className="text-[11px] text-[#FF9800]">Under review by JOBLUX</span>
                  )}
                </div>
              ))}
              <div className="border border-dashed border-[#2a2a2a] rounded-lg p-3 text-center">
                <p className="text-[11px] text-[#444] mb-2">Add more data to strengthen the platform and your Insider status</p>
                <div className="flex gap-2 justify-center">
                  {['+ Salary', '+ Culture', '+ Interview'].map(t => (
                    <button key={t} className="text-[11px] text-[#555] border border-[#2a2a2a] rounded px-2 py-1 hover:border-[#a58e28] hover:text-[#a58e28] transition-colors">{t}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">IMPACT TRACKER</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
            </div>
            <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-4">
              {impactStats.map(s => (
                <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-[#1e1e1e] last:border-b-0">
                  <span className="text-xs text-[#777]">{s.label}</span>
                  <div className="text-right">
                    <span className="text-xs font-medium" style={{ color: s.highlight ? '#9C27B0' : '#e0e0e0' }}>{s.value}</span>
                    {s.delta && <span className="text-[10px] text-[#4CAF50] ml-2">{s.delta}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editorial queue + Signal commentary */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">EDITORIAL QUEUE</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <button className="text-xs text-[#555]">Write new →</button>
            </div>
            <div className="divide-y divide-[#1e1e1e]">
              {editorialItems.map(e => (
                <div key={e.id} className="py-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs text-[#ccc] leading-snug flex-1 mr-3">{e.title}</div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded flex-shrink-0" style={{ background: e.statusBg, color: e.statusColor }}>{e.status}</span>
                  </div>
                  <div className="flex gap-2 text-[11px] text-[#444]">
                    <span>{e.date}</span>
                    {e.views && <><span>·</span><span className="text-[#a58e28]">{e.views}</span></>}
                  </div>
                  {e.isDraft && (
                    <button className="mt-2 bg-[#9C27B0] text-white text-[11px] font-semibold px-3 py-1 rounded">Continue writing →</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">SIGNAL COMMENTARY</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <Link href="/signals" className="text-xs text-[#555]">Browse signals →</Link>
            </div>
            <div className="divide-y divide-[#1e1e1e]">
              {signalComments.map(c => (
                <div key={c.id} className="py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: c.signalColor }} />
                    <span className="text-xs text-[#555]">{c.signal}</span>
                  </div>
                  <p className="text-xs text-[#777] italic leading-relaxed mb-2 pl-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>{c.comment}</p>
                  <div className="flex items-center gap-3 pl-4">
                    <button className="text-[11px] text-[#555] border border-[#2a2a2a] rounded px-2 py-0.5">Edit</button>
                    <span className="text-[11px] text-[#4CAF50]">Published · {c.views}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full text-[11px] text-[#555] border border-[#2a2a2a] rounded-lg py-2 hover:border-[#444] hover:text-[#888] transition-colors">+ Comment on a signal</button>
          </div>
        </div>

      </div>
    </div>
  )
}
