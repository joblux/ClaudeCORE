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
    // Public-facing INTELLIGENCE count: rows in bloglux_articles that
    // are not soft-deleted AND have status='published'. Drafts and
    // soft-deleted rows are deliberately excluded — the dashboard tile
    // must reflect what is actually live on /insights, not what exists
    // in the table.
    published: number
  }
  brands: {
    total: number
    published: number
  }
  salaries: {
    // Truth-only count for the SALARY INTELLIGENCE tile: salary records
    // that have a source_url. Unsourced AI-generated rows are excluded
    // here so the headline KPI cannot misrepresent the platform. The
    // unsourced count is surfaced separately in `alerts` below.
    sourced: number
  }
  interviews: {
    total: number
  }
  queue: {
    // content_queue rows in 'draft' state — work waiting for review.
    drafts: number
  }
  alerts: {
    // Doctrine violations. Each is the count of LIVE records that break
    // a hard rule from JOBLUX_MASTER_DOCTRINE_2026-04-10.md.
    salaries_missing_source: number
    ai_in_forbidden_families: {
      // Doctrine: bloglux_articles, events, salary_benchmarks, and
      // interview_experiences MUST NOT have content_origin='ai' or
      // 'luxai'. Interview experiences must also not be 'example'.
      // Signals are deliberately excluded — they are allowed to be
      // AI/RSS-derived by design.
      articles: number
      events: number
      salaries: number
      interviews: number
      total: number
    }
  }
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [
    totalMembers,
    pendingMembers,
    pendingBusiness,
    totalAssignments,
    activeAssignments,
    publishedArticles,
    brandStats,
    sourcedSalaries,
    totalInterviews,
    queueDrafts,
    salariesMissingSource,
    aiArticles,
    aiEvents,
    aiSalaries,
    aiInterviews,
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
    // Articles: published-only, soft-delete-aware
    supabase
      .from('bloglux_articles')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('status', 'published'),
    getBrandStats(),
    // Salaries: sourced-only (truth)
    supabase
      .from('salary_benchmarks')
      .select('id', { count: 'exact', head: true })
      .not('source_url', 'is', null)
      .neq('source_url', ''),
    supabase
      .from('interview_experiences')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
    // Content queue drafts
    supabase
      .from('content_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'draft'),
    // Doctrine alert: salary_benchmarks with no source_url
    supabase
      .from('salary_benchmarks')
      .select('id', { count: 'exact', head: true })
      .or('source_url.is.null,source_url.eq.'),
    // Doctrine alert: AI-origin live articles
    supabase
      .from('bloglux_articles')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('status', 'published')
      .in('content_origin', ['ai', 'luxai']),
    // Doctrine alert: AI-origin live events
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)
      .in('content_origin', ['ai', 'luxai']),
    // Doctrine alert: AI-origin live salary benchmarks
    supabase
      .from('salary_benchmarks')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)
      .in('content_origin', ['ai', 'luxai']),
    // Doctrine alert: AI/example-origin live interview experiences
    supabase
      .from('interview_experiences')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null)
      .in('content_origin', ['ai', 'luxai', 'example']),
  ])

  const aiArticlesCount = aiArticles.count ?? 0
  const aiEventsCount = aiEvents.count ?? 0
  const aiSalariesCount = aiSalaries.count ?? 0
  const aiInterviewsCount = aiInterviews.count ?? 0

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
      published: publishedArticles.count ?? 0,
    },
    brands: {
      total: brandStats.total,
      published: brandStats.published,
    },
    salaries: {
      sourced: sourcedSalaries.count ?? 0,
    },
    interviews: {
      total: totalInterviews.count ?? 0,
    },
    queue: {
      drafts: queueDrafts.count ?? 0,
    },
    alerts: {
      salaries_missing_source: salariesMissingSource.count ?? 0,
      ai_in_forbidden_families: {
        articles: aiArticlesCount,
        events: aiEventsCount,
        salaries: aiSalariesCount,
        interviews: aiInterviewsCount,
        total: aiArticlesCount + aiEventsCount + aiSalariesCount + aiInterviewsCount,
      },
    },
  }
}
