'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'
import { Trash2, Search } from 'lucide-react'

interface SignalRow {
  id: string
  headline: string
  slug: string | null
  category: string | null
  brand_tags: string[] | null
  source_name: string | null
  is_published: boolean
  is_pinned: boolean
  published_at: string | null
  created_at: string
}

export default function AdminSignalsPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const [signals, setSignals] = useState<SignalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/admin/signals')
      .then((r) => r.json())
      .then((data) => setSignals(data.signals || []))
      .finally(() => setLoading(false))
  }, [isAdmin])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this signal? This cannot be undone.')) return
    setBusyId(id)
    const res = await fetch(`/api/admin/signals/${id}`, { method: 'DELETE' })
    if (res.ok) setSignals((prev) => prev.filter((s) => s.id !== id))
    setBusyId(null)
  }

  const togglePublished = async (id: string, current: boolean) => {
    setBusyId(id)
    const res = await fetch(`/api/admin/signals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !current }),
    })
    if (res.ok) {
      setSignals((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_published: !current } : s))
      )
    }
    setBusyId(null)
  }

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const categories = ['all', ...Array.from(new Set(signals.map((s) => s.category).filter(Boolean) as string[]))]
  const afterCategory = categoryFilter === 'all' ? signals : signals.filter((s) => s.category === categoryFilter)
  const filtered = searchQuery.trim()
    ? afterCategory.filter((s) => {
        const q = searchQuery.toLowerCase()
        return (
          (s.headline || '').toLowerCase().includes(q) ||
          (s.category || '').toLowerCase().includes(q) ||
          (s.source_name || '').toLowerCase().includes(q)
        )
      })
    : afterCategory

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
            <h1 className="text-xl font-medium text-[#1a1a1a]">Signals</h1>
            <p className="text-sm text-[#999] mt-0.5">{signals.length} signals</p>
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#111111]/10 text-[#444444] font-medium'
                  : 'text-[#999] hover:bg-[#fafafa]'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
          <input
            type="text"
            placeholder="Search signals by headline, category, source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-[#e8e8e8] rounded-lg pl-9 pr-3 py-2 text-sm bg-[#f5f5f5] focus:outline-none focus:border-[#e8e8e8]/40 transition-colors"
          />
        </div>

        {/* Signals table */}
        <div className="border border-[#e8e8e8] rounded-xl overflow-x-auto bg-[#f5f5f5]" style={{ minWidth: 0 }}>
          <div style={{ minWidth: 800 }}>
            {/* Header */}
            <div
              className="hidden lg:grid bg-gray-50 px-5 py-3 text-[11px] uppercase tracking-wide text-[#999] font-medium"
              style={{ gridTemplateColumns: '2.4fr 1fr 1fr 0.8fr 0.7fr 0.8fr' }}
            >
              <div>Headline</div>
              <div>Category</div>
              <div>Source</div>
              <div>Date</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-[#999]">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-[#999]">No signals.</div>
            ) : (
              filtered.map((s) => (
                <div
                  key={s.id}
                  className="grid items-center px-5 py-3 border-t border-[#e8e8e8] hover:bg-[#fafafa]/50 transition-colors"
                  style={{ gridTemplateColumns: '2.4fr 1fr 1fr 0.8fr 0.7fr 0.8fr' }}
                >
                  <div className="text-sm font-medium text-[#1a1a1a] truncate pr-4">
                    {s.headline || '—'}
                  </div>
                  <div className="hidden lg:block text-xs text-[#999]">{s.category || '—'}</div>
                  <div className="hidden lg:block text-xs text-[#999] truncate pr-4">{s.source_name || '—'}</div>
                  <div className="hidden lg:block text-xs text-[#999]">
                    {formatDate(s.published_at || s.created_at)}
                  </div>
                  <div className="hidden lg:block">
                    <span
                      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
                        s.is_published ? 'text-green-700 bg-green-50' : 'text-[#999] bg-gray-100'
                      }`}
                    >
                      {s.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {s.slug && (
                      <a
                        href={`/signals/${s.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-medium text-[#444444] hover:text-[#8a7622] uppercase tracking-wide transition-colors"
                      >
                        View
                      </a>
                    )}
                    <button
                      onClick={() => togglePublished(s.id, s.is_published)}
                      disabled={busyId === s.id}
                      className="text-[11px] font-medium text-[#444444] hover:text-[#8a7622] uppercase tracking-wide transition-colors disabled:opacity-40"
                    >
                      {s.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link
                      href={`/admin/signals/${s.id}/edit`}
                      className="text-[11px] font-medium text-[#444444] hover:text-[#8a7622] uppercase tracking-wide transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={busyId === s.id}
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
