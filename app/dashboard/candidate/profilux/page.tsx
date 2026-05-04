'use client'

import { useEffect, useState } from 'react'
import type { EditorView } from '@/lib/profilux/types'

export default function ProfiluxPage() {
  const [editor, setEditor] = useState<EditorView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profilux')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setEditor(data.editor ?? null)
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 40, color: '#ccc', background: '#1a1a1a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>Loading…</div>
  if (error) return <div style={{ padding: 40, color: '#ff6b6b', background: '#1a1a1a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>Error: {error}</div>
  if (!editor) return <div style={{ padding: 40, color: '#ccc', background: '#1a1a1a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>No editor data.</div>

  return (
    <div style={{ padding: 40, background: '#1a1a1a', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: 28, marginBottom: 24 }}>
        ProfiLux — EditorView probe
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12, fontSize: 14, lineHeight: 1.6 }}>
        <div style={{ color: '#999' }}>Name</div>
        <div>{[editor.first_name, editor.last_name].filter(Boolean).join(' ') || <em style={{ color: '#666' }}>null</em>}</div>

        <div style={{ color: '#999' }}>headline</div>
        <div>{editor.headline ?? <em style={{ color: '#666' }}>null</em>}</div>

        <div style={{ color: '#999' }}>city</div>
        <div>{editor.city ?? <em style={{ color: '#666' }}>null</em>}</div>

        <div style={{ color: '#999' }}>country</div>
        <div>{editor.country ?? <em style={{ color: '#666' }}>null</em>}</div>

        <div style={{ color: '#999' }}>seniority</div>
        <div>{editor.seniority ?? <em style={{ color: '#666' }}>null</em>}</div>

        <div style={{ color: '#999' }}>sectors</div>
        <div>{editor.sectors.length > 0 ? editor.sectors.join(', ') : <em style={{ color: '#666' }}>[]</em>}</div>

        <div style={{ color: '#999' }}>desired_salary_max</div>
        <div>{editor.desired_salary_max ?? <em style={{ color: '#666' }}>null</em>}</div>

        <div style={{ color: '#999' }}>availability</div>
        <div>{editor.availability ?? <em style={{ color: '#666' }}>null</em>}</div>

        <div style={{ color: '#999' }}>profile_completeness</div>
        <div>{editor.profile_completeness}</div>
      </div>

      <details style={{ marginTop: 32, color: '#999', fontSize: 12 }}>
        <summary style={{ cursor: 'pointer' }}>Raw editor JSON</summary>
        <pre style={{ background: '#222', padding: 16, marginTop: 12, overflow: 'auto', fontSize: 11 }}>
          {JSON.stringify(editor, null, 2)}
        </pre>
      </details>
    </div>
  )
}
