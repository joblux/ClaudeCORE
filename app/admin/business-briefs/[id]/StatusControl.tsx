'use client'

import { useState } from 'react'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'new',          label: 'New' },
  { value: 'under_review', label: 'Under review' },
  { value: 'accepted',     label: 'Accepted' },
  { value: 'in_progress',  label: 'In progress' },
  { value: 'completed',    label: 'Completed' },
  { value: 'closed',       label: 'Closed' },
  { value: 'archived',     label: 'Archived' },
]

export default function StatusControl({ briefId, initialStatus }: { briefId: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState('')

  const showSuccess = savedAt !== null && Date.now() - savedAt < 2000

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/business-briefs/${briefId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || 'Failed to update')
      } else {
        setSavedAt(Date.now())
        setTimeout(() => setSavedAt(null), 2000)
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          disabled={saving}
          style={{
            fontSize: 13, padding: '8px 12px', border: '1px solid #e8e8e8',
            borderRadius: 4, background: '#fff', color: '#111', cursor: 'pointer',
          }}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: '#111', color: '#fff', fontSize: 12, padding: '8px 20px',
            borderRadius: 4, border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      {showSuccess && (
        <div style={{ fontSize: 12, color: '#2e7d32' }}>Status updated</div>
      )}
      {error && (
        <div style={{ fontSize: 12, color: '#c62828' }}>{error}</div>
      )}
    </div>
  )
}
