'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'
import { Trash2, Search } from 'lucide-react'

interface EventRow {
  id: string
  name: string | null
  title: string | null
  slug: string | null
  sector: string | null
  location_city: string | null
  location_country: string | null
  start_date: string | null
  end_date: string | null
  type: string | null
  is_published: boolean
  is_featured: boolean
  created_at: string
}

export default function AdminEventsPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [sectorFilter, setSectorFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []))
      .finally(() => setLoading(false))
  }, [isAdmin])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    setBusyId(id)
    const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
    if (res.ok) setEvents((prev) => prev.filter((e) => e.id !== id))
    setBusyId(null)
  }

  const togglePublished = async (id: string, current: boolean) => {
    setBusyId(id)
    const res = await fetch(`/api/admin/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !current }),
    })
    if (res.ok) {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_published: !current } : e))
      )
    }
    setBusyId(null)
  }

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const sectors = ['all', ...Array.from(new Set(events.map((e) => e.sector).filter(Boolean) as string[]))]
  const afterSector = sectorFilter === 'all' ? events : events.filter((e) => e.sector === sectorFilter)
  const filtered = searchQuery.trim()
    ? afterSector.filter((e) => {
        const q = searchQuery.toLowerCase()
        return (
          (e.title || e.name || '').toLowerCase().includes(q) ||
          (e.sector || '').toLowerCase().includes(q) ||
          (e.location_city || '').toLowerCase().includes(q)
        )
      })
    : afterSector

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-sm text-[#999]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="px-6 py-5 lg:px-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <div>
            <h1 className="text-xl font-medium text-[#1a1a1a]">Events</h1>
            <p className="text-sm text-[#999] mt-0.5">{events.length} events</p>
          </div>
        </div>

        {/* Sector filter tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {sectors.map((sector) => (
            <button
              key={sector}
              onClick={() => setSectorFilter(sector)}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
                sectorFilter === sector
                  ? 'bg-[#111111]/10 text-[#444444] font-medium'
                  : 'text-[#999] hover:bg-[#fafafa]'
              }`}
            >
              {sector === 'all' ? 'All' : sector}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
          <input
            type="text"
            placeholder="Search events by name, sector, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-[#e8e8e8] rounded-lg pl-9 pr-3 py-2 text-sm bg-[#f5f5f5] focus:outline-none focus:border-[#e8e8e8]/40 transition-colors"
          />
        </div>

        {/* Events table */}
        <div className="border border-[#e8e8e8] rounded-xl overflow-x-auto bg-[#f5f5f5]" style={{ minWidth: 0 }}>
          <div style={{ minWidth: 800 }}>
            {/* Header */}
            <div
              className="hidden lg:grid bg-gray-50 px-5 py-3 text-[11px] uppercase tracking-wide text-[#999] font-medium"
              style={{ gridTemplateColumns: '2.4fr 1fr 1fr 0.9fr 0.7fr 0.8fr' }}
            >
              <div>Name</div>
              <div>Sector</div>
              <div>City</div>
              <div>Start date</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-[#999]">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-[#999]">No events.</div>
            ) : (
              filtered.map((e) => (
                <div
                  key={e.id}
                  className="grid items-center px-5 py-3 border-t border-[#e8e8e8] hover:bg-[#fafafa]/50 transition-colors"
                  style={{ gridTemplateColumns: '2.4fr 1fr 1fr 0.9fr 0.7fr 0.8fr' }}
                >
                  <div className="text-sm font-medium text-[#1a1a1a] truncate pr-4">
                    {e.title || e.name || '—'}
                  </div>
                  <div className="hidden lg:block text-xs text-[#999]">{e.sector || '—'}</div>
                  <div className="hidden lg:block text-xs text-[#999] truncate pr-4">{e.location_city || '—'}</div>
                  <div className="hidden lg:block text-xs text-[#999]">{formatDate(e.start_date)}</div>
                  <div className="hidden lg:block">
                    <span
                      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
                        e.is_published ? 'text-green-700 bg-green-50' : 'text-[#999] bg-gray-100'
                      }`}
                    >
                      {e.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {e.slug && (
                      <a
                        href={`/events/${e.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-medium text-[#444444] hover:text-[#8a7622] uppercase tracking-wide transition-colors"
                      >
                        View
                      </a>
                    )}
                    <button
                      onClick={() => togglePublished(e.id, e.is_published)}
                      disabled={busyId === e.id}
                      className="text-[11px] font-medium text-[#444444] hover:text-[#8a7622] uppercase tracking-wide transition-colors disabled:opacity-40"
                    >
                      {e.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link
                      href={`/admin/events/${e.id}/edit`}
                      className="text-[11px] font-medium text-[#444444] hover:text-[#8a7622] uppercase tracking-wide transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(e.id)}
                      disabled={busyId === e.id}
                      className="text-[#999] hover:text-red-500 transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
