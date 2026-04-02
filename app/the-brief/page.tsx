'use client'

import { useState } from 'react'

export default function TheBriefPage() {
  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState<'idle'|'loading'|'success'|'error'>('idle')
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
    <div className="bg-[#1a1a1a]">
      {/* HERO */}
      <div className="bg-[#222222] py-16">
        <div className="jl-container-xs text-center">
          <div className="jl-overline-gold mb-4">Biweekly Newsletter</div>
          <h1 className="text-4xl font-normal text-white mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            The Brief
          </h1>
          <p className="font-sans text-sm text-[#888] mb-10 max-w-md mx-auto leading-relaxed">
            Luxury industry moves · Salary insights · New positions · WikiLux updates.
            Delivered biweekly. Free.
          </p>

          {status === 'success' ? (
            <div className="bg-[#a58e28] text-[#1a1a1a] px-8 py-4 inline-block">
              <p className="font-sans text-sm font-semibold">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex border border-[#333]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-transparent px-4 py-3.5 font-sans text-sm text-white placeholder-[#555] outline-none"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-[#a58e28] text-[#1a1a1a] px-6 font-sans text-[0.7rem] font-bold tracking-widest uppercase hover:bg-[#e4b042] transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? '...' : 'Subscribe'}
                </button>
              </div>
              {status === 'error' && (
                <p className="font-sans text-xs text-red-400 mt-2 text-left">{message}</p>
              )}
              <p className="font-sans text-[0.65rem] text-[#999] mt-3">
                Free · No spam · Unsubscribe anytime · Join luxury professionals worldwide
              </p>
            </form>
          )}
        </div>
      </div>

      {/* WHAT'S INSIDE */}
      <div className="bg-[#1a1a1a] py-12">
        <div className="jl-container">
          <div className="jl-container-sm mx-auto">
            <div className="jl-section-label"><span>What's Inside Every Issue</span></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {[
                { n: '01', title: 'Industry Moves',      desc: 'Who moved where. Senior appointments, departures and promotions across the major maisons.' },
                { n: '02', title: 'Salary Intelligence',  desc: 'One role, one market, detailed compensation breakdown. Real data from JOBLUX placements.' },
                { n: '03', title: 'New Positions',        desc: 'The week\'s most interesting confidential briefs. Manager to Executive, \u20ac100K+.' },
                { n: '04', title: 'WikiLux Spotlight',    desc: 'One brand in depth. History, culture, what they look for in candidates.' },
                { n: '05', title: 'Market Intelligence',  desc: 'Hiring trends by market. Where luxury is growing, where it\'s contracting.' },
                { n: '06', title: 'Travel & Lifestyle',   desc: 'One luxury destination or experience. The world through the JOBLUX lens.' },
              ].map((item) => (
                <div key={item.n} className="flex gap-4">
                  <div className="jl-serif text-2xl font-light text-[#a58e28] flex-shrink-0 w-8">{item.n}</div>
                  <div>
                    <h3 className="font-sans text-sm font-semibold text-white mb-1">{item.title}</h3>
                    <p className="font-sans text-xs text-[#888] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* LAUNCH NOTE */}
            <div className="mt-12 border-t border-[#2a2a2a] pt-8 text-center">
              <p className="font-sans text-sm text-white mb-2">The Brief is launching soon.</p>
              <p className="font-sans text-xs text-[#888]">
                Subscribe now to receive the first issues and future archive updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
