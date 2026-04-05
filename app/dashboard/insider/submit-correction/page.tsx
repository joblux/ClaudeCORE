'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SubmitCorrectionPage() {
  const { data: session } = useSession()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [brandOptions, setBrandOptions] = useState<{ slug: string; name: string }[]>([])

  useEffect(() => {
    async function fetchBrands() {
      const { data } = await supabase
        .from('wikilux_content')
        .select('slug, brand_name')
        .is('deleted_at', null)
        .order('brand_name')
      setBrandOptions((data || []).map((b: any) => ({ slug: b.slug, name: b.brand_name })))
    }
    fetchBrands()
  }, [])

  const [form, setForm] = useState({
    brand_slug: '',
    issue_description: '',
    suggested_correction: '',
    source_url: '',
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async () => {
    if (!form.brand_slug || !form.issue_description || !form.suggested_correction) {
      setError('Brand, issue description, and suggested correction are required.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_slug: form.brand_slug,
          issue_description: form.issue_description,
          suggested_correction: form.suggested_correction,
          source_url: form.source_url || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Submission failed')
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: 'Inter, sans-serif', padding: '40px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #1D9E75', borderRadius: 8, padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 16, color: '#fff', fontWeight: 500, marginBottom: 6 }}>Correction submitted</div>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>
              Your correction will be reviewed by the editorial team. Thank you for improving JOBLUX intelligence.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => { setSubmitted(false); setForm({ brand_slug: '', issue_description: '', suggested_correction: '', source_url: '' }) }} style={{ padding: '8px 20px', fontSize: 12, border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, background: 'transparent', color: '#a58e28', cursor: 'pointer' }}>
                Submit another
              </button>
              <Link href="/dashboard/insider" style={{ padding: '8px 20px', fontSize: 12, border: '1px solid #2a2a2a', borderRadius: 4, background: 'transparent', color: '#999', textDecoration: 'none' }}>
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const inputStyle = { width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: 'Inter, sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Link href="/dashboard/insider" style={{ fontSize: 12, color: '#a58e28', textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}>← Back to dashboard</Link>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, color: '#fff', margin: '0 0 6px' }}>Flag a Brand Correction</h1>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 24 }}>Flag an inaccuracy or outdated detail so the intelligence layer improves. Corrections are reviewed by the editorial team.</p>

        <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: 24 }}>
          {/* Brand */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Brand *</label>
            <select value={form.brand_slug} onChange={e => set('brand_slug', e.target.value)} style={{ ...inputStyle, appearance: 'auto' as const }}>
              <option value="">Select a brand</option>
              {brandOptions.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </div>

          {/* Issue */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>What is incorrect or outdated? *</label>
            <textarea
              placeholder="Describe the issue clearly. e.g. 'The headquarters location is listed as Paris but it moved to London in 2025.'"
              value={form.issue_description}
              onChange={e => set('issue_description', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.6 }}
            />
          </div>

          {/* Suggested correction */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Suggested correction *</label>
            <textarea
              placeholder="What should it say instead?"
              value={form.suggested_correction}
              onChange={e => set('suggested_correction', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.6 }}
            />
          </div>

          {/* Source URL */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Source URL <span style={{ fontSize: 10, color: '#666', fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0 }}>(optional — helps verification)</span></label>
            <input type="url" placeholder="https://..." value={form.source_url} onChange={e => set('source_url', e.target.value)} style={inputStyle} />
          </div>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#dc2626', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !form.brand_slug || !form.issue_description || !form.suggested_correction}
            style={{ padding: '11px 28px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, background: submitting || !form.brand_slug || !form.issue_description || !form.suggested_correction ? '#2a2a2a' : '#a58e28', color: submitting || !form.brand_slug || !form.issue_description || !form.suggested_correction ? '#666' : '#000', cursor: submitting || !form.brand_slug || !form.issue_description || !form.suggested_correction ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            {submitting ? 'Submitting...' : 'Submit correction →'}
          </button>
          <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
            Corrections are reviewed before being applied.
          </div>
        </div>
      </div>
    </div>
  )
}
