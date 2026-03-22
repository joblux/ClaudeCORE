'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  wikilux_insight: 'WikiLux Insight',
  salary_data: 'Salary Data',
  interview_experience: 'Interview Experience',
}

const TYPE_POINTS: Record<string, number> = {
  wikilux_insight: 5,
  salary_data: 10,
  interview_experience: 10,
}

export default function AdminContributionsPage() {
  const [contributions, setContributions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchContributions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/contributions?status=${statusFilter}&limit=50`)
      const data = await res.json()
      setContributions(data.contributions || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchContributions()
  }, [fetchContributions])

  const viewDetail = async (id: string) => {
    setSelectedId(id)
    try {
      const res = await fetch(`/api/contributions/${id}`)
      const data = await res.json()
      setSelectedDetail(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedId) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/contributions/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejection_reason: rejectionReason || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedId(null)
        setSelectedDetail(null)
        setRejectionReason('')
        fetchContributions()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-[#fafaf5]">
      <section className="border-b border-[#e8e2d8] bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link href="/admin" className="text-sm text-[#a58e28] hover:text-[#1a1a1a] transition-colors">
            ← Back to Admin
          </Link>
          <h1 className="jl-serif text-2xl md:text-3xl text-[#1a1a1a] mt-4">
            Review Contributions
          </h1>
          <p className="text-sm text-[#666] mt-1">
            Approve or reject contributions. Points are awarded on approval.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Status tabs */}
        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setSelectedId(null); setSelectedDetail(null) }}
              className={`px-4 py-2 text-xs tracking-wide rounded-sm border transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-[#1a1a1a] text-[#a58e28] border-[#1a1a1a]'
                  : 'bg-white text-[#666] border-[#e8e2d8] hover:border-[#a58e28]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: List */}
          <div>
            {loading ? (
              <p className="text-sm text-[#999]">Loading…</p>
            ) : contributions.length === 0 ? (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-8 text-center">
                <p className="text-sm text-[#999]">No {statusFilter} contributions.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contributions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => viewDetail(c.id)}
                    className={`w-full text-left p-4 border rounded-sm transition-colors ${
                      selectedId === c.id
                        ? 'bg-white border-[#a58e28]'
                        : 'bg-white border-[#e8e2d8] hover:border-[#a58e28]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-[#a58e28] mb-1">
                          {TYPE_LABELS[c.contribution_type]} · +{TYPE_POINTS[c.contribution_type]} pts
                        </p>
                        <p className="text-sm font-medium text-[#1a1a1a]">
                          {c.brand_name || 'Unknown brand'}
                        </p>
                        <p className="text-xs text-[#999] mt-1">
                          {c.is_anonymous ? 'Anonymous' : c.members?.full_name || 'Unknown'} · {formatDate(c.created_at)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-sm ${
                        c.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                        c.status === 'approved' ? 'bg-green-50 text-green-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Detail */}
          <div>
            {selectedDetail ? (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 sticky top-24">
                <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-4">
                  {TYPE_LABELS[selectedDetail.contribution_type]}
                </h2>

                {/* Member info */}
                <div className="mb-4 pb-4 border-b border-[#e8e2d8]">
                  <p className="text-sm font-medium text-[#1a1a1a]">
                    {selectedDetail.is_anonymous ? 'Anonymous submission' : selectedDetail.members?.full_name}
                  </p>
                  {!selectedDetail.is_anonymous && selectedDetail.members?.email && (
                    <p className="text-xs text-[#999]">{selectedDetail.members.email}</p>
                  )}
                  <p className="text-xs text-[#999] mt-1">
                    Brand: {selectedDetail.brand_name} · Submitted: {formatDate(selectedDetail.created_at)}
                  </p>
                </div>

                {/* Detail content */}
                {selectedDetail.detail && (
                  <div className="mb-6 space-y-3">
                    {Object.entries(selectedDetail.detail).map(([key, value]) => {
                      if (!value || key === 'id' || key === 'contribution_id' || key === 'created_at') return null
                      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                      return (
                        <div key={key}>
                          <p className="text-xs text-[#999]">{label}</p>
                          <p className="text-sm text-[#1a1a1a] whitespace-pre-wrap">{String(value)}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Action buttons (only for pending) */}
                {selectedDetail.status === 'pending' && (
                  <div className="pt-4 border-t border-[#e8e2d8] space-y-3">
                    <div>
                      <label className="jl-label">Rejection Reason (optional)</label>
                      <input
                        className="jl-input w-full"
                        placeholder="Only needed if rejecting…"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction('approve')}
                        disabled={actionLoading}
                        className="jl-btn jl-btn-primary flex-1"
                      >
                        {actionLoading ? 'Processing…' : `Approve (+${TYPE_POINTS[selectedDetail.contribution_type]} pts)`}
                      </button>
                      <button
                        onClick={() => handleAction('reject')}
                        disabled={actionLoading}
                        className="jl-btn jl-btn-outline flex-1"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-8 text-center sticky top-24">
                <p className="text-sm text-[#999]">Select a contribution to review.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
