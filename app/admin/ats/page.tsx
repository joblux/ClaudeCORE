'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRequireAdmin } from '@/lib/auth-hooks'
import {
  PIPELINE_STAGES,
  KANBAN_STAGES,
  TERMINAL_STAGES,
  APPLICATION_SOURCES,
  REJECTION_REASONS,
  SUBMISSION_METHODS,
  getStageLabel,
  getStageColor,
} from '@/types/application'
import type { Application, PipelineStage } from '@/types/application'

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */
const GOLD = '#444'
const BLACK = '#1a1a1a'
const CREAM = '#fafaf5'
const BORDER = '#e8e8e8'

/* ------------------------------------------------------------------ */
/*  Utility helpers                                                    */
/* ------------------------------------------------------------------ */
function daysAgo(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.max(0, Math.floor(diff / 86_400_000))
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name: string | undefined | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getSourceLabel(val: string): string {
  return APPLICATION_SOURCES.find((s) => s.value === val)?.label ?? val
}

/* ------------------------------------------------------------------ */
/*  Assignment type (light)                                            */
/* ------------------------------------------------------------------ */
interface BriefOption {
  id: string
  title: string
  maison: string | null
  status: string
}

/* ------------------------------------------------------------------ */
/*  Sort helpers for Table view                                        */
/* ------------------------------------------------------------------ */
type SortKey = 'name' | 'assignment' | 'maison' | 'stage' | 'rating' | 'applied' | 'days' | 'source' | 'recruiter' | 'city'
type SortDir = 'asc' | 'desc'

function sortApplications(apps: Application[], key: SortKey, dir: SortDir): Application[] {
  const mult = dir === 'asc' ? 1 : -1
  return [...apps].sort((a, b) => {
    let va: string | number = ''
    let vb: string | number = ''
    switch (key) {
      case 'name':
        va = a.member?.full_name ?? ''
        vb = b.member?.full_name ?? ''
        break
      case 'assignment':
        va = a.search_assignment?.title ?? ''
        vb = b.search_assignment?.title ?? ''
        break
      case 'maison':
        va = a.search_assignment?.maison ?? ''
        vb = b.search_assignment?.maison ?? ''
        break
      case 'stage':
        va = getStageLabel(a.current_stage)
        vb = getStageLabel(b.current_stage)
        break
      case 'rating':
        va = a.rating ?? 0
        vb = b.rating ?? 0
        break
      case 'applied':
        va = a.applied_at
        vb = b.applied_at
        break
      case 'days':
        va = daysAgo(a.applied_at)
        vb = daysAgo(b.applied_at)
        break
      case 'source':
        va = a.source
        vb = b.source
        break
      case 'recruiter':
        va = a.assigned_recruiter ?? ''
        vb = b.assigned_recruiter ?? ''
        break
      case 'city':
        va = a.member?.city ?? ''
        vb = b.member?.city ?? ''
        break
    }
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * mult
    return String(va).localeCompare(String(vb)) * mult
  })
}

/* ================================================================== */
/*  Page component                                                     */
/* ================================================================== */
export default function AdminATSPage() {
  const { isAdmin, isLoading: authLoading } = useRequireAdmin()
  const router = useRouter()

  /* ---- data state ---- */
  const [applications, setApplications] = useState<Application[]>([])
  const [briefs, setBriefs] = useState<BriefOption[]>([])
  const [loading, setLoading] = useState(true)

  /* ---- UI state ---- */
  const [view, setView] = useState<'board' | 'table'>('board')
  const searchParams = useSearchParams()
  const [briefFilter, setBriefFilter] = useState(() => searchParams?.get('search_assignment_id') ?? '')

  // Keep briefFilter in sync if the URL param changes after initial mount
  useEffect(() => {
    setBriefFilter(searchParams?.get('search_assignment_id') ?? '')
  }, [searchParams])
  const [terminalToggles, setTerminalToggles] = useState<Record<string, boolean>>({})

  /* ---- table-specific state ---- */
  const [sortKey, setSortKey] = useState<SortKey>('applied')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [tableSearch, setTableSearch] = useState('')
  const [tableStageFilter, setTableStageFilter] = useState<string[]>([])
  const [tableSourceFilter, setTableSourceFilter] = useState('')

  /* ---- kanban card action state ---- */
  const [moveDropdownId, setMoveDropdownId] = useState<string | null>(null)
  const [pendingMove, setPendingMove] = useState<{ appId: string; stage: PipelineStage } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submissionMethod, setSubmissionMethod] = useState('')
  const [movingId, setMovingId] = useState<string | null>(null)

  /* ---- add modal state ---- */
  const [showAddModal, setShowAddModal] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addBriefId, setAddBriefId] = useState('')
  const [addNote, setAddNote] = useState('')
  const [foundMember, setFoundMember] = useState<{ id: string; full_name: string; email: string } | null>(null)
  const [memberSearching, setMemberSearching] = useState(false)
  const [memberError, setMemberError] = useState('')
  const [addSubmitting, setAddSubmitting] = useState(false)

  /* ---------------------------------------------------------------- */
  /*  Fetch assignments                                                 */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/assignments')
      .then((r) => r.json())
      .then((d) => setBriefs(d.assignments ?? []))
      .catch(() => setBriefs([]))
  }, [isAdmin])

  /* ---------------------------------------------------------------- */
  /*  Fetch applications                                               */
  /* ---------------------------------------------------------------- */
  const fetchApplications = useCallback(() => {
    if (!isAdmin) return
    setLoading(true)
    const params = new URLSearchParams({ limit: '200' })
    if (briefFilter) params.set('search_assignment_id', briefFilter)
    fetch(`/api/applications?${params}`)
      .then((r) => r.json())
      .then((d) => setApplications(d.applications ?? d.data ?? []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false))
  }, [isAdmin, briefFilter])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  /* ---------------------------------------------------------------- */
  /*  Quick stats (computed)                                           */
  /* ---------------------------------------------------------------- */
  const stats = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of applications) {
      counts[a.current_stage] = (counts[a.current_stage] ?? 0) + 1
    }
    return {
      total: applications.length,
      applied: counts['applied'] ?? 0,
      screening: counts['screening'] ?? 0,
      shortlisted: counts['shortlisted'] ?? 0,
      submitted: counts['submitted_to_client'] ?? 0,
      interviewing:
        (counts['interview_1'] ?? 0) +
        (counts['interview_2'] ?? 0) +
        (counts['interview_final'] ?? 0) +
        (counts['client_reviewing'] ?? 0),
      offers: (counts['offer_made'] ?? 0) + (counts['offer_accepted'] ?? 0),
    }
  }, [applications])

  /* ---------------------------------------------------------------- */
  /*  Kanban columns                                                   */
  /* ---------------------------------------------------------------- */
  const activeTerminal = TERMINAL_STAGES.filter((s) => terminalToggles[s.key])
  const visibleStages = [...KANBAN_STAGES, ...activeTerminal]

  const columns = useMemo(() => {
    const map: Record<string, Application[]> = {}
    for (const s of visibleStages) map[s.key] = []
    for (const a of applications) {
      if (map[a.current_stage]) map[a.current_stage].push(a)
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications, terminalToggles])

  /* ---------------------------------------------------------------- */
  /*  Table filtered & sorted data                                     */
  /* ---------------------------------------------------------------- */
  const tableData = useMemo(() => {
    let filtered = [...applications]
    if (tableSearch) {
      const q = tableSearch.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          (a.member?.full_name ?? '').toLowerCase().includes(q) ||
          (a.search_assignment?.title ?? '').toLowerCase().includes(q)
      )
    }
    if (tableStageFilter.length > 0) {
      filtered = filtered.filter((a) => tableStageFilter.includes(a.current_stage))
    }
    if (tableSourceFilter) {
      filtered = filtered.filter((a) => a.source === tableSourceFilter)
    }
    return sortApplications(filtered, sortKey, sortDir)
  }, [applications, tableSearch, tableStageFilter, tableSourceFilter, sortKey, sortDir])

  /* ---------------------------------------------------------------- */
  /*  Stage move handler                                               */
  /* ---------------------------------------------------------------- */
  const executeMove = async (appId: string, stage: PipelineStage, extras?: Record<string, string>) => {
    setMovingId(appId)
    try {
      const res = await fetch(`/api/applications/${appId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, ...extras }),
      })
      if (!res.ok) throw new Error('Failed')
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, current_stage: stage } : a))
      )
    } catch {
      alert('Failed to move candidate. Please try again.')
    } finally {
      setMovingId(null)
      setMoveDropdownId(null)
      setPendingMove(null)
      setRejectionReason('')
      setSubmissionMethod('')
    }
  }

  const handleStageSelect = (appId: string, stage: PipelineStage) => {
    if (stage === 'rejected') {
      setPendingMove({ appId, stage })
      return
    }
    if (stage === 'submitted_to_client') {
      setPendingMove({ appId, stage })
      return
    }
    executeMove(appId, stage)
  }

  const confirmPendingMove = () => {
    if (!pendingMove) return
    const extras: Record<string, string> = {}
    if (pendingMove.stage === 'rejected' && rejectionReason) extras.rejection_reason = rejectionReason
    if (pendingMove.stage === 'submitted_to_client' && submissionMethod) extras.submission_method = submissionMethod
    executeMove(pendingMove.appId, pendingMove.stage, extras)
  }

  /* ---------------------------------------------------------------- */
  /*  Member search for add modal                                      */
  /* ---------------------------------------------------------------- */
  const searchMember = async () => {
    if (!addEmail.trim()) return
    setMemberSearching(true)
    setMemberError('')
    setFoundMember(null)
    try {
      const res = await fetch(`/api/admin/members?search=${encodeURIComponent(addEmail.trim())}&limit=1`)
      const data = await res.json()
      const members = data.members ?? []
      if (members.length === 0) {
        setMemberError('No member found with that email.')
      } else {
        setFoundMember({ id: members[0].id, full_name: members[0].full_name, email: members[0].email })
      }
    } catch {
      setMemberError('Search failed. Please try again.')
    } finally {
      setMemberSearching(false)
    }
  }

  const submitNewCandidate = async () => {
    if (!foundMember || !addBriefId) return
    setAddSubmitting(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: foundMember.id,
          search_assignment_id: addBriefId,
          source: 'sourced_by_recruiter',
          notes: addNote || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setShowAddModal(false)
      setAddEmail('')
      setAddBriefId('')
      setAddNote('')
      setFoundMember(null)
      fetchApplications()
    } catch {
      alert('Failed to add candidate. Please try again.')
    } finally {
      setAddSubmitting(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Table sort handler                                               */
  /* ---------------------------------------------------------------- */
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Stage multi-select toggle                                        */
  /* ---------------------------------------------------------------- */
  const toggleTableStage = (stage: string) => {
    setTableStageFilter((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Render: loading / auth guard                                     */
  /* ---------------------------------------------------------------- */
  if (authLoading || !isAdmin) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', color: '#999', fontSize: 14, background: CREAM, minHeight: '100vh' }}>
        Loading...
      </div>
    )
  }

  /* ================================================================ */
  /*  Render helpers                                                   */
  /* ================================================================ */

  /* ---- Stars ---- */
  const renderStars = (rating: number | null) => {
    const r = rating ?? 0
    return (
      <span style={{ display: 'inline-flex', gap: 1 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ color: i <= r ? GOLD : '#ddd', fontSize: 12 }}>&#9733;</span>
        ))}
      </span>
    )
  }

  /* ---- Stage badge ---- */
  const renderStageBadge = (stage: string) => {
    const color = getStageColor(stage)
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          background: `${color}18`,
          color,
          whiteSpace: 'nowrap',
        }}
      >
        {getStageLabel(stage)}
      </span>
    )
  }

  /* ---- Avatar ---- */
  const renderAvatar = (app: Application, size = 40) => {
    const initials = getInitials(app.member?.full_name)
    if (app.member?.avatar_url) {
      return (
        <img
          src={app.member.avatar_url}
          alt={app.member.full_name ?? ''}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      )
    }
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: BLACK,
          color: GOLD,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.36,
          fontWeight: 700,
          flexShrink: 0,
          letterSpacing: 0.5,
        }}
      >
        {initials}
      </div>
    )
  }

  /* ================================================================ */
  /*  MAIN RENDER                                                      */
  /* ================================================================ */
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: CREAM, minHeight: '100vh' }}>

      {/* ============================================================ */}
      {/*  HEADER                                                       */}
      {/* ============================================================ */}
      <header style={{ borderBottom: `1px solid ${BORDER}`, background: '#fff', padding: '24px 32px 20px' }}>
        {/* Gold overline */}
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: GOLD, margin: '0 0 4px' }}>
          Recruitment
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          {/* Title */}
          <h1 className="jl-serif" style={{ fontSize: 28, fontWeight: 700, color: BLACK, margin: 0 }}>
            Applicant Tracking
          </h1>

          {/* Controls row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Assignment selector */}
            <select
              value={briefFilter}
              onChange={(e) => setBriefFilter(e.target.value)}
              className="jl-input"
              style={{
                padding: '7px 12px',
                fontSize: 13,
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                background: '#fff',
                color: BLACK,
                minWidth: 200,
                cursor: 'pointer',
              }}
            >
              <option value="">All Assignments</option>
              {briefs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}{b.maison ? ` \u2014 ${b.maison}` : ''}
                </option>
              ))}
            </select>

            {/* View toggle */}
            <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
              {(['board', 'table'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="jl-btn"
                  style={{
                    padding: '7px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: view === v ? BLACK : '#fff',
                    color: view === v ? GOLD : '#666',
                    transition: 'all 0.15s',
                  }}
                >
                  {v === 'board' ? 'Board' : 'Table'}
                </button>
              ))}
            </div>

            {/* Add candidate */}
            <button
              onClick={() => setShowAddModal(true)}
              className="jl-btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: 600,
                background: GOLD,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              + Add Candidate
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/*  QUICK STATS BAR                                              */}
      {/* ============================================================ */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 32px', borderBottom: `1px solid ${BORDER}`, background: '#fff', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: stats.total, color: BLACK },
          { label: 'Applied', value: stats.applied, color: '#6B7280' },
          { label: 'Screening', value: stats.screening, color: '#3B82F6' },
          { label: 'Shortlisted', value: stats.shortlisted, color: '#8B5CF6' },
          { label: 'Submitted', value: stats.submitted, color: '#F59E0B' },
          { label: 'Interviewing', value: stats.interviewing, color: '#EC4899' },
          { label: 'Offers', value: stats.offers, color: '#10B981' },
        ].map((s) => (
          <span
            key={s.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: `${s.color}10`,
              color: s.color,
              border: `1px solid ${s.color}25`,
            }}
          >
            {s.label}
            <span style={{ background: s.color, color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
              {s.value}
            </span>
          </span>
        ))}
      </div>

      {/* ============================================================ */}
      {/*  CONTENT AREA                                                 */}
      {/* ============================================================ */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#999', fontSize: 14 }}>
          Loading applications...
        </div>
      ) : view === 'board' ? (
        /* ========================================================== */
        /*  KANBAN BOARD VIEW                                          */
        /* ========================================================== */
        <div style={{ padding: '16px 32px 32px' }}>
          {/* Terminal stage toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, fontSize: 12 }}>
            <span style={{ color: '#888', fontWeight: 600 }}>Show:</span>
            {TERMINAL_STAGES.map((s) => (
              <label
                key={s.key}
                style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#666' }}
              >
                <input
                  type="checkbox"
                  checked={!!terminalToggles[s.key]}
                  onChange={() =>
                    setTerminalToggles((prev) => ({ ...prev, [s.key]: !prev[s.key] }))
                  }
                  style={{ accentColor: GOLD }}
                />
                {s.label}
              </label>
            ))}
          </div>

          {/* Columns container */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              paddingBottom: 16,
            }}
          >
            {visibleStages.map((stage) => {
              const cards = columns[stage.key] ?? []
              return (
                <div
                  key={stage.key}
                  style={{
                    minWidth: 264,
                    maxWidth: 300,
                    flex: '0 0 264px',
                    background: '#fff',
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100vh - 260px)',
                  }}
                >
                  {/* Column header */}
                  <div
                    style={{
                      borderTop: `3px solid ${stage.color}`,
                      borderRadius: '8px 8px 0 0',
                      padding: '12px 14px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: BLACK }}>{stage.label}</span>
                    <span
                      style={{
                        background: `${stage.color}18`,
                        color: stage.color,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 10,
                      }}
                    >
                      {cards.length}
                    </span>
                  </div>

                  {/* Cards list */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cards.length === 0 && (
                      <p style={{ fontSize: 12, color: '#bbb', textAlign: 'center', padding: '20px 0' }}>
                        No candidates
                      </p>
                    )}
                    {cards.map((app) => (
                      <div
                        key={app.id}
                        style={{
                          background: CREAM,
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          padding: 12,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          opacity: movingId === app.id ? 0.4 : 1,
                          transform: movingId === app.id ? 'scale(0.96)' : 'none',
                        }}
                        onClick={() => router.push(`/admin/ats/${app.id}`)}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
                      >
                        {/* Top row: avatar + name */}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                          {renderAvatar(app, 40)}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: BLACK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {app.member?.full_name ?? 'Unknown'}
                            </div>
                            {app.member?.job_title && (
                              <div style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {app.member.job_title}
                                {app.member.maison ? ` at ${app.member.maison}` : ''}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Assignment title (when viewing all assignments) */}
                        {!briefFilter && app.search_assignment?.title && (
                          <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {app.search_assignment.title}
                          </div>
                        )}

                        {/* Location */}
                        {(app.member?.city || app.member?.country) && (
                          <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                            {[app.member.city, app.member.country].filter(Boolean).join(', ')}
                          </div>
                        )}

                        {/* Bottom row: stars, source, days */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap' }}>
                          {renderStars(app.rating)}
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span
                              style={{
                                fontSize: 10,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: `${GOLD}15`,
                                color: GOLD,
                                fontWeight: 600,
                              }}
                            >
                              {getSourceLabel(app.source)}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: '#f0f0f0',
                                color: '#888',
                                fontWeight: 600,
                              }}
                            >
                              {daysAgo(app.applied_at)}d
                            </span>
                          </div>
                        </div>

                        {/* Move action */}
                        <div
                          style={{ marginTop: 8, borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {moveDropdownId === app.id ? (
                            <div>
                              {/* Pending confirmation for rejection */}
                              {pendingMove?.appId === app.id && pendingMove.stage === 'rejected' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <select
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    style={{ fontSize: 11, padding: '4px 6px', borderRadius: 4, border: `1px solid ${BORDER}` }}
                                  >
                                    <option value="">Select reason...</option>
                                    {REJECTION_REASONS.map((r) => (
                                      <option key={r} value={r}>{r}</option>
                                    ))}
                                  </select>
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    <button
                                      onClick={confirmPendingMove}
                                      disabled={!rejectionReason}
                                      style={{
                                        flex: 1, fontSize: 11, padding: '4px 8px', borderRadius: 4,
                                        background: rejectionReason ? '#EF4444' : '#ccc', color: '#fff',
                                        border: 'none', cursor: rejectionReason ? 'pointer' : 'not-allowed',
                                      }}
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => { setPendingMove(null); setMoveDropdownId(null) }}
                                      style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, background: '#f0f0f0', border: 'none', cursor: 'pointer' }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : pendingMove?.appId === app.id && pendingMove.stage === 'submitted_to_client' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <select
                                    value={submissionMethod}
                                    onChange={(e) => setSubmissionMethod(e.target.value)}
                                    style={{ fontSize: 11, padding: '4px 6px', borderRadius: 4, border: `1px solid ${BORDER}` }}
                                  >
                                    <option value="">Submission method...</option>
                                    {SUBMISSION_METHODS.map((m) => (
                                      <option key={m} value={m}>{m}</option>
                                    ))}
                                  </select>
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    <button
                                      onClick={confirmPendingMove}
                                      disabled={!submissionMethod}
                                      style={{
                                        flex: 1, fontSize: 11, padding: '4px 8px', borderRadius: 4,
                                        background: submissionMethod ? '#F59E0B' : '#ccc', color: '#fff',
                                        border: 'none', cursor: submissionMethod ? 'pointer' : 'not-allowed',
                                      }}
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => { setPendingMove(null); setMoveDropdownId(null) }}
                                      style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, background: '#f0f0f0', border: 'none', cursor: 'pointer' }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* Stage selection list */
                                <div>
                                  <div style={{ fontSize: 10, fontWeight: 600, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Move to...
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 180, overflowY: 'auto' }}>
                                    {PIPELINE_STAGES.filter((s) => s.key !== app.current_stage).map((s) => (
                                      <button
                                        key={s.key}
                                        onClick={() => handleStageSelect(app.id, s.key)}
                                        style={{
                                          textAlign: 'left',
                                          fontSize: 11,
                                          padding: '4px 8px',
                                          borderRadius: 4,
                                          border: 'none',
                                          background: 'transparent',
                                          cursor: 'pointer',
                                          color: '#444',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 6,
                                        }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f4f0' }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                                      >
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                        {s.label}
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    onClick={() => setMoveDropdownId(null)}
                                    style={{ marginTop: 4, fontSize: 10, color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setMoveDropdownId(app.id)
                                setPendingMove(null)
                                setRejectionReason('')
                                setSubmissionMethod('')
                              }}
                              style={{
                                fontSize: 11,
                                color: '#888',
                                background: 'none',
                                border: `1px solid ${BORDER}`,
                                borderRadius: 4,
                                padding: '3px 10px',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = GOLD; (e.currentTarget as HTMLButtonElement).style.color = GOLD }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.color = '#888' }}
                            >
                              Move to...
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ========================================================== */
        /*  TABLE VIEW                                                  */
        /* ========================================================== */
        <div style={{ padding: '16px 32px 32px' }}>
          {/* Filter bar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or assignment..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="jl-input"
              style={{
                padding: '7px 12px',
                fontSize: 13,
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                background: '#fff',
                color: BLACK,
                minWidth: 220,
              }}
            />

            {/* Stage multi-select */}
            <div style={{ position: 'relative' }}>
              <StageMultiSelect
                selected={tableStageFilter}
                onToggle={toggleTableStage}
                onClear={() => setTableStageFilter([])}
              />
            </div>

            {/* Source dropdown */}
            <select
              value={tableSourceFilter}
              onChange={(e) => setTableSourceFilter(e.target.value)}
              className="jl-input"
              style={{
                padding: '7px 12px',
                fontSize: 13,
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                background: '#fff',
                color: BLACK,
                cursor: 'pointer',
              }}
            >
              <option value="">All Sources</option>
              {APPLICATION_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <span style={{ fontSize: 12, color: '#999' }}>{tableData.length} results</span>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, border: `1px solid ${BORDER}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                  {([
                    { key: 'name' as SortKey, label: 'Candidate' },
                    { key: 'assignment' as SortKey, label: 'Assignment' },
                    { key: 'maison' as SortKey, label: 'Maison' },
                    { key: 'stage' as SortKey, label: 'Stage' },
                    { key: 'rating' as SortKey, label: 'Rating' },
                    { key: 'applied' as SortKey, label: 'Applied' },
                    { key: 'days' as SortKey, label: 'Days' },
                    { key: 'source' as SortKey, label: 'Source' },
                    { key: 'recruiter' as SortKey, label: 'Recruiter' },
                    { key: 'city' as SortKey, label: 'City' },
                  ]).map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        fontWeight: 700,
                        color: '#666',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                      }}
                    >
                      {col.label}
                      {sortKey === col.key && (
                        <span style={{ marginLeft: 4, fontSize: 10 }}>
                          {sortDir === 'asc' ? '\u25B2' : '\u25BC'}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#999', fontSize: 14 }}>
                      No applications found.
                    </td>
                  </tr>
                )}
                {tableData.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => router.push(`/admin/ats/${app.id}`)}
                    style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#fafaf5' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#fff' }}
                  >
                    {/* Candidate */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {renderAvatar(app, 30)}
                        <div>
                          <div style={{ fontWeight: 600, color: BLACK }}>{app.member?.full_name ?? 'Unknown'}</div>
                          {app.member?.email && (
                            <div style={{ fontSize: 11, color: '#999' }}>{app.member.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Assignment */}
                    <td style={{ padding: '10px 12px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.search_assignment?.title ?? '\u2014'}
                    </td>
                    {/* Maison */}
                    <td style={{ padding: '10px 12px', color: '#666' }}>
                      {app.search_assignment?.maison ?? '\u2014'}
                    </td>
                    {/* Stage */}
                    <td style={{ padding: '10px 12px' }}>
                      {renderStageBadge(app.current_stage)}
                    </td>
                    {/* Rating */}
                    <td style={{ padding: '10px 12px' }}>
                      {renderStars(app.rating)}
                    </td>
                    {/* Applied */}
                    <td style={{ padding: '10px 12px', color: '#666', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {formatDate(app.applied_at)}
                    </td>
                    {/* Days */}
                    <td style={{ padding: '10px 12px', color: '#888', fontSize: 12 }}>
                      {daysAgo(app.applied_at)}
                    </td>
                    {/* Source */}
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: `${GOLD}12`, color: GOLD, fontWeight: 600 }}>
                        {getSourceLabel(app.source)}
                      </span>
                    </td>
                    {/* Recruiter */}
                    <td style={{ padding: '10px 12px', color: '#666', fontSize: 12 }}>
                      {app.assigned_recruiter ?? '\u2014'}
                    </td>
                    {/* City */}
                    <td style={{ padding: '10px 12px', color: '#666', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {[app.member?.city, app.member?.country].filter(Boolean).join(', ') || '\u2014'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  ADD CANDIDATE MODAL                                          */}
      {/* ============================================================ */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 12,
              width: '100%',
              maxWidth: 480,
              padding: 32,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <h2 className="jl-serif" style={{ fontSize: 22, fontWeight: 700, color: BLACK, margin: '0 0 4px' }}>
              Add Candidate
            </h2>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px' }}>
              Add an existing member to an assignment pipeline.
            </p>

            {/* Member email search */}
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Member Email
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <input
                type="email"
                placeholder="member@example.com"
                value={addEmail}
                onChange={(e) => { setAddEmail(e.target.value); setFoundMember(null); setMemberError('') }}
                onKeyDown={(e) => e.key === 'Enter' && searchMember()}
                className="jl-input"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: 13,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  background: '#fff',
                  color: BLACK,
                }}
              />
              <button
                onClick={searchMember}
                disabled={memberSearching || !addEmail.trim()}
                className="jl-btn"
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  background: '#fff',
                  color: BLACK,
                  cursor: addEmail.trim() ? 'pointer' : 'not-allowed',
                  opacity: addEmail.trim() ? 1 : 0.5,
                }}
              >
                {memberSearching ? '...' : 'Find'}
              </button>
            </div>
            {foundMember && (
              <div style={{ fontSize: 13, color: '#059669', marginBottom: 12, padding: '6px 10px', background: '#e8f5e9', borderRadius: 6 }}>
                Found: <strong>{foundMember.full_name}</strong> ({foundMember.email})
              </div>
            )}
            {memberError && (
              <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 12 }}>{memberError}</div>
            )}
            {!foundMember && !memberError && <div style={{ height: 12 }} />}

            {/* Brief */}
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Search Assignment
            </label>
            <select
              value={addBriefId}
              onChange={(e) => setAddBriefId(e.target.value)}
              className="jl-input"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 13,
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                background: '#fff',
                color: BLACK,
                marginBottom: 16,
                cursor: 'pointer',
              }}
            >
              <option value="">Select an assignment...</option>
              {briefs
                .filter((b) => b.status === 'published')
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}{b.maison ? ` \u2014 ${b.maison}` : ''}
                  </option>
                ))}
            </select>

            {/* Source (fixed) */}
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Source
            </label>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 16, padding: '8px 12px', background: '#f5f4f0', borderRadius: 6 }}>
              Sourced by Recruiter
            </div>

            {/* Note */}
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Note (optional)
            </label>
            <textarea
              value={addNote}
              onChange={(e) => setAddNote(e.target.value)}
              placeholder="Initial notes about this candidate..."
              className="jl-input"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 13,
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                background: '#fff',
                color: BLACK,
                minHeight: 80,
                resize: 'vertical',
                marginBottom: 24,
              }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setAddEmail('')
                  setAddBriefId('')
                  setAddNote('')
                  setFoundMember(null)
                  setMemberError('')
                }}
                className="jl-btn"
                style={{
                  padding: '9px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  background: '#fff',
                  color: '#666',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitNewCandidate}
                disabled={!foundMember || !addBriefId || addSubmitting}
                className="jl-btn-primary"
                style={{
                  padding: '9px 24px',
                  fontSize: 13,
                  fontWeight: 600,
                  background: foundMember && addBriefId ? GOLD : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: foundMember && addBriefId ? 'pointer' : 'not-allowed',
                }}
              >
                {addSubmitting ? 'Adding...' : 'Add to Pipeline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ==================================================================== */
/*  Stage Multi-Select Component                                         */
/* ==================================================================== */
function StageMultiSelect({
  selected,
  onToggle,
  onClear,
}: {
  selected: string[]
  onToggle: (stage: string) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="jl-btn"
        style={{
          padding: '7px 12px',
          fontSize: 13,
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          background: '#fff',
          color: selected.length > 0 ? BLACK : '#888',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        Stage{selected.length > 0 ? ` (${selected.length})` : ''}
        <span style={{ fontSize: 10 }}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            background: '#fff',
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            padding: 8,
            zIndex: 50,
            minWidth: 200,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {selected.length > 0 && (
            <button
              onClick={onClear}
              style={{
                fontSize: 11,
                color: '#999',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                marginBottom: 4,
              }}
            >
              Clear all
            </button>
          )}
          {PIPELINE_STAGES.map((s) => (
            <label
              key={s.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                color: '#444',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLLabelElement).style.background = '#f5f4f0' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLLabelElement).style.background = 'transparent' }}
            >
              <input
                type="checkbox"
                checked={selected.includes(s.key)}
                onChange={() => onToggle(s.key)}
                style={{ accentColor: GOLD }}
              />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              {s.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
