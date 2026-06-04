# JOBLUX HANDOFF — 2026-06-04

Repo HEAD (code): **757b6b1** | Branch: main | Prod-only, Coolify auto-deploy
STATE rotated this close: LAST SHIPPED 3c3cc56 → 757b6b1 (04da9a1 was a cosmetic docs-rotation commit, not an unrecorded feature).

## 🔥 SNAPSHOT
- Active blockers: none. Market-Salary Queue V1 shipped clean (COOLIFY-GREEN + PROD-QA PASS, net DB delta 0).
- Next 3 steps:
  1. Commit + push this STATE/HANDOFF rotation (after Mo review).
  2. Execute proposed ledger ops: ADD MS-V1-harden + MS-V1.1-curate; add resolution-candidate note to db8e07d1 (stays OPEN).
  3. Mo picks next salary scope: V1.1 curate UI vs V1 hardening slice vs provenance tail (WikiLux retrieval / AI-generator retirement).

## 1. WHAT WAS COMPLETED TODAY
- **757b6b1** — Market-Salary Queue V1: NEW `app/api/admin/luxai/market-salary` (source-backed ingestion → content_queue, `external_feed`, `source_url` required); approve mapper market sub-path (`content_origin='market'`, `confidence='verified'`, source_url carried, source year preserved; AI path byte-identical); `salaries/admin` POST → 410 (bypass closed); luxai-rules comment cleanup. No migration, no UI. Build GREEN + PROD-QA PASS.
- **Hermès orphan unpublish** — `salary_benchmarks` c9cbc294 (`is_published=false`, DB-only, no delete): unsourced contributed orphan, no lineage; fails provenance standard. Hublot traceable row retained.
- **Option B provenance LOCKED** (Mo+GPT): `salary_benchmarks` = market lane, `salary_contributions` = contribution lane, NO `source_origin` column; blended public estimate OK while internal provenance stays traceable.

## 2. STILL OPEN — ACTIVE ONLY
- `378f9c4b` — Hunter vs Generator strategic finding (high, parked-strategic).
- `6c502fbf` — Salary + Interview autonomous-families doctrine anchor (high).
- `0e2a2240` — LuxAI v17 TSX shell tail (high).
- `db8e07d1` — salary-doctrine blocker, **remains OPEN**; resolution candidate identified via Option B provenance doctrine + Market-Salary Queue V1 (review vs original definition before any status change).
- `MS-V1-harden`, `MS-V1.1-curate` — market-salary follow-ups (parked, proposed ledger ADD).

## 3. NEXT 3 STEPS
1. Commit + push STATE/HANDOFF rotation (Mo review first).
2. Execute proposed ledger ops (ADD 2 parked rows; note on db8e07d1 — stays OPEN).
3. Mo picks next salary scope (V1.1 curate UI / V1 hardening / provenance tail).

## 4. NEXT SESSION START
- **Focus:** Mo-selected salary scope OR provenance tail (NEXT STEP items 2-5).
- **IN:** market-salary V1.1 curate UI; V1 hardening slice; WikiLux retrieval layer; AI signals/events/interviews retirement execution; enforcement-rule table → code.
- **OUT:** no `source_origin` column (Option B locked); no direct salary_benchmarks writes (queue-only); no STATE reconciliation outside /joblux-close.

## Part 2 — Ledger operations (PROPOSED — await Mo, not yet executed)
- ADD — Market-salary V1 hardening (per-record + URL-format validation) — System / low / parked
- ADD — Market-salary V1.1 curate UI + optional audit columns — Admin / normal / parked
- UPDATE (note only, status stays OPEN) — `db8e07d1` — add note: "Resolution candidate identified via Option B provenance doctrine and Market-Salary Queue V1."

— Claude AI
