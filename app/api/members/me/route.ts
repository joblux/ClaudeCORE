import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { resolveProfiLux } from "@/lib/profilux"
import type { ProfiLuxResolved } from "@/lib/profilux"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// LEGACY ADAPTER — Phase 2.3 transition shim (F2 reshape).
// Maps Matrix v1 ProfiLuxResolved (+ a small set of non-ProfiLux member columns
// fetched separately, per GPT R6-A) → legacy flat member shape consumed by:
//   - app/dashboard/candidate/page.tsx  (reads member.first_name only)
//   - app/dashboard/business/page.tsx   (reads 11 fields, drives sidebar/settings/brief)
// Preserves the 12 fields originally returned by this route + 4 L3/CV adds
// requested by STATE Phase 2.3 (closes F-members-me-incomplete).
// REMOVE in Phase 4 when consumers migrate to read `view` directly.
// No projection used per GPT D9-β.
// company_name / org_type / approved_at sourced via second SELECT (R6-A) —
// these are member/dashboard metadata, not ProfiLux fields, and intentionally
// kept off ProfiLuxResolved.
//
// SHAPE NOTE (F2, 2026-05-01):
// Initial Phase 2.3 deploy nested legacy fields under `.member`, mirroring
// /api/profilux's `.profile` envelope. That broke /api/members/me consumers
// because they store the raw response body and read fields off the top level
// (e.g. setMember(await res.json()); ...; member.first_name). Unlike
// /api/profilux consumers which do setProfilux(pData.profile || pData),
// /api/members/me consumers do not extract a sub-key.
//
// FIX (F2 per GPT): spread the 16 legacy fields at the top level alongside
// surface/view. Phase 4 still reads `view` directly. UI untouched.
// =============================================================================

type MemberMeta = {
  company_name: string | null
  org_type: string | null
  approved_at: string | null
}

function toLegacyMember(view: ProfiLuxResolved, meta: MemberMeta) {
  return {
    // Original 12 fields (preserved verbatim)
    first_name: view.first_name,
    last_name: view.last_name,
    email: view.email,
    company_name: meta.company_name,
    job_title: view.job_title,
    org_type: meta.org_type,
    country: view.country,
    city: view.city,
    avatar_url: view.avatar_url,
    status: view.status,
    approved_at: meta.approved_at,
    role: view.role,
    // 4 L3 / CV adds (Phase 2.3 — closes F-members-me-incomplete)
    profile_completeness: view.profile_completeness,
    m6_confirmed_at: view.m6_confirmed_at,
    cv_url: view.cv_meta?.cv_url ?? null,
    cv_parsed_at: view.cv_meta?.cv_parsed_at ?? null,
  }
}

// =============================================================================
// GET — Matrix v1 (Phase 2.3, ledger 081f3beb)
// Reads members.* via resolveProfiLux + targeted second SELECT for non-ProfiLux
// member metadata (company_name, org_type, approved_at).
// Returns the 16 legacy fields spread at the top level, plus additive
// `surface` + `view` for Matrix v1 consumers (F2 shape).
//
// SCOPE per GPT D9-β + D10-A + D11-A + R6-A + F2:
//   - resolveProfiLux owns the ProfiLux/L3/CV portion of the response
//   - Second SELECT covers business/member metadata not on ProfiLuxResolved
//   - DashboardProjection NOT used (forbidden — projection scope decision out of phase)
//   - m6_confirmed_at included even when null (forward-compatible, free)
//   - Legacy fields at top level for backward-compat with raw consumers (F2)
//
// FORBIDDEN per STATE DO NOT + GPT rulings:
//   - No extension of MemberRow, ProfiLuxResolved, or lib/profilux utilities
//   - No touching /api/members/profile (legacy calculateProfileCompleteness, STATE C5)
//   - No UI consumer changes
//   - No fix for the dashboard 8-field completeness divergence (logged f6508e54)
// =============================================================================

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Resolve email → member.id (resolver takes id, session has email)
  const { data: member, error: memberErr } = await supabase
    .from("members")
    .select("id")
    .eq("email", session.user.email)
    .maybeSingle()

  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 })
  }
  if (!member) {
    return NextResponse.json(
      { error: "Member not found", surface: "members-me", view: null },
      { status: 404 }
    )
  }

  // Single resolver call — Rule A applied internally
  let resolved: ProfiLuxResolved | null
  try {
    resolved = await resolveProfiLux(member.id, supabase)
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "resolveProfiLux failed" },
      { status: 500 }
    )
  }
  if (!resolved) {
    return NextResponse.json(
      { error: "Member not found", surface: "members-me", view: null },
      { status: 404 }
    )
  }

  // R6-A — second targeted SELECT for non-ProfiLux member metadata.
  // company_name / org_type / approved_at are member/dashboard fields,
  // intentionally not part of ProfiLuxResolved.
  const { data: metaRow, error: metaErr } = await supabase
    .from("members")
    .select("company_name, org_type, approved_at")
    .eq("id", member.id)
    .maybeSingle()

  if (metaErr) {
    return NextResponse.json({ error: metaErr.message }, { status: 500 })
  }

  const meta: MemberMeta = {
    company_name: metaRow?.company_name ?? null,
    org_type: metaRow?.org_type ?? null,
    approved_at: metaRow?.approved_at ?? null,
  }

  const legacy = toLegacyMember(resolved, meta)

  // F2 shape: spread legacy fields at top level for backward-compat with
  // consumers that read fields directly off the response body. surface +
  // view are additive for Matrix v1 / Phase 4 readers.
  return NextResponse.json({
    ...legacy,
    surface: "members-me",
    view: resolved,
  })
}
