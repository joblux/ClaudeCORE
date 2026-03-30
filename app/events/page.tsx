'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const sectorColors: Record<string, { bg: string; color: string; border: string }> = {
  'Watches & Jewelry': { bg: 'rgba(33,150,243,0.08)', color: '#2196F3', border: 'rgba(33,150,243,0.15)' },
  'Fashion': { bg: 'rgba(165,142,40,0.08)', color: '#a58e28', border: 'rgba(165,142,40,0.15)' },
  'Beauty': { bg: 'rgba(156,39,176,0.08)', color: '#9C27B0', border: 'rgba(156,39,176,0.15)' },
  'Hospitality': { bg: 'rgba(76,175,80,0.08)', color: '#4CAF50', border: 'rgba(76,175,80,0.15)' },
  'Jewelry': { bg: 'rgba(255,152,0,0.08)', color: '#FF9800', border: 'rgba(255,152,0,0.15)' },
  'Multi-sector': { bg: 'rgba(96,96,96,0.15)', color: '#888', border: '#2a2a2a' },
  'Trade fair': { bg: 'rgba(96,96,96,0.15)', color: '#888', border: '#2a2a2a' },
}

const placeholderEvents = [
  {
    id: '1', slug: 'watches-wonders-geneva-2026', month: 'APRIL 2026',
    day: '7', month_short: 'APR', dow: 'Tue',
    title: 'Watches and Wonders Geneva 2026', name: 'Watches and Wonders Geneva 2026',
    organizer: 'Fondation de la Haute Horlogerie',
    dates: 'Apr 7–13, 2026', location: 'Geneva, Switzerland', city: 'Geneva',
    start_date: '2026-04-07', end_date: '2026-04-13',
    type: 'Trade & press', sector: 'Watches & Jewelry', featured: true,
    attendance: '~45,000 visitors', description: 'The world\'s leading fine watchmaking event.',
  },
  {
    id: '2', slug: 'premiere-vision-paris-spring-2026', month: 'APRIL 2026',
    day: '14', month_short: 'APR', dow: 'Tue',
    title: 'Première Vision Paris — Spring Edition', name: 'Première Vision Paris — Spring Edition',
    organizer: 'Première Vision',
    dates: 'Apr 14–16, 2026', location: 'Paris Nord Villepinte', city: 'Paris',
    start_date: '2026-04-14', end_date: '2026-04-16',
    type: 'Trade only', sector: 'Fashion', featured: false,
    attendance: '~60,000 visitors', description: 'Global sourcing event for the fashion industry.',
  },
  {
    id: '3', slug: 'luxury-briefing-summit-london-2026', month: 'APRIL 2026',
    day: '22', month_short: 'APR', dow: 'Wed',
    title: 'Luxury Briefing Summit London 2026', name: 'Luxury Briefing Summit London 2026',
    organizer: 'Luxury Briefing',
    dates: 'Apr 22, 2026', location: 'The Savoy, London', city: 'London',
    start_date: '2026-04-22', end_date: '2026-04-22',
    type: 'Conference', sector: 'Multi-sector', featured: false,
    attendance: '~500 delegates', description: 'Annual luxury leadership conference.',
  },
  {
    id: '4', slug: 'couture-las-vegas-2026', month: 'MAY 2026',
    day: '5', month_short: 'MAY', dow: 'Tue',
    title: 'Couture Las Vegas 2026', name: 'Couture Las Vegas 2026',
    organizer: 'Couture Show',
    dates: 'May 5–9, 2026', location: 'The Wynn, Las Vegas', city: 'Las Vegas',
    start_date: '2026-05-05', end_date: '2026-05-09',
    type: 'Trade only', sector: 'Jewelry', featured: true,
    attendance: '~5,000 buyers', description: 'Premier fine jewelry trade event.',
  },
  {
    id: '5', slug: 'luxe-pack-monaco-2026', month: 'MAY 2026',
    day: '18', month_short: 'MAY', dow: 'Mon',
    title: 'Luxe Pack Monaco 2026', name: 'Luxe Pack Monaco 2026',
    organizer: 'Comexposium',
    dates: 'May 18–20, 2026', location: 'Grimaldi Forum, Monaco', city: 'Monaco',
    start_date: '2026-05-18', end_date: '2026-05-20',
    type: 'Trade only', sector: 'Beauty', featured: false,
    attendance: '~7,000 visitors', description: 'Luxury packaging innovation event.',
  },
  {
    id: '6', slug: 'hotel-show-dubai-2026', month: 'MAY 2026',
    day: '26', month_short: 'MAY', dow: 'Tue',
    title: 'The Hotel Show Dubai 2026', name: 'The Hotel Show Dubai 2026',
    organizer: 'dmg events',
    dates: 'May 26–28, 2026', location: 'Dubai World Trade Centre', city: 'Dubai',
    start_date: '2026-05-26', end_date: '2026-05-28',
    type: 'Trade only', sector: 'Hospitality', featured: false,
    attendance: '~22,000 visitors', description: 'Middle East\'s largest hospitality event.',
  },
]

const thisWeek = [
  { dates: 'APR 7–13', title: 'Watches and Wonders Geneva 2026', location: 'Geneva, Switzerland' },
  { dates: 'APR 8', title: 'LVMH Supplier Innovation Day', location: 'Paris, France' },
]

const nextMonth = [
  { dates: 'MAY 5–9', title: 'Couture Las Vegas 2026', location: 'Las Vegas, USA' },
  { dates: 'MAY 18–20', title: 'Luxe Pack Monaco 2026', location: 'Monaco' },
  { dates: 'MAY 26–28', title: 'The Hotel Show Dubai 2026', location: 'Dubai, UAE' },
]

const byCity = [
  { city: 'Paris', count: 14 },
  { city: 'Milan', count: 9 },
  { city: 'Geneva', count: 7 },
  { city: 'London', count: 6 },
  { city: 'New York', count: 5 },
  { city: 'Dubai', count: 5 },
  { city: 'Tokyo', count: 4 },
]

const sectorFilters = ['All sectors', 'Fashion', 'Watches & Jewelry', 'Beauty', 'Hospitality', 'Trade fairs']

function generateICS(event: any) {
  const fmtDate = (dateStr: string) => {
    if (!dateStr) return ''
    return dateStr.replace(/-/g, '').replace(/:/g, '').split('.')[0].split('T')[0]
  }
  const start = fmtDate(event.start_date || event.date)
  const end = fmtDate(event.end_date || event.start_date || event.date)
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JOBLUX//Events//EN',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${event.title || event.name || ''}`,
    `LOCATION:${event.location || event.venue || ''}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([content], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(event.title || event.name || 'event').replace(/\s+/g, '-')}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState('All sectors')
  const [events, setEvents] = useState(placeholderEvents)

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .limit(20)
      if (data && data.length > 0) setEvents(data)
    }
    fetchEvents()
  }, [])

  const filtered = events.filter(e => {
    if (activeFilter === 'All sectors') return true
    if (activeFilter === 'Trade fairs') return e.type?.toLowerCase().includes('trade')
    return e.sector === activeFilter
  })

  // Group by month
  const grouped = filtered.reduce((acc: Record<string, typeof events>, event) => {
    const key = event.month
    if (!acc[key]) acc[key] = []
    acc[key].push(event)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-8 pt-10 pb-16">

        <h1 className="text-4xl font-normal text-white mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Events
        </h1>
        <p className="text-sm text-[#999] mb-6">
          Luxury industry events, trade fairs, and professional gatherings — curated for senior professionals.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
          <div>
            {/* Filters */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                {sectorFilters.map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className="rounded-full px-4 py-1.5 text-xs transition-colors"
                    style={{
                      border: activeFilter === f ? '1px solid #e0e0e0' : '1px solid #2a2a2a',
                      color: activeFilter === f ? '#ffffff' : '#666',
                      background: 'transparent',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <select className="bg-[#222] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs text-[#999] outline-none cursor-pointer">
                <option>All months</option>
                <option>April 2026</option>
                <option>May 2026</option>
                <option>June 2026</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-6">
              {[['87', 'events this year'], ['24', 'upcoming'], ['18', 'cities'], ['12', 'sectors']].map(([n, l]) => (
                <span key={l} className="text-xs">
                  <span className="text-[#999]">{n}</span>
                  <span className="text-[#999]"> {l}</span>
                </span>
              ))}
            </div>

            {/* Events grouped by month */}
            {Object.entries(grouped).map(([month, monthEvents]) => (
              <div key={month} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">{month}</span>
                  <div className="flex-1 h-px bg-[#2a2a2a]" />
                </div>

                <div className="divide-y divide-[#1e1e1e]">
                  {monthEvents.map(event => {
                    const sectorStyle = sectorColors[event.sector] || sectorColors['Multi-sector']
                    const eventHref = `/events/${event.slug || event.id}`
                    return (
                      <div key={event.id} className="grid grid-cols-[80px_1fr_auto] gap-5 py-4 group">
                        {/* Date */}
                        <Link href={eventHref} className="text-center">
                          <div className="text-3xl font-light text-white leading-none">{event.day}</div>
                          <div className="text-[10px] text-[#999] tracking-wider mt-1">{event.month_short}</div>
                          <div className="text-[10px] text-[#999] mt-0.5">{event.dow}</div>
                        </Link>

                        {/* Main */}
                        <div>
                          <div className="flex gap-2 mb-2 flex-wrap">
                            <span
                              className="text-[10px] font-semibold tracking-[1.5px] px-2 py-0.5 rounded"
                              style={{ background: sectorStyle.bg, color: sectorStyle.color, border: `1px solid ${sectorStyle.border}` }}
                            >
                              {event.sector.toUpperCase()}
                            </span>
                            {event.featured && (
                              <span className="text-[10px] font-semibold tracking-[1.5px] px-2 py-0.5 rounded" style={{ background: 'rgba(165,142,40,0.1)', color: '#a58e28', border: '1px solid rgba(165,142,40,0.2)' }}>
                                FEATURED
                              </span>
                            )}
                          </div>
                          <Link href={eventHref}>
                            <div className="text-sm font-medium text-[#e0e0e0] mb-1 group-hover:text-white transition-colors cursor-pointer">
                              {event.title}
                            </div>
                          </Link>
                          <div className="text-xs text-[#999] mb-2">{event.organizer}</div>
                          <div className="flex gap-3 text-[11px] text-[#999] flex-wrap">
                            <span>{event.dates}</span>
                            <span>·</span>
                            <span>{event.location}</span>
                            <span>·</span>
                            <span>{event.type}</span>
                          </div>
                        </div>

                        {/* Right */}
                        <div className="text-right min-w-[110px]">
                          <div className="text-xs text-[#777]">{event.city}</div>
                          <div className="text-[11px] text-[#999] mt-1">{event.attendance}</div>
                          <button
                            onClick={(e) => { e.preventDefault(); generateICS(event); }}
                            className="mt-2 text-[11px] text-[#a58e28] border border-[rgba(165,142,40,0.3)] rounded px-2 py-1 hover:bg-[rgba(165,142,40,0.1)] transition-colors"
                          >
                            Add to calendar
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* This week */}
            <div>
              <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">THIS WEEK</div>
              <div className="space-y-3">
                {thisWeek.map(e => (
                  <div key={e.title} className="pb-3 border-b border-[#222] last:border-b-0">
                    <div className="text-[10px] text-[#999] mb-1">{e.dates}</div>
                    <div className="text-xs text-[#ccc] cursor-pointer hover:text-white transition-colors">{e.title}</div>
                    <div className="text-[11px] text-[#999] mt-1">{e.location}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming next month */}
            <div>
              <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">COMING NEXT MONTH</div>
              <div className="space-y-3">
                {nextMonth.map(e => (
                  <div key={e.title} className="pb-3 border-b border-[#222] last:border-b-0">
                    <div className="text-[10px] text-[#999] mb-1">{e.dates}</div>
                    <div className="text-xs text-[#ccc] cursor-pointer hover:text-white transition-colors">{e.title}</div>
                    <div className="text-[11px] text-[#999] mt-1">{e.location}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* By city */}
            <div>
              <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">BY CITY</div>
              <div className="space-y-2">
                {byCity.map(c => (
                  <div key={c.city} className="flex justify-between">
                    <span className="text-xs text-[#777]">{c.city}</span>
                    <span className="text-xs text-[#999]">{c.count} events</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div>
              <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SUBMIT AN EVENT</div>
              <p className="text-xs text-[#999] leading-relaxed mb-3">
                Know of a luxury industry event we should add? Submit it for review.
              </p>
              <button className="w-full border border-[#a58e28] text-[#a58e28] text-xs rounded-lg py-2.5 hover:bg-[rgba(165,142,40,0.1)] transition-colors">
                Submit an event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
