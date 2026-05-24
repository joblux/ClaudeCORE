# PROFILUX MATRIX V1

Domain contract for the ProfiLux object across JOBLUX. Locks the storage, resolution, projection, and admission rules so every surface and every route operates against the same target.

This document is **subordinate** to `docs/JOBLUX_STATE.md`. On conflict, STATE wins until reconciled. See §12.

**Status:** locked v1.13 (May 24 2026 optional-section dual-action lock — §22.4 / §26.6)
**Originally locked:** April 30, 2026
**v1.1 addendum locked:** May 6, 2026
**v1.2 addendum locked:** May 7, 2026
**Maintained by:** Claude AI (Opus) · JOBLUX Ops

---

## CHANGE LOG


**v1.13 — May 24 2026 optional-section dual-action lock (Mo product decision)**

Locks Mo's product decision for optional library sections (§22.2): each optional
section carries TWO distinct actions on its Edit card — "Désactiver" (hide from
the active visible surface, data retained, reversible, via section_visibility)
and "Remove" (permanent deletion of the section AND its content, irreversible,
confirmation required). Extends section_visibility eligibility (§16A / SECTION_IDS)
from the 9 core sections to include the 8 optional library keys. The §26.6
"deactivate forbidden" rule is lifted for OPTIONAL sections only; core sections
keep the §26.4/§26.6 model unchanged. This reverses the F-C2-1 non-destructive
posture (commit c2620a7) for the Remove action specifically: Remove is now
intentionally destructive for optional sections.

- **§22.4** rewritten — optional sections carry dual actions (Désactiver / Remove).
- **§26.6** amended — two optional-section rows added; deactivate-forbidden scoped to core.
- **§16A.2** amended — section_visibility eligibility extended to 8 optional keys.

§§1–22.3, §23–25, §26.1–26.5, §26.7–26.8 — all KEEP unchanged.

**v1.12 — May 23 2026 section visibility & sovereignty doctrine lock**

Locks the candidate's mental model for what sections exist on their ProfiLux and what is exposed outbound. Consolidates the two already-shipped substrates (`section_visibility` core hide/show, `activated_sections` optional add/remove) and the keep-data rule (G1, `190c44d`) under one doctrine. No DB change — meaning, not storage. Vocabulary locked: "Visible on shared profile" / "Hidden from shared profile" / "Removed from my passport". G2 scope bounded to a presentation-only dim/label treatment (sovereignty indicator, never error/incomplete).

- **§26** new section — Section visibility & sovereignty doctrine (core vs optional substrate separation, no-delete-on-visibility rule, candidate owns outbound visibility, authenticated-cockpit rule, outbound-honors-visibility rule, canonical vocabulary, G2 disposition).
- **§16A.1** cross-ref appended — framing superseded by §26; §16A retains field/section projection mechanics.

§§1–25 — all KEEP unchanged.

**v1.11 — May 18 2026 private PDF export reconciliation (Pack B residue close)**

Reconciles MATRIX with live shipped code (`/api/profilux/export` + `lib/profilux/pdf/ProfiLuxPDF.tsx`, `@react-pdf/renderer`). Doctrine β locked: private candidate export = full ProfiLux, unmasked. Masked share PDF (recruiter/client) stays parked under §19A Q3/Q5.

- **§13** Deferred items table — "PDF library + render template" row flipped to SHIPPED for the private candidate path. Masked share PDF row remains parked.
- **§19A.2** — deferred-infra framing removed; new paragraph locks the private self-export β contract. `masked_fields` (§16) and §16A apply to client/share surfaces only, never private export.
- **§19A.3** — out-of-scope list pruned: PDF library decision + render template removed (both shipped β); `profilux` ghost-table cleanup removed (already retired 2026-05-18).
- **§19A.4** — §13 cross-ref bullet amended to note private PDF SHIPPED v1.11.

§§1–18, §19, §19B, §20–25 — all KEEP unchanged.


**v1.10 — May 17 2026 RGPD export role-conditional tables shipped (B.3.4.1)**

Closes the B.3.4 v1 deferral. `/api/members/export` now ships 16 tables; `business_briefs` and `bloglux_articles` join the export with `admin_notes` redacted. Endpoint behavior is unchanged for members who never authored either (empty arrays).

- §19B.3 — scope expanded from 14 to 16 tables.
- §19B.4 — redaction list extended for the 2 new admin_notes fields.
- §19B.5 — deferral block replaced with the shipped record.

§§1–19A, §20–25 — all KEEP unchanged.


**v1.9 — May 17 2026 RGPD machine-readable export shipped (B.3.4)**

§19B introduced and locked. `GET /api/members/export` returns a single JSON archive of 14 personal-data tables tied to the signed-in member; soft-deleted accounts are refused with `410`; password hashes are redacted; OAuth tokens are nulled; `members.notes` and `brand_contributions.admin_notes` are excluded; success is console-logged only (no audit table in v1). Settings ships the DATA EXPORT card between MATCHING CONSENT and DELETE ACCOUNT. Ledger: `7636e388-57ea-43e8-b642-b9dc519ec16b`.

- **§19B** new section — RGPD machine-readable export doctrine. Contract, surface placement, 14-table scope, redactions, audit posture, deferred scope (`business_briefs` / `bloglux_articles` → B.3.4.1), and the §19A distinction locked.
- **§19A.4** cross-references updated — §19B added as data-portability sibling.
- **§13** deferred-items table — RGPD export row flipped to SHIPPED at B.3.4.
- **§25.9** rewritten — machine-readable export is shipped; pointer updated from "future §19B" to "§19B (SHIPPED B.3.4)".
- **§25.10** forward dependencies — B.3.3 and B.3.4 marked SHIPPED; B.3.4.1 added as the residual deferred slice.

§§1–19A, §20–24, §25.1–25.8 — all KEEP unchanged.


**v1.8 — May 17 2026 Matching consent shipped (B.3.3)**

§20 reopens. The deferred consent field is now substrate. `members.matching_opt_in BOOLEAN NOT NULL DEFAULT false` (DDL applied via Supabase MCP, ledger `047b1364-59b4-48c1-a47f-51ce94c78fd0`). Resolver projects the flag onto `ProfiLuxResolved`; `projectFor('editor')` exposes it on `EditorView`; public/client/admin/ats/dashboard projections intentionally omit it. `POST /api/profilux` accepts a boolean `matching_opt_in` field. The Settings page ships the live toggle.

- **§20.5** rewritten — consent field shipped, no longer deferred. Column locked, write contract locked, default locked.
- **§20.x** rewritten — moves from PROVISIONAL to SHIPPED. The forward-dependency hedge on `matching_opt_in` storage + UI is removed. Recruiter / ATS / matching surfaces MUST gate consumption on `members.matching_opt_in === true`. `availability` remains self-description and is never read as consent.
- **View tab caption** — the previously-flagged *"Visible to JOBLUX matching only"* wording is already gone (removed by MLV-2). No further caption work owed by this slice.

§§1–19A, §21–25 — all KEEP unchanged. §13 deferred-items row for matching consent storage is now historical.


**v1.7 — May 16/17 2026 Member lifecycle doctrine lock**

Locks member lifecycle (active / soft-deleted / purged), surface-cascade hide via resolver, audit-trail preservation rule, re-registration policy, restoration policy, RGPD-adjacent obligations mapping, and forward references to §19B (RGPD export) and §20 reopen (matching_opt_in). No substrate. No code. No schema. No new infrastructure. Doctrine text only.

- **§25** new section — Member lifecycle. Soft-delete is the only deletion path; resolver cascades hide across all six projections; audit trail preserved by row retention; nextauth_accounts and active share_links suppressed at deletion; email uniqueness via partial unique index `WHERE deleted_at IS NULL`; re-registration is identity-final; restoration is row-level only; RGPD-adjacent obligations mapped; §19B (RGPD machine-readable export) and §20 reopen (matching_opt_in storage) flagged as forward dependencies.
- **§20.x** Provisional posture: rewritten. The hedge "until matching-entry score wiring ships" is replaced with the explicit forward dependency on `matching_opt_in` storage + UI (B.3.3 slice). The View tab caption decision (gate on toggle vs remove) is deferred to B.3.3 execution.
- **§13** Deferred items table: 3 rows appended — soft-delete substrate on `members`, RGPD export endpoint, matching consent storage.

§§1–24 — all KEEP unchanged.


**v1.6 — May 14, 2026 ProfiLux doctrine decisions lock**

Locks 6 Mo doctrine decisions on section visibility, maskable layer, Add Section library, Internships exception, Projects canonicalization, and ordering posture. No substrate. No code. No schema. No new infrastructure. Doctrine text only.

- **§16** Maskable layer: locked field set rewritten — 6 fields exactly (`phone`, `email`, `current_employer`, salary fields, `availability`, `references`). No additions without explicit Mo + GPT reopen.
- **§16A** New sibling subsection — Section visibility doctrine. Candidate can hide whole sections from Public + PDF projections only; internal/admin/recruiter projections remain complete. Default = show all. Substrate parked.
- **§22.2** Add-library reconciliation table rewritten: doctrine list and UI list collapsed into one canonical 8-item set. `Internships` kept as STATE §1 kill-word surface-specific exception (Emerging users). `Projects` canonicalized to `Strategic Initiatives` with locked meaning. `Press & features` label kept. `Publications /` prefix dropped. `Speaking / events` and `Volunteer / board roles` dropped from doctrine. All 8 should eventually exist; substrate parked per §15.3.
- **§22.3** Ordering doctrine update: candidate section reorder forbidden by doctrine; JOBLUX-controlled fixed order; candidate-facing ordering persistence layer NOT required. Canonical section ID prerequisite carried forward (now needed for section-hide write path, not for reorder).

§§1–15, §17–§21, §23–§24 — all KEEP unchanged.

**v1.5 — May 14, 2026 Manage + matching doctrine reconciliation addendum**

Reconciles two doctrinal gaps surfaced by C7 audit. No substrate change. No new infrastructure. No code, no schema, no UI. Doctrine text only.

- **§19** Settings doctrine: new **§19.4 "Live state"** subsection appended. Reconciles MATRIX with the live Manage tab CRUD (reserve / regenerate slug + enable / disable sharing toggle) shipped against `/api/profilux/share` + `/api/profilux/reset-link`. §19.3 PARKED status preserved for the broader Settings page rebuild; §19.4 carves out the sharing-control subset as live.
- **§20** Matching entry doctrine: new **§20.x "Provisional posture"** subsection appended (extends §20.5). Locks the separation between `availability` (candidate self-description) and matching consent (explicit toggle, §20 PARKED). Documents the provisional status of the View tab "Visible to JOBLUX matching only" caption and the conditions under which it must change.

§§1–18, §19A, §§21–24 — all KEEP unchanged.

**v1.4 — May 14, 2026 Export doctrine lock addendum**

Locks the product doctrine for ProfiLux export based on 7 answers from Mo (May 14 2026). No substrate change. No new infrastructure. No library decision. Doctrine text only. Future helper / projection implementation deferred.

- **§13** Deferred items table updated: PDF library, ProfiLux render template, `/api/resume/[slug]` retirement ("resume extinction reconciliation"), View "Download PDF" placeholder removal — all cross-referenced to §19A.
- **§19** Settings doctrine: §19.1 wording corrected on PDF mention; new **§19A "Export doctrine"** subsection appended.
- **§19A** locks the 7 doctrinal answers (what is a CV, what is exported, projection per surface, public PDF status, recruiter/client PDF status, candidate self-export, uploaded original CV status) + surface placement (export belongs in Manage / Settings, NOT View) + explicit C6.1 out-of-scope list.
- **§22.1** Lock anchors: 1-line cross-ref note added, clarifying that the View "Download PDF" affordance is governed by §19A, not §22.

§§1–12, §§14–18, §§20–24 — all KEEP unchanged.

**v1.3 — May 14, 2026 Section truth reconciliation addendum**

Reconciles MATRIX with live View / Edit / Public composition after the V12 convergence pass (commit `9dabff1`, May 11 2026) and the S-B education subgraph closure (commit `baeca3c` + migration `s_b_2c_drop_members_trio_education_columns`, May 13 2026). No substrate change. No new sections. No reordering of live UI. Doctrine text only.

- **§6.4** Field mapping table: trio mapping retired; `education_records` is the sole education truth surface.
- **§7.6.1** EditorView shape: `university`, `field_of_study`, `graduation_year` removed; education collection sourced from `education_records` (L2) + `cv_parsed_data.education[]` (L1 passthrough).
- **§15.4** Existing Phase 4 fields: trio removed from inline field list.
- **§22.1** Default sections table rewritten to match live View order: Identity (LEFT SPINE) + 7 ViewZones in V12 sequence. Compensation marked Edit-only. Clienteling marked Edit-only currently. "Live UI label" column added to surface View ↔ Edit ↔ MATRIX label drift.
- **§22.2** Add-library reconciliation block: DOCTRINE list vs LIVE `ADD_SECTION_LIBRARY` array surfaced side-by-side; drift parked, not resolved.
- **§22.3** Ordering rules: explicit status block added documenting JSX-only ordering, per-surface ordering divergence, no persistence layer, ephemeral collapse state, and prerequisites for any future reorder UX.

§§1–21, §24 component family strategy, §4.5 write contract, §6 resolver, §7 projection masks, §10 utilities — all KEEP unchanged.

**v1.2 — May 7, 2026 UX promotion addendum**

Promotes four UX MAP items (per `docs/PROFILUX_RELOAD_UX_MAP.md` §13 promotion checklist) from approved-capture status to MATRIX-locked doctrine. No substrate changes; no field changes; no contract changes. UX shell vocabulary only — locks the architecture inside which the passport rewrite will execute.

- **§21** added: View / Edit / Manage triad — three named modes
- **§22** added: Section catalog — 9 default sections + 8 add-library sections
- **§23** added: Responsive philosophy — desktop primary, mobile stacking, drawer behavior
- **§24** added: Component family strategy — section card, drawer, state marker, chip multi-toggle, tri-state Yes/No, identity strip

§§1–20, §7.6.1 EditorView shape, §4.5 write contract, §6 resolver, §7 projection masks, §10 utilities, §13 deferred items — all KEEP unchanged.

§13 deferred items list is partially closed: triad, section catalog, responsive philosophy, and component families are now repo-locked here; their previous "pending MATRIX promotion" labels in the UX map are superseded by §§21–24.

**v1.1 — May 6, 2026 reconciliation addendum**

Substrate (storage / resolver / projections / write contract / vocabulary / parser) unchanged. Product-behavior layer reconciled with `docs/PROFILUX_MODEL.md` (locked May 6).

- **§2** rewritten: ProfiLux is a living object, owned continuously, never submitted/approved/frozen
- **§7.4** extended: future user-controllable maskable layer added (doctrine only, schema parked)
- **§7.6** rewritten: passport-with-drawer UX replaces 11-screen tunnel; EditorView shape (§7.6.1) unchanged
- **§7.6.2** retired: 11-screen editor tunnel UX retired
- **§8** rewritten: matching-entry concept replaces M6 admission / confirmation mentality (`computeM6Eligible` + `computeProfileCompleteness` retained as backend-only signals)
- **§9** rewritten: `profilux` standalone table reclassified as current share-state-only table (not canonical profile store, not dormant)
- **§11** updated: M6 confirmation guardrail language reconciled
- **§13** updated: deferred/parked items list refreshed
- **§14** added: UX doctrine (view-first, edit/drawer/modal hierarchy)
- **§15** added: Tier model (Tier 0 / Tier 1 / Tier 2)
- **§16** added: Maskable layer doctrine
- **§17** added: CV re-upload merge target doctrine
- **§18** added: Public URL activation doctrine
- **§19** added: Settings surface doctrine
- **§20** added: Matching-entry doctrine

§3 layer model, §4.1–§4.5 storage/write contract, §5 re-upload rule, §6 resolver contract, §7 six-surface projection model, §7.6.1 EditorView shape, §10 implementation utilities, §12 authority/change control, vocabulary contract, parser contract — all KEEP unchanged.

**v1 — April 30, 2026** (initial lock). Original contract.

---

## 1. Purpose

This file exists because:

- ProfiLux is the central platform object (5 faces: candidate / client / admin / external share / system) but its storage and access rules were never written down as a single contract.
- The cv-parse route ships data into the system without a defined destination model, creating ambiguity about what `cv_parsed_data` *means* downstream.
- The DB has multiple parallel candidate stores (`members.*`, `profilux`, `candidate_profiles`, plus 4 empty relational tables) — without a contract, drift is guaranteed.
- Any future UI work (ProfiLux editor, public profile, admin review, ATS, client share) needs to read from a stable, single-source resolution, not from raw rows.

This spec locks v1 of that contract. It is the reference implementation target until v2 is explicitly opened.

**Authority:** `docs/JOBLUX_STATE.md` is the supreme execution truth for JOBLUX. This file governs ProfiLux specifically. If STATE and this file disagree, STATE wins; reconciliation is then required (§12).

---

## 2. Product definition of ProfiLux

**ProfiLux is** the canonical professional object representing a candidate inside JOBLUX. It is a **living professional profile object, owned continuously by the user.** It is the unified object across:

- the candidate's own dashboard
- the editable profile screen
- the candidate-shared public profile (`/p/[name]`)
- the admin candidate review surface
- the ATS / recruiting flow
- the client-share artifact (recruiter → client)

Each of these is a **face** of the same underlying object, not a parallel record.

**ProfiLux is NOT:**

- a job board profile
- a LinkedIn-style social profile
- a duplicate of the CV
- a public discovery surface
- a wizard, a submission object, a pending state, an approved state, or a frozen state

**Mo approval scope:** platform access at registration + contributions (brand corrections, salary data, insider voices). **Never to ProfiLux itself.** ProfiLux grows continuously through user edits; there is no submit/finalize gate.

**Slogan alignment:** "Luxury Talent Intelligence." ProfiLux is the talent half of the intelligence layer — confidential by default, contribution-aware, opportunity-bound.

---

## 3. Layer model

Three explicit layers. No mixing. Every read and write in the system maps to exactly one layer.

### 3.1 L1 — Canonical CV Parse

**Purpose:** raw, sanitized facts extracted from the user's uploaded CV by `/api/members/cv-parse`. Source of pre-fill, not source of profile.

**Authoritative for:** what the CV said at parse time.
**Not authoritative for:** what the candidate's current profile is.

L1 is overwritten on re-upload (§5). L1 never silently writes to L2 (§5).

### 3.2 L2 — Editable ProfiLux Profile

**Purpose:** the candidate's official profile as they manage it. Source of truth for what the candidate is presenting to JOBLUX and to clients.

**Authoritative for:** every field the candidate confirms or edits.
**Not authoritative for:** parser confidence, raw extraction details, audit history.

L2 is sovereign. L2 wins over L1 in resolution (§6).

### 3.3 L3 — Scored Intelligence

**Purpose:** derived and computed signals about the profile. Read-only for the candidate.

**Cached on `members`:** `profile_completeness` (integer), `m6_confirmed_at` (timestamp).
**Read-through from L1:** `confidence`, `needs_review` (computed at parse time, served from `cv_parsed_data` without re-cache).
**Reserved for future use:** `member_ai_reviews` table (admin/recruiter overlay).

L3 recomputes on write (§4.4 and §8). L3 is never authored directly by the candidate.

---

## 4. Storage contract

### 4.1 Tables in scope

| Table | Role | Layer |
|---|---|---|
| `members` | Primary candidate row. Holds L2 flat columns + L1 (`cv_parsed_data`) + L3 cached columns | L1, L2, L3 |
| `member_documents` | CV file metadata (existing FK'd table, in use) | provenance only |
| `luxai_history` | cv-parse run log; `response` is `{}` per sanitization patch (Apr 30) | telemetry only, never a profile source |

### 4.2 Per-layer column inventory

**L1 — `members.cv_parsed_data` (jsonb)**
Top-level keys produced by cv-parse route:
`identity, experiences, education, sectors, languages, availability, confidence, needs_review, parsed_at, schema_version, source`.
Provenance: `members.cv_url`, `members.cv_parsed_at`.

**L2 — `members.*` flat columns**

- Identity: `first_name`, `last_name`, `city`, `country`, `nationality`, `phone`, `bio`, `headline`, `avatar_url`, `linkedin_url`, `date_of_birth`
- Professional core: `job_title`, `current_employer`, `seniority`, `total_years_experience`, `years_in_luxury`, `department`, `speciality`, `maison`
- Capability arrays: `key_skills`, `software_tools`, `certifications`, `product_categories`, `brands_worked_with`, `client_segment_experience`, `market_knowledge`, `expertise_tags`, `keywords`
- Clienteling: `clienteling_experience`, `clienteling_description`
- Availability/salary: `availability`, `desired_salary_min`, `desired_salary_max`, `desired_salary_currency`, `open_to_relocation`, `relocation_preferences`, `desired_locations`, `desired_contract_types`, `desired_departments`
- Read-only / system: `email`, `role`, `status`, `access_level`, `tier_selected`, `registration_completed`, `contact_preference`, `profile_visibility`, `contribution_points`

**L3 — derived/cached on `members`**

- `profile_completeness` (integer, recomputed on L1/L2 writes)
- `m6_confirmed_at` (timestamp, set by user action only)
- `cv_parsed_data.confidence` and `cv_parsed_data.needs_review` (read-through)

### 4.3 Tables explicitly out of scope for v1

See §9.

### 4.4 Recompute boundaries

L3 cached fields are recomputed:

- `profile_completeness`: on every cv-parse run (after L1 write) AND on every L2 edit endpoint write. Computed against the resolved view (§6), not raw `members.*`.
- `m6_confirmed_at`: set ONLY by the M6 confirmation action (§8). Never auto-set, never auto-cleared in v1.

Recompute lives in route code (cv-parse route + L2 edit endpoints), not in DB triggers.

### 4.5 L2 write contract

L2 edit endpoints (`/api/profilux` POST and any future ProfiLux write route) follow these rules. Violations corrupt DB integrity and are forbidden.

**Rule W1 — Empty-string coercion.** Any incoming string value that is `''` (after trim) MUST be coerced to `NULL` before write. The form default for unfilled string fields is empty; storing `''` pollutes the canonical "unset" representation and breaks the §5.2 prefill rule ("L1 prefills only when L2 is NULL"). Applies to: `first_name`, `last_name`, `city`, `country`, `nationality`, `phone`, `bio`, `headline`, `linkedin_url`, `job_title`, `current_employer`, `university`, `field_of_study`, `clienteling_description`, `availability`, `desired_salary_currency`, `relocation_preferences`.

**Rule W2 — Partial body / explicit-presence write.** L2 edit endpoints MUST only write columns that are explicitly present in the request body. Columns absent from the body MUST NOT be written, regardless of nullishness. Form-state defaults (e.g. `availability='open'`, `salaryCurrency='EUR'`) sent with the full state object on every Continue would otherwise overwrite real DB values with form defaults the user never authored.

Implementation pattern (server):
- Test `Object.prototype.hasOwnProperty.call(body, 'fieldName')` to detect presence.
- Only include the column in the `update()` payload if present.
- Apply Rule W1 coercion to the value if present.

**Rule W3 — Recompute is unconditional.** §4.4 recompute boundary applies regardless of whether the body included scoring-relevant fields. Recompute on every L2 write attempt, even no-op writes.

**Backwards compat note (Phase 2.2 → Phase 4.0).** Legacy clients (current `app/dashboard/candidate/profilux/page.tsx`) send the full `ProfileData` object on every save. Post-W2, the server still receives and writes those fields — Rule W2 is opt-in for clients that send partial bodies; for clients that send full objects, Rule W1 alone is enough to stop the empty-string pollution. Rule W2 fully takes effect when the Phase 4 editor rebuild migrates to dirty-only POSTs.

**Adapter constraint (Phase 4.0).** Read-side adapters (e.g. `toLegacyProfile` in `app/api/profilux/route.ts`) MUST NOT mint synthetic default values from `NULL` for fields covered by W1. Specifically: `desired_salary_currency` and `availability` MUST surface as `null` to the client when DB is `NULL`. Minting `'EUR'` or `'open'` from `NULL` causes a NULL → default round-trip drift on Continue.

**Inverse-mapping rule (Phase 4.1).** When a read-side adapter collapses multiple DB-canonical values into a single UI-editor value (lossy normalization), the L2 write endpoint MUST apply an inverse mapping before writing back. Without it, every read+write round-trip silently rewrites the DB-canonical value to whichever UI value the adapter emitted, corrupting historical data. Specifically for `availability`:

- UI `active` → DB `actively_looking`
- UI `open` → DB `not_actively_looking` (canonical default; collapses prior values `open`, `considering`, `open_to_opportunities`, `not_actively_looking`)
- UI `passive` → DB `passively_exploring`
- UI `unavailable` → DB `unavailable`
- UI `null` or empty → DB `null`

Implementation: server-side `denormalizeAvailability(uiValue)` helper, called before `coerceEmpty()` in the POST handler. Read-side `normalizeAvailability` remains the source of truth for the collapse mapping; the write-side helper is its right inverse for the canonical default of each collapsed group.

**Test expectations:**
- POST with `{firstName: ''}` → DB writes `NULL` (W1).
- POST with no `availability` key → DB unchanged for `availability` (W2).
- POST with `{availability: 'open'}` (UI value) → DB writes `'not_actively_looking'` (canonical default; Phase 4.1 inverse-mapping rule).
- GET response from `/api/profilux` for a row with `desired_salary_currency = NULL` → response field is `null`, not `'EUR'`.

---

## 5. Re-upload / overwrite rule

### 5.1 L1 overwrite-in-place

When a candidate re-uploads a CV and re-runs parse:

- `members.cv_url` is replaced
- `members.cv_parsed_at` is replaced
- `members.cv_parsed_data` is replaced

No versioning in v1. The previous parse is gone after re-upload.

### 5.2 L2 sovereignty

A new parse **never silently writes** to `members.*` flat columns. New parse output may:

- **suggest/prefill** an L2 field, but only when that L2 field is currently NULL and only via explicit user confirmation (the editor surface presents the suggestion; the user accepts or ignores)
- **feed admin review** via the admin surface (§7) where an admin can see L1 vs L2 diffs

Once a `members.*` field is populated by user action, L1 cannot overwrite it via any code path.

### 5.3 Versioning

Not in v1. Flagged as deferred (§13).

---

## 6. Resolver contract

### 6.1 Function

```
resolveProfiLux(memberId: string): ProfiLuxResolved
```

- Input: `members` row + `cv_parsed_data` jsonb
- Output: a single shaped object every read surface consumes
- Lives server-side only. No client-side resolver.

### 6.2 Precedence rule (Rule A)

For every field that exists in both L1 and L2:

1. If `members.<field>` is non-NULL/non-empty → return `members.<field>`
2. Else if the corresponding L1 path has a value → return that
3. Else → return null/empty

L1 fills NULL gaps. L2 always wins when populated. L1 never auto-writes to L2.

### 6.3 Email exception

`members.email` is OAuth-confirmed and immutable from any L1 write. The resolver always returns `members.email`, never `cv_parsed_data.identity.email`.

### 6.4 Field mapping (L1 → L2)

| L1 path in `cv_parsed_data` | L2 column on `members` | Notes |
|---|---|---|
| `identity.first_name` | `first_name` | |
| `identity.last_name` | `last_name` | |
| `identity.city` | `city` | |
| `identity.country` | `country` | |
| `identity.nationality` | `nationality` | |
| `identity.phone` | `phone` | |
| `identity.email` | `email` | L2 always wins (§6.3) |
| `experiences[0].company` | `current_employer` | most recent role only |
| `experiences[0].job_title` | `job_title` | most recent role only |
| `sectors[]` | (no flat L2) | passthrough from L1 in v1 (relational table empty) |
| `languages[]` | (no flat L2) | passthrough from L1 in v1 (relational table empty) |
| `education[]` | `education_records` (L2 collection) | `members` flat trio (`university`, `field_of_study`, `graduation_year`) retired at S-B.2C (DDL migration `s_b_2c_drop_members_trio_education_columns`, May 13 2026). `education_records` is now the sole education truth surface. L1 `cv_parsed_data.education[]` is preserved as a passthrough source for the resolver's additive merge contract (S-B.1A) and as the source for `cv_education_suggestions` (S-B.1B). |

Sectors/languages live in `cv_parsed_data` only in v1. The relational tables `member_sectors` and `member_languages` are out of scope (§9). When the editor for these is built, a corresponding L2 store decision is required (likely via §13).

---

## 7. Projection contract by surface (including secondary fields)

### 7.1 Function

```
projectFor(view: ProfiLuxResolved, surface: SurfaceKey): ProjectedView
```

`SurfaceKey ∈ { 'dashboard', 'editor', 'public', 'admin', 'ats', 'client' }`

A single switch over surface, one projection contract per surface. Surfaces import only `projectFor` for ProfiLux fields. **Direct DB reads of `members.*` or `cv_parsed_data` for ProfiLux fields are forbidden in surfaces.**

### 7.2 Six surfaces, six contracts

| # | Surface | Path | Purpose | Source |
|---|---|---|---|---|
| 1 | Dashboard | `/dashboard/candidate` | Progression + M6 status + next action + key fields | resolved view + `profile_completeness` + `m6_confirmed_at` |
| 2 | Editor | `/dashboard/candidate/profilux` | Full editable profile, L2 writes | resolved view + L1 prefill markers (suggestion only) |
| 3 | Public | `/p/[name]` | Candidate-shared external ProfiLux, premium curated | resolved view, candidate-controlled, premium subset |
| 4 | Admin | `/admin/members/[id]` | Internal review, L1 vs L2 diffs visible | resolved view + L1 raw + L2 raw + CV doc + parser status + `member_ai_reviews` |
| 5 | ATS | `/admin/ats/*` | Recruiting operational view | resolved view, operational subset |
| 6 | Client share | recruiter-bound link | Recruiter → client artifact, JOBLUX-controlled, opportunity-bound | resolved view, strict curated subset |

### 7.3 Field-level masks

| Field | Dashboard | Editor | Public `/p/[name]` | Admin | ATS | Client share |
|---|---|---|---|---|---|---|
| `email` | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ |
| `phone` | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ |
| `linkedin_url` | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ |
| `desired_salary_*` | ✓ (own) | ✓ | ✗ | ✓ | ✓ | ✗ |
| `current_employer` | ✓ | ✓ | ✓ (toggle) | ✓ | ✓ | ✓ (toggle) |
| `cv_parsed_data.confidence` | ✗ | metadata only | ✗ | ✓ | ✗ | ✗ |
| `cv_parsed_data.needs_review` | ✗ | resolver-internal | ✗ | ✓ | ✗ | ✗ |
| `notes` (admin) | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| `contribution_points` / `access_level` | ✓ (own) | ✗ | ✗ | ✓ | ✗ | ✗ |
| `member_ai_reviews` | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| L1 raw (`cv_parsed_data` full) | ✗ | suggestions only | ✗ | ✓ | ✗ | ✗ |

**"Toggle"** on `current_employer` for public and client share = the candidate's confidentiality preference. Mechanism alignment with `members.profile_visibility` is an implementation detail (§10).

### 7.4 Secondary field rule (`linkedin_url` and similar)

`linkedin_url` is a secondary field: optional, never matching-required, never central. It is:

- present in editor / admin / ATS (when non-empty)
- hidden in dashboard / public / client share by default
- stored on `members.linkedin_url`, no L1 source (CV parse does not extract it)

The same pattern applies to any future field that is utilitarian-but-doctrine-sensitive: list it in §7.3 with the appropriate mask, do not give it a dedicated section.

**User-controllable maskable layer (future, see §16):** beyond the surface masks in §7.3, a future layer enables the user to per-field hide selected fields from public/client share. Doctrine locked in §16; schema and projection changes are parked.

### 7.5 Public vs client share are distinct contracts

`/p/[name]` and client share may visually overlap but are governed by **different masks and different ownership**:

- **Public (`/p/[name]`)**: candidate-controlled, candidate's outbound link, premium feel
- **Client share**: JOBLUX-controlled, recruiter-curated, opportunity-bound

They are not the same projection. Future product decisions may diverge them further.

---

### 7.6 Editor projection — passport-with-drawer UX

The `editor` surface returns a dedicated `EditorView` projection consumed by the candidate-facing ProfiLux editor. The shape (§7.6.1) uses Matrix v1 §6 ProfiLuxResolved field names (no legacy camelCase) and is unchanged from v1.

**UX model (v1.1 reconciliation, see §14):** view-first passport with drawer-based section editing. Identity strip + section cards rendered together; per-section drawer for rich edits; modal reserved for destructive actions only. The 11-screen tunnel previously prescribed in §7.6.2 is retired.

**Locked decisions:**
- Availability is part of the Readiness Layer, NOT a matching-entry blocker (see §20). Final matching-entry logic per §20.
- `normalizeAvailability` retained on read; `denormalizeAvailability` retained on write. UI uses 4-value enum (active / open / passive / unavailable).
- UI consumes `EditorView` only — never raw `view` or legacy `profile`.

#### 7.6.1 EditorView shape

```typescript
interface EditorView {
  // Identity
  first_name: string | null
  last_name: string | null
  city: string | null
  country: string | null
  nationality: string | null
  phone: string | null

  // Position
  job_title: string | null
  current_employer: string | null
  seniority: string | null
  total_years_experience: number | null

  // Luxury fit
  years_in_luxury: number | null
  sectors: string[]
  product_categories: string[]
  expertise_tags: string[]

  // Experience + education
  // education[] merges L2 (education_records) FIRST + L1 (cv_parsed_data.education[]) SECOND,
  // additive, no dedup, per S-B.1A. The legacy flat trio
  // (university / field_of_study / graduation_year) was dropped at S-B.2C
  // (DDL migration s_b_2c_drop_members_trio_education_columns, May 13 2026).
  experiences: ResolvedExperience[]
  education: ResolvedEducation[]

  // Availability + targets (Readiness — NOT admission)
  availability: 'active' | 'open' | 'passive' | 'unavailable' | null
  desired_locations: string[]
  desired_departments: string[]
  desired_contract_types: string[]
  desired_salary_min: number | null
  desired_salary_max: number | null
  desired_salary_currency: string | null
  open_to_relocation: boolean | null
  relocation_preferences: string | null

  // Narrative
  headline: string | null
  bio: string | null
  avatar_url: string | null
  linkedin_url: string | null

  // Languages, markets, skills
  languages: ResolvedLanguage[]
  market_knowledge: string[]
  key_skills: string[]

  // Clienteling
  clienteling_experience: boolean | null
  clienteling_description: string | null

  // CV meta (read-only)
  cv_meta: {
    cv_url: string | null
    cv_parsed_at: string | null
    needs_review: number
  }

  // Computed (read-only)
  profile_completeness: number
}
```

Notes:
- Strings default to `null`. Arrays default to `[]`. Numbers default to `null`.
- L1-only fields (`sectors`, `experiences`, `education`, `languages`) are read from `cv_parsed_data`. Editor renders but does NOT write them via this contract.
- `availability` is shown as the 4-value UI enum on read (via `normalizeAvailability`) and inverse-mapped on write (via `denormalizeAvailability`) per §4.5.

#### 7.6.2 Per-screen read/write map — RETIRED (v1.1)

The 11-screen tunnel UX previously prescribed here is retired. ProfiLux UX is now passport-with-drawer per §14. The EditorView shape (§7.6.1) and the §4.5 partial-body write contract remain unchanged — they continue to govern the editor's data flow regardless of UX shell.

Implementation that previously consumed §7.6.2 (`app/dashboard/candidate/profilux/page.tsx`, currently 754-line 11-screen tunnel) will be replaced in a future scoped session. The API contract and substrate survive the rewrite.

---

## 8. Matching entry — backend readiness signal

Replaces v1's M6 admission and confirmation mentality. ProfiLux is a living object (§2); there is no "admission" UX, no "confirm my ProfiLux" button, no `m6_confirmed_at` user action.

### 8.1 — Two conditions for matching eligibility

Matching entry is a backend-only computed signal. A candidate enters matching when BOTH conditions hold:

1. **Core fields complete:** identity (`first_name`, `last_name`, `city`, `country`) + current role (`job_title`, `current_employer`) + ≥1 experience (from `cv_parsed_data.experiences[]`) + `availability` set + `work_authorization` set + `notice_period` set.
2. **Explicit user consent (future field, see §20):** a dedicated consent toggle, NOT derived from `availability` by default. Until the consent field ships, matching is gated externally.

### 8.2 — Backend group predicates (legacy M6 utility, retained as signal)

`computeM6Eligible` and `computeProfileCompleteness` utilities (per §10) are **retained as backend-only readiness signals**. They are NOT exposed to the user as an admission gate. Their group predicates (G1–G6) inform the matching-entry condition (1) above; their composition may be revised when Tier 1 fields land (see §15).

### 8.3 — `m6_confirmed_at` retention

The `members.m6_confirmed_at` column remains in the schema. It is no longer set by user action (no UX). Future use to be decided; either:
- repurposed as a matching-entry timestamp (set automatically when condition 1+2 first hold)
- or retired in a future cleanup

Decision deferred. No code currently sets this field.

### 8.4 — What replaced "submit / pending / approved"

Nothing. The candidate is never submitted, never pending review, never approved. They are continuously editing. Recruiter actions (search, shortlist, client submission) operate against the same living object via the `ats` and `client` projections (§7).


## 9. Frozen-out tables / not v1

The following tables exist in the schema but are **not used as profile sources in v1**. Their state is preserved but no read or write path may treat them as authoritative.

| Table | Rows (Apr 30) | Status v1 | Notes |
|---|---|---|---|
| `candidate_profiles` | 0 | dormant | Empty, FK'd, overlaps `members.*`. Deprecation flagged for cleanup session. |
| `profilux` (standalone) | 3 | **share-state only** | No FK to members. Holds `share_slug` + `sharing_enabled` for `/p/[name]` public share URL. Read by `app/[slug]/page.tsx`, written by `/api/profilux/reset-link`. NOT a profile data source. Full retirement (migration of share state to `members.*` or replacement) is a post-v1.1 decision, tracked in ledger `6aef236e`. |
| `work_experiences` | 0 | dormant | Empty, FK'd, CASCADE. Will be the long-term L2 store for experiences (post-v1). |
| `education_records` | 0 | dormant | Empty, FK'd, CASCADE. Same trajectory. |
| `member_languages` | 0 | dormant | Empty, FK'd, CASCADE. Same trajectory. |
| `member_sectors` | 0 | dormant | Empty, FK'd, CASCADE. Same trajectory. |

**Why deferred, not deleted:**
- The DB already has multiple parallel candidate stores. v1 stabilizes the live `members`-based path before introducing migrations.
- The relational tables (`work_experiences`, `education_records`, `member_languages`, `member_sectors`) represent the long-term direction (relational L2). Their existence is fine; their use is deferred.
- `profilux` (standalone) is **not dormant** in v1.1 — it is currently the share-state store. Its retirement requires a parallel decision: keep narrowly as share-state, or migrate `share_slug` + `sharing_enabled` to `members.*`.
- `candidate_profiles` is fully dormant.

---

## 10. Implementation utilities required

The following utilities are normative. They are the only entry points for ProfiLux data.

| Utility | Purpose | Called from |
|---|---|---|
| `resolveProfiLux(memberId)` | Single resolver, returns `ProfiLuxResolved` | every surface, every read path |
| `projectFor(view, surface)` | Single projector, returns surface-specific shape | every surface |
| `computeM6Eligible(view)` | M6 eligibility check, returns boolean | editor + admin surfaces |
| `computeProfileCompleteness(view)` | L3 cache compute, returns integer 0–100 | cv-parse route + every L2 edit endpoint |

### 10.1 Forbidden patterns

- Direct DB reads of `members.*` or `cv_parsed_data` from any surface for ProfiLux fields. Always go through `projectFor`.
- Client-side resolution. The resolver runs server-side only.
- L1 → L2 silent writes from any code path.
- Separate completeness logic per surface. Single `computeProfileCompleteness`, single source.
- Reading `m6_confirmed_at` to infer eligibility. The two are distinct (§8).

### 10.2 Where each utility plugs in

- **cv-parse route** (`app/api/members/cv-parse/route.ts`): writes L1, then calls `computeProfileCompleteness(resolveProfiLux(memberId))` and persists to `members.profile_completeness`.
- **L2 edit endpoints** (any route writing `members.*` ProfiLux fields): after write, same recompute + persist.
- **Surfaces** (dashboard, editor, public, admin, ATS, client share): call `projectFor(resolveProfiLux(memberId), '<surface>')` and consume the returned shape only.
- **M6 confirm endpoint** (new, implementation-deferred): validates `computeM6Eligible(view) === true` then sets `members.m6_confirmed_at = now()`.

---

## 11. Guardrails / non-goals

### 11.1 Hard guardrails (v1)

- **No fourth profile store.** Storage is `members` row + `cv_parsed_data` jsonb on it. That is the entirety of v1's profile surface area.
- **No L1 → L2 silent writes.** Any prefill from L1 to L2 is user-confirmed via the editor surface.
- **No per-field confirmation flags.** `members.l2_confirmed_fields` or similar is explicitly out of v1. Rule A precedence (NULL-as-empty) is the v1 inference.
- **`m6_confirmed_at` is no longer user-set.** Per §8, no UX writes this field. Its future is deferred (§8.3).
- **No client-side resolver.** Surfaces never resolve. They consume.
- **No schema migration in this spec.** Every column referenced exists today.
- **No use of `profilux` standalone table or `candidate_profiles` as profile source.**

### 11.2 Non-goals

- v1.1 does not implement re-parse versioning. CVs overwrite.
- v1.1 retires user-facing M6 admission. Backend group predicates retained as signal (§8.2).
- v1.1 does not migrate to relational `work_experiences` / `education_records` / `member_languages` / `member_sectors`.
- v1.1 does not retire the `profilux` standalone table — reclassified as share-state-only (§9).
- v1.1 does not unify `/p/[name]` and client share.
- v1.1 does not extract LinkedIn URL or other non-CV signals into L1.
- v1.1 does not implement Tier 1 / Tier 2 schema, maskable layer, CV merge UX, Settings page, or Public URL activation UI. All parked (§13).

---

## 12. Change control / how to update this spec

### 12.1 Authority

`docs/JOBLUX_STATE.md` is the supreme execution truth for JOBLUX. This document governs ProfiLux specifically. On conflict, STATE wins; this file must reconcile.

### 12.2 Behavior change rule

If product behavior changes in any way that contradicts this spec:

1. Update this spec **first** (or in the same commit) — never let code drift silently from the contract.
2. If the change touches platform-wide doctrine, update `docs/JOBLUX_STATE.md` in the same change set.
3. Code that diverges from this spec without a corresponding spec update is treated as a defect.

### 12.3 Workflow for updating this spec

1. Identify the section affected (Q1–Q6 territory mapped to §3–§8).
2. Draft the change in chat (Claude AI), validate with GPT, get Mo approval.
3. Single commit: `docs(profilux): <short description of change>`. No code mixed in.
4. If STATE needs an update, separate commit on STATE — do not bundle.

### 12.4 Versioning

This is **v1**. A v2 opens when:

- One or more deferred items in §13 ships, or
- Storage shape changes (e.g. relational tables become authoritative), or
- A second profile store becomes necessary by product decision.

Until then, all updates are amendments to v1, recorded in the commit history of this file.

---

## 13. Deferred to v2 / future decisions

The following items are intentionally out of v1.1. Each is a known future ticket, not a gap.

| Item | What it is | Trigger to revisit |
|---|---|---|
| `cv_parse_history` table | Per-parse archive for diff/audit | When recruiting/legal compliance requires CV parse provenance |
| Per-field confirmation flags (`l2_confirmed_fields`) | Replace Rule A NULL-as-empty inference | When cv-parse begins writing directly to L2, or when "user confirmed" needs explicit tracking |
| Tier 1 schema | DB columns for: notice_period, work_authorization, salary_history (multi-row?), reporting_line, budget_responsibility, team_size | When recruiter-critical fields become required for matching entry §20 |
| Tier 2 schema | DB tables/columns for: structured certifications, awards, references, portfolio, publications, memberships | When credibility enrichment surface is built |
| Maskable layer schema | Per-field user-controllable visibility flags (see §16) | When public/client share UX is built out |
| Maskable projection changes | `public` and `client` projections honor maskable flags | Together with maskable layer schema |
| CV merge state machine | Diff endpoint, accept/reject API, merge audit (see §17) | When CV re-upload UX is built |
| Settings page | Public URL toggle, maskable toggles, candidate self-export trigger, prefs (see §19, §19A) | When `/dashboard/candidate/profilux` editor rewrites to passport |
| Public URL activation UI | `/p/[name]` ON/OFF toggle (see §18). Web-first; no public PDF (see §19A Q4). | Together with Settings page |
| Salary history schema | Multi-row vs single column decision | With Tier 1 schema |
| Phase 4 L2 array rebuild | Round-trip storage for sectors/languages/experiences/education/markets/specialisations via L2 (currently L1-only passthrough, see §6.4) | Open ledger `8f82b3ac` |
| Relational L2 migration | Move sectors, languages, experiences, education to dedicated child tables | When the editor needs multi-row editing for those entities |
| `candidate_profiles` cleanup | Drop or repurpose the empty-but-FK'd table | Deprecation session post-v1.1 |
| `profilux` standalone retirement or migration | Keep narrow as share-state, OR migrate share_slug/sharing_enabled to `members.*` | Decision before next ProfiLux UX rewrite |
| Richer client share controls | Recruiter-side toggles, expiry, watermarks, view tracking | When client-share surface is built out |
| LinkedIn URL extraction in L1 | Parse `linkedin_url` from CV header | If/when product reverses the kill-word stance for utility |
| Anthropic Files API native PDF | Replace pdf-parse with native PDF input to Haiku | Per F-pdfparse-anthropic-files in STATE |
| Matching-entry consent field | Explicit user toggle, NOT derived from `availability` (see §20) | When matching entry §20 is wired |
| Matching-entry score wiring | Computed signal triggering (1) + (2) of §8.1 | When Tier 1 schema lands |
| PDF library + render template | Selection of PDF generator + template for the ProfiLux private snapshot (see §19A Q2). Private candidate path SHIPPED v1.11 via `@react-pdf/renderer` + `lib/profilux/pdf/ProfiLuxPDF.tsx` consumed by `/api/profilux/export`. Masked share PDF (recruiter/client) stays parked per §19A Q3/Q5. | SHIPPED v1.11 (private path); masked share PDF parked |
| Resume extinction reconciliation | Retire `/api/resume/[slug]` route + retire planned `members.resume_*` columns + retire `resume_slug` slug space. All identified as fossil from a prior "Resume product" direction (see §19A.3). | After §19A doctrine lands; not in C6.1 |
| `profilux` ghost-table cleanup | The standalone `profilux` table contains 17 legacy columns beyond `share_slug` + `sharing_enabled`. Tracked at ledger `6aef236e`. Doctrine drift vs §9; substrate cleanup deferred. | Together with Manage tab A2 sharing UX rebuild |
| View "Download PDF" placeholder removal | The LEFT SPINE row in `app/dashboard/candidate/profilux/page.tsx` is doctrinally misplaced per §19A.2. Cleanup deferred until Manage-side export control ships. | When candidate self-export ships in Manage / Settings |
| Soft-delete substrate on `members` | `deleted_at` + `deleted_by` columns + email partial unique index `WHERE deleted_at IS NULL` (see §25) | B.3.1b DDL slice |
| RGPD export endpoint | `/api/members/export` machine-readable archive of subject's personal data (see §19B) | SHIPPED B.3.4 |
| Matching consent storage | `members.matching_opt_in boolean NOT NULL DEFAULT false` + endpoint + UI (see §20 reopen) | B.3.3 |

---

## 14. UX doctrine

### 14.1 — View-first passport

ProfiLux renders as a single living document. Identity strip + section cards visible together. No tunnel, no stepper, no submission gate.

### 14.2 — Edit / drawer / modal hierarchy

- **Inline edit** for short fields where the field IS the affordance (single-line text, single-select).
- **Drawer** for rich object editing (multi-field forms, multi-select chip groups, structured items like experience entries, education entries).
- **Modal** reserved for destructive actions only (delete confirmation, irreversible operations).

No modals for primary edits. No tunnels. No multi-step wizards.

### 14.3 — Field state markers

Field-level state surfaced via subtle visual markers (per MODEL):
- "Missing" — field expected but empty
- "Review" — value parsed from CV, awaits user confirmation
- "AI inferred" — generated suggestion, click to confirm and remove the marker

Markers are visual cues, not admission gates. They inform the user; they do not block.

### 14.4 — Luxury shell + functional engine

Visual shell (typography, color, spacing) follows the dark luxury design system per `JOBLUX_STATE.md` §15. Functional engine (state, render, edit drawers) is real — no placeholders, no dead controls (locked v12 prototype principle, May 6).

---

## 15. Tier model (per MODEL §7)

ProfiLux fields are classified into three tiers by source and importance.

### 15.1 — Tier 0 (signup-seeded)

Fields seeded at signup, before CV upload:
- `first_name`, `last_name`
- `email` (OAuth-confirmed, immutable per §6.3)
- `city`, `country` (location)

### 15.2 — Tier 1 (recruiter-critical, PARKED)

Fields gating matching entry (§20). PARKED — schema not yet built:
- `notice_period`
- `work_authorization`
- `salary_history` (multi-row? schema TBD)
- `reporting_line`
- `budget_responsibility`
- `team_size`

These fields do not exist on `members.*` today. Adding them requires schema migration + `MemberRow` extension + `ProfiLuxResolved` field + `EditorView` field + write payload in `/api/profilux` POST.

### 15.3 — Tier 2 (credibility enrichment, PARKED)

Optional credibility fields. PARKED — schema not yet built:
- Structured certifications (current `members.certifications` is flat text array)
- Awards
- References
- Portfolio
- Publications / press features
- Memberships

Each Tier 2 section requires either a new column or a new relational table, plus corresponding type + projection changes.

### 15.4 — Existing Phase 4 fields

All other fields covered by `EditorView` (§7.6.1): expertise_tags, key_skills, market_knowledge, desired_locations, desired_departments, desired_contract_types, seniority, total_years_experience, years_in_luxury, desired_salary_min/max/currency, education (L2 collection `education_records` + L1 passthrough `cv_parsed_data.education[]`), languages (L1 passthrough), product_categories, clienteling_experience, clienteling_description, headline, bio, etc. The legacy `members.{university, field_of_study, graduation_year}` flat trio is retired (S-B.2C, May 13 2026).

---

## 16. Maskable layer doctrine

### 16.1 — What it is

Per-field user-controllable visibility flags. The candidate decides which sensitive fields appear in public/client share projections, beyond the deterministic surface masks of §7.3.

### 16.2 — Maskable field set (locked v1.6, May 14 2026)

The maskable set is locked at exactly 6 fields:

- `phone`
- `email`
- `current_employer`
- salary fields (`desired_salary_min`, `desired_salary_max`, `desired_salary_currency`)
- `availability`
- `references` (Tier 2, substrate parked per §15.3)

No additions to this set without an explicit Mo + GPT doctrine reopen. Future fields that arrive in Tier 1 / Tier 2 are NOT automatically maskable.

### 16.3 — Distinct from §7 surface masks

§7.3 masks are deterministic per surface (e.g. `phone` always hidden in `public` and `client`). §16 maskable flags are user-controlled and additive — they can hide fields that §7.3 would otherwise show.

### 16.4 — Distinct from §16A section visibility

§16 is field-level. §16A is section-level. The two layers compose: a section may be visible while specific fields inside it are masked, or vice versa. Both honor the same Public + PDF projection scope.

### 16.5 — Status

Doctrine locked (6-field set + projection scope). Schema parked. Projection wiring parked.

### 16.6 — Future projection contract

When schema lands, `public` and `client` projections will honor maskable flags by replacing the masked field with `null` before serialization. Resolver and EditorView remain unchanged (the maskable flag is a projection-time concern, not a storage-time one).

---

## 16A. Section visibility doctrine

### 16A.1 — What it is

Candidate-controlled section-level hide. The candidate decides which entire sections appear in their externally-shared ProfiLux, beyond the per-field maskable layer of §16.

*Superseded in framing by §26 (Section visibility & sovereignty, locked v1.12). §16A retains the field/section projection mechanics; §26 is the authoritative mental model.*

### 16A.2 — Projection scope (locked v1.6)

Section hide affects EXACTLY these projections:

- `public` (`/p/[slug]`)
- PDF exports (per §19A; consumer not yet built)

Section hide MUST NOT affect:

- `dashboard` (candidate's own view)
- `editor` (candidate's own edit surface)
- `admin` (admin review surface)
- `ats` (recruiter operational view)
- `client` share (recruiter-curated artifact)

Internal/admin/recruiter truth remains complete regardless of candidate hide choices. The candidate cannot hide content from JOBLUX itself or from recruiters; they can only hide content from outbound public sharing.

**Optional-section extension (v1.13, 2026-05-24):** section_visibility eligibility,
previously limited to the 9 core SECTION_IDS, is extended to the 8 optional
library keys (awards, certifications, memberships, strategic_initiatives,
portfolio, press_features, references, internships). The "Désactiver" action on
an optional card writes `section_visibility[key]=false`; "Remove" is a separate
destructive action on `activated_sections` + content. The hide honors the same
Public + PDF projection scope as core sections.

### 16A.3 — Default state

Default = show all sections. Hide is opt-in per section. New members carry zero hidden sections.

### 16A.4 — Scope: removable vs permanent sections

Per §22.4, default sections cannot be REMOVED. Section hide is distinct: a default section stays in the catalog and continues to render on internal/admin/recruiter projections; it is only suppressed on Public + PDF. Library sections (§22.2) follow the same hide rule once activated.

### 16A.5 — Distinct from §16 field-level mask

§16 hides individual fields; §16A hides entire sections. They compose. A candidate may:
- hide a whole section from Public (§16A) while leaving its fields visible elsewhere
- show a section while masking specific fields inside it (§16)
- combine both

### 16A.6 — Status

Doctrine locked (projection scope + default + composition rule). Schema parked (forward dependency on §22.3 canonical section identifier). Projection wiring parked.

### 16A.7 — Future projection contract

When schema lands, `public` and PDF projections will receive the candidate's hidden-section list at projection time and suppress the matching section blocks before serialization. Resolver and EditorView remain unchanged (section hide is a projection-time concern, not a storage-time one).

---

## 17. CV re-upload merge target doctrine

### 17.1 — Target UX (per MODEL §6)

User re-uploads CV at any time. System parses via Haiku 4.5 (existing `/api/members/cv-parse`). UI presents a merge review:

- Modal-style "X changes detected"
- Field-by-field diff (current value vs newly parsed value)
- Accept / reject per field
- Apply commits accepted changes to `members.*`

No silent auto-merge. User explicitly accepts each change.

### 17.2 — Storage contract (preserved from §5)

L1 (`cv_parsed_data`) overwrites in place on every re-parse. L2 (`members.*`) is sovereign and is only updated via accepted merges. This is consistent with §5.2 ("L1 may suggest/prefill L2 only with explicit user confirmation via the editor surface") — §17 formalizes the UX of that confirmation.

### 17.3 — Status

UI greenfield. State machine greenfield. API endpoints (diff, accept/reject) PARKED.

The parser already produces `cv_parsed_data.needs_review[]` (per cv-parse zod schema) which can seed the merge UX once built. No schema changes required for the diff itself; only the audit/state of the merge action requires future tables (e.g. cv_parse_history per §13).

---

## 18. Public URL activation doctrine

### 18.1 — Default (per MODEL §5)

`/p/[name]` is **OFF by default.** The candidate explicitly activates it.

### 18.2 — Storage

Activation state is stored on the `profilux` standalone table (per §9 reclassification): `share_slug` + `sharing_enabled`. Read by `app/[slug]/page.tsx`, written by `/api/profilux/reset-link`.

### 18.3 — Activation UX

PARKED. Future Settings page (§19) hosts the toggle.

### 18.4 — Future migration option

Move `share_slug` + `sharing_enabled` to `members.*` to retire the `profilux` standalone table entirely. Decision parked per §13.

---

## 19. Settings surface doctrine

### 19.1 — What it is

A dedicated Settings page where the candidate manages:
- Public URL ON/OFF toggle (§18). Web-first; no public PDF (see §19A Q4).
- Maskable field toggles (§16)
- Candidate self-export trigger — private full ProfiLux snapshot (see §19A Q2). No public-facing PDF.
- Account preferences (notifications, contact, etc.)

### 19.2 — Replaces

The current `/profile` (light) surface — slated for retirement once Settings ships. The dark `/dashboard/candidate/profilux` surface continues as the editor (passport per §7.6 + §14).

### 19.3 — Status

PARKED. Greenfield page.

### 19.4 — Live state (locked May 14 2026, supersedes §19.3 for sharing controls only)

Settings page proper remains PARKED (greenfield, §19.3). However, the Manage tab inside the candidate ProfiLux page (`/dashboard/candidate/profilux`, `tab === 'manage'`) is live and operationally hosts a subset of the controls described in §19.1:

| Control | Status | Route | DB write |
|---|---|---|---|
| Reserve / regenerate public slug | LIVE | `POST /api/profilux/reset-link` | `profilux.share_slug` (upsert) |
| Enable / disable sharing toggle | LIVE | `POST /api/profilux/share` | `profilux.sharing_enabled` |
| Sharing status read | LIVE | `GET /api/profilux/share` | none (read-only) |
| Public URL ON/OFF | LIVE (alias of "enable / disable sharing") | — | — |
| Maskable field toggles (§16) | PARKED | — | none |
| Candidate self-export trigger (§19A) | PARKED | — | none |
| Account preferences (notifications, contact) | PARKED | — | none |

**Doctrinal anchors:**
- `profilux` table remains the sole sharing-state surface (no `members.sharing_*` columns).
- Sharing controls sit outside the projection contract (§7) because they manage share-state metadata, not profile field projection.
- Reset-link mints `share_slug` from `members.{first_name, last_name}` lowercased + dash-joined (real-identity slug; no vanity picker in v1).
- Edit / Reserve path stays under candidate authority — no admin override is in scope.

**Out of scope of this live state:**
- Per-field maskable toggles (§16 PARKED).
- Candidate self-export (§19A PARKED).
- Profile visibility levels other than `team_only` (current default; `members.profile_visibility` column is orphan, not consumed).
- Slug vanity / pseudonym picker.
- `share_slug` `UNIQUE` constraint posture (not verified by C7; tracked as drift noise, not a doctrine item here).

---

## 19A. Export doctrine (locked May 14 2026)

ProfiLux is a living object (§2). Export = a private snapshot taken from that object at a moment in time. This section locks **what is exported, to whom, from which projection**. Implementation infra (library, template, render pipeline) is deferred and is NOT in scope of the doctrine lock.

### 19A.1 — The 7 doctrinal answers

**Q1 — What is "a CV" in JOBLUX now?**

Two distinct artifacts coexist by design:

- **(a) Uploaded original CV** — archive / input file owned by the `member-cvs` Storage bucket. Immutable, candidate-authored. Used for parse and admin review only. Not the future JOBLUX-rendered export.
- **(b) ProfiLux-rendered export** — generated private snapshot from the living ProfiLux object. NOT yet built.

These are not interchangeable. Neither replaces the other.

**Q2 — What is exported?**

A private snapshot of the candidate's living ProfiLux object, generated from the canonical ProfiLux resolution pipeline. Exact implementation projection / helper deferred.

**Q3 — Which projection per export type?**

Locked mapping (product doctrine; implementation projection / helper deferred):

| Export type | Doctrine |
|---|---|
| Candidate self-export | Private full ProfiLux snapshot, generated from the canonical ProfiLux resolution pipeline. Exact implementation projection / helper deferred. |
| Recruiter export | PARKED. Gated on `C-B-2` (admin share-preview). No code today. |
| Client share export | PARKED. Gated on `C-B-3` (public client-facing `/p/[slug]` consumer). No code today. |
| Public export | DOES NOT EXIST as a concept. Public sharing remains web-first via `/p/[slug]` HTML render. No public PDF. |

**Q4 — Does public PDF exist as a concept?**

No. Web-first only. `/p/[slug]` is the public surface. The public surface is HTML rendering, not export.

**Q5 — Does recruiter / client PDF exist?**

No. Deferred. Gated on `C-B-2` (admin share-preview) and `C-B-3` (public client-facing `/p/[slug]` consumer). Both PARKED per `JOBLUX_STATE.md`.

**Q6 — Does candidate self-export differ from public export?**

Question moot: no public export exists. Candidate self-export is private full ProfiLux. Public web view (`/p/[slug]`) is public-surface masked per the projection doctrine (§7), but this is web rendering, not export.

**Q7 — Is uploaded original CV still canonical, or replaced by ProfiLux render?**

Coexistent. Uploaded original = archive / input, immutable. ProfiLux render = future-generated private snapshot from the living object. Neither replaces the other.

### 19A.2 — Surface placement

The "Download PDF" affordance belongs in **Manage / Settings** (§19), **NOT** in View.

Private self-export SHIPPED (β): `GET /api/profilux/export` consumes `ProfiLuxResolved` directly, unmasked. `masked_fields` (§16) and §16A apply to client/share surfaces only, never private export.

The visual placeholder currently rendered in the LEFT SPINE of the View tab at `app/dashboard/candidate/profilux/page.tsx` is doctrinally MISPLACED. Cleanup of the View placeholder is still parked (§13 deferred item: View "Download PDF" placeholder removal).

### 19A.3 — Out of scope of this doctrine lock

C6.1 is doctrine lock only. The following are deferred:

- No `/api/resume/[slug]` retirement (resume extinction reconciliation is a future slice, not C6.1).
- No View "Download PDF" placeholder removal.
- No B39 closure dependency work.

### 19A.4 — Cross-references

- §2 ProfiLux is a living object
- §7 Projection contract by surface
- §10 Implementation utilities (`resolveProfiLux`, `projectFor`)
- §13 Deferred items (private PDF SHIPPED v1.11; resume extinction, View placeholder still deferred)
- §19 Settings doctrine
- §19B RGPD machine-readable export (data-portability sibling)
- §22 Section catalog (View is not the export host)

---

## 19B. RGPD machine-readable export doctrine (locked May 17 2026, B.3.4)

§19A locks the *rendered* ProfiLux export — a curated PDF/print artifact. §19B locks the *machine-readable* export — RGPD-style data portability. The two are distinct surfaces with distinct contracts and must not collapse into one.

### 19B.1 — Contract

- **Format:** JSON only in v1. No CSV, no ZIP, no XML, no per-table file split.
- **Endpoint:** `GET /api/members/export` (force-dynamic). Auth via NextAuth session; resolves member by session email.
- **Response:** `application/json` with `Content-Disposition: attachment; filename="joblux-data-export-<member_id>-<yyyy-mm-dd>.json"` and `Cache-Control: no-store`.
- **Soft-deleted accounts:** `410 Account not available for export`. The export contract treats tombstoned rows as gone for portability purposes; the persisted row exists for audit (§25), not for self-service retrieval.

### 19B.2 — Surface placement

The Download my data control lives on the candidate Settings page (`/dashboard/candidate/settings`) inside the DATA EXPORT card, between MATCHING CONSENT and DELETE ACCOUNT. View is not the export host (§22).

### 19B.3 — Table scope (16)

`members`, `work_experiences`, `education_records`, `member_languages`, `member_sectors`, `member_documents`, `cv_parse_history`, `share_links`, `share_views`, `nextauth_accounts`, `applications`, `contributions`, `contact_messages`, `brand_contributions`, `business_briefs`, `bloglux_articles`.

Sibling tables are queried by `member_id`; `brand_contributions` is queried by `user_id`; `business_briefs` by `created_by`; `bloglux_articles` by `author_id`; `share_views` is fetched via `share_link_id IN (...)` after `share_links` resolves.

### 19B.4 — Redactions and exclusions

- **`members.notes`** — excluded entirely. Operational/admin field, not the subject's personal data.
- **`share_links.password_hash` / `password_salt`** — removed; `has_password: boolean` added in their place.
- **`nextauth_accounts.access_token` / `refresh_token` / `id_token` / `session_state`** — set to `null`. Provider-side credentials, not portable user data.
- **`brand_contributions.admin_notes`** — removed. Internal moderation surface.
- **`business_briefs.admin_notes`** — excluded (admin operational data).
- **`bloglux_articles.admin_notes`** — excluded (admin operational data).

No other fields are redacted in v1. If a future field is added that contains operational/admin content, it must be added to this list before being merged.

### 19B.5 — Role-conditional tables (shipped B.3.4.1, May 17 2026)

`business_briefs` (FK `created_by`) and `bloglux_articles` (FK `author_id`) export by default. The B.3.4 v1 deferral is closed: both tables ship verbatim with `admin_notes` redacted symmetric to §19B.4. Empty arrays return for members who never authored a brief or an article; no role gating is applied at the endpoint — RGPD scope is identity-driven, not role-driven.

### 19B.6 — Operational audit

The endpoint console-logs `{ member_id, email, exported_at }` on success. **No audit table** in v1. The console-log is the only record. Audit-table substrate is a forward dependency, not part of B.3.4.

### 19B.7 — Out of scope (deferred)

- Subject-access deletion confirmation receipts — separate slice.
- CV file bytes — not re-bundled in the export; original uploads remain reachable via the View tab and storage URLs already in the payload.

### 19B.8 — Distinction from §19A

§19A produces a *human-readable* artifact (the rendered ProfiLux). §19B produces a *machine-readable* archive (the full personal-data graph). One is presentation; the other is portability. Code, copy, and UI surfaces must keep them separate.

### 19B.9 — Cross-references

- §13 Deferred items — RGPD export row is now SHIPPED.
- §19 Settings doctrine
- §19A Rendered ProfiLux export
- §25.9 RGPD-adjacent obligations (machine-readable export reference)

---

## 20. Matching entry doctrine

### 20.1 — Replaces M6 admission

Per §8 rewrite, M6 user-facing admission is retired. Matching entry is the new readiness signal — backend-only.

### 20.2 — Two conditions

A candidate enters matching when BOTH:

1. **Core fields complete** (identity + current role + ≥1 experience + availability + work_authorization + notice_period — last two from Tier 1, currently parked)
2. **Explicit user consent toggle** (future field, NOT derived from `availability` by default)

### 20.3 — Until Tier 1 lands

Matching entry cannot be fully wired without Tier 1 fields (§15.2). Until Tier 1 schema lands, matching is gated externally (recruiter manually selects candidates).

### 20.4 — No threshold percentage

There is no "X% complete" admission gate. There is no "Confirm my ProfiLux" button. The user grows the profile continuously; matching enters automatically when conditions hold.

### 20.5 — Consent field (shipped, B.3.3)

Consent is a dedicated `members.*` column, never derived from `availability`.

**Storage (locked):**
- Column: `members.matching_opt_in`
- Type: `BOOLEAN NOT NULL DEFAULT false`
- DDL applied via Supabase MCP. Ledger: `047b1364-59b4-48c1-a47f-51ce94c78fd0`.

**Write contract:**
- `POST /api/profilux` accepts `matching_opt_in` as a boolean. Non-boolean values coerce to `null` so the NOT NULL constraint rejects malformed writes rather than silently flipping to `false`.
- Partial-body writes follow §4.5 W2 (column written only when the key is explicitly present).

**Surface exposure:**
- `ProfiLuxResolved.matching_opt_in: boolean` — populated by `resolveProfiLux`.
- `EditorView.matching_opt_in: boolean` — populated by `projectFor('editor')`.
- `projectFor('public' | 'client' | 'admin' | 'ats' | 'dashboard')` — flag intentionally omitted; recruiter-facing surfaces must read it via the editor projection or a future explicit consumer contract.

**UI:**
- Settings page (`/dashboard/candidate/settings`) renders the live toggle. Default is OFF (per column default); the user owns the flip.

### 20.x — Shipped posture (locked May 17 2026, B.3.3)

This subsection moves from PROVISIONAL to SHIPPED. §20.5 locks the column; §20.x locks consumer behavior.

**Locked separations:**
- `availability` = candidate self-description, NEVER consent. `availability` accepts legacy / normalized values that currently resolve into `active` / `open` / `passive` / `unavailable` UI states. No surface may read it as opt-in.
- `matching_opt_in` = explicit user consent. Single source of truth for matching exposure.

**Consumer rule (locked, applies to all future surfaces):**
Recruiter, ATS, and matching surfaces MUST gate visibility on `members.matching_opt_in === true`. A record with `matching_opt_in = false` (or any soft-deleted record per §25) is invisible to matching consumers regardless of `availability`, `profile_completeness`, or any other readiness signal.

**View tab caption:**
The previously-flagged *"Visible to JOBLUX matching only"* caption was removed by MLV-2. No caption work is owed by this slice.

**Out of scope:**
- No threshold percentage gate (§20.4 still applies).
- No derived consent from availability (§20.5 lock).
- Tier 1 schema (work_authorization, notice_period) remains parked per §20.2.

---

## 21. View / Edit / Manage triad

The ProfiLux UX runs on three named modes. The user is always in one and only one.

### 21.1 — View mode (default landing)

The candidate's passport. The default state on `/dashboard/candidate/profilux`. Renders the living ProfiLux as a curated read view with state markers (§14.3) and entry affordances into Edit drawers.

**Belongs in View:** identity strip (§24.6), section cards (§22, §24.1), completeness signal, sidebar readiness breakdown, drawer triggers.

**Does NOT belong in View:** wholesale editing forms, sharing/export controls, admin-only fields, privacy toggles.

### 21.2 — Edit mode (per-section drawer)

Section-scoped, never page-scoped. Triggered from any section card. There is no global edit toggle.

Edit mode honors §4.5 W1/W2/W3 and §14.2 inline/drawer/modal hierarchy. Belongs: drawer content for the active section only, inline editors where the field IS the affordance, validation, save state, dirty tracking, AI-inferred confirm/dismiss (§14.3).

**Does NOT belong in Edit:** sharing controls, maskable toggles, account preferences, destructive actions (those use modals per §14.2).

### 21.3 — Manage mode (configuration scope)

Configuration of how the ProfiLux is exposed and shared, distinct from authoring its content.

Belongs: public URL activation (§18), maskable field toggles (§16), export controls (§19.1), account preferences.

**Does NOT belong in Manage:** authoring of profile content (Edit only).

Manage and the §19 Settings surface refer to the same conceptual surface. Whether they render as one page or as a tab in the passport is an implementation decision deferred to the Settings slice (§13: Settings page).

### 21.4 — Transitions

- **View → Edit:** section-scoped, opens drawer.
- **Edit → View:** drawer dismiss (saved or cancelled).
- **View → Manage:** navigation affordance (location TBD per implementation).
- **Manage → View:** back navigation.
- **No persistent global edit mode.** The user is never in "edit-everything-at-once" state.

### 21.5 — Mental model

The user is **always in View**. Edit is a transient drawer. Manage is a separate surface. The passport is the home.

---

## 22. Section catalog

The passport renders 9 default sections in fixed order, plus up to 8 opt-in sections from a credibility library.

### 22.1 — Default sections (live composition, post-V12 + post-S-B.2C)

**Reconciliation status (2026-05-14):** §22.1 is rewritten to match the live V12 View composition locked at commit `9dabff1` (May 11 2026) and the S-B education truth surface locked at commit `baeca3c` + migration `s_b_2c_drop_members_trio_education_columns` (May 13 2026). The "9 default sections" framing from v1.2 is reconciled below as: **Identity (rendered as LEFT SPINE, not as a ViewZone) + 7 ordered ViewZones on View + 2 Edit-only sections (Compensation, Clienteling)**. View renders 7 ViewZones; Edit renders 12 SectionCards (including 2 suggestion panels and 1 CV card that are operational, not doctrine sections). Public renders a fixed independent set of bands per `app/[slug]/page.tsx`.

Field assignments mirror §7.6.1 `EditorView` exactly. Grouping is locked here. **Per-surface ordering may diverge** (see §22.3); the table below reflects the View ordering and surfaces label drift across View, Edit, and MATRIX.

| # | MATRIX name | View live label | Edit live label | EditorView fields | View surface | Edit surface |
|---|---|---|---|---|---|---|
| 1 | Identity | (LEFT SPINE — not a ViewZone) | Identity | first_name, last_name, city, country, nationality, phone, headline, avatar_url, bio | LEFT SPINE | SectionCard + drawer |
| 2 | Current Position | Current Role | Current Position | job_title, current_employer, seniority, total_years_experience | ViewZone | SectionCard + drawer |
| 3 | Career History | Career Path | Career History | experiences[] (L2 `work_experiences` + L1 passthrough `cv_parsed_data.experiences[]`) | ViewZone | SectionCard + drawer |
| 4 | Education | Education | (no standalone Edit SectionCard) | education[] (L2 `education_records` + L1 passthrough `cv_parsed_data.education[]`) | ViewZone | Edit affordance is the S-B `cv_education_suggestions` panel only |
| 5 | Languages | Languages | Languages (read-only) | languages[] (L1 passthrough) | ViewZone | SectionCard, read-only until L2 language slice (ledger `1609e494`) |
| 6 | Expertise | Expertise | (split into 2 cards) | years_in_luxury, sectors, product_categories, expertise_tags, key_skills, market_knowledge | ViewZone (merged) | Edit splits into `Luxury Fit` + `Skills & Markets` SectionCards. Edit split intentional pending taxonomy review; NOT substrate-blocked. |
| 7 | Availability & Targets | Availability | Availability & Targets | availability, desired_locations, desired_departments, desired_contract_types, open_to_relocation, relocation_preferences | ViewZone | SectionCard + drawer |
| 8 | Maisons | Maisons | (no Edit SectionCard) | brands_worked_with | ViewZone, hide-when-empty | Edit-side authoring deferred pending maison taxonomy / normalization review |
| — | Clienteling | (Edit-only — no View ViewZone) | Clienteling | clienteling_experience, clienteling_description | absent | SectionCard + drawer |
| — | Compensation | (Edit-only — V12-violation-1 lock at `66f8cf3`) | Compensation | desired_salary_min, desired_salary_max, desired_salary_currency | absent | SectionCard + drawer |

**Lock anchors:**
- View order locked at commit `9dabff1` (V12 convergence pass).
- Compensation never in View — V12-violation-1 (commit `66f8cf3`).
- Clienteling not currently in View — live truth as of May 14 2026; no doctrine commitment to add.
- Identity is structurally separate from the ordered section catalog on View (LEFT SPINE).
- Education truth surface = `education_records` (S-B.2C).
- Languages remains L1 read-only on Edit until a dedicated L2 collection slice ships (parked under `1609e494`).
- `linkedin_url` is intentionally omitted from the Identity row per the LinkedIn doctrine lock (`docs/JOBLUX_STATE.md` DO NOT block, 2026-05-10): no LinkedIn in ProfiLux, no LinkedIn dependency on JOBLUX, applies to UI, write-path, display, prompt copy.
- The LEFT SPINE "Download PDF" affordance is governed by §19A "Export doctrine" (not §22). It is doctrinally misplaced and parked for cleanup per §19A.2.

**Edit drawer notes (preserved from v1.2):**

- **Row 6 (Expertise) — Edit kept split.** View renders one unified Expertise card with 6 sub-rows in order: Years in luxury → Sectors → Product categories → Areas of expertise → Skills → Markets. Edit keeps two SectionCards (`Luxury Fit`, `Skills & Markets`) and two POST shapes UNCHANGED. Edit split is a UX-density decision, NOT a substrate gate.

- **Row 5 (Languages) — Edit kept read-only.** View renders a Languages ViewZone. Edit renders a read-only Languages SectionCard inline. Edit drawer for Languages is parked pending L2 languages substrate migration (ledger `1609e494`).

- **Row 8 (Maisons) — no Edit drawer.** View renders a Maisons ViewZone sourced from `members.brands_worked_with`. Edit-side authoring deferred pending maison taxonomy / normalization review (controlled vocabulary, dedup, group-aware grouping — out of scope this slice). Empty behavior: hide entirely when `brands_worked_with` is empty.

- **Row 4 (Education) — no standalone Edit SectionCard.** View renders an Education ViewZone over `education_records` (L2) + L1 passthrough. Edit affordance is the S-B `cv_education_suggestions` panel only; manual L2 row Edit/Delete on Edit tab is not yet wired (asymmetric vs Career History, which has full L2 CRUD via `/api/profilux/experiences`).

### 22.2 — Add-library sections (canonical 8, locked v1.6)

The passport surfaces an "Add section" affordance opening an `EXTEND DOSSIER` drawer. The drawer renders 8 canonical library entries. Substrate for any library section is PARKED — Tier 2 schema (per §15.3) is not yet built; the UI renders all entries inert.

**Inert state (live):** every library row renders with `aria-disabled="true"`, `pointerEvents: 'none'`, `opacity: 0.4`, `userSelect: 'none'`. No click handler. No state hook. No API. No DB row. The drawer is a visual placeholder until Tier 2 schema lands.

**Canonical 8 (locked):**

| # | Canonical label | Key | Notes |
|---|---|---|---|
| 1 | Awards | `awards` | No substrate today. |
| 2 | Certifications | `certifications` | `members.certifications` exists as flat `text[]`; structured form requires Tier 2 substrate. |
| 3 | Portfolio | `portfolio` | No substrate today. |
| 4 | Strategic Initiatives | `strategic_initiatives` | Renamed from `Projects` (v1.6 canonicalization). Locked meaning: important launches, transformations, missions, entrepreneurial efforts, or notable initiatives with measurable impact. Avoids generic / startup ambiguity; works for employed, freelance, founder, and emerging profiles; no overlap with Awards. |
| 5 | Memberships | `memberships` | No substrate today. |
| 6 | Press & features | `press_features` | Label kept (drops `Publications /` prefix from prior doctrine). |
| 7 | References | `references` | Also in §16 maskable set; substrate decisions must align. |
| 8 | Internships | `internships` | KEPT — explicit surface-specific exception to STATE §1 kill-word doctrine. Rationale: Emerging-user (`rising` tier) early-career representation. Documented as exception, not doctrine reversal. Kill-word doctrine elsewhere on the platform unchanged. |

**Dropped from prior doctrine list:** `Speaking / events`, `Volunteer / board roles`. Not part of the canonical 8. Reopening either requires explicit Mo + GPT decision.

**Doctrine intent:** all 8 should eventually exist. The library is not aspirational drift; it is the locked end-state. Activation per section gated on Tier 2 substrate decisions.

**Substrate posture (forward dependency):** each library section requires either a new column on `members.*` or a relational table. The shape decision is per-section (column vs jsonb vs dedicated table), echoing the `1609e494` L2 collection pattern. Substrate decisions parked.

### 22.3 — Ordering rules (live truth + persistence status)

**Ordering source (live).** Section render order on every surface is hardcoded JSX position in the source files:

- **View tab:** order locked at V12 prototype sequence, commit `9dabff1` (May 11 2026). 7 ViewZones in fixed sequence (Current Role → Career Path → Education → Languages → Expertise → Availability → Maisons). Identity renders separately as the LEFT SPINE.
- **Edit tab:** JSX order in `app/dashboard/candidate/profilux/page.tsx`. NO doctrine anchor for Edit order — Edit ordering is implicit.
- **Public `/[slug]`:** JSX order in `app/[slug]/page.tsx`. Independent of View. NO doctrine anchor for Public order.

**Persistence status (live).** No section ordering persistence layer exists anywhere in the system:

- No `members.section_order` column. No `members.visible_sections` column.
- No dedicated `member_section_layout` table.
- No share / cookie / URL parameter encodes section order.
- No `localStorage` / `sessionStorage` reference in the candidate ProfiLux page.
- No React state hook stores section order.

Section order is recomputed every render from JSX file position only.

**Collapse state (related but not ordering).** A per-card collapse boolean (`viewCollapse`) exists in the View tab as in-memory React state. It is explicitly EPHEMERAL per Mo lock (A2.8 collapse pass): refresh resets to doctrine default. It is NOT a persistence precedent for any future ordering layer.

**Row-level `sort_order` (substrate adjacency).** The only `sort_order` column anywhere in the ProfiLux stack is `education_records.sort_order`. The resolver reads it (`ORDER BY sort_order ASC, graduation_year DESC NULLS LAST`); the apply path (`/api/profilux/suggestions/education`) never writes a non-default value (every row collides at 0). This is ROW-level ordering inside the Education collection, NOT section-level ordering. Flagged as observation `F-S-C-4`.

**Default-section reorder posture (locked v1.6).** Candidate section reorder is forbidden by doctrine. Section order is JOBLUX-controlled and fixed at the V12 sequence (`9dabff1`). Reopening requires an explicit Mo + GPT doctrine reversal slice.

**Add-library reorder posture (locked v1.6).** Add-library sections appear in their canonical §22.2 order. No user reorder.

**Candidate-facing ordering persistence (locked v1.6).** Section ordering persistence layer is NOT required for candidate-facing reorder. C8 prerequisites (persistence substrate, scope, per-surface contract) collapse for candidate-controlled order — there is no candidate-controlled order.

**Remaining forward dependency.** A canonical section identifier system (prerequisite 1 below) IS still required, but now scoped to §16A section-hide write path (which sections did the candidate hide?) and §22.2 library activation write path (which sections did the candidate add?). NOT for reorder.

**Prerequisites for any future reorder UX (DOCTRINE-LOCKED OUT).** A future section-reorder implementation would require:

1. **Canonical section identifier system.** Today the system has 5 parallel naming surfaces for section identity: MATRIX §22.1 names, `ViewCollapseKey` union (with 3 orphan keys per audit C2), `ADD_SECTION_LIBRARY` keys, parser `CvParsedNeedsReviewItem.section` enum, and parser `CvParsedConfidence` keys. None is canonical. None is shared across resolver / projector / UI.
2. **Persistence substrate decision.** Column on `members.*` vs dedicated `member_section_layout` table. Choice has follow-on implications: column = simpler, single row write; table = enables future per-section metadata and joins, but introduces another L2 collection (echoes parked `1609e494`).
3. **Scope decision.** Add-library reorder only, vs default-section reorder too. Default-section reorder requires the explicit doctrine reversal slice noted above.
4. **Per-surface contract.** Whether user-chosen order propagates from View to Edit and to Public; how Public masking (V1/V3/V4/V5/V7) interacts with user-chosen order.

None of these are resolved as of v1.3. Any reorder slice opens with these decisions first.

### 22.4 — Removable vs permanent

- **Permanent (cannot remove):** all 9 default sections.
- **Optional (8 library sections):** carry TWO distinct actions on their Edit card:
  - **Désactiver** — hides the section from the active visible surface. Data is
    retained server-side and the action is reversible (re-show restores it).
    Mechanism: section_visibility (§16A), now extended to optional keys.
  - **Remove** — permanently deletes the section AND its stored content
    (drop from activated_sections + clear the section's content column).
    Irreversible. A confirmation is required before the destructive write.
  The two actions are never collapsed into one control and are not drawer-only.
- Empty default sections are visible but render an empty state with state markers per §14.3.

### 22.5 — Expansion philosophy

The passport grows by adding sections from the library, not by exploding default sections into more screens. New canonical fields land in a default section (Tier 0/1) or as an add-library section (Tier 2).

---

## 23. Responsive philosophy

### 23.1 — Desktop (primary)

- Identity strip top-fixed.
- Section cards flow as single-column or two-column grid (decision deferred to implementation slice).
- Drawer slides from right (recommendation, not locked).
- Sidebar readiness breakdown visible per §14 + §21.1.

### 23.2 — Mobile

- Identity strip top-fixed.
- Section cards stack single-column.
- Drawer occupies full viewport height.
- Sidebar collapsed into a top-accessible panel or moved into Manage.

### 23.3 — Card stacking

- Default 9 stack first, in §22.1 order.
- Add-library sections stack after, in user-chosen order or fixed order (decision deferred).

### 23.4 — Drawer behavior on mobile

- Drawer occupies full viewport.
- Back affordance returns to passport without losing scroll position.
- Save dismisses drawer; passport reflects new state.

### 23.5 — Information hierarchy on small viewports

- Identity → Current Position → Luxury Fit are the highest-priority mobile hierarchy.
- Other sections accessible by scroll.
- Completeness signal always visible.

### 23.6 — Density priorities

- Mobile: collapsed cards by default.
- Desktop: mixed (collapsed for filled sections, expanded for empty-state sections — recommendation).

---

## 24. Component family strategy

Family-level only. No specific component names locked. Implementation slices choose the names.

### 24.1 — Section card family

Collapsed/expanded card primitive consumed by all 9 default sections (§22.1) and all 8 add-library sections (§22.2) when they ship. Card title = section name. Card body = section content (collapsed summary or expanded fields). Card affordance = drawer trigger (§24.2). Default density per card per §23.6.

### 24.2 — Drawer family

Section editing drawer with consistent open / dismiss / save behavior. One drawer per section. Drawer is overlay, not navigation. Honors §4.5 W1/W2/W3 on POST. Honors §14.2 hierarchy: drawer for rich object editing; inline edit allowed only when the field IS the affordance; modal reserved for destructive actions only.

### 24.3 — State marker family

Visual primitives for the three §14.3 markers: Missing, Review, AI inferred. Subtle visual cues only — gold border/glow per MODEL §4. **Markers MUST NOT block save, MUST NOT prevent matching, MUST NOT escalate into modals or banners, MUST NOT change page layout.** Per §14.3 + §20.4: markers are not admission gates.

### 24.4 — Chip multi-toggle family

Stable pattern from current Phase 4.A screens 4, 7, 9. Reusable across drawers for any multi-select chip group consuming `lib/profilux/vocabulary.ts`.

### 24.5 — Tri-state Yes/No family

Stable pattern from current Phase 4.A screens 8 (clienteling) and 9 (open_to_relocation). Reusable across drawers. Includes the locked clear-on-transition rule: toggling out of `true` clears any conditional textarea (e.g. `clienteling_description`, `relocation_preferences`).

### 24.6 — Identity strip family

Top-fixed presence card for the passport. Renders identity-tier fields (§22.1 row 1) as a header strip. Persistent across scroll (per §23 desktop + mobile).

### 24.7 — What MUST remain centralized (cross-reference)

Per §10 + §10.1: `resolveProfiLux`, `projectFor`, `computeProfileCompleteness`, `computeM6Eligible`, `lib/profilux/vocabulary.ts`. UI families above consume these utilities; they do not duplicate or bypass them.

---

*End of PROFILUX_MATRIX_V1.md (v1.2 — May 7 UX promotion addendum)*


---

## 25. Member lifecycle

### 25.1 — Lifecycle states

A member exists in one of three operational states:

| State | Meaning |
|---|---|
| Active | Normal operational account |
| Soft-deleted | Hidden from operational surfaces but row retained |
| Purged | Hard-erased through exceptional legal/operator escalation |

Soft-delete is the operational default. Purge is exceptional.

### 25.2 — Soft-delete doctrine

Deletion requests do NOT hard-delete the `members` row in normal operation.

Soft-delete means:
- `deleted_at` timestamp set
- operational projections suppressed
- authentication blocked
- recruiter/admin operational surfaces hide the member by default

The row remains retained for audit, contribution integrity, legal traceability, and future restoration.

### 25.3 — Resolver cascade

`resolveProfiLux(memberId)` MUST refuse projection resolution for soft-deleted members across:
- dashboard
- editor
- public
- admin operational lists
- ATS
- client share

No projection should accidentally leak a soft-deleted member through surface-specific direct reads.

### 25.4 — Public/share suppression

Soft-delete immediately suppresses:
- public `/p/[slug]`
- active sharing links
- recruiter/client share artifacts

Public identity exposure must terminate immediately at deletion time.

### 25.5 — Audit trail preservation

Soft-delete preserves:
- contribution history
- operational audit trails
- recruiting history
- intelligence lineage
- LuxAI historical references where legally permitted

Deletion does not rewrite historical operational events.

### 25.6 — Re-registration posture

Email uniqueness operates only on active members.

Future substrate uses a partial unique index:
`WHERE deleted_at IS NULL`

Re-registration after deletion creates a NEW member identity. Restoration restores the original row. These are distinct operations.

### 25.7 — Restoration posture

Restoration is row-level restoration of the original member identity.

Restoration:
- clears lifecycle suppression
- restores projection visibility
- restores operational continuity

Restoration is operator-controlled.

### 25.8 — Erasure posture

Erasure ("right to be forgotten"): erasure requests are handled by soft-delete as the operational default, with hard purge reserved for explicit legal/operator escalation when required.

### 25.9 — RGPD-adjacent obligations

Export/delete obligations map to:
- export endpoint → §19B (machine-readable export, SHIPPED B.3.4)
- soft-delete substrate → B.3.1b
- purge workflow → future legal escalation flow

Machine-readable export is shipped; see §19B for the contract, scope, and redactions.

### 25.10 — Forward dependencies

This doctrine intentionally precedes substrate.

Future implementation slices:
- B.3.1b → DB substrate (`deleted_at`, partial unique index)
- B.3.3 → matching consent storage (`matching_opt_in`) — SHIPPED
- B.3.4 → machine-readable export endpoint — SHIPPED
- B.3.4.1 → `business_briefs` + `bloglux_articles` export scope (deferred)

No new code or schema is introduced by §25 itself.

---

## 26. Section visibility & sovereignty doctrine (locked 2026-05-23)

Consolidates the candidate's control over what sections exist on their ProfiLux and what is exposed outbound. Supersedes the scope framing of §16A (which remains valid for field-level mechanics) and formalizes the two distinct substrates already shipped. No DB change — this locks meaning, not storage.

### 26.1 — Core vs optional sections

- **Core sections** are the permanent ProfiLux spine. They always belong to the object; the candidate cannot remove them. (Per §22.4: the default sections.) Outbound exposure governed by `section_visibility` (§26.4/§26.5).
- **Optional sections** are candidate-added sections from the §22.2 library. They exist on the passport only when the candidate adds them. Substrate: `members.activated_sections text[]`.

These two are intentionally separate substrates (`section_visibility` jsonb for core hide/show; `activated_sections` text[] for optional add/remove). "Unify" means UX coherence only — never a DB merge. (STATE lock, 2026-05-22.)

### 26.2 — Visibility actions never delete data

No visibility or removal action is destructive. Hiding a core section, or removing an optional section, ALWAYS retains the underlying field data server-side. Content deletion is a separate, explicit act performed inside a section's drawer (row-level delete), never a side-effect of a visibility toggle or a section removal.

- Core hide (`section_visibility[id]=false`): data untouched, section withheld from outbound surfaces only.
- Optional remove (drop key from `activated_sections`): section returns to the library and is re-addable; its data remains in `members.*` until explicitly deleted in the drawer. (Shipped G1, commit `190c44d`, keep-data proven.)

### 26.3 — Candidate owns outbound visibility

Visibility and removal are candidate-only actions. The system MAY suggest (e.g. "this section is empty — add content or hide it") but never auto-hides or auto-removes. Admin/operator surfaces never silently alter candidate visibility; they read full data through their own projection (§7) and do not write the candidate's visibility state.

### 26.4 — Cockpit rule: the candidate never hides data from themselves

The candidate's own AUTHENTICATED View and Edit surfaces (at `/dashboard/candidate/profilux`) are the cockpit. They render the full ProfiLux — including hidden core sections and added optional sections — regardless of outbound visibility state. A core section set to `section_visibility=false` still renders in the candidate's own authenticated View/Edit; it is only withheld from the outbound public/share/client surfaces. The public `/[slug]` surface is NOT the cockpit — it is an outbound projection and honors visibility/masking per §26.5. (This confirms the authenticated-View-shows-everything behavior is correct, not a leak.)

### 26.5 — Outbound surfaces honor visibility and masking

`public` (`/[slug]`), share, and `client` projections honor:
- `section_visibility` (§16A) — whole-section hide
- `masked_fields` (§16) — field-level hide

Admin/operator surfaces (`admin`, `ats`) always retain full access to the underlying data through their own projection paths (per §16A.2 + §7.3); candidate visibility settings do not narrow what operators see. Outbound client/public/share surfaces honor candidate visibility and masking settings. The candidate's control is over OUTBOUND exposure, not over what JOBLUX retains or what operators can access internally.

### 26.6 — Canonical vocabulary (locked)

The candidate-facing surfaces and all copy MUST use exactly these terms; the words are not interchangeable:

| State | Phrase | Mechanism |
|---|---|---|
| Core section shown outbound | "Visible on shared profile" | `section_visibility[id]=true` |
| Core section withheld outbound | "Hidden from shared profile" | `section_visibility[id]=false` |
| Optional section taken off passport | "Removed from my passport" | dropped from `activated_sections` |
| Optional section hidden from active surface | "Désactiver" | `section_visibility[key]=false` |
| Optional section permanently deleted | "Remove" | dropped from `activated_sections` + content column cleared |

Forbidden (CORE sections): using "inactive" and "hidden" interchangeably; implying deletion when hiding a core section. The "deactivate" prohibition applies to CORE sections only.
OPTIONAL sections (Mo decision 2026-05-24): "Désactiver" is the authorized candidate-facing label for the hide action, and "Remove" is the authorized label for permanent deletion. These are two distinct actions, never interchangeable.

### 26.7 — G2 disposition (Edit-tab presentation)

A core section set to "Hidden from shared profile" MUST remain fully editable in Edit, rendered with a dim/marked treatment + the literal label "Hidden from shared profile". This is presentation only on the existing `section_visibility=false` state — no new substrate, no DB change.

The dim treatment is a SOVEREIGNTY INDICATOR, not an error or incompleteness state. It MUST NOT: reduce legibility of the section's content, read as "disabled" or "error", or resemble an unfilled/incomplete field. "Hidden from shared profile" is a deliberate candidate choice, visually distinct from "Missing" / "Review" markers (§14.3) and from any error state. (This is the scope boundary for the future G2 slice.)

### 26.8 — Status

Doctrine locked. Substrate already shipped (`section_visibility`, `activated_sections`, `masked_fields`). G2 dim/label treatment is the only remaining presentation slice and is unblocked by this lock. Operational feedback (toggles, activation) uses brand-green `#1D9E75`, never gold (STATE design lock).

