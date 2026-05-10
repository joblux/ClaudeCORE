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

- **070272b** `Merge PR #5 — fix(security): B16 - MIME whitelist hardening on /api/members/cv-upload` — May 10 2026 (c). SHIPPED + COOLIFY-GREEN (deploy 01m52s, ended 11:26 UTC). Underlying patch commit `06dbaf0` (+12/-1, 1 file). 1) ALLOWED_MIME_TYPES Set added (application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document). 2) MIME validation block inserted after extension check (rejects mismatched file.type with 400 + same UX message). 3) `contentType: file.type || 'application/octet-stream'` → `contentType: file.type` (fallback unreachable post-whitelist). Source: ultra-review 2026-04-24 finding B16, parent ledger row `6aad3904`. Build: compile + typecheck PASS in cloud sandbox; data-collection FAIL was env-only (sandbox missing Supabase keys), confirmed unrelated to patch. Doctrine context: patch authored + reviewed in Bridge V2 first iteration session, which itself was concluded as cosmetic (see `F-bridge-v2-remote-control-cosmetic`). Ledger row `e9eaa900` (status=closed pending Mo prod-QA validation). Out of scope, logged separate: `F-cv-upload-doc-parse-mismatch` (df876d97) — .doc accepted by upload, rejected by parse.

- **a49fb09** `fix(business): surface phone in /api/members/me + refine F-2-3 support note scope` — May 10 2026. SHIPPED + COOLIFY-GREEN + PROD-VALIDATED 3/3. Two-bug closure on /dashboard/business Settings Company info card. 2 files, +2/-1. Bug 1 (F-members-me-incomplete-phone): /api/members/me toLegacyMember() omitted phone, so all read paths showed "—" while DB writes via /api/members/profile PUT succeeded silently. Fix: add phone: view.phone to toLegacyMember(). Bug 2 (F-2-3 copy refinement): "To update company details" was scope-ambiguous; refined to "To update company name or organisation type, contact info@joblux.com." Mo-validated in prod 3/3 (Phone row populated / Edit pre-fill / refined copy). Ledger row 6d3bb076.

- **c585c57** `fix(business): clarify Company information is read-only + remove dead Sector row` — May 10 2026. SHIPPED + COOLIFY-GREEN. F-2-3 Fork 2 UX clarification. 1 file, +4/-5. Adds muted support-note "To update company details, contact info@joblux.com" under read-only Company info card on /dashboard/business Settings tab. Removes dead Sector row (both companyRows array + edit-mode display block) — members.sector does not exist as a column; row always rendered "—". Doctrine: company identity fields (company_name, org_type) stay non-self-editable; changes go through support channel. /api/members/profile ALLOWED_FIELDS deliberately unchanged. Static verification only (build green, no Chrome MCP behavioral probe per Mo option-(a) decision pattern). Coolify deploy of c585c57: git_only by design pending F-runtime-build-sha-not-exposed.

- **92bc106** `fix(auth): restrict set-tier self-service allowlist to professional tiers` — May 10 2026. SHIPPED + COOLIFY-GREEN. B19-followup hardening. 1 file, +1/-1. VALID_TIERS in app/api/members/set-tier/route.ts trimmed from 5 → 3: ['rising', 'pro', 'executive']. Removes 'business' and 'insider' from self-service allowlist. Closes residual first-call self-escalation surface left by original B19 idempotency-only guard at tier_selected || registration_completed. Preserves: existing tier_selected || registration_completed guard, /select-profile flow (PROFILES literal sends rising/pro/executive only), /join applyPendingTier path, /join/employer separate path via /api/members/employer-signup. Static verification only (build green, no Chrome MCP behavioral probe). Coolify deploy 03m52s, status Success. Ledger row d7d15dfe (B19-followup, status=closed). Original B19 row 28839019 (status=validated) untouched. Exploit-chain mechanics preserved in git history + ultra-review report.

- **e4fdf46** `refactor(admin): F-2-2 surface company_name + org_type to admin members LIST` — May 10 2026. SHIPPED + PROD-VALIDATED 8/8. 2 files, +18/-2. SELECT widening + role-branched subtitle (`company_name · org_type` for business; professionals unchanged).

- **b982f53** `refactor(admin): F-2 Option gamma surface company_name + org_type to AdminMemberDetail` — May 10 2026. SHIPPED + PROD-VALIDATED 7/7. 3 files, +21/-5. Closes F-2 admin DETAIL via second targeted SELECT (mirrors `/api/members/me` R6-A pattern). Casts removed from `app/admin/members/[id]/page.tsx`.

- **3edf6ac** `refactor(profilux): F-1a kill MemberProfile, formalize as AdminMemberDetail adapter` — May 9 2026 PM. SHIPPED + PROD-VALIDATED 7/7 (Alex Mason fixture `e6899932` — all tabs render: Overview, AI Assessment, Experience, Skills, Documents, Preferences, Notes). Refactor slice. Eliminates the parallel `MemberProfile` type system (`types/member-profile.ts`, 114 lines) that was consumed only by `app/admin/members/[id]/page.tsx`. Replacement: canonical `AdminMemberDetail` adapter type in `lib/profilux/types.ts`, formalized as the ONE place `ProfiLuxResolved` is extended for an admin client surface. Definition: `AdminMemberDetail = Omit<ProfiLuxResolved, 'languages'> & { full_name: string, notes: string | null, work_experiences: AdminWorkExperience[], education_records: AdminEducationRecord[], languages: AdminLanguage[], documents: AdminMemberDocument[] }`. The `Omit` on `'languages'` resolves the TS intersection array-element-type collision between `ResolvedLanguage` (L1 passthrough, no `id`) and `AdminLanguage` (route-synthesized stable `id`). Four sub-types added: `AdminWorkExperience`, `AdminEducationRecord`, `AdminLanguage`, `AdminMemberDocument`. Files: `lib/profilux/types.ts` (+76 — adapter + 4 sub-types + doctrine comment), `lib/profilux/index.ts` (+5 — barrel exports), `app/api/admin/members/[id]/route.ts` (+10/-7 — typed `member: AdminMemberDetail` object at JSON response site, no logic change), `app/admin/members/[id]/page.tsx` (+19/-19 — import swap from `@/types/member-profile` to `@/lib/profilux` + 8 type generic replacements; component name `MemberProfilePage` preserved verbatim; all `(member as any).company_name` and `(member as any).org_type` casts preserved as-is for F-2), `types/member-profile.ts` DELETED. 5 files, +112/-142 net. Build: green on 2nd pass after ONE bounded type-only fix (Omit on `'languages'` to break TS intersection collision). All 5 conditions of Step 8 corrective-pass envelope satisfied (scoped file, caused by patch, type-only, no new types beyond Step 2, casts preserved). Push exit 0. Coolify deploy: `git_only` verification (pending `F-runtime-build-sha-not-exposed`). Doctrine: this is the ONE admin-surface adapter; other admin/recruiting surfaces consume `ProfiLuxResolved` or `projectFor()` directly; new surfaces (recruiter share, ATS detail) get sibling adapter types, NOT extensions of `AdminMemberDetail`. Pattern killed: parallel client type systems for admin surfaces.

- **90567a0** `feat(bridge): V1.1 — close ingestion layer (reasoning-first)` — May 9 2026 PM. SHIPPED. Workflow-infrastructure slice. Adds the missing payload channel between Claude AI's close-card output and Claude Code's local apply step. Reasoning-first design (locked by Mo + GPT): no bash STATE compiler. Claude AI emits a compact close-card YAML (~30-60 lines) to chat. Mo saves to `.bridge/relay/close-card.yaml`. Claude Code reads card + STATE + git log and applies STATE rotation + composes HANDOFF V3 using normal reasoning. Code shows diff and stops; Mo commits manually. Files: `.bridge/relay/.gitkeep` (new — local payload entry directory), `.bridge/skills/close-precheck.sh` (new — 39-line write-free YAML validator with PyYAML→grep fallback), `.gitignore` (+3 lines, `.bridge/relay/*.yaml` ignored), `.claude/skills/joblux-close/SKILL.md` (V1.1 chat-side schema + Mo workflow; removes `/tmp/joblux-handoff/` artifact paths and stale V1 truth-probe + V1 relay-card sections that contradicted the new "skill never writes files" rule). 4 files changed, +107/-69. Self-test pass: valid card → exit 0 with summary; missing card → exit 1 with clear error. `bash -n` clean. Push exit 0, tree clean. SKILL.md change (137 lines) exceeded the spec's 80-line scope-creep tripwire; tripwire amended explicitly by GPT — change was spec-mandated REMOVE/ADD/REPLACE, not interpretation drift. Eliminates `F-close-skill-artifact-friction` (presumed; first real-use verification = 2026-05-09b close itself). Coolify deploy of `90567a0`: V1 design = `git_only` verification (actual drift not verified pending `F-runtime-build-sha-not-exposed`).


- **a829033** `feat(profilux-manage): read-only Visibility and sharing panel (A1 refined)` — May 9 2026 PM. SHIPPED + PROD-VALIDATED 10/10. Two-file slice: `app/api/profilux/share/route.ts` (new, 58 lines) + `app/dashboard/candidate/profilux/page.tsx` (+96/-41). New `GET /api/profilux/share` endpoint, session-authenticated, reads ONLY legacy `profilux.share_slug` + `profilux.sharing_enabled` via `.maybeSingle()`; does NOT read identity/profile fields, does NOT resolve or project the canonical `members.*` object, does NOT write, does NOT touch reset-link. Returns `{ share_slug, sharing_enabled, public_url, can_share }`. `public_url` env-driven: `process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://joblux.com'` with trailing-slash strip. No-row case → 200 with all-null/false defaults (UI renders "Private" without error state). Manage tab body replaced: demo placeholder + demo `Drawer` removed, replaced with `<SectionCard eyebrow="Visibility & sharing">` showing status badge (gray dot + "Private — public link off" / green dot + "Public link active"), read-only Share URL preview (muted #777 when off, #ccc when on) wrapped in dark code-block style, italic "Link is reserved but not active. Sharing controls coming soon." beneath URL when slug present + sharing off, "No public link reserved yet" when slug null, footer italic "Visibility controls and account settings coming soon." `drawerDemoOpen` useState + setter removed (verified zero remaining refs in file). New state hooks: `shareStatus` (typed object | null), `shareStatusError`, `shareStatusLoading`. New tab-keyed `useEffect` with cancellation flag pattern: refetches `/api/profilux/share` on every Manage tab visit. Doctrine-locked: legacy `profilux` table stays isolated from `EditorView`, resolver, and `projectFor`; share state never leaks into the canonical ProfiLux object. Three GPT guardrail edits applied pre-Code: VERBATIM MODE → CARD-FIRST MODE per Operator Bridge doctrine; hardcoded `https://joblux.com` → env-driven with prod-correct fallback; build verification → exit-code reporting via `/tmp/manage-build.txt` with conditional tail-on-failure. Prod QA via Chrome MCP on Alex Mason fixture (luxuryretailsale@gmail.com): all 10/10 PASS — endpoint deployed (200, not 404) ✓; `share_slug=mohammed-alex-m-zaour` reads from legacy profilux table ✓; `sharing_enabled=false` rendered as gray dot + "Private — public link off" ✓; `public_url=https://www.joblux.com/mohammed-alex-m-zaour` (env-driven, prod uses `www.` prefix) ✓; URL color muted #777 when sharing off ✓; italic "Link is reserved but not active" rendered beneath URL ✓; footer italic "Visibility controls and account settings coming soon" present ✓; no demo drawer / no toggle / no copy / no settings ✓; tab nav clean (View/Edit/Manage all reachable) ✓; build green, 2-file scope clean, no resolver/projectFor/EditorView/schema/reset-link/public-route drift ✓.


### CURRENT STEP — strict order

**Active session pivot (2026-05-10):** Closing product session. Next session is workflow-infrastructure (Bridge V2 planning), separate dedicated conversation. Trigger phrase: *"Open JOBLUX workflow infrastructure session — Bridge V2"*. Mix doctrine: do NOT bundle Bridge V2 work into product slices.

**Slice catalog (Mo + GPT pick next on product session resume; no commitment):**

A. **Manage tab reconciliation** — A2 (full sharing UX with toggle + reset-link unparking under 0e6f3271). Larger.

B. **Identity micro-additions** — CANCELLED 2026-05-10. Doctrine lock added: "no LinkedIn in ProfiLux, no LinkedIn dependency on JOBLUX." Existing dormant linkedin_url in MemberRow / ProfiLuxResolved / EditorView stays dormant. date_of_birth alone has no consumer surface (V7 hides from public + client; View tab doesn't show it; matching/scoring doesn't use it). Future identity slices must respect LinkedIn lock.

C. **Recruiter/admin projection refinement** — first surface to consume `client` projection from projectFor. Higher-effort; opens public projection convergence work.

D. **Multi-record collection migration** — Education / Career History / Languages / sectors. Parked under 1609e494. Largest scope.

E. **Security follow-ups (post B19-followup):** B1 (15 unauthed admin routes), B3 (~17 unauthed LuxAI routes), B15 (admin upload-images), B18 (wikilux generate/translate/images), B23 (contribution approval rollback), B16 (CV upload MIME whitelist). All from 2026-04-24 ultra-review, parked under 6aad3904. Each is a candidate small hardening slice in the B19-followup pattern.

F. **Launch checklist items:** F-2-4 dead schema cleanup (company_email/company_website/company_size — pure DDL drop; 0/12 rows populated, safe), b7590e0d (logged-in audit), 8651a836 (Resend/magic-link), 7becdb12 (compliance pack), 6f57a924 (private-layer noindex), 04c65c54 (hardcoded numbers).

**Recommended product order on resume: F-2-4 → E (small B-series follow-ups in batches) → A2 → C → D.** F-2-4 is trivial DDL; B-series are small hardening slices in the proven B19-followup shape; A2 unparks reset-link; C pivots to public projection convergence; D is post-launch.

### DO NOT

- Touch `app/api/profilux/share/route.ts` again unless sharing UX evolves. A1 refined fix (read-only visibility status, isolated from EditorView/resolver/projectFor) is shipped at `a829033`.
- Add `share_slug` or `sharing_enabled` to `EditorView` or any `lib/profilux/*` projection. Legacy `profilux` table stays isolated. Share state is read via dedicated endpoint only.
- Touch `/api/members/cv-parse` again unless a new bug surfaces. D2 fix shipped at `6d820f7`.
- Touch `/api/members/profile` again unless a new bug surfaces. D3 Option β shipped at `392c947`.
- Touch `app/api/profilux/reset-link/route.ts` — sharing UX rebuild is a separate post-migration concern, parked under `0e6f3271`.
- Touch `app/[slug]/page.tsx` — public projection masking is server-owned, doctrine-correct, no changes scheduled.
- Implement L1 → L2 silent writes from any code path. S1 + S1.5 ship proof of compliance.
- Deviate from `docs/PROFILUX_MATRIX_V1.md` (v1.2) without updating the spec first (per §12.2).
- Use Hélène BILLARD as fixture (consent unconfirmed, blocked permanently).
- Read `members.*` or `cv_parsed_data` directly from any UI surface for ProfiLux fields — go through `projectFor` / resolver / EditorView.
- Consume `projectFor` client-side in any candidate UI surface. Public-projection masking is server-owned. The View tab at `/dashboard/candidate/profilux` is the candidate's PRIVATE living document surface (real names, real data); it does NOT consume the `public` or `client` projection.
- Reintroduce completion/readiness language on the View tab. View = living document, not score. Edit tab keeps the internal "% complete" footer as a maintenance signal only.
- Reintroduce demo drawers, demo buttons, or "preview" UI in Manage tab. Manage tab is now production read-only; future controls must replace, not coexist with, the current state panel.
- Treat `profilux` standalone table as fully dormant — it is share-state-only (`share_slug` + `sharing_enabled`). Full retirement in ledger `6aef236e`.
- Build any product-facing surface (tunnel, editor, dashboard, admin) without first read-only inspecting the live components per the visual guardrail.
- Drift from the executive-presence guardrail in any copy or microstate.
- Delete or remap tunnel `renderStep()` cases for sections that have an active drawer integration.
- Touch `/api/profilux` POST recompute or the canonical M6 scorer in `lib/profilux/computeProfileCompleteness` / `lib/profilux/_m6Groups`. The doctrine fork on what `profile_completeness` semantically represents is parked observation-only under `f6508e54`.
- Drift back toward "wizard / completion / onboarding" framing for ProfiLux. Locked doctrine: living professional document.
- Mix Operator Bridge / Away Mode work into ProfiLux feature sessions. Workflow-infrastructure trigger phrase: *"Open JOBLUX workflow infrastructure session — Bridge V2"*.
- Propose Bridge V2 / V3 / Away Mode / autonomous validation expansions during the current observation phase. Reopen the workflow-infrastructure track only if drift appears or after the observation window closes (1-3 product sessions).
- Trust `.bridge/state/*.json` over STATE on any conflict. The operational mirror is read-alongside, never authoritative; STATE remains supreme execution truth.
- Compose or propose a bash compiler for STATE. STATE/HANDOFF generation is reasoning-first (Claude Code applies updates with judgment), never deterministic regex/sed mutation.
- Emit full STATE or HANDOFF body in chat at close time. V1.1 chat-side emits close-card YAML only. V0 heredoc fallback exists only if V1.1 transport breaks.
- Extend `AdminMemberDetail` for surfaces beyond `app/admin/members/[id]/page.tsx`. It is the ONE admin-surface adapter. Recruiter share, ATS detail, and any other client surfaces get SIBLING adapter types (e.g. future `BusinessMemberDetail`, `RecruiterShareDetail`), NOT extensions of `AdminMemberDetail`.
- Touch `app/admin/members/[id]/page.tsx` unless `C-B-2` (admin share-preview) ships or `F-2` (business member type reconciliation) opens. F-1a closure at `3edf6ac` is doctrine-locked; further edits drift the boundary.
- Implement any client-projection-consuming surface (`C-B-2` admin share-preview, `C-B-3` public client-facing page) before the client-template visual style is locked by Mo + GPT. No preview code, no scaffolding, no stubs ahead of the visual lock.
- Reintroduce parallel client type systems for admin surfaces. The pattern was killed by F-1a at `3edf6ac` (`types/member-profile.ts` deleted, `AdminMemberDetail` formalized in `lib/profilux/types.ts`). Future client-shaped types live in `lib/profilux/types.ts` only.
- Touch `/api/members/profile` ALLOWED_FIELDS to add `company_name` or `org_type`. F-2-3 Fork 2 doctrine lock (2026-05-10): company identity fields stay non-self-editable.
- Activate dormant `linkedin_url` in any UX or write path. LinkedIn doctrine lock (2026-05-10): no LinkedIn in ProfiLux, no LinkedIn dependency on JOBLUX. Applies to UI, write-path, display, prompt copy.
- Mix Bridge V2 / workflow infrastructure work into product feature sessions. Trigger phrase for infra: *"Open JOBLUX workflow infrastructure session — Bridge V2"*.

### PARKED (admin_tasks status=parked)

- `2847ac29` — Audit + migrate Anthropic model IDs across repo before Sonnet 4 retirement (deadline Jun 15 2026)
- `1e6162ea` — Replace inert RPC `submit_m6_admission` (incompatible with locked Apr-14 11-screen proto)
- `9b806aa3` — F-luxuryrecruiter — repo-wide purge of legacy domain
- `6aad3904` — Security review backlog — 37 remaining findings from ultra-review 2026-04-24
- `8f82b3ac` — Phase 4 premium ProfiLux tunnel + editor rebuild
- `35469863` — Phase 5 admin polish (gated on Phase 4)
- `0e6f3271` — Slice 2B reset-link identity source swap (gates Manage tab A2 — full sharing UX with toggle)
- `1609e494` — Relational L2 collection migration family — Education, Career History, Languages, sectors collection migrations.
- `F-2` — Business member type reconciliation. Resolves the `(member as any).company_name` + `(member as any).org_type` casts preserved at F-1a (`3edf6ac`) in `app/admin/members/[id]/page.tsx`. Needs `business_profiles` (or equivalent) schema audit + new `BusinessMemberDetail` SIBLING adapter type (NOT extension of `AdminMemberDetail`) + page-level split between professional and business render paths. Candidate next slice for technical-debt session.
- `C-B-2` — Admin share-preview (recruiter-facing share preview surface, scoped read-only). Parked pending 5 product/UX decisions: (a) visual style for client template, (b) endpoint α vs β, (c) banner copy, (d) sidebar nav, (e) empty states. No preview code before the client template visual is locked by Mo + GPT.
- `C-B-3` — Public client-facing page (`/p/[slug]` server-emitted public projection consumer). Gated on share-link doctrine slice: token, expiration, revocation, audit log. Not started.
- `F-2-3` — Business dashboard cannot edit company info. `/api/members/profile` PUT `ALLOWED_FIELDS` excludes business columns. Logged 2026-05-10 from F-2 audit. Doctrine call needed before scoping.
- `F-2-4` — Dead schema cleanup: `members.company_email`, `members.company_website`, `members.company_size`. Pure DDL slice. Logged 2026-05-10.

### NEW FINDINGS LOGGED (out of immediate scope, surface separately)

- **F-github-mcp-write-scope-blocked** *(2026-05-09b status: BYPASSED — Code now owns the V1 write path; OAuth scope question moot for V1/V1.1 needs.)* (logged 2026-05-09, observation-only, parked for Bridge/Away Mode V1) — Workaround attempt during `/joblux-close` v0 to bypass `F-close-skill-artifact-friction` via direct GitHub MCP `push_files` failed with 403 "Resource not accessible by integration". GitHub MCP integration in Claude AI is read-only; write APIs (push_files, create_or_update_file, delete_file) blocked at OAuth scope. Means: no direct-to-main commit from Claude AI sandbox without Mo's local Git/SSH. Park scope: future Bridge/Away Mode V1 must either (a) request elevated GitHub MCP write scope, (b) use Claude Code as the artifact bridge (heredoc prompt embeds content, Claude Code writes locally + commits + pushes via SSH), or (c) build a dedicated artifact-handoff endpoint.
- **F-close-skill-artifact-friction** *(2026-05-09b status: PRESUMED_RESOLVED_PENDING_OBSERVATION — Bridge V1.1 first real-use close = the 2026-05-09b close itself; outcome assessed on next session open.)* (logged 2026-05-09, observation-only, parked for Bridge/Away Mode V1) — `/joblux-close` v0 is PARTIALLY validated. Skill successfully produced: close card, STATE draft, HANDOFF draft, Claude Code commit prompt. Skill did NOT solve closing friction because artifacts were created in Claude AI sandbox paths (`/mnt/user-data/outputs/`), not directly in Mo's local repo at `/Users/momo/Documents/GitHub/ClaudeCORE/docs/`. Workaround applied this close: heredoc-embedded full content in a single Claude Code prompt — Mo pastes once, Claude Code writes both files locally, commits, pushes. Bridge/Away Mode V1 priority: artifact handoff bridge OR safe local file transfer pattern OR local execution of close skill inside Claude Code environment. Goal: eliminate manual download/move/share of STATE + HANDOFF files AND eliminate the heredoc-embed pattern (large prompt size).
- **F-coolify-failed-deploy-orphan** *(2026-05-09b status: STILL PARKED — deploy truth still soft (`git_only`); resolution gated on `F-runtime-build-sha-not-exposed`.)* (logged 2026-05-09, observation-only, parked for Bridge/Away Mode V1) — Coolify deploy of `cc0f954` (STATE V3 rotation, docs-only) failed at 12:56–12:57 UTC with no apparent cause. Bypassed by successful deploy of `e43c2fc` (skills) at 13:12 UTC and `a829033` (Manage v0) at 13:40 UTC. No retry needed when later commits supersede content. Park scope: future Bridge/Away Mode deploy reconciliation logic must distinguish between failed-but-superseded vs failed-and-current-HEAD.
- **F-runtime-build-sha-not-exposed** *(NEW 2026-05-09b, queued)* — Runtime container does not expose its built commit SHA. Means `joblux-deploy-state` cannot verify HEAD == deployed; V1 ships honest `git_only` fallback (`verified_deploy_sha=null`, `matches_repo_head=null`, `drift_seconds=null`, canonical notes string). Next infra slice post-observation: add `X-Build-SHA` response header (Next.js middleware reading build-time env var) + `/api/__version` endpoint exposing the same; then `joblux-deploy-state` upgrades from `git_only` to real drift verification by curling joblux.com and parsing the header. Indirectly resolves `F-coolify-failed-deploy-orphan`. Scope: ~10 LOC of middleware + 1 small route + skill upgrade.
- **F-completeness-triple-system** (`f6508e54`) — open, observation-only, no fix scheduled. RESOLVED at the implementation level after D2 + D3: the canonical M6 scorer is now the single source of truth, with two canonical recompute trigger sites. Legacy `calculateProfileCompleteness` deleted. Remaining open question is doctrinal, not technical: what does `profile_completeness` semantically represent? Three forks (matching readiness coverage / holistic richness / multidimensional split). v2 architecture sketched (3-dimensional) but post-launch.
- **F-s15-checkbox-misalignment** *(logged 2026-05-08, parked)* — S1.5 review panel checkbox column slightly offset. Cosmetic only.
- **F-roles-constraint-drift**, **F-registration-role-mismatch** — pre-launch parked.
- **F-editor-l1-fallback-education** — known resolver behavior, no fix.
- **F-ats-detail-subtitle-trailing-at** — cosmetic, parked.
- **F-save-error-body-dropped** — cross-screen UX fix parked, single-commit candidate.
- **F-r-slug-local-types-redeclared** *(NEW 2026-05-09c, observation_only)* — `app/r/[slug]/page.tsx` redeclares `WorkExperience` / `EducationRecord` / `MemberLanguage` as LOCAL interfaces inside the public surface file. Mirror of the parallel-type pattern killed for the admin surface by F-1a at `3edf6ac`. Future cleanup candidate; defer until `C-B-3` (public client-facing page) opens since both touch this surface — let the `client` projection convergence work resolve both at once instead of double-touching the file.
- **F-business-fields-untyped** — CLOSED 2026-05-10 by `b982f53`. `company_name` + `org_type` confirmed on `members.*`; typed on `AdminMemberDetail` via second targeted SELECT.
- **F-admin-detail-omit-pattern** *(NEW 2026-05-09c, doctrine_note)* — `Omit<ProfiLuxResolved, 'languages'> & { … }` pattern introduced at F-1a in `lib/profilux/types.ts`. Resolves TS intersection array-element-type collisions when a route-synthesized array (with stable `id`) needs to override an L1 passthrough array (no `id`). If more adapters land in the same family (`BusinessMemberDetail`, `RecruiterShareDetail`, etc.) and reuse the pattern across more fields, document it as a formal recipe. For now, single-occurrence doctrine note.
- **F-magiclink-delivery**, **F-pdfparse-anthropic-files**, **F-admin_tasks-trigger**, **F-cv_url-format-mixed** — carried.
- **F-public-slug-stub** — CLOSED 2026-05-07 by `369c2e0`.
- **F-empty-string-vs-null**, **F-availability-default-drift**, **F-currency-default-applied** — CLOSED 2026-05-01.
- **F-public-support-email-convention-drift** *(NEW 2026-05-10, observation_only)* — F-2-3 introduced `info@joblux.com` as the employer-facing support contact in /dashboard/business Settings card. Existing public convention is `alex@joblux.com` (only other public surface: /terms/business line 111). New surfaces must consciously pick one. If `info@joblux.com` becomes durable convention for in-product support, harden in STATE §15 design system + retroactively align /terms/business. Otherwise, retroactively align F-2-3 copy to alex@. No fix scheduled; flag at next public-copy decision point.
- **F-runtime-build-sha-not-exposed** carried — both today's deploys (92bc106, c585c57) verified `git_only`, no real drift verification. Remains the highest-leverage infra unblock for Bridge V2.
- **F-members-me-shape-incomplete** *(NEW 2026-05-10c, observation_only)* — toLegacyMember() returns a curated subset of ProfiLuxResolved; phone added at a49fb09 closes only the immediate case. Future caution: any new dashboard field reading `member.<field>` off /api/members/me top level must either be added to toLegacyMember() or read from `.view` instead. Migrate consumers to `.view` in Phase 4 per route comments.
- **F-bridge-v2-remote-control-cosmetic** *(NEW 2026-05-10c, doctrine_lock — ledger 6d11648c)* — Bridge V2 first iteration verdict. Tested end-to-end: Remote Control + GitHub MCP write + cloud sandbox push + PR-driven merge. Outcome: GitHub MCP write blocked (403 confirmed), cloud sandbox direct main push blocked (403), branch push works, PR merge works but Mo still does the merge clic. Net effect on relay-layer problem: ZERO. Mo remains the bridge between Claude AI / Claude Code / GitHub / Coolify. DECISION: Production flow stays Terminal Mac classique; Remote Control abandoned for JOBLUX shipping; do NOT propose again. @claude GitHub App and skill gpt-review NOT pursued (substitution of one bridge for another, not removal). Real unblock target = single-agent orchestration (Agent SDK or future Anthropic primitive) capable of reasoning + executing + committing in one process without Mo between layers; estimated 2-5 days dedicated work; NOT scoped today. Future Bridge V2 iterations must explicitly target relay-layer removal, not workflow cosmetics. Reject any proposal that does not eliminate at least one of: Mo→Code, Mo→GitHub, Mo→Coolify bridges.

**Last updated:** May 10, 2026 (d) — B16 MIME hardening shipped (PR #5, merge 070272b). Bridge V2 first iteration concluded: Remote Control flow tested + rejected for JOBLUX shipping. Production flow stays Terminal Mac classique. HEAD 070272b. Session closed; next infra iteration deferred to Agent SDK / custom orchestration exploration.
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
- ProfiLux editor at `/dashboard/candidate/profilux`: View / Edit / Manage triad. View = candidate's private living professional document. Edit = enrichment/data capture surface (S1.5 prefill panel + 7 per-section drawers + 11-screen tunnel coexisting). Manage = read-only Visibility & sharing panel (v0 shipped at `a829033`); reads `/api/profilux/share`; sharing toggle UX gated on reset-link unparking (`0e6f3271`).

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
  - **View tab** = candidate's PRIVATE living professional document surface (real names, real data, no completion language, empty sections hide entirely).
  - **Edit tab** = enrichment/data capture surface. S1.5 prefill panel + CV upload/parse card + 7 per-section drawers (Identity, Current Position, Luxury Fit, Skills & Markets, Compensation, Clienteling, Availability & Targets) + 11-screen tunnel coexisting.
  - **Manage tab** = read-only Visibility & sharing status panel (v0 shipped at `a829033`). Reads `/api/profilux/share` (legacy `profilux.share_slug` + `sharing_enabled` only). No toggle, no reset, no copy. Future sharing toggle UX gated on `0e6f3271` (reset-link) unparking.
- Storage contract: `members.*` flat columns + `cv_parsed_data` jsonb. Relational L2 collection tables currently DORMANT — parked under `1609e494`.
- Resolver: `lib/profilux/resolveProfiLux` returns `ProfiLuxResolved` (single shape, all surfaces). Emits `cv_identity_suggestions`.
- 6 surface projections via `projectFor`: dashboard / editor / public / admin / ats / client.
- Share state isolation: legacy `profilux` table (`share_slug` + `sharing_enabled` only) stays OUT of `EditorView`, resolver, and `projectFor`. Read via dedicated `GET /api/profilux/share` endpoint only.
- CV pipeline: Haiku 4.5 parser at `/api/members/cv-parse`, schema_v1.0, locked sectors + proficiencies. Canonical recompute fires post-write per Matrix §4.4 (D2 fix at `6d820f7`).
- Identity prefill: explicit-confirmation only (S1.5). L1 → L2 silent writes forbidden across all code paths.
- `members.profile_completeness` computed via `lib/profilux/computeProfileCompleteness` (canonical M6 binary group scorer: G1-G6). Internal-only signal, NOT a user-facing score on View tab. Two canonical recompute trigger sites: `/api/profilux` POST + `/api/members/cv-parse` POST. Legacy `calculateProfileCompleteness` deleted at D3 (`392c947`).
- Doctrine fork on what `profile_completeness` semantically represents PARKED observation-only under `f6508e54`. Current scorer is "matching readiness coverage disguised as a percentage" per GPT framing.

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
- Manage tab: status copy uses "Private — public link off" / "Public link active" / "Link is reserved but not active. Sharing controls coming soon." / "No public link reserved yet." Footer: "Visibility controls and account settings coming soon."

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
- ProfiLux Manage tab A2 — full sharing UX with toggle + slug regen rebuild. Gated on `0e6f3271` (reset-link parked).
- Operator Bridge / Away Mode V1 — workflow infrastructure track. SEPARATE from product slices. Trigger phrase: "Open JOBLUX workflow infrastructure session — Operator Bridge / Away Mode". V1 priorities: (1) artifact handoff bridge / safe local file transfer pattern / local execution of close skill inside Claude Code environment (eliminates manual download-move-commit cycle AND eliminates the heredoc-embed workaround), (2) GitHub MCP write scope request OR Claude-Code-as-artifact-bridge pattern formalized (`F-github-mcp-write-scope-blocked`), (3) deploy reconciliation logic (`F-coolify-failed-deploy-orphan` — distinguish failed-but-superseded vs failed-and-current-HEAD), (4) `/joblux-close` real validation post artifact-bridge (`F-close-skill-artifact-friction`), (5) Agent SDK exploration.

---

## 22. DEPLOYMENT

- SSH push to GitHub → Coolify auto-deploys
- Terminal only, never GitHub Desktop
- One-line copy-paste commands only
- Uniquely named files every time (never `page.tsx` in Downloads)
- Claude Code prompts: single copyable lines in code blocks, no placeholders
- Vercel is not used in JOBLUX prod (TWX only).
- Coolify failed-but-superseded deploys: do NOT redeploy when later commits supersede the failed commit's content. Only act when failed commit is current HEAD.

---

## 23. DIAGNOSTIC RULES

- Curl the live URL first, diagnose from facts, fix the exact problem
- For count/state bugs: DB truth → API endpoint code → frontend filter (bug is almost always in the middle layer)
- When Supabase returns correct data but Next.js shows null: check middleware redirects and container staleness first
- Before writing any file that connects to existing code: `cat` the existing file first
- Confirm which file renders the live URL before touching any code

---

## 24. PROFILUX DOCTRINE — LIVING DOCUMENT MODEL

**Status:** Locked May 6, 2026. Reaffirmed by MATRIX v1.2 (May 7, commit `5d8672b`). Doctrine lock reinforced May 9, 2026 post-D2/D3/View/Manage v0 closure.

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
- **Manage tab** = read-only Visibility & sharing status panel (v0 at `a829033`). Reads `/api/profilux/share`. No toggle, no reset, no copy. Future sharing toggle UX gated on `0e6f3271` reset-link unpark.

**Share state isolation contract (locked May 9, 2026):**
- Legacy `profilux` table (`share_slug` + `sharing_enabled` only) stays OUT of `EditorView`, resolver, and `projectFor`.
- Share state read via dedicated `GET /api/profilux/share` endpoint only.
- No share fields on canonical `members.*` or `cv_parsed_data`.

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
- Doctrine fork on semantic meaning parked observation-only under `f6508e54`. v2 architecture is post-launch.

**Hard launch boundaries (locked May 9, 2026):**
- No proactive AI / copilot layers
- No multidimensional readiness engines
- No autonomous guidance
- No advanced projection systems
- No reopening of architecture debates

**Drift reset phrase:** *"living document, not wizard / not submission / not approval / not completion funnel"*

---

*This document replaces all prior context/handoff files. Update this file at the end of every session. One document, always current.*
