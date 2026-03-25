'use client'

import { useState } from 'react'

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
        setMessage('You\'re subscribed. Welcome to The Brief.')
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
    <section className="bg-[#222] px-7 py-14">
      <div className="max-w-[480px] mx-auto text-center">
        <h2 className="text-[22px] text-white font-light mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          The{' '}
          <span className="italic text-[#a58e28]">Brief</span>
        </h2>

        <p className="text-[13px] text-[#777] leading-relaxed mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
          Luxury market signals, salary intelligence, and career moves. Biweekly in your inbox.
        </p>

        {status === 'success' ? (
          <p className="text-[13px] text-[#a58e28]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-[3px] px-4 py-3 text-[13px] text-white placeholder-[#555] outline-none focus:border-[#a58e28] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-[#a58e28] text-[#1a1a1a] px-6 py-3 rounded-[3px] text-[12px] font-semibold tracking-wide hover:bg-[#e4b042] transition-colors disabled:opacity-50 flex-shrink-0"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {status === 'loading' ? '...' : 'Subscribe'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-[12px] text-red-400 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{message}</p>
            )}
          </form>
        )}

        <p className="text-[11px] text-[#555] mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>
          250,000+ luxury professionals. No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}
