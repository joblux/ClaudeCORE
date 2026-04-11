// lib/admin-metrics.ts
//
// Single source of truth for admin product KPIs.
//
// Anything that displays an "X total / Y pending" number on an admin
// surface (dashboard tiles, page headers, badges, future analytics)
// MUST read from this function. Do not query the underlying tables
// directly from admin pages — drift will reappear immediately.
//
// Server-only: this module loads at import time with the service-role
// Supabase key, so it bypasses RLS. Never import the function (only the
// type) into client components. Client components fetch
// `/api/admin/metrics` instead.

import { createClient } from '@supabase/supabase-js'
import { getBrandStats } from './brand-stats'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface AdminMetrics {
  members: {
    total: number
    pending: number
    pending_business: number
  }
  assignments: {
    total: number
    active: number
  }
  articles: {
    total: number
  }
  brands: {
    total: number
    published: number
  }
  salaries: {
    total: number
  }
  interviews: {
    total: number
  }
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [
    totalMembers,
    pendingMembers,
    pendingBusiness,
    totalAssignments,
    activeAssignments,
    totalArticles,
    brandStats,
    totalSalaries,
    totalInterviews,
  ] = await Promise.all([
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .neq('role', 'business'),
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .eq('role', 'business'),
    supabase
      .from('search_assignments')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('search_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('bloglux_articles')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
    getBrandStats(),
    supabase
      .from('salary_benchmarks')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('interview_experiences')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
  ])

  return {
    members: {
      total: totalMembers.count ?? 0,
      pending: pendingMembers.count ?? 0,
      pending_business: pendingBusiness.count ?? 0,
    },
    assignments: {
      total: totalAssignments.count ?? 0,
      active: activeAssignments.count ?? 0,
    },
    articles: {
      total: totalArticles.count ?? 0,
    },
    brands: {
      total: brandStats.total,
      published: brandStats.published,
    },
    salaries: {
      total: totalSalaries.count ?? 0,
    },
    interviews: {
      total: totalInterviews.count ?? 0,
    },
  }
}
