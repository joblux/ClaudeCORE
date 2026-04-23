'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const TABS = [
  { id: 'voices', label: 'Insider Voices', description: 'Perspective articles from Trusted Contributors' },
  { id: 'salary', label: 'Salary Data', description: 'Compensation submissions from members' },
  { id: 'interviews', label: 'Interview Experiences', description: 'Interview reports from members' },
  { id: 'brand', label: 'Brand Corrections', description: 'WikiLux correction requests' },
  { id: 'signals', label: 'Signal Tips', description: 'Coming soon' },
  { id: 'reports', label: 'Research Reports', description: 'Coming soon' },
]

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  draft:              { bg: '#f5f5f5', text: '#666',    label: 'Draft' },
  submitted:          { bg: '#fff8e6', text: '#a58e28', label: 'Submitted' },
  review:             { bg: '#fff8e6', text: '#a58e28', label: 'In Review' },
  pending:            { bg: '#fff8e6', text: '#a58e28', label: 'Pending' },
  revision_requested: { bg: '#fff3e0', text: '#e68a00', label: 'Revision' },
  published:          { bg: '#e6f7ef', text: '#1D9E75', label: 'Published' },
  approved:           { bg: '#e6f7ef', text: '#1D9E75', label: 'Approved' },
  accepted:           { bg: '#e6f7ef', text: '#1D9E75', label: 'Approved' },
  archived:           { bg: '#f5f5f5', text: '#666',    label: 'Archived' },
  rejected:           { bg: '#fef2f2', text: '#dc2626', label: 'Rejected' },
}

function Badge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] || { bg: '#f5f5f5', text: '#999', label: status }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 4, background: s.bg, color: s.text }}>
      {s.label.toUpperCase()}
    </span>
  )
}

function timeAgo(dateStr: string) {
  if (!dateStr) return ''
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  return `${Math.floor(d / 30)}mo ago`
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 10px', fontSize: 11, border: '1px solid #e8e8e8', borderRadius: 5, background: '#fff', cursor: 'pointer', color: '#999' }} title="Delete">
      🗑
    </button>
  )
}

function DeleteConfirmInline({ id, actioning, onConfirm, onCancel }: { id: string; actioning: string | null; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ borderTop: '1px solid #fecaca', padding: '14px 16px', background: '#fef2f2' }}>
      <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>Permanently delete this contribution? This cannot be undone.</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onConfirm} disabled={actioning === id} style={{ padding: '6px 14px', fontSize: 12, border: 'none', borderRadius: 5, background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          {actioning === id ? '...' : 'Delete permanently'}
        </button>
        <button onClick={onCancel} style={{ padding: '6px 14px', fontSize: 12, border: '1px solid #e8e8e8', borderRadius: 5, background: '#fff', color: '#666', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: '#999', fontSize: 13 }}>
      No {label} contributions pending review.
    </div>
  )
}

function ComingSoon({ label, description }: { label: string; description: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 13, color: '#111', fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#999' }}>{description}</div>
    </div>
  )
}

// ── INSIDER VOICES TAB ──────────────────────────────────────────────────────
function VoicesTab() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actioning, setActioning] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/contributions?type=voices&status=' + filter)
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }, [filter])

  useEffect(() => { fetch_() }, [fetch_])

  const [revisionTarget, setRevisionTarget] = useState<string | null>(null)
  const [revisionNote, setRevisionNote] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const doDelete = async (id: string, source: string) => {
    setActioning(id)
    await fetch('/api/admin/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', type: 'voices', id, source }),
    })
    setActioning(null)
    setDeleteTarget(null)
    fetch_()
  }

  const approve = async (id: string, source: string) => {
    setActioning(id)
    await fetch('/api/admin/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', type: 'voices', id, source }),
    })
    setActioning(null)
    fetch_()
  }

  const requestRevision = async (id: string, source: string) => {
    setActioning(id)
    await fetch('/api/admin/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revision', type: 'voices', id, note: revisionNote, source }),
    })
    setActioning(null)
    setRevisionTarget(null)
    setRevisionNote('')
    fetch_()
  }

  const reject = async (id: string, source: string) => {
    setActioning(id)
    await fetch('/api/admin/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', type: 'voices', id, note: rejectNote, source }),
    })
    setActioning(null)
    setRejectTarget(null)
    setRejectNote('')
    fetch_()
  }

  const pending = items.filter(i => ['draft', 'submitted', 'review'].includes(i.status)).length

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {['all', 'submitted', 'revision_requested', 'published', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 6, border: '1px solid', fontSize: 12, cursor: 'pointer',
            borderColor: filter === f ? '#111' : '#e8e8e8',
            background: filter === f ? '#111' : '#fff',
            color: filter === f ? '#fff' : '#666',
          }}>
            {f === 'all' ? 'All' : f === 'submitted' ? 'Submitted' : f === 'revision_requested' ? 'Revision' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        {pending > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#a58e28', fontWeight: 600 }}>
            {pending} awaiting review
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 13 }}>Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState label="Insider Voice" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden' }}>
              {/* Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                {/* Avatar */}
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f5f5f5', border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#666', flexShrink: 0 }}>
                  {(item.author_name || 'IV').substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#999' }}>
                    {item.author_name || 'Insider Voice'} · {item.author_role || ''} · {timeAgo(item.created_at)}
                  </div>
                </div>
                <Badge status={item.status} />
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} style={{ padding: '5px 10px', fontSize: 11, border: '1px solid #e8e8e8', borderRadius: 5, background: '#fff', cursor: 'pointer', color: '#666' }}>
                    {expanded === item.id ? 'Close' : 'Preview'}
                  </button>
                  {['draft', 'submitted', 'review'].includes(item.status) && (
                    <>
                      <button onClick={() => approve(item.id, item.source)} disabled={actioning === item.id} style={{ padding: '5px 12px', fontSize: 11, border: 'none', borderRadius: 5, background: '#1D9E75', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                        {actioning === item.id ? '...' : 'Publish'}
                      </button>
                      {item.source !== 'contribution' && (
                        <button onClick={() => setRevisionTarget(item.id)} style={{ padding: '5px 12px', fontSize: 11, border: '1px solid #e8e8e8', borderRadius: 5, background: '#fff', color: '#e68a00', cursor: 'pointer', fontWeight: 600 }}>
                          Revise
                        </button>
                      )}
                      <button onClick={() => setRejectTarget(item.id)} style={{ padding: '5px 12px', fontSize: 11, border: '1px solid #fecaca', borderRadius: 5, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>
                        Reject
                      </button>
                    </>
                  )}
                  <DeleteBtn onClick={() => setDeleteTarget(item.id)} />
                </div>
              </div>

              {/* Expanded preview */}
              {expanded === item.id && (
                <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 20px', background: '#fafafa' }}>
                  {item.excerpt && (
                    <div style={{ fontStyle: 'italic', fontSize: 13, color: '#666', marginBottom: 10, padding: '10px 14px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 6, borderLeft: '3px solid #a58e28' }}>
                      "{item.excerpt}"
                    </div>
                  )}
                  {item.body && (
                    <div style={{ fontSize: 13, color: '#444', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' }}>
                      {item.body}
                    </div>
                  )}
                  {item.cover_image_url && (
                    <div style={{ marginTop: 10 }}>
                      <img src={item.cover_image_url} alt="cover" style={{ maxHeight: 160, borderRadius: 6, objectFit: 'cover' }} />
                    </div>
                  )}
                  {item.external_link && (
                    <a href={item.external_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: '#666' }}>
                      External link →
                    </a>
                  )}
                </div>
              )}

              {/* Revision request inline */}
              {revisionTarget === item.id && (
                <div style={{ borderTop: '1px solid #e8e8e8', padding: '14px 16px', background: '#fffbf0' }}>
                  <div style={{ fontSize: 12, color: '#e68a00', fontWeight: 600, marginBottom: 6 }}>Revision note (sent to contributor)</div>
                  <textarea
                    value={revisionNote}
                    onChange={e => setRevisionNote(e.target.value)}
                    placeholder="e.g. Great perspective — could you add a specific example from your experience?"
                    style={{ width: '100%', padding: '8px 10px', fontSize: 12, border: '1px solid #e8e2d8', borderRadius: 5, background: '#fff', color: '#111', outline: 'none', resize: 'vertical', minHeight: 60, boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => requestRevision(item.id, item.source)} disabled={actioning === item.id} style={{ padding: '6px 14px', fontSize: 12, border: 'none', borderRadius: 5, background: '#e68a00', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                      {actioning === item.id ? '...' : 'Request Revision'}
                    </button>
                    <button onClick={() => { setRevisionTarget(null); setRevisionNote('') }} style={{ padding: '6px 14px', fontSize: 12, border: '1px solid #e8e8e8', borderRadius: 5, background: '#fff', color: '#666', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Reject modal inline */}
              {rejectTarget === item.id && (
                <div style={{ borderTop: '1px solid #fecaca', padding: '14px 16px', background: '#fef2f2' }}>
                  <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginBottom: 6 }}>Rejection note (optional | sent to contributor)</div>
                  <textarea
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    placeholder="e.g. Content needs more specificity. Please revise and resubmit."
                    style={{ width: '100%', padding: '8px 10px', fontSize: 12, border: '1px solid #fecaca', borderRadius: 5, background: '#fff', color: '#111', outline: 'none', resize: 'vertical', minHeight: 60, boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => reject(item.id, item.source)} disabled={actioning === item.id} style={{ padding: '6px 14px', fontSize: 12, border: 'none', borderRadius: 5, background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                      {actioning === item.id ? '...' : 'Confirm Reject'}
                    </button>
                    <button onClick={() => { setRejectTarget(null); setRejectNote('') }} style={{ padding: '6px 14px', fontSize: 12, border: '1px solid #e8e8e8', borderRadius: 5, background: '#fff', color: '#666', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Delete confirmation inline */}
              {deleteTarget === item.id && (
                <DeleteConfirmInline id={item.id} actioning={actioning} onConfirm={() => doDelete(item.id, item.source)} onCancel={() => setDeleteTarget(null)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── SALARY TAB ───────────────────────────────────────────────────────────────
function SalaryTab() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actioning, setActioning] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/contributions?type=salary&status=' + filter)
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }, [filter])

  useEffect(() => { fetch_() }, [fetch_])

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const act = async (id: string, action: 'approve' | 'reject') => {
    setActioning(id)
    if (action === 'approve') {
      await fetch(`/api/contributions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
    } else {
      await fetch('/api/admin/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, type: 'salary', id }),
      })
    }
    setActioning(null)
    fetch_()
  }

  const doDelete = async (id: string) => {
    setActioning(id)
    await fetch('/api/admin/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', type: 'salary', id }),
    })
    setActioning(null)
    setDeleteTarget(null)
    fetch_()
  }

  const pending = items.filter(i => i.status === 'pending').length

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 6, border: '1px solid', fontSize: 12, cursor: 'pointer',
            borderColor: filter === f ? '#111' : '#e8e8e8',
            background: filter === f ? '#111' : '#fff',
            color: filter === f ? '#fff' : '#666',
          }}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        {pending > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#a58e28', fontWeight: 600 }}>
            {pending} awaiting review
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 13 }}>Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState label="salary" />
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                {['Brand', 'Role', 'City', 'Salary', 'Submitted', 'Status', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, fontWeight: 600, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <React.Fragment key={item.id}>
                <tr style={{ borderBottom: i < items.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                  <td style={{ padding: '12px 14px', color: '#111', fontWeight: 500 }}>{item.brand_name || item.brand_slug || '—'}</td>
                  <td style={{ padding: '12px 14px', color: '#444' }}>{item.salary?.job_title || '—'}</td>
                  <td style={{ padding: '12px 14px', color: '#666' }}>{item.salary?.city || '—'}</td>
                  <td style={{ padding: '12px 14px', color: '#111', fontWeight: 500 }}>
                    {item.salary?.salary_currency}{item.salary?.base_salary ? `${Math.round(item.salary.base_salary / 1000)}K` : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#999', fontSize: 11 }}>{timeAgo(item.created_at)}</td>
                  <td style={{ padding: '12px 14px' }}><Badge status={item.status} /></td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {item.status === 'pending' && (
                        <>
                          <button onClick={() => act(item.id, 'approve')} disabled={actioning === item.id} style={{ padding: '4px 10px', fontSize: 11, border: 'none', borderRadius: 4, background: '#1D9E75', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                            {actioning === item.id ? '...' : '✓'}
                          </button>
                          <button onClick={() => act(item.id, 'reject')} disabled={actioning === item.id} style={{ padding: '4px 10px', fontSize: 11, border: '1px solid #fecaca', borderRadius: 4, background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>
                            ✕
                          </button>
                        </>
                      )}
                      <DeleteBtn onClick={() => setDeleteTarget(item.id)} />
                    </div>
                  </td>
                </tr>
                {deleteTarget === item.id && (
                  <tr><td colSpan={7} style={{ padding: 0 }}>
                    <DeleteConfirmInline id={item.id} actioning={actioning} onConfirm={() => doDelete(item.id)} onCancel={() => setDeleteTarget(null)} />
                  </td></tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── INTERVIEWS TAB ───────────────────────────────────────────────────────────
function InterviewsTab() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actioning, setActioning] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/contributions?type=interviews&status=' + filter)
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }, [filter])

  useEffect(() => { fetch_() }, [fetch_])

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const act = async (id: string, action: 'approve' | 'reject') => {
    setActioning(id)
    if (action === 'approve') {
      await fetch(`/api/contributions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
    } else {
      await fetch('/api/admin/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, type: 'interviews', id }),
      })
    }
    setActioning(null)
    fetch_()
  }

  const doDelete = async (id: string) => {
    setActioning(id)
    await fetch('/api/admin/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', type: 'interviews', id }),
    })
    setActioning(null)
    setDeleteTarget(null)
    fetch_()
  }

  const pending = items.filter(i => i.status === 'pending').length

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 6, border: '1px solid', fontSize: 12, cursor: 'pointer',
            borderColor: filter === f ? '#111' : '#e8e8e8',
            background: filter === f ? '#111' : '#fff',
            color: filter === f ? '#fff' : '#666',
          }}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        {pending > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#a58e28', fontWeight: 600 }}>
            {pending} awaiting review
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 13 }}>Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState label="interview" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>
                    {item.brand_name} | {item.interview?.job_title || '—'}
                  </div>
                  <div style={{ fontSize: 11, color: '#999' }}>
                    {item.interview?.department} · {item.interview?.seniority} · {item.interview?.interview_year} · {timeAgo(item.created_at)}
                  </div>
                </div>
                <Badge status={item.status} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} style={{ padding: '5px 10px', fontSize: 11, border: '1px solid #e8e8e8', borderRadius: 5, background: '#fff', cursor: 'pointer', color: '#666' }}>
                    {expanded === item.id ? 'Close' : 'Preview'}
                  </button>
                  {item.status === 'pending' && (
                    <>
                      <button onClick={() => act(item.id, 'approve')} disabled={actioning === item.id} style={{ padding: '5px 12px', fontSize: 11, border: 'none', borderRadius: 5, background: '#1D9E75', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                        {actioning === item.id ? '...' : 'Approve'}
                      </button>
                      <button onClick={() => act(item.id, 'reject')} style={{ padding: '5px 12px', fontSize: 11, border: '1px solid #fecaca', borderRadius: 5, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>
                        Reject
                      </button>
                    </>
                  )}
                  <DeleteBtn onClick={() => setDeleteTarget(item.id)} />
                </div>
              </div>
              {expanded === item.id && item.interview && (
                <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 20px', background: '#fafafa', fontSize: 13, color: '#444', lineHeight: 1.6 }}>
                  {item.interview.process_description && <div style={{ marginBottom: 8 }}><strong style={{ color: '#111' }}>Process:</strong> {item.interview.process_description}</div>}
                  {item.interview.questions_asked && (
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ color: '#111' }}>Questions asked:</strong>
                      <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                        {(Array.isArray(item.interview.questions_asked) ? item.interview.questions_asked : [item.interview.questions_asked]).map((q: string, i: number) => (
                          <li key={i} style={{ marginBottom: 2 }}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item.interview.tips && <div><strong style={{ color: '#111' }}>Tips:</strong> {item.interview.tips}</div>}
                </div>
              )}
              {deleteTarget === item.id && (
                <DeleteConfirmInline id={item.id} actioning={actioning} onConfirm={() => doDelete(item.id)} onCancel={() => setDeleteTarget(null)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── BRAND CORRECTIONS TAB ────────────────────────────────────────────────────
function BrandTab() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actioning, setActioning] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/contributions?type=brand&status=' + filter)
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }, [filter])

  useEffect(() => { fetch_() }, [fetch_])

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const act = async (id: string, action: 'approve' | 'reject') => {
    setActioning(id)
    await fetch('/api/admin/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, type: 'brand', id }),
    })
    setActioning(null)
    fetch_()
  }

  const doDelete = async (id: string) => {
    setActioning(id)
    await fetch('/api/admin/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', type: 'brand', id }),
    })
    setActioning(null)
    setDeleteTarget(null)
    fetch_()
  }

  const pending = items.filter(i => i.status === 'pending').length

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {['all', 'pending', 'accepted', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 6, border: '1px solid', fontSize: 12, cursor: 'pointer',
            borderColor: filter === f ? '#111' : '#e8e8e8',
            background: filter === f ? '#111' : '#fff',
            color: filter === f ? '#fff' : '#666',
          }}>
            {f === 'all' ? 'All' : f === 'accepted' ? 'Approved' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        {pending > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#a58e28', fontWeight: 600 }}>
            {pending} awaiting review
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 13 }}>Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState label="brand correction" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>
                    {item.brand_slug} | correction by {item.contributor_name || 'Anonymous'}
                  </div>
                  <div style={{ fontSize: 11, color: '#999' }}>
                    {timeAgo(item.created_at)}
                    {item.source_url && <> · <a href={item.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#666' }}>Source</a></>}
                  </div>
                </div>
                <Badge status={item.status} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} style={{ padding: '5px 10px', fontSize: 11, border: '1px solid #e8e8e8', borderRadius: 5, background: '#fff', cursor: 'pointer', color: '#666' }}>
                    {expanded === item.id ? 'Close' : 'Preview'}
                  </button>
                  {item.status === 'pending' && (
                    <>
                      <button onClick={() => act(item.id, 'approve')} disabled={actioning === item.id} style={{ padding: '5px 12px', fontSize: 11, border: 'none', borderRadius: 5, background: '#1D9E75', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                        {actioning === item.id ? '...' : 'Approve'}
                      </button>
                      <button onClick={() => act(item.id, 'reject')} style={{ padding: '5px 12px', fontSize: 11, border: '1px solid #fecaca', borderRadius: 5, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>
                        Reject
                      </button>
                    </>
                  )}
                  <DeleteBtn onClick={() => setDeleteTarget(item.id)} />
                </div>
              </div>
              {expanded === item.id && (
                <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 20px', background: '#fafafa', fontSize: 13, color: '#444', lineHeight: 1.6 }}>
                  <div style={{ marginBottom: 8 }}><strong style={{ color: '#111' }}>Issue reported:</strong> {item.issue_description}</div>
                  {item.suggested_correction && <div><strong style={{ color: '#111' }}>Suggested correction:</strong> {item.suggested_correction}</div>}
                </div>
              )}
              {deleteTarget === item.id && (
                <DeleteConfirmInline id={item.id} actioning={actioning} onConfirm={() => doDelete(item.id)} onCancel={() => setDeleteTarget(null)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ContributionCommandCenter() {
  const [activeTab, setActiveTab] = useState('voices')
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/admin/contributions?type=counts')
      .then(r => r.json())
      .then(d => setCounts(d.counts || {}))
      .catch(() => {})
  }, [])

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Contribution Command Center</h1>
        <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Review, approve, or reject all user-submitted content</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid #e8e8e8', marginBottom: 24 }}>
        {TABS.map(tab => {
          const count = counts[tab.id] || 0
          const isComingSoon = tab.id === 'signals' || tab.id === 'reports'
          return (
            <button
              key={tab.id}
              onClick={() => !isComingSoon && setActiveTab(tab.id)}
              style={{
                padding: '10px 16px', fontSize: 13, border: 'none', borderBottom: activeTab === tab.id ? '2px solid #111' : '2px solid transparent',
                background: 'transparent', cursor: isComingSoon ? 'default' : 'pointer',
                color: isComingSoon ? '#bbb' : activeTab === tab.id ? '#111' : '#666',
                fontWeight: activeTab === tab.id ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: -1,
              }}
            >
              {tab.label}
              {count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, background: '#a58e28', color: '#fff', borderRadius: 10, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                  {count}
                </span>
              )}
              {isComingSoon && <span style={{ fontSize: 10, color: '#bbb' }}>soon</span>}
            </button>
          )
        })}
      </div>

      {/* Tab description */}
      <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>
        {TABS.find(t => t.id === activeTab)?.description}
      </div>

      {/* Content */}
      {activeTab === 'voices' && <VoicesTab />}
      {activeTab === 'salary' && <SalaryTab />}
      {activeTab === 'interviews' && <InterviewsTab />}
      {activeTab === 'brand' && <BrandTab />}
      {activeTab === 'signals' && <ComingSoon label="Signal Tips" description="Members will be able to submit market intelligence tips. Coming soon." />}
      {activeTab === 'reports' && <ComingSoon label="Research Reports" description="Insider tier members will be able to submit research reports. Coming soon." />}
    </div>
  )
}
