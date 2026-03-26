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
  id: string
  category: string
  headline: string
}

const placeholderSignals: Signal[] = [
  { id: '1', category: 'growth', headline: 'LVMH reports record Q4 revenue across fashion & leather goods division' },
  { id: '2', category: 'leadership', headline: 'Kering appoints new CEO for Gucci, signaling strategic pivot' },
  { id: '3', category: 'expansion', headline: 'Hermès opens three new flagship stores across Asia-Pacific' },
  { id: '4', category: 'contraction', headline: 'Burberry announces restructuring, 400 roles affected globally' },
  { id: '5', category: 'merger_acquisition', headline: 'Tapestry-Capri merger blocked — luxury M&A landscape shifts' },
  { id: '6', category: 'growth', headline: 'Richemont jewelry division up 14% — Cartier and Van Cleef lead' },
  { id: '7', category: 'leadership', headline: 'Chanel promotes head of fashion to global brand president' },
  { id: '8', category: 'expansion', headline: 'Dior opens largest global beauty flagship in Seoul Gangnam' },
]

export function SignalsTicker() {
  const [signals, setSignals] = useState<Signal[]>(placeholderSignals)

  useEffect(() => {
    async function fetchSignals() {
      const { data } = await supabase
        .from('signals')
        .select('id, category, headline')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(10)

      if (data && data.length > 0) {
        setSignals(data)
      }
    }
    fetchSignals()
  }, [])

  const items = [...signals, ...signals]

  return (
    <div className="bg-[#222222] border-b border-[#2a2a2a] overflow-hidden">
      <div className="max-w-[1200px] mx-auto flex items-center h-[36px]">
        {/* SIGNALS label */}
        <div className="flex-shrink-0 px-5 flex items-center h-full border-r border-[#333]">
          <span
            className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#a58e28]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            SIGNALS
          </span>
        </div>

        {/* Scrolling headlines */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center animate-ticker whitespace-nowrap">
            {items.map((signal, i) => (
              <Link
                key={`${signal.id}-${i}`}
                href="/signals"
                className="inline-flex items-center gap-2 px-5 text-[12px] text-[#999] hover:text-white transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <span
                  className="inline-block w-[5px] h-[5px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: categoryColors[signal.category] || '#888' }}
                />
                <span className="whitespace-nowrap">{signal.headline}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
