'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { EditorView, MaskableField } from '@/lib/profilux/types'
import { MASKABLE_FIELDS } from '@/lib/profilux/types'
import { PROFILUX_SENIORITY_OPTIONS, PROFILUX_PRODUCT_CATEGORY_OPTIONS, PROFILUX_EXPERTISE_TAG_OPTIONS, PROFILUX_CURRENCY_OPTIONS, PROFILUX_DEPARTMENT_OPTIONS, PROFILUX_CONTRACT_TYPE_OPTIONS, PROFILUX_LOCATION_OPTIONS, PROFILUX_SKILL_OPTIONS, PROFILUX_MARKET_OPTIONS, PROFILUX_SECTOR_OPTIONS } from '@/lib/profilux/vocabulary'

const TOTAL = 11

// A2.4: gate the 11-screen tunnel out of the visible Edit experience.
// renderStep, navWrap, SCREEN_TITLES, step state are all preserved — only
// the render is gated. Flip to true to revive.
const TUNNEL_VISIBLE = false
const SCREEN_TITLES = [
  '', 'Identity', 'Headline', 'Current Position', 'Luxury Fit',
  'Career History', 'Education & Languages', 'Skills & Markets',
  'Clienteling', 'Availability & Targets', 'Compensation', 'Confirm',
]

const NotSet = () => <em style={{ color: '#666' }}>Not set</em>
const NoneSel = () => <em style={{ color: '#666' }}>None selected</em>
const Hint = ({ children }: { children: React.ReactNode }) => <em style={{ color: '#888' }}>{children}</em>

// A2.6 — State marker family (MATRIX §24.3, §14.3).
// View tab only. Replaces inline <NotSet /> / <NoneSel /> on View cards.
// Edit tab keeps NotSet/NoneSel verbatim.
type MarkerKind = 'missing' | 'review'
const Marker = ({ kind }: { kind: MarkerKind }) => {
  if (kind === 'review') {
    return (
      <span style={{
        display: 'inline-block',
        background: 'rgba(165, 142, 40, 0.15)',
        color: '#a58e28',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: 0.3,
      }}>Review</span>
    )
  }
  return (
    <em style={{ color: '#777', fontSize: 13, fontStyle: 'italic' }}>Missing</em>
  )
}

const wrap: React.CSSProperties = { maxWidth: 1200, margin: '0 auto', padding: '0 28px', background: '#1a1a1a', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }
const h1Style: React.CSSProperties = { fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: 28, marginBottom: 8 }
const sub: React.CSSProperties = { color: '#999', fontSize: 13, marginBottom: 24 }
const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 28,
  borderBottom: '1px solid #2a2a2a',

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
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '240px 1fr', gap: 12, fontSize: 14, lineHeight: 1.6 }
const label: React.CSSProperties = { color: '#999' }
const navWrap: React.CSSProperties = { marginTop: 40, display: 'flex', gap: 12, alignItems: 'center' }
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
  headerAction?: React.ReactNode
  children: React.ReactNode
}

function SectionCard({ eyebrow, layout = 'block', headerAction, children }: SectionCardProps) {
  const base: React.CSSProperties = {
    background: '#1c1c1c',
    border: '0.5px solid #2a2a2a',
    borderRadius: 12,
    padding: '24px 28px',
    marginBottom: 14,
  }
  const flexExtras: React.CSSProperties = layout === 'flex'
    ? { display: 'flex', alignItems: 'center', gap: 20 }
    : {}
  const eyebrowStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    color: '#8e8e8e',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  }
  const headerRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: '0.5px solid rgba(255,255,255,0.04)',
  }
  return (
    <div style={{ ...base, ...flexExtras }}>
      {(eyebrow || headerAction) && (
        <div style={headerRowStyle}>
          {eyebrow ? <div style={eyebrowStyle}>{eyebrow}</div> : <div />}
          {headerAction ?? null}
        </div>
      )}
      {children}
    </div>
  )
}

// A2.8 — View tab collapse/expand wrapper.
// Wraps a SectionCard with a clickable header row + chevron. Used ONLY on
// the 9 §22.1 View tab cards in pass 2. Edit + Manage tabs untouched.
// No persistence (refresh resets to doctrine default per Mo's lock).
// Doctrine: MATRIX §23.6 — filled-collapsed, empty-expanded. Density choice
// decided per-card by the caller via the `collapsed` prop.
type CollapsibleSectionCardProps = {
  eyebrow: string
  collapsed: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleSectionCard({ eyebrow, collapsed, onToggle, children }: CollapsibleSectionCardProps) {
  const cardBase: React.CSSProperties = {
    background: '#222',
    border: '1px solid #2a2a2a',
    borderRadius: 6,
    padding: '20px 24px',
    marginBottom: 24,
  }
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none',
    marginBottom: collapsed ? 0 : 10,
  }
  const eyebrowStyle: React.CSSProperties = {
    fontSize: 10,
    color: '#999',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  }
  const chevronStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    color: '#999',
    lineHeight: 1,
    transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)',
    transition: 'transform 160ms ease-out',
    display: 'inline-block',
  }
  return (
    <div style={cardBase}>
      <div
        role="button"
        aria-expanded={!collapsed}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onToggle() } }}
        style={headerStyle}
      >
        <div style={eyebrowStyle}>{eyebrow}</div>
        <span aria-hidden="true" style={chevronStyle}>›</span>
      </div>
      {!collapsed && <div>{children}</div>}
    </div>
  )
}

type ViewZoneProps = { title: string; children: React.ReactNode }

function ViewZone({ title, children }: ViewZoneProps) {
  const wrap: React.CSSProperties = {
    background: '#222',
    border: '1px solid #2a2a2a',
    borderRadius: 14,
    padding: '24px 26px',
    marginBottom: 18,
  }
  const titleStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    fontSize: 10.5,
    color: '#8e8e8e',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    margin: 0,
    paddingBottom: 14,
    marginBottom: 18,
    borderBottom: '0.5px solid #2a2a2a',
  }
  return (
    <div style={wrap}>
      <h3 style={titleStyle}>{title}</h3>
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

type Screen1Draft = {
  first_name: string
  last_name: string
  city: string
  country: string
  nationality: string
  phone: string
  headline: string
  bio: string
}

type ExperienceDraft = {
  id?: string
  job_title: string
  company: string
  city: string
  country: string
  start_date: string
  end_date: string
  is_current: boolean
  description: string
}

const emptyExperienceDraft = (): ExperienceDraft => ({
  job_title: '',
  company: '',
  city: '',
  country: '',
  start_date: '',
  end_date: '',
  is_current: false,
  description: '',
})

type EducationDraft = {
  id?: string
  institution: string
  degree_level: string
  field_of_study: string
  city: string
  country: string
  start_year: string
  graduation_year: string
}

const emptyEducationDraft = (): EducationDraft => ({
  institution: '',
  degree_level: '',
  field_of_study: '',
  city: '',
  country: '',
  start_year: '',
  graduation_year: '',
})

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

function draftFrom7(e: EditorView): Screen7Draft {
  return {
    key_skills: e.key_skills ?? [],
    market_knowledge: e.market_knowledge ?? [],
  }
}

function draftFrom1(e: EditorView): Screen1Draft {
  return {
    first_name: e.first_name ?? '',
    last_name: e.last_name ?? '',
    city: e.city ?? '',
    country: e.country ?? '',
    nationality: e.nationality ?? '',
    phone: e.phone ?? '',
    headline: e.headline ?? '',
    bio: e.bio ?? '',
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
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  // A2.8 — View tab per-card collapse state. Keys mirror the 9 §22.1
  // sections. undefined = "use doctrine default for this card";
  // true/false = "user choice". No persistence: refresh resets (Mo lock).
  type ViewCollapseKey =
    | 'identity'
    | 'current_position'
    | 'expertise'
    | 'career_history'
    | 'maisons'
    | 'education'
    | 'languages'
    | 'clienteling'
    | 'availability'
    | 'compensation'
  const [viewCollapse, setViewCollapse] = useState<Partial<Record<ViewCollapseKey, boolean>>>({})
  const toggleViewCollapse = (key: ViewCollapseKey, doctrineDefault: boolean) => {
    setViewCollapse(prev => {
      const current = prev[key]
      const effective = current === undefined ? doctrineDefault : current
      return { ...prev, [key]: !effective }
    })
  }
  const isCardCollapsed = (key: ViewCollapseKey, doctrineDefault: boolean) => {
    const v = viewCollapse[key]
    return v === undefined ? doctrineDefault : v
  }
  const [shareStatus, setShareStatus] = useState<{
    share_slug: string | null
    sharing_enabled: boolean
    public_url: string | null
    can_share: boolean
    password_set: boolean
    expires_at: string | null
    view_count: number
  } | null>(null)
  const [shareStatusError, setShareStatusError] = useState<string | null>(null)
  const [shareStatusLoading, setShareStatusLoading] = useState(false)
  const [sharingToggleSaving, setSharingToggleSaving] = useState(false)
  const [sharingToggleError, setSharingToggleError] = useState<string | null>(null)
  const [reserving, setReserving] = useState(false)
  const [reserveError, setReserveError] = useState<string | null>(null)
  const [passwordDraft, setPasswordDraft] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [expiryDraft, setExpiryDraft] = useState('')
  const [expirySaving, setExpirySaving] = useState(false)
  const [expiryError, setExpiryError] = useState<string | null>(null)
  const [currentPositionDrawerOpen, setCurrentPositionDrawerOpen] = useState(false)
  const [luxuryFitDrawerOpen, setLuxuryFitDrawerOpen] = useState(false)
  const [skillsMarketsDrawerOpen, setSkillsMarketsDrawerOpen] = useState(false)
  const [compensationDrawerOpen, setCompensationDrawerOpen] = useState(false)
  const [clientelingDrawerOpen, setClientelingDrawerOpen] = useState(false)
  const [availabilityTargetsDrawerOpen, setAvailabilityTargetsDrawerOpen] = useState(false)
  // PF-2 P-A.UI.2 — Languages (L2 add + edit-in-place drawer)
  const [languagesDrawerOpen, setLanguagesDrawerOpen] = useState(false)
  const [languagesL2, setLanguagesL2] = useState<Array<{ id: string; language: string; proficiency: string }> | null>(null)
  const [languagesFormOpen, setLanguagesFormOpen] = useState(false)
  const [languagesEditDraft, setLanguagesEditDraft] = useState<{ id?: string; language: string; proficiency: string }>({ language: '', proficiency: '' })
  const [languagesActioning, setLanguagesActioning] = useState(false)
  const [languagesError, setLanguagesError] = useState<string | null>(null)
  // PF-2 P-A.UI — Sectors (L2-only) inside Luxury Fit drawer
  const [sectorsL2, setSectorsL2] = useState<Array<{ id?: string; sector: string; rank: number }> | null>(null)
  const [sectorsActioning, setSectorsActioning] = useState<string | null>(null)
  const [sectorsError, setSectorsError] = useState<string | null>(null)
  // PF-2 P-A.UI — Maisons drawer (text[] textarea)
  const [maisonsDrawerOpen, setMaisonsDrawerOpen] = useState(false)
  const [maisonsDraftText, setMaisonsDraftText] = useState('')
  const [maisonsSaving, setMaisonsSaving] = useState(false)
  const [maisonsError, setMaisonsError] = useState<string | null>(null)
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
  const [identityDrawerOpen, setIdentityDrawerOpen] = useState(false)
  const [careerHistoryDrawerOpen, setCareerHistoryDrawerOpen] = useState(false)
  const [experienceFormOpen, setExperienceFormOpen] = useState(false)
  const [experienceDraft, setExperienceDraft] = useState<ExperienceDraft>(emptyExperienceDraft())
  const [experienceSaving, setExperienceSaving] = useState(false)
  const [experienceError, setExperienceError] = useState<string | null>(null)
  const [experienceDeleting, setExperienceDeleting] = useState<string | null>(null)
  const [educationDrawerOpen, setEducationDrawerOpen] = useState(false)
  const [educationFormOpen, setEducationFormOpen] = useState(false)
  const [educationDraft, setEducationDraft] = useState<EducationDraft>(emptyEducationDraft())
  const [educationSaving, setEducationSaving] = useState(false)
  const [educationError, setEducationError] = useState<string | null>(null)
  const [educationDeleting, setEducationDeleting] = useState<string | null>(null)
  const [draft1, setDraft1] = useState<Screen1Draft>({
    first_name: '', last_name: '', city: '', country: '',
    nationality: '', phone: '', headline: '', bio: '',
  })
  const [saving1, setSaving1] = useState(false)
  const [savedAt1, setSavedAt1] = useState<number | null>(null)
  const [saveError1, setSaveError1] = useState<string | null>(null)
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
  const [actioning, setActioning] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  // S-B.1B.4 — per-row in-flight state for education suggestions panel.
  // Reuses actionError for failures; no education-specific error hook.
  const [educationActioningSig, setEducationActioningSig] = useState<string | null>(null)

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
      setDraft10(draftFrom10(e))
      setDraft9(draftFrom9(e))
      setDraft7(draftFrom7(e))
      setDraft1(draftFrom1(e))
    }
    return e
  }

  // PF-2 P1 — per-field mask toggle helper. The per-section "PUBLIC" toggle was
  // reverted: no public/section concept on the candidate side. Substrate
  // (section_visibility column + projectFor public consumer) stays in place.
  const [maskToggling, setMaskToggling] = useState<MaskableField | null>(null)
  const toggleMaskedField = async (field: MaskableField, nextValue: boolean) => {
    if (!editor) return
    setMaskToggling(field)
    try {
      const next = { ...(editor.masked_fields ?? {}), [field]: nextValue }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masked_fields: next }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
    } catch {
      // see above
    } finally {
      setMaskToggling(null)
    }
  }

  // PF-2 P-A.UI — Languages helpers
  async function fetchLanguagesL2() {
    try {
      const r = await fetch('/api/members/languages')
      if (!r.ok) {
        setLanguagesL2([])
        return
      }
      const d = await r.json()
      setLanguagesL2(Array.isArray(d.languages) ? d.languages : [])
    } catch {
      setLanguagesL2([])
    }
  }
  function emptyLanguageDraft(): { id?: string; language: string; proficiency: string } {
    return { language: '', proficiency: '' }
  }
  async function openLanguagesDrawer() {
    setLanguagesError(null)
    setLanguagesEditDraft(emptyLanguageDraft())
    setLanguagesFormOpen(false)
    setLanguagesDrawerOpen(true)
    await fetchLanguagesL2()
  }
  function startNewLanguage() {
    setLanguagesEditDraft(emptyLanguageDraft())
    setLanguagesError(null)
    setLanguagesFormOpen(true)
  }
  function startEditLanguageL2(row: { id?: string; language: string; proficiency: string }) {
    if (!row.id) return
    setLanguagesEditDraft({ id: row.id, language: row.language ?? '', proficiency: row.proficiency ?? '' })
    setLanguagesError(null)
    setLanguagesFormOpen(true)
  }
  function cancelLanguageEdit() {
    setLanguagesEditDraft(emptyLanguageDraft())
    setLanguagesError(null)
    setLanguagesFormOpen(false)
  }
  async function handleSaveLanguageL2() {
    const language = languagesEditDraft.language.trim()
    const proficiency = languagesEditDraft.proficiency.trim()
    if (!language || !proficiency) {
      setLanguagesError('Language and proficiency are required.')
      return
    }
    const isUpdate = typeof languagesEditDraft.id === 'string'
    setLanguagesActioning(true)
    setLanguagesError(null)
    try {
      const payload: Record<string, unknown> = { language, proficiency }
      if (isUpdate) payload.id = languagesEditDraft.id
      const res = await fetch('/api/members/languages', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setLanguagesError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await fetchLanguagesL2()
      await refetch()
      setLanguagesEditDraft(emptyLanguageDraft())
      setLanguagesFormOpen(false)
    } catch (err) {
      setLanguagesError(String(err))
    } finally {
      setLanguagesActioning(false)
    }
  }
  async function handleDeleteLanguageL2(id: string) {
    setLanguagesActioning(true)
    setLanguagesError(null)
    try {
      const res = await fetch(`/api/members/languages?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setLanguagesError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await fetchLanguagesL2()
      await refetch()
    } catch (err) {
      setLanguagesError(String(err))
    } finally {
      setLanguagesActioning(false)
    }
  }

  // PF-2 P-A.UI — Sectors helpers (L2-only inside Luxury Fit drawer)
  async function fetchSectorsL2() {
    try {
      const r = await fetch('/api/profilux/sectors')
      if (!r.ok) {
        setSectorsL2([])
        return
      }
      const d = await r.json()
      setSectorsL2(Array.isArray(d.sectors) ? d.sectors : [])
    } catch {
      setSectorsL2([])
    }
  }
  const updateSectorRow = (idx: number, patch: Partial<{ sector: string; rank: number }>) => {
    setSectorsL2(prev => {
      const list = prev ?? []
      return list.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    })
  }
  const addSectorRow = () => {
    setSectorsL2(prev => {
      const list = prev ?? []
      const nextRank = list.length === 0 ? 1 : Math.max(...list.map(r => Number(r.rank) || 0)) + 1
      return [...list, { sector: '', rank: nextRank }]
    })
  }
  async function saveSectorRow(idx: number) {
    const list = sectorsL2 ?? []
    const row = list[idx]
    if (!row) return
    const sector = (row.sector ?? '').trim()
    const rank = Number.isFinite(row.rank) ? Math.trunc(Number(row.rank)) : NaN
    if (!sector || !Number.isFinite(rank) || rank < 0) {
      setSectorsError('Sector and a non-negative rank are required.')
      return
    }
    const key = row.id ?? `_tmp_${idx}`
    setSectorsActioning(key)
    setSectorsError(null)
    try {
      const isUpdate = typeof row.id === 'string'
      const res = await fetch('/api/profilux/sectors', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, sector, rank }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setSectorsError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await fetchSectorsL2()
      await refetch()
    } catch (err) {
      setSectorsError(String(err))
    } finally {
      setSectorsActioning(null)
    }
  }
  async function deleteSectorRow(idx: number) {
    const list = sectorsL2 ?? []
    const row = list[idx]
    if (!row) return
    if (!row.id) {
      setSectorsL2(list.filter((_, i) => i !== idx))
      return
    }
    setSectorsActioning(row.id)
    setSectorsError(null)
    try {
      const res = await fetch('/api/profilux/sectors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setSectorsError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await fetchSectorsL2()
      await refetch()
    } catch (err) {
      setSectorsError(String(err))
    } finally {
      setSectorsActioning(null)
    }
  }

  // PF-2 P-A.UI — Maisons (brands_worked_with) drawer
  function openMaisonsDrawer() {
    setMaisonsError(null)
    setMaisonsDraftText((editor?.brands_worked_with ?? []).join('\n'))
    setMaisonsDrawerOpen(true)
  }
  async function handleSaveMaisons() {
    setMaisonsSaving(true)
    setMaisonsError(null)
    try {
      const arr = maisonsDraftText.split('\n').map(s => s.trim()).filter(s => s !== '')
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brands_worked_with: arr }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setMaisonsError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      setMaisonsDrawerOpen(false)
    } catch (err) {
      setMaisonsError(String(err))
    } finally {
      setMaisonsSaving(false)
    }
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
    setParseError(null)
    try {
      const fd = new FormData()
      fd.append('cv', file)
      const res = await fetch('/api/members/cv-upload', { method: 'POST', body: fd })
      if (!res.ok) {
        setUploadError('Upload failed. Try again.')
      } else {
        await refetch()
        setNeedsReviewCount(null)

        // MLV-1 Phase 1: auto-fire parse immediately after successful upload.
        // Prevents the silent drop-off where uploads landed but parse was
        // never invoked. Failures surface as parseError; the manual
        // "Parse CV" button remains available as a retry fallback.
        setParsing(true)
        try {
          const parseRes = await fetch('/api/members/cv-parse', { method: 'POST' })
          const parseData = await parseRes.json().catch(() => ({} as any))
          if (parseRes.ok && parseData?.success) {
            await refetch()
            setNeedsReviewCount(
              typeof parseData?.needs_review_count === 'number' ? parseData.needs_review_count : null
            )
          } else {
            setParseError(mapParseError(parseData?.error ?? null))
          }
        } catch {
          setParseError(mapParseError(null))
        } finally {
          setParsing(false)
        }
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

  function normalizeShareStatus(data: any) {
    return {
      share_slug: data?.share_slug ?? null,
      sharing_enabled: data?.sharing_enabled === true,
      public_url: data?.public_url ?? null,
      can_share: data?.can_share === true,
      password_set: data?.password_set === true,
      expires_at: data?.expires_at ?? null,
      view_count: typeof data?.view_count === 'number' ? data.view_count : 0,
    }
  }

  async function refreshShareStatus() {
    const res = await fetch('/api/profilux/share')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    setShareStatus(normalizeShareStatus(data))
  }

  useEffect(() => {
    if (tab !== 'manage') return
    let cancelled = false
    setShareStatusLoading(true)
    setShareStatusError(null)
    fetch('/api/profilux/share')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        setShareStatus(normalizeShareStatus(data))
      })
      .catch((err) => {
        if (cancelled) return
        setShareStatusError(String(err))
      })
      .finally(() => {
        if (cancelled) return
        setShareStatusLoading(false)
      })
    return () => { cancelled = true }
  }, [tab])

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
  const availabilityLabel = (value: Screen9Draft['availability']) => {
    switch (value) {
      case 'active': return 'Actively looking'
      case 'open': return 'Quietly considering'
      case 'passive': return 'Passively exploring'
      case 'unavailable': return 'Not available'
      default: return null
    }
  }
  const departmentLabel = (value: string) =>
    PROFILUX_DEPARTMENT_OPTIONS.find(o => o.value === value)?.label ?? value
  const contractTypeLabel = (value: string) =>
    PROFILUX_CONTRACT_TYPE_OPTIONS.find(o => o.value === value)?.label ?? value
  const sectorLabel = (value: string) =>
    PROFILUX_SECTOR_OPTIONS.find(o => o.value === value)?.label ?? value
  const productCategoryLabel = (value: string) =>
    PROFILUX_PRODUCT_CATEGORY_OPTIONS.find(o => o.value === value)?.label ?? value
  const expertiseTagLabel = (value: string) =>
    PROFILUX_EXPERTISE_TAG_OPTIONS.find(o => o.value === value)?.label ?? value
  const cvUrl = e.cv_meta?.cv_url ?? null
  const cvParsedAt = e.cv_meta?.cv_parsed_at ?? null
  const parsedDateLabel = (cvParsedAt && !isNaN(new Date(cvParsedAt).getTime()))
    ? new Date(cvParsedAt).toLocaleDateString()
    : 'recently'

  async function handleReserveLink() {
    setReserving(true)
    setReserveError(null)
    try {
      const res = await fetch('/api/profilux/reset-link', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setReserveError(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        return
      }
      await refreshShareStatus()
    } catch (err) {
      setReserveError(String(err))
    } finally {
      setReserving(false)
    }
  }

  async function handleToggleSharing(next: boolean) {
    if (!shareStatus) return
    setSharingToggleSaving(true)
    setSharingToggleError(null)
    try {
      const res = await fetch('/api/profilux/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharing_enabled: next }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setSharingToggleError(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        return
      }
      await refreshShareStatus()
    } catch (err) {
      setSharingToggleError(String(err))
    } finally {
      setSharingToggleSaving(false)
    }
  }

  async function handleSetPassword() {
    const value = passwordDraft
    if (value.length < 4) {
      setPasswordError('Password must be at least 4 characters')
      return
    }
    setPasswordSaving(true)
    setPasswordError(null)
    try {
      const res = await fetch('/api/profilux/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: value }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setPasswordError(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        return
      }
      await refreshShareStatus()
      setPasswordDraft('')
    } catch (err) {
      setPasswordError(String(err))
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleClearPassword() {
    setPasswordSaving(true)
    setPasswordError(null)
    try {
      const res = await fetch('/api/profilux/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: null }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setPasswordError(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        return
      }
      await refreshShareStatus()
    } catch (err) {
      setPasswordError(String(err))
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleSetExpiry() {
    const value = expiryDraft
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setExpiryError('Pick a date')
      return
    }
    setExpirySaving(true)
    setExpiryError(null)
    try {
      const res = await fetch('/api/profilux/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expires_at: value }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setExpiryError(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        return
      }
      await refreshShareStatus()
      setExpiryDraft('')
    } catch (err) {
      setExpiryError(String(err))
    } finally {
      setExpirySaving(false)
    }
  }

  async function handleClearExpiry() {
    setExpirySaving(true)
    setExpiryError(null)
    try {
      const res = await fetch('/api/profilux/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expires_at: null }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setExpiryError(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        return
      }
      await refreshShareStatus()
    } catch (err) {
      setExpiryError(String(err))
    } finally {
      setExpirySaving(false)
    }
  }

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

  async function handleSave1() {
    setSaving1(true)
    setSaveError1(null)
    try {
      // camelCase legacy + snake_case new (S12) - existing contract drift, not S12 scope
      const body: Record<string, unknown> = {
        firstName: draft1.first_name,
        lastName: draft1.last_name,
        city: draft1.city,
        country: draft1.country,
        nationality: draft1.nationality,
        phone: draft1.phone,
        headline: draft1.headline,
        bio: draft1.bio,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt1(Date.now())
      setTimeout(() => setSavedAt1((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError1(String(err))
    } finally {
      setSaving1(false)
    }
  }

  function startNewExperience() {
    setExperienceDraft(emptyExperienceDraft())
    setExperienceError(null)
    setExperienceFormOpen(true)
  }

  function startEditExperience(exp: { id?: string; job_title: string | null; company: string | null; city: string | null; country: string | null; start_date: string | null; end_date: string | null; is_current?: boolean; description: string | null }) {
    if (!exp.id) return
    setExperienceDraft({
      id: exp.id,
      job_title: exp.job_title ?? '',
      company: exp.company ?? '',
      city: exp.city ?? '',
      country: exp.country ?? '',
      start_date: exp.start_date ?? '',
      end_date: exp.end_date ?? '',
      is_current: exp.is_current === true,
      description: exp.description ?? '',
    })
    setExperienceError(null)
    setExperienceFormOpen(true)
  }

  function cancelExperienceEdit() {
    setExperienceDraft(emptyExperienceDraft())
    setExperienceError(null)
    setExperienceFormOpen(false)
  }

  async function handleSaveExperience() {
    const jt = experienceDraft.job_title.trim()
    const co = experienceDraft.company.trim()
    const sd = experienceDraft.start_date.trim()
    if (jt === '' || co === '' || sd === '') {
      setExperienceError('Job title, company, and start date are required.')
      return
    }
    setExperienceSaving(true)
    setExperienceError(null)
    try {
      const isUpdate = experienceDraft.id !== undefined
      const payload: Record<string, unknown> = {
        job_title: jt,
        company: co,
        city: experienceDraft.city.trim() || null,
        country: experienceDraft.country.trim() || null,
        start_date: sd,
        end_date: experienceDraft.is_current ? null : (experienceDraft.end_date.trim() || null),
        is_current: experienceDraft.is_current,
        description: experienceDraft.description.trim() || null,
      }
      if (isUpdate) payload.id = experienceDraft.id

      const res = await fetch('/api/profilux/experiences', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setExperienceError(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      setExperienceDraft(emptyExperienceDraft())
      setExperienceFormOpen(false)
    } catch (err) {
      setExperienceError(String(err))
    } finally {
      setExperienceSaving(false)
    }
  }

  async function handleDeleteExperience(id: string) {
    setExperienceDeleting(id)
    setExperienceError(null)
    try {
      const res = await fetch('/api/profilux/experiences', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setExperienceError(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      if (experienceDraft.id === id) {
        setExperienceDraft(emptyExperienceDraft())
        setExperienceFormOpen(false)
      }
    } catch (err) {
      setExperienceError(String(err))
    } finally {
      setExperienceDeleting(null)
    }
  }

  function startNewEducation() {
    setEducationDraft(emptyEducationDraft())
    setEducationError(null)
    setEducationFormOpen(true)
  }

  function startEditEducation(ed: { id?: string; institution: string | null; degree_level: string | null; field_of_study: string | null; city: string | null; country: string | null; start_year: number | null; graduation_year: number | null }) {
    if (!ed.id) return
    setEducationDraft({
      id: ed.id,
      institution: ed.institution ?? '',
      degree_level: ed.degree_level ?? '',
      field_of_study: ed.field_of_study ?? '',
      city: ed.city ?? '',
      country: ed.country ?? '',
      start_year: ed.start_year != null ? String(ed.start_year) : '',
      graduation_year: ed.graduation_year != null ? String(ed.graduation_year) : '',
    })
    setEducationError(null)
    setEducationFormOpen(true)
  }

  function cancelEducationEdit() {
    setEducationDraft(emptyEducationDraft())
    setEducationError(null)
    setEducationFormOpen(false)
  }

  async function handleSaveEducation() {
    const inst = educationDraft.institution.trim()
    if (inst === '') {
      setEducationError('Institution is required.')
      return
    }
    setEducationSaving(true)
    setEducationError(null)
    try {
      const isUpdate = educationDraft.id !== undefined
      const sy = educationDraft.start_year.trim()
      const gy = educationDraft.graduation_year.trim()
      const payload: Record<string, unknown> = {
        institution: inst,
        degree_level: educationDraft.degree_level.trim() || null,
        field_of_study: educationDraft.field_of_study.trim() || null,
        city: educationDraft.city.trim() || null,
        country: educationDraft.country.trim() || null,
        start_year: sy === '' ? null : Number(sy),
        graduation_year: gy === '' ? null : Number(gy),
      }
      if (isUpdate) payload.id = educationDraft.id

      const res = await fetch('/api/profilux/education', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setEducationError(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      setEducationDraft(emptyEducationDraft())
      setEducationFormOpen(false)
    } catch (err) {
      setEducationError(String(err))
    } finally {
      setEducationSaving(false)
    }
  }

  async function handleDeleteEducation(id: string) {
    setEducationDeleting(id)
    setEducationError(null)
    try {
      const res = await fetch('/api/profilux/education', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setEducationError(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      if (educationDraft.id === id) {
        setEducationDraft(emptyEducationDraft())
        setEducationFormOpen(false)
      }
    } catch (err) {
      setEducationError(String(err))
    } finally {
      setEducationDeleting(null)
    }
  }

  async function handleApplySuggestions() {
    if (!editor) return
    const sug = editor.cv_identity_suggestions
    // C1 slice 1B.3: per-field sequential applies via /api/profilux/suggestions.
    // Each call is atomic at the DB row level (L2 column + resolution_state).
    // On any field failure, stop the loop, refetch, surface error.
    const queue: Array<{ field: 'first_name' | 'last_name' | 'city' | 'nationality'; value: string }> = []
    if (suggestionSelected.first_name && sug.first_name !== undefined) queue.push({ field: 'first_name', value: sug.first_name })
    if (suggestionSelected.last_name && sug.last_name !== undefined) queue.push({ field: 'last_name', value: sug.last_name })
    if (suggestionSelected.city && sug.city !== undefined) queue.push({ field: 'city', value: sug.city })
    if (suggestionSelected.nationality && sug.nationality !== undefined) queue.push({ field: 'nationality', value: sug.nationality })
    if (queue.length === 0) return
    setActioning(true)
    setActionError(null)
    try {
      for (const item of queue) {
        const res = await fetch('/api/profilux/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'apply', field: item.field, value: item.value }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({} as any))
          throw new Error(typeof data?.error === 'string' ? `${item.field}: ${data.error}` : `${item.field}: HTTP ${res.status}`)
        }
      }
      await refetch()
      setSuggestionSelected({ first_name: false, last_name: false, city: false, nationality: false })
    } catch (err) {
      setActionError(String(err))
      await refetch().catch(() => {})
    } finally {
      setActioning(false)
    }
  }

  // C1 slice 1B.4 — per-row dismiss. Single POST, no L2 write server-side.
  async function handleDismissSuggestion(field: 'first_name' | 'last_name' | 'city' | 'nationality', value: string) {
    setActioning(true)
    setActionError(null)
    try {
      const res = await fetch('/api/profilux/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss', field, value }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        throw new Error(typeof data?.error === 'string' ? `${field}: ${data.error}` : `${field}: HTTP ${res.status}`)
      }
      await refetch()
      setSuggestionSelected(prev => ({ ...prev, [field]: false }))
    } catch (err) {
      setActionError(String(err))
      await refetch().catch(() => {})
    } finally {
      setActioning(false)
    }
  }

  // S-B.1B.4 — per-row apply for cv_education_suggestions.
  async function handleApplyEducationSuggestion(signature: string) {
    setEducationActioningSig(signature)
    setActionError(null)
    try {
      const res = await fetch('/api/profilux/suggestions/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', signature }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        const code = typeof data?.code === 'string' ? data.code : null
        const msg =
          code === 'SIGNATURE_STALE' ? 'This suggestion no longer matches your CV. Refresh.'
          : code === 'INSTITUTION_REQUIRED' ? 'This entry is missing an institution and cannot be added.'
          : (typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        throw new Error(msg)
      }
      await refetch()
    } catch (err) {
      setActionError(String(err instanceof Error ? err.message : err))
      await refetch().catch(() => {})
    } finally {
      setEducationActioningSig(null)
    }
  }

  // S-B.1B.4 — per-row dismiss for cv_education_suggestions.
  async function handleDismissEducationSuggestion(signature: string) {
    setEducationActioningSig(signature)
    setActionError(null)
    try {
      const res = await fetch('/api/profilux/suggestions/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss', signature }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        const code = typeof data?.code === 'string' ? data.code : null
        const msg =
          code === 'SIGNATURE_STALE' ? 'This suggestion no longer matches your CV. Refresh.'
          : code === 'ALREADY_APPLIED' ? 'This entry is already in your ProfiLux.'
          : (typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        throw new Error(msg)
      }
      await refetch()
    } catch (err) {
      setActionError(String(err instanceof Error ? err.message : err))
      await refetch().catch(() => {})
    } finally {
      setEducationActioningSig(null)
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
                <option value="open">Quietly considering</option>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 0 16px', marginBottom: 24, borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#999', letterSpacing: 0.2 }}>
          ← Dashboard · ProfiLux
        </div>
        <div role="tablist" style={{ display: 'inline-flex', background: '#222', border: '1px solid #2a2a2a', borderRadius: 8, padding: 3 }}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'view'}
            onClick={() => setTab('view')}
            style={{ background: tab === 'view' ? '#1a1a1a' : 'transparent', color: tab === 'view' ? '#fff' : '#999', border: 'none', padding: '5px 12px', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: 0.2, cursor: 'pointer', borderRadius: 6 }}
          >View</button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'edit'}
            onClick={() => setTab('edit')}
            style={{ background: tab === 'edit' ? '#1a1a1a' : 'transparent', color: tab === 'edit' ? '#fff' : '#999', border: 'none', padding: '5px 12px', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: 0.2, cursor: 'pointer', borderRadius: 6 }}
          >Edit</button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'manage'}
            onClick={() => setTab('manage')}
            style={{ background: tab === 'manage' ? '#1a1a1a' : 'transparent', color: tab === 'manage' ? '#fff' : '#999', border: 'none', padding: '5px 12px', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: 0.2, cursor: 'pointer', borderRadius: 6 }}
          >Manage</button>
        </div>
      </div>

      {tab === 'view' && (() => {
        const fn = e.first_name ?? ''
        const ln = e.last_name ?? ''
        const lastInitial = (ln[0] ?? '').toUpperCase()
        const fullName = [e.first_name, e.last_name]
          .filter(Boolean)
          .join(' ')
          .trim()
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

        const tagLineParts: string[] = []
        const seniorityText = seniorityLabel(e.seniority)
        if (seniorityText) tagLineParts.push(seniorityText)
        if (typeof e.total_years_experience === 'number') {
          tagLineParts.push(`${e.total_years_experience} years experience`)
        }
        if (typeof e.years_in_luxury === 'number') {
          tagLineParts.push(`${e.years_in_luxury} years in luxury`)
        }
        const tagLine = tagLineParts.length > 0 ? tagLineParts.join(' · ') : null

        // A2.6 — Marker compute (client-side only, MATRIX §24.3).
        // Review marker shown ONLY when L2 is empty AND cv_identity_suggestions
        // has a value for that key. All other empty fields render Missing.
        const sug = e.cv_identity_suggestions
        const reviewFor = (key: 'first_name' | 'last_name' | 'city' | 'nationality') => {
          // A2.6.1 — Check suggestion presence FIRST. sug[key] is computed
          // pre-Rule-A in the resolver and is the only honest signal of
          // "L2 was empty AND L1 had a value". e[key] reads post-Rule-A
          // and contains L1 fallback when L2 is null — using it here would
          // falsely treat L1 fallback as a real L2 value.
          if (sug[key] !== undefined) return <Marker kind="review" />
          const v = e[key]
          if (typeof v === 'string' && v.trim().length > 0) return v
          return <Marker kind="missing" />
        }
        const missingIfEmptyStr = (v: string | null | undefined) =>
          (typeof v === 'string' && v.trim().length > 0) ? v : <Marker kind="missing" />
        const missingIfEmptyNum = (v: number | null | undefined) =>
          (typeof v === 'number') ? String(v) : <Marker kind="missing" />

        const experiences = Array.isArray(e.experiences) ? e.experiences : []
        const expRows = experiences.map((exp) => {
          const hasJobT = typeof exp.job_title === 'string' && exp.job_title.trim().length > 0
          const hasCo = typeof exp.company === 'string' && exp.company.trim().length > 0
          if (!hasJobT && !hasCo) return null
          const role = hasJobT ? exp.job_title! : null
          const company = hasCo ? exp.company! : null
          const xCity = typeof exp.city === 'string' && exp.city.trim().length > 0 ? exp.city : null
          const xCountry = typeof exp.country === 'string' && exp.country.trim().length > 0 ? exp.country : null
          const location = xCity && xCountry ? `${xCity}, ${xCountry}` : (xCity ?? xCountry)
          const yearOf = (d: string | null | undefined): string | null => {
            if (typeof d !== 'string') return null
            const t = d.trim()
            if (t.length === 0) return null
            const m = t.match(/^(\d{4})/)
            return m ? m[1] : null
          }
          const startY = yearOf(exp.start_date)
          const endY = yearOf(exp.end_date)
          const isCurrent = exp.is_current === true
          const period =
            startY && isCurrent ? `${startY}–present`
            : startY && endY ? `${startY}–${endY}`
            : startY ? `${startY}–present`
            : endY ? endY
            : null
          const description = typeof exp.description === 'string' && exp.description.trim().length > 0 ? exp.description : null
          return { role, company, location, period, description }
        }).filter((r): r is { role: string | null; company: string | null; location: string | null; period: string | null; description: string | null } => r !== null)

        return (
          <>
            {/* V12 convergence — two-column View layout (left spine + right field) */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 32, alignItems: 'flex-start' }}>
              {/* LEFT SPINE */}
              <aside style={{ width: isMobile ? '100%' : 300, flexShrink: 0 }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: 26, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>
                  {fullName.length > 0
                    ? fullName
                    : <em style={{ color: '#666', fontStyle: 'italic', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Not specified</em>}
                </div>
                {(() => {
                  const hasEmp = typeof e.current_employer === 'string' && e.current_employer.trim().length > 0
                  if (!hasJob && !hasEmp) return null
                  return (
                    <>
                      {hasJob && (
                        <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 13.5, color: '#a58e28', lineHeight: 1.4 }}>
                          {e.job_title}
                        </div>
                      )}
                      {hasEmp && (
                        <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 13.5, color: '#a58e28', lineHeight: 1.4, marginBottom: 4 }}>
                          {e.current_employer}
                        </div>
                      )}
                    </>
                  )
                })()}
                {locationLine && (
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999', lineHeight: 1.4, marginBottom: 16 }}>
                    {locationLine}
                  </div>
                )}
                <div style={{ borderTop: '1px solid #2a2a2a', marginBottom: 16 }} />
                {(() => {
                  const label = availabilityLabel(e.availability)
                  if (label === null) return null
                  return (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: '#1D9E75', boxShadow: '0 0 0 4px rgba(29,158,117,0.15)', display: 'inline-block', flex: '0 0 auto' }} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc' }}>{label}</span>
                      </div>
                    </div>
                  )
                })()}
                <div style={{ borderTop: '1px solid #2a2a2a', marginBottom: 12 }} />
                <button
                  type="button"
                  onClick={() => setTab('edit')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'transparent', border: 'none', borderBottom: '0.5px solid rgba(255,255,255,0.03)', padding: '9px 0', color: '#ccc', fontFamily: 'Inter, sans-serif', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span>Edit ProfiLux</span>
                  <span aria-hidden="true" style={{ color: '#777' }}>→</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab('manage')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'transparent', border: 'none', borderBottom: '0.5px solid rgba(255,255,255,0.03)', padding: '9px 0', color: '#ccc', fontFamily: 'Inter, sans-serif', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span>Manage &amp; share</span>
                  <span aria-hidden="true" style={{ color: '#777' }}>→</span>
                </button>
              </aside>

              {/* RIGHT FIELD — 8 section cards (verbatim) */}
              <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : 'auto' }}>
            {/* §22.1 row 2 — Current Position */}
            {(() => {
              const filled =
                (typeof e.job_title === 'string' && e.job_title.trim().length > 0) ||
                (typeof e.current_employer === 'string' && e.current_employer.trim().length > 0) ||
                (typeof e.seniority === 'string' && e.seniority.trim().length > 0) ||
                typeof e.total_years_experience === 'number'
              if (!filled) return null
              return (
            <ViewZone title="Current Role">
              {(() => {
                const emp = typeof e.current_employer === 'string' && e.current_employer.trim().length > 0 ? e.current_employer : null
                const empInitial = emp ? emp[0].toUpperCase() : ''
                const role = typeof e.job_title === 'string' && e.job_title.trim().length > 0 ? e.job_title : null
                const currentExp = Array.isArray(e.experiences)
                  ? e.experiences.find(x => x.is_current === true && typeof x.start_date === 'string' && x.start_date.trim().length > 0)
                  : null
                const sinceLine = (() => {
                  if (!currentExp || typeof currentExp.start_date !== 'string') return null
                  const sd = currentExp.start_date.trim()
                  if (sd.length === 0) return null
                  // Format YYYY-MM-DD or YYYY-MM -> "Month YYYY"
                  const m = sd.match(/^(\d{4})-(\d{2})/)
                  if (m) {
                    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
                    const monthIdx = parseInt(m[2], 10) - 1
                    if (monthIdx >= 0 && monthIdx < 12) return `Since ${months[monthIdx]} ${m[1]}`
                  }
                  return `Since ${sd}`
                })()
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '1px solid rgba(165,142,40,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: 'Playfair Display, serif',
                      fontStyle: 'italic',
                      fontSize: 16,
                      color: '#a58e28',
                    }}>
                      {empInitial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {role && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#fff', fontWeight: 500, lineHeight: 1.3, marginBottom: 2 }}>{role}</div>
                      )}
                      {emp && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.4, marginBottom: 2 }}>{emp}</div>
                      )}
                      {sinceLine && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999', lineHeight: 1.4 }}>{sinceLine}</div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </ViewZone>
              )
            })()}

            {/* §22.1 row 4 — Career History */}
            {(() => {
              const filled = expRows.length > 0
              if (!filled) return null
              return (
            <ViewZone title="Career Path">
              {expRows.map((r, i) => {
                const isLast = i === expRows.length - 1
                const rowStyle: React.CSSProperties = isLast
                  ? { display: 'grid', gridTemplateColumns: '108px 1fr', gap: 16, marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }
                  : { display: 'grid', gridTemplateColumns: '108px 1fr', gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #2a2a2a' }
                return (
                  <div key={i} style={rowStyle}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8e8e8e', letterSpacing: 0.3, fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}>
                      {r.period ?? ''}
                    </div>
                    <div>
                      {r.role && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#fff', fontWeight: 500, lineHeight: 1.4, marginBottom: 2 }}>{r.role}</div>
                      )}
                      {(r.company || r.location) && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.4, marginBottom: 6 }}>
                          {r.company && r.location ? `${r.company} · ${r.location}` : (r.company ?? r.location)}
                        </div>
                      )}
                      {r.description && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8e8e8e', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{r.description}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </ViewZone>
              )
            })()}

            {/* §22.1 row 6 — Education */}
            {(() => {
              const filled = Array.isArray(e.education) && e.education.length > 0
              if (!filled) return null
              return (
            <ViewZone title="Education">
              {e.education.map((ed, i) => {
                const isLast = i === e.education.length - 1
                const rowStyle: React.CSSProperties = isLast
                  ? { display: 'grid', gridTemplateColumns: '108px 1fr', gap: 16, marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }
                  : { display: 'grid', gridTemplateColumns: '108px 1fr', gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #2a2a2a' }
                const primary = (typeof ed.degree === 'string' && ed.degree.trim().length > 0)
                  ? ed.degree
                  : (typeof ed.field_of_study === 'string' && ed.field_of_study.trim().length > 0)
                    ? ed.field_of_study
                    : null
                const hasSY = typeof ed.start_year === 'number'
                const hasGY = typeof ed.graduation_year === 'number'
                const periodText =
                  hasSY && hasGY ? `${ed.start_year}–${ed.graduation_year}`
                  : hasGY ? String(ed.graduation_year)
                  : hasSY ? String(ed.start_year)
                  : ''
                const edCity = typeof ed.city === 'string' && ed.city.trim().length > 0 ? ed.city : null
                const instLine = ed.institution
                  ? (edCity ? `${ed.institution} · ${edCity}` : ed.institution)
                  : null
                return (
                  <div key={i} style={rowStyle}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8e8e8e', letterSpacing: 0.3, fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}>
                      {periodText}
                    </div>
                    <div>
                      {primary && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#fff', fontWeight: 500, lineHeight: 1.4, marginBottom: 2 }}>{primary}</div>
                      )}
                      {instLine && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.4 }}>{instLine}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </ViewZone>
              )
            })()}

            {/* §22.1 row 6 — Languages */}
            {(() => {
              const filled = Array.isArray(e.languages) && e.languages.length > 0
              if (!filled) return null
              return (
            <ViewZone title="Languages">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {e.languages.map((l, i) => (
                  <div key={`lg-${i}-${l.language}`} style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.4 }}>
                    <span>{l.language}</span>
                    {l.proficiency && <span style={{ color: '#999', marginLeft: 8 }}>{l.proficiency}</span>}
                  </div>
                ))}
              </div>
            </ViewZone>
              )
            })()}

            {/* §22.1 row 3 — Expertise (merged: Luxury Fit + Skills & Markets per V12-divergence-2) */}
            {(() => {
              const filled =
                typeof e.years_in_luxury === 'number' ||
                (Array.isArray(e.sectors) && e.sectors.length > 0) ||
                (Array.isArray(e.product_categories) && e.product_categories.length > 0) ||
                (Array.isArray(e.expertise_tags) && e.expertise_tags.length > 0) ||
                (Array.isArray(e.key_skills) && e.key_skills.length > 0) ||
                (Array.isArray(e.market_knowledge) && e.market_knowledge.length > 0)
              if (!filled) return null
              return (
            <ViewZone title="Expertise">
              <div style={grid}>
                <div style={label}>Years in luxury</div>
                <div>{missingIfEmptyNum(e.years_in_luxury)}</div>
              </div>

              {e.sectors.length > 0 && (
                <>
                  <div style={sectionLabel}>Sectors</div>
                  <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
                    {e.sectors.map(v => sectorLabel(v)).join(' · ')}
                  </div>
                </>
              )}

              {e.product_categories.length > 0 && (
                <>
                  <div style={sectionLabel}>Product categories</div>
                  <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
                    {e.product_categories.map(v => productCategoryLabel(v)).join(' · ')}
                  </div>
                </>
              )}

              {e.expertise_tags.length > 0 && (
                <>
                  <div style={sectionLabel}>Areas of expertise</div>
                  <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
                    {e.expertise_tags.map(v => expertiseTagLabel(v)).join(' · ')}
                  </div>
                </>
              )}

              {e.key_skills.length > 0 && (
                <>
                  <div style={sectionLabel}>Skills</div>
                  <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
                    {e.key_skills.map(v => skillLabel(v)).join(' · ')}
                  </div>
                </>
              )}

              {e.market_knowledge.length > 0 && (
                <>
                  <div style={sectionLabel}>Markets</div>
                  <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
                    {e.market_knowledge.join(' · ')}
                  </div>
                </>
              )}
            </ViewZone>
              )
            })()}

            {/* §22.1 row 8 — Availability & Targets */}
            {(() => {
              const filled = typeof e.availability === 'string' && e.availability.trim().length > 0
              if (!filled) return null
              return (
            <ViewZone title="Availability">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
                  Open to opportunities
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.5, textAlign: 'right' }}>
                  {availabilityLabel(e.availability) ?? <Marker kind="missing" />}
                </div>
              </div>
            </ViewZone>
              )
            })()}

            {/* §22.1 row 5 — Maisons (V12-divergence-3 ledger 28303edd) */}
            {(() => {
              const brands = Array.isArray(e.brands_worked_with) ? e.brands_worked_with : []
              if (brands.length === 0) return null
              const filled = true
              return (
            <ViewZone title="Maisons">
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.5 }}>
                {brands.join(' · ')}
              </div>
            </ViewZone>
              )
            })()}
              </div>
            </div>

          </>
        )
      })()}

      {tab === 'edit' && (
        <>
      {TUNNEL_VISIBLE && <div style={sub}>Screen {step} / {TOTAL} · {SCREEN_TITLES[step]}</div>}
      {(() => {
        const pct = typeof e.profile_completeness === 'number' ? e.profile_completeness : 0
        return (
          <>
            {/* Top-right action row — Re-upload CV + Done */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <Link
                href="/dashboard/candidate/profilux/cv-merge"
                style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent', color: '#999', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: 0.2, textDecoration: 'none', cursor: 'pointer' }}
              >
                Re-upload CV
              </Link>
              <button
                type="button"
                onClick={() => setTab('view')}
                style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '8px 18px', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: 0.2, cursor: 'pointer', fontWeight: 600 }}
              >
                Done →
              </button>
            </div>
            {/* PROFILUX OVERVIEW progress band */}
            <div style={{ background: '#1c1c1c', border: '0.5px solid rgba(165,142,40,0.2)', borderRadius: 12, padding: '22px 28px', marginBottom: 32 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#a58e28', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                ProfiLux Overview
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#ccc', lineHeight: 1.4, flex: '0 0 auto' }}>
                  The more you tell us, the more we can work for you.
                </div>
                <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <div style={{ flex: 1, height: 3, background: '#2a2a2a', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', background: '#1D9E75' }} />
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#fff', fontVariantNumeric: 'tabular-nums', flex: '0 0 auto' }}>
                    {pct}%
                  </div>
                </div>
              </div>
            </div>
            {/* YOUR DOSSIER eyebrow */}
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e8e', letterSpacing: 2, marginBottom: 18, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
              Your dossier
            </div>
          </>
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
              <Link
                href="/dashboard/candidate/profilux/cv-merge"
                style={{ color: '#ccc', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13 }}
              >
                Replace
              </Link>
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
              <Link
                href="/dashboard/candidate/profilux/cv-merge"
                style={{ color: '#ccc', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13 }}
              >
                Replace
              </Link>
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
        if (keys.length === 0) return null
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
              Your CV contains values that differ from your ProfiLux. Review each and apply or dismiss.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '24px 160px 1fr auto', gap: 8, fontSize: 13, lineHeight: 1.6, alignItems: 'center' }}>
              {keys.map((k) => (
                <React.Fragment key={k}>
                  <input
                    type="checkbox"
                    checked={suggestionSelected[k]}
                    onChange={(ev) => setSuggestionSelected(prev => ({ ...prev, [k]: ev.target.checked }))}
                    disabled={actioning}
                    style={{ accentColor: '#a58e28' }}
                  />
                  <div style={{ color: '#999' }}>{labels[k]}</div>
                  <div style={{ color: '#fff' }}>
                    {(() => {
                      const l1 = sug[k] as string
                      const l2Raw = editor[k]
                      const l2Str = typeof l2Raw === 'string' ? l2Raw : ''
                      const l1Norm = l1.trim().toLowerCase()
                      const l2Norm = l2Str.trim().toLowerCase()
                      const l2WasEmpty = l2Norm === '' || l2Norm === l1Norm
                      return (
                        <>
                          <span style={{ color: l2WasEmpty ? '#666' : '#999' }}>{l2WasEmpty ? '(none)' : l2Str}</span>
                          <span style={{ color: '#666', margin: '0 8px' }}>→</span>
                          <span style={{ color: '#fff' }}>{l1}</span>
                        </>
                      )
                    })()}
                  </div>
                  <button
                    type="button"
                    onClick={() => sug[k] !== undefined && handleDismissSuggestion(k, sug[k] as string)}
                    disabled={actioning}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#777',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 12,
                      padding: '2px 6px',
                      cursor: actioning ? 'default' : 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Dismiss
                  </button>
                </React.Fragment>
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleApplySuggestions}
                disabled={actioning || checkedCount === 0}
                style={(actioning || checkedCount === 0) ? saveBtnDis : saveBtn}
              >
                {actioning ? 'Working...' : `Apply selected${checkedCount > 0 ? ` (${checkedCount})` : ''}`}
              </button>
              {actionError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{actionError}</span>}
            </div>
          </SectionCard>
        )
      })()}
      {/* S-B.1B.4 — Education suggestions panel (collection-shaped) */}
      {(() => {
        const eduSugs = Array.isArray(editor.cv_education_suggestions) ? editor.cv_education_suggestions : []
        if (eduSugs.length === 0) return null
        return (
          <SectionCard eyebrow="Add education from your CV">
            <div style={{ fontSize: 13, color: '#ccc', marginBottom: 14 }}>
              Your CV includes education entries that are not yet in your ProfiLux.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {eduSugs.map((row) => {
                const sig = row.signature
                const inFlight = educationActioningSig === sig
                const anyInFlight = educationActioningSig !== null

                const title =
                  typeof row.institution === 'string' && row.institution.trim().length > 0
                    ? row.institution
                    : 'Untitled institution'

                const secondaryParts: string[] = []
                if (typeof row.degree_level === 'string' && row.degree_level.trim().length > 0) secondaryParts.push(row.degree_level)
                if (typeof row.field_of_study === 'string' && row.field_of_study.trim().length > 0) secondaryParts.push(row.field_of_study)
                if (typeof row.graduation_year === 'number') secondaryParts.push(String(row.graduation_year))
                const secondaryLine = secondaryParts.join(' · ')

                const locParts: string[] = []
                if (typeof row.city === 'string' && row.city.trim().length > 0) locParts.push(row.city)
                if (typeof row.country === 'string' && row.country.trim().length > 0) locParts.push(row.country)
                const locStr = locParts.join(', ')

                const tertiaryParts: string[] = []
                if (locStr.length > 0) tertiaryParts.push(locStr)
                if (typeof row.start_year === 'number') tertiaryParts.push(String(row.start_year))
                const tertiaryLine = tertiaryParts.join(' · ')

                return (
                  <div key={sig} style={{ borderBottom: '1px solid #2a2a2a', paddingBottom: 14 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#fff', lineHeight: 1.4, marginBottom: 4 }}>
                      {title}
                    </div>
                    {secondaryLine.length > 0 && (
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.5, marginBottom: 2 }}>
                        {secondaryLine}
                      </div>
                    )}
                    {tertiaryLine.length > 0 && (
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999', lineHeight: 1.5, marginBottom: 10 }}>
                        {tertiaryLine}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleApplyEducationSuggestion(sig)}
                        disabled={anyInFlight}
                        style={anyInFlight ? saveBtnDis : saveBtn}
                      >
                        {inFlight ? 'Working…' : 'Add to ProfiLux'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismissEducationSuggestion(sig)}
                        disabled={anyInFlight}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#777',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 12,
                          padding: '2px 6px',
                          cursor: anyInFlight ? 'default' : 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            {actionError && (
              <div style={{ marginTop: 12, color: '#ff6b6b', fontSize: 13 }}>{actionError}</div>
            )}
          </SectionCard>
        )
      })()}
      <SectionCard
        eyebrow="Identity"
        headerAction={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setIdentityDrawerOpen(true)}
              style={{
                background: 'rgba(165,142,40,0.05)',
                color: '#a58e28',
                border: '1px solid rgba(165,142,40,0.3)',
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.4px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Edit
            </button>
          </div>
        }
      >
        <div style={grid}>
          <div style={label}>First name</div>
          <div>{e.first_name ?? <NotSet />}</div>
          <div style={label}>Last name</div>
          <div>{e.last_name ?? <NotSet />}</div>
          <div style={label}>City</div>
          <div>{e.city ?? <NotSet />}</div>
          <div style={label}>Country</div>
          <div>{e.country ?? <NotSet />}</div>
          <div style={label}>Nationality</div>
          <div>{e.nationality ?? <NotSet />}</div>
          <div style={label}>Phone</div>
          <div>{e.phone ?? <NotSet />}</div>
          <div style={label}>Headline</div>
          <div>{e.headline ?? <NotSet />}</div>
          <div style={label}>Bio</div>
          <div>{e.bio ?? <NotSet />}</div>
        </div>
      </SectionCard>
      <Drawer
        open={identityDrawerOpen}
        title="Identity"
        onClose={() => setIdentityDrawerOpen(false)}
      >
        <div style={grid}>
          <div style={label}>First name</div>
          <div><input style={input} value={draft1.first_name} onChange={(ev) => setDraft1({ ...draft1, first_name: ev.target.value })} placeholder="e.g. Alex" /></div>
          <div style={label}>Last name</div>
          <div><input style={input} value={draft1.last_name} onChange={(ev) => setDraft1({ ...draft1, last_name: ev.target.value })} placeholder="e.g. Mason" /></div>
          <div style={label}>City</div>
          <div><input style={input} value={draft1.city} onChange={(ev) => setDraft1({ ...draft1, city: ev.target.value })} placeholder="e.g. London" /></div>
          <div style={label}>Country</div>
          <div><input style={input} value={draft1.country} onChange={(ev) => setDraft1({ ...draft1, country: ev.target.value })} placeholder="e.g. United Kingdom" /></div>
          <div style={label}>Nationality</div>
          <div><input style={input} value={draft1.nationality} onChange={(ev) => setDraft1({ ...draft1, nationality: ev.target.value })} placeholder="e.g. British" /></div>
          <div style={label}>Phone</div>
          <div><input style={input} value={draft1.phone} onChange={(ev) => setDraft1({ ...draft1, phone: ev.target.value })} placeholder="e.g. +44 20 ..." /></div>
          <div style={label}>Headline</div>
          <div><input style={input} value={draft1.headline} onChange={(ev) => setDraft1({ ...draft1, headline: ev.target.value })} placeholder="e.g. Senior Boutique Director" /></div>
          <div style={label}>Bio</div>
          <div>
            <textarea
              style={{ ...input, maxWidth: 600, fontFamily: 'Inter, sans-serif', minHeight: 80, resize: 'vertical' }}
              rows={3}
              value={draft1.bio}
              onChange={(ev) => setDraft1({ ...draft1, bio: ev.target.value })}
              placeholder="Short professional bio"
            />
          </div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={saving1 ? saveBtnDis : saveBtn} disabled={saving1} onClick={handleSave1}>
            {saving1 ? 'Saving…' : 'Save'}
          </button>
          {savedAt1 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
          {saveError1 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError1}</span>}
        </div>
      </Drawer>
      <SectionCard
        eyebrow="Current Role"
        headerAction={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setCurrentPositionDrawerOpen(true)}
              style={{
                background: 'rgba(165,142,40,0.05)',
                color: '#a58e28',
                border: '1px solid rgba(165,142,40,0.3)',
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.4px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Edit
            </button>
          </div>
        }
      >
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
      <SectionCard
        eyebrow="Career Path"
        headerAction={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => { setCareerHistoryDrawerOpen(true); cancelExperienceEdit() }}
              style={{
                background: 'rgba(165,142,40,0.05)',
                color: '#a58e28',
                border: '1px solid rgba(165,142,40,0.3)',
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.4px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Edit
            </button>
          </div>
        }
      >
        {e.experiences.length === 0 ? (
          <NoneSel />
        ) : (
          <div>
            {e.experiences.map((exp, i) => (
              <div key={exp.id ?? i} style={card}>
                <div><strong>{exp.job_title ?? 'Role not specified'}</strong> — {exp.company ?? 'Unknown'}</div>
                <div style={{ color: '#999', marginTop: 4 }}>
                  {exp.city ?? '—'}, {exp.country ?? '—'} · {exp.start_date ?? '—'} → {exp.is_current ? 'Present' : (exp.end_date ?? '—')}
                </div>
                {exp.description && <div style={{ color: '#ccc', marginTop: 8 }}>{exp.description}</div>}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <Drawer
        open={careerHistoryDrawerOpen}
        title="Career History"
        onClose={() => { setCareerHistoryDrawerOpen(false); cancelExperienceEdit() }}
      >
        {experienceFormOpen ? (
          <>
            <div style={grid}>
              <div style={label}>Job title *</div>
              <div><input style={input} value={experienceDraft.job_title} onChange={(ev) => setExperienceDraft({ ...experienceDraft, job_title: ev.target.value })} placeholder="e.g. Boutique Director" /></div>
              <div style={label}>Company *</div>
              <div><input style={input} value={experienceDraft.company} onChange={(ev) => setExperienceDraft({ ...experienceDraft, company: ev.target.value })} placeholder="e.g. Hermès" /></div>
              <div style={label}>City</div>
              <div><input style={input} value={experienceDraft.city} onChange={(ev) => setExperienceDraft({ ...experienceDraft, city: ev.target.value })} placeholder="e.g. Paris" /></div>
              <div style={label}>Country</div>
              <div><input style={input} value={experienceDraft.country} onChange={(ev) => setExperienceDraft({ ...experienceDraft, country: ev.target.value })} placeholder="e.g. France" /></div>
              <div style={label}>Start date *</div>
              <div><input style={input} type="date" value={experienceDraft.start_date} onChange={(ev) => setExperienceDraft({ ...experienceDraft, start_date: ev.target.value })} /></div>
              <div style={label}>Currently here</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  style={experienceDraft.is_current === true ? chipActive : chip}
                  onClick={() => setExperienceDraft({ ...experienceDraft, is_current: true, end_date: '' })}
                >
                  Yes
                </button>
                <button
                  type="button"
                  style={experienceDraft.is_current === false ? chipActive : chip}
                  onClick={() => setExperienceDraft({ ...experienceDraft, is_current: false })}
                >
                  No
                </button>
              </div>
              <div style={label}>End date</div>
              <div>
                <input
                  style={experienceDraft.is_current ? { ...input, opacity: 0.4, cursor: 'not-allowed' } : input}
                  type="date"
                  disabled={experienceDraft.is_current}
                  value={experienceDraft.end_date}
                  onChange={(ev) => setExperienceDraft({ ...experienceDraft, end_date: ev.target.value })}
                />
              </div>
              <div style={label}>Description</div>
              <div>
                <textarea
                  style={{ ...input, maxWidth: 600, fontFamily: 'Inter, sans-serif', minHeight: 80, resize: 'vertical' }}
                  rows={3}
                  value={experienceDraft.description}
                  onChange={(ev) => setExperienceDraft({ ...experienceDraft, description: ev.target.value })}
                  placeholder="Optional brief description"
                />
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button style={experienceSaving ? saveBtnDis : saveBtn} disabled={experienceSaving} onClick={handleSaveExperience}>
                {experienceSaving ? 'Saving…' : (experienceDraft.id ? 'Save changes' : 'Add experience')}
              </button>
              <button
                type="button"
                onClick={cancelExperienceEdit}
                disabled={experienceSaving}
                style={btn}
              >
                Cancel
              </button>
              {experienceError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{experienceError}</span>}
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <button type="button" onClick={startNewExperience} style={saveBtn}>
                Add experience
              </button>
            </div>
            {e.experiences.length === 0 ? (
              <div style={{ color: '#999', fontSize: 13 }}>No experiences yet. Click Add experience to start.</div>
            ) : (
              <div>
                {e.experiences.map((exp, i) => {
                  const editable = typeof exp.id === 'string'
                  return (
                    <div key={exp.id ?? i} style={{ ...card, position: 'relative' }}>
                      <div><strong>{exp.company ?? 'Unknown'}</strong> — {exp.job_title ?? 'Role not specified'}</div>
                      <div style={{ color: '#999', marginTop: 4, fontSize: 12 }}>
                        {exp.city ?? '—'}, {exp.country ?? '—'} · {exp.start_date ?? '—'} → {exp.is_current ? 'Present' : (exp.end_date ?? '—')}
                      </div>
                      {exp.description && <div style={{ color: '#ccc', marginTop: 8, fontSize: 12 }}>{exp.description}</div>}
                      {editable ? (
                        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => startEditExperience(exp)}
                            style={{ background: 'transparent', color: '#ccc', border: '1px solid #2a2a2a', padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={experienceDeleting === exp.id}
                            onClick={() => exp.id && handleDeleteExperience(exp.id)}
                            style={{ background: 'transparent', color: '#ff6b6b', border: '1px solid #2a2a2a', padding: '4px 10px', fontSize: 11, cursor: experienceDeleting === exp.id ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: experienceDeleting === exp.id ? 0.5 : 1 }}
                          >
                            {experienceDeleting === exp.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      ) : (
                        <div style={{ marginTop: 10, fontSize: 11, color: '#777', fontStyle: 'italic' }}>
                          Parsed from your CV. Add as a passport entry to edit.
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {experienceError && <div style={{ marginTop: 16, color: '#ff6b6b', fontSize: 13 }}>{experienceError}</div>}
          </>
        )}
      </Drawer>
      <SectionCard
        eyebrow="Education"
        headerAction={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => { setEducationDrawerOpen(true); cancelEducationEdit() }}
              style={{
                background: 'rgba(165,142,40,0.05)',
                color: '#a58e28',
                border: '1px solid rgba(165,142,40,0.3)',
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.4px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Edit
            </button>
          </div>
        }
      >
        {e.education.length === 0 ? (
          <NoneSel />
        ) : (
          <div>
            {e.education.map((ed, i) => {
              const primary = (typeof ed.degree === 'string' && ed.degree.trim().length > 0)
                ? ed.degree
                : (typeof ed.field_of_study === 'string' && ed.field_of_study.trim().length > 0)
                  ? ed.field_of_study
                  : 'Program not specified'
              const edCity = typeof ed.city === 'string' && ed.city.trim().length > 0 ? ed.city : null
              const instLine = ed.institution
                ? (edCity ? `${ed.institution} · ${edCity}` : ed.institution)
                : null
              const hasSY = typeof ed.start_year === 'number'
              const hasGY = typeof ed.graduation_year === 'number'
              const periodText =
                hasSY && hasGY ? `${ed.start_year}–${ed.graduation_year}`
                : hasGY ? String(ed.graduation_year)
                : hasSY ? String(ed.start_year)
                : null
              return (
                <div key={ed.id ?? i} style={card}>
                  <div><strong>{primary}</strong></div>
                  {instLine && (
                    <div style={{ color: '#a58e28', marginTop: 4 }}>{instLine}</div>
                  )}
                  {periodText && (
                    <div style={{ color: '#999', marginTop: 4 }}>{periodText}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>
      <Drawer
        open={educationDrawerOpen}
        title="Education"
        onClose={() => { setEducationDrawerOpen(false); cancelEducationEdit() }}
      >
        {educationFormOpen ? (
          <>
            <div style={grid}>
              <div style={label}>Institution *</div>
              <div><input style={input} value={educationDraft.institution} onChange={(ev) => setEducationDraft({ ...educationDraft, institution: ev.target.value })} placeholder="e.g. ESSEC Business School" /></div>
              <div style={label}>Degree level</div>
              <div><input style={input} value={educationDraft.degree_level} onChange={(ev) => setEducationDraft({ ...educationDraft, degree_level: ev.target.value })} placeholder="e.g. Master" /></div>
              <div style={label}>Field of study</div>
              <div><input style={input} value={educationDraft.field_of_study} onChange={(ev) => setEducationDraft({ ...educationDraft, field_of_study: ev.target.value })} placeholder="e.g. Luxury Brand Management" /></div>
              <div style={label}>City</div>
              <div><input style={input} value={educationDraft.city} onChange={(ev) => setEducationDraft({ ...educationDraft, city: ev.target.value })} placeholder="e.g. Paris" /></div>
              <div style={label}>Country</div>
              <div><input style={input} value={educationDraft.country} onChange={(ev) => setEducationDraft({ ...educationDraft, country: ev.target.value })} placeholder="e.g. France" /></div>
              <div style={label}>Start year</div>
              <div><input style={input} value={educationDraft.start_year} onChange={(ev) => setEducationDraft({ ...educationDraft, start_year: ev.target.value })} placeholder="e.g. 2018" /></div>
              <div style={label}>Graduation year</div>
              <div><input style={input} value={educationDraft.graduation_year} onChange={(ev) => setEducationDraft({ ...educationDraft, graduation_year: ev.target.value })} placeholder="e.g. 2020" /></div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button style={educationSaving ? saveBtnDis : saveBtn} disabled={educationSaving} onClick={handleSaveEducation}>
                {educationSaving ? 'Saving…' : (educationDraft.id ? 'Save changes' : 'Add education')}
              </button>
              <button
                type="button"
                onClick={cancelEducationEdit}
                disabled={educationSaving}
                style={btn}
              >
                Cancel
              </button>
              {educationError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{educationError}</span>}
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <button type="button" onClick={startNewEducation} style={saveBtn}>
                Add education
              </button>
            </div>
            {e.education.length === 0 ? (
              <div style={{ color: '#999', fontSize: 13 }}>No education yet. Click Add education to start.</div>
            ) : (
              <div>
                {e.education.map((ed, i) => {
                  const editable = typeof ed.id === 'string'
                  return (
                    <div key={ed.id ?? i} style={{ ...card, position: 'relative' }}>
                      <div><strong>{ed.institution ?? 'Unknown'}</strong></div>
                      <div style={{ color: '#999', marginTop: 4, fontSize: 12 }}>
                        {ed.degree_level ?? '—'} · {ed.field_of_study ?? '—'} · {ed.graduation_year ?? '—'}
                      </div>
                      {editable ? (
                        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => startEditEducation(ed)}
                            style={{ background: 'transparent', color: '#ccc', border: '1px solid #2a2a2a', padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={educationDeleting === ed.id}
                            onClick={() => ed.id && handleDeleteEducation(ed.id)}
                            style={{ background: 'transparent', color: '#ff6b6b', border: '1px solid #2a2a2a', padding: '4px 10px', fontSize: 11, cursor: educationDeleting === ed.id ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: educationDeleting === ed.id ? 0.5 : 1 }}
                          >
                            {educationDeleting === ed.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      ) : (
                        <div style={{ marginTop: 10, fontSize: 11, color: '#777', fontStyle: 'italic' }}>
                          Parsed from your CV. Add as a passport entry to edit.
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {educationError && <div style={{ marginTop: 16, color: '#ff6b6b', fontSize: 13 }}>{educationError}</div>}
          </>
        )}
      </Drawer>
      <SectionCard
        eyebrow="Languages"
        headerAction={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={openLanguagesDrawer}
              style={{
                background: 'rgba(165,142,40,0.05)',
                color: '#a58e28',
                border: '1px solid rgba(165,142,40,0.3)',
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.4px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Edit
            </button>
          </div>
        }
      >
        {e.languages.length === 0 ? (
          <NoneSel />
        ) : (
          <div>
            {e.languages.map((l, i) => (
              <div key={i} style={{ ...card, fontSize: 12 }}>
                {l.proficiency ? `${l.language} — ${l.proficiency}` : l.language}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <Drawer
        open={languagesDrawerOpen}
        title="Languages"
        onClose={() => { setLanguagesDrawerOpen(false); cancelLanguageEdit() }}
      >
        <div style={sectionLabel}>Current languages</div>
        {e.languages.length === 0 ? (
          <div style={{ color: '#999', fontSize: 13, marginTop: 8 }}>No languages yet.</div>
        ) : (
          <div style={{ marginTop: 8 }}>
            {e.languages.map((l, i) => (
              <div key={l.id ?? i} style={{ ...card, fontSize: 12 }}>
                {l.proficiency ? `${l.language} — ${l.proficiency}` : l.language}
              </div>
            ))}
          </div>
        )}

        {languagesFormOpen ? (
          <>
            <div style={sectionLabel}>{languagesEditDraft.id ? 'Edit language' : 'Add language'}</div>
            <div style={grid}>
              <div style={label}>Language *</div>
              <div>
                <input
                  style={input}
                  value={languagesEditDraft.language}
                  onChange={(ev) => setLanguagesEditDraft(prev => ({ ...prev, language: ev.target.value }))}
                  placeholder="e.g. Italian"
                />
              </div>
              <div style={label}>Proficiency *</div>
              <div>
                <select
                  style={input}
                  value={languagesEditDraft.proficiency}
                  onChange={(ev) => setLanguagesEditDraft(prev => ({ ...prev, proficiency: ev.target.value }))}
                >
                  <option value="">— Select —</option>
                  <option value="native">Native</option>
                  <option value="fluent">Fluent</option>
                  <option value="professional">Professional</option>
                  <option value="conversational">Conversational</option>
                  <option value="basic">Basic</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                type="button"
                style={languagesActioning ? saveBtnDis : saveBtn}
                disabled={languagesActioning}
                onClick={handleSaveLanguageL2}
              >
                {languagesActioning ? 'Saving…' : (languagesEditDraft.id ? 'Save' : 'Add')}
              </button>
              <button
                type="button"
                onClick={cancelLanguageEdit}
                disabled={languagesActioning}
                style={btn}
              >
                Cancel
              </button>
              {languagesError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{languagesError}</span>}
            </div>
          </>
        ) : (
          <>
            <div style={sectionLabel}>Languages you added</div>
            <div style={{ marginTop: 8, marginBottom: 16 }}>
              <button type="button" onClick={startNewLanguage} style={saveBtn}>
                + Add language
              </button>
            </div>
            {languagesL2 === null ? (
              <div style={{ color: '#999', fontSize: 13 }}>Loading…</div>
            ) : languagesL2.length === 0 ? (
              <div style={{ color: '#999', fontSize: 13 }}>You haven&apos;t added any yet.</div>
            ) : (
              <div>
                {languagesL2.map((row) => (
                  <div key={row.id} style={{ ...card, position: 'relative', fontSize: 12 }}>
                    <div>{row.proficiency ? `${row.language} — ${row.proficiency}` : row.language}</div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => startEditLanguageL2(row)}
                        style={{ background: 'transparent', color: '#ccc', border: '1px solid #2a2a2a', padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={languagesActioning}
                        onClick={() => handleDeleteLanguageL2(row.id)}
                        style={{ background: 'transparent', color: '#ff6b6b', border: '1px solid #2a2a2a', padding: '4px 10px', fontSize: 11, cursor: languagesActioning ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: languagesActioning ? 0.5 : 1 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {languagesError && <div style={{ marginTop: 16, color: '#ff6b6b', fontSize: 13 }}>{languagesError}</div>}
          </>
        )}
      </Drawer>
      <SectionCard
        eyebrow="Luxury Fit"
        headerAction={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => { setLuxuryFitDrawerOpen(true); setSectorsError(null); fetchSectorsL2() }}
              style={{
                background: 'rgba(165,142,40,0.05)',
                color: '#a58e28',
                border: '1px solid rgba(165,142,40,0.3)',
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.4px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Edit
            </button>
          </div>
        }
      >
        <div style={grid}>
          <div style={label}>Sectors</div>
          <div>{e.sectors.length > 0 ? e.sectors.map(sectorLabel).join(', ') : <NoneSel />}</div>
          <div style={label}>Years in luxury</div>
          <div>{e.years_in_luxury != null ? String(e.years_in_luxury) : <NotSet />}</div>
          <div style={label}>Product categories</div>
          <div>{e.product_categories.length > 0 ? e.product_categories.map(productCategoryLabel).join(', ') : <NoneSel />}</div>
          <div style={label}>Areas of expertise</div>
          <div>{e.expertise_tags.length > 0 ? e.expertise_tags.map(expertiseTagLabel).join(', ') : <NoneSel />}</div>
        </div>
      </SectionCard>
      <Drawer
        open={luxuryFitDrawerOpen}
        title="Luxury Fit"
        onClose={() => setLuxuryFitDrawerOpen(false)}
      >
        <div style={grid}>
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

        <div style={sectionLabel}>Sectors (ranked, L2)</div>
        {sectorsL2 === null ? (
          <div style={{ color: '#999', fontSize: 13, marginTop: 8 }}>Loading…</div>
        ) : (
          <div style={{ marginTop: 8 }}>
            {sectorsL2.length === 0 && (
              <div style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>No L2 sectors yet. Add one below — these replace L1 sectors on your profile.</div>
            )}
            {sectorsL2.map((row, idx) => {
              const key = row.id ?? `_tmp_${idx}`
              const busy = sectorsActioning === key
              return (
                <div key={key} style={{ ...card, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    style={{ ...input, flex: 1 }}
                    value={row.sector}
                    onChange={(ev) => updateSectorRow(idx, { sector: ev.target.value })}
                    placeholder="e.g. Watches"
                  />
                  <input
                    style={{ ...input, width: 80 }}
                    type="number"
                    min={0}
                    value={Number.isFinite(row.rank) ? row.rank : ''}
                    onChange={(ev) => updateSectorRow(idx, { rank: ev.target.value === '' ? NaN : Number(ev.target.value) })}
                    placeholder="rank"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => saveSectorRow(idx)}
                    style={{ background: 'rgba(165,142,40,0.05)', color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', padding: '6px 12px', fontSize: 11, cursor: busy ? 'wait' : 'pointer', fontFamily: 'Inter, sans-serif', borderRadius: 6, opacity: busy ? 0.6 : 1 }}
                  >
                    {busy ? 'Saving…' : (row.id ? 'Save' : 'Add')}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => deleteSectorRow(idx)}
                    style={{ background: 'transparent', color: '#ff6b6b', border: '1px solid #2a2a2a', padding: '6px 10px', fontSize: 11, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: busy ? 0.5 : 1 }}
                  >
                    ×
                  </button>
                </div>
              )
            })}
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={addSectorRow}
                style={{ background: 'transparent', color: '#ccc', border: '1px solid #2a2a2a', padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', borderRadius: 6 }}
              >
                + Add sector
              </button>
            </div>
            {sectorsError && <div style={{ marginTop: 8, color: '#ff6b6b', fontSize: 13 }}>{sectorsError}</div>}
          </div>
        )}
      </Drawer>
      <SectionCard
        eyebrow="Skills & Markets"
        headerAction={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setSkillsMarketsDrawerOpen(true)}
              style={{
                background: 'rgba(165,142,40,0.05)',
                color: '#a58e28',
                border: '1px solid rgba(165,142,40,0.3)',
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.4px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Edit
            </button>
          </div>
        }
      >
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
      <SectionCard
        eyebrow="Clienteling"
        headerAction={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setClientelingDrawerOpen(true)}
              style={{
                background: 'rgba(165,142,40,0.05)',
                color: '#a58e28',
                border: '1px solid rgba(165,142,40,0.3)',
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.4px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Edit
            </button>
          </div>
        }
      >
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
      <SectionCard
        eyebrow="Maisons"
        headerAction={
          <button
            type="button"
            onClick={openMaisonsDrawer}
            style={{
              background: 'rgba(165,142,40,0.05)',
              color: '#a58e28',
              border: '1px solid rgba(165,142,40,0.3)',
              padding: '6px 14px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.4px',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Edit
          </button>
        }
      >
        <div>
          {e.brands_worked_with.length > 0
            ? e.brands_worked_with.join(', ')
            : <NotSet />}
        </div>
      </SectionCard>
      <Drawer
        open={maisonsDrawerOpen}
        title="Maisons"
        onClose={() => setMaisonsDrawerOpen(false)}
      >
        <div style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>
          One maison per line. Empty lines are ignored.
        </div>
        <textarea
          style={{ ...input, maxWidth: 600, fontFamily: 'Inter, sans-serif', minHeight: 160, resize: 'vertical' }}
          rows={8}
          value={maisonsDraftText}
          onChange={(ev) => setMaisonsDraftText(ev.target.value)}
          placeholder={'e.g.\nHermès\nLouis Vuitton\nCartier'}
        />
        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            style={maisonsSaving ? saveBtnDis : saveBtn}
            disabled={maisonsSaving}
            onClick={handleSaveMaisons}
          >
            {maisonsSaving ? 'Saving…' : 'Save'}
          </button>
          {maisonsError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{maisonsError}</span>}
        </div>
      </Drawer>
      <SectionCard
        eyebrow="Compensation"
        headerAction={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setCompensationDrawerOpen(true)}
              style={{
                background: 'rgba(165,142,40,0.05)',
                color: '#a58e28',
                border: '1px solid rgba(165,142,40,0.3)',
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.4px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Edit
            </button>
          </div>
        }
      >
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
      <SectionCard
        eyebrow="Availability"
        headerAction={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setAvailabilityTargetsDrawerOpen(true)}
              style={{
                background: 'rgba(165,142,40,0.05)',
                color: '#a58e28',
                border: '1px solid rgba(165,142,40,0.3)',
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.4px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Edit
            </button>
          </div>
        }
      >
        <div style={grid}>
          <div style={label}>Availability</div>
          <div>{availabilityLabel(e.availability) ?? <NotSet />}</div>
          <div style={label}>Desired locations</div>
          <div>{e.desired_locations.length > 0 ? e.desired_locations.join(', ') : <NoneSel />}</div>
          <div style={label}>Desired departments</div>
          <div>{e.desired_departments.length > 0 ? e.desired_departments.map(departmentLabel).join(', ') : <NoneSel />}</div>
          <div style={label}>Desired contract types</div>
          <div>{e.desired_contract_types.length > 0 ? e.desired_contract_types.map(contractTypeLabel).join(', ') : <NoneSel />}</div>
          <div style={label}>Open to relocation</div>
          <div>{e.open_to_relocation === true ? 'Yes' : e.open_to_relocation === false ? 'No' : <NotSet />}</div>
          <div style={label}>Relocation preferences</div>
          <div>{e.open_to_relocation === true && typeof e.relocation_preferences === 'string' && e.relocation_preferences.length > 0 ? e.relocation_preferences : <NotSet />}</div>
        </div>
      </SectionCard>
      <Drawer
        open={availabilityTargetsDrawerOpen}
        title="Availability & Targets"
        onClose={() => setAvailabilityTargetsDrawerOpen(false)}
      >
        <div style={grid}>
          <div style={label}>Availability</div>
          <div>
            <select style={select} value={draft9.availability ?? ''} onChange={(ev) => setDraft9({ ...draft9, availability: ev.target.value === '' ? null : ev.target.value as Screen9Draft['availability'] })}>
              <option value="">— Not specified —</option>
              <option value="active">Actively looking</option>
              <option value="open">Quietly considering</option>
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
      </Drawer>
      {TUNNEL_VISIBLE && (
        <>
          {renderStep()}
          <div style={navWrap}>
            <button style={step === 1 ? btnDis : btn} disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))}>← Prev</button>
            <button style={step === TOTAL ? btnDis : btn} disabled={step === TOTAL} onClick={() => setStep(s => Math.min(TOTAL, s + 1))}>Next →</button>
            <span style={{ color: '#666', fontSize: 12, marginLeft: 16 }}>Completeness: {e.profile_completeness}%</span>
          </div>
        </>
      )}
        </>
      )}

      {tab === 'manage' && (
        <>
        <SectionCard eyebrow="Visibility & sharing">
          {shareStatusLoading && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#999' }}>
              Loading…
            </div>
          )}
          {!shareStatusLoading && shareStatusError && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ff6b6b' }}>
              Could not load sharing status.
            </div>
          )}
          {!shareStatusLoading && !shareStatusError && shareStatus && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: shareStatus.sharing_enabled ? '#1D9E75' : '#555',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#fff' }}>
                  {shareStatus.sharing_enabled ? 'Public link active' : 'Private — public link off'}
                </span>
              </div>
              {shareStatus.public_url ? (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    Share URL
                  </div>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    color: shareStatus.sharing_enabled ? '#ccc' : '#777',
                    wordBreak: 'break-all',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    padding: '10px 12px',
                    borderRadius: 4,
                  }}>
                    {shareStatus.public_url}
                  </div>
                  {!shareStatus.sharing_enabled && (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#777', fontStyle: 'italic', marginTop: 8 }}>
                      Link is reserved but not active. Sharing controls coming soon.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#999' }}>
                  No public link reserved yet.
                </div>
              )}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #2a2a2a' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Sharing
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.5 }}>
                  Private link for direct outreach. Never indexed by search engines.
                </div>
                {shareStatus.share_slug ? (
                  <>
                    <button
                      type="button"
                      disabled={sharingToggleSaving}
                      onClick={() => handleToggleSharing(!shareStatus.sharing_enabled)}
                      style={{
                        background: shareStatus.sharing_enabled ? '#fff' : 'transparent',
                        color: shareStatus.sharing_enabled ? '#1a1a1a' : '#fff',
                        border: shareStatus.sharing_enabled ? '1px solid #fff' : '1px solid #444',
                        padding: '8px 16px',
                        cursor: sharingToggleSaving ? 'not-allowed' : 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        opacity: sharingToggleSaving ? 0.5 : 1,
                      }}
                    >
                      {sharingToggleSaving
                        ? 'Saving…'
                        : shareStatus.sharing_enabled
                          ? 'Disable sharing'
                          : 'Enable sharing'}
                    </button>
                    {sharingToggleError && (
                      <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#ff6b6b' }}>
                        {sharingToggleError}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={reserving}
                      onClick={handleReserveLink}
                      style={{
                        background: 'transparent',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '8px 16px',
                        cursor: reserving ? 'not-allowed' : 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        opacity: reserving ? 0.5 : 1,
                      }}
                    >
                      {reserving ? 'Reserving…' : 'Reserve public link'}
                    </button>
                    {reserveError && (
                      <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#ff6b6b' }}>
                        {reserveError}
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* Password row */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #2a2a2a' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Password
                </div>
                {shareStatus.password_set ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#fff' }}>Active</span>
                    <button
                      type="button"
                      disabled={passwordSaving}
                      onClick={handleClearPassword}
                      style={{
                        background: 'transparent',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '6px 12px',
                        cursor: passwordSaving ? 'not-allowed' : 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 12,
                        opacity: passwordSaving ? 0.5 : 1,
                      }}
                    >
                      {passwordSaving ? 'Clearing…' : 'Clear'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="password"
                      value={passwordDraft}
                      onChange={(ev) => setPasswordDraft(ev.target.value)}
                      placeholder="Set password"
                      style={{
                        flex: 1,
                        background: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        color: '#fff',
                        padding: '6px 10px',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        borderRadius: 4,
                      }}
                    />
                    <button
                      type="button"
                      disabled={passwordSaving || passwordDraft.length < 4}
                      onClick={handleSetPassword}
                      style={{
                        background: 'transparent',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '6px 12px',
                        cursor: passwordSaving || passwordDraft.length < 4 ? 'not-allowed' : 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 12,
                        opacity: passwordSaving || passwordDraft.length < 4 ? 0.5 : 1,
                      }}
                    >
                      {passwordSaving ? 'Saving…' : 'Set'}
                    </button>
                  </div>
                )}
                {passwordError && (
                  <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#ff6b6b' }}>
                    {passwordError}
                  </div>
                )}
              </div>
              {/* Expiry row */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #2a2a2a' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Expiry
                </div>
                {shareStatus.expires_at ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#fff' }}>
                      Expires on {shareStatus.expires_at}
                    </span>
                    <button
                      type="button"
                      disabled={expirySaving}
                      onClick={handleClearExpiry}
                      style={{
                        background: 'transparent',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '6px 12px',
                        cursor: expirySaving ? 'not-allowed' : 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 12,
                        opacity: expirySaving ? 0.5 : 1,
                      }}
                    >
                      {expirySaving ? 'Clearing…' : 'Clear'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="date"
                      value={expiryDraft}
                      onChange={(ev) => setExpiryDraft(ev.target.value)}
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        color: '#fff',
                        padding: '6px 10px',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        borderRadius: 4,
                      }}
                    />
                    <button
                      type="button"
                      disabled={expirySaving || !expiryDraft}
                      onClick={handleSetExpiry}
                      style={{
                        background: 'transparent',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '6px 12px',
                        cursor: expirySaving || !expiryDraft ? 'not-allowed' : 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 12,
                        opacity: expirySaving || !expiryDraft ? 0.5 : 1,
                      }}
                    >
                      {expirySaving ? 'Saving…' : 'Set'}
                    </button>
                  </div>
                )}
                {expiryError && (
                  <div style={{ marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#ff6b6b' }}>
                    {expiryError}
                  </div>
                )}
              </div>
              {/* Views row */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #2a2a2a' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Views
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#fff' }}>
                  {shareStatus.view_count} view{shareStatus.view_count === 1 ? '' : 's'}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#777', fontStyle: 'italic', marginTop: 4 }}>
                  Anonymous count only.
                </div>
              </div>
            </>
          )}
        </SectionCard>
        <SectionCard eyebrow="Export">
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: '#888',
              fontStyle: 'italic',
              marginBottom: 14,
              lineHeight: 1.5,
            }}
          >
            Download a private PDF snapshot of your ProfiLux.
            Real names, real data, no masking applied.
          </div>

          <a
            href="/api/profilux/export"
            download
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'transparent',
              color: '#fff',
              border: '1px solid #444',
              padding: '8px 16px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Export PDF
          </a>
        </SectionCard>
        <SectionCard eyebrow="Masked fields">
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 14, lineHeight: 1.5 }}>
            Masked fields will be hidden from public profiles and client share PDFs. Substrate ships now; the public profile already hides these fields. Consumer follows in next slice for client/share surfaces.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MASKABLE_FIELDS.map((field) => {
              const masked = (editor?.masked_fields ?? {})[field] === true
              const busy = maskToggling === field
              const labelText = ({
                phone: 'Phone',
                email: 'Email',
                current_employer: 'Current employer',
                salary: 'Salary',
                availability: 'Availability',
                references: 'References',
              } as const)[field]
              return (
                <div
                  key={field}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: 4,
                  }}
                >
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc' }}>
                    {labelText}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggleMaskedField(field, !masked)}
                    style={{
                      padding: '6px 14px',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.4px',
                      borderRadius: 6,
                      cursor: busy ? 'wait' : 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      opacity: busy ? 0.6 : 1,
                      ...(masked
                        ? { background: 'rgba(165,142,40,0.05)', color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)' }
                        : { background: 'transparent', color: '#999', border: '1px solid #2a2a2a' }),
                    }}
                  >
                    {masked ? 'MASKED' : 'UNMASKED'}
                  </button>
                </div>
              )
            })}
          </div>
        </SectionCard>
        </>
      )}
    </div>
  )
}
