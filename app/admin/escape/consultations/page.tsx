'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, ChevronDown, ChevronUp, X } from 'lucide-react'

interface Consultation {
  id: string; name: string; email: string; destination_text?: string; trip_types: string[]; status: string; created_at: string; user_id?: string; phone?: string; contact_preference?: string; experience_prefs: string[]; occasion?: string; preferred_dates?: string; duration?: string; date_flexibility?: string; budget_range?: string; plan_scope: string[]; past_trips_text?: string; favorite_hotels?: string; additional_notes?: string; travelers: any[]; is_cruise: boolean; cruise_details?: any; member?: { full_name: string; role: string; avatar_url?: string }
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  replied: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-purple-50 text-purple-700',
  completed: 'bg-green-50 text-green-700',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New', replied: 'Replied', in_progress: 'In Progress', completed: 'Completed',
}

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (search) params.set('search', search)
    const res = await fetch(`/api/escape/consultations?${params}`)
    const data = await res.json()
    setConsultations(data.consultations || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [statusFilter, page, search])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/escape/consultations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setConsultations(c => c.map(x => x.id === id ? { ...x, status } : x))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList size={20} className="text-[#2B4A3E]" />
        <h1 className="text-xl font-semibold text-[#1a1a1a]">Escape Consultations</h1>
        <span className="text-xs text-[#484f58] bg-gray-100 px-2 py-0.5 rounded">{total} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {['all', 'new', 'replied', 'in_progress', 'completed'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              statusFilter === s ? 'bg-[#2B4A3E] text-white' : 'bg-gray-100 text-[#8b949e] hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_LABELS[s]}
          </button>
        ))}
        <input
          type="text" placeholder="Search name, email, destination..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="px-3 py-1.5 text-sm border border-[#30363d] rounded w-64 ml-auto"
        />
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-[#484f58] uppercase border-b bg-gray-50">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3 hidden md:table-cell">Destination</th>
            <th className="px-4 py-3 hidden lg:table-cell">Trip Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 hidden md:table-cell">Member</th>
            <th className="px-4 py-3 hidden lg:table-cell">Date</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[#484f58]">Loading...</td></tr>
            ) : consultations.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[#484f58]">No consultations found.</td></tr>
            ) : consultations.map(c => (
              <>
                <tr key={c.id} className="border-b border-[#30363d] hover:bg-[#1f2937] cursor-pointer" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#1a1a1a]">{c.name}</div>
                    <div className="text-xs text-[#484f58]">{c.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] hidden md:table-cell">{c.destination_text || '—'}</td>
                  <td className="px-4 py-3 text-[#8b949e] hidden lg:table-cell">{c.trip_types?.slice(0, 2).join(', ') || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 text-[#8b949e]'}`}>
                      {STATUS_LABELS[c.status] || c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {c.member ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-[#B8975C]/10 text-[#B8975C] font-medium">{c.member.role}</span>
                    ) : (
                      <span className="text-xs text-[#484f58]">Visitor</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#484f58] text-xs hidden lg:table-cell">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {expanded === c.id ? <ChevronUp size={14} className="text-[#484f58]" /> : <ChevronDown size={14} className="text-[#484f58]" />}
                  </td>
                </tr>
                {expanded === c.id && (
                  <tr key={`${c.id}-detail`}><td colSpan={7} className="px-6 py-4 bg-gray-50 border-b">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="text-xs font-semibold text-[#484f58] uppercase mb-2">Trip Details</h4>
                        <div className="space-y-1.5">
                          <p><span className="text-[#484f58]">Trip types:</span> {c.trip_types?.join(', ') || '—'}</p>
                          <p><span className="text-[#484f58]">Destination:</span> {c.destination_text || '—'}</p>
                          <p><span className="text-[#484f58]">Experiences:</span> {c.experience_prefs?.join(', ') || '—'}</p>
                          <p><span className="text-[#484f58]">Occasion:</span> {c.occasion || '—'}</p>
                          <p><span className="text-[#484f58]">Dates:</span> {c.preferred_dates || '—'} ({c.date_flexibility || '—'})</p>
                          <p><span className="text-[#484f58]">Duration:</span> {c.duration || '—'}</p>
                          <p><span className="text-[#484f58]">Budget:</span> {c.budget_range || '—'}</p>
                          <p><span className="text-[#484f58]">Planning:</span> {c.plan_scope?.join(', ') || '—'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#484f58] uppercase mb-2">Personal</h4>
                        <div className="space-y-1.5">
                          <p><span className="text-[#484f58]">Contact:</span> {c.contact_preference} {c.phone ? `· ${c.phone}` : ''}</p>
                          {c.past_trips_text && <p><span className="text-[#484f58]">Past trips:</span> {c.past_trips_text}</p>}
                          {c.favorite_hotels && <p><span className="text-[#484f58]">Hotels loved:</span> {c.favorite_hotels}</p>}
                          {c.additional_notes && <p><span className="text-[#484f58]">Notes:</span> {c.additional_notes}</p>}
                          {c.travelers?.length > 0 && (
                            <div><span className="text-[#484f58]">Travelers:</span> {c.travelers.filter((t: any) => t.name).map((t: any) => `${t.name} (${t.age || '?'})`).join(', ')}</div>
                          )}
                          {c.is_cruise && c.cruise_details && (
                            <div className="mt-2 p-2 bg-[#161b22] rounded border text-xs">
                              <span className="font-semibold">Cruise:</span> {c.cruise_details.cruise_line || '—'} · {c.cruise_details.stateroom_type || '—'} · {c.cruise_details.duration || '—'}
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <label className="text-xs text-[#484f58] block mb-1">Update status</label>
                          <select
                            value={c.status}
                            onChange={(e) => updateStatus(c.id, e.target.value)}
                            className="text-sm border border-[#30363d] rounded px-3 py-1.5"
                          >
                            {Object.entries(STATUS_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </td></tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border rounded disabled:opacity-30">Prev</button>
          <span className="px-3 py-1.5 text-sm text-[#8b949e]">Page {page}</span>
          <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border rounded disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  )
}
