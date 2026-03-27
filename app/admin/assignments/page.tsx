'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'
import { ASSIGNMENT_STATUSES } from '@/lib/assignment-options'
import type { SearchAssignment } from '@/types/search-assignment'
import { Plus, Upload, Search } from 'lucide-react'

const statusStyles: Record<string, string> = {
  draft:   'text-[#8b949e] bg-gray-100',
  active:  'text-green-700 bg-green-50',
  on_hold: 'text-amber-700 bg-amber-50',
  closed:  'text-red-700 bg-red-50',
  filled:  'text-green-700 bg-green-50',
}

const priorityStyles: Record<string, string> = {
  low: 'text-[#484f58]',
  normal: 'text-[#8b949e]',
  high: 'text-amber-600',
  urgent: 'text-red-600',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminAssignmentsPage() {
  const { isAdmin, isLoading: authLoading } = useRequireAdmin()
  const [assignments, setAssignments] = useState<SearchAssignment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (search) params.set('search', search)
    fetch(`/api/assignments?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setAssignments(data.assignments || [])
        setTotal(data.total || 0)
      })
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false))
  }, [isAdmin, statusFilter, search])

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') setSearch(searchInput)
  }

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <div className="text-sm text-[#484f58]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="px-6 py-5 lg:px-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <div>
            <h1 className="text-xl font-medium text-[#1a1a1a]">Search Assignments</h1>
            <p className="text-sm text-[#484f58] mt-0.5">
              {total} {total === 1 ? 'position' : 'positions'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/assignments/import"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase border border-[#30363d] rounded-lg text-[#8b949e] hover:bg-[#1f2937] transition-colors"
            >
              <Upload size={13} />
              Import
            </Link>
            <Link
              href="/admin/assignments/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase bg-[#a58e28] text-white rounded-lg hover:bg-[#8a7622] transition-colors"
            >
              <Plus size={13} />
              New assignment
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
            <input
              type="text"
              placeholder="Search title or maison..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => setSearch(searchInput)}
              className="w-full border border-[#30363d] rounded-lg pl-9 pr-3 py-2 text-sm bg-[#161b22] focus:outline-none focus:border-[#a58e28]/40 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#30363d] rounded-lg px-3 py-2 text-sm bg-[#161b22] cursor-pointer focus:outline-none focus:border-[#a58e28]/40"
          >
            <option value="">All Statuses</option>
            {ASSIGNMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="border border-[#30363d] rounded-xl overflow-x-auto bg-[#161b22]" style={{ minWidth: 0 }}>
          <div style={{ minWidth: 800 }}>
          <div className="hidden lg:grid bg-gray-50 px-5 py-3 text-[11px] uppercase tracking-wide text-[#484f58] font-medium" style={{ gridTemplateColumns: '0.6fr 2fr 1fr 0.7fr 0.6fr 0.7fr 0.8fr' }}>
            <div>Ref</div>
            <div>Title</div>
            <div>Maison</div>
            <div>Status</div>
            <div>Priority</div>
            <div>City</div>
            <div>Created</div>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-[#484f58]">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-[#484f58]">No assignments found.</div>
          ) : (
            assignments.map((a) => {
              const sc = statusStyles[a.status] || statusStyles.draft
              const pc = priorityStyles[a.priority] || 'text-[#8b949e]'
              return (
                <div
                  key={a.id}
                  className="grid items-center px-5 py-3 border-t border-[#30363d] hover:bg-[#1f2937]/50 transition-colors"
                  style={{ gridTemplateColumns: '0.6fr 2fr 1fr 0.7fr 0.6fr 0.7fr 0.8fr' }}
                >
                  <div className="text-xs text-[#484f58] font-mono">{a.reference_number || '—'}</div>
                  <div>
                    <Link href={`/admin/assignments/new?id=${a.id}`} className="text-sm font-medium text-[#1a1a1a] hover:text-[#a58e28] transition-colors">
                      {a.title}
                    </Link>
                  </div>
                  <div className="hidden lg:block text-xs text-[#8b949e]">
                    {a.is_confidential ? (
                      <span className="italic text-[#a58e28]">Confidential</span>
                    ) : (
                      a.maison || '—'
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${sc}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className={`hidden lg:block text-xs font-semibold capitalize ${pc}`}>{a.priority}</div>
                  <div className="hidden lg:block text-xs text-[#8b949e]">{a.city || '—'}</div>
                  <div className="hidden lg:block text-xs text-[#484f58]">{formatDate(a.created_at)}</div>
                </div>
              )
            })
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
