'use client'

import { useState, useEffect } from 'react'

const categoryColors: Record<string, string> = {
  growth: '#4CAF50',
  leadership: '#FF9800',
  contraction: '#f44336',
  expansion: '#2196F3',
  merger_acquisition: '#9C27B0',
}

const categoryLabels: Record<string, string> = {
  growth: 'Growth',
  leadership: 'Leadership',
  contraction: 'Contraction',
  expansion: 'Expansion',
  merger_acquisition: 'M&A',
}

interface QueueItem {
  id: string
  type: string
  content_type: string
  title: string
  content: Record<string, unknown>
  status: string
  source: string
  created_at: string
}

export default function ApprovalQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchQueue = () => {
    setLoading(true)
    fetch('/api/admin/luxai/queue')
      .then(r => r.ok ? r.json() : { queue: [] })
      .then(data => setItems(data.queue || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchQueue() }, [])

  const handleApprove = async (item: QueueItem) => {
    setActionLoading(item.id)
    try {
      const res = await fetch('/api/admin/luxai/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, type: item.type, source: item.source }),
      })
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== item.id))
      }
    } catch (_e) { /* silently fail */ }
    setActionLoading(null)
  }

  const handleReject = async (item: QueueItem) => {
    setActionLoading(item.id)
    try {
      const res = await fetch('/api/admin/luxai/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, type: item.type, source: item.source }),
      })
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== item.id))
      }
    } catch (_e) { /* silently fail */ }
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-[#e8e8e8] border-t-[#111] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[18px] font-semibold text-[#111]">Approval Queue</h1>
          <p className="text-[13px] text-[#999] mt-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''} pending review
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="text-[12px] px-3 py-1.5 border border-[#e8e8e8] rounded-md text-[#555] hover:bg-[#f0f0f0] transition-colors"
        >
          Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-12 text-center">
          <p className="text-[14px] text-[#999]">Nothing to review</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <QueueCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
              isLoading={actionLoading === item.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function QueueCard({
  item,
  onApprove,
  onReject,
  isLoading,
}: {
  item: QueueItem
  onApprove: (item: QueueItem) => void
  onReject: (item: QueueItem) => void
  isLoading: boolean
}) {
  const isSignal = item.type === 'signal'
  const c = item.content as Record<string, unknown>

  const category = isSignal ? (c?.category as string || 'growth') : 'wikilux'
  const dotColor = categoryColors[category] || '#888'
  const categoryLabel = isSignal
    ? (categoryLabels[category] || category)
    : 'WikiLux'

  const headline = isSignal
    ? ((c?.headline as string) || item.title)
    : ((c?.brand_name as string) || item.title)
  const wikiluxContent = c?.content as Record<string, unknown> | undefined
  const subtitle = isSignal
    ? ((c?.context_paragraph as string) || '')
    : ((wikiluxContent?.tagline as string) || (c?.editorial_notes as string) || '')
  const tags: string[] = isSignal ? (c?.brand_tags as string[] || []) : []

  const dateStr = new Date(item.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Category dot + label */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: dotColor }}
            />
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#999]">
              {categoryLabel}
            </span>
            <span className="text-[11px] text-[#ccc]">&middot;</span>
            <span className="text-[11px] text-[#999]">{dateStr}</span>
          </div>

          {/* Headline */}
          <h3 className="text-[15px] font-semibold text-[#111] mb-1 leading-snug">
            {headline}
          </h3>

          {/* Subtitle / context */}
          {subtitle && (
            <p className="text-[13px] text-[#666] leading-relaxed line-clamp-2 mb-2">
              {subtitle}
            </p>
          )}

          {/* Brand tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.slice(0, 5).map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f5f5f5] text-[#555] border border-[#e8e8e8]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-1">
          <button
            onClick={() => onReject(item)}
            disabled={isLoading}
            className="text-[12px] px-3 py-1.5 border border-[#fecaca] text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => onApprove(item)}
            disabled={isLoading}
            className="text-[12px] px-3 py-1.5 border border-[#111] bg-[#111] text-white rounded-md hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}
