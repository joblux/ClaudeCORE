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

- **e0de6ae** `feat(profilux): forward projection.editor in /api/profilux response (Phase 4.A)` — Single-line additive change in `buildEditorResponse` helper. GET and POST now return `{ surface, view, editor, profile }`. Enables UI to consume the §7.6 `EditorView` shape directly without calling `projectFor` client-side. Backward-compatible (`view` and `profile` unchanged). +1 / -0. TSC clean.

- **27e90cf** `feat(profilux): minimal EditorView probe shell (Phase 4.A)` — Replaces 977-line legacy 7-step editor with 69-line probe consuming `data.editor` only. Renders 9 fields raw + collapsible Raw JSON dump. Validates `/api/profilux → projectFor('editor') → projection.editor → UI` pipeline end-to-end. Browser-validated on Testuser Mzaour: all critical fields rendered, arrays passthrough OK, `availability='open'` normalized, `profile_completeness=49` (number, not null), `cv_meta.needs_review=4` (count, not array). +46 / -954.

- **60ed661** `feat(profilux): 11-screen EditorView shell (Phase 4.A)` — Mono-file 170-line read-only shell. Switch-based render across 11 screens per Matrix v1 §7.6: Identity / Headline / Current Position / Luxury Fit / Career History / Education & Languages / Skills & Markets / Clienteling / Availability & Targets / Salary / Confirm. Prev/Next nav, disabled boundary states, completeness indicator persistent. No writes, no inputs, no validation, no abstractions. Surfaces full editor data structure for screen-by-screen UX iteration. +143 / -42.

- **5b3152c** `feat(profilux): user-facing labels + empty-state polish (Phase 4.A)` — Replaces raw field names with American English labels per JOBLUX copy doctrine. GPT-locked: "Current employer", "Target compensation (max)", "Years of experience", "Areas of expertise", "Markets", "Skills". Empty-states neutralized on screens 3/4/8 ("Not specified" / "None selected"). Actionable hints retained on screen 7 ("Add markets/skills to improve matching"). Section labels uppercased (EDUCATION, LANGUAGES). Completeness rendered as `49%`. Booleans (false) → "Not specified" (false ≠ absence; explicit "No" deferred to write UX). Browser-validated all 11 screens. +53 / -51. TSC clean.

- **993d6de** `feat(profilux): accept 4 Screen 3 write fields in /api/profilux POST (Phase 4.A)` — Adds `job_title`, `current_employer`, `seniority`, `total_years_experience` to POST handler in `app/api/profilux/route.ts`. Snake_case direct (Variant α — aligned with `EditorView` §7.6, no new camelCase legacy debt). Strings via `coerceEmpty` (W1). Number guarded inline (`>= 0`; zero is valid for entry-level). Partial-body W2 + recompute W3 inherited from existing pattern. Inserted just before `if (has('availability'))`. Existing 6 legacy camelCase keys (`firstName`, `lastName`, `city`, `nationality`, `headline`, `bio`, `salaryExpectation`, `salaryCurrency`) untouched — Phase 4.B/4.C will harmonize. +9 / -0. TSC clean.

- **ce1f3c9** `feat(profilux): write-enabled Screen 3 (Phase 4.A)` — First write-enabled screen. Inputs for `job_title` (text), `current_employer` (text), `seniority` (select using `PROFILUX_SENIORITY_OPTIONS`), `total_years_experience` (number, min 0). POST `/api/profilux` with snake_case body, partial-body W2. Local `draft` state separate from `editor`. Refetch on save success, stay on Screen 3, inline "Saved" indicator (green `#1D9E75`, 2s timeout), error span on fail. Screens 1-2 and 4-11 unchanged. 248 lines, +89 / -13. TSC clean. **Browser + DB validated end-to-end on Testuser Mzaour:** save POST 200, DB persisted `seniority='senior_manager'` + `total_years_experience=12`, `profile_completeness` recomputed `49% → 66%` (W3 confirmed), `job_title` + `current_employer` unchanged (W2 partial-body confirmed), no other screens affected. First production consumption of `lib/profilux/vocabulary.ts` (shipped eb1093a).

- **f14f83e** `feat(profilux): vocabulary patch product_categories + expertise_tags (Phase 4.A.4a)` — Adds `PROFILUX_PRODUCT_CATEGORY_OPTIONS` (16) and `PROFILUX_EXPERTISE_TAG_OPTIONS` (12) to `lib/profilux/vocabulary.ts`, with derived type aliases `ProfiLuxProductCategory` + `ProfiLuxExpertiseTag` and registry entries in `PROFILUX_VOCABULARY`. Product categories: ready_to_wear, leather_goods, handbags, footwear, accessories, fine_jewelry, high_jewelry, watches, fragrance, skincare, makeup, eyewear, home_lifestyle, wines_spirits, hospitality_experiences, art_collectibles. Expertise tags: vic_program_management, brand_storytelling, event_activation, omnichannel, high_value_sales, team_leadership, store_opening, market_development, luxury_hospitality, bespoke_made_to_measure, craftsmanship_storytelling, archive_heritage. GPT-locked overlap audit removed 10 duplicates against existing specializations/departments. Pure additive (+56 / -12, padding-only on existing aliases). No consumers in this commit. TSC clean.

- **9336d3d** `feat(profilux): accept Screen 4 write fields in /api/profilux POST (Phase 4.A.4b-1)` — Adds 3 new write handlers in POST handler of `app/api/profilux/route.ts`: `years_in_luxury` (number guard, ≥ 0 else null), `product_categories` (Array.isArray else null), `expertise_tags` (Array.isArray else null). Inserted after `total_years_experience` block, before `availability` block. Inherits W2 partial-body via `has(k)` and W3 recompute from existing pattern. No vocabulary validation in route per Matrix v1 §4.5 + §7.6 (values enforced in code, not DB). +16 / -0. TSC clean.

- **5d6a1dd** `feat(profilux): write-enable Screen 4 luxury fit (Phase 4.A.4b-2)` — Replaces read-only Screen 4 JSX with write UI in `app/dashboard/candidate/profilux/page.tsx`. Adds `Screen4Draft` type, `draftFrom4(e)` helper, parallel state quartet (draft4 / saving4 / savedAt4 / saveError4), `handleSave4()` mirroring Screen 3's POST → refetch → savedAt → 2.1s timeout. Refetch fans out to both drafts. UI: read-only Sectors row (L1, per spec line 384), number input for `years_in_luxury`, two inline chip-toggle rows (no abstraction) consuming `PROFILUX_PRODUCT_CATEGORY_OPTIONS` (16) + `PROFILUX_EXPERTISE_TAG_OPTIONS` (12). Chip styling: gold border `#a58e28` + gold-tinted bg `rgba(165,142,40,0.15)` on active, `#444` border + `#ccc` text on inactive. Inline toggle handlers per group (no shared `toggleIn` helper). +91 / -7. TSC clean. **Browser + DB validated end-to-end on test candidate fixture:** save POST 200, DB persisted `years_in_luxury=8`, `product_categories=['leather_goods','handbags','watches']`, `expertise_tags=['vic_program_management','high_value_sales','luxury_hospitality']`, `profile_completeness` recomputed `66% → 83%` (W3 confirmed, +17pts), `job_title`/`current_employer`/`seniority`/`total_years_experience`/`availability`/`desired_salary_currency` all unchanged (W2 partial-body confirmed, no drift). Second production consumption of `lib/profilux/vocabulary.ts` (first was Screen 3 seniority).

- **40d19fc** `feat(profilux): accept Screen 8 clienteling write fields in /api/profilux POST (Phase 4.A.5a)` — Adds 2 new write handlers in POST handler of `app/api/profilux/route.ts`: `clienteling_experience` (strict `typeof === 'boolean'` guard, else null), `clienteling_description` (W1 via `coerceEmpty` helper). Inserted after `expertise_tags` block, before `availability` block. Inherits W2 partial-body via `has(k)` and W3 recompute from existing pattern. +9 / -0. TSC clean. **Route-level validated end-to-end on test candidate fixture before UI:** all 3 boolean states (true/false/null) round-trip correctly, W1 description coerceEmpty (`''→null`) confirmed, W2 partial-body confirmed (POST omitting clienteling_* preserves prior values, only the included `headline` field changed), no cross-field drift on Screen 3 or Screen 4 fields across all 4 probes.

- **5668d61** `feat(profilux): write-enable Screen 8 clienteling (Phase 4.A.5b)` — Replaces read-only Screen 8 JSX with write UI in `app/dashboard/candidate/profilux/page.tsx`. Adds `Screen8Draft` type, `draftFrom8(e)` helper, parallel state quartet (draft8 / saving8 / savedAt8 / saveError8), `handleSave8()` mirroring Screen 4 pattern. Refetch fans out to all three drafts (3, 4, 8). UI: tri-state Yes/No chip pair (no textarea when false or null), conditional textarea bound to `=== true` only, 3 rows. Yes-chip click logic: toggle-off clears description in UI (locked rule). No-chip click logic: always clears description (transition out of true wipes prior text). POST shape per locked rule: `clienteling_description: exp === true && descRaw !== '' ? descRaw : null`. No new style constants — reuses `chip` / `chipActive` / `input` / `saveBtn` / `saveBtnDis` / `sectionLabel` from Screen 4. +87 / -3. TSC clean. **Browser + DB validated end-to-end on test candidate fixture across 7 scenarios:** (1) Yes click activates chip + reveals textarea, (2) save with description persists `exp=true, desc='...'`, (3) Yes-toggle-off clears UI + DB to null/null, (4) No-from-null sets `exp=false, desc=null`, (5) Yes→type→No transition clears description in UI state before any POST (locked clear-on-transition rule honored), (6) re-entering Yes shows blank textarea (description was wiped to ''), (7) final cleanup restores null/null baseline. Cross-screen drift check on final DB read: all Screen 2/3/4 fields untouched (headline, job_title, current_employer, seniority, total_years_experience, years_in_luxury, product_categories, expertise_tags all preserved). `profile_completeness: 83` unchanged across all 7 saves (clienteling not weighted in M6 admission per §7.6, expected). First production use of tri-state chip pattern; reusable for Screen 9's `open_to_relocation`.

- **949865d** `feat(profilux): accept Screen 6 education write fields in /api/profilux POST (Phase 4.A.6a)` — Adds 3 new write handlers in POST handler of `app/api/profilux/route.ts`: `university` (W1 via `coerceEmpty`), `field_of_study` (W1 via `coerceEmpty`), `graduation_year` (number guard `typeof === 'number' && >= 0` else null). Inserted after `clienteling_description` block, before `availability` block. Inherits W2 partial-body via `has(k)` and W3 recompute from existing pattern. +8 / -0. TSC clean. **Route-level validated end-to-end on test candidate fixture before UI:** strings round-trip correctly (T1), W1 empty-string coercion confirmed for both string fields (T2), `graduation_year=0` accepted as valid boundary (T3), negative number rejected → null (T4), string `'2010'` rejected → null (strict typeof, T5), W2 partial-body confirmed via headline-only POST preserving Education values + no Screen 2/3/4/8 drift (T6).

- **75c1269** `feat(profilux): write-enable Screen 6 education (Phase 4.A.6b)` — Replaces 3 read-only L2 grid rows (University / Field of study / Graduation year) with text + number inputs in `app/dashboard/candidate/profilux/page.tsx`. Adds `Screen6Draft` type, `draftFrom6(e)` helper, parallel state quartet (draft6 / saving6 / savedAt6 / saveError6), `handleSave6()` mirroring Screen 3 pattern. Refetch fans out to all four drafts (3, 4, 8, 6). UI: 3 inputs in existing `grid` style + Save block inserted before existing EDUCATION sectionLabel. L1 `education[]` cards and `languages[]` section left UNTOUCHED (read-only per spec line 384). No new style constants — reuses `input` / `saveBtn` / `saveBtnDis` / `grid` / `label` / `sectionLabel`. +59 / -3. TSC clean. **Browser + DB validated end-to-end on test candidate fixture across 3 scenarios:** (1) navigate to Screen 6 — all 3 inputs prefilled from resolver L1 fallback (DB L2 columns NULL but `editor.*` returned values from `cv_parsed_data.education[0]`), (2) edit `graduation_year` from 2001→2002 + save — DB L2 now populated with `university` + `field_of_study` (L1→L2 promotion via first save) plus user-edited `graduation_year=2002`, (3) clear all 3 inputs + save — DB L2 returns to NULL, UI re-renders with L1 fallback values again. Cross-screen drift check on final DB read: all Screen 2/3/4/8 fields untouched (`headline`, `job_title`, `current_employer`, `seniority`, `total_years_experience`, `years_in_luxury`, `product_categories`, `expertise_tags`, `clienteling_experience`, `clienteling_description` all preserved). `profile_completeness: 83` unchanged (education not weighted in M6 admission, expected). Fourth write-enabled screen.

- **a273093** `feat(profilux): vocabulary patch currency (Phase 4.A.10a)` — Adds `PROFILUX_CURRENCY_OPTIONS` (9 ISO 4217 codes: EUR, USD, GBP, CHF, AED, HKD, SGD, JPY, CNY) to `lib/profilux/vocabulary.ts`. Greenfield. Flat string tuple (Option A locked) — codes are self-display, no `{value, label}` shape. Type alias `ProfiLuxCurrency = (typeof PROFILUX_CURRENCY_OPTIONS)[number]`. Registry entry `currency: PROFILUX_CURRENCY_OPTIONS` added to `PROFILUX_VOCABULARY`. No consumers in this commit. +17 / -0. TSC clean.

- **2d8f07f** `feat(profilux): accept Screen 10 salary write fields in /api/profilux POST (Phase 4.A.10b)` — Adds 3 snake_case write handlers in POST handler of `app/api/profilux/route.ts` (Variant α, GPT-locked): `desired_salary_min` (number guard `typeof === 'number' && >= 0` else null), `desired_salary_max` (same guard), `desired_salary_currency` (W1 via `coerceEmpty`). Inserted after `graduation_year` block, before `availability` block. Plus §4.5 server-side range guard: rejects with HTTP 400 when both `desired_salary_min` and `desired_salary_max` are present and `min > max`. Allows min-only, max-only, both-null. No silent swap. Pre-write member SELECT extended from `'id'` to `'id, desired_salary_min, desired_salary_max'` (no new fetch) so the guard can compare against existing DB values when client sends only one side. Legacy `salaryExpectation` + `salaryCurrency` blocks untouched (Phase 4.B/4.C harmonization). Inherits W2 partial-body via `has(k)` and W3 recompute from existing pattern. +38 / -2. TSC clean. **Route-level validated end-to-end on Testuser Mzaour across 6 scenarios:** T1 happy path (3 fields persist), T2 W2 partial-body (max + currency preserved when only min sent), T3 range guard 400 + DB unchanged + exact error string `desired_salary_min cannot exceed desired_salary_max`, T4 W1 empty-string coercion (currency '' → NULL), T5 negative number guard (min=-100 → NULL), T6 explicit nulls + currency change to USD. Drift check on 18 non-salary fields: zero drift. Baseline restored.

- **fbcf6c6** `feat(profilux): write-enable Screen 10 salary (Phase 4.A.10c)` — Replaces read-only Screen 10 JSX with write UI in `app/dashboard/candidate/profilux/page.tsx`. Adds `Screen10Draft` type, `draftFrom10(e)` helper, parallel state quartet (draft10 / saving10 / savedAt10 / saveError10), `handleSave10()` mirroring Screen 6 pattern exactly (including `throw new Error(\`HTTP ${res.status}\`)` shape — see F-save-error-body-dropped finding). Refetch fan-out via shared `refetch()` helper now updates all 5 drafts (3, 4, 6, 8, 10). UI: 2 number inputs (min ≥ 0, blank → null) + 1 select consuming `PROFILUX_CURRENCY_OPTIONS` with leading "— Not specified —" blank option (sends null on selection). No new style constants — reuses `grid` / `label` / `input` / `saveBtn` / `saveBtnDis`. Vocabulary import line extended in-place. Screen 10 title now "Compensation". +67 / -5. TSC clean. **Browser + DB validated end-to-end on Testuser Mzaour across 4 UI scenarios:** U1 save with new range (80000/130000/EUR) persists to DB + Saved indicator visible, U2 range error UX (200000/100000) surfaces `Error: HTTP 400` red span + DB unchanged, U3 currency clear via "Not specified" → DB NULL (no EUR mint), U4 cross-screen drift check on 18 non-salary fields = zero drift. Vocabulary now consumed by 3 screens: `PROFILUX_SENIORITY_OPTIONS` (Screen 3), `PROFILUX_PRODUCT_CATEGORY_OPTIONS` + `PROFILUX_EXPERTISE_TAG_OPTIONS` (Screen 4), `PROFILUX_CURRENCY_OPTIONS` (Screen 10). Fifth write-enabled screen.

- **4ce698e** + **68501b5** + **3bb80be** `Phase 4.A.9 — write-enable Screen 9 (Availability + targets)` — three-commit phase. **4ce698e** vocabulary patch: PROFILUX_LOCATION_OPTIONS (15 luxury hubs in alphabetical-by-region order: Paris, London, Milan, Geneva, Zurich, New York, Los Angeles, Miami, Dubai, Riyadh, Hong Kong, Singapore, Tokyo, Shanghai, Seoul). Greenfield, flat readonly tuple shape (mirrors a273093 currency precedent). Type alias `ProfiLuxLocation` derived. Registry entry `location` added. **68501b5** route POST handlers: 5 new write handlers for `desired_locations` (Array.isArray else null), `desired_departments` (Array.isArray else null), `desired_contract_types` (Array.isArray else null), `open_to_relocation` (typeof === 'boolean' else null — DB column nullable, default false, verified via Supabase MCP information_schema before patch), `relocation_preferences` (W1 via coerceEmpty). Inserted after availability block. Inherits W2 partial-body via has(k) and W3 recompute. Route-level validated end-to-end on Testuser Mzaour across 6 MCP probes (T1 happy-path, T2 W2 partial-body, T3 W1 empty-string coercion, T4 type guards, T5 explicit nulls, T6 cross-screen drift). Zero drift on 18 non-Screen-9 fields. **3bb80be** UI write-enabled: Screen9Draft type, draftFrom9 helper, parallel state quartet, handleSave9 mirroring Screen 4 + Screen 8. Refetch fan-out to all 6 drafts (3, 4, 6, 8, 9, 10). UI: 6 fields — availability select (5 EditorAvailability values + Not specified), 3 chip multi-toggle rows consuming PROFILUX_LOCATION_OPTIONS (15) + PROFILUX_DEPARTMENT_OPTIONS (20) + PROFILUX_CONTRACT_TYPE_OPTIONS (6), tri-state Yes/No chip pair for open_to_relocation (mirrors Screen 8 clienteling_experience), conditional textarea for relocation_preferences (visible only when open_to_relocation === true, cleared on Yes-toggle-off and No transitions per locked clear-on-transition rule). POST shape per locked rule: `relocation_preferences = exp === true && prefRaw !== '' ? prefRaw : null`. +154 / -8. TSC clean. Build clean. Browser+DB validated end-to-end on Testuser Mzaour across 7 UI scenarios (U1 baseline render, U2 happy-path save, U3 Yes-toggle textarea reveal, U4 textarea typing+save, U5 Yes-toggle-off clear-on-transition, U6 No transition wipe, U7 Yes-from-No blank textarea). Sixth write-enabled screen.

- **8847e50** + **0550b9a** + **351b117** `Phase 4.A.7 — write-enable Screen 7 (Skills + Markets)` — three-commit phase. **8847e50** vocabulary patch: PROFILUX_SKILL_OPTIONS (20 operational execution skills, {value, label} shape — mirrors specialization/department/expertise) + PROFILUX_MARKET_OPTIONS (12 regional macro knowledge zones, flat readonly tuple — mirrors location/currency). Concept locked: Screen 4 expertise = strategic luxury positioning, Screen 7 skills = operational execution (Option B). Markets = regional macro fluency, distinct from PROFILUX_LOCATION_OPTIONS (city-level job preferences). Manual overlap audit run against expertise tags, locations, specializations, and departments — no semantic conflicts. Type aliases ProfiLuxSkill + ProfiLuxMarket derived. Registry entries 'skills' + 'markets' added. **0550b9a** route POST handlers: 2 new write handlers for `key_skills` (Array.isArray else null) and `market_knowledge` (Array.isArray else null). Inserted after relocation_preferences block. Inherits W2 partial-body and W3 recompute. Route-level validated end-to-end on Testuser Mzaour across 5 MCP probes (T1 happy-path, T2 W2 partial-body, T3 type guards, T4 explicit nulls, T5 cross-screen drift). Zero drift on 23 non-Screen-7 fields. **351b117** UI write-enabled: Screen7Draft type, draftFrom7 helper, parallel state quartet, handleSave7 mirroring Screen 4. Refetch fan-out to all 7 drafts (3, 4, 6, 7, 8, 9, 10). UI: 2 chip multi-toggle rows consuming PROFILUX_SKILL_OPTIONS (20, {value, label}) + PROFILUX_MARKET_OPTIONS (12, flat strings). +85 / -3. TSC clean. Build clean. Browser+DB validated end-to-end on Testuser Mzaour across 4 UI scenarios (U1 baseline render of 20+12 chips, U2 multi-select save persistence, U3 partial toggle preserves markets, U4 baseline reset via /api/profilux not direct MCP write). Seventh write-enabled screen.

- **Phase 4.A milestone CLOSED** — All planned write-enabled screens shipped: 3 (Current Position), 4 (Luxury Fit), 6 (Education), 7 (Skills+Markets), 8 (Clienteling), 9 (Availability+Targets), 10 (Compensation). Screen 5 (Career History) remains read-only L1 by spec. Screen 11 (Confirm) remains separate `m6_confirmed_at` route. Vocabulary now consumed by 7 screens with 11 vocabularies registered.

### CURRENT STEP — strict order, no skip, no resequence from broader ledger

Phase 4.A completed 2026-05-05. All seven planned write-enabled screens shipped and validated end-to-end (Screens 3, 4, 6, 7, 8, 9, 10). Vocabulary contract consumed by 7 screens. POST contract validated against §4.5 W1/W2/W3 across all write surfaces.

- **22056df** `docs(state): correct Phase 4.B consumer count (audit-verified May 5 2026)` — Phase 4.B read-only audit closed in STATE (ledger `8f82b3ac` DB row not modified this session). Enumerated all consumers of `data.profile`: 1 real consumer (`app/dashboard/candidate/page.tsx:108`), 8 field reads at lines 201-208, 5 already dual-coded with modern keys. `/api/members/me` does NOT depend on `toLegacyProfile` (its `toLegacyMember` adapter pulls from `ProfiLuxResolved` directly). Business dashboard and ProfileClient do not read `data.profile`. STATE drift corrected: prior claim "3 consumers / 4 fetch sites" replaced with verified "1 consumer". Audit also surfaced 8 dead `/api/members/me` legacy fields (closed by Phase 4.E).

- **ad7d5aa** `feat(profilux): Phase 4.C migrate candidate dashboard to data.editor` — Single-file change (`app/dashboard/candidate/page.tsx`). Setter at line 108 migrated from `setProfilux(pData.profile || pData)` to `setProfilux(pData.editor ?? null)` (`?? null` absorbs route null-paths that omit `editor` key). 4 of 8 field reads (lines 201-208) simplified: `firstName||first_name → first_name`, `lastName||last_name → last_name`, `experience||work_experiences → experiences` (rename), `specialisations → expertise_tags` (rename). 4 reads unchanged (`headline||job_title` both first-class on EditorView; `bio`, `city`, `languages` stable names). 5 lines edited. TSC + build clean. Browser-validated on Testuser Mzaour (88% completeness rendered). Hydration errors React #425/#418/#423 found pre-existing across all dashboards (not caused by 4.C, parked).

- **5a6784c** `feat(profilux): Phase 4.D remove toLegacyProfile adapter from /api/profilux` — Single-file change (`app/api/profilux/route.ts`). Removed `toLegacyProfile` (24 lines) + dead helpers `mapLegacyExperiences` (15 lines) and `normalizeAvailability` (25 lines) + legacy adapter header docblock + `denormalizeAvailability` cross-ref comment. `profile:` key dropped from `buildEditorResponse`. Both null-path branches (`!member`, `!resolved`) updated from `{surface, view: null, profile: null}` to `{surface, view: null, editor: null}` for symmetry. `denormalizeAvailability` retained (sole active caller in POST handler, line 306 → 228 post-shift). Net -78 lines (412 → 334). API contract now `{surface, view, editor}`. TSC + build clean. Browser-validated: `/api/profilux` returns 3 keys, `editor` populated with 20 expected fields, `profile` absent.

- **a155e46** `feat(profilux): Phase 4.E slim toLegacyMember to 8 live fields` — Single-file change (`app/api/members/me/route.ts`). `toLegacyMember` adapter slimmed from 16 fields to 8 live fields per Phase 4.B audit. Removed: `job_title`, `avatar_url`, `approved_at`, `role`, `profile_completeness`, `m6_confirmed_at`, `cv_url`, `cv_parsed_at` (all confirmed dead via app-wide grep audit). Cascade cleanups: `approved_at` removed from `MemberMeta` type, meta SELECT (`'company_name, org_type, approved_at'` → `'company_name, org_type'`), and meta object construction. Docblock "16 legacy fields" → "8 fields" (2 occurrences). Live fields retained: `first_name`, `last_name`, `email`, `company_name`, `org_type`, `country`, `city`, `status`. Net -11 lines (158 → 147). TSC + build clean. Browser+API validated end-to-end on both consumer dashboards (Testuser candidate + Mohammed/Hublot business): API returns exactly 10 top-level keys (8 live + `surface` + `view`), zero dead fields present, zero console errors.

- **Phase 4 chain milestone CLOSED in STATE** — Phase 4 entirely shipped May 5 2026. ProfiLux contract harmonized: `/api/profilux` emits `{surface, view, editor}` (no legacy `profile`); `/api/members/me` emits 8 live fields + `surface` + `view`. `toLegacyProfile` adapter removed entirely. `toLegacyMember` slimmed to live consumers. EditorView §7.6 is the canonical UI shape. Phase 4 chain (4.B audit → 4.C consumer migration → 4.D adapter removal → 4.E members/me slim) closed in single session. Ledger DB rows for `8f82b3ac` (Phase 4.B/C/D/E) not synced this session — defer to next session ledger reconciliation.

### CURRENT STEP — strict order, no skip, no resequence from broader ledger

**ProfiLux Reload recovery — start from the live /dashboard/candidate Continue button.**

Phase 5 admin polish is NOT next. It remains parked (ledger 35469863). Phase 4 ProfiLux tunnel + editor rebuild (8f82b3ac) is preserved as substrate but its wizard/tunnel framing is replaced by the canonical model below.

**Locked doctrine (May 6, 2026):**
- ProfiLux is a single living professional profile object, owned continuously by the user.
- Not a wizard. Not submit / pending / review. Not frozen. Not Mo-approved.
- Mo approval applies to platform access at registration, and to contributions (brand corrections, salaries, insider voices) — never to the ProfiLux itself.
- Flow: approved user dashboard → Continue ProfiLux (existing CTA on /dashboard/candidate) → fresh CV upload → Haiku parse → populated living ProfiLux document → user edits / owns it continuously.
- All projections read the same object: self dashboard, ATS view, recruiter view, public share /p/[name], PDF exports, matching layer.

**Canonical doctrine doc:** docs/PROFILUX_MODEL.md (committed ecb60a5, May 6 2026).
**Umbrella ledger row:** 88d4bd79-f0d4-4e9c-9125-e00df2699ca6 (Recruiting System / high / open).
**Directional prototype (NOT an implementation source):** ~/Desktop/joblux-prototypes/profilux_flow_v3.html.

**Next session opens with planning, not code:**
1. Decide retirement of inert RPC submit_m6_admission (ledger 1e6162ea) under this model.
2. Reconcile M6 admission enforcement (ledger 29f95a84) — what survives the no-pending shift, what gets dropped.
3. Audit the gap between prod (/api/upload-cv, /api/profilux, /dashboard/candidate/profilux) and the Reload model — produce a written delta before any code.
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

- **F-editor-l1-fallback-education** — `resolveProfiLux` populates `editor.university` / `editor.field_of_study` / `editor.graduation_year` from `cv_parsed_data.education[0]` when the corresponding L2 columns are NULL. Observed during Phase 4.A.6b validation: Screen 6 inputs render prefilled with CV-parsed values even when DB L2 is NULL. UX consequence: first save promotes L1-derived values into L2 (even without explicit user edit if save is triggered), and clearing L2 fields back to NULL returns the UI to the L1 fallback prefill on next read. Documented as known resolver behavior, not a blocker. No fix scheduled — consistent with v1 design (CV = canonical seed). Logged this session as a documentation-only caveat.

*Carried forward from prior rotations:*

- **F-luxuryrecruiter** — see parked `9b806aa3`
- **F-save-error-body-dropped** *(logged this session, 2026-05-04)* — `handleSave3`, `handleSave4`, `handleSave6`, `handleSave8`, `handleSave10` all use `throw new Error(\`HTTP ${res.status}\`)` and drop the API error body. Users see e.g. `Error: HTTP 400` instead of descriptive route messages (e.g. `desired_salary_min cannot exceed desired_salary_max` from Screen 10 range guard). Cross-screen UX fix parked; out of Phase 4.A.10c scope. Logged this session as a documentation-only finding. Best handled in a single dedicated commit that updates all five handleSaveN functions to extract `errBody?.error` from the failed response body before rethrowing.
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
- Phase 4.A.10a SHIPPED 2026-05-04 (commit `a273093`). Currency vocabulary canonical: `PROFILUX_CURRENCY_OPTIONS`.
- Phase 4.A.10b SHIPPED 2026-05-04 (commit `2d8f07f`). Route POST snake_case salary fields + range guard live in prod, validated 6 scenarios.
- Phase 4.A.10c SHIPPED 2026-05-04 (commit `fbcf6c6`). Screen 10 write-enabled, browser + DB validated. F-save-error-body-dropped logged.

**Last updated:** May 4, 2026 (Phase 4.A.10 Screen 10 write-enabled, browser+DB validated — `fbcf6c6`)
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
