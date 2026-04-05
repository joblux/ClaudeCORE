'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'AED', 'SGD', 'HKD', 'JPY', 'CNY']
const SENIORITY_LEVELS = ['Intern', 'Junior', 'Mid-level', 'Senior', 'Director', 'VP', 'C-Suite']
const SENIORITY_DB: Record<string, string> = { 'Intern': 'intern', 'Junior': 'junior', 'Mid-level': 'mid-level', 'Senior': 'senior', 'Director': 'director', 'VP': 'vp', 'C-Suite': 'c-suite' }
const EMPLOYMENT_TYPES = ['Permanent', 'Fixed-term', 'Freelance', 'Interim']
const EMPLOYMENT_TYPE_DB: Record<string, string> = { 'Permanent': 'permanent', 'Fixed-term': 'fixed-term', 'Freelance': 'freelance', 'Interim': 'interim' }
const DEPARTMENTS = ['Retail', 'Marketing', 'Digital', 'Merchandising', 'Finance', 'HR', 'Operations', 'Design', 'Communications', 'Supply chain', 'E-commerce', 'Legal', 'IT', 'Other']

export default function SubmitSalaryPage() {
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
    job_title: '',
    department: '',
    seniority: '',
    city: '',
    country: '',
    base_salary: '',
    salary_currency: 'EUR',
    bonus_amount: '',
    bonus_type: '',
    total_comp: '',
    benefits_notes: '',
    year_of_data: String(new Date().getFullYear()),
    employment_type: 'Permanent',
    years_experience: '',
    is_anonymous: true,
  })

  const set = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))

  const selectedBrand = brandOptions.find(b => b.slug === form.brand_slug)

  const handleSubmit = async () => {
    if (!form.job_title || !form.city || !form.country || !form.base_salary) {
      setError('Job title, city, country, and base salary are required.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contribution_type: 'salary_data',
          brand_slug: form.brand_slug || null,
          brand_name: selectedBrand?.name || null,
          is_anonymous: form.is_anonymous,
          data: {
            job_title: form.job_title,
            department: form.department || null,
            seniority: SENIORITY_DB[form.seniority] || null,
            city: form.city,
            country: form.country,
            base_salary: form.base_salary,
            salary_currency: form.salary_currency,
            bonus_amount: form.bonus_amount || null,
            bonus_type: form.bonus_type || null,
            total_comp: form.total_comp || null,
            benefits_notes: form.benefits_notes || null,
            year_of_data: form.year_of_data || null,
            employment_type: EMPLOYMENT_TYPE_DB[form.employment_type] || null,
            years_experience: form.years_experience || null,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
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
            <div style={{ fontSize: 16, color: '#fff', fontWeight: 500, marginBottom: 6 }}>Salary data submitted</div>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>
              Your contribution is now under review. It will be verified before being added to JOBLUX intelligence.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => { setSubmitted(false); setForm(f => ({ ...f, job_title: '', base_salary: '', bonus_amount: '', total_comp: '', benefits_notes: '' })) }} style={{ padding: '8px 20px', fontSize: 12, border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, background: 'transparent', color: '#a58e28', cursor: 'pointer' }}>
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
  const optionalSpan = <span style={{ fontSize: 10, color: '#666', fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0 }}>(optional)</span>

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: 'Inter, sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Link href="/dashboard/insider" style={{ fontSize: 12, color: '#a58e28', textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}>← Back to dashboard</Link>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, color: '#fff', margin: '0 0 6px' }}>Submit Salary Data</h1>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 24 }}>Contribute compensation data to improve JOBLUX intelligence. All submissions are verified before publication.</p>

        <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: 24 }}>
          {/* Brand */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Brand / Maison {optionalSpan}</label>
            <select value={form.brand_slug} onChange={e => set('brand_slug', e.target.value)} style={{ ...inputStyle, appearance: 'auto' as const }}>
              <option value="">Select a brand (or leave blank)</option>
              {brandOptions.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </div>

          {/* Job title */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Job title *</label>
            <input type="text" placeholder="e.g. Store Director, Visual Merchandiser" value={form.job_title} onChange={e => set('job_title', e.target.value)} style={inputStyle} />
          </div>

          {/* Department + Seniority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Department {optionalSpan}</label>
              <select value={form.department} onChange={e => set('department', e.target.value)} style={{ ...inputStyle, appearance: 'auto' as const }}>
                <option value="">Select</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Seniority {optionalSpan}</label>
              <select value={form.seniority} onChange={e => set('seniority', e.target.value)} style={{ ...inputStyle, appearance: 'auto' as const }}>
                <option value="">Select</option>
                {SENIORITY_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* City + Country */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>City *</label>
              <input type="text" placeholder="e.g. Paris, London, Dubai" value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Country *</label>
              <input type="text" placeholder="e.g. France, UK, UAE" value={form.country} onChange={e => set('country', e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Salary + Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Base salary (annual) *</label>
              <input type="number" placeholder="e.g. 65000" value={form.base_salary} onChange={e => set('base_salary', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Currency</label>
              <select value={form.salary_currency} onChange={e => set('salary_currency', e.target.value)} style={{ ...inputStyle, appearance: 'auto' as const }}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Bonus */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Bonus amount {optionalSpan}</label>
              <input type="number" placeholder="e.g. 10000" value={form.bonus_amount} onChange={e => set('bonus_amount', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Bonus type {optionalSpan}</label>
              <input type="text" placeholder="e.g. Performance, Signing, Annual" value={form.bonus_type} onChange={e => set('bonus_type', e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Total comp */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Total compensation {optionalSpan}</label>
            <input type="number" placeholder="Base + bonus + benefits value" value={form.total_comp} onChange={e => set('total_comp', e.target.value)} style={inputStyle} />
          </div>

          {/* Employment type + Years experience + Year of data */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Employment type</label>
              <select value={form.employment_type} onChange={e => set('employment_type', e.target.value)} style={{ ...inputStyle, appearance: 'auto' as const }}>
                {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Years experience {optionalSpan}</label>
              <input type="number" placeholder="e.g. 8" value={form.years_experience} onChange={e => set('years_experience', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Year of data</label>
              <input type="number" placeholder="2026" value={form.year_of_data} onChange={e => set('year_of_data', e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Benefits notes */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Benefits notes {optionalSpan}</label>
            <textarea placeholder="e.g. Company car, staff discount 30%, private health insurance" value={form.benefits_notes} onChange={e => set('benefits_notes', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.6 }} />
          </div>

          {/* Anonymous toggle */}
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.is_anonymous} onChange={e => set('is_anonymous', e.target.checked)} id="anon" style={{ accentColor: '#a58e28' }} />
            <label htmlFor="anon" style={{ fontSize: 12, color: '#999' }}>Submit anonymously (your name will not be shown publicly)</label>
          </div>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#dc2626', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !form.job_title || !form.city || !form.country || !form.base_salary}
            style={{ padding: '11px 28px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, background: submitting || !form.job_title || !form.city || !form.country || !form.base_salary ? '#2a2a2a' : '#a58e28', color: submitting || !form.job_title || !form.city || !form.country || !form.base_salary ? '#666' : '#000', cursor: submitting || !form.job_title || !form.city || !form.country || !form.base_salary ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            {submitting ? 'Submitting...' : 'Submit salary data →'}
          </button>
          <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
            Submissions go through verification before being added to intelligence.
          </div>
        </div>
      </div>
    </div>
  )
}
