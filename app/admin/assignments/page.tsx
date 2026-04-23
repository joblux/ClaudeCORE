'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'
import { ASSIGNMENT_STATUSES } from '@/lib/assignment-options'
import type { SearchAssignment } from '@/types/search-assignment'
import { Plus, Upload, Search } from 'lucide-react'

const statusStyles: Record<string, string> = {
  draft:   'text-[#999] bg-gray-100',
  active:  'text-green-700 bg-green-50',
  on_hold: 'text-amber-700 bg-amber-50',
  closed:  'text-red-700 bg-red-50',
  filled:  'text-green-700 bg-green-50',
}

const priorityStyles: Record<string, string> = {
  low: 'text-[#999]',
  normal: 'text-[#999]',
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

  // Per-assignment applicant count, fetched from dedicated admin endpoint
  // (endpoint paginates internally; safe for any applications table size).
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/admin/assignments/applicant-counts')
      .then((res) => res.json())
      .then((data) => setApplicantCounts(data.counts ?? {}))
      .catch(() => setApplicantCounts({}))
  }, [isAdmin])

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') setSearch(searchInput)
  }

  if (authLoading || !isAdmin) {
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
            <h1 className="text-xl font-medium text-[#1a1a1a]">Search Assignments</h1>
            <p className="text-sm text-[#999] mt-0.5">
              {total} {total === 1 ? 'position' : 'positions'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/assignments/import"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase border border-[#e8e8e8] rounded-lg text-[#999] hover:bg-[#fafafa] transition-colors"
            >
              <Upload size={13} />
              Import
            </Link>
            <Link
              href="/admin/assignments/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase bg-[#111111] text-white rounded-lg hover:bg-[#8a7622] transition-colors"
            >
              <Plus size={13} />
              New assignment
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Search title or maison..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => setSearch(searchInput)}
              className="w-full border border-[#e8e8e8] rounded-lg pl-9 pr-3 py-2 text-sm bg-[#f5f5f5] focus:outline-none focus:border-[#e8e8e8]/40 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#e8e8e8] rounded-lg px-3 py-2 text-sm bg-[#f5f5f5] cursor-pointer focus:outline-none focus:border-[#e8e8e8]/40"
          >
            <option value="">All Statuses</option>
            {ASSIGNMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="border border-[#e8e8e8] rounded-xl overflow-x-auto bg-[#f5f5f5]" style={{ minWidth: 0 }}>
          <div style={{ minWidth: 800 }}>
          <div className="hidden lg:grid bg-gray-50 px-5 py-3 text-[11px] uppercase tracking-wide text-[#999] font-medium" style={{ gridTemplateColumns: '0.6fr 2fr 1fr 0.7fr 0.6fr 0.7fr 0.8fr 0.7fr' }}>
            <div>Ref</div>
            <div>Title</div>
            <div>Maison</div>
            <div>Status</div>
            <div>Priority</div>
            <div>City</div>
            <div>Created</div>
            <div>Pipeline</div>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-[#999]">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-[#999]">No assignments found.</div>
          ) : (
            assignments.map((a) => {
              const sc = statusStyles[a.status] || statusStyles.draft
              const pc = priorityStyles[a.priority] || 'text-[#999]'
              return (
                <div
                  key={a.id}
                  className="grid items-center px-5 py-3 border-t border-[#e8e8e8] hover:bg-[#fafafa]/50 transition-colors"
                  style={{ gridTemplateColumns: '0.6fr 2fr 1fr 0.7fr 0.6fr 0.7fr 0.8fr 0.7fr' }}
                >
                  <div className="text-xs text-[#999] font-mono">{a.reference_number || '—'}</div>
                  <div>
                    <Link href={`/admin/assignments/new?id=${a.id}`} className="text-sm font-medium text-[#1a1a1a] hover:text-[#444444] transition-colors">
                      {a.title}
                    </Link>
                  </div>
                  <div className="hidden lg:block text-xs text-[#999]">
                    {a.is_confidential ? (
                      <span className="italic text-[#444444]">Confidential</span>
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
                  <div className="hidden lg:block text-xs text-[#999]">{a.city || '—'}</div>
                  <div className="hidden lg:block text-xs text-[#999]">{formatDate(a.created_at)}</div>
                  <div className="hidden lg:block text-xs">
                    <Link
                      href={`/admin/ats?search_assignment_id=${a.id}`}
                      className="text-[#1a1a1a] hover:text-[#444444] transition-colors"
                    >
                      {applicantCounts[a.id] ?? 0} applicant{(applicantCounts[a.id] ?? 0) === 1 ? '' : 's'} →
                    </Link>
                  </div>
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
