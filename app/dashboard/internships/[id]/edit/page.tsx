'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useRequireApproved } from '@/lib/auth-hooks'
import { DEPARTMENTS, COUNTRIES } from '@/lib/assignment-options'
import { INTERNSHIP_DURATIONS, REMOTE_POLICIES } from '@/types/internship'
import type { InternshipListing } from '@/types/internship'

const LUXURY_SECTORS = [
  'Fashion & Couture',
  'Leather Goods & Accessories',
  'Watches & Jewellery',
  'Fragrance & Beauty',
  'Wine & Spirits',
  'Hospitality & Travel',
  'Automotive',
  'Yachting & Aviation',
  'Art & Design',
  'Real Estate',
  'Technology & Digital',
  'Other Luxury',
]

interface InternshipForm {
  company_name: string
  company_website: string
  title: string
  department: string
  description: string
  responsibilities: string
  requirements: string
  nice_to_haves: string
  city: string
  country: string
  remote_policy: string
  duration: string
  start_date: string
  is_paid: boolean
  compensation_details: string
  luxury_sector: string
  product_categories: string
  languages_required: string
}

export default function EditInternshipPage() {
  const { isApproved, isLoading: authLoading } = useRequireApproved()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [form, setForm] = useState<InternshipForm>({
    company_name: '',
    company_website: '',
    title: '',
    department: '',
    description: '',
    responsibilities: '',
    requirements: '',
    nice_to_haves: '',
    city: '',
    country: '',
    remote_policy: 'on_site',
    duration: '',
    start_date: '',
    is_paid: false,
    compensation_details: '',
    luxury_sector: '',
    product_categories: '',
    languages_required: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notEditable, setNotEditable] = useState(false)

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ company: true })
  const toggle = (s: string) => setOpenSections(p => ({ ...p, [s]: !p[s] }))

  const updateField = (field: keyof InternshipForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Fetch existing internship
  useEffect(() => {
    if (!id) return
    fetch(`/api/internships/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load internship')
        return res.json()
      })
      .then((data: InternshipListing) => {
        if (data.status !== 'pending_review') {
          setNotEditable(true)
          return
        }
        setForm({
          company_name: data.company_name || '',
          company_website: data.company_website || '',
          title: data.title || '',
          department: data.department || '',
          description: data.description || '',
          responsibilities: data.responsibilities || '',
          requirements: data.requirements || '',
          nice_to_haves: data.nice_to_haves || '',
          city: data.city || '',
          country: data.country || '',
          remote_policy: data.remote_policy || 'on_site',
          duration: data.duration || '',
          start_date: data.start_date || '',
          is_paid: data.is_paid || false,
          compensation_details: data.compensation_details || '',
          luxury_sector: data.luxury_sector || '',
          product_categories: (data.product_categories || []).join(', '),
          languages_required: (data.languages_required || []).join(', '),
        })
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async () => {
    setError('')

    const missing: string[] = []
    if (!form.company_name.trim()) missing.push('Company Name')
    if (!form.title.trim()) missing.push('Title')
    if (!form.description.trim()) missing.push('Description')
    if (form.description.trim().length < 100) missing.push('Description (min 100 characters)')
    if (!form.city.trim()) missing.push('City')
    if (!form.country) missing.push('Country')
    if (!form.duration) missing.push('Duration')
    if (missing.length > 0) {
      setError(`Required fields missing: ${missing.join(', ')}`)
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        product_categories: form.product_categories
          ? form.product_categories.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        languages_required: form.languages_required
          ? form.languages_required.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      }

      const res = await fetch(`/api/internships/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update internship')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="jl-container py-20 text-center">
        <p className="text-sm text-[#888]">Loading...</p>
      </div>
    )
  }

  if (notEditable) {
    return (
      <div className="jl-container py-20 text-center">
        <p className="font-sans text-sm text-[#888] mb-4">
          This internship can only be edited while it is pending review.
        </p>
        <Link href="/dashboard" className="jl-btn jl-btn-gold">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#fafaf5]">
      {/* Page header */}
      <section className="border-b border-[#e8e2d8] bg-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link
            href="/dashboard"
            className="text-sm text-[#a58e28] hover:text-[#1a1a1a] transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#a58e28] mb-2 mt-4">
            Internship Listing
          </p>
          <h1 className="jl-serif text-2xl md:text-3xl text-[#1a1a1a]">
            Edit Internship
          </h1>
          <p className="text-sm text-[#666] mt-1">
            Update the details of your internship submission.
          </p>
        </div>
      </section>

      {/* Form body */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
            {error}
          </div>
        )}

        {/* Section: Company */}
        <div className="bg-white border border-[#e8e2d8] rounded-sm mb-6 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('company')}
            className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-[#fafaf5] transition-colors"
          >
            <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] m-0">Company</h2>
            <svg
              className={`w-4 h-4 text-[#a58e28] transition-transform duration-200 ${openSections.company ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="mx-6 border-t border-[#e8e2d8]" />
          {openSections.company && (
            <div className="px-6 pb-6 pt-5 space-y-4">
              <div>
                <label className="jl-label">Company Name <span className="text-red-500">*</span></label>
                <input type="text" className="jl-input w-full" value={form.company_name} onChange={e => updateField('company_name', e.target.value)} />
              </div>
              <div>
                <label className="jl-label">Company Website</label>
                <input type="text" className="jl-input w-full" value={form.company_website} onChange={e => updateField('company_website', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Section: Details */}
        <div className="bg-white border border-[#e8e2d8] rounded-sm mb-6 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('details')}
            className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-[#fafaf5] transition-colors"
          >
            <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] m-0">Details</h2>
            <svg
              className={`w-4 h-4 text-[#a58e28] transition-transform duration-200 ${openSections.details ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="mx-6 border-t border-[#e8e2d8]" />
          {openSections.details && (
            <div className="px-6 pb-6 pt-5 space-y-4">
              <div>
                <label className="jl-label">Title <span className="text-red-500">*</span></label>
                <input type="text" className="jl-input w-full" value={form.title} onChange={e => updateField('title', e.target.value)} />
              </div>
              <div>
                <label className="jl-label">Department</label>
                <select className="jl-select w-full" value={form.department} onChange={e => updateField('department', e.target.value)}>
                  <option value="">Select department...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="jl-label">Description <span className="text-red-500">*</span></label>
                <textarea className="jl-input w-full min-h-[120px]" value={form.description} onChange={e => updateField('description', e.target.value)} />
                <p className="text-xs text-[#999] mt-1">
                  <span className={form.description.length < 100 ? 'text-red-500' : 'text-[#2a7a3c]'}>{form.description.length}</span>/100 characters minimum
                </p>
              </div>
              <div>
                <label className="jl-label">Responsibilities</label>
                <textarea className="jl-input w-full min-h-[100px]" value={form.responsibilities} onChange={e => updateField('responsibilities', e.target.value)} />
              </div>
              <div>
                <label className="jl-label">Requirements</label>
                <textarea className="jl-input w-full min-h-[100px]" value={form.requirements} onChange={e => updateField('requirements', e.target.value)} />
              </div>
              <div>
                <label className="jl-label">Nice to Haves</label>
                <textarea className="jl-input w-full min-h-[80px]" value={form.nice_to_haves} onChange={e => updateField('nice_to_haves', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Section: Location */}
        <div className="bg-white border border-[#e8e2d8] rounded-sm mb-6 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('location')}
            className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-[#fafaf5] transition-colors"
          >
            <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] m-0">Location</h2>
            <svg
              className={`w-4 h-4 text-[#a58e28] transition-transform duration-200 ${openSections.location ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="mx-6 border-t border-[#e8e2d8]" />
          {openSections.location && (
            <div className="px-6 pb-6 pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="jl-label">City <span className="text-red-500">*</span></label>
                  <input type="text" className="jl-input w-full" value={form.city} onChange={e => updateField('city', e.target.value)} />
                </div>
                <div>
                  <label className="jl-label">Country <span className="text-red-500">*</span></label>
                  <select className="jl-select w-full" value={form.country} onChange={e => updateField('country', e.target.value)}>
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="jl-label">Remote Policy</label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {REMOTE_POLICIES.map(rp => (
                    <label key={rp.value} className="flex items-center gap-2 cursor-pointer text-sm text-[#1a1a1a]">
                      <input
                        type="radio"
                        name="remote_policy"
                        value={rp.value}
                        checked={form.remote_policy === rp.value}
                        onChange={e => updateField('remote_policy', e.target.value)}
                        className="accent-[#a58e28]"
                      />
                      {rp.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Terms */}
        <div className="bg-white border border-[#e8e2d8] rounded-sm mb-6 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('terms')}
            className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-[#fafaf5] transition-colors"
          >
            <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] m-0">Terms</h2>
            <svg
              className={`w-4 h-4 text-[#a58e28] transition-transform duration-200 ${openSections.terms ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="mx-6 border-t border-[#e8e2d8]" />
          {openSections.terms && (
            <div className="px-6 pb-6 pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="jl-label">Duration <span className="text-red-500">*</span></label>
                  <select className="jl-select w-full" value={form.duration} onChange={e => updateField('duration', e.target.value)}>
                    <option value="">Select duration...</option>
                    {INTERNSHIP_DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="jl-label">Start Date</label>
                  <input type="text" className="jl-input w-full" placeholder="e.g. September 2026, ASAP" value={form.start_date} onChange={e => updateField('start_date', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    role="switch"
                    aria-checked={form.is_paid}
                    onClick={() => updateField('is_paid', !form.is_paid)}
                    className={`relative flex-shrink-0 mt-0.5 w-10 h-[22px] rounded-full transition-colors duration-200 ${form.is_paid ? 'bg-[#a58e28]' : 'bg-[#d4d0c8]'}`}
                  >
                    <div className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${form.is_paid ? 'translate-x-[20px]' : 'translate-x-[2px]'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">Paid Internship</p>
                    <p className="text-xs text-[#999] mt-0.5">Toggle if this internship offers compensation.</p>
                  </div>
                </label>
              </div>
              {form.is_paid && (
                <div>
                  <label className="jl-label">Compensation Details</label>
                  <input type="text" className="jl-input w-full" placeholder="e.g. 1,200 EUR/month" value={form.compensation_details} onChange={e => updateField('compensation_details', e.target.value)} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section: Luxury Context */}
        <div className="bg-white border border-[#e8e2d8] rounded-sm mb-6 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle('luxury')}
            className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-[#fafaf5] transition-colors"
          >
            <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] m-0">Luxury Context</h2>
            <svg
              className={`w-4 h-4 text-[#a58e28] transition-transform duration-200 ${openSections.luxury ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="mx-6 border-t border-[#e8e2d8]" />
          {openSections.luxury && (
            <div className="px-6 pb-6 pt-5 space-y-4">
              <div>
                <label className="jl-label">Luxury Sector</label>
                <select className="jl-select w-full" value={form.luxury_sector} onChange={e => updateField('luxury_sector', e.target.value)}>
                  <option value="">Select sector...</option>
                  {LUXURY_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="jl-label">Product Categories</label>
                <input type="text" className="jl-input w-full" placeholder="Comma separated" value={form.product_categories} onChange={e => updateField('product_categories', e.target.value)} />
                <p className="text-xs text-[#999] mt-1">Separate multiple categories with commas.</p>
              </div>
              <div>
                <label className="jl-label">Languages Required</label>
                <input type="text" className="jl-input w-full" placeholder="Comma separated" value={form.languages_required} onChange={e => updateField('languages_required', e.target.value)} />
                <p className="text-xs text-[#999] mt-1">Separate multiple languages with commas.</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-2 pb-12">
          <Link href="/dashboard" className="jl-btn jl-btn-outline text-center">
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="jl-btn jl-btn-gold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update & Resubmit'}
          </button>
        </div>
      </div>
    </main>
  )
}
