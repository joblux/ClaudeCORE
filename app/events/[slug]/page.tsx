'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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

function formatDateRange(start: string, end?: string) {
  const s = new Date(start)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
  if (!end || end === start) return s.toLocaleDateString('en-GB', opts)
  const e = new Date(end)
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.toLocaleDateString('en-GB', opts)}`
  }
  return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} – ${e.toLocaleDateString('en-GB', opts)}`
}

export default function EventDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [event, setEvent] = useState<any>(null)
  const [relatedEvents, setRelatedEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchEvent() {
      let { data } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!data) {
        const res = await supabase
          .from('events')
          .select('*')
          .eq('id', slug)
          .single()
        data = res.data
      }

      setEvent(data)

      // Fetch related events in same sector
      if (data?.sector) {
        const { data: related } = await supabase
          .from('events')
          .select('id, slug, title, name, start_date, dates, location, city, sector')
          .eq('is_published', true)
          .eq('sector', data.sector)
          .neq('id', data.id)
          .order('start_date', { ascending: true })
          .limit(3)
        if (related) setRelatedEvents(related)
      }

      setLoading(false)
    }
    fetchEvent()
  }, [slug])

  // SEO: set document title and meta description from DB fields
  useEffect(() => {
    if (!event) return
    if (event.meta_title) {
      document.title = event.meta_title
    } else if (event.title || event.name) {
      document.title = `${event.title || event.name} — JOBLUX Events`
    }
    if (event.meta_description) {
      let metaTag = document.querySelector('meta[name="description"]')
      if (!metaTag) {
        metaTag = document.createElement('meta')
        metaTag.setAttribute('name', 'description')
        document.head.appendChild(metaTag)
      }
      metaTag.setAttribute('content', event.meta_description)
    }
  }, [event])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      '_blank'
    )
  }

  const handleEmail = () => {
    if (!event) return
    const title = event.title || event.name || 'Event'
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${window.location.href}`)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-5 h-5 border border-[#333] border-t-[#a58e28] rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[15px] text-[#999] mb-4">Event not found.</p>
          <Link href="/events" className="text-[13px] text-[#a58e28] hover:text-[#c4a830] transition-colors">
            ← Back to Events
          </Link>
        </div>
      </div>
    )
  }

  const sectorStyle = sectorColors[event.sector] || sectorColors['Multi-sector']
  const title = event.title || event.name || ''
  const dateRange = event.start_date ? formatDateRange(event.start_date, event.end_date) : event.dates || ''
  const locationStr = event.location || [event.location_city, event.location_country].filter(Boolean).join(', ')

  const practicalInfo = event.practical_info as Record<string, string> | null
  const highlights = event.highlights as string[] | null
  const brandsPresent = event.brands_present as string[] | null
  const careerOpportunities = event.career_opportunities as string[] | null
  const networkingTips = event.networking_tips as string[] | null

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-7 pt-10 pb-16">

        <div className="lg:grid lg:grid-cols-[1fr_320px] gap-10">
          {/* ── Main column ── */}
          <div>
            {/* Back link */}
            <Link href="/events" className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] hover:underline mb-6 inline-block">
              ← Back to Events
            </Link>

            {/* Badges */}
            {event.sector && (
              <div className="flex gap-2 mb-4 flex-wrap">
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
                {event.type && (
                  <span className="text-[10px] font-semibold tracking-[1.5px] px-2 py-0.5 rounded bg-[#222] text-[#ccc] border border-[#2a2a2a]">
                    {event.type.toUpperCase()}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="text-[28px] md:text-[34px] text-white leading-snug mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {title}
            </h1>

            {/* Organiser */}
            {event.organizer && event.organizer !== 'TBC' && (
              <p className="text-[13px] text-[#999] mb-4">Organised by <span className="text-[#ccc]">{event.organizer}</span></p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4 text-[13px] text-[#999]">
              {dateRange && <span>{dateRange}</span>}
              {locationStr && (
                <>
                  <span className="text-[#777]">·</span>
                  <span>{locationStr}</span>
                </>
              )}
            </div>

            {/* Attendance */}
            {event.attendance && (
              <p className="text-[12px] text-[#777] mb-6">{event.attendance}</p>
            )}

            {/* Add to calendar + website */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => generateICS(event)}
                className="text-[12px] text-[#a58e28] border border-[rgba(165,142,40,0.3)] rounded px-4 py-2 hover:bg-[rgba(165,142,40,0.1)] transition-colors"
              >
                Add to calendar
              </button>
              {event.website_url && (
                <a
                  href={event.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-[#ccc] border border-[#2a2a2a] rounded px-4 py-2 hover:border-[#555] transition-colors"
                >
                  Visit website →
                </a>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#222] mb-8" />

            {/* Long description (full editorial body) — falls back to short description */}
            {(event.long_description || event.description) && (
              <div className="text-[15px] text-[#ccc] leading-[1.8] space-y-4 mb-10">
                {(event.long_description || event.description).split('\n').map((p: string, i: number) => (
                  p.trim() ? <p key={i}>{p}</p> : null
                ))}
              </div>
            )}

            {/* Highlights */}
            {highlights && highlights.length > 0 && (
              <div className="mb-10">
                <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-4">Highlights</p>
                <ul className="space-y-3">
                  {highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[14px] text-[#ccc] leading-relaxed">
                      <span className="mt-[7px] w-[6px] h-[6px] rounded-full bg-[#a58e28] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Brands present */}
            {brandsPresent && brandsPresent.length > 0 && (
              <div className="mb-10">
                <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-4">Brands Present</p>
                <div className="flex flex-wrap gap-2">
                  {brandsPresent.map((brand, i) => (
                    <span
                      key={i}
                      className="text-[12px] text-[#ccc] bg-[#222] border border-[#2a2a2a] rounded-full px-3 py-1"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Career opportunities */}
            {careerOpportunities && careerOpportunities.length > 0 && (
              <div className="bg-[#141414] border border-[#1e1e1e] rounded p-6 mb-10">
                <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-4">Career Opportunities</p>
                <ol className="space-y-4">
                  {careerOpportunities.map((item, i) => (
                    <li key={i} className="flex gap-3 text-[14px] text-[#ccc] leading-relaxed">
                      <span className="text-[#a58e28] font-semibold shrink-0">{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Networking tips */}
            {networkingTips && networkingTips.length > 0 && (
              <div className="bg-[#141414] border border-[#1e1e1e] rounded p-6 mb-10">
                <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-4">Networking Tips</p>
                <ol className="space-y-4">
                  {networkingTips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-[14px] text-[#ccc] leading-relaxed">
                      <span className="text-[#a58e28] font-semibold shrink-0">{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Career context — from DB */}
            {event.career_context && (
              <div className="bg-[#141414] border border-[#1e1e1e] rounded p-6 mb-10">
                <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-3">Career Intelligence</p>
                <h3 className="text-[15px] text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Why this matters for your career
                </h3>
                <p className="text-[13px] text-[#ccc] leading-relaxed">
                  {event.career_context}
                </p>
              </div>
            )}

            {/* Practical info */}
            {practicalInfo && Object.keys(practicalInfo).length > 0 && (
              <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-6 mb-10">
                <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-4">Practical Information</p>
                <div className="space-y-3">
                  {practicalInfo.venue && (
                    <div className="border-b border-[#2a2a2a] pb-3">
                      <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-1">Venue</span>
                      <span className="text-[14px] text-[#ccc]">{practicalInfo.venue}</span>
                    </div>
                  )}
                  {practicalInfo.access && (
                    <div className="border-b border-[#2a2a2a] pb-3">
                      <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-1">Access</span>
                      <span className="text-[14px] text-[#ccc]">{practicalInfo.access}</span>
                    </div>
                  )}
                  {practicalInfo.transport && (
                    <div className="border-b border-[#2a2a2a] pb-3">
                      <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-1">Transport</span>
                      <span className="text-[14px] text-[#ccc]">{practicalInfo.transport}</span>
                    </div>
                  )}
                  {practicalInfo.dress_code && (
                    <div className="border-b border-[#2a2a2a] pb-3">
                      <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-1">Dress Code</span>
                      <span className="text-[14px] text-[#ccc]">{practicalInfo.dress_code}</span>
                    </div>
                  )}
                  {practicalInfo.language && (
                    <div className="pb-1">
                      <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-1">Language</span>
                      <span className="text-[14px] text-[#ccc]">{practicalInfo.language}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Share row */}
            <div className="border-t border-[#222] pt-6">
              <div className="flex items-center gap-3 text-[12px] text-[#999]">
                <button onClick={handleCopyLink} className="hover:text-[#a58e28] transition-colors">
                  {copied ? 'Copied' : 'Copy link'}
                </button>
                <span className="text-[#777]">·</span>
                <button onClick={handleLinkedIn} className="hover:text-[#a58e28] transition-colors">
                  Share on LinkedIn
                </button>
                <span className="text-[#777]">·</span>
                <button onClick={handleEmail} className="hover:text-[#a58e28] transition-colors">
                  Send to a colleague
                </button>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="mt-10 lg:mt-0 space-y-6">
            {/* Event details card */}
            <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
              <div className="space-y-3">
                {event.dates && (
                  <div className="border-b border-[#2a2a2a] pb-3">
                    <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-1">Dates</span>
                    <span className="text-sm text-[#ccc]">{event.dates}</span>
                  </div>
                )}
                {locationStr && (
                  <div className="border-b border-[#2a2a2a] pb-3">
                    <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-1">Location</span>
                    <span className="text-sm text-[#ccc]">{locationStr}</span>
                  </div>
                )}
                {event.sector && (
                  <div className="border-b border-[#2a2a2a] pb-3">
                    <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-1">Sector</span>
                    <span className="text-sm text-[#ccc]">{event.sector}</span>
                  </div>
                )}
                {event.type && (
                  <div className="border-b border-[#2a2a2a] pb-3">
                    <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-1">Type</span>
                    <span className="text-sm text-[#ccc]">{event.type}</span>
                  </div>
                )}
                {event.attendance && (
                  <div className="pb-1">
                    <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-1">Attendance</span>
                    <span className="text-sm text-[#ccc]">{event.attendance}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related events in same sector */}
            {relatedEvents.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">RELATED EVENTS</div>
                <div className="space-y-3">
                  {relatedEvents.map((e: any) => (
                    <Link key={e.id} href={`/events/${e.slug || e.id}`} className="block pb-3 border-b border-[#222] last:border-b-0 hover:opacity-80 transition-opacity">
                      <div className="text-[10px] text-[#999] mb-1">{e.dates}</div>
                      <div className="text-xs text-[#ccc] hover:text-white transition-colors">{e.title || e.name}</div>
                      <div className="text-[11px] text-[#999] mt-1">{e.location || e.city}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
