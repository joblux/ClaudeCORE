'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { EditorView } from '@/lib/profilux/types'
import { PROFILUX_SENIORITY_OPTIONS, PROFILUX_PRODUCT_CATEGORY_OPTIONS, PROFILUX_EXPERTISE_TAG_OPTIONS, PROFILUX_CURRENCY_OPTIONS, PROFILUX_DEPARTMENT_OPTIONS, PROFILUX_CONTRACT_TYPE_OPTIONS, PROFILUX_LOCATION_OPTIONS, PROFILUX_SKILL_OPTIONS, PROFILUX_MARKET_OPTIONS } from '@/lib/profilux/vocabulary'

const TOTAL = 11
const SCREEN_TITLES = [
  '', 'Identity', 'Headline', 'Current Position', 'Luxury Fit',
  'Career History', 'Education & Languages', 'Skills & Markets',
  'Clienteling', 'Availability & Targets', 'Compensation', 'Confirm',
]

const NotSet = () => <em style={{ color: '#666' }}>Not specified</em>
const NoneSel = () => <em style={{ color: '#666' }}>None selected</em>
const Hint = ({ children }: { children: React.ReactNode }) => <em style={{ color: '#888' }}>{children}</em>

const wrap: React.CSSProperties = { padding: 40, background: '#1a1a1a', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }
const h1Style: React.CSSProperties = { fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: 28, marginBottom: 8 }
const sub: React.CSSProperties = { color: '#999', fontSize: 13, marginBottom: 24 }
const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 28,
  borderBottom: '1px solid #2a2a2a',
  maxWidth: 900,
  marginBottom: 24,
}
const tabBtnBase: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: '10px 0',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  letterSpacing: 0.3,
  cursor: 'pointer',
  color: '#999',
  borderBottom: '2px solid transparent',
  marginBottom: -1,
}
const tabBtnActive: React.CSSProperties = {
  ...tabBtnBase,
  color: '#fff',
  borderBottom: '2px solid #a58e28',
}
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '240px 1fr', gap: 12, fontSize: 14, lineHeight: 1.6, maxWidth: 900 }
const label: React.CSSProperties = { color: '#999' }
const navWrap: React.CSSProperties = { marginTop: 40, display: 'flex', gap: 12, alignItems: 'center', maxWidth: 900 }
const btn: React.CSSProperties = { background: 'transparent', color: '#fff', border: '1px solid #333', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13 }
const btnDis: React.CSSProperties = { ...btn, color: '#555', borderColor: '#222', cursor: 'not-allowed' }
const card: React.CSSProperties = { border: '1px solid #2a2a2a', padding: 16, marginBottom: 8, fontSize: 13 }
const sectionLabel: React.CSSProperties = { marginTop: 24, color: '#999', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }
const input: React.CSSProperties = { background: 'transparent', color: '#fff', border: '1px solid #333', padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: 14, width: '100%', maxWidth: 400, outline: 'none' }
const select: React.CSSProperties = { ...input, appearance: 'none', backgroundImage: 'linear-gradient(45deg, transparent 50%, #999 50%), linear-gradient(135deg, #999 50%, transparent 50%)', backgroundPosition: 'calc(100% - 14px) 50%, calc(100% - 9px) 50%', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat', paddingRight: 28 }
const saveBtn: React.CSSProperties = { ...btn, background: '#fff', color: '#1a1a1a', borderColor: '#fff' }
const saveBtnDis: React.CSSProperties = { ...saveBtn, opacity: 0.5, cursor: 'not-allowed' }
const chip: React.CSSProperties = { background: 'transparent', color: '#ccc', border: '1px solid #444', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, borderRadius: 999 }
const chipActive: React.CSSProperties = { ...chip, background: 'rgba(165, 142, 40, 0.15)', color: '#fff', borderColor: '#a58e28' }

type ProfiluxTab = 'view' | 'edit' | 'manage'

type SectionCardProps = {
  eyebrow?: string
  layout?: 'block' | 'flex'
  children: React.ReactNode
}

function SectionCard({ eyebrow, layout = 'block', children }: SectionCardProps) {
  const base: React.CSSProperties = {
    background: '#222',
    border: '1px solid #2a2a2a',
    borderRadius: 6,
    padding: '20px 24px',
    marginBottom: 24,
    maxWidth: 900,
  }
  const flexExtras: React.CSSProperties = layout === 'flex'
    ? { display: 'flex', alignItems: 'center', gap: 20 }
    : {}
  const eyebrowStyle: React.CSSProperties = {
    fontSize: 10,
    color: '#999',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  }
  return (
    <div style={{ ...base, ...flexExtras }}>
      {eyebrow && <div style={eyebrowStyle}>{eyebrow}</div>}
      {children}
    </div>
  )
}

type DrawerProps = {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

function Drawer({ open, title, onClose, children }: DrawerProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 50,
  }
  const panelStyleDesktop: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: 480,
    background: '#1a1a1a',
    borderLeft: '1px solid #2a2a2a',
    zIndex: 51,
    display: 'flex',
    flexDirection: 'column',
  }
  const panelStyleMobile: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100%',
    background: '#1a1a1a',
    zIndex: 51,
    display: 'flex',
    flexDirection: 'column',
  }
  const headerStyle: React.CSSProperties = {
    height: 56,
    padding: '0 24px',
    borderBottom: '1px solid #2a2a2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: '0 0 auto',
  }
  const titleStyle: React.CSSProperties = {
    fontFamily: 'Playfair Display, serif',
    fontWeight: 400,
    fontSize: 18,
    color: '#fff',
    margin: 0,
  }
  const closeBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: 22,
    lineHeight: 1,
    padding: 4,
    fontFamily: 'Inter, sans-serif',
  }
  const bodyStyle: React.CSSProperties = {
    padding: isMobile ? 20 : 24,
    overflowY: 'auto',
    flex: '1 1 auto',
    color: '#ccc',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    lineHeight: 1.6,
  }

  return (
    <>
      {!isMobile && (
        <div
          style={overlayStyle}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={isMobile ? panelStyleMobile : panelStyleDesktop}
      >
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            style={closeBtnStyle}
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>
        <div style={bodyStyle}>{children}</div>
      </div>
    </>
  )
}

type Screen3Draft = {
  job_title: string
  current_employer: string
  seniority: string
  total_years_experience: string
}

type Screen4Draft = {
  years_in_luxury: string
  product_categories: string[]
  expertise_tags: string[]
}

type Screen8Draft = {
  clienteling_experience: boolean | null
  clienteling_description: string
}

type Screen6Draft = {
  university: string
  field_of_study: string
  graduation_year: string
}

type Screen10Draft = {
  desired_salary_min: number | null
  desired_salary_max: number | null
  desired_salary_currency: string | null
}

type Screen9Draft = {
  availability: 'active' | 'open' | 'passive' | 'unavailable' | null
  desired_locations: string[]
  desired_departments: string[]
  desired_contract_types: string[]
  open_to_relocation: boolean | null
  relocation_preferences: string
}

type Screen7Draft = {
  key_skills: string[]
  market_knowledge: string[]
}

function draftFrom(e: EditorView): Screen3Draft {
  return {
    job_title: e.job_title ?? '',
    current_employer: e.current_employer ?? '',
    seniority: e.seniority ?? '',
    total_years_experience: e.total_years_experience != null ? String(e.total_years_experience) : '',
  }
}

function draftFrom4(e: EditorView): Screen4Draft {
  return {
    years_in_luxury: e.years_in_luxury == null ? '' : String(e.years_in_luxury),
    product_categories: e.product_categories ?? [],
    expertise_tags: e.expertise_tags ?? [],
  }
}

function draftFrom8(e: EditorView): Screen8Draft {
  return {
    clienteling_experience: e.clienteling_experience,
    clienteling_description: e.clienteling_description ?? '',
  }
}

function draftFrom6(e: EditorView): Screen6Draft {
  return {
    university: e.university ?? '',
    field_of_study: e.field_of_study ?? '',
    graduation_year: e.graduation_year == null ? '' : String(e.graduation_year),
  }
}

function draftFrom7(e: EditorView): Screen7Draft {
  return {
    key_skills: e.key_skills ?? [],
    market_knowledge: e.market_knowledge ?? [],
  }
}

const draftFrom10 = (e: EditorView): Screen10Draft => ({
  desired_salary_min: e.desired_salary_min,
  desired_salary_max: e.desired_salary_max,
  desired_salary_currency: e.desired_salary_currency,
})

const draftFrom9 = (e: EditorView): Screen9Draft => ({
  availability: e.availability,
  desired_locations: e.desired_locations ?? [],
  desired_departments: e.desired_departments ?? [],
  desired_contract_types: e.desired_contract_types ?? [],
  open_to_relocation: e.open_to_relocation,
  relocation_preferences: e.relocation_preferences ?? '',
})

function mapParseError(code: string | null): string {
  switch (code) {
    case 'M6_NO_CV_UPLOADED': return 'Upload a CV first.'
    case 'M6_DOC_FORMAT_UNSUPPORTED': return 'Use PDF or .docx.'
    case 'M6_CV_TEXT_TOO_SHORT': return 'We could not read your CV. Try a text-based PDF.'
    case 'M6_PARSER_TIMEOUT': return 'Parsing timed out. Try again.'
    case 'M6_PARSER_FAILED':
    case 'M6_PARSER_INVALID_OUTPUT':
    case 'M6_API_KEY_MISSING':
    case 'M6_CV_FILE_NOT_FOUND':
    case 'M6_MEMBER_NOT_FOUND':
    case 'M6_NOT_AUTHENTICATED':
      return 'Parsing failed. Try again.'
    default: return 'Something went wrong. Try again.'
  }
}

export default function ProfiluxPage() {
  const [tab, setTab] = useState<ProfiluxTab>('edit')
  const [drawerDemoOpen, setDrawerDemoOpen] = useState(false)
  const [currentPositionDrawerOpen, setCurrentPositionDrawerOpen] = useState(false)
  const [skillsMarketsDrawerOpen, setSkillsMarketsDrawerOpen] = useState(false)
  const [compensationDrawerOpen, setCompensationDrawerOpen] = useState(false)
  const [clientelingDrawerOpen, setClientelingDrawerOpen] = useState(false)
  const [editor, setEditor] = useState<EditorView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<Screen3Draft>({ job_title: '', current_employer: '', seniority: '', total_years_experience: '' })
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [draft4, setDraft4] = useState<Screen4Draft>({ years_in_luxury: '', product_categories: [], expertise_tags: [] })
  const [saving4, setSaving4] = useState(false)
  const [savedAt4, setSavedAt4] = useState<number | null>(null)
  const [saveError4, setSaveError4] = useState<string | null>(null)
  const [draft8, setDraft8] = useState<Screen8Draft>({ clienteling_experience: null, clienteling_description: '' })
  const [saving8, setSaving8] = useState(false)
  const [savedAt8, setSavedAt8] = useState<number | null>(null)
  const [saveError8, setSaveError8] = useState<string | null>(null)
  const [draft6, setDraft6] = useState<Screen6Draft>({ university: '', field_of_study: '', graduation_year: '' })
  const [saving6, setSaving6] = useState(false)
  const [savedAt6, setSavedAt6] = useState<number | null>(null)
  const [saveError6, setSaveError6] = useState<string | null>(null)
  const [draft10, setDraft10] = useState<Screen10Draft | null>(null)
  const [saving10, setSaving10] = useState(false)
  const [savedAt10, setSavedAt10] = useState<number | null>(null)
  const [saveError10, setSaveError10] = useState<string | null>(null)
  const [draft9, setDraft9] = useState<Screen9Draft>({ availability: null, desired_locations: [], desired_departments: [], desired_contract_types: [], open_to_relocation: null, relocation_preferences: '' })
  const [saving9, setSaving9] = useState(false)
  const [savedAt9, setSavedAt9] = useState<number | null>(null)
  const [saveError9, setSaveError9] = useState<string | null>(null)
  const [draft7, setDraft7] = useState<Screen7Draft>({ key_skills: [], market_knowledge: [] })
  const [saving7, setSaving7] = useState(false)
  const [savedAt7, setSavedAt7] = useState<number | null>(null)
  const [saveError7, setSaveError7] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [needsReviewCount, setNeedsReviewCount] = useState<number | null>(null)
  const [suggestionSelected, setSuggestionSelected] = useState<{
    first_name: boolean
    last_name: boolean
    city: boolean
    nationality: boolean
  }>({ first_name: false, last_name: false, city: false, nationality: false })
  const [suggestionDismissed, setSuggestionDismissed] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)

  const refetch = async () => {
    const res = await fetch('/api/profilux')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const e: EditorView | null = data.editor ?? null
    setEditor(e)
    if (e) {
      setDraft(draftFrom(e))
      setDraft4(draftFrom4(e))
      setDraft8(draftFrom8(e))
      setDraft6(draftFrom6(e))
      setDraft10(draftFrom10(e))
      setDraft9(draftFrom9(e))
      setDraft7(draftFrom7(e))
    }
    return e
  }

  async function handleUploadClick() {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  async function handleFileSelected(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('cv', file)
      const res = await fetch('/api/members/cv-upload', { method: 'POST', body: fd })
      if (!res.ok) {
        setUploadError('Upload failed. Try again.')
      } else {
        await refetch()
        setNeedsReviewCount(null)
      }
    } catch {
      setUploadError('Upload failed. Try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleParse() {
    setParsing(true)
    setParseError(null)
    try {
      const res = await fetch('/api/members/cv-parse', { method: 'POST' })
      const data = await res.json().catch(() => ({} as any))
      if (res.ok && data?.success) {
        await refetch()
        setNeedsReviewCount(typeof data?.needs_review_count === 'number' ? data.needs_review_count : null)
      } else {
        setParseError(mapParseError(data?.error ?? null))
      }
    } catch {
      setParseError(mapParseError(null))
    } finally {
      setParsing(false)
    }
  }

  useEffect(() => {
    refetch().catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={wrap}>Loading…</div>
  if (error) return <div style={{ ...wrap, color: '#ff6b6b' }}>Error: {error}</div>
  if (!editor) return <div style={wrap}>No editor data.</div>

  const e = editor
  const seniorityLabel = (value: string | null) => {
    if (!value) return null
    return PROFILUX_SENIORITY_OPTIONS.find(o => o.value === value)?.label ?? value
  }
  const skillLabel = (value: string) =>
    PROFILUX_SKILL_OPTIONS.find(o => o.value === value)?.label ?? value
  const cvUrl = e.cv_meta?.cv_url ?? null
  const cvParsedAt = e.cv_meta?.cv_parsed_at ?? null
  const parsedDateLabel = (cvParsedAt && !isNaN(new Date(cvParsedAt).getTime()))
    ? new Date(cvParsedAt).toLocaleDateString()
    : 'recently'

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const yearsRaw = draft.total_years_experience.trim()
      const yearsNum = yearsRaw === '' ? null : Number(yearsRaw)
      const body: Record<string, unknown> = {
        job_title: draft.job_title,
        current_employer: draft.current_employer,
        seniority: draft.seniority,
        total_years_experience: yearsNum != null && Number.isFinite(yearsNum) && yearsNum >= 0 ? yearsNum : null,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt(Date.now())
      setTimeout(() => setSavedAt((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError(String(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleSave4() {
    setSaving4(true)
    setSaveError4(null)
    try {
      const yearsRaw = draft4.years_in_luxury.trim()
      const yearsNum = yearsRaw === '' ? null : Number(yearsRaw)
      const body: Record<string, unknown> = {
        years_in_luxury: yearsNum != null && Number.isFinite(yearsNum) && yearsNum >= 0 ? yearsNum : null,
        product_categories: draft4.product_categories,
        expertise_tags: draft4.expertise_tags,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt4(Date.now())
      setTimeout(() => setSavedAt4((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError4(String(err))
    } finally {
      setSaving4(false)
    }
  }

  async function handleSave8() {
    setSaving8(true)
    setSaveError8(null)
    try {
      const exp = draft8.clienteling_experience
      const descRaw = draft8.clienteling_description.trim()
      const body: Record<string, unknown> = {
        clienteling_experience: exp,
        clienteling_description: exp === true && descRaw !== '' ? descRaw : null,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt8(Date.now())
      setTimeout(() => setSavedAt8((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError8(String(err))
    } finally {
      setSaving8(false)
    }
  }

  async function handleSave6() {
    setSaving6(true)
    setSaveError6(null)
    try {
      const yearRaw = draft6.graduation_year.trim()
      const yearNum = yearRaw === '' ? null : Number(yearRaw)
      const body: Record<string, unknown> = {
        university: draft6.university,
        field_of_study: draft6.field_of_study,
        graduation_year: yearNum != null && Number.isFinite(yearNum) && yearNum >= 0 ? yearNum : null,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt6(Date.now())
      setTimeout(() => setSavedAt6((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError6(String(err))
    } finally {
      setSaving6(false)
    }
  }

  async function handleSave10() {
    if (!draft10) return
    setSaving10(true)
    setSaveError10(null)
    try {
      const body: Record<string, unknown> = {
        desired_salary_min: draft10.desired_salary_min,
        desired_salary_max: draft10.desired_salary_max,
        desired_salary_currency: draft10.desired_salary_currency,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt10(Date.now())
      setTimeout(() => setSavedAt10((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError10(String(err))
    } finally {
      setSaving10(false)
    }
  }

  async function handleSave9() {
    setSaving9(true)
    setSaveError9(null)
    try {
      const exp = draft9.open_to_relocation
      const prefRaw = draft9.relocation_preferences.trim()
      const body: Record<string, unknown> = {
        availability: draft9.availability,
        desired_locations: draft9.desired_locations,
        desired_departments: draft9.desired_departments,
        desired_contract_types: draft9.desired_contract_types,
        open_to_relocation: exp,
        relocation_preferences: exp === true && prefRaw !== '' ? prefRaw : null,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt9(Date.now())
      setTimeout(() => setSavedAt9((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError9(String(err))
    } finally {
      setSaving9(false)
    }
  }

  async function handleSave7() {
    setSaving7(true)
    setSaveError7(null)
    try {
      const body: Record<string, unknown> = {
        key_skills: draft7.key_skills,
        market_knowledge: draft7.market_knowledge,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt7(Date.now())
      setTimeout(() => setSavedAt7((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError7(String(err))
    } finally {
      setSaving7(false)
    }
  }

  async function handleApplySuggestions() {
    if (!editor) return
    const sug = editor.cv_identity_suggestions
    const body: Record<string, unknown> = {}
    if (suggestionSelected.first_name && sug.first_name !== undefined) body.firstName = sug.first_name
    if (suggestionSelected.last_name && sug.last_name !== undefined) body.lastName = sug.last_name
    if (suggestionSelected.city && sug.city !== undefined) body.city = sug.city
    if (suggestionSelected.nationality && sug.nationality !== undefined) body.nationality = sug.nationality
    if (Object.keys(body).length === 0) return
    setApplying(true)
    setApplyError(null)
    try {
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSuggestionSelected({ first_name: false, last_name: false, city: false, nationality: false })
    } catch (err) {
      setApplyError(String(err))
    } finally {
      setApplying(false)
    }
  }

  function renderStep() {
    switch (step) {
      case 1: return (
        <div style={grid}>
          <div style={label}>First name</div><div>{e.first_name ?? <NotSet />}</div>
          <div style={label}>Last name</div><div>{e.last_name ?? <NotSet />}</div>
          <div style={label}>City</div><div>{e.city ?? <NotSet />}</div>
          <div style={label}>Country</div><div>{e.country ?? <NotSet />}</div>
          <div style={label}>Phone</div><div>{e.phone ?? <NotSet />}</div>
          <div style={label}>Nationality</div><div>{e.nationality ?? <NotSet />}</div>
        </div>
      )
      case 2: return (
        <div style={grid}>
          <div style={label}>Headline</div><div>{e.headline ?? <NotSet />}</div>
          <div style={label}>Bio</div><div>{e.bio ?? <NotSet />}</div>
        </div>
      )
      case 3: return (
        <div style={{ maxWidth: 900 }}>
          <div style={grid}>
            <div style={label}>Job title</div>
            <div><input style={input} value={draft.job_title} onChange={(ev) => setDraft({ ...draft, job_title: ev.target.value })} placeholder="e.g. Boutique Director" /></div>
            <div style={label}>Current employer</div>
            <div><input style={input} value={draft.current_employer} onChange={(ev) => setDraft({ ...draft, current_employer: ev.target.value })} placeholder="e.g. Hermès" /></div>
            <div style={label}>Seniority</div>
            <div>
              <select style={select} value={draft.seniority} onChange={(ev) => setDraft({ ...draft, seniority: ev.target.value })}>
                <option value="">— Select seniority —</option>
                {PROFILUX_SENIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div style={label}>Years of experience</div>
            <div><input style={input} type="number" min={0} value={draft.total_years_experience} onChange={(ev) => setDraft({ ...draft, total_years_experience: ev.target.value })} placeholder="e.g. 12" /></div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={saving ? saveBtnDis : saveBtn} disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            {savedAt && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
            {saveError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError}</span>}
          </div>
        </div>
      )
      case 4: return (
        <div style={{ maxWidth: 900 }}>
          <div style={grid}>
            <div style={label}>Sectors</div><div>{e.sectors.length ? e.sectors.join(', ') : <NoneSel />}</div>
            <div style={label}>Years in luxury</div>
            <div><input style={input} type="number" min={0} value={draft4.years_in_luxury} onChange={(ev) => setDraft4({ ...draft4, years_in_luxury: ev.target.value })} placeholder="e.g. 8" /></div>
          </div>
          <div style={sectionLabel}>Product categories</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {PROFILUX_PRODUCT_CATEGORY_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                style={draft4.product_categories.includes(o.value) ? chipActive : chip}
                onClick={() => setDraft4({ ...draft4, product_categories: draft4.product_categories.includes(o.value) ? draft4.product_categories.filter(v => v !== o.value) : [...draft4.product_categories, o.value] })}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div style={sectionLabel}>Areas of expertise</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {PROFILUX_EXPERTISE_TAG_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                style={draft4.expertise_tags.includes(o.value) ? chipActive : chip}
                onClick={() => setDraft4({ ...draft4, expertise_tags: draft4.expertise_tags.includes(o.value) ? draft4.expertise_tags.filter(v => v !== o.value) : [...draft4.expertise_tags, o.value] })}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={saving4 ? saveBtnDis : saveBtn} disabled={saving4} onClick={handleSave4}>
              {saving4 ? 'Saving…' : 'Save'}
            </button>
            {savedAt4 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
            {saveError4 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError4}</span>}
          </div>
        </div>
      )
      case 5: return (
        <div style={{ maxWidth: 900 }}>
          {e.experiences.length === 0 && <NoneSel />}
          {e.experiences.map((exp, i) => (
            <div key={i} style={card}>
              <div><strong>{exp.company ?? 'Unknown'}</strong> — {exp.job_title ?? 'Role not specified'}</div>
              <div style={{ color: '#999', marginTop: 4 }}>{exp.city ?? '—'}, {exp.country ?? '—'} · {exp.start_date ?? '—'} → {exp.end_date ?? 'Present'}</div>
              {exp.description && <div style={{ color: '#ccc', marginTop: 8 }}>{exp.description}</div>}
            </div>
          ))}
        </div>
      )
      case 6: return (
        <div style={{ maxWidth: 900 }}>
          <div style={grid}>
            <div style={label}>University</div>
            <div><input style={input} value={draft6.university} onChange={(ev) => setDraft6({ ...draft6, university: ev.target.value })} placeholder="e.g. Swiss School of Business" /></div>
            <div style={label}>Field of study</div>
            <div><input style={input} value={draft6.field_of_study} onChange={(ev) => setDraft6({ ...draft6, field_of_study: ev.target.value })} placeholder="e.g. Business Administration" /></div>
            <div style={label}>Graduation year</div>
            <div><input style={input} type="number" min={0} value={draft6.graduation_year} onChange={(ev) => setDraft6({ ...draft6, graduation_year: ev.target.value })} placeholder="e.g. 2018" /></div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={saving6 ? saveBtnDis : saveBtn} disabled={saving6} onClick={handleSave6}>
              {saving6 ? 'Saving…' : 'Save'}
            </button>
            {savedAt6 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
            {saveError6 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError6}</span>}
          </div>
          <div style={sectionLabel}>Education</div>
          {e.education.length === 0 && <NoneSel />}
          {e.education.map((ed, i) => (
            <div key={i} style={card}>
              <div><strong>{ed.institution ?? 'Unknown'}</strong></div>
              <div style={{ color: '#999', marginTop: 4 }}>{ed.degree ?? '—'} · {ed.field_of_study ?? '—'} · {ed.graduation_year ?? '—'}</div>
            </div>
          ))}
          <div style={sectionLabel}>Languages</div>
          {e.languages.length === 0 && <NoneSel />}
          {e.languages.map((l, i) => (
            <div key={i} style={card}>{l.language} — {l.proficiency ?? <NotSet />}</div>
          ))}
        </div>
      )
      case 7: return (
        <div style={{ maxWidth: 900 }}>
          <div style={sectionLabel}>Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {PROFILUX_SKILL_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                style={draft7.key_skills.includes(o.value) ? chipActive : chip}
                onClick={() => setDraft7({ ...draft7, key_skills: draft7.key_skills.includes(o.value) ? draft7.key_skills.filter(v => v !== o.value) : [...draft7.key_skills, o.value] })}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div style={sectionLabel}>Markets</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {PROFILUX_MARKET_OPTIONS.map((o) => (
              <button
                key={o}
                type="button"
                style={draft7.market_knowledge.includes(o) ? chipActive : chip}
                onClick={() => setDraft7({ ...draft7, market_knowledge: draft7.market_knowledge.includes(o) ? draft7.market_knowledge.filter(v => v !== o) : [...draft7.market_knowledge, o] })}
              >
                {o}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={saving7 ? saveBtnDis : saveBtn} disabled={saving7} onClick={handleSave7}>
              {saving7 ? 'Saving…' : 'Save'}
            </button>
            {savedAt7 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
            {saveError7 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError7}</span>}
          </div>
        </div>
      )
      case 8: return (
        <div style={{ maxWidth: 900 }}>
          <div style={sectionLabel}>Clienteling experience</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              style={draft8.clienteling_experience === true ? chipActive : chip}
              onClick={() => setDraft8(prev => prev.clienteling_experience === true
                ? { clienteling_experience: null, clienteling_description: '' }
                : { clienteling_experience: true, clienteling_description: prev.clienteling_description })}
            >
              Yes
            </button>
            <button
              type="button"
              style={draft8.clienteling_experience === false ? chipActive : chip}
              onClick={() => setDraft8(prev => ({
                clienteling_experience: prev.clienteling_experience === false ? null : false,
                clienteling_description: '',
              }))}
            >
              No
            </button>
          </div>

          {draft8.clienteling_experience === true && (
            <>
              <div style={sectionLabel}>Background description</div>
              <textarea
                style={{ ...input, maxWidth: 600, fontFamily: 'Inter, sans-serif', minHeight: 80, resize: 'vertical' }}
                rows={3}
                value={draft8.clienteling_description}
                onChange={(ev) => setDraft8(prev => ({ ...prev, clienteling_description: ev.target.value }))}
                placeholder="Briefly describe your clienteling experience"
              />
            </>
          )}

          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={saving8 ? saveBtnDis : saveBtn} disabled={saving8} onClick={handleSave8}>
              {saving8 ? 'Saving…' : 'Save'}
            </button>
            {savedAt8 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
            {saveError8 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError8}</span>}
          </div>
        </div>
      )
      case 9: return (
        <div style={{ maxWidth: 900 }}>
          <div style={grid}>
            <div style={label}>Availability</div>
            <div>
              <select style={select} value={draft9.availability ?? ''} onChange={(ev) => setDraft9({ ...draft9, availability: ev.target.value === '' ? null : ev.target.value as Screen9Draft['availability'] })}>
                <option value="">— Not specified —</option>
                <option value="active">Actively looking</option>
                <option value="open">Open to opportunities</option>
                <option value="passive">Passively exploring</option>
                <option value="unavailable">Not available</option>
              </select>
            </div>
          </div>

          <div style={sectionLabel}>Target locations</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {PROFILUX_LOCATION_OPTIONS.map((o) => (
              <button
                key={o}
                type="button"
                style={draft9.desired_locations.includes(o) ? chipActive : chip}
                onClick={() => setDraft9({ ...draft9, desired_locations: draft9.desired_locations.includes(o) ? draft9.desired_locations.filter(v => v !== o) : [...draft9.desired_locations, o] })}
              >
                {o}
              </button>
            ))}
          </div>

          <div style={sectionLabel}>Target departments</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {PROFILUX_DEPARTMENT_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                style={draft9.desired_departments.includes(o.value) ? chipActive : chip}
                onClick={() => setDraft9({ ...draft9, desired_departments: draft9.desired_departments.includes(o.value) ? draft9.desired_departments.filter(v => v !== o.value) : [...draft9.desired_departments, o.value] })}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div style={sectionLabel}>Contract types</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {PROFILUX_CONTRACT_TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                style={draft9.desired_contract_types.includes(o.value) ? chipActive : chip}
                onClick={() => setDraft9({ ...draft9, desired_contract_types: draft9.desired_contract_types.includes(o.value) ? draft9.desired_contract_types.filter(v => v !== o.value) : [...draft9.desired_contract_types, o.value] })}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div style={sectionLabel}>Open to relocation</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              style={draft9.open_to_relocation === true ? chipActive : chip}
              onClick={() => setDraft9(prev => prev.open_to_relocation === true
                ? { ...prev, open_to_relocation: null, relocation_preferences: '' }
                : { ...prev, open_to_relocation: true })}
            >
              Yes
            </button>
            <button
              type="button"
              style={draft9.open_to_relocation === false ? chipActive : chip}
              onClick={() => setDraft9(prev => ({
                ...prev,
                open_to_relocation: prev.open_to_relocation === false ? null : false,
                relocation_preferences: '',
              }))}
            >
              No
            </button>
          </div>

          {draft9.open_to_relocation === true && (
            <>
              <div style={sectionLabel}>Relocation preferences</div>
              <textarea
                style={{ ...input, maxWidth: 600, fontFamily: 'Inter, sans-serif', minHeight: 80, resize: 'vertical' }}
                rows={3}
                value={draft9.relocation_preferences}
                onChange={(ev) => setDraft9(prev => ({ ...prev, relocation_preferences: ev.target.value }))}
                placeholder="e.g. EU only, willing to relocate within 3 months"
              />
            </>
          )}

          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={saving9 ? saveBtnDis : saveBtn} disabled={saving9} onClick={handleSave9}>
              {saving9 ? 'Saving…' : 'Save'}
            </button>
            {savedAt9 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
            {saveError9 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError9}</span>}
          </div>
        </div>
      )
      case 10: return (
        <div style={{ maxWidth: 900 }}>
          <div style={grid}>
            <div style={label}>Target compensation (min)</div>
            <div><input style={input} type="number" min={0} value={draft10?.desired_salary_min ?? ''} onChange={(ev) => setDraft10(d => d && ({ ...d, desired_salary_min: ev.target.value === '' ? null : Number(ev.target.value) }))} placeholder="e.g. 80000" /></div>
            <div style={label}>Target compensation (max)</div>
            <div><input style={input} type="number" min={0} value={draft10?.desired_salary_max ?? ''} onChange={(ev) => setDraft10(d => d && ({ ...d, desired_salary_max: ev.target.value === '' ? null : Number(ev.target.value) }))} placeholder="e.g. 120000" /></div>
            <div style={label}>Currency</div>
            <div>
              <select style={input} value={draft10?.desired_salary_currency ?? ''} onChange={(ev) => setDraft10(d => d && ({ ...d, desired_salary_currency: ev.target.value === '' ? null : ev.target.value }))}>
                <option value="">— Not specified —</option>
                {PROFILUX_CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={saving10 || !draft10 ? saveBtnDis : saveBtn} disabled={saving10 || !draft10} onClick={handleSave10}>
              {saving10 ? 'Saving…' : 'Save'}
            </button>
            {savedAt10 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
            {saveError10 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError10}</span>}
          </div>
        </div>
      )
      case 11: return (
        <div style={grid}>
          <div style={label}>Profile completeness</div><div>{e.profile_completeness}%</div>
          <div style={label}>CV file</div><div style={{ wordBreak: 'break-all', fontSize: 12 }}>{e.cv_meta.cv_url ?? <NotSet />}</div>
          <div style={label}>CV last parsed</div><div>{e.cv_meta.cv_parsed_at ?? <NotSet />}</div>
          <div style={label}>Items to review</div><div>{e.cv_meta.needs_review}</div>
        </div>
      )
      default: return null
    }
  }

  return (
    <div style={wrap}>
      <h1 style={h1Style}>ProfiLux</h1>

      <div style={tabBarStyle}>
        <button type="button" style={tab === 'view' ? tabBtnActive : tabBtnBase} onClick={() => setTab('view')}>View</button>
        <button type="button" style={tab === 'edit' ? tabBtnActive : tabBtnBase} onClick={() => setTab('edit')}>Edit</button>
        <button type="button" style={tab === 'manage' ? tabBtnActive : tabBtnBase} onClick={() => setTab('manage')}>Manage</button>
      </div>

      {tab === 'view' && (() => {
        const fn = e.first_name ?? ''
        const ln = e.last_name ?? ''
        const lastInitial = (ln[0] ?? '').toUpperCase()
        const maskedName = fn && lastInitial
          ? `${fn} ${lastInitial}.`
          : fn || ''
        const initials = `${(fn[0] ?? '').toUpperCase()}${lastInitial}`.trim()
        const hasAvatar = typeof e.avatar_url === 'string' && e.avatar_url.trim().length > 0
        const hasHeadline = typeof e.headline === 'string' && e.headline.trim().length > 0
        const hasJob = typeof e.job_title === 'string' && e.job_title.trim().length > 0
        const hasCity = typeof e.city === 'string' && e.city.trim().length > 0
        const hasCountry = typeof e.country === 'string' && e.country.trim().length > 0
        const locationLine = hasCity && hasCountry
          ? `${e.city}, ${e.country}`
          : hasCity ? e.city
          : hasCountry ? e.country
          : null

        const placeholderInner = (label: string, sub: string) => (
          <div style={{ minHeight: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#777', fontStyle: 'italic', marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#999' }}>{sub}</div>
          </div>
        )

        return (
          <>
            <SectionCard layout="flex">
              <div style={{ flex: '0 0 auto' }}>
                {hasAvatar ? (
                  <img src={e.avatar_url as string} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 18,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    width: 56,
                    height: 56,
                  }}>
                    {initials.length > 0 ? initials : '—'}
                  </div>
                )}
              </div>
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: 22, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
                  {maskedName.length > 0
                    ? maskedName
                    : <em style={{ color: '#666', fontStyle: 'italic', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Not specified</em>}
                </div>
                {hasHeadline && (
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.4, marginBottom: 4 }}>
                    {e.headline}
                  </div>
                )}
                {hasJob && (
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#999', lineHeight: 1.4, marginBottom: 2 }}>
                    {e.job_title}
                  </div>
                )}
                {locationLine && (
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999', lineHeight: 1.4 }}>
                    {locationLine}
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard eyebrow="About">
              {placeholderInner('Coming soon', 'A short professional bio that introduces you to recruiters.')}
            </SectionCard>

            <SectionCard eyebrow="Experience">
              {placeholderInner('Coming soon', 'Public-safe career history with brand names confidential.')}
            </SectionCard>

            <SectionCard eyebrow="Skills & expertise">
              {placeholderInner('Coming soon', 'Skills, expertise tags, sectors, and languages.')}
            </SectionCard>
          </>
        )
      })()}

      {tab === 'edit' && (
        <>
      <div style={sub}>Screen {step} / {TOTAL} · {SCREEN_TITLES[step]}</div>
      {(() => {
        const fn = e.first_name ?? ''
        const ln = e.last_name ?? ''
        const fullName = `${fn} ${ln}`.trim()
        const initials = `${(fn[0] ?? '').toUpperCase()}${(ln[0] ?? '').toUpperCase()}`.trim()
        const hasAvatar = typeof e.avatar_url === 'string' && e.avatar_url.trim().length > 0
        const hasHeadline = typeof e.headline === 'string' && e.headline.trim().length > 0
        const hasJob = typeof e.job_title === 'string' && e.job_title.trim().length > 0
        const hasEmp = typeof e.current_employer === 'string' && e.current_employer.trim().length > 0
        const positionLine = hasJob && hasEmp
          ? `${e.job_title} · ${e.current_employer}`
          : hasJob
            ? e.job_title
            : hasEmp
              ? e.current_employer
              : null
        const hasCity = typeof e.city === 'string' && e.city.trim().length > 0
        const hasCountry = typeof e.country === 'string' && e.country.trim().length > 0
        const locationLine = hasCity && hasCountry
          ? `${e.city}, ${e.country}`
          : hasCity
            ? e.city
            : hasCountry
              ? e.country
              : null
        return (
          <SectionCard layout="flex">
            <div style={{ flex: '0 0 auto' }}>
              {hasAvatar ? (
                <img src={e.avatar_url as string} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{
                  background: '#333',
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 18,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                }}>
                  {initials.length > 0 ? initials : '—'}
                </div>
              )}
            </div>
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: 22, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
                {fullName.length > 0
                  ? fullName
                  : <em style={{ color: '#666', fontStyle: 'italic', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Not specified</em>}
              </div>
              {hasHeadline && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.4, marginBottom: 4 }}>
                  {e.headline}
                </div>
              )}
              {positionLine && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#999', lineHeight: 1.4, marginBottom: 2 }}>
                  {positionLine}
                </div>
              )}
              {locationLine && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999', lineHeight: 1.4 }}>
                  {locationLine}
                </div>
              )}
            </div>
            <div style={{ flex: '0 0 auto', textAlign: 'right', alignSelf: 'center' }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#777' }}>
                {e.profile_completeness ?? 0}% complete
              </div>
            </div>
          </SectionCard>
        )
      })()}
      {/* CV upload + parse card — S1 */}
      <SectionCard eyebrow="CV">
        {!cvUrl && (
          <>
            <div style={{ fontSize: 13, color: '#ccc', marginBottom: 14 }}>Upload your CV. JOBLUX will parse it for review.</div>
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              style={uploading ? saveBtnDis : saveBtn}
            >
              {uploading ? 'Uploading...' : 'Upload CV'}
            </button>
          </>
        )}

        {cvUrl && !cvParsedAt && (
          <>
            <div style={{ fontSize: 13, color: '#ccc', marginBottom: 14 }}>
              CV uploaded.{' '}
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={uploading}
                style={{ background: 'transparent', border: 'none', color: '#ccc', textDecoration: 'underline', cursor: uploading ? 'default' : 'pointer', padding: 0, fontFamily: 'Inter, sans-serif', fontSize: 13 }}
              >
                {uploading ? 'Uploading...' : 'Replace'}
              </button>
            </div>
            <button
              type="button"
              onClick={handleParse}
              disabled={parsing}
              style={parsing ? saveBtnDis : saveBtn}
            >
              {parsing ? 'Parsing...' : 'Parse CV'}
            </button>
          </>
        )}

        {cvUrl && cvParsedAt && (
          <>
            <div style={{ fontSize: 13, color: '#ccc', marginBottom: 14 }}>
              CV parsed {parsedDateLabel}.{' '}
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={uploading}
                style={{ background: 'transparent', border: 'none', color: '#ccc', textDecoration: 'underline', cursor: uploading ? 'default' : 'pointer', padding: 0, fontFamily: 'Inter, sans-serif', fontSize: 13 }}
              >
                {uploading ? 'Uploading...' : 'Replace'}
              </button>
            </div>
            <button
              type="button"
              onClick={handleParse}
              disabled={parsing}
              style={{ background: 'transparent', color: '#fff', border: '1px solid #444', padding: '8px 16px', cursor: parsing ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, opacity: parsing ? 0.5 : 1 }}
            >
              {parsing ? 'Parsing...' : 'Re-parse'}
            </button>
          </>
        )}

        {(parseError || uploadError) && (
          <div style={{ marginTop: 10, fontSize: 11, color: '#ff6b6b' }}>{parseError || uploadError}</div>
        )}

        {needsReviewCount !== null && needsReviewCount > 0 && (
          <div style={{ marginTop: 10, fontSize: 11, color: '#888' }}>
            {needsReviewCount} {needsReviewCount === 1 ? 'item' : 'items'} to review
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileSelected}
          style={{ display: 'none' }}
        />
      </SectionCard>
      {/* Identity prefill review panel - S1.5 */}
      {(() => {
        const sug = editor.cv_identity_suggestions
        const keys: Array<'first_name' | 'last_name' | 'city' | 'nationality'> = []
        if (sug.first_name !== undefined) keys.push('first_name')
        if (sug.last_name !== undefined) keys.push('last_name')
        if (sug.city !== undefined) keys.push('city')
        if (sug.nationality !== undefined) keys.push('nationality')
        if (keys.length === 0 || suggestionDismissed) return null
        const labels: Record<typeof keys[number], string> = {
          first_name: 'First name',
          last_name: 'Last name',
          city: 'City',
          nationality: 'Nationality',
        }
        const checkedCount = keys.filter(k => suggestionSelected[k]).length
        return (
          <SectionCard eyebrow="Apply suggestions from your CV">
            <div style={{ fontSize: 13, color: '#ccc', marginBottom: 14 }}>
              Your CV contains values for fields that are still empty on your ProfiLux. Select what you want to apply.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '24px 160px 1fr', gap: 8, fontSize: 13, lineHeight: 1.6 }}>
              {keys.map((k) => (
                <React.Fragment key={k}>
                  <input
                    type="checkbox"
                    checked={suggestionSelected[k]}
                    onChange={(ev) => setSuggestionSelected(prev => ({ ...prev, [k]: ev.target.checked }))}
                    style={{ accentColor: '#a58e28' }}
                  />
                  <div style={{ color: '#999' }}>{labels[k]}</div>
                  <div style={{ color: '#fff' }}>{sug[k]}</div>
                </React.Fragment>
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleApplySuggestions}
                disabled={applying || checkedCount === 0}
                style={(applying || checkedCount === 0) ? saveBtnDis : saveBtn}
              >
                {applying ? 'Applying...' : `Apply selected${checkedCount > 0 ? ` (${checkedCount})` : ''}`}
              </button>
              <button
                type="button"
                onClick={() => setSuggestionDismissed(true)}
                disabled={applying}
                style={{ background: 'transparent', border: 'none', color: '#999', textDecoration: 'underline', cursor: applying ? 'default' : 'pointer', padding: 0, fontFamily: 'Inter, sans-serif', fontSize: 13 }}
              >
                Dismiss
              </button>
              {applyError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{applyError}</span>}
            </div>
          </SectionCard>
        )
      })()}
      <SectionCard eyebrow="Current Position">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div />
          <button
            type="button"
            onClick={() => setCurrentPositionDrawerOpen(true)}
            style={{
              background: 'transparent',
              color: '#ccc',
              border: '1px solid #2a2a2a',
              padding: '6px 12px',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Edit
          </button>
        </div>
        <div style={grid}>
          <div style={label}>Job title</div>
          <div>{e.job_title ?? <NotSet />}</div>
          <div style={label}>Current employer</div>
          <div>{e.current_employer ?? <NotSet />}</div>
          <div style={label}>Seniority</div>
          <div>{seniorityLabel(e.seniority) ?? <NotSet />}</div>
          <div style={label}>Years of experience</div>
          <div>{e.total_years_experience != null ? String(e.total_years_experience) : <NotSet />}</div>
        </div>
      </SectionCard>
      <Drawer
        open={currentPositionDrawerOpen}
        title="Current Position"
        onClose={() => setCurrentPositionDrawerOpen(false)}
      >
        <div style={grid}>
          <div style={label}>Job title</div>
          <div><input style={input} value={draft.job_title} onChange={(ev) => setDraft({ ...draft, job_title: ev.target.value })} placeholder="e.g. Boutique Director" /></div>
          <div style={label}>Current employer</div>
          <div><input style={input} value={draft.current_employer} onChange={(ev) => setDraft({ ...draft, current_employer: ev.target.value })} placeholder="e.g. Hermès" /></div>
          <div style={label}>Seniority</div>
          <div>
            <select style={select} value={draft.seniority} onChange={(ev) => setDraft({ ...draft, seniority: ev.target.value })}>
              <option value="">— Select seniority —</option>
              {PROFILUX_SENIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div style={label}>Years of experience</div>
          <div><input style={input} type="number" min={0} value={draft.total_years_experience} onChange={(ev) => setDraft({ ...draft, total_years_experience: ev.target.value })} placeholder="e.g. 12" /></div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={saving ? saveBtnDis : saveBtn} disabled={saving} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          {savedAt && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
          {saveError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError}</span>}
        </div>
      </Drawer>
      <SectionCard eyebrow="Skills & Markets">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div />
          <button
            type="button"
            onClick={() => setSkillsMarketsDrawerOpen(true)}
            style={{
              background: 'transparent',
              color: '#ccc',
              border: '1px solid #2a2a2a',
              padding: '6px 12px',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Edit
          </button>
        </div>
        <div style={grid}>
          <div style={label}>Skills</div>
          <div>{e.key_skills.length > 0 ? e.key_skills.map(skillLabel).join(', ') : <NoneSel />}</div>
          <div style={label}>Markets</div>
          <div>{e.market_knowledge.length > 0
            ? (typeof PROFILUX_MARKET_OPTIONS[0] === 'string'
                ? e.market_knowledge.join(', ')
                : e.market_knowledge.map(v => ((PROFILUX_MARKET_OPTIONS as unknown as Array<{ value: string, label: string }>).find(o => o.value === v)?.label) ?? v).join(', '))
            : <NoneSel />}</div>
        </div>
      </SectionCard>
      <Drawer
        open={skillsMarketsDrawerOpen}
        title="Skills & Markets"
        onClose={() => setSkillsMarketsDrawerOpen(false)}
      >
        <div style={sectionLabel}>Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {PROFILUX_SKILL_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              style={draft7.key_skills.includes(o.value) ? chipActive : chip}
              onClick={() => setDraft7({ ...draft7, key_skills: draft7.key_skills.includes(o.value) ? draft7.key_skills.filter(v => v !== o.value) : [...draft7.key_skills, o.value] })}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div style={sectionLabel}>Markets</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {PROFILUX_MARKET_OPTIONS.map((o) => (
            <button
              key={o}
              type="button"
              style={draft7.market_knowledge.includes(o) ? chipActive : chip}
              onClick={() => setDraft7({ ...draft7, market_knowledge: draft7.market_knowledge.includes(o) ? draft7.market_knowledge.filter(v => v !== o) : [...draft7.market_knowledge, o] })}
            >
              {o}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={saving7 ? saveBtnDis : saveBtn} disabled={saving7} onClick={handleSave7}>
            {saving7 ? 'Saving…' : 'Save'}
          </button>
          {savedAt7 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
          {saveError7 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError7}</span>}
        </div>
      </Drawer>
      <SectionCard eyebrow="Compensation">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div />
          <button
            type="button"
            onClick={() => setCompensationDrawerOpen(true)}
            style={{
              background: 'transparent',
              color: '#ccc',
              border: '1px solid #2a2a2a',
              padding: '6px 12px',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Edit
          </button>
        </div>
        <div style={grid}>
          <div style={label}>Target compensation (min)</div>
          <div>{e.desired_salary_min != null ? String(e.desired_salary_min) : <NotSet />}</div>
          <div style={label}>Target compensation (max)</div>
          <div>{e.desired_salary_max != null ? String(e.desired_salary_max) : <NotSet />}</div>
          <div style={label}>Currency</div>
          <div>{e.desired_salary_currency ?? <NotSet />}</div>
        </div>
      </SectionCard>
      <Drawer
        open={compensationDrawerOpen}
        title="Compensation"
        onClose={() => setCompensationDrawerOpen(false)}
      >
        <div style={grid}>
          <div style={label}>Target compensation (min)</div>
          <div><input style={input} type="number" min={0} value={draft10?.desired_salary_min ?? ''} onChange={(ev) => setDraft10(d => d && ({ ...d, desired_salary_min: ev.target.value === '' ? null : Number(ev.target.value) }))} placeholder="e.g. 80000" /></div>
          <div style={label}>Target compensation (max)</div>
          <div><input style={input} type="number" min={0} value={draft10?.desired_salary_max ?? ''} onChange={(ev) => setDraft10(d => d && ({ ...d, desired_salary_max: ev.target.value === '' ? null : Number(ev.target.value) }))} placeholder="e.g. 120000" /></div>
          <div style={label}>Currency</div>
          <div>
            <select style={input} value={draft10?.desired_salary_currency ?? ''} onChange={(ev) => setDraft10(d => d && ({ ...d, desired_salary_currency: ev.target.value === '' ? null : ev.target.value }))}>
              <option value="">— Not specified —</option>
              {PROFILUX_CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={saving10 || !draft10 ? saveBtnDis : saveBtn} disabled={saving10 || !draft10} onClick={handleSave10}>
            {saving10 ? 'Saving…' : 'Save'}
          </button>
          {savedAt10 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
          {saveError10 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError10}</span>}
        </div>
      </Drawer>
      <SectionCard eyebrow="Clienteling">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div />
          <button
            type="button"
            onClick={() => setClientelingDrawerOpen(true)}
            style={{
              background: 'transparent',
              color: '#ccc',
              border: '1px solid #2a2a2a',
              padding: '6px 12px',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Edit
          </button>
        </div>
        <div style={grid}>
          <div style={label}>Clienteling experience</div>
          <div>{e.clienteling_experience === true ? 'Yes' : e.clienteling_experience === false ? 'No' : <NotSet />}</div>
          <div style={label}>Background description</div>
          <div>{e.clienteling_experience === true && typeof e.clienteling_description === 'string' && e.clienteling_description.length > 0 ? e.clienteling_description : <NotSet />}</div>
        </div>
      </SectionCard>
      <Drawer
        open={clientelingDrawerOpen}
        title="Clienteling"
        onClose={() => setClientelingDrawerOpen(false)}
      >
        <div style={sectionLabel}>Clienteling experience</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          <button
            type="button"
            style={draft8.clienteling_experience === true ? chipActive : chip}
            onClick={() => setDraft8(prev => prev.clienteling_experience === true
              ? { clienteling_experience: null, clienteling_description: '' }
              : { clienteling_experience: true, clienteling_description: prev.clienteling_description })}
          >
            Yes
          </button>
          <button
            type="button"
            style={draft8.clienteling_experience === false ? chipActive : chip}
            onClick={() => setDraft8(prev => ({
              clienteling_experience: prev.clienteling_experience === false ? null : false,
              clienteling_description: '',
            }))}
          >
            No
          </button>
        </div>

        {draft8.clienteling_experience === true && (
          <>
            <div style={sectionLabel}>Background description</div>
            <textarea
              style={{ ...input, maxWidth: 600, fontFamily: 'Inter, sans-serif', minHeight: 80, resize: 'vertical' }}
              rows={3}
              value={draft8.clienteling_description}
              onChange={(ev) => setDraft8(prev => ({ ...prev, clienteling_description: ev.target.value }))}
              placeholder="Briefly describe your clienteling experience"
            />
          </>
        )}

        <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={saving8 ? saveBtnDis : saveBtn} disabled={saving8} onClick={handleSave8}>
            {saving8 ? 'Saving…' : 'Save'}
          </button>
          {savedAt8 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
          {saveError8 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError8}</span>}
        </div>
      </Drawer>
      {renderStep()}
      <div style={navWrap}>
        <button style={step === 1 ? btnDis : btn} disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))}>← Prev</button>
        <button style={step === TOTAL ? btnDis : btn} disabled={step === TOTAL} onClick={() => setStep(s => Math.min(TOTAL, s + 1))}>Next →</button>
        <span style={{ color: '#666', fontSize: 12, marginLeft: 16 }}>Completeness: {e.profile_completeness}%</span>
      </div>
        </>
      )}

      {tab === 'manage' && (
        <>
          <SectionCard>
            <div style={{ padding: '20px' }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#999', marginBottom: 16 }}>
                Sharing, visibility, account settings — coming soon.
              </div>
              <button
                type="button"
                onClick={() => setDrawerDemoOpen(true)}
                style={{
                  background: 'transparent',
                  color: '#ccc',
                  border: '1px solid #2a2a2a',
                  padding: '10px 18px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Preview drawer (demo)
              </button>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#777', fontStyle: 'italic', marginTop: 12 }}>
                Demo only — drawer wiring for future section editing.
              </div>
            </div>
          </SectionCard>
          <Drawer
            open={drawerDemoOpen}
            title="Drawer demo"
            onClose={() => setDrawerDemoOpen(false)}
          >
            <p style={{ marginTop: 0 }}>
              This is a demo drawer. It validates the open/close mechanics: ESC key, backdrop click (desktop), and the X button.
            </p>
            <p>
              Future Edit-mode drawers will host per-section forms (per MATRIX v1.2 §22), each scoped to a single section card on the passport.
            </p>
            <p style={{ color: '#999', fontSize: 13 }}>
              No data is persisted from this drawer.
            </p>
          </Drawer>
        </>
      )}
    </div>
  )
}
