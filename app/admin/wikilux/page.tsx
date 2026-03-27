'use client'

import { useState, useEffect } from 'react'
import { useRequireAdmin } from '@/lib/auth-hooks'
import { BRANDS } from '@/lib/wikilux-brands'

interface WikiStats {
  total_brands: number
  generated: number
  with_insights: number
  with_editorial: number
  avg_insights: number
  top_brands: { brand_name: string; slug: string; count: number }[]
  stale_brands: { slug: string; brand_name: string; updated_at: string }[]
  last_regen: string | null
}

export default function AdminWikiLuxPage() {
  useRequireAdmin()

  const [stats, setStats] = useState<WikiStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [regenResult, setRegenResult] = useState<string | null>(null)
  const [singleRegen, setSingleRegen] = useState('')
  const [singleRegening, setSingleRegening] = useState(false)

  // Editorial note state
  const [editSlug, setEditSlug] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)

  // Search state
  const [brandSearch, setBrandSearch] = useState('')

  // Seed state
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/wikilux-stats')
      if (res.ok) {
        setStats(await res.json())
      }
    } catch {}
    setLoading(false)
  }

  const handleRegenAll = async () => {
    if (!confirm('This will regenerate ALL brand pages using the Claude API. This may take several minutes and incur API costs. Continue?')) return
    setRegenerating(true)
    setRegenResult(null)
    try {
      const res = await fetch('/api/wikilux/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      const data = await res.json()
      setRegenResult(`Regenerated ${data.regenerated} brands. ${data.errors?.length || 0} errors.`)
      fetchStats()
    } catch {
      setRegenResult('Failed to regenerate.')
    }
    setRegenerating(false)
  }

  const handleRegenSingle = async () => {
    if (!singleRegen) return
    setSingleRegening(true)
    try {
      const res = await fetch('/api/wikilux/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: singleRegen }),
      })
      const data = await res.json()
      setRegenResult(`Regenerated: ${singleRegen}. ${data.errors?.length ? data.errors.join(', ') : 'Success.'}`)
      fetchStats()
    } catch {
      setRegenResult('Failed.')
    }
    setSingleRegening(false)
  }

  const handleSeed = async () => {
    if (!confirm('This will generate rich content for all brands that don\'t have it yet. This may take a while and incur API costs. Continue?')) return
    setSeeding(true)
    setSeedResult(null)
    try {
      const res = await fetch('/api/wikilux/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      setSeedResult(`Total: ${data.total_brands} | Already seeded: ${data.already_seeded} | Newly generated: ${data.newly_generated} | Remaining: ${data.remaining} | Errors: ${data.errors?.length || 0}`)
      fetchStats()
    } catch {
      setSeedResult('Seed request failed.')
    }
    setSeeding(false)
  }

  const handleSaveEditorial = async () => {
    if (!editSlug) return
    setEditSaving(true)
    setEditSuccess(false)
    try {
      await fetch('/api/admin/wikilux-editorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: editSlug, editorial_notes: editNote }),
      })
      setEditSuccess(true)
    } catch {}
    setEditSaving(false)
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="px-6 py-5 lg:px-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-[#1a1a1a]">WikiLux Management</h1>
        <p className="text-sm text-[#484f58] mt-0.5">Brand content generation and editorial tools</p>
      </div>

      {/* Brand search */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search brands..."
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
          className="w-full border border-[#e8e2d8] rounded-sm pl-3 pr-3 py-2 text-sm bg-[#161b22] focus:outline-none focus:border-[#a58e28] transition-colors"
        />
      </div>

      {loading ? (
        <div className="text-center py-16"><div className="inline-block w-8 h-8 border-2 border-[#e8e2d8] border-t-[#a58e28] rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="jl-card text-center">
              <div className="jl-serif text-2xl text-[#a58e28]">{BRANDS.length}</div>
              <div className="jl-overline mt-1">Total Brands</div>
            </div>
            <div className="jl-card text-center">
              <div className="jl-serif text-2xl text-[#1a1a1a]">{stats?.generated || 0}</div>
              <div className="jl-overline mt-1">Generated</div>
            </div>
            <div className="jl-card text-center">
              <div className="jl-serif text-2xl text-[#1a1a1a]">{stats?.with_insights || 0}</div>
              <div className="jl-overline mt-1">With Insights</div>
            </div>
            <div className="jl-card text-center">
              <div className="jl-serif text-2xl text-[#1a1a1a]">{stats?.with_editorial || 0}</div>
              <div className="jl-overline mt-1">With Editorial</div>
            </div>
          </div>

          {/* REGENERATION */}
          <div className="mb-8">
            <div className="jl-section-label"><span>Regeneration</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="jl-card">
                <h3 className="font-sans text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">Regenerate All Brands</h3>
                <p className="text-xs text-[#888] mb-3">Re-generate all {BRANDS.length} brand pages with fresh AI content. This takes several minutes.</p>
                {stats?.last_regen && <p className="text-[0.65rem] text-[#aaa] mb-3">Last full regeneration: {new Date(stats.last_regen).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                <button onClick={handleRegenAll} disabled={regenerating} className="jl-btn jl-btn-primary text-xs">
                  {regenerating ? 'Regenerating...' : 'Regenerate All'}
                </button>
              </div>
              <div className="jl-card">
                <h3 className="font-sans text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">Regenerate Single Brand</h3>
                <div className="flex gap-2">
                  <select value={singleRegen} onChange={(e) => setSingleRegen(e.target.value)} className="jl-select flex-1 text-xs">
                    <option value="">Select brand</option>
                    {BRANDS.filter(b => !brandSearch.trim() || b.name.toLowerCase().includes(brandSearch.toLowerCase())).map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                  </select>
                  <button onClick={handleRegenSingle} disabled={singleRegening || !singleRegen} className="jl-btn jl-btn-outline text-xs">
                    {singleRegening ? '...' : 'Regenerate'}
                  </button>
                </div>
              </div>
            </div>
            {regenResult && <p className="text-xs text-[#a58e28] mt-3">{regenResult}</p>}
          </div>

          {/* SEED BRANDS */}
          <div className="mb-8">
            <div className="jl-section-label"><span>Seed WikiLux Brands</span></div>
            <div className="jl-card">
              <h3 className="font-sans text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">Fill Missing Content</h3>
              <p className="text-xs text-[#888] mb-3">
                Generate rich editorial content (History, Founder, Signature Products, Creative Directors, Brand DNA, Careers) for all {BRANDS.length} brands that don&rsquo;t have it yet. Safe to run multiple times — only fills gaps.
              </p>
              <button onClick={handleSeed} disabled={seeding} className="jl-btn jl-btn-gold text-xs">
                {seeding ? 'Seeding in progress...' : `Seed WikiLux Brands (${BRANDS.length})`}
              </button>
              {seedResult && <p className="text-xs text-[#a58e28] mt-3 whitespace-pre-line">{seedResult}</p>}
            </div>
          </div>

          {/* EDITORIAL NOTES */}
          <div className="mb-8">
            <div className="jl-section-label"><span>Editorial Notes</span></div>
            <div className="jl-card">
              <p className="text-xs text-[#888] mb-3">Add editorial notes to any brand page. These appear as a highlighted &ldquo;Editor&rsquo;s Note&rdquo; section on the public page.</p>
              <div className="space-y-3">
                <div>
                  <label className="jl-label">Brand</label>
                  <select value={editSlug} onChange={(e) => { setEditSlug(e.target.value); setEditSuccess(false); setEditNote('') }} className="jl-select w-full text-xs">
                    <option value="">Select brand</option>
                    {BRANDS.filter(b => !brandSearch.trim() || b.name.toLowerCase().includes(brandSearch.toLowerCase())).map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                  </select>
                </div>
                {editSlug && (
                  <>
                    <div>
                      <label className="jl-label">Editorial Note</label>
                      <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} className="jl-input w-full min-h-[120px] resize-y" placeholder="Add editorial commentary, corrections, or insider knowledge..." />
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={handleSaveEditorial} disabled={editSaving} className="jl-btn jl-btn-primary text-xs">
                        {editSaving ? 'Saving...' : 'Save Note'}
                      </button>
                      {editSuccess && <span className="text-xs text-[#a58e28]">Saved</span>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* TOP CONTRIBUTED BRANDS */}
          {stats?.top_brands && stats.top_brands.length > 0 && (
            <div className="mb-8">
              <div className="jl-section-label"><span>Most Contributed Brands</span></div>
              <div className="jl-card overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-[#e8e2d8]">
                    <th className="text-left py-2 font-semibold text-[#888] uppercase tracking-wider">Brand</th>
                    <th className="text-right py-2 font-semibold text-[#888] uppercase tracking-wider">Insights</th>
                  </tr></thead>
                  <tbody>{stats.top_brands.map((b) => (
                    <tr key={b.slug} className="border-b border-[#f0ece4]">
                      <td className="py-2 text-[#1a1a1a]">{b.brand_name}</td>
                      <td className="py-2 text-right text-[#a58e28] font-medium">{b.count}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* STALE CONTENT */}
          {stats?.stale_brands && stats.stale_brands.length > 0 && (
            <div>
              <div className="jl-section-label"><span>Needs Attention (60+ days old)</span></div>
              <div className="flex flex-wrap gap-2">
                {stats.stale_brands.map((b) => (
                  <span key={b.slug} className="jl-badge-outline text-[0.6rem]">{b.brand_name}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  )
}
