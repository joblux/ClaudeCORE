'use client'

import { useState } from 'react'

interface Props {
  id: string
  status: string
  onDelete?: () => void
  onEdit?: () => void
  // Reports a status change up to the parent so the queue table can
  // re-filter the row out of its current view immediately. The parent
  // is the source of truth for row state — this component reads
  // `status` from props on every render.
  onStatusChange?: (newStatus: string) => void
}

export default function ContentQueueActions({ id, status, onDelete, onEdit, onStatusChange }: Props) {
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/content-queue/${id}/${action}`, { method: 'POST' })
      if (res.ok && onStatusChange) {
        onStatusChange(action === 'approve' ? 'published' : 'rejected')
      }
    } catch {}
    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/content-queue/${id}/delete`, { method: 'POST' })
      if (res.ok && onDelete) onDelete()
    } catch {}
    setLoading(false)
  }

  const showDelete = status === 'draft' || status === 'rejected'
  const showApproveReject = status !== 'approved' && status !== 'rejected' && status !== 'published'

  // Decision actions are the primary CTA on every draft row.
  // Approve / Reject are filled buttons for high-contrast visibility.
  // Edit is a secondary outlined button. Read-only states fall through
  // to a muted status label.
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {showApproveReject && (
        <>
          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            style={{
              fontSize: 12, fontWeight: 600, padding: '6px 14px',
              background: '#2e7d32', color: '#fff',
              border: '1px solid #2e7d32', borderRadius: 4,
              cursor: 'pointer', opacity: loading ? 0.5 : 1,
            }}
          >
            Approve
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={loading}
            style={{
              fontSize: 12, fontWeight: 600, padding: '6px 14px',
              background: '#c62828', color: '#fff',
              border: '1px solid #c62828', borderRadius: 4,
              cursor: 'pointer', opacity: loading ? 0.5 : 1,
            }}
          >
            Reject
          </button>
        </>
      )}
      {onEdit && showApproveReject && (
        <button
          onClick={onEdit}
          disabled={loading}
          style={{
            fontSize: 12, fontWeight: 500, padding: '6px 14px',
            background: '#fff', color: '#555',
            border: '1px solid #d0d0d0', borderRadius: 4,
            cursor: 'pointer', opacity: loading ? 0.5 : 1,
          }}
        >
          Edit
        </button>
      )}
      {showDelete && (
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            fontSize: 12, fontWeight: 500, padding: '6px 14px',
            background: '#fff', color: '#c62828',
            border: '1px solid #fecaca', borderRadius: 4,
            cursor: 'pointer', opacity: loading ? 0.5 : 1,
          }}
        >
          Delete
        </button>
      )}
      {!showApproveReject && !showDelete && (
        <span style={{ fontSize: 11, color: '#888' }}>{status}</span>
      )}
    </div>
  )
}
