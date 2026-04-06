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

export default function ContentQueueTable({ rows }: { rows: QueueItem[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
            return (
              <>
                <tr
                  key={item.id}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{ borderBottom: isExpanded ? 'none' : '1px solid #e8e8e8', cursor: 'pointer' }}
                >
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3, background: '#e8e8e8', color: '#555' }}>
                      {item.content_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#111', fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title || '\u2014'}
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
                    <ContentQueueActions id={item.id} status={item.status} />
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

  const fields: { label: string; value: any }[] = [
    { label: 'Category', value: content.category },
    { label: 'Context', value: content.context_paragraph },
    { label: 'Career implications', value: content.career_implications },
    { label: 'Brand tags', value: Array.isArray(content.brand_tags) ? content.brand_tags.join(', ') : content.brand_tags },
    { label: 'Confidence', value: content.confidence },
  ]

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
