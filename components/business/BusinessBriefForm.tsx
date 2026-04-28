'use client'

import { useState, useRef } from 'react'
import { DEPARTMENTS } from '@/lib/assignment-options'

const BRIEF_TYPES = ['Executive search', 'Manager search', 'Exploratory']

const SECTORS = ['Fashion', 'Jewelry', 'Watches', 'Beauty', 'Hospitality', 'Automotive', 'Spirits & Wine', 'Art & Culture', 'Other']

const URGENCY_OPTIONS = ['Immediate', 'Within 30 days', 'Within this quarter', 'Exploratory']
const CONFIDENTIALITY_OPTIONS = ['Standard', 'Sensitive', 'Highly confidential']

const SENIORITY_OPTIONS = ['Manager', 'Senior Manager', 'Director', 'VP', 'C-level', 'Flexible']

const FOLLOW_UP_OPTIONS = ['Email', 'Call', 'Either']

const FIELD_LABELS: Record<string, string> = {
  brief_type: 'Brief type',
  sector: 'Sector',
  urgency: 'Urgency',
  confidentiality_level: 'Confidentiality',
  brief_summary: 'Brief summary',
  contact_name: 'Contact name',
  contact_email: 'Work email',
  preferred_follow_up: 'Preferred follow-up',
}

const initialForm = {
  company_website: '',
  geography: '',
  brief_type: '',
  sector: '',
  urgency: '',
  confidentiality_level: '',
  mandate_title: '',
  brief_summary: '',
  seniority_level: '',
  function: '',
  location: '',
  compensation_range: '',
  additional_context: '',
  attached_filename: '',
  contact_name: '',
  contact_email: '',
  contact_role: '',
  preferred_follow_up: '',
  best_timing: '',
}

type Props = {
  companyName: string
  companyType: string
}

export default function BusinessBriefForm({ companyName, companyType }: Props) {
  const [form, setForm] = useState(initialForm)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set())
  const formRef = useRef<HTMLDivElement>(null)

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const resetForm = () => {
    setSubmitted(false)
    setForm(initialForm)
    setError('')
    setInvalidFields(new Set())
  }

  const handleSubmit = async () => {
    setError('')
    setInvalidFields(new Set())

    if (!companyName || !companyType) {
      setError('Your company profile is incomplete. Please update your account before submitting a brief.')
      return
    }

    const required: { key: string; check: boolean }[] = [
      { key: 'brief_type', check: !form.brief_type },
      { key: 'sector', check: !form.sector },
      { key: 'urgency', check: !form.urgency },
      { key: 'confidentiality_level', check: !form.confidentiality_level },
      { key: 'brief_summary', check: !form.brief_summary.trim() },
      { key: 'contact_name', check: !form.contact_name.trim() },
      { key: 'contact_email', check: !form.contact_email.trim() },
      { key: 'preferred_follow_up', check: !form.preferred_follow_up },
    ]
    const missing = required.filter(r => r.check).map(r => r.key)
    if (missing.length > 0) {
      setInvalidFields(new Set(missing))
      const labels = missing.map(k => FIELD_LABELS[k] || k).join(', ')
      setError(`Please complete: ${labels}`)
      const first = formRef.current?.querySelector(`[data-field="${missing[0]}"]`) as HTMLElement | null
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value)
      })
      formData.append('company_name', companyName)
      formData.append('company_type', companyType)
      if (attachment) {
        formData.append('attachment', attachment)
      }
      const res = await fetch('/api/business-briefs', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        setAttachment(null)
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
        <p style={{ fontSize: 14, color: '#ccc', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px' }}>
          Your brief has been received and will be reviewed privately by the JOBLUX team. If follow-up is required, we will contact you using the details provided.
        </p>
        <button
          onClick={resetForm}
          style={{
            display: 'inline-block', padding: '12px 32px', fontSize: 14, fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            background: '#ffffff', color: '#111',
            border: 'none', borderRadius: 4, cursor: 'pointer',
          }}
        >
          Submit another brief
        </button>
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
  const borderFor = (field: string): string => invalidFields.has(field) ? '1px solid #e57373' : '1px solid #333'

  return (
    <div ref={formRef} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Section 2 — Brief Type */}
      <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: 8, padding: '28px 24px' }}>
        <h3 style={sectionHeadingStyle}>Brief Type</h3>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Brief type{requiredStar}</label>
          <div data-field="brief_type" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4, padding: invalidFields.has('brief_type') ? 6 : 0, border: invalidFields.has('brief_type') ? '1px solid #e57373' : 'none', borderRadius: 4 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px 20px' }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Sector{requiredStar}</label>
            <select data-field="sector" style={{ ...selectStyle, border: borderFor('sector') }} value={form.sector} onChange={e => set('sector', e.target.value)}>
              <option value="">Select...</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Urgency{requiredStar}</label>
            <select data-field="urgency" style={{ ...selectStyle, border: borderFor('urgency') }} value={form.urgency} onChange={e => set('urgency', e.target.value)}>
              <option value="">Select...</option>
              {URGENCY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Confidentiality level{requiredStar}</label>
            <select data-field="confidentiality_level" style={{ ...selectStyle, border: borderFor('confidentiality_level') }} value={form.confidentiality_level} onChange={e => set('confidentiality_level', e.target.value)}>
              <option value="">Select...</option>
              {CONFIDENTIALITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3 — Requirement Details */}
      <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: 8, padding: '28px 24px' }}>
        <h3 style={sectionHeadingStyle}>Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
          <div style={{ ...fieldGroupStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Role</label>
            <input style={inputStyle} placeholder="e.g. Brand Director, Head of Merchandising" value={form.mandate_title} onChange={e => set('mandate_title', e.target.value)} />
          </div>
          <div style={{ ...fieldGroupStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Brief summary{requiredStar}</label>
            <textarea data-field="brief_summary" style={{ ...inputStyle, minHeight: 100, resize: 'vertical', border: borderFor('brief_summary') }} placeholder="Describe the requirement, context, and what a successful outcome looks like." value={form.brief_summary} onChange={e => set('brief_summary', e.target.value)} />
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
              {DEPARTMENTS.map(s => <option key={s} value={s}>{s}</option>)}
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
          <div style={{ ...fieldGroupStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Attach document</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ ...inputStyle, padding: '8px 12px', cursor: 'pointer' }}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) {
                  setAttachment(file)
                  set('attached_filename', file.name)
                }
              }}
            />
            <div style={helperStyle}>Optional — PDF or Word document (job description, org chart, etc.)</div>
          </div>
        </div>
      </div>

      {/* Section 4 — Contact & Handling */}
      <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: 8, padding: '28px 24px' }}>
        <h3 style={sectionHeadingStyle}>Contact & Handling</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Contact name{requiredStar}</label>
            <input data-field="contact_name" style={{ ...inputStyle, border: borderFor('contact_name') }} value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Work email{requiredStar}</label>
            <input data-field="contact_email" style={{ ...inputStyle, border: borderFor('contact_email') }} type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Role / title</label>
            <input style={inputStyle} value={form.contact_role} onChange={e => set('contact_role', e.target.value)} />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Preferred follow-up{requiredStar}</label>
            <select data-field="preferred_follow_up" style={{ ...selectStyle, border: borderFor('preferred_follow_up') }} value={form.preferred_follow_up} onChange={e => set('preferred_follow_up', e.target.value)}>
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
          display: 'inline-block', alignSelf: 'flex-start', padding: '12px 32px', fontSize: 14, fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
          background: submitting ? '#7a6a1e' : '#ffffff', color: '#111',
          border: 'none', borderRadius: 4, cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Submitting...' : 'Submit brief'}
      </button>
    </div>
  )
}
