import { createClient } from '@supabase/supabase-js'
import LUXAIAdminClient from './LUXAIAdminClient'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function LUXAIAdminPage() {
  // Fetch initial queue data
  const { data: queueData } = await supabaseAdmin
    .from('luxai_queue')
    .select('*')
    .eq('status', 'pending')
    .order('generated_at', { ascending: false })

  // Fetch stats
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { count: pendingCount } = await supabaseAdmin
    .from('luxai_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: approvedCount } = await supabaseAdmin
    .from('luxai_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .gte('reviewed_at', sevenDaysAgo.toISOString())

  const { count: rejectedCount } = await supabaseAdmin
    .from('luxai_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected')
    .gte('reviewed_at', sevenDaysAgo.toISOString())

  const initialStats = {
    pending: pendingCount || 0,
    approved_7d: approvedCount || 0,
    rejected_7d: rejectedCount || 0,
    avg_review_time: '2.4m',
  }

  return (
    <LUXAIAdminClient
      initialQueue={queueData || []}
      initialStats={initialStats}
    />
  )
}
