'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMember } from '@/lib/auth-hooks'

interface OpportunityDetailClientProps {
  assignmentId: string
  isSticky: boolean
}

export default function OpportunityDetailClient({ assignmentId, isSticky }: OpportunityDetailClientProps) {
  const { isAuthenticated } = useMember()

  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyError, setApplyError] = useState('')

  const handleApply = async () => {
    if (!isAuthenticated) return
    setApplying(true)
    setApplyError('')
    try {
      const res = await fetch('/api/opportunities/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: assignmentId }),
      })
      if (res.ok) {
        setApplied(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setApplyError(data.error || 'Something went wrong')
      }
    } catch {
      setApplyError('Something went wrong')
    } finally {
      setApplying(false)
    }
  }

  if (isAuthenticated) {
    if (applied) {
      return (
        <div className="p-5 bg-white border border-[#a58e28] rounded-xl text-center">
          <p className="font-sans text-sm text-[#a58e28] font-medium">Interest submitted</p>
          <p className="font-sans text-xs text-[#888] mt-1">The JOBLUX team will be in touch.</p>
        </div>
      )
    }

    return (
      <div>
        <button
          onClick={handleApply}
          disabled={applying}
          className="jl-btn jl-btn-gold w-full justify-center disabled:opacity-50 py-3 text-sm"
        >
          {applying ? 'Submitting...' : 'Express Interest'}
        </button>
        {applyError && (
          <p className="font-sans text-xs text-red-500 mt-2 text-center">{applyError}</p>
        )}
        <p className="font-sans text-[0.6rem] text-[#aaa] mt-3 text-center leading-relaxed">
          Your profile will be shared with the JOBLUX team. The maison will not see your details until you approve.
        </p>
      </div>
    )
  }

  return (
    <div className="p-5 bg-[#1a1a1a] text-center rounded-xl">
      <div className="jl-overline-gold mb-2">Members Only</div>
      <p className="font-sans text-xs text-[#888] mb-3">
        Sign in to view full details and express interest.
      </p>
      <div className="flex items-center justify-center gap-2">
        <Link href="/members" className="jl-btn jl-btn-gold text-[0.6rem] py-1.5 px-3">Sign In</Link>
        <Link href="/join" className="jl-btn jl-btn-ghost text-[0.6rem] py-1.5 px-3">Join</Link>
      </div>
    </div>
  )
}
