'use client'

import { useState, useEffect, useCallback, useRef, KeyboardEvent, ChangeEvent } from 'react'
import Link from 'next/link'

import type {
  MemberProfile,
  WorkExperience,
  EducationRecord,
  MemberLanguage,
  MemberDocument,
} from '@/types/member-profile'

import {
  DEPARTMENTS,
  SENIORITY_LEVELS,
  CONTRACT_TYPES,
  PRODUCT_CATEGORIES,
  CLIENT_SEGMENTS,
  LANGUAGES,
  SALARY_CURRENCIES,
  COUNTRIES,
  COMMON_CITIES,
  AVAILABILITY_OPTIONS,
  DEGREE_LEVELS,
  LANGUAGE_PROFICIENCIES,
  REASONS_FOR_LEAVING,
  MARKET_REGIONS,
  DOCUMENT_TYPES,
} from '@/lib/profile-options'

// ══════════════════════════════════════════════════════════════════════
// Constants
// ══════════════════════════════════════════════════════════════════════

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 41 }, (_, i) => CURRENT_YEAR - i)

const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.rtf,.txt,.jpg,.jpeg,.png'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

// ══════════════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════════════

/** Format bytes to human-readable string */
function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Format "2020-03-01" to "Mar 2020" */
function formatMonthYear(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return `${MONTHS[d.getMonth()]?.slice(0, 3)} ${d.getFullYear()}`
}

/** Format date string to "20 Mar 2024" */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Calculate profile completeness percentage */
function calcCompleteness(
  member: MemberProfile | null,
  workExps: WorkExperience[],
  eduRecords: EducationRecord[],
  languages: MemberLanguage[],
  documents: MemberDocument[],
): { percent: number; hint: string } {
  if (!member) return { percent: 0, hint: 'Load your profile to get started' }

  let score = 0
  const total = 10

  // 1. Name
  if (member.first_name && member.last_name) score++
  // 2. Headline
  if (member.headline) score++
  // 3. Location
  if (member.city && member.country) score++
  // 4. Professional summary
  if (member.job_title && member.seniority) score++
  // 5. Work experience
  if (workExps.length > 0) score++
  // 6. Education
  if (eduRecords.length > 0) score++
  // 7. Languages
  if (languages.length > 0) score++
  // 8. Skills
  if (member.key_skills && member.key_skills.length > 0) score++
  // 9. Luxury profile
  if (member.product_categories && member.product_categories.length > 0) score++
  // 10. Documents (CV)
  if (documents.length > 0) score++

  const percent = Math.round((score / total) * 100)

  // Generate hint for next step
  let hint = ''
  if (!member.first_name || !member.last_name) hint = 'Add your full name to get started'
  else if (!member.headline) hint = 'Add a headline to stand out to recruiters'
  else if (!member.city || !member.country) hint = 'Add your location'
  else if (!member.job_title || !member.seniority) hint = 'Complete your professional summary'
  else if (workExps.length === 0) hint = 'Add your work experience to reach ' + Math.round(((score + 1) / total) * 100) + '%'
  else if (eduRecords.length === 0) hint = 'Add your education background'
  else if (languages.length === 0) hint = 'Add your language skills'
  else if (!member.key_skills || member.key_skills.length === 0) hint = 'Add your key skills'
  else if (!member.product_categories || member.product_categories.length === 0) hint = 'Complete your luxury profile'
  else if (documents.length === 0) hint = 'Upload your CV to complete your profile'
  else hint = 'Your profile is complete!'

  return { percent, hint }
}

// ══════════════════════════════════════════════════════════════════════
// Inline Sub-Components
// ══════════════════════════════════════════════════════════════════════

/** Collapsible form section with gold title and chevron */
function FormSection({
  title,
  defaultOpen = false,
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
      <div className="mx-6 border-t border-[#e8e2d8]" />
      {open && <div className="px-6 pb-6 pt-5">{children}</div>}
    </div>
  )
}

/** Styled toggle switch */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  label?: string
}) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <div
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-[#a58e28]' : 'bg-[#ddd]'
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      {label && <span className="font-sans text-sm text-[#1a1a1a]">{label}</span>}
    </label>
  )
}

/** Multi-select checkbox grid */
function CheckboxGrid({
  options,
  selected,
  onChange,
  columns = 3,
}: {
  options: readonly string[]
  selected: string[]
  onChange: (val: string[]) => void
  columns?: number
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-2 cursor-pointer font-sans text-sm text-[#1a1a1a] py-1"
        >
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className="w-4 h-4 accent-[#a58e28]"
          />
          <span className="leading-tight">{opt}</span>
        </label>
      ))}
    </div>
  )
}

/** Tag input — type and press Enter to add, x to remove */
function TagInput({
  tags,
  onChange,
  placeholder = 'Type and press Enter...',
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = input.trim()
      if (val && !tags.includes(val)) {
        onChange([...tags, val])
      }
      setInput('')
    }
    // Remove last tag on backspace when input is empty
    if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const remove = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="border border-[#e8e2d8] bg-white p-2 flex flex-wrap gap-2 min-h-[44px] focus-within:border-[#1a1a1a] transition-colors">
      {tags.map((tag) => (
        <span
          key={tag}
          className="jl-badge jl-badge-gold inline-flex items-center gap-1 text-[0.6rem]"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            className="ml-0.5 text-[#1a1a1a] hover:text-red-600 font-bold leading-none min-h-0 min-w-0"
            aria-label={`Remove ${tag}`}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] border-none outline-none bg-transparent font-sans text-sm p-1"
      />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// Work Experience Form State
// ══════════════════════════════════════════════════════════════════════

interface WorkExpForm {
  id?: string
  job_title: string
  company: string
  city: string
  country: string
  start_month: string
  start_year: string
  end_month: string
  end_year: string
  is_current: boolean
  department: string
  description: string
  reason_for_leaving: string
}

const emptyWorkExp: WorkExpForm = {
  job_title: '', company: '', city: '', country: '',
  start_month: '', start_year: '', end_month: '', end_year: '',
  is_current: false, department: '', description: '', reason_for_leaving: '',
}

// ══════════════════════════════════════════════════════════════════════
// Education Form State
// ══════════════════════════════════════════════════════════════════════

interface EduForm {
  id?: string
  institution: string
  degree_level: string
  field_of_study: string
  city: string
  country: string
  start_year: string
  graduation_year: string
}

const emptyEdu: EduForm = {
  institution: '', degree_level: '', field_of_study: '',
  city: '', country: '', start_year: '', graduation_year: '',
}

// ══════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════

export default function ProfileClient({ email }: { email: string }) {
  // ── Core state ───────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // ── Profile data ─────────────────────────────────────────────────
  const [member, setMember] = useState<MemberProfile | null>(null)
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([])
  const [educationRecords, setEducationRecords] = useState<EducationRecord[]>([])
  const [languages, setLanguages] = useState<MemberLanguage[]>([])
  const [documents, setDocuments] = useState<MemberDocument[]>([])

  // ── Section 1: Personal Information ──────────────────────────────
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [nationality, setNationality] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')

  // ── Section 2: Professional Summary ──────────────────────────────
  const [jobTitle, setJobTitle] = useState('')
  const [currentEmployer, setCurrentEmployer] = useState('')
  const [totalYearsExp, setTotalYearsExp] = useState('')
  const [yearsInLuxury, setYearsInLuxury] = useState('')
  const [seniority, setSeniority] = useState('')
  const [department, setDepartment] = useState('')

  // ── Section 3: Work Experience (inline form) ─────────────────────
  const [showWorkForm, setShowWorkForm] = useState(false)
  const [workForm, setWorkForm] = useState<WorkExpForm>(emptyWorkExp)
  const [savingWork, setSavingWork] = useState(false)

  // ── Section 4: Education (inline form) ───────────────────────────
  const [showEduForm, setShowEduForm] = useState(false)
  const [eduForm, setEduForm] = useState<EduForm>(emptyEdu)
  const [savingEdu, setSavingEdu] = useState(false)

  // ── Section 5: Skills & Languages ────────────────────────────────
  const [keySkills, setKeySkills] = useState<string[]>([])
  const [softwareTools, setSoftwareTools] = useState<string[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [newLang, setNewLang] = useState('')
  const [newLangProf, setNewLangProf] = useState('')
  const [savingLang, setSavingLang] = useState(false)

  // ── Section 6: Luxury Profile ────────────────────────────────────
  const [productCategories, setProductCategories] = useState<string[]>([])
  const [brandsWorkedWith, setBrandsWorkedWith] = useState<string[]>([])
  const [clientSegments, setClientSegments] = useState<string[]>([])
  const [marketKnowledge, setMarketKnowledge] = useState<string[]>([])
  const [clientelingExp, setClientelingExp] = useState(false)
  const [clientelingDesc, setClientelingDesc] = useState('')

  // ── Section 7: Availability & Preferences ────────────────────────
  const [availability, setAvailability] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [salaryCurrency, setSalaryCurrency] = useState('EUR')
  const [openToRelocation, setOpenToRelocation] = useState(false)
  const [relocationPrefs, setRelocationPrefs] = useState('')
  const [desiredLocations, setDesiredLocations] = useState<string[]>([])
  const [desiredContractTypes, setDesiredContractTypes] = useState<string[]>([])
  const [desiredDepartments, setDesiredDepartments] = useState<string[]>([])

  // ── Section 8: Documents ─────────────────────────────────────────
  const [uploadType, setUploadType] = useState('cv')
  const [uploadLabel, setUploadLabel] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Photo Upload ───────────────────────────────────────────────
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // ── Opportunity Preferences ─────────────────────────────────────
  const [prefSectors, setPrefSectors] = useState<string[]>([])
  const [prefSeniority, setPrefSeniority] = useState<string[]>([])
  const [prefDepts, setPrefDepts] = useState<string[]>([])
  const [prefContracts, setPrefContracts] = useState<string[]>([])
  const [prefRemote, setPrefRemote] = useState(false)
  const [prefInternships, setPrefInternships] = useState(false)
  const [prefMinSalary, setPrefMinSalary] = useState('')
  const [prefSalaryCurrency, setPrefSalaryCurrency] = useState('EUR')
  const [prefAlerts, setPrefAlerts] = useState(false)
  const [prefAlertFreq, setPrefAlertFreq] = useState('weekly')
  const [savingPrefs, setSavingPrefs] = useState(false)

  // ── Business Profile ──────────────────────────────────────────
  const [companyName, setCompanyName] = useState('')
  const [companySector, setCompanySector] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [hiringLocations, setHiringLocations] = useState('')
  const [typicalRoles, setTypicalRoles] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [hiringDepartments, setHiringDepartments] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [savingBusiness, setSavingBusiness] = useState(false)

  // ── Résumé Settings ────────────────────────────────────────────
  const [resumePublic, setResumePublic] = useState(false)
  const [resumeSlug, setResumeSlug] = useState<string | null>(null)
  const [resumeHeadline, setResumeHeadline] = useState('')
  const [resumeShowEmail, setResumeShowEmail] = useState(false)
  const [resumeShowPhone, setResumeShowPhone] = useState(false)
  const [savingResume, setSavingResume] = useState(false)
  const [resumeCopied, setResumeCopied] = useState(false)

  // ══════════════════════════════════════════════════════════════════
  // Toast helper
  // ══════════════════════════════════════════════════════════════════

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }, [])

  // ══════════════════════════════════════════════════════════════════
  // Data Loading
  // ══════════════════════════════════════════════════════════════════

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/members/profile?email=${encodeURIComponent(email)}`)
        const data = await res.json()

        if (data.member) {
          const m: MemberProfile = data.member
          setMember(m)

          // Section 1
          setFirstName(m.first_name || '')
          setLastName(m.last_name || '')
          setHeadline(m.headline || '')
          setBio(m.bio || '')
          setPhone(m.phone || '')
          setCity(m.city || '')
          setCountry(m.country || '')
          setNationality(m.nationality || '')
          setLinkedinUrl(m.linkedin_url || '')

          // Section 2
          setJobTitle(m.job_title || '')
          setCurrentEmployer(m.current_employer || '')
          setTotalYearsExp(m.total_years_experience != null ? String(m.total_years_experience) : '')
          setYearsInLuxury(m.years_in_luxury != null ? String(m.years_in_luxury) : '')
          setSeniority(m.seniority || '')
          setDepartment(m.department || '')

          // Section 5 (skills)
          setKeySkills(m.key_skills || [])
          setSoftwareTools(m.software_tools || [])
          setCertifications(m.certifications || [])

          // Section 6
          setProductCategories(m.product_categories || [])
          setBrandsWorkedWith(m.brands_worked_with || [])
          setClientSegments(m.client_segment_experience || [])
          setMarketKnowledge(m.market_knowledge || [])
          setClientelingExp(m.clienteling_experience || false)
          setClientelingDesc(m.clienteling_description || '')

          // Section 7
          setAvailability(m.availability || '')
          setSalaryMin(m.desired_salary_min != null ? String(m.desired_salary_min) : '')
          setSalaryMax(m.desired_salary_max != null ? String(m.desired_salary_max) : '')
          setSalaryCurrency(m.desired_salary_currency || 'EUR')
          setOpenToRelocation(m.open_to_relocation || false)
          setRelocationPrefs(m.relocation_preferences || '')
          setDesiredLocations(m.desired_locations || [])
          setDesiredContractTypes(m.desired_contract_types || [])
          setDesiredDepartments(m.desired_departments || [])

          // Avatar
          setAvatarUrl((m as any).avatar_url || null)

          // Business fields
          setCompanyName((m as any).company_name || '')
          setCompanySector((m as any).company_sector || '')
          setCompanyDescription((m as any).company_description || '')
          setHiringLocations((m as any).hiring_locations || '')
          setTypicalRoles((m as any).typical_roles || '')
          setTeamSize((m as any).team_size || '')
          setHiringDepartments((m as any).hiring_departments || '')
          setContactName((m as any).contact_name || '')
          setContactEmail((m as any).contact_email || '')
          setContactPhone((m as any).contact_phone || '')
        }

        // Related records
        if (data.work_experiences) setWorkExperiences(data.work_experiences)
        if (data.education_records) setEducationRecords(data.education_records)
        if (data.languages) setLanguages(data.languages)
        if (data.documents) setDocuments(data.documents)
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }

    load()

    // Load résumé settings
    fetch('/api/members/resume').then(r => r.json()).then(data => {
      if (data.resume_slug !== undefined) setResumeSlug(data.resume_slug)
      if (data.resume_public !== undefined) setResumePublic(data.resume_public)
      if (data.resume_headline !== undefined) setResumeHeadline(data.resume_headline || '')
      if (data.resume_show_email !== undefined) setResumeShowEmail(data.resume_show_email)
      if (data.resume_show_phone !== undefined) setResumeShowPhone(data.resume_show_phone)
    }).catch(() => {})

    // Load opportunity preferences
    fetch('/api/members/preferences').then(r => r.json()).then(data => {
      if (data && data.preferred_sectors) {
        setPrefSectors(data.preferred_sectors || [])
        setPrefSeniority(data.preferred_seniority || [])
        setPrefDepts(data.preferred_departments || [])
        setPrefContracts(data.preferred_contract_types || [])
        setPrefRemote(data.open_to_remote || false)
        setPrefInternships(data.open_to_internships || false)
        setPrefMinSalary(data.min_salary ? String(data.min_salary) : '')
        setPrefSalaryCurrency(data.salary_currency || 'EUR')
        setPrefAlerts(data.alerts_enabled || false)
        setPrefAlertFreq(data.alert_frequency || 'weekly')
      }
    }).catch(() => {})
  }, [email])

  // ══════════════════════════════════════════════════════════════════
  // Avatar Upload
  // ══════════════════════════════════════════════════════════════════

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('Max 5MB'); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { showToast('JPG, PNG or WebP only'); return }
    setUploadingAvatar(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/members/avatar', { method: 'POST', body: form })
      const data = await res.json()
      if (data.avatar_url) { setAvatarUrl(data.avatar_url); showToast('Photo uploaded') }
    } catch { showToast('Upload failed') }
    setUploadingAvatar(false)
  }

  const handleRemoveAvatar = async () => {
    await fetch('/api/members/avatar', { method: 'DELETE' })
    setAvatarUrl(null)
    showToast('Photo removed')
  }

  // ══════════════════════════════════════════════════════════════════
  // Résumé Settings
  // ══════════════════════════════════════════════════════════════════

  const handleSaveResume = async () => {
    setSavingResume(true)
    try {
      const res = await fetch('/api/members/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_public: resumePublic,
          resume_headline: resumeHeadline,
          resume_show_email: resumeShowEmail,
          resume_show_phone: resumeShowPhone,
        }),
      })
      const data = await res.json()
      if (data.resume_slug) setResumeSlug(data.resume_slug)
      showToast('Résumé settings saved')
    } catch { showToast('Failed to save') }
    setSavingResume(false)
  }

  // ══════════════════════════════════════════════════════════════════
  // Save Opportunity Preferences
  // ══════════════════════════════════════════════════════════════════

  const handleSavePreferences = async () => {
    setSavingPrefs(true)
    try {
      await fetch('/api/members/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferred_sectors: prefSectors,
          preferred_seniority: prefSeniority,
          preferred_departments: prefDepts,
          preferred_contract_types: prefContracts,
          open_to_remote: prefRemote,
          open_to_internships: prefInternships,
          min_salary: prefMinSalary ? parseInt(prefMinSalary) : null,
          salary_currency: prefSalaryCurrency,
          alerts_enabled: prefAlerts,
          alert_frequency: prefAlertFreq,
        }),
      })
      showToast('Preferences saved')
    } catch { showToast('Failed to save preferences') }
    setSavingPrefs(false)
  }

  // ══════════════════════════════════════════════════════════════════
  // Save Profile (Sections 1, 2, 5-skills, 6, 7)
  // ══════════════════════════════════════════════════════════════════

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const payload = {
        email,
        first_name: firstName,
        last_name: lastName,
        headline,
        bio,
        phone,
        city,
        country,
        nationality,
        linkedin_url: linkedinUrl,

        job_title: jobTitle,
        current_employer: currentEmployer,
        total_years_experience: totalYearsExp ? parseInt(totalYearsExp) : null,
        years_in_luxury: yearsInLuxury ? parseInt(yearsInLuxury) : null,
        seniority,
        department,

        key_skills: keySkills,
        software_tools: softwareTools,
        certifications,

        product_categories: productCategories,
        brands_worked_with: brandsWorkedWith,
        client_segment_experience: clientSegments,
        market_knowledge: marketKnowledge,
        clienteling_experience: clientelingExp,
        clienteling_description: clientelingExp ? clientelingDesc : null,

        availability,
        desired_salary_min: salaryMin ? parseInt(salaryMin) : null,
        desired_salary_max: salaryMax ? parseInt(salaryMax) : null,
        desired_salary_currency: salaryCurrency,
        open_to_relocation: openToRelocation,
        relocation_preferences: openToRelocation ? relocationPrefs : null,
        desired_locations: desiredLocations,
        desired_contract_types: desiredContractTypes,
        desired_departments: desiredDepartments,

        // Business fields
        company_name: companyName || null,
        company_sector: companySector || null,
        company_description: companyDescription || null,
        hiring_locations: hiringLocations || null,
        typical_roles: typicalRoles || null,
        team_size: teamSize || null,
        hiring_departments: hiringDepartments || null,
        contact_name: contactName || null,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
      }

      const res = await fetch('/api/members/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.member) setMember(data.member)
        showToast('Profile updated')
      } else {
        showToast('Failed to save profile')
      }
    } catch {
      showToast('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // Work Experience CRUD
  // ══════════════════════════════════════════════════════════════════

  /** Convert form state to API payload */
  const buildWorkExpPayload = (form: WorkExpForm) => ({
    job_title: form.job_title,
    company: form.company,
    city: form.city || null,
    country: form.country || null,
    start_date: form.start_year && form.start_month
      ? `${form.start_year}-${form.start_month.padStart(2, '0')}-01`
      : null,
    end_date: form.is_current
      ? null
      : form.end_year && form.end_month
        ? `${form.end_year}-${form.end_month.padStart(2, '0')}-01`
        : null,
    is_current: form.is_current,
    department: form.department || null,
    description: form.description || null,
    reason_for_leaving: form.is_current ? null : (form.reason_for_leaving || null),
  })

  /** Populate form for editing an existing entry */
  const editWorkExp = (exp: WorkExperience) => {
    const startDate = exp.start_date ? new Date(exp.start_date + 'T00:00:00') : null
    const endDate = exp.end_date ? new Date(exp.end_date + 'T00:00:00') : null

    setWorkForm({
      id: exp.id,
      job_title: exp.job_title,
      company: exp.company,
      city: exp.city || '',
      country: exp.country || '',
      start_month: startDate ? String(startDate.getMonth() + 1) : '',
      start_year: startDate ? String(startDate.getFullYear()) : '',
      end_month: endDate ? String(endDate.getMonth() + 1) : '',
      end_year: endDate ? String(endDate.getFullYear()) : '',
      is_current: exp.is_current,
      department: exp.department || '',
      description: exp.description || '',
      reason_for_leaving: exp.reason_for_leaving || '',
    })
    setShowWorkForm(true)
  }

  const saveWorkExp = async () => {
    setSavingWork(true)
    try {
      const payload = buildWorkExpPayload(workForm)
      const isEdit = !!workForm.id
      const url = isEdit
        ? `/api/members/work-experience/${workForm.id}`
        : '/api/members/work-experience'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, email }),
      })

      if (res.ok) {
        const data = await res.json()
        if (isEdit) {
          setWorkExperiences((prev) =>
            prev.map((w) => (w.id === workForm.id ? data.work_experience : w))
          )
          showToast('Experience updated')
        } else {
          setWorkExperiences((prev) => [...prev, data.work_experience])
          showToast('Experience added')
        }
        setWorkForm(emptyWorkExp)
        setShowWorkForm(false)
      } else {
        showToast('Failed to save experience')
      }
    } catch {
      showToast('Failed to save experience')
    } finally {
      setSavingWork(false)
    }
  }

  const deleteWorkExp = async (id: string) => {
    if (!confirm('Delete this experience?')) return
    try {
      const res = await fetch(`/api/members/work-experience/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setWorkExperiences((prev) => prev.filter((w) => w.id !== id))
        showToast('Experience deleted')
      }
    } catch {
      showToast('Failed to delete experience')
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // Education CRUD
  // ══════════════════════════════════════════════════════════════════

  const editEdu = (edu: EducationRecord) => {
    setEduForm({
      id: edu.id,
      institution: edu.institution,
      degree_level: edu.degree_level,
      field_of_study: edu.field_of_study,
      city: edu.city || '',
      country: edu.country || '',
      start_year: edu.start_year != null ? String(edu.start_year) : '',
      graduation_year: edu.graduation_year != null ? String(edu.graduation_year) : '',
    })
    setShowEduForm(true)
  }

  const saveEdu = async () => {
    setSavingEdu(true)
    try {
      const payload = {
        email,
        institution: eduForm.institution,
        degree_level: eduForm.degree_level,
        field_of_study: eduForm.field_of_study,
        city: eduForm.city || null,
        country: eduForm.country || null,
        start_year: eduForm.start_year ? parseInt(eduForm.start_year) : null,
        graduation_year: eduForm.graduation_year ? parseInt(eduForm.graduation_year) : null,
      }

      const isEdit = !!eduForm.id
      const url = isEdit
        ? `/api/members/education/${eduForm.id}`
        : '/api/members/education'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        if (isEdit) {
          setEducationRecords((prev) =>
            prev.map((e) => (e.id === eduForm.id ? data.education : e))
          )
          showToast('Education updated')
        } else {
          setEducationRecords((prev) => [...prev, data.education])
          showToast('Education added')
        }
        setEduForm(emptyEdu)
        setShowEduForm(false)
      } else {
        showToast('Failed to save education')
      }
    } catch {
      showToast('Failed to save education')
    } finally {
      setSavingEdu(false)
    }
  }

  const deleteEdu = async (id: string) => {
    if (!confirm('Delete this education entry?')) return
    try {
      const res = await fetch(`/api/members/education/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setEducationRecords((prev) => prev.filter((e) => e.id !== id))
        showToast('Education deleted')
      }
    } catch {
      showToast('Failed to delete education')
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // Languages CRUD
  // ══════════════════════════════════════════════════════════════════

  const addLanguage = async () => {
    if (!newLang || !newLangProf) return
    setSavingLang(true)
    try {
      const res = await fetch('/api/members/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language: newLang, proficiency: newLangProf }),
      })
      if (res.ok) {
        const data = await res.json()
        setLanguages((prev) => [...prev, data.language])
        setNewLang('')
        setNewLangProf('')
        showToast('Language added')
      }
    } catch {
      showToast('Failed to add language')
    } finally {
      setSavingLang(false)
    }
  }

  const deleteLanguage = async (id: string) => {
    try {
      const res = await fetch(`/api/members/languages/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setLanguages((prev) => prev.filter((l) => l.id !== id))
        showToast('Language removed')
      }
    } catch {
      showToast('Failed to remove language')
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // Documents CRUD
  // ══════════════════════════════════════════════════════════════════

  const uploadDocument = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      showToast('File too large. Maximum 10 MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('email', email)
      formData.append('document_type', uploadType)
      if (uploadLabel) formData.append('label', uploadLabel)

      const res = await fetch('/api/members/documents', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setDocuments((prev) => [...prev, data.document])
        showToast('Document uploaded')
        // Reset
        if (fileInputRef.current) fileInputRef.current.value = ''
        setUploadLabel('')
      } else {
        showToast('Failed to upload document')
      }
    } catch {
      showToast('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const deleteDocument = async (id: string) => {
    if (!confirm('Delete this document?')) return
    try {
      const res = await fetch(`/api/members/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id))
        showToast('Document deleted')
      }
    } catch {
      showToast('Failed to delete document')
    }
  }

  const isBusiness = member && ['business'].includes((member as any).role || '')

  // ══════════════════════════════════════════════════════════════════
  // Profile Completeness
  // ══════════════════════════════════════════════════════════════════

  const { percent: completeness, hint: completenessHint } = calcCompleteness(
    member,
    workExperiences,
    educationRecords,
    languages,
    documents,
  )

  // ══════════════════════════════════════════════════════════════════
  // Loading State
  // ══════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="jl-container py-20 text-center">
        <p className="font-sans text-sm text-[#888]">Loading your profile...</p>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════════════════════════

  return (
    <div className="bg-[#f8f7f4] min-h-screen">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200/60 py-8 lg:py-10">
        <div className="jl-container">
          <div className="lg:flex lg:items-end lg:justify-between">
            <div>
              <div className="jl-overline-gold mb-2">Your Profile</div>
              <div className="flex items-center gap-4">
                {/* Avatar circle */}
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[#a58e28]/10 flex items-center justify-center flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xl lg:text-2xl font-medium text-[#a58e28]">
                      {(firstName || 'J')[0]}{(lastName || 'L')[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="jl-serif text-2xl md:text-3xl font-light text-[#1a1a1a]">
                    {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Complete Your Profile'}
                  </h1>
                  {headline && (
                    <p className="font-sans text-sm text-[#999] mt-1">{headline}</p>
                  )}
                  {(city || country) && (
                    <p className="font-sans text-xs text-[#999] mt-0.5">{[city, country].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 lg:mt-0">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-sm text-[#a58e28] hover:text-[#7a6a1e] font-medium transition-colors"
              >
                &larr; Dashboard
              </Link>
            </div>
          </div>

          {/* Mobile: Profile Completeness Bar (hidden on desktop — moves to sidebar) */}
          <div className="mt-6 lg:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-xs font-medium text-[#1a1a1a]">
                {completeness}% complete
              </span>
            </div>
            <div className="h-2 bg-[#e8e2d8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#a58e28] transition-all duration-500 rounded-full"
                style={{ width: `${completeness}%` }}
              />
            </div>
            {completeness < 100 && (
              <p className="font-sans text-xs text-[#888] mt-2 italic">{completenessHint}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content — Two columns on desktop ──────────────── */}
      <div className="jl-container py-8 lg:py-10">
        <div className="lg:grid lg:grid-cols-[1fr_340px] gap-8">
        {/* LEFT — Profile form sections */}
        <div>

          {/* ════════════════════════════════════════════════════ */}
          {/* Section 1 — Personal Information                    */}
          {/* ════════════════════════════════════════════════════ */}
          <FormSection title="Personal Information" defaultOpen={true}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="jl-label">First Name *</label>
                  <input
                    className="jl-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="jl-label">Last Name *</label>
                  <input
                    className="jl-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="jl-label">Headline</label>
                <input
                  className="jl-input"
                  placeholder="e.g. Senior Retail Director | 15 years luxury"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>

              <div>
                <label className="jl-label">Bio</label>
                <textarea
                  className="jl-input resize-none"
                  rows={4}
                  placeholder="A brief introduction about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div>
                <label className="jl-label">Email</label>
                <input
                  className="jl-input bg-[#fafaf5] text-[#888] cursor-not-allowed"
                  value={email}
                  readOnly
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="jl-label">Phone</label>
                  <input
                    className="jl-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="jl-label">Nationality</label>
                  <input
                    className="jl-input"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="jl-label">City</label>
                  <input
                    className="jl-input"
                    list="cities-list"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <datalist id="cities-list">
                    {COMMON_CITIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="jl-label">Country</label>
                  <select
                    className="jl-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="jl-label">LinkedIn URL</label>
                <input
                  className="jl-input"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>
            </div>
          </FormSection>

          {/* ════════════════════════════════════════════════════ */}
          {/* BUSINESS PROFILE SECTIONS                           */}
          {/* ════════════════════════════════════════════════════ */}
          {isBusiness && (
            <>
              <FormSection title="Company Information" defaultOpen={true}>
                <div className="space-y-5">
                  <div>
                    <label className="jl-label">Company Name *</label>
                    <input className="jl-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  </div>
                  <div>
                    <label className="jl-label">Sector *</label>
                    <select className="jl-select" value={companySector} onChange={(e) => setCompanySector(e.target.value)}>
                      <option value="">Select sector</option>
                      {['Fashion & leather goods', 'Watches & jewellery', 'Perfumes & cosmetics', 'Wines & spirits', 'Hospitality & travel', 'Automotive', 'Aviation & yachting', 'Real estate', 'Design', 'Art & auction houses', 'Media & publishing', 'Technology for luxury', 'Multi-sector group', 'Recruitment agency'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="jl-label">Company Description</label>
                    <textarea className="jl-input min-h-[80px]" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} placeholder="Brief description of your company" />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Hiring Details">
                <div className="space-y-5">
                  <div>
                    <label className="jl-label">Hiring Locations</label>
                    <input className="jl-input" value={hiringLocations} onChange={(e) => setHiringLocations(e.target.value)} placeholder="e.g. Paris, London, New York" />
                  </div>
                  <div>
                    <label className="jl-label">Typical Roles Hired</label>
                    <input className="jl-input" value={typicalRoles} onChange={(e) => setTypicalRoles(e.target.value)} placeholder="e.g. Store Directors, Buyers, Marketing Managers" />
                  </div>
                  <div>
                    <label className="jl-label">Team Size</label>
                    <input className="jl-input" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} placeholder="e.g. 50–200" />
                  </div>
                  <div>
                    <label className="jl-label">Departments Hiring For</label>
                    <input className="jl-input" value={hiringDepartments} onChange={(e) => setHiringDepartments(e.target.value)} placeholder="e.g. Retail, Marketing, Digital" />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Contact Information">
                <div className="space-y-5">
                  <div>
                    <label className="jl-label">Primary Contact Name</label>
                    <input className="jl-input" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                  </div>
                  <div>
                    <label className="jl-label">Email</label>
                    <input className="jl-input" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="jl-label">Phone</label>
                    <input className="jl-input" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                  </div>
                </div>
              </FormSection>
            </>
          )}

          {/* ════════════════════════════════════════════════════ */}
          {/* CANDIDATE PROFILE SECTIONS (hidden for business)    */}
          {/* ════════════════════════════════════════════════════ */}
          {!isBusiness && (
          <>
          {/* ════════════════════════════════════════════════════ */}
          {/* Section 2 — Professional Summary                    */}
          {/* ════════════════════════════════════════════════════ */}
          <FormSection title="Professional Summary">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="jl-label">Current Job Title</label>
                  <input
                    className="jl-input"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="jl-label">Current Employer</label>
                  <input
                    className="jl-input"
                    value={currentEmployer}
                    onChange={(e) => setCurrentEmployer(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="jl-label">Total Years Experience</label>
                  <input
                    className="jl-input"
                    type="number"
                    min="0"
                    max="60"
                    value={totalYearsExp}
                    onChange={(e) => setTotalYearsExp(e.target.value)}
                  />
                </div>
                <div>
                  <label className="jl-label">Years in Luxury</label>
                  <input
                    className="jl-input"
                    type="number"
                    min="0"
                    max="60"
                    value={yearsInLuxury}
                    onChange={(e) => setYearsInLuxury(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="jl-label">Seniority Level</label>
                  <select
                    className="jl-input"
                    value={seniority}
                    onChange={(e) => setSeniority(e.target.value)}
                  >
                    <option value="">Select seniority...</option>
                    {SENIORITY_LEVELS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="jl-label">Department</label>
                  <select
                    className="jl-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">Select department...</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </FormSection>

          {/* ════════════════════════════════════════════════════ */}
          {/* Section 3 — Work Experience                         */}
          {/* ════════════════════════════════════════════════════ */}
          <FormSection title="Work Experience">
            {/* Existing entries */}
            {workExperiences.length > 0 && (
              <div className="space-y-4 mb-6">
                {workExperiences.map((exp) => (
                  <div key={exp.id} className="jl-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-sans text-sm font-semibold text-[#1a1a1a]">
                          {exp.job_title}
                        </h3>
                        <p className="font-sans text-sm text-[#999] mt-0.5">
                          {exp.company}
                          {(exp.city || exp.country) && (
                            <span className="text-[#999]">
                              {' '}&middot; {[exp.city, exp.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </p>
                        <p className="font-sans text-xs text-[#888] mt-1">
                          {formatMonthYear(exp.start_date)} &ndash;{' '}
                          {exp.is_current ? 'Present' : formatMonthYear(exp.end_date)}
                        </p>
                        {exp.department && (
                          <span className="jl-badge jl-badge-outline mt-2 text-[0.55rem]">
                            {exp.department}
                          </span>
                        )}
                        {exp.description && (
                          <p className="font-sans text-xs text-[#888] mt-2 line-clamp-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <button
                          type="button"
                          onClick={() => editWorkExp(exp)}
                          className="font-sans text-xs text-[#a58e28] hover:underline min-h-0 min-w-0"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteWorkExp(exp.id)}
                          className="font-sans text-xs text-red-500 hover:underline min-h-0 min-w-0"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inline form */}
            {showWorkForm ? (
              <div className="border border-[#e8e2d8] bg-[#fafaf5] p-5 space-y-4">
                <div className="jl-section-label">
                  <span>{workForm.id ? 'Edit Experience' : 'Add Experience'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Job Title *</label>
                    <input
                      className="jl-input"
                      value={workForm.job_title}
                      onChange={(e) => setWorkForm({ ...workForm, job_title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="jl-label">Company *</label>
                    <input
                      className="jl-input"
                      value={workForm.company}
                      onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">City</label>
                    <input
                      className="jl-input"
                      value={workForm.city}
                      onChange={(e) => setWorkForm({ ...workForm, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="jl-label">Country</label>
                    <select
                      className="jl-input"
                      value={workForm.country}
                      onChange={(e) => setWorkForm({ ...workForm, country: e.target.value })}
                    >
                      <option value="">Select country...</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="jl-label">Start Date</label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      className="jl-input"
                      value={workForm.start_month}
                      onChange={(e) => setWorkForm({ ...workForm, start_month: e.target.value })}
                    >
                      <option value="">Month...</option>
                      {MONTHS.map((m, i) => (
                        <option key={m} value={String(i + 1)}>{m}</option>
                      ))}
                    </select>
                    <select
                      className="jl-input"
                      value={workForm.start_year}
                      onChange={(e) => setWorkForm({ ...workForm, start_year: e.target.value })}
                    >
                      <option value="">Year...</option>
                      {YEARS.map((y) => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Current toggle */}
                <Toggle
                  checked={workForm.is_current}
                  onChange={(val) => setWorkForm({ ...workForm, is_current: val })}
                  label="I currently work here"
                />

                {/* End Date (disabled when current) */}
                {!workForm.is_current && (
                  <div>
                    <label className="jl-label">End Date</label>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        className="jl-input"
                        value={workForm.end_month}
                        onChange={(e) => setWorkForm({ ...workForm, end_month: e.target.value })}
                      >
                        <option value="">Month...</option>
                        {MONTHS.map((m, i) => (
                          <option key={m} value={String(i + 1)}>{m}</option>
                        ))}
                      </select>
                      <select
                        className="jl-input"
                        value={workForm.end_year}
                        onChange={(e) => setWorkForm({ ...workForm, end_year: e.target.value })}
                      >
                        <option value="">Year...</option>
                        {YEARS.map((y) => (
                          <option key={y} value={String(y)}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="jl-label">Department</label>
                  <select
                    className="jl-input"
                    value={workForm.department}
                    onChange={(e) => setWorkForm({ ...workForm, department: e.target.value })}
                  >
                    <option value="">Select department...</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="jl-label">Description</label>
                  <textarea
                    className="jl-input resize-none"
                    rows={3}
                    value={workForm.description}
                    onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                  />
                </div>

                {/* Reason for leaving — only when not current */}
                {!workForm.is_current && (
                  <div>
                    <label className="jl-label">Reason for Leaving</label>
                    <select
                      className="jl-input"
                      value={workForm.reason_for_leaving}
                      onChange={(e) => setWorkForm({ ...workForm, reason_for_leaving: e.target.value })}
                    >
                      <option value="">Select reason...</option>
                      {REASONS_FOR_LEAVING.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={saveWorkExp}
                    disabled={savingWork || !workForm.job_title || !workForm.company}
                    className="jl-btn jl-btn-primary disabled:opacity-40"
                  >
                    {savingWork ? 'Saving...' : workForm.id ? 'Update Experience' : 'Save Experience'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowWorkForm(false); setWorkForm(emptyWorkExp) }}
                    className="jl-btn jl-btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setWorkForm(emptyWorkExp); setShowWorkForm(true) }}
                className="jl-btn jl-btn-gold"
              >
                + Add Experience
              </button>
            )}
          </FormSection>

          {/* ════════════════════════════════════════════════════ */}
          {/* Section 4 — Education                               */}
          {/* ════════════════════════════════════════════════════ */}
          <FormSection title="Education">
            {/* Existing entries */}
            {educationRecords.length > 0 && (
              <div className="space-y-4 mb-6">
                {educationRecords.map((edu) => (
                  <div key={edu.id} className="jl-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-sans text-sm font-semibold text-[#1a1a1a]">
                          {edu.institution}
                        </h3>
                        <p className="font-sans text-sm text-[#999] mt-0.5">
                          {edu.degree_level} &mdash; {edu.field_of_study}
                        </p>
                        <p className="font-sans text-xs text-[#888] mt-1">
                          {edu.start_year && edu.graduation_year
                            ? `${edu.start_year} – ${edu.graduation_year}`
                            : edu.graduation_year
                              ? `Graduated ${edu.graduation_year}`
                              : edu.start_year
                                ? `Started ${edu.start_year}`
                                : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <button
                          type="button"
                          onClick={() => editEdu(edu)}
                          className="font-sans text-xs text-[#a58e28] hover:underline min-h-0 min-w-0"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEdu(edu.id)}
                          className="font-sans text-xs text-red-500 hover:underline min-h-0 min-w-0"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inline form */}
            {showEduForm ? (
              <div className="border border-[#e8e2d8] bg-[#fafaf5] p-5 space-y-4">
                <div className="jl-section-label">
                  <span>{eduForm.id ? 'Edit Education' : 'Add Education'}</span>
                </div>

                <div>
                  <label className="jl-label">Institution *</label>
                  <input
                    className="jl-input"
                    value={eduForm.institution}
                    onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Degree Level *</label>
                    <select
                      className="jl-input"
                      value={eduForm.degree_level}
                      onChange={(e) => setEduForm({ ...eduForm, degree_level: e.target.value })}
                    >
                      <option value="">Select degree...</option>
                      {DEGREE_LEVELS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="jl-label">Field of Study *</label>
                    <input
                      className="jl-input"
                      value={eduForm.field_of_study}
                      onChange={(e) => setEduForm({ ...eduForm, field_of_study: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">City</label>
                    <input
                      className="jl-input"
                      value={eduForm.city}
                      onChange={(e) => setEduForm({ ...eduForm, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="jl-label">Country</label>
                    <select
                      className="jl-input"
                      value={eduForm.country}
                      onChange={(e) => setEduForm({ ...eduForm, country: e.target.value })}
                    >
                      <option value="">Select country...</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Start Year</label>
                    <input
                      className="jl-input"
                      type="number"
                      min={CURRENT_YEAR - 40}
                      max={CURRENT_YEAR}
                      value={eduForm.start_year}
                      onChange={(e) => setEduForm({ ...eduForm, start_year: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="jl-label">Graduation Year</label>
                    <input
                      className="jl-input"
                      type="number"
                      min={CURRENT_YEAR - 40}
                      max={CURRENT_YEAR + 5}
                      value={eduForm.graduation_year}
                      onChange={(e) => setEduForm({ ...eduForm, graduation_year: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={saveEdu}
                    disabled={savingEdu || !eduForm.institution || !eduForm.degree_level || !eduForm.field_of_study}
                    className="jl-btn jl-btn-primary disabled:opacity-40"
                  >
                    {savingEdu ? 'Saving...' : eduForm.id ? 'Update Education' : 'Save Education'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowEduForm(false); setEduForm(emptyEdu) }}
                    className="jl-btn jl-btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setEduForm(emptyEdu); setShowEduForm(true) }}
                className="jl-btn jl-btn-gold"
              >
                + Add Education
              </button>
            )}
          </FormSection>

          {/* ════════════════════════════════════════════════════ */}
          {/* Section 5 — Skills & Languages                      */}
          {/* ════════════════════════════════════════════════════ */}
          <FormSection title="Skills & Languages">
            {/* Languages sub-section */}
            <div className="mb-8">
              <div className="jl-section-label"><span>Languages</span></div>

              {/* Current languages */}
              {languages.length > 0 && (
                <div className="space-y-2 mb-4">
                  {languages.map((lang) => (
                    <div
                      key={lang.id}
                      className="flex items-center justify-between py-2 border-b border-[#f0ece4]"
                    >
                      <span className="font-sans text-sm text-[#1a1a1a]">
                        {lang.language}{' '}
                        <span className="jl-badge jl-badge-outline text-[0.55rem] ml-2">
                          {lang.proficiency}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteLanguage(lang.id)}
                        className="text-[#888] hover:text-red-500 font-bold text-sm min-h-0 min-w-0 leading-none"
                        aria-label={`Remove ${lang.language}`}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add language row */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="jl-label">Language</label>
                  <select
                    className="jl-input"
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                  >
                    <option value="">Select language...</option>
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="jl-label">Proficiency</label>
                  <select
                    className="jl-input"
                    value={newLangProf}
                    onChange={(e) => setNewLangProf(e.target.value)}
                  >
                    <option value="">Select level...</option>
                    {LANGUAGE_PROFICIENCIES.map((lp) => (
                      <option key={lp.value} value={lp.value}>{lp.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={addLanguage}
                  disabled={savingLang || !newLang || !newLangProf}
                  className="jl-btn jl-btn-gold disabled:opacity-40"
                >
                  {savingLang ? '...' : 'Add'}
                </button>
              </div>
            </div>

            {/* Skills sub-section */}
            <div className="space-y-5">
              <div className="jl-section-label"><span>Skills</span></div>

              <div>
                <label className="jl-label">Key Skills</label>
                <TagInput
                  tags={keySkills}
                  onChange={setKeySkills}
                  placeholder="e.g. Client Relations, Visual Merchandising..."
                />
              </div>

              <div>
                <label className="jl-label">Software & Tools</label>
                <TagInput
                  tags={softwareTools}
                  onChange={setSoftwareTools}
                  placeholder="e.g. SAP, Salesforce, Adobe Suite..."
                />
              </div>

              <div>
                <label className="jl-label">Certifications</label>
                <TagInput
                  tags={certifications}
                  onChange={setCertifications}
                  placeholder="e.g. GIA Graduate Gemologist, Project Management Professional..."
                />
              </div>

              <p className="font-sans text-xs text-[#888] italic">
                Skills save with the main &ldquo;Save Profile&rdquo; button below.
              </p>
            </div>
          </FormSection>

          {/* ════════════════════════════════════════════════════ */}
          {/* Section 6 — Luxury Profile                          */}
          {/* ════════════════════════════════════════════════════ */}
          <FormSection title="Luxury Profile">
            <div className="space-y-6">
              <div>
                <label className="jl-label mb-3">Product Categories</label>
                <CheckboxGrid
                  options={PRODUCT_CATEGORIES}
                  selected={productCategories}
                  onChange={setProductCategories}
                  columns={3}
                />
              </div>

              <div>
                <label className="jl-label">Brands Worked With</label>
                <TagInput
                  tags={brandsWorkedWith}
                  onChange={setBrandsWorkedWith}
                  placeholder="e.g. Chanel, Hermes, Louis Vuitton..."
                />
              </div>

              <div>
                <label className="jl-label mb-3">Client Segment Experience</label>
                <CheckboxGrid
                  options={CLIENT_SEGMENTS}
                  selected={clientSegments}
                  onChange={setClientSegments}
                  columns={2}
                />
              </div>

              <div>
                <label className="jl-label mb-3">Market Knowledge</label>
                <CheckboxGrid
                  options={MARKET_REGIONS}
                  selected={marketKnowledge}
                  onChange={setMarketKnowledge}
                  columns={3}
                />
              </div>

              <div>
                <Toggle
                  checked={clientelingExp}
                  onChange={setClientelingExp}
                  label="Clienteling Experience"
                />
                {clientelingExp && (
                  <div className="mt-3">
                    <label className="jl-label">Describe your clienteling experience</label>
                    <textarea
                      className="jl-input resize-none"
                      rows={3}
                      value={clientelingDesc}
                      onChange={(e) => setClientelingDesc(e.target.value)}
                      placeholder="e.g. Managed a portfolio of 200+ UHNW clients..."
                    />
                  </div>
                )}
              </div>
            </div>
          </FormSection>

          {/* ════════════════════════════════════════════════════ */}
          {/* Section 7 — Availability & Preferences              */}
          {/* ════════════════════════════════════════════════════ */}
          <FormSection title="Availability & Preferences">
            <div className="space-y-5">
              <div>
                <label className="jl-label">Availability</label>
                <select
                  className="jl-input"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <option value="">Select availability...</option>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="jl-label">Desired Salary</label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    className="jl-input"
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                  />
                  <input
                    className="jl-input"
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                  />
                  <select
                    className="jl-input"
                    value={salaryCurrency}
                    onChange={(e) => setSalaryCurrency(e.target.value)}
                  >
                    {SALARY_CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Toggle
                  checked={openToRelocation}
                  onChange={setOpenToRelocation}
                  label="Open to Relocation"
                />
                {openToRelocation && (
                  <div className="mt-3">
                    <label className="jl-label">Relocation Preferences</label>
                    <input
                      className="jl-input"
                      placeholder="e.g. Europe only, willing to relocate for the right opportunity..."
                      value={relocationPrefs}
                      onChange={(e) => setRelocationPrefs(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="jl-label">Desired Locations</label>
                <TagInput
                  tags={desiredLocations}
                  onChange={setDesiredLocations}
                  placeholder="e.g. Paris, London, Dubai..."
                />
              </div>

              <div>
                <label className="jl-label mb-3">Desired Contract Types</label>
                <CheckboxGrid
                  options={CONTRACT_TYPES}
                  selected={desiredContractTypes}
                  onChange={setDesiredContractTypes}
                  columns={2}
                />
              </div>

              <div>
                <label className="jl-label mb-3">Desired Departments</label>
                <CheckboxGrid
                  options={DEPARTMENTS}
                  selected={desiredDepartments}
                  onChange={setDesiredDepartments}
                  columns={3}
                />
              </div>
            </div>
          </FormSection>

          {/* ════════════════════════════════════════════════════ */}
          {/* Section 8 — Documents                               */}
          {/* ════════════════════════════════════════════════════ */}
          <FormSection title="Documents">
            {/* Existing documents */}
            {documents.length > 0 && (
              <div className="space-y-3 mb-6">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="jl-card flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Star for primary CV */}
                      {doc.document_type === 'cv' && doc.is_primary && (
                        <span className="text-[#a58e28] text-lg shrink-0" title="Primary CV">
                          &#9733;
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-sans text-sm text-[#1a1a1a] truncate">
                          {doc.file_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="jl-badge jl-badge-outline text-[0.55rem]">
                            {DOCUMENT_TYPES.find((dt) => dt.value === doc.document_type)?.label || doc.document_type}
                          </span>
                          <span className="font-sans text-xs text-[#888]">
                            {formatFileSize(doc.file_size)}
                          </span>
                          <span className="font-sans text-xs text-[#888]">
                            {formatDate(doc.uploaded_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-xs text-[#a58e28] hover:underline min-h-0 min-w-0"
                      >
                        Download
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteDocument(doc.id)}
                        className="font-sans text-xs text-red-500 hover:underline min-h-0 min-w-0"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload area */}
            <div className="border border-dashed border-[#e8e2d8] bg-[#fafaf5] p-5">
              <div className="jl-section-label"><span>Upload Document</span></div>

              <div className="space-y-4">
                <div>
                  <label className="jl-label">File</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    className="font-sans text-sm text-[#999] file:mr-3 file:py-2 file:px-4 file:border file:border-[#e8e2d8] file:bg-white file:text-[#1a1a1a] file:font-sans file:text-xs file:font-medium file:uppercase file:tracking-wider file:cursor-pointer hover:file:bg-[#fafaf5]"
                  />
                  <p className="font-sans text-xs text-[#888] mt-1">
                    Accepted: PDF, DOC, DOCX, RTF, TXT, JPG, PNG. Max 10 MB.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Document Type</label>
                    <select
                      className="jl-input"
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                    >
                      {DOCUMENT_TYPES.map((dt) => (
                        <option key={dt.value} value={dt.value}>{dt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="jl-label">Label (optional)</label>
                    <input
                      className="jl-input"
                      placeholder="e.g. March 2026 CV"
                      value={uploadLabel}
                      onChange={(e) => setUploadLabel(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={uploadDocument}
                  disabled={uploading}
                  className="jl-btn jl-btn-gold disabled:opacity-40"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </FormSection>

          {/* ════════════════════════════════════════════════════ */}
          {/* Save Profile Button                                 */}
          {/* ════════════════════════════════════════════════════ */}
          <div className="border-t-2 border-[#1a1a1a] pt-8 mt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-sans text-xs text-[#888]">
                  Saves personal info, professional summary, skills, luxury profile, and preferences.
                </p>
                <p className="font-sans text-xs text-[#888]">
                  Work experience, education, languages, and documents save individually.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving || !firstName || !lastName}
                className="jl-btn jl-btn-gold disabled:opacity-40 flex-shrink-0"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════ */}
          {/* Photo Upload (hidden for business/insider)           */}
          {/* ════════════════════════════════════════════════════ */}
          {member && !['business', 'insider'].includes((member as any).role || '') && (
          <FormSection title="Profile Photo">
            <div className="flex items-center gap-6">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-24 h-32 object-cover rounded-xl border-2 border-[#a58e28]" />
              ) : (
                <div className="w-24 h-32 bg-[#3a3a3a] rounded-xl border-2 border-[#a58e28] flex items-center justify-center">
                  <span className="jl-serif text-2xl text-[#a58e28]">{firstName?.[0] || '?'}{lastName?.[0] || ''}</span>
                </div>
              )}
              <div className="space-y-2">
                <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
                <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar} className="jl-btn jl-btn-outline text-xs">
                  {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                </button>
                {avatarUrl && (
                  <button onClick={handleRemoveAvatar} className="block text-xs text-[#888] hover:text-red-500 transition-colors">Remove</button>
                )}
                <p className="text-[0.6rem] text-[#aaa]">JPG, PNG or WebP. Max 5MB.</p>
              </div>
            </div>
          </FormSection>
          )}

          {/* ════════════════════════════════════════════════════ */}
          {/* Opportunity Preferences                               */}
          {/* ════════════════════════════════════════════════════ */}
          <FormSection title="Opportunity Preferences">
            <div className="space-y-5">
              <div>
                <label className="jl-label">Preferred Sectors</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Fashion & leather goods', 'Watches & jewellery', 'Perfumes & cosmetics', 'Wines & spirits', 'Hospitality & travel', 'Automotive', 'Aviation & yachting', 'Real estate', 'Design', 'Art & auction houses', 'Media & publishing', 'Technology for luxury'].map(s => (
                    <button key={s} type="button" onClick={() => setPrefSectors(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])} className={`text-[0.65rem] px-2.5 py-1 rounded-sm border transition-colors ${prefSectors.includes(s) ? 'border-[#a58e28] bg-[#a58e28]/10 text-[#a58e28]' : 'border-[#e8e2d8] text-[#888]'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="jl-label">Seniority</label>
                <div className="flex flex-wrap gap-1.5">
                  {SENIORITY_LEVELS.map(s => (
                    <button key={s} type="button" onClick={() => setPrefSeniority(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])} className={`text-[0.65rem] px-2.5 py-1 rounded-sm border transition-colors ${prefSeniority.includes(s) ? 'border-[#a58e28] bg-[#a58e28]/10 text-[#a58e28]' : 'border-[#e8e2d8] text-[#888]'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="jl-label">Departments</label>
                <div className="flex flex-wrap gap-1.5">
                  {DEPARTMENTS.map(d => (
                    <button key={d} type="button" onClick={() => setPrefDepts(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])} className={`text-[0.65rem] px-2.5 py-1 rounded-sm border transition-colors ${prefDepts.includes(d) ? 'border-[#a58e28] bg-[#a58e28]/10 text-[#a58e28]' : 'border-[#e8e2d8] text-[#888]'}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="jl-label">Contract Types</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Permanent', 'Fixed-term', 'Freelance', 'Internship'].map(c => (
                    <button key={c} type="button" onClick={() => setPrefContracts(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])} className={`text-[0.65rem] px-2.5 py-1 rounded-sm border transition-colors ${prefContracts.includes(c) ? 'border-[#a58e28] bg-[#a58e28]/10 text-[#a58e28]' : 'border-[#e8e2d8] text-[#888]'}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-[#888]">Open to remote</span>
                  <button type="button" onClick={() => setPrefRemote(!prefRemote)} className={`relative w-8 h-4 rounded-full transition-colors ${prefRemote ? 'bg-[#a58e28]' : 'bg-[#e8e2d8]'}`}><span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${prefRemote ? 'translate-x-4' : ''}`} /></button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-[#888]">Open to internships</span>
                  <button type="button" onClick={() => setPrefInternships(!prefInternships)} className={`relative w-8 h-4 rounded-full transition-colors ${prefInternships ? 'bg-[#a58e28]' : 'bg-[#e8e2d8]'}`}><span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${prefInternships ? 'translate-x-4' : ''}`} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="jl-label">Minimum Salary</label>
                  <input type="number" className="jl-input" value={prefMinSalary} onChange={(e) => setPrefMinSalary(e.target.value)} placeholder="e.g. 40000" />
                </div>
                <div>
                  <label className="jl-label">Currency</label>
                  <select className="jl-select" value={prefSalaryCurrency} onChange={(e) => setPrefSalaryCurrency(e.target.value)}>
                    {SALARY_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-sans text-xs text-[#1a1a1a] font-medium">Notify me about matching opportunities</span>
                  <p className="font-sans text-[0.6rem] text-[#aaa] italic mt-0.5">Alerts coming soon — we&rsquo;re saving your preferences.</p>
                </div>
                <button type="button" onClick={() => setPrefAlerts(!prefAlerts)} className={`relative w-8 h-4 rounded-full transition-colors ${prefAlerts ? 'bg-[#a58e28]' : 'bg-[#e8e2d8]'}`}><span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${prefAlerts ? 'translate-x-4' : ''}`} /></button>
              </div>
              <button type="button" onClick={handleSavePreferences} disabled={savingPrefs} className="jl-btn jl-btn-primary text-xs">
                {savingPrefs ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </FormSection>

          {/* ════════════════════════════════════════════════════ */}
          {/* Shareable Résumé                                     */}
          {/* ════════════════════════════════════════════════════ */}
          <FormSection title="Shareable Résumé">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-sans text-sm font-medium text-[#1a1a1a]">Enable résumé</div>
                  <div className="font-sans text-[0.65rem] text-[#888]">Make your résumé page visible to anyone with the link</div>
                </div>
                <button
                  onClick={() => setResumePublic(!resumePublic)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${resumePublic ? 'bg-[#a58e28]' : 'bg-[#e8e2d8]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${resumePublic ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {resumePublic && (
                <>
                  {resumeSlug && (
                    <div>
                      <label className="jl-label">Your Résumé URL</label>
                      <div className="flex gap-2">
                        <input className="jl-input flex-1 text-xs bg-[#fafaf5]" readOnly value={`luxuryrecruiter.com/r/${resumeSlug}`} />
                        <button
                          onClick={() => { navigator.clipboard.writeText(`https://www.luxuryrecruiter.com/r/${resumeSlug}`); setResumeCopied(true); setTimeout(() => setResumeCopied(false), 2000) }}
                          className="jl-btn jl-btn-outline text-xs"
                        >
                          {resumeCopied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="jl-label">Headline</label>
                    <textarea
                      className="jl-input w-full min-h-[80px] resize-y"
                      value={resumeHeadline}
                      onChange={(e) => setResumeHeadline(e.target.value)}
                      maxLength={300}
                      placeholder="Tell the world about your luxury career in a few lines"
                    />
                    <span className="text-[0.6rem] text-[#ccc]">{resumeHeadline.length}/300</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-xs text-[#888]">Show my email on résumé</span>
                      <button
                        onClick={() => setResumeShowEmail(!resumeShowEmail)}
                        className={`relative w-8 h-4 rounded-full transition-colors ${resumeShowEmail ? 'bg-[#a58e28]' : 'bg-[#e8e2d8]'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${resumeShowEmail ? 'translate-x-4' : ''}`} />
                      </button>
                    </div>
                    {phone && (
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-xs text-[#888]">Show my phone on résumé</span>
                        <button
                          onClick={() => setResumeShowPhone(!resumeShowPhone)}
                          className={`relative w-8 h-4 rounded-full transition-colors ${resumeShowPhone ? 'bg-[#a58e28]' : 'bg-[#e8e2d8]'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${resumeShowPhone ? 'translate-x-4' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="font-sans text-[0.65rem] text-[#aaa] leading-relaxed">
                    Your résumé is yours. Share it wherever you like — LinkedIn, WhatsApp, email. You control what&rsquo;s visible.
                  </p>

                  {/* Share buttons */}
                  {resumeSlug && (
                    <div className="flex items-center gap-3">
                      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.luxuryrecruiter.com/r/' + resumeSlug)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#888] hover:text-[#a58e28]">LinkedIn</a>
                      <a href={`https://wa.me/?text=${encodeURIComponent('My JOBLUX Résumé: https://www.luxuryrecruiter.com/r/' + resumeSlug)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#888] hover:text-[#a58e28]">WhatsApp</a>
                      <a href={`mailto:?subject=${encodeURIComponent('My JOBLUX Résumé')}&body=${encodeURIComponent('https://www.luxuryrecruiter.com/r/' + resumeSlug)}`} className="text-xs text-[#888] hover:text-[#a58e28]">Email</a>
                      <a href={`/r/${resumeSlug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#a58e28] hover:underline">Preview &rarr;</a>
                    </div>
                  )}
                </>
              )}

              <button onClick={handleSaveResume} disabled={savingResume} className="jl-btn jl-btn-primary text-xs">
                {savingResume ? 'Saving...' : 'Save Résumé Settings'}
              </button>
            </div>
          </FormSection>

          </>
          )}

          {/* Quick links — mobile only (sidebar has these on desktop) */}
          <div className="mt-10 lg:hidden">
            <div className="jl-section-label"><span>Quick Links</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard" className="jl-card group">
                <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">
                  Dashboard
                </h3>
                <p className="font-sans text-xs text-[#888] mt-1">Back to your dashboard</p>
              </Link>
              <Link href="/opportunities" className="jl-card group">
                <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">
                  Search Assignments
                </h3>
                <p className="font-sans text-xs text-[#888] mt-1">Browse confidential assignments</p>
              </Link>
            </div>
          </div>

        </div>{/* END left column */}

        {/* RIGHT — Sidebar (desktop only) */}
        <div className="hidden lg:block space-y-4">

          {/* Profile Completeness */}
          <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6 sticky top-[88px]">
            <div className="space-y-4">

              {/* Completeness card */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider">
                    Profile Completeness
                  </h3>
                  <span className="text-lg font-medium text-[#a58e28]">{completeness}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-[#a58e28] rounded-full transition-all duration-700"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                {completenessHint && (
                  <p className="text-xs text-gray-500">{completenessHint}</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">
                  Profile Visibility
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Public résumé</span>
                  <span className={`text-xs font-medium ${resumePublic ? 'text-[#a58e28]' : 'text-gray-400'}`}>
                    {resumePublic ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Shareable link */}
              {resumeSlug && resumePublic && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-2">
                    Shareable Link
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      className="jl-input text-xs flex-1 bg-gray-50"
                      value={`luxuryrecruiter.com/r/${resumeSlug}`}
                      readOnly
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://www.luxuryrecruiter.com/r/${resumeSlug}`)
                        setResumeCopied(true)
                        setTimeout(() => setResumeCopied(false), 2000)
                      }}
                      className="text-xs text-[#a58e28] hover:text-[#7a6a1e] font-medium whitespace-nowrap"
                    >
                      {resumeCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Contribution stats */}
              {member && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">
                    Contribution Stats
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Points earned</span>
                    <span className="text-sm font-medium text-[#a58e28]">
                      {(member as any).contribution_points || 0}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick nav */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#a58e28] transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a58e28]" />
                    Dashboard
                  </Link>
                  <Link href="/opportunities" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#a58e28] transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a58e28]" />
                    Search Assignments
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>{/* END sidebar */}
        </div>{/* END two-column grid */}
      </div>

      {/* ── Toast Notification ─────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 bg-[#1a1a1a] text-[#a58e28] font-sans text-sm px-5 py-3 shadow-lg z-50"
          style={{ animation: 'profileToastIn 200ms ease-out' }}
        >
          {toast}
          <style jsx>{`
            @keyframes profileToastIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
