# JOBLUX — DEFECT ANCHOR

**Artifact type:** Reference doctrine (sister to Refondation)
**Source:** Apr 18–19, 2026 locked audit (chat `9de58a73-d70f-456d-8d8d-98b5c33fa0c3`)
**Ledger row:** `3ee2c38b-43e3-4dbb-8d72-05ea9ff1f4cb`
**Status:** Locked. Reusable truth reference. No fixes. No roadmap.
**Scope:** Capture inventory only. Fixing any defect is separate work.

---

## COUNT DISCREPANCY

- Source header/footer states 27 defects
- Pasted authoritative list contains 30 distinct defect entries
- No reconciliation applied; full list preserved as-is

---

## SCHEMA

Each defect row carries:

- **ID** — sequential anchor ID (D1–D30), assigned in source order
- **Domain** — intake / moderation / profile / data
- **Surface** — public / admin / both (— if not specified in source)
- **Severity** — structural / high / medium / small
- **Provenance** — `[code]` / `[DB]` / `[code+DB]` / `[DB+code]` / `[DB+doctrine]`
- **Description** — short title
- **Current state / evidence** — verbatim detail from source
- **Related ledger UUIDs** — `admin_tasks` rows linked to this defect (— if none provided in source)

---

## INTAKE

### D1 — Three intake endpoints, no unified object
- **Domain:** intake
- **Surface:** —
- **Severity:** structural
- **Provenance:** [code]
- **Current state / evidence:** Three routes accept member submissions and write to three unrelated tables with no cross-reference: POST /api/contributions → contributions + child tables; POST /api/contribute → brand_contributions; POST /api/insider/submit-voice → bloglux_articles.
- **Related ledger UUIDs:** —

### D2 — /api/contribute has no reachable user-facing surface
- **Domain:** intake
- **Surface:** —
- **Severity:** medium
- **Provenance:** [code]
- **Current state / evidence:** Writes to brand_contributions but no user-facing surface identified that calls it. Endpoint is orphaned from the UI.
- **Related ledger UUIDs:** —

### D3 — Insider voices bypass the contribution system
- **Domain:** intake
- **Surface:** —
- **Severity:** structural
- **Provenance:** [code+DB]
- **Current state / evidence:** Writes bloglux_articles with no contribution_id. No points, no status in the 3-state model. No query path identified that surfaces them alongside contributions.
- **Related ledger UUIDs:** —

### D4 — wikilux_insight not wired to downstream display
- **Domain:** intake
- **Surface:** —
- **Severity:** medium
- **Provenance:** [code+DB]
- **Current state / evidence:** Submittable via /contribute; wikilux_insights child table has FK to contributions. No read surface identified that renders wikilux_insights rows to users.
- **Related ledger UUIDs:** —

### D5 — brand_contributions is a FK-less silo
- **Domain:** intake
- **Surface:** —
- **Severity:** medium
- **Provenance:** [DB]
- **Current state / evidence:** No FK to contributions or members. user_id is a bare uuid. Unjoinable via the contribution graph.
- **Related ledger UUIDs:** —

### D6 — CV parse lifecycle non-operational
- **Domain:** intake
- **Surface:** —
- **Severity:** medium
- **Provenance:** [DB+code]
- **Current state / evidence:** 5 of 5 cv_url rows have cv_parsed_at=NULL. No code path identified that writes cv_parsed_at.
- **Related ledger UUIDs:** —

---

## MODERATION

### D7 — Two parallel moderation endpoints, asymmetric side effects
- **Domain:** moderation
- **Surface:** —
- **Severity:** structural
- **Provenance:** [code]
- **Current state / evidence:** PUT /api/contributions/[id] awards points, updates members.contribution_points + access_level, sends email, promotes salary. POST /api/admin/contributions does none of that — only writes status + reviewed_by.
- **Related ledger UUIDs:** —

### D8 — Admin UI uses endpoints inconsistently across approve/reject
- **Domain:** moderation
- **Surface:** —
- **Severity:** high
- **Provenance:** [code]
- **Current state / evidence:** admin/contributions/page.tsx calls PUT /api/contributions/[id] for approve on salary/interview tabs, but calls POST /api/admin/contributions for reject. No code path identified that sends a rejection email on those two tabs.
- **Related ledger UUIDs:** —

### D9 — wikilux_insight has no admin moderation UI
- **Domain:** moderation
- **Surface:** —
- **Severity:** medium
- **Provenance:** [code]
- **Current state / evidence:** /api/admin/contributions supports types voices/salary/interviews/brand. No admin moderation surface identified for wikilux_insight; moderation possible only by direct PUT /api/contributions/[id] with a known row ID.
- **Related ledger UUIDs:** —

### D10 — content_queue gate not enforced on contributions
- **Domain:** moderation
- **Surface:** —
- **Severity:** structural
- **Provenance:** [code+DB]
- **Current state / evidence:** Doctrine: no content publishes without content_queue. No code path identified that routes contribution approvals through content_queue; salary approvals insert directly into salary_benchmarks, wikilux approvals trigger regen directly.
- **Related ledger UUIDs:** —

### D11 — Status model divergence by table
- **Domain:** moderation
- **Surface:** —
- **Severity:** structural
- **Provenance:** [DB]
- **Current state / evidence:** contributions: pending/approved/rejected. brand_contributions: pending/reviewed/accepted/rejected. bloglux_articles (voices): draft/submitted/review/published/rejected/revision_requested. Three review lifecycles coexist.
- **Related ledger UUIDs:** —

### D12 — Doctrine status vocabulary absent from DB
- **Domain:** moderation
- **Surface:** —
- **Severity:** structural
- **Provenance:** [DB+doctrine]
- **Current state / evidence:** Doctrine: Approved / Unapproved (notified) / Filed (silent). DB CHECK: pending/approved/rejected. "Filed (silent)" has no representation.
- **Related ledger UUIDs:** —

### D13 — Rejection side-effects partial
- **Domain:** moderation
- **Surface:** —
- **Severity:** small
- **Provenance:** [code]
- **Current state / evidence:** Salary reject deletes promoted salary_benchmarks rows. Interview reject leaves interview_experiences untouched (though that table isn't "promoted" anywhere, unlike salary). Inconsistent cleanup pattern.
- **Related ledger UUIDs:** —

### D14 — 58/58 seed contributions never went through moderation
- **Domain:** moderation
- **Surface:** —
- **Severity:** medium
- **Provenance:** [DB]
- **Current state / evidence:** All rows status=approved on import. Only 4 of 58 have reviewed_by set. The live review pipeline has never fully exercised against real user submissions at volume.
- **Related ledger UUIDs:** —

---

## PROFILE

### D15 — Three profile stores, one canonical
- **Domain:** profile
- **Surface:** —
- **Severity:** structural
- **Provenance:** [DB+code]
- **Current state / evidence:** members = canonical (9/9 rows, written by 15 routes, read everywhere). profilux = live parallel secondary (3 rows, 2 routes write, sharing disabled). candidate_profiles = dead (0 rows, no code references identified).
- **Related ledger UUIDs:** —

### D16 — candidate_profiles is dead schema
- **Domain:** profile
- **Surface:** —
- **Severity:** medium
- **Provenance:** [DB+code]
- **Current state / evidence:** 0 rows, no code references identified, yet carries its own seniority enum that diverges from other tables. Carries non-trivial schema cost for zero use.
- **Related ledger UUIDs:** —

### D17 — ProfiLux–member join is by email, not FK
- **Domain:** profile
- **Surface:** —
- **Severity:** medium
- **Provenance:** [DB]
- **Current state / evidence:** profilux has no FK to members. 1 of 3 existing profilux rows is orphaned (mo.mzaour@fora.travel — no matching member).
- **Related ledger UUIDs:** —

### D18 — ProfiLux coverage is sparse and stale
- **Domain:** profile
- **Surface:** —
- **Severity:** medium
- **Provenance:** [DB]
- **Current state / evidence:** 2 of 4 candidate-role members have a profilux row. Last update late March 2026. sharing_enabled=false on all 3 rows.
- **Related ledger UUIDs:** —

### D19 — Role enum overloaded, inconsistently handled by UI
- **Domain:** profile
- **Surface:** —
- **Severity:** small
- **Provenance:** [DB+code]
- **Current state / evidence:** DB allows 11 role values. Candidate dashboard's TIER_LABELS handles 6; the other 5 fall through to default "PROFESSIONAL".
- **Related ledger UUIDs:** —

### D20 — Seniority vocabulary split across three tables
- **Domain:** profile
- **Surface:** —
- **Severity:** medium
- **Provenance:** [DB]
- **Current state / evidence:** candidate_profiles.seniority (manager/senior_manager/director/senior_director/vp/svp/c_level). interview_experiences.seniority (intern/junior/mid-level/senior/director/vp/c-suite). members.seniority free-text. Doctrine locks 9 levels — neither matches.
- **Related ledger UUIDs:** —

### D21 — Profile completion calc accepts two shape variants
- **Domain:** profile
- **Surface:** —
- **Severity:** small
- **Provenance:** [code]
- **Current state / evidence:** Dashboard profiluxCompletion reads either firstName/first_name, headline/job_title, experience/work_experiences — implying two historical profilux shapes coexisted.
- **Related ledger UUIDs:** —

---

## DATA

### D22 — salary_benchmarks: 5,697 rows published, 0 sourced
- **Domain:** data
- **Surface:** —
- **Severity:** structural
- **Provenance:** [DB]
- **Current state / evidence:** Every row has is_published=true. Every row has source_url=NULL. Origin: 5,595 ai, 100 luxai, 2 contributed. Known blocker. Doctrine: source_url required, no insert without working URL.
- **Related ledger UUIDs:** —

### D23 — Three parallel salary tables
- **Domain:** data
- **Surface:** —
- **Severity:** medium
- **Provenance:** [DB]
- **Current state / evidence:** salary_benchmarks (5,697), salary_contributions (2), salary_data (0, legacy). Only salary_contributions is contribution-keyed. Display runs off salary_benchmarks.
- **Related ledger UUIDs:** —

### D24 — Three parallel interview tables
- **Domain:** data
- **Surface:** —
- **Severity:** medium
- **Provenance:** [DB]
- **Current state / evidence:** interview_experiences (2 rows, both content_origin='seed'), interviews (0, editorial), interview_prep (0). Different purposes, no cross-reference, two empty.
- **Related ledger UUIDs:** —

### D25 — content_origin tracked on display tables, not contribution records
- **Domain:** data
- **Surface:** —
- **Severity:** small
- **Provenance:** [DB]
- **Current state / evidence:** salary_benchmarks has content_origin. contributions does not. Origin metadata lives downstream of the submission record.
- **Related ledger UUIDs:** —

### D26 — Seed vs contributed data indistinguishable at display
- **Domain:** data
- **Surface:** —
- **Severity:** small
- **Provenance:** [DB+code]
- **Current state / evidence:** interview_experiences 2/2 rows = content_origin='seed'. Displayed through /api/interviews/* with no visible origin flag.
- **Related ledger UUIDs:** —

### D27 — Contribution type CHECK allows a type with no doctrine match
- **Domain:** data
- **Surface:** —
- **Severity:** medium
- **Provenance:** [DB+doctrine]
- **Current state / evidence:** CHECK allows wikilux_insight, which doctrine does not reference. Doctrine's culture type has no DB representation (no type, no table).
- **Related ledger UUIDs:** —

### D28 — access_thresholds table read only
- **Domain:** data
- **Surface:** —
- **Severity:** small
- **Provenance:** [DB+code]
- **Current state / evidence:** Used for next-level lookups in /api/contributions/my-points. No write path identified in code. Hardcoded fallback (ACCESS_LEVELS) duplicates the policy in /api/contributions/[id]/route.ts. Two sources of truth for tier thresholds.
- **Related ledger UUIDs:** —

### D29 — Events table schema overload
- **Domain:** data
- **Surface:** —
- **Severity:** medium
- **Provenance:** [DB]
- **Current state / evidence:** 40 columns with duplicates, all AI-origin. Known issue carried from prior session.
- **Related ledger UUIDs:** —

### D30 — No unified contribution read model across tables
- **Domain:** data
- **Surface:** —
- **Severity:** structural
- **Provenance:** [code+DB]
- **Current state / evidence:** Each of contributions, brand_contributions, bloglux_articles is queried independently. No view, helper, or endpoint identified that returns a member's full contribution history across the three tables.
- **Related ledger UUIDs:** —

---

End of anchor. Thirty distinct defect entries preserved from pasted authoritative source across four layers.

*Source footer statement: "Twenty-seven locked defects across four layers. — Claude AI"*
