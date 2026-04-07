'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'

interface HomepageHeroProps {
  assignmentCount: number
  signalCount?: number
  eventCount?: number
  articleCount?: number
}

interface SalaryResult {
  low: string
  target: string
  high: string
  analysis: string
}

export function HomepageHero({ assignmentCount, signalCount = 54, eventCount = 9, articleCount = 29 }: HomepageHeroProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SalaryResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    const segments = query.split(',').map(s => s.trim()).filter(Boolean)
    const job_title = segments[0] || ''
    const city = segments[1] || ''
    const brand = segments.length >= 3 ? segments.slice(2).join(', ') : ''

    if (!job_title) {
      setError('Enter a role to get started')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/luxai/salary-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_title, city, brand }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch {
      setError('Unable to calculate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { value: '180+', label: 'Brands' },
    { value: '7,000+', label: 'Salary records' },
    { value: String(assignmentCount), label: 'Assignments' },
    { value: String(signalCount), label: 'Signals' },
    { value: String(eventCount), label: 'Events' },
    { value: String(articleCount), label: 'Articles' },
  ]

  return (
    <section style={{ padding: '40px 0 32px', borderBottom: '0.5px solid #2b2b2b' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>

        {/* Eyebrow */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#a58e28', fontWeight: 700, marginBottom: 14 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a58e28', flexShrink: 0 }} />
          Luxury, decoded.
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 'clamp(28px,3.4vw,40px)', lineHeight: 1.08, fontWeight: 400, marginBottom: 14, color: '#fff' }}>
          Luxury Talent Intelligence
        </h1>

        {/* Subcopy */}
        <p style={{ maxWidth: 560, fontSize: '13.5px', lineHeight: 1.72, color: '#bbb', marginBottom: 22 }}>
          Career opportunities, salary benchmarks, market signals, and industry news across the world&apos;s leading luxury brands.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <Link href="/careers" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 40, padding: '0 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: '#fff', color: '#111', textDecoration: 'none' }}>
            Explore careers
          </Link>
          <Link href="/brands" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 40, padding: '0 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: 'transparent', border: '1px solid #333', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
            Browse brands
          </Link>
        </div>

        {/* Micro calculator */}
        <form onSubmit={handleSubmit} style={{ maxWidth: 640, marginBottom: 12 }}>
          <div style={{ display: 'flex', border: '1px solid #a58e28', borderRadius: 8, background: '#1c1c1c', overflow: 'hidden' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Store Director, Paris, Hermès… — estimate your salary"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '10px 16px', fontSize: '13.5px', color: '#fff', font: 'inherit' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#2a2a2a', color: 'rgba(255,255,255,0.85)', borderLeft: '0.5px solid #333', borderTop: 'none', borderRight: 'none', borderBottom: 'none', padding: '10px 18px', fontSize: 13, fontWeight: 500, cursor: loading ? 'default' : 'pointer', font: 'inherit' }}
            >
              {loading ? '…' : 'Calculate →'}
            </button>
          </div>
        </form>

        {/* Calculator result / error */}
        {(result || error) && (
          <div style={{ maxWidth: 640, marginBottom: 24 }}>
            {error && <div style={{ fontSize: '11.5px', color: '#888' }}>{error}</div>}
            {result && (
              <div>
                <div style={{ display: 'flex', gap: 28, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#ccc' }}>{result.low}</div>
                    <div style={{ fontSize: 9, letterSpacing: '1.1px', textTransform: 'uppercase', color: '#888' }}>Low</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#a58e28' }}>{result.target}</div>
                    <div style={{ fontSize: 9, letterSpacing: '1.1px', textTransform: 'uppercase', color: '#888' }}>Target</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#ccc' }}>{result.high}</div>
                    <div style={{ fontSize: 9, letterSpacing: '1.1px', textTransform: 'uppercase', color: '#888' }}>High</div>
                  </div>
                </div>
                <div style={{ fontSize: '11.5px', lineHeight: 1.6, color: '#888' }}>{result.analysis}</div>
              </div>
            )}
          </div>
        )}

        {/* Bottom row */}
        <div style={{ borderTop: '0.5px solid #2b2b2b', paddingTop: 16, marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: '#888' }}>
            No ads · No noise · No data reselling
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{ padding: '0 18px', borderRight: i < stats.length - 1 ? '0.5px solid #2e2e2e' : 'none' }}
              >
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 9, letterSpacing: '1.1px', textTransform: 'uppercase', color: '#888', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
