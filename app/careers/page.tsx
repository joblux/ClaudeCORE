import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import CareersClient from './CareersClient'

export const metadata = {
  title: 'Careers — JOBLUX',
  description: 'Confidential opportunities, salary intelligence, and interview preparation',
}

export default async function CareersPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch assignments
  const { data: assignments } = await supabase
    .from('search_assignments')
    .select('*')
    .eq('status', 'published')
    .order('activated_at', { ascending: false })

  // Fetch salary benchmarks
  const { data: salaries } = await supabase
    .from('salary_benchmarks')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch interview experiences
  const { data: interviews } = await supabase
    .from('interview_experiences')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <CareersClient
      assignments={assignments || []}
      salaries={salaries || []}
      interviews={interviews || []}
    />
  )
}
