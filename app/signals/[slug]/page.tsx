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

  // SEO: set document title and meta description from DB fields
  useEffect(() => {
    if (!signal) return
    if (signal.meta_title) {
      document.title = signal.meta_title
    } else if (signal.headline) {
      document.title = `${signal.headline} | JOBLUX Signals`
    }
    if (signal.meta_description) {
      let metaTag = document.querySelector('meta[name="description"]')
      if (!metaTag) {
        metaTag = document.createElement('meta')
        metaTag.setAttribute('name', 'description')
        document.head.appendChild(metaTag)
      }
      metaTag.setAttribute('content', signal.meta_description)
    }
  }, [signal])

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
          <p className="text-[15px] text-[#999] mb-4">Signal not found.</p>
          <Link href="/signals" className="text-[13px] text-[#a58e28] hover:text-[#c4a830] transition-colors">
            ← Back to Signals
          </Link>
        </div>
      </div>
    )
  }

  const colors = BADGE_COLORS[signal.category] || { bg: 'rgba(136,136,136,0.15)', text: '#888' }
  const label = CATEGORY_LABELS[signal.category] || signal.category?.toUpperCase() || 'SIGNAL'
  const careerDetail = signal.career_detail as string[] | null
  const brandImpact = signal.brand_impact as string[] | null

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[720px] mx-auto px-7 pt-10 pb-16">

        {/* Back link */}
        <Link href="/signals" className="text-[10px] text-[#a58e28] uppercase tracking-[2px] hover:underline transition-colors mb-8 inline-block">
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
          {signal.brand && <span className="text-[13px] text-[#999]">{signal.brand}</span>}
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-normal text-white leading-snug mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          {signal.headline}
        </h1>

        {/* Date + region */}
        <div className="flex items-center gap-4 mb-8 text-[12px] text-[#999]">
          {signal.published_at && <span>{formatDate(signal.published_at)}</span>}
          {signal.region && (
            <>
              <span className="text-[#777]">·</span>
              <span>{signal.region}</span>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#222] mb-8" />

        {/* What happened */}
        {signal.what_happened && (
          <div className="mb-8">
            <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] mb-3">What happened</p>
            <p className="text-[15px] text-white leading-[1.8]">{signal.what_happened}</p>
          </div>
        )}

        {/* Why it matters */}
        {signal.why_it_matters && (
          <div className="bg-[#141414] border border-[#1e1e1e] rounded p-6 mb-8">
            <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] mb-3">Why it matters</p>
            <p className="text-[14px] text-[#ccc] leading-[1.8]">{signal.why_it_matters}</p>
          </div>
        )}

        {/* Long context (main editorial body) */}
        {signal.long_context && (
          <div className="text-[15px] text-[#ccc] leading-[1.8] space-y-4 mb-10">
            {signal.long_context.split('\n').map((p: string, i: number) => (
              p.trim() ? <p key={i}>{p}</p> : null
            ))}
          </div>
        )}

        {/* Fallback: original body/summary if no long_context */}
        {!signal.long_context && (signal.body || signal.context_paragraph || signal.summary) && (
          <div className="text-[15px] text-[#ccc] leading-[1.8] space-y-4 mb-10">
            {(signal.body || signal.context_paragraph || signal.summary || '').split('\n').map((p: string, i: number) => (
              p.trim() ? <p key={i}>{p}</p> : null
            ))}
          </div>
        )}

        {/* Career implications */}
        {careerDetail && careerDetail.length > 0 && (
          <div className="bg-[#141414] border border-[#1e1e1e] rounded p-6 mb-8">
            <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] mb-4">Career implications</p>
            <ol className="space-y-3">
              {careerDetail.map((item, i) => (
                <li key={i} className="flex gap-3 text-[14px] text-[#ccc] leading-relaxed">
                  <span className="text-[#a58e28] font-semibold shrink-0">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Brand intelligence */}
        {brandImpact && brandImpact.length > 0 && (
          <div className="mb-10">
            <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] mb-4">Brand intelligence</p>
            <ul className="space-y-3">
              {brandImpact.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-[#ccc] leading-relaxed">
                  <span className="mt-[7px] w-[6px] h-[6px] rounded-full bg-[#a58e28] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

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

        {/* Related content */}
        <div className="border-t border-[#222] pt-8 mb-8">
          <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] mb-4">Related</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-4">
              <p className="text-[10px] text-[#999] uppercase tracking-wider mb-2">WikiLux</p>
              <p className="text-[13px] text-[#999]">{signal.brand || 'Brand'} profile</p>
            </div>
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-4">
              <p className="text-[10px] text-[#999] uppercase tracking-wider mb-2">Careers</p>
              <p className="text-[13px] text-[#999]">Related opportunities</p>
            </div>
            <div className="bg-[#141414] border border-[#1e1e1e] rounded p-4">
              <p className="text-[10px] text-[#999] uppercase tracking-wider mb-2">Events</p>
              <p className="text-[13px] text-[#999]">Upcoming events</p>
            </div>
          </div>
        </div>

        {/* Share row */}
        <div className="border-t border-[#222] pt-6">
          <div className="flex items-center gap-3 text-[12px] text-[#999]">
            <button onClick={handleCopyLink} className="hover:text-[#a58e28] transition-colors">
              {copied ? 'Copied' : 'Share'}
            </button>
            <span className="text-[#777]">·</span>
            <button onClick={handleLinkedIn} className="hover:text-[#a58e28] transition-colors">
              Share on LinkedIn
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
