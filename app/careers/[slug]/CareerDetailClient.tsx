'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMember } from '@/lib/auth-hooks'

export default function CareerDetailClient({ assignmentId }: { assignmentId: string }) {
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
        <div className="p-5 bg-[#222] border border-[#a58e28] rounded-xl text-center">
          <p className="text-sm text-[#a58e28] font-medium">Interest submitted</p>
          <p className="text-xs text-[#999] mt-1">The JOBLUX team will be in touch.</p>
        </div>
      )
    }

    return (
      <div>
        <button
          onClick={handleApply}
          disabled={applying}
          className="w-full py-3 text-sm font-medium tracking-wide text-[#111] bg-[#ffffff] rounded-lg hover:bg-[#b89d2e] transition-colors disabled:opacity-50"
        >
          {applying ? 'Submitting...' : 'Express Interest'}
        </button>
        {applyError && (
          <p className="text-xs text-red-400 mt-2 text-center">{applyError}</p>
        )}
        <p className="text-[10px] text-[#777] mt-3 text-center leading-relaxed">
          Your profile will be shared with the JOBLUX team. The maison will not see your details until you approve.
        </p>
      </div>
    )
  }

  return (
    <div className="p-5 bg-[#222] border border-[#2a2a2a] text-center rounded-xl">
      <div className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] font-medium mb-2">Approved Professionals</div>
      <p className="text-xs text-[#999] mb-4">
        Sign in or request access to express interest in this role.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/members"
          onClick={() => {
            try {
              sessionStorage.setItem("joblux_return_to", window.location.pathname + window.location.search)
            } catch {}
          }}
          className="px-4 py-2 text-[11px] font-medium tracking-wide text-[#1a1a1a] bg-[#a58e28] rounded hover:bg-[#b89d2e] transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/select-profile"
          onClick={() => {
            try {
              sessionStorage.setItem("joblux_return_to", window.location.pathname + window.location.search)
            } catch {}
          }}
          className="px-4 py-2 text-[11px] font-medium tracking-wide text-[#ccc] border border-[#333] rounded hover:border-[#555] transition-colors"
        >
          Request access
        </Link>
      </div>
    </div>
  )
}
