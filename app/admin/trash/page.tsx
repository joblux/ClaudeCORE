'use client'

import { useState, useEffect } from 'react'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'

type TrashItem = {
  id: string
  content_type: string
  label: string
  sublabel: string | null
  deleted_at: string
  deleted_by: string | null
  original_status: string | null
  meta: Record<string, unknown>
}

const TYPE_LABELS: Record<string, string> = {
  wikilux: 'WikiLux',
  article: 'Article',
  contribution: 'Contribution',
  interview: 'Interview',
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  wikilux: { bg: '#e8f4fd', text: '#1a73e8' },
  article: { bg: '#f3e8ff', text: '#7c3aed' },
  contribution: { bg: '#fff8e6', text: '#a58e28' },
  interview: { bg: '#e6f7ef', text: '#1D9E75' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actioning, setActioning] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleteInput, setDeleteInput] = useState('')

  const fetchItems = () => {
    setLoading(true)
    fetch('/api/admin/trash')
      .then(r => r.ok ? r.json() : { items: [] })
      .then(data => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchItems() }, [])

  const filtered = filter === 'all' ? items : items.filter(i => i.content_type === filter)

  const handleRestore = async (item: TrashItem) => {
    setActioning(item.id)
    try {
      const res = await fetch('/api/admin/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', content_type: item.content_type, id: item.id }),
      })
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== item.id))
      }
    } catch { /* silently fail */ }
    setActioning(null)
  }

  const handlePermanentDelete = async (item: TrashItem) => {
    setActioning(item.id)
    try {
      const res = await fetch('/api/admin/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'permanent_delete', content_type: item.content_type, id: item.id }),
      })
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== item.id))
      }
    } catch { /* silently fail */ }
    setActioning(null)
    setConfirmDelete(null)
    setDeleteInput('')
  }

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'wikilux', label: 'WikiLux' },
    { id: 'article', label: 'Articles' },
    { id: 'contribution', label: 'Contributions' },
    { id: 'interview', label: 'Interviews' },
  ]

  return (
    <div style={{ padding: '28px 32px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Trash2 size={18} color="#666" />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', margin: 0 }}>Trash</h2>
          <span style={{
            fontSize: 11, color: '#999', background: '#f0f0f0',
            padding: '2px 8px', borderRadius: 10, fontWeight: 500,
          }}>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#999', margin: 0 }}>
          Soft-deleted content across all modules. Restore to return items to their original state, or permanently delete.
        </p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '5px 12px', borderRadius: 6, border: '1px solid',
              borderColor: filter === f.id ? '#111' : '#e8e8e8',
              background: filter === f.id ? '#111' : '#fff',
              color: filter === f.id ? '#fff' : '#666',
              fontSize: 12, cursor: 'pointer', fontWeight: 500,
            }}
          >
            {f.label}
            {f.id !== 'all' && (
              <span style={{ marginLeft: 4, opacity: 0.7 }}>
                ({items.filter(i => i.content_type === f.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#999', fontSize: 13 }}>
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 60, color: '#999', fontSize: 13,
          background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8',
        }}>
          {filter === 'all' ? 'Trash is empty' : `No deleted ${filter} items`}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(item => {
            const typeColor = TYPE_COLORS[item.content_type] || { bg: '#f5f5f5', text: '#666' }
            const isDeleting = confirmDelete === item.id
            const isActioning = actioning === item.id

            return (
              <div key={`${item.content_type}-${item.id}`} style={{
                background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8,
                padding: '12px 16px', opacity: isActioning ? 0.5 : 1,
                transition: 'opacity 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Type badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                    background: typeColor.bg, color: typeColor.text,
                    textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
                  }}>
                    {TYPE_LABELS[item.content_type] || item.content_type}
                  </span>

                  {/* Label */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </div>
                    {item.sublabel && (
                      <div style={{ fontSize: 11, color: '#999', marginTop: 1 }}>{item.sublabel}</div>
                    )}
                  </div>

                  {/* Original status */}
                  {item.original_status && (
                    <span style={{
                      fontSize: 10, color: '#999', background: '#f5f5f5',
                      padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                    }}>
                      was: {item.original_status}
                    </span>
                  )}

                  {/* Deleted time */}
                  <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>
                    {timeAgo(item.deleted_at)}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => handleRestore(item)}
                      disabled={isActioning}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '5px 10px', borderRadius: 5, border: '1px solid #d1fae5',
                        background: '#ecfdf5', color: '#059669', fontSize: 11,
                        fontWeight: 500, cursor: 'pointer',
                      }}
                    >
                      <RotateCcw size={11} /> Restore
                    </button>
                    <button
                      onClick={() => { setConfirmDelete(item.id); setDeleteInput('') }}
                      disabled={isActioning}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '5px 10px', borderRadius: 5, border: '1px solid #fecaca',
                        background: '#fef2f2', color: '#dc2626', fontSize: 11,
                        fontWeight: 500, cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={11} /> Delete forever
                    </button>
                  </div>
                </div>

                {/* Destructive confirmation modal */}
                {isDeleting && (
                  <div style={{
                    marginTop: 12, padding: 14, background: '#fef2f2', borderRadius: 6,
                    border: '1px solid #fecaca',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                      <AlertTriangle size={14} color="#dc2626" style={{ marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', marginBottom: 2 }}>
                          This cannot be undone
                        </div>
                        <div style={{ fontSize: 11, color: '#991b1b' }}>
                          Type <strong>DELETE</strong> to permanently remove &ldquo;{item.label}&rdquo;
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={deleteInput}
                        onChange={e => setDeleteInput(e.target.value)}
                        placeholder="Type DELETE"
                        autoFocus
                        style={{
                          flex: 1, padding: '6px 10px', border: '1px solid #fecaca',
                          borderRadius: 4, fontSize: 12, outline: 'none',
                          background: '#fff',
                        }}
                      />
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        disabled={deleteInput !== 'DELETE' || isActioning}
                        style={{
                          padding: '6px 14px', borderRadius: 4, border: 'none',
                          background: deleteInput === 'DELETE' ? '#dc2626' : '#e5e5e5',
                          color: deleteInput === 'DELETE' ? '#fff' : '#999',
                          fontSize: 12, fontWeight: 600, cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Permanently delete
                      </button>
                      <button
                        onClick={() => { setConfirmDelete(null); setDeleteInput('') }}
                        style={{
                          padding: '6px 10px', borderRadius: 4, border: '1px solid #e8e8e8',
                          background: '#fff', color: '#666', fontSize: 12, cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
