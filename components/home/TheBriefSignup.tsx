'use client'

import { useState } from 'react'

export function TheBriefSignup() {
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setMessage('You are subscribed. Welcome to The Brief.')
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
    <div>
      <div className="jl-overline-gold mb-1">The Brief</div>
      <p className="font-sans text-xs text-[#888] leading-relaxed mb-3">
        Luxury intelligence digest. Biweekly.
      </p>

      {status === 'success' ? (
        <p className="font-sans text-xs text-[#a58e28]">{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-transparent px-3 py-2 font-sans text-xs text-white placeholder-[#555] border border-[#444] outline-none focus:border-[#a58e28] transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-[#a58e28] text-[#1a1a1a] px-4 py-2 font-sans text-[0.6rem] font-bold tracking-widest uppercase hover:bg-[#e4b042] transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
          </div>
          {status === 'error' && (
            <p className="font-sans text-[0.65rem] text-red-400 mt-1">{message}</p>
          )}
        </form>
      )}
    </div>
  )
}
