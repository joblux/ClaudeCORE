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
- Memory = quick recall only; restructuring or removing memory edits requires explicit Mo approval before write.
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

- **c84bc39** `feat(profilux-view): fill View tab cards from existing EditorView (living document slice)` — May 9 2026. SHIPPED + PROD-VALIDATED 8/8. Single-file slice (`app/dashboard/candidate/profilux/page.tsx`, +161/-17). Replaces three "Coming-soon" placeholders in the candidate ProfiLux View tab with content driven entirely from existing `editor` state (`EditorView`). Doctrine-locked semantics: View tab = candidate's private living professional document; Edit tab = enrichment/data capture surface. Real company names shown (no anonymization — public/client projection out of scope until sharing ships). Empty sections hide entirely; no completion/readiness language anywhere on View. Chips rendered as plain styled `<span>` elements, never buttons. Header card gets a fourth muted secondary line below location listing seniority / total years experience / years in luxury joined by ' · ' (rendered only when at least one is set; explicitly excludes job_title which appears one line above). About card renders bio with whitespace-preserved paragraphs, hidden if bio empty. Experience card renders real-name career history from `e.experiences[]` (cv_parsed_data L1 passthrough): each row shows `<job_title> at <company>`, location · date range, and description, with last row borderless. Skills & expertise card renders 6 stacked sub-sections (Sectors, Product categories, Areas of expertise, Skills, Markets, Languages); each sub-section hidden if its array is empty; whole card hidden if all are empty. Languages bundled inside Skills & expertise per locked decision. Inline `placeholderInner` helper removed. `viewChipStyle` constant declared INSIDE the view branch IIFE, not at module scope. NO API changes, NO state hooks, NO new fetches, NO touch to Edit tab cards/drawers/tunnel/Manage. Prod QA via Chrome MCP on Alex Mason fixture: 8/8 PASS — header tag line shows `15 years experience · 12 years in luxury` (Alex `seniority=null` → 2-item version, no job_title duplication) ✓; About card displays bio prose ✓; Experience card shows real names Hublot/JOBLUX.COM/Harrods across 3 rows with location+date ranges and descriptions ✓; Skills & expertise displays Sectors (Watches, Fashion), Product categories (Watches), Areas of expertise (Team Leadership), Skills (CRM Systems), Markets (Western Europe), Languages (English, French, Spanish) ✓; no completion language anywhere ✓; chips static (no hover, no cursor) ✓; Edit tab regression confirmed (full name "Alex Mason" + 83% complete + Screen 1/11 tunnel + CV/Re-parse + IDENTITY card + Edit drawer all intact) ✓; DB invariant — Alex `profile_completeness=83` unchanged via Supabase MCP ✓. ProfiLux now feels like a real living professional document on candidate side.

- **6d820f7** `fix(cv-parse): recompute profile_completeness after L1 write (D2)` — May 9 2026. SHIPPED + PROD-VALIDATED 4/4. Single-file fix (`app/api/members/cv-parse/route.ts`, +26/-0). Closes Matrix v1 §4.4 violation: `/api/members/cv-parse` wrote `cv_parsed_data` + `cv_parsed_at` but did NOT recompute `profile_completeness`. After CV parse, `cv_parsed_data.experiences[]` and `sectors[]` can satisfy G3/G4 group predicates, but the canonical scorer never ran — score stayed stale until a manual drawer save via `/api/profilux`. Fix: after the primary `cv_parsed_data` UPDATE and success `logHistory`, resolve the post-write member view via `resolveProfiLux(memberId, supabase)`, recompute via `computeProfileCompleteness(view)`, and persist the score if it moved. Mirrors the canonical pattern in `/api/profilux` POST. Three contract decisions (locked by GPT): (1) recompute is a SECONDARY consistency side-effect — resolver/scorer failures are NON-FATAL (logged via `console.error`, parse response stays success); (2) NO second `updated_at` bump on the score-only UPDATE (primary already bumped, score is derived state); (3) cached early-return path SKIPS recompute (no L1 change → no score delta). Idempotency guard `if (score !== resolved.profile_completeness)` avoids unnecessary writes. Prod QA via Chrome MCP + Supabase MCP on Alex Mason fixture: re-parse triggered POST 200 OK (Anthropic call ~15s), DB shows fresh `cv_parsed_at = 22:17:56.402` and `updated_at = 22:17:56.484` (80ms delta = single primary UPDATE, no second bump as designed), `profile_completeness = 83` preserved (idempotency guard worked — same predicates → same score → no score-only UPDATE issued), `needs_review_count = 7` returned correctly. No console errors. Response shape unchanged.

- **392c947** `fix(members-profile): remove legacy profile_completeness recompute (D3 option beta)` — May 9 2026. SHIPPED + PROD-VALIDATED 5/5. Single-file fix (`app/api/members/profile/route.ts`, +1/-56). Closes the triple-system completeness drift on the legacy route. D3 reachability sweep confirmed `/api/members/profile` has exactly two live callers: business dashboard Settings `saveProfile()` helper (mutating PUT for `{first_name, last_name}` or `{country, city, phone}`) and `/members/pending` 10s GET status polling. Legacy in-route `calculateProfileCompleteness` was overwriting `members.profile_completeness` with a divergent flat-field scoring on every business Settings save. Per GPT decision (Option β): the route should NOT touch `profile_completeness` at all — it is identity/location/account writer for business members, not a ProfiLux/matching-readiness writer; forcing canonical M6 onto business users would be semantically weird since business members can't satisfy G2/G3/G4/G5/G6 by design. Fix: deleted the in-file `calculateProfileCompleteness` async helper (~30 lines, not exported, no external callers per sweep), removed post-update re-fetch + recompute + second UPDATE, dropped `profile_completeness` from PUT/POST response body (only caller reads `data.error`, never the score field). Preserved GET handler, ALLOWED_FIELDS whitelist, partial-body filter, member field UPDATE. Prod QA via Chrome MCP on Mo's business fixture (mzaourm@gmail.com / Hublot): account holder Edit→save 200 OK; account holder revert save 200 OK confirmed via network capture; company info phone-clear save 200 OK; **definitive DB proof — pre-fix legacy scorer would have written 15 → 10 after phone clear (loss of phone +5pt); actual DB shows `profile_completeness = 15` UNCHANGED → legacy recompute path is dead** ✓; GET still returns full member envelope (pending polling preserved) ✓; Alex Mason candidate `profile_completeness = 83` preserved (canonical write path unaffected) ✓.

- **c7217d3** `feat(profilux): S13 Luxury Fit drawer integration (card + drawer above tunnel, screen 4 unchanged)` — May 8 2026 PM. SHIPPED + PROD-VALIDATED 25/25. Single-file slice (`app/dashboard/candidate/profilux/page.tsx`, +84/-1). Mirror of S8 chip-multi-toggle drawer pattern applied to Luxury Fit (Screen 4 in tunnel). New `<SectionCard eyebrow="Luxury Fit">` rendered inside the Edit branch between Current Position card+drawer and Skills & Markets card+drawer (restoring MATRIX §22.1 ordering locally). Closed-card body: 4-row read-only summary — `sectors` (read-only L1 passthrough, `member_sectors` table NOT activated; mapped via co-located `sectorLabel`), `years_in_luxury` (raw number or NotSet), `product_categories` (mapped via co-located `productCategoryLabel`), `expertise_tags` (mapped via co-located `expertiseTagLabel`). Drawer body OMITS sectors row (Tier 1 schema parked), reuses Screen-4 quartet verbatim (`draft4` / `setDraft4` / `handleSave4` / `saving4` / `savedAt4` / `saveError4`) — only new state hook is `luxuryFitDrawerOpen`. Three new co-located label helpers (`sectorLabel`, `productCategoryLabel`, `expertiseTagLabel`). Save round-trip on Alex Mason: years_in_luxury=12 / product_category=Watches / expertise_tag=Team Leadership → all 4 closed-card rows refetched correctly with human labels. **`profile_completeness` MOVED 66 → 83** on this save (G3 Luxury fit predicate fired: years_in_luxury ∧ ≥1 sector ∧ ≥1 product_category ∨ ≥1 expertise_tag now satisfied) — second post-S11 datapoint that strengthens the matching-readiness reading of canonical scorer.

- **c6618f7** `feat(profilux): S12 Identity drawer integration (card + drawer above tunnel)` — May 8 2026 PM. SHIPPED + PROD-VALIDATED 21/21. Single-file slice (`app/dashboard/candidate/profilux/page.tsx`, +141/-0; minor `/api/profilux` POST handler delta to accept `country` + `phone` snake_case keys). Mirror of S7 form-input drawer pattern applied to 8-field Identity section. New `<SectionCard eyebrow="Identity">` rendered inside the Edit branch between S1.5 prefill panel and Current Position card+drawer. Coordination doctrine: S1.5 prefill panel untouched (purely additive coexistence); Edit-tab identity strip in Edit header card untouched; tunnel Screen 1 untouched (read-only summary kept); drawer omits `cv_identity_suggestions` (only S1.5 owns prefill apply). Closed-card body: 8-row read-only summary (first_name, last_name, city, country, nationality, phone, headline, bio) with last-write-wins refetch reconciling 4 surfaces (sidebar / S1.5 / IDENTITY card / tunnel Screen 1). camelCase legacy + snake_case new write contract drift documented inline (firstName/lastName legacy preserved; country/phone added snake_case in S12 scope). Prod QA via Chrome MCP: all 4 surfaces converge via single `refetch()` fan-out after save. Completeness stayed 66% (G1 was already satisfied — datapoint, no regression).

### CURRENT STEP — strict order

**Slice catalog (Mo + GPT pick next; no commitment):**

A. **Manage tab reconciliation** — sharing/visibility framing + account settings consolidation. Can be scoped narrowly (preview/visibility chrome only) without touching `/api/profilux/reset-link` (still parked under `0e6f3271`). Or, if Mo unparks reset-link, do the full sharing UX. Doctrinally next given the View tab now feels like a real document.

B. **Identity micro-additions** — `linkedin_url`, `date_of_birth` (+ `avatar_url` if upload pipeline lands first). Smallest possible enrichment slice; mirrors S12 form-input drawer pattern. No new doctrine.

C. **Recruiter/admin projection refinement** — first surface to consume `client` projection from `projectFor`. Either an admin member detail enrichment, a recruiter-facing share preview, or a stub `/p/[slug]` server-emitted public projection endpoint. Higher-effort; opens the public projection convergence work.

D. **Multi-record collection migration** — Education / Career History / Languages / sectors collection migrations. Parked under `1609e494`. Largest scope; precedent slices required first.

**Recommended order: A → B → C → D.** A and B are no-doctrine, low-risk slices that keep ProfiLux feeling alive section-by-section. C is the natural pivot once enough sections are populated. D is post-launch shape.

### DO NOT

- Touch `/api/members/cv-parse` again unless a new bug surfaces. D2 fix (canonical recompute via resolver + scorer with non-fatal failure handling) is shipped at `6d820f7`.
- Touch `/api/members/profile` again unless a new bug surfaces. D3 Option β (legacy `calculateProfileCompleteness` removed; route is now identity/location writer only, not a completeness writer) is shipped at `392c947`.
- Implement L1 → L2 silent writes from any code path. S1 + S1.5 ship proof of compliance.
- Deviate from `docs/PROFILUX_MATRIX_V1.md` (v1.2) without updating the spec first (per §12.2).
- Use Hélène BILLARD as fixture (consent unconfirmed, blocked permanently).
- Read `members.*` or `cv_parsed_data` directly from any UI surface for ProfiLux fields — go through `projectFor` / resolver / EditorView.
- Consume `projectFor` client-side in any candidate UI surface. Public-projection masking is server-owned. The View tab at `/dashboard/candidate/profilux` is the candidate's PRIVATE living document surface (real names, real data); it does NOT consume the `public` or `client` projection. Real public preview content for `/p/[slug]` requires a separate server-emitted projection endpoint.
- Reintroduce completion/readiness language on the View tab. View = living document, not score. Edit tab keeps the internal "% complete" footer as a maintenance signal only.
- Treat `profilux` standalone table as fully dormant — it is share-state-only (`share_slug` + `sharing_enabled`). Full retirement in ledger `6aef236e`.
- Touch `/api/profilux/reset-link` — sharing UX rebuild is a separate post-migration concern.
- Build any product-facing surface (tunnel, editor, dashboard, admin) without first read-only inspecting the live components per the visual guardrail.
- Drift from the executive-presence guardrail in any copy or microstate.
- Delete or remap tunnel `renderStep()` cases for sections that have an active drawer integration (Screen 1 / Identity post-S12, Screen 3 / Current Position post-S7, Screen 4 / Luxury Fit post-S13, Screen 7 / Skills & Markets post-S8, Screen 8 / Clienteling post-S10, Screen 9 / Availability & Targets post-S11, Screen 10 / Compensation post-S9). Tunnel + drawer coexist deliberately; lift only happens in a dedicated future slice once all default sections have drawers shipped.
- Touch `/api/profilux` POST recompute or the canonical M6 scorer in `lib/profilux/computeProfileCompleteness` / `lib/profilux/_m6Groups`. The doctrine fork on what `profile_completeness` semantically represents is parked observation-only under `f6508e54`; no fix scheduled. The implementation drift is fully resolved.
- Drift back toward "wizard / completion / onboarding" framing for ProfiLux. Locked doctrine: living professional document. View tab = private living document surface. Edit tab = enrichment/data capture surface. `profile_completeness` is an internal canonical M6 / Profile Progress signal, not a user-facing score.

### PARKED (admin_tasks status=parked)

- `2847ac29` — Audit + migrate Anthropic model IDs across repo before Sonnet 4 retirement (deadline Jun 15 2026)
- `1e6162ea` — Replace inert RPC `submit_m6_admission` (incompatible with locked Apr-14 11-screen proto)
- `9b806aa3` — F-luxuryrecruiter — repo-wide purge of legacy domain
- `6aad3904` — Security review backlog — 37 remaining findings from ultra-review 2026-04-24 (B19 next critical: role escalation via set-tier; B39 containment shipped, repair plan locked but not yet coded)
- `8f82b3ac` — Phase 4 premium ProfiLux tunnel + editor rebuild (anchor row, validated; carries through tunnel passport rewrite)
- `35469863` — Phase 5 admin polish (gated on Phase 4)
- `0e6f3271` — Slice 2B reset-link identity source swap (gates Manage tab full sharing UX)
- `1609e494` — Relational L2 collection migration family — Education, Career History, Languages, sectors collection migrations. Precedent slices required first.

### NEW FINDINGS LOGGED (out of immediate scope, surface separately)

- **F-completeness-triple-system** (`f6508e54`) — open, observation-only, no fix scheduled. RESOLVED at the implementation level after D2 + D3: the canonical M6 scorer in `lib/profilux/computeProfileCompleteness` is now the single source of truth, with two canonical recompute trigger sites (`/api/profilux` POST + `/api/members/cv-parse` POST). Legacy `calculateProfileCompleteness` deleted. The remaining open question is doctrinal, not technical: what does `profile_completeness` semantically represent? Three forks (matching readiness coverage / holistic richness / multidimensional split). GPT framing locked: current scorer is "matching readiness coverage disguised as a percentage" — internally coherent, label slightly misleading. v2 architecture sketched (3-dimensional: PROFILE RICHNESS / MATCHING READINESS / VISIBILITY-TRUST) but explicitly post-launch. Not user-facing on View tab anymore — see View slice doctrine. Implementation parity confirmed by 3 datapoints in S7-S13 (S11 Availability moved 49→66 / S13 Luxury Fit moved 66→83 / others inert by design).
- **F-s15-checkbox-misalignment** *(logged 2026-05-08, parked)* — S1.5 review panel checkbox column slightly offset from field-name/value rows in the 3-column grid (`24px 160px 1fr`). Cosmetic only; logical structure correct; functionality unaffected. Best handled with the next ProfiLux Reload UI slice if it touches identity components, otherwise standalone single-line CSS fix.
- **F-roles-constraint-drift**, **F-registration-role-mismatch** — pre-launch parked.
- **F-editor-l1-fallback-education** — known resolver behavior, no fix.
- **F-ats-detail-subtitle-trailing-at** — cosmetic, parked.
- **F-save-error-body-dropped** — cross-screen UX fix parked, single-commit candidate.
- **F-magiclink-delivery**, **F-pdfparse-anthropic-files**, **F-admin_tasks-trigger**, **F-cv_url-format-mixed** — carried.
- **F-public-slug-stub** — CLOSED 2026-05-07 by `369c2e0`.
- **F-empty-string-vs-null**, **F-availability-default-drift**, **F-currency-default-applied** — CLOSED 2026-05-01.

**Last updated:** May 9, 2026 — End of session. Five slices shipped this session (S12 Identity drawer at `c6618f7` 21/21, S13 Luxury Fit drawer at `c7217d3` 25/25, D3 legacy completeness scorer removed at `392c947` 5/5, D2 cv-parse canonical recompute at `6d820f7` 4/4, View tab enrichment at `c84bc39` 8/8). Triple-system completeness drift fully resolved at the implementation level — canonical M6 scorer is single writer; two canonical recompute trigger sites (`/api/profilux` POST + `/api/members/cv-parse` POST); legacy scorer deleted. ProfiLux doctrine locked: living professional document, not wizard/completion funnel. View tab = private living document surface (real names, real data, no completion language, empty sections hide). Edit tab = enrichment/data capture surface. `profile_completeness` is now an internal canonical M6 / Profile Progress signal, not a user-facing score. HEAD `c84bc39`. Next recommended slice: A (Manage tab reconciliation, narrow scope).
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

- **Claude Opus (this instance):** DB verification, audit, guardrails, architecture decisions, prompt quality control, prod QA via Chrome MCP + Supabase MCP after Mo signals Coolify green
- **GPT:** Strategy, content design, risk detection, doctrine guardrail, slice direction approval
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

## 6. DATABASE STATE (verified Apr 13, 2026; deltas live)

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
- Reads `profile_completeness` from `/api/profilux` GET (single source of truth, canonical M6)
- ProfiLux editor at `/dashboard/candidate/profilux`: View / Edit / Manage triad. View = candidate's private living professional document (real names, no completion language, empty sections hide). Edit = enrichment/data capture surface (S1.5 prefill panel + 7 per-section drawers + 11-screen tunnel coexisting). Manage = sharing/visibility/account (placeholder, gated on reset-link unparking).

### Business (`/dashboard/business`):
- Submit brief CTA
- Request status view
- "How it works" 4-step process
- Nav: Dashboard, Recruiting, Intelligence, Account
- Settings tab: Account holder Edit + Company info Edit (writes via `/api/members/profile` PUT, no longer touches `profile_completeness` post-D3 fix at `392c947`)

### Insider (`/dashboard/insider`):
- Role framing block (Trusted Contributor)
- Contribution stats (total, points, by type)
- Write perspective CTA
- Contribution history

### Router: admin→/admin, business→business, insider→insider, others→candidate

---

## 12. PROFILUX

- Living professional document, owned continuously by user (per MODEL May 6, MATRIX v1.2 §2). NOT a wizard, NOT a profile completion system, NOT a static CV builder, NOT a rigid ATS onboarding funnel.
- Doctrine locked May 9, 2026: continuously refined, adaptable, reusable externally, discreet, flexible across industries/geographies, designed around modern nonlinear careers.
- Surface separation:
  - **View tab** = candidate's PRIVATE living professional document surface (real names, real data, no completion language, empty sections hide entirely). Header card + About + Experience + Skills & expertise (with Languages bundled).
  - **Edit tab** = enrichment/data capture surface. S1.5 prefill panel + CV upload/parse card + 7 per-section drawers (Identity, Current Position, Luxury Fit, Skills & Markets, Compensation, Clienteling, Availability & Targets) + 11-screen tunnel coexisting (legacy, scheduled for retirement post all-default-sections-have-drawers).
  - **Manage tab** = sharing/visibility/account (placeholder; gated on `/api/profilux/reset-link` unparking).
- Storage contract: `members.*` flat columns + `cv_parsed_data` jsonb (per MATRIX v1 §3 layer model). Relational L2 collection tables (work_experiences, education_records, member_languages, member_sectors) currently DORMANT — parked under `1609e494`.
- Resolver: `lib/profilux/resolveProfiLux` returns `ProfiLuxResolved` (single shape, all surfaces). Emits `cv_identity_suggestions` (4-field pre-Rule-A diff for S1.5 prefill UI).
- 6 surface projections via `projectFor`: dashboard / editor / public / admin / ats / client. `EditorView` carries `cv_identity_suggestions` pass-through.
- CV pipeline: Haiku 4.5 parser at `/api/members/cv-parse`, schema_v1.0, locked sectors + proficiencies. Prod-validated end-to-end. Canonical recompute fires post-write per Matrix §4.4 (D2 fix at `6d820f7`).
- Identity prefill: explicit-confirmation only (S1.5). L1 → L2 silent writes forbidden across all code paths.
- `members.profile_completeness` computed via `lib/profilux/computeProfileCompleteness` (canonical M6 binary group scorer: G1 Identity 17 / G2 Position 17 / G3 Luxury 17 / G4 Experience 16 / G5 Availability 17 / G6 CV 16). Internal-only signal, NOT a user-facing score on View tab. Two canonical recompute trigger sites: `/api/profilux` POST (drawer/tunnel saves) + `/api/members/cv-parse` POST (CV parse). Legacy `calculateProfileCompleteness` deleted at D3 (`392c947`).
- Doctrine fork on what `profile_completeness` semantically represents (matching readiness coverage / holistic richness / multidimensional split) PARKED observation-only under `f6508e54`. Current scorer is "matching readiness coverage disguised as a percentage" per GPT framing — internally coherent.

### Hard launch boundaries (locked May 9, 2026)
- No proactive AI / copilot layers
- No multidimensional readiness engines
- No autonomous guidance
- No advanced projection systems
- No reopening of architecture debates

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
- ProfiLux View tab: NEVER "Profile X% complete", "Not specified", "None selected", "Coming soon" — those belong to Edit tab only.

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
- CV parsing by AI — SHIPPED end-to-end (S1 + S1.5 + D2 canonical recompute). Identity prefill: explicit confirm via S1.5 panel. Other field prefills (experiences, education, languages) deferred.

---

## 22. DEPLOYMENT

- SSH push to GitHub → Coolify auto-deploys
- Terminal only, never GitHub Desktop
- One-line copy-paste commands only
- Uniquely named files every time (never `page.tsx` in Downloads)
- Claude Code prompts: single copyable lines in code blocks, no placeholders
- Vercel is not used in JOBLUX prod (TWX only).

---

## 23. DIAGNOSTIC RULES

- Curl the live URL first, diagnose from facts, fix the exact problem
- For count/state bugs: DB truth → API endpoint code → frontend filter (bug is almost always in the middle layer)
- When Supabase returns correct data but Next.js shows null: check middleware redirects and container staleness first
- Before writing any file that connects to existing code: `cat` the existing file first
- Confirm which file renders the live URL before touching any code

---

## 24. PROFILUX DOCTRINE — LIVING DOCUMENT MODEL

**Status:** Locked May 6, 2026. Reaffirmed by MATRIX v1.2 (May 7, commit `5d8672b`). Doctrine lock reinforced May 9, 2026 post-D2/D3/View slice closure.

**Canonical doctrine doc:** `docs/PROFILUX_MODEL.md`
**Implementation contract:** `docs/PROFILUX_MATRIX_V1.md` (v1.2 — May 7 UX promotion addendum)

**Core principle:** ProfiLux is a single living professional document, owned continuously by the user. It is not a wizard, not a submission, not a pending object, not approved by Mo, not frozen, not a profile completion system, not a static CV builder, not a rigid ATS onboarding funnel.

**ProfiLux IS:** continuously refined, adaptable, reusable externally, discreet, flexible across industries/geographies, designed around modern nonlinear careers.

**Mo approval scope (narrow):** platform access at registration + contributions. Never to ProfiLux itself.

**Flow:** approved user dashboard → Continue ProfiLux → fresh CV upload → Haiku parse → populated living document → user edits / owns continuously.

**All projections read the same object:** self dashboard, ATS, recruiter view, public share `/p/[name]`, PDF exports, matching layer.

**Surface separation (locked May 9, 2026):**
- **View tab** = candidate's PRIVATE living professional document surface. Real names, real data. No completion language. Empty sections hide. No fake interactivity. Header / About / Experience / Skills & expertise (Languages bundled).
- **Edit tab** = enrichment/data capture surface. S1.5 prefill panel + CV card + 7 per-section drawers + 11-screen tunnel.
- **Manage tab** = sharing/visibility/account. Placeholder; gated on reset-link unparking.

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

**`profile_completeness` semantics (locked May 9, 2026):**
- Internal canonical M6 / Profile Progress signal, NOT a user-facing score on View tab.
- Single canonical writer: `lib/profilux/computeProfileCompleteness` (binary group scorer over G1–G6).
- Two canonical recompute trigger sites: `/api/profilux` POST (drawer/tunnel saves) + `/api/members/cv-parse` POST (CV parse).
- Legacy `calculateProfileCompleteness` deleted (D3 at `392c947`).
- Doctrine fork on semantic meaning (matching readiness coverage / holistic richness / multidimensional split) parked observation-only under `f6508e54`. v2 architecture (3-dimensional split) is post-launch.

**Hard launch boundaries (locked May 9, 2026):**
- No proactive AI / copilot layers
- No multidimensional readiness engines
- No autonomous guidance
- No advanced projection systems
- No reopening of architecture debates

**Drift reset phrase:** *"living document, not wizard / not submission / not approval / not completion funnel"*

---

*This document replaces all prior context/handoff files. Update this file at the end of every session. One document, always current.*
