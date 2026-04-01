'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, CheckCircle, Settings as SettingsIcon, DollarSign, FileText, TrendingUp, Briefcase } from 'lucide-react'

export default function LUXAIAdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('generation')
  
  // Approval Queue state
  const [queue, setQueue] = useState<any[]>([])
  const [loadingQueue, setLoadingQueue] = useState(false)
  const [queueTab, setQueueTab] = useState('all')
  
  // Settings state
  const [settings, setSettings] = useState<any>(null)
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  
  // Usage state
  const [usage, setUsage] = useState<any>(null)
  const [loadingUsage, setLoadingUsage] = useState(false)
  
  // Generation state
  const [generating, setGenerating] = useState<string | null>(null)
  
  // Single brand regeneration
  const [selectedBrand, setSelectedBrand] = useState('')
  const [brandsList, setBrandsList] = useState<any[]>([])

  // Load brands list on mount for the dropdown
  useEffect(() => {
    fetch('/api/admin/wikilux/brands-list')
      .then(r => r.json())
      .then(d => setBrandsList(d.brands || []))
      .catch(() => {})
  }, [])

  // Load data when switching tabs
  useEffect(() => {
    if (activeTab === 'approval' && queue.length === 0) {
      loadQueue()
    } else if (activeTab === 'settings' && !settings) {
      loadSettings()
    } else if (activeTab === 'usage' && !usage) {
      loadUsage()
    }
  }, [activeTab])

  async function loadQueue() {
    setLoadingQueue(true)
    try {
      const res = await fetch('/api/admin/luxai/queue')
      const data = await res.json()
      setQueue(data.queue || [])
    } catch (error) {
      console.error('Failed to load queue:', error)
    }
    setLoadingQueue(false)
  }

  async function loadSettings() {
    setLoadingSettings(true)
    try {
      const res = await fetch('/api/admin/luxai/settings')
      const data = await res.json()
      setSettings(data.settings || {
        signal_generation_enabled: false,
        signal_daily_target: 6,
        salary_benchmark_enabled: true,
        salary_compare_enabled: true,
        salary_calculator_enabled: true,
        salary_require_approval: true,
        interview_generation_enabled: true,
        interview_require_approval: true,
        model: 'claude-haiku-3-5-20241022',
        max_tokens: 2000
      })
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
    setLoadingSettings(false)
  }

  async function loadUsage() {
    setLoadingUsage(true)
    try {
      const res = await fetch('/api/admin/luxai/usage')
      const data = await res.json()
      setUsage(data)
    } catch (error) {
      console.error('Failed to load usage:', error)
    }
    setLoadingUsage(false)
  }

  async function handleGenerate(type: string, count?: number) {
    if (!confirm(`Generate ${type}? This will use Claude Haiku 3.5 API.`)) return
    
    setGenerating(type)
    try {
      const endpoint = type === 'wikilux-all' ? '/api/luxai/regenerate-wikilux'
        : type === 'article' ? '/api/luxai/generate-article'
        : type === 'signals' ? '/api/luxai/generate-signals'
        : null

      if (!endpoint) {
        alert('Generation endpoint not configured yet')
        return
      }

      const body = type === 'wikilux-all'
        ? { mode: 'all' }
        : { count: count || 5 }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`✓ Generated successfully! ${data.data?.brands_processed || data.count || 1} items processed.`)
        if (activeTab === 'approval') loadQueue()
      } else {
        alert(`✗ Generation failed: ${data.message || data.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert(`✗ Generation failed: Network error. Make sure ANTHROPIC_API_KEY is set in Coolify.`)
    } finally {
      setGenerating(null)
    }
  }

  async function handleGenerateSingleBrand() {
    if (!selectedBrand) return
    const brandName = brandsList.find(b => b.slug === selectedBrand)?.brand_name || selectedBrand
    if (!confirm(`Generate content for ${brandName}? This will use Claude Haiku 3.5 API (~$0.044).`)) return
    
    setGenerating('wikilux-single')
    try {
      const response = await fetch('/api/luxai/regenerate-wikilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'single', brand_slug: selectedBrand }),
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`✓ Content generated for ${brandName}! Check the Approval Queue to review and publish.`)
        setSelectedBrand('')
        if (activeTab === 'approval') loadQueue()
      } else {
        alert(`✗ Generation failed: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      alert(`✗ Generation failed: Network error. Make sure ANTHROPIC_API_KEY is set in Coolify.`)
    } finally {
      setGenerating(null)
    }
  }

  async function handleSaveSettings() {
    setSavingSettings(true)
    try {
      await fetch('/api/admin/luxai/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      alert('Settings saved successfully')
    } catch (error) {
      alert('Failed to save settings')
    }
    setSavingSettings(false)
  }

  async function handleApprove(id: string, type?: string, source?: string) {
    try {
      await fetch('/api/admin/luxai/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, source }),
      })
      setQueue(queue.filter(q => q.id !== id))
      alert('✓ Approved and published')
    } catch (error) {
      alert('Failed to approve')
    }
  }

  async function handleReject(id: string, source?: string) {
    if (!confirm('Reject this item?')) return
    try {
      await fetch('/api/admin/luxai/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, source }),
      })
      setQueue(queue.filter(q => q.id !== id))
      alert('✓ Rejected')
    } catch (error) {
      alert('Failed to reject')
    }
  }

  function getBadgeStyle(contentType: string | null) {
    switch (contentType?.toUpperCase()) {
      case 'TALENT': return 'bg-[#3B82F6] text-white'
      case 'MARKET': return 'bg-[#10B981] text-white'
      case 'BRAND': return 'bg-[#F59E0B] text-white'
      case 'FINANCE': return 'bg-[#8B5CF6] text-white'
      case 'SALARY': return 'bg-[#EC4899] text-white'
      case 'INTERVIEW': return 'bg-[#06B6D4] text-white'
      case 'WIKILUX': return 'bg-[#111] text-white'
      default: return 'bg-[#3B82F6] text-white'
    }
  }

  const filteredQueue = queue.filter(item => {
    if (queueTab === 'all') return true
    if (queueTab === 'signals') return item.type === 'signal'
    if (queueTab === 'salary') return item.type?.includes('salary')
    if (queueTab === 'interview') return item.type === 'interview_detail'
    if (queueTab === 'wikilux') return item.type === 'wikilux' || item.source === 'wikilux'
    return true
  })

  const wikiluxCount = queue.filter(q => q.type === 'wikilux' || q.source === 'wikilux').length

  const tabs = [
    { id: 'generation', label: 'Generation', icon: Sparkles },
    { id: 'approval', label: 'Approval Queue', icon: CheckCircle },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'usage', label: 'Usage & Costs', icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="px-8 py-6">
          <h1 className="text-[32px] font-semibold text-[#111] mb-2">LUXAI</h1>
          <p className="text-sm text-[#666]">AI engine management - Generation, approval, and cost tracking</p>
        </div>
        <div className="px-8 flex gap-8 border-t border-[#e8e8e8]">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-[#111] text-[#111]' : 'border-transparent text-[#666] hover:text-[#111]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'approval' && queue.length > 0 && (
                  <span className="ml-1 bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{queue.length}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        {/* GENERATION TAB */}
        {activeTab === 'generation' && (
          <div className="p-8">
            <div className="max-w-[1200px]">
              <div className="mb-8">
                <h2 className="text-[28px] font-semibold text-[#111] mb-2">AI Generation</h2>
                <p className="text-sm text-[#666]">Generate content using Claude Haiku 3.5 across all platform sections</p>
              </div>

              {/* WikiLux Brands */}
              <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#666]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[#111] mb-1">WikiLux Brands</h3>
                    <p className="text-sm text-[#666] leading-relaxed">
                      Regenerates AI content for luxury brand pages (history, founder, signature products, creative directors, career opportunities)
                    </p>
                  </div>
                </div>

                <div className="bg-[#f5f5f5] rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-[#999] uppercase tracking-wide mb-1">Cost</div>
                      <div className="text-[#111] font-medium">~$0.044 per brand · ~$7.90 for all {brandsList.length} brands</div>
                    </div>
                    <div>
                      <div className="text-[#999] uppercase tracking-wide mb-1">When to Use</div>
                      <div className="text-[#111] font-medium">Monthly refresh or after adding brands</div>
                    </div>
                    <div>
                      <div className="text-[#999] uppercase tracking-wide mb-1">How It Works</div>
                      <div className="text-[#111] font-medium">AI reads brand data → generates content → saves as pending → you approve</div>
                    </div>
                    <div>
                      <div className="text-[#999] uppercase tracking-wide mb-1">Result</div>
                      <div className="text-[#111] font-medium">Content visible on /brands/[brand] pages after approval</div>
                    </div>
                  </div>
                </div>

                {/* Regenerate All */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => handleGenerate('wikilux-all')}
                    disabled={generating !== null}
                    className="px-4 py-2.5 bg-[#111] text-white rounded-md text-sm font-medium hover:bg-[#333] disabled:opacity-50 transition-colors"
                  >
                    {generating === 'wikilux-all' ? 'Regenerating...' : `REGENERATE ALL BRANDS (${brandsList.length})`}
                  </button>
                </div>

                {/* Regenerate Single Brand */}
                <div className="flex gap-3 items-center">
                  <select
                    value={selectedBrand}
                    onChange={e => setSelectedBrand(e.target.value)}
                    className="px-3 py-2.5 bg-white border border-[#e8e8e8] rounded-md text-sm min-w-[280px]"
                  >
                    <option value="">Select brand to regenerate...</option>
                    {brandsList.map(b => (
                      <option key={b.slug} value={b.slug}>
                        {b.brand_name} {b.status === 'approved' ? '✓' : b.status === 'draft' ? '○' : '●'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleGenerateSingleBrand}
                    disabled={!selectedBrand || generating !== null}
                    className="px-4 py-2.5 bg-white border border-[#e8e8e8] text-[#111] rounded-md text-sm font-medium hover:bg-[#f5f5f5] disabled:opacity-50 transition-colors"
                  >
                    {generating === 'wikilux-single' ? 'Generating...' : 'REGENERATE'}
                  </button>
                </div>
                <p className="text-[10px] text-[#999] mt-2">✓ = published · ○ = draft (no content) · ● = pending review</p>
              </div>

              {/* BlogLux Articles */}
              <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#666]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[#111] mb-1">BlogLux Articles</h3>
                    <p className="text-sm text-[#666] leading-relaxed">
                      Generates thought leadership articles about luxury careers, industry trends, brand analysis
                    </p>
                  </div>
                </div>
                <div className="bg-[#f5f5f5] rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div><div className="text-[#999] uppercase tracking-wide mb-1">Cost</div><div className="text-[#111] font-medium">~$0.01 per article</div></div>
                    <div><div className="text-[#999] uppercase tracking-wide mb-1">Topics</div><div className="text-[#111] font-medium">Industry trends, career advice, brand analysis</div></div>
                    <div><div className="text-[#999] uppercase tracking-wide mb-1">How It Works</div><div className="text-[#111] font-medium">AI generates → saves as draft → you review/edit → publish</div></div>
                    <div><div className="text-[#999] uppercase tracking-wide mb-1">Result</div><div className="text-[#111] font-medium">Article appears in Intelligence section</div></div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleGenerate('article')} disabled={generating !== null} className="px-4 py-2.5 bg-[#111] text-white rounded-md text-sm font-medium hover:bg-[#333] disabled:opacity-50 transition-colors">
                    {generating === 'article' ? 'Generating...' : 'GENERATE ARTICLE'}
                  </button>
                  <select className="px-4 py-2.5 bg-white border border-[#e8e8e8] rounded-md text-sm font-medium">
                    <option>Career Trends</option><option>Brand Analysis</option><option>Market Insights</option><option>Hiring Strategy</option>
                  </select>
                </div>
              </div>

              {/* Signals */}
              <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#666]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[#111] mb-1">Signals</h3>
                    <p className="text-sm text-[#666] leading-relaxed">Generates luxury industry news signals</p>
                  </div>
                </div>
                <div className="bg-[#f5f5f5] rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div><div className="text-[#999] uppercase tracking-wide mb-1">Cost</div><div className="text-[#111] font-medium">~$0.02 for 5 signals</div></div>
                    <div><div className="text-[#999] uppercase tracking-wide mb-1">Categories</div><div className="text-[#111] font-medium">TALENT, MARKET, BRAND, FINANCE</div></div>
                    <div><div className="text-[#999] uppercase tracking-wide mb-1">How It Works</div><div className="text-[#111] font-medium">AI generates → you approve → publishes</div></div>
                    <div><div className="text-[#999] uppercase tracking-wide mb-1">Result</div><div className="text-[#111] font-medium">Signals appear on /signals page</div></div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleGenerate('signals', 5)} disabled={generating !== null} className="px-4 py-2.5 bg-[#111] text-white rounded-md text-sm font-medium hover:bg-[#333] disabled:opacity-50 transition-colors">
                    {generating === 'signals' ? 'Generating...' : 'GENERATE SIGNALS (5)'}
                  </button>
                </div>
              </div>

              {/* Salary Intelligence */}
              <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center"><DollarSign className="w-5 h-5 text-[#666]" /></div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[#111] mb-1">Salary Intelligence</h3>
                    <p className="text-sm text-[#666] leading-relaxed">On-demand salary benchmarks when users contribute data</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 px-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                  <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#10B981]"></div><span className="text-sm font-medium text-[#065F46]">ON-DEMAND ONLY</span></div>
                  <span className="text-xs text-[#065F46]">Triggered by user requests</span>
                </div>
              </div>

              {/* Interview Intelligence */}
              <div className="bg-white border border-[#e8e8e8] rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center"><Briefcase className="w-5 h-5 text-[#666]" /></div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[#111] mb-1">Interview Intelligence</h3>
                    <p className="text-sm text-[#666] leading-relaxed">Expands interview data when users contribute</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 px-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                  <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#10B981]"></div><span className="text-sm font-medium text-[#065F46]">ON-DEMAND ONLY</span></div>
                  <span className="text-xs text-[#065F46]">Triggered by user contributions</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPROVAL QUEUE TAB */}
        {activeTab === 'approval' && (
          <div className="p-8">
            <div className="max-w-[1200px]">
              <div className="mb-8">
                <h2 className="text-[28px] font-semibold text-[#111] mb-2">Approval Queue</h2>
                <p className="text-sm text-[#666]">Review AI-generated content before publishing</p>
              </div>
              <div className="flex gap-0 border-b border-[#e8e8e8] mb-6">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'wikilux', label: 'WikiLux' },
                  { id: 'signals', label: 'Signals' },
                  { id: 'salary', label: 'Salary' },
                  { id: 'interview', label: 'Interview' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setQueueTab(tab.id)}
                    className={`pb-3 mr-8 text-sm relative transition-colors ${queueTab === tab.id ? 'text-[#111] font-medium' : 'text-[#666]'}`}>
                    {tab.label}
                    <span className="text-xs text-[#999] ml-1.5">
                      {tab.id === 'all' ? queue.length : tab.id === 'wikilux' ? wikiluxCount : tab.id === 'signals' ? queue.filter(q => q.type === 'signal').length : tab.id === 'salary' ? queue.filter(q => q.type?.includes('salary')).length : queue.filter(q => q.type === 'interview_detail').length}
                    </span>
                    {queueTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111]" />}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-[#e8e8e8] rounded-lg p-5"><div className="text-xs text-[#666] uppercase tracking-wide mb-2">Pending Review</div><div className="text-[32px] font-semibold text-[#111]">{queue.length}</div></div>
                <div className="bg-white border border-[#e8e8e8] rounded-lg p-5"><div className="text-xs text-[#666] uppercase tracking-wide mb-2">WikiLux Pending</div><div className="text-[32px] font-semibold text-[#111]">{wikiluxCount}</div></div>
                <div className="bg-white border border-[#e8e8e8] rounded-lg p-5"><div className="text-xs text-[#666] uppercase tracking-wide mb-2">Signals Pending</div><div className="text-[32px] font-semibold text-[#111]">{queue.filter(q => q.type === 'signal').length}</div></div>
                <div className="bg-white border border-[#e8e8e8] rounded-lg p-5"><div className="text-xs text-[#666] uppercase tracking-wide mb-2">Other Pending</div><div className="text-[32px] font-semibold text-[#111]">{queue.filter(q => q.type !== 'signal' && q.type !== 'wikilux').length}</div></div>
              </div>
              {loadingQueue ? (
                <div className="flex items-center justify-center p-12"><div className="w-5 h-5 border-2 border-[#e8e8e8] border-t-[#111] rounded-full animate-spin" /></div>
              ) : filteredQueue.length === 0 ? (
                <div className="bg-white border border-[#e8e8e8] rounded-lg p-12 text-center">
                  <p className="text-[#999] text-sm mb-4">No pending items in queue</p>
                  <p className="text-xs text-[#666]">Generate content using the Generation tab</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQueue.map(item => (
                    <div key={item.id} className="bg-white border border-[#e8e8e8] rounded-lg p-5 hover:border-[#ccc] transition-colors">
                      <div className="mb-3 flex items-center gap-3">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wide ${getBadgeStyle(item.content_type)}`}>
                          {item.content_type || 'SIGNAL'}
                        </span>
                        {item.source === 'wikilux' && item.content?.slug && (
                          <span className="text-xs text-[#999]">/{item.content.slug}</span>
                        )}
                      </div>
                      <h3 className="text-base font-medium text-[#111] mb-1">{item.title}</h3>
                      <p className="text-xs text-[#999] mb-4">
                        {item.source === 'wikilux' ? 'Edited' : 'Generated'} {new Date(item.generated_at || item.created_at).toLocaleString()}
                        {item.source === 'wikilux' ? ' via WikiLux Editor' : ' via LUXAI'}
                      </p>
                      <div className="text-sm text-[#444] mb-4 leading-relaxed">
                        {typeof item.content === 'string'
                          ? item.content
                          : item.content?.content
                            ? (typeof item.content.content === 'string' ? item.content.content.substring(0, 300) : `${Object.keys(item.content.content).length} content sections`)
                            : JSON.stringify(item.content).substring(0, 300)
                        }
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(item.id, item.type, item.source)} className="bg-[#10B981] text-white text-[13px] font-medium px-4 py-2 rounded-md hover:bg-[#059669] transition-colors">Approve & Publish</button>
                        {item.source === 'wikilux' && item.content?.slug && (
                          <button onClick={() => router.push(`/admin/wikilux/edit/${item.content.slug}`)} className="bg-white border border-[#e8e8e8] text-[#111] text-[13px] font-medium px-4 py-2 rounded-md hover:bg-[#f5f5f5] transition-colors">Edit in WikiLux</button>
                        )}
                        <button onClick={() => handleReject(item.id, item.source)} className="bg-white border border-[#e8e8e8] text-[#EF4444] text-[13px] font-medium px-4 py-2 rounded-md hover:bg-[#FEE2E2] transition-colors">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && settings && (
          <div className="p-8">
            <div className="max-w-[900px]">
              <div className="mb-8">
                <h2 className="text-[28px] font-semibold text-[#111] mb-2">LUXAI Settings</h2>
                <p className="text-sm text-[#666]">Configure AI generation parameters and automation rules</p>
              </div>

              {[
                { title: 'Signal Generation', items: [
                  { label: 'Auto-generate daily signals', desc: 'LUXAI will generate 5-8 signals per day', key: 'signal_generation_enabled' },
                ]},
                { title: 'Salary Intelligence', items: [
                  { label: 'Enable benchmark tool', desc: 'Allow LUXAI to generate salary benchmarks', key: 'salary_benchmark_enabled' },
                  { label: 'Require approval', desc: 'All salary outputs go through approval queue', key: 'salary_require_approval' },
                ]},
                { title: 'Interview Intelligence', items: [
                  { label: 'Generate interview details', desc: 'LUXAI expands basic interview data', key: 'interview_generation_enabled' },
                  { label: 'Require approval', desc: 'All interview details go through queue', key: 'interview_require_approval' },
                ]},
              ].map(section => (
                <div key={section.title} className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-5">
                  <h3 className="text-base font-semibold text-[#111] mb-4">{section.title}</h3>
                  {section.items.map((item, i) => (
                    <div key={item.key} className={`flex items-center justify-between py-3 ${i < section.items.length - 1 ? 'border-b border-[#f5f5f5]' : ''}`}>
                      <div>
                        <div className="text-sm font-medium text-[#111] mb-1">{item.label}</div>
                        <div className="text-xs text-[#666]">{item.desc}</div>
                      </div>
                      <button
                        onClick={() => setSettings({...settings, [item.key]: !settings[item.key]})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[item.key] ? 'bg-[#10B981]' : 'bg-[#e8e8e8]'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}

              <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-8">
                <h3 className="text-base font-semibold text-[#111] mb-4">AI Model</h3>
                <div className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
                  <div><div className="text-sm font-medium text-[#111] mb-1">Primary model</div><div className="text-xs text-[#666]">Claude Haiku 3.5 (recommended for cost)</div></div>
                  <select value={settings.model} onChange={(e) => setSettings({...settings, model: e.target.value})} className="px-2.5 py-1.5 border border-[#e8e8e8] rounded text-sm">
                    <option value="claude-haiku-3-5-20241022">Claude Haiku 3.5</option>
                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div><div className="text-sm font-medium text-[#111] mb-1">Max tokens per request</div><div className="text-xs text-[#666]">Cost control limit</div></div>
                  <input type="number" value={settings.max_tokens} onChange={(e) => setSettings({...settings, max_tokens: parseInt(e.target.value)})} className="w-24 px-2.5 py-1.5 border border-[#e8e8e8] rounded text-sm" min="100" max="10000" />
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSaveSettings} disabled={savingSettings} className="px-6 py-2.5 bg-[#111] text-white rounded-md text-sm font-medium hover:bg-[#333] disabled:opacity-50 transition-colors">
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* USAGE TAB */}
        {activeTab === 'usage' && usage && (
          <div className="p-8">
            <div className="max-w-[1200px]">
              <div className="mb-8">
                <h2 className="text-[28px] font-semibold text-[#111] mb-2">Usage & Costs</h2>
                <p className="text-sm text-[#666]">LUXAI API usage and spending overview</p>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-[#e8e8e8] rounded-lg p-5"><div className="text-xs text-[#666] uppercase tracking-wide mb-2">This Month</div><div className="text-[32px] font-semibold text-[#111] mb-1">${usage.stats.this_month.toFixed(2)}</div><div className="text-[13px] font-medium text-[#10B981]">{usage.stats.this_month_requests} requests</div></div>
                <div className="bg-white border border-[#e8e8e8] rounded-lg p-5"><div className="text-xs text-[#666] uppercase tracking-wide mb-2">Last Month</div><div className="text-[32px] font-semibold text-[#111] mb-1">${usage.stats.last_month.toFixed(2)}</div><div className="text-[13px] font-medium text-[#10B981]">{usage.stats.last_month_requests} requests</div></div>
                <div className="bg-white border border-[#e8e8e8] rounded-lg p-5"><div className="text-xs text-[#666] uppercase tracking-wide mb-2">Avg Cost/Request</div><div className="text-[32px] font-semibold text-[#111] mb-1">${usage.stats.avg_cost.toFixed(4)}</div><div className="text-[13px] font-medium text-[#10B981]">Claude Haiku</div></div>
                <div className="bg-white border border-[#e8e8e8] rounded-lg p-5"><div className="text-xs text-[#666] uppercase tracking-wide mb-2">Projected (Month)</div><div className="text-[32px] font-semibold text-[#111] mb-1">${(usage.stats.this_month * 1.06).toFixed(2)}</div><div className="text-[13px] font-medium text-[#10B981]">+5.7%</div></div>
              </div>
              <div className="bg-white border border-[#e8e8e8] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-[#e8e8e8]">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#666] uppercase tracking-wide">Timestamp</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#666] uppercase tracking-wide">Type</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#666] uppercase tracking-wide">Model</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#666] uppercase tracking-wide">Tokens</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#666] uppercase tracking-wide">Cost</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#666] uppercase tracking-wide">Status</th>
                  </tr></thead>
                  <tbody>
                    {usage.history.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-[#999]">No requests yet</td></tr>
                    ) : usage.history.map((item: any) => (
                      <tr key={item.id} className="border-b border-[#e8e8e8] hover:bg-[#fafafa] transition-colors">
                        <td className="px-6 py-4 text-sm text-[#666]">{new Date(item.created_at).toLocaleString('en-US', { year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false })}</td>
                        <td className="px-6 py-4 text-sm text-[#111]">{item.type}</td>
                        <td className="px-6 py-4 text-sm text-[#666]">Haiku 3.5</td>
                        <td className="px-6 py-4 text-sm text-[#666]">{item.tokens_used?.toLocaleString() || '-'}</td>
                        <td className="px-6 py-4 text-sm text-[#111] font-medium">${item.cost_usd?.toFixed(4) || '0.0000'}</td>
                        <td className="px-6 py-4 text-sm">
                          {item.status === 'success' ? <span className="inline-block bg-[#D1FAE5] text-[#065F46] text-xs font-semibold px-2 py-1 rounded">Success</span> : <span className="inline-block bg-[#FEE2E2] text-[#991B1B] text-xs font-semibold px-2 py-1 rounded">Error</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
