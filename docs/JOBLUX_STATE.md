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

---

## ACTIVE CHAIN

Execution order. Ledger statuses untouched — this is the mental map, not DB truth.

### LAST SHIPPED (May 1 2026 — Phase 2 ProfiLux Matrix v1 route migrations COMPLETE)

- **26daffc** `feat(profilux): migrate /api/profilux GET to Matrix v1 (Phase 2.1, ledger 0c04c8b9)` — GET handler refactored to read from `members.*` via `resolveProfiLux(member.id, supabase) → projectFor(view, 'editor')`. Returns `{ surface: 'editor', view, profile }`. Frozen `profilux` standalone table no longer read. Editor-mode legacy adapter `toLegacyProfile(view)` documents lossy mappings (`specialisations ← expertise_tags`, `markets ← market_knowledge`, `salaryExpectation ← desired_salary_max ?? desired_salary_min ?? 0`, `languages.map(l => l.language)` drops proficiency, `experience.id = String(index)`). Sharing fields frozen (`sharingEnabled: false, shareSlug: null`) per GPT D5. `availability` normalized via switch in adapter. Validated end-to-end via Chrome probe + DB read of test row (Baya, member id `273c3950...`). Ledger `0c04c8b9` closed.

- **8874626** `feat(profilux): migrate /api/profilux POST to Matrix v1 (Phase 2.2, ledger 4397dd97)` — POST handler refactored to write `members.*` flat columns only (Option δ, GPT-locked). 9 mapped fields: `first_name, last_name, city, nationality, headline, bio, availability` (verbatim editor enum), `desired_salary_max ← body.salaryExpectation || null` (single-value→max bucket, min untouched), `desired_salary_currency, updated_at`. After write: `resolveProfiLux` re-fetched, `computeProfileCompleteness(resolved)` recomputed, second UPDATE persists `profile_completeness` only when score changed. Editor array fields (experience, languages, sectors, specialisations, markets) accepted in body but NOT persisted; documented in code as deferred to Phase 4. Frozen `profilux` standalone table fully abandoned. No `cv_parsed_data` writes (β rejected per STATE DO NOT). Returns `{ surface, view, profile }` matching GET shape (D8-A symmetry). Validated end-to-end: round-trip persistence (headline, salary), completeness recomputed (33 = G1 + G6, M6 weighted), Option δ array drop confirmed (5 fields silently dropped). Ledger `4397dd97` closed.

- **da64053** + **17ee41e** `Phase 2.3 — /api/members/me Matrix v1 alignment (ledger 081f3beb)` — two-commit phase. **da64053** initial deploy used GPT-locked decisions D9-β (adapter shim, no `DashboardProjection` extension), D10-A (`resolveProfiLux` for ProfiLux/L3/CV portion), D11-A (`m6_confirmed_at` always returned, even when null), R6-A (second targeted SELECT for `company_name`, `org_type`, `approved_at` — kept off `ProfiLuxResolved` because they are member/dashboard metadata, not ProfiLux fields). Initial shape `{ surface: 'members-me', view, member: <legacy 16-field flat> }` mirrored `/api/profilux`'s `.profile` envelope. **REGRESSION DETECTED LIVE:** `/api/members/me` consumers (candidate + business dashboards) store the raw response body via `setMember(await res.json())` and read fields off the top level (e.g. `member.first_name`) — unlike `/api/profilux` consumers which extract a sub-key (`pData.profile || pData`). Legacy fields under nested `.member` were unreachable. Caught via business dashboard render (Mohammed/Hublot): page rendered, no 500, but `last_name`/`company_name` empty (silent failure with empty-string fallbacks). **17ee41e** F2 fix per GPT: spread the 16 legacy fields at top level alongside `surface` + `view` (additive). UI consumers untouched. `lib/profilux/*` untouched. `MemberRow`/`ProfiLuxResolved`/`DashboardProjection` untouched. Validated end-to-end on both consumers (executive: Baya / business: Mohammed-Hublot): API top-level shape, dashboard render, sidebar/settings card/brief form `org_type` propagation, save round-trip via `refreshMember`. Closes `F-members-me-incomplete` (4 L3/CV adds: `profile_completeness`, `m6_confirmed_at`, `cv_url`, `cv_parsed_at`). Ledger `081f3beb` closed.

- **408cd7d** `feat(profilux): wire cv-parse to candidate UI (Phase 3, ledger 3a781f8b)` — Single-file change to `app/dashboard/candidate/profilux/page.tsx`. CV card above the 7-step form (upload / parse / re-parse). Identity-only prefill (firstName, lastName, city, nationality), no overwrite of non-empty fields, no silent POST. User saves via existing Continue → Phase 2.2 POST. Reads `cv_url` + `cv_parsed_at` from `/api/members/me`. Live-validated end-to-end on prod (no-overwrite path + fresh-upload-prefill-persist path). Ledger `3a781f8b` validated.

- **dba6d2a** `docs(matrix): add §4.5 L2 write contract (Phase 4.0 prep)` — Spec patch establishing the L2 write contract: W1 (empty-string '' → NULL coercion), W2 (partial-body / explicit-presence write), W3 (unconditional recompute), Adapter constraint (no minting EUR/open from NULL on read).

- **12e597f** `fix(profilux): Phase 4.0 write contract + null default drift fix` — Two-file atomic patch implementing §4.5 W1 + W2: `app/api/profilux/route.ts` (coerceEmpty helper, hasOwnProperty presence guards, adapter null preservation) + `app/dashboard/candidate/profilux/page.tsx` (availability/salaryCurrency widened to `string | null`, initial state null, EUR display-only fallback in salary select). TSC clean.

- **cb5c948** `docs(matrix): §4.5 inverse-mapping rule (Phase 4.1 prep)` — Spec extension: when read-side adapter collapses multiple DB-canonical values into a single UI value, write endpoint MUST apply inverse mapping. UI `open` → DB `not_actively_looking` (canonical default).

- **c7cd53a** `fix(profilux): Phase 4.1 inverse-mapping rule for availability` — Single-file patch to `app/api/profilux/route.ts`. Adds `denormalizeAvailability` helper (right-inverse of `normalizeAvailability` for canonical defaults). POST availability now uses denormalize instead of coerceEmpty. Live-validated end-to-end on prod across 2 scenarios (untouched Continue + explicit user pick): DB conserve `not_actively_looking` in both cases. TSC clean.

- **DB cleanup 2026-05-01** — Two surgical UPDATEs ran on `members`: `nationality = ''` → NULL (1 row, luxuryretailsale), `bio = ''` → NULL (1 row, luxuryretailsale). Post-cleanup Q1 inventory: zero empty-string rows across all 6 identity fields. `availability='open'` and `desired_salary_currency='EUR'` historical drift left untouched per forward-only policy (cannot programmatically distinguish drift from authored value).

- **917e6dc** `docs(matrix): §7.6 EditorView projection addendum (Phase 4.A prep)` — Spec foundation for Phase 4.A. Inserts §7.6 in `docs/PROFILUX_MATRIX_V1.md` defining the `EditorView` projection (TS-style contract), the 11-screen read/write map, and the locked principle that **availability + readiness fields are NOT M6 admission blockers**. Pure additive (+108 / -0). UI consumes EditorView only — never raw `view` or legacy `profile`. M6 admission logic intentionally out of scope; deferred to a future spec patch.

- **eb1093a** `feat(profilux): canonical vocabulary contract (Phase 4.A sub-phase 2)` — Adds `lib/profilux/vocabulary.ts` as the single source of truth for ProfiLux option lists consumed by the rebuilt 11-screen editor. Greenfield file; no consumer migration in this sub-phase; no DB changes. Six locked option groups: seniority (9), sectors (8), subsectors (35), specializations (28), departments (20), contract_types (6). Lowest seniority = `entry_level`. JOBLUX kill words ('Intern', 'members') excluded. DB columns are free-text / text[] with no CHECK constraints — values enforced in code only per PROFILUX_MATRIX_V1 §4.5 + §7.6. TSC clean.

- **44fde68** `feat(profilux): add EditorView projection (Phase 4.A-0)` — Implements §7.6 EditorView as a flat projection in `lib/profilux/`. Adds `EditorView`, `EditorAvailability`, `EditorCvMeta` types in `types.ts`. Extends `EditorProjection` with `editor: EditorView` (additive, backward-compatible — `view: ProfiLuxResolved` retained). Adds `projectEditorView(view)` projector in `projectFor.ts` with isolated `normalizeEditorAvailability` helper. `projectFor('editor')` now returns `{ surface, view, editor }`. No UI changes. No route changes. Restores spec ↔ code alignment (§7.6 was previously spec-only). +161 / -0. TSC clean.

### CURRENT STEP — strict order, no skip, no resequence from broader ledger

Phase 4 spec foundation — **§7.6 EditorView addendum SHIPPED** (commit 917e6dc, 2026-05-02). Phase 4.A implementation can now reference §7.6 as the consuming spec.

1. **Phase 4.A — Editor implementation (consume `projection.editor`, not legacy `profile`)** *(ledger `8f82b3ac`, status: open)* — 11-screen tunnel rebuild consuming the §7.6 `EditorView` shape now exposed at `projection.editor` (shipped via 44fde68). Per Lot 3 §4 sequence: spec patch → vocabulary patch → EditorView projection (4.A-0) → 4.A reads `editor` → 4.B deprecate `toLegacyProfile` → 4.C migrate consumers (3 files / 4 fetch sites) → 4.D remove `toLegacyProfile` → 4.E `/api/members/me` cutover. `normalizeAvailability` retained per D2.

**Phase 5 — Admin polish** *(ledger `35469863`, parked)* — gated on Phase 4 candidate-side landing first.

### DO NOT

- Touch cv-parse route again unless a new bug surfaces (currently green in prod).
- Deviate from `docs/PROFILUX_MATRIX_V1.md` without updating the spec first (per its §12.2).
- Use Hélène BILLARD as fixture (consent unconfirmed, blocked permanently).
- Read `members.*` or `cv_parsed_data` directly from any UI surface for ProfiLux fields — go through `projectFor`.
- Implement L1 → L2 silent writes from any code path.
- Migrate the 3 dormant `profilux` standalone rows — data migration is post-v1 cleanup, tracked in ledger `6aef236e`.
- Touch `/api/profilux/reset-link` during Phase 3 — sharing UX rebuild is a separate post-migration concern.
- Refactor legacy `calculateProfileCompleteness` in `app/api/members/profile/route.ts` during Phase 3 — separate commit, per Mo decision C5. Best handled together with `f6508e54` and the Phase 4 editor rebuild.
- Fix the dashboard 8-field completeness divergence (`f6508e54`) during Phase 3 — flagged-only finding, no fix scheduled in this phase.
- Touch UI consumers of `/api/members/me` or `/api/profilux` during Phase 3 unless the cv-parse wire genuinely requires it. Adapter shims keep them working.
- Resequence backlog from broader ledger.
- Build any product-facing surface (tunnel, editor, dashboard, admin) without first read-only inspecting the live components per the visual guardrail.
- Drift from the executive-presence guardrail in any copy or microstate.

### PARKED (admin_tasks status=parked)

- `2847ac29` — Audit + migrate Anthropic model IDs across repo before Sonnet 4 retirement (deadline Jun 15 2026)
- `1e6162ea` — Replace inert RPC `submit_m6_admission` (incompatible with locked Apr-14 11-screen proto)
- `9b806aa3` — F-luxuryrecruiter — repo-wide purge of legacy domain
- `6aad3904` — Security review backlog — 37 remaining findings from ultra-review 2026-04-24
- `8f82b3ac` — Phase 4 premium ProfiLux tunnel + editor rebuild (gated on Phase 3)
- `35469863` — Phase 5 admin polish (gated on Phase 4)

### NEW FINDINGS LOGGED (out of immediate scope, surface separately)

- **F-empty-string-vs-null** — Phase 2.2 POST writes "" instead of NULL when form fields are blank. Best handled with Phase 4. Parked. → CLOSED 2026-05-01 by 12e597f + c7cd53a + cleanup SQL.
- **F-availability-default-drift** — Phase 2.2 POST overwrites availability with form-state default on every Continue. Best handled with Phase 4. Parked. → CLOSED 2026-05-01 by 12e597f + c7cd53a + cleanup SQL.
- **F-currency-default-applied** — Phase 2.2 POST writes desired_salary_currency=EUR from form-state default. Same root cause as availability drift. Parked. → CLOSED 2026-05-01 by 12e597f + c7cd53a + cleanup SQL.
- **F-roles-constraint-drift** — `members.role` constraint accepts 5 legacy values still (professional, member, senior, insider_contributor, insider_key_speaker). Cleanup. Parked.
- **F-registration-role-mismatch** — Suspected drift between intended role at registration and stored role. 30-min audit before public launch. Parked.

- **f6508e54** — F-completeness-triple-system — 3 divergent profile_completeness calculations coexist (dashboard frontend 8-field, members.profile_completeness DB column M6-weighted, legacy `calculateProfileCompleteness` in /api/members/profile/route.ts). Logged this session, status=open priority=normal. Best handled with STATE C5 + Phase 4.

*Carried forward from prior rotations:*

- **F-luxuryrecruiter** — see parked `9b806aa3`
- **F-magiclink-delivery** — Magic-link UI works, NextAuth token created, but SES delivery uncertain
- **F-pdfparse-anthropic-files** — Evaluate Anthropic Files API native PDF input as v2 parser path
- **F-admin_tasks-trigger** — `done` and `completed_at` derive trigger only fires via PATCH route, not direct UPDATE
- **F-cv_url-format-mixed** — 5/8 rows full-URL, 3/8 path-only; `normalizeCvStoragePath` handles both
- **F-public-slug-stub** — `app/[slug]/page.tsx` reads frozen-out `profilux` table; uses `.single()` not `.maybeSingle()`. Park alongside `profilux` table retirement (ledger `6aef236e`).
- **F-members-me-incomplete** — closed by Phase 2.3 (`081f3beb`)
- **F-profilux-frozen-table-routes** — closed by Phase 2.1 + 2.2 (`0c04c8b9` + `4397dd97`)

### LEDGER NOTE

- Phase 4 spec foundation shipped. Phase 4 ledger row (`8f82b3ac`) stays open until full editor rebuild lands.
- Vocabulary patch SHIPPED (commit `eb1093a`, 2026-05-04). Canonical file: `lib/profilux/vocabulary.ts`. Editor implementation (ledger `8f82b3ac`) remains open and is now the active CURRENT STEP.
- Three findings closed earlier in session via 12e597f + c7cd53a + cleanup SQL: F-empty-string-vs-null, F-availability-default-drift, F-currency-default-applied (forward-only fix; DB ledger rows remain status=parked).

**Last updated:** May 4, 2026 (Phase 4.A-0 EditorView projection shipped — `44fde68`)
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
- Conditional ProfiLux completion bar
- ProfiLux 7-step form at `/dashboard/candidate/profilux`

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

- 7-step form: Personal, Experience, Expertise & Languages, Sectors, Salary, Availability, Share
- Profile completeness % calculated and stored
- `profile_completeness` field in members table
- Fields cover: personal info, work experiences, education, languages, skills, luxury-specific data (sectors, product categories, client segments, clienteling), availability, salary expectations
- CV upload exists (stored in Supabase storage)
- `cv_parsed_at` field exists but parsing NOT implemented
- Two surfaces currently: ProfiLux (dark, `/dashboard/candidate/profilux`) and Profile (light, `/profile`) — overlap exists

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
- CV parsing by AI — field `cv_parsed_at` exists, not implemented

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

## 24. PROFILUX ENFORCEMENT & ADMISSION THRESHOLD (REFOUNDATION)

**Status:** Locked. Refoundation enforcement.

**Implementation contract:** see `docs/PROFILUX_MATRIX_V1.md` (commit `5cb1e0d`). That doc is the canonical ProfiLux storage / resolver / projection contract. This §24 stays as the product doctrine summary (L1–L5 + M6 fields); the Matrix v1 doc governs how it is implemented in code. On conflict, pause and reconcile against STATE before coding.

**Drift reset phrase:** *"follow L1–L5 + M6 exactly"*

### L1–L5 — ProfiLux locks

- **L1** — ProfiLux is the unified object across candidate dashboard, admin review, ATS/recruiting, and client submission. No parallel candidate records.
- **L2** — Candidate-authored core is canonical. Recruiter overlay (notes, assessments, internal flags) is additive, never replacing. Client-shared version is a render of the same data.
- **L3** — Minimum ProfiLux satisfies three constraints simultaneously: sufficient for Mo's admission review; sufficient for the recruiting loop to operate (search, shortlist, basic match signals); sufficient to be presentable to a client if Mo chose to submit early.
- **L4** — Readiness ProfiLux is the application + matching threshold. Above readiness, candidate is fully functional in the recruiting loop and self-serve application is meaningful.
- **L5** — Admin candidate surface is recruiting-loop-shaped. Pending review is one entry; the same surface family supports search, shortlist, profile management, client submission.

### M6 — Minimum ProfiLux for admission

Required fields before submission for Mo's review:

- **Identity:** full name (first, last); city + country; primary email (OAuth-confirmed)
- **Professional core:** current/most-recent role (brand + title + start date, end date if not current); one additional prior role (brand + title + dates); total years of experience; seniority level (per JOBLUX 9-level vocabulary, aligned with tier)
- **Luxury fit:** primary sector (one of 8 locked sectors); sub-sector or specialization (per 35 subsectors / 28 specializations vocabulary)
- **Capability:** at least one language with proficiency
- **Authenticity:** CV file uploaded (prefill source, retained as evidence); user confirmation that the prefilled ProfiLux is accurate
- **Phone:** OPTIONAL at M6

CV alone does not create a candidate. **User confirmation of M6 is the act that creates a Pending Candidate.**

### Phone policy

- **Optional at M6 (admission).**
- **Required at readiness, before any client submission.**

Excluded from M6 (deferred to readiness): salary expectations, availability, education detail, skills/clienteling/product categories, photo, bio, portfolio, references, sharing settings.

---

*This document replaces: JOBLUX_MASTER_DOC_v1.docx, JOBLUX_Consolidated_System_v1_1.docx, JOBLUX_CURRENT_STATE_v1_1.docx, JOBLUX_SYSTEM_BLUEPRINT_v1.docx, JOBLUX_Architecture_Blueprint_v2.docx, Claude_build_charter.docx, and all previous context/handoff files.*

*Update this file at the end of every session. Replace in project. One document, always current.*
