'use client'

import { useState } from 'react'

export default function AdminNotesEditor({
  briefId,
  initialNotes,
}: {
  briefId: string
  initialNotes: string | null
}) {
  const [notes, setNotes] = useState(initialNotes ?? '')
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
        body: JSON.stringify({ admin_notes: notes }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || 'Failed to save notes')
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
    <div>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        disabled={saving}
        placeholder="Internal notes — visible to admins only."
        style={{
          width: '100%', minHeight: 120, fontSize: 13, lineHeight: 1.5,
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: 12, border: '1px solid #e8e8e8', borderRadius: 4,
          background: '#fff', color: '#111', resize: 'vertical',
          outline: 'none',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: '#111', color: '#fff', fontSize: 12, padding: '8px 20px',
            borderRadius: 4, border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save notes'}
        </button>
        {showSuccess && (
          <span style={{ fontSize: 12, color: '#2e7d32' }}>Saved</span>
        )}
        {error && (
          <span style={{ fontSize: 12, color: '#c62828' }}>{error}</span>
        )}
      </div>
    </div>
  )
}
