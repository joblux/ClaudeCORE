'use client'

import { useState } from 'react'
import Link from 'next/link'

export function HomepageBrief() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setMessage("You're subscribed. Welcome to The Brief.")
        setEmail('')
      } else {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section style={{ padding: '44px 0', borderTop: '0.5px solid #2b2b2b' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ background: 'linear-gradient(180deg,rgba(165,142,40,0.06),rgba(165,142,40,0.02))', border: '1px solid rgba(165,142,40,0.18)', borderRadius: 18, padding: 30, textAlign: 'center' }}>

          <div style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 28, marginBottom: 10, fontWeight: 400, color: '#fff' }}>
            The <em style={{ color: '#a58e28' }}>Brief</em>
          </div>

          <div style={{ maxWidth: 620, margin: '0 auto 22px', fontSize: '13.8px', lineHeight: 1.75, color: '#989898' }}>
            Signals, compensation intelligence, and career movement. Biweekly in your inbox.
          </div>

          {status === 'success' ? (
            <p style={{ fontSize: '13.8px', color: '#a58e28' }}>{message}</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{ width: 292, maxWidth: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #383838', background: '#212121', color: '#fff', font: 'inherit', outline: 'none' }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{ padding: '12px 20px', border: '1px solid #383838', borderRadius: 10, background: '#2a2a2a', color: 'rgba(255,255,255,0.88)', font: 'inherit', fontWeight: 700, cursor: 'pointer' }}
              >
                {status === 'loading' ? '...' : 'Subscribe'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p style={{ fontSize: 12, color: '#f44336', marginBottom: 8 }}>{message}</p>
          )}

          <div style={{ fontSize: '11.5px', color: '#6d6d6d' }}>
            Join professionals worldwide. No spam. Unsubscribe anytime.
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: '#7a7a7a', lineHeight: 1.6 }}>
            Travel editorial preview by{' '}
            <Link href="/escape" style={{ color: '#a58e28', fontFamily: 'var(--font-playfair), Playfair Display, serif', fontStyle: 'italic', textDecoration: 'none' }}>
              Escape
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
