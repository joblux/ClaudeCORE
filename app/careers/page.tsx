'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import CareersClient from './CareersClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function CareersPageInner() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // Fetch assignments
      const { data: assignmentsData } = await supabase
        .from('search_assignments')
        .select('*')
        .eq('status', 'published')
        .order('activated_at', { ascending: false })

      // Fetch interview experiences
      const { data: interviewsData } = await supabase
        .from('interview_experiences')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      setAssignments(assignmentsData || [])
      setInterviews(interviewsData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#999]">Loading...</div>
      </div>
    )
  }

  return (
    <CareersClient
      assignments={assignments}
      interviews={interviews}
    />
  )
}

export default function CareersPage() {
  return (
    <Suspense>
      <CareersPageInner />
    </Suspense>
  )
}
