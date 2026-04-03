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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff' }}>Latest signals</h2>
            <p style={{ marginTop: 6, color: '#989898', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
              Market movement with direct implications for hiring, leadership, and timing.
            </p>
          </div>
          <Link href="/signals" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            View all signals &rarr;
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {signals.map((signal) => {
            const color = categoryColors[signal.category] || '#888'
            const label = categoryLabels[signal.category] || signal.category
            return (
              <Link
                key={signal.slug}
                href={`/signals/${signal.slug}`}
                style={{ display: 'block', padding: 19, background: '#202020', border: '1px solid #2b2b2b', borderRadius: 10, textDecoration: 'none', transition: 'all 0.2s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10, letterSpacing: '0.9px', textTransform: 'uppercase', fontWeight: 700, color }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    {label}
                  </div>
                  <div style={{ fontSize: 11, color: '#6f6f6f' }}>{timeAgo(signal.published_at)}</div>
                </div>

                <div style={{ fontSize: 14, lineHeight: 1.52, color: 'rgba(255,255,255,0.92)', marginBottom: 14 }}>
                  {signal.headline}
                </div>

                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {(signal.brand_tags || []).map((tag) => (
                    <span key={tag} style={{ fontSize: 10, color: '#818181', background: '#242424', borderRadius: 999, padding: '5px 10px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
