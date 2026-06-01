'use client'

import { useEffect, useState } from 'react'

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
`

export default function CommandCenterV17() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const [inventory, setInventory] = useState<InventoryRow[]>([])
  const [invLoading, setInvLoading] = useState(true)
  const [invError, setInvError] = useState(false)

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
          ) : (
            <h1 className="v17-pane-heading">{activeLabel}</h1>
          )}
        </div>
      </main>
    </div>
  )
}
