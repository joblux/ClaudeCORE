'use client'

import { useEffect, useState } from 'react'

interface UsageData {
  total_generated: number
  total_approved: number
  total_rejected: number
  total_cost: number
  daily: { date: string; count: number; cost: number }[]
  by_type: { type: string; count: number; cost: number }[]
  by_model: { model: string; tokens: number; cost: number }[]
}

const DEFAULT_USAGE: UsageData = {
  total_generated: 0,
  total_approved: 0,
  total_rejected: 0,
  total_cost: 0,
  daily: [],
  by_type: [],
  by_model: [],
}

export default function LUXAIUsagePage() {
  const [usage, setUsage] = useState<UsageData>(DEFAULT_USAGE)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/luxai/usage?period=${period}`)
      .then(r => r.json())
      .then(data => {
        if (data.usage) setUsage(data.usage)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#e8e8e8] border-t-[#111] rounded-full animate-spin" />
      </div>
    )
  }

  const approvalRate = usage.total_generated > 0
    ? Math.round((usage.total_approved / usage.total_generated) * 100)
    : 0

  const maxDailyCount = Math.max(...usage.daily.map(d => d.count), 1)

  return (
    <div className="p-8">
      <div className="max-w-[1200px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-[#111] mb-2">LUXAI Usage & Costs</h2>
            <p className="text-sm text-[#666]">Monitor AI generation volume and spend</p>
          </div>
          <div className="flex gap-1 bg-white border border-[#e8e8e8] rounded-md p-0.5">
            {[
              { id: '7d', label: '7 days' },
              { id: '30d', label: '30 days' },
              { id: '90d', label: '90 days' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`text-xs px-3 py-1.5 rounded transition-colors ${
                  period === p.id ? 'bg-[#111] text-white' : 'text-[#666] hover:text-[#111]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
            <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Total Generated</div>
            <div className="text-[32px] font-semibold text-[#111]">{usage.total_generated.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
            <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Approval Rate</div>
            <div className="text-[32px] font-semibold text-[#111]">{approvalRate}%</div>
          </div>
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
            <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Total Cost</div>
            <div className="text-[32px] font-semibold text-[#111]">${usage.total_cost.toFixed(2)}</div>
          </div>
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
            <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Cost per Item</div>
            <div className="text-[32px] font-semibold text-[#111]">
              ${usage.total_generated > 0 ? (usage.total_cost / usage.total_generated).toFixed(3) : '0.000'}
            </div>
          </div>
        </div>

        {/* Daily Generation Chart (simple bar chart) */}
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-[#111] mb-4 uppercase tracking-wide">Daily Generation</h3>
          {usage.daily.length === 0 ? (
            <p className="text-sm text-[#999] py-8 text-center">No generation data for this period</p>
          ) : (
            <div className="flex items-end gap-1 h-[160px]">
              {usage.daily.map(day => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-[#999]">{day.count}</div>
                  <div
                    className="w-full bg-[#111] rounded-t min-h-[2px]"
                    style={{ height: `${(day.count / maxDailyCount) * 130}px` }}
                  />
                  <div className="text-[10px] text-[#999] mt-1">
                    {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* By Content Type */}
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#111] mb-4 uppercase tracking-wide">By Content Type</h3>
            {usage.by_type.length === 0 ? (
              <p className="text-sm text-[#999] py-4 text-center">No data</p>
            ) : (
              <div className="space-y-3">
                {usage.by_type.map(item => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#111]">{item.type.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-[#999]">{item.count} items</div>
                    </div>
                    <div className="text-sm font-medium text-[#111]">${item.cost.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* By Model */}
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#111] mb-4 uppercase tracking-wide">By Model</h3>
            {usage.by_model.length === 0 ? (
              <p className="text-sm text-[#999] py-4 text-center">No data</p>
            ) : (
              <div className="space-y-3">
                {usage.by_model.map(item => (
                  <div key={item.model} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#111] font-mono">{item.model}</div>
                      <div className="text-xs text-[#999]">{item.tokens.toLocaleString()} tokens</div>
                    </div>
                    <div className="text-sm font-medium text-[#111]">${item.cost.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
