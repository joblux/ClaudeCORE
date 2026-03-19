'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function PendingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return

    fetch(`/api/members/profile?email=${encodeURIComponent(session.user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.member && !data.member.registration_completed) {
          router.replace('/members/complete-registration')
        } else {
          setChecked(true)
        }
      })
      .catch(() => setChecked(true))
  }, [status, session, router])

  if (status === 'loading' || !checked) {
    return (
      <main className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <p className="text-sm text-[#888]">Loading...</p>
      </main>
    )
  }

  const firstName = session?.user?.firstName || session?.user?.name?.split(' ')[0] || 'there'

  return (
    <main className="min-h-screen bg-[#f5f4f0] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] text-center">
        {/* Logo */}
        <div className="mb-10">
          <h1
            className="text-4xl font-semibold text-[#1a1a1a] tracking-[3px]"
            style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}
          >
            JOBLUX
          </h1>
          <p className="text-[11px] text-[#a58e28] tracking-[4px] uppercase mt-1">
            Luxury Talents Intelligence
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#e8e6df] rounded-sm p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#fdf8e8] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#a58e28]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2
            className="text-2xl text-[#1a1a1a] mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Pending Approval
          </h2>
          <p className="text-sm text-[#777] leading-relaxed mb-4">
            Thank you for registering, {firstName}.
            Your membership is under review.
          </p>
          <p className="text-xs text-[#999] leading-relaxed">
            Every JOBLUX member is personally approved.
            You&apos;ll receive an email once your access is confirmed.
          </p>
        </div>

        <a
          href="/"
          className="inline-block mt-6 text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors"
        >
          &larr; Return to homepage
        </a>
      </div>
    </main>
  )
}
