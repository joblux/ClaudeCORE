'use client'

// eslint-disable-next-line react-hooks/exhaustive-deps
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const CONTENT_SECTIONS = [
  { key: 'tagline', label: 'Tagline', type: 'text' },
  { key: 'brand_dna', label: 'Brand DNA', type: 'json' },
  { key: 'history', label: 'History', type: 'text' },
  { key: 'founder', label: 'Founder', type: 'text' },
  { key: 'founder_facts', label: 'Founder Facts', type: 'json' },
  { key: 'key_facts', label: 'Key Facts', type: 'json' },
  { key: 'key_executives', label: 'Key Executives', type: 'json' },
  { key: 'creative_directors', label: 'Creative Directors', type: 'json' },
  { key: 'signature_products', label: 'Signature Products', type: 'json' },
  { key: 'careers', label: 'Careers', type: 'text' },
  { key: 'hiring_intelligence', label: 'Hiring Intelligence', type: 'json' },
  { key: 'market_position', label: 'Market Position', type: 'text' },
  { key: 'current_strategy', label: 'Current Strategy', type: 'text' },
  { key: 'presence', label: 'Presence', type: 'json' },
  { key: 'facts', label: 'Facts', type: 'json' },
  { key: 'stock', label: 'Stock / Financial', type: 'json' },
]

export default function WikiLuxEditorPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [content, setContent] = useState<Record<string, any>>({})
  const [editorialNotes, setEditorialNotes] = useState('')
  const [activeTab, setActiveTab] = useState('tagline')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [brandName, setBrandName] = useState('')
  const [status, setStatus] = useState('')

  // Section edit buffers - store stringified versions for editing
  const [editBuffers, setEditBuffers] = useState<Record<string, string>>({})
  const [parseErrors, setParseErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (slug) loadContent()
  }, [slug])

  async function loadContent() {
    try {
      const res = await fetch(`/api/admin/wikilux/content?slug=${slug}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load content')
        setLoading(false)
        return
      }

      const row = data.data
      const c = row.content || {}
      setContent(c)
      setBrandName(row.brand_name || slug)
      setStatus(row.status || 'draft')
      setEditorialNotes(row.editorial_notes || '')

      // Initialize edit buffers
      const buffers: Record<string, string> = {}
      for (const section of CONTENT_SECTIONS) {
        const val = c[section.key]
        if (section.type === 'text') {
          buffers[section.key] = typeof val === 'string' ? val : (val ? JSON.stringify(val, null, 2) : '')
        } else {
          buffers[section.key] = val ? JSON.stringify(val, null, 2) : ''
        }
      }
      setEditBuffers(buffers)
    } catch (err: any) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  function updateBuffer(key: string, value: string) {
    setEditBuffers(prev => ({ ...prev, [key]: value }))
    // Clear parse error on edit
    if (parseErrors[key]) {
      setParseErrors(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')

    // Build content object from buffers
    const newContent: Record<string, any> = { ...content }
    const errors: Record<string, string> = {}

    for (const section of CONTENT_SECTIONS) {
      const raw = editBuffers[section.key]
      if (!raw || raw.trim() === '') {
        // Keep existing or set null
        if (section.key in newContent && !raw) {
          // Leave as-is if buffer is empty and content existed
        }
        continue
      }

      if (section.type === 'text') {
        newContent[section.key] = raw
      } else {
        try {
          newContent[section.key] = JSON.parse(raw)
        } catch (e) {
          errors[section.key] = 'Invalid JSON'
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setParseErrors(errors)
      const badTabs = Object.keys(errors).map(k => CONTENT_SECTIONS.find(s => s.key === k)?.label).join(', ')
      setError(`Invalid JSON in: ${badTabs}. Fix before saving.`)
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/admin/wikilux/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          content: newContent,
          editorial_notes: editorialNotes
        })
      })
      const data = await res.json()

      if (data.success) {
        setSuccess('Saved! Content marked as pending for approval.')
        setStatus('pending')
        setContent(newContent)
      } else {
        setError(data.error || 'Save failed')
      }
    } catch (err: any) {
      setError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'draft': return '#999'
      case 'pending': return '#F59E0B'
      case 'approved': return '#10B981'
      case 'rejected': return '#EF4444'
      default: return '#666'
    }
  }

  if (loading) {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '20px', height: '20px', border: '2px solid #e8e8e8', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const activeSection = CONTENT_SECTIONS.find(s => s.key === activeTab)

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => router.push('/admin/wikilux')}
              style={{ background: 'none', border: 'none', fontSize: '14px', color: '#3B82F6', cursor: 'pointer', textDecoration: 'underline' }}
            >
              ← Dashboard
            </button>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: '#111' }}>WikiLux Editor</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500,
              color: statusColor(status),
              background: `${statusColor(status)}20`
            }}>
              {status.toUpperCase()}
            </span>
            <button
              onClick={() => window.open(`/wikilux/${slug}`, '_blank')}
              style={{
                background: '#fff',
                border: '0.5px solid #e8e8e8',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#111',
                cursor: 'pointer'
              }}
            >
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: '#111',
                color: '#fff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.5 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save & Submit'}
            </button>
          </div>
        </div>

        {/* Brand Name */}
        <h1 style={{ margin: '0 0 24px 0', fontSize: '22px', fontWeight: 500, color: '#111' }}>
          Editing: {brandName}
        </h1>

        {/* Messages */}
        {error && (
          <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#DC2626' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#16A34A' }}>
            {success}
          </div>
        )}

        {/* Main Layout: Tabs + Editor */}
        <div style={{ display: 'flex', gap: '24px' }}>

          {/* Sidebar Tabs */}
          <div style={{ width: '200px', flexShrink: 0 }}>
            <div style={{ background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
              {CONTENT_SECTIONS.map(section => (
                <button
                  key={section.key}
                  onClick={() => setActiveTab(section.key)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    border: 'none',
                    borderBottom: '0.5px solid #e8e8e8',
                    background: activeTab === section.key ? '#f0f0f0' : '#fff',
                    fontSize: '13px',
                    fontWeight: activeTab === section.key ? 500 : 400,
                    color: parseErrors[section.key] ? '#EF4444' : (activeTab === section.key ? '#111' : '#666'),
                    cursor: 'pointer'
                  }}
                >
                  {section.label}
                  {parseErrors[section.key] && ' ⚠'}
                  {editBuffers[section.key] && editBuffers[section.key].trim() !== '' && (
                    <span style={{ float: 'right', color: '#10B981', fontSize: '11px' }}>●</span>
                  )}
                </button>
              ))}
            </div>

            {/* Editorial Notes */}
            <div style={{ marginTop: '16px', background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: '8px', padding: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#666', marginBottom: '8px' }}>
                EDITORIAL NOTES
              </label>
              <textarea
                value={editorialNotes}
                onChange={(e) => setEditorialNotes(e.target.value)}
                placeholder="Notes about this edit..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '0.5px solid #e8e8e8',
                  borderRadius: '4px',
                  fontSize: '12px',
                  resize: 'vertical',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
            </div>
          </div>

          {/* Editor Area */}
          <div style={{ flex: 1 }}>
            <div style={{ background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: '#111' }}>
                  {activeSection?.label}
                </h2>
                <span style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: activeSection?.type === 'text' ? '#EFF6FF' : '#FFF7ED',
                  color: activeSection?.type === 'text' ? '#2563EB' : '#C2410C'
                }}>
                  {activeSection?.type === 'text' ? 'Plain Text' : 'JSON'}
                </span>
              </div>

              {parseErrors[activeTab] && (
                <div style={{ padding: '8px 12px', background: '#FEF2F2', borderRadius: '4px', marginBottom: '12px', fontSize: '12px', color: '#DC2626' }}>
                  {parseErrors[activeTab]}
                </div>
              )}

              <textarea
                value={editBuffers[activeTab] || ''}
                onChange={(e) => updateBuffer(activeTab, e.target.value)}
                placeholder={activeSection?.type === 'text'
                  ? 'Enter content text...'
                  : '{\n  "key": "value"\n}'
                }
                style={{
                  width: '100%',
                  minHeight: '500px',
                  padding: '16px',
                  border: parseErrors[activeTab] ? '1px solid #FECACA' : '0.5px solid #e8e8e8',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: activeSection?.type === 'text' ? 'Inter, sans-serif' : "'SF Mono', 'Fira Code', monospace",
                  lineHeight: '1.6',
                  resize: 'vertical',
                  color: '#111',
                  background: '#fafafa'
                }}
              />

              {activeSection?.type === 'json' && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
                  Edit the JSON directly. Must be valid JSON to save.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
