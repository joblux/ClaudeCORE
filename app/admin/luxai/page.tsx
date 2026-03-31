'use client'

import { useEffect, useState } from 'react'

interface QueueItem {
  id: string
  type: string
  content_type: string | null
  title: string
  content: any
  status: string
  generated_at: string
}

export default function LUXAIPage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetch('/api/admin/luxai/queue')
      .then(r => r.json())
      .then(data => {
        setQueue(data.queue || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredQueue = queue.filter(item => {
    if (activeTab === 'all') return true
    if (activeTab === 'signals') return item.type === 'signal'
    if (activeTab === 'salary') return item.type.includes('salary')
    if (activeTab === 'interview') return item.type === 'interview_detail'
    return true
  })

  async function handleApprove(id: string) {
    try {
      await fetch('/api/admin/luxai/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setQueue(queue.filter(q => q.id !== id))
    } catch (error) {
      alert('Failed to approve')
    }
  }

  async function handleReject(id: string) {
    try {
      await fetch('/api/admin/luxai/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setQueue(queue.filter(q => q.id !== id))
    } catch (error) {
      alert('Failed to reject')
    }
  }

  function getBadgeStyle(contentType: string | null) {
    switch (contentType?.toUpperCase()) {
      case 'TALENT':
        return 'bg-[#3B82F6] text-white'
      case 'MARKET':
        return 'bg-[#10B981] text-white'
      case 'BRAND':
        return 'bg-[#F59E0B] text-white'
      case 'FINANCE':
        return 'bg-[#8B5CF6] text-white'
      case 'SALARY':
        return 'bg-[#EC4899] text-white'
      case 'INTERVIEW':
        return 'bg-[#06B6D4] text-white'
      default:
        return 'bg-[#3B82F6] text-white'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-5 h-5 border-2 border-[#e8e8e8] border-t-[#111] rounded-full animate-spin" />
      </div>
    )
  }

  const tabCounts = {
    all: queue.length,
    signals: queue.filter(q => q.type === 'signal').length,
    salary: queue.filter(q => q.type.includes('salary')).length,
    interview: queue.filter(q => q.type === 'interview_detail').length,
  }

  return (
    <div className="p-8">
      <div className="max-w-[1200px]">
        <div className="mb-8">
          <h2 className="text-[28px] font-semibold text-[#111] mb-2">LUXAI Approval Queue</h2>
          <p className="text-sm text-[#666]">Review AI-generated content before publishing</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#e8e8e8] mb-6">
          {[
            { id: 'all', label: 'All' },
            { id: 'signals', label: 'Signals' },
            { id: 'salary', label: 'Salary' },
            { id: 'interview', label: 'Interview' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 mr-8 text-sm relative transition-colors ${
                activeTab === tab.id ? 'text-[#111] font-medium' : 'text-[#666]'
              }`}
            >
              {tab.label}
              <span className="text-xs text-[#999] ml-1.5">{tabCounts[tab.id as keyof typeof tabCounts]}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111]" />
              )}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
            <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Pending Review</div>
            <div className="text-[32px] font-semibold text-[#111]">{queue.length}</div>
          </div>
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
            <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Approved (7d)</div>
            <div className="text-[32px] font-semibold text-[#111]">0</div>
          </div>
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
            <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Rejected (7d)</div>
            <div className="text-[32px] font-semibold text-[#111]">0</div>
          </div>
          <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
            <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Avg Review Time</div>
            <div className="text-[32px] font-semibold text-[#111]">2.4m</div>
          </div>
        </div>

        {/* Queue Items */}
        <div className="space-y-3">
          {filteredQueue.length === 0 ? (
            <div className="bg-white border border-[#e8e8e8] rounded-lg p-12 text-center">
              <p className="text-[#999] text-sm mb-4">No pending items in queue</p>
              <p className="text-xs text-[#666] mb-2">Generate test signals:</p>
              <code className="text-xs bg-[#f5f5f5] px-3 py-1.5 rounded inline-block">
                curl -X POST https://joblux.com/api/luxai/generate-signal
              </code>
            </div>
          ) : (
            filteredQueue.map(item => (
              <div key={item.id} className="bg-white border border-[#e8e8e8] rounded-lg p-5 hover:border-[#ccc] transition-colors">
                <div className="mb-3">
                  <span className={`inline-block text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wide ${getBadgeStyle(item.content_type)}`}>
                    {item.content_type || 'SIGNAL'}
                  </span>
                </div>
                <h3 className="text-base font-medium text-[#111] mb-1">{item.title}</h3>
                <p className="text-xs text-[#999] mb-4">
                  Generated {new Date(item.generated_at).toLocaleString()} via LUXAI
                </p>
                <div className="text-sm text-[#444] mb-4 leading-relaxed">
                  {typeof item.content === 'string' 
                    ? item.content 
                    : item.content.content || JSON.stringify(item.content).substring(0, 300)
                  }
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="bg-[#10B981] text-white text-[13px] font-medium px-4 py-2 rounded-md hover:bg-[#059669] transition-colors"
                  >
                    Approve & Publish
                  </button>
                  <button
                    className="bg-white border border-[#e8e8e8] text-[#111] text-[13px] font-medium px-4 py-2 rounded-md hover:bg-[#f5f5f5] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="bg-white border border-[#e8e8e8] text-[#EF4444] text-[13px] font-medium px-4 py-2 rounded-md hover:bg-[#FEE2E2] transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
