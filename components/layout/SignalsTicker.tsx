'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const categoryColors: Record<string, string> = {
  growth: '#4CAF50',
  leadership: '#FF9800',
  contraction: '#f44336',
  expansion: '#2196F3',
  merger_acquisition: '#9C27B0',
}

interface Signal {
  slug: string
  category: string
  headline: string
}

export function SignalsTicker() {
  const [signals, setSignals] = useState<Signal[]>([])

  useEffect(() => {
    async function fetchSignals() {
      const { data } = await supabase
        .from('signals')
        .select('slug, headline, category')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(6)

      if (data && data.length > 0) {
        setSignals(data)
      }
    }
    fetchSignals()
  }, [])

  if (signals.length === 0) return null

  const items = [...signals, ...signals]

  return (
    <div style={{ borderBottom: '0.5px solid #2b2b2b', background: '#1c1c1c', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ height: 36, display: 'flex', alignItems: 'center', gap: 18, overflow: 'hidden' }}>
          <div style={{ fontSize: 10, letterSpacing: '1.4px', color: '#a58e28', fontWeight: 700, flexShrink: 0 }}>
            SIGNALS
          </div>

          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                animation: `ticker-scroll ${signals.length * 6}s linear infinite`,
              }}
            >
              {items.map((signal, i) => (
                <Link
                  key={`${signal.slug}-${i}`}
                  href={`/signals/${signal.slug}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingRight: 32, fontSize: 12, color: 'rgba(255,255,255,0.56)', textDecoration: 'none', flexShrink: 0 }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: categoryColors[signal.category] || '#888', flexShrink: 0 }} />
                  <span>{signal.headline}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
