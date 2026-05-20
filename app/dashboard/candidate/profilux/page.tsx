'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import type { EditorView, MaskableField, ProfiLuxInternshipItem, ProfiLuxPortfolioItem, ProfiLuxPressFeatureItem, ProfiLuxReferenceItem, ProfiLuxStrategicInitiative, SectionId } from '@/lib/profilux/types'
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

// PF-D V2 — Add Section library. 8 sections all live.
const ADD_SECTION_LIBRARY: Array<{ key: string; label: string; available: boolean }> = [
  { key: 'awards',                label: 'Awards',                available: true  },
  { key: 'certifications',        label: 'Certifications',        available: true  },
  { key: 'memberships',           label: 'Memberships',           available: true  },
  { key: 'strategic_initiatives', label: 'Strategic Initiatives', available: true  },
  { key: 'portfolio',             label: 'Portfolio',             available: true  },
  { key: 'press_features',        label: 'Press & features',      available: true  },
  { key: 'references',            label: 'References',            available: true  },
  { key: 'internships',           label: 'Internships',           available: true  },
]

const NotSet = () => <em style={{ color: '#666' }}>Not set</em>
const NoneSel = () => <em style={{ color: '#666' }}>None selected</em>
const Hint = ({ children }: { children: React.ReactNode }) => <em style={{ color: '#888' }}>{children}</em>

// PF-MANAGE V12 hotfix — plain helpers used by Manage tab. Not hooks.
function currencySymbol(code: string | null | undefined): string {
  switch ((code || '').toUpperCase()) {
    case 'USD': return '$'
    case 'GBP': return '£'
    case 'JPY': return '¥'
    case 'EUR': return '€'
    default: return '€'
  }
}
function formatSalaryK(min: number | null | undefined, max: number | null | undefined, currency: string | null | undefined): string | null {
  if (!min && !max) return null
  const sym = currencySymbol(currency)
  const minK = min ? `${Math.round(min / 1000)}K` : ''
  const maxK = max ? `${Math.round(max / 1000)}K` : ''
  return `${sym}${minK}${min && max ? '–' : ''}${maxK}`
}
function cvDateLabel(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

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
    background: '#222',
    border: '1px solid #2a2a2a',
    borderRadius: 14,
    padding: '24px 26px',
    marginBottom: 14,
  }
  const flexExtras: React.CSSProperties = layout === 'flex'
    ? { display: 'flex', alignItems: 'center', gap: 20 }
    : {}
  const eyebrowStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  }
  const headerRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
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

// V12 chrome — per-section VISIBLE toggle. Used 10× in Edit-tab
// SectionCard headerActions. Reads editor.section_visibility[id],
// writes via toggleSectionVisibility passed down from parent.
function VisibilityToggle({
  sectionId,
  isVisible,
  isToggling,
  onToggle,
}: {
  sectionId: SectionId
  isVisible: boolean
  isToggling: boolean
  onToggle: (id: SectionId, next: boolean) => void
}) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: 'rgba(255,255,255,0.012)',
      border: '0.5px solid #2a2a2a',
      borderRadius: 6,
      padding: '5px 10px',
    }}>
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 9.5,
        fontWeight: 500,
        letterSpacing: '1.2px',
        color: '#8e8e8e',
        textTransform: 'uppercase',
      }}>
        Visible
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isVisible}
        aria-label="Toggle visibility for this section in your View"
        disabled={isToggling}
        onClick={() => onToggle(sectionId, !isVisible)}
        style={{
          width: 26,
          height: 14,
          borderRadius: 999,
          border: 'none',
          padding: 0,
          position: 'relative',
          background: isVisible ? '#a58e28' : '#333',
          cursor: isToggling ? 'not-allowed' : 'pointer',
          opacity: isToggling ? 0.5 : 1,
          transition: 'background 0.15s',
        }}
      >
        <span style={{
          position: 'absolute',
          top: 2,
          left: isVisible ? 14 : 2,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: isVisible ? '#1a1a1a' : '#ccc',
          transition: 'left 0.15s',
        }} />
      </button>
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '1px',
        color: isVisible ? '#1D9E75' : '#777',
      }}>
        {isVisible ? 'On' : 'Off'}
      </span>
    </span>
  )
}

export default function ProfiluxPage() {
  const [tab, setTab] = useState<ProfiluxTab>(() => {
    if (typeof window === 'undefined') return 'edit'
    const p = new URLSearchParams(window.location.search).get('tab')
    if (p === 'view' || p === 'edit' || p === 'manage') return p
    return 'edit'
  })
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
  // PF-MANAGE V12 — top-level state for Opportunity preferences toggle,
  // share-URL copy feedback, and sticky-nav scrollspy. Hooks live ONLY at
  // top scope (R2); helpers below this point contain zero hook calls.
  const [matchingSaving, setMatchingSaving] = useState(false)
  const [matchingError, setMatchingError] = useState<string | null>(null)
  const [shareCopyStatus, setShareCopyStatus] = useState<'idle' | 'copied'>('idle')
  const [activeManageSection, setActiveManageSection] = useState<string>('m-visibility')
  // accountEmail comes from the session (NextAuth); EditorView intentionally
  // excludes email per types.ts §7.6. Read-only — Account section "Change"
  // row is non-destructive (R3).
  const { data: pfSession } = useSession()
  const accountEmail = pfSession?.user?.email ?? null
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
  // PF-D V1 — Certifications drawer (text[] textarea, free-text, mirrors Maisons)
  const [certificationsDrawerOpen, setCertificationsDrawerOpen] = useState(false)
  const [certificationsDraftText, setCertificationsDraftText] = useState('')
  const [certificationsSaving, setCertificationsSaving] = useState(false)
  const [certificationsError, setCertificationsError] = useState<string | null>(null)
  // PF-D V1 — Awards drawer (text[] textarea, free-text, mirrors Certifications)
  const [awardsDrawerOpen, setAwardsDrawerOpen] = useState(false)
  const [awardsDraftText, setAwardsDraftText] = useState('')
  const [awardsSaving, setAwardsSaving] = useState(false)
  const [awardsError, setAwardsError] = useState<string | null>(null)
  // PF-D V3.1 — Memberships drawer (text[] textarea, free-text, mirrors Awards)
  const [membershipsDrawerOpen, setMembershipsDrawerOpen] = useState(false)
  const [membershipsDraftText, setMembershipsDraftText] = useState('')
  const [membershipsSaving, setMembershipsSaving] = useState(false)
  const [membershipsError, setMembershipsError] = useState<string | null>(null)
  // PF-D V3.1 — Strategic Initiatives drawer (jsonb array-of-objects, structured)
  const [siDrawerOpen, setSiDrawerOpen] = useState(false)
  const [siDraftRows, setSiDraftRows] = useState<ProfiLuxStrategicInitiative[]>([])
  const [siEditingIndex, setSiEditingIndex] = useState<number | null>(null)
  const [siEditTitle, setSiEditTitle] = useState('')
  const [siEditDescription, setSiEditDescription] = useState('')
  const [siSaving, setSiSaving] = useState(false)
  const [siError, setSiError] = useState<string | null>(null)
  // PF-D V3.2 — Portfolio drawer (jsonb array-of-objects, { title, url } with http(s) guard)
  const [pfDrawerOpen, setPfDrawerOpen] = useState(false)
  const [pfDraftRows, setPfDraftRows] = useState<ProfiLuxPortfolioItem[]>([])
  const [pfEditingIndex, setPfEditingIndex] = useState<number | null>(null)
  const [pfEditTitle, setPfEditTitle] = useState('')
  const [pfEditUrl, setPfEditUrl] = useState('')
  const [pfSaving, setPfSaving] = useState(false)
  const [pfError, setPfError] = useState<string | null>(null)
  // PF-D V3.3 — Press & Features drawer (jsonb { title, publication, url } with http(s) guard)
  const [pressDrawerOpen, setPressDrawerOpen] = useState(false)
  const [pressDraftRows, setPressDraftRows] = useState<ProfiLuxPressFeatureItem[]>([])
  const [pressEditingIndex, setPressEditingIndex] = useState<number | null>(null)
  const [pressEditTitle, setPressEditTitle] = useState('')
  const [pressEditPublication, setPressEditPublication] = useState('')
  const [pressEditUrl, setPressEditUrl] = useState('')
  const [pressSaving, setPressSaving] = useState(false)
  const [pressError, setPressError] = useState<string | null>(null)
  // PF-D V3.4 — References drawer (jsonb { name, role, company }, all required, no URL)
  const [refsDrawerOpen, setRefsDrawerOpen] = useState(false)
  const [refsDraftRows, setRefsDraftRows] = useState<ProfiLuxReferenceItem[]>([])
  const [refsEditingIndex, setRefsEditingIndex] = useState<number | null>(null)
  const [refsEditName, setRefsEditName] = useState('')
  const [refsEditRole, setRefsEditRole] = useState('')
  const [refsEditCompany, setRefsEditCompany] = useState('')
  const [refsSaving, setRefsSaving] = useState(false)
  const [refsError, setRefsError] = useState<string | null>(null)
  // PF-D V3.5 — Internships drawer (jsonb { company, role, period }, all required)
  const [intDrawerOpen, setIntDrawerOpen] = useState(false)
  const [intDraftRows, setIntDraftRows] = useState<ProfiLuxInternshipItem[]>([])
  const [intEditingIndex, setIntEditingIndex] = useState<number | null>(null)
  const [intEditCompany, setIntEditCompany] = useState('')
  const [intEditRole, setIntEditRole] = useState('')
  const [intEditPeriod, setIntEditPeriod] = useState('')
  const [intSaving, setIntSaving] = useState(false)
  const [intError, setIntError] = useState<string | null>(null)
  // PF-D V2 — Add Section shell (V12 restoration)
  const [addSectionDrawerOpen, setAddSectionDrawerOpen] = useState(false)
  const [activatingSectionKey, setActivatingSectionKey] = useState<string | null>(null)
  const [addSectionError, setAddSectionError] = useState<string | null>(null)
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

  // PF-EDIT-V12-CONVERGENCE-1 — per-section VISIBLE toggle. Mirrors
  // toggleMaskedField pattern. Reuses existing section_visibility
  // substrate (DB column + POST /api/profilux validation).
  const [visibilityToggling, setVisibilityToggling] = useState<SectionId | null>(null)
  const toggleSectionVisibility = async (id: SectionId, nextValue: boolean) => {
    if (!editor) return
    setVisibilityToggling(id)
    try {
      const next = { ...(editor.section_visibility ?? {}), [id]: nextValue }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_visibility: next }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
    } catch {
      // silent — mirrors toggleMaskedField posture
    } finally {
      setVisibilityToggling(null)
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

  // PF-D V1 — Certifications (free-text text[] textarea, mirrors Maisons)
  function openCertificationsDrawer() {
    setCertificationsError(null)
    setCertificationsDraftText((editor?.certifications ?? []).join('\n'))
    setCertificationsDrawerOpen(true)
  }
  async function handleSaveCertifications() {
    setCertificationsSaving(true)
    setCertificationsError(null)
    try {
      const arr = certificationsDraftText.split('\n').map(s => s.trim()).filter(s => s !== '')
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certifications: arr }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setCertificationsError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      setCertificationsDrawerOpen(false)
    } catch (err) {
      setCertificationsError(String(err))
    } finally {
      setCertificationsSaving(false)
    }
  }

  // PF-D V1 — Awards (free-text text[] textarea, mirrors Certifications)
  function openAwardsDrawer() {
    setAwardsError(null)
    setAwardsDraftText((editor?.awards ?? []).join('\n'))
    setAwardsDrawerOpen(true)
  }
  async function handleSaveAwards() {
    setAwardsSaving(true)
    setAwardsError(null)
    try {
      const arr = awardsDraftText.split('\n').map(s => s.trim()).filter(s => s !== '')
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awards: arr }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setAwardsError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      setAwardsDrawerOpen(false)
    } catch (err) {
      setAwardsError(String(err))
    } finally {
      setAwardsSaving(false)
    }
  }

  // PF-D V3.1 — Memberships (free-text text[] textarea, mirrors Awards)
  function openMembershipsDrawer() {
    setMembershipsError(null)
    setMembershipsDraftText((editor?.memberships ?? []).join('\n'))
    setMembershipsDrawerOpen(true)
  }
  async function handleSaveMemberships() {
    setMembershipsSaving(true)
    setMembershipsError(null)
    try {
      const arr = membershipsDraftText.split('\n').map(s => s.trim()).filter(s => s !== '')
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberships: arr }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setMembershipsError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      setMembershipsDrawerOpen(false)
    } catch (err) {
      setMembershipsError(String(err))
    } finally {
      setMembershipsSaving(false)
    }
  }

  // PF-D V3.1 — Strategic Initiatives (structured jsonb array-of-objects).
  // Drawer carries a draftRows working copy; per-row Add/Edit/Remove mutate it.
  // Save overwrites server array with draftRows. Cancel discards draftRows.
  function openSiDrawer() {
    setSiError(null)
    setSiDraftRows(Array.isArray(editor?.strategic_initiatives) ? [...editor!.strategic_initiatives] : [])
    setSiEditingIndex(null)
    setSiEditTitle('')
    setSiEditDescription('')
    setSiDrawerOpen(true)
  }
  function siStartAdd() {
    setSiEditingIndex(-1)
    setSiEditTitle('')
    setSiEditDescription('')
  }
  function siStartEdit(index: number) {
    const row = siDraftRows[index]
    if (!row) return
    setSiEditingIndex(index)
    setSiEditTitle(row.title)
    setSiEditDescription(row.description ?? '')
  }
  function siCancelEdit() {
    setSiEditingIndex(null)
    setSiEditTitle('')
    setSiEditDescription('')
  }
  function siCommitEdit() {
    const title = siEditTitle.trim()
    if (title === '') return
    const description = siEditDescription.trim() === '' ? null : siEditDescription.trim()
    const next: ProfiLuxStrategicInitiative = { title, description }
    if (siEditingIndex === -1) {
      setSiDraftRows([...siDraftRows, next])
    } else if (typeof siEditingIndex === 'number' && siEditingIndex >= 0) {
      const copy = [...siDraftRows]
      copy[siEditingIndex] = next
      setSiDraftRows(copy)
    }
    siCancelEdit()
  }
  function siRemove(index: number) {
    setSiDraftRows(siDraftRows.filter((_, i) => i !== index))
    if (siEditingIndex === index) siCancelEdit()
  }
  async function handleSaveStrategicInitiatives() {
    setSiSaving(true)
    setSiError(null)
    try {
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategic_initiatives: siDraftRows }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setSiError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      setSiDrawerOpen(false)
    } catch (err) {
      setSiError(String(err))
    } finally {
      setSiSaving(false)
    }
  }

  // PF-D V3.2 — Portfolio (structured jsonb array-of-objects, { title, url }).
  // URL must start with http:// or https:// (no auto-prepend). Mirror V3.1 SI
  // drawer flow: list + Add CTA + inline form + per-row Edit/Remove. Save
  // overwrites server array with draftRows. Cancel discards draftRows.
  function openPfDrawer() {
    setPfError(null)
    setPfDraftRows(Array.isArray(editor?.portfolio) ? [...editor!.portfolio] : [])
    setPfEditingIndex(null)
    setPfEditTitle('')
    setPfEditUrl('')
    setPfDrawerOpen(true)
  }
  function pfStartAdd() {
    setPfEditingIndex(-1)
    setPfEditTitle('')
    setPfEditUrl('')
  }
  function pfStartEdit(index: number) {
    const row = pfDraftRows[index]
    if (!row) return
    setPfEditingIndex(index)
    setPfEditTitle(row.title)
    setPfEditUrl(row.url)
  }
  function pfCancelEdit() {
    setPfEditingIndex(null)
    setPfEditTitle('')
    setPfEditUrl('')
  }
  // Client-side gate mirrors server coercePortfolioItem URL guard exactly.
  function pfRowValid(title: string, url: string): boolean {
    const t = title.trim()
    const u = url.trim()
    if (t === '' || u === '') return false
    return /^https?:\/\//.test(u)
  }
  function pfCommitEdit() {
    const title = pfEditTitle.trim()
    const url = pfEditUrl.trim()
    if (!pfRowValid(title, url)) return
    const next: ProfiLuxPortfolioItem = { title, url }
    if (pfEditingIndex === -1) {
      setPfDraftRows([...pfDraftRows, next])
    } else if (typeof pfEditingIndex === 'number' && pfEditingIndex >= 0) {
      const copy = [...pfDraftRows]
      copy[pfEditingIndex] = next
      setPfDraftRows(copy)
    }
    pfCancelEdit()
  }
  function pfRemove(index: number) {
    setPfDraftRows(pfDraftRows.filter((_, i) => i !== index))
    if (pfEditingIndex === index) pfCancelEdit()
  }
  async function handleSavePortfolio() {
    setPfSaving(true)
    setPfError(null)
    try {
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio: pfDraftRows }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setPfError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      setPfDrawerOpen(false)
    } catch (err) {
      setPfError(String(err))
    } finally {
      setPfSaving(false)
    }
  }

  // PF-D V3.3 — Press & Features (structured jsonb { title, publication, url }).
  // All three required. URL must start with http:// or https:// (no auto-prepend).
  // Mirrors V3.2 portfolio flow exactly with one additional input.
  function openPressDrawer() {
    setPressError(null)
    setPressDraftRows(Array.isArray(editor?.press_features) ? [...editor!.press_features] : [])
    setPressEditingIndex(null)
    setPressEditTitle('')
    setPressEditPublication('')
    setPressEditUrl('')
    setPressDrawerOpen(true)
  }
  function pressStartAdd() {
    setPressEditingIndex(-1)
    setPressEditTitle('')
    setPressEditPublication('')
    setPressEditUrl('')
  }
  function pressStartEdit(index: number) {
    const row = pressDraftRows[index]
    if (!row) return
    setPressEditingIndex(index)
    setPressEditTitle(row.title)
    setPressEditPublication(row.publication)
    setPressEditUrl(row.url)
  }
  function pressCancelEdit() {
    setPressEditingIndex(null)
    setPressEditTitle('')
    setPressEditPublication('')
    setPressEditUrl('')
  }
  function pressRowValid(title: string, publication: string, url: string): boolean {
    const t = title.trim()
    const p = publication.trim()
    const u = url.trim()
    if (t === '' || p === '' || u === '') return false
    return /^https?:\/\//.test(u)
  }
  function pressCommitEdit() {
    const title = pressEditTitle.trim()
    const publication = pressEditPublication.trim()
    const url = pressEditUrl.trim()
    if (!pressRowValid(title, publication, url)) return
    const next: ProfiLuxPressFeatureItem = { title, publication, url }
    if (pressEditingIndex === -1) {
      setPressDraftRows([...pressDraftRows, next])
    } else if (typeof pressEditingIndex === 'number' && pressEditingIndex >= 0) {
      const copy = [...pressDraftRows]
      copy[pressEditingIndex] = next
      setPressDraftRows(copy)
    }
    pressCancelEdit()
  }
  function pressRemove(index: number) {
    setPressDraftRows(pressDraftRows.filter((_, i) => i !== index))
    if (pressEditingIndex === index) pressCancelEdit()
  }
  async function handleSavePressFeatures() {
    setPressSaving(true)
    setPressError(null)
    try {
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ press_features: pressDraftRows }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setPressError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      setPressDrawerOpen(false)
    } catch (err) {
      setPressError(String(err))
    } finally {
      setPressSaving(false)
    }
  }

  // PF-D V3.4 — References (structured jsonb { name, role, company }).
  // All three required. NO URL, NO contact info, NO relationship. Mirrors
  // V3.3 press_features flow with renamed fields and validator simplified.
  function openRefsDrawer() {
    setRefsError(null)
    setRefsDraftRows(Array.isArray(editor?.references) ? [...editor!.references] : [])
    setRefsEditingIndex(null)
    setRefsEditName('')
    setRefsEditRole('')
    setRefsEditCompany('')
    setRefsDrawerOpen(true)
  }
  function refsStartAdd() {
    setRefsEditingIndex(-1)
    setRefsEditName('')
    setRefsEditRole('')
    setRefsEditCompany('')
  }
  function refsStartEdit(index: number) {
    const row = refsDraftRows[index]
    if (!row) return
    setRefsEditingIndex(index)
    setRefsEditName(row.name)
    setRefsEditRole(row.role)
    setRefsEditCompany(row.company)
  }
  function refsCancelEdit() {
    setRefsEditingIndex(null)
    setRefsEditName('')
    setRefsEditRole('')
    setRefsEditCompany('')
  }
  function refsRowValid(name: string, role: string, company: string): boolean {
    return name.trim() !== '' && role.trim() !== '' && company.trim() !== ''
  }
  function refsCommitEdit() {
    const name = refsEditName.trim()
    const role = refsEditRole.trim()
    const company = refsEditCompany.trim()
    if (!refsRowValid(name, role, company)) return
    const next: ProfiLuxReferenceItem = { name, role, company }
    if (refsEditingIndex === -1) {
      setRefsDraftRows([...refsDraftRows, next])
    } else if (typeof refsEditingIndex === 'number' && refsEditingIndex >= 0) {
      const copy = [...refsDraftRows]
      copy[refsEditingIndex] = next
      setRefsDraftRows(copy)
    }
    refsCancelEdit()
  }
  function refsRemove(index: number) {
    setRefsDraftRows(refsDraftRows.filter((_, i) => i !== index))
    if (refsEditingIndex === index) refsCancelEdit()
  }
  async function handleSaveReferences() {
    setRefsSaving(true)
    setRefsError(null)
    try {
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ references: refsDraftRows }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setRefsError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      setRefsDrawerOpen(false)
    } catch (err) {
      setRefsError(String(err))
    } finally {
      setRefsSaving(false)
    }
  }

  // PF-D V3.5 — Internships (structured jsonb { company, role, period }).
  // All three required. No location, description, start_date, end_date.
  function openIntDrawer() {
    setIntError(null)
    setIntDraftRows(Array.isArray(editor?.internships) ? [...editor!.internships] : [])
    setIntEditingIndex(null)
    setIntEditCompany('')
    setIntEditRole('')
    setIntEditPeriod('')
    setIntDrawerOpen(true)
  }
  function intStartAdd() {
    setIntEditingIndex(-1)
    setIntEditCompany('')
    setIntEditRole('')
    setIntEditPeriod('')
  }
  function intStartEdit(index: number) {
    const row = intDraftRows[index]
    if (!row) return
    setIntEditingIndex(index)
    setIntEditCompany(row.company)
    setIntEditRole(row.role)
    setIntEditPeriod(row.period)
  }
  function intCancelEdit() {
    setIntEditingIndex(null)
    setIntEditCompany('')
    setIntEditRole('')
    setIntEditPeriod('')
  }
  function intRowValid(company: string, role: string, period: string): boolean {
    return company.trim() !== '' && role.trim() !== '' && period.trim() !== ''
  }
  function intCommitEdit() {
    const company = intEditCompany.trim()
    const role = intEditRole.trim()
    const period = intEditPeriod.trim()
    if (!intRowValid(company, role, period)) return
    const next: ProfiLuxInternshipItem = { company, role, period }
    if (intEditingIndex === -1) {
      setIntDraftRows([...intDraftRows, next])
    } else if (typeof intEditingIndex === 'number' && intEditingIndex >= 0) {
      const copy = [...intDraftRows]
      copy[intEditingIndex] = next
      setIntDraftRows(copy)
    }
    intCancelEdit()
  }
  function intRemove(index: number) {
    setIntDraftRows(intDraftRows.filter((_, i) => i !== index))
    if (intEditingIndex === index) intCancelEdit()
  }
  async function handleSaveInternships() {
    setIntSaving(true)
    setIntError(null)
    try {
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internships: intDraftRows }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setIntError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      setIntDrawerOpen(false)
    } catch (err) {
      setIntError(String(err))
    } finally {
      setIntSaving(false)
    }
  }

  // PF-D V2 — Add Section shell: activate a library section by appending its key
  // to members.activated_sections. Trusts client; server stores the array as-is.
  async function handleActivateSection(key: string) {
    setActivatingSectionKey(key)
    setAddSectionError(null)
    try {
      const current = Array.isArray(editor?.activated_sections) ? editor!.activated_sections : []
      const next = current.includes(key) ? current : [...current, key]
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activated_sections: next }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({} as any))
        setAddSectionError(typeof d?.error === 'string' ? d.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
      setAddSectionDrawerOpen(false)
    } catch (err) {
      setAddSectionError(String(err))
    } finally {
      setActivatingSectionKey(null)
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

  // PF-MANAGE V12 — scrollspy for sticky left-rail. Lives at top scope (R2).
  useEffect(() => {
    if (tab !== 'manage') return
    const ids = ['m-visibility', 'm-share', 'm-mask', 'm-pref', 'm-cv', 'm-account']
    const onScroll = () => {
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top - 160 <= 0) current = id
      }
      setActiveManageSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
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

  // PF-MANAGE V12 — Opportunity preferences toggle. Mirrors toggleMaskedField
  // pattern; POSTs to existing /api/profilux which accepts matching_opt_in.
  async function toggleMatching(next: boolean) {
    setMatchingSaving(true)
    setMatchingError(null)
    try {
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matching_opt_in: next }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setMatchingError(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        return
      }
      await refetch()
    } catch (err) {
      setMatchingError(String(err))
    } finally {
      setMatchingSaving(false)
    }
  }

  async function copyShareUrl() {
    const url = shareStatus?.public_url
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setShareCopyStatus('copied')
      window.setTimeout(() => setShareCopyStatus('idle'), 1600)
    } catch {
      setShareCopyStatus('idle')
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
        <div role="tablist" style={{ display: 'inline-flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.025)', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: 3 }}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'view'}
            onClick={() => setTab('view')}
            style={{ background: tab === 'view' ? 'rgba(255,255,255,0.06)' : 'transparent', color: tab === 'view' ? '#fff' : '#999', border: 'none', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 500, letterSpacing: '0.5px', cursor: 'pointer', borderRadius: 5 }}
          >View</button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'edit'}
            onClick={() => setTab('edit')}
            style={{ background: tab === 'edit' ? 'rgba(255,255,255,0.06)' : 'transparent', color: tab === 'edit' ? '#a58e28' : '#999', border: 'none', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 500, letterSpacing: '0.5px', cursor: 'pointer', borderRadius: 5 }}
          >Edit</button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'manage'}
            onClick={() => setTab('manage')}
            style={{ background: tab === 'manage' ? 'rgba(255,255,255,0.06)' : 'transparent', color: tab === 'manage' ? '#a58e28' : '#999', border: 'none', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 500, letterSpacing: '0.5px', cursor: 'pointer', borderRadius: 5 }}
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
                  <span>Manage</span>
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

            {/* PF-D V1 — Certifications (first library section, free-text, mirrors Maisons) */}
            {(() => {
              if (!Array.isArray(e.certifications) || e.certifications.length === 0) return null
              return (
            <ViewZone title="Certifications">
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.5 }}>
                {e.certifications.join(' · ')}
              </div>
            </ViewZone>
              )
            })()}

            {/* PF-D V1 — Awards (free-text, mirrors Certifications) */}
            {(() => {
              if (!Array.isArray(e.awards) || e.awards.length === 0) return null
              return (
            <ViewZone title="Awards">
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.5 }}>
                {e.awards.join(' · ')}
              </div>
            </ViewZone>
              )
            })()}

            {/* PF-D V3.1 — Memberships (free-text text[], mirrors Awards) */}
            {(() => {
              if (!Array.isArray(e.memberships) || e.memberships.length === 0) return null
              return (
            <ViewZone title="Memberships">
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.5 }}>
                {e.memberships.join(' · ')}
              </div>
            </ViewZone>
              )
            })()}

            {/* PF-D V3.1 — Strategic Initiatives (structured jsonb array-of-objects) */}
            {(() => {
              if (!Array.isArray(e.strategic_initiatives) || e.strategic_initiatives.length === 0) return null
              return (
            <ViewZone title="Strategic Initiatives">
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {e.strategic_initiatives.map((si, idx) => (
                  <div key={idx}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{si.title}</div>
                    {si.description && (
                      <div style={{ color: '#999', marginTop: 2 }}>{si.description}</div>
                    )}
                  </div>
                ))}
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
            {/* V12 scene-2 doc-header — title + meta on the left, action row on the right */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, marginBottom: 32 }}>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', marginBottom: 6 }}>
                  ProfiLux
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#999', margin: 0 }}>
                  Generated from your CV · Edit each section to keep your dossier current
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <Link
                  href="/dashboard/candidate/profilux/cv-merge"
                  style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent', color: '#fff', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 14px', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, letterSpacing: 0.2, textDecoration: 'none', cursor: 'pointer' }}
                >
                  Re-upload CV
                </Link>
                <button
                  type="button"
                  onClick={() => setTab('view')}
                  style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', color: '#1a1a1a', border: '1px solid #fff', borderRadius: 8, padding: '8px 14px', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: 0.2, cursor: 'pointer', fontWeight: 500 }}
                >
                  Done →
                </button>
              </div>
            </div>
            {/* PROFILUX OVERVIEW progress band */}
            <div style={{ background: '#222', border: '1px solid rgba(165,142,40,0.2)', borderRadius: 12, padding: 22, marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#a58e28', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                ProfiLux Overview
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 14.5, color: '#ccc', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                  The more you tell us, the more we can work for you.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ flex: 1, height: 3, background: '#2a2a2a', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', background: '#1D9E75' }} />
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums', flex: '0 0 auto', minWidth: 40 }}>
                    {pct}%
                  </div>
                </div>
              </div>
            </div>
            {/* YOUR DOSSIER row — V12 places + Add section here */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14, padding: '0 4px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#8e8e8e', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                Your dossier
              </div>
              <button
                type="button"
                onClick={() => { setAddSectionError(null); setAddSectionDrawerOpen(true) }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: '#999', border: '1px dashed #2a2a2a', borderRadius: 8, padding: '9px 18px', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '0.3px', cursor: 'pointer' }}
              >
                <span style={{ color: '#a58e28', fontWeight: 600 }}>+</span> Add section
              </button>
            </div>
          </>
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
                border: '1px solid rgba(165,142,40,0.2)',
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
            <VisibilityToggle
              sectionId="identity"
              isVisible={editor.section_visibility?.['identity'] ?? true}
              isToggling={visibilityToggling === 'identity'}
              onToggle={toggleSectionVisibility}
            />
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
                border: '1px solid rgba(165,142,40,0.2)',
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
            <VisibilityToggle
              sectionId="current_role"
              isVisible={editor.section_visibility?.['current_role'] ?? true}
              isToggling={visibilityToggling === 'current_role'}
              onToggle={toggleSectionVisibility}
            />
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
                border: '1px solid rgba(165,142,40,0.2)',
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
            <VisibilityToggle
              sectionId="career_path"
              isVisible={editor.section_visibility?.['career_path'] ?? true}
              isToggling={visibilityToggling === 'career_path'}
              onToggle={toggleSectionVisibility}
            />
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
                border: '1px solid rgba(165,142,40,0.2)',
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
            <VisibilityToggle
              sectionId="education"
              isVisible={editor.section_visibility?.['education'] ?? true}
              isToggling={visibilityToggling === 'education'}
              onToggle={toggleSectionVisibility}
            />
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
                border: '1px solid rgba(165,142,40,0.2)',
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
            <VisibilityToggle
              sectionId="languages"
              isVisible={editor.section_visibility?.['languages'] ?? true}
              isToggling={visibilityToggling === 'languages'}
              onToggle={toggleSectionVisibility}
            />
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
                border: '1px solid rgba(165,142,40,0.2)',
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
            <VisibilityToggle
              sectionId="luxury_fit"
              isVisible={editor.section_visibility?.['luxury_fit'] ?? true}
              isToggling={visibilityToggling === 'luxury_fit'}
              onToggle={toggleSectionVisibility}
            />
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
                border: '1px solid rgba(165,142,40,0.2)',
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
            <VisibilityToggle
              sectionId="skills_markets"
              isVisible={editor.section_visibility?.['skills_markets'] ?? true}
              isToggling={visibilityToggling === 'skills_markets'}
              onToggle={toggleSectionVisibility}
            />
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
                border: '1px solid rgba(165,142,40,0.2)',
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
            <VisibilityToggle
              sectionId="clienteling"
              isVisible={editor.section_visibility?.['clienteling'] ?? true}
              isToggling={visibilityToggling === 'clienteling'}
              onToggle={toggleSectionVisibility}
            />
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
      {e.activated_sections.includes('certifications') && (<>
      <SectionCard
        eyebrow="Certifications"
        headerAction={
          <button
            type="button"
            onClick={openCertificationsDrawer}
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
          {e.certifications.length > 0
            ? e.certifications.join(', ')
            : <NotSet />}
        </div>
      </SectionCard>
      <Drawer
        open={certificationsDrawerOpen}
        title="Certifications"
        onClose={() => setCertificationsDrawerOpen(false)}
      >
        <div style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>
          One certification per line. Empty lines are ignored.
        </div>
        <textarea
          style={{ ...input, maxWidth: 600, fontFamily: 'Inter, sans-serif', minHeight: 160, resize: 'vertical' }}
          rows={8}
          value={certificationsDraftText}
          onChange={(ev) => setCertificationsDraftText(ev.target.value)}
          placeholder={'e.g.\nGIA Graduate Gemologist\nWSET Level 3\nLuxury Retail Management Certificate'}
        />
        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            style={certificationsSaving ? saveBtnDis : saveBtn}
            disabled={certificationsSaving}
            onClick={handleSaveCertifications}
          >
            {certificationsSaving ? 'Saving…' : 'Save'}
          </button>
          {certificationsError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{certificationsError}</span>}
        </div>
      </Drawer>
      </>)}
      {e.activated_sections.includes('awards') && (<>
      <SectionCard
        eyebrow="Awards"
        headerAction={
          <button
            type="button"
            onClick={openAwardsDrawer}
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
          {e.awards.length > 0
            ? e.awards.join(', ')
            : <NotSet />}
        </div>
      </SectionCard>
      <Drawer
        open={awardsDrawerOpen}
        title="Awards"
        onClose={() => setAwardsDrawerOpen(false)}
      >
        <div style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>
          One award per line. Empty lines are ignored.
        </div>
        <textarea
          style={{ ...input, maxWidth: 600, fontFamily: 'Inter, sans-serif', minHeight: 160, resize: 'vertical' }}
          rows={8}
          value={awardsDraftText}
          onChange={(ev) => setAwardsDraftText(ev.target.value)}
          placeholder={'e.g.\nLuxury Retail Excellence Award 2023\nForbes 30 Under 30 Luxury'}
        />
        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            style={awardsSaving ? saveBtnDis : saveBtn}
            disabled={awardsSaving}
            onClick={handleSaveAwards}
          >
            {awardsSaving ? 'Saving…' : 'Save'}
          </button>
          {awardsError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{awardsError}</span>}
        </div>
      </Drawer>
      </>)}
      {e.activated_sections.includes('memberships') && (<>
      <SectionCard
        eyebrow="Memberships"
        headerAction={
          <button
            type="button"
            onClick={openMembershipsDrawer}
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
          {e.memberships.length > 0
            ? e.memberships.join(', ')
            : <NotSet />}
        </div>
      </SectionCard>
      <Drawer
        open={membershipsDrawerOpen}
        title="Memberships"
        onClose={() => setMembershipsDrawerOpen(false)}
      >
        <div style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>
          One membership per line. Empty lines are ignored.
        </div>
        <textarea
          style={{ ...input, maxWidth: 600, fontFamily: 'Inter, sans-serif', minHeight: 160, resize: 'vertical' }}
          rows={8}
          value={membershipsDraftText}
          onChange={(ev) => setMembershipsDraftText(ev.target.value)}
          placeholder={'e.g.\nComité Colbert\nBoF Professional\nWalpole Member'}
        />
        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            style={membershipsSaving ? saveBtnDis : saveBtn}
            disabled={membershipsSaving}
            onClick={handleSaveMemberships}
          >
            {membershipsSaving ? 'Saving…' : 'Save'}
          </button>
          {membershipsError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{membershipsError}</span>}
        </div>
      </Drawer>
      </>)}
      {e.activated_sections.includes('strategic_initiatives') && (<>
      <SectionCard
        eyebrow="Strategic Initiatives"
        headerAction={
          <button
            type="button"
            onClick={openSiDrawer}
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
          {e.strategic_initiatives.length > 0
            ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {e.strategic_initiatives.map((si, idx) => (
                  <div key={idx}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{si.title}</div>
                    {si.description && (
                      <div style={{ color: '#999', marginTop: 2, fontSize: 13 }}>{si.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )
            : <NotSet />}
        </div>
      </SectionCard>
      <Drawer
        open={siDrawerOpen}
        title="Strategic Initiatives"
        onClose={() => setSiDrawerOpen(false)}
      >
        <div style={{ color: '#999', fontSize: 12, marginBottom: 14 }}>
          Each initiative has a title (required) and optional description. Save commits the full list.
        </div>

        {/* Existing rows list */}
        {siDraftRows.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {siDraftRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  border: '0.5px solid #2a2a2a',
                  borderRadius: 6,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{row.title}</div>
                  {row.description && (
                    <div style={{ color: '#999', fontSize: 13, marginTop: 4 }}>{row.description}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => siStartEdit(idx)}
                    style={{ background: 'transparent', color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => siRemove(idx)}
                    style={{ background: 'transparent', color: '#999', border: '1px solid #333', padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline edit/add form */}
        {siEditingIndex !== null ? (
          <div style={{ border: '0.5px solid rgba(165,142,40,0.3)', borderRadius: 6, padding: 14, marginBottom: 14 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Title <span style={{ color: '#a58e28' }}>*</span></div>
              <input
                type="text"
                style={{ ...input, maxWidth: 600 }}
                value={siEditTitle}
                onChange={(ev) => setSiEditTitle(ev.target.value)}
                placeholder="e.g. Opened APAC retail"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Description</div>
              <textarea
                style={{ ...input, maxWidth: 600, fontFamily: 'Inter, sans-serif', minHeight: 80, resize: 'vertical' }}
                rows={4}
                value={siEditDescription}
                onChange={(ev) => setSiEditDescription(ev.target.value)}
                placeholder="Optional — what you led, scope, outcome"
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={siCommitEdit}
                disabled={siEditTitle.trim() === ''}
                style={siEditTitle.trim() === '' ? saveBtnDis : saveBtn}
              >
                {siEditingIndex === -1 ? 'Add' : 'Update'}
              </button>
              <button
                type="button"
                onClick={siCancelEdit}
                style={btn}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={siStartAdd}
            style={{
              background: 'transparent',
              color: '#a58e28',
              border: '1px dashed rgba(165,142,40,0.4)',
              padding: '10px 14px',
              fontSize: 12,
              letterSpacing: '0.4px',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 14,
              width: '100%',
              maxWidth: 600,
              textAlign: 'left',
            }}
          >
            + Add initiative
          </button>
        )}

        <div style={{ marginTop: 4, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            style={siSaving ? saveBtnDis : saveBtn}
            disabled={siSaving}
            onClick={handleSaveStrategicInitiatives}
          >
            {siSaving ? 'Saving…' : 'Save'}
          </button>
          {siError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{siError}</span>}
        </div>
      </Drawer>
      </>)}
      {e.activated_sections.includes('portfolio') && (<>
      <SectionCard
        eyebrow="Portfolio"
        headerAction={
          <button
            type="button"
            onClick={openPfDrawer}
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
          {e.portfolio.length > 0
            ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {e.portfolio.map((pf, idx) => (
                  <div key={idx}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{pf.title}</div>
                    <div style={{ color: '#999', marginTop: 2, fontSize: 13, wordBreak: 'break-all' }}>{pf.url}</div>
                  </div>
                ))}
              </div>
            )
            : <NotSet />}
        </div>
      </SectionCard>
      <Drawer
        open={pfDrawerOpen}
        title="Portfolio"
        onClose={() => setPfDrawerOpen(false)}
      >
        <div style={{ color: '#999', fontSize: 12, marginBottom: 14 }}>
          Each link has a title (required) and URL (required, must start with http:// or https://). Save commits the full list.
        </div>

        {/* Existing rows list */}
        {pfDraftRows.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {pfDraftRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  border: '0.5px solid #2a2a2a',
                  borderRadius: 6,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{row.title}</div>
                  <div style={{ color: '#999', fontSize: 13, marginTop: 4, wordBreak: 'break-all' }}>{row.url}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => pfStartEdit(idx)}
                    style={{ background: 'transparent', color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => pfRemove(idx)}
                    style={{ background: 'transparent', color: '#999', border: '1px solid #333', padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline edit/add form */}
        {pfEditingIndex !== null ? (
          <div style={{ border: '0.5px solid rgba(165,142,40,0.3)', borderRadius: 6, padding: 14, marginBottom: 14 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Title <span style={{ color: '#a58e28' }}>*</span></div>
              <input
                type="text"
                style={{ ...input, maxWidth: 600 }}
                value={pfEditTitle}
                onChange={(ev) => setPfEditTitle(ev.target.value)}
                placeholder="e.g. Brand book — Spring 2025"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>URL <span style={{ color: '#a58e28' }}>*</span></div>
              <input
                type="text"
                style={{ ...input, maxWidth: 600 }}
                value={pfEditUrl}
                onChange={(ev) => setPfEditUrl(ev.target.value)}
                placeholder="https://example.com/portfolio"
              />
              <div style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
                Must start with http:// or https://
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={pfCommitEdit}
                disabled={!pfRowValid(pfEditTitle, pfEditUrl)}
                style={!pfRowValid(pfEditTitle, pfEditUrl) ? saveBtnDis : saveBtn}
              >
                {pfEditingIndex === -1 ? 'Add' : 'Update'}
              </button>
              <button
                type="button"
                onClick={pfCancelEdit}
                style={btn}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={pfStartAdd}
            style={{
              background: 'transparent',
              color: '#a58e28',
              border: '1px dashed rgba(165,142,40,0.4)',
              padding: '10px 14px',
              fontSize: 12,
              letterSpacing: '0.4px',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 14,
              width: '100%',
              maxWidth: 600,
              textAlign: 'left',
            }}
          >
            + Add link
          </button>
        )}

        <div style={{ marginTop: 4, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            style={pfSaving ? saveBtnDis : saveBtn}
            disabled={pfSaving}
            onClick={handleSavePortfolio}
          >
            {pfSaving ? 'Saving…' : 'Save'}
          </button>
          {pfError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{pfError}</span>}
        </div>
      </Drawer>
      </>)}
      {e.activated_sections.includes('press_features') && (<>
      <SectionCard
        eyebrow="Press & features"
        headerAction={
          <button
            type="button"
            onClick={openPressDrawer}
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
          {e.press_features.length > 0
            ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {e.press_features.map((p, idx) => (
                  <div key={idx}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{p.title}</div>
                    <div style={{ color: '#999', marginTop: 2, fontSize: 12 }}>{p.publication}</div>
                    <div style={{ color: '#999', marginTop: 2, fontSize: 13, wordBreak: 'break-all' }}>{p.url}</div>
                  </div>
                ))}
              </div>
            )
            : <NotSet />}
        </div>
      </SectionCard>
      <Drawer
        open={pressDrawerOpen}
        title="Press & features"
        onClose={() => setPressDrawerOpen(false)}
      >
        <div style={{ color: '#999', fontSize: 12, marginBottom: 14 }}>
          Each feature has a title (required), publication (required), and URL (required, must start with http:// or https://). Save commits the full list.
        </div>

        {/* Existing rows list */}
        {pressDraftRows.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {pressDraftRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  border: '0.5px solid #2a2a2a',
                  borderRadius: 6,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{row.title}</div>
                  <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{row.publication}</div>
                  <div style={{ color: '#999', fontSize: 13, marginTop: 2, wordBreak: 'break-all' }}>{row.url}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => pressStartEdit(idx)}
                    style={{ background: 'transparent', color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => pressRemove(idx)}
                    style={{ background: 'transparent', color: '#999', border: '1px solid #333', padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline edit/add form */}
        {pressEditingIndex !== null ? (
          <div style={{ border: '0.5px solid rgba(165,142,40,0.3)', borderRadius: 6, padding: 14, marginBottom: 14 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Title <span style={{ color: '#a58e28' }}>*</span></div>
              <input
                type="text"
                style={{ ...input, maxWidth: 600 }}
                value={pressEditTitle}
                onChange={(ev) => setPressEditTitle(ev.target.value)}
                placeholder="e.g. The new face of French luxury"
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Publication <span style={{ color: '#a58e28' }}>*</span></div>
              <input
                type="text"
                style={{ ...input, maxWidth: 600 }}
                value={pressEditPublication}
                onChange={(ev) => setPressEditPublication(ev.target.value)}
                placeholder="e.g. Business of Fashion"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>URL <span style={{ color: '#a58e28' }}>*</span></div>
              <input
                type="text"
                style={{ ...input, maxWidth: 600 }}
                value={pressEditUrl}
                onChange={(ev) => setPressEditUrl(ev.target.value)}
                placeholder="https://example.com/article"
              />
              <div style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
                Must start with http:// or https://
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={pressCommitEdit}
                disabled={!pressRowValid(pressEditTitle, pressEditPublication, pressEditUrl)}
                style={!pressRowValid(pressEditTitle, pressEditPublication, pressEditUrl) ? saveBtnDis : saveBtn}
              >
                {pressEditingIndex === -1 ? 'Add' : 'Update'}
              </button>
              <button
                type="button"
                onClick={pressCancelEdit}
                style={btn}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={pressStartAdd}
            style={{
              background: 'transparent',
              color: '#a58e28',
              border: '1px dashed rgba(165,142,40,0.4)',
              padding: '10px 14px',
              fontSize: 12,
              letterSpacing: '0.4px',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 14,
              width: '100%',
              maxWidth: 600,
              textAlign: 'left',
            }}
          >
            + Add feature
          </button>
        )}

        <div style={{ marginTop: 4, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            style={pressSaving ? saveBtnDis : saveBtn}
            disabled={pressSaving}
            onClick={handleSavePressFeatures}
          >
            {pressSaving ? 'Saving…' : 'Save'}
          </button>
          {pressError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{pressError}</span>}
        </div>
      </Drawer>
      </>)}
      {e.activated_sections.includes('references') && (<>
      <SectionCard
        eyebrow="References"
        headerAction={
          <button
            type="button"
            onClick={openRefsDrawer}
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
          {e.references.length > 0
            ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {e.references.map((r, idx) => (
                  <div key={idx}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{r.name}</div>
                    <div style={{ color: '#999', marginTop: 2, fontSize: 12 }}>{r.role}</div>
                    <div style={{ color: '#999', marginTop: 2, fontSize: 12 }}>{r.company}</div>
                  </div>
                ))}
              </div>
            )
            : <NotSet />}
        </div>
      </SectionCard>
      <Drawer
        open={refsDrawerOpen}
        title="References"
        onClose={() => setRefsDrawerOpen(false)}
      >
        <div style={{ color: '#999', fontSize: 12, marginBottom: 14 }}>
          Each reference has a name (required), role (required), and company (required). Save commits the full list.
        </div>

        {/* Existing rows list */}
        {refsDraftRows.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {refsDraftRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  border: '0.5px solid #2a2a2a',
                  borderRadius: 6,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{row.name}</div>
                  <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{row.role}</div>
                  <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{row.company}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => refsStartEdit(idx)}
                    style={{ background: 'transparent', color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => refsRemove(idx)}
                    style={{ background: 'transparent', color: '#999', border: '1px solid #333', padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline edit/add form */}
        {refsEditingIndex !== null ? (
          <div style={{ border: '0.5px solid rgba(165,142,40,0.3)', borderRadius: 6, padding: 14, marginBottom: 14 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Name <span style={{ color: '#a58e28' }}>*</span></div>
              <input
                type="text"
                style={{ ...input, maxWidth: 600 }}
                value={refsEditName}
                onChange={(ev) => setRefsEditName(ev.target.value)}
                placeholder="e.g. Marie Dubois"
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Role <span style={{ color: '#a58e28' }}>*</span></div>
              <input
                type="text"
                style={{ ...input, maxWidth: 600 }}
                value={refsEditRole}
                onChange={(ev) => setRefsEditRole(ev.target.value)}
                placeholder="e.g. Global Retail Director"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Company <span style={{ color: '#a58e28' }}>*</span></div>
              <input
                type="text"
                style={{ ...input, maxWidth: 600 }}
                value={refsEditCompany}
                onChange={(ev) => setRefsEditCompany(ev.target.value)}
                placeholder="e.g. Chanel"
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={refsCommitEdit}
                disabled={!refsRowValid(refsEditName, refsEditRole, refsEditCompany)}
                style={!refsRowValid(refsEditName, refsEditRole, refsEditCompany) ? saveBtnDis : saveBtn}
              >
                {refsEditingIndex === -1 ? 'Add' : 'Update'}
              </button>
              <button
                type="button"
                onClick={refsCancelEdit}
                style={btn}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={refsStartAdd}
            style={{
              background: 'transparent',
              color: '#a58e28',
              border: '1px dashed rgba(165,142,40,0.4)',
              padding: '10px 14px',
              fontSize: 12,
              letterSpacing: '0.4px',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 14,
              width: '100%',
              maxWidth: 600,
              textAlign: 'left',
            }}
          >
            + Add reference
          </button>
        )}

        <div style={{ marginTop: 4, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            style={refsSaving ? saveBtnDis : saveBtn}
            disabled={refsSaving}
            onClick={handleSaveReferences}
          >
            {refsSaving ? 'Saving…' : 'Save'}
          </button>
          {refsError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{refsError}</span>}
        </div>
      </Drawer>
      </>)}
      {e.activated_sections.includes('internships') && (<>
      <SectionCard
        eyebrow="Internships"
        headerAction={
          <button
            type="button"
            onClick={openIntDrawer}
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
          {e.internships.length > 0
            ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {e.internships.map((r, idx) => (
                  <div key={idx}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{r.company}</div>
                    <div style={{ color: '#999', marginTop: 2, fontSize: 12 }}>{r.role}</div>
                    <div style={{ color: '#999', marginTop: 2, fontSize: 12 }}>{r.period}</div>
                  </div>
                ))}
              </div>
            )
            : <NotSet />}
        </div>
      </SectionCard>
      <Drawer
        open={intDrawerOpen}
        title="Internships"
        onClose={() => setIntDrawerOpen(false)}
      >
        <div style={{ color: '#999', fontSize: 12, marginBottom: 14 }}>
          Each internship has a company (required), role (required), and period (required). Save commits the full list.
        </div>

        {/* Existing rows list */}
        {intDraftRows.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {intDraftRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  border: '0.5px solid #2a2a2a',
                  borderRadius: 6,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{row.company}</div>
                  <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{row.role}</div>
                  <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{row.period}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => intStartEdit(idx)}
                    style={{ background: 'transparent', color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => intRemove(idx)}
                    style={{ background: 'transparent', color: '#999', border: '1px solid #333', padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline edit/add form */}
        {intEditingIndex !== null ? (
          <div style={{ border: '0.5px solid rgba(165,142,40,0.3)', borderRadius: 6, padding: 14, marginBottom: 14 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Company <span style={{ color: '#a58e28' }}>*</span></div>
              <input
                type="text"
                style={{ ...input, maxWidth: 600 }}
                value={intEditCompany}
                onChange={(ev) => setIntEditCompany(ev.target.value)}
                placeholder="e.g. Hermès"
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Role <span style={{ color: '#a58e28' }}>*</span></div>
              <input
                type="text"
                style={{ ...input, maxWidth: 600 }}
                value={intEditRole}
                onChange={(ev) => setIntEditRole(ev.target.value)}
                placeholder="e.g. Retail Intern"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>Period <span style={{ color: '#a58e28' }}>*</span></div>
              <input
                type="text"
                style={{ ...input, maxWidth: 600 }}
                value={intEditPeriod}
                onChange={(ev) => setIntEditPeriod(ev.target.value)}
                placeholder="e.g. Summer 2024"
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={intCommitEdit}
                disabled={!intRowValid(intEditCompany, intEditRole, intEditPeriod)}
                style={!intRowValid(intEditCompany, intEditRole, intEditPeriod) ? saveBtnDis : saveBtn}
              >
                {intEditingIndex === -1 ? 'Add' : 'Update'}
              </button>
              <button
                type="button"
                onClick={intCancelEdit}
                style={btn}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={intStartAdd}
            style={{
              background: 'transparent',
              color: '#a58e28',
              border: '1px dashed rgba(165,142,40,0.4)',
              padding: '10px 14px',
              fontSize: 12,
              letterSpacing: '0.4px',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 14,
              width: '100%',
              maxWidth: 600,
              textAlign: 'left',
            }}
          >
            + Add internship
          </button>
        )}

        <div style={{ marginTop: 4, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            style={intSaving ? saveBtnDis : saveBtn}
            disabled={intSaving}
            onClick={handleSaveInternships}
          >
            {intSaving ? 'Saving…' : 'Save'}
          </button>
          {intError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{intError}</span>}
        </div>
      </Drawer>
      </>)}
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
                border: '1px solid rgba(165,142,40,0.2)',
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
            <VisibilityToggle
              sectionId="compensation"
              isVisible={editor.section_visibility?.['compensation'] ?? true}
              isToggling={visibilityToggling === 'compensation'}
              onToggle={toggleSectionVisibility}
            />
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
                border: '1px solid rgba(165,142,40,0.2)',
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
            <VisibilityToggle
              sectionId="availability"
              isVisible={editor.section_visibility?.['availability'] ?? true}
              isToggling={visibilityToggling === 'availability'}
              onToggle={toggleSectionVisibility}
            />
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

      {/* PF-D V2.1 — EXTEND DOSSIER drawer (trigger lives in top-right action row) */}
      <Drawer
        open={addSectionDrawerOpen}
        title="EXTEND DOSSIER"
        onClose={() => setAddSectionDrawerOpen(false)}
      >
        <div style={{ color: '#999', fontSize: 12, marginBottom: 14 }}>
          Add a section to your dossier. New sections appear in the Edit tab; the View tab shows them when populated.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ADD_SECTION_LIBRARY.map((s) => {
            const isActivated = e.activated_sections.includes(s.key)
            const isInFlight = activatingSectionKey === s.key
            if (!s.available) {
              return (
                <div
                  key={s.key}
                  aria-disabled="true"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    border: '0.5px solid #2a2a2a',
                    borderRadius: 6,
                    color: '#999',
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    pointerEvents: 'none',
                    opacity: 0.4,
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontSize: 11, color: '#777', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Coming soon</span>
                </div>
              )
            }
            if (isActivated) {
              return (
                <div
                  key={s.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    border: '0.5px solid #2a2a2a',
                    borderRadius: 6,
                    color: '#777',
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontSize: 11, color: '#777', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Added</span>
                </div>
              )
            }
            return (
              <button
                key={s.key}
                type="button"
                disabled={isInFlight}
                onClick={() => handleActivateSection(s.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'transparent',
                  border: '0.5px solid rgba(165,142,40,0.3)',
                  borderRadius: 6,
                  color: '#ccc',
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                  cursor: isInFlight ? 'not-allowed' : 'pointer',
                  opacity: isInFlight ? 0.5 : 1,
                  textAlign: 'left',
                }}
              >
                <span>{s.label}</span>
                <span style={{ fontSize: 11, color: '#a58e28', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  {isInFlight ? 'Adding…' : 'Add'}
                </span>
              </button>
            )
          })}
        </div>
        {addSectionError && (
          <div style={{ marginTop: 14, color: '#ff6b6b', fontSize: 13 }}>{addSectionError}</div>
        )}
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

      {tab === 'manage' && (() => {
        // PF-MANAGE V12 — single VISUAL slice. Page-level rewrite of the
        // Manage tab. Six sections, left rail with scrollspy, V12 spacing
        // and typography. No destructive account behavior (R3).
        const RAIL_SECTIONS: Array<{ id: string; label: string }> = [
          { id: 'm-visibility', label: 'Visibility' },
          { id: 'm-share',      label: 'Share & export' },
          { id: 'm-mask',       label: 'Maskable fields' },
          { id: 'm-pref',       label: 'Opportunity preferences' },
          { id: 'm-cv',         label: 'CV & document' },
          { id: 'm-account',    label: 'Account' },
        ]
        const block: React.CSSProperties = {
          background: '#222',
          border: '1px solid #2a2a2a',
          borderRadius: 14,
          padding: '28px 30px',
          marginBottom: 18,
          scrollMarginTop: 120,
        }
        const blockHead: React.CSSProperties = { marginBottom: 18 }
        const blockTitle: React.CSSProperties = {
          fontFamily: 'Playfair Display, serif',
          fontSize: 20,
          color: '#fff',
          fontWeight: 400,
          margin: '0 0 4px 0',
        }
        const blockSub: React.CSSProperties = {
          fontSize: 12.5,
          color: '#999',
          margin: 0,
          lineHeight: 1.55,
        }
        const rowStyle: React.CSSProperties = {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 0',
          gap: 24,
          borderTop: '0.5px solid #2a2a2a',
        }
        const rowLeft: React.CSSProperties = { flex: 1, minWidth: 0 }
        const rowTitle: React.CSSProperties = {
          fontSize: 13.5,
          color: '#fff',
          marginBottom: 3,
          fontFamily: 'Inter, sans-serif',
        }
        const rowSub: React.CSSProperties = {
          fontSize: 12,
          color: '#999',
          lineHeight: 1.5,
          fontFamily: 'Inter, sans-serif',
        }
        const rowRight: React.CSSProperties = { flexShrink: 0 }
        const manageBtn: React.CSSProperties = {
          background: 'transparent',
          border: '1px solid #2a2a2a',
          color: '#fff',
          fontSize: 12,
          padding: '7px 14px',
          borderRadius: 7,
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
        }
        const manageBtnDisabled: React.CSSProperties = {
          ...manageBtn,
          color: '#777',
          cursor: 'not-allowed',
          opacity: 0.7,
        }
        const prefGrid: React.CSSProperties = {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
          marginTop: 14,
        }
        const prefCell: React.CSSProperties = {
          border: '1px solid #2a2a2a',
          borderRadius: 10,
          padding: '14px 16px',
        }
        const prefLabel: React.CSSProperties = {
          fontSize: 10,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: '#8e8e8e',
          marginBottom: 6,
          fontFamily: 'Inter, sans-serif',
        }
        const prefValue: React.CSSProperties = {
          fontSize: 13.5,
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
        }
        const prefValueEmpty: React.CSSProperties = {
          ...prefValue,
          color: '#777',
          fontStyle: 'italic',
        }
        const renderToggle = (on: boolean, busy: boolean, onClick: () => void, label: string) => (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={label}
            disabled={busy}
            onClick={onClick}
            style={{
              position: 'relative',
              width: 38,
              height: 22,
              background: on ? '#a58e28' : '#333',
              borderRadius: 999,
              border: 'none',
              cursor: busy ? 'not-allowed' : 'pointer',
              padding: 0,
              transition: 'background 0.2s',
              opacity: busy ? 0.55 : 1,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 16,
                height: 16,
                top: 3,
                left: 3,
                background: on ? '#1a1a1a' : '#ccc',
                borderRadius: '50%',
                transform: on ? 'translateX(16px)' : 'translateX(0)',
                transition: 'transform 0.2s, background 0.2s',
                display: 'block',
              }}
            />
          </button>
        )

        const seniorityValue = seniorityLabel(e.seniority)
        const departmentsValue = (e.desired_departments ?? []).map(departmentLabel).filter(Boolean).join(' · ')
        const marketsValue = (e.desired_locations ?? []).join(' · ')
        const salaryValue = formatSalaryK(e.desired_salary_min, e.desired_salary_max, e.desired_salary_currency)

        const cvFilename = cvUrl ? (decodeURIComponent(cvUrl.split('/').pop() || '') || 'CV.pdf') : null

        return (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '220px 1fr',
            gap: isMobile ? 24 : 48,
            alignItems: 'flex-start',
          }}>
            {/* LEFT RAIL — sticky, scrollspy */}
            <aside
              style={{
                position: isMobile ? 'static' : 'sticky',
                top: 110,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 2,
                color: '#777',
                marginBottom: 14,
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
              }}>
                Sections
              </div>
              {RAIL_SECTIONS.map((s) => {
                const active = activeManageSection === s.id
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    style={{
                      fontSize: 13,
                      color: active ? '#a58e28' : '#999',
                      padding: '8px 0 8px 14px',
                      marginLeft: -16,
                      borderLeft: `2px solid ${active ? '#a58e28' : 'transparent'}`,
                      textDecoration: 'none',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'color 0.18s ease, border-color 0.18s ease',
                    }}
                  >
                    {s.label}
                  </a>
                )
              })}
            </aside>

            {/* RIGHT CONTENT — 6 V12 blocks */}
            <div style={{ minWidth: 0 }}>

              {/* 1. VISIBILITY */}
              <div id="m-visibility" style={block}>
                <div style={blockHead}>
                  <h2 style={blockTitle}>Visibility</h2>
                  <p style={blockSub}>Decide whether your ProfiLux is discoverable beyond JOBLUX&apos;s recruiting layer.</p>
                </div>

                {/* Public profile toggle */}
                {(() => {
                  const hasSlug = Boolean(shareStatus?.share_slug)
                  const on = Boolean(shareStatus?.sharing_enabled)
                  const busy = shareStatusLoading || sharingToggleSaving || !hasSlug
                  return (
                    <div style={rowStyle}>
                      <div style={rowLeft}>
                        <div style={rowTitle}>Public profile</div>
                        <div style={rowSub}>
                          When ON, your ProfiLux can be opened via a private URL you choose to share. Your discoverability inside JOBLUX matching is unaffected.
                          {!hasSlug && !shareStatusLoading && (
                            <> {' '}<span style={{ color: '#777', fontStyle: 'italic' }}>Reserve a link in Share &amp; export first.</span></>
                          )}
                        </div>
                        {sharingToggleError && (
                          <div style={{ marginTop: 6, fontSize: 11, color: '#ff6b6b' }}>{sharingToggleError}</div>
                        )}
                      </div>
                      <div style={rowRight}>
                        {renderToggle(on, busy, () => handleToggleSharing(!on), 'Public profile')}
                      </div>
                    </div>
                  )
                })()}

                {/* Considering opportunities toggle */}
                <div style={rowStyle}>
                  <div style={rowLeft}>
                    <div style={rowTitle}>Considering opportunities</div>
                    <div style={rowSub}>
                      Quiet signal that you&apos;re open to be considered. Visible only to JOBLUX matching, never to recruiters directly.
                    </div>
                    {matchingError && (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#ff6b6b' }}>{matchingError}</div>
                    )}
                  </div>
                  <div style={rowRight}>
                    {renderToggle(Boolean(e.matching_opt_in), matchingSaving, () => toggleMatching(!e.matching_opt_in), 'Considering opportunities')}
                  </div>
                </div>
              </div>

              {/* 2. SHARE & EXPORT */}
              <div id="m-share" style={block}>
                <div style={blockHead}>
                  <h2 style={blockTitle}>Share &amp; export</h2>
                  <p style={blockSub}>Generate a private link or download a PDF. Maskable fields are honoured in shared versions.</p>
                </div>

                {/* Private profile URL */}
                <div style={rowStyle}>
                  <div style={rowLeft}>
                    <div style={rowTitle}>Private profile URL</div>
                    <div style={rowSub}>
                      Anyone with the link can view your shared ProfiLux. Revoke anytime.
                    </div>
                    {reserveError && (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#ff6b6b' }}>{reserveError}</div>
                    )}
                  </div>
                  <div style={rowRight}>
                    {shareStatus?.public_url ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        border: '1px solid #2a2a2a',
                        borderRadius: 8,
                        padding: '6px 6px 6px 14px',
                        background: 'rgba(0,0,0,0.25)',
                        maxWidth: 360,
                      }}>
                        <code style={{
                          fontFamily: "'SF Mono', Menlo, monospace",
                          fontSize: 12,
                          color: '#a58e28',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {shareStatus.public_url.replace(/^https?:\/\//, '')}
                        </code>
                        <button
                          type="button"
                          onClick={copyShareUrl}
                          style={{
                            background: '#a58e28',
                            color: '#1a1a1a',
                            border: 'none',
                            borderRadius: 5,
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          {shareCopyStatus === 'copied' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={reserving || shareStatusLoading}
                        onClick={handleReserveLink}
                        style={(reserving || shareStatusLoading) ? manageBtnDisabled : manageBtn}
                      >
                        {reserving ? 'Reserving…' : 'Reserve link'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Private PDF */}
                <div style={rowStyle}>
                  <div style={rowLeft}>
                    <div style={rowTitle}>Download — Private PDF</div>
                    <div style={rowSub}>Full document, all fields, for your records.</div>
                  </div>
                  <div style={rowRight}>
                    <a
                      href="/api/profilux/export"
                      download
                      style={{ ...manageBtn, display: 'inline-block', textDecoration: 'none' }}
                    >
                      Download
                    </a>
                  </div>
                </div>

                {/* Share PDF */}
                <div style={rowStyle}>
                  <div style={rowLeft}>
                    <div style={rowTitle}>Download — Share PDF</div>
                    <div style={rowSub}>
                      Same document with maskable fields hidden, ready to send. <span style={{ color: '#777', fontStyle: 'italic' }}>Coming soon.</span>
                    </div>
                  </div>
                  <div style={rowRight}>
                    <button type="button" disabled style={manageBtnDisabled}>Download</button>
                  </div>
                </div>

                {/* Password */}
                <div style={rowStyle}>
                  <div style={rowLeft}>
                    <div style={rowTitle}>Password</div>
                    <div style={rowSub}>
                      {shareStatus?.password_set
                        ? 'Active'
                        : 'Optional. Restrict link access to people you give the password to.'}
                    </div>
                    {passwordError && (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#ff6b6b' }}>{passwordError}</div>
                    )}
                  </div>
                  <div style={rowRight}>
                    {shareStatus?.password_set ? (
                      <button
                        type="button"
                        onClick={handleClearPassword}
                        disabled={passwordSaving}
                        style={passwordSaving ? manageBtnDisabled : manageBtn}
                      >
                        {passwordSaving ? 'Clearing…' : 'Clear'}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="password"
                          value={passwordDraft}
                          onChange={(ev) => setPasswordDraft(ev.target.value)}
                          placeholder="Set password"
                          style={{
                            background: 'rgba(0,0,0,0.25)',
                            border: '1px solid #2a2a2a',
                            color: '#fff',
                            padding: '6px 10px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 13,
                            borderRadius: 6,
                            outline: 'none',
                            width: 180,
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleSetPassword}
                          disabled={passwordSaving || passwordDraft.length < 4}
                          style={(passwordSaving || passwordDraft.length < 4) ? manageBtnDisabled : manageBtn}
                        >
                          {passwordSaving ? 'Saving…' : 'Set'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expiry */}
                <div style={rowStyle}>
                  <div style={rowLeft}>
                    <div style={rowTitle}>Expiry</div>
                    <div style={rowSub}>
                      {shareStatus?.expires_at
                        ? `Expires on ${shareStatus.expires_at}`
                        : 'Optional. Auto-disable the link on a chosen date.'}
                    </div>
                    {expiryError && (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#ff6b6b' }}>{expiryError}</div>
                    )}
                  </div>
                  <div style={rowRight}>
                    {shareStatus?.expires_at ? (
                      <button
                        type="button"
                        onClick={handleClearExpiry}
                        disabled={expirySaving}
                        style={expirySaving ? manageBtnDisabled : manageBtn}
                      >
                        {expirySaving ? 'Clearing…' : 'Clear'}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="date"
                          value={expiryDraft}
                          onChange={(ev) => setExpiryDraft(ev.target.value)}
                          style={{
                            background: 'rgba(0,0,0,0.25)',
                            border: '1px solid #2a2a2a',
                            color: '#fff',
                            padding: '6px 10px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 13,
                            borderRadius: 6,
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleSetExpiry}
                          disabled={expirySaving || !expiryDraft}
                          style={(expirySaving || !expiryDraft) ? manageBtnDisabled : manageBtn}
                        >
                          {expirySaving ? 'Saving…' : 'Set'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Views */}
                <div style={rowStyle}>
                  <div style={rowLeft}>
                    <div style={rowTitle}>Views</div>
                    <div style={rowSub}>
                      {(shareStatus?.view_count ?? 0)} view{(shareStatus?.view_count ?? 0) === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div style={rowRight} />
                </div>
              </div>

              {/* 3. MASKABLE FIELDS */}
              <div id="m-mask" style={block}>
                <div style={blockHead}>
                  <h2 style={blockTitle}>Maskable fields</h2>
                  <p style={blockSub}>Hides sensitive data inside shared, exported, and public views — even when the section itself is visible. Section visibility is controlled separately in Edit mode.</p>
                </div>
                {([
                  { field: 'current_employer', title: 'Current employer',             sub: 'Currently shown as "Confidential Maison" in shared views.' },
                  { field: 'salary',           title: 'Salary & compensation',        sub: 'Never shown publicly.' },
                  { field: 'availability',     title: 'Availability & notice period', sub: 'Hidden in Share view by default.' },
                  { field: 'phone',            title: 'Phone',                        sub: 'Hidden by default.' },
                  { field: 'references',       title: 'References',                   sub: 'Always private. Released individually on your explicit consent.' },
                ] as const).map(({ field, title, sub }) => {
                  const masked = (editor?.masked_fields ?? {})[field] === true
                  const busy = maskToggling === field
                  return (
                    <div key={field} style={rowStyle}>
                      <div style={rowLeft}>
                        <div style={rowTitle}>{title}</div>
                        <div style={rowSub}>{sub}</div>
                      </div>
                      <div style={rowRight}>
                        {renderToggle(masked, busy, () => toggleMaskedField(field, !masked), `${title} mask`)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 4. OPPORTUNITY PREFERENCES */}
              <div id="m-pref" style={block}>
                <div style={blockHead}>
                  <h2 style={blockTitle}>Opportunity preferences</h2>
                  <p style={blockSub}>The kind of briefs we should match you against. Stays private.</p>
                </div>
                <div style={prefGrid}>
                  <div style={prefCell}>
                    <div style={prefLabel}>Seniority</div>
                    <div style={seniorityValue ? prefValue : prefValueEmpty}>{seniorityValue || 'Not set'}</div>
                  </div>
                  <div style={prefCell}>
                    <div style={prefLabel}>Departments</div>
                    <div style={departmentsValue ? prefValue : prefValueEmpty}>{departmentsValue || 'Not set'}</div>
                  </div>
                  <div style={prefCell}>
                    <div style={prefLabel}>Markets</div>
                    <div style={marketsValue ? prefValue : prefValueEmpty}>{marketsValue || 'Not set'}</div>
                  </div>
                  <div style={prefCell}>
                    <div style={prefLabel}>Salary expectation</div>
                    <div style={salaryValue ? prefValue : prefValueEmpty}>{salaryValue || 'Not set'}</div>
                  </div>
                </div>
              </div>

              {/* 5. CV & DOCUMENT */}
              <div id="m-cv" style={block}>
                <div style={blockHead}>
                  <h2 style={blockTitle}>CV &amp; document</h2>
                  <p style={blockSub}>Re-upload your CV anytime. Detected changes are presented field by field — you choose what to merge.</p>
                </div>
                <div style={rowStyle}>
                  <div style={rowLeft}>
                    <div style={rowTitle}>Last CV upload</div>
                    <div style={rowSub}>
                      {cvFilename ? `${cvFilename}${cvParsedAt ? ` · parsed ${cvDateLabel(cvParsedAt) || 'recently'}` : ''}` : 'No CV uploaded yet.'}
                    </div>
                  </div>
                  <div style={rowRight}>
                    <Link
                      href="/dashboard/candidate/profilux/cv-merge"
                      style={{ ...manageBtn, display: 'inline-block', textDecoration: 'none' }}
                    >
                      Re-upload CV
                    </Link>
                  </div>
                </div>
                <div style={rowStyle}>
                  <div style={rowLeft}>
                    <div style={rowTitle}>Edit ProfiLux content</div>
                    <div style={rowSub}>Open the edit view to update, hide, or enrich each section.</div>
                  </div>
                  <div style={rowRight}>
                    <button type="button" onClick={() => setTab('edit')} style={manageBtn}>Open editor</button>
                  </div>
                </div>
              </div>

              {/* 6. ACCOUNT — Email + Connected sign-in (R3 — no destructive rows) */}
              <div id="m-account" style={block}>
                <div style={blockHead}>
                  <h2 style={blockTitle}>Account</h2>
                  <p style={blockSub}>Credentials and core operational settings.</p>
                </div>
                <div style={rowStyle}>
                  <div style={rowLeft}>
                    <div style={rowTitle}>Email</div>
                    <div style={rowSub}>{accountEmail || <em style={{ color: '#777' }}>Not set</em>}</div>
                  </div>
                  <div style={rowRight}>
                    <button type="button" disabled style={manageBtnDisabled} title="Coming soon">Change</button>
                  </div>
                </div>
                <div style={rowStyle}>
                  <div style={rowLeft}>
                    <div style={rowTitle}>Connected sign-in</div>
                    <div style={rowSub}>Google</div>
                  </div>
                  <div style={rowRight}>
                    <button type="button" disabled style={manageBtnDisabled} title="Coming soon">Manage</button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )
      })()}
    </div>
  )
}
