'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function PendingPage() {
  const { data: session } = useSession()
  const firstName = (session?.user as any)?.firstName || ''

  return (
    <main className="min-h-screen bg-[#fafaf5] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h2 className="jl-serif text-3xl text-[#1a1a1a] mb-2">JOBLUX</h2>
        <p className="text-sm tracking-[0.2em] uppercase text-[#a58e28] mb-10">
          Luxury Talents Intelligence
        </p>
        <div className="bg-white border border-[#e8e2d8] rounded-sm p-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#fafaf5] border border-[#e8e2d8] flex items-center justify-center">
            <svg className="w-6 h-6 text-[#a58e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="jl-serif text-xl text-[#1a1a1a] mb-2">Pending Approval</h3>
          <p className="text-sm text-[#666] mb-4">
            {firstName ? `Thank you for registering, ${firstName}.` : 'Thank you for registering.'} Your membership is under review.
          </p>
          <p className="text-xs text-[#999]">
            Every JOBLUX member is personally approved. You will receive an email once your access is confirmed.
          </p>
        </div>
        <Link href="/" className="text-sm text-[#a58e28] hover:text-[#1a1a1a] transition-colors mt-6 inline-block">
          &larr; Return to homepage
        </Link>
      </div>
    </main>
  )
}
