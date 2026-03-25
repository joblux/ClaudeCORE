import Link from 'next/link'

const categoryColors: Record<string, string> = {
  growth: '#4CAF50',
  leadership: '#FF9800',
  contraction: '#f44336',
  expansion: '#2196F3',
  merger_acquisition: '#9C27B0',
}

const categoryLabels: Record<string, string> = {
  growth: 'GROWTH',
  leadership: 'LEADERSHIP',
  contraction: 'CONTRACTION',
  expansion: 'EXPANSION',
  merger_acquisition: 'M&A',
}

interface Signal {
  id: string
  category: string
  confidence: string
  headline: string
  context_paragraph: string | null
  brand_tags: string[]
  published_at: string | null
}

const placeholderSignals: Signal[] = [
  {
    id: '1', category: 'growth', confidence: 'high',
    headline: 'LVMH reports record Q4 revenue across fashion & leather goods division',
    context_paragraph: 'Revenue growth driven by strong demand in Asia-Pacific and the Americas, signaling continued hiring momentum across key maisons.',
    brand_tags: ['LVMH', 'Louis Vuitton', 'Dior'], published_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '2', category: 'leadership', confidence: 'high',
    headline: 'Kering appoints new CEO for Gucci, signaling strategic pivot',
    context_paragraph: 'Leadership change expected to reshape creative direction and commercial strategy. Key roles in merchandising and retail likely to open.',
    brand_tags: ['Kering', 'Gucci'], published_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: '3', category: 'expansion', confidence: 'medium',
    headline: 'Hermès opens three new flagship stores across Asia-Pacific',
    context_paragraph: 'Expansion into Seoul, Bangkok, and Melbourne reflects bullish outlook on APAC luxury retail. Store management and clienteling roles expected.',
    brand_tags: ['Hermès'], published_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: '4', category: 'contraction', confidence: 'high',
    headline: 'Burberry announces restructuring, 400 roles affected globally',
    context_paragraph: 'Cost reduction program targets corporate and retail operations. Severance packages being offered across UK, US, and APAC offices.',
    brand_tags: ['Burberry'], published_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
]

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
  const items = signals.length > 0 ? signals : placeholderSignals

  return (
    <section className="px-7 py-10">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[22px] text-white font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
            Latest signals
          </h2>
          <Link href="/signals" className="text-[12px] text-[#a58e28] hover:text-[#e4b042] transition-colors">
            View all signals →
          </Link>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.slice(0, 4).map((signal) => {
            const color = categoryColors[signal.category] || '#888'
            const label = categoryLabels[signal.category] || signal.category.toUpperCase()
            return (
              <div
                key={signal.id}
                className="bg-[#222] border border-[#2a2a2a] rounded-[6px] p-5"
              >
                {/* Category */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block w-[7px] h-[7px] rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[11px] font-semibold tracking-wide" style={{ color, fontFamily: 'Inter, sans-serif' }}>
                    {label}
                  </span>
                </div>

                {/* Headline */}
                <p className="text-[14px] text-[#ddd] leading-[1.5] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {signal.headline}
                </p>

                {/* Footer: brand pills + timestamp */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {(signal.brand_tags || []).slice(0, 3).map((brand) => (
                      <span
                        key={brand}
                        className="text-[10px] text-[#a58e28] border border-[#a58e28]/40 rounded-full px-2.5 py-0.5"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#555] flex-shrink-0 ml-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {timeAgo(signal.published_at)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
