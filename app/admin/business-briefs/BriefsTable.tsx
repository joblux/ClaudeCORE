'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

export type BriefsTableRow = {
  id: string
  company_name: string
  sector: string | null
  brief_type: string
  urgency: string
  confidentiality_level: string
  status: string
  created_at: string
  submitter: {
    id: string
    full_name: string | null
    email: string | null
    role: string | null
  } | null
}

const statusBadge: Record<string, { bg: string; text: string }> = {
  new:          { bg: '#e3f2fd', text: '#1565c0' },
  under_review: { bg: '#fff8e1', text: '#f57f17' },
  accepted:     { bg: '#e0f2f1', text: '#00695c' },
  in_progress:  { bg: '#ede7f6', text: '#5e35b1' },
  completed:    { bg: '#e8f5e9', text: '#2e7d32' },
  closed:       { bg: '#f5f5f5', text: '#616161' },
  archived:     { bg: '#eeeeee', text: '#424242' },
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'new',          label: 'New' },
  { value: 'under_review', label: 'Under review' },
  { value: 'accepted',     label: 'Accepted' },
  { value: 'in_progress',  label: 'In progress' },
  { value: 'completed',    label: 'Completed' },
  { value: 'closed',       label: 'Closed' },
  { value: 'archived',     label: 'Archived' },
]

type PresetState = {
  search: string
  statusFilter: string
  companyFilter: string
  orphanOnly: boolean
  includeArchived: boolean
}

const PRESETS: { key: string; label: string; state: PresetState }[] = [
  { key: 'all_active',   label: 'All active',   state: { search: '', statusFilter: 'all',          companyFilter: 'all', orphanOnly: false, includeArchived: false } },
  { key: 'new',          label: 'New',          state: { search: '', statusFilter: 'new',          companyFilter: 'all', orphanOnly: false, includeArchived: false } },
  { key: 'under_review', label: 'Under review', state: { search: '', statusFilter: 'under_review', companyFilter: 'all', orphanOnly: false, includeArchived: false } },
  { key: 'in_progress',  label: 'In progress',  state: { search: '', statusFilter: 'in_progress',  companyFilter: 'all', orphanOnly: false, includeArchived: false } },
  { key: 'accepted',     label: 'Accepted',     state: { search: '', statusFilter: 'accepted',     companyFilter: 'all', orphanOnly: false, includeArchived: false } },
  { key: 'orphans',      label: 'Orphans',      state: { search: '', statusFilter: 'all',          companyFilter: 'all', orphanOnly: true,  includeArchived: false } },
]

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const controlStyle: React.CSSProperties = {
  fontSize: 13, padding: '7px 10px', border: '1px solid #e8e8e8',
  borderRadius: 4, background: '#fff', color: '#111',
  fontFamily: 'Inter, system-ui, sans-serif', outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#888', marginBottom: 4,
}

export default function BriefsTable({ rows }: { rows: BriefsTableRow[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [orphanOnly, setOrphanOnly] = useState(false)
  const [includeArchived, setIncludeArchived] = useState(false)

  const companyOptions = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) if (r.company_name) set.add(r.company_name)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const userWantsArchived = includeArchived || statusFilter === 'archived'
    return rows.filter(r => {
      if (!userWantsArchived && r.status === 'archived') return false
      if (q && !r.company_name.toLowerCase().includes(q)) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (companyFilter !== 'all' && r.company_name !== companyFilter) return false
      if (orphanOnly && r.submitter !== null) return false
      return true
    })
  }, [rows, search, statusFilter, companyFilter, orphanOnly, includeArchived])

  const filtersActive =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    companyFilter !== 'all' ||
    orphanOnly ||
    includeArchived

  const activePresetKey = PRESETS.find(p =>
    p.state.search === search.trim() &&
    p.state.statusFilter === statusFilter &&
    p.state.companyFilter === companyFilter &&
    p.state.orphanOnly === orphanOnly &&
    p.state.includeArchived === includeArchived
  )?.key ?? null

  function applyPreset(state: PresetState) {
    setSearch(state.search)
    setStatusFilter(state.statusFilter)
    setCompanyFilter(state.companyFilter)
    setOrphanOnly(state.orphanOnly)
    setIncludeArchived(state.includeArchived)
  }

  function resetFilters() {
    setSearch('')
    setStatusFilter('all')
    setCompanyFilter('all')
    setOrphanOnly(false)
    setIncludeArchived(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {PRESETS.map(p => {
          const isActive = activePresetKey === p.key
          return (
            <button
              key={p.key}
              onClick={() => applyPreset(p.state)}
              style={{
                fontSize: 12, fontWeight: isActive ? 600 : 500,
                padding: '7px 14px',
                background: isActive ? '#111' : '#fff',
                color: isActive ? '#fff' : '#111',
                border: isActive ? '1px solid #111' : '1px solid #e8e8e8',
                borderRadius: 4, cursor: 'pointer',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end',
        padding: '14px 16px', background: '#fff',
        border: '1px solid #e8e8e8', borderRadius: 6, marginBottom: 16,
      }}>
        <div style={{ flex: '1 1 220px', minWidth: 180 }}>
          <div style={labelStyle}>Search company</div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type to filter..."
            style={{ ...controlStyle, width: '100%' }}
          />
        </div>

        <div>
          <div style={labelStyle}>Status</div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ ...controlStyle, cursor: 'pointer' }}
          >
            <option value="all">All</option>
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <div style={labelStyle}>Company</div>
          <select
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value)}
            style={{ ...controlStyle, cursor: 'pointer' }}
          >
            <option value="all">All</option>
            {companyOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#111', cursor: 'pointer', paddingBottom: 7 }}>
          <input
            type="checkbox"
            checked={orphanOnly}
            onChange={e => setOrphanOnly(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Orphan only
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#111', cursor: 'pointer', paddingBottom: 7 }}>
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={e => setIncludeArchived(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Include archived
        </label>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 7 }}>
          {filtersActive && (
            <>
              <span style={{ fontSize: 12, color: '#888' }}>
                Showing {filtered.length} of {rows.length}
              </span>
              <button
                onClick={resetFilters}
                style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase', padding: '6px 12px',
                  background: '#fff', color: '#111',
                  border: '1px solid #e8e8e8', borderRadius: 4, cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: 40 }}>
          {rows.length === 0 ? 'No business briefs yet.' : 'No briefs match the current filters.'}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <style>{`.jl-brief-link:hover { text-decoration: underline; }`}</style>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #111' }}>
                {['Company', 'Sector', 'Submitter', 'Brief Type', 'Urgency', 'Confidentiality', 'Status', 'Created'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const badge = statusBadge[b.status] || statusBadge.under_review
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                    <td style={{ padding: '12px', color: '#111', fontWeight: 500 }}>
                      <Link href={`/admin/business-briefs/${b.id}`} className="jl-brief-link" style={{ color: '#111', textDecoration: 'none' }}>
                        {b.company_name}
                      </Link>
                    </td>
                    <td style={{ padding: '12px', color: '#111' }}>{b.sector || '—'}</td>
                    <td style={{ padding: '12px' }}>
                      {b.submitter ? (
                        <div style={{ lineHeight: 1.3 }}>
                          <div style={{ color: '#111', fontSize: 13 }}>{b.submitter.full_name || b.submitter.email || '—'}</div>
                          {b.submitter.role && (
                            <div style={{ color: '#888', fontSize: 11 }}>{b.submitter.role}</div>
                          )}
                        </div>
                      ) : (
                        <span style={{
                          display: 'inline-block', fontSize: 10, fontWeight: 600,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          padding: '3px 10px', borderRadius: 3,
                          background: '#fafafa', color: '#888', border: '1px solid #eee',
                        }}>
                          Orphan
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: '#111' }}>{b.brief_type}</td>
                    <td style={{ padding: '12px', color: '#111' }}>{b.urgency}</td>
                    <td style={{ padding: '12px', color: '#111' }}>{b.confidentiality_level}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-block', fontSize: 10, fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        padding: '3px 10px', borderRadius: 3,
                        background: badge.bg, color: badge.text,
                      }}>
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#888', fontSize: 12 }}>{formatDate(b.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
