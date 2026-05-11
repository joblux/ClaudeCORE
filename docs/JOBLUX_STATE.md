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

- **bc7e966 + e2f8053 + c0c5a76** `feat(profilux): V12-divergence-3 — Maisons View card at row 5` — May 11 2026 (PM). SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. V12-divergence-3 (ledger 28303edd) resolution: View renders a new Maisons SectionCard at row 5 between Career History (row 4) and Education (row 6) per V12 baseline. Sourced from `members.brands_worked_with` (L2 text[] already on ProfiLuxResolved; resolver unchanged). Read-only in View; no Edit drawer this slice; manual editing deferred pending maison taxonomy / normalization review. Empty behavior: card hides entirely, consistent with View doctrine on hide-when-empty for collections. Doctrine commit `bc7e966` updated V12_LOCK §2.3 row 9 + §6.1 resolution log table row + Edit drawer note, and MATRIX §22.1 (Maisons inserted as row 5; rows 5-9 renumbered to 6-10; total grows from 9 to 10 conceptual rows). Code commit `e2f8053` (3 files, +26/-1, additive only): `EditorView.brands_worked_with: string[]` in Luxury fit block; `projectEditorView` adds `brands_worked_with: view.brands_worked_with`; `ViewCollapseKey` union adds `'maisons'` between `'career_history'` and `'education'`; new CollapsibleSectionCard IIFE between Career History and Education with hide-when-empty early return, reusing `viewChipStyle` + `chipRow` + `isCardCollapsed` + `toggleViewCollapse`. Closure commit `c0c5a76` flipped V12_LOCK §2.3 row 9 from "decision locked / code commit pending" to "shipped e2f8053" and §6.1 resolution log entry from RESOLVED to SHIPPED with doctrine + code SHAs + QA pass + parked observation. Prod QA via Chrome MCP on joblux.com/dashboard/candidate/profilux View tab: filled-state fixture (`['Hermès','Cartier','Richemont']` seeded on `luxuryretailsale@gmail.com`) rendered Maisons card at row 5 with 3 chips verbatim; empty-state (post-revert, `brands_worked_with=NULL`) hid card entirely with Career History flowing directly into Education. Fixture seeded and reverted; original NULL value restored. Total visible View cards: 9 filled, 8 empty (within doctrine bounds; Maisons hide-when-empty is the explicit exception per MATRIX §22.4). Compensation absent from View (V12-violation-1 fix `66f8cf3` holds). Edit tab UNTOUCHED. Substrate / schema / write-path / public/admin/client/ATS projections UNCHANGED. Ledger row `28303edd` closed 2026-05-11 PM. Two new parked findings logged separately as admin_tasks rows: `12745f9d-b8c5-4fbe-a478-2a81378c96e1` (F-view-identity-mask-leak — candidate View identity strip renders last name as initial via `maskedName` const in `app/dashboard/candidate/profilux/page.tsx`; likely V1 public-projection masking pattern leaking into candidate self-view; pre-existing, low priority, future scope) and `9155bd8e-64c3-442d-8bf8-6afd3986137f` (V12-divergence-page-layout-drift — ProfiLux frame does not match V12 spatial baseline; live page is left-aligned + capped at 900px + ~40% dead right canvas; V12 prototype shows centered ~1100-1200px content column with balanced gutters; violates V12_LOCK §3.1 centering + STATE §15 max-width:1200 rule; high priority, V12 reconciliation queue, sequenced BEFORE V12-divergence-4).

- **b2a7824 + b975cb6 + e690ce2** `feat(profilux): V12-divergence-2 — merge Luxury Fit + Skills & Markets into Expertise View card (C.2)` — May 11 2026 (AM). SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. V12-divergence-2 (ledger 99b61c19) resolution C.2: View tab renders one unified Expertise SectionCard merging the two prior cards per V12 baseline (V12 prototype state engine line 5194). Sub-row order preserves JOBLUX luxury relevance: Years in luxury → Sectors → Product categories → Areas of expertise → Skills → Markets. Doctrine commit `e690ce2` updated V12_LOCK §2.3 row 6, MATRIX §22.1 (row 3 Luxury Fit + row 7 Skills & Markets merged into new row 3 Expertise; rows 8-10 renumbered to 7-9), and consolidated Edit drawer note covering both divergence-1 and divergence-2. Code commit `b2a7824` (single file): ViewCollapseKey rename `'luxury_fit'`→`'expertise'`, remove `'skills_markets'`; View row 3 + row 6 IIFEs merged into single Expertise IIFE; filled detection ORs across all 6 buckets. Closure commit `b975cb6` flipped V12_LOCK §2.3 row 6 from "pending" to "shipped b2a7824". Edit tab UNTOUCHED — both `Luxury Fit` and `Skills & Markets` SectionCards + drawers retained; Edit split kept intentional pending taxonomy review (NOT substrate-blocked; distinct from divergence-1's L2 migration gate). Prod QA via Chrome MCP: View 8 cards in V12 order with Expertise as the third card; standalone Luxury Fit + Skills & Markets cards absent from View; Compensation absent from View (V12-violation-1 fix holds); Expertise card expands to show all 6 sub-rows in locked order. Ledger row `99b61c19` closed.

- **1ac1f80 + b2fc4ff + 5ae3bc2** `feat(profilux): V12-divergence-1 — split Education + Languages into separate View cards (A-lite)` — May 11 2026 (AM). SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. V12-divergence-1 (ledger 034bf165) resolution A-lite: View splits into 2 cards per V12 baseline; Edit drawer remains combined temporarily pending L2 languages substrate migration (ledger 1609e494). Doctrine commit `5ae3bc2` updated V12_LOCK §2.3 rows 4+5 + §6.1 resolution log, and MATRIX §22.1 (row 5 split into row 5 Education + row 6 Languages; rows 6-9 renumbered to 7-10; new Edit drawer note added). Code commit `1ac1f80` (single file): ViewCollapseKey rename `'education_languages'`→`'education'` and add `'languages'`; View row 5 IIFE split into two IIFEs (Education shows university/field_of_study/graduation_year + L1 `education[]` history; Languages shows L1 `languages[]` as chips or Missing). Closure commit `b2fc4ff` flipped V12_LOCK §2.3 rows 4+5 wording from "pending" to "shipped 1ac1f80". Edit tab UNTOUCHED — combined `Education & Languages` SectionCard + drawer retained. Prod QA via Chrome MCP: View 9 cards in V12 order with Education and Languages as separate cards; combined card absent; Compensation absent. Ledger row `034bf165` closed.

- **66f8cf3** `fix(profilux-view): remove Compensation from View per V12 lock` — May 10 2026 (PM, 23:33 UTC). SHIPPED + COOLIFY-GREEN. V12-violation-1 (ledger 99d30880) closed: removed Compensation SectionCard from the View IIFE in `app/dashboard/candidate/profilux/page.tsx`. Direct contradiction of V12 §2.5 hardest lock ("Compensation NEVER in View mode") resolved at implementation level. Edit tab Compensation drawer retained. Ledger row `99d30880` closed (pre-session).

- **b9a91ca** `feat(profilux-view): A2.5 rewrite View tab as 9-card passport per MATRIX §22.1` — May 10 2026 (PM). SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. Building Mode step 4 — Reload View tab cutover from the 4-thematic-card legacy structure (Identity strip + About + Experience + Skills & expertise) to the locked §22.1 9-section catalog. Single file, +195/-127 net, additive only inside the View IIFE — Edit tab, Manage tab, backend, schema, resolver all UNCHANGED. Identity strip (§24.6) preserved exactly. Cards rendered in fixed §22.1 order: Identity, Current Position, Luxury Fit, Career History, Education & Languages, Skills & Markets, Clienteling, Availability & Targets, Compensation. All cards read-only, reuse existing `SectionCard`/`NotSet`/`NoneSel`/`viewChipStyle`/`grid`/`label`/`sectionLabel`/`card` primitives, vocabulary lookups via existing `seniorityLabel`/`availabilityLabel`/`departmentLabel`/`contractTypeLabel`/`sectorLabel`/`productCategoryLabel`/`expertiseTagLabel`/`skillLabel` helpers. No new visual language invented. **Prod QA via Chrome MCP**: 9 eyebrows enumerated in correct order (Identity → Compensation), Identity strip rendered above cards, NotSet helper active on empty Seniority field. **Closes gaps G1–G8** from A2.5 scoping (Current Position, Luxury Fit, Education, Clienteling, Availability, Compensation now standalone cards; Skills/Markets split from Sectors/Luxury Fit). **Deferred to follow-ups**: A2.6 state markers (G9 — §24.3), A2.7 completeness signal + sidebar readiness (G10/G11), A2.8 collapse/expand density (G12 — §23.6). Ledger row `bbff688e`. STATE Reload doctrine §22 now matches live View tab implementation 1:1.

- **565be03** `feat(profilux-edit): A2.4 hide 11-screen tunnel + add L1 edu/lang to drawer` — May 10 2026 (PM). SHIPPED + COOLIFY-GREEN + DOM-DUMP-VALIDATED. Building Mode step 3 — tunnel retirement. **Closes G-15**. Tunnel render gated behind `const TUNNEL_VISIBLE = false` near `TOTAL` constant; `renderStep` function, `step` state, draft hooks, `SCREEN_TITLES`, `TOTAL`, navWrap, eyebrow line — all preserved in code for revival (flip flag to true). Pre-gate, added L1 read-only `education[]` + `languages[]` display inside Education & Languages drawer body so parsed CV records remain visible in Edit even after tunnel hide. Both render with italic note: "Parsed from your CV. Editing CV-parsed records is not yet supported." 4 patches: (1) `TUNNEL_VISIBLE` const near `TOTAL`, (2) L1 edu+lang blocks inside E&L drawer after Save block before `</Drawer>`, (3) eyebrow line gated, (4) tunnel render block + navWrap gated. **Doctrine (UX MAP §10.1, §10.4)**: tunnel doctrinally retired but code preserved; L1 sectors[] still surfaces only on tunnel screen 4 (not affected — Luxury Fit drawer covers L2 product_categories + expertise_tags; sectors[] stays L1 passthrough on View tab); screen 11 "Confirm" admission UX retired per §10.4 (matching entry replaces M6). View tab + Manage tab UNCHANGED. Backend, schema UNCHANGED. 1 file, +47/-7. Ledger row `23812c4a`.

- **351421f** `fix(profilux-resolver): A2.3-β.2 return L2 + L1 experiences (no replace, no dedup)` — May 10 2026 (PM). SHIPPED + COOLIFY-GREEN + SCREENSHOT-VALIDATED. **Corrects A2.3-β resolver drift** (commit `c6c7c77`). Previous behavior incorrectly replaced L1 with L2 once any `work_experiences` row existed, hiding parsed CV history. Mo never approved that — locked spec is L2 editable rows + L1 parsed CV rows together, no dedup. Single-line resolver change in `lib/profilux/resolveProfiLux.ts`: `experiences: relationalExperiences ?? mapExperiences(cv?.experiences)` → `experiences: [...(relationalExperiences ?? []), ...mapExperiences(cv?.experiences)]`. L2 rows render with id, get Edit/Delete buttons; L1 rows render without id, get italic "Parsed from your CV. Add as a passport entry to edit." note (both UI paths already wired in `c6c7c77`). Prod screenshot confirmed: View tab Career History card showed test "tets copany" L2 row on top, then 3 L1 rows (Hublot, JOBLUX.COM, Harrods). 1 file, 1 line (+ comment). Test row deleted post-validation; `work_experiences` for Alex back to 0 rows. Ledger row `a69ade5d`. **Doctrine clarification logged**: L2 + L1 simultaneously visible in Edit + View. No dedup. No silent L1→L2 promotion. Locked.

- **d6fb604** `fix(profilux-edit): A2.3-β.1 swap native checkbox for Yes/No chip pattern in Career History drawer` — May 10 2026 (PM). SHIPPED + COOLIFY-GREEN. **Closes F-profilux-checkbox-invisible** (`536dc6ae`). Native HTML checkbox rendered invisibly against `#1a1a1a` background — label visible, checkbox cell empty. Swapped for the existing tri-state Yes/No chip pattern used in Clienteling and Open to relocation drawers. `is_current` is binary boolean — Yes sets true + clears `end_date`, No sets false. Matches dark luxury design system. 1 file, ~14 lines. No backend/schema/state changes. Ledger row `f68d6a36`.

- **c6c7c77** `feat(profilux-edit): A2.3-β Career History drawer at locked §3.1 position 4` — May 10 2026 (PM). SHIPPED + COOLIFY-GREEN + PROD-VALIDATED 7/7. Building Mode step 2 — Career History drawer. **Closes G-4** (Career History drawer was missing). G-15 tunnel retirement now unblocked. Activates `work_experiences` relational L2 for Career History only; other collections (education[], languages[], sectors) stay L1 passthrough. Unparks ledger `1609e494` for Career History scope only. **NEW route** `app/api/profilux/experiences/route.ts` (~225 LOC): GET list ordered start_date DESC NULLS LAST, POST create with required job_title + company + start_date, PUT update by id (ownership via member_id), DELETE by id (ownership via member_id). Service-role-key client, no RLS policy added (table stays locked-down). `is_current=true` forces `end_date=null` on write. **Resolver**: inverted Rule A for experiences only (relational > L1) — corrected by β.2 (`351421f`) to be additive instead of replacement. **Types**: `ResolvedExperience` gets optional `id?: string` + `is_current?: boolean`; `PublicExperience` UNCHANGED (V5 anonymization doctrine intact). **UI**: Career History card at §3.1 position 4 between Luxury Fit and Education & Languages; drawer with list + inline-edit via `experienceFormOpen` state; Add experience CTA opens form; rows with id show Edit + Delete buttons; L1 fallback rows show italic note + no buttons; is_current toggle clears + disables end_date input; hard-block save until job_title + company + start_date filled. **Q-locks**: list+inline-edit (Q1), hard-block save (Q2), is_current clears end_date (Q3), sort start_date DESC NULLS LAST (Q4), no id in PublicExperience (Q5). **Prod QA**: 7/7 PASS (card position, drawer, form, chip toggle via β.1, POST writes to DB id `6033ed53` "tets copany", resolver L2>L1 verified post-β.2, is_current clears end_date confirmed in DB). 4 files, +304/-1. Ledger row `e7abcbab`.

- **ac37f96** `feat(profilux-edit): A2.3-α Education & Languages drawer at locked §3.1 position 5` — May 10 2026 (PM). SHIPPED + COOLIFY-GREEN + PROD-VALIDATED 5/5. Building Mode step 1. **Closes G-4 partial** (Education & Languages drawer missing). Adds new SectionCard + Drawer pair at locked §3.1 position 5, before Skills & Markets, leaving structural gap for Career History at position 4 (shipped at β). Drawer covers L2 flat trio only: `university`, `field_of_study`, `graduation_year`. Mirrors existing 7-drawer pattern verbatim. Reuses existing `Screen6Draft` type, `draftFrom6` helper, `draft6`/`saving6`/`savedAt6`/`saveError6` state hooks, and `handleSave6` handler — all already present from tunnel screen 6 wiring. **Doctrine (UX MAP §§3.1, 10.1)**: tunnel screen 6 stays alive (transitional drawer + tunnel coexistence, retired at A2.4). L1 education[] and languages[] collections remain read-only on tunnel + View tab; not editable in this drawer. No schema change, no backend change, no new write fields. `/api/profilux` POST already accepts `university`, `field_of_study`, `graduation_year`. **Prod QA**: 5/5 PASS (card at position 5, read state, drawer pre-fill, save→DB write graduation_year 2003→2005 confirmed, partial-body contract). 1 file, +50/-0. Ledger row `bad2b055`.

- **c5e50e2** `fix(profilux-public + manage): A2.2-β.2 close cache leak, drop dup logo, drop placeholder footer` — May 10 2026 (PM). SHIPPED + COOLIFY-GREEN. Three coordinated fixes: (1) **CONFIDENTIALITY LEAK FIX** — added `export const dynamic = 'force-dynamic'` to `app/[slug]/page.tsx`. Pre-fix: Next.js prerendered page cached at CF edge after sharing was enabled; disabling sharing flipped DB but cached HTTP 200 still served. Post-fix: every request re-checks DB. Reproduced live during A2.2-β prod QA. (2) Remove duplicate JOBLUX sub-header bar (global site header already renders /joblux-header.png). (3) Remove footer placeholder "Visibility controls and account settings coming soon" from Manage tab — visibility settings are on the locked plan, not vaporware. 2 files, +2/-10. Cache-control: private,no-cache,no-store confirmed live. **F-public-slug-gate-leak** (`ba8ca121`) logged separate — incognito + cache-bust queries still serve rendered profile HTML alongside Page Not Found markup in same response body; root cause unisolated; PARKED until ProfiLux build picture complete.

- **4e3c7a7** `feat(profilux-manage): A2.2-β.1 noindex microcopy under SHARING eyebrow` — May 10 2026 (PM). SHIPPED + COOLIFY-GREEN. One italic line under SHARING eyebrow, above toggle/Reserve CTA: "Private link for direct outreach. Never indexed by search engines." Visible in all three Manage states. /[slug] live response already serves noindex,nofollow; this closes user-facing signal gap. No projectFor change, masking doctrine V1-V9 untouched. 1 file, +3/-0.

- **a95e5e4** `feat(profilux-manage): A2.2-β reserve public link CTA + reset-link upsert fix` — May 10 2026 (PM). SHIPPED + COOLIFY-GREEN. Two coordinated fixes. `app/api/profilux/reset-link/route.ts`: UPDATE → UPSERT on `profilux.email` (UNIQUE constraint verified). Pre-fix: 10/12 members had no profilux row, final UPDATE was silent no-op — endpoint returned 200 with {slug} but wrote nothing. Post-fix: row created on first call with email + share_slug. Slug uniqueness loop, auth, generateSlug helper, members SELECT (canonical post-A2.1) unchanged. `app/dashboard/candidate/profilux/page.tsx`: Manage tab Sharing block — replace no-slug disabled button with active Reserve public link CTA, `handleReserveLink` handler (POST then refetch GET, no optimistic UI), 2 new state hooks. Slug-present branch (Enable/Disable toggle) untouched. No modal, no timestamp, no copy-to-clipboard, no regenerate. 2 files, +44/-10.

- **ce261a5** `feat(profilux-manage): A2.2-α sharing toggle UI on Manage tab` — May 10 2026 (PM). SHIPPED + COOLIFY-GREEN. **Closes "Sharing controls coming soon" promise** from Manage v0 (`a829033`). Smallest viable toggle: enable/disable only, no reserve-link CTA, no regenerate, no copy. New POST handler in `app/api/profilux/share/route.ts`: body `{ sharing_enabled: boolean }`, reads profilux row by session email, refuses 'enable' without `share_slug` (400 + `NO_SLUG_RESERVED`), refuses if no row (400 + `NO_PROFILUX_ROW`), writes ONLY `profilux.sharing_enabled` never `share_slug`, no identity reads. UI: toggle button inserted between Share URL block and footer italic; two modes (slug-present → working button with inverse fill when active; slug-absent → disabled + hint). **Doctrine**: share state isolation respected — POST touches ONLY `profilux.sharing_enabled`; slug lifecycle remains owned by `/api/profilux/reset-link` (A2.1-clean since `17bf47a`); no EditorView/resolver/projectFor mutation; no identity reads on toggle path. 2 files, +163/-0. Ledger row `65ea9755`.

- **17bf47a** `refactor(profilux): A2.1 swap reset-link identity source from legacy profilux to canonical members` — May 10 2026 (PM). SHIPPED + COOLIFY-GREEN. Reset-link route was reading first_name / last_name from legacy `profilux` table — orphan duplicates of canonical identity that lives on `members.*`. Pre-fix: users whose `members.first_name` was set but whose stale `profilux.first_name` was null got false 400 "Please complete your personal info first", or got slug derived from stale names. Fix: 1-line swap of identity SELECT — `.from('profilux')` → `.from('members')`. Slug uniqueness loop (reads `profilux.share_slug`) and UPDATE (writes `profilux.share_slug`) stay on profilux — share_slug is canonical share state per Manage v0 doctrine. **Closes ledger `0e6f3271`** (F-profilux-reset-link-frozen) and unblocks A2 sharing toggle path. Out of scope: profilux orphan column retirement (parked); 400 copy refinement; sharing toggle UI (A2.2 next, shipped same session). Ledger row `11c9c50b`.

- **c449cd1 + Supabase migration `f_2_4_drop_members_dead_company_columns`** `refactor(admin): F-2-4 swap dead members.company_* fields for company_name + org_type in ai-review prompt + DDL drop` — May 10 2026 (e). SHIPPED + COOLIFY-GREEN + DDL-APPLIED. F-2-4 launch-cleanup slice closed end-to-end across 4 gates. **Commit 1 (code) `c449cd1`**: 1 file, +2/-3. The 3 dead `members.company_*` prompt fields (`company_email`, `company_website`, `company_size`, all 0/12 populated per Gate 3 pre-check) were feeding 'N/A' to Haiku ai-review; replaced with `members.company_name` + `members.org_type`. **Commit 2 (DDL) Supabase migration**: `ALTER TABLE members DROP COLUMN company_email; DROP COLUMN company_website; DROP COLUMN company_size;`. No rollback migration. **4 validation gates**: GATE 1 push ✓; GATE 2 Coolify green ✓; GATE 3 DB pre-check 0/12 ✓; GATE 4 DDL apply + `information_schema` verification empty ✓. Out-of-scope finding logged separate: `F-stale-schema-artifacts`.


### CURRENT STEP — strict order

**V12 reconciliation execution — start with V12-divergence-page-layout-drift (spatial baseline).**

Session 2026-05-11 PM shipped 3 commits closing V12-divergence-3 Maisons
(`bc7e966` doctrine + `e2f8053` code + `c0c5a76` closure). Ledger `28303edd`
closed. Maisons now renders as default View card at row 5 between Career
History and Education when populated, hides entirely when empty. Prod QA
via Chrome MCP passed both filled and empty states.

Two parked findings logged during session close:
- `12745f9d-b8c5-4fbe-a478-2a81378c96e1` — F-view-identity-mask-leak (low, frontend, pre-existing, future scope).
- `9155bd8e-64c3-442d-8bf8-6afd3986137f` — V12-divergence-page-layout-drift (high, profilux, V12 reconciliation queue, sequenced FIRST before any other divergence).

Phase 1 V12 reconciliation status: V12-violation-1, V12-divergence-1,
V12-divergence-2, V12-divergence-3 SHIPPED. V12-divergence-page-layout-drift
(NEW) opens the queue. V12-divergence-4..7 remain parked, sequenced after
spatial drift is reconciled.

**Hard entry instruction for next session:**

> Read `docs/JOBLUX_STATE.md` §25 + §15 (layout rule) and `docs/PROFILUX_V12_LOCK.md`
> §3.1 (binding visual qualities) before any ProfiLux work. Start with
> V12-divergence-page-layout-drift — decision-only artifact first
> (same pattern as divergence-1/2/3).

**Sequencing locked:**

1. **V12-divergence-page-layout-drift** (ledger `9155bd8e`, high, parked) —
   Live `/dashboard/candidate/profilux` page container violates V12 spatial
   baseline. V12 shows centered ~1100-1200px column with balanced left/right
   gutters; live prod is left-aligned, capped at `maxWidth:900` on
   SectionCard/grid/tabBar, leaves ~40% dead right canvas on desktop. Violates
   V12_LOCK §3.1 (centering) + STATE §15 (max-width:1200 + margin:0 auto +
   padding:0 28px). NOT redesign — pure reconciliation. Decision-only artifact
   first with 4 ratifiable decisions: (a) target frame width, (b) card width
   inside frame, (c) scope (page only vs broader audit), (d) tabs affected
   (all three share `wrap` const — single-place fix). No layout code without
   decision matrix approval. Sequenced BEFORE divergence-4 because every
   downstream V12 reconciliation slice shipped while spatial drift exists
   ships into a non-V12-shaped frame.

2. **V12-divergence-4** (ledger `3e8d6de2`, normal, parked) — Clienteling
   position. V12 has no Clienteling among the 9 defaults. Prod renders
   Clienteling as View row 8 (post-divergence-3 Maisons inserted at row 5).
   Decision needed: keep as default, move to library opt-in, or drop from
   View. No code without decision. Sequenced AFTER spatial drift.

3. **V12-divergence-5..7 sequencing** (ledgers `d243fc13`, `720da3aa`,
   `eb186be2`) — Add Section library trigger, Manage tab maskable controls,
   CV merge re-upload modal. Sequencing decision only.

**Out of scope until V12 reconciliation complete:**

- Any other ProfiLux surface evolution
- Any new slice that doesn't address a V12 row
- Backlog items unrelated to V12 reconciliation
- ViewCollapseKey `'compensation'` member cleanup (deferred — separate slice)
- F-view-identity-mask-leak repair (parked `12745f9d`, future scope)

**Handoff doc:** `docs/HANDOFF_2026-05-11-PM.md`

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
- Touch `lib/profilux/resolveProfiLux.ts` experiences merge logic. A2.3-β.2 locks the contract: L2 editable rows + L1 parsed CV rows simultaneously visible, no dedup, no silent L1→L2 promotion. Future Education/Languages relational migrations follow the same pattern.
- Reintroduce the 11-screen tunnel as the primary Edit surface. A2.4 retirement is doctrine-locked. `TUNNEL_VISIBLE=false` flag preserves the code for diagnostics only; revival would require an explicit doctrine reversal slice.
- Touch the 9-card View tab structure (A2.5) order or composition without first updating MATRIX §22.1. Section order is fixed at: Identity, Current Position, Luxury Fit, Career History, Education & Languages, Skills & Markets, Clienteling, Availability & Targets, Compensation.

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

### NEW FINDINGS LOGGED (out of immediate scope, surface separately)

- **F-stale-schema-artifacts** *(NEW 2026-05-10e, observation_only)* — Discovered during F-2-4 reference scan. Two repo files describe a dead pre-migration `profiles` table that does NOT reflect the live `members` schema: (a) `supabase-schema.sql` (line 56 references `company_size` on `profiles`, not `members`; entire file describes the legacy WordPress→Next migration era schema with `profiles` + `job_mandates` + `articles` + `applications` + `employer_briefs` + `subscribers`); (b) `types/database.ts` (line 126 types `company_size` on `Profile` interface; entire file types `profiles` / `job_mandates` / `articles` / `subscribers`, none of which match the live `members` / `wikilux_content` / `signals` / etc. schema). Both contradict STATE §6 ("DB is single source of truth everywhere"). Disposition options at next schema-touching slice: (1) DELETE both files (cleanest — they describe nothing real and risk misleading future schema work), (2) replace with stub README pointing to `supabase/migrations/`, (3) leave alone (status quo, accept noise). No fix scheduled; flag at next schema-touching slice. Out of F-2-4 scope per Mo instruction; logged separate.
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

**Last updated:** May 11, 2026 (PM close) — V12 reconciliation phase 1 SHIPPED across 10 commits (`66f8cf3` → `c0c5a76`). V12-violation-1, V12-divergence-1, V12-divergence-2, V12-divergence-3 all closed end-to-end with prod QA via Chrome MCP. Maisons now renders as default View card at row 5 (filled) or hides entirely (empty). Two parked findings logged this close: `12745f9d` (F-view-identity-mask-leak, low) and `9155bd8e` (V12-divergence-page-layout-drift, high — V12 reconciliation queue). Spatial drift sequenced FIRST in next-session queue; V12-divergence-4 Clienteling moved AFTER. Work HEAD before close `c0c5a76`; close commit follows. Next session opens with V12-divergence-page-layout-drift — decision-only first.
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

## 25. V12 BASELINE LOCK

**Status:** V12 baseline locked May 6, 2026 — re-anchored May 10, 2026 PM after drift detection.

**Doctrine doc:** `docs/PROFILUX_V12_LOCK.md`
**Prototype artifact:** `docs/prototypes/profilux_journey_v12.html`
**Lock anchored by commits:** `be6ecaf` (`PROFILUX_V12_LOCK.md`) and `ed9e206` (`docs/prototypes/profilux_journey_v12.html`)

V12 is the strategic working-loop baseline for the entire ProfiLux candidate surface. It locks three modes (View / Edit / Manage), six scenes, 9 default sections in fixed order, 8 opt-in library sections, and behavioral rules per `PROFILUX_V12_LOCK.md` §2. Visual posture is binding per §3; implementation polish is open per §4.

**Authority:** V12_LOCK is subordinate to this STATE document per `PROFILUX_V12_LOCK.md` §7. On conflict, STATE wins until reconciled. STATE must reconcile to V12 when drift is detected — V12 is the locked structural baseline.

### DO NOT (V12 enforcement)

- **DO NOT** touch `app/dashboard/candidate/profilux/page.tsx` View / Edit / Manage tabs without a V12 cross-check per `PROFILUX_V12_LOCK.md` §8.
- **DO NOT** treat V12 as stale tunnel doctrine — that interpretation was **invalidated 2026-05-10 PM**. V12 is the locked baseline. The April-locked `profilux-journey.html` 11-screen tunnel is what is doctrinally retired (per `PROFILUX_MATRIX_V1.md` §7.6.2), not V12.
- **DO NOT** free-evolve passport surface composition without reconciliation per `PROFILUX_V12_LOCK.md` §6.1. The 4 currently-flagged section divergences (Education/Languages split, Expertise unification, Maisons section, Clienteling position) require Mo + GPT decisions before further surface work.
- **DO NOT** ship structural drift from V12 §2 hard locks without an explicit Mo + GPT reconciliation decision recorded in `PROFILUX_V12_LOCK.md`.

---

*This document replaces all prior context/handoff files. Update this file at the end of every session. One document, always current.*
