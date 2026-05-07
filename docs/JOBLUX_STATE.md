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
1. GitHub MCP / GitHub connector - committed repo truth from joblux/ClaudeCORE. Preferred default.
2. Claude Code / local terminal - local truth only: git status, uncommitted changes, unpushed files, tests/builds, execution/writes, deploy/push confirmation.
3. User paste from Claude Code - fallback when MCP tools do not surface.
4. Never use uploaded project files, stale memory, old chats, or summaries as repo truth.

Announcement protocol: every repo read must declare path + branch (or commit hash if non-HEAD) + "committed truth, local uncommitted changes invisible".

This section overrides any prior contradictory instruction in this file.

---

## ACTIVE CHAIN

Execution order. Ledger statuses untouched — this is the mental map, not DB truth.

### LAST SHIPPED (May 7 2026 — ProfiLux Reload S0 docs + S1 CV pipeline COMPLETE)

- **5d8672b** `docs(profilux): MATRIX v1.2 - promote UX MAP triad + sections + responsive + components` — S0 of ProfiLux Reload tunnel rewrite. Pure docs patch (`docs/PROFILUX_MATRIX_V1.md`, +188/-2). Promotes 4 UX MAP items (per `docs/PROFILUX_RELOAD_UX_MAP.md` §13 promotion checklist) from approved-capture status to MATRIX-locked doctrine. New sections: §21 View / Edit / Manage triad (three named modes, never simultaneous), §22 Section catalog (9 default sections fixed + 8 add-library Tier 2 PARKED), §23 Responsive philosophy (desktop primary, mobile stacking, drawer behavior), §24 Component family strategy (section card / drawer / state marker / chip multi-toggle / tri-state Yes/No / identity strip — family-level only, no specific component names locked). CHANGE LOG entry v1.2 added. Status header updated to "locked v1.2 (May 7 UX promotion addendum)". §22.1 Identity row extended with `bio` + `linkedin_url` per GPT micro-correction. §23.5 mobile hierarchy phrasing tightened per GPT micro-correction. Substrate (§§1–20, §7.6.1 EditorView shape, §4.5 write contract, §6 resolver, §7 projection masks, §10 utilities, §13 deferred items) all KEEP unchanged. §13 deferred items list partially closed: triad / section catalog / responsive philosophy / component families now repo-locked here; their previous "pending MATRIX promotion" labels in the UX map are superseded by §§21–24. No code, no schema, no implementation. Workflow note: GitHub MCP `create_or_update_file` returned 403 "Resource not accessible by integration" — write blocked. Fallback: file generated in `/mnt/user-data/outputs/`, downloaded by Mo, committed via Claude Code `cp ~/Downloads/...` pattern. Pattern locked for future large doc edits where MCP write surface is unreliable. Remote SHA `6596b2a8c3a5977dac9af3d8c691634baa61445d`.

- **b533e31** `feat(profilux): S1 additive CV upload + parse card (no prefill)` — S1 of ProfiLux Reload tunnel rewrite. Single-file change (`app/dashboard/candidate/profilux/page.tsx`, +167/-1). Pure additive. Restores spirit of historical commit `408cd7d` (CV card wiring) adapted to the current 754-line 11-screen tunnel without touching it. **GPT decisions locked pre-implementation:** G1=γ (no identity prefill in this slice — direct POST would violate no-silent-L1-to-L2 invariant; making Screen 1 editable is too large for S1; prefill becomes separate S1.5 slice), G8=above-renderStep full-width (matches existing tunnel `maxWidth: 900` from screens 3/4/6/7/8/9/10 + `grid` const), G2=source CV state exclusively from `editor.cv_meta` already returned by `/api/profilux` GET (drop the `/api/members/me` second fetch from `408cd7d` — single source, no drift). **Edits made:** (1) Add `useRef` to existing top React import line. (2) 5 new state hooks + 1 useRef inside `ProfiluxPage`: `fileInputRef`, `uploading`, `parsing`, `uploadError`, `parseError`, `needsReviewCount`. (3) Top-level `mapParseError(code)` helper outside component, mapping 10 `M6_*` error codes to short user-facing strings + default. (4) 3 handlers between `refetch` and `useEffect`: `handleUploadClick` (clear error + trigger hidden file input), `handleFileSelected` (POST `multipart/form-data` to `/api/members/cv-upload` with field name `cv`, await `refetch()` on success to refresh `editor.cv_meta`, reset `needsReviewCount` to null), `handleParse` (POST to `/api/members/cv-parse` with no body, on success await `refetch()` + set `needsReviewCount` from `data.needs_review_count`, on failure setParseError via mapParseError). (5) Derived values added after `const e = editor`: `cvUrl = e.cv_meta?.cv_url ?? null`, `cvParsedAt = e.cv_meta?.cv_parsed_at ?? null`, `parsedDateLabel`. (6) JSX card inserted immediately before `{renderStep()}`: 3 visual states keyed off `(cvUrl, cvParsedAt)` — cas A "Upload your CV", cas B "CV uploaded. [Replace] / Parse CV", cas C "CV parsed `<date>`. [Replace] / Re-parse" + inline error rendering + "N items to review" line + hidden `<input type=file accept=".pdf,.docx">`. Reuses existing `saveBtn`/`saveBtnDis` styles. Card style matches existing tunnel cards (dark `#222`, border `#2a2a2a`, `maxWidth: 900`). **Doctrine compliance verified:** zero new `fetch('/api/profilux'` calls in diff (the one match in baseline grep is the existing `refetch` GET, unmodified), zero `applyCvPrefill` references (deferred to S1.5 per G1=γ), zero new `case N:` arms in `renderStep()` switch, zero changes to the 7 draft state quartets, zero changes to refetch body / Prev-Next nav / any existing handler. cv-upload route, cv-parse route, profilux route, lib/profilux/types.ts all read-only — not touched. **TSC clean (`npx tsc --noEmit` exit 0). Build clean (`npm run build` ✓ Compiled successfully). Browser+DB validated end-to-end in prod on Alex Mason fixture (`luxuryretailsale@gmail.com`):** card visible above tunnel as "ProfiLux — Identity Screen 1/11" loads, "CV uploaded. Replace" + Parse CV button rendered correctly per cas B, click Parse → "Parsing..." state propagates immediately → ~28s Haiku roundtrip → card transitions to cas C with "CV parsed 5/7/2026" + Re-parse + "7 items to review". DB post-parse: `cv_parsed_at` populated `2026-05-07 21:19:03 UTC`, `cv_parsed_data` populated (3 experiences, 7 needs_review). **L2 sovereignty proof of no silent L1→L2 prefill:** L1 parsed `first_name='Alex', last_name='Mazour', city='NYC'` (a different person/CV file). L2 stayed strictly unchanged: `first_name='Alex', last_name='Mason', city='Paris', country='Andorra', nationality=null, phone='+33...', headline=null, bio=null, job_title=null, current_employer=null`. Zero silent prefill. Zero L2 corruption. The system perfectly isolated L1 (NYC/Mazour) from L2 (Paris/Mason) — exactly the doctrine behavior. `profile_completeness=0` unchanged across the parse (recompute ran W3 but L1 alone doesn't move the score, consistent with backend-only readiness signal). Workflow note: post-S0, GitHub MCP write reliability remained uncertain so S1 also followed the Code-execution pattern (Code applies the patch to local working tree, MCP read verifies remote SHA after push). Remote HEAD `b533e31464e19fcebc8581e3cbff0b944305e0b0` confirmed via GitHub MCP `list_commits` immediately after push.

### CURRENT STEP — strict order, no skip, no resequence from broader ledger

**ProfiLux Reload — S0 docs + S1 CV pipeline COMPLETE (May 7, 2026 PM session).**

S0 (MATRIX v1.2 UX promotion) and S1 (additive CV upload + parse card) both shipped and prod-validated end-to-end in single session. Substrate intact. Tunnel intact. Doctrine intact. L2 sovereignty proven via Mazour/NYC L1 vs Mason/Paris L2 invariance.

**Next strict step — S1.5 planning only.**

Identity edit / explicit prefill decision. No code. No silent POST to `/api/profilux` from CV parse. No passport / drawer rewrite yet. Mo approves the planning output before any implementation prompt is drafted for Code.

**S1.5 scope (planning only, do not implement without Mo approval):**
- Decide identity prefill mechanism: explicit user-confirmed merge UX (review screen with diff + accept/reject per field) versus making Screen 1 write-enabled with prefill suggestions surfaced as inline "Apply from CV?" affordances.
- Constraint: must respect §5.2 + §17 of MATRIX v1.2 (L1 may suggest/prefill L2 only via explicit user confirmation; no silent writes).
- Constraint: must align with §22.1 default Identity section (`first_name, last_name, city, country, nationality, phone, headline, avatar_url, bio, linkedin_url`) — but minimum viable S1.5 scope is the 4 fields `408cd7d` originally targeted (`first_name, last_name, city, nationality`).
- Out of scope for S1.5: passport / drawer cutover (separate later slice), Settings / Manage surface (PARKED per §19/§21.3), Tier 1 schema (PARKED per §15.2), Tier 2 add-library sections (PARKED per §22.2), maskable layer schema (PARKED per §16.4), CV merge state machine API endpoints (PARKED per §17.3 — prefill UI sits on top of existing routes only).

**Guardrails for S1.5 session (locked):**
- No `cv-parse` route changes. STATE DO NOT explicit, prod-green.
- No schema migrations.
- No Tier 1 columns added.
- No Settings / Manage surface built.
- No passport cutover.
- No removal of any of the 11 existing tunnel screens.
- The §4.5 W1/W2/W3 write contract applies unchanged to any new identity write path.

**Earlier-session prior context (carried forward):**

- Phase 3 frontend audit CLOSED 2026-05-07 (morning session). All 3 active surfaces shipped (`ed0c662` Surface 1 orphan removed + `0bf208c` Surface 4 admin members migration + `2b8f4bf` Surface 3 ATS migration) and prod-validated. Phase 4 ledger row `8f82b3ac` umbrella stays open until tunnel passport rewrite lands. F-ats-detail-subtitle-trailing-at parked as cosmetic, out of scope.
- Phase 4.A milestone CLOSED 2026-05-05. All 7 write-enabled screens shipped (3, 4, 6, 7, 8, 9, 10).
- Phase 4.B/C/D/E chain closed 2026-05-05 — ProfiLux contract harmonized: `/api/profilux` emits `{surface, view, editor}`, `/api/members/me` emits 8 live fields. `toLegacyProfile` adapter removed.
- Layer 2 GitHub MCP truth-source workflow operational. All repo reads this session declared path + branch + committed-truth caveat. Slice scoping, type-consumer pre-flight, post-deploy validation, and STATE rotation all conducted via MCP. S0 + S1 both used Code-execution-with-MCP-verification pattern when MCP write surface returned 403.

**Surfaces NOT in current scope (carried forward):**
- B39 CV bucket repair execution (`member-cvs` private; 5 broken URLs in `member_documents.file_url` + 5 in `members.cv_url`). Resume with fresh `/ultrareview`.
- Tier 1 schema (`notice_period`, `work_authorization`, `salary_history`, `reporting_line`, `budget_responsibility`, `team_size`) — PARKED until product trigger.
- Slice 2B reset-link identity source swap — STATE DO NOT remains against `/api/profilux/reset-link`, parked under `0e6f3271`.

**Cosmetic observations from this session (non-blocking, not slated):**
- None from S0 (docs-only).
- None from S1 prod validation (UI rendered exactly as expected across all 3 card states; parse roundtrip clean).
- F-ats-detail-subtitle-trailing-at carried forward from morning session.

**Locked doctrine (May 6, 2026, unchanged):**
- ProfiLux is a single living professional profile object, owned continuously by the user.
- Not a wizard. Not submit / pending / review. Not frozen. Not Mo-approved.
- Mo approval applies to platform access at registration, and to contributions (brand corrections, salaries, insider voices) — never to the ProfiLux itself.
- Flow: approved user dashboard → Continue ProfiLux (existing CTA on /dashboard/candidate) → fresh CV upload → Haiku parse → populated living ProfiLux document → user edits / owns it continuously.
- All projections read the same object: self dashboard, ATS view, recruiter view, public share /p/[name], PDF exports, matching layer.

**Canonical doctrine doc:** docs/PROFILUX_MODEL.md (committed ecb60a5, May 6 2026).
**Implementation contract:** docs/PROFILUX_MATRIX_V1.md (v1.2 — May 7 UX promotion addendum, this session, commit `5d8672b`).
**Umbrella ledger row:** 88d4bd79-f0d4-4e9c-9125-e00df2699ca6 (Recruiting System / high / open).
**Phase 4 ledger row:** 8f82b3ac-f1ab-4905-8142-658c03edc52e (validated, but stays as anchor for tunnel passport rewrite).
**Directional prototype (NOT an implementation source):** ~/Desktop/joblux-prototypes/profilux_flow_v3.html.

### DO NOT

- Touch cv-parse route again unless a new bug surfaces (currently green in prod). S1 validation reconfirmed.
- Implement L1 → L2 silent writes from any code path. S1 ships proof of compliance (Mazour/NYC L1 vs Mason/Paris L2 invariance under parse).
- Deviate from `docs/PROFILUX_MATRIX_V1.md` (v1.2) without updating the spec first (per its §12.2).
- Use Hélène BILLARD as fixture (consent unconfirmed, blocked permanently).
- Read `members.*` or `cv_parsed_data` directly from any UI surface for ProfiLux fields — go through `projectFor`.
- Do not treat `profilux` standalone table as fully dormant — it is reclassified as share-state-only (holds `share_slug` + `sharing_enabled` for `/p/[name]`; written by `/api/profilux/reset-link`, read by `app/[slug]/page.tsx`). Full retirement remains a post-v1.1 cleanup, tracked in ledger `6aef236e`.
- Touch `/api/profilux/reset-link` — sharing UX rebuild is a separate post-migration concern.
- Refactor legacy `calculateProfileCompleteness` in `app/api/members/profile/route.ts` — separate commit. Best handled together with `f6508e54` and the eventual tunnel passport rewrite.
- Fix the dashboard 8-field completeness divergence (`f6508e54`) — flagged-only finding, no fix scheduled.
- Resequence backlog from broader ledger.
- Build any product-facing surface (tunnel, editor, dashboard, admin) without first read-only inspecting the live components per the visual guardrail.
- Drift from the executive-presence guardrail in any copy or microstate.
- For S1.5 specifically: do NOT add a silent POST to `/api/profilux` from any parse handler. Do NOT add a passport / drawer rewrite into the same slice. Do NOT add a Settings / Manage surface. Do NOT add Tier 1 columns or any schema migration. The slice is identity-only and respects §5.2 + §17 explicit-confirmation doctrine.

### PARKED (admin_tasks status=parked)

- `2847ac29` — Audit + migrate Anthropic model IDs across repo before Sonnet 4 retirement (deadline Jun 15 2026)
- `1e6162ea` — Replace inert RPC `submit_m6_admission` (incompatible with locked Apr-14 11-screen proto)
- `9b806aa3` — F-luxuryrecruiter — repo-wide purge of legacy domain
- `6aad3904` — Security review backlog — 37 remaining findings from ultra-review 2026-04-24
- `8f82b3ac` — Phase 4 premium ProfiLux tunnel + editor rebuild (anchor row, currently `validated`; carries through tunnel passport rewrite)
- `35469863` — Phase 5 admin polish (gated on Phase 4)

### NEW FINDINGS LOGGED (out of immediate scope, surface separately)

- **F-empty-string-vs-null** — Phase 2.2 POST writes "" instead of NULL when form fields are blank. Best handled with Phase 4. Parked. → CLOSED 2026-05-01 by 12e597f + c7cd53a + cleanup SQL.
- **F-availability-default-drift** — Phase 2.2 POST overwrites availability with form-state default on every Continue. Best handled with Phase 4. Parked. → CLOSED 2026-05-01 by 12e597f + c7cd53a + cleanup SQL.
- **F-currency-default-applied** — Phase 2.2 POST writes desired_salary_currency=EUR from form-state default. Same root cause as availability drift. Parked. → CLOSED 2026-05-01 by 12e597f + c7cd53a + cleanup SQL.
- **F-roles-constraint-drift** — `members.role` constraint accepts 5 legacy values still (professional, member, senior, insider_contributor, insider_key_speaker). Cleanup. Parked.
- **F-registration-role-mismatch** — Suspected drift between intended role at registration and stored role. 30-min audit before public launch. Parked.

- **f6508e54** — F-completeness-triple-system — 3 divergent profile_completeness calculations coexist (dashboard frontend 8-field, members.profile_completeness DB column M6-weighted, legacy `calculateProfileCompleteness` in /api/members/profile/route.ts). Logged, status=open priority=normal. Best handled with STATE C5 + Phase 4.

- **F-editor-l1-fallback-education** — `resolveProfiLux` populates `editor.university` / `editor.field_of_study` / `editor.graduation_year` from `cv_parsed_data.education[0]` when the corresponding L2 columns are NULL. Observed during Phase 4.A.6b validation: Screen 6 inputs render prefilled with CV-parsed values even when DB L2 is NULL. UX consequence: first save promotes L1-derived values into L2 (even without explicit user edit if save is triggered), and clearing L2 fields back to NULL returns the UI to the L1 fallback prefill on next read. Documented as known resolver behavior, not a blocker. No fix scheduled — consistent with v1 design (CV = canonical seed).

- **F-ats-detail-subtitle-trailing-at** *(logged 2026-05-07, parked)* — `app/admin/ats/[id]/page.tsx` ~L498 renders header subtitle as `${member.headline || \`${member.job_title} at ${member.maison}\`.trim() || '—'}` — when `headline` is null and `maison` is null but `job_title` is present, the fallback string evaluates to `"Boutique Leader at "` with a trailing `"at "`. Cosmetic UI bug, pre-existing, not caused by `2b8f4bf`. Best handled in a single commit guarding the `at` join with a maison-presence check.

*Carried forward from prior rotations:*

- **F-luxuryrecruiter** — see parked `9b806aa3`
- **F-save-error-body-dropped** *(logged 2026-05-04)* — `handleSave3`, `handleSave4`, `handleSave6`, `handleSave8`, `handleSave10` all use `throw new Error(\`HTTP ${res.status}\`)` and drop the API error body. Users see e.g. `Error: HTTP 400` instead of descriptive route messages (e.g. `desired_salary_min cannot exceed desired_salary_max` from Screen 10 range guard). Cross-screen UX fix parked; out of Phase 4.A.10c scope. Best handled in a single dedicated commit that updates all five handleSaveN functions to extract `errBody?.error` from the failed response body before rethrowing.
- **F-magiclink-delivery** — Magic-link UI works, NextAuth token created, but SES delivery uncertain
- **F-pdfparse-anthropic-files** — Evaluate Anthropic Files API native PDF input as v2 parser path
- **F-admin_tasks-trigger** — `done` and `completed_at` derive trigger only fires via PATCH route, not direct UPDATE
- **F-cv_url-format-mixed** — 5/8 rows full-URL, 3/8 path-only; `normalizeCvStoragePath` handles both
- **F-public-slug-stub** — `app/[slug]/page.tsx` reads frozen-out `profilux` table; uses `.single()` not `.maybeSingle()`. Park alongside `profilux` table retirement (ledger `6aef236e`). → CLOSED 2026-05-07 by `369c2e0` (Slice 2A migrated to PublicProjection via 3-step resolve chain).
- **F-members-me-incomplete** — closed by Phase 2.3 (`081f3beb`)
- **F-profilux-frozen-table-routes** — closed by Phase 2.1 + 2.2 (`0c04c8b9` + `4397dd97`)

### LEDGER NOTE

- ProfiLux Reload S0 + S1 SHIPPED 2026-05-07 PM. MATRIX v1.2 doctrine patch (`5d8672b`) + S1 additive CV pipeline (`b533e31`). Both prod-validated. Phase 4 ledger row `8f82b3ac` stays validated as anchor — does not need DB write this session.
- Phase 3 frontend audit CLOSED 2026-05-07 AM. All 3 active surfaces shipped (`ed0c662` Surface 1 + `0bf208c` Surface 4 + `2b8f4bf` Surface 3) and prod-validated.
- Phase 4 spec foundation shipped (Phase 4.A.10a–c, 4.B/C/D/E, MATRIX v1.1 May 6, MATRIX v1.2 May 7).
- Three findings closed earlier via 12e597f + c7cd53a + cleanup SQL: F-empty-string-vs-null, F-availability-default-drift, F-currency-default-applied (forward-only fix; DB ledger rows remain status=parked).
- Workflow note: GitHub MCP `create_or_update_file` returned 403 "Resource not accessible by integration" twice this session (S0 doc, MATRIX v1.2). Established Option B as the safe pattern for large doc edits: generate file in `/mnt/user-data/outputs/`, Mo downloads, Code runs `cp ~/Downloads/<file> docs/<file>` + verification (shasum + line count + tail) + commit + push. MCP read remains the primary verification surface post-push.

**Last updated:** May 7, 2026 PM (ProfiLux Reload S0 + S1 SHIPPED + prod-validated. MATRIX v1.2 doctrine patch `5d8672b` + S1 additive CV pipeline `b533e31`. L2 sovereignty proven end-to-end via Mazour/NYC L1 vs Mason/Paris L2 invariance under parse. Next strict step: S1.5 planning only — identity edit / explicit prefill decision, no silent POST, no passport/drawer.)
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
- ProfiLux editor at `/dashboard/candidate/profilux` (currently 11-screen tunnel + S1 additive CV upload+parse card above; passport rewrite pending per MODEL)

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
- Current implementation: 11-screen tunnel (Phase 4.A complete) at `/dashboard/candidate/profilux`, with S1 additive CV upload+parse card above the tunnel (commit `b533e31`, May 7). Passport-with-drawer UX rewrite pending (MATRIX v1.2 §7.6 + §§14, 21–24).
- Storage contract: `members.*` flat columns + `cv_parsed_data` jsonb (per MATRIX v1 §3 layer model)
- Resolver: `lib/profilux/resolveProfiLux` returns `ProfiLuxResolved` (single shape, all surfaces)
- 6 surface projections via `projectFor`: dashboard / editor / public / admin / ats / client
- CV pipeline: Haiku 4.5 parser at `/api/members/cv-parse`, schema_v1.0, locked sectors + proficiencies. End-to-end pipeline (upload → parse → cv_parsed_data write → UI refresh) prod-validated May 7 via S1 (`b533e31`). L2 sovereignty proven: parsed L1 (Mazour/NYC) did not silently overwrite L2 (Mason/Paris).
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
- CV parsing by AI — field `cv_parsed_at` exists, end-to-end pipeline shipped May 7 via S1 (`b533e31`); identity prefill from L1 deferred to S1.5 planning

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

**Status:** Locked May 6, 2026. Reaffirmed by MATRIX v1.2 (May 7, commit `5d8672b`). Supersedes prior M6 admission doctrine.

**Canonical doctrine doc:** `docs/PROFILUX_MODEL.md`
**Implementation contract:** `docs/PROFILUX_MATRIX_V1.md` (v1.2 — May 7 UX promotion addendum)

**Core principle:** ProfiLux is a single living professional profile object, owned continuously by the user. It is not a wizard, not a submission, not a pending object, not approved by Mo, not frozen.

**Mo approval scope (narrow):** platform access at registration + contributions (brand corrections, salary data, insider voices). Never to ProfiLux itself.

**Flow:** approved user dashboard → Continue ProfiLux → fresh CV upload → Haiku parse → populated living document → user edits / owns continuously.

**All projections read the same object:** self dashboard, ATS, recruiter view, public share `/p/[name]`, PDF exports, matching layer.

**Field tier model (per MODEL):**
- **Tier 0** — seeded at signup: name, email, location
- **Tier 1** — recruiter-critical (PARKED, schema not yet built): notice period, work authorization, salary history, reporting line, budget responsibility, team size
- **Tier 2** — credibility enrichment (PARKED, schema not yet built): structured certifications, awards, references, portfolio, publications, memberships
- **Existing Phase 4 fields** — see `lib/profilux/types.ts` `EditorView`

**UX shell (per MATRIX v1.2 §§21–24, repo-locked):**
- View / Edit / Manage triad (three named modes; user is always in one and only one).
- Section catalog: 9 default sections (fixed order, permanent) + 8 add-library sections (opt-in, Tier 2 schema PARKED).
- Responsive: desktop primary (identity strip top-fixed + section card grid), mobile stacking single-column with full-viewport drawers.
- Component families (family-level only, no specific names locked): section card, drawer, state marker, chip multi-toggle, tri-state Yes/No, identity strip.

**Matching entry (replaces M6 admission):** backend-only readiness signal. No user-facing confirm action. No threshold percentage. No "Pending Candidate" state. Computed from Tier 1 core fields when those land + explicit consent (future, not derived from `availability` by default).

**Drift reset phrase:** *"living object, not wizard / not submission / not approval"*

---

*This document replaces: JOBLUX_MASTER_DOC_v1.docx, JOBLUX_Consolidated_System_v1_1.docx, JOBLUX_CURRENT_STATE_v1_1.docx, JOBLUX_SYSTEM_BLUEPRINT_v1.docx, JOBLUX_Architecture_Blueprint_v2.docx, Claude_build_charter.docx, and all previous context/handoff files.*

*Update this file at the end of every session. Replace in project. One document, always current.*
