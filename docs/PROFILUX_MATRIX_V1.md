# PROFILUX MATRIX V1

Domain contract for the ProfiLux object across JOBLUX. Locks the storage, resolution, projection, and admission rules so every surface and every route operates against the same target.

This document is **subordinate** to `docs/JOBLUX_STATE.md`. On conflict, STATE wins until reconciled. See §12.

**Status:** locked v1
**Locked:** April 30, 2026
**Maintained by:** Claude AI (Opus) · JOBLUX Ops

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

**ProfiLux is** the canonical professional object representing a candidate inside JOBLUX. It is the unified object across:

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
| `education[]` | `university`, `field_of_study`, `graduation_year` | first record mappable to flat columns |

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

`linkedin_url` is a secondary field: optional, never M6-required, never central. It is:

- present in editor / admin / ATS (when non-empty)
- hidden in dashboard / public / client share by default
- stored on `members.linkedin_url`, no L1 source (CV parse does not extract it)

The same pattern applies to any future field that is utilitarian-but-doctrine-sensitive: list it in §7.3 with the appropriate mask, do not give it a dedicated section.

### 7.5 Public vs client share are distinct contracts

`/p/[name]` and client share may visually overlap but are governed by **different masks and different ownership**:

- **Public (`/p/[name]`)**: candidate-controlled, candidate's outbound link, premium feel
- **Client share**: JOBLUX-controlled, recruiter-curated, opportunity-bound

They are not the same projection. Future product decisions may diverge them further.

---

## 8. M6 eligibility and confirmation

Two distinct concepts. Do not conflate.

### 8.1 M6-eligible (computed)

```
computeM6Eligible(view: ProfiLuxResolved): boolean
```

Computed from the resolved view (§6). L1 fills NULL gaps, so L1-only fields satisfy eligibility checks. Not cached; cheap to recompute on demand.

Used by:

- editor surface — to enable/disable the "Confirm my ProfiLux" button
- admin surface — to display M6 status

### 8.2 M6-eligible field-by-field minimum

| # | Group | Required | Rule |
|---|---|---|---|
| 1 | Identity | `first_name`, `last_name`, `city`, `country` | all 4 non-empty |
| 2 | Professional position | `job_title`, `current_employer`, `seniority`, `total_years_experience` | all 4 non-empty |
| 3 | Luxury relevance | `years_in_luxury`, ≥1 sector, ≥1 of (`product_categories` or `expertise_tags`) | all 3 conditions |
| 4 | Experience | ≥1 work experience with both `company` AND `job_title` | from L1 `cv_parsed_data.experiences[]` (no L2 flat table v1) |
| 5 | Availability | `availability` non-empty, ≥1 of (`desired_locations` / `desired_departments` / `desired_contract_types`) | both conditions |
| 6 | CV | `cv_url` non-empty | upload itself counts; parse success is bonus, not blocker |

**Out of M6 v1:** `phone` (optional at admission, required at readiness per STATE §24), education detail beyond presence, salary expectations, photo, portfolio, references, sharing settings.

### 8.3 M6-confirmed (user action)

`members.m6_confirmed_at` is set ONLY by the candidate clicking "Confirm my ProfiLux" in the editor surface, AND ONLY when `computeM6Eligible(view)` returns true.

**Never auto-set** from parse presence or computed eligibility alone.
**Never auto-cleared** in v1 if fields later become incomplete. Regression behavior deferred to v2 (§13).

### 8.4 Read paths

- "Is this candidate ready for admin review?" → `m6_confirmed_at IS NOT NULL`
- "Should the editor show the confirm button?" → `computeM6Eligible(view) === true`
- "Is this candidate fully ready for client submission?" → readiness threshold (post-M6, deferred)

---

## 9. Frozen-out tables / not v1

The following tables exist in the schema but are **not used as profile sources in v1**. Their state is preserved but no read or write path may treat them as authoritative.

| Table | Rows (Apr 30) | Status v1 | Notes |
|---|---|---|---|
| `candidate_profiles` | 0 | dormant | Empty, FK'd, overlaps `members.*`. Deprecation flagged for cleanup session. |
| `profilux` (standalone) | 3 | dormant | No FK to members. 3 test rows. NOT source of truth for ProfiLux Matrix v1. Retirement flagged. |
| `work_experiences` | 0 | dormant | Empty, FK'd, CASCADE. Will be the long-term L2 store for experiences (post-v1). |
| `education_records` | 0 | dormant | Empty, FK'd, CASCADE. Same trajectory. |
| `member_languages` | 0 | dormant | Empty, FK'd, CASCADE. Same trajectory. |
| `member_sectors` | 0 | dormant | Empty, FK'd, CASCADE. Same trajectory. |

**Why dormant, not deleted:**
- The DB already has multiple parallel candidate stores. v1 stabilizes the live `members`-based path before introducing migrations.
- These tables represent the long-term direction (relational L2). Their existence is fine; their use is deferred.

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
- **No `m6_confirmed_at` auto-clear.** Once confirmed, stays confirmed in v1. Regression UX deferred.
- **No client-side resolver.** Surfaces never resolve. They consume.
- **No schema migration in this spec.** Every column referenced exists today.
- **No use of `profilux` standalone table or `candidate_profiles` as profile source.**

### 11.2 Non-goals

- v1 does not implement re-parse versioning. CVs overwrite.
- v1 does not implement M6 regression detection.
- v1 does not migrate to relational `work_experiences` / `education_records` / `member_languages` / `member_sectors`.
- v1 does not retire the `profilux` standalone table.
- v1 does not unify `/p/[name]` and client share.
- v1 does not extract LinkedIn URL or other non-CV signals into L1.

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

The following items are intentionally out of v1. Each is a known future ticket, not a gap.

| Item | What it is | Trigger to revisit |
|---|---|---|
| `cv_parse_history` table | Per-parse archive for diff/audit | When recruiting/legal compliance requires CV parse provenance |
| Per-field confirmation flags (`l2_confirmed_fields`) | Replace Rule A NULL-as-empty inference | When cv-parse begins writing directly to L2, or when "user confirmed" needs explicit tracking |
| M6 regression behavior | What happens when an M6-confirmed profile loses a required field | When the editor allows clearing required fields, or when admin needs regression alerts |
| Relational L2 migration | Move sectors, languages, experiences, education to dedicated child tables | When the editor needs multi-row editing for those entities |
| `candidate_profiles` cleanup | Drop or repurpose the empty-but-FK'd table | Deprecation session post-v1 |
| `profilux` standalone retirement | Remove the 3-row standalone table | Deprecation session post-v1 |
| Richer client share controls | Recruiter-side toggles, expiry, watermarks, view tracking | When client-share surface is built out |
| LinkedIn URL extraction in L1 | Parse `linkedin_url` from CV header | If/when product reverses the kill-word stance for utility |
| Anthropic Files API native PDF | Replace pdf-parse with native PDF input to Haiku | Per F-pdfparse-anthropic-files in STATE |
| Readiness threshold | Post-M6, threshold for client submission (phone required, etc.) | When client submission flow is built |

---

*End of PROFILUX_MATRIX_V1.md*
