'use client'

import { useEffect, useRef, useState } from 'react'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'operations', label: 'Operations' },
  { id: 'brands', label: 'Brands' },
  { id: 'signals', label: 'Signals' },
  { id: 'events', label: 'Events' },
  { id: 'articles', label: 'Articles' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'queue', label: 'Queue' },
] as const

type TabId = (typeof TABS)[number]['id']

type InventoryRow = {
  type: string
  label: string
  total: number
  live: number
  in_queue: number
  added_30d: number
  last_added: string | null
}

type QueueRow = {
  id: string
  content_type: string
  source_type: string | null
  source_name: string | null
  title: string | null
  category: string | null
  brand_tags: string[] | null
  status: string
  created_at: string | null
}

type SignalRow = {
  id: string
  headline: string | null
  slug: string | null
  category: string | null
  brand_tags: string[] | null
  source_name: string | null
  is_published: boolean
  is_pinned: boolean
  published_at: string | null
  created_at: string | null
}

type EventRow = {
  id: string
  name: string | null
  title: string | null
  slug: string | null
  sector: string | null
  location_city: string | null
  location_country: string | null
  start_date: string | null
  end_date: string | null
  type: string | null
  is_published: boolean
  is_featured: boolean
  created_at: string | null
}

type ArticleRow = {
  id: string
  title: string | null
  category: string | null
  author_name: string | null
  status: string | null
  published_at: string | null
  created_at: string | null
}

type UsageStats = {
  this_month: number
  this_month_requests: number
  last_month: number
  last_month_requests: number
  avg_cost: number
}

type UsageHistoryRow = {
  id: string
  action: string | null
  model: string | null
  tokens_used: number | null
  cost_usd: number | null
  created_at: string | null
}

type BrandRow = {
  slug: string
  brand_name: string | null
  sector: string | null
  status: string | null
  is_published: boolean
  salary_count: number
  has_salary: boolean
  interview_count: number
  last_regenerated_at: string | null
  regeneration_count: number
}

// Types where an editorial queue does not structurally apply (presentation only)
const NO_QUEUE_TYPES = new Set(['brands', 'salary', 'interviews'])

function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const ICON_PROPS = {
  width: 14,
  height: 14,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const IconDashboard = () => (
  <svg {...ICON_PROPS}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

const IconWikiLux = () => (
  <svg {...ICON_PROPS}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const IconSignals = () => (
  <svg {...ICON_PROPS}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

const IconEvents = () => (
  <svg {...ICON_PROPS}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconCommand = () => (
  <svg {...ICON_PROPS}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const IconQueue = () => (
  <svg {...ICON_PROPS}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
)

const IconAssignments = () => (
  <svg {...ICON_PROPS}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

const STYLE = `
  .v17-root {
    background: #f5f5f5;
    color: #111;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    min-height: 100vh;
  }
  .v17-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 220px;
    background: #fff;
    border-right: 1px solid #e8e8e8;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  .v17-logo-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 16px 14px;
  }
  .v17-logo {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: .06em;
  }
  .v17-logo-badge {
    font-size: 9px;
    padding: 2px 6px;
    background: #f5f5f5;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    color: #666;
  }
  .v17-nav-section { padding: 8px 0; }
  .v17-nav-label {
    font-size: 9px;
    color: #bbb;
    text-transform: uppercase;
    letter-spacing: .12em;
    font-weight: 600;
    padding: 6px 16px 4px;
  }
  .v17-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 16px;
    font-size: 12px;
    color: #666;
    text-decoration: none;
    cursor: pointer;
  }
  .v17-nav-item:hover { background: #f5f5f5; color: #111; }
  .v17-nav-item.active { background: #f0f0f0; color: #111; }
  .v17-sidebar-footer {
    margin-top: auto;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .v17-footer-live {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #999;
  }
  .v17-footer-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #22c55e;
  }
  .v17-footer-rss { font-size: 11px; color: #bbb; }
  .v17-main { margin-left: 220px; }
  .v17-topbar {
    position: sticky;
    top: 0;
    height: 52px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  }
  .v17-topbar-left { display: flex; align-items: baseline; }
  .v17-topbar-title { font-size: 14px; font-weight: 500; }
  .v17-topbar-sub { font-size: 12px; color: #999; margin-left: 10px; }
  .v17-topbar-right { display: flex; align-items: center; gap: 12px; }
  .v17-btn-secondary {
    background: #fff;
    color: #111;
    border: 1px solid #e8e8e8;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
  }
  .v17-admin-pill {
    font-size: 10px;
    color: #bbb;
    padding: 2px 8px;
    background: #f5f5f5;
    border-radius: 4px;
    border: 1px solid #e8e8e8;
  }
  .v17-tabbar {
    display: flex;
    padding: 0 24px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    gap: 2px;
  }
  .v17-tab {
    padding: 10px 14px;
    font-size: 12px;
    color: #666;
    border: none;
    background: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    cursor: pointer;
    font-family: inherit;
  }
  .v17-tab:hover { color: #111; }
  .v17-tab.active {
    color: #111;
    font-weight: 500;
    border-bottom-color: #111;
  }
  .v17-content { padding: 20px 24px; }
  .v17-pane-heading {
    font-size: 16px;
    font-weight: 600;
    color: #111;
    margin: 0;
  }
  .v17-state { font-size: 12px; color: #888; }
  .v17-state.error { color: #b91c1c; }
  .v17-kpi-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  .v17-kpi-card {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 10px;
    padding: 14px 16px;
  }
  .v17-kpi-label {
    font-size: 10px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: .08em;
  }
  .v17-kpi-value {
    font-size: 26px;
    font-weight: 600;
    color: #111;
    margin-top: 4px;
  }
  .v17-table-wrap {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 10px;
    overflow: hidden;
  }
  .v17-table { width: 100%; border-collapse: collapse; }
  .v17-table thead th {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #aaa;
    font-weight: 600;
    background: #fafafa;
    text-align: left;
    padding: 9px 16px;
  }
  .v17-table tbody td {
    font-size: 12px;
    color: #111;
    border-bottom: 1px solid #f5f5f5;
    padding: 9px 16px;
  }
  .v17-table tbody tr:last-child td { border-bottom: none; }
  .v17-table tbody tr:hover td { background: #fafafa; }
  .v17-num { text-align: right; font-variant-numeric: tabular-nums; }

  /* Operations pane */
  .v17-warn-banner {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #fffbe6;
    border: 1px solid #f0e6a6;
    color: #7a6818;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
  }
  .v17-warn-icon { font-size: 13px; line-height: 1.4; }
  .v17-warn-title { font-size: 12px; font-weight: 600; }
  .v17-warn-body { font-size: 11px; margin-top: 2px; }
  .v17-panel-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .v17-panel {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 10px;
    padding: 16px;
  }
  .v17-panel-head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #aaa;
    font-weight: 600;
  }
  .v17-panel-body { font-size: 12px; color: #999; margin-top: 8px; }
  .v17-section-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #aaa;
    font-weight: 600;
    margin-top: 22px;
    margin-bottom: 10px;
  }
  .v17-block {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 12px;
  }
  .v17-block-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  .v17-block-title { font-size: 13px; font-weight: 600; color: #111; }
  .v17-tag {
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 4px;
    background: #f5f5f5;
    border: 1px solid #e8e8e8;
    color: #888;
  }
  .v17-block-desc { font-size: 12px; color: #999; margin-bottom: 12px; }
  .v17-action-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .v17-not-connected {
    font-size: 10px;
    font-style: italic;
    color: #999;
  }
  .v17-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .v17-dot.green { background: #22c55e; }
  .v17-dot.purple { background: #8b5cf6; }
  .v17-dot.gray { background: #c4c4c4; }
  .v17-dot.amber { background: #f59e0b; animation: v17-pulse 1.6s ease-in-out infinite; }
  @keyframes v17-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .35; }
  }
  .v17-btn-secondary:disabled,
  .v17-select:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
  .v17-select {
    background: #fff;
    color: #111;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 11px;
    font-family: inherit;
  }
  .v17-hint { font-size: 10px; color: #999; }
`

export default function CommandCenterV17() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const [inventory, setInventory] = useState<InventoryRow[]>([])
  const [invLoading, setInvLoading] = useState(true)
  const [invError, setInvError] = useState(false)

  const [queue, setQueue] = useState<QueueRow[]>([])
  const [queueLoading, setQueueLoading] = useState(false)
  const [queueError, setQueueError] = useState(false)
  const [queueLoaded, setQueueLoaded] = useState(false)

  const [signalsList, setSignalsList] = useState<SignalRow[]>([])
  const [signalsListLoading, setSignalsListLoading] = useState(false)
  const [signalsListError, setSignalsListError] = useState(false)
  const [signalsListLoaded, setSignalsListLoaded] = useState(false)

  const [eventsList, setEventsList] = useState<EventRow[]>([])
  const [eventsListLoading, setEventsListLoading] = useState(false)
  const [eventsListError, setEventsListError] = useState(false)
  const [eventsListLoaded, setEventsListLoaded] = useState(false)

  const [articlesList, setArticlesList] = useState<ArticleRow[]>([])
  const [articlesListLoading, setArticlesListLoading] = useState(false)
  const [articlesListError, setArticlesListError] = useState(false)
  const [articlesListLoaded, setArticlesListLoaded] = useState(false)

  const [brandsList, setBrandsList] = useState<BrandRow[]>([])
  const [brandsListLoading, setBrandsListLoading] = useState(false)
  const [brandsListError, setBrandsListError] = useState(false)
  const [brandsListLoaded, setBrandsListLoaded] = useState(false)

  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [usageHistory, setUsageHistory] = useState<UsageHistoryRow[]>([])
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageError, setUsageError] = useState(false)
  const [usageLoaded, setUsageLoaded] = useState(false)

  // Operations — only the "Generate article" action is wired
  const [articleTopic, setArticleTopic] = useState('career-trends')
  const [articleRunning, setArticleRunning] = useState(false)
  const [articleResult, setArticleResult] = useState<{ ok: boolean; text: string } | null>(null)

  const [reportType, setReportType] = useState('salary')
  const [reportRunning, setReportRunning] = useState(false)
  const [reportResult, setReportResult] = useState<{ ok: boolean; text: string } | null>(null)

  const [eventSector, setEventSector] = useState('')
  const [eventsRunning, setEventsRunning] = useState(false)
  const [eventsResult, setEventsResult] = useState<{ ok: boolean; text: string } | null>(null)

  const [rssEventsRunning, setRssEventsRunning] = useState(false)
  const [rssEventsResult, setRssEventsResult] = useState<{ ok: boolean; text: string } | null>(null)

  // Pull RSS signals — AUTO-PUBLISHES live (Step 6b auto-approve), behind a 2-click inline confirmation
  const [rssSignalsConfirm, setRssSignalsConfirm] = useState(false)
  const [rssSignalsRunning, setRssSignalsRunning] = useState(false)
  const [rssSignalsResult, setRssSignalsResult] = useState<{ ok: boolean; text: string } | null>(null)
  const rssSignalsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Generate signals — AUTO-PUBLISHES live, behind a 2-click inline confirmation
  const [signalsConfirm, setSignalsConfirm] = useState<null | 5 | 10>(null)
  const [signalsRunning, setSignalsRunning] = useState(false)
  const [signalsResult, setSignalsResult] = useState<{ ok: boolean; text: string } | null>(null)
  const signalsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSignalsTimer = () => {
    if (signalsTimerRef.current) {
      clearTimeout(signalsTimerRef.current)
      signalsTimerRef.current = null
    }
  }

  useEffect(() => clearSignalsTimer, [])

  const clearRssSignalsTimer = () => {
    if (rssSignalsTimerRef.current) {
      clearTimeout(rssSignalsTimerRef.current)
      rssSignalsTimerRef.current = null
    }
  }

  useEffect(() => clearRssSignalsTimer, [])

  // Enrich card intelligence — LIVE WRITE to brand cards, behind a 2-click inline confirmation
  const [cardIntelConfirm, setCardIntelConfirm] = useState(false)
  const [cardIntelRunning, setCardIntelRunning] = useState(false)
  const [cardIntelResult, setCardIntelResult] = useState<{ ok: boolean; text: string } | null>(null)
  const cardIntelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearCardIntelTimer = () => {
    if (cardIntelTimerRef.current) { clearTimeout(cardIntelTimerRef.current); cardIntelTimerRef.current = null }
  }
  useEffect(() => clearCardIntelTimer, [])

  const handleSignalsClick = async (count: 5 | 10) => {
    if (signalsRunning) return

    // First click (or re-arm to the other count): arm, no API call.
    if (signalsConfirm !== count) {
      clearSignalsTimer()
      setSignalsConfirm(count)
      signalsTimerRef.current = setTimeout(() => setSignalsConfirm(null), 4000)
      return
    }

    // Second click on the same armed button within the window: fire.
    // Keep signalsConfirm set through the run so the armed button shows "Generating…".
    clearSignalsTimer()
    setSignalsRunning(true)
    try {
      const res = await fetch('/api/luxai/generate-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok && body?.success) {
        setSignalsResult({
          ok: true,
          text:
            body.message ||
            `${body.data?.count ?? 0} signals generated, ${body.data?.auto_approved ?? 0} auto-published live`,
        })
      } else {
        setSignalsResult({ ok: false, text: body?.message || 'Generation failed' })
      }
    } catch {
      setSignalsResult({ ok: false, text: 'Generation failed' })
    } finally {
      setSignalsRunning(false)
      setSignalsConfirm(null)
    }
  }

  const handleGenerateArticle = async () => {
    if (articleRunning) return
    setArticleRunning(true)
    try {
      const res = await fetch('/api/luxai/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: articleTopic }),
      })
      const body = await res.json().catch(() => ({}))
      if (body?.skipped) {
        setArticleResult({ ok: true, text: 'Skipped — duplicate already in queue' })
      } else if (res.ok && body?.success) {
        setArticleResult({ ok: true, text: body.message || 'Article queued for review' })
      } else {
        setArticleResult({ ok: false, text: body?.message || 'Generation failed' })
      }
    } catch {
      setArticleResult({ ok: false, text: 'Generation failed' })
    } finally {
      setArticleRunning(false)
    }
  }

  const handleGenerateReport = async () => {
    if (reportRunning) return
    setReportRunning(true)
    try {
      const res = await fetch('/api/luxai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_type: reportType }),
      })
      const body = await res.json().catch(() => ({}))
      if (body?.skipped) {
        setReportResult({ ok: true, text: 'Skipped — duplicate already in queue' })
      } else if (res.ok && body?.success) {
        setReportResult({ ok: true, text: body.message || 'Report queued for review' })
      } else {
        setReportResult({ ok: false, text: body?.message || 'Generation failed' })
      }
    } catch {
      setReportResult({ ok: false, text: 'Generation failed' })
    } finally {
      setReportRunning(false)
    }
  }

  const handleGenerateEvents = async () => {
    if (eventsRunning) return
    setEventsRunning(true)
    try {
      const res = await fetch('/api/luxai/generate-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 10, ...(eventSector ? { sector: eventSector } : {}) }),
      })
      const body = await res.json().catch(() => ({}))
      if (body?.skipped) {
        setEventsResult({ ok: true, text: 'Skipped — duplicate already in queue' })
      } else if (res.ok && body?.success) {
        setEventsResult({ ok: true, text: body.message || 'Events queued for review' })
      } else {
        setEventsResult({ ok: false, text: body?.message || 'Generation failed' })
      }
    } catch {
      setEventsResult({ ok: false, text: 'Generation failed' })
    } finally {
      setEventsRunning(false)
    }
  }

  const handlePullRssEvents = async () => {
    if (rssEventsRunning) return
    setRssEventsRunning(true)
    try {
      const res = await fetch('/api/luxai/ingest-events-rss', { method: 'POST' })
      const body = await res.json().catch(() => ({}))
      if (res.ok && body?.success) {
        setRssEventsResult({
          ok: true,
          text: `Events pulled — ${body.inserted ?? 0} new, ${body.skipped ?? 0} skipped`,
        })
      } else {
        setRssEventsResult({ ok: false, text: body?.message || 'RSS pull failed' })
      }
    } catch {
      setRssEventsResult({ ok: false, text: 'RSS pull failed' })
    } finally {
      setRssEventsRunning(false)
    }
  }

  const handlePullRssSignals = async () => {
    if (rssSignalsRunning) return
    if (!rssSignalsConfirm) {
      clearRssSignalsTimer()
      setRssSignalsConfirm(true)
      rssSignalsTimerRef.current = setTimeout(() => setRssSignalsConfirm(false), 4000)
      return
    }
    clearRssSignalsTimer()
    setRssSignalsRunning(true)
    try {
      const res = await fetch('/api/luxai/ingest-rss', { method: 'POST' })
      const body = await res.json().catch(() => ({}))
      if (res.ok && body?.success) {
        setRssSignalsResult({
          ok: true,
          text: `Signals pulled — ${body.inserted ?? 0} new, ${body.auto_approved ?? 0} auto-published live, ${body.skipped ?? 0} skipped`,
        })
      } else {
        setRssSignalsResult({ ok: false, text: body?.message || 'RSS pull failed' })
      }
    } catch {
      setRssSignalsResult({ ok: false, text: 'RSS pull failed' })
    } finally {
      setRssSignalsRunning(false)
      setRssSignalsConfirm(false)
    }
  }

  const handleEnrichCardIntel = async () => {
    if (cardIntelRunning) return
    if (!cardIntelConfirm) {
      clearCardIntelTimer()
      setCardIntelConfirm(true)
      cardIntelTimerRef.current = setTimeout(() => setCardIntelConfirm(false), 4000)
      return
    }
    clearCardIntelTimer()
    setCardIntelRunning(true)
    try {
      const res = await fetch('/api/luxai/enrich-card-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok && body?.success) {
        setCardIntelResult({ ok: true, text: `${body.written ?? 0} written · ${body.skipped ?? 0} skipped` })
      } else {
        setCardIntelResult({ ok: false, text: body?.message || 'Enrichment failed' })
      }
    } catch {
      setCardIntelResult({ ok: false, text: 'Enrichment failed' })
    } finally {
      setCardIntelRunning(false)
      setCardIntelConfirm(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/luxai/inventory')
      .then((r) => {
        if (!r.ok) throw new Error(`status ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setInventory(Array.isArray(data?.inventory) ? data.inventory : [])
        setInvLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setInvError(true)
        setInvLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (activeTab !== 'queue' || queueLoaded) return
    let cancelled = false
    setQueueLoading(true)
    fetch('/api/admin/luxai/queue')
      .then((r) => {
        if (!r.ok) throw new Error(`status ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setQueue(Array.isArray(data?.queue) ? data.queue : [])
        setQueueLoading(false)
        setQueueLoaded(true)
      })
      .catch(() => {
        if (cancelled) return
        setQueueError(true)
        setQueueLoading(false)
        setQueueLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, queueLoaded])

  useEffect(() => {
    if (activeTab !== 'signals' || signalsListLoaded) return
    let cancelled = false
    setSignalsListLoading(true)
    fetch('/api/admin/signals')
      .then((r) => {
        if (!r.ok) throw new Error(`status ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setSignalsList(Array.isArray(data?.signals) ? data.signals : [])
        setSignalsListLoading(false)
        setSignalsListLoaded(true)
      })
      .catch(() => {
        if (cancelled) return
        setSignalsListError(true)
        setSignalsListLoading(false)
        setSignalsListLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, signalsListLoaded])

  useEffect(() => {
    if (activeTab !== 'events' || eventsListLoaded) return
    let cancelled = false
    setEventsListLoading(true)
    fetch('/api/admin/events')
      .then((r) => {
        if (!r.ok) throw new Error(`status ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setEventsList(Array.isArray(data?.events) ? data.events : [])
        setEventsListLoading(false)
        setEventsListLoaded(true)
      })
      .catch(() => {
        if (cancelled) return
        setEventsListError(true)
        setEventsListLoading(false)
        setEventsListLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, eventsListLoaded])

  useEffect(() => {
    if (activeTab !== 'articles' || articlesListLoaded) return
    let cancelled = false
    setArticlesListLoading(true)
    fetch('/api/articles')
      .then((r) => {
        if (!r.ok) throw new Error(`status ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setArticlesList(Array.isArray(data?.articles) ? data.articles : [])
        setArticlesListLoading(false)
        setArticlesListLoaded(true)
      })
      .catch(() => {
        if (cancelled) return
        setArticlesListError(true)
        setArticlesListLoading(false)
        setArticlesListLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, articlesListLoaded])

  useEffect(() => {
    if (activeTab !== 'analytics' || usageLoaded) return
    let cancelled = false
    setUsageLoading(true)
    fetch('/api/admin/luxai/usage')
      .then((r) => {
        if (!r.ok) throw new Error(`status ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setUsageStats(data?.stats ?? null)
        setUsageHistory(Array.isArray(data?.history) ? data.history : [])
        setUsageLoading(false)
        setUsageLoaded(true)
      })
      .catch(() => {
        if (cancelled) return
        setUsageError(true)
        setUsageLoading(false)
        setUsageLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, usageLoaded])

  useEffect(() => {
    if (activeTab !== 'brands' || brandsListLoaded) return
    let cancelled = false
    setBrandsListLoading(true)
    fetch('/api/admin/luxai/brands-enriched')
      .then((r) => {
        if (!r.ok) throw new Error(`status ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setBrandsList(Array.isArray(data?.brands) ? data.brands : [])
        setBrandsListLoading(false)
        setBrandsListLoaded(true)
      })
      .catch(() => {
        if (cancelled) return
        setBrandsListError(true)
        setBrandsListLoading(false)
        setBrandsListLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, brandsListLoaded])

  const activeLabel = TABS.find((t) => t.id === activeTab)?.label ?? ''

  const totals = inventory.reduce(
    (acc, r) => ({
      total: acc.total + (r.total || 0),
      live: acc.live + (r.live || 0),
      in_queue: acc.in_queue + (r.in_queue || 0),
      added_30d: acc.added_30d + (r.added_30d || 0),
    }),
    { total: 0, live: 0, in_queue: 0, added_30d: 0 }
  )

  const renderOverview = () => {
    if (invLoading) return <div className="v17-state">Loading…</div>
    if (invError) return <div className="v17-state error">Failed to load inventory.</div>

    return (
      <>
        <div className="v17-kpi-strip">
          <div className="v17-kpi-card">
            <div className="v17-kpi-label">Total content</div>
            <div className="v17-kpi-value">{totals.total}</div>
          </div>
          <div className="v17-kpi-card">
            <div className="v17-kpi-label">Live</div>
            <div className="v17-kpi-value">{totals.live}</div>
          </div>
          <div className="v17-kpi-card">
            <div className="v17-kpi-label">In queue</div>
            <div className="v17-kpi-value">{totals.in_queue}</div>
          </div>
          <div className="v17-kpi-card">
            <div className="v17-kpi-label">Added (30d)</div>
            <div className="v17-kpi-value">{totals.added_30d}</div>
          </div>
        </div>

        <div className="v17-table-wrap">
          <table className="v17-table">
            <thead>
              <tr>
                <th>Type</th>
                <th className="v17-num">Total</th>
                <th className="v17-num">Live</th>
                <th className="v17-num">In queue</th>
                <th className="v17-num">Added 30d</th>
                <th>Last added</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((row) => (
                <tr key={row.type}>
                  <td>{row.label}</td>
                  <td className="v17-num">{row.total}</td>
                  <td className="v17-num">{row.live}</td>
                  <td className="v17-num">{NO_QUEUE_TYPES.has(row.type) ? '—' : row.in_queue}</td>
                  <td className="v17-num">{row.added_30d}</td>
                  <td>{formatDate(row.last_added)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  const renderQueue = () => {
    if (queueLoading) return <div className="v17-state">Loading…</div>
    if (queueError) return <div className="v17-state error">Failed to load queue.</div>
    if (queue.length === 0) return <div className="v17-state">No items awaiting review.</div>

    return (
      <div className="v17-table-wrap">
        <table className="v17-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Source</th>
              <th>Category</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((row) => (
              <tr key={row.id}>
                <td>{row.content_type}</td>
                <td>{row.title ?? '—'}</td>
                <td>{row.source_name ?? row.source_type ?? '—'}</td>
                <td>{row.category ?? '—'}</td>
                <td>{formatDate(row.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderSignals = () => {
    if (signalsListLoading) return <div className="v17-state">Loading…</div>
    if (signalsListError) return <div className="v17-state error">Failed to load signals.</div>
    if (signalsList.length === 0) return <div className="v17-state">No signals.</div>

    return (
      <div className="v17-table-wrap">
        <table className="v17-table">
          <thead>
            <tr>
              <th>Headline</th>
              <th>Status</th>
              <th>Category</th>
              <th>Source</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {signalsList.map((row) => (
              <tr key={row.id}>
                <td>{row.headline ?? '—'}</td>
                <td>{row.is_published ? 'Live' : 'Draft'}</td>
                <td>{row.category ?? '—'}</td>
                <td>{row.source_name ?? '—'}</td>
                <td>{formatDate(row.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderEvents = () => {
    if (eventsListLoading) return <div className="v17-state">Loading…</div>
    if (eventsListError) return <div className="v17-state error">Failed to load events.</div>
    if (eventsList.length === 0) return <div className="v17-state">No events.</div>

    return (
      <div className="v17-table-wrap">
        <table className="v17-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Sector</th>
              <th>Location</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {eventsList.map((row) => (
              <tr key={row.id}>
                <td>{row.name ?? row.title ?? '—'}</td>
                <td>{row.is_published ? 'Live' : 'Draft'}</td>
                <td>{row.sector ?? '—'}</td>
                <td>{[row.location_city, row.location_country].filter(Boolean).join(', ') || '—'}</td>
                <td>{formatDate(row.start_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderArticles = () => {
    if (articlesListLoading) return <div className="v17-state">Loading…</div>
    if (articlesListError) return <div className="v17-state error">Failed to load articles.</div>
    if (articlesList.length === 0) return <div className="v17-state">No articles.</div>

    return (
      <div className="v17-table-wrap">
        <table className="v17-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Category</th>
              <th>Author</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {articlesList.map((row) => (
              <tr key={row.id}>
                <td>{row.title ?? '—'}</td>
                <td>{row.status === 'published' ? 'Live' : 'Draft'}</td>
                <td>{row.category ?? '—'}</td>
                <td>{row.author_name ?? '—'}</td>
                <td>{formatDate(row.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const fmtUsd = (n: number | null | undefined) =>
    typeof n === 'number' ? `$${n.toFixed(2)}` : '—'

  const renderAnalytics = () => {
    if (usageLoading) return <div className="v17-state">Loading…</div>
    if (usageError) return <div className="v17-state error">Failed to load usage.</div>

    return (
      <>
        <div className="v17-kpi-strip">
          <div className="v17-kpi-card">
            <div className="v17-kpi-label">This month (cost)</div>
            <div className="v17-kpi-value">{fmtUsd(usageStats?.this_month)}</div>
          </div>
          <div className="v17-kpi-card">
            <div className="v17-kpi-label">This month (requests)</div>
            <div className="v17-kpi-value">{usageStats?.this_month_requests ?? 0}</div>
          </div>
          <div className="v17-kpi-card">
            <div className="v17-kpi-label">Last month (cost)</div>
            <div className="v17-kpi-value">{fmtUsd(usageStats?.last_month)}</div>
          </div>
          <div className="v17-kpi-card">
            <div className="v17-kpi-label">Avg cost / request</div>
            <div className="v17-kpi-value">{fmtUsd(usageStats?.avg_cost)}</div>
          </div>
        </div>

        {usageHistory.length === 0 ? (
          <div className="v17-state">No usage history.</div>
        ) : (
          <div className="v17-table-wrap">
            <table className="v17-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Model</th>
                  <th>Tokens</th>
                  <th>Cost</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {usageHistory.map((row) => (
                  <tr key={row.id}>
                    <td>{row.action ?? '—'}</td>
                    <td>{row.model ?? '—'}</td>
                    <td>{row.tokens_used ?? '—'}</td>
                    <td>{fmtUsd(row.cost_usd)}</td>
                    <td>{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    )
  }

  const renderBrands = () => {
    if (brandsListLoading) return <div className="v17-state">Loading…</div>
    if (brandsListError) return <div className="v17-state error">Failed to load brands.</div>
    if (brandsList.length === 0) return <div className="v17-state">No brands.</div>

    return (
      <div className="v17-table-wrap">
        <table className="v17-table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Status</th>
              <th>Sector</th>
              <th>Salary</th>
              <th>Regenerated</th>
            </tr>
          </thead>
          <tbody>
            {brandsList.map((row) => (
              <tr key={row.slug}>
                <td>{row.brand_name ?? '—'}</td>
                <td>{row.is_published ? 'Live' : 'Draft'}</td>
                <td>{row.sector ?? '—'}</td>
                <td>{row.has_salary ? row.salary_count : '—'}</td>
                <td>{formatDate(row.last_regenerated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderOperations = () => (
    <>
      <div className="v17-warn-banner">
        <span className="v17-warn-icon">⚠</span>
        <div>
          <div className="v17-warn-title">Autopilot cron not connected</div>
          <div className="v17-warn-body">
            Schedules are saved but nothing runs automatically. All imports are currently manual.
          </div>
        </div>
      </div>

      <div className="v17-panel-grid">
        <div className="v17-panel">
          <div className="v17-panel-head">
            <span className="v17-dot amber" />
            <span>Status</span>
          </div>
          <div className="v17-panel-body">Not connected yet</div>
        </div>
        <div className="v17-panel">
          <div className="v17-panel-head">
            <span className="v17-dot green" />
            <span>RSS sources</span>
          </div>
          <div className="v17-panel-body">Not connected yet</div>
        </div>
      </div>

      <div className="v17-section-label">Manual actions</div>

      {/* Block A — Import real content */}
      <div className="v17-block">
        <div className="v17-block-head">
          <span className="v17-dot green" />
          <span className="v17-block-title">Import real content</span>
          <span className="v17-tag">RSS · sourced</span>
        </div>
        <div className="v17-block-desc">
          Fetches real, verified items from external feeds into the review queue. Not AI-written.
        </div>
        <div className="v17-action-row">
          <button
            type="button"
            className="v17-btn-secondary"
            onClick={handlePullRssSignals}
            disabled={rssSignalsRunning}
            style={rssSignalsConfirm ? { color: '#b45309', borderColor: '#b45309' } : undefined}
          >
            {rssSignalsRunning
              ? 'Pulling…'
              : rssSignalsConfirm
                ? '⚠ Publishes live — click again'
                : '↻ Pull RSS signals'}
          </button>
          {rssSignalsResult && (
            <span style={{ fontSize: 11, color: rssSignalsResult.ok ? '#16a34a' : '#b91c1c' }}>
              {rssSignalsResult.text}
            </span>
          )}
          <button
            type="button"
            className="v17-btn-secondary"
            onClick={handlePullRssEvents}
            disabled={rssEventsRunning}
          >
            {rssEventsRunning ? 'Pulling…' : '↻ Pull RSS events'}
          </button>
          {rssEventsResult ? (
            <span style={{ fontSize: 11, color: rssEventsResult.ok ? '#16a34a' : '#b91c1c' }}>
              {rssEventsResult.text}
            </span>
          ) : (
            <span className="v17-not-connected">Not connected yet</span>
          )}
        </div>
      </div>

      {/* Block B — Manufacture with AI */}
      <div className="v17-block">
        <div className="v17-block-head">
          <span className="v17-dot purple" />
          <span className="v17-block-title">Manufacture with AI</span>
          <span className="v17-tag">AI · generated</span>
        </div>
        <div className="v17-block-desc">
          Creates AI-generated drafts into the review queue. Review before publishing.
        </div>
        <div className="v17-action-row">
          {([5, 10] as const).map((count) => {
            const armed = signalsConfirm === count
            return (
              <button
                key={count}
                type="button"
                className="v17-btn-secondary"
                onClick={() => handleSignalsClick(count)}
                disabled={signalsRunning}
                style={armed ? { color: '#b45309', borderColor: '#b45309' } : undefined}
              >
                {signalsRunning && armed
                  ? 'Generating…'
                  : armed
                    ? '⚠ Publishes live — click again'
                    : `Generate ${count}`}
              </button>
            )
          })}
          <span className="v17-hint">signals</span>
          {signalsResult ? (
            <span style={{ fontSize: 11, color: signalsResult.ok ? '#16a34a' : '#b91c1c' }}>
              {signalsResult.text}
            </span>
          ) : (
            <span className="v17-not-connected">Not connected yet</span>
          )}
        </div>
        <div className="v17-action-row">
          <select
            className="v17-select"
            value={articleTopic}
            onChange={(e) => setArticleTopic(e.target.value)}
            disabled={articleRunning}
          >
            <option value="career-trends">Career trends</option>
            <option value="brand-analysis">Brand analysis</option>
            <option value="market-insights">Market insights</option>
            <option value="hiring-strategy">Hiring strategy</option>
          </select>
          <button
            type="button"
            className="v17-btn-secondary"
            onClick={handleGenerateArticle}
            disabled={articleRunning}
          >
            {articleRunning ? 'Generating…' : 'Generate article'}
          </button>
          {articleResult && (
            <span style={{ fontSize: 11, color: articleResult.ok ? '#16a34a' : '#b91c1c' }}>
              {articleResult.text}
            </span>
          )}
        </div>
        <div className="v17-action-row">
          <select
            className="v17-select"
            value={eventSector}
            onChange={(e) => setEventSector(e.target.value)}
            disabled={eventsRunning}
          >
            <option value="">All sectors</option>
            <option value="Fashion">Fashion</option>
            <option value="Watches &amp; Jewellery">Watches &amp; Jewellery</option>
            <option value="Hospitality">Hospitality</option>
            <option value="Beauty">Beauty</option>
          </select>
          <button
            type="button"
            className="v17-btn-secondary"
            onClick={handleGenerateEvents}
            disabled={eventsRunning}
          >
            {eventsRunning ? 'Generating…' : 'Generate events'}
          </button>
          {eventsResult && (
            <span style={{ fontSize: 11, color: eventsResult.ok ? '#16a34a' : '#b91c1c' }}>
              {eventsResult.text}
            </span>
          )}
        </div>
        <div className="v17-action-row">
          <select
            className="v17-select"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            disabled={reportRunning}
          >
            <option value="salary">Salary report</option>
            <option value="hiring">Hiring report</option>
            <option value="market">Market report</option>
            <option value="career">Career report</option>
          </select>
          <button
            type="button"
            className="v17-btn-secondary"
            onClick={handleGenerateReport}
            disabled={reportRunning}
          >
            {reportRunning ? 'Generating…' : 'Generate report'}
          </button>
          {reportResult && (
            <span style={{ fontSize: 11, color: reportResult.ok ? '#16a34a' : '#b91c1c' }}>
              {reportResult.text}
            </span>
          )}
        </div>
      </div>

      {/* Block — Enrich (AI, live write, not a draft) */}
      <div className="v17-block">
        <div className="v17-block-head">
          <span className="v17-dot purple" />
          <span className="v17-block-title">Enrich card intelligence</span>
          <span className="v17-tag">AI · live write</span>
        </div>
        <div className="v17-block-desc">
          Runs Haiku across all published brands to refresh card markers from the latest signals. Writes live to brand cards — not a queue draft.
        </div>
        <div className="v17-action-row">
          <button
            type="button"
            className="v17-btn-secondary"
            onClick={handleEnrichCardIntel}
            disabled={cardIntelRunning}
            style={cardIntelConfirm ? { color: '#b45309', borderColor: '#b45309' } : undefined}
          >
            {cardIntelRunning
              ? 'Enriching…'
              : cardIntelConfirm
                ? '⚠ Writes live to brand cards — click again'
                : 'Enrich card intelligence'}
          </button>
          {cardIntelResult && (
            <span style={{ fontSize: 11, color: cardIntelResult.ok ? '#16a34a' : '#b91c1c' }}>
              {cardIntelResult.text}
            </span>
          )}
        </div>
      </div>

      {/* Block C — Paused / blocked */}
      <div className="v17-block">
        <div className="v17-block-head">
          <span className="v17-dot gray" />
          <span className="v17-block-title">Paused / blocked</span>
        </div>
        <div className="v17-action-row">
          <button type="button" className="v17-btn-secondary" disabled>Salary generation</button>
          <span className="v17-hint">5,697 live benchmarks · generation paused</span>
        </div>
        <div className="v17-action-row">
          <button type="button" className="v17-btn-secondary" disabled>Interview guides</button>
          <span className="v17-hint">Hydration bug · fix required before use</span>
        </div>
      </div>
    </>
  )

  return (
    <div className="v17-root">
      <style>{STYLE}</style>

      <aside className="v17-sidebar">
        <div className="v17-logo-row">
          <span className="v17-logo">JOBLUX</span>
          <span className="v17-logo-badge">ADMIN</span>
        </div>

        <nav className="v17-nav-section">
          <div className="v17-nav-label">Overview</div>
          <a className="v17-nav-item" href="/admin/dashboard">
            <IconDashboard />
            <span>Dashboard</span>
          </a>
        </nav>

        <nav className="v17-nav-section">
          <div className="v17-nav-label">Intelligence</div>
          <a className="v17-nav-item" href="/admin/wikilux">
            <IconWikiLux />
            <span>WikiLux</span>
          </a>
          <a className="v17-nav-item" href="/admin/signals">
            <IconSignals />
            <span>Signals</span>
          </a>
          <a className="v17-nav-item" href="/admin/events">
            <IconEvents />
            <span>Events</span>
          </a>
        </nav>

        <nav className="v17-nav-section">
          <div className="v17-nav-label">LuxAI</div>
          <a className="v17-nav-item active" href="/admin/luxai">
            <IconCommand />
            <span>Command center</span>
          </a>
          <a className="v17-nav-item" href="/admin/content-queue">
            <IconQueue />
            <span>Content queue</span>
          </a>
        </nav>

        <nav className="v17-nav-section">
          <div className="v17-nav-label">Recruiting</div>
          <a className="v17-nav-item" href="/admin/assignments">
            <IconAssignments />
            <span>Assignments</span>
          </a>
        </nav>

        <div className="v17-sidebar-footer">
          <div className="v17-footer-live">
            <span className="v17-footer-dot" />
            <span>Live · joblux.com</span>
          </div>
          <div className="v17-footer-rss">Last RSS: 11 May 2026</div>
        </div>
      </aside>

      <main className="v17-main">
        <div className="v17-topbar">
          <div className="v17-topbar-left">
            <span className="v17-topbar-title">LuxAI</span>
            <span className="v17-topbar-sub">Command center</span>
          </div>
          <div className="v17-topbar-right">
            <button type="button" className="v17-btn-secondary">
              ↻ Pull RSS now
            </button>
            <span className="v17-admin-pill">ADMIN</span>
          </div>
        </div>

        <div className="v17-tabbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`v17-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="v17-content">
          {activeTab === 'overview' ? (
            renderOverview()
          ) : activeTab === 'operations' ? (
            renderOperations()
          ) : activeTab === 'queue' ? (
            renderQueue()
          ) : activeTab === 'signals' ? (
            renderSignals()
          ) : activeTab === 'events' ? (
            renderEvents()
          ) : activeTab === 'articles' ? (
            renderArticles()
          ) : activeTab === 'analytics' ? (
            renderAnalytics()
          ) : activeTab === 'brands' ? (
            renderBrands()
          ) : (
            <h1 className="v17-pane-heading">{activeLabel}</h1>
          )}
        </div>
      </main>
    </div>
  )
}
