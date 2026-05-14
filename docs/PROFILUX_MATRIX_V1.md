# PROFILUX MATRIX V1

Domain contract for the ProfiLux object across JOBLUX. Locks the storage, resolution, projection, and admission rules so every surface and every route operates against the same target.

This document is **subordinate** to `docs/JOBLUX_STATE.md`. On conflict, STATE wins until reconciled. See §12.

**Status:** locked v1.2 (May 7 UX promotion addendum)
**Originally locked:** April 30, 2026
**v1.1 addendum locked:** May 6, 2026
**v1.2 addendum locked:** May 7, 2026
**Maintained by:** Claude AI (Opus) · JOBLUX Ops

---

## CHANGE LOG

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
| PDF library + render template | Selection of PDF generator (none in deps today) + template for the ProfiLux private snapshot (see §19A Q2). Doctrine locked at §19A; infra deferred. | When candidate self-export ships |
| Resume extinction reconciliation | Retire `/api/resume/[slug]` route + retire planned `members.resume_*` columns + retire `resume_slug` slug space. All identified as fossil from a prior "Resume product" direction (see §19A.3). | After §19A doctrine lands; not in C6.1 |
| `profilux` ghost-table cleanup | The standalone `profilux` table contains 17 legacy columns beyond `share_slug` + `sharing_enabled`. Tracked at ledger `6aef236e`. Doctrine drift vs §9; substrate cleanup deferred. | Together with Manage tab A2 sharing UX rebuild |
| View "Download PDF" placeholder removal | The LEFT SPINE row in `app/dashboard/candidate/profilux/page.tsx` is doctrinally misplaced per §19A.2. Cleanup deferred until Manage-side export control ships. | When candidate self-export ships in Manage / Settings |

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

Per-field user-controllable visibility flags. The candidate decides which fields appear in public/client share projections, beyond the deterministic surface masks of §7.3.

### 16.2 — Maskable fields (per MODEL §5)

- `current_employer`
- `desired_salary_min`, `desired_salary_max`, `desired_salary_currency`
- `availability`
- `phone`
- references (Tier 2)

### 16.3 — Distinct from §7 surface masks

§7.3 masks are deterministic per surface (e.g. `phone` always hidden in `public` and `client`). §16 maskable flags are user-controlled and additive — they can hide fields that §7.3 would otherwise show.

### 16.4 — Status

Schema and projection changes PARKED. Doctrine only.

### 16.5 — Future projection contract

When schema lands, `public` and `client` projections will honor maskable flags by replacing the masked field with `null` before serialization. Resolver and EditorView remain unchanged (the maskable flag is a projection-time concern, not a storage-time one).

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

The visual placeholder currently rendered in the LEFT SPINE of the View tab at `app/dashboard/candidate/profilux/page.tsx` is doctrinally MISPLACED. Cleanup of the View placeholder is NOT in scope of this slice and will be addressed when the Manage-side export control ships (§13 deferred item: View "Download PDF" placeholder removal).

### 19A.3 — Out of scope of this doctrine lock

C6.1 is doctrine lock only. The following are deferred:

- No PDF library decision.
- No render template.
- No `/api/resume/[slug]` retirement (resume extinction reconciliation is a future slice, not C6.1).
- No `profilux` ghost-table cleanup (tracked at ledger `6aef236e`).
- No View "Download PDF" placeholder removal.
- No B39 closure dependency work.

### 19A.4 — Cross-references

- §2 ProfiLux is a living object
- §7 Projection contract by surface
- §10 Implementation utilities (`resolveProfiLux`, `projectFor`)
- §13 Deferred items (PDF library, resume extinction, `profilux` retire, View placeholder)
- §19 Settings doctrine
- §22 Section catalog (View is not the export host)

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

### 20.5 — Consent field (future)

Do not derive consent from availability without a future explicit Mo decision. Consent is a NEW dedicated field. Column name and DB type are deferred. Schema decision part of Tier 1 work.

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

### 22.2 — Add-library sections (DOCTRINE vs LIVE — drift surfaced, parked)

The passport surfaces an "Add section" affordance opening an `EXTEND DOSSIER` drawer. The drawer renders 8 library entries. Substrate for any library section is PARKED — Tier 2 schema (per §15.3) is not yet built; the UI renders all entries inert.

**Inert state (live):** every library row renders with `aria-disabled="true"`, `pointerEvents: 'none'`, `opacity: 0.4`, `userSelect: 'none'`. No click handler. No state hook. No API. No DB row. The drawer is a visual placeholder until Tier 2 schema lands.

**Drift status:** the doctrine list (this section) and the live `ADD_SECTION_LIBRARY` array (in `app/dashboard/candidate/profilux/page.tsx`) are NOT in sync. Reconciliation is parked and is part of the add-library activation slice, not this one.

| MATRIX doctrine (v1.2) | LIVE `ADD_SECTION_LIBRARY` (current UI) | Drift |
|---|---|---|
| Certifications (structured) | Certifications (`certifications`) | name match; substrate mismatch — flat `members.certifications: string[]` exists today; "structured" form parked |
| Awards | Awards (`awards`) | match; no substrate |
| References | References (`references`) | match; no substrate |
| Portfolio | Portfolio (`portfolio`) | match; no substrate |
| Publications / press features | Press & features (`press_features`) | **label drift** |
| Memberships | Memberships (`memberships`) | match; no substrate |
| Speaking / events | (not in UI) | **missing from UI** |
| Volunteer / board roles | (not in UI) | **missing from UI** |
| (not in doctrine) | Projects (`projects`) | **extra in UI** |
| (not in doctrine) | Internships (`internships`) | **extra in UI; conflicts with STATE §1 kill-word list (`internships`)** |

**Decision posture (locked 2026-05-14):**

- The above table is the canonical drift inventory. Doctrine list and UI list are BOTH preserved here side-by-side. Neither list is promoted to canonical.
- Reconciliation deferred to a dedicated add-library activation slice, which will resolve:
  1. Canonical 8-item set (doctrine vs UI vs new).
  2. Per-section Tier 2 substrate (column vs relational table).
  3. STATE §1 kill-word reconciliation for `Internships`.
  4. `Publications / press features` vs `Press & features` label pick.
- Until that slice ships, the live UI library remains inert and the drift remains documented here.

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

**Default-section reorder posture.** Default sections cannot be reordered by the user. View order is locked at the V12 sequence (`9dabff1`). Reordering View sections requires an explicit doctrine reversal slice per `JOBLUX_STATE.md` DO NOT block.

**Add-library reorder posture.** Add-library sections are inert per §22.2; ordering decision is deferred to the add-library activation slice.

**Prerequisites for any future reorder UX.** A future section-reorder implementation must, BEFORE writing code, resolve all of:

1. **Canonical section identifier system.** Today the system has 5 parallel naming surfaces for section identity: MATRIX §22.1 names, `ViewCollapseKey` union (with 3 orphan keys per audit C2), `ADD_SECTION_LIBRARY` keys, parser `CvParsedNeedsReviewItem.section` enum, and parser `CvParsedConfidence` keys. None is canonical. None is shared across resolver / projector / UI.
2. **Persistence substrate decision.** Column on `members.*` vs dedicated `member_section_layout` table. Choice has follow-on implications: column = simpler, single row write; table = enables future per-section metadata and joins, but introduces another L2 collection (echoes parked `1609e494`).
3. **Scope decision.** Add-library reorder only, vs default-section reorder too. Default-section reorder requires the explicit doctrine reversal slice noted above.
4. **Per-surface contract.** Whether user-chosen order propagates from View to Edit and to Public; how Public masking (V1/V3/V4/V5/V7) interacts with user-chosen order.

None of these are resolved as of v1.3. Any reorder slice opens with these decisions first.

### 22.4 — Removable vs permanent

- **Permanent (cannot remove):** all 9 default sections.
- **Removable (opt-in/out):** all 8 add-library sections.
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
