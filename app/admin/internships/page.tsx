'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAdmin } from '@/lib/auth-hooks'
import { INTERNSHIP_STATUSES } from '@/types/internship'
import type { InternshipListing } from '@/types/internship'

const GOLD = '#444'
const BLACK = '#1a1a1a'
const CREAM = '#fafaf5'
const BORDER = '#e8e8e8'

const STATUS_COLORS: Record<string, string> = {
  pending_review: '#444',
  approved: '#2a7a3c',
  rejected: '#cc4444',
  expired: '#888',
  closed: '#555',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function AdminInternshipsPage() {
  const { isAdmin, isLoading: authLoading } = useRequireAdmin()
  const router = useRouter()

  const [internships, setInternships] = useState<InternshipListing[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    fetch(`/api/internships?${params}`)
      .then(r => r.json())
      .then(data => setInternships(data.internships ?? data ?? []))
      .catch(() => setInternships([]))
      .finally(() => setLoading(false))
  }, [isAdmin, statusFilter])

  if (authLoading || !isAdmin) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', color: '#999', fontSize: 14, background: CREAM, minHeight: '100vh' }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: CREAM, minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${BORDER}`, background: '#fff', padding: '24px 32px 20px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: GOLD, margin: '0 0 4px' }}>
          Administration
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <h1 className="jl-serif" style={{ fontSize: 28, fontWeight: 700, color: BLACK, margin: 0 }}>
            Internship Listings
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="jl-input"
              style={{
                padding: '7px 12px',
                fontSize: 13,
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                background: '#fff',
                color: BLACK,
                minWidth: 160,
                cursor: 'pointer',
              }}
            >
              <option value="">All Statuses</option>
              {INTERNSHIP_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <span style={{ fontSize: 12, color: '#999' }}>
              {internships.length} listing{internships.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      {/* Table */}
      <div style={{ padding: '16px 32px 32px' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999', fontSize: 14 }}>
            Loading internships...
          </div>
        ) : internships.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999', fontSize: 14 }}>
            No internship listings found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, border: `1px solid ${BORDER}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                  {['Company', 'Title', 'City', 'Status', 'Submitted By', 'Date'].map(col => (
                    <th
                      key={col}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        fontWeight: 700,
                        color: '#666',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {internships.map(intern => {
                  const statusColor = STATUS_COLORS[intern.status] || '#888'
                  const statusLabel = INTERNSHIP_STATUSES.find(s => s.value === intern.status)?.label || intern.status
                  return (
                    <tr
                      key={intern.id}
                      onClick={() => router.push(`/admin/internships/${intern.id}`)}
                      style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = CREAM }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#fff' }}
                    >
                      {/* Company */}
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: BLACK }}>
                        {intern.company_name}
                      </td>
                      {/* Title */}
                      <td style={{ padding: '10px 12px', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {intern.title}
                      </td>
                      {/* City */}
                      <td style={{ padding: '10px 12px', color: '#666' }}>
                        {[intern.city, intern.country].filter(Boolean).join(', ')}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background: `${statusColor}18`,
                            color: statusColor,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      {/* Submitted By */}
                      <td style={{ padding: '10px 12px', color: '#666', fontSize: 12 }}>
                        {intern.submitter?.full_name || '\u2014'}
                      </td>
                      {/* Date */}
                      <td style={{ padding: '10px 12px', color: '#888', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {formatDate(intern.created_at)}
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
