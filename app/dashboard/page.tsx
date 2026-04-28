'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardRouter() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/auth/signin'); return }

    const role = (session.user as any)?.role

    if (role === 'admin') {
      router.push('/admin')
    } else if (role === 'business') {
      router.push('/dashboard/business')
    } else if (role === 'insider' || role === 'insider_contributor' || role === 'insider_key_speaker') {
      router.push('/dashboard/insider')
    } else {
      // 'professional' included as legacy fallback — new users get 'rising' instead
      router.push('/dashboard/candidate')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="text-[#999] text-sm">Loading your dashboard...</div>
    </div>
  )
}
