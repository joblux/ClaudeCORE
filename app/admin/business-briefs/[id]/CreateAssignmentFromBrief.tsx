'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { briefId: string; existingCount: number }

export default function CreateAssignmentFromBrief({ briefId, existingCount }: Props) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setError('')
    setCreating(true)
    try {
      const res = await fetch(`/api/business-briefs/${briefId}/create-assignment`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create assignment')
      }
      const data = await res.json()
      if (!data.assignment_id) throw new Error('Missing assignment id in response')
      router.push(`/admin/assignments/new?id=${data.assignment_id}&source=brief`)
    } catch (err: any) {
      setError(err.message)
      setCreating(false)
    }
  }

  const label = existingCount === 0
    ? 'Create Assignment from Brief'
    : existingCount === 1
      ? 'Create Another Assignment (1 existing)'
      : `Create Another Assignment (${existingCount} existing)`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <button type="button" onClick={handleCreate} disabled={creating}
        style={{ fontSize: 13, fontWeight: 500, padding: '8px 16px', background: '#111', color: '#fff',
          border: 'none', borderRadius: 4, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.6 : 1, whiteSpace: 'nowrap' }}>
        {creating ? 'Creating…' : label}
      </button>
      {error && <span style={{ fontSize: 12, color: '#b00020' }}>{error}</span>}
    </div>
  )
}
