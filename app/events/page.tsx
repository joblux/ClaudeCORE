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
}

function generateICS(event: any) {
  const fmtDate = (dateStr: string) => dateStr ? dateStr.replace(/-/g, '').split('T')[0] : ''
  const start = fmtDate(event.start_date)
  const end = fmtDate(event.end_date || event.start_date)
  const content = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JOBLUX//Events//EN', 'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${event.title || event.name || ''}`,
    `LOCATION:${event.location || ''}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([content], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(event.title || 'event').replace(/\s+/g, '-')}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

const sectorFilters = ['All sectors', 'Fashion', 'Watches & Jewelry', 'Beauty', 'Hospitality', 'Trade fairs']

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState('All sectors')
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('event_date', { ascending: true })
        .limit(50)
      if (data) setEvents(data)
      setLoading(false)
    }
    fetchEvents()
  }, [])

  // Filter
  const filtered = events.filter(e => {
    if (activeFilter === 'All sectors') return true
    if (activeFilter === 'Trade fairs') return e.type?.toLowerCase().includes('trade')
    return e.sector === activeFilter
  })

  // Group by month
  const grouped = filtered.reduce((acc: Record<string, any[]>, event) => {
    const key = event.month || 'Upcoming'
    if (!acc[key]) acc[key] = []
    acc[key].push(event)
    return acc
  }, {})

  // Dynamic stats
  const now = new Date()
  const upcomingEvents = events.filter(e => e.start_date && new Date(e.start_date) >= now)
  const cityCount = new Set(events.map(e => e.city).filter(Boolean)).size
  const sectorCount = new Set(events.map(e => e.sector).filter(Boolean)).size

  // Sidebar: upcoming (next 3 from today)
  const sidebarUpcoming = upcomingEvents.slice(0, 3)

  // Sidebar: further ahead (next 3 after the upcoming)
  const sidebarNext = upcomingEvents.slice(3, 6)

  // Sidebar: by city
  const cityCounts = events.reduce((acc: Record<string, number>, e) => {
    if (e.city) acc[e.city] = (acc[e.city] || 0) + 1
    return acc
  }, {})
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-5 h-5 border border-[#333] border-t-[#a58e28] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-7 pt-10 pb-16">

        <h1 className="text-4xl font-normal text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Events
        </h1>
        <p className="text-sm text-[#999] mb-6">
          Luxury industry events, trade fairs, and professional gatherings | curated for senior professionals.
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
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-6">
              {[
                [String(events.length), 'events'],
                [String(upcomingEvents.length), 'upcoming'],
                [String(cityCount), 'cities'],
                [String(sectorCount), 'sectors'],
              ].map(([n, l]) => (
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
                  {monthEvents.map((event: any) => {
                    const sectorStyle = sectorColors[event.sector] || sectorColors['Multi-sector']
                    const eventHref = `/events/${event.slug || event.id}`
                    return (
                      <Link key={event.id} href={eventHref} className="grid grid-cols-[80px_1fr_auto] gap-5 py-4 group block">
                        {/* Date */}
                        <div className="text-center">
                          <div className="text-3xl font-light text-white leading-none">{event.day}</div>
                          <div className="text-[10px] text-[#999] tracking-wider mt-1">{event.month_short}</div>
                          <div className="text-[10px] text-[#999] mt-0.5">{event.dow}</div>
                        </div>

                        {/* Main */}
                        <div>
                          <div className="flex gap-2 mb-2 flex-wrap">
                            {event.sector && (
                              <span
                                className="text-[10px] font-semibold tracking-[1.5px] px-2 py-0.5 rounded"
                                style={{ background: sectorStyle.bg, color: sectorStyle.color, border: `1px solid ${sectorStyle.border}` }}
                              >
                                {event.sector.toUpperCase()}
                              </span>
                            )}
                            {event.featured && (
                              <span className="text-[10px] font-semibold tracking-[1.5px] px-2 py-0.5 rounded" style={{ background: 'rgba(165,142,40,0.1)', color: '#a58e28', border: '1px solid rgba(165,142,40,0.2)' }}>
                                FEATURED
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-medium text-[#e0e0e0] mb-1 group-hover:text-white transition-colors">
                            {event.title || event.name}
                          </div>
                          {event.organizer && event.organizer !== 'TBC' && (
                            <div className="text-xs text-[#999] mb-2">{event.organizer}</div>
                          )}
                          <div className="flex gap-3 text-[11px] text-[#999] flex-wrap">
                            {event.dates && <span>{event.dates}</span>}
                            {event.location && (
                              <>
                                <span className="text-[#777]">·</span>
                                <span>{event.location}</span>
                              </>
                            )}
                            {event.type && (
                              <>
                                <span className="text-[#777]">·</span>
                                <span>{event.type}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right */}
                        <div className="text-right min-w-[110px]">
                          {event.city && <div className="text-xs text-[#777]">{event.city}</div>}
                          {event.attendance && <div className="text-[11px] text-[#999] mt-1">{event.attendance}</div>}
                          <button
                            onClick={(e) => { e.preventDefault(); generateICS(event) }}
                            className="mt-2 text-[11px] text-[#a58e28] border border-[rgba(165,142,40,0.3)] rounded px-3 py-1.5 hover:bg-[rgba(165,142,40,0.1)] transition-colors"
                          >
                            Add to calendar
                          </button>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-sm text-[#999] py-10 text-center">No events found for this filter.</p>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-8">
            {/* Upcoming */}
            {sidebarUpcoming.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">COMING UP</div>
                <div className="space-y-3">
                  {sidebarUpcoming.map((e: any) => (
                    <Link key={e.id} href={`/events/${e.slug || e.id}`} className="block pb-3 border-b border-[#222] last:border-b-0 hover:opacity-80 transition-opacity">
                      <div className="text-[10px] text-[#999] mb-1">{e.dates || e.month_short + ' ' + e.day}</div>
                      <div className="text-xs text-[#ccc] hover:text-white transition-colors">{e.title || e.name}</div>
                      <div className="text-[11px] text-[#999] mt-1">{e.location || e.city}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Further ahead */}
            {sidebarNext.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">FURTHER AHEAD</div>
                <div className="space-y-3">
                  {sidebarNext.map((e: any) => (
                    <Link key={e.id} href={`/events/${e.slug || e.id}`} className="block pb-3 border-b border-[#222] last:border-b-0 hover:opacity-80 transition-opacity">
                      <div className="text-[10px] text-[#999] mb-1">{e.dates || e.month_short + ' ' + e.day}</div>
                      <div className="text-xs text-[#ccc] hover:text-white transition-colors">{e.title || e.name}</div>
                      <div className="text-[11px] text-[#999] mt-1">{e.location || e.city}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* By city */}
            {topCities.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">BY CITY</div>
                <div className="space-y-2">
                  {topCities.map(([city, count]) => (
                    <div key={city} className="flex justify-between">
                      <span className="text-xs text-[#777]">{city}</span>
                      <span className="text-xs text-[#999]">{count} {count === 1 ? 'event' : 'events'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <div>
              <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">SUBMIT AN EVENT</div>
              <p className="text-xs text-[#999] leading-relaxed mb-3">
                Know of a luxury industry event we should add? Submit it for review.
              </p>
              <Link
                href="/contribute"
                className="block w-full text-center border border-[#a58e28] text-[#a58e28] text-xs rounded-lg py-2.5 hover:bg-[rgba(165,142,40,0.1)] transition-colors"
              >
                Submit an event
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
