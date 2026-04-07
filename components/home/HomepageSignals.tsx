import Link from 'next/link'

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

interface Signal {
  slug: string
  headline: string
  category: string
  brand_tags: string[] | null
  published_at: string | null
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function HomepageSignals({ signals }: { signals: Signal[] }) {
  if (signals.length === 0) return null

  return (
    <section style={{ padding: '44px 0', borderTop: '0.5px solid #2b2b2b' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, color: '#fff' }}>
              Market Signals
            </div>
            <p style={{ marginTop: 8, color: '#bbb', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
              Market movement with direct implications for hiring, leadership, and timing.
            </p>
          </div>
          <Link href="/signals" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            View all signals &rarr;
          </Link>
        </div>

        <div>
          {signals.map((signal) => {
            const color = categoryColors[signal.category] || '#888'
            const label = categoryLabels[signal.category] || signal.category
            return (
              <Link
                key={signal.slug}
                href={`/signals/${signal.slug}`}
                className="signal-row"
                style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '9px 0', borderBottom: '0.5px solid #1e1e1e', textDecoration: 'none' }}
              >
                <div style={{ width: 90, flexShrink: 0, fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.9px', color }}>
                  {label}
                </div>
                <div style={{ flex: 1, fontSize: '13.5px', color: '#ccc', lineHeight: 1.4 }}>
                  {signal.headline}
                </div>
                <div className="signal-meta" style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>
                  {(signal.brand_tags || []).join(' · ')}
                </div>
                <div className="signal-meta" style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {timeAgo(signal.published_at)}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      <style>{`
        @media (max-width: 767px) {
          .signal-row { flex-wrap: wrap; }
          .signal-row .signal-meta { width: 100%; text-align: left !important; }
        }
      `}</style>
    </section>
  )
}
