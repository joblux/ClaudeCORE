'use client'

import { useState } from 'react'

const SECTORS = [
  'Fashion', 'Watches & Jewellery', 'Beauty', 'Hospitality', 'Travel',
  'Wine & Spirits', 'Design & Interiors', 'Art & Culture',
  'Private Client & Family Office', 'Multi-brand Group', 'Other',
]

const COMPANY_TYPES = [
  'Brand', 'Group', 'Agency', 'Family Office', 'Hospitality Operator',
  'Travel Business', 'Investor', 'Other',
]

const BRIEF_TYPES = [
  'Executive search', 'Senior and mid-level search', 'Exploratory brief',
]

const URGENCY_OPTIONS = ['Immediate', 'Within 30 days', 'Within this quarter', 'Exploratory']
const CONFIDENTIALITY_OPTIONS = ['Standard', 'Sensitive', 'Highly confidential']

const SENIORITY_OPTIONS = ['Manager', 'Senior Manager', 'Director', 'VP', 'C-level', 'Flexible']

const FUNCTION_OPTIONS = [
  'General Management', 'Strategy', 'Buying & Merchandising',
  'Marketing & Communications', 'PR & Influence', 'Digital & E-commerce',
  'Retail', 'Wholesale', 'Operations', 'HR & Talent', 'Finance',
  'Travel & Advisory', 'Other',
]

const FOLLOW_UP_OPTIONS = ['Email', 'Call', 'Either']

const initialForm = {
  company_name: '',
  company_website: '',
  sector: '',
  company_type: '',
  geography: '',
  brief_type: '',
  urgency: '',
  confidentiality_level: '',
  mandate_title: '',
  brief_summary: '',
  seniority_level: '',
  function: '',
  location: '',
  compensation_range: '',
  additional_context: '',
  contact_name: '',
  contact_email: '',
  contact_role: '',
  preferred_follow_up: '',
  best_timing: '',
}

export default function BusinessBriefForm() {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    setError('')

    if (!form.company_name.trim() || !form.sector || !form.company_type || !form.brief_type || !form.urgency || !form.confidentiality_level || !form.brief_summary.trim() || !form.contact_name.trim() || !form.contact_email.trim() || !form.preferred_follow_up) {
      setError('Please complete all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/business-briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        setForm(initialForm)
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: 8, padding: '48px 32px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff', margin: '0 0 12px' }}>Brief received</h2>
        <p style={{ fontSize: 14, color: '#ccc', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
          Your brief has been received and will be reviewed privately by the JOBLUX team. If follow-up is required, we will contact you using the details provided.
        </p>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: 13, fontFamily: 'Inter, sans-serif',
    background: '#1a1a1a', border: '1px solid #333', borderRadius: 4, color: '#fff',
    outline: 'none',
  }
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none' as const }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: '#ccc', marginBottom: 6, fontFamily: 'Inter, sans-serif' }
  const helperStyle: React.CSSProperties = { fontSize: 11, color: '#999', marginTop: 4 }
  const requiredStar = <span style={{ color: '#a58e28', marginLeft: 2 }}>*</span>
  const sectionHeadingStyle: React.CSSProperties = {
    fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 400, color: '#fff',
    margin: '0 0 20px', paddingBottom: 12, borderBottom: '1px solid #2a2a2a',
  }
  const fieldGroupStyle: React.CSSProperties = { marginBottom: 18 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Section 1 — Company Context */}
      <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: 8, padding: '28px 24px' }}>
        <h3 style={sectionHeadingStyle}>Company Context</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Company name{requiredStar}</label>
            <input style={inputStyle} value={form.company_name} onChange={e => set('company_name', e.target.value)} />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Company website</label>
            <input style={inputStyle} type="url" placeholder="https://" value={form.company_website} onChange={e => set('company_website', e.target.value)} />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Sector{requiredStar}</label>
            <select style={selectStyle} value={form.sector} onChange={e => set('sector', e.target.value)}>
              <option value="">Select...</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Company type{requiredStar}</label>
            <select style={selectStyle} value={form.company_type} onChange={e => set('company_type', e.target.value)}>
              <option value="">Select...</option>
              {COMPANY_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ ...fieldGroupStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Geography</label>
            <input style={inputStyle} value={form.geography} onChange={e => set('geography', e.target.value)} />
            <div style={helperStyle}>Primary market or region concerned by this brief</div>
          </div>
        </div>
      </div>

      {/* Section 2 — Brief Type */}
      <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: 8, padding: '28px 24px' }}>
        <h3 style={sectionHeadingStyle}>Brief Type</h3>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Brief type{requiredStar}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {BRIEF_TYPES.map(bt => (
              <button
                key={bt}
                type="button"
                onClick={() => set('brief_type', bt)}
                style={{
                  padding: '8px 16px', fontSize: 12, fontFamily: 'Inter, sans-serif',
                  borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s',
                  background: form.brief_type === bt ? '#fff' : 'transparent',
                  color: form.brief_type === bt ? '#111' : '#999',
                  border: form.brief_type === bt ? '1px solid #fff' : '1px solid #444',
                }}
              >
                {bt}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Urgency{requiredStar}</label>
            <select style={selectStyle} value={form.urgency} onChange={e => set('urgency', e.target.value)}>
              <option value="">Select...</option>
              {URGENCY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Confidentiality level{requiredStar}</label>
            <select style={selectStyle} value={form.confidentiality_level} onChange={e => set('confidentiality_level', e.target.value)}>
              <option value="">Select...</option>
              {CONFIDENTIALITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3 — Requirement Details */}
      <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: 8, padding: '28px 24px' }}>
        <h3 style={sectionHeadingStyle}>Requirement Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
          <div style={{ ...fieldGroupStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Mandate title</label>
            <input style={inputStyle} placeholder="e.g. Brand Director, Head of Merchandising" value={form.mandate_title} onChange={e => set('mandate_title', e.target.value)} />
          </div>
          <div style={{ ...fieldGroupStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Brief summary{requiredStar}</label>
            <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Describe the requirement, context, and what a successful outcome looks like." value={form.brief_summary} onChange={e => set('brief_summary', e.target.value)} />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Seniority level</label>
            <select style={selectStyle} value={form.seniority_level} onChange={e => set('seniority_level', e.target.value)}>
              <option value="">Select...</option>
              {SENIORITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Function</label>
            <select style={selectStyle} value={form.function} onChange={e => set('function', e.target.value)}>
              <option value="">Select...</option>
              {FUNCTION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Location</label>
            <input style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Compensation range</label>
            <input style={inputStyle} value={form.compensation_range} onChange={e => set('compensation_range', e.target.value)} />
          </div>
          <div style={{ ...fieldGroupStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Additional context</label>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="Any constraints, sensitivities, comparator brands, or additional notes" value={form.additional_context} onChange={e => set('additional_context', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Section 4 — Contact & Handling */}
      <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: 8, padding: '28px 24px' }}>
        <h3 style={sectionHeadingStyle}>Contact & Handling</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Contact name{requiredStar}</label>
            <input style={inputStyle} value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Work email{requiredStar}</label>
            <input style={inputStyle} type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Role / title</label>
            <input style={inputStyle} value={form.contact_role} onChange={e => set('contact_role', e.target.value)} />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Preferred follow-up{requiredStar}</label>
            <select style={selectStyle} value={form.preferred_follow_up} onChange={e => set('preferred_follow_up', e.target.value)}>
              <option value="">Select...</option>
              {FOLLOW_UP_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ ...fieldGroupStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Best timing</label>
            <input style={inputStyle} value={form.best_timing} onChange={e => set('best_timing', e.target.value)} />
            <div style={helperStyle}>Timezone, availability window, or response preference</div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ fontSize: 13, color: '#e57373', padding: '0 4px' }}>{error}</div>
      )}

      {/* Terms link */}
      <div style={{ textAlign: 'right', padding: '0 4px' }}>
        <a href="/terms/business" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#999', fontFamily: 'Inter, sans-serif', textDecoration: 'none' }}>
          View Terms of Business &rarr;
        </a>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: '100%', padding: '14px 0', fontSize: 13, fontWeight: 600,
          fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em',
          background: submitting ? '#7a6a1e' : '#a58e28', color: '#000',
          border: 'none', borderRadius: 4, cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Submitting...' : 'Submit brief'}
      </button>
    </div>
  )
}
