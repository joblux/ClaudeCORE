'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardRouter() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/members'); return }

    const role = (session.user as any)?.role

    if (role === 'admin') {
      router.push('/admin')
    } else if (role === 'business' || role === 'insider_contributor' || role === 'insider_key_speaker' || role === 'insider') {
      router.push('/dashboard/business')
    } else {
      router.push('/dashboard/candidate')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="text-[#555] text-sm">Loading your dashboard...</div>
    </div>
  )
}
