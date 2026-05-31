# JOBLUX — HANDOFF V3
Session close: 2026-06-01 ~01:30
Repo HEAD at close: e9c854f  |  Branch: main  |  Prod-only, Coolify auto-deploy

────────────────────────────────────────
## 1. SHIPPED THIS SESSION (all live / committed)
────────────────────────────────────────
- Escape module DISABLED — made invisible/inert. PASS, live.
- Insights rendered at ROOT — app/page.tsx re-exports Insights; public nav reordered
  (Insights · Careers · Brands · Signals · Events). Sampler homepage retired.
  Commit 5e47cf2. PASS, live.
- Public HEADER resized/reordered — bar 84→105, logo 28→35 (w112→140), nav 13.5→16 / 600.
  Mobile + pill + container untouched. Commit 81c2a45. PASS, live.
- LuxAI v17 Part 1 cockpit prototype LOCKED as TSX target — standalone upgraded cockpit,
  8 tabs (Overview · Operations · Brands · Signals · Events · Articles · Analytics · Queue),
  production capabilities preserved, no admin absorption. HTML-only, never shipped to TSX.
  File: COCKPIT-v17-part1-target.html (design target for Phase 2).
- LuxAI inventory endpoint — app/api/admin/luxai/inventory/route.ts, read-only, admin-only.
  Verified vs live DB (7 rows: brands 73/73, signals 133/35, events 18/10, articles 28/25,
  reports 10/2, salary 5697/2, interviews 0/0). 12-week trend deferred. Commit 3646517. PASS, live.
- LuxAI brands-enriched endpoint — app/api/admin/luxai/brands-enriched/route.ts, read-only,
  admin-only. Per-brand: sector, salary_count/has_salary, interview_count(0), last_regenerated_at,
  regeneration_count. Verified vs live DB (73 brands, 73 sectors, 72 has_salary, 68 last_regen).
  page_completeness intentionally excluded (comment in file). Commit e9c854f. PASS, live.

Commit lineage: 81c2a45 → 5e47cf2 (earlier) … → 3646517 → e9c854f (HEAD).

────────────────────────────────────────
## 2. UNRESOLVED / PARKED
────────────────────────────────────────
- Slice 2b — page-completeness column: BLOCKED on canonical WikiLux subpart definition.
  Generator (lib/wikilux-prompt.ts) defines 16 keys incl. signature_products + current_strategy
  (present on only 5/73). Live data carries quote(68)/salaries(69)/founder_name(68), NOT in the
  generator's 16. Code-canonical → ~5/73 complete; prototype quote-based → 68/73. Stored data has
  DRIFTED from current generator. Mo-only decision. No completeness logic until decided.
- Phase 3 (parked): WikiLux View/Edit/Delete + admin management absorption into cockpit.
- Admin sidebar / IA reorg + removal of standalone admin pages — parked.
- Overview 12-week trend sparkline — deferred (no pre-aggregated time-series).
- Approval-rate field on /usage + import-health composer — minor follow-ups, not started.

────────────────────────────────────────
## 3. BACKEND READINESS — NEXT STEP (no completion obligation)
────────────────────────────────────────
Backend readiness check COMPLETED. Existing LuxAI backend is much more complete than initially
assumed; we caught ourselves building backend infra ahead of demonstrated need. Both shipped
endpoints were justified by the v17 cockpit:
  - inventory endpoint shipped (3646517)
  - brands-enriched endpoint shipped (e9c854f)

Further backend work is OPTIONAL — only if the TSX shell hits a real data gap. Slice 3 is NOT a
mandatory prerequisite to TSX. Do NOT auto-queue it.

DECISION FOR MO AT SESSION OPEN — pick one:
  A) Start the v17 TSX shell now, using existing endpoints + the two new endpoints.
     (Build order: tab shell → Overview → Operations → Queue → domain tabs → cutover replacing
      the old 708-line LUXAICommandCenter.tsx. Built against v17 prototype as target.)
  B) Build Slice 3 first (domain KPI/list endpoint for Signals/Events/Articles) because we know
     we want those endpoints regardless of shell discovery.

Rule in force: NO TSX until Mo confirms. One slice at a time, propose → GPT → Code → verify.
Claude AI = read/audit/QA (GitHub read-only); Claude Code = all writes/commits/pushes.
