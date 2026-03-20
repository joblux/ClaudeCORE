'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'
import { ASSIGNMENT_STATUSES } from '@/lib/assignment-options'
import type { SearchAssignment } from '@/types/search-assignment'

// Status badge colours
const statusColors: Record<string, { bg: string; text: string }> = {
  draft:     { bg: '#f5f4f0', text: '#888' },
  active:    { bg: '#1a1a1a', text: '#059669' },
  on_hold:   { bg: '#fff8e6', text: '#c97a2a' },
  closed:    { bg: '#f5f4f0', text: '#555' },
  filled:    { bg: '#e8f5e9', text: '#2a7a3c' },
}

// Priority badge colours
const priorityColors: Record<string, string> = {
  low: '#999',
  normal: '#666',
  high: '#c97a2a',
  urgent: '#d32f2f',
}

/** Format a date string to "Mar 19, 2026" */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminAssignmentsPage() {
  const { isAdmin, isLoading: authLoading } = useRequireAdmin()
  const [assignments, setAssignments] = useState<SearchAssignment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Fetch assignments when filters change
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

  // Debounced search — submit on Enter or after typing stops
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') setSearch(searchInput)
  }

  if (authLoading || !isAdmin) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', color: '#888', fontSize: 14 }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#fff', minHeight: '100vh' }}>

      {/* Top bar */}
      <div style={{ borderBottom: '2px solid #1a1a1a', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif", fontWeight: 600, fontSize: 18, color: '#1a1a1a', letterSpacing: 1 }}>JOBLUX</span>
          <span style={{ color: '#ccc', fontSize: 14 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Search Assignments</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin/dashboard" style={{ fontSize: 12, color: '#888', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
            Command Centre
          </Link>
          <Link href="/admin/ats" style={{ fontSize: 12, color: '#888', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
            Pipeline
          </Link>
          <Link href="/admin" style={{ fontSize: 12, color: '#888', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
            Members
          </Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Search Assignments</h1>
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              {total} {total === 1 ? 'position' : 'positions'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              href="/admin/assignments/import"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#fff', color: '#1a1a1a', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                padding: '10px 20px', textDecoration: 'none', border: '1px solid #1a1a1a', cursor: 'pointer',
              }}
            >
              Import
            </Link>
            <Link
              href="/admin/assignments/new"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#1a1a1a', color: '#a58e28', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                padding: '10px 20px', textDecoration: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              + New Assignment
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px', fontSize: 13, border: '1px solid #e8e2d8',
              background: '#fff', color: '#1a1a1a', minWidth: 140,
            }}
          >
            <option value="">All Statuses</option>
            {ASSIGNMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search title or maison..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={() => setSearch(searchInput)}
            style={{
              padding: '8px 12px', fontSize: 13, border: '1px solid #e8e2d8',
              background: '#fff', color: '#1a1a1a', flex: 1, minWidth: 200,
            }}
          />
        </div>

        {/* Loading state */}
        {loading ? (
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: 40 }}>Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: 40 }}>No assignments found.</p>
        ) : (
          /* Table */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
                  {['Ref #', 'Title', 'Maison', 'Status', 'Priority', 'City', 'Created'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#888' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => {
                  const sc = statusColors[assignment.status] || statusColors.draft
                  const pc = priorityColors[assignment.priority] || '#666'

                  return (
                    <tr key={assignment.id} style={{ borderBottom: '1px solid #f0ece4' }}>
                      {/* Reference number */}
                      <td style={{ padding: '12px 12px', color: '#888', fontSize: 11, fontFamily: 'monospace' }}>
                        {assignment.reference_number || '—'}
                      </td>

                      {/* Title — links to edit */}
                      <td style={{ padding: '12px 12px' }}>
                        <Link
                          href={`/admin/assignments/new?id=${assignment.id}`}
                          style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 500 }}
                        >
                          {assignment.title}
                        </Link>
                      </td>

                      {/* Maison — show "Confidential" if is_confidential */}
                      <td style={{ padding: '12px 12px', color: '#888', fontSize: 12 }}>
                        {assignment.is_confidential ? (
                          <span style={{ fontStyle: 'italic', color: '#a58e28' }}>Confidential</span>
                        ) : (
                          assignment.maison || '—'
                        )}
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{
                          display: 'inline-block', fontSize: 10, fontWeight: 600,
                          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                          padding: '3px 10px', background: sc.bg, color: sc.text,
                        }}>
                          {assignment.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '12px 12px', fontSize: 11, fontWeight: 600, color: pc, textTransform: 'capitalize' as const }}>
                        {assignment.priority}
                      </td>

                      {/* City */}
                      <td style={{ padding: '12px 12px', color: '#888', fontSize: 12 }}>
                        {assignment.city || '—'}
                      </td>

                      {/* Created date */}
                      <td style={{ padding: '12px 12px', color: '#888', fontSize: 12 }}>
                        {formatDate(assignment.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
