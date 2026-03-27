'use client'

import { useState, useRef, useCallback, Fragment } from 'react'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'
import type { SearchAssignment } from '@/types/search-assignment'
import {
  DEPARTMENTS,
  SENIORITY_LEVELS,
  CONTRACT_TYPES,
  REMOTE_POLICIES,
  SALARY_CURRENCIES,
  SALARY_PERIODS,
} from '@/lib/assignment-options'

// ── Design tokens ────────────────────────────────────────────────────
const GOLD = '#a58e28'
const BLACK = '#1a1a1a'
const CREAM = '#fafaf5'
const BORDER = '#e8e2d8'

// ── Mappable fields for column mapping dropdowns ─────────────────────
const MAPPABLE_FIELDS = [
  { value: '__skip__', label: '-- Skip --' },
  { value: 'title', label: 'Title' },
  { value: 'maison', label: 'Maison' },
  { value: 'city', label: 'City' },
  { value: 'country', label: 'Country' },
  { value: 'department', label: 'Department' },
  { value: 'seniority', label: 'Seniority' },
  { value: 'contract_type', label: 'Contract Type' },
  { value: 'remote_policy', label: 'Remote Policy' },
  { value: 'description', label: 'Description' },
  { value: 'responsibilities', label: 'Responsibilities' },
  { value: 'requirements', label: 'Requirements' },
  { value: 'nice_to_haves', label: 'Nice-to-Haves' },
  { value: 'salary_min', label: 'Salary Min' },
  { value: 'salary_max', label: 'Salary Max' },
  { value: 'salary_currency', label: 'Salary Currency' },
  { value: 'salary_period', label: 'Salary Period' },
  { value: 'benefits', label: 'Benefits' },
  { value: 'languages_required', label: 'Languages Required' },
  { value: 'product_category', label: 'Product Category' },
  { value: 'start_date', label: 'Start Date' },
  { value: 'reports_to', label: 'Reports To' },
  { value: 'team_size', label: 'Team Size' },
  { value: 'relocation_offered', label: 'Relocation Offered' },
  { value: 'visa_sponsorship', label: 'Visa Sponsorship' },
] as const

// ── Step labels ──────────────────────────────────────────────────────
const STEP_LABELS = ['Choose Source', 'Preview & Map', 'Review', 'Import']

// ── Types for internal state ─────────────────────────────────────────
interface ParsedPreview {
  headers: string[]
  rows: Record<string, string>[]
  autoMappings: Record<string, string>
  isSingle: boolean
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

// ══════════════════════════════════════════════════════════════════════
// Step Indicator
// ══════════════════════════════════════════════════════════════════════
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 py-8">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < current
        const isCurrent = stepNum === current

        return (
          <div key={label} className="flex items-center">
            {/* Connector line (before each dot except the first) */}
            {i > 0 && (
              <div
                className="h-[2px] w-10 sm:w-16 transition-colors duration-300"
                style={{ background: isCompleted ? GOLD : BORDER }}
              />
            )}

            {/* Dot + label */}
            <div className="flex flex-col items-center">
              <div
                className="w-3.5 h-3.5 rounded-full border-2 transition-all duration-300"
                style={{
                  borderColor: isCompleted || isCurrent ? GOLD : BORDER,
                  background: isCompleted ? GOLD : isCurrent ? GOLD : 'white',
                }}
              />
              <span
                className="text-[10px] mt-2 font-medium tracking-wide uppercase whitespace-nowrap"
                style={{ color: isCurrent ? GOLD : isCompleted ? BLACK : '#999' }}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// Import method card
// ══════════════════════════════════════════════════════════════════════
function MethodCard({
  icon,
  title,
  description,
  onClick,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
  children?: React.ReactNode
}) {
  return (
    <div
      onClick={onClick}
      className="group border rounded-sm p-6 cursor-pointer transition-all duration-200 hover:shadow-md bg-[#161b22]"
      style={{ borderColor: BORDER }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 text-[#999] group-hover:text-[#a58e28] transition-colors">
          {icon}
        </div>
        <h3 className="text-sm font-semibold mb-1" style={{ color: BLACK }}>
          {title}
        </h3>
        <p className="text-xs text-[#888] leading-relaxed">{description}</p>
        {children}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// SVG icons for each import method
// ══════════════════════════════════════════════════════════════════════
const IconTable = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
)

const IconXml = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
    <line x1="14" y1="4" x2="10" y2="20" />
  </svg>
)

const IconJson = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 3H6a2 2 0 00-2 2v2m0 6v2a2 2 0 002 2h2m8-14h2a2 2 0 012 2v2m0 6v2a2 2 0 01-2 2h-2" />
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1" fill="currentColor" />
  </svg>
)

const IconUrl = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
)

const IconPaste = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="14" y2="16" />
  </svg>
)

const IconBulkUrl = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

// ══════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function ImportAssignmentsPage() {
  const { isAdmin, isLoading: authLoading } = useRequireAdmin()

  // ── Wizard state ─────────────────────────────────────────────────
  const [step, setStep] = useState(1)
  const [importMethod, setImportMethod] = useState('')
  const [rawData, setRawData] = useState<ParsedPreview | null>(null)
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [assignments, setAssignments] = useState<Partial<SearchAssignment>[]>([])
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<ImportResult | null>(null)

  // ── UI sub-states ────────────────────────────────────────────────
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [showPasteInput, setShowPasteInput] = useState(false)
  const [showBulkUrlInput, setShowBulkUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [pasteValue, setPasteValue] = useState('')
  const [bulkUrlValue, setBulkUrlValue] = useState('')
  const [enriching, setEnriching] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [importProgress, setImportProgress] = useState(0)

  // File input refs
  const csvInputRef = useRef<HTMLInputElement>(null)
  const xmlInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)

  // ── Auth guard ───────────────────────────────────────────────────
  if (authLoading || !isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <p className="text-sm text-[#999]">Loading...</p>
      </main>
    )
  }

  // ── Helper: upload a file to an API endpoint ─────────────────────
  const uploadFile = async (file: File, endpoint: string, method: string) => {
    setParsing(true)
    setParseError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(endpoint, { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to parse file')
      }
      const data = await res.json()
      setImportMethod(method)
      setRawData(data)
      // Initialize mappings from auto-mappings
      setMappings(data.autoMappings || {})
      // If single record, build the assignment directly
      if (data.isSingle && data.rows?.length === 1) {
        setAssignments([data.rows[0]])
      }
      setStep(2)
    } catch (err: any) {
      setParseError(err.message || 'An error occurred while parsing')
    } finally {
      setParsing(false)
    }
  }

  // ── Helper: submit URL(s) to the API ─────────────────────────────
  const fetchFromUrl = async (url: string) => {
    setParsing(true)
    setParseError('')
    try {
      const res = await fetch('/api/assignments/import/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to fetch URL')
      }
      const data = await res.json()
      setImportMethod('import_url')
      setRawData(data)
      setMappings(data.autoMappings || {})
      if (data.isSingle && data.rows?.length === 1) {
        setAssignments([data.rows[0]])
      }
      setStep(2)
    } catch (err: any) {
      setParseError(err.message || 'Failed to fetch from URL')
    } finally {
      setParsing(false)
    }
  }

  const fetchBulkUrls = async (text: string) => {
    const urls = text.split('\n').map((u) => u.trim()).filter(Boolean)
    if (urls.length === 0) return
    setParsing(true)
    setParseError('')
    try {
      const res = await fetch('/api/assignments/import/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to fetch URLs')
      }
      const data = await res.json()
      setImportMethod('import_url')
      setRawData(data)
      setMappings(data.autoMappings || {})
      setStep(2)
    } catch (err: any) {
      setParseError(err.message || 'Failed to fetch URLs')
    } finally {
      setParsing(false)
    }
  }

  const parseFromPaste = async (text: string) => {
    if (!text.trim()) return
    setParsing(true)
    setParseError('')
    try {
      const res = await fetch('/api/assignments/import/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to parse text')
      }
      const data = await res.json()
      setImportMethod('import_paste')
      setRawData(data)
      setMappings(data.autoMappings || {})
      if (data.isSingle && data.rows?.length === 1) {
        setAssignments([data.rows[0]])
      }
      setStep(2)
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse text')
    } finally {
      setParsing(false)
    }
  }

  // ── Build final assignments from raw data + mappings ─────────────
  const buildAssignments = () => {
    if (!rawData) return
    if (rawData.isSingle) {
      // Single-record: data is already in row[0]
      setAssignments(rawData.rows)
      setSelectedRows(new Set([0]))
    } else {
      // Multi-record: apply column mappings to each row
      const built = rawData.rows.map((row) => {
        const assignment: Record<string, any> = {}
        for (const [header, fieldKey] of Object.entries(mappings)) {
          if (fieldKey === '__skip__') continue
          assignment[fieldKey] = row[header] || ''
        }
        return assignment as Partial<SearchAssignment>
      })
      setAssignments(built)
      setSelectedRows(new Set(built.map((_, i) => i)))
    }
    setStep(3)
  }

  // ── AI Enrich ────────────────────────────────────────────────────
  const handleEnrich = async () => {
    setEnriching(true)
    try {
      const res = await fetch('/api/assignments/import/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: rawData?.rows || [], mappings }),
      })
      if (!res.ok) throw new Error('Enrichment failed')
      const data = await res.json()
      if (data.rows) {
        setRawData((prev) => prev ? { ...prev, rows: data.rows } : prev)
      }
      if (data.autoMappings) {
        setMappings((prev) => ({ ...prev, ...data.autoMappings }))
      }
    } catch {
      // Silently fail; user can proceed without enrichment
    } finally {
      setEnriching(false)
    }
  }

  // ── Save/Import assignments ──────────────────────────────────────
  const handleImport = async (activate: boolean) => {
    const selectedAssignments = assignments
      .filter((_, i) => selectedRows.has(i))
      .map((a) => ({
        ...a,
        status: activate ? 'active' : 'draft',
      }))

    if (selectedAssignments.length === 0) return

    setImporting(true)
    setResults(null)
    setImportProgress(0)
    setStep(4)

    let success = 0
    let failed = 0
    const errors: string[] = []

    // Import one at a time for progress tracking
    for (let i = 0; i < selectedAssignments.length; i++) {
      setImportProgress(i + 1)
      try {
        const res = await fetch('/api/assignments/import/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignments: [selectedAssignments[i]],
            source: importMethod || 'import_csv',
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Save failed')
        }
        success++
      } catch (err: any) {
        failed++
        errors.push(`#${i + 1} ${selectedAssignments[i].title || 'Untitled'}: ${err.message}`)
      }
    }

    setResults({ success, failed, errors })
    setImporting(false)
  }

  // ── Update a single assignment field in step 3 ───────────────────
  const updateAssignment = useCallback((index: number, field: string, value: string) => {
    setAssignments((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }, [])

  // ── Toggle row selection ─────────────────────────────────────────
  const toggleRow = (index: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const selectAll = () => setSelectedRows(new Set(assignments.map((_, i) => i)))
  const deselectAll = () => setSelectedRows(new Set())

  // ── Reset wizard ─────────────────────────────────────────────────
  const resetWizard = () => {
    setStep(1)
    setImportMethod('')
    setRawData(null)
    setMappings({})
    setAssignments([])
    setResults(null)
    setImporting(false)
    setParseError('')
    setShowUrlInput(false)
    setShowPasteInput(false)
    setShowBulkUrlInput(false)
    setUrlValue('')
    setPasteValue('')
    setBulkUrlValue('')
    setExpandedRow(null)
    setImportProgress(0)
  }

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <main className="min-h-screen" style={{ background: CREAM, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <section className="bg-[#161b22]" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            href="/admin/assignments"
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ color: GOLD, textDecoration: 'none' }}
          >
            &larr; Back to Assignments
          </Link>
          <p
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mt-4"
            style={{ color: GOLD }}
          >
            SEARCH ASSIGNMENTS
          </p>
          <h1
            className="jl-serif text-2xl md:text-3xl mt-1"
            style={{ color: BLACK }}
          >
            Import Assignments
          </h1>
        </div>
      </section>

      {/* ── Step indicator ──────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6">
        <StepIndicator current={step} />
      </div>

      {/* ── Content area ────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pb-16">

        {/* Global error banner */}
        {parseError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
            {parseError}
            <button
              onClick={() => setParseError('')}
              className="ml-3 underline text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading overlay for parsing */}
        {parsing && (
          <div className="mb-6 p-6 border rounded-sm bg-[#161b22] text-center" style={{ borderColor: BORDER }}>
            <div
              className="inline-block w-5 h-5 border-2 rounded-full animate-spin mb-3"
              style={{ borderColor: BORDER, borderTopColor: GOLD }}
            />
            <p className="text-sm text-[#888]">Parsing file...</p>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadFile(file, '/api/assignments/import/csv', 'import_csv')
            e.target.value = ''
          }}
        />
        <input
          ref={xmlInputRef}
          type="file"
          accept=".xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadFile(file, '/api/assignments/import/xml', 'import_xml')
            e.target.value = ''
          }}
        />
        <input
          ref={jsonInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadFile(file, '/api/assignments/import/json', 'import_json')
            e.target.value = ''
          }}
        />

        {/* ════════════════════════════════════════════════════════
            STEP 1 — Choose Import Method
        ════════════════════════════════════════════════════════ */}
        {step === 1 && !parsing && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* CSV / Excel */}
            <MethodCard
              icon={<IconTable />}
              title="CSV / Excel Upload"
              description="Upload a .csv or .xlsx file"
              onClick={() => csvInputRef.current?.click()}
            >
              <div className="mt-3 flex gap-3 text-[11px]">
                <a
                  href="/templates/joblux-assignment-template.csv"
                  onClick={(e) => e.stopPropagation()}
                  className="underline hover:opacity-70"
                  style={{ color: GOLD }}
                >
                  Download CSV Template
                </a>
                <a
                  href="/templates/joblux-assignment-template.xlsx"
                  onClick={(e) => e.stopPropagation()}
                  className="underline hover:opacity-70"
                  style={{ color: GOLD }}
                >
                  Download Excel Template
                </a>
              </div>
            </MethodCard>

            {/* XML */}
            <MethodCard
              icon={<IconXml />}
              title="XML Upload"
              description="HR-XML, LinkedIn feed, or any XML"
              onClick={() => xmlInputRef.current?.click()}
            />

            {/* JSON */}
            <MethodCard
              icon={<IconJson />}
              title="JSON Upload"
              description="Schema.org, HR-JSON, or any format"
              onClick={() => jsonInputRef.current?.click()}
            />

            {/* Import from URL */}
            <MethodCard
              icon={<IconUrl />}
              title="Import from URL"
              description="Paste a job posting URL to extract data"
              onClick={() => {
                setShowUrlInput(true)
                setShowPasteInput(false)
                setShowBulkUrlInput(false)
              }}
            />

            {/* Paste Text */}
            <MethodCard
              icon={<IconPaste />}
              title="Paste Text"
              description="Paste job description text for AI parsing"
              onClick={() => {
                setShowPasteInput(true)
                setShowUrlInput(false)
                setShowBulkUrlInput(false)
              }}
            />

            {/* Bulk URL Import */}
            <MethodCard
              icon={<IconBulkUrl />}
              title="Bulk URL Import"
              description="Import from multiple URLs at once"
              onClick={() => {
                setShowBulkUrlInput(true)
                setShowUrlInput(false)
                setShowPasteInput(false)
              }}
            />
          </div>
        )}

        {/* URL input panel */}
        {step === 1 && showUrlInput && !parsing && (
          <div className="mt-6 p-6 border rounded-sm bg-[#161b22]" style={{ borderColor: BORDER }}>
            <label className="jl-label">Job Posting URL</label>
            <div className="flex gap-3 mt-1">
              <input
                type="url"
                className="jl-input flex-1"
                placeholder="https://careers.chanel.com/en/job/..."
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchFromUrl(urlValue)}
              />
              <button
                onClick={() => fetchFromUrl(urlValue)}
                disabled={!urlValue.trim()}
                className="jl-btn jl-btn-primary whitespace-nowrap disabled:opacity-40"
              >
                Fetch
              </button>
            </div>
          </div>
        )}

        {/* Paste input panel */}
        {step === 1 && showPasteInput && !parsing && (
          <div className="mt-6 p-6 border rounded-sm bg-[#161b22]" style={{ borderColor: BORDER }}>
            <label className="jl-label">Paste Job Description</label>
            <textarea
              className="jl-input w-full min-h-[200px] mt-1"
              placeholder="Paste the full job description text here. Our AI will extract structured fields..."
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => parseFromPaste(pasteValue)}
                disabled={!pasteValue.trim()}
                className="jl-btn jl-btn-primary disabled:opacity-40"
              >
                Parse with AI
              </button>
            </div>
          </div>
        )}

        {/* Bulk URL input panel */}
        {step === 1 && showBulkUrlInput && !parsing && (
          <div className="mt-6 p-6 border rounded-sm bg-[#161b22]" style={{ borderColor: BORDER }}>
            <label className="jl-label">URLs (one per line)</label>
            <textarea
              className="jl-input w-full min-h-[160px] mt-1"
              placeholder={"https://careers.chanel.com/en/job/...\nhttps://careers.hermes.com/en/job/...\nhttps://jobs.lvmh.com/..."}
              value={bulkUrlValue}
              onChange={(e) => setBulkUrlValue(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => fetchBulkUrls(bulkUrlValue)}
                disabled={!bulkUrlValue.trim()}
                className="jl-btn jl-btn-primary disabled:opacity-40"
              >
                Fetch All
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 2 — Preview & Map
        ════════════════════════════════════════════════════════ */}
        {step === 2 && rawData && (
          <div>
            {/* Multi-record preview */}
            {!rawData.isSingle ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium" style={{ color: BLACK }}>
                    Found <strong>{rawData.rows.length}</strong> assignments
                  </p>
                  <button
                    onClick={handleEnrich}
                    disabled={enriching}
                    className="jl-btn jl-btn-ghost text-xs disabled:opacity-40"
                  >
                    {enriching ? (
                      <>
                        <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Enriching...
                      </>
                    ) : (
                      'AI Enrich'
                    )}
                  </button>
                </div>

                {/* Mapping table with scrollable preview */}
                <div className="overflow-x-auto border rounded-sm bg-[#161b22]" style={{ borderColor: BORDER }}>
                  <table className="w-full text-xs" style={{ minWidth: 600 }}>
                    {/* Column mapping selects */}
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {rawData.headers.map((header) => {
                          const mapped = mappings[header]
                          const isAutoMapped = rawData.autoMappings?.[header] && mapped === rawData.autoMappings[header]
                          return (
                            <th key={header} className="p-2 text-left align-top" style={{ minWidth: 140 }}>
                              <select
                                className="jl-input w-full text-xs mb-1"
                                value={mapped || '__skip__'}
                                onChange={(e) => setMappings((prev) => ({ ...prev, [header]: e.target.value }))}
                              >
                                {MAPPABLE_FIELDS.map((f) => (
                                  <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                              </select>
                              <div className="flex items-center gap-1">
                                {isAutoMapped ? (
                                  <span className="text-green-600 text-[10px]">&#10003;</span>
                                ) : mapped && mapped !== '__skip__' ? (
                                  <span className="text-green-600 text-[10px]">&#10003;</span>
                                ) : (
                                  <span className="text-amber-500 text-[10px]">?</span>
                                )}
                                <span className="font-semibold uppercase tracking-wider text-[10px]" style={{ color: '#888' }}>
                                  {header}
                                </span>
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    {/* First 5 preview rows */}
                    <tbody>
                      {rawData.rows.slice(0, 5).map((row, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                          {rawData.headers.map((header) => (
                            <td
                              key={header}
                              className="p-2 text-[#666] truncate"
                              style={{ maxWidth: 200 }}
                              title={row[header] || ''}
                            >
                              {row[header] || <span className="text-[#ccc]">&mdash;</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {rawData.rows.length > 5 && (
                  <p className="text-xs text-[#999] mt-2">
                    Showing first 5 of {rawData.rows.length} rows.
                  </p>
                )}
              </>
            ) : (
              /* Single-record preview */
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium" style={{ color: BLACK }}>
                    Extracted Assignment Data
                  </p>
                  <button
                    onClick={handleEnrich}
                    disabled={enriching}
                    className="jl-btn jl-btn-ghost text-xs disabled:opacity-40"
                  >
                    {enriching ? 'Enriching...' : 'AI Enrich'}
                  </button>
                </div>

                <div className="border rounded-sm bg-[#161b22] overflow-hidden" style={{ borderColor: BORDER }}>
                  <table className="w-full text-sm">
                    <tbody>
                      {rawData.rows[0] && Object.entries(rawData.rows[0]).map(([key, value]) => (
                        <tr key={key} style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <td className="px-4 py-2.5 font-medium text-[#888] text-xs uppercase tracking-wider w-1/3 align-top" style={{ background: CREAM }}>
                            {key.replace(/_/g, ' ')}
                          </td>
                          <td className="px-4 py-2.5 text-sm" style={{ color: BLACK }}>
                            {(value as string) || <span className="text-[#ccc]">&mdash;</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button onClick={() => { setStep(1); setRawData(null) }} className="jl-btn jl-btn-outline">
                Back
              </button>
              <button onClick={buildAssignments} className="jl-btn jl-btn-primary">
                {rawData.isSingle ? 'Continue to Edit' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 3 — Review & Edit
        ════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div>
            {/* Multi-record review */}
            {!rawData?.isSingle ? (
              <>
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <p className="text-sm font-medium" style={{ color: BLACK }}>
                    {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} ready for import
                  </p>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs underline" style={{ color: GOLD }}>
                      Select All
                    </button>
                    <button onClick={deselectAll} className="text-xs underline" style={{ color: '#888' }}>
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Review table */}
                <div className="border rounded-sm bg-[#161b22] overflow-hidden" style={{ borderColor: BORDER }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${BLACK}` }}>
                        <th className="p-3 w-8" />
                        <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888]">#</th>
                        <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888]">Title</th>
                        <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888]">Maison</th>
                        <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888]">City</th>
                        <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888]">Department</th>
                        <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a, i) => {
                        const isReady = Boolean(a.title)
                        const isExpanded = expandedRow === i
                        return (
                          <Fragment key={i}>
                            <tr
                              className="cursor-pointer hover:bg-[#0d1117] transition-colors"
                              style={{ borderBottom: `1px solid ${BORDER}` }}
                              onClick={() => setExpandedRow(isExpanded ? null : i)}
                            >
                              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedRows.has(i)}
                                  onChange={() => toggleRow(i)}
                                  className="accent-[#a58e28] w-4 h-4"
                                />
                              </td>
                              <td className="p-3 text-xs text-[#999] font-mono">{i + 1}</td>
                              <td className="p-3 font-medium" style={{ color: BLACK }}>
                                {a.title || <span className="text-[#ccc] italic">Untitled</span>}
                              </td>
                              <td className="p-3 text-[#888] text-xs">{a.maison || '\u2014'}</td>
                              <td className="p-3 text-[#888] text-xs">{a.city || '\u2014'}</td>
                              <td className="p-3 text-[#888] text-xs">{a.department || '\u2014'}</td>
                              <td className="p-3">
                                <span
                                  className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5"
                                  style={{
                                    background: isReady ? '#e8f5e9' : '#fff8e6',
                                    color: isReady ? '#2a7a3c' : '#c97a2a',
                                  }}
                                >
                                  {isReady ? 'Ready' : 'Needs Review'}
                                </span>
                              </td>
                            </tr>

                            {/* Expanded edit row */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={7} style={{ background: CREAM, borderBottom: `1px solid ${BORDER}` }}>
                                  <div className="p-6 space-y-4">
                                    {/* Row 1: Title + Maison */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="jl-label">Title</label>
                                        <input
                                          type="text"
                                          className="jl-input w-full"
                                          value={(a.title as string) || ''}
                                          onChange={(e) => updateAssignment(i, 'title', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="jl-label">Maison</label>
                                        <input
                                          type="text"
                                          className="jl-input w-full"
                                          value={(a.maison as string) || ''}
                                          onChange={(e) => updateAssignment(i, 'maison', e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    {/* Row 2: City + Country */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="jl-label">City</label>
                                        <input
                                          type="text"
                                          className="jl-input w-full"
                                          value={(a.city as string) || ''}
                                          onChange={(e) => updateAssignment(i, 'city', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="jl-label">Country</label>
                                        <input
                                          type="text"
                                          className="jl-input w-full"
                                          value={(a.country as string) || ''}
                                          onChange={(e) => updateAssignment(i, 'country', e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    {/* Row 3: Department + Seniority */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="jl-label">Department</label>
                                        <select
                                          className="jl-input w-full"
                                          value={(a.department as string) || ''}
                                          onChange={(e) => updateAssignment(i, 'department', e.target.value)}
                                        >
                                          <option value="">Select...</option>
                                          {DEPARTMENTS.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="jl-label">Seniority</label>
                                        <select
                                          className="jl-input w-full"
                                          value={(a.seniority as string) || ''}
                                          onChange={(e) => updateAssignment(i, 'seniority', e.target.value)}
                                        >
                                          <option value="">Select...</option>
                                          {SENIORITY_LEVELS.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                    {/* Row 4: Contract Type + Remote Policy */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="jl-label">Contract Type</label>
                                        <select
                                          className="jl-input w-full"
                                          value={(a.contract_type as string) || ''}
                                          onChange={(e) => updateAssignment(i, 'contract_type', e.target.value)}
                                        >
                                          <option value="">Select...</option>
                                          {CONTRACT_TYPES.map((ct) => (
                                            <option key={ct} value={ct}>{ct}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="jl-label">Remote Policy</label>
                                        <select
                                          className="jl-input w-full"
                                          value={(a.remote_policy as string) || ''}
                                          onChange={(e) => updateAssignment(i, 'remote_policy', e.target.value)}
                                        >
                                          <option value="">Not specified</option>
                                          {REMOTE_POLICIES.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                    {/* Row 5: Description */}
                                    <div>
                                      <label className="jl-label">Description</label>
                                      <textarea
                                        className="jl-input w-full min-h-[100px]"
                                        value={(a.description as string) || ''}
                                        onChange={(e) => updateAssignment(i, 'description', e.target.value)}
                                      />
                                    </div>
                                    {/* Row 6: Responsibilities + Requirements */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="jl-label">Responsibilities</label>
                                        <textarea
                                          className="jl-input w-full min-h-[80px]"
                                          value={(a.responsibilities as string) || ''}
                                          onChange={(e) => updateAssignment(i, 'responsibilities', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="jl-label">Requirements</label>
                                        <textarea
                                          className="jl-input w-full min-h-[80px]"
                                          value={(a.requirements as string) || ''}
                                          onChange={(e) => updateAssignment(i, 'requirements', e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    {/* Row 7: Salary */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                      <div>
                                        <label className="jl-label">Salary Min</label>
                                        <input
                                          type="number"
                                          className="jl-input w-full"
                                          value={(a.salary_min != null ? String(a.salary_min) : '') || ''}
                                          onChange={(e) => updateAssignment(i, 'salary_min', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="jl-label">Salary Max</label>
                                        <input
                                          type="number"
                                          className="jl-input w-full"
                                          value={(a.salary_max != null ? String(a.salary_max) : '') || ''}
                                          onChange={(e) => updateAssignment(i, 'salary_max', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="jl-label">Currency</label>
                                        <select
                                          className="jl-input w-full"
                                          value={(a.salary_currency as string) || 'EUR'}
                                          onChange={(e) => updateAssignment(i, 'salary_currency', e.target.value)}
                                        >
                                          {SALARY_CURRENCIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              /* Single-record full edit form */
              <>
                <p className="text-sm font-medium mb-4" style={{ color: BLACK }}>
                  Review and Edit Assignment
                </p>
                <div className="border rounded-sm bg-[#161b22] p-6 space-y-4" style={{ borderColor: BORDER }}>
                  {/* Title */}
                  <div>
                    <label className="jl-label">Title</label>
                    <input
                      type="text"
                      className="jl-input w-full"
                      value={(assignments[0]?.title as string) || ''}
                      onChange={(e) => updateAssignment(0, 'title', e.target.value)}
                    />
                  </div>
                  {/* Maison + City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="jl-label">Maison</label>
                      <input
                        type="text"
                        className="jl-input w-full"
                        value={(assignments[0]?.maison as string) || ''}
                        onChange={(e) => updateAssignment(0, 'maison', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="jl-label">City</label>
                      <input
                        type="text"
                        className="jl-input w-full"
                        value={(assignments[0]?.city as string) || ''}
                        onChange={(e) => updateAssignment(0, 'city', e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Country + Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="jl-label">Country</label>
                      <input
                        type="text"
                        className="jl-input w-full"
                        value={(assignments[0]?.country as string) || ''}
                        onChange={(e) => updateAssignment(0, 'country', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="jl-label">Department</label>
                      <select
                        className="jl-input w-full"
                        value={(assignments[0]?.department as string) || ''}
                        onChange={(e) => updateAssignment(0, 'department', e.target.value)}
                      >
                        <option value="">Select...</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Seniority + Contract Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="jl-label">Seniority</label>
                      <select
                        className="jl-input w-full"
                        value={(assignments[0]?.seniority as string) || ''}
                        onChange={(e) => updateAssignment(0, 'seniority', e.target.value)}
                      >
                        <option value="">Select...</option>
                        {SENIORITY_LEVELS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="jl-label">Contract Type</label>
                      <select
                        className="jl-input w-full"
                        value={(assignments[0]?.contract_type as string) || ''}
                        onChange={(e) => updateAssignment(0, 'contract_type', e.target.value)}
                      >
                        <option value="">Select...</option>
                        {CONTRACT_TYPES.map((ct) => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Remote Policy */}
                  <div>
                    <label className="jl-label">Remote Policy</label>
                    <select
                      className="jl-input w-full"
                      value={(assignments[0]?.remote_policy as string) || ''}
                      onChange={(e) => updateAssignment(0, 'remote_policy', e.target.value)}
                    >
                      <option value="">Not specified</option>
                      {REMOTE_POLICIES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="jl-label">Description</label>
                    <textarea
                      className="jl-input w-full min-h-[120px]"
                      value={(assignments[0]?.description as string) || ''}
                      onChange={(e) => updateAssignment(0, 'description', e.target.value)}
                    />
                  </div>
                  {/* Responsibilities + Requirements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="jl-label">Responsibilities</label>
                      <textarea
                        className="jl-input w-full min-h-[100px]"
                        value={(assignments[0]?.responsibilities as string) || ''}
                        onChange={(e) => updateAssignment(0, 'responsibilities', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="jl-label">Requirements</label>
                      <textarea
                        className="jl-input w-full min-h-[100px]"
                        value={(assignments[0]?.requirements as string) || ''}
                        onChange={(e) => updateAssignment(0, 'requirements', e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Nice-to-Haves */}
                  <div>
                    <label className="jl-label">Nice-to-Haves</label>
                    <textarea
                      className="jl-input w-full min-h-[80px]"
                      value={(assignments[0]?.nice_to_haves as string) || ''}
                      onChange={(e) => updateAssignment(0, 'nice_to_haves', e.target.value)}
                    />
                  </div>
                  {/* Salary row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="jl-label">Salary Min</label>
                      <input
                        type="number"
                        className="jl-input w-full"
                        value={(assignments[0]?.salary_min != null ? String(assignments[0].salary_min) : '') || ''}
                        onChange={(e) => updateAssignment(0, 'salary_min', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="jl-label">Salary Max</label>
                      <input
                        type="number"
                        className="jl-input w-full"
                        value={(assignments[0]?.salary_max != null ? String(assignments[0].salary_max) : '') || ''}
                        onChange={(e) => updateAssignment(0, 'salary_max', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="jl-label">Currency</label>
                      <select
                        className="jl-input w-full"
                        value={(assignments[0]?.salary_currency as string) || 'EUR'}
                        onChange={(e) => updateAssignment(0, 'salary_currency', e.target.value)}
                      >
                        {SALARY_CURRENCIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="jl-label">Period</label>
                      <select
                        className="jl-input w-full"
                        value={(assignments[0]?.salary_period as string) || 'Annual'}
                        onChange={(e) => updateAssignment(0, 'salary_period', e.target.value)}
                      >
                        {SALARY_PERIODS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Benefits + Languages */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="jl-label">Benefits</label>
                      <input
                        type="text"
                        className="jl-input w-full"
                        placeholder="Comma-separated"
                        value={(Array.isArray(assignments[0]?.benefits) ? assignments[0].benefits.join(', ') : String(assignments[0]?.benefits || '')) || ''}
                        onChange={(e) => updateAssignment(0, 'benefits', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="jl-label">Languages Required</label>
                      <input
                        type="text"
                        className="jl-input w-full"
                        placeholder="Comma-separated"
                        value={(Array.isArray(assignments[0]?.languages_required) ? assignments[0].languages_required.join(', ') : String(assignments[0]?.languages_required || '')) || ''}
                        onChange={(e) => updateAssignment(0, 'languages_required', e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Product Category */}
                  <div>
                    <label className="jl-label">Product Category</label>
                    <input
                      type="text"
                      className="jl-input w-full"
                      placeholder="Comma-separated"
                      value={(Array.isArray(assignments[0]?.product_category) ? assignments[0].product_category.join(', ') : String(assignments[0]?.product_category || '')) || ''}
                      onChange={(e) => updateAssignment(0, 'product_category', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between mt-8">
              <button onClick={() => setStep(2)} className="jl-btn jl-btn-outline">
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => handleImport(false)}
                  disabled={importing || (rawData?.isSingle ? false : selectedRows.size === 0)}
                  className="jl-btn jl-btn-ghost disabled:opacity-40"
                >
                  Import as Draft
                </button>
                <button
                  onClick={() => handleImport(true)}
                  disabled={importing || (rawData?.isSingle ? false : selectedRows.size === 0)}
                  className="jl-btn jl-btn-primary disabled:opacity-40"
                >
                  Import &amp; Activate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 4 — Results
        ════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="text-center">
            {/* Progress bar during import */}
            {importing && (
              <div className="border rounded-sm bg-[#161b22] p-8" style={{ borderColor: BORDER }}>
                <div
                  className="inline-block w-6 h-6 border-2 rounded-full animate-spin mb-4"
                  style={{ borderColor: BORDER, borderTopColor: GOLD }}
                />
                <p className="text-sm font-medium mb-4" style={{ color: BLACK }}>
                  Importing {importProgress} of {selectedRows.size}...
                </p>
                <div className="w-full max-w-md mx-auto h-2 rounded-full overflow-hidden" style={{ background: BORDER }}>
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      background: GOLD,
                      width: `${(importProgress / selectedRows.size) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Results summary */}
            {results && !importing && (
              <div className="border rounded-sm bg-[#161b22] p-8" style={{ borderColor: BORDER }}>
                {/* Success count */}
                {results.success > 0 && (
                  <div className="mb-6">
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                      style={{ background: '#e8f5e9' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2a7a3c" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold" style={{ color: '#2a7a3c' }}>
                      Successfully imported {results.success} assignment{results.success !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {/* Failure count */}
                {results.failed > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-red-600 mb-2">
                      {results.failed} assignment{results.failed !== 1 ? 's' : ''} failed
                    </p>
                    <div className="max-w-lg mx-auto text-left">
                      {results.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-600 py-1" style={{ borderBottom: `1px solid #fde8e8` }}>
                          {err}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-center gap-3 mt-6">
                  <Link
                    href="/admin/assignments"
                    className="jl-btn jl-btn-primary inline-flex items-center"
                    style={{ textDecoration: 'none' }}
                  >
                    View Assignments
                  </Link>
                  <button onClick={resetWizard} className="jl-btn jl-btn-outline">
                    Import More
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}

