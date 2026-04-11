'use client'

import { useState } from 'react'
import ContentQueueActions from './ContentQueueActions'
import Pagination from '@/components/ui/Pagination'

const PAGE_SIZE = 25

type QueueItem = {
  id: string
  content_type: string
  title: string | null
  source_type: string | null
  source_name: string | null
  source_url: string | null
  status: string
  created_at: string
  processed_content: Record<string, any> | null
  duplicate_state?: string | null
  duplicate_match?: { id: string; title: string; content_type: string; status: string; source: string } | null
}

// ── Doctrine flags ──────────────────────────────────────────────────────────
//
// The content_queue table itself does NOT carry content_origin,
// confidence, or requires_review columns. The doctrine flags below are
// derived from the columns that DO exist:
//
//   - source_url        is required when source_type='external_feed'
//   - source_type       implies the post-approve content_origin:
//                         joblux_generation → 'ai' / 'luxai'
//                         external_feed     → 'rss' / 'external'
//   - processed_content.confidence is the only confidence signal
//                         available, and only for signal rows. Values
//                         are strings ('high' | 'medium' | 'low'),
//                         not numeric scores.
//
// JOBLUX_MASTER_DOCTRINE_2026-04-10.md:218 forbids content_origin in
// ('ai','luxai') for the families: bloglux_articles (article), events,
// salary_benchmarks, interview_experiences. signals are exempt.
const FORBIDDEN_AI_FAMILIES = new Set(['article', 'event', 'salary_benchmark', 'interview'])

type DoctrineFlag = {
  key: string
  label: string
  tone: 'red' | 'amber'
  title: string
}

function computeDoctrineFlags(row: QueueItem): DoctrineFlag[] {
  const flags: DoctrineFlag[] = []

  // Missing source_url when required (external_feed must have origin URL)
  if (row.source_type === 'external_feed' && !(row.source_url && row.source_url.trim())) {
    flags.push({
      key: 'no-source-url',
      label: 'NO SOURCE URL',
      tone: 'red',
      title: 'source_type=external_feed but source_url is missing',
    })
  }

  // Forbidden-family AI origin (derived from source_type since
  // content_queue has no content_origin column)
  if (
    row.source_type === 'joblux_generation' &&
    FORBIDDEN_AI_FAMILIES.has(row.content_type)
  ) {
    flags.push({
      key: 'ai-forbidden',
      label: 'AI · FORBIDDEN FAMILY',
      tone: 'red',
      title: `${row.content_type} cannot have content_origin in ('ai','luxai') per doctrine`,
    })
  }

  // Low / medium confidence (signals only have a confidence signal today)
  const conf = row.processed_content?.confidence
  if (typeof conf === 'string' && conf.toLowerCase() !== 'high' && conf.trim() !== '') {
    flags.push({
      key: 'low-confidence',
      label: `CONFIDENCE: ${conf.toUpperCase()}`,
      tone: 'amber',
      title: 'Confidence is not high — needs explicit review before approve',
    })
  }

  return flags
}

const statusBadge: Record<string, { bg: string; text: string }> = {
  draft:        { bg: '#f5f5f5', text: '#757575' },
  under_review: { bg: '#e3f2fd', text: '#1565c0' },
  approved:     { bg: '#e8f5e9', text: '#2e7d32' },
  rejected:     { bg: '#fce4ec', text: '#c62828' },
  published:    { bg: '#111', text: '#fff' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ContentQueueTable({ rows: initialRows }: { rows: QueueItem[] }) {
  const [rows, setRows] = useState(initialRows)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, pageCount)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const visibleRows = rows.slice(pageStart, pageStart + PAGE_SIZE)

  const handleDelete = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const startEdit = (item: QueueItem) => {
    setEditingId(item.id)
    setEditTitle(item.title || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const saveEdit = async (id: string) => {
    const trimmed = editTitle.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/content-queue/${id}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      })
      if (res.ok) {
        setRows(prev => prev.map(r => r.id === id ? { ...r, title: trimmed } : r))
        setEditingId(null)
      }
    } catch {}
    setSaving(false)
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #111' }}>
            {['Family', 'Type', 'Title', 'Source', 'Source Name', 'Status', 'Created', 'Actions'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map(item => {
            const badge = statusBadge[item.status] || statusBadge.draft
            const isExpanded = expandedId === item.id
            const isEditing = editingId === item.id
            const doctrineFlags = computeDoctrineFlags(item)
            const needsReview = doctrineFlags.length > 0
            // Row decision-state: red = doctrine flag, amber = draft
            // needing decision, none = read-only (published/rejected/
            // approved). Rendered as a left-edge stripe on the first td.
            const isReadOnly =
              item.status === 'published' || item.status === 'rejected' || item.status === 'approved'
            const stripeColor = needsReview
              ? '#dc2626' // red — doctrine flag active
              : !isReadOnly
              ? '#a58e28' // amber — draft awaiting decision
              : 'transparent'
            return (
              <>
                <tr
                  key={item.id}
                  onClick={() => { if (!isEditing) setExpandedId(isExpanded ? null : item.id) }}
                  style={{ borderBottom: isExpanded ? 'none' : '1px solid #e8e8e8', cursor: 'pointer' }}
                >
                  <td style={{ padding: '12px', borderLeft: `3px solid ${stripeColor}` }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3, background: '#e8e8e8', color: '#888' }}>
                      {item.content_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {(() => {
                      // Type = meaningful subtype within the family.
                      // NEVER falls back to content_type (the Family
                      // column already shows that). Different content
                      // families store their subtype in different
                      // fields, so derive per family.
                      const pc = (item.processed_content || {}) as Record<string, unknown>
                      const cat = typeof pc.category === 'string' ? pc.category.trim() : ''
                      let subtype: string = cat
                      if (!subtype && item.content_type === 'event') {
                        const sector = typeof pc.sector === 'string' ? pc.sector.trim() : ''
                        if (sector) subtype = sector
                        else {
                          const t = typeof pc.type === 'string' ? pc.type.trim() : ''
                          if (t) subtype = t.replace(/_/g, ' ')
                        }
                      }
                      if (
                        !subtype &&
                        (item.content_type === 'salary_benchmark' || item.content_type === 'interview')
                      ) {
                        const brand = typeof pc.brand_slug === 'string' ? pc.brand_slug.trim() : ''
                        if (brand) subtype = brand
                      }
                      if (!subtype) {
                        return <span style={{ fontSize: 11, color: '#bbb' }}>—</span>
                      }
                      return (
                        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3, background: '#e8e8e8', color: '#555' }}>
                          {subtype}
                        </span>
                      )
                    })()}
                  </td>
                  <td style={{ padding: '12px', color: '#111', fontWeight: 500, maxWidth: 300 }} onClick={e => { if (isEditing) e.stopPropagation() }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(item.id); if (e.key === 'Escape') cancelEdit() }}
                          style={{ flex: 1, padding: '4px 8px', fontSize: 13, border: '1px solid #e8e8e8', borderRadius: 3, color: '#111', outline: 'none' }}
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(item.id)}
                          disabled={saving || !editTitle.trim()}
                          style={{ fontSize: 11, padding: '4px 10px', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: 3, cursor: 'pointer' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{ fontSize: 11, padding: '4px 10px', background: '#fff', color: '#555', border: '1px solid #e8e8e8', borderRadius: 3, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {item.title || '\u2014'}
                        </span>
                        {(needsReview || doctrineFlags.length > 0) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {needsReview && (
                              <span
                                title="Doctrine flag(s) active — review required before approve"
                                style={{
                                  fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                                  padding: '2px 6px', borderRadius: 3,
                                  background: '#fef2f2', color: '#dc2626',
                                  border: '1px solid #fecaca',
                                }}
                              >
                                REVIEW
                              </span>
                            )}
                            {doctrineFlags.map(f => (
                              <span
                                key={f.key}
                                title={f.title}
                                style={{
                                  fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                                  padding: '2px 6px', borderRadius: 3,
                                  background: f.tone === 'red' ? '#fef2f2' : '#fff8e6',
                                  color: f.tone === 'red' ? '#dc2626' : '#a58e28',
                                  border: f.tone === 'red' ? '1px solid #fecaca' : '1px solid #f5e6a8',
                                }}
                              >
                                {f.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: '#aaa', fontSize: 11 }}>{item.source_type || '\u2014'}</td>
                  <td style={{ padding: '12px', color: '#aaa', fontSize: 11 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.source_name || '\u2014'}
                      </span>
                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          title={item.source_url}
                          style={{
                            fontSize: 10, color: '#5a8bc4', textDecoration: 'none',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}
                        >
                          source ↗
                        </a>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-block', fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '4px 12px', borderRadius: 4,
                      background: badge.bg, color: badge.text,
                    }}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#aaa', fontSize: 11 }}>{formatDate(item.created_at)}</td>
                  <td style={{ padding: '12px' }} onClick={e => e.stopPropagation()}>
                    <ContentQueueActions
                      id={item.id}
                      status={item.status}
                      onDelete={() => handleDelete(item.id)}
                      onEdit={() => startEdit(item)}
                    />
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${item.id}-preview`} style={{ borderBottom: '1px solid #e8e8e8' }}>
                    <td colSpan={8} style={{ padding: '0 12px 16px' }}>
                      <PreviewPanel content={item.processed_content} />
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>

      <Pagination
        page={safePage}
        pageCount={pageCount}
        onPageChange={setCurrentPage}
        theme="light"
      />
    </div>
  )
}

function PreviewPanel({ content }: { content: Record<string, any> | null }) {
  if (!content || typeof content !== 'object') {
    return <div style={{ fontSize: 12, color: '#888', padding: '12px 0' }}>Preview unavailable.</div>
  }

  // Salary benchmark preview
  if (Array.isArray(content.records)) {
    const records = content.records as any[]
    const fmt = (n: any) => {
      const num = Number(n)
      return Number.isFinite(num) ? num.toLocaleString('en-US') : '\u2014'
    }
    return (
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 6, padding: '16px 20px', marginTop: 4 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 2 }}>{content.brand_name || '\u2014'}</div>
        {content.brand_slug && (
          <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>{content.brand_slug}</div>
        )}
        {records.length === 0 ? (
          <div style={{ fontSize: 12, color: '#888', padding: '8px 0' }}>No salary records in this draft</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e8e8e8' }}>
                  {['Job Title', 'Department', 'Seniority', 'City', 'Currency', 'Median Salary'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 10px', color: '#111' }}>{r.job_title || '\u2014'}</td>
                    <td style={{ padding: '6px 10px', color: '#555' }}>{r.department || '\u2014'}</td>
                    <td style={{ padding: '6px 10px', color: '#555' }}>{r.seniority || '\u2014'}</td>
                    <td style={{ padding: '6px 10px', color: '#555' }}>{r.city || '\u2014'}</td>
                    <td style={{ padding: '6px 10px', color: '#555' }}>{r.currency || '\u2014'}</td>
                    <td style={{ padding: '6px 10px', color: '#111', fontWeight: 500 }}>{fmt(r.salary_median)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const fields: { label: string; value: any }[] = [
    { label: 'Category', value: content.category || content.sector },
    { label: 'Subtitle', value: content.subtitle },
    { label: 'Excerpt', value: content.excerpt },
    { label: 'Description', value: content.description },
    { label: 'Location', value: [content.city, content.country].filter(Boolean).join(', ') || null },
    { label: 'Date', value: content.start_date ? `${content.start_date}${content.end_date ? ' → ' + content.end_date : ''}` : null },
    { label: 'Organizer', value: content.organizer },
    { label: 'Type', value: content.type },
    { label: 'Context', value: content.context_paragraph },
    { label: 'Career context', value: content.career_context },
    { label: 'Career implications', value: content.career_implications },
    { label: 'Brand tags', value: Array.isArray(content.brand_tags) ? content.brand_tags.join(', ') : content.brand_tags },
    { label: 'Brands present', value: Array.isArray(content.brands_present) ? content.brands_present.join(', ') : content.brands_present },
    { label: 'Tags', value: Array.isArray(content.tags) ? content.tags.join(', ') : content.tags },
    { label: 'Read time', value: content.read_time_minutes ? `${content.read_time_minutes} min` : null },
    { label: 'Confidence', value: content.confidence },
  ]

  // Article body preview (full read-mode)
  if (typeof content.body === 'string' && content.body.trim()) {
    const raw = content.body
    const isHtml = /<[a-z][\s\S]*>/i.test(raw)

    let bodyHtml: string
    if (isHtml) {
      bodyHtml = raw
    } else {
      // Minimal markdown -> HTML for admin preview
      const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const inline = (s: string) => {
        let out = escape(s)
        out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
        return out
      }
      bodyHtml = raw
        .split(/\n{2,}/)
        .map(block => {
          const t = block.trim()
          if (!t) return ''
          if (/^###\s+/.test(t)) return `<h3>${inline(t.replace(/^###\s+/, ''))}</h3>`
          if (/^##\s+/.test(t))  return `<h2>${inline(t.replace(/^##\s+/, ''))}</h2>`
          if (/^#\s+/.test(t))   return `<h1>${inline(t.replace(/^#\s+/, ''))}</h1>`
          if (/^>\s+/.test(t))   return `<blockquote>${inline(t.replace(/^>\s+/, ''))}</blockquote>`
          if (/^([-*]|\d+\.)\s+/.test(t)) {
            const ordered = /^\d+\.\s+/.test(t)
            const items = t.split(/\n/).map(l => l.replace(/^([-*]|\d+\.)\s+/, '').trim()).filter(Boolean)
            const tag = ordered ? 'ol' : 'ul'
            return `<${tag}>${items.map(it => `<li>${inline(it)}</li>`).join('')}</${tag}>`
          }
          return `<p>${inline(t).replace(/\n/g, '<br>')}</p>`
        })
        .join('')
    }

    const metaBits: string[] = []
    if (content.category) metaBits.push(String(content.category))
    if (content.read_time_minutes) metaBits.push(`${content.read_time_minutes} min read`)

    return (
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 6, padding: '36px 44px', marginTop: 4 }}>
        <style>{`
          .cq-article-preview h1 { font-size: 24px; font-weight: 600; margin: 1.4em 0 0.5em; color: #111; line-height: 1.3; }
          .cq-article-preview h2 { font-size: 20px; font-weight: 600; margin: 1.4em 0 0.5em; color: #111; line-height: 1.3; }
          .cq-article-preview h3 { font-size: 17px; font-weight: 600; margin: 1.3em 0 0.4em; color: #111; line-height: 1.35; }
          .cq-article-preview p  { margin: 0 0 1.1em; }
          .cq-article-preview ul, .cq-article-preview ol { margin: 0 0 1.1em 1.3em; padding: 0; }
          .cq-article-preview li { margin-bottom: 0.4em; }
          .cq-article-preview a  { color: #1565c0; text-decoration: underline; }
          .cq-article-preview blockquote { border-left: 3px solid #e8e8e8; margin: 1.2em 0; padding: 0.2em 1em; color: #555; font-style: italic; }
          .cq-article-preview img { max-width: 100%; height: auto; border-radius: 4px; margin: 1.2em 0; display: block; }
          .cq-article-preview strong { font-weight: 600; }
          .cq-article-preview code { background: #f5f5f5; padding: 0.1em 0.35em; border-radius: 3px; font-size: 0.92em; }
          .cq-article-preview pre  { background: #f5f5f5; padding: 12px 14px; border-radius: 4px; overflow-x: auto; margin: 1.1em 0; }
          .cq-article-preview pre code { background: transparent; padding: 0; }
          .cq-article-preview hr { border: 0; border-top: 1px solid #e8e8e8; margin: 2em 0; }
        `}</style>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {content.title && (
            <h1 style={{ fontSize: 28, fontWeight: 600, color: '#111', lineHeight: 1.25, margin: '0 0 12px', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              {content.title}
            </h1>
          )}
          {metaBits.length > 0 && (
            <div style={{ fontSize: 12, color: '#888', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #e8e8e8' }}>
              {metaBits.join(' · ')}
            </div>
          )}
          <div
            className="cq-article-preview"
            style={{ fontSize: 15, color: '#222', lineHeight: 1.75 }}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 6, padding: '16px 20px', marginTop: 4 }}>
      {fields.map(f => (
        f.value ? (
          <div key={f.label} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 3 }}>{f.label}</div>
            <div style={{ fontSize: 13, color: '#111', lineHeight: 1.5 }}>{f.value}</div>
          </div>
        ) : null
      ))}
    </div>
  )
}
