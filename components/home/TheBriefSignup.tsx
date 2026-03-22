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
    <div className="bg-[#222222] p-5">
      <div className="jl-overline-gold mb-3">The Brief</div>
      <h3 className="jl-serif text-base font-light text-white mb-2">
        The Brief
      </h3>
      <p className="font-sans text-xs text-[#888] leading-relaxed mb-4">
        Luxury industry moves · Salary insights · Interview intelligence · Wiki updates. Delivered biweekly.
      </p>

      {status === 'success' ? (
        <p className="font-sans text-xs text-[#a58e28]">{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex border border-[#333]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-transparent px-3 py-2.5 font-sans text-xs text-white placeholder-[#555] outline-none"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-[#a58e28] text-[#1a1a1a] px-4 font-sans text-[0.6rem] font-bold tracking-widest uppercase hover:bg-[#e4b042] transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
          </div>
          {status === 'error' && (
            <p className="font-sans text-[0.65rem] text-red-400 mt-2">{message}</p>
          )}
          <p className="font-sans text-[0.6rem] text-[#555] mt-2">
            Free · No spam · Unsubscribe anytime
          </p>
        </form>
      )}
    </div>
  )
}
