'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Import ALL dropdown options from the single source of truth
import {
  DEPARTMENTS,
  SENIORITY_LEVELS,
  CONTRACT_TYPES,
  REMOTE_POLICIES,
  SALARY_CURRENCIES,
  SALARY_PERIODS,
  BENEFITS_OPTIONS,
  PRODUCT_CATEGORIES,
  CLIENT_SEGMENTS,
  LANGUAGES,
  TRAVEL_PERCENTAGES,
  LUXURY_EXPERIENCE,
  START_DATES,
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_PRIORITIES,
  ASSIGNMENT_SOURCES,
  FEE_AGREEMENTS,
  COMMON_CITIES,
  COUNTRIES,
} from '@/lib/assignment-options'

// ── Static datalist for Maison field ─────────────────────────────────
const TOP_LUXURY_BRANDS = [
  'Chanel',
  'Hermes',
  'Louis Vuitton',
  'Dior',
  'Gucci',
  'Prada',
  'Cartier',
  'Bulgari',
  'Rolex',
  'Tiffany',
  'Burberry',
  'Valentino',
  'Fendi',
  'Celine',
  'Balenciaga',
  'Givenchy',
  'Saint Laurent',
  'Bottega Veneta',
  'Loewe',
  'Moncler',
]

// ── Form state type (covers every field we can edit) ────────
interface AssignmentFormState {
  title: string
  maison: string
  is_confidential: boolean
  status: string
  source: string
  priority: string
  assigned_recruiter: string

  // Location
  city: string
  country: string
  remote_policy: string
  relocation_offered: boolean
  visa_sponsorship: boolean

  // Role details
  department: string
  seniority: string
  contract_type: string
  reports_to: string
  team_size: string
  start_date: string

  // Compensation
  salary_min: string
  salary_max: string
  salary_currency: string
  salary_period: string
  salary_display: string
  bonus_commission: string
  benefits: string[]

  // Description
  description: string
  responsibilities: string
  requirements: string
  nice_to_haves: string
  about_maison: string

  // Luxury industry
  product_category: string[]
  client_segment: string
  languages_required: string[]
  clienteling_experience: boolean
  travel_percentage: string
  luxury_sector_experience: string

  // SEO
  seo_title: string
  seo_description: string
  seo_keywords: string
  slug: string

  // Internal / Admin
  client_contact_name: string
  client_contact_email: string
  client_contact_phone: string
  fee_agreement: string
  fee_amount: string
  internal_notes: string
}

// ── Default empty form ───────────────────────────────────────────────
const EMPTY_FORM: AssignmentFormState = {
  title: '',
  maison: '',
  is_confidential: false,
  status: 'draft',
  source: 'Manual Entry',
  priority: 'normal',
  assigned_recruiter: '',

  city: '',
  country: '',
  remote_policy: '',
  relocation_offered: false,
  visa_sponsorship: false,

  department: '',
  seniority: '',
  contract_type: '',
  reports_to: '',
  team_size: '',
  start_date: '',

  salary_min: '',
  salary_max: '',
  salary_currency: 'EUR',
  salary_period: 'Annual',
  salary_display: '',
  bonus_commission: '',
  benefits: [],

  description: '',
  responsibilities: '',
  requirements: '',
  nice_to_haves: '',
  about_maison: '',

  product_category: [],
  client_segment: '',
  languages_required: [],
  clienteling_experience: false,
  travel_percentage: '',
  luxury_sector_experience: '',

  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  slug: '',

  client_contact_name: '',
  client_contact_email: '',
  client_contact_phone: '',
  fee_agreement: '',
  fee_amount: '',
  internal_notes: '',
}

// ══════════════════════════════════════════════════════════════════════
// Collapsible section component
// ══════════════════════════════════════════════════════════════════════
function FormSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white border border-[#e8e2d8] rounded-sm mb-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-[#fafaf5] transition-colors"
      >
        <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] m-0">
          {title}
        </h2>
        <svg
          className={`w-4 h-4 text-[#a58e28] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Gold divider line */}
      <div className="mx-6 border-t border-[#e8e2d8]" />

      {open && <div className="px-6 pb-6 pt-5">{children}</div>}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// Toggle switch component
// ══════════════════════════════════════════════════════════════════════
function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 mt-0.5 w-10 h-[22px] rounded-full transition-colors duration-200 ${
          checked ? 'bg-[#a58e28]' : 'bg-[#d4d0c8]'
        }`}
      >
        <div
          className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-[20px]' : 'translate-x-[2px]'
          }`}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">
          {label}
        </p>
        {description && (
          <p className="text-xs text-[#999] mt-0.5">{description}</p>
        )}
      </div>
    </label>
  )
}

// ══════════════════════════════════════════════════════════════════════
// Multi-select checkbox grid
// ══════════════════════════════════════════════════════════════════════
function CheckboxGrid({
  options,
  selected,
  onChange,
}: {
  options: readonly string[]
  selected: string[]
  onChange: (val: string[]) => void
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-2 text-sm text-[#1a1a1a] cursor-pointer hover:text-[#a58e28] transition-colors"
        >
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className="accent-[#a58e28] w-4 h-4"
          />
          {opt}
        </label>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// Utility: generate slug from title
// ══════════════════════════════════════════════════════════════════════
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ══════════════════════════════════════════════════════════════════════
// Main page component
// ══════════════════════════════════════════════════════════════════════
// Wrapper with Suspense boundary (required by Next.js for useSearchParams)
export default function NewAssignmentPageWrapper() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <p className="text-sm text-[#999]">Loading...</p>
      </main>
    }>
      <NewAssignmentPage />
    </Suspense>
  )
}

function NewAssignmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const isEditMode = Boolean(editId)

  const [form, setForm] = useState<AssignmentFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Fetch existing assignment for edit mode ───────────────────────────
  useEffect(() => {
    if (!editId) return

    setLoading(true)
    fetch(`/api/assignments/${editId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load assignment')
        return res.json()
      })
      .then((data) => {
        const assignment = data.assignment || data
        setForm({
          title: assignment.title || '',
          maison: assignment.maison || '',
          is_confidential: assignment.is_confidential || false,
          status: assignment.status || 'draft',
          source: assignment.source || 'Manual Entry',
          priority: assignment.priority || 'normal',
          assigned_recruiter: assignment.assigned_recruiter || '',

          city: assignment.city || '',
          country: assignment.country || '',
          remote_policy: assignment.remote_policy || '',
          relocation_offered: assignment.relocation_offered || false,
          visa_sponsorship: assignment.visa_sponsorship || false,

          department: assignment.department || '',
          seniority: assignment.seniority || '',
          contract_type: assignment.contract_type || '',
          reports_to: assignment.reports_to || '',
          team_size: assignment.team_size != null ? String(assignment.team_size) : '',
          start_date: assignment.start_date || '',

          salary_min: assignment.salary_min != null ? String(assignment.salary_min) : '',
          salary_max: assignment.salary_max != null ? String(assignment.salary_max) : '',
          salary_currency: assignment.salary_currency || 'EUR',
          salary_period: assignment.salary_period || 'Annual',
          salary_display: assignment.salary_display || '',
          bonus_commission: assignment.bonus_commission || '',
          benefits: assignment.benefits || [],

          description: assignment.description || '',
          responsibilities: assignment.responsibilities || '',
          requirements: assignment.requirements || '',
          nice_to_haves: assignment.nice_to_haves || '',
          about_maison: assignment.about_maison || '',

          product_category: assignment.product_category || [],
          client_segment: assignment.client_segment || '',
          languages_required: assignment.languages_required || [],
          clienteling_experience: assignment.clienteling_experience || false,
          travel_percentage: assignment.travel_percentage || '',
          luxury_sector_experience: assignment.luxury_sector_experience || '',

          seo_title: assignment.seo_title || '',
          seo_description: assignment.seo_description || '',
          seo_keywords: assignment.seo_keywords || '',
          slug: assignment.slug || '',

          client_contact_name: assignment.client_contact_name || '',
          client_contact_email: assignment.client_contact_email || '',
          client_contact_phone: assignment.client_contact_phone || '',
          fee_agreement: assignment.fee_agreement || '',
          fee_amount: assignment.fee_amount || '',
          internal_notes: assignment.internal_notes || '',
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [editId])

  // ── Field updater ────────────────────────────────────────────────
  const updateField = useCallback(
    (field: keyof AssignmentFormState, value: string | boolean | string[]) => {
      setForm((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  // Track the last auto-generated values so we know if the user manually edited
  const lastAutoSeo = useRef({ title: '', description: '', slug: '' })

  // Auto-generate SEO fields when title/maison/city/description change
  useEffect(() => {
    const autoTitle = `${form.title}${form.maison ? ' at ' + form.maison : ''}${form.city ? ' \u2014 ' + form.city : ''}`
    const autoDesc = (form.description || '').slice(0, 160)
    const autoSlug = toSlug(form.title)

    setForm((prev) => {
      const updates: Partial<AssignmentFormState> = {}

      // Only auto-fill if the field is empty or still matches the last auto-generated value
      if (!prev.seo_title || prev.seo_title === lastAutoSeo.current.title) {
        updates.seo_title = autoTitle
      }
      if (!prev.seo_description || prev.seo_description === lastAutoSeo.current.description) {
        updates.seo_description = autoDesc
      }
      if (!prev.slug || prev.slug === lastAutoSeo.current.slug) {
        updates.slug = autoSlug
      }

      // Update the ref with current auto values
      lastAutoSeo.current = { title: autoTitle, description: autoDesc, slug: autoSlug }

      if (Object.keys(updates).length === 0) return prev
      return { ...prev, ...updates }
    })
  }, [form.title, form.maison, form.city, form.description])

  // ── Submit handler ───────────────────────────────────────────────
  const handleSubmit = async (submitStatus: 'draft' | 'active') => {
    setError('')

    // Validate required fields for activating
    if (submitStatus === 'active') {
      const missing: string[] = []
      if (!form.title.trim()) missing.push('Title')
      if (!form.maison.trim()) missing.push('Maison')
      if (!form.description.trim()) missing.push('Description')
      if (missing.length > 0) {
        setError(`Required fields missing: ${missing.join(', ')}`)
        return
      }
    }

    setSaving(true)

    // Build the payload, converting numeric strings to numbers
    const payload = {
      ...form,
      status: submitStatus,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      team_size: form.team_size ? Number(form.team_size) : null,
      // salary_display: toggle maps checked -> 'true', unchecked -> ''
      salary_display: form.salary_display,
    }

    try {
      const url = isEditMode ? `/api/assignments/${editId}` : '/api/assignments'
      const method = isEditMode ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'save'} assignment`)
      }

      router.push('/admin/assignments')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Loading state for edit mode ──────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <p className="text-sm text-[#999]">Loading assignment...</p>
      </main>
    )
  }

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <main className="min-h-screen bg-[#fafaf5]">
      {/* ── Page header ───────────────────────────────────────────── */}
      <section className="border-b border-[#e8e2d8] bg-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link
            href="/admin/assignments"
            className="text-sm text-[#a58e28] hover:text-[#1a1a1a] transition-colors"
          >
            &larr; Back to Assignments
          </Link>
          <h1 className="jl-serif text-2xl md:text-3xl text-[#1a1a1a] mt-4">
            {isEditMode ? 'Edit Search Assignment' : 'New Search Assignment'}
          </h1>
          <p className="text-sm text-[#666] mt-1">
            {isEditMode
              ? 'Update details for this search assignment.'
              : 'Create a new search assignment for the JOBLUX platform.'}
          </p>
        </div>
      </section>

      {/* ── Form body ─────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
            {error}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            SECTION 1 — Core Information
        ════════════════════════════════════════════════════════════ */}
        <FormSection title="Core Information">
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
                list="maison-list"
                className="jl-input w-full"
                placeholder="e.g. Chanel, Hermes, Louis Vuitton"
                value={form.maison}
                onChange={(e) => updateField('maison', e.target.value)}
              />
              <datalist id="maison-list">
                {TOP_LUXURY_BRANDS.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
              <p className="text-xs text-[#999] mt-1">
                Type to search or enter any brand name. Use &quot;Confidential Maison&quot; for discreet assignments.
              </p>
            </div>

            {/* Confidential toggle */}
            <Toggle
              checked={form.is_confidential}
              onChange={(val) => updateField('is_confidential', val)}
              label="Confidential Assignment"
              description="Only visible to approved Professional+, Business and Insider members."
            />

            {/* Status + Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="jl-label">Status</label>
                <select
                  className="jl-input w-full"
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value)}
                >
                  {ASSIGNMENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="jl-label">Source</label>
                <select
                  className="jl-input w-full"
                  value={form.source}
                  onChange={(e) => updateField('source', e.target.value)}
                >
                  <option value="">Select source...</option>
                  {ASSIGNMENT_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority + Assigned Recruiter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="jl-label">Priority</label>
                <select
                  className="jl-input w-full"
                  value={form.priority}
                  onChange={(e) => updateField('priority', e.target.value)}
                >
                  {ASSIGNMENT_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="jl-label">Assigned Recruiter</label>
                <input
                  type="text"
                  className="jl-input w-full"
                  placeholder="e.g. Sophie Martin"
                  value={form.assigned_recruiter}
                  onChange={(e) => updateField('assigned_recruiter', e.target.value)}
                />
              </div>
            </div>
          </div>
        </FormSection>

        {/* ════════════════════════════════════════════════════════════
            SECTION 2 — Location & Work Model
        ════════════════════════════════════════════════════════════ */}
        <FormSection title="Location & Work Model">
          <div className="space-y-4">
            {/* City + Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="jl-label">City</label>
                <input
                  type="text"
                  list="city-list"
                  className="jl-input w-full"
                  placeholder="e.g. Paris"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                />
                <datalist id="city-list">
                  {COMMON_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="jl-label">Country</label>
                <select
                  className="jl-input w-full"
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                >
                  <option value="">Select country...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Remote Policy */}
            <div>
              <label className="jl-label">Remote Policy</label>
              <select
                className="jl-input w-full"
                value={form.remote_policy}
                onChange={(e) => updateField('remote_policy', e.target.value)}
              >
                <option value="">Not specified</option>
                {REMOTE_POLICIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Relocation + Visa toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Toggle
                checked={form.relocation_offered}
                onChange={(val) => updateField('relocation_offered', val)}
                label="Relocation Offered"
                description="The employer covers relocation costs."
              />
              <Toggle
                checked={form.visa_sponsorship}
                onChange={(val) => updateField('visa_sponsorship', val)}
                label="Visa Sponsorship"
                description="Work visa sponsorship is available."
              />
            </div>
          </div>
        </FormSection>

        {/* ════════════════════════════════════════════════════════════
            SECTION 3 — Role Details
        ════════════════════════════════════════════════════════════ */}
        <FormSection title="Role Details">
          <div className="space-y-4">
            {/* Department + Seniority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="jl-label">Department</label>
                <select
                  className="jl-input w-full"
                  value={form.department}
                  onChange={(e) => updateField('department', e.target.value)}
                >
                  <option value="">Select department...</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="jl-label">Seniority Level</label>
                <select
                  className="jl-input w-full"
                  value={form.seniority}
                  onChange={(e) => updateField('seniority', e.target.value)}
                >
                  <option value="">Select seniority...</option>
                  {SENIORITY_LEVELS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contract Type + Start Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="jl-label">Contract Type</label>
                <select
                  className="jl-input w-full"
                  value={form.contract_type}
                  onChange={(e) => updateField('contract_type', e.target.value)}
                >
                  <option value="">Select contract type...</option>
                  {CONTRACT_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="jl-label">Start Date</label>
                <select
                  className="jl-input w-full"
                  value={form.start_date}
                  onChange={(e) => updateField('start_date', e.target.value)}
                >
                  <option value="">Select...</option>
                  {START_DATES.map((sd) => (
                    <option key={sd} value={sd}>
                      {sd}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reports To + Team Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="jl-label">Reports To</label>
                <input
                  type="text"
                  className="jl-input w-full"
                  placeholder="e.g. Country Manager, CEO"
                  value={form.reports_to}
                  onChange={(e) => updateField('reports_to', e.target.value)}
                />
              </div>
              <div>
                <label className="jl-label">Team Size</label>
                <input
                  type="number"
                  className="jl-input w-full"
                  placeholder="e.g. 12"
                  min="0"
                  value={form.team_size}
                  onChange={(e) => updateField('team_size', e.target.value)}
                />
              </div>
            </div>
          </div>
        </FormSection>

        {/* ════════════════════════════════════════════════════════════
            SECTION 4 — Compensation
        ════════════════════════════════════════════════════════════ */}
        <FormSection title="Compensation">
          <div className="space-y-4">
            {/* Salary Min / Max */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="jl-label">Salary Min</label>
                <input
                  type="number"
                  className="jl-input w-full"
                  placeholder="e.g. 80000"
                  value={form.salary_min}
                  onChange={(e) => updateField('salary_min', e.target.value)}
                />
              </div>
              <div>
                <label className="jl-label">Salary Max</label>
                <input
                  type="number"
                  className="jl-input w-full"
                  placeholder="e.g. 120000"
                  value={form.salary_max}
                  onChange={(e) => updateField('salary_max', e.target.value)}
                />
              </div>
              <div>
                <label className="jl-label">Currency</label>
                <select
                  className="jl-input w-full"
                  value={form.salary_currency}
                  onChange={(e) => updateField('salary_currency', e.target.value)}
                >
                  {SALARY_CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="jl-label">Period</label>
                <select
                  className="jl-input w-full"
                  value={form.salary_period}
                  onChange={(e) => updateField('salary_period', e.target.value)}
                >
                  {SALARY_PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Show Salary toggle */}
            <Toggle
              checked={form.salary_display === 'true'}
              onChange={(val) => updateField('salary_display', val ? 'true' : '')}
              label="Show Salary on Listing"
              description="When enabled, salary range will be visible on the public listing."
            />

            {/* Bonus / Commission */}
            <div>
              <label className="jl-label">Bonus / Commission</label>
              <input
                type="text"
                className="jl-input w-full"
                placeholder="e.g. 20% annual bonus, commission on sales"
                value={form.bonus_commission}
                onChange={(e) => updateField('bonus_commission', e.target.value)}
              />
            </div>

            {/* Benefits multi-select */}
            <div>
              <label className="jl-label mb-2 block">Benefits</label>
              <CheckboxGrid
                options={BENEFITS_OPTIONS}
                selected={form.benefits}
                onChange={(val) => updateField('benefits', val)}
              />
            </div>
          </div>
        </FormSection>

        {/* ════════════════════════════════════════════════════════════
            SECTION 5 — Job Description
        ════════════════════════════════════════════════════════════ */}
        <FormSection title="Job Description">
          <div className="space-y-4">
            {/* Description */}
            <div>
              <label className="jl-label">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="jl-input w-full min-h-[140px]"
                placeholder="Overview of the role, the maison's context, and what makes this opportunity distinctive..."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            {/* Key Responsibilities */}
            <div>
              <label className="jl-label">Key Responsibilities</label>
              <textarea
                className="jl-input w-full min-h-[100px]"
                placeholder="List the core responsibilities (one per line)..."
                value={form.responsibilities}
                onChange={(e) => updateField('responsibilities', e.target.value)}
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="jl-label">Requirements</label>
              <textarea
                className="jl-input w-full min-h-[100px]"
                placeholder="Experience, skills, and background required..."
                value={form.requirements}
                onChange={(e) => updateField('requirements', e.target.value)}
              />
            </div>

            {/* Nice-to-Haves */}
            <div>
              <label className="jl-label">Nice-to-Haves</label>
              <textarea
                className="jl-input w-full min-h-[80px]"
                placeholder="Additional skills or experience that would be a plus..."
                value={form.nice_to_haves}
                onChange={(e) => updateField('nice_to_haves', e.target.value)}
              />
            </div>

            {/* About the Maison */}
            <div>
              <label className="jl-label">About the Maison</label>
              <textarea
                className="jl-input w-full min-h-[80px]"
                placeholder="Brief description of the brand, heritage, and culture..."
                value={form.about_maison}
                onChange={(e) => updateField('about_maison', e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        {/* ════════════════════════════════════════════════════════════
            SECTION 6 — Luxury Industry Fields
        ════════════════════════════════════════════════════════════ */}
        <FormSection title="Luxury Industry Fields">
          <div className="space-y-4">
            {/* Product Category multi-select */}
            <div>
              <label className="jl-label mb-2 block">Product Category</label>
              <CheckboxGrid
                options={PRODUCT_CATEGORIES}
                selected={form.product_category}
                onChange={(val) => updateField('product_category', val)}
              />
            </div>

            {/* Client Segment */}
            <div>
              <label className="jl-label">Client Segment</label>
              <select
                className="jl-input w-full"
                value={form.client_segment}
                onChange={(e) => updateField('client_segment', e.target.value)}
              >
                <option value="">Select segment...</option>
                {CLIENT_SEGMENTS.map((cs) => (
                  <option key={cs} value={cs}>
                    {cs}
                  </option>
                ))}
              </select>
            </div>

            {/* Languages Required multi-select */}
            <div>
              <label className="jl-label mb-2 block">Languages Required</label>
              <CheckboxGrid
                options={LANGUAGES}
                selected={form.languages_required}
                onChange={(val) => updateField('languages_required', val)}
              />
            </div>

            {/* Clienteling Experience toggle */}
            <Toggle
              checked={form.clienteling_experience}
              onChange={(val) => updateField('clienteling_experience', val)}
              label="Clienteling Experience Required"
              description="The role requires experience in luxury client relationship management."
            />

            {/* Travel % + Luxury Sector Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="jl-label">Travel %</label>
                <select
                  className="jl-input w-full"
                  value={form.travel_percentage}
                  onChange={(e) => updateField('travel_percentage', e.target.value)}
                >
                  <option value="">Select...</option>
                  {TRAVEL_PERCENTAGES.map((tp) => (
                    <option key={tp} value={tp}>
                      {tp}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="jl-label">Luxury Sector Experience</label>
                <select
                  className="jl-input w-full"
                  value={form.luxury_sector_experience}
                  onChange={(e) => updateField('luxury_sector_experience', e.target.value)}
                >
                  <option value="">Select...</option>
                  {LUXURY_EXPERIENCE.map((le) => (
                    <option key={le} value={le}>
                      {le}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </FormSection>

        {/* ════════════════════════════════════════════════════════════
            SECTION 7 — SEO & Visibility
        ════════════════════════════════════════════════════════════ */}
        <FormSection title="SEO & Visibility">
          <div className="space-y-4">
            <p className="text-xs text-[#999]">
              These fields optimise the listing for Google for Jobs, Indeed, and other search engines.
              They auto-generate from the title and description, but you can edit them.
            </p>

            {/* SEO Title */}
            <div>
              <label className="jl-label">SEO Title</label>
              <input
                type="text"
                className="jl-input w-full"
                placeholder="e.g. Retail Director at Chanel — Paris"
                value={form.seo_title}
                onChange={(e) => updateField('seo_title', e.target.value)}
              />
              <p className="text-xs text-[#999] mt-1">
                <span className={form.seo_title.length > 70 ? 'text-red-500 font-medium' : ''}>
                  {form.seo_title.length}
                </span>
                /70 characters recommended
              </p>
            </div>

            {/* SEO Description */}
            <div>
              <label className="jl-label">SEO Description</label>
              <textarea
                className="jl-input w-full min-h-[80px]"
                placeholder="A concise summary for search engine results..."
                value={form.seo_description}
                onChange={(e) => updateField('seo_description', e.target.value)}
              />
              <p className="text-xs text-[#999] mt-1">
                <span className={form.seo_description.length > 160 ? 'text-red-500 font-medium' : ''}>
                  {form.seo_description.length}
                </span>
                /160 characters recommended
              </p>
            </div>

            {/* Keywords */}
            <div>
              <label className="jl-label">Keywords</label>
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

            {/* Slug */}
            <div>
              <label className="jl-label">Slug</label>
              <input
                type="text"
                className="jl-input w-full"
                placeholder="e.g. retail-director-chanel-paris"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
              />
              <p className="text-xs text-[#999] mt-1">
                URL-friendly identifier. Auto-generated from title.
              </p>
            </div>
          </div>
        </FormSection>

        {/* ════════════════════════════════════════════════════════════
            SECTION 8 — Internal / Assignment Details (starts CLOSED)
        ════════════════════════════════════════════════════════════ */}
        <FormSection title="Internal / Assignment Details" defaultOpen={false}>
          <div className="space-y-4">
            {/* Client Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="jl-label">Client Contact Name</label>
                <input
                  type="text"
                  className="jl-input w-full"
                  placeholder="e.g. Jean Dupont"
                  value={form.client_contact_name}
                  onChange={(e) => updateField('client_contact_name', e.target.value)}
                />
              </div>
              <div>
                <label className="jl-label">Client Email</label>
                <input
                  type="email"
                  className="jl-input w-full"
                  placeholder="e.g. jean@maison.com"
                  value={form.client_contact_email}
                  onChange={(e) => updateField('client_contact_email', e.target.value)}
                />
              </div>
              <div>
                <label className="jl-label">Client Phone</label>
                <input
                  type="tel"
                  className="jl-input w-full"
                  placeholder="e.g. +33 1 23 45 67 89"
                  value={form.client_contact_phone}
                  onChange={(e) => updateField('client_contact_phone', e.target.value)}
                />
              </div>
            </div>

            {/* Fee Agreement + Fee Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="jl-label">Fee Agreement</label>
                <select
                  className="jl-input w-full"
                  value={form.fee_agreement}
                  onChange={(e) => updateField('fee_agreement', e.target.value)}
                >
                  <option value="">Select...</option>
                  {FEE_AGREEMENTS.map((fa) => (
                    <option key={fa} value={fa}>
                      {fa}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="jl-label">Fee Amount</label>
                <input
                  type="text"
                  className="jl-input w-full"
                  placeholder="e.g. 20% or 15,000 EUR"
                  value={form.fee_amount}
                  onChange={(e) => updateField('fee_amount', e.target.value)}
                />
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="jl-label">Internal Notes</label>
              <textarea
                className="jl-input w-full min-h-[100px]"
                placeholder="Private notes for the recruitment team — not visible externally..."
                value={form.internal_notes}
                onChange={(e) => updateField('internal_notes', e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        {/* ════════════════════════════════════════════════════════════
            ACTION BUTTONS
        ════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-2 pb-12">
          <Link
            href="/admin/assignments"
            className="jl-btn jl-btn-outline text-center"
          >
            Cancel
          </Link>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="jl-btn jl-btn-ghost"
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('active')}
              disabled={saving}
              className="jl-btn jl-btn-primary"
            >
              {saving
                ? isEditMode
                  ? 'Updating...'
                  : 'Activating...'
                : isEditMode
                  ? 'Update Assignment'
                  : 'Activate Assignment'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
