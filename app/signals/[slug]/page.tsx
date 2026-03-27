'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  talent:  { bg: 'rgba(88,166,255,0.15)', text: '#58a6ff' },
  market:  { bg: 'rgba(63,185,80,0.15)',  text: '#3fb950' },
  brand:   { bg: 'rgba(240,136,62,0.15)', text: '#f0883e' },
  finance: { bg: 'rgba(163,113,247,0.15)', text: '#a371f7' },
  leadership:       { bg: 'rgba(240,136,62,0.15)', text: '#f0883e' },
  growth:           { bg: 'rgba(63,185,80,0.15)',  text: '#3fb950' },
  contraction:      { bg: 'rgba(248,81,73,0.15)',  text: '#f85149' },
  expansion:        { bg: 'rgba(88,166,255,0.15)', text: '#58a6ff' },
  merger_acquisition: { bg: 'rgba(163,113,247,0.15)', text: '#a371f7' },
}

const CATEGORY_LABELS: Record<string, string> = {
  talent: 'TALENT', market: 'MARKET', brand: 'BRAND', finance: 'FINANCE',
  leadership: 'LEADERSHIP', growth: 'GROWTH', contraction: 'CONTRACTION',
  expansion: 'EXPANSION', merger_acquisition: 'M&A',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function SignalDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [signal, setSignal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchSignal() {
      // Try by slug first, fallback to id
      let { data } = await supabase
        .from('signals')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (!data) {
        const res = await supabase
          .from('signals')
          .select('*')
          .eq('id', slug)
          .eq('is_published', true)
          .single()
        data = res.data
      }

      setSignal(data)
      setLoading(false)
    }
    fetchSignal()
  }, [slug])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      '_blank'
    )
  }

  const handleEmail = () => {
    if (!signal) return
    window.location.href = `mailto:?subject=${encodeURIComponent(signal.headline)}&body=${encodeURIComponent(`${signal.headline}\n\n${window.location.href}`)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-5 h-5 border border-[#333] border-t-[#a58e28] rounded-full animate-spin" />
      </div>
    )
  }

  if (!signal) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[15px] text-[#666] mb-4">Signal not found.</p>
          <Link href="/signals" className="text-[13px] text-[#a58e28] hover:text-[#c4a830] transition-colors">
            ← Back to Signals
          </Link>
        </div>
      </div>
    )
  }

  const colors = BADGE_COLORS[signal.category] || { bg: 'rgba(136,136,136,0.15)', text: '#888' }
  const label = CATEGORY_LABELS[signal.category] || signal.category?.toUpperCase() || 'SIGNAL'

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[720px] mx-auto px-7 pt-10 pb-16">

        {/* Back link */}
        <Link href="/signals" className="text-[13px] text-[#555] hover:text-[#a58e28] transition-colors mb-8 inline-block">
          ← Back to Signals
        </Link>

        {/* Badge + meta */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-[10px] font-bold tracking-[0.1em] px-2 py-[2px] rounded"
            style={{ background: colors.bg, color: colors.text }}
          >
            {label}
          </span>
          {signal.brand && <span className="text-[13px] text-[#666]">{signal.brand}</span>}
        </div>

        {/* Headline */}
        <h1 className="text-[28px] text-white leading-snug mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {signal.headline}
        </h1>

        {/* Date + region */}
        <div className="flex items-center gap-4 mb-8 text-[12px] text-[#555]">
          {signal.published_at && <span>{formatDate(signal.published_at)}</span>}
          {signal.region && (
            <>
              <span className="text-[#333]">·</span>
              <span>{signal.region}</span>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#222] mb-8" />

        {/* Body */}
        <div className="text-[15px] text-[#ccc] leading-[1.8] space-y-4 mb-10">
          {(signal.body || signal.context_paragraph || signal.summary || '').split('\n').map((p: string, i: number) => (
            p.trim() ? <p key={i}>{p}</p> : null
          ))}
        </div>

        {/* Brand tags */}
        {signal.brand_tags && signal.brand_tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-10">
            {signal.brand_tags.map((b: string) => (
              <span key={b} className="text-[11px] px-2.5 py-1 rounded bg-[#222] text-[#a58e28] border border-[#2a2a2a]">
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Related content placeholders */}
        <div className="border-t border-[#222] pt-8 mb-8">
          <p className="text-[10px] text-[#444] uppercase tracking-[0.14em] mb-4">Related</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-4">
              <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">WikiLux</p>
              <p className="text-[13px] text-[#666]">{signal.brand || 'Brand'} profile</p>
            </div>
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-4">
              <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Careers</p>
              <p className="text-[13px] text-[#666]">Related opportunities</p>
            </div>
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-4">
              <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Events</p>
              <p className="text-[13px] text-[#666]">Upcoming events</p>
            </div>
          </div>
        </div>

        {/* Share row */}
        <div className="border-t border-[#222] pt-6">
          <div className="flex items-center gap-1 text-[12px] text-[#555]">
            <button onClick={handleCopyLink} className="hover:text-[#a58e28] transition-colors">
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <span className="text-[#333]">·</span>
            <button onClick={handleLinkedIn} className="hover:text-[#a58e28] transition-colors">
              Share on LinkedIn
            </button>
            <span className="text-[#333]">·</span>
            <button onClick={handleEmail} className="hover:text-[#a58e28] transition-colors">
              Send to a colleague
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
