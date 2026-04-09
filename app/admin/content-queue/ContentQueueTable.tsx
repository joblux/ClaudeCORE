'use client'

import { useState } from 'react'
import ContentQueueActions from './ContentQueueActions'

type QueueItem = {
  id: string
  content_type: string
  title: string | null
  source_type: string | null
  source_name: string | null
  status: string
  created_at: string
  processed_content: Record<string, any> | null
  duplicate_state?: string | null
  duplicate_match?: { id: string; title: string; content_type: string; status: string; source: string } | null
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
            {['Type', 'Title', 'Source', 'Source Name', 'Status', 'Created', 'Actions'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(item => {
            const badge = statusBadge[item.status] || statusBadge.draft
            const isExpanded = expandedId === item.id
            const isEditing = editingId === item.id
            return (
              <>
                <tr
                  key={item.id}
                  onClick={() => { if (!isEditing) setExpandedId(isExpanded ? null : item.id) }}
                  style={{ borderBottom: isExpanded ? 'none' : '1px solid #e8e8e8', cursor: 'pointer' }}
                >
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3, background: '#e8e8e8', color: '#555' }}>
                      {(() => {
                        const pcCat = item.processed_content?.category
                        if (typeof pcCat === 'string' && pcCat.trim()) return pcCat
                        const itemCat = (item as any).category
                        if (typeof itemCat === 'string' && itemCat.trim()) return itemCat
                        return item.content_type
                      })()}
                    </span>
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
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {item.title || '\u2014'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: '#888', fontSize: 12 }}>{item.source_type || '\u2014'}</td>
                  <td style={{ padding: '12px', color: '#888', fontSize: 12 }}>{item.source_name || '\u2014'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-block', fontSize: 10, fontWeight: 600,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '3px 10px', borderRadius: 3,
                      background: badge.bg, color: badge.text,
                    }}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#888', fontSize: 12 }}>{formatDate(item.created_at)}</td>
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
                    <td colSpan={7} style={{ padding: '0 12px 16px' }}>
                      <PreviewPanel content={item.processed_content} />
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
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
