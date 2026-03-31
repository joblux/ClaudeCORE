'use client'

import { useEffect, useState } from 'react'

export default function LUXAIUsagePage() {
  const [usage, setUsage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/luxai/usage')
      .then(r => r.json())
      .then(data => {
        setUsage(data || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-5 h-5 border-2 border-[#e8e8e8] border-t-[#111] rounded-full animate-spin" />
      </div>
    )
  }

  const stats = usage.stats || { this_month: 0, last_month: 0, avg_cost: 0, this_month_requests: 0, last_month_requests: 0 }
  const history = usage.history || []

  return (
    <div className="p-8">
      <div className="max-w-[1200px]">
        <div className="mb-8">
          <h2 className="text-[28px] font-semibold text-[#111] mb-2">Usage & Costs</h2>
          <p className="text-sm text-[#666]">LUXAI API usage and spending overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
            <div className="text-xs text-[#666] uppercase tracking-wide mb-2">This Month</div>
            <div className="text-[32px] font-semibold text-[#111] mb-1">${stats.this_month.toFixed(2)}</div>
            <div className="text-[13px] font-medium text-[#10B981]">{stats.this_month_requests} requests</div>
          </div>
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
            <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Last Month</div>
            <div className="text-[32px] font-semibold text-[#111] mb-1">${stats.last_month.toFixed(2)}</div>
            <div className="text-[13px] font-medium text-[#10B981]">{stats.last_month_requests} requests</div>
          </div>
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
            <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Avg Cost/Request</div>
            <div className="text-[32px] font-semibold text-[#111] mb-1">${stats.avg_cost.toFixed(4)}</div>
            <div className="text-[13px] font-medium text-[#10B981]">Claude Haiku</div>
          </div>
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
            <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Projected (Month)</div>
            <div className="text-[32px] font-semibold text-[#111] mb-1">${(stats.this_month * 1.06).toFixed(2)}</div>
            <div className="text-[13px] font-medium text-[#10B981]">+5.7%</div>
          </div>
        </div>

        {/* Request Log Table */}
        <div className="bg-white border border-[#e8e8e8] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e8e8e8]">
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#666] uppercase tracking-wide">Timestamp</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#666] uppercase tracking-wide">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#666] uppercase tracking-wide">Model</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#666] uppercase tracking-wide">Tokens</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#666] uppercase tracking-wide">Cost</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#666] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#999]">No requests yet</td>
                </tr>
              ) : (
                history.map((item: any) => (
                  <tr key={item.id} className="border-b border-[#e8e8e8] hover:bg-[#fafafa] transition-colors">
                    <td className="px-6 py-4 text-sm text-[#666]">{new Date(item.created_at).toLocaleString('en-US', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit',
                      hour12: false 
                    })}</td>
                    <td className="px-6 py-4 text-sm text-[#111]">{item.type}</td>
                    <td className="px-6 py-4 text-sm text-[#666]">Haiku 3.5</td>
                    <td className="px-6 py-4 text-sm text-[#666]">{item.tokens_used?.toLocaleString() || '-'}</td>
                    <td className="px-6 py-4 text-sm text-[#111] font-medium">${item.cost_usd?.toFixed(4) || '0.0000'}</td>
                    <td className="px-6 py-4 text-sm">
                      {item.status === 'success' ? (
                        <span className="inline-block bg-[#D1FAE5] text-[#065F46] text-xs font-semibold px-2 py-1 rounded">Success</span>
                      ) : (
                        <span className="inline-block bg-[#FEE2E2] text-[#991B1B] text-xs font-semibold px-2 py-1 rounded">Error</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
