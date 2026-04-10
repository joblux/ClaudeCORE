'use client'

import { useState, useEffect, useCallback } from 'react'

interface HealthStats {
  brands_total: number; brands_live: number; brands_empty: number
  signals: number; articles: number; salary_brands: number
  interviews: number; events: number; media: number
  cost_month: number; requests_month: number
}

interface BrandOption {
  slug: string; brand_name: string; status: string
}

export default function LUXAICommandCenter() {
  const [health, setHealth] = useState<HealthStats | null>(null)
  const [brands, setBrands] = useState<BrandOption[]>([])
  const [usage, setUsage] = useState<any>(null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Selected values for dropdowns
  const [selBrand, setSelBrand] = useState('')
  const [selSalaryBrand, setSelSalaryBrand] = useState('')
  const [selInterviewBrand, setSelInterviewBrand] = useState('')
  const [selLibraryBrand, setSelLibraryBrand] = useState('')
  const [selArticleTopic, setSelArticleTopic] = useState('career-trends')
  const [selReportType, setSelReportType] = useState('salary')
  const [selEventSector, setSelEventSector] = useState('')
  const [newBrandName, setNewBrandName] = useState('')
  const [metadataResults, setMetadataResults] = useState<{
    attempted: number
    succeeded: number
    failed: number
    results: Array<{ slug: string; brand_name: string; success: boolean; error?: string; updated?: Record<string, string> }>
  } | null>(null)
  const [metadataIncomplete, setMetadataIncomplete] = useState<number | null>(null)
  const [salarySeedRemaining, setSalarySeedRemaining] = useState<number | null>(null)
  const [salarySeedLast, setSalarySeedLast] = useState<{ brand_name: string; records_valid: number } | null>(null)

  const loadMetadataCount = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/luxai/fill-brand-metadata', { cache: 'no-store' })
      const d = await res.json()
      setMetadataIncomplete(typeof d.incomplete === 'number' ? d.incomplete : 0)
    } catch { /* silent */ }
  }, [])

  const loadSalarySeedCount = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/luxai/seed-brand-salaries', { cache: 'no-store' })
      const d = await res.json()
      setSalarySeedRemaining(typeof d.remaining === 'number' ? d.remaining : 0)
    } catch { /* silent */ }
  }, [])

  // Autopilot state
  const [autopilot, setAutopilot] = useState<Record<string, any>>({})

  const loadHealth = useCallback(async () => {
    try {
      const [usageRes, statsRes] = await Promise.all([
        fetch('/api/admin/luxai/usage'),
        fetch('/api/brands/stats', { cache: 'no-store' }),
      ])
      const d = await usageRes.json()
      const brandStats = await statsRes.json().catch(() => ({ total: 0, published: 0, empty: 0 }))
      setHealth({
        brands_total: brandStats.total || 0,
        brands_live: brandStats.published || 0,
        brands_empty: brandStats.empty || 0,
        signals: d.stats?.signals || 0,
        articles: d.stats?.articles || 0,
        salary_brands: d.stats?.salary_brands || 0,
        interviews: d.stats?.interviews || 0,
        events: d.stats?.events || 0,
        media: d.stats?.media || 0,
        cost_month: d.stats?.this_month || 0,
        requests_month: d.stats?.this_month_requests || 0,
      })
      setUsage(d)
    } catch { /* silent */ }
  }, [])

  const loadBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/wikilux/brands-list')
      const d = await res.json()
      setBrands(d.brands || [])
    } catch { /* silent */ }
  }, [])

  const loadAutopilot = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/luxai/settings')
      const d = await res.json()
      const s = d.settings || {}
      setAutopilot({
        signals: { enabled: s.signal_generation_enabled || false, frequency: 'daily', count: s.signal_daily_target || 5, hour: 8 },
        articles: { enabled: false, frequency: 'weekly', count: 1, hour: 9 },
        brand_refresh: { enabled: false, frequency: 'quarterly', count: 0, hour: 3 },
      })
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    loadHealth()
    loadBrands()
    loadAutopilot()
    loadMetadataCount()
    loadSalarySeedCount()
  }, [loadHealth, loadBrands, loadAutopilot, loadMetadataCount, loadSalarySeedCount])

  function flash(type: 'success' | 'error', msg: string) {
    setResult({ type, msg })
    setTimeout(() => setResult(null), 5000)
  }

  async function callEndpoint(id: string, endpoint: string, body: any, successMsg?: string) {
    if (generating) return
    setGenerating(id)
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await res.json()
      if (d.success) {
        flash('success', d.message || successMsg || 'Done')
        loadHealth()
        loadMetadataCount()
      } else {
        flash('error', d.message || 'Generation failed')
      }
    } catch (e: any) {
      flash('error', e.message || 'Network error')
    } finally {
      setGenerating(null)
    }
  }

  async function saveAutopilot(key: string, updates: any) {
    const current = autopilot[key] || {}
    const merged = { ...current, ...updates }
    setAutopilot(a => ({ ...a, [key]: merged }))
    try {
      await fetch('/api/luxai/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, ...merged })
      })
    } catch { /* silent */ }
  }

  const approvedBrands = brands.filter(b => b.status === 'approved')

  // Styles
  const card = 'bg-white border border-[#e8e8e8] rounded-lg mb-3 overflow-hidden'
  const cardH = 'flex items-center gap-2.5 px-4 py-3 border-b border-[#f0f0f0]'
  const icon = (bg: string) => `w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white ${bg}`
  const badge = (cls: string) => `inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`
  const body = 'px-4 py-3'
  const row = 'flex items-center gap-2 flex-wrap mb-2'
  const sel = 'px-2.5 py-1.5 border border-[#e8e8e8] rounded text-[11px] bg-white text-[#111]'
  const btnB = 'px-3 py-1.5 bg-[#111] text-white rounded text-[11px] font-semibold hover:bg-[#333] disabled:opacity-40 transition-colors'
  const btnO = 'px-3 py-1.5 bg-white border border-[#e8e8e8] text-[#111] rounded text-[11px] font-semibold hover:bg-[#f5f5f5] disabled:opacity-40 transition-colors'
  const info = 'text-[10px] text-[#999] mt-1'
  const flowBar = 'text-[10px] text-[#888] px-4 py-2 bg-[#FAFAFA] border-t border-[#f0f0f0]'

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] px-8 py-5">
        <h1 className="text-[26px] font-semibold text-[#111]">LUXAI command center</h1>
        <p className="text-[13px] text-[#666]">AI content engine | generate, schedule, approve, publish</p>
      </div>

      {/* Flash message */}
      {result && (
        <div className={`mx-8 mt-4 px-4 py-2.5 rounded-lg text-[13px] font-medium ${result.type === 'success' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
          {result.msg}
        </div>
      )}

      <div className="px-8 pt-5 pb-10">
        {/* Health dashboard */}
        <div className="grid grid-cols-6 gap-3 mb-5">
          {[
            { l: 'Brands live', v: health?.brands_live ?? '—', s: `${health?.brands_empty ?? 0} empty`, c: (health?.brands_empty || 0) > 50 ? 'text-[#EF4444]' : 'text-[#10B981]' },
            { l: 'Signals', v: health?.signals ?? '—', s: 'Published', c: 'text-[#10B981]' },
            { l: 'Articles', v: health?.articles ?? '—', s: 'Published', c: 'text-[#10B981]' },
            { l: 'Salary brands', v: health?.salary_brands ?? '—', s: (health?.salary_brands || 0) === 0 ? 'None yet' : 'With data', c: (health?.salary_brands || 0) === 0 ? 'text-[#EF4444]' : 'text-[#10B981]' },
            { l: 'Interviews', v: health?.interviews ?? '—', s: 'Experiences', c: 'text-[#10B981]' },
            { l: 'Cost/month', v: `$${(health?.cost_month || 0).toFixed(2)}`, s: 'Haiku 4.5', c: 'text-[#10B981]' },
          ].map((h, i) => (
            <div key={i} className="bg-white border border-[#e8e8e8] rounded-lg px-4 py-3">
              <div className="text-[9px] text-[#888] uppercase tracking-wide">{h.l}</div>
              <div className="text-[22px] font-semibold text-[#111] mt-0.5">{h.v}</div>
              <div className={`text-[10px] ${h.c}`}>{h.s}</div>
            </div>
          ))}
        </div>

        {/* Card Intelligence enrichment */}
        <div className="bg-white border border-[#e8e8e8] rounded-lg px-4 py-3 mb-5 flex items-center gap-3">
          <button className={btnB} disabled={!!generating} onClick={async () => {
            if (generating) return
            setGenerating('card-intel')
            try {
              const res = await fetch('/api/luxai/enrich-card-intelligence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
              const d = await res.json()
              if (d.success) {
                flash('success', `${d.written} written · ${d.skipped} skipped`)
                loadHealth()
              } else {
                flash('error', d.message || 'Enrichment failed')
              }
            } catch (e: any) {
              flash('error', e.message || 'Network error')
            } finally {
              setGenerating(null)
            }
          }}>
            {generating === 'card-intel' ? 'Enriching...' : 'Enrich Card Intelligence'}
          </button>
          <span className="text-[10px] text-[#888]">Run Haiku across all published brands to generate card markers from latest signals</span>
        </div>

        {/* Content pipelines */}
        <div>
          <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-2">Content pipelines</div>

            {/* 1. Brand pages */}
            <div className={card}>
              <div className={cardH}>
                <div className={icon('bg-[#111]')}>W</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#111]">Brand pages</div>
                  <div className="text-[10px] text-[#888]">Encyclopedia | overview, culture, career paths, founder, values, leadership</div>
                </div>
                <span className={badge('bg-[#D1FAE5] text-[#065F46]')}>{health?.brands_live || 0} live</span>
              </div>
              <div className={body}>
                <div className={row}>
                  <select className={`${sel} min-w-[180px]`} value={selBrand} onChange={e => setSelBrand(e.target.value)}>
                    <option value="">Select brand...</option>
                    {brands.map(b => <option key={b.slug} value={b.slug}>{b.brand_name} {b.status === 'approved' ? '✓' : '○'}</option>)}
                  </select>
                  <button className={btnB} disabled={!selBrand || !!generating} onClick={() => callEndpoint('wikilux-single', '/api/luxai/regenerate-wikilux', { mode: 'single', brand_slug: selBrand })}>
                    {generating === 'wikilux-single' ? 'Generating...' : 'Generate'}
                  </button>
                  <button className={btnO} disabled={!!generating} onClick={() => callEndpoint('wikilux-all', '/api/luxai/regenerate-wikilux', { mode: 'all' })}>
                    {generating === 'wikilux-all' ? 'Running...' : `Regen all (${health?.brands_total || 0})`}
                  </button>
                  <button className={btnO} disabled={!!generating || (health?.brands_empty || 0) === 0} onClick={() => callEndpoint('wikilux-drafts', '/api/luxai/bulk-regenerate-wikilux', {})}>
                    {generating === 'wikilux-drafts' ? 'Regenerating drafts...' : `Regen all drafts (${health?.brands_empty || 0} empty)`}
                  </button>
                </div>
                <div className={row}>
                  <input type="text" placeholder="New brand name..." value={newBrandName} onChange={e => setNewBrandName(e.target.value)} className={`${sel} min-w-[180px]`} />
                  <button className={btnO} disabled={!newBrandName.trim() || !!generating} onClick={() => { callEndpoint('add-brand', '/api/admin/luxai/add-brand', { brand_name: newBrandName }); setNewBrandName('') }}>
                    {generating === 'add-brand' ? 'Adding...' : '+ Add new brand'}
                  </button>
                </div>
                <div className={row}>
                  <button
                    className={btnO}
                    disabled={!!generating || metadataIncomplete === 0}
                    onClick={async () => {
                      if (generating) return
                      setGenerating('fill-metadata')
                      setMetadataResults(null)
                      try {
                        const res = await fetch('/api/admin/luxai/fill-brand-metadata', { method: 'POST' })
                        const d = await res.json()
                        if (d.success) {
                          setMetadataResults({
                            attempted: d.attempted || 0,
                            succeeded: d.succeeded || 0,
                            failed: d.failed || 0,
                            results: d.results || [],
                          })
                          flash('success', d.message || 'Metadata fill complete')
                          loadHealth()
                          loadMetadataCount()
                        } else {
                          flash('error', d.message || 'Metadata fill failed')
                        }
                      } catch (e: any) {
                        flash('error', e?.message || 'Network error')
                      } finally {
                        setGenerating(null)
                      }
                    }}
                  >
                    {generating === 'fill-metadata'
                      ? 'Filling metadata...'
                      : metadataIncomplete === 0
                        ? 'All brand metadata complete ✓'
                        : `Fill brand metadata (${metadataIncomplete ?? '—'} remaining)`}
                  </button>
                  <span className="text-[10px] text-[#888]">Sector · Headquarters · Description (only fills nulls)</span>
                </div>
                <div className={row}>
                  <button
                    className={btnO}
                    disabled={!!generating || salarySeedRemaining === 0}
                    onClick={async () => {
                      if (generating) return
                      setGenerating('seed-salaries')
                      setSalarySeedLast(null)
                      try {
                        const res = await fetch('/api/admin/luxai/seed-brand-salaries', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({}),
                        })
                        const d = await res.json()
                        if (d.success) {
                          setSalarySeedLast({ brand_name: d.brand_name, records_valid: d.records_valid })
                          flash('success', `${d.brand_name}: ${d.records_valid} records queued (${d.records_skipped} skipped)`)
                          loadSalarySeedCount()
                        } else {
                          flash('error', d.message || 'Salary seed failed')
                        }
                      } catch (e: any) {
                        flash('error', e?.message || 'Network error')
                      } finally {
                        setGenerating(null)
                      }
                    }}
                  >
                    {generating === 'seed-salaries'
                      ? 'Seeding...'
                      : salarySeedRemaining === 0
                        ? 'All brands have salary data ✓'
                        : `Seed brand salaries (${salarySeedRemaining ?? '—'} remaining)`}
                  </button>
                  {salarySeedLast && (
                    <span className="text-[10px] text-[#888]">
                      Last: <b className="text-[#111]">{salarySeedLast.brand_name}</b> — {salarySeedLast.records_valid} queued
                    </span>
                  )}
                </div>
                {metadataResults && (
                  <div className="mt-2 pt-2 border-t border-[#f5f5f5]">
                    <div className="text-[10px] text-[#666] mb-1.5">
                      Attempted: <b className="text-[#111]">{metadataResults.attempted}</b> ·{' '}
                      <span className="text-[#10B981]">✓ {metadataResults.succeeded}</span> ·{' '}
                      <span className="text-[#EF4444]">✗ {metadataResults.failed}</span>
                    </div>
                    <div className="max-h-[180px] overflow-auto space-y-1">
                      {metadataResults.results.map((r) => (
                        <div key={r.slug} className="text-[10px] flex items-start gap-1.5">
                          <span className={r.success ? 'text-[#10B981]' : 'text-[#EF4444]'}>{r.success ? '✓' : '✗'}</span>
                          <span className="font-semibold text-[#111]">{r.brand_name}</span>
                          <span className="text-[#888]">
                            {r.success
                              ? `· ${Object.keys(r.updated || {}).join(', ')}`
                              : `· ${r.error}`}
                          </span>
                        </div>
                      ))}
                      {metadataResults.results.length === 0 && (
                        <div className="text-[10px] text-[#888]">No approved brands have missing sector / headquarters / description.</div>
                      )}
                    </div>
                  </div>
                )}
                <p className={info}>✓ = live · ○ = empty · ~$0.02/brand</p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f5f5f5] text-[10px] text-[#666]">
                  <button onClick={() => saveAutopilot('brand_refresh', { enabled: !autopilot.brand_refresh?.enabled })} className={`w-6 h-3.5 rounded-full relative cursor-pointer transition-colors ${autopilot.brand_refresh?.enabled ? 'bg-[#10B981]' : 'bg-[#e8e8e8]'}`}>
                    <span className={`absolute top-[2px] w-[10px] h-[10px] bg-white rounded-full transition-all ${autopilot.brand_refresh?.enabled ? 'left-[14px]' : 'left-[2px]'}`} />
                  </button>
                  <span>Auto-refresh</span>
                  <select className={sel} value={autopilot.brand_refresh?.frequency || 'quarterly'} onChange={e => saveAutopilot('brand_refresh', { frequency: e.target.value })}>
                    <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
              <div className={flowBar}><b className="text-[#10B981]">→</b> Brand page: Overview, Culture, Career paths tabs</div>
            </div>

            {/* 2. Salary intelligence */}
            <div className={card}>
              <div className={cardH}>
                <div className={icon('bg-[#3B82F6]')}>$</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#111]">Salary intelligence</div>
                  <div className="text-[10px] text-[#888]">10 roles × 4 cities per brand, comp breakdown, benefits</div>
                </div>
                <span className={badge(`${(health?.salary_brands || 0) > 0 ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'}`)}>{health?.salary_brands || 0} brands</span>
              </div>
              <div className={body}>
                <div className={row}>
                  <select className={`${sel} min-w-[180px]`} value={selSalaryBrand} onChange={e => setSelSalaryBrand(e.target.value)}>
                    <option value="">Select brand...</option>
                    {brands.map(b => <option key={b.slug} value={b.slug}>{b.brand_name}</option>)}
                  </select>
                  <button className={btnB} disabled={!selSalaryBrand || !!generating} onClick={() => callEndpoint('salary', '/api/luxai/regenerate-salary', { slug: selSalaryBrand })}>
                    {generating === 'salary' ? 'Generating...' : 'Generate'}
                  </button>
                  <button className={btnO} disabled={!!generating} onClick={async () => {
                    if (!confirm(`Generate salary for all ${approvedBrands.length} approved brands?`)) return
                    setGenerating('salary-all')
                    for (const b of approvedBrands) {
                      await callEndpoint('salary-all', '/api/luxai/regenerate-salary', { slug: b.slug })
                    }
                    setGenerating(null)
                  }}>
                    Generate all approved ({approvedBrands.length})
                  </button>
                </div>
                <p className={info}>AI estimates + user contributions · ~$0.01/brand · writes to brand page + salaries page</p>
              </div>
              <div className={flowBar}><b className="text-[#10B981]">→</b> Brand page: Salaries tab <b className="text-[#10B981]">+</b> Salaries page (all brands)</div>
            </div>

            {/* 3. Signals */}
            <div className={card}>
              <div className={cardH}>
                <div className={icon('bg-[#10B981]')}>S</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#111]">Signals</div>
                  <div className="text-[10px] text-[#888]">Daily industry news | talent, market, brand, finance</div>
                </div>
                <span className={badge('bg-[#D1FAE5] text-[#065F46]')}>{health?.signals || 0} live</span>
              </div>
              <div className={body}>
                <div className={row}>
                  <button className={btnB} disabled={!!generating} onClick={() => callEndpoint('signals-5', '/api/luxai/generate-signals', { count: 5 })}>
                    {generating === 'signals-5' ? 'Generating...' : 'Generate 5'}
                  </button>
                  <button className={btnO} disabled={!!generating} onClick={() => callEndpoint('signals-10', '/api/luxai/generate-signals', { count: 10 })}>
                    {generating === 'signals-10' ? 'Generating...' : 'Generate 10'}
                  </button>
                  <button className={btnO} disabled={!!generating} onClick={async () => {
                    if (generating) return
                    setGenerating('rss-ingest')
                    try {
                      const res = await fetch('/api/luxai/ingest-rss', { method: 'POST' })
                      const d = await res.json()
                      if (d.success) {
                        const queued = (d.inserted || 0) - (d.auto_approved || 0)
                        const parts: string[] = []
                        if (d.inserted > 0) parts.push(`${d.inserted} inserted`)
                        if (d.auto_approved > 0) parts.push(`${d.auto_approved} auto-published`)
                        if (queued > 0) parts.push(`${queued} queued`)
                        flash('success', parts.length > 0 ? parts.join(' · ') : 'No new items found')
                        loadHealth()
                      } else {
                        flash('error', d.message || 'Ingestion failed')
                      }
                    } catch {
                      flash('error', 'Ingestion failed')
                    } finally {
                      setGenerating(null)
                    }
                  }}>
                    {generating === 'rss-ingest' ? 'Ingesting...' : 'Ingest from RSS'}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f5f5f5] text-[10px] text-[#666]">
                  <button onClick={() => saveAutopilot('signals', { enabled: !autopilot.signals?.enabled })} className={`w-6 h-3.5 rounded-full relative cursor-pointer transition-colors ${autopilot.signals?.enabled ? 'bg-[#10B981]' : 'bg-[#e8e8e8]'}`}>
                    <span className={`absolute top-[2px] w-[10px] h-[10px] bg-white rounded-full transition-all ${autopilot.signals?.enabled ? 'left-[14px]' : 'left-[2px]'}`} />
                  </button>
                  <span>Autopilot</span>
                  <select className={sel} value={autopilot.signals?.frequency || 'daily'} onChange={e => saveAutopilot('signals', { frequency: e.target.value })}>
                    <option value="daily">Daily</option><option value="every_2_days">Every 2 days</option><option value="weekly">Weekly</option>
                  </select>
                  <select className={sel} value={autopilot.signals?.count || 5} onChange={e => saveAutopilot('signals', { count: parseInt(e.target.value) })}>
                    <option value={5}>5 signals</option><option value={8}>8 signals</option><option value={10}>10 signals</option>
                  </select>
                  <span>at</span>
                  <select className={sel} value={autopilot.signals?.hour || 8} onChange={e => saveAutopilot('signals', { hour: parseInt(e.target.value) })}>
                    {[6,7,8,9,10].map(h => <option key={h} value={h}>{`${h.toString().padStart(2,'0')}:00`}</option>)}
                  </select>
                </div>
              </div>
              <div className={flowBar}><b className="text-[#10B981]">→</b> Signals page <b className="text-[#10B981]">+</b> Ticker bar <b className="text-[#10B981]">+</b> Brand page: Signals tab (by brand tag)</div>
            </div>

            {/* 4. Articles (Editorial) */}
            <div className={card}>
              <div className={cardH}>
                <div className={icon('bg-[#8B5CF6]')}>A</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#111]">Articles (Editorial)</div>
                  <div className="text-[10px] text-[#888]">Thought leadership, career advice, brand analysis</div>
                </div>
                <span className={badge('bg-[#D1FAE5] text-[#065F46]')}>{health?.articles || 0} live</span>
              </div>
              <div className={body}>
                <div className={row}>
                  <select className={sel} value={selArticleTopic} onChange={e => setSelArticleTopic(e.target.value)}>
                    <option value="career-trends">Career trends</option>
                    <option value="brand-analysis">Brand analysis</option>
                    <option value="market-insights">Market insights</option>
                    <option value="hiring-strategy">Hiring strategy</option>
                  </select>
                  <button className={btnB} disabled={!!generating} onClick={() => callEndpoint('article', '/api/luxai/generate-article', { topic: selArticleTopic })}>
                    {generating === 'article' ? 'Generating...' : 'Generate article'}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f5f5f5] text-[10px] text-[#666]">
                  <button onClick={() => saveAutopilot('articles', { enabled: !autopilot.articles?.enabled })} className={`w-6 h-3.5 rounded-full relative cursor-pointer transition-colors ${autopilot.articles?.enabled ? 'bg-[#10B981]' : 'bg-[#e8e8e8]'}`}>
                    <span className={`absolute top-[2px] w-[10px] h-[10px] bg-white rounded-full transition-all ${autopilot.articles?.enabled ? 'left-[14px]' : 'left-[2px]'}`} />
                  </button>
                  <span>Autopilot</span>
                  <select className={sel} value={autopilot.articles?.frequency || 'weekly'} onChange={e => saveAutopilot('articles', { frequency: e.target.value })}>
                    <option value="weekly">Weekly</option><option value="biweekly">Biweekly</option>
                  </select>
                </div>
              </div>
              <div className={flowBar}><b className="text-[#10B981]">→</b> Insights page: Editorial tab <b className="text-[#10B981]">+</b> Brand page (if tagged)</div>
            </div>

            {/* 5. Research reports */}
            <div className={card}>
              <div className={cardH}>
                <div className={icon('bg-[#EC4899]')}>R</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#111]">Research reports</div>
                  <div className="text-[10px] text-[#888]">Salary reports, hiring reports, market expansion, career ladder</div>
                </div>
              </div>
              <div className={body}>
                <div className={row}>
                  <select className={sel} value={selReportType} onChange={e => setSelReportType(e.target.value)}>
                    <option value="salary">Salary report</option>
                    <option value="hiring">Hiring report</option>
                    <option value="market">Market report</option>
                    <option value="career">Career report</option>
                  </select>
                  <button className={btnB} disabled={!!generating} onClick={() => callEndpoint('report', '/api/luxai/generate-report', { report_type: selReportType })}>
                    {generating === 'report' ? 'Generating...' : 'Generate report'}
                  </button>
                </div>
                <p className={info}>Substantial data-driven reports · ~$0.03/report</p>
              </div>
              <div className={flowBar}><b className="text-[#10B981]">→</b> Insights page: Research reports tab</div>
            </div>

            {/* 7. Interview intelligence */}
            <div className={card}>
              <div className={cardH}>
                <div className={icon('bg-[#06B6D4]')}>I</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#111]">Interview intelligence</div>
                  <div className="text-[10px] text-[#888]">Per brand: difficulty, rounds, format, questions, tips</div>
                </div>
                <span className={badge('bg-[#FEF3C7] text-[#92400E]')}>{health?.interviews || 0} total</span>
              </div>
              <div className={body}>
                <div className={row}>
                  <select className={`${sel} min-w-[180px]`} value={selInterviewBrand} onChange={e => setSelInterviewBrand(e.target.value)}>
                    <option value="">Select brand...</option>
                    {brands.map(b => <option key={b.slug} value={b.slug}>{b.brand_name}</option>)}
                  </select>
                  <button className={btnB} disabled={!selInterviewBrand || !!generating} onClick={() => callEndpoint('interview', '/api/luxai/generate-interview', { slug: selInterviewBrand })}>
                    {generating === 'interview' ? 'Generating...' : 'Generate'}
                  </button>
                </div>
                <p className={info}>AI baseline + user contributions enrich over time · ~$0.01/brand</p>
              </div>
              <div className={flowBar}><b className="text-[#10B981]">→</b> Interviews page <b className="text-[#10B981]">+</b> Brand page (by brand tag)</div>
            </div>

            {/* 8. Events */}
            <div className={card}>
              <div className={cardH}>
                <div className={icon('bg-[#F59E0B]')}>E</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#111]">Events</div>
                  <div className="text-[10px] text-[#888]">Industry calendar | fashion weeks, fairs, conferences</div>
                </div>
                <span className={badge('bg-[#FEF3C7] text-[#92400E]')}>{health?.events || 0} total</span>
              </div>
              <div className={body}>
                <div className={row}>
                  <select className={sel} value={selEventSector} onChange={e => setSelEventSector(e.target.value)}>
                    <option value="">All sectors</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Watches & Jewellery">Watches & Jewellery</option>
                    <option value="Art & Culture">Art & Culture</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Business">Business</option>
                    <option value="Automotive & Yachts">Automotive & Yachts</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Real Estate">Real Estate</option>
                  </select>
                  <button className={btnB} disabled={!!generating} onClick={() => callEndpoint('events', '/api/luxai/generate-events', { count: 10, sector: selEventSector || undefined })}>
                    {generating === 'events' ? 'Generating...' : 'Generate 10 events'}
                  </button>
                  <button className={btnO} disabled={!!generating} onClick={async () => {
                    if (generating) return
                    setGenerating('events-rss')
                    try {
                      const res = await fetch('/api/luxai/ingest-events-rss', { method: 'POST' })
                      const d = await res.json()
                      if (d.success) {
                        flash('success', d.inserted > 0 ? `${d.inserted} events added to queue` : 'No new events found')
                        loadHealth()
                      } else {
                        flash('error', d.message || 'Event ingestion failed')
                      }
                    } catch {
                      flash('error', 'Event ingestion failed')
                    } finally {
                      setGenerating(null)
                    }
                  }}>
                    {generating === 'events-rss' ? 'Ingesting...' : 'Ingest from RSS'}
                  </button>
                </div>
                <p className={info}>AI-generated + RSS ingestion · ~94 events/year target</p>
              </div>
              <div className={flowBar}><b className="text-[#10B981]">→</b> Events page <b className="text-[#10B981]">+</b> Brand page (by sector match)</div>
            </div>

            {/* 9. Library */}
            <div className={card}>
              <div className={cardH}>
                <div className={icon('bg-[#D946EF]')}>L</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#111]">Library</div>
                  <div className="text-[10px] text-[#888]">Brand images curated from Unsplash + manual uploads</div>
                </div>
                <span className={badge('bg-[#FEF3C7] text-[#92400E]')}>{health?.media || 0} images</span>
              </div>
              <div className={body}>
                <div className={row}>
                  <select className={`${sel} min-w-[180px]`} value={selLibraryBrand} onChange={e => setSelLibraryBrand(e.target.value)}>
                    <option value="">Select brand...</option>
                    {brands.map(b => <option key={b.slug} value={b.slug}>{b.brand_name}</option>)}
                  </select>
                  <button className={btnB} disabled={!selLibraryBrand || !!generating} onClick={() => callEndpoint('library', '/api/luxai/generate-library', { slug: selLibraryBrand })}>
                    {generating === 'library' ? 'Curating...' : 'AI curate from Unsplash'}
                  </button>
                </div>
                <p className={info}>Searches Unsplash for brand imagery · pending approval · free</p>
              </div>
              <div className={flowBar}><b className="text-[#10B981]">→</b> Brand page: Library tab <b className="text-[#10B981]">+</b> Media library</div>
            </div>

            {/* 10. Luxury Map (dormant) */}
            <div className={card} style={{ opacity: 0.5 }}>
              <div className={cardH}>
                <div className={icon('bg-[#94A3B8]')}>M</div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#111]">Luxury map</div>
                  <div className="text-[10px] text-[#888]">Global brand presence | stores, HQs, financials per country</div>
                </div>
                <span className={badge('bg-[#F1F5F9] text-[#64748B]')}>Upcoming</span>
              </div>
              <div className={body}>
                <p className="text-[11px] text-[#999]">Database ready. Feeds from the master Luxury Map on Insights page | will be built as a separate project.</p>
              </div>
              <div className={flowBar}><b className="text-[#10B981]">→</b> Brand page: Luxury Map tab <b className="text-[#10B981]">+</b> Insights: Luxury Map tab</div>
            </div>

            {/* Usage */}
            <div className="mt-4">
              <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-2">Usage this month</div>
              <div className="bg-white border border-[#e8e8e8] rounded-lg px-4 py-3">
                <div className="grid grid-cols-4 gap-4 text-[12px]">
                  <div><span className="text-[#888]">Model</span><br/><span className="font-semibold text-[#111]">Claude Haiku 4.5</span></div>
                  <div><span className="text-[#888]">Requests</span><br/><span className="font-semibold text-[#111]">{health?.requests_month || 0}</span></div>
                  <div><span className="text-[#888]">Total cost</span><br/><span className="font-semibold text-[#111]">${(health?.cost_month || 0).toFixed(2)}</span></div>
                  <div><span className="text-[#888]">Autopilot cron</span><br/><span className="font-semibold text-[#111]">GET /api/luxai/autopilot</span></div>
                </div>
              </div>
            </div>

            {/* Where content surfaces */}
            <div className="mt-4">
              <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-2">Where content surfaces</div>
              <div className="bg-white border border-[#e8e8e8] rounded-lg px-3 py-2.5">
                <div className="text-[10px] text-[#666] space-y-1">
                  <div><b className="text-[#111] font-semibold">Brand page</b> ← brand + salary + signals + articles + interviews + library</div>
                  <div><b className="text-[#111] font-semibold">Salaries page</b> ← salary data across all brands</div>
                  <div><b className="text-[#111] font-semibold">Signals page + ticker</b> ← all signals by brand tag</div>
                  <div><b className="text-[#111] font-semibold">Insights page</b> ← editorial + reports + insider voices + luxury map</div>
                  <div><b className="text-[#111] font-semibold">Interviews page</b> ← all interview data by brand</div>
                  <div><b className="text-[#111] font-semibold">Events page</b> ← all events by sector</div>
                  <div><b className="text-[#111] font-semibold">Careers page</b> ← search assignments</div>
                  <div><b className="text-[#111] font-semibold">Homepage</b> ← latest signals + articles + events</div>
                </div>
                <div className="text-[9px] text-[#10B981] font-medium mt-2 pt-2 border-t border-[#f5f5f5]">
                  One piece of content, generated once, appears everywhere through brand + sector tags
                </div>
              </div>
            </div>

            {/* Daily routine */}
            <div className="mt-4">
              <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-2">Your daily routine</div>
              <div className="bg-white border border-[#e8e8e8] rounded-lg px-3 py-2.5 text-[10px] text-[#666] space-y-1.5">
                <div><b className="text-[#111]">Morning (2 min):</b> Open queue → approve overnight signals</div>
                <div><b className="text-[#111]">When needed:</b> Generate salary or interviews for a brand</div>
                <div><b className="text-[#111]">Weekly:</b> Generate an article or report</div>
                <div><b className="text-[#111]">Monthly:</b> Add new brands, check costs</div>
                <div><b className="text-[#111]">Quarterly:</b> Auto-refresh all brand pages</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
