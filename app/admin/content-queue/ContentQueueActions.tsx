'use client'

import { useState } from 'react'

interface Props {
  id: string
  status: string
  onDelete?: () => void
  onEdit?: () => void
}

export default function ContentQueueActions({ id, status, onDelete, onEdit }: Props) {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/content-queue/${id}/${action}`, { method: 'POST' })
      if (res.ok) {
        setCurrentStatus(action === 'approve' ? 'published' : 'rejected')
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

  const showDelete = currentStatus === 'draft' || currentStatus === 'rejected'
  const showApproveReject = currentStatus !== 'approved' && currentStatus !== 'rejected' && currentStatus !== 'published'

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {showApproveReject && (
        <>
          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            style={{ fontSize: 11, padding: '4px 10px', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: 3, cursor: 'pointer' }}
          >
            Approve
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={loading}
            style={{ fontSize: 11, padding: '4px 10px', background: '#fce4ec', color: '#c62828', border: '1px solid #f8bbd0', borderRadius: 3, cursor: 'pointer' }}
          >
            Reject
          </button>
        </>
      )}
      {onEdit && showApproveReject && (
        <button
          onClick={onEdit}
          disabled={loading}
          style={{ fontSize: 11, padding: '4px 10px', background: '#fff', color: '#555', border: '1px solid #e8e8e8', borderRadius: 3, cursor: 'pointer' }}
        >
          Edit
        </button>
      )}
      {showDelete && (
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{ fontSize: 11, padding: '4px 10px', background: '#fff', color: '#c62828', border: '1px solid #e8e8e8', borderRadius: 3, cursor: 'pointer' }}
        >
          Delete
        </button>
      )}
      {!showApproveReject && !showDelete && (
        <span style={{ fontSize: 11, color: '#888' }}>{currentStatus}</span>
      )}
    </div>
  )
}
