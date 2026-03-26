'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { useSession } from 'next-auth/react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const placeholderRoles = [
  { id: '1', level: 'DIRECTOR', is_new: true, title: 'Director of retail operations, Europe', location: 'Paris', sector: 'Fashion & leather goods', experience: '15+ yrs', salary: '€120K–150K' },
  { id: '2', level: 'DIRECTOR', is_new: false, title: 'Brand director, Southern Europe', location: 'Milan', sector: 'Fashion', experience: '12+ yrs', salary: '€95K–120K' },
  { id: '3', level: 'VP', is_new: true, title: 'VP merchandising, watches & jewelry', location: 'New York', sector: 'Watches', experience: '12+ yrs', salary: '$180K–220K' },
  { id: '4', level: 'DIRECTOR', is_new: false, title: 'Regional director, Gulf markets', location: 'Dubai', sector: 'Multi-brand', experience: '10+ yrs', salary: 'AED 45K–60K' },
]

const placeholderWatchlist = [
  { id: '1', initials: 'H', name: 'Hermès', status: 'Hiring · 4 new stores opened', statusColor: '#4CAF50', change: '+18%', changeColor: '#4CAF50' },
  { id: '2', initials: 'C', name: 'Cartier', status: 'Hiring · Expanding Asia', statusColor: '#4CAF50', change: '+9%', changeColor: '#4CAF50' },
  { id: '3', initials: 'G', name: 'Gucci', status: 'New CD · Restructuring', statusColor: '#FF9800', change: '-6%', changeColor: '#f44336' },
]

const placeholderSignals = [
  { id: '1', color: '#4CAF50', text: 'Hermès Q4 revenue +18% YoY — all divisions growing', time: '2w ago' },
  { id: '2', color: '#FF9800', text: 'Kering appoints Matthieu Blazy as CD of Chanel', time: '5h ago' },
  { id: '3', color: '#f44336', text: 'Burberry confirms 400 role reductions in UK corporate', time: '6h ago' },
  { id: '4', color: '#2196F3', text: 'Hermès opens 4 stores in Asia Pacific — 200+ roles', time: '1d ago' },
]

const placeholderEvents = [
  { id: '1', day: '7', month: 'APR', title: 'Watches and Wonders Geneva 2026', location: 'Geneva, Switzerland', sector: 'Watches & Jewelry' },
  { id: '2', day: '14', month: 'APR', title: 'Première Vision Paris — Spring Edition', location: 'Paris Nord Villepinte', sector: 'Fashion' },
  { id: '3', day: '22', month: 'APR', title: 'Luxury Briefing Summit London 2026', location: 'The Savoy, London', sector: 'Multi-sector' },
]

const placeholderContributions = [
  { id: '1', icon: '💰', text: 'Salary data · Director of Retail, Paris · Hermès', status: 'VERIFIED', statusColor: '#4CAF50' },
  { id: '2', icon: '🎤', text: 'Interview experience · Senior Manager · Cartier London', status: 'VERIFIED', statusColor: '#4CAF50' },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [roles] = useState(placeholderRoles)
  const [signals] = useState(placeholderSignals)

  const firstName = (session?.user?.name || 'there').split(' ')[0]
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-8 pt-10 pb-16">

        {/* Welcome */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-normal text-white mb-1" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Good morning, {firstName}
            </h1>
            <p className="text-sm text-[#555]">{today} · Here's your intelligence briefing</p>
          </div>
          <div className="text-right">
            <div className="inline-block border border-[#a58e28] text-[#a58e28] text-[10px] font-semibold tracking-[2px] px-3 py-1 rounded mb-2">
              EXECUTIVE
            </div>
            <Link href="/profile" className="block text-xs text-[#555] hover:text-[#888] transition-colors">
              Edit profile →
            </Link>
          </div>
        </div>

        {/* Profilux bar */}
        <div className="bg-[#222] border border-[rgba(165,142,40,0.2)] rounded-xl p-4 flex items-center gap-5 mb-8">
          <div className="flex-shrink-0">
            <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-1">PROFILUX</div>
            <div className="text-xs text-[#555]">Your confidential professional profile — 45% complete</div>
          </div>
          <div className="flex-1">
            <div className="h-[3px] bg-[#2a2a2a] rounded-full mb-1">
              <div className="h-full bg-[#a58e28] rounded-full" style={{ width: '45%' }} />
            </div>
            <div className="text-[11px] text-[#444]">4 sections remaining · Complete to unlock full matching</div>
          </div>
          <Link href="/profile" className="bg-[#a58e28] text-[#1a1a1a] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#c4a832] transition-colors whitespace-nowrap">
            Continue →
          </Link>
        </div>

        {/* Matched roles */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">MATCHED ROLES</span>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
          <Link href="/careers" className="text-xs text-[#555] hover:text-[#888] transition-colors">View all in Careers →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {roles.map(role => (
            <div key={role.id} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-4 cursor-pointer hover:border-[#3a3a3a] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-[1px] text-[#a58e28]">{role.level}</span>
                  {role.is_new && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border border-[#4CAF50] text-[#4CAF50]" style={{ background: 'rgba(76,175,80,0.08)' }}>NEW</span>
                  )}
                </div>
                <span className="text-sm font-medium text-[#a58e28]">{role.salary}</span>
              </div>
              <div className="text-sm font-medium text-[#e0e0e0] mb-1.5">{role.title}</div>
              <div className="flex gap-2 text-[11px] text-[#444]">
                <span>{role.location}</span><span>·</span><span>{role.sector}</span><span>·</span><span>{role.experience}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Watchlist + Signals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">WATCHLIST</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <button className="text-xs text-[#555] hover:text-[#888]">Edit brands →</button>
            </div>
            <div className="divide-y divide-[#1e1e1e]">
              {placeholderWatchlist.map(b => (
                <div key={b.id} className="flex items-center py-3 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-medium text-[#666] flex-shrink-0 mr-3">
                    {b.initials}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-[#ccc]">{b.name}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: b.statusColor }}>{b.status}</div>
                  </div>
                  <span className="text-sm font-medium" style={{ color: b.changeColor }}>{b.change}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">LATEST SIGNALS</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <Link href="/signals" className="text-xs text-[#555] hover:text-[#888]">All signals →</Link>
            </div>
            <div className="divide-y divide-[#1e1e1e]">
              {signals.map(s => (
                <div key={s.id} className="flex gap-3 py-3">
                  <span className="w-[6px] h-[6px] rounded-full flex-shrink-0 mt-1" style={{ background: s.color }} />
                  <span className="text-xs text-[#777] flex-1 leading-relaxed">{s.text}</span>
                  <span className="text-[10px] text-[#444] whitespace-nowrap">{s.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contributions + Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">MY CONTRIBUTIONS</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <Link href="/careers" className="text-xs text-[#555] hover:text-[#888]">Add data →</Link>
            </div>
            <div className="divide-y divide-[#1e1e1e]">
              {placeholderContributions.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style={{ background: 'rgba(165,142,40,0.08)', border: '1px solid rgba(165,142,40,0.15)' }}>
                    {c.icon}
                  </div>
                  <span className="text-xs text-[#777] flex-1">{c.text}</span>
                  <span className="text-[10px] font-semibold" style={{ color: c.statusColor }}>{c.status}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 border border-dashed border-[#2a2a2a] rounded-lg p-3 text-center">
              <p className="text-[11px] text-[#444] mb-2">Contribute salary data to unlock 1,840+ verified ranges</p>
              <Link href="/careers" className="text-[11px] text-[#a58e28] border border-[rgba(165,142,40,0.3)] rounded px-3 py-1 hover:bg-[rgba(165,142,40,0.1)] transition-colors">
                + Add contribution
              </Link>
            </div>
          </div>

          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">UPCOMING EVENTS</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <Link href="/events" className="text-xs text-[#555] hover:text-[#888]">Full calendar →</Link>
            </div>
            <div className="divide-y divide-[#1e1e1e]">
              {placeholderEvents.map(e => (
                <div key={e.id} className="flex gap-4 py-3">
                  <div className="text-center min-w-[36px]">
                    <div className="text-xl font-light text-white leading-none">{e.day}</div>
                    <div className="text-[9px] text-[#555] tracking-wider mt-0.5">{e.month}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#ccc] leading-snug mb-0.5">{e.title}</div>
                    <div className="text-[11px] text-[#444]">{e.location}</div>
                    <div className="text-[10px] text-[#a58e28] mt-0.5">{e.sector}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
