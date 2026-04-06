'use client'

import { useState } from 'react'

export default function ContentQueueActions({ id, status }: { id: string; status: string }) {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/content-queue/${id}/${action}`, { method: 'POST' })
      if (res.ok) {
        setCurrentStatus(action === 'approve' ? 'approved' : 'rejected')
      }
    } catch {}
    setLoading(false)
  }

  if (currentStatus === 'approved' || currentStatus === 'rejected' || currentStatus === 'published') {
    return <span style={{ fontSize: 11, color: '#888' }}>{currentStatus}</span>
  }

  return (
    <div style={{ display: 'flex', gap: 6 }}>
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
    </div>
  )
}
