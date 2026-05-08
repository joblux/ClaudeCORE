# JOBLUX CONSTITUTION

This file is the supreme execution source of truth for JOBLUX.

This file overrides:
- prior chats
- handoff notes
- memory summaries
- skills if conflicting
- stale project docs
- assumptions

If any source conflicts with this file: this file wins.

No work begins before reading this file.

No feature or repair proceeds without contract-first verification:
schema → enums → constraints → routes → UX.

## Authority layers (limited roles)
- Ledger (`/admin/tasks`) = task tracking only
- Handoff = session continuity only
- Skills = prompt formatting behavior only
- Memory = quick recall only
- None of the above may redefine architecture.

## Canonical objects (only sources of truth in the system)
- WikiLux = brand / market truth
- ProfiLux = professional / human truth
- Businesses = demand truth
- LuxAI = sourced transformation layer (never source of truth)
- content_queue = moderation gate (no content type bypasses it)

## Session start command
"Read docs/JOBLUX_STATE.md. Ignore conflicting stale sources."

## TRUTH SOURCES (locked May 7, 2026)

Hierarchy for any repo read:
1. GitHub MCP / GitHub connector — committed repo truth from joblux/ClaudeCORE. Preferred default.
2. Claude Code / local terminal — local truth only: git status, uncommitted changes, unpushed files, tests/builds, execution/writes, deploy/push confirmation.
3. User paste from Claude Code — fallback when MCP tools do not surface.
4. Never use uploaded project files, stale memory, old chats, or summaries as repo truth.

Announcement protocol: every repo read must declare path + branch (or commit hash if non-HEAD) + "committed truth, local uncommitted changes invisible".

This section overrides any prior contradictory instruction in this file.

---

## ACTIVE CHAIN

Execution order. Ledger statuses untouched — this is the mental map, not DB truth.

### LAST SHIPPED

- **8955880** `feat(profilux): S10 Clienteling drawer integration (card + drawer above tunnel, screen 8 unchanged)` — May 8 2026 PM. SHIPPED + PROD-VALIDATED. Single-file slice (`app/dashboard/candidate/profilux/page.tsx`, +76/-0). First slice to prove tri-state Yes/No + conditional textarea pattern inside a drawer. New `<SectionCard eyebrow="Clienteling">` rendered inside the Edit branch above `{renderStep()}`, immediately after the Compensation card+drawer block. Closed-card body: 2-row read-only summary always present (stable layout) — `clienteling_experience` rendered as literal "Yes" / "No" / `<NotSet />`; `clienteling_description` rendered raw when experience===true AND description non-empty, otherwise `<NotSet />`. Top-right neutral Edit button identical to S7/S8/S9 styling. Drawer body reuses Screen-8 JSX verbatim (Yes/No tri-state chips with reset logic + conditional textarea reveal when experience===true) bound to existing `draft8` / `setDraft8` / `handleSave8` / `saving8` / `savedAt8` / `saveError8` — NO new state, NO new endpoint, NO new helpers, NO maxWidth:900 wrapper inside drawer. Textarea style preserved verbatim including maxWidth:600 (no harm at 480px drawer width). Tri-state toggle reset logic preserved verbatim (Yes second-click resets to {null, ''}, No always clears description). Screen 8 inside `renderStep()` untouched (`case 8:` chip + textarea blocks intact). Prod QA via Chrome MCP on Alex Mason fixture: 11/11 PASS — card render placement after Compensation ✓, closed-card 2-row layout always present ✓, literal "No" rendering on initial false-state load ✓, Edit button styling matches S7/S8/S9 ✓, drawer open mechanics (480px right + dark backdrop + Playfair "Clienteling" title + X) ✓, drawer body shows Yes/No tri-state with No active reflecting current state + no textarea (correctly hidden) + Save ✓, click Yes → tri-state toggles + textarea conditionally reveals + drawer body reflows cleanly ✓, type description "Built and managed VIP client portfolio at Hublot Paris flagship over 8 years." + Save → button transitions Saving... → completed (Saved indicator auto-fades after ~2s timeout) ✓, drawer stays open after save ✓, closed-card refetched showing literal "Yes" + raw description text ✓, X close ✓, ESC close ✓, backdrop click close ✓, reopen shows persisted Yes-active + textarea content ✓, tunnel Screen 8 mirrors drawer-saved state (Yes chip gold-tinted + textarea visible + description text) confirming shared `draft8` single-source-of-truth ✓. Bonus observation: `profile_completeness` did NOT increment from 49% on this save — manifestation of existing parked finding `f6508e54` extends to tri-state + textarea writes, NOT a new finding. No types/projector/API/schema/handler changes.

- **410f036** `feat(profilux): S9 Compensation drawer integration (card + drawer above tunnel, screen 10 unchanged)` — May 8 2026 PM. SHIPPED + PROD-VALIDATED. Single-file slice (`app/dashboard/candidate/profilux/page.tsx`, +57/-0). Mirror of S7 form-input pattern applied to Screen 10 (Compensation). New `<SectionCard eyebrow="Compensation">` rendered inside the Edit branch above `{renderStep()}`, immediately after the Skills & Markets card+drawer block. Closed-card body: 3-row read-only summary (`desired_salary_min`, `desired_salary_max`, `desired_salary_currency`) rendered raw via `String(...)` for numbers and direct read for currency, with `<NotSet />` italic "Not specified" fallback per row. No range formatting, no thousand separators, no invented presentation. Top-right neutral Edit button identical to S7/S8 styling. Drawer body reuses Screen-10 form JSX verbatim bound to existing `draft10` / `setDraft10` / `handleSave10` / `saving10` / `savedAt10` / `saveError10` — NO new state, NO new endpoint, NO new helpers, NO maxWidth:900 wrapper inside drawer. Save disable logic preserved: `saving10 || !draft10`. Screen 10 inside `renderStep()` untouched (`case 10:` form intact). Prod QA via Chrome MCP on Alex Mason fixture: 11/11 PASS — card render placement after Skills & Markets ✓, closed-summary 3 "Not specified" empty rows ✓, Edit button styling matches S7/S8 ✓, drawer open mechanics (480px right + dark backdrop + Playfair "Compensation" title + X) ✓, drawer body shows 3 form fields (min number / max number / currency select) + Save ✓, populate min=80000 + max=120000 + currency=EUR + Save → green Saved indicator ✓, drawer stays open after save ✓, closed-card refetched showing raw "80000" / "120000" / "EUR" with no formatting (per locked decision) ✓, X close ✓, ESC close ✓, backdrop click close ✓, reopen shows persisted values ✓, tunnel Screen 10 mirrors drawer-saved values (80000/120000/EUR in form inputs) confirming shared `draft10` single-source-of-truth ✓. Bonus observation: `profile_completeness` did NOT increment from 49% on this save — manifestation of existing parked finding `f6508e54` (completeness divergence) extending beyond chip arrays to `members.*` flat-column writes, NOT a new finding. No types/projector/API/schema/handler changes.

- **ebbb64f** `feat(profilux): S8 Skills & Markets drawer integration (card + drawer above tunnel, screen 7 unchanged)` — May 8 2026 PM. SHIPPED + PROD-VALIDATED. Single-file slice (`app/dashboard/candidate/profilux/page.tsx`, +74/-0). Mirror of S7 pattern applied to chip-multi-toggle control family. New `<SectionCard eyebrow="Skills & Markets">` rendered inside the Edit branch above `{renderStep()}`, immediately after the Current Position card+drawer block. Closed-card body: 2-row read-only summary (`key_skills` mapped through `PROFILUX_SKILL_OPTIONS` via co-located `skillLabel(value)` helper returning label || value; `market_knowledge` rendered raw since `PROFILUX_MARKET_OPTIONS` is `string[]`). Top-right neutral Edit button identical to S7 styling. Drawer body reuses Screen-7 chip JSX verbatim bound to existing `draft7` / `setDraft7` / `handleSave7` / `saving7` / `savedAt7` / `saveError7` — NO new state, NO new endpoint, NO new helpers, NO maxWidth:900 wrapper inside drawer. Screen 7 inside `renderStep()` untouched (`case 7:` chip blocks intact). Prod QA via Chrome MCP on Alex Mason fixture: 11/11 PASS — card render placement after Current Position ✓, closed-summary "None selected" empty state on both rows ✓, Edit button styling matches Current Position ✓, drawer open mechanics (480px right + dark backdrop + Playfair "Skills & Markets" title + X) ✓, drawer body shows 22 skill chips + 13 market chips + Save ✓, chip toggle (CRM Systems + Western Europe) + Save → green Saved indicator ✓, drawer stays open after save ✓, closed-card refetched showing human label "CRM Systems" + raw "Western Europe" ✓, X close ✓, ESC close ✓, backdrop click close ✓, reopen shows persisted gold-tinted active state ✓, tunnel Screen 7 mirrors drawer-saved chip selections confirming shared `draft7` single-source-of-truth ✓. Confirmed at runtime: `PROFILUX_MARKET_OPTIONS` is `string[]` not `{value,label}[]` — closed-card raw rendering correct. Bonus observation: `profile_completeness` did NOT increment from 49% on this save — manifestation of existing parked finding `f6508e54` (completeness divergence), NOT a new finding. No types/projector/API/schema/handler changes.

### CURRENT STEP — strict order

**Next ProfiLux Reload UI slice = S11 (not yet scoped). S0–S10 shipped + prod-validated.**

S0 (MATRIX v1.2 doctrine), S1 (CV pipeline), S1.5 (identity prefill review panel), S2 (identity strip), S3 (SectionCard primitive), S4 (View/Edit/Manage triad scaffold), S5 (View tab v0 shell), S6 (Drawer primitive), S7 (Current Position — form-input drawer pattern proven), S8 (Skills & Markets — chip-multi-toggle drawer pattern proven), S9 (Compensation — second form-input drawer, S7 pattern reaffirmed), and S10 (Clienteling — tri-state Yes/No + conditional textarea drawer pattern proven) all SHIPPED + prod-validated. Substrate now: doctrine locked, CV pipeline working, prefill mechanism proven, identity strip in place, shared card chrome unified, top-level triad mental model in place, View tab v0 shell live, Drawer primitive demo-validated, AND first real per-section drawer (Current Position) live with full read-summary + edit-drawer + save round-trip + tunnel mirroring proven.

Slice candidates remaining per MATRIX v1.2 §§21–24 + §13 deferred items (no commitment — Mo + GPT scope before any draft):
- Tier 2 add-library scaffolding (schema PARKED — UI shell only feasible)
- View tab content fill-in (real preview) — **gated on a server-emitted public projection from `/api/profilux` or a sibling endpoint; do NOT consume `projectFor` client-side** (per DO NOT)
- Manage tab content (sharing, visibility, settings — anchors `/api/profilux/reset-link` rebuild; STATE DO NOT until reset-link unparked)
- Next per-section drawer integration (Skills & Markets recommended — reuses existing chip-multi-toggle handlers, low regression risk; OR Education & Languages; OR Compensation). Identity drawer remains gated on coordination decision with S1.5 prefill panel + Edit-tab identity strip (3 write surfaces over the same column subset — needs explicit design call before draft).
- Future: lift remaining 10 tunnel screens into per-section drawers (S8–S?), step counter retire, `step` state retire
- Future: query-param tab persistence (`?tab=view|edit|manage`) once visual model approved
- Future: extract `SectionCard`, `Drawer`, identity strip to `components/profilux/` once reused beyond this file
- Future: drawer animation (slide/fade) — currently instant by design; add when visual polish takes priority

Mo + GPT pick the next slice and lock scope before any implementation prompt is drafted.

**Earlier-session prior context (carried forward):**

- Phase 3 frontend audit CLOSED 2026-05-07 AM. All 3 active surfaces shipped (`ed0c662` Surface 1 + `0bf208c` Surface 4 + `2b8f4bf` Surface 3).
- Phase 4.A milestone CLOSED 2026-05-05. All 7 write-enabled screens shipped (3, 4, 6, 7, 8, 9, 10).
- Phase 4.B/C/D/E chain closed 2026-05-05 — ProfiLux contract harmonized.

**Surfaces NOT in current scope (carried forward):**
- B39 CV bucket repair execution. Resume with fresh `/ultrareview`.
- Tier 1 schema — PARKED until product trigger.
- Slice 2B reset-link identity source swap — STATE DO NOT against `/api/profilux/reset-link`, parked under `0e6f3271`.

**Locked doctrine (May 6, 2026, unchanged):**
- ProfiLux is a single living professional profile object, owned continuously by the user.
- Not a wizard. Not submit / pending / review. Not frozen. Not Mo-approved.
- Mo approval applies to platform access at registration and to contributions — never to the ProfiLux itself.
- All projections read the same object: dashboard, ATS, recruiter, public `/p/[name]`, PDF, matching.

**Canonical doctrine doc:** `docs/PROFILUX_MODEL.md` (committed `ecb60a5`, May 6 2026).
**Implementation contract:** `docs/PROFILUX_MATRIX_V1.md` (v1.2 — May 7, commit `5d8672b`).
**Umbrella ledger row:** `88d4bd79-f0d4-4e9c-9125-e00df2699ca6` (Recruiting System / high / open).
**Phase 4 ledger row:** `8f82b3ac-f1ab-4905-8142-658c03edc52e` (validated, anchor for tunnel passport rewrite).

### DO NOT

- Touch cv-parse route again unless a new bug surfaces (currently green in prod).
- Implement L1 → L2 silent writes from any code path. S1 + S1.5 ship proof of compliance.
- Deviate from `docs/PROFILUX_MATRIX_V1.md` (v1.2) without updating the spec first (per §12.2).
- Use Hélène BILLARD as fixture (consent unconfirmed, blocked permanently).
- Read `members.*` or `cv_parsed_data` directly from any UI surface for ProfiLux fields — go through `projectFor`.
- Consume `projectFor` client-side in any candidate UI surface. Public-projection masking is server-owned. Real public preview content requires a server-emitted public projection (new endpoint or `/api/profilux` extension); the View tab v0 shell at `/dashboard/candidate/profilux` is presentation-only and must not be replaced with client-side `projectFor` consumption.
- Treat `profilux` standalone table as fully dormant — it is share-state-only (`share_slug` + `sharing_enabled`). Full retirement in ledger `6aef236e`.
- Touch `/api/profilux/reset-link` — sharing UX rebuild is a separate post-migration concern.
- Refactor legacy `calculateProfileCompleteness` in `app/api/members/profile/route.ts` — separate commit, with eventual tunnel passport rewrite.
- Fix the dashboard 8-field completeness divergence (`f6508e54`) — flagged-only, no fix scheduled.
- Resequence backlog from broader ledger.
- Build any product-facing surface (tunnel, editor, dashboard, admin) without first read-only inspecting the live components per the visual guardrail.
- Drift from the executive-presence guardrail in any copy or microstate.
- Build an Identity-section drawer without first deciding how it coexists with the S1.5 prefill panel and the Edit-tab identity strip. Three potential write surfaces over the same column subset (`first_name`, `last_name`, `city`, `nationality`) require an explicit coordination decision before any draft.
- Delete or remap tunnel `renderStep()` cases for sections that have an active drawer integration (e.g. Screen 3 / Current Position post-S7, Screen 7 / Skills & Markets post-S8, Screen 10 / Compensation post-S9, Screen 8 / Clienteling post-S10). Tunnel + drawer coexist deliberately; lift only happens in a dedicated future slice once all 9 default sections have drawers shipped.

### PARKED (admin_tasks status=parked)

- `2847ac29` — Audit + migrate Anthropic model IDs across repo before Sonnet 4 retirement (deadline Jun 15 2026)
- `1e6162ea` — Replace inert RPC `submit_m6_admission` (incompatible with locked Apr-14 11-screen proto)
- `9b806aa3` — F-luxuryrecruiter — repo-wide purge of legacy domain
- `6aad3904` — Security review backlog — 37 remaining findings from ultra-review 2026-04-24
- `8f82b3ac` — Phase 4 premium ProfiLux tunnel + editor rebuild (anchor row, validated; carries through tunnel passport rewrite)
- `35469863` — Phase 5 admin polish (gated on Phase 4)

### NEW FINDINGS LOGGED (out of immediate scope, surface separately)

- **F-s15-checkbox-misalignment** *(logged 2026-05-08, parked)* — S1.5 review panel checkbox column slightly offset from field-name/value rows in the 3-column grid (`24px 160px 1fr`). Cosmetic only; logical structure correct; functionality unaffected. Best handled with the next ProfiLux Reload UI slice if it touches identity components, otherwise standalone single-line CSS fix.
- **F-completeness-triple-system** (`f6508e54`) — flagged-only, no fix scheduled.
- **F-roles-constraint-drift**, **F-registration-role-mismatch** — pre-launch parked.
- **F-editor-l1-fallback-education** — known resolver behavior, no fix.
- **F-ats-detail-subtitle-trailing-at** — cosmetic, parked.
- **F-save-error-body-dropped** — cross-screen UX fix parked, single-commit candidate.
- **F-magiclink-delivery**, **F-pdfparse-anthropic-files**, **F-admin_tasks-trigger**, **F-cv_url-format-mixed** — carried.
- **F-public-slug-stub** — CLOSED 2026-05-07 by `369c2e0`.
- **F-empty-string-vs-null**, **F-availability-default-drift**, **F-currency-default-applied** — CLOSED 2026-05-01.

**Last updated:** May 8, 2026 PM — S10 Clienteling drawer integration SHIPPED + prod-validated 11/11 via Chrome MCP on Alex Mason. First tri-state Yes/No + conditional textarea drawer pattern proven (literal Yes/No/Not specified closed-card with stable always-present description row, drawer body reflows cleanly on conditional reveal, shared `draft8` mirroring tunnel Screen 8 in both directions). Screen 8 in tunnel intact. `profile_completeness` no-move on tri-state + textarea save = continued `f6508e54` manifestation, not a new finding. Next: S11 — not yet scoped. Availability & Targets is now a zero-new-pattern slice (select + chip-multi-toggle + tri-state + conditional textarea all proven; dense reuse only).
**Maintained by:** Claude AI (Opus) · JOBLUX Ops

---

## 1. WHAT IS JOBLUX

Confidential careers intelligence gateway for the luxury industry. Not a job board, not a social network.

**Slogan:** "Luxury Talent Intelligence"
**Baseline:** "Luxury, decoded."
**Revenue:** Private executive recruitment (fees 18-20%) + Fora Travel advisory commissions (Escape)
**Model:** Free-against-contribution. No subscriptions, no paywalls, no ads.
**Kill words:** society, community, members, join, membership, internships
**Use instead:** confidential, discreet, intelligence, contribution

**Co-founder:** Alex Mason (London)
**Only valid public email:** alex@joblux.com

---

## 2. TECH STACK

- **Framework:** Next.js 14.2, TypeScript, Tailwind CSS
- **DB:** Supabase (project ID: `zspcmvdoqhvrcdynlriz`, eu-west-1)
- **Auth:** NextAuth v4 (Google OAuth ✅, LinkedIn OAuth ✅, Magic links ❌ not configured)
- **Email:** AWS SES (domain verified, emails working)
- **Deploy:** Coolify on Hetzner VPS, SSH push to GitHub
- **Repo:** github.com/joblux/ClaudeCORE
- **Build:** `NODE_OPTIONS=--max-old-space-size=4096` in package.json

---

## 3. THREE-BRAIN WORKFLOW

- **Claude Opus (this instance):** DB verification, audit, guardrails, architecture decisions, prompt quality control
- **GPT:** Strategy, content design, risk detection
- **Claude Code:** Execution — receives prompts from Mo, pushes via SSH to Coolify
- **Mo:** Copy-pastes between tools, makes all final calls

**Execution control rule:** Never execute without Mo's approval. Sequence: Propose → Wait → Mo approves → Execute. No chaining. No scope expansion.

---

## 4. PLATFORM ARCHITECTURE

### Three modules:
1. **Intelligence module** — LuxAI-powered data, signals, salary/interview intelligence, editorial. Public trust layer. Core differentiator.
2. **Recruiting module** — ATS, business briefs, candidate flows, assignments. Revenue engine.
3. **Escape module** — Separate travel magazine entity. Fora commissions. Limited crossover.

### Four layers:
- **Layer A — Public:** Homepage, brands, signals, careers, insights, events, The Brief, Access
- **Layer B — Access:** /connect, /join, /select-profile, registration, pending/approval, role routing
- **Layer C — Private:** Candidate/business/insider dashboards, profile, contributions
- **Layer D — Operations:** Admin command centers (LuxAI, ATS, Contributions, Content Queue, Members)

---

## 5. LIVE URLS & ROUTING

### Active public pages:
`/brands`, `/brands/[slug]`, `/signals`, `/signals/[slug]`, `/careers`, `/insights`, `/events`, `/interviews`, `/escape`, `/connect`, `/select-profile`, `/join`, `/join/employer`, `/about`, `/faq`, `/privacy`, `/terms`, `/terms/business`

### Dead/retired (never link here):
`/wikilux` (old cream design), `/salaries` (standalone old page)

### Naming convention (frozen Apr 4):
- Public: `/insights/[slug]` (articles), `/brands/[slug]` (WikiLux), `/p/[name]` (ProfiLux)
- DB stays: `bloglux_articles`, `wikilux_content`, `profilux`
- Redirect `/bloglux/[slug]` → `/insights/[slug]`
- No DB renames ever

---

## 6. DATABASE STATE (verified Apr 13, 2026)

| Table | Count | Status |
|---|---|---|
| wikilux_content (brands) | 176 live | 175 seeded, Tiffany & Co empty shell |
| signals | 11 | All real RSS-sourced, all have source_url |
| bloglux_articles | 25 seed | 7 AI unpublished. ALL detail pages return 404 |
| events | 9 live (18 AI unpublished) | ALL detail pages return 404 |
| search_assignments | 26 | All published |
| applications | 1 | Stage: rejected (test by Mo) |
| business_briefs | 2 | Test data |
| salary_benchmarks | 5,609 | ⚠️ ALL AI-generated, no source URL — pending unpublish |
| interview_experiences | 0 | 28 fabricated entries deleted Apr 10 |
| contributions | 54 | All type interview_experience, all approved (seeds) |
| members | 4 | 1 business role, 4 pending, 0 approved |
| content_queue | 150 | 106 signals, 26 events, 8 articles, 10 salary benchmarks |

### DB rules:
- DB is single source of truth everywhere. No static arrays.
- Before any insert/update: run `information_schema.columns` to verify column names
- `search_assignments` status: only `draft/published/closed` — 'active' violates constraint
- `bloglux_articles` uses `body` (not `content`), `read_time_minutes` (not `read_time`)
- `wikilux_content`: `status` (approved/pending/draft) + `is_published` boolean — can fall out of sync
- `article_status` enum: `draft, review, published, archived, submitted, revision_requested, rejected`
- `content_queue` check constraints: `content_type` ∈ {signal/event/article/research_report/voice_card/salary_benchmark/brand_profile}
- Admin pattern: always `SUPABASE_SERVICE_ROLE_KEY`, always `.maybeSingle()` never `.single()`

---

## 7. CONTENT DOCTRINE

### What's clean:
- **Signals** ✅ — 11 real RSS-sourced, all with source_url
- **Articles** ✅ — 25 seed articles (7 AI unpublished)
- **Events** ✅ — 9 live (18 AI unpublished)
- **Brands** ✅ — 176 live, all seeded with real data
- **Interviews** ✅ — 28 fabricated entries deleted

### What's NOT clean:
- **Salary** ❌ — 5,609 AI records still live, no source URL, frontend impact audit required before unpublishing
- **Insights tabs** — Research + Insider Voices tabs hidden (correct)

### Hard rules:
- No AI-generated content about real named people without verified sourcing
- `generate-insider-voice` route retired permanently
- All content through `content_queue` before any publish
- Mo approves everything — nothing auto-publishes
- `content_origin: 'ai'` on all LuxAI-generated inserts

---

## 8. REGISTRATION & ACCESS

### Current flow:
1. `/connect` → two-column split: professional (left) or employer (right)
2. Professional → `/select-profile` → choose tier (Emerging/Established/Senior & Executive)
3. Sign in: Google OAuth / LinkedIn OAuth / Magic link (not configured)
4. Registration form → upload CV
5. All → PENDING status
6. Admin approves → welcome email → dashboard

### Tiers (DB keys):
- `rising` = Emerging Professional
- `pro` = Established Professional
- `executive` = Senior & Executive
- `business` = Employer (label: "Company")
- `insider` = Trusted Contributor

### Access model:
- No tier gates on content
- Contribution-gated only: partial visible to all, full depth unlocked by contributing
- Tier determines opportunity, not access

### Emails (SES, all working):
- Pending → user confirmation
- Notification → admin
- Approval → welcome email

---

## 9. CONTRIBUTION SYSTEM

### Active contribution types:
1. **Salary data** (`salary_data`) — Form on `/contribute` + `/dashboard/insider/submit-salary`. Points: 10
2. **Interview experience** (`interview_experience`) — Form on `/contribute`. Points: 10
3. **Insider Voices** — Insider tier only. Saves to `bloglux_articles` as draft. Points: 5
4. **Brand corrections** — Admin contributions tab

### Access level thresholds (DB: `access_thresholds`):
- Basic: 0 pts
- Standard: 10 pts (unlocks salary benchmarks overview)
- Premium: 25 pts (unlocks full salary + compare)
- Full: 50 pts (unlocks calculator + priority access)

### Who can contribute what:
- **Professionals** (rising/pro/executive): salary + interviews + signal tips
- **Insider**: all above + Insider Voices + brand corrections
- **Business**: brand corrections + signal tips only

### Admin: `/admin/contributions` — 4 active tabs (Voices, Salary, Interviews, Brand Corrections) + 2 placeholders (Signals, Reports)

---

## 10. RECRUITING MODULE

### Search Assignments:
- 26 published assignments in DB
- Admin creates/edits at `/admin/assignments`
- Public listing on `/careers` (Assignments tab)
- Confidential brand reveal mechanic works

### ATS Pipeline:
- Admin at `/admin/ats` — Kanban + table views
- Stages: applied → screening → shortlisted → submitted_to_client → interview_1 → interview_2 → interview_final → client_reviewing → offer_made → offer_accepted + terminal (hired, rejected, withdrawn, on_hold)
- Application detail page at `/admin/ats/[id]` — candidate info, brief, timeline, notes, recruiter assignment
- Current state: 1 application (test), stage: rejected

### Applications API (`/api/applications`):
- Candidate: self-apply (source = 'self_applied'), anti-duplicate protection
- Admin: create for any member, assign recruiter, add note, choose source

### Business Briefs:
- 2 test briefs in DB
- Employer submits from `/dashboard/business`
- Admin views at `/admin/business-briefs` and `/admin/briefs`

### Email templates (SES, built but not all tested end-to-end):
- Employer side: brief received, search update, candidates shared, placement confirmed
- Candidate side: opportunity matched, interview scheduled, offer, placement confirmed

### Terms of Business (`/terms/business`):
- Fees: 18% (up to $150K), 20% (above $150K). Contingency only.
- 12-month candidate attribution. 90-day replacement.

---

## 11. DASHBOARDS

### Candidate (`/dashboard/candidate`):
- 4-card next-steps: Profile, Careers, Intelligence, Contribute
- ProfiLux completion bar (backend-computed readiness signal; not an admission gate)
- ProfiLux editor at `/dashboard/candidate/profilux` (currently 11-screen tunnel + S1 CV card + S1.5 identity prefill review panel + S7 Current Position SectionCard + Drawer above the tunnel; passport rewrite progressing slice-by-slice per MODEL)

### Business (`/dashboard/business`):
- Submit brief CTA
- Request status view
- "How it works" 4-step process
- Nav: Dashboard, Recruiting, Intelligence, Account

### Insider (`/dashboard/insider`):
- Role framing block (Trusted Contributor)
- Contribution stats (total, points, by type)
- Write perspective CTA
- Contribution history

### Router: admin→/admin, business→business, insider→insider, others→candidate

---

## 12. PROFILUX

- Living object, owned continuously by user (per MODEL May 6, MATRIX v1.2 §2)
- Current implementation: 11-screen tunnel (Phase 4.A) + S1 CV upload+parse card + S1.5 inline identity prefill review panel + S7 Current Position SectionCard with Drawer at `/dashboard/candidate/profilux`. Passport-with-drawer UX rewrite progressing slice-by-slice (MATRIX v1.2 §7.6 + §§14, 21–24); first real per-section drawer (Current Position) live, 8 default sections + Identity coexistence pending.
- Storage contract: `members.*` flat columns + `cv_parsed_data` jsonb (per MATRIX v1 §3 layer model)
- Resolver: `lib/profilux/resolveProfiLux` returns `ProfiLuxResolved` (single shape, all surfaces). Now also emits `cv_identity_suggestions` (4-field pre-Rule-A diff for S1.5 prefill UI).
- 6 surface projections via `projectFor`: dashboard / editor / public / admin / ats / client. `EditorView` carries `cv_identity_suggestions` pass-through.
- CV pipeline: Haiku 4.5 parser at `/api/members/cv-parse`, schema_v1.0, locked sectors + proficiencies. Prod-validated end-to-end.
- Identity prefill: explicit-confirmation only (S1.5). L1 → L2 silent writes forbidden across all code paths.
- `members.profile_completeness` computed via `computeProfileCompleteness` (backend-only readiness signal — not user-facing admission)
- Two surfaces: ProfiLux (`/dashboard/candidate/profilux`) and `/profile` (legacy, scheduled for retirement)

---

## 13. LUXAI SYSTEM

- Always Claude Haiku 3.5 — never Sonnet or Opus for generation
- Haiku wraps JSON in markdown backticks — always strip by finding first `{` and last `}`
- All generation endpoints write `content_origin: 'ai'`
- Command Center at `/admin/luxai`
- Content Queue at `/admin/content-queue` (single editorial gate)
- RSS pipeline: RSS ingest → brand-list filter → LuxAI structures → confidence gate → auto-approve
- Known issue: headline-similarity dedup needed on RSS route

---

## 14. ADMIN

### Sidebar structure:
Overview, Members, Intelligence (WikiLux + Insights + Comments + Brief), LuxAI (Command Center + Content Queue), Contributions, Recruiting (Assignments + ATS Pipeline + Briefs + Business Briefs), Escape, System (Tasks + Media + Contact + Email Templates + Settings + Trash)

### Admin design rules:
- `#f5f5f5` bg, `#fff` cards, `#e8e8e8` borders, `#111` text
- Zero gold, zero Playfair Display in admin
- All admin routes: `export const dynamic = 'force-dynamic'`

---

## 15. DESIGN SYSTEM

- **Gold** `#a58e28` — max 3 uses per page: active tab underline, italic taglines/accents, primary CTA only
- **Dark bg** `#1a1a1a`, **cards** `#222`
- **Logo** = `joblux-header.png` — never typed as text
- **Headings:** Playfair Display 400. **Body:** Inter
- **Signal dots:** green=Growth, amber=Leadership, red=Contraction, blue=Expansion, purple=M&A

### Text contrast rule (hard):
On dark backgrounds: Headings = `#fff`. Body = `#ccc` minimum. Secondary = `#999` minimum. Hints = `#777` minimum. Banned: `#666` and below on dark bg.

### Layout rule (hard):
Every horizontal band must wrap in `max-width:1200px` + `margin:0 auto` + `padding:0 28px`

### Copy rules:
- "Considering opportunities" (never "Open to approaches")
- "Company" (never "Luxury Employer")
- American English throughout
- "Express interest" = "apply"

---

## 16. ESCAPE MODULE

- Monthly luxury travel magazine, separate business
- Revenue: Fora advisory commissions
- Nav: Blog · Itineraries · Hotels Reserve · City Life · Deals · Plan Your Trip
- Warm yellow bg `#F7F3E8` — never mix with main dark theme
- No cross-links to JOBLUX career/salary content from inside Escape
- Consultation form emails: `mo.mzaour@fora.travel`
- First edition: "April knows better."
- Status: ✅ LAUNCHABLE

---

## 17. EVENTS MODULE

- Full calendar at `/events`
- Each event: list card → `/events/[slug]` detail + `.ics` download
- Filters: sector, region, month, invitation-only
- ~94 events/year, 38 countries
- Bridge to Luxury PDF = seed source (Mo to re-upload)
- Status: ❌ detail pages all 404

---

## 18. SHARED SYSTEMS

### Taxonomy:
8 locked sectors: Fashion, Jewelry, Watches, Beauty, Hospitality, Automotive, Spirits & Wine, Art & Culture. 177/180 brands mapped. 3 intentionally NULL.

### Social sharing:
Copy link + LinkedIn + Send to colleague (SES modal) — discreet, hover-triggered.

### Tab SEO (Apr 4):
All tabbed pages use `?tab=` query params. Brands: 5 tabs (~760 sitemap URLs).

---

## 19. LAUNCH BLOCKERS (as of Apr 10 audit)

| Priority | Issue | Impact |
|---|---|---|
| 🔴 1 | Article detail pages all 404 | /insights broken |
| 🔴 2 | Event detail pages all 404 | /events broken |
| 🔴 3 | 5,609 AI salary records live, labeled "verified" | False claims on homepage + /careers |
| 🔴 4 | Interview page shows stale counts (28 experiences, 12 maisons) | Data was deleted, counts not updated |
| 🔴 5 | Hardcoded wrong numbers across site | "500+ houses", "20 sectors", "250K+ briefing", "1000 data points" |
| 🔴 6 | Protected pages (dashboards, admin) not audited | Unknown state |
| 🟡 7 | Tiffany & Co empty shell | Needs single regen |
| 🟡 8 | Magic links not configured (Resend) | Registration limited to OAuth only |
| 🟡 9 | Tiffany duplicate (slug: tiffany-co) unpublished | Minor |

---

## 20. WHAT IS LAUNCHABLE TODAY

✅ Browse 176 brand dossiers
✅ Read 11 real market signals + detail pages
✅ Browse 26 confidential assignments
✅ Register as employer or professional (OAuth only)
✅ Escape module
✅ /join, /connect, /select-profile, /about, /faq, /privacy, /terms

❌ Article detail pages (all 404)
❌ Event detail pages (all 404)
❌ Salary data (all AI, falsely labeled)
❌ Interview intelligence (zero real data)
❌ Dashboards (not audited)
❌ The Brief newsletter (Resend not configured)

---

## 21. ROADMAP ITEMS (NOT YET STARTED)

- WikiLux multilingual SEO: /brands/[slug]/[lang] — EN + AR, ZH, JA = 528 additional indexed pages
- Brand autopilot: quarterly regen, display only in admin, not wired to cron
- Headline-similarity dedup on RSS signal route
- Salary `is_published` audit before bulk unpublish
- Account page (`AccountClient_v1.tsx`) — built, not deployed/tested
- BIMI: DMARC + DNS record + SVG logo
- Member Directory `/directory` — built but deactivated
- CV parsing by AI — SHIPPED end-to-end (S1 + S1.5). Identity prefill: explicit confirm via S1.5 panel. Other field prefills (experiences, education, languages) deferred.

---

## 22. DEPLOYMENT

- SSH push to GitHub → Coolify auto-deploys
- Terminal only, never GitHub Desktop
- One-line copy-paste commands only
- Uniquely named files every time (never `page.tsx` in Downloads)
- Claude Code prompts: single copyable lines in code blocks, no placeholders

---

## 23. DIAGNOSTIC RULES

- Curl the live URL first, diagnose from facts, fix the exact problem
- For count/state bugs: DB truth → API endpoint code → frontend filter (bug is almost always in the middle layer)
- When Supabase returns correct data but Next.js shows null: check middleware redirects and container staleness first
- Before writing any file that connects to existing code: `cat` the existing file first
- Confirm which file renders the live URL before touching any code

---

## 24. PROFILUX DOCTRINE — LIVING OBJECT MODEL

**Status:** Locked May 6, 2026. Reaffirmed by MATRIX v1.2 (May 7, commit `5d8672b`).

**Canonical doctrine doc:** `docs/PROFILUX_MODEL.md`
**Implementation contract:** `docs/PROFILUX_MATRIX_V1.md` (v1.2 — May 7 UX promotion addendum)

**Core principle:** ProfiLux is a single living professional profile object, owned continuously by the user. It is not a wizard, not a submission, not a pending object, not approved by Mo, not frozen.

**Mo approval scope (narrow):** platform access at registration + contributions. Never to ProfiLux itself.

**Flow:** approved user dashboard → Continue ProfiLux → fresh CV upload → Haiku parse → populated living document → user edits / owns continuously.

**All projections read the same object:** self dashboard, ATS, recruiter view, public share `/p/[name]`, PDF exports, matching layer.

**Field tier model (per MODEL):**
- **Tier 0** — seeded at signup: name, email, location
- **Tier 1** — recruiter-critical (PARKED, schema not yet built)
- **Tier 2** — credibility enrichment (PARKED, schema not yet built)
- **Existing Phase 4 fields** — see `lib/profilux/types.ts` `EditorView`

**UX shell (per MATRIX v1.2 §§21–24, repo-locked):**
- View / Edit / Manage triad
- Section catalog: 9 default sections + 8 add-library sections (Tier 2 schema PARKED)
- Responsive: desktop primary, mobile stacking with full-viewport drawers
- Component families: section card, drawer, state marker, chip multi-toggle, tri-state Yes/No, identity strip

**Identity prefill (S1.5 — May 7, 2026, commit `38c2100`):**
- Explicit user confirmation only — no silent L1 → L2 writes
- Resolver computes `cv_identity_suggestions` pre-Rule-A from raw `members.*` and `cv_parsed_data.identity`
- 4 fields scoped: `first_name`, `last_name`, `city`, `nationality`
- Eligibility: L1 non-empty AND raw L2 null/empty
- UI: inline review panel; user selects rows + clicks Apply selected → POST `/api/profilux` with selected fields only
- Pattern is reusable for future field prefills (experiences, education, languages, etc.)

**Matching entry (replaces M6 admission):** backend-only readiness signal. No user-facing confirm action. No threshold percentage. No "Pending Candidate" state.

**Drift reset phrase:** *"living object, not wizard / not submission / not approval"*

---

*This document replaces all prior context/handoff files. Update this file at the end of every session. One document, always current.*
