'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRequireAdmin } from '@/lib/auth-hooks'

const GOLD = '#a58e28'
const BLACK = '#1a1a1a'
const CREAM = '#fafaf5'
const BORDER = '#e8e2d8'

type Tab = 'all' | 'import' | 'stats'

interface Invitation {
  id: string
  name: string
  contact_email: string
  company: string
  status: string
  invited_by: string
  created_at: string
}

interface ParsedContact {
  name: string
  email: string
  company: string
  selected: boolean
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

interface FunnelStats {
  sent: number
  clicked: number
  registered: number
  approved: number
}

const PAGE_SIZE = 20

export default function AdminInvitationsPage() {
  useRequireAdmin()

  const [tab, setTab] = useState<Tab>('all')

  // ── Tab 1: All Invitations ──────────────────────────────────────────
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [invLoading, setInvLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchInvitations = useCallback(async () => {
    setInvLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/admin/invitations?${params}`)
      const data = await res.json()
      setInvitations(data.invitations || [])
      setTotalCount(data.total || 0)
    } catch (err) {
      console.error('Failed to fetch invitations:', err)
    } finally {
      setInvLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => {
    if (tab === 'all') fetchInvitations()
  }, [tab, fetchInvitations])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // ── Tab 2: Bulk Import ──────────────────────────────────────────────
  const [contacts, setContacts] = useState<ParsedContact[]>([])
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [parseError, setParseError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setParseError('')
    setImportResult(null)
    setContacts([])

    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'csv') {
      const Papa = (await import('papaparse')).default
      const text = await file.text()
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const parsed: ParsedContact[] = results.data.map((row: any) => ({
            name: row.name || row.Name || row.full_name || '',
            email: row.email || row.Email || row.contact_email || '',
            company: row.company || row.Company || row.organisation || '',
            selected: true,
          })).filter((c: ParsedContact) => c.email)
          if (parsed.length === 0) {
            setParseError('No valid contacts found. Ensure your file has an "email" column.')
            return
          }
          setContacts(parsed)
        },
        error: () => setParseError('Failed to parse CSV file.'),
      })
    } else if (ext === 'xlsx' || ext === 'xls') {
      try {
        const ExcelJS = await import('exceljs')
        const workbook = new ExcelJS.Workbook()
        const buffer = await file.arrayBuffer()
        await workbook.xlsx.load(buffer)
        const sheet = workbook.worksheets[0]
        if (!sheet) {
          setParseError('No worksheet found in file.')
          return
        }
        const headers: string[] = []
        sheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber - 1] = String(cell.value || '').toLowerCase().trim()
        })
        const parsed: ParsedContact[] = []
        sheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return
          const obj: Record<string, string> = {}
          row.eachCell((cell, colNumber) => {
            const h = headers[colNumber - 1]
            if (h) obj[h] = String(cell.value || '')
          })
          const email = obj.email || obj.contact_email || ''
          if (email) {
            parsed.push({
              name: obj.name || obj.full_name || '',
              email,
              company: obj.company || obj.organisation || '',
              selected: true,
            })
          }
        })
        if (parsed.length === 0) {
          setParseError('No valid contacts found. Ensure your file has an "email" column.')
          return
        }
        setContacts(parsed)
      } catch {
        setParseError('Failed to parse Excel file.')
      }
    } else {
      setParseError('Unsupported file type. Please upload a .csv or .xlsx file.')
    }
  }

  const toggleAll = () => {
    const allSelected = contacts.every((c) => c.selected)
    setContacts(contacts.map((c) => ({ ...c, selected: !allSelected })))
  }

  const toggleOne = (idx: number) => {
    setContacts(contacts.map((c, i) => (i === idx ? { ...c, selected: !c.selected } : c)))
  }

  const sendBulk = async () => {
    const selected = contacts.filter((c) => c.selected)
    if (selected.length === 0) return
    setImportLoading(true)
    setImportResult(null)
    try {
      const res = await fetch('/api/admin/invitations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: selected.map(({ name, email, company }) => ({ name, email, company })),
        }),
      })
      const data = await res.json()
      setImportResult({
        success: data.success ?? 0,
        failed: data.failed ?? 0,
        errors: data.errors ?? [],
      })
    } catch (err) {
      console.error(err)
      setImportResult({ success: 0, failed: selected.length, errors: ['Network error'] })
    } finally {
      setImportLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csv = 'name,email,company\nJohn Doe,john@example.com,Maison Example\nJane Smith,jane@example.com,Luxury Brand Co'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'invitation_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Tab 3: Stats ────────────────────────────────────────────────────
  const [funnel, setFunnel] = useState<FunnelStats>({ sent: 0, clicked: 0, registered: 0, approved: 0 })
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    if (tab === 'stats') {
      setStatsLoading(true)
      fetch('/api/admin/invitations/stats')
        .then((r) => r.json())
        .then((data) => {
          setFunnel({
            sent: data.sent ?? 0,
            clicked: data.clicked ?? 0,
            registered: data.registered ?? 0,
            approved: data.approved ?? 0,
          })
        })
        .catch(console.error)
        .finally(() => setStatsLoading(false))
    }
  }, [tab])

  const funnelMax = Math.max(funnel.sent, 1)
  const funnelSteps = [
    { label: 'Sent', value: funnel.sent, color: '#6B7280' },
    { label: 'Clicked', value: funnel.clicked, color: '#3B82F6' },
    { label: 'Registered', value: funnel.registered, color: GOLD },
    { label: 'Approved', value: funnel.approved, color: '#10B981' },
  ]

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const statusColor = (s: string) => {
    switch (s) {
      case 'sent': return 'bg-gray-100 text-gray-700'
      case 'clicked': return 'bg-blue-50 text-blue-700'
      case 'registered': return 'bg-amber-50 text-amber-700'
      case 'approved': return 'bg-emerald-50 text-emerald-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <main className="min-h-screen bg-[#fafaf5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="jl-overline-gold mb-1">Admin</p>
          <h1 className="text-2xl jl-serif font-semibold text-[#1a1a1a]">Access Approvals</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#e8e2d8] mb-6">
          {[
            { key: 'all' as Tab, label: 'All Approvals' },
            { key: 'import' as Tab, label: 'Bulk Import' },
            { key: 'stats' as Tab, label: 'Approval Stats' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-[#a58e28] text-[#a58e28]'
                  : 'border-transparent text-[#888] hover:text-[#1a1a1a]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: All Invitations ──────────────────────── */}
        {tab === 'all' && (
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <select
                className="jl-select text-sm"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              >
                <option value="all">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="clicked">Clicked</option>
                <option value="registered">Registered</option>
                <option value="approved">Approved</option>
              </select>
              <input
                type="text"
                className="jl-input text-sm flex-1"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>

            {/* Table */}
            <div className="jl-card overflow-hidden">
              {invLoading ? (
                <div className="p-8 text-center text-sm text-[#999]">Loading...</div>
              ) : invitations.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#999]">No access approvals found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e8e2d8] bg-[#fafaf5]">
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#888]">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#888]">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#888]">Company</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#888]">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#888]">Invited By</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-[#888]">Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map((inv) => (
                        <tr key={inv.id} className="border-b border-[#f0ede5] hover:bg-[#fafaf5]/50">
                          <td className="px-4 py-3 text-[#1a1a1a] font-medium">{inv.name || '-'}</td>
                          <td className="px-4 py-3 text-[#555]">{inv.contact_email}</td>
                          <td className="px-4 py-3 text-[#555]">{inv.company || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`jl-badge text-xs px-2 py-0.5 rounded-full capitalize ${statusColor(inv.status)}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#555]">{inv.invited_by || '-'}</td>
                          <td className="px-4 py-3 text-[#888] text-xs">{inv.created_at ? formatDate(inv.created_at) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#e8e2d8]">
                  <p className="text-xs text-[#888]">
                    Page {page} of {totalPages} ({totalCount} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="jl-btn-outline text-xs px-3 py-1"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <button
                      className="jl-btn-outline text-xs px-3 py-1"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab 2: Bulk Import ──────────────────────────── */}
        {tab === 'import' && (
          <div className="space-y-6">
            {/* Upload area */}
            <div className="jl-card p-6">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Upload Contacts</h3>
              <p className="text-xs text-[#888] mb-4">
                Upload a CSV or XLSX file with columns: <strong>name</strong>, <strong>email</strong>, <strong>company</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div
                  className="flex-1 border-2 border-dashed border-[#e8e2d8] rounded-lg p-8 text-center cursor-pointer hover:border-[#a58e28] transition-colors"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleFile(file)
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFile(file)
                    }}
                  />
                  <p className="text-sm text-[#888]">
                    Click or drag a file here
                  </p>
                  <p className="text-xs text-[#bbb] mt-1">.csv or .xlsx</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="jl-btn-outline text-xs px-4 py-2" onClick={downloadTemplate}>
                    Download Template
                  </button>
                </div>
              </div>
              {parseError && (
                <p className="text-xs text-red-500 mt-3">{parseError}</p>
              )}
            </div>

            {/* Preview table */}
            {contacts.length > 0 && (
              <div className="jl-card overflow-hidden">
                <div className="px-4 py-3 border-b border-[#e8e2d8] flex items-center justify-between">
                  <p className="text-sm font-medium text-[#1a1a1a]">
                    {contacts.filter((c) => c.selected).length} of {contacts.length} contacts selected
                  </p>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-xs text-[#555] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contacts.every((c) => c.selected)}
                        onChange={toggleAll}
                        className="accent-[#a58e28]"
                      />
                      Select All
                    </label>
                    <button
                      className="jl-btn-gold text-xs px-4 py-1.5"
                      disabled={importLoading || contacts.filter((c) => c.selected).length === 0}
                      onClick={sendBulk}
                    >
                      {importLoading ? 'Sending...' : 'Send Invitations'}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#fafaf5]">
                      <tr className="border-b border-[#e8e2d8]">
                        <th className="text-left px-4 py-2 text-xs font-medium text-[#888] w-10"></th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-[#888]">Name</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-[#888]">Email</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-[#888]">Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((c, i) => (
                        <tr key={i} className="border-b border-[#f0ede5]">
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={c.selected}
                              onChange={() => toggleOne(i)}
                              className="accent-[#a58e28]"
                            />
                          </td>
                          <td className="px-4 py-2 text-[#1a1a1a]">{c.name || '-'}</td>
                          <td className="px-4 py-2 text-[#555]">{c.email}</td>
                          <td className="px-4 py-2 text-[#555]">{c.company || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import result */}
            {importResult && (
              <div className="jl-card p-5">
                <h3 className="text-sm font-semibold text-[#1a1a1a] mb-2">Import Result</h3>
                <div className="flex gap-4">
                  <div className="text-center px-4 py-2 rounded-lg bg-emerald-50">
                    <p className="text-xl font-bold text-emerald-600">{importResult.success}</p>
                    <p className="text-xs text-emerald-700">Sent</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-lg bg-red-50">
                    <p className="text-xl font-bold text-red-500">{importResult.failed}</p>
                    <p className="text-xs text-red-600">Failed</p>
                  </div>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="mt-3 text-xs text-red-500 space-y-0.5">
                    {importResult.errors.map((e, i) => (
                      <p key={i}>{e}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: Invitation Stats ─────────────────────── */}
        {tab === 'stats' && (
          <div>
            {statsLoading ? (
              <div className="p-8 text-center text-sm text-[#999]">Loading stats...</div>
            ) : (
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {funnelSteps.map((s) => (
                    <div key={s.label} className="jl-card p-5 text-center">
                      <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-xs text-[#888] mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Conversion funnel */}
                <div className="jl-card p-6">
                  <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Conversion Funnel</h3>
                  <div className="space-y-3">
                    {funnelSteps.map((s) => (
                      <div key={s.label} className="flex items-center gap-4">
                        <span className="text-xs text-[#555] w-24">{s.label}</span>
                        <div className="flex-1 h-8 bg-[#f0ede5] rounded overflow-hidden">
                          <div
                            className="h-full rounded flex items-center justify-end pr-2 transition-all"
                            style={{
                              width: `${Math.max((s.value / funnelMax) * 100, 2)}%`,
                              backgroundColor: s.color,
                            }}
                          >
                            <span className="text-xs font-semibold text-white">{s.value}</span>
                          </div>
                        </div>
                        {funnelMax > 0 && (
                          <span className="text-xs text-[#888] w-14 text-right">
                            {((s.value / funnelMax) * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
