# JOBLUX HANDOFF — 2026-05-12 PM (Opus)

**Mode:** contract closure (V12 UI convergence paused)
**Session focus:** C1 family S-B — Education collection-shaped resolution

---

## SHIPPED (4 slices)

- **`e6bbca0`** S-B.0 foundation plumbing — DB widen + types extension. Migration `s_b_0_widen_education_records_optional_fields` flipped `education_records.degree_level` + `field_of_study` to nullable (`institution` stays NOT NULL). `CvParsedDataResolutionState` gained optional `education` branch (`Record<string, CvParsedDataResolutionEducationItem>`) + sibling type. Zero behavior change.
- **`ea9a997`** S-B.1A resolver merge + `degree_level` reconciliation. Resolver SELECTs `education_records`; `view.education = [...L2, ...L1]` mirroring experiences pattern `351421f`. `ResolvedEducation` gained `id?` + `degree_level`; `CvParsedEducation` reconciled with live zod (adds `degree_level`, keeps legacy `degree` for admin route backward-compat). `mapEducation` emits real `degree_level` from L1. Sort: `sort_order ASC, graduation_year DESC NULLS LAST`. Zero production behavior change (education_records empty, no writer yet).
- **`7e96360`** S-B.1B.1 hash helper + `cv_education_suggestions` predicate. New `lib/profilux/educationSignature.ts` exports `computeEducationSignature` (sha256 over `institution|field_of_study|graduation_year`, lowercase+trimmed). `CvEducationSuggestion` + `CvEducationSuggestions` types added (FULL 7-field projection). `ProfiLuxResolved` + `EditorView` both carry `cv_education_suggestions: CvEducationSuggestions` (required, default `[]`). Resolver builds the array with hash-only re-fire suppression via `resolution_state.education[hash]`. `projectFor.projectEditorView` passes through. Barrel exports helper + new types. Includes inline rename (`row` → `eduRow`, `r` → `resolution`) for shadowing safety. Verified post-deploy: predicted hashes `eb19...` (SSBM/Business Administration/2003) and `ebb3...` (Xpro/Artificial Intelligence/2026) match across both test members. Zero user-visible change (no UI consumer yet).

**DDL applied this session:** 1 migration tracked in Supabase.

---

## UNRESOLVED / OPEN

- **Trio retirement parked.** `members.{university, field_of_study, graduation_year}` still on resolver via L1-fallback bridge. Foundation card §5 explicitly defers Option A/B/C decision until after `education_records` write path stabilizes (i.e. after S-B.1B.2 ships and is exercised).
- **MATRIX §9 dormancy still declared in docs.** `education_records` is partially active (read path live, write path still parked). Amendment deferred per S-B foundation card; reconcile in a separate doc-only commit after write path lands.
- **Two pre-existing finds NOT touched this session, still drift surface:**
  - `ResolvedEducation.degree` always null in production (Haiku writes `degree_level`, never `degree`). Kept for admin route backward-compat. Cleanup in a future type-drift slice.
  - `AdminEducationRecord.degree` typed but unsourced. Admin route reads `e.degree` for both `degree` and `degree_level` rendering — always null. Same cleanup slice.
- **S-A behavior unbroken this session.** `cv_identity_suggestions` flow integrity verified post each deploy. `resolution_state.identity` untouched on both test rows (still null).
- **`1609e494` (relational L2 collection migration) — partially unparked for Education READ ONLY** as of `7e96360`. Notes appended to the ledger row. Experiences, Languages, Sectors collections still fully parked. Full unparking gated on S-B.1B.2 write path stabilizing.

---

## NEXT STRICT STEP — S-B.1B.2

**Open with:** `"Open JOBLUX session — contract closure mode"`

**Ledger row:** `8ab6d913-7085-4a7e-82d1-930258fa58a1` (status=open)

**Slice scope (drafted, not yet audited):**
- NEW file `app/api/profilux/suggestions/education/route.ts`
- POST `{ action: 'apply', signature: string }`
- Server walks `cv_parsed_data.education[]`, computes signature on each, finds matching L1 row
- 410 Gone if no match (L1 row vanished after re-parse)
- INSERT into `education_records` from matched L1 row; `sort_order = matched_index`; RETURNING id
- Read-modify-write `cv_parsed_data.resolution_state.education[signature]` with full snapshot
- Single members UPDATE on cv_parsed_data jsonb
- Recompute `profile_completeness` (no-op for education in M6 today; cheap safety per S-A pattern)
- Return editor projection

**Open audit questions (defer to next session's audit card):**
- Race window between INSERT and UPDATE (no cross-table TX)
- `institution` NOT NULL handling — reject 422 if L1 institution null?
- Auth pattern (session email → member resolve, same as S-A endpoint)
- Signature format validation (regex `/^[a-f0-9]{64}$/`)
- Dismiss path in same slice or split to S-B.1B.3?

**Foundation locks already approved (do not re-litigate):**
- New endpoint, not extension of identity endpoint
- Signature-based addressing (not L1 index)
- Hash-only re-fire rule
- `l1_snapshot` + `l2_id` storage in resolution_state
- Trio retirement parked until after this endpoint stabilizes
