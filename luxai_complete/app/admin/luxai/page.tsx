'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface QueueItem {
  id: string
  type: string
  content_type: string | null
  title: string
  content: any
  status: string
  generated_at: string
}

export default function LUXAIAdminPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [stats, setStats] = useState({
    pending: 0,
    approved_7d: 0,
    rejected_7d: 0,
    avg_review_time: '0m',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQueue()
    fetchStats()
  }, [activeTab])

  async function fetchQueue() {
    let query = supabase
      .from('luxai_queue')
      .select('*')
      .eq('status', 'pending')
      .order('generated_at', { ascending: false })

    if (activeTab !== 'all') {
      const typeMap: Record<string, string[]> = {
        signals: ['signal'],
        salary: ['salary_benchmark', 'salary_compare', 'salary_calculator'],
        interview: ['interview_detail'],
      }
      query = query.in('type', typeMap[activeTab] || [])
    }

    const { data } = await query
    setQueue(data || [])
    setLoading(false)
  }

  async function fetchStats() {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Pending count
    const { count: pendingCount } = await supabase
      .from('luxai_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Approved last 7 days
    const { count: approvedCount } = await supabase
      .from('luxai_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('reviewed_at', sevenDaysAgo.toISOString())

    // Rejected last 7 days
    const { count: rejectedCount } = await supabase
      .from('luxai_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')
      .gte('reviewed_at', sevenDaysAgo.toISOString())

    setStats({
      pending: pendingCount || 0,
      approved_7d: approvedCount || 0,
      rejected_7d: rejectedCount || 0,
      avg_review_time: '2.4m', // TODO: Calculate from data
    })
  }

  async function handleApprove(item: QueueItem) {
    // Update queue item
    await supabase
      .from('luxai_queue')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    // Publish content based on type
    if (item.type === 'signal') {
      await supabase.from('signals').insert({
        title: item.title,
        content: item.content.content,
        type: item.content_type?.toLowerCase() || 'talent',
        status: 'published',
        published_at: new Date().toISOString(),
      })
    }

    // Refresh queue
    fetchQueue()
    fetchStats()
  }

  async function handleReject(item: QueueItem) {
    await supabase
      .from('luxai_queue')
      .update({ 
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    fetchQueue()
    fetchStats()
  }

  async function handleEdit(item: QueueItem) {
    // TODO: Open edit modal
    alert('Edit functionality coming soon')
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      TALENT: 'bg-[#3B82F6]',
      MARKET: 'bg-[#10B981]',
      BRAND: 'bg-[#F59E0B]',
      FINANCE: 'bg-[#8B5CF6]',
      salary_benchmark: 'bg-[#EC4899]',
      salary_compare: 'bg-[#EC4899]',
      salary_calculator: 'bg-[#EC4899]',
      interview_detail: 'bg-[#06B6D4]',
    }
    return colors[type] || 'bg-[#3B82F6]'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-[#666]">Loading LUXAI queue...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-[1400px] mx-auto px-10 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#111]">JOBLUX Admin</h1>
          <div className="flex items-center gap-3 text-sm text-[#666]">
            <span>Mo M'zaour</span>
            <div className="w-8 h-8 rounded-full bg-[#e8e8e8]"></div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-60 bg-white border-r border-[#e8e8e8] min-h-[calc(100vh-57px)] py-6">
          <div className="mb-6">
            <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wide px-5 mb-2">LUXAI</div>
            <div className="text-sm text-[#111] font-medium px-5 py-2.5 bg-[#f5f5f5] border-l-2 border-[#111] pl-[18px]">
              Approval Queue
              {stats.pending > 0 && (
                <span className="ml-2 bg-[#FF6B6B] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">{stats.pending}</span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-10">
          <div className="max-w-[1200px]">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-[28px] font-semibold text-[#111] mb-2">LUXAI Approval Queue</h2>
              <p className="text-sm text-[#666]">Review AI-generated content before publishing</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-[#e8e8e8] mb-6">
              {[
                { id: 'all', label: 'All', count: queue.length },
                { id: 'signals', label: 'Signals', count: queue.filter(q => q.type === 'signal').length },
                { id: 'salary', label: 'Salary', count: queue.filter(q => q.type.includes('salary')).length },
                { id: 'interview', label: 'Interview', count: queue.filter(q => q.type === 'interview_detail').length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 mr-8 text-sm relative transition-colors ${activeTab === tab.id ? 'text-[#111] font-medium' : 'text-[#666]'}`}
                >
                  {tab.label}
                  <span className="text-xs text-[#999] ml-1.5">{tab.count}</span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111]" />
                  )}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
                <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Pending Review</div>
                <div className="text-[32px] font-semibold text-[#111] mb-1">{stats.pending}</div>
                <div className="text-[13px] text-[#10B981] font-medium">+3 today</div>
              </div>
              <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
                <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Approved (7d)</div>
                <div className="text-[32px] font-semibold text-[#111] mb-1">{stats.approved_7d}</div>
                <div className="text-[13px] text-[#10B981] font-medium">+12%</div>
              </div>
              <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
                <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Rejected (7d)</div>
                <div className="text-[32px] font-semibold text-[#111] mb-1">{stats.rejected_7d}</div>
                <div className="text-[13px] text-[#EF4444] font-medium">-2</div>
              </div>
              <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
                <div className="text-xs text-[#666] uppercase tracking-wide mb-2">Avg Review Time</div>
                <div className="text-[32px] font-semibold text-[#111] mb-1">{stats.avg_review_time}</div>
                <div className="text-[13px] text-[#10B981] font-medium">-15%</div>
              </div>
            </div>

            {/* Queue Items */}
            <div className="space-y-3">
              {queue.length === 0 ? (
                <div className="bg-white border border-[#e8e8e8] rounded-lg p-12 text-center">
                  <p className="text-[#999] text-sm">No pending items in queue</p>
                </div>
              ) : (
                queue.map(item => (
                  <div key={item.id} className="bg-white border border-[#e8e8e8] rounded-lg p-5 hover:border-[#ccc] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <span className={`inline-block ${getTypeColor(item.content_type || item.type)} text-white text-[10px] font-semibold px-2 py-1 rounded uppercase mb-2`}>
                          {item.content_type || item.type.replace('_', ' ')}
                        </span>
                        <h3 className="text-base font-medium text-[#111] mb-1">{item.title}</h3>
                        <p className="text-xs text-[#999]">
                          Generated {new Date(item.generated_at).toLocaleString()} via LUXAI
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-[#444] leading-relaxed mb-4">
                      {typeof item.content === 'string' 
                        ? item.content 
                        : item.content.content || item.content.analysis || JSON.stringify(item.content).substring(0, 300)
                      }
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(item)}
                        className="bg-[#10B981] text-white text-[13px] font-medium px-4 py-2 rounded-md hover:bg-[#059669] transition-colors"
                      >
                        Approve & Publish
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-white border border-[#e8e8e8] text-[#111] text-[13px] font-medium px-4 py-2 rounded-md hover:bg-[#f5f5f5] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleReject(item)}
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
      </div>
    </div>
  )
}
