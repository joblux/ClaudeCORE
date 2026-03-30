/*
  Supabase migration — run once to add columns if they don't exist:

  ALTER TABLE signals ADD COLUMN IF NOT EXISTS slug text UNIQUE;
  ALTER TABLE signals ADD COLUMN IF NOT EXISTS summary text;
  ALTER TABLE signals ADD COLUMN IF NOT EXISTS body text;
  ALTER TABLE signals ADD COLUMN IF NOT EXISTS brand text;
  ALTER TABLE signals ADD COLUMN IF NOT EXISTS region text;
  ALTER TABLE signals ADD COLUMN IF NOT EXISTS sector text;

  -- If creating from scratch:
  CREATE TABLE IF NOT EXISTS signals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text UNIQUE,
    headline text NOT NULL,
    summary text,
    body text,
    context_paragraph text,
    category text DEFAULT 'market',
    brand text,
    brand_tags text[],
    region text,
    sector text,
    confidence text,
    is_published boolean DEFAULT false,
    published_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
  );
*/

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  talent:  { bg: 'rgba(88,166,255,0.15)', text: '#58a6ff' },
  market:  { bg: 'rgba(63,185,80,0.15)',  text: '#3fb950' },
  brand:   { bg: 'rgba(240,136,62,0.15)', text: '#f0883e' },
  finance: { bg: 'rgba(163,113,247,0.15)', text: '#a371f7' },
  leadership:       { bg: 'rgba(240,136,62,0.15)', text: '#f0883e' },
  growth:           { bg: 'rgba(63,185,80,0.15)',  text: '#3fb950' },
  contraction:      { bg: 'rgba(248,81,73,0.15)',  text: '#f85149' },
  expansion:        { bg: 'rgba(88,166,255,0.15)', text: '#58a6ff' },
  merger_acquisition: { bg: 'rgba(163,113,247,0.15)', text: '#a371f7' },
}

const CATEGORY_LABELS: Record<string, string> = {
  talent: 'TALENT', market: 'MARKET', brand: 'BRAND', finance: 'FINANCE',
  leadership: 'LEADERSHIP', growth: 'GROWTH', contraction: 'CONTRACTION',
  expansion: 'EXPANSION', merger_acquisition: 'M&A',
}

const FILTERS = ['All', 'Market', 'Talent', 'Brand', 'Finance', 'Fashion', 'Watches', 'Hospitality', 'Beauty', 'Real Estate']

const TICKERS = [
  { name: 'LVMH', ticker: 'MC.PA' },
  { name: 'Kering', ticker: 'KER.PA' },
  { name: 'Richemont', ticker: 'CFR.SW' },
  { name: 'Hermès', ticker: 'RMS.PA' },
  { name: 'Burberry', ticker: 'BRBY.L' },
  { name: 'Tapestry', ticker: 'TPR' },
]

const MARKET_MOVERS = [
  { name: 'LVMH', price: '€742.30', change: '+2.3%', positive: true },
  { name: 'Hermès', price: '€2,184.00', change: '+1.4%', positive: true },
  { name: 'Kering', price: '€218.55', change: '-1.8%', positive: false },
  { name: 'Burberry', price: '£10.42', change: '-2.6%', positive: false },
  { name: 'Richemont', price: 'CHF 138.70', change: '+0.9%', positive: true },
]

const TALENT_RADAR = [
  { text: 'Bottega Veneta creative director search underway — shortlist of 4', time: '2h ago' },
  { text: 'Tiffany & Co. hiring 200+ retail roles across Asia Pacific', time: '5h ago' },
  { text: 'Chanel CFO transition — new appointment expected Q2', time: '1d ago' },
]

const COMING_THIS_WEEK = [
  { day: 'Mon', event: 'LVMH Q1 earnings call' },
  { day: 'Tue', event: 'Watches & Wonders Geneva opens' },
  { day: 'Thu', event: 'Kering investor day — strategy update' },
  { day: 'Fri', event: 'US luxury consumer confidence index' },
]

const placeholderSignals = [
  {
    id: '1', slug: 'kering-appoints-blazy-chanel', category: 'leadership',
    headline: 'Kering appoints Matthieu Blazy as creative director of Chanel — leaves Bottega Veneta after 3 years',
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
    headline: 'Hermès opens 4 stores in Asia Pacific — Seoul flagship is largest in the region',
    summary: 'Hermès now operates 340+ stores globally. New stores mean 200+ retail and support roles across four markets.',
    brand: 'Hermès', region: 'Asia Pacific', published_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: '4', slug: 'richemont-ynap-sale', category: 'merger_acquisition',
    headline: 'Richemont reportedly exploring sale of YNAP online platform — focus returns to hard luxury',
    summary: 'After years of losses, Richemont may finally exit e-commerce distribution. Digital roles at YNAP are at risk.',
    brand: 'Richemont', region: 'Global', published_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: '5', slug: 'miu-miu-revenue-growth', category: 'growth',
    headline: 'Miu Miu posts +56% revenue growth — best performing luxury brand of 2025',
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

export default function SignalsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [signals, setSignals] = useState(placeholderSignals)

  useEffect(() => {
    async function fetchSignals() {
      const { data } = await supabase
        .from('signals')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(30)
      if (data && data.length > 0) setSignals(data)
    }
    fetchSignals()
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

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-7 pt-10 pb-16">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] mb-2">Intelligence</p>
            <h1 className="text-[32px] text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Signals
            </h1>
            <p className="text-[13px] text-[#999] max-w-[500px] leading-relaxed">
              Real-time intelligence across 150+ luxury brands. Leadership moves, financial shifts, hiring signals, expansion — verified and contextualized.
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

        {/* Tickers bar */}
        <div className="bg-[#141414] border-t border-b border-[#222] py-3 px-4 mb-8 -mx-7 flex items-center gap-8 overflow-x-auto">
          {TICKERS.map(t => (
            <div key={t.ticker} className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[12px] text-[#888] font-medium">{t.name}</span>
              <span className="text-[11px] text-[#999]">{t.ticker}</span>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* LEFT — Signal feed */}
          <div className="min-w-0">
            <p className="text-[10px] text-[#999] uppercase tracking-[0.14em] mb-4">Today&apos;s signals</p>

            {filtered.length === 0 && (
              <p className="text-[13px] text-[#999] py-8">No signals match this filter.</p>
            )}

            {filtered.map(signal => {
              const colors = BADGE_COLORS[signal.category] || { bg: 'rgba(136,136,136,0.15)', text: '#888' }
              const label = CATEGORY_LABELS[signal.category] || signal.category?.toUpperCase() || 'SIGNAL'
              return (
                <div key={signal.id} className="border-b border-[#222] py-5 last:border-b-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-[10px] font-bold tracking-[0.1em] px-2 py-[2px] rounded"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {label}
                    </span>
                    {signal.brand && <span className="text-[12px] text-[#999]">{signal.brand}</span>}
                    <span className="text-[11px] text-[#999] ml-auto flex-shrink-0">
                      {signal.published_at ? timeAgo(signal.published_at) : ''}
                    </span>
                  </div>
                  <Link href={`/signals/${signal.slug || signal.id}`}>
                    <h3 className="text-[15px] text-white mb-2 leading-snug hover:text-[#ccc] transition-colors cursor-pointer">
                      {signal.headline}
                    </h3>
                  </Link>
                  <p className="text-[12px] text-[#999] leading-relaxed mb-3">
                    {signal.summary || (signal as any).context_paragraph || ''}
                  </p>
                  <div className="flex items-center justify-between">
                    {signal.region && <span className="text-[11px] text-[#999]">{signal.region}</span>}
                    <Link
                      href={`/signals/${signal.slug || signal.id}`}
                      className="text-[12px] text-[#a58e28] hover:text-[#c4a830] transition-colors ml-auto"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* RIGHT — Sidebar */}
          <div className="space-y-5">

            {/* Market movers */}
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-5">
              <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-4">Market movers</p>
              <div className="space-y-3">
                {MARKET_MOVERS.map(m => (
                  <div key={m.name} className="flex items-center justify-between">
                    <span className="text-[13px] text-[#ccc]">{m.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-[#999]">{m.price}</span>
                      <span className={`text-[12px] font-medium ${m.positive ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                        {m.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Talent radar */}
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-5">
              <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-4">Talent radar</p>
              <div className="space-y-3">
                {TALENT_RADAR.map((t, i) => (
                  <div key={i} className="border-l-2 border-[#58a6ff] pl-3">
                    <p className="text-[12px] text-[#ccc] leading-relaxed">{t.text}</p>
                    <p className="text-[10px] text-[#999] mt-1">{t.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming this week */}
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-5">
              <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-4">Coming this week</p>
              <div className="space-y-3">
                {COMING_THIS_WEEK.map((e, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[11px] text-[#999] font-medium w-8 flex-shrink-0 pt-[1px]">{e.day}</span>
                    <p className="text-[12px] text-[#ccc] leading-relaxed">{e.event}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
