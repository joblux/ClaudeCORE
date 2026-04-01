'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface ContentSection {
  overview?: string
  culture?: {
    founder?: { name?: string; bio?: string; years?: string }
    core_values?: Array<{ title: string; description: string }>
    what_its_like?: Array<{ category: string; description: string }>
    heritage_timeline?: Array<{ year: string; event: string }>
  }
  career_paths?: Array<{ category: string; description: string }>
  salaries?: Array<{ role: string; location: string; range: string }>
  leadership?: Array<{ name: string; title: string; since: string }>
  financial_health?: string
  key_markets?: Array<{ region: string; presence: string }>
  corporate?: string
  known_for?: Array<string>
}

export default function WikiLuxEditorPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [brandName, setBrandName] = useState('')
  const [content, setContent] = useState<ContentSection>({})
  const [editorialNotes, setEditorialNotes] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadContent()
  }, [slug])

  async function loadContent() {
    try {
      const res = await fetch(`/api/admin/wikilux/content?slug=${slug}`)
      const data = await res.json()

      if (data.success) {
        setBrandName(data.data.brand_name)
        setContent(data.data.content || {})
        setEditorialNotes(data.data.editorial_notes || '')
      } else {
        alert('Error loading content: ' + data.error)
      }
    } catch (error) {
      alert('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!confirm('Save changes? Content will be marked as pending for approval.')) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/wikilux/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, content, editorial_notes: editorialNotes })
      })
      const data = await res.json()

      if (data.success) {
        alert('Content saved! Now pending approval in LUXAI queue.')
        router.push('/admin/wikilux')
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'culture', label: 'Culture' },
    { id: 'career_paths', label: 'Career Paths' },
    { id: 'salaries', label: 'Salaries' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'financial', label: 'Financial Health' },
    { id: 'markets', label: 'Key Markets' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'known_for', label: 'Known For' }
  ]

  if (loading) {
    return (
      <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '20px', height: '20px', border: '2px solid #e8e8e8', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button onClick={() => router.push('/admin/wikilux')} style={{ background: 'none', border: 'none', color: '#666', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', marginBottom: '12px' }}>
              ← Back to WikiLux
            </button>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 500, color: '#111' }}>
              Edit: {brandName}
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Edit brand encyclopedia content · Changes require approval
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => window.open(`/wikilux/${slug}`, '_blank')} style={{ background: '#fff', border: '0.5px solid #e8e8e8', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: '#111', cursor: 'pointer' }}>
              Preview Live Page
            </button>
            <button onClick={handleSave} disabled={saving} style={{ background: '#111', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', borderBottom: '0.5px solid #e8e8e8', marginBottom: '24px', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: 'none', border: 'none', padding: '12px 16px', fontSize: '13px', fontWeight: activeTab === tab.id ? 500 : 400, color: activeTab === tab.id ? '#111' : '#666', borderBottom: activeTab === tab.id ? '2px solid #111' : 'none', cursor: 'pointer', marginBottom: '-1px', whiteSpace: 'nowrap' }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: '8px', padding: '32px' }}>
          
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500, color: '#111' }}>Company Overview</h2>
              <textarea value={content.overview || ''} onChange={(e) => setContent({...content, overview: e.target.value})} placeholder="Company profile, history, business model..." style={{ width: '100%', minHeight: '400px', padding: '16px', border: '0.5px solid #e8e8e8', borderRadius: '6px', fontSize: '14px', lineHeight: '1.7', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
          )}

          {activeTab === 'culture' && (
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500, color: '#111' }}>Culture & Heritage</h2>
              <textarea value={JSON.stringify(content.culture || {}, null, 2)} onChange={(e) => { try { setContent({...content, culture: JSON.parse(e.target.value)}) } catch {} }} placeholder="Culture data (JSON format)..." style={{ width: '100%', minHeight: '400px', padding: '16px', border: '0.5px solid #e8e8e8', borderRadius: '6px', fontSize: '13px', lineHeight: '1.6', fontFamily: 'monospace', resize: 'vertical' }} />
            </div>
          )}

          {activeTab === 'career_paths' && (
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500, color: '#111' }}>Career Paths</h2>
              <textarea value={JSON.stringify(content.career_paths || [], null, 2)} onChange={(e) => { try { setContent({...content, career_paths: JSON.parse(e.target.value)}) } catch {} }} placeholder="Career paths data (JSON format)..." style={{ width: '100%', minHeight: '400px', padding: '16px', border: '0.5px solid #e8e8e8', borderRadius: '6px', fontSize: '13px', lineHeight: '1.6', fontFamily: 'monospace', resize: 'vertical' }} />
            </div>
          )}

          {activeTab === 'salaries' && (
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500, color: '#111' }}>Salary Ranges</h2>
              <textarea value={JSON.stringify(content.salaries || [], null, 2)} onChange={(e) => { try { setContent({...content, salaries: JSON.parse(e.target.value)}) } catch {} }} placeholder="Salary data (JSON format)..." style={{ width: '100%', minHeight: '400px', padding: '16px', border: '0.5px solid #e8e8e8', borderRadius: '6px', fontSize: '13px', lineHeight: '1.6', fontFamily: 'monospace', resize: 'vertical' }} />
            </div>
          )}

          {activeTab === 'leadership' && (
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500, color: '#111' }}>Leadership Team</h2>
              <textarea value={JSON.stringify(content.leadership || [], null, 2)} onChange={(e) => { try { setContent({...content, leadership: JSON.parse(e.target.value)}) } catch {} }} placeholder="Leadership data (JSON format)..." style={{ width: '100%', minHeight: '400px', padding: '16px', border: '0.5px solid #e8e8e8', borderRadius: '6px', fontSize: '13px', lineHeight: '1.6', fontFamily: 'monospace', resize: 'vertical' }} />
            </div>
          )}

          {activeTab === 'financial' && (
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500, color: '#111' }}>Financial Health</h2>
              <textarea value={content.financial_health || ''} onChange={(e) => setContent({...content, financial_health: e.target.value})} placeholder="Financial information, revenue, growth metrics..." style={{ width: '100%', minHeight: '400px', padding: '16px', border: '0.5px solid #e8e8e8', borderRadius: '6px', fontSize: '14px', lineHeight: '1.7', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
          )}

          {activeTab === 'markets' && (
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500, color: '#111' }}>Key Markets</h2>
              <textarea value={JSON.stringify(content.key_markets || [], null, 2)} onChange={(e) => { try { setContent({...content, key_markets: JSON.parse(e.target.value)}) } catch {} }} placeholder="Market data (JSON format)..." style={{ width: '100%', minHeight: '400px', padding: '16px', border: '0.5px solid #e8e8e8', borderRadius: '6px', fontSize: '13px', lineHeight: '1.6', fontFamily: 'monospace', resize: 'vertical' }} />
            </div>
          )}

          {activeTab === 'corporate' && (
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500, color: '#111' }}>Corporate Structure</h2>
              <textarea value={content.corporate || ''} onChange={(e) => setContent({...content, corporate: e.target.value})} placeholder="Ownership, parent group, corporate structure..." style={{ width: '100%', minHeight: '400px', padding: '16px', border: '0.5px solid #e8e8e8', borderRadius: '6px', fontSize: '14px', lineHeight: '1.7', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
          )}

          {activeTab === 'known_for' && (
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500, color: '#111' }}>Known For</h2>
              <textarea value={JSON.stringify(content.known_for || [], null, 2)} onChange={(e) => { try { setContent({...content, known_for: JSON.parse(e.target.value)}) } catch {} }} placeholder='["Birkin bag", "Silk scarves", "Craftsmanship"]' style={{ width: '100%', minHeight: '400px', padding: '16px', border: '0.5px solid #e8e8e8', borderRadius: '6px', fontSize: '13px', lineHeight: '1.6', fontFamily: 'monospace', resize: 'vertical' }} />
            </div>
          )}
        </div>

        <div style={{ marginTop: '24px', background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 500, color: '#111' }}>Editorial Notes</h3>
          <textarea value={editorialNotes} onChange={(e) => setEditorialNotes(e.target.value)} placeholder="Internal notes about these changes (optional)..." style={{ width: '100%', minHeight: '100px', padding: '12px', border: '0.5px solid #e8e8e8', borderRadius: '6px', fontSize: '13px', lineHeight: '1.6', fontFamily: 'inherit', resize: 'vertical' }} />
        </div>

      </div>
    </div>
  )
}
