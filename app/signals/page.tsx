'use client'

import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import Pagination from '@/components/ui/Pagination'

const PAGE_SIZE = 20

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  talent:  { bg: 'rgba(88,166,255,0.15)', text: '#58a6ff' },
  market:  { bg: 'rgba(63,185,80,0.15)',  text: '#3fb950' },
  brand:   { bg: 'rgba(240,136,62,0.15)', text: '#f0883e' },
  finance: { bg: 'rgba(163,113,247,0.15)', text: '#a371f7' },
  leadership:         { bg: 'rgba(240,136,62,0.15)', text: '#f0883e' },
  growth:             { bg: 'rgba(63,185,80,0.15)',  text: '#3fb950' },
  contraction:        { bg: 'rgba(248,81,73,0.15)',  text: '#f85149' },
  expansion:          { bg: 'rgba(88,166,255,0.15)', text: '#58a6ff' },
  merger_acquisition: { bg: 'rgba(163,113,247,0.15)', text: '#a371f7' },
}

const CATEGORY_LABELS: Record<string, string> = {
  talent: 'TALENT', market: 'MARKET', brand: 'BRAND', finance: 'FINANCE',
  leadership: 'LEADERSHIP', growth: 'GROWTH', contraction: 'CONTRACTION',
  expansion: 'EXPANSION', merger_acquisition: 'M&A',
}

const FILTERS = ['All', 'Market', 'Talent', 'Brand', 'Finance', 'Fashion', 'Watches', 'Hospitality', 'Beauty', 'Real Estate']

const placeholderSignals = [
  {
    id: '1', slug: 'kering-appoints-blazy-chanel', category: 'leadership',
    headline: 'Kering appoints Matthieu Blazy as creative director of Chanel | leaves Bottega Veneta after 3 years',
    summary: "The third creative director change at Bottega in five years. Blazy's departure to Chanel marks a rare cross-group move at this level.",
    brand: 'Kering', region: 'Europe', published_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: '2', slug: 'burberry-400-role-reductions', category: 'contraction',
    headline: 'Burberry confirms 400 role reductions across UK corporate offices',
    summary: "Part of CEO Joshua Schulman's turnaround strategy. Retail and manufacturing roles are not affected.",
    brand: 'Burberry', region: 'UK', published_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: '3', slug: 'hermes-asia-expansion', category: 'expansion',
    headline: 'Hermès opens 4 stores in Asia Pacific | Seoul flagship is largest in the region',
    summary: 'Hermès now operates 340+ stores globally. New stores mean 200+ retail and support roles across four markets.',
    brand: 'Hermès', region: 'Asia Pacific', published_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: '4', slug: 'richemont-ynap-sale', category: 'merger_acquisition',
    headline: 'Richemont reportedly exploring sale of YNAP online platform | focus returns to hard luxury',
    summary: 'After years of losses, Richemont may finally exit e-commerce distribution. Digital roles at YNAP are at risk.',
    brand: 'Richemont', region: 'Global', published_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: '5', slug: 'miu-miu-revenue-growth', category: 'growth',
    headline: 'Miu Miu posts +56% revenue growth | best performing luxury brand of 2025',
    summary: 'Unprecedented growth driven by Gen Z appeal and strategic pricing below Prada mainline.',
    brand: 'Prada Group', region: 'Global', published_at: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatEventDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function SignalsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [signals, setSignals] = useState(placeholderSignals)
  const [talentSignals, setTalentSignals] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to page 1 whenever the filter changes
  useEffect(() => { setCurrentPage(1) }, [activeFilter])

  useEffect(() => {
    async function fetchAll() {
      // Main signal feed
      const { data: signalData } = await supabase
        .from('signals')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(200)
      if (signalData && signalData.length > 0) setSignals(signalData)

      // Talent radar | leadership/talent category signals for sidebar
      const { data: talentData } = await supabase
        .from('signals')
        .select('id, slug, headline, context_paragraph, published_at, category')
        .eq('is_published', true)
        .in('category', ['leadership', 'talent'])
        .order('published_at', { ascending: false })
        .limit(3)
      if (talentData && talentData.length > 0) setTalentSignals(talentData)

      // Coming this week | real upcoming events
      const today = new Date().toISOString().split('T')[0]
      const { data: eventData } = await supabase
        .from('events')
        .select('id, slug, name, title, start_date, location_city, sector')
        .eq('is_published', true)
        .gte('start_date', today)
        .order('start_date', { ascending: true })
        .limit(4)
      if (eventData && eventData.length > 0) setUpcomingEvents(eventData)
    }
    fetchAll()
  }, [])

  const filtered = signals.filter(s => {
    if (activeFilter === 'All') return true
    const sectorFilters = ['Fashion', 'Watches', 'Hospitality', 'Beauty', 'Real Estate']
    if (sectorFilters.includes(activeFilter)) {
      return s.region?.toLowerCase() === activeFilter.toLowerCase() ||
             (s as any).sector?.toLowerCase() === activeFilter.toLowerCase()
    }
    return s.category?.toLowerCase() === activeFilter.toLowerCase()
  })

  const isTier1 = (s: any): boolean => {
    const wh = s.what_happened
    const wim = s.why_it_matters
    return typeof wh === 'string' && wh.trim().length > 0 &&
           typeof wim === 'string' && wim.trim().length > 0
  }
  const byDateDesc = (a: any, b: any) =>
    new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
  const tier1Signals = filtered.filter(isTier1).sort(byDateDesc)
  const tier2Signals = filtered.filter((s: any) => !isTier1(s)).sort(byDateDesc)
  const orderedSignals = [...tier1Signals, ...tier2Signals]

  const pageCount = Math.max(1, Math.ceil(orderedSignals.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, pageCount)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageSignals = orderedSignals.slice(pageStart, pageStart + PAGE_SIZE)

  const truncate = (s: string, n: number) =>
    s.length > n ? s.substring(0, n).trimEnd() + '…' : s

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-7 pt-10 pb-16">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] mb-2">Intelligence</p>
            <h1 className="text-4xl font-normal text-white mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Signals
            </h1>
            <p className="text-[13px] text-[#999] max-w-[500px] leading-relaxed">
              Real-time intelligence across 150+ luxury brands. Leadership moves, financial shifts, hiring signals, expansion | verified and contextualized.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
            <span className="text-[12px] text-[#999]">Updated {formatDate(new Date())} · CET</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-4 py-1.5 text-[12px] transition-colors ${
                activeFilter === f
                  ? 'bg-[#a58e28] text-white'
                  : 'bg-transparent text-[#999] border border-[#2a2a2a] hover:border-[#555] hover:text-[#999]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* LEFT | Signal feed */}
          <div className="min-w-0">
            <p className="text-[10px] text-[#999] uppercase tracking-[0.14em] mb-4">Today&apos;s signals</p>

            {filtered.length === 0 && (
              <p className="text-[13px] text-[#999] py-8">No signals match this filter.</p>
            )}

            {pageSignals.map((signal: any, localIdx: number) => {
              const idx = pageStart + localIdx
              const colors = BADGE_COLORS[signal.category] || { bg: 'rgba(136,136,136,0.15)', text: '#888' }
              const label = CATEGORY_LABELS[signal.category] || signal.category?.toUpperCase() || 'SIGNAL'
              const href = `/signals/${signal.slug || signal.id}`
              const brandTagList = Array.isArray(signal.brand_tags)
                ? signal.brand_tags.filter((t: any) => typeof t === 'string' && t.trim().length > 0)
                : []
              const brandDisplay = brandTagList.length > 0
                ? brandTagList.join(', ')
                : (signal.brand || '')
              const tier1 = isTier1(signal)
              const showDivider = !tier1 && idx === tier1Signals.length && tier1Signals.length > 0
              const divider = showDivider ? (
                <div className="mt-8 mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#222]" />
                  <p className="text-[10px] text-[#777] uppercase tracking-[0.14em]">Signal briefs</p>
                  <div className="h-px flex-1 bg-[#222]" />
                </div>
              ) : null

              if (tier1) {
                const wh = truncate(signal.what_happened as string, 120)
                const ci = signal.career_implications
                const hasCI = typeof ci === 'string' && ci.trim().length > 0
                return (
                  <Link
                    key={signal.id}
                    href={href}
                    className="block border-b border-[#222] py-5 last:border-b-0 group hover:bg-[#222]/30 -mx-3 px-3 rounded transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="text-[10px] font-bold tracking-[0.1em] px-2 py-[2px] rounded"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {label}
                      </span>
                      <span className="text-[#555] text-[9px] tracking-widest">ANALYSIS</span>
                      {brandDisplay && <span className="text-[12px] text-[#999]">{brandDisplay}</span>}
                      <span className="text-[11px] text-[#999] ml-auto flex-shrink-0">
                        {signal.published_at ? timeAgo(signal.published_at) : ''}
                      </span>
                    </div>
                    <h3 className="text-[15px] text-white mb-2 leading-snug group-hover:text-[#ccc] transition-colors">
                      {signal.headline}
                    </h3>
                    <p className="text-[12px] text-[#999] leading-relaxed mb-2">
                      {wh}
                    </p>
                    {hasCI && (
                      <p className="text-[11px] text-[#777] italic leading-relaxed mb-3">
                        {truncate(ci as string, 100)}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {signal.region && <span className="text-[11px] text-[#999]">{signal.region}</span>}
                      <span className="text-[12px] text-[#a58e28] group-hover:text-[#c4a830] transition-colors ml-auto">
                        Read more →
                      </span>
                    </div>
                  </Link>
                )
              }

              // Tier 2 — Signal Brief
              const ci = signal.career_implications
              const clickable = typeof ci === 'string' && ci.trim().length > 0
              const inner = (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="text-[10px] font-bold tracking-[0.1em] px-2 py-[2px] rounded"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {label}
                    </span>
                    <span className="text-[#444] text-[9px] tracking-widest">BRIEF</span>
                    {brandDisplay && <span className="text-[12px] text-[#999]">{brandDisplay}</span>}
                    <span className="text-[11px] text-[#999] ml-auto flex-shrink-0">
                      {signal.published_at ? timeAgo(signal.published_at) : ''}
                    </span>
                  </div>
                  <h3 className="text-[13px] text-white leading-snug group-hover:text-[#ccc] transition-colors">
                    {signal.headline}
                  </h3>
                </>
              )
              if (clickable) {
                return (
                  <Fragment key={signal.id}>
                    {divider}
                    <Link
                      href={href}
                      className="block border-b border-[#222] py-3 last:border-b-0 group hover:bg-[#222]/30 -mx-3 px-3 rounded transition-colors"
                    >
                      {inner}
                    </Link>
                  </Fragment>
                )
              }
              return (
                <Fragment key={signal.id}>
                  {divider}
                  <div className="border-b border-[#222] py-3 last:border-b-0 -mx-3 px-3">
                    {inner}
                  </div>
                </Fragment>
              )
            })}

            <Pagination
              page={safePage}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              theme="dark"
            />
          </div>

          {/* RIGHT | Sidebar */}
          <div className="space-y-5">

            {/* Market movement | reserved for daily stock/market data — */}
            {/* neutral placeholder. No fake prices, no editorial signals. */}
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-5">
              <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-4">Market movement</p>
              <p className="text-[11px] text-[#777] leading-relaxed">Daily market data — coming soon</p>
            </div>

            {/* Talent radar | real signals from DB */}
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-5">
              <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-4">Talent radar</p>
              <div className="space-y-3">
                {(talentSignals.length > 0 ? talentSignals : [
                  { id: '1', slug: '', headline: 'Leadership intelligence loading...', published_at: new Date().toISOString() },
                ]).map((t: any, i: number) => (
                  <div key={i} className="border-l-2 border-[#58a6ff] pl-3">
                    <p className="text-[12px] text-[#ccc] leading-relaxed">{t.headline}</p>
                    <p className="text-[10px] text-[#999] mt-1">{t.published_at ? timeAgo(t.published_at) : ''}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming this week | real events from DB */}
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-5">
              <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-4">Coming up</p>
              <div className="space-y-3">
                {(upcomingEvents.length > 0 ? upcomingEvents : [
                  { id: '1', name: 'Events loading...', start_date: '', location_city: '' },
                ]).map((e: any, i: number) => (
                  <Link key={i} href={`/events/${e.slug || e.id}`} className="flex items-start gap-3 group">
                    <span className="text-[11px] text-[#999] font-medium w-12 flex-shrink-0 pt-[1px]">
                      {e.start_date ? formatEventDate(e.start_date) : ''}
                    </span>
                    <p className="text-[12px] text-[#ccc] leading-relaxed group-hover:text-white transition-colors">
                      {e.name || e.title}
                      {e.location_city && <span className="text-[#777]"> · {e.location_city}</span>}
                    </p>
                  </Link>
                ))}
              </div>
              <Link href="/events" className="text-[11px] text-[#a58e28] mt-4 block hover:underline">
                View all events →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
