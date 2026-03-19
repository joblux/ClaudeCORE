'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CONTRACT_TYPES = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'fixed-term', label: 'Fixed Term' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'interim', label: 'Interim' },
  { value: 'internship', label: 'Internship' },
]

const SENIORITY_LEVELS = [
  { value: 'intern', label: 'Intern' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid-level', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'director', label: 'Director' },
  { value: 'vp', label: 'Vice President' },
  { value: 'c-suite', label: 'C-Suite' },
]

const REMOTE_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'on-site', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
  { value: 'flexible', label: 'Flexible' },
]

const CURRENCIES = [
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'USD', label: '$ USD' },
  { value: 'CHF', label: 'CHF' },
  { value: 'AED', label: 'AED' },
  { value: 'SGD', label: 'SGD' },
  { value: 'HKD', label: 'HKD' },
  { value: 'JPY', label: '¥ JPY' },
  { value: 'CNY', label: '¥ CNY' },
]

export default function NewBriefPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSeo, setShowSeo] = useState(false)

  const [form, setForm] = useState({
    title: '',
    maison: '',
    location: '',
    city: '',
    country: '',
    remote_policy: '',
    contract_type: 'permanent',
    seniority: 'mid-level',
    department: '',
    reports_to: '',
    description: '',
    responsibilities: '',
    requirements: '',
    qualifications: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'EUR',
    salary_display: '',
    is_confidential: false,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  })

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save brief')
      }

      router.push('/admin/briefs')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fafaf5]">
      {/* Header */}
      <section className="border-b border-[#e8e2d8] bg-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link
            href="/admin/briefs"
            className="text-sm text-[#a58e28] hover:text-[#1a1a1a] transition-colors"
          >
            ← Back to Briefs
          </Link>
          <h1 className="jl-serif text-2xl md:text-3xl text-[#1a1a1a] mt-4">
            New Job Brief
          </h1>
          <p className="text-sm text-[#666] mt-1">
            Post a new assignment to the JOBLUX platform.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
            {error}
          </div>
        )}

        {/* ─── SECTION: Core Details ─── */}
        <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 mb-6">
          <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">
            Assignment Details
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="jl-label">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="jl-input w-full"
                placeholder="e.g. Retail Director, Visual Merchandiser, Digital Marketing Manager"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            {/* Maison */}
            <div>
              <label className="jl-label">
                Maison <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="jl-input w-full"
                placeholder="e.g. Chanel, Hermès, Louis Vuitton"
                value={form.maison}
                onChange={(e) => updateField('maison', e.target.value)}
              />
              <p className="text-xs text-[#999] mt-1">
                Enter the brand or house name. Use &quot;Confidential Maison&quot; for discreet briefs.
              </p>
            </div>

            {/* Department + Reports to */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="jl-label">Department</label>
                <input
                  type="text"
                  className="jl-input w-full"
                  placeholder="e.g. Retail, Marketing, Digital"
                  value={form.department}
                  onChange={(e) => updateField('department', e.target.value)}
                />
              </div>
              <div>
                <label className="jl-label">Reports to</label>
                <input
                  type="text"
                  className="jl-input w-full"
                  placeholder="e.g. Country Manager, CEO"
                  value={form.reports_to}
                  onChange={(e) => updateField('reports_to', e.target.value)}
                />
              </div>
            </div>

            {/* Contract + Seniority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="jl-label">
                  Contract Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="jl-input w-full"
                  value={form.contract_type}
                  onChange={(e) => updateField('contract_type', e.target.value)}
                >
                  {CONTRACT_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="jl-label">
                  Seniority Level <span className="text-red-500">*</span>
                </label>
                <select
                  className="jl-input w-full"
                  value={form.seniority}
                  onChange={(e) => updateField('seniority', e.target.value)}
                >
                  {SENIORITY_LEVELS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SECTION: Location ─── */}
        <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 mb-6">
          <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">
            Location
          </h2>

          <div className="space-y-4">
            {/* Location (main display) */}
            <div>
              <label className="jl-label">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="jl-input w-full"
                placeholder="e.g. Paris, France · London, UK · Dubai, UAE"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
              <p className="text-xs text-[#999] mt-1">
                This is the display location shown on the listing.
              </p>
            </div>

            {/* City + Country (for SEO/structured data) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="jl-label">City</label>
                <input
                  type="text"
                  className="jl-input w-full"
                  placeholder="e.g. Paris"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                />
              </div>
              <div>
                <label className="jl-label">Country</label>
                <input
                  type="text"
                  className="jl-input w-full"
                  placeholder="e.g. France"
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                />
              </div>
            </div>

            {/* Remote policy */}
            <div>
              <label className="jl-label">Remote Policy</label>
              <select
                className="jl-input w-full"
                value={form.remote_policy}
                onChange={(e) => updateField('remote_policy', e.target.value)}
              >
                {REMOTE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─── SECTION: Description ─── */}
        <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 mb-6">
          <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">
            Brief Content
          </h2>

          <div className="space-y-4">
            {/* Description */}
            <div>
              <label className="jl-label">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="jl-input w-full min-h-[120px]"
                placeholder="Overview of the role, the maison's context, and what makes this opportunity distinctive…"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            {/* Responsibilities */}
            <div>
              <label className="jl-label">Key Responsibilities</label>
              <textarea
                className="jl-input w-full min-h-[100px]"
                placeholder="List the core responsibilities of this role (one per line)…"
                value={form.responsibilities}
                onChange={(e) => updateField('responsibilities', e.target.value)}
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="jl-label">Requirements</label>
              <textarea
                className="jl-input w-full min-h-[100px]"
                placeholder="Experience, skills, and background required (one per line)…"
                value={form.requirements}
                onChange={(e) => updateField('requirements', e.target.value)}
              />
            </div>

            {/* Qualifications */}
            <div>
              <label className="jl-label">Qualifications</label>
              <textarea
                className="jl-input w-full min-h-[100px]"
                placeholder="Education, certifications, languages or other qualifications (one per line)…"
                value={form.qualifications}
                onChange={(e) => updateField('qualifications', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ─── SECTION: Salary ─── */}
        <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 mb-6">
          <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">
            Compensation
          </h2>

          <div className="space-y-4">
            {/* Currency + Range */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="jl-label">Currency</label>
                <select
                  className="jl-input w-full"
                  value={form.salary_currency}
                  onChange={(e) => updateField('salary_currency', e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="jl-label">Minimum</label>
                <input
                  type="number"
                  className="jl-input w-full"
                  placeholder="e.g. 80000"
                  value={form.salary_min}
                  onChange={(e) => updateField('salary_min', e.target.value)}
                />
              </div>
              <div>
                <label className="jl-label">Maximum</label>
                <input
                  type="number"
                  className="jl-input w-full"
                  placeholder="e.g. 120000"
                  value={form.salary_max}
                  onChange={(e) => updateField('salary_max', e.target.value)}
                />
              </div>
            </div>

            {/* Display text */}
            <div>
              <label className="jl-label">Salary Display Text</label>
              <input
                type="text"
                className="jl-input w-full"
                placeholder="e.g. €80K–€120K · Competitive · Leave blank to auto-generate"
                value={form.salary_display}
                onChange={(e) => updateField('salary_display', e.target.value)}
              />
              <p className="text-xs text-[#999] mt-1">
                What visitors see on the listing. Leave blank to show the range, or type &quot;Competitive&quot; to hide the numbers.
              </p>
            </div>
          </div>
        </div>

        {/* ─── SECTION: Visibility ─── */}
        <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 mb-6">
          <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">
            Visibility
          </h2>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_confidential}
              onChange={(e) => updateField('is_confidential', e.target.checked)}
              className="mt-1 accent-[#a58e28]"
            />
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">
                Confidential Brief
              </p>
              <p className="text-xs text-[#999] mt-0.5">
                Only visible to approved Professional+, Business and Insider members. Hidden from public visitors and Rising tier.
              </p>
            </div>
          </label>
        </div>

        {/* ─── SECTION: SEO (collapsible) ─── */}
        <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 mb-6">
          <button
            type="button"
            onClick={() => setShowSeo(!showSeo)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28]">
              SEO & Job Indexing
            </h2>
            <svg
              className={`w-4 h-4 text-[#999] transition-transform ${showSeo ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSeo && (
            <div className="space-y-4 mt-5 pt-5 border-t border-[#e8e2d8]">
              <p className="text-xs text-[#999]">
                These fields optimise the listing for Google for Jobs, Indeed, and other job search engines. Leave blank to auto-generate from the title and description.
              </p>

              <div>
                <label className="jl-label">SEO Title</label>
                <input
                  type="text"
                  className="jl-input w-full"
                  placeholder="e.g. Retail Director at Chanel — Paris, France"
                  value={form.seo_title}
                  onChange={(e) => updateField('seo_title', e.target.value)}
                />
                <p className="text-xs text-[#999] mt-1">
                  {form.seo_title.length}/70 characters recommended
                </p>
              </div>

              <div>
                <label className="jl-label">SEO Description</label>
                <textarea
                  className="jl-input w-full min-h-[80px]"
                  placeholder="A concise summary for search engine results…"
                  value={form.seo_description}
                  onChange={(e) => updateField('seo_description', e.target.value)}
                />
                <p className="text-xs text-[#999] mt-1">
                  {form.seo_description.length}/160 characters recommended
                </p>
              </div>

              <div>
                <label className="jl-label">SEO Keywords</label>
                <input
                  type="text"
                  className="jl-input w-full"
                  placeholder="e.g. luxury retail, fashion director, Paris, LVMH"
                  value={form.seo_keywords}
                  onChange={(e) => updateField('seo_keywords', e.target.value)}
                />
                <p className="text-xs text-[#999] mt-1">
                  Comma-separated keywords for job indexing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── ACTION BUTTONS ─── */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Link
            href="/admin/briefs"
            className="jl-btn jl-btn-outline text-center"
          >
            Cancel
          </Link>

          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="jl-btn jl-btn-ghost"
            >
              {saving ? 'Saving…' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleSubmit('published')}
              disabled={saving}
              className="jl-btn jl-btn-primary"
            >
              {saving ? 'Publishing…' : 'Publish Brief'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
