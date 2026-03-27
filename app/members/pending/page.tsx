'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function PendingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [approved, setApproved] = useState(false)
  const firstName = (session?.user as any)?.firstName || ''
  const userStatus = (session?.user as any)?.status

  useEffect(() => {
    if (userStatus === 'approved') router.push('/dashboard')
  }, [userStatus, router])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/members/profile')
        if (res.ok) {
          const data = await res.json()
          const status = data.status || data.member?.status
          if (status === 'approved') {
            await update()
            setApproved(true)
            clearInterval(interval)
          }
        }
      } catch {}
    }, 5000)
    return () => clearInterval(interval)
  }, [update])

  if (approved) {
    return (
      <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-10">
            <a href="/"><Image src="/logos/joblux-header.png" alt="JOBLUX" width={100} height={28} className="h-7 w-auto opacity-60" /></a>
          </div>
          <div className="bg-[#222] border border-[#2a2a2a] rounded-sm p-10">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#1a1a1a] border border-[#a58e28] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#a58e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Welcome{firstName ? `, ${firstName}` : ''}.
            </h3>
            <p className="text-sm text-[#999] mb-8 leading-relaxed">Your account has been approved. The intelligence is ready.</p>
            <Link href="/dashboard" className="inline-block px-10 py-3 bg-[#1a1a1a] text-white text-xs font-semibold tracking-[0.15em] uppercase hover:bg-[#333] transition-colors">
              Enter Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-10">
          <a href="/"><Image src="/logos/joblux-header.png" alt="JOBLUX" width={100} height={28} className="h-7 w-auto opacity-60" /></a>
        </div>
        <div className="bg-[#222] border border-[#2a2a2a] rounded-sm p-10">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
            <svg className="w-6 h-6 text-[#a58e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {firstName ? `Thank you, ${firstName}.` : 'Thank you.'}
          </h3>
          <p className="text-sm text-[#999] mb-2 leading-relaxed">Your request is under review.</p>
          <p className="text-xs text-[#999] leading-relaxed mb-8">We personally review every profile. You&apos;ll receive an email once your access is confirmed — typically within 24 hours.</p>
          <div className="flex items-center justify-center gap-2 text-xs text-[#bbb] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a58e28] animate-pulse" />
            Checking for updates...
          </div>
          <div className="border-t border-[#2a2a2a] pt-6">
            <p className="text-xs text-[#bbb] leading-relaxed">
              In the meantime, explore{' '}
              <Link href="/brands" className="text-[#a58e28] hover:text-white transition-colors">brand intelligence</Link>
              {' '}or read{' '}
              <Link href="/insights" className="text-[#a58e28] hover:text-white transition-colors">the latest insights</Link>.
            </p>
          </div>
        </div>
        <Link href="/" className="text-sm text-[#aaa] hover:text-white transition-colors mt-6 inline-block">← Return to homepage</Link>
      </div>
    </main>
  )
}
