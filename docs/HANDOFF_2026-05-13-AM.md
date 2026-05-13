# HANDOFF — 2026-05-13 AM

## SHIPPED (this session)

- **0799143** S-B.1B.2 apply — `POST /api/profilux/suggestions/education` apply branch. New endpoint (267 lines) + resolver filter for null-institution L1 rows (+4 lines). Option α race window locked, Option γ signature contract locked. SHIPPED + COOLIFY-GREEN (07:46–07:50 UTC, 03m55s).

- **ed1da55** S-B.1B.3 dismiss — dismiss branch on same endpoint via action union (+99/-5). D1/D2/D3/A1/A2/A3 all locked: same file, idempotent dismiss-after-dismissed, 409 ALREADY_APPLIED on dismiss-after-apply, full l1_snapshot, recompute kept, inline branch. SHIPPED + COOLIFY-GREEN.

**Education backend substrate now complete end-to-end:** L1 parse, L2 relational storage, merge resolver, hash identity, resolution state, apply path, dismiss path, stale detection, re-fire logic, defense-in-depth, type uniformity. What remains is presentation + interaction (S-B.1B.4).

## UNRESOLVED

- **Q3 row shape (S-B.1B.4 audit)** — Mo product instinct logged ("Add to ProfiLux" semantic, no arrow, institution title, three-tier field hierarchy, sober microcopy) but needs explicit GPT pass at next session open. Genuine UX divergence from S-A flat-field arrow pattern because collection apply CREATES rather than SWAPS.

- **Live validation of S-B.1B.2 + S-B.1B.3** — deferred per Mo strategic call. Endpoint pair is operationally shipped but never curl-tested or exercised end-to-end. First real validation comes via S-B.1B.4 UI loop using captured-id cleanup pattern.

- **Race window observation** — Option α apply path has documented orphan-L2 failure mode (INSERT success + UPDATE fail). Zero occurrences expected in single-user testing; flag at S-B.1B.4 prod QA if a duplicate `education_records` row appears for any test member.

- **`1609e494` partial unparking status** — education collection now has full read+write paths (notes appended at session prior); experiences extended fields, languages, sectors collections still fully parked.

## NEXT STRICT STEP

**S-B.1B.4 — EditorView.cv_education_suggestions UI panel on Edit tab.**

Open with `"Open JOBLUX session — contract closure mode"`.

Audit-first read on `app/dashboard/candidate/profilux/page.tsx` to map S-A identity panel mount + handler pattern. Surface the 5 audit answers (Q1/Q2/Q4/Q5 defaults locked, Q3 needs GPT). No code, no prompt, just audit card. Then GPT pass on Q3. Then prompt drafting with MATCH CHECKLIST + captured-id validation cleanup SQL embedded.

### Audit defaults (locked Mo, pending GPT validation on Q3)

1. **Mount point:** immediately after S-A identity panel, same "review/apply parsed CV data" zone. NOT near Education drawer.
2. **Precedent reuse:** mirror S-A primitives + in-flight state (actioning/actionError) + post-action refetch (full editor payload). No new primitives.
3. **Row shape (Q3, Mo instinct, needs GPT):**
   - No arrow form. Apply CREATES, does not SWAP.
   - Primary button: "Add to ProfiLux"
   - Secondary button: "Dismiss"
   - Row title: institution
   - Secondary line: degree_level / field_of_study / graduation_year
   - Tertiary (hide if absent): city / country / start_year
   - Panel microcopy: "Your CV includes education entries that are not yet in your ProfiLux."
4. **Handlers:** new sibling handlers `handleApplyEducation` / `handleDismissEducation`. Do NOT extend `handleApplySuggestions` — different endpoint, different body, different per-row UX.
5. **Validation cleanup (captured-id pattern, Mo lock):**
   - SQL: capture before_count of education_records for test member
   - UI: apply one education suggestion
   - SQL: capture inserted `education_records.id`
   - SQL: verify `resolution_state.education[signature].l2_id` === inserted id
   - Cleanup A: `DELETE FROM education_records WHERE id = '<captured>'`
   - Cleanup B: surgical removal of `resolution_state.education[signature]`
   - SQL: verify before_count restored
   - UI: verify panel suggestion reappears (resolver re-fires)

### Out of scope for S-B.1B.4 (DO NOT touch)

- Backend: endpoint, resolver, types, signature helper — all locked
- Other suggestion families (experiences, sectors, languages)
- Education drawer (separate Edit-tab section)
- Trio retirement (S-B.2, after exercise of UI loop)
- New component primitive families
- Global Edit-tab redesign
- Completion / readiness language

Ledger row: `6dc1e5d4`.
