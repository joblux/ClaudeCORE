// lib/luxai-rules.ts
//
// Shared enforcement layer for LUXAI content_queue inserts.
// Every LUXAI route that writes to content_queue must go through
// `insertLuxaiQueueItem` so the doctrine below is applied uniformly.
//
// Rules enforced (validated synchronously before the insert is sent to Supabase):
//   - content_type        ∈ {signal, article, event, interview, salary_benchmark}
//   - source_type         ∈ {joblux_generation, external_feed}
//   - title               non-empty string
//   - processed_content   non-empty object
//   - destination_table   present (auto-filled from content_type if missing)
//   - status              forced to 'draft' on insert
//   - source_url          required when source_type='external_feed'
//
// Documented temporary exception:
//   - salary_benchmark is internally generated and has no citable source URL,
//     so source_url is NOT enforced for content_type='salary_benchmark' in
//     this patch. Revisit once a real source attribution model exists.
//
// Validation failures throw QueueValidationError. Single-item routes should
// catch it and return a 400 via `queueValidationErrorResponse`. Batch routes
// should catch it per-item and continue (mirrors existing batch behavior).

import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  checkDuplicate,
  type DuplicateCheckResult,
} from './duplicate-check'

// ----------------------------------------------------------------------------
// Doctrine constants
// ----------------------------------------------------------------------------

export const ALLOWED_CONTENT_TYPES = [
  'signal',
  'article',
  'event',
  'interview',
  'salary_benchmark',
] as const
export type LuxaiContentType = (typeof ALLOWED_CONTENT_TYPES)[number]

export const ALLOWED_SOURCE_TYPES = [
  'joblux_generation',
  'external_feed',
] as const
export type LuxaiSourceType = (typeof ALLOWED_SOURCE_TYPES)[number]

export const DESTINATION_TABLE_BY_TYPE: Record<LuxaiContentType, string> = {
  signal: 'signals',
  article: 'bloglux_articles',
  event: 'events',
  interview: 'interview_experiences',
  salary_benchmark: 'salary_benchmarks',
}

// ----------------------------------------------------------------------------
// Payload shape
// ----------------------------------------------------------------------------

export interface LuxaiQueuePayload {
  content_type: LuxaiContentType
  source_type: LuxaiSourceType
  title: string
  processed_content: Record<string, any>
  destination_table?: string
  source_url?: string | null
  source_name?: string | null
  raw_content?: any
  category?: string | null
  byline?: string | null
  brand_tags?: any
  target_surfaces?: any
  // Pass-through for fields used by individual routes today
  // (e.g. duplicate_state on generate-signal). Anything not listed above
  // is forwarded to Supabase as-is.
  [key: string]: any
}

// ----------------------------------------------------------------------------
// Validator + error type
// ----------------------------------------------------------------------------

export interface ValidationError {
  code: string
  message: string
}

export class QueueValidationError extends Error {
  code: string
  constructor(err: ValidationError) {
    super(err.message)
    this.name = 'QueueValidationError'
    this.code = err.code
  }
}

export function validateLuxaiQueuePayload(
  p: LuxaiQueuePayload
): ValidationError | null {
  if (!ALLOWED_CONTENT_TYPES.includes(p.content_type as LuxaiContentType)) {
    return {
      code: 'invalid_content_type',
      message: `content_type must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}`,
    }
  }
  if (!ALLOWED_SOURCE_TYPES.includes(p.source_type as LuxaiSourceType)) {
    return {
      code: 'invalid_source_type',
      message: `source_type must be one of: ${ALLOWED_SOURCE_TYPES.join(', ')}`,
    }
  }
  if (typeof p.title !== 'string' || p.title.trim() === '') {
    return { code: 'missing_title', message: 'title must be a non-empty string' }
  }
  if (
    !p.processed_content ||
    typeof p.processed_content !== 'object' ||
    Array.isArray(p.processed_content) ||
    Object.keys(p.processed_content).length === 0
  ) {
    return {
      code: 'missing_processed_content',
      message: 'processed_content must be a non-empty object',
    }
  }
  if (
    !p.destination_table ||
    typeof p.destination_table !== 'string' ||
    p.destination_table.trim() === ''
  ) {
    return {
      code: 'missing_destination_table',
      message: 'destination_table is required',
    }
  }
  // Enforce destination_table consistency: if a route passes an explicit
  // value that does not match the canonical table for the content_type,
  // reject it. Auto-fill (in insertLuxaiQueueItem) populates the canonical
  // value when omitted, so this check only fires on explicit mismatch.
  const expectedDestination =
    DESTINATION_TABLE_BY_TYPE[p.content_type as LuxaiContentType]
  if (expectedDestination && p.destination_table !== expectedDestination) {
    return {
      code: 'destination_table_mismatch',
      message: `destination_table for content_type=${p.content_type} must be '${expectedDestination}', got '${p.destination_table}'`,
    }
  }
  if (p.status !== 'draft') {
    return {
      code: 'invalid_status',
      message: "status must be 'draft' on insert",
    }
  }
  if (
    p.source_type === 'external_feed' &&
    (!p.source_url ||
      typeof p.source_url !== 'string' ||
      p.source_url.trim() === '')
  ) {
    return {
      code: 'missing_source_url',
      message: 'source_url is required when source_type=external_feed',
    }
  }
  // NOTE: salary_benchmark is a documented temporary exception in this patch.
  // It is internally generated and has no citable source URL, so source_url
  // is not enforced here. Revisit once a real source attribution model exists.
  return null
}

// ----------------------------------------------------------------------------
// Insert helper
//
// Validates, fills doctrine defaults (destination_table, status='draft'),
// then returns the supabase insert builder so callers may chain `.select()`.
// Throws QueueValidationError synchronously on validation failure — caller
// must wrap with try/catch (single-item routes return 400, batch routes
// continue the loop and log to insertErrors).
// ----------------------------------------------------------------------------

export function insertLuxaiQueueItem(
  supabase: SupabaseClient,
  payload: LuxaiQueuePayload
) {
  // Validate content_type first so the destination_table fallback is safe.
  if (!ALLOWED_CONTENT_TYPES.includes(payload.content_type as LuxaiContentType)) {
    throw new QueueValidationError({
      code: 'invalid_content_type',
      message: `content_type must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}`,
    })
  }

  const enforced: LuxaiQueuePayload = {
    ...payload,
    destination_table:
      payload.destination_table ||
      DESTINATION_TABLE_BY_TYPE[payload.content_type],
    status: 'draft',
  }

  const err = validateLuxaiQueuePayload(enforced)
  if (err) throw new QueueValidationError(err)

  return supabase.from('content_queue').insert(enforced)
}

// ----------------------------------------------------------------------------
// Interview duplicate check — TEMPORARY broad safeguard.
//
// lib/duplicate-check.ts has no 'interview' handler. This helper is a
// deliberately coarse stop-gap: it rejects any new interview-experience
// draft for a brand that already has a non-rejected queue row, matched
// solely on processed_content.brand_slug.
//
// THIS IS NOT A FINAL INTERVIEW DEDUP MODEL. A real model needs to consider
// at least job_title + seniority + city granularity (multiple legitimate
// experiences per brand should be allowed). Tighten or replace before
// removing the "temporary" label, and lift the final version into
// lib/duplicate-check.ts so the interview content_type is a first-class
// citizen there.
// ----------------------------------------------------------------------------

export async function checkLuxaiInterviewDuplicate(
  supabase: SupabaseClient,
  brandSlug: string | undefined | null,
  currentQueueId?: string
): Promise<DuplicateCheckResult> {
  if (!brandSlug) return { isDuplicate: false, match: null }

  let q = supabase
    .from('content_queue')
    .select('id, title, status, processed_content')
    .eq('content_type', 'interview')
    .not('status', 'in', '("rejected","archived")')
    .limit(200)
  if (currentQueueId) q = q.neq('id', currentQueueId)

  const { data } = await q
  for (const row of (data as any[]) || []) {
    const pcBrand = row?.processed_content?.brand_slug
    if (pcBrand && pcBrand === brandSlug) {
      return {
        isDuplicate: true,
        match: {
          id: row.id,
          title: row.title || `interview ${brandSlug}`,
          content_type: 'interview',
          status: row.status,
          source: 'content_queue',
        },
      }
    }
  }
  return { isDuplicate: false, match: null }
}

// ----------------------------------------------------------------------------
// Shared duplicate wrapper
//
// Maps a queue-bound LUXAI payload to the correct lib/duplicate-check.ts
// payload by content_type. Routes that previously called checkDuplicate
// inline with content_type-specific shapes should call this instead, so
// the field-mapping doctrine lives in one place and routes don't drift.
//
// Field mapping per content_type (read from processed_content unless noted):
//   - signal:           headline ← pc.headline || payload.title; source_url
//   - article:          title ← payload.title; slug ← pc.slug
//   - event:            title ← payload.title; start_date, city ← pc.city || pc.location_city
//   - salary_benchmark: brand_slug, job_title, city, seniority ← pc.*
//   - interview:        delegated to checkLuxaiInterviewDuplicate (temporary)
// ----------------------------------------------------------------------------

export async function checkLuxaiQueueDuplicate(
  supabase: SupabaseClient,
  payload: LuxaiQueuePayload,
  currentQueueId?: string
): Promise<DuplicateCheckResult> {
  const pc = (payload.processed_content || {}) as any

  switch (payload.content_type) {
    case 'interview':
      return checkLuxaiInterviewDuplicate(
        supabase,
        pc.brand_slug,
        currentQueueId
      )

    case 'signal':
      return checkDuplicate(
        {
          content_type: 'signal',
          headline: pc.headline || payload.title,
          source_url: payload.source_url || undefined,
        },
        currentQueueId
      )

    case 'article':
      return checkDuplicate(
        {
          content_type: 'article',
          title: payload.title,
          slug: pc.slug,
        },
        currentQueueId
      )

    case 'event':
      return checkDuplicate(
        {
          content_type: 'event',
          title: payload.title,
          start_date: pc.start_date,
          city: pc.city || pc.location_city,
          organizer: pc.organizer,
        },
        currentQueueId
      )

    case 'salary_benchmark':
      return checkDuplicate(
        {
          content_type: 'salary_benchmark',
          brand_slug: pc.brand_slug,
          job_title: pc.job_title,
          city: pc.city,
          seniority: pc.seniority,
        },
        currentQueueId
      )

    default:
      return { isDuplicate: false, match: null }
  }
}

// Re-export so callers can pull dedup helpers from a single doctrine module.
export { checkDuplicate } from './duplicate-check'

// ----------------------------------------------------------------------------
// 400 response helper
// ----------------------------------------------------------------------------

export function queueValidationErrorResponse(error: QueueValidationError) {
  return NextResponse.json(
    {
      success: false,
      error: 'queue_validation_failed',
      code: error.code,
      message: error.message,
    },
    { status: 400 }
  )
}
