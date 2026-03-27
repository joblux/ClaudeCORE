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
  'Trade fair': { bg: 'rgba(96,96,96,0.15)', color: '#888', border: '#2a2a2a' },
}

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

function formatDateRange(start: string, end?: string) {
  const s = new Date(start)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
  if (!end || end === start) return s.toLocaleDateString('en-GB', opts)
  const e = new Date(end)
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.toLocaleDateString('en-GB', opts)}`
  }
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', opts)}`
}

export default function EventDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [event, setEvent] = useState<any>(null)
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
      setLoading(false)
    }
    fetchEvent()
  }, [slug])

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
          <p className="text-[15px] text-[#666] mb-4">Event not found.</p>
          <Link href="/events" className="text-[13px] text-[#a58e28] hover:text-[#c4a830] transition-colors">
            ← Back to Events
          </Link>
        </div>
      </div>
    )
  }

  const sectorStyle = sectorColors[event.sector] || sectorColors['Multi-sector']
  const title = event.title || event.name || ''
  const dateRange = event.start_date
    ? formatDateRange(event.start_date, event.end_date)
    : event.dates || ''

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[720px] mx-auto px-7 pt-10 pb-16">

        {/* Back link */}
        <Link href="/events" className="text-[13px] text-[#555] hover:text-[#a58e28] transition-colors mb-8 inline-block">
          ← Back to Events
        </Link>

        {/* Badge */}
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
          </div>
        )}

        {/* Title */}
        <h1 className="text-[28px] text-white leading-snug mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {title}
        </h1>

        {/* Organiser */}
        {event.organizer && (
          <p className="text-[13px] text-[#888] mb-4">Organised by {event.organizer}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 text-[13px] text-[#666]">
          {dateRange && <span>{dateRange}</span>}
          {event.location && (
            <>
              <span className="text-[#333]">·</span>
              <span>{event.location}</span>
            </>
          )}
          {event.venue && (
            <>
              <span className="text-[#333]">·</span>
              <span>{event.venue}</span>
            </>
          )}
          {event.type && (
            <>
              <span className="text-[#333]">·</span>
              <span>{event.type}</span>
            </>
          )}
        </div>

        {/* Attendance */}
        {event.attendance && (
          <p className="text-[12px] text-[#555] mb-6">{event.attendance}</p>
        )}

        {/* Add to calendar */}
        <button
          onClick={() => generateICS(event)}
          className="text-[12px] text-[#a58e28] border border-[rgba(165,142,40,0.3)] rounded px-4 py-2 hover:bg-[rgba(165,142,40,0.1)] transition-colors mb-8"
        >
          Add to calendar
        </button>

        {/* Divider */}
        <div className="border-t border-[#222] mb-8" />

        {/* Description */}
        {event.description && (
          <div className="text-[15px] text-[#ccc] leading-[1.8] space-y-4 mb-10">
            {event.description.split('\n').map((p: string, i: number) => (
              p.trim() ? <p key={i}>{p}</p> : null
            ))}
          </div>
        )}

        {/* Editorial note */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded p-6 mb-10">
          <p className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-3">JOBLUX Editorial</p>
          <h3 className="text-[15px] text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Why this matters for your career
          </h3>
          <p className="text-[13px] text-[#555] leading-relaxed">
            Our editorial team is preparing intelligence on this event. Check back soon for analysis on hiring trends, networking opportunities, and career implications.
          </p>
        </div>

        {/* Related content placeholders */}
        <div className="border-t border-[#222] pt-8 mb-8">
          <p className="text-[10px] text-[#444] uppercase tracking-[0.14em] mb-4">Related</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-4">
              <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Brands attending</p>
              <p className="text-[13px] text-[#666]">Coming soon</p>
            </div>
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-4">
              <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Related signals</p>
              <p className="text-[13px] text-[#666]">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Share row */}
        <div className="border-t border-[#222] pt-6">
          <div className="flex items-center gap-1 text-[12px] text-[#555]">
            <button onClick={handleCopyLink} className="hover:text-[#a58e28] transition-colors">
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <span className="text-[#333]">·</span>
            <button onClick={handleLinkedIn} className="hover:text-[#a58e28] transition-colors">
              Share on LinkedIn
            </button>
            <span className="text-[#333]">·</span>
            <button onClick={handleEmail} className="hover:text-[#a58e28] transition-colors">
              Send to a colleague
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
