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

- **b31c210** `feat(briefs): Pack E.3b — POST /api/briefs/proposed/[id]/decline (candidate decline, single-UPDATE)` — May 18 2026 PM. SHIPPED + COOLIFY-GREEN + QA 12/12 PASS via Supabase MCP synthetic. 1 new file `app/api/briefs/proposed/[id]/decline/route.ts` (+178 LOC, force-dynamic, POST only). Race-safe single UPDATE on `brief_outreach` via compound `WHERE id=? AND status='proposed'` — no RPC needed (single-table write; PostgreSQL atomicity guarantees on single statement). Works for both source types uniformly: brief vs assignment is a column on the outreach row, not a code branch. Auth: session.user.role in ('admin','business') → 403 FORBIDDEN; UUID regex on params.id → 400 INVALID_ID; member resolve + deleted_at gate. Body validation: `decline_reason` optional, trimmed, max 1000 chars, empty/whitespace → null, > 1000 chars → 400 DECLINE_REASON_TOO_LONG. Pre-fetch SELECT for 404/403/409 messaging + source detection (response includes `source: 'business_brief' | 'search_assignment'` for UI). Update fires with timestamp; if rowCount=0 returns 409 OUTREACH_NOT_DECLINABLE (race: concurrent accept grabbed the row). No applications row, no match update, no stage_history insert — decline is on outreach trail only per Q4 doctrine. QA 12/12: T1 assignment + valid reason → declined with reason stored; T2 brief + null reason → declined uniformly; T3 empty-string + T4 whitespace → null (route-side normalize, code-audit); T5 1001-char → 400 (code-audit); T6 re-decline already-declined → 0 rows + original reason preserved; T7 ownership (memberB on memberA) → owner mismatch 403; T8 non-existent UUID → 404; T9 re-proposal after decline → new 'proposed' row allowed (uniq partial gates on live statuses); T10 race: manually flip outreach to 'accepted' then attempt decline → compound WHERE returns 0 rows, status stays 'accepted', no overwrite; T11 match status untouched on decline → mbm.status remains 'pending'; T12 cleanup → net DB delta = 0. Pack E candidate response loop COMPLETE: feed + accept + decline all live.

- **0a0ebbf** `feat(briefs): Pack E.3a-step-2 — POST /api/briefs/proposed/[id]/accept (atomic candidate accept via RPC)` — May 18 2026 PM. SHIPPED + COOLIFY-GREEN + QA 8/8 PASS via Supabase MCP synthetic. 1 new file `app/api/briefs/proposed/[id]/accept/route.ts` (+174 LOC, force-dynamic, POST only). Thin RPC wrapper: auth gate (admin/business → 403), UUID regex (→ 400 INVALID_ID), member resolve + deleted_at gate, then `supabase.rpc('accept_outreach', {p_outreach_id, p_member_id, p_moved_by})`. Result `ok:true` → 201 with `{application_id, outreach_id, match_id}`. RPC business codes mapped 1:1 to HTTP: OUTREACH_NOT_FOUND → 404, FORBIDDEN → 403, OUTREACH_NOT_ACCEPTABLE → 409 (with `current_status` echo), BRIEF_ACCEPT_DEFERRED → 501, APPLICATION_DUPLICATE → 409, INVALID_REFERENCE → 400. QA 8/8: T1 happy path (assignment-source with match_id) → atomic 4-write confirmed: applications row created (stage='applied', source='candidate_accepted_outreach'), brief_outreach='accepted', member_brief_matches='converted', application_stage_history row inserted (from_stage=null, to_stage='applied', moved_by, notes); T2 already-accepted re-call → OUTREACH_NOT_ACCEPTABLE; T3 brief-source → BRIEF_ACCEPT_DEFERRED, outreach untouched (Option C lock); T4 ownership (wrong member_id) → FORBIDDEN; T5 non-existent → OUTREACH_NOT_FOUND; T6 match_id=null path → ok:true, mbm unchanged, applications+1, history+1; T7 unique_violation rollback → APPLICATION_DUPLICATE, outreach still 'proposed' (full TX rollback proven); T8 cleanup → net DB delta = 0. Atomicity proof: T7 confirms unique_violation EXCEPTION rolls back the entire RPC TX, leaving no orphan rows.

- **DDL only — no commit** `pack_e_3a_accept_outreach_rpc` — May 18 2026 PM. SHIPPED via Supabase MCP migration; **no repo commit** (DDL-only this slice, mirrors B.3.1b + E.1a + E.2a cadence). New function `public.accept_outreach(p_outreach_id uuid, p_member_id uuid, p_moved_by text) RETURNS jsonb`, `LANGUAGE plpgsql`, `SECURITY DEFINER`, `SET search_path = public`. Atomically does: SELECT brief_outreach FOR UPDATE → ownership/state/source gates → INSERT applications (source='candidate_accepted_outreach', current_stage='applied') → UPDATE outreach (status='accepted', responded_at, updated_at) → if match_id IS NOT NULL UPDATE member_brief_matches (status='converted') → INSERT application_stage_history (from_stage=null, to_stage='applied', moved_by, notes='Accepted via E.3 outreach flow'). Returns `{ok:true, application_id, outreach_id, match_id}` on success. Business errors via jsonb codes: OUTREACH_NOT_FOUND, FORBIDDEN, OUTREACH_NOT_ACCEPTABLE (with current_status), BRIEF_ACCEPT_DEFERRED (Option C lock: brief-source accept deferred until applications schema mutation slice). EXCEPTION blocks: unique_violation → APPLICATION_DUPLICATE (catches applications UNIQUE(member_id, search_assignment_id) collision when candidate already self-applied), foreign_key_violation → INVALID_REFERENCE. Mirror of `apply_cv_merge` pattern (`c2897c2`). **REVOKE/GRANT hotpatch:** initial migration shipped with `REVOKE ALL FROM PUBLIC; GRANT EXECUTE TO service_role;` but post-flight returned anon=true and authenticated=true (Supabase default ACL grants EXECUTE on new functions). Hotpatched with explicit `REVOKE EXECUTE FROM anon; REVOKE EXECUTE FROM authenticated;`. Final ACL `{postgres=X/postgres, service_role=X/postgres}`. New parked finding `F-rpc-privilege-incomplete-revoke` logged (ledger `bf808038`).

- **2e0cb00** `fix(briefs): E.2b.2 drop sa.sector — column does not exist on search_assignments` — May 18 2026 PM. SHIPPED + COOLIFY-GREEN + QA 9/9 PASS via Supabase MCP synthetic. 1 file `app/api/briefs/proposed/route.ts`, +1/-2 (final E.2b chain commit). Second hotfix on the GET feed within the same slice. Defect: shipped endpoint queried `search_assignments(... sector ...)` but column does not exist on that table (only `business_briefs.sector` exists; `search_assignments` has `luxury_sector_experience` text + `product_category` array, neither a clean mirror). Brief-typed outreach worked; assignment-typed outreach would 500 INTERNAL_ERROR. 0 user impact in prod (0 outreach rows). Fix: removed `sector` from the Supabase select block for `search_assignment`, mapped `sector: null` literal in the JS assignment projection (brief branch retains `bb.sector ?? null`). Final QA 9/9: T1 synthetic candidate (role='rising'); T2+T3 seed brief+assignment outreach; T4 endpoint query simulation — brief row populated correctly (title=mandate_title, sector, department=function, seniority_level, location), assignment row populated correctly with `sector=null`; T5 uniq partial dup → 23505; T6 declined row dropped from feed; T7 re-proposal after decline allowed; T8 show_location gate (code-audit); T9 closed-source filter parity (WOULD_FILTER vs WOULD_RETURN). Net DB delta = 0. E.2b chain (3 commits) reflects Pre-Code checklist failures: my E.2b card listed `sector` for both sources without grepping `search_assignments` columns, then earlier listed `role='candidate'` without grepping `member_role` enum. Both caught at DB-level QA before any prod user impact.

- **6c7aced** `fix(briefs): E.2b.1 allow real candidate roles on proposed briefs endpoint` — May 18 2026 PM. SHIPPED + COOLIFY-GREEN. 1 file, +2/-2. First hotfix on E.2b. Defect: shipped endpoint gated on `session.user.role !== 'candidate'` but `member_role` enum has no `'candidate'` value (enum: rising, professional, business, insider, admin, pro, executive, member, senior, insider_contributor, insider_key_speaker; live distribution: executive=4, pro=3, admin=2, business=2, insider=1, rising=1). Endpoint would 403 every real candidate. Fix: inverted to negative block — `role === 'admin' || role === 'business'` → 403 FORBIDDEN; everyone else passes (mirrors `/api/applications` self-apply pattern). Comment line also updated to reflect new contract. 0 user impact in prod (0 outreach rows + defective endpoint just 403'd everyone).

- **35692dd** `feat(briefs): Pack E.2b — GET /api/briefs/proposed candidate-authenticated read endpoint` — May 18 2026 PM. SHIPPED + COOLIFY-GREEN. 1 new file `app/api/briefs/proposed/route.ts` (+153 LOC initially, force-dynamic, GET only). Initial E.2b ship; carried 2 defects (role enum drift + sa.sector drift) both fixed in same slice (6c7aced + 2e0cb00). Contract per Mo E.2 lock: candidate-only role gate, member resolve + deleted_at gate, matching_opt_in NOT re-checked (consent enforced at outreach create time), minimal-and-safe projection (source, source_id, title, sector, department, seniority, location, status, proposed_at — no admin notes, no contact info, no fees/salaries, no maison gated by show_brand, no brief_summary unsanitized prose, no compensation_range), post-fetch JS filter for closed/archived sources, response shape `{outreach: [...]}` with no-store cache. Brief-side maps `function → department` and `mandate_title → title` (column name "mandate" stays internal). Assignment-side respects `show_location` gate. Final shape verified at chain commit `2e0cb00`.

- **DDL only — no commit** `pack_e_2a_brief_outreach` — May 18 2026 PM. SHIPPED via Supabase MCP migration; **no repo commit** (DDL-only this slice, mirrors B.3.1b + E.1a pattern). New table `public.brief_outreach`: id uuid PK, member_id uuid FK CASCADE, business_brief_id uuid FK CASCADE NULL, search_assignment_id uuid FK CASCADE NULL, status text NOT NULL DEFAULT 'proposed' CHECK IN ('proposed','accepted','declined','withdrawn','expired'), proposed_at timestamptz NOT NULL DEFAULT now, proposed_by text NOT NULL, responded_at timestamptz NULL, decline_reason text NULL, withdrawn_at timestamptz NULL, withdrawn_by text NULL, match_id uuid NULL REFERENCES member_brief_matches(id) ON DELETE SET NULL, notes text NULL, created_at + updated_at. XOR CHECK `one_source_required` (exactly one of business_brief_id / search_assignment_id non-NULL). 2 unique partial indexes `uniq_outreach_member_brief_live` + `uniq_outreach_member_assignment_live` (WHERE source NOT NULL AND status IN ('proposed','accepted')) — Q4 doctrine: declined/withdrawn/expired rows do not block re-proposal. 4 lookup indexes (idx_outreach_member_status, idx_outreach_brief partial, idx_outreach_assignment partial, idx_outreach_match partial). RLS enabled, no policies (default deny for anon/authenticated; service-role bypasses). Pre-flight: 0 rows, 0 collisions, FK targets all exist (members=13, briefs=1, assignments=26, mbm=0). Post-flight: table_exists=1, index_count=7, check_constraints=2 (one_source_required + status CHECK), fk_constraints=4, rls_active=true, policy_count=0, sibling counts unchanged. Pack E.2 substrate-only; GET endpoint shipped immediately after as E.2b (`35692dd` → `6c7aced` → `2e0cb00`).

- **f1e98a5** `feat(matches): Pack E.1b — POST /api/matches admin endpoint (substrate-first)` — May 18 2026 PM. SHIPPED + COOLIFY-GREEN + QA 5/5 PASS via Supabase MCP synthetic. 1 new file `app/api/matches/route.ts` (+136 LOC, force-dynamic, POST only). Mirrors `/api/applications` POST admin branch exactly: admin-only auth (`session.user.role !== 'admin'` → 401), JSON body parse with 400 fallback, XOR source validation at JS layer (exactly one of `business_brief_id` or `search_assignment_id` required → 400 `INVALID_SOURCE`), trim normalization on member_id + source IDs, candidate gate via single SELECT on `members.{matching_opt_in, deleted_at}` → 404 `CANDIDATE_NOT_FOUND` / 410 `CANDIDATE_DELETED` / 403 `MATCHING_OPT_IN_REQUIRED`, INSERT into `member_brief_matches` with `status='pending'` + `computed_by='admin_manual'` defaults preserved, error code mapping (23505 → 409 `MATCH_DUPLICATE` via uniq partial indexes uniq_mbm_member_brief / uniq_mbm_member_assignment; 23503 → 400 `INVALID_REFERENCE`). NOT in scope this slice: GET list, auto-matching (`computed_by='auto_v1'` stays parked), status transitions (E.3), notifications (E.5). Synthetic QA: created synthetic with `matching_opt_in=true` → valid INSERT 201 confirmed; dedup re-INSERT → 23505 confirmed on uniq_mbm_member_brief; XOR CHECK `one_source_required` confirmed at DB layer for both "both IDs" and "neither ID" malformed payloads (endpoint catches first at JS layer, DB CHECK is defense-in-depth); separate opt-out synthetic created and verified at code-review level. Cleanup: 2 synthetic members deleted via CASCADE, 1 match row CASCADE-removed automatically, `mbm_remaining=0`, `total_members=13`, `active_members=13`, briefs=1 baseline, assignments=26 baseline. **Net DB delta = zero post-QA.** Auth-gate verified at code-review (synthetic OAuth session impractical in MCP). Pack E.1 (a+b) complete. Ledger `994c50cc-53d9-4bce-9581-30ed86cd50bf` opened to track E.2 → E.5 remaining slices.

- **DDL only — no commit** `pack_e_1a_member_brief_matches` — May 18 2026 PM. SHIPPED via Supabase MCP migration; **no repo commit** (DDL-only this slice; pattern matches B.3.1b + retire_profilux_standalone_table). New table `public.member_brief_matches`: id uuid PK, member_id uuid FK CASCADE, business_brief_id uuid FK CASCADE, search_assignment_id uuid FK CASCADE, status text NOT NULL DEFAULT 'pending' CHECK IN ('pending','dismissed','converted'), computed_at timestamptz, computed_by text NOT NULL DEFAULT 'admin_manual' CHECK IN ('admin_manual','auto_v1'), notes text, created_at + updated_at timestamptz. XOR constraint `one_source_required` (exactly one of business_brief_id / search_assignment_id non-NULL). 2 unique partial indexes (`uniq_mbm_member_brief` WHERE business_brief_id IS NOT NULL, `uniq_mbm_member_assignment` WHERE search_assignment_id IS NOT NULL). 3 lookup indexes (idx_mbm_member_id, idx_mbm_brief_id partial, idx_mbm_assignment_id partial, idx_mbm_status). RLS enabled (service-role only — candidate read deferred to E.2 outreach feed). Pre-flight: members=13, briefs=1, assignments=26, no pre-existing table. Post-flight: table created, row_count=0, index_count=7, check_constraints=10 (3 CHECK + 7 NOT NULL reported by information_schema), RLS active. Pack E.1 substrate-only; admin POST endpoint shipped immediately after as E.1b (`f1e98a5`).

- **a1fe603** `docs(profilux): Pack B residue close — reconcile private PDF export v1.11` — May 18 2026 PM. SHIPPED + COOLIFY-GREEN (docs-only, no runtime impact). 2 files (`docs/PROFILUX_MATRIX_V1.md` + `docs/JOBLUX_STATE.md`), +21/-7. Closes long-standing doctrine drift between live code (`/api/profilux/export` + `lib/profilux/pdf/ProfiLuxPDF.tsx` using `@react-pdf/renderer`, shipped without ledger trace) and MATRIX §19A.2 + §13 which described PDF library + render template as deferred. Doctrine β locked this rotation: private candidate `/api/profilux/export` = full ProfiLux snapshot, UNMASKED. `masked_fields` (§16) and section visibility (§16A) apply to client/share surfaces only — never private export. Masked share PDF (recruiter/client) stays parked under §19A Q3/Q5, gated on C-B-2 / C-B-3. MATRIX changes: v1.11 changelog entry prepended, Status line v1.10→v1.11, §13 PDF library row flipped to SHIPPED (private path), §19A.2 "no PDF library" framing removed + new β paragraph, §19A.3 pruned (PDF library + render template + profilux ghost-table cleanup all removed from out-of-scope list — first two SHIPPED, third already retired 2026-05-18), §19A.4 §13 cross-ref amended. STATE changes: LAST SHIPPED prepended with Pack B residue close entry, DO NOT appended with masked-export prohibition bullet. Verify gates all green: 0 hits "no PDF library" in MATRIX, v1.11 present, "Pack B residue close" present, only 2 docs files touched. **Pack B fully closed**: B.1 (`f42117b`+`26bf648`+`1b29bae`+`390aacf`) + B.1.4 (`a5a4bc2`) + B.2 (`26e3032` + retroactively recognized `/api/profilux/export`) + B.3 (`d53b287` + `a6e3a95` + `3ea93d6`) + this docs reconciliation.

- **9dc0a7f** `fix(profilux): Pack D residue — activated_sections implicit backfill for 4 jsonb sections (portfolio, press_features, references, internships)` — May 18 2026 PM. SHIPPED + COOLIFY-GREEN + QA mirror-SQL PASS. 1 file `lib/profilux/resolveProfiLux.ts`, +4/-0 additive. Extended the `_implicitActivated` IIFE inside the `activated_sections` resolver block to include the 4 Pack D Phase 2 jsonb sections in the same pattern as the 4 existing text[] sections (certifications/awards/memberships/strategic_initiatives). Prior bug: a member with non-empty `portfolio`/`press_features`/`references`/`internships` jsonb but NULL `activated_sections` would NOT see those sections render in EditorView (only the 4 text[] sections were auto-detected). Post-fix, both text[] and jsonb collections trigger implicit activation symmetrically. Prod baseline: 12/13 members all-NULL (no symptoms), 1/13 (Alex `49542211`) had explicit `activated_sections` — no real victim, latent bug closed pre-launch. Mirror SQL QA: synthetic member created with all 4 jsonb arrays populated + NULL `activated_sections` → resolver formula correctly emits `['portfolio','press_features','references','internships']`. Cleanup: synthetic deleted, total_members=13 baseline preserved. Closes Pack D Phase 2 backend residue. Pack D = fully closed.

; **no repo commit** (DDL-only this slice; no code/docs/MATRIX touched in the same close — docs rotation is a separate slice). `DROP TABLE public.profilux;` Pre-flight PASS: 0 routine refs, 0 view refs, 0 FKs in or out, 0 triggers, `last_data_write=2026-05-12 14:03:20` (unchanged 6d through 8 ship slices), `last_idx_scan=2026-05-10` (no app reads in 8d — `last_seq_scan` activity ruled out as catalog/Studio sweep by simultaneous scan timestamp on neighboring `wikilux_content`). Rollback block: 4 INSERT statements captured pre-drop and preserved in session transcript (also in admin_tasks notes). Post-drop DB verification GREEN: `table_exists=0`, `indexes_remain=0` (was 5: pk, email_key, share_slug_key, email_idx, share_slug_idx), `policies_remain=0` (was 2 RLS policies — both died with table), `constraints_remain=0`, `stat_row_remains=0`, `view_refs_after=0`, `routine_refs_after=0`. Sibling tables intact: `members=13` (13 active, B.3.1 baseline preserved), `share_links=4`, `share_views=12`. Prod runtime smoke PASS: `GET /api/profilux` → 401 (auth-guard reached cleanly, no 500 from a dead binding), `GET /alex-mason` → 404 (Alex's sharing preexisting-disabled per B.3.x — not a regression). `GET /rest/v1/profilux` returns 401 on unauthenticated probe (PostgREST short-circuits on missing apikey before resolving the table; DB-side proof is conclusive; PostgREST schema cache will refresh and authenticated callers will see 404). Closes ledger `6aef236e-63f5-4874-ad6d-1ca4972beedf` (Retire profilux standalone table + dormant app/[slug]/page.tsx route — both Matrix v1 §9 frozen-out). Ledger note had minor drift (said 3 rows / all sharing_enabled=false; reality was 4 rows / 2 with sharing_enabled=true) — dead data on a dead table, zero runtime impact. Out of scope (intentionally deferred to next schema-touching slice): `F-stale-schema-artifacts` (supabase-schema.sql + types/database.ts legacy `profiles` shape), `F-r-slug-local-types-redeclared` (app/r/[slug]/page.tsx — gated on C-B-3), `F-career-history-ghost-table`. No code, no MATRIX. **Confirms B.1.4 (a5a4bc2, May 17) substrate close at the DDL layer: the `share_links` migration is now 100% complete — legacy `profilux.share_slug` + `profilux.sharing_enabled` no longer exist at any layer of the stack.**

- **e3c8e9d** `feat(profilux): PF-D V3.5 — Internships (jsonb {company, role, period}) library section` — May 18 2026 PM. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 8/10 PASS (T7-T8 skipped intentionally per QA tightness lock). **Closes Pack D Phase 2 at 8/8 active.** DDL applied pre-flight via Supabase MCP migration `pf_d_v3_5_add_members_internships_jsonb` (2026-05-18 AM): `ALTER TABLE members ADD COLUMN internships jsonb NULL` + doctrine COMMENT. Pre-flight verified: column absent before apply, zero name collisions across schemas, zero orphan tables, members RLS posture unchanged (inherited via ALTER, no GRANT block needed), 13/13 NULL baseline post-apply. Code shape mirrors V3.4 References anchor (`29ae0789`): 6 files, +331/-2. Adds `ProfiLuxInternshipItem` type, `coerceInternshipItem` validator (rejects rows missing company/role/period; trims whitespace; period is free-text — no date parsing, no format guard; no location/description/start/end fields — intentionally distinct from work_experiences). EditorView-only projection (public/client/ats/admin/dashboard intentionally omit — Pack D Phase 2 defense-in-depth posture). ADD_SECTION_LIBRARY: internships flipped `available:false → available:true`. No tier gating — any member can activate per Mo lock 2026-05-18 (ProfiLux = living career passport; senior users simply choose not to activate). No migration to work_experiences — internships stay in `members.internships` forever per Mo lock. Live QA on Alex (49542211) via Chrome MCP: T1 activation succeeded (POST /api/profilux 200, `internships` appended to `activated_sections`); T2 SectionCard renders between References and Compensation with "INTERNSHIPS" eyebrow + Edit button (empty state shows "Not set" placeholder consistent with sibling Pack D card pattern); T3 add row Hermès/Retail Intern/Summer 2023 saved (POST 200, drawer closes, collapsed card body updates); T4 F5 reload — row persists; T5 DB shape verified via Supabase MCP — jsonb array, exact `{company, role, period}` keyset, no extras; T6 coercer reject path — Add button correctly disabled client-side when Period empty (Cartier/Sales Intern partial draft refused; client-side gate prevents server roundtrip; server coercer remains the defense-in-depth backstop); T7 (edit existing row) and T8 (delete row) intentionally skipped to keep QA tight — Edit/Remove buttons render per inspection but explicit edit-delete cycle not exercised; T9 Pack D regression — Memberships, Strategic Initiatives, Portfolio, Press & Features, References all preserve shape + data at DB level post-V3.5 activity; T10 projection isolation confirmed at code-audit level (projectFor.ts shows internships only in EditorView block at HEAD), live public surface check skipped because Alex's sharing currently disabled ("This profile is unavailable."). Cleanup: Hermès test row removed via Supabase MCP, `internships` removed from `activated_sections` array, Alex baseline restored (`internships IS NULL`, activated_sections back to 6-entry pre-V3.5 state). Pack D Phase 2 jsonb track now closes the full 8/8 library: Awards, Certifications, Memberships, Strategic Initiatives, Portfolio, Press & Features, References, Internships all active. False-alarm logged: initial QA reading of "SectionCard not rendered" was a scrolling miss — card was always present; no underlying bug.
- **29ae0789** `feat(profilux): PF-D V3.4 — References (jsonb {name, role, company}) library section (no contact fields)` — May 17 2026 PM. SHIPPED + COOLIFY-GREEN + PROD QA 4/4 PASS (deferred QA recorded 2026-05-18 AM). Closes Pack D Phase 2 jsonb track. Adds `ProfiLuxReferenceItem` type, `coerceReferenceItem` validator (rejects rows missing name/role/company; trims whitespace; no URL field, no contact fields, no relationship field — sensitive content posture). EditorView-only projection (public/client/ats/admin/dashboard intentionally omit — strict because reference content is sensitive). `members."references"` substrate jsonb confirmed pre-flight (column name SQL-reserved, quoted in DDL, bare property access in Supabase JS). ADD_SECTION_LIBRARY: references flipped COMING SOON → ADD. Mirror of V3.3 trio pattern minus URL guard. STATE drift discovered + corrected 2026-05-18 AM: STATE through c61e352 claimed References was DDL-blocked alongside Internships; in reality, orphan May 16 migration created 5/6 jsonb columns not 4/6 — only `members.internships` is actually missing. References substrate landed silently in that batch. Pack D now 7/8 active. Only Internships remains inert (genuinely DDL-blocked). Live QA on Alex (49542211): pre-existing row `{name:"Marie Dubois", role:"Global Retail Director", company:"Chanel"}` renders in Edit tab References SectionCard, edit/save round-trip persists post-F5, no regression on Awards/Certifications/Memberships/Strategic Initiatives/Portfolio/Press & Features sections.
- **c61e352** `feat(profilux): PF-D V3.3 — Press & Features (jsonb {title, publication, url}) library section with http(s) URL guard` — May 17 2026 PM. SHIPPED + COOLIFY-GREEN + PROD QA 6/6 PASS. 6 files, +341/-2. Adds `ProfiLuxPressFeatureItem` type, `coercePressFeatureItem` validator (rejects rows missing title/publication/url or url not starting with `http://` or `https://` lowercase exact prefix, no auto-prepend). EditorView-only projection (public/client/ats/admin/dashboard intentionally omit). `members.press_features` substrate jsonb confirmed pre-flight (0 rows). ADD_SECTION_LIBRARY: press_features flipped COMING SOON → ADD. Mirror of V3.2 pattern + extra required `publication` field. Pack D now 6/8 active. Next inert sections (References, Internships) require DDL — both `members` columns missing per orphan May 16 migration that created only 4 of 6 jsonb columns. Live QA on Alex (49542211): valid 3-field row `{title:"Rising star in luxury retail", publication:"Business of Fashion", url:"https://businessoffashion.com/articles/rising-star"}` saved + persisted post-F5; invalid URL "example.com/article" rejected; missing publication rejected; zero console errors.

- **88ed1a0** `feat(profilux): PF-D V3.2 — Portfolio (jsonb {title, url}) library section with http(s) URL guard` — May 17 2026 PM. SHIPPED + COOLIFY-GREEN + PROD QA 5/5 PASS. 6 files, +316/-2. Adds `ProfiLuxPortfolioItem` type, `coercePortfolioItem` validator (rejects rows missing title/url or url not starting with `http://` or `https://` lowercase exact prefix, no auto-prepend, no protocol-relative, no other schemes). EditorView-only projection (public/client/ats/admin/dashboard intentionally omit — defense in depth). `members.portfolio` substrate jsonb confirmed pre-flight (0 rows). ADD_SECTION_LIBRARY: portfolio flipped COMING SOON → ADD. URL guard pattern locked as canonical for Pack D forward: lowercase `http://` or `https://` prefix only, row rejected if invalid, no normalization. Live QA on Alex (49542211): valid row `{title:"Personal site", url:"https://alexmason.com"}` saved + persisted post-F5; invalid "example.com" rejected; zero console errors.

- **d1a0274** `feat(profilux): PF-D V3.1 — Memberships (text[]) + Strategic Initiatives (jsonb) library sections` — May 17 2026 PM. SHIPPED + COOLIFY-GREEN + PROD QA 5/5 PASS. DB remediation applied via Supabase MCP: `pf_d_v3_remediation_recreate_structured_as_jsonb`; orphan May 16 MCP migration had created `strategic_initiatives`, `portfolio`, `press_features` as text[] and they were recreated as jsonb NULL. `memberships` kept text[]. Pack D active sections now: Awards, Certifications, Memberships, Strategic Initiatives. Remaining inert: Portfolio, Press & Features, References, Internships. Next natural slice: PF-D V3.2 Portfolio.

- **5c66a87** `feat(ats): G2 + G9 minimal — propose-to-assignment with matching-opt-in gate` — May 16 2026 PM. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 8/8. 2 files, +191/-1. `/api/applications` admin branch enforces `members.matching_opt_in === true` AND `deleted_at IS NULL`: 404/410/403 codes. Self-apply branch exempt by design. `assigned_recruiter` defaults to `session.user.email`. `/admin/members/[id]` topbar "Propose to assignment" button, `!isBusiness` gated, disabled+tooltip when opt-in false. Panel reads `/api/assignments?status=published&limit=100`, posts with `source='sourced_by_recruiter'`. First runtime consumer of B.3.3. Net DB delta = 0. Ledger `0ed736cd` closed. Partial advance on `1f7ccd56`.

- **09660d5** `copy(connect): tighten /connect + employer signup vocabulary` — May 16 2026 PM. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 8/8. 2 files, +8/-8. `/connect` + `/join/employer`: Employers→Companies, ProfiLux capitalization, organisation→organization (×3), drop "500+" from 2 houses bullets, "manager and up level"→"manager-and-up". Closes `/connect` vocabulary audit blocker. Ledger `d037e17e` closed.

- **Pack B.3.4.1 — RGPD export role-conditional tables** (`3ea93d6`) — May 17 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 5/5 via Chrome MCP + Supabase MCP. Closes B.3.4 v1 deferral. `app/api/members/export/route.ts` gains 2 parallel SELECTs (`business_briefs` WHERE `created_by = m.id`, `bloglux_articles` WHERE `author_id = m.id`), `admin_notes` destructure-and-rest redaction on both (symmetric with `brand_contributions.admin_notes` and `members.notes`), 2 new payload keys appended after `brand_contributions`. `export_metadata.scope_note` rewritten — no "deferred" or "B.3.4.1" language. MATRIX v1.10: §19B.3 count 14→16, §19B.4 +2 redaction lines, §19B.5 deferral block replaced with shipped record. 2 files, +42/-10. QA proof via synthetic seeds (`business_briefs` 4013dcd0 + `bloglux_articles` c812b530 with admin_notes="SECRET-ADMIN-NOTE-DO-NOT-LEAK-B341"): both rows fetched in export with `admin_notes` ABSENT (28 keys / 31 keys respectively), content fields preserved, secret literal never reached response. Synthetic cleanup verified: Alex back to 0 briefs / 0 articles. Ledger `a740561c-9aa7-4571-92ff-46c94cf7b754` closed.

- **Pack B.3.4 — RGPD machine-readable export endpoint + Settings DATA EXPORT card + MATRIX §19B** (`a6e3a95`) — May 17 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 8/8 via Chrome MCP + Supabase MCP. NEW `app/api/members/export/route.ts` (~200 LOC, force-dynamic, GET only): getServerSession → 401 if no session; resolve `members` by email with `.is('deleted_at', null)` filter → 410 Gone if soft-deleted; 10 parallel SELECTs by member_id (work_experiences, education_records, member_languages, member_sectors, member_documents, cv_parse_history, share_links, nextauth_accounts, applications, contributions, contact_messages, brand_contributions); share_views fetched via `share_link_id IN <member_share_link_ids>`. Redactions: `members.notes` excluded; `share_links.password_hash` + `password_salt` dropped, replaced by derived `has_password: boolean`; `nextauth_accounts.access_token` + `refresh_token` + `id_token` + `session_state` set to null; `brand_contributions.admin_notes` excluded. Response: `application/json` + `Content-Disposition: attachment; filename="joblux-data-export-<id>-<date>.json"` + `Cache-Control: no-store`. Settings page `/dashboard/candidate/settings` gains 4th "DATA EXPORT" card between MATCHING CONSENT and DELETE ACCOUNT — anchor `<a href="/api/members/export">Download my data</a>` triggers browser download via Content-Disposition. MATRIX v1.9: NEW §19B doctrine section; §13 deferred row marked SHIPPED; §25.9 export half marked satisfied. 3 files. 8/8 QA: card order correct, payload has 15 top-level keys (metadata + 14 tables), redactions verified on Alex (members.notes absent, share_links has no password fields + `has_password=false`, nextauth tokens all 4 null), soft-delete 410 path proven via code-review + B.3.2 precedent (synthetic ef53db69 created and cleaned, no Alex deleted_at toggle), `/alex-mason` regression PASS. Ledger `7636e388-57ea-43e8-b642-b9dc519ec16b` closed.

- **Pack B.3.3 — matching_opt_in code path + Settings toggle + MATRIX §20 reopen** (`d53b287` + DDL migration `b_3_3_member_matching_opt_in`) — May 17 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 8/8 via Chrome MCP + Supabase MCP. DDL applied via Supabase MCP: `ALTER TABLE public.members ADD COLUMN matching_opt_in BOOLEAN NOT NULL DEFAULT false` + doctrine COMMENT (13/13 default false post-apply, 0 opted in). 6 files, +146/-26: `lib/profilux/types.ts` adds `matching_opt_in: boolean` to MemberRow + ProfiLuxResolved + EditorView; `lib/profilux/resolveProfiLux.ts` projects `row.matching_opt_in ?? false`; `lib/profilux/projectFor.ts` exposes flag on `EditorView` only — public/client/admin/ats/dashboard projections intentionally omit (defense-in-depth); `app/api/profilux/route.ts` POST adds `matching_opt_in` to ALLOWED_FIELDS with boolean coercion (non-boolean → null forces NOT NULL violation); Settings page card 2 replaced with live optimistic toggle wired to POST /api/profilux. MATRIX v1.8: §20.5 rewritten (shipped, no longer deferred); §20.x rewritten from PROVISIONAL to SHIPPED — recruiter/ATS/matching surfaces MUST gate on `members.matching_opt_in === true`; `availability` remains self-description, never consent. 8/8 QA on Alex (49542211): toggle false→true confirmed in DB, persists on reload, false again, `/api/profilux` GET exposes view.matching_opt_in + editor.matching_opt_in. D2 defense-in-depth proven end-to-end: synthetic 9d8039fa with matching_opt_in=true rendered at /b33-qa-leak with zero "matching_opt_in" string in entire HTML or __NEXT_DATA__. Alex restored to false. Synthetic cleaned. Ledger `047b1364-59b4-48c1-a47f-51ce94c78fd0` closed.

- **Pack B.3.2 — runtime soft-delete guard + delete endpoint + Settings UI scaffold** (`7819a59`) — May 17 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 8/8 via Chrome MCP + Supabase MCP. First slice that turns B.3.1 substrate on at runtime. 6 files, +225: `lib/profilux/resolveProfiLux.ts` returns null when `data.deleted_at IS NOT NULL` (cascades hide through all 6 projections automatically); `lib/auth.ts` signIn callback + jwt callback + events.signIn all gate on `.is('deleted_at', null)` (revocation effective in 1 request cycle; JWT cookie cookie remains 30d); `app/api/profilux/share/route.ts` GET+POST email lookups gated on `deleted_at IS NULL`; NEW `app/api/members/delete/route.ts` 4-step (disable share_links + DELETE nextauth_accounts + DELETE nextauth_verification_tokens + UPDATE members.deleted_at = now() + deleted_by = self); NEW `app/dashboard/candidate/settings/page.tsx` greenfield page with 3 cards initially (ACCOUNT PREFERENCES placeholder + MATCHING placeholder + DELETE ACCOUNT with destructive confirm flow); `app/dashboard/candidate/page.tsx` gets Settings → link. Sessions table check: `nextauth_sessions` does not exist; JWT strategy only — revocation = jwt callback re-fetch + deleted_at filter. 8/8 QA: synthetic member 49982cb9 + share_links a23c3b3f slug b32-qa-synthetic created → Settings renders 3 cards → slug renders h1="QABot S." → SQL soft-delete applied → slug 404s with "This profile is unavailable." → cleanup verified → /alex-mason regression PASS → Dashboard Settings → link confirmed → /api/profilux/share returns normal payload. Ledger `ded15f0c-4314-4f1f-b37a-6e1995512ed0` closed.

- **Pack B.3.1 — Member lifecycle substrate** (`ccc8a6d` docs + `1b4b8c3` DDL) — May 17 2026. SHIPPED docs + DDL applied to prod via Supabase MCP — migration version `20260516154744`. B.3.1a doctrine (`ccc8a6d`): MATRIX v1.7 lock — new §25 Member lifecycle (10 subsections: lifecycle states, soft-delete-only rule, surface cascade via resolver, what survives deletion, what is suppressed, re-registration, restoration, RGPD-adjacent obligations with Mo's verbatim erasure-posture wording, §19B forward ref, out-of-scope) + §20.x provisional-posture rewrite (forward dep on B.3.3 + caption decision deferred) + §13 +3 deferred rows (soft-delete substrate, RGPD export endpoint, matching_opt_in storage) + change-log + footer to v1.7. STATE companion edits: §12 lifecycle paragraph, §24 hard-launch bullet, DO NOT +3 bullets (no hard-delete, no matching-consent-from-availability, account-controls-on-Settings-not-Manage). Docs-only, 2 files, +131/-3. B.3.1b DDL (`1b4b8c3`): `supabase/migrations/20260517_member_soft_delete.sql` (35 lines). Pre-flight verified: 13 members, 0 NULL/empty/duplicate emails (case-sensitive + case-insensitive), `members_email_key` constraint name confirmed, RLS enabled with 6 policies (4 auth-scoped, 2 admin/service-role bypass). Substrate landed: `members.deleted_at TIMESTAMPTZ NULL` + `members.deleted_by UUID NULL`; `idx_members_deleted_at_partial` partial btree (WHERE deleted_at IS NOT NULL); `idx_members_email_active` partial unique on `lower(email)` WHERE `deleted_at IS NULL`; `members_email_key` UNIQUE constraint dropped; `idx_members_email` non-unique btree preserved for general lookups. RLS own-policies tightened per Posture B (ship defended, not half-open): `Members read own` + `Members update own` USING `(auth_user_id = auth.uid() AND deleted_at IS NULL)`; `Members update own` WITH CHECK matching. Admin + service-role policies untouched per §25.3 (restore + audit paths). Baseline: 13/13 active, 0 soft-deleted. **No app code reads `deleted_at` yet — zero runtime behavior change.** Substrate fully defended at DB layer for B.3.2 resolver guard + delete endpoint + session revoke. Ledger row `1be7a829-61af-405d-9ba2-7d1ba970eb5c` (closed/normal/Substrate). Sibling ledger row `7439d0a7-94b1-4820-baf4-2a570469f00a` parked (F-opportunity-preferences-ghost-endpoint, low/Cleanup, discovered during B.3 audit).

- **a5a4bc2** `fix(profilux): remove legacy share fallback (Pack B.1.4)` — May 17 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 9/9 via Chrome MCP. Pack B.1 closing slice. Subtractive removal of `profilux.share_slug` + `profilux.sharing_enabled` reads/writes from 3 files: `app/api/profilux/share/route.ts` (GET Path B fallback, POST legacy `if (!link)` branch, trailing mirror-write block all deleted), `app/api/profilux/reset-link/route.ts` (slug uniqueness `Promise.all` collapsed to single share_links query, trailing legacy upsert deleted), `app/[slug]/page.tsx` (Path B fallback else-branch deleted, immediate `notFound()` if no share_links row). Error codes `NO_PROFILUX_ROW` + legacy `NO_SLUG_RESERVED` consolidated into `NO_SHARE_LINK` 400. 3 files, +38/-147. `profilux.updated_at` invariant verified UNCHANGED at `2026-05-12 14:03:20` throughout QA pass — mirror writes confirmed removed at runtime. `share_links` is now sole runtime source of truth across all app code. 9/9 Chrome MCP tests PASS: T1 active render (Alex/Mason H1), T2 disabled→404 "This profile is unavailable.", T3 password gate redirect, T4 expired (DB-seeded expires_at=2026-01-01) redirect to /{slug}/expired, T5 nonexistent slug→404, T6 GET shape populated + empty (Path B leak ruled out by member_id swap test), T7 POST `NO_SHARE_LINK` 400 with no share_links row, T8 sharing toggle round-trip (off→404, on→renders), T9 rotation (slug `alex-mason-old`→`alex-mason`, `rotated_from` persisted, password+expiry cleared on rotation). DB columns retained pending DDL drop slice (parent ledger `6aef236e` open). Ledger row `8b369d80` Pack B.1 label appended ` + a5a4bc2 (B.1.4)`; ledger row `6aef236e` notes annotated with code-side closure.

- **Pack B.1 — Share / Manage hardening** (`f42117b` + `26bf648` + `1b29bae` + `390aacf`) — May 16 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 13/13. Substrate: share_links + share_views tables (RLS, service-role-only grants, 4 legacy rows backfilled). Gate: dual-read at /[slug] (Path A share_links / Path B legacy fallback), password challenge + verify endpoint, expiry redirect, anonymous view tracking, scrypt+HMAC in lib/share/auth. Hotfix: siteUrl base in /api/profilux/share/verify redirects (Coolify standalone). Manage UI: GET extended with password_set / expires_at / view_count; POST accepts optional password (>=4 chars or null) + expires_at (>=today or null); Visibility & sharing card gains Password / Expiry / Views rows + normalizeShareStatus + refreshShareStatus helpers. Doctrine isolation maintained: share_links / share_views never enter lib/profilux/*.

- **a206fe3** `fix(profilux): normalize partial dates in cv-merge apply + surface 500 errors` — May 16 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED. Pack C closing fix. `app/api/members/cv-merge/apply/route.ts` adds `normalizeDate()` helper applied to each pending experience `start_date` + `end_date` before RPC: empty/null → null; YYYY → YYYY-01-01; YYYY-MM → YYYY-MM-01; YYYY-MM-DD passthrough; anything else → null. Trust boundary moved to apply route (not RPC, not schema). Required because CV parser SYSTEM_PROMPT explicitly supports partial precision dates which the RPC `NULLIF(...)::date` cast rejected ("invalid input syntax for type date: 2026-03"). Same commit: `app/dashboard/candidate/profilux/cv-merge/page.tsx` handleApply error branch now surfaces `j.error || Apply failed (${res.status})` in a dedicated red banner above the action row (was silently swallowed before). 2 files, +38/-4. Live: real atlas.pdf upload → review screen → apply with identity excluded → 5 experiences + 1 education + 1 language + 1 sector inserted atomically, cv_parsed_pending cleared, cv_parsed_data swapped to new payload, cv_parse_history.applied_at set, profile_completeness restored to 83%, Alex/Mason/Paris identity untouched. Pack C ships complete.

- **f516ccd** `feat(profilux): add CV merge review UI` — May 16 2026. SHIPPED + COOLIFY-GREEN. C.4 of Pack C. Full rewrite of `app/dashboard/candidate/profilux/cv-merge/page.tsx` (+669/-23). State machine: loading | upload | review | applying | rejecting. On mount fetches `/api/members/cv-merge/diff`; pending null → upload state (existing flow, unchanged), pending exists → review state. Upload state: identical to prior flow, but on successful parse re-fetches /diff and transitions to review instead of redirecting. Review state: 5 conditional SectionCard blocks (Identity / Experiences / Education / Languages / Sectors) — each rendered only if `diff[section].length > 0`; Identity skips unchanged entries. Defaults: 'added' entries auto-checked, 'changed' (Identity only) unchecked, 'matched' read-only badges with no checkbox. Apply payload server-side: identity → `{ field: true }` map only when checked; experiences/education/languages/sectors → arrays of indices/signatures/keys/sectors; omitted entirely if empty. Cancel + Reject all → POST /reject → router.push /profilux. Apply selected → POST /apply with built accept → router.push on success; inline error keeps selections. "{N} selected" counter + apply button disabled when zero. Styling: review section cards mirror Edit tab SectionCard chrome; badges green/gold/muted per status. 1 file. Live QA on Alex via Chrome MCP: review screen rendered correctly with all 5 sections + status badges; checkbox defaults verified (Identity 4 unchecked, Experiences/Education/Languages/Sectors auto-checked).

- **c2897c2** `feat(profilux): C.3 atomic cv-merge apply + dedup uniques + suggestion hardening` — May 16 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED. Pack C C.3 — atomic apply + race hardening. New migration `supabase/migrations/20260516_cv_merge_apply_rpc_and_uniques.sql`: 4 UNIQUE expression indexes (uniq_education_records_member_signature on `(member_id, lower(trim(institution)), lower(trim(coalesce(field_of_study,''))), coalesce(graduation_year,-1))`, uniq_member_languages_member_language, uniq_member_sectors_member_sector, uniq_work_experiences_member_company_start) + `apply_cv_merge(p_member_id, p_accept, p_new_cv_parsed_data) RETURNS jsonb` RPC — SECURITY DEFINER, service_role-only GRANT, all inserts via ON CONFLICT DO NOTHING + GET DIAGNOSTICS ROW_COUNT pattern (no IF FOUND, no EXCEPTION blocks — unexpected errors rollback the RPC), final block atomically swaps cv_parsed_data ← p_new_cv_parsed_data + clears pending + marks history.applied_at. New route `app/api/members/cv-merge/apply/route.ts`: builds accept_payload server-side from cv_parsed_pending + accept booleans/indices/signatures/keys/sectors, calls RPC, recomputes profile_completeness via resolveProfiLux mirror pattern, returns editor projection + RPC counts. Hardened `app/api/profilux/suggestions/education/route.ts` apply branch: fetch candidate L2 rows → compute signatures → match incoming signature against L2 signatures (NOT institution.ilike which could match wrong row) → reuse existing id if found; else INSERT, on insert error re-fetch + signature-match again for race recovery. Pre-flight duplicate check on 4 tables before migration apply: 0 duplicates, safe. Live test: re-apply same payload → `{ skipped_duplicates: N, inserted_*: 0 }` confirms idempotency. 3 files. Doctrine: idempotency enforced by uniq_education_records_member_signature; signature-correct lookup-first + ON CONFLICT fallback prevents duplicate inserts AND wrong-row matches.

- **99f1f32** `feat(profilux): add CV merge diff and reject endpoints` — May 16 2026. SHIPPED + COOLIFY-GREEN. C.2 of Pack C — read-only diff + clear-pending reject. New `app/api/members/cv-merge/diff/route.ts` (213 lines): auth session.user.email → member.id; reads members L2 columns + cv_parsed_pending + parallel L2 fetches (work_experiences, education_records, member_languages, member_sectors); cv_parsed_pending IS NULL → `{ pending: null, diff: null }` 200; else 5-section diff (identity per-field over 8 fields with status `unchanged | changed | added`, experiences keyed by `(company.lowercased.trimmed, start_date)`, education via computeEducationSignature server-recomputed, languages keyed by `language.lowercased.trimmed`, sectors exact match) with status `matched | added`. Read-only, zero DB writes. New `app/api/members/cv-merge/reject/route.ts` (73 lines): body `{ reason?: string }` accepted forward-compat; cv_parsed_pending IS NULL → 409 NOTHING_TO_REJECT; else clear pending + close cv_parse_history (best-effort). 2 files. Drawing apply endpoint deliberately deferred to C.3 to ship dedup/idempotency together (no L2 inserts in C.2 to avoid the same race the suggestions endpoint had before hardening).

- **5db8d59** `feat(cv-merge): C.1 pending parse state + history (cv_parsed_data untouched)` — May 16 2026. SHIPPED + COOLIFY-GREEN. C.1 of Pack C foundation. Migration `supabase/migrations/20260516_cv_parsed_pending_and_history.sql`: `ALTER TABLE members ADD COLUMN cv_parsed_pending jsonb DEFAULT NULL` (nullable, NULL = no pending parse) + new `cv_parse_history` table (id uuid PK, member_id uuid FK CASCADE, parsed_at timestamptz NOT NULL DEFAULT now(), payload jsonb NOT NULL, applied_at timestamptz NULL, applied_by_user boolean NOT NULL DEFAULT true) + index `idx_cv_parse_history_member_parsed (member_id, parsed_at DESC)` + GRANT block matching latest migration convention + RLS enabled (service-role only). `app/api/members/cv-parse/route.ts`: write target changed `cv_parsed_data` → `cv_parsed_pending`; idempotence window rewritten to check pending presence + parsed_at marker + source.cv_storage_path match against current cv_url; post-update inserts cv_parse_history row (best-effort logging on failure). Resolver UNTOUCHED — cv_parsed_pending invisible to resolver; cv_parsed_data remains source of truth for L1. profile_completeness recompute block preserved (no-op since resolver still reads cv_parsed_data). 2 files. Behavior change: re-uploading a CV no longer destroys current L1 — cv_parsed_data only changes via explicit apply (shipped in C.3).

- **5ce934e** `ui(profilux): revert section_visibility toggle from edit cards (substrate retained)` — May 16 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED. Pack F. `app/dashboard/candidate/profilux/page.tsx` only. Removed: `renderPublicToggle` function + 10 call sites across SectionCard headerActions + `sectionToggling` state + `toggleSectionVisibility` helper + SectionId import. 4 insertions / 60 deletions. Substrate retained intact: editor.section_visibility passthrough, /api/profilux POST allowlist for section_visibility, projectFor 'public' consumer, Manage tab Masked Fields card (uses separate maskToggling + toggleMaskedField). Rationale (locked by Mo this rotation): there is no PUBLIC concept on the candidate side — profile is either shared (slug active) or not; section-level visibility was a V12 prototype affordance that does not map to JOBLUX product model. Toggle was misleading. Live QA confirmed gold Edit pills alone in Edit headerActions; Manage Masked Fields card unchanged.

- **cb879c9** `fix(profilux): education L2 replaces L1 (match sectors pattern)` — May 16 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED. Resolver fix. `lib/profilux/resolveProfiLux.ts`: education merge changed from L2+L1 concat (the prior additive pattern) to L2 replaces L1 (matches sectors pattern). Symptom pre-fix: when L2 education_records present, View tab rendered 4 rows = 2 L2 + 2 L1 duplicates of same institutions. Doctrine alignment: education and sectors share L2-replaces-L1 semantics; experiences and languages stay L2+L1 concat. One line in resolver. Post-fix Chrome MCP verification on Alex: 2 L2 education rows rendered, no L1 duplicates.

- **645ab23** `ui(profilux): wire languages + sectors + maisons drawers to collections pipes` — May 16 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED. Pack A UI. `app/dashboard/candidate/profilux/page.tsx` only. New Languages add-only drawer (mirrors Career History pattern minus delete — locked L1+L2 concat means deleting is not L2-shaped today); new Sectors L2 sub-section inside Luxury Fit drawer with "+ Add sector" CTA + per-row name + rank + Save/Remove buttons; new Maisons SectionCard + textarea drawer between Clienteling and Compensation (one maison per line, posts to POST /api/profilux as brands_worked_with string array). Live QA via Chrome MCP on Alex (luxuryretailsale@gmail.com): Italian/fluent persisted as member_languages row ef736bf8-709f-4bba-a6b1-e1b9a11e216b; Watches/rank 1 persisted as member_sectors row 17022975-6f8b-4b24-b016-48328cedc214; `["Hublot","TAG Heuer"]` persisted to members.brands_worked_with text[]. All 3 collections drawer pipes verified end-to-end. 1 file.

- **09f6b86** `feat(profilux): collections pipes — member_languages PUT + sectors CRUD + maisons writable + resolver merge` — May 16 2026. SHIPPED + COOLIFY-GREEN. Pack A backend. `app/api/members/languages/route.ts` rewritten: session.user.email gate (mirrors suggestions auth pattern), GET list, POST insert with proficiency NOT NULL guard, PUT update by id + member_id, DELETE by id + member_id. New `app/api/profilux/sectors/route.ts`: full CRUD with same auth + ownership pattern (table member_sectors with sector text + rank int columns). `lib/profilux/resolveProfiLux.ts`: SELECTs member_languages (L2) and concats with cv parsed languages (L2+L1, no dedup, mirrors experiences contract); SELECTs member_sectors (L2 ordered by rank) and replaces L1 sectors when L2 non-empty (mirrors product_categories/expertise_tags pattern). `app/api/profilux/route.ts` POST: brands_worked_with added to allowlist (writes to members.brands_worked_with text[] — single column, no relational table — maisons taxonomy review deferred). Schema notes: member_languages.proficiency was NOT NULL before this rotation; route guard added to prevent 23502 on empty submits. No new tables, no migrations. 4 files.

- **26e3032** `feat(profilux): P1 section_visibility (real) + masked_fields (substrate)` — May 16 2026. SHIPPED + COOLIFY-GREEN. P1 doctrine substrate. Migration `supabase/migrations/20260515_profilux_section_visibility_masked_fields.sql`: ALTER TABLE members ADD COLUMN section_visibility jsonb DEFAULT '{}'::jsonb + ADD COLUMN masked_fields jsonb DEFAULT '{}'::jsonb. Types: SECTION_IDS const (10 entries matching live View ViewZone order), MaskableField type union (6 fields per MATRIX §16 v1.6: phone, email, current_employer, salary, availability, references), SectionVisibility + MaskedFields type shapes. Resolver: section_visibility + masked_fields read-through. projectFor 'public' case: honors section_visibility (hides sections with `[id]: false`). POST /api/profilux ALLOWED_FIELDS adds section_visibility + masked_fields. Edit tab: per-card PUBLIC ON/OFF toggle next to Edit on each of 10 SectionCards (renderPublicToggle helper). Manage tab: Manage Masked Fields card with 6 toggle rows. Subsequent reversal: Edit toggle reverted at 5ce934e (Pack F); substrate retained intact. Manage card retained. 1 migration + ~6 files.

- **4bf64be** `feat(profilux): V12-JC-3.1 — add Education manual CRUD drawer (Edit tab)` — May 15 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 6/6. V12 journey closure track CLOSES with this slice. UI consumer for the V12-JC-3.0 foundation route (`31e9813`). Direct structural mirror of the Career History drawer block in `app/dashboard/candidate/profilux/page.tsx` (`c6c7c77` pattern). New `EducationDraft` type (7 fields: id?, institution, degree_level, field_of_study, city, country, start_year, graduation_year — years as strings in draft, coerced to number | null on save). New `emptyEducationDraft()` factory. New state hooks (`educationDrawerOpen`, `educationFormOpen`, `educationDraft`, `educationSaving`, `educationError`, `educationDeleting`). Five handlers (`startNewEducation`, `startEditEducation`, `cancelEducationEdit`, `handleSaveEducation`, `handleDeleteEducation`) verbatim mirrors of Career History counterparts. New `<SectionCard eyebrow="Education">` placed between Career History SectionCard and Languages SectionCard per V12 row order. New `<Drawer title="Education">` with two-state body (form / list-with-Add-CTA). Education-specific differences from anchor: institution is the sole required field (matches NOT NULL constraint and V12-JC-3.0 contract); no `degree` field (legacy `ResolvedEducation.degree` stays null in prod, admin reads it, UI never writes it); no `is_current`/`end_date`/`description`; no client-side year validation (server `coerceYear` is the trust boundary — blank → null, strict integer only when value provided). L1/L2 distinction via `typeof ed.id === 'string'` gate: L2 rows show Edit/Delete buttons; L1 rows show verbatim italic note "Parsed from your CV. Add as a passport entry to edit." (mirrors Career History pattern exactly — no new UX inventions, no badges, no color shifts). Suggestions panel (`cv_education_suggestions`, `ed1da55` + `4d2cf7f`) and View tab Education ViewZone untouched (vertical separation prevents visual competition between CV-upload flow and manual entry). Scope: 1 file (`app/dashboard/candidate/profilux/page.tsx`), +247/-0, typecheck PASS, token symmetry vs Career History anchor PASS (33 vs 42, within tolerance per fewer field-level states), L1/L2 gate present, L1 fallback note string verified. Live QA via Chrome MCP on Alex (`mzaourmohammed@gmail.com`) — 6/6 PASS: (1) SectionCard between Career History and Languages; (2) Drawer with Add education CTA and 7 form fields; (3) Add "Test University · 2010" → save → drawer + Edit-tab + View-tab updated; (4) Edit row → form populates → modify (added MBA) → save → reflects; (5) Delete → disappears from drawer + Edit-tab + View-tab; (6) L1 SSBM/Xpro rows show italic fallback note, NO Edit/Delete buttons. Resolver order verified: L2 first, L1 second per `ea9a997` additive merge contract. No backend changes, no schema, no types, no resolver, no projector, no V12_LOCK touch, no MATRIX touch.

- **31e9813** `feat(profilux): V12-JC-3.0 — create /api/profilux/education foundation route` — May 15 2026. SHIPPED + COOLIFY-GREEN. Foundation slice of V12-JC-3 family. New file `app/api/profilux/education/route.ts` (228 lines, +228/-0). Direct structural mirror of `/api/profilux/experiences` (`c6c7c77`): same imports, same `createClient` service-role pattern, same `getServerSession`/`authOptions`/`resolveMemberId(email)` helper, same auth gate (401 Unauthorized → 404 Member not found → 400 Invalid JSON body), same error envelope shape. Education-specific differences (only legitimate diffs from anchor): table `education_records` (not `work_experiences`); required field `institution` only (matches NOT NULL constraint per S-B.0 DDL); no `is_current`/`end_date`/`description`; new `coerceYear(v)` helper — silent degradation: undefined/null/empty/decimal/negative/garbage → null, non-negative integer (string or number) → integer via `Number.isInteger`; GET order `sort_order ASC, graduation_year DESC NULLS LAST` (matches resolver `ea9a997`); response keys `{education: array}` on GET, `{education: object}` on POST/PUT, `{ok: true}` on DELETE. Write payload: institution + 4 optional strings (degree_level, field_of_study, city, country) + 2 optional years. `sort_order` never written (DB default 0). PUT path sets `updated_at: new Date().toISOString()` (mirror experiences). Validation gates: typecheck PASS (exit 0), handler signature diff vs experiences anchor PASS (identical structure, DIFFEXIT=0), response keys grep PASS (all 4 handler shapes verified), error envelopes grep PASS, `coerceYear` body verified line-by-line against spec (11 cases). No UI consumer in this slice — proven correct by V12-JC-3.1 calling it 4× successfully (POST + PUT + DELETE + implicit GET via resolver). No backend changes elsewhere. No schema. No UI. No doctrine.

- **d0e0a7ef8d7f33c2cd27899bcf36b905127bd29f** `feat(profilux): MLV-2 — remove 3 lying UI elements from ProfiLux` — May 15 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED. V12 §2.5 enforcement (HARD LOCK: no placeholders, no dead controls). Three trust-violating UI elements removed from `app/dashboard/candidate/profilux/page.tsx` in a single subtractive pass. (1) View tab LEFT SPINE "Download PDF" inert link removed (no handler existed; doctrinally misplaced per MATRIX §19A — export ships from Manage when built). (2) View tab LEFT SPINE "Visible to JOBLUX matching only" caption removed from the availability block; green dot + availability label preserved. Caption was PROVISIONAL per STATE DO NOT block since no matching consumer reads `members.availability` today. (3) Edit tab "+ Add section" trigger row + EXTEND DOSSIER `<Drawer>` removed entirely (rendered 8 inert `ADD_SECTION_LIBRARY` items at opacity 0.4, pointerEvents:none — library activation blocked on Tier 2 substrate parked under `d243fc13`). Also removed as now-unused: `addSectionDrawerOpen` state hook, `ADD_SECTION_LIBRARY` constant. Single file, 0 additions / 90 deletions, typecheck PASS, grep sanity PASS (zero matches for 5 forbidden tokens). Live-validated on `mzaourmohammed@gmail.com` (Alex) View + Edit tabs via Chrome MCP. No backend, no schema, no API, no resolver, no projector, no V12_LOCK change, no MATRIX change. Closes the launch-blocking trust subset of the V12 journey delta card (MLV-2 of 2). Next launch-blocking slice: MLV-3 Education manual Add/Edit/Delete drawer.

- **1c206ae9bd6dafa6ee6bdf5ae8c3add8672361c2** `feat(profilux): MLV-1 Phase 1.5 — wire cv-merge re-upload to real upload+parse` — May 14 2026 PM. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED. `/dashboard/candidate/profilux/cv-merge` was a visual prototype with no backend wiring. Replaced no-op `onFileChange` with real upload chain (POST /api/members/cv-upload then auto-fire POST /api/members/cv-parse, mirroring Phase 1). Added uploading/parsing/error state; redirects to /dashboard/candidate/profilux on success; surfaces errors visibly. Copy: dropped false 'review changes / field-by-field merge' promise; new title 'Re-upload your CV'; new lede 'Your CV will be re-parsed and your ProfiLux refreshed.' Removed dead 'Last upload: —' placeholder + unused `lastUploadLine` style const. 1 file, +50/-14. Live test on `mzaourmohammed@gmail.com` at 17:08 UTC: atlas.pdf uploaded → cv_url updated to `1778778473263-atlas.pdf` → parsed → identity now `Alex Mazour` → new luxai_history success row (4170 tokens) → new storage object (66994 bytes) → UI redirected back to Edit tab. Real diff/merge UI parked as future surface; MATRIX §5.1 doctrine unchanged.

- **31f6bae607f27437340c293a605b88191b19a06c** `feat(profilux): MLV-1 Phase 1 — auto-fire cv-parse after successful upload` — May 14 2026 PM. SHIPPED + COOLIFY-GREEN. Phase 0 diagnosis (read-only): 7 of 9 members with cv_url set had zero parse attempts logged in luxai_history. Root cause: `/api/members/cv-parse` requires explicit POST; main page Edit-tab upload handler never chained the call. Phase 1 fix: extend `handleFileSelected` in `app/dashboard/candidate/profilux/page.tsx` to POST cv-parse immediately after successful POST cv-upload. Parse failures surface through existing `parseError` + `mapParseError`; the existing manual 'Parse CV' button remains as retry fallback. 1 file, +23/-0. Phase 1.5 candidates flagged (cv-merge same-day fixed at 1c206ae; registration-side upload flow if any still unaudited).

- **d590afc084d76f249fa1ed6465b84a3c0348fcb8** `docs(state): close C-chain and Contract Closure Mode` — May 14 2026 PM. SHIPPED (docs-only). C-chain converged 2026-05-12 → 2026-05-14. CURRENT STEP header rewritten to reflect closure across C1 / C2-C3-C8 / C5 / C6.1 / C7.1 / C6-C7 remaining scope evaluation. Strict step order rewritten: 'No strict step queued post-C-chain. Next track requires Mo direction; no auto-derived next step.' Ledger row `0e6f3271` finalized this rotation (data hygiene only, status unchanged). No new track proposed. No MATRIX/V12_LOCK touch. 1 file, +8/-5.

- **a244b5f47bc570ad402fca6c39cc2b0e2e5612e9** `docs(profilux): lock v1.6 doctrine decisions` — May 14 2026 PM. SHIPPED (docs-only). Locks Mo's 6 May-14 PM decisions in MATRIX + STATE: maskable field set fixed at 6 fields (`phone`, `email`, `current_employer`, salary, `availability`, `references`); section visibility scoped to Public + PDF only via new §16A; Add Section canonical 8 endorsed (Awards, Certifications, Portfolio, Strategic Initiatives, Memberships, Press & features, References, Internships); Internships kept as Emerging-user exception to STATE §1 kill-word doctrine; Projects canonicalized to Strategic Initiatives with locked meaning; candidate section reordering forbidden, JOBLUX-controlled fixed order. No schema. No code. No V12_LOCK. No ledger changes. 2 files (MATRIX + STATE), +106/-37.

- **0f3d1ea** `docs(state): lock Ambiguity rule in §3 (behavioral doctrine, timeless)` — May 14 2026 PM. SHIPPED (docs-only). Locks behavioral doctrine: when a doctrinal/product/substrate/UX/scope question arises mid-task, stop, state the exact unknown, ask Mo one direct question, wait. No invented parallel paths. No domain pivots without approval. No assumption chaining. Sibling rule to Execution control rule in §3. 1 file, +2/-0.

- **61eb4da** `docs(state): close C2/C3/C8 audit — kept PARKED + ledger d243fc13 reclassified` — May 14 2026 PM. SHIPPED (docs-only). C2 (Section visibility), C3 (Add Section library activation), C8 (Section ordering) audit-first complete; all three kept PARKED due to unresolved substrate dependencies. 11 gating decisions surfaced (3+4+4); none resolved. Ledger row `d243fc13` reclassified (label only, status untouched). 4 new findings logged: F-C2-1, F-C3-1, F-C8-1, F-career-history-ghost-table (all observation_only). 1 file, +16/-9.

- **5e9eacb0096b7fa427dfb99977787785b469ea68** `docs(manage-matching): C7.1 reconcile Manage live CRUD + lock matching consent split (MATRIX §19.4, §20.x)` — May 14 2026. SHIPPED (docs-only; no build, no Coolify dependency). Reconciles two doctrinal gaps surfaced by C7 audit. (1) STATE §24 Manage bullet rewritten: Manage tab is live sharing-controls panel (reserve / regenerate slug + enable / disable sharing toggle), not the read-only v0 STATE previously described. MATRIX §19.4 added with live-control table + doctrinal anchors + scope-out list. §19.3 PARKED preserved for the broader Settings page rebuild. (2) MATRIX §20.x added (extends existing §20.5): locks `availability` (self-description) as separate from matching consent (explicit toggle, §20 PARKED). Documents provisional status of View tab "Visible to JOBLUX matching only" caption. STATE DO NOT bullet added forbidding any recruiter / ATS / matching surface from treating `availability` as consent until the explicit §20 consent toggle ships. No code change. No schema. No UI. No `members.profile_visibility` cleanup. No `profilux` ghost-table cleanup. No `/api/resume/[slug]` cleanup. No `share_slug` UNIQUE constraint work. No View caption removal. 2 files: `docs/PROFILUX_MATRIX_V1.md` (§19, §19.4, §20.x), `docs/JOBLUX_STATE.md` (§24, DO NOT, LAST SHIPPED).

- **b43fba33706f7b3394824a1ca385d2d956fa610a** `docs(export-doctrine): C6.1 lock ProfiLux export doctrine (7 answers; MATRIX §19A)` — May 14 2026. SHIPPED (docs-only; no build, no Coolify dependency). Locks the 7 export-doctrine answers from Mo (May 14): Q1 uploaded CV vs ProfiLux render coexist; Q2 export = private snapshot generated from the canonical ProfiLux resolution pipeline (implementation projection / helper deferred); Q3 candidate self-export = private full ProfiLux, recruiter/client PARKED on C-B-2/3, public PDF does not exist; Q4 public sharing stays web-first via /p/[slug]; Q5 no recruiter/client PDF; Q6 candidate self-export is private (no parallel public export); Q7 uploaded original CV remains archive/input. Surface placement: export belongs in Manage / Settings, View "Download PDF" affordance is doctrinally misplaced and parked. No PDF library. No render template. No /api/resume/[slug] retirement. No profilux ghost-table cleanup. No View placeholder removal. 2 files: `docs/PROFILUX_MATRIX_V1.md` (§13, §19, §19A, §22.1), `docs/JOBLUX_STATE.md` (§21, DO NOT, LAST SHIPPED).

- **0ef551c537baee86e43019d204b6138a36d3014c** `docs(section-truth): D1.1 reconcile MATRIX/STATE section doctrine post-V12 + post-S-B.2C` — May 14 2026. SHIPPED (docs-only; no build, no Coolify dependency). Reconciles MATRIX §6.4, §7.6.1, §15.4, §22.1, §22.2, §22.3 and STATE §24 + DO NOT block to match live View / Edit / Public truth after the V12 convergence pass (`9dabff1`, May 11) and the S-B education subgraph closure (`baeca3c` + migration `s_b_2c_drop_members_trio_education_columns`, May 13). Adds explicit ordering-persistence status block (none exists; ordering is JSX-only). Surfaces `ADD_SECTION_LIBRARY` drift (doctrine list vs UI list) and parks reconciliation under the add-library activation slice. No code change. No schema. No UI. No section registry. No add-library resolution. No LinkedIn doctrine change. 2 files: `docs/PROFILUX_MATRIX_V1.md`, `docs/JOBLUX_STATE.md`.

- **26c35466** `refactor(profilux): S-C.0 — sync CvParsedExperience with live zod + pass is_current through resolver` — May 13 2026 (PM late). SHIPPED + COOLIFY-GREEN. Foundation alignment slice for S-C Experiences family. 2 files, +8/-0. `lib/profilux/types.ts`: `CvParsedExperience.is_current: boolean` (non-null, matches live cv-parse zod since launch). `lib/profilux/resolveProfiLux.ts`: `mapExperiences()` now passes `is_current ?? false` through to `ResolvedExperience` (was previously dropped on L1 passthrough; L2 path already carried it via A2.3-β). `raw_dates_text` parsed but intentionally NOT lifted to `ResolvedExperience` (no UI consumer; future 1-line lift slice when needed). Doctrine cross-check: `351421f` additive merge contract intact; `c6c7c77` write path unchanged; no schema touch; no projection touch; no UI consumer in this slice. Live behavior delta: L1 passthrough experience rows now correctly carry `is_current` to all surfaces consuming `ProfiLuxResolved.experiences`.

- **s_b_2c_drop_members_trio_education_columns** (Supabase migration, no commit SHA) — S-B.2C DDL drop — May 13 2026 (PM). SHIPPED + DDL-APPLIED + LIVE-VERIFIED. Three columns dropped from `members`: `university`, `field_of_study`, `graduation_year`. `education_records` row `a6cc5cea` intact. Post-drop Edit + View verification passed. `education_records` is now the sole education truth surface.

- **baeca3c** `refactor(profilux): C1 slice S-B.2B — retire members.{university,field_of_study,graduation_year} trio from all code paths` — May 13 2026 (PM). SHIPPED + COOLIFY-GREEN + LIVE-VERIFIED. Subtractive only. Resolver L1-fallback bridge deleted. Trio removed from types, resolver, projectFor, `/api/profilux`, and candidate page. Education & Languages legacy card retired; read-only Languages card preserved.

- **S-B.2A backfill** (Supabase INSERT, no commit SHA) — May 13 2026 (PM). SHIPPED + DB-VERIFIED. Backfilled `education_records` from the single live trio row: `mzaourmohammed@gmail.com` / SSBM / Business Administration / 2005. Captured `l2_id = a6cc5cea-15a4-455b-bf71-43d8f139d000`.

- **4d2cf7f** `feat(profilux): C1 slice S-B.1B.4 — cv_education_suggestions UI panel on Edit tab` — May 13 2026 (PM). SHIPPED + COOLIFY-GREEN + CAPTURED-ID-VALIDATED. First user-visible Education loop: parse → propose → apply/dismiss → render → re-fire. Panel mounted on Edit tab; per-row Add to ProfiLux / Dismiss; no new primitive family.

- **ed1da55** `feat(profilux): C1 slice S-B.1B.3 — dismiss action on /api/profilux/suggestions/education` — May 13 2026 (AM). SHIPPED + COOLIFY-GREEN. Adds dismiss branch to the existing education suggestions endpoint via action union ('apply' | 'dismiss'). Same file, inline branch, no helper extraction (A3 lock). Status guard: rejects 409 ALREADY_APPLIED if `resolution_state.education[signature].status` is already 'applied' (D3 lock — undo of L2-backed row belongs to a future record-management slice). Idempotent: dismiss-after-dismissed overwrites the entry (D2 lock, mirrors S-A identity dismiss tolerance). Writes `resolution_state.education[signature]` with status='dismissed', l2_id=null, full l1_snapshot (A1 lock — type uniformity with apply path), at=now. Skips institution validation entirely — resolver-side filter (S-B.1B.2) prevents null-institution signatures from reaching the client. No `education_records` touch. Single members UPDATE only — no race window unlike apply. Recomputes profile_completeness post-write (A2 lock, no-op today, cheap safety mirror). Local 'D' suffix on dismiss-branch variables (mergedCvD / resolvedD / scoreD / updateErrD / scoreErrD) to avoid shadowing apply-branch consts. 1 file, +99/-5.

- **0799143** `feat(profilux): C1 slice S-B.1B.2 — POST /api/profilux/suggestions/education apply path` — May 13 2026 (AM). SHIPPED + COOLIFY-GREEN (deploy 03m55s, 07:46-07:50 UTC). New endpoint `app/api/profilux/suggestions/education/route.ts` (267 lines). Body `{ action: 'apply', signature: <64-hex> }`. Server resolves member by session email, recomputes signatures over current `cv_parsed_data.education[]` via computeEducationSignature, finds the matching L1 row, rejects 409 SIGNATURE_STALE if no match (L1 changed since client saw the suggestion). Defense-in-depth: rejects 400 INSTITUTION_REQUIRED if matched L1 row has null/empty institution (`education_records.institution` is NOT NULL per S-B.0 DDL). INSERTs `education_records` (member_id, institution, degree_level, field_of_study, city, country, start_year, graduation_year — sort_order omitted, DB default 0), reads returned id, merges `cv_parsed_data.resolution_state.education[signature]` with status='applied', l1_snapshot, l2_id, at, and UPDATEs `members.cv_parsed_data`. Recomputes profile_completeness post-write (no-op today — M6 scorer has no group reading view.education; G3 reads sectors/product_categories/expertise_tags/years_in_luxury, G4 reads view.experiences only; kept as cheap safety). Mirrors S-A identity endpoint auth + member resolve + jsonb merge + recompute patterns verbatim. Option α race window locked (sequential, no RPC, three failure modes documented in route header: orphan L2 row possible on UPDATE failure after INSERT — accepted v1 single-user flow, future RPC hardening path noted). Option γ signature contract locked (client sends signature only; server is single source of L1 truth). Resolver edit (`lib/profilux/resolveProfiLux.ts`, +4/-0): null/empty institution L1 rows now filtered from cv_education_suggestions before hash computation — resolver-side filter mirrors endpoint-side INSTITUTION_REQUIRED defense. 2 files, +271/-0.

- **7e96360** `feat(profilux): C1 slice S-B.1B.1 — education hash helper + cv_education_suggestions predicate` — May 12 2026 (PM late). SHIPPED + COOLIFY-GREEN + DB-VERIFIED. New `lib/profilux/educationSignature.ts` exports pure `computeEducationSignature(row)` — sha256 hex over `(institution|field_of_study|graduation_year)`, lowercase+trimmed; `degree_level`/city/country/start_year intentionally excluded (Haiku rewrites casing between parses → false re-fires). Types: `CvEducationSuggestion` + `CvEducationSuggestions` added (sibling to `CvIdentitySuggestions`, collection-shaped, FULL 7-field projection per locked Q1.b). `ProfiLuxResolved` + `EditorView` gain `cv_education_suggestions: CvEducationSuggestions` (required, default `[]`). Resolver builds the array with hash-only re-fire suppression via `resolution_state.education[hash]` (status `applied`|`dismissed` → suppress). `projectFor.projectEditorView` passes through. Barrel `lib/profilux/index.ts` exports `computeEducationSignature` + `EducationSignatureInput` + new types. Inline rename (`row` → `eduRow`, `r` → `resolution`) for shadowing safety folded in same commit. 5 files, +133/-0 (1 new + 4 modified). Live verification: both test members produce signatures `eb19259e...` (SSBM/Business Administration/2003) and `ebb32ae2...` (Xpro/Artificial Intelligence/2026), confirmed via Supabase MCP hash recomputation against `cv_parsed_data.education` jsonb. `resolution_state.education` still null everywhere (no writer). Zero user-visible change: no UI consumer reads `cv_education_suggestions` yet — S-B.1B.5 will surface it.

- **ea9a997** `feat(profilux): C1 slice S-B.1A — education collection resolver merge + degree_level reconciliation` — May 12 2026 (PM late). SHIPPED + COOLIFY-GREEN + DB-VERIFIED. Resolver SELECTs `education_records` (sorted `sort_order ASC, graduation_year DESC NULLS LAST`) and merges `view.education = [...relationalEducation, ...mapEducation(cv?.education)]` — L2 rows first, L1 rows second, no dedup, no replace, no silent L1→L2 promotion. Mirrors experiences pattern `351421f`. Type / zod reconciliation: `CvParsedEducation` + `ResolvedEducation` both gain `degree_level: string | null` (live zod has written `degree_level` since launch — this slice catches the duplicated TS type up to live data). Legacy `degree` field kept on both types for backward-compat — admin route reads `ResolvedEducation.degree` and would break if removed. `degree` is always null in production (parser never writes it); kept for contract preservation only. Removal deferred to a future type-drift cleanup slice. `ResolvedEducation` also gains optional `id?: string` (present on L2 rows, absent on L1 passthrough; mirrors `ResolvedExperience.id` semantics). `mapEducation` reads `e.degree_level` for the new field; keeps `e.degree` fallback for legacy `degree`. Zero production behavior change: `education_records` empty (0 rows) until apply endpoint ships in S-B.1B.2. 2 files, +61/-1.

- **e6bbca0** `feat(profilux): C1 slice S-B.0 — foundation plumbing for education resolution` — May 12 2026 (PM). SHIPPED + COOLIFY-GREEN + DB-VERIFIED. Foundation architecture lock for S-B family, scope locked by GPT to plumbing only: (1) DB migration `s_b_0_widen_education_records_optional_fields` widens `education_records.degree_level` + `field_of_study` to nullable (`institution` stays NOT NULL as the semantic anchor; matches `work_experiences` pattern where only job_title + company + start_date are required). Empty table at apply time (0 rows), non-destructive. (2) Types: `CvParsedDataResolutionState` gains optional `education` branch (`Record<string, CvParsedDataResolutionEducationItem>`) + sibling `CvParsedDataResolutionEducationItem` type with `status` + `signature` + `l1_snapshot` + `l2_id` + `at`. Hash function intentionally lives outside this type. No code besides types touched. 1 file, +41/-0. Behavior change: zero. Architectural significance: locks the collection-shaped resolution contract (vs S-A identity flat-record contract). Foundation card decisions (GPT + Mo, May 12 PM): content-hash keying NOT index, new endpoint NOT extension, `degree_level` + `field_of_study` nullable, `degree_level` excluded from hash, trio retirement deferred until after S-B write path stabilizes.

- **d8e6d30** `feat(profilux): C1 slice 1B.5 — honest panel copy + L2 display on suggestion rows` — May 12 2026. SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. **Closes C1 slice 1 family (S-A identity).** Panel intro corrected from "fields that are still empty" (false post-1B.2 collision detection) to "Your CV contains values that differ from your ProfiLux. Review each and apply or dismiss." Row value cell renders arrow form `<L2 or (none)> → <L1>` via Option β UI inference: if `editor[k]` resolves to the same string as `sug[k]` case-insensitive, L2 was empty (Rule-A fallback) → render `(none)`; otherwise `editor[k]` is the real L2. By construction `pickSuggestion` never fires when L1 === L2, so `X → X` is impossible. Pure UI change. 1 file, +18/-2. Live: collision rows render `Mason → Mazour` / `Paris → New York`; empty-L2 case renders `(none) → French`.

- **664f293** `feat(profilux): C1 slice 1B.4 — dismiss action + per-row Dismiss UI` — May 12 2026. SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. Extends `/api/profilux/suggestions` to accept `{ action: 'dismiss', field, value }`. Dismiss writes `resolution_state.identity.<field> = { status: 'dismissed', value, at }` only; L2 column untouched. Atomic single-row UPDATE. `profile_completeness` recompute kept (no-op for dismiss; cheap safety). UI: kills global Dismiss link, adds per-row Dismiss button beside each suggestion value (muted, small, underlined). Renames `applying`/`applyError` → `actioning`/`actionError` (single source for both apply/dismiss in-flight). Panel-wide disable while any action in flight. Button label `Working...` covers both. 2 files, +73/-34. Live: K3 (per-row) holds; K4 re-suggest holds via L1 "Mazouri" drift test.

- **97695ed** `feat(profilux): C1 slice 1B.3 — atomic apply endpoint + UI repoint` — May 12 2026. SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. New `POST /api/profilux/suggestions` accepting `{ action: 'apply', field, value }`. Identity fields only (`first_name`, `last_name`, `city`, `nationality`). Path A read-modify-write jsonb: SELECT `cv_parsed_data` → merge `resolution_state.identity.<field>` in JS → single members UPDATE writing L2 column + jsonb together (atomic at row level). Per K2 atomicity, any failure errors the whole request. Recomputes `profile_completeness` post-write. Race tradeoff documented: concurrent applies on different fields by same member could lose one resolution_state entry (last write wins); acceptable for single-user identity flow. Repoints `handleApplySuggestions` to sequential per-field loop (W1). On any field failure, loop stops, refetch fires, error surfaces to user. 2 files, NEW route 176 lines + page.tsx +21/-12.

- **5497dff** `feat(profilux): C1 slice 1B.1 + 1B.2 — resolution_state plumbing + resolver suppression` — May 12 2026. SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. 1B.1: adds `CvParsedDataResolutionItem` + `CvParsedDataResolutionState` types; appends optional `resolution_state` field to `CvParsedData` TS type and `CvParsedDataSchema` zod. Parser preserves the key on re-parse; never writes it. 1B.2: adds `pickSuggestionWithState` helper. Threads `cv?.resolution_state?.identity` through the 4 identity call sites. Suppression rule: if `state.value === current L1` (case-insensitive trim) AND `status in {applied, dismissed}` → suppress; else fire. Re-suggests when L1 changes (K4). Zero behavior change vs slice 1A — nothing writes `resolution_state` until slice 1B.3.

- **edd37f9** `feat(profilux): C1 slice 1A — identity collision detection in resolver predicate` — May 12 2026. SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. Extends `pickSuggestion` eligibility from `L1 non-empty AND L2 empty` to `L1 non-empty AND (L2 empty OR normalized L1 !== normalized L2)`. Case-insensitive diff (lowercased + trimmed). Existing 4 call sites (`first_name`, `last_name`, `city`, `nationality`) inherit collision detection automatically. 1 file, +12/-3.

- **a36866c0** `feat(profilux): strip global chrome on public slug routes + redesign hold page` — May 12 2026. SHIPPED + COOLIFY-GREEN + MO-APPROVED. C5 follow-up. `components/layout/LayoutShell.tsx` extends existing skip-chrome pattern (escape/admin/holding) with deny-list of 38 known root segments — any single-segment path NOT in the list = public ProfiLux slug → strip global Header/Footer. `app/[slug]/not-found.tsx` rewritten as true standalone full-viewport hold page with bottom-anchored JOBLUX sign-off block. Copy locked: **"This profile is unavailable."** Accepted scope tradeoff: active public profile also loses global chrome. Replaces `2596d8c0`.

- **2596d8c0** `feat(profilux): add disabled-profile hold page` — May 12 2026. SHIPPED + COOLIFY-GREEN. C5 follow-up (initial; chrome strip added in `a36866c0`).

- **81e3bbd** `fix(profilux): noStore on public profile gate` — May 12 2026. SHIPPED + COOLIFY-GREEN (live Phase A re-verification PENDING). C5 part 2. `unstable_noStore` from `next/cache` called at top of `PublicProfilePage` before any Supabase query, forces live DB read every request. Existing `dynamic='force-dynamic'` retained. Gate query shape (`.eq('share_slug', params.slug).eq('sharing_enabled', true)`) unchanged. Closes the page-level gate caching defect that 69b9d0a alone could not (root cause was per-fetch caching of Supabase queries despite `force-dynamic` on the route). 1 file, +6/0.

- **69b9d0a** `fix(profilux): hide inactive public share URL` — May 12 2026. SHIPPED + COOLIFY-GREEN. C5 part 1. `/api/profilux/share` GET handler returns `public_url: null` when `sharing_enabled=false`, even if `share_slug` exists. `share_slug` still returned in response so Manage can show reserved-but-disabled state. `can_share` semantics unchanged. Access gate at `app/[slug]/page.tsx` unchanged in this commit; security-critical comment added above the gate query. 2 files, +8/-1.

- **b400717** `fix(profilux): remove CV merge prototype rail and tighten scene` — May 12 2026. SHIPPED + COOLIFY-GREEN + MO-APPROVED. CV Merge Scene 1 final tighten after rebuild. Removed prototype rail; tightened scene composition.

- **0ebc850** `feat(profilux): rebuild CV merge scene toward V12 prototype` — May 12 2026. SHIPPED. CV Merge Scene 1 rebuild toward V12 prototype. Later partially tightened by b400717.

- **22931b7** `feat(profilux): add CV merge scene shell` — May 12 2026. SHIPPED. CV Merge Scene 1 shell.

- **1c01841** `fix(profilux-view): complete V12 scene header and full spine name` — May 12 2026. SHIPPED + MO-APPROVED. View scene header restructure with fullName spine.

- **6d283bb** `fix(profilux-view): align V12 copy labels` — May 12 2026. SHIPPED + MO-APPROVED. View copy-label finalization: `CURRENT POSITION` → `CURRENT ROLE`, `CAREER HISTORY` → `CAREER PATH`, `AVAILABILITY & TARGETS` → `AVAILABILITY`, `availabilityLabel('open')` → `Quietly considering`.

- **9dabff1** `feat(profilux-view): reorder zones to match V12 prototype sequence` — May 11 2026 (PM late-late). SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. Pure JSX block reorder inside the View IIFE of `app/dashboard/candidate/profilux/page.tsx`. New zone order: Current Position → Career History → Education → Languages → Expertise → Availability & Targets → Maisons (matches V12 prototype scene 3 v7). No styling, data, copy, or logic changes. 1 file, +79/-79.

- **0d7dfe8** `feat(profilux-view): final V12 convergence pass` — May 11 2026 (PM late-late). SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. Career History + Education rendered as 108px / 1fr timelines (period column tabular nums #8e8e8e, body role white 14/500, company/location gold #a58e28, description #8e8e8e). Current Position swapped from k/v grid to 3-column layout: 40×40 gold-bordered avatar circle (`rgba(165,142,40,0.2)` border, Playfair italic initial #a58e28) + text block (role white 15/500, company gold, seniority #999) + meta block (`total_years_experience` Playfair 22 white tabular + `Yrs experience` uppercase 9.5 #777 label). Spine action rows: `padding: 9px 0` + `borderBottom: 0.5px solid rgba(255,255,255,0.03)` on Edit ProfiLux + Manage & share; Download PDF padding only, no divider. expRows refactored from titleLine/locationDateLine to role/company/location/period/description shape. Education k/v trio (University/Field/Graduation year) removed from View; Education filled now requires `e.education.length > 0`. 1 file, +101/-59.

- **8c8ee99** `feat(profilux-view): V12 polish pass — chrome + taxonomy + spine accents` — May 11 2026 (PM late-late). SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. ViewZone restored card chrome: `background:#222`, `border:1px solid #2a2a2a`, `borderRadius:14`, `padding:'24px 26px'`, `marginBottom:18`; title reverted to Inter eyebrow style — `fontSize:10.5, fontWeight:600, color:'#8e8e8e', letterSpacing:1.8, textTransform:'uppercase'`, `paddingBottom:14, marginBottom:18, borderBottom:'0.5px solid #2a2a2a'`. Spine sub-role: Playfair italic 13.5 #a58e28. Status dot: 7×7 with `boxShadow:'0 0 0 4px rgba(29,158,117,0.15)'` green halo. Taxonomy chip rows (Expertise / Maisons / Availability) converted to dot-separated text — Maisons gold (#a58e28), others #ccc. Languages: chips → mini rows (flex column gap 6, proficiency in #999 8px-margin span). Sub-row Missing placeholders removed (hide-when-empty); top key/value grid Markers preserved. Unused `viewChipStyle` + `chipRow` consts removed. 1 file, +99/-135.

- **62ca2fb** `feat(profilux-view): V12 body pass — open dossier zones` — May 11 2026 (PM late-late). SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. Replaced 8 CollapsibleSectionCard wrappers with new `ViewZone` component (Playfair title + hairline, no toggle, no collapse state). Identity zone deleted from right field — spine now sole identity surface in View; Phone/Headline/Bio become Edit-only as locked side effect. Added `if (!filled) return null` to 6 of 7 remaining zones (Maisons keeps existing `brands.length===0` early-return). Career History role title bumped (fontSize:15, fontWeight:500). `CollapsibleSectionCard` component declaration preserved; `viewCollapse` state + `toggleViewCollapse` + `isCardCollapsed` + `ViewCollapseKey` type retained (TS noise allowed; future cleanup separate slice). 1 file, +43/-74.

- **c062764** `feat(profilux-view): add V12 two-column View shell` — May 11 2026 (PM late-late). SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. View tab IIFE rewrapped in two-column flex container (`flexDirection: isMobile ? 'column' : 'row'`, gap 32, `alignItems:'flex-start'`). LEFT SPINE (`<aside>` width 300 desktop / 100% mobile, `flexShrink:0`): masked name (Playfair 26 #fff), sub-role (job_title · current_employer), location, hairline, availability status (green dot + label + "Visible to JOBLUX matching only" caption — renders only when `availabilityLabel` returns non-null), hairline, three action links (Edit ProfiLux + Manage & share → `setTab(...)`, Download PDF as `role="link" aria-disabled="true"`, dimmed, no handler). RIGHT FIELD: 8 section cards moved in verbatim. Profile Completeness card + Readiness card REMOVED from View entirely. New `isMobile` state hook + resize listener added to main component. Identity strip removed from View; preserved in Edit tab. `lib/profilux/computeProfileCompleteness` and all callers untouched. 1 file, +73/-115.

- **0a643ec** `fix(profilux): reconcile V12 layout frame with STATE §15` — May 11 2026 (PM late). SHIPPED + COOLIFY-GREEN + CHROME-MCP-VALIDATED. Ledger `9155bd8e` closed. ProfiLux page frame now STATE §15 verbatim: centered 1200px frame, 28px gutters, all three tabs aligned as one editorial column. Drawer behavior unchanged. Parked finding logged: `ab6982db` (`F-profilux-drawer-inline-maxwidth-deadcap`, low, future cleanup only). Path C governance lesson preserved: discovered drift does not silently expand ratified scope.

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

**Lane: Pack E — Recruiting loop (E.1 + E.2 + E.3 closed, E.4 next).**

**Pack E.2 CLOSED.** Substrate (`brief_outreach` table via Supabase MCP `pack_e_2a_brief_outreach`) + GET endpoint (`2e0cb00`, after E.2b.1 + E.2b.2 hotfixes) both shipped 2026-05-18 PM. QA 9/9 PASS via Supabase MCP synthetic; net DB delta = zero.

**Pack E.3 CLOSED.** Accept axis: RPC `accept_outreach` (Supabase MCP `pack_e_3a_accept_outreach_rpc`) + POST endpoint (`0a0ebbf`) — atomic 4-write with TX rollback proven, QA 8/8 PASS. Decline axis: POST endpoint (`b31c210`) — single-UPDATE race-safe via compound WHERE, QA 12/12 PASS. Candidate response loop COMPLETE: feed + accept + decline all live.

**Pack E remaining slices (strict order):**

1. **E.4 — Client send endpoint.** New `POST /api/applications/[id]/submit-to-client`. Sets `applications.submitted_to_client_at` + auto-generates share_link with masked client projection. Pack B substrate (`masked_fields` + `share_links`) already in place. Shape decision: extend `applications` write path vs. separate write surface. Required for #16.

2. **E.5 — Notification email hooks (transverse).** 6 trigger points: profile_updated / share_viewed / new_match / completion_reminder / brief_proposed / brief_accepted. Uses existing `lib/ses.ts` + `lib/email-templates.ts`. May require 6 new email templates. Can ship after each consuming slice OR as a single batch slice at the end. Required for #18.

**Ledger anchor:** `994c50cc-53d9-4bce-9581-30ed86cd50bf` (Pack E — Recruiting loop completion).

**Out of scope this lane:**
- UI consumer for candidate-side outreach feed (UI scoping deferred until backend loop is structurally complete; ledger `1f7ccd56` notes annotated with backend-shipped status)
- Auto-matching (`computed_by='auto_v1'`) — substrate ready, engine deferred
- Admin "view matches" UI surface — deferred
- ProfiLux UI passport rebuild — gated until Pack E is closed or explicitly re-prioritized by Mo
- Brief-source accept conversion (Option C lock — applications.search_assignment_id NOT NULL not relaxed; RPC returns 501 BRIEF_ACCEPT_DEFERRED)
- Audit of existing RPC privilege posture (apply_cv_merge, submit_m6_admission may carry same anon/authenticated grant defect — parked under `F-rpc-privilege-incomplete-revoke`, ledger `bf808038`)


### DO NOT

- Touch `app/api/profilux/suggestions/route.ts` outside of new slices in the C1 family. Endpoint contract is locked: `{ action: 'apply' | 'dismiss', field: <identity_key>, value: string }`. New actions/fields/response shapes require explicit Mo approval.
- Reintroduce a global "Dismiss all" button to the S1.5 panel. K3 contract = per-row dismiss only.
- Touch `components/layout/LayoutShell.tsx` skip-chrome deny-list without confirming the candidate single-segment path is or is not a public ProfiLux slug.
- Change the arrow form rendering `<L2 or (none)> → <L1>` to use `Currently:` / `CV says:` dual labels without an explicit slice. Option β (UI inference) is locked.
- Let `editor[k] === sug[k]` reasoning leak into the resolver. The inference lives in `app/dashboard/candidate/profilux/page.tsx` only.
- Write to `cv_parsed_data.resolution_state` from any code path other than `/api/profilux/suggestions`. The CV parser preserves the key on re-parse but never writes it.
- Touch `app/api/profilux/share/route.ts` again unless sharing UX evolves. A1 refined fix (read-only visibility status, isolated from EditorView/resolver/projectFor) is shipped at `a829033`.
- Add `share_slug` or `sharing_enabled` to `EditorView` or any `lib/profilux/*` projection. Share state is read via dedicated `GET /api/profilux/share` endpoint only and sourced from `share_links` (legacy `profilux` table dropped 2026-05-18; substrate fully migrated).
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
- Touch the 7-ViewZone V12 View tab structure order or composition without an explicit doctrine reversal slice. View order is locked at commit `9dabff1` (May 11 2026): Current Role → Career Path → Education → Languages → Expertise → Availability → Maisons, with Identity as LEFT SPINE. Compensation and Clienteling are intentionally absent from View. *(MATRIX §22.1 rewritten in slice D1.1 to match V12 live composition. STATE §24 + MATRIX §22.1 now reconciled.)*
- Use Claude AI as the sole visual eye. Visual validation requires Mo + GPT against the locked prototype. Claude AI is code manager / executor coordinator; never visual judge.
- Send multi-hundred-line prompts to Claude Code. Page-level passes with crisp scope beat micro-slices; tight prompts beat sprawling ones.
- Execute autonomous GitHub MCP writes. Writes through Claude Code only, after explicit Mo approval (Propose → Wait → Approve → Execute).
- Reorder View zones away from the V12 sequence locked at `9dabff1` (Current Position → Career History → Education → Languages → Expertise → Availability & Targets → Maisons). Reordering requires an explicit doctrine reversal slice.
- Change the locked Career History timeline rendering from `0d7dfe8` (108px / 1fr grid, period column tabular nums #8e8e8e, body role white 14/500, company/location gold #a58e28, description #8e8e8e). Same lock applies to the Education timeline.
- Inject `<style>` tags, hover rules, `data-hover` / `data-spine-action` attributes, or any new style mechanism into the View tab without an explicit, scoped slice approval.
- Do not invent a new component primitive family for the cv_education_suggestions panel. Mirror S-A identity panel primitives + in-flight state pattern. Row shape (collection vs flat) is the only legitimate divergence and must be GPT-validated before code.
- Do not use timestamp-window cleanup for collection-write validation (S-B.1B.4 onward). Use captured-id pattern: before_count → apply → capture L2 row id → verify resolution_state.l2_id match → DELETE by exact id → surgical resolution_state removal → verify baseline + UI re-fire. Mo lock 2026-05-13.
- Do not reintroduce `members.university`, `members.field_of_study`, or `members.graduation_year` in any form.
- Do not delete the read-only Languages SectionCard from the Edit tab until a dedicated L2 language slice ships.
- Do not revive the combined Education & Languages SectionCard + Drawer pattern.
- Treat the View tab "Download PDF" affordance as a live export feature. It is a doctrinally misplaced VISUAL PLACEHOLDER per `docs/PROFILUX_MATRIX_V1.md` §19A.2. Any export feature ships from Manage / Settings, consumes a private full ProfiLux snapshot generated from the canonical ProfiLux resolution pipeline, and never serves a public-facing PDF (public sharing stays web-first via `/p/[slug]`). Recruiter / client PDFs are PARKED on `C-B-2` / `C-B-3`.
- Treat the `Internships` entry in `ADD_SECTION_LIBRARY` as an intentional surface-specific exception per `docs/PROFILUX_MATRIX_V1.md` §22.2 (locked v1.6, May 14 2026): Emerging-user early-career representation. Do not propose its removal on STATE §1 kill-word grounds. Kill-word doctrine elsewhere on the platform unchanged.
- Do not treat `members.availability` as a consent signal in any recruiter, ATS, matching, or third-party-facing surface. Matching consent storage shipped at `members.matching_opt_in` per MATRIX §20.5 / §20.x (B.3.3, May 17 2026). Recruiter, ATS, and matching surfaces MUST gate on `matching_opt_in === true`. `availability` is self-description and is NEVER read as consent. The View tab "Visible to JOBLUX matching only" caption was removed by MLV-2; no caption work pending.
- Do not hard-delete `members` rows from any code path. Use soft-delete via `members.deleted_at`. Hard delete is doctrine-forbidden per `docs/PROFILUX_MATRIX_V1.md` §25.2. The resolver enforces the surface cascade; service-role admin paths are the only paths permitted to read deleted rows, and must signal deleted state in UI.
- Do not derive matching consent from `members.availability`. Matching consent storage SHIPPED at `members.matching_opt_in` (B.3.3, `d53b287` + DDL via Supabase MCP, May 17 2026). Only this column may gate matching-side visibility. See MATRIX §20.5 / §20.x / §25.8.
- Do not place account-level controls (matching consent, RGPD export trigger, account deletion) inside the ProfiLux Manage tab. Manage tab is locked to share controls per `docs/PROFILUX_MATRIX_V1.md` §19.4 + §21.3. Account-level controls belong on the Settings page.
- Do not wire decline/rejection email for `business_briefs.status='closed'`. Doctrine lock 2026-05-16 PM: `closed` is silent. Internal admin meaning covers "completed" and "declined/no-go" administratively. Single DB value.
- Do not render `business_briefs.status='closed'` to clients with rejection/decline/no-go language. Client-visible label = `Closed` (capitalized, neutral). Aligns STATE §1 (confidential, discreet).
- Do not touch `/api/applications` admin-branch matching_opt_in gate. G9 enforcement (5c66a87): `matching_opt_in === true` AND `deleted_at IS NULL` required before admin POST. Self-apply branch exempt by design. Error codes `MATCHING_OPT_IN_REQUIRED` / `CANDIDATE_DELETED` / `CANDIDATE_NOT_FOUND` are the contract.

- Do not relax `applications.search_assignment_id NOT NULL`. Brief-source accept stays deferred (Option C lock, RPC returns 501 BRIEF_ACCEPT_DEFERRED). Schema mutation for brief→applications path is a separate doctrine slice.
- Do not call `accept_outreach` RPC from any code path other than `app/api/briefs/proposed/[id]/accept/route.ts`. RPC is service-role-only EXECUTE; no client-side or anon access.
- Do not write a new RPC migration with only `REVOKE FROM PUBLIC`. Supabase defaults grant EXECUTE to anon + authenticated on new public functions. Every RPC migration MUST include explicit `REVOKE EXECUTE FROM anon; REVOKE EXECUTE FROM authenticated;` alongside `GRANT EXECUTE TO service_role;`. See parked finding `F-rpc-privilege-incomplete-revoke` (ledger `bf808038`).
- Do not couple `member_brief_matches.status='converted'` to outreach decline. Q3 doctrine: converted = applications row created (i.e. accept succeeded). Decline never touches mbm status.
- Do not move source-status filtering (closed/archived) into the SQL WHERE for `GET /api/briefs/proposed`. Post-fetch JS filter is the locked posture (Mo decision E.2 Q4) — simpler for XOR LEFT JOIN shapes.
- Do not introduce stage_history rows on outreach decline. Decline writes only to `brief_outreach`. Stage history is for applications-level transitions only.
- Do not derive matching consent from `members.availability` in any Pack E surface. matching_opt_in is the only consent column. Outreach creation enforces consent at write time; feed/accept/decline do not re-check.

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
- **F-S-C-1** *(NEW 2026-05-13 PM late, observation_only)* — `cv_parsed_data.experiences[].raw_dates_text` is parsed by Haiku zod but never lifted to `ResolvedExperience` (resolver `mapExperiences` drops it). No UI consumer today. Future lift = 1 line in `mapExperiences` + 1 field on `ResolvedExperience`. No fix scheduled.
- **F-S-C-2** *(NEW 2026-05-13 PM late, observation_only)* — `work_experiences.department` column exists in L2 but is not parsed by Haiku (`CvParsedExperience` has no `department`) and not written by `/api/profilux/experiences`. Dormant L2-only column. Decision needed before any per-role department UX ships; current `members.department` is singleton and the two would conflict.
- **F-S-C-3** *(NEW 2026-05-13 PM late, observation_only)* — `work_experiences.reason_for_leaving` column exists in L2 but is not parsed, not written, and not surfaced. Fully dormant L2-only. Candidate for either DDL drop or future enrichment slice.
- **F-S-C-4** *(NEW 2026-05-13 PM late, observation_only)* — `work_experiences.sort_order` defaults to 0 on every insert; the `/api/profilux/experiences` route never writes a non-default value. Resolver orders by `start_date DESC NULLS LAST` only. If candidate-driven reorder UX ever ships, this column awakens; until then, every L2 row collides at `sort_order=0`.
- **F-C2-1** *(NEW 2026-05-14 PM, observation_only)* — Section visibility doctrinally overlaps §16 maskable layer. C2 collapses into §16 (PARKED) if "section visibility" means per-section hide-from-public; or it requires a new doctrine block if it means default-section reorderability (forbidden by V12 §2.4.4) or library-section opt-in. 3 doctrine calls needed before C2 can be scoped. No fix scheduled.
- **F-C3-1** *(NEW 2026-05-14 PM, observation_only)* — `ADD_SECTION_LIBRARY` doctrine drift, 5 specific divergences already inventoried in MATRIX §22.2: 2 doctrine-only items missing from UI (Speaking/events, Volunteer/board roles), 2 UI-only items (Projects, Internships), 1 label drift (Publications/press features ↔ Press & features), kill-word conflict on `Internships` per STATE §1, substrate present-but-wrong-shape on certifications. 4 doctrine calls + Tier 2 substrate decision needed before activation. Ledger row `d243fc13` reclassified this rotation. No fix scheduled.
- **F-C8-1** *(NEW 2026-05-14 PM, observation_only)* — Section ordering persistence absent across the entire stack. No `members.*` column, no dedicated table, no client-side storage, no React state for order. Per-card collapse is EPHEMERAL (Mo A2.8 lock). Row-level `sort_order` on `work_experiences` and `education_records` is row-level inside collections, not section-level. 4 prerequisites per MATRIX §22.3 unresolved: canonical section ID system, persistence substrate decision, scope (library-only vs default reorder), per-surface propagation contract. No fix scheduled.
- **F-cv-parse-historic-stuck-rows** `fa105cc6-affb-45ba-85ad-f1998b2e4643` *(NEW 2026-05-14 PM, observation_only)* — 7 members have `cv_url` set but `cv_parsed_data IS NULL` (pre-Phase 1/1.5 era). Phase 1 (`31f6bae`) + Phase 1.5 (`1c206ae`) fix the issue forward for all future uploads (first-upload + Replace). Backfill explicitly skipped tonight: 3 rows consent-sensitive or admin/test (Hélène BILLARD per STATE DO NOT consent block; `info@joblux.com` admin record; `luxuryrecruiter997` F-luxuryrecruiter parked). 4 real candidates can self-recover via Edit-tab Parse CV button at `app/dashboard/candidate/profilux/page.tsx` lines 2170-2177 + 2192-2199 on next login. No admin backfill endpoint added. No email outreach scheduled. Affected real-candidate IDs: `832f3f99` (yann.perioux), `4dc6254e` (vincent.decoopman), `04642106` (yachuanetiris), `7dc7d58d` (cdondas).

- **F-career-history-ghost-table** *(NEW 2026-05-14 PM, observation_only)* — Surfaced during C8 DB sweep. `public.career_history` table exists (0 rows) but is NOT documented in MATRIX §9 frozen-out tables list. Distinct from `work_experiences` (active L2 store, also 0 rows today for non-test members). Mirrors `F-stale-schema-artifacts` pattern. Disposition options at next schema-touching slice: (1) drop, (2) document in §9, (3) leave alone. No fix scheduled; out of C2/C3/C8 closure scope per Mo instruction.
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

**Last updated:** May 18, 2026 PM session 2 (post-Pack E.2 + E.3: brief_outreach substrate + GET feed `2e0cb00` + accept_outreach RPC + POST accept `0a0ebbf` + POST decline `b31c210`; candidate response loop COMPLETE — feed + accept + decline all live; QA totals 9/9 + 8/8 + 12/12 all PASS; net DB delta = 0; parked finding `F-rpc-privilege-incomplete-revoke` `bf808038` requires explicit REVOKE from anon/authenticated on future RPCs; next slice E.4 client send endpoint + masked share_link generation).

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

**Ambiguity rule:** When a doctrinal, product, substrate, UX, or scope question arises mid-task, stop. State the exact unknown in one sentence. Ask Mo one direct question. Wait. Do NOT invent parallel paths, fallback tracks, or adjacent next steps that were not requested. Do NOT pivot domains (e.g. ProfiLux → admin → hardening) without explicit Mo approval. Do NOT manufacture decisions through assumption chaining. If a decision is required to continue safely, ask instead of inferring.

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
- **Future migration GRANT lock (Supabase Data API change, effective Oct 30 2026):** JOBLUX uses Supabase Data API via `supabase-js` / PostgREST. Existing tables retain current grants — no urgent runtime issue. Every future `CREATE TABLE public.*` migration MUST include explicit `GRANT` statements. RLS + policies remain mandatory. `anon` access must be an explicit, conscious decision — never automatic — and used only when the table is intentionally public-readable. Canonical template:

```sql
  CREATE TABLE public.new_table ( ... );

  -- Required for Supabase Data API access after the Supabase grant behavior change.
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.new_table TO authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.new_table TO service_role;

  -- Only if intentionally public-readable:
  -- GRANT SELECT ON public.new_table TO anon;

  ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;
  -- + explicit policies
```

  Tracking row: admin_task `e1701dda-111c-43d3-97cd-3a01aff96bd1` (parked, low, security). Do not migrate existing tables. Doctrine + tracking only.

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
  - **Manage tab** = sharing-controls panel reading `/api/profilux/share` (backed by `share_links`). Reserve / regenerate slug + enable/disable sharing + optional password + optional expiry (B.1 family, May 16-17 2026). Account-level controls (matching consent, RGPD export, account deletion) live on Settings, NOT Manage (§19.4 + §21.3 + §25 lock).
- Storage contract: `members.*` flat columns + `cv_parsed_data` jsonb. Relational L2 collection tables: `education_records` ACTIVE end-to-end and now the sole education truth surface. `work_experiences` ACTIVE read+write since `c6c7c77`. `member_languages`, `member_sectors` still DORMANT — remaining collection migrations parked under `1609e494`. `members.{university,field_of_study,graduation_year}` trio DROPPED 2026-05-13 PM via migration `s_b_2c_drop_members_trio_education_columns`.
- Resolver: `lib/profilux/resolveProfiLux` returns `ProfiLuxResolved` (single shape, all surfaces). Emits `cv_identity_suggestions`.
- 6 surface projections via `projectFor`: dashboard / editor / public / admin / ats / client.
- Maskable layer (§16, doctrine locked v1.6): 6 fields — `phone`, `email`, `current_employer`, salary, `availability`, `references`. Schema parked.
- Section visibility (§16A, doctrine locked v1.6): candidate can hide whole sections from `public` + PDF only; internal/admin/recruiter projections complete. Schema parked.
- Share state: sourced from `share_links` table (member_id-keyed; slug + sharing_enabled + password_hash + expires_at). Read via dedicated `GET /api/profilux/share` endpoint. Stays OUT of `EditorView`, resolver, and `projectFor` (read via dedicated endpoint, not joined into the canonical resolution pipeline). Legacy `profilux` table retired 2026-05-18.
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

- Member lifecycle / trust / sovereignty layer (locked May 16/17 2026 via MATRIX §25 + §19B + §20.5; runtime shipped 2026-05-17). Soft-delete substrate at DB layer per migration `20260517_member_soft_delete` (`1b4b8c3`): `members.deleted_at` + `members.deleted_by`; RLS `Members read own` + `Members update own` require `deleted_at IS NULL`; partial unique index `idx_members_email_active` on `lower(email)` WHERE `deleted_at IS NULL`. Runtime guard live: `resolveProfiLux` returns null for soft-deleted; auth callbacks (signIn + jwt + events) gate on `deleted_at IS NULL`; share/route email lookups gated. `/api/members/delete` performs 4-step soft-delete (disable sharing + DELETE OAuth links + UPDATE deleted_at + deleted_by self). Matching consent: `members.matching_opt_in BOOLEAN NOT NULL DEFAULT false` shipped via Supabase MCP migration (B.3.3 / `d53b287`). Resolver projects flag; `EditorView` exposes it; public/client/admin/ats/dashboard projections intentionally omit (defense-in-depth verified end-to-end). `availability` is NEVER consent. RGPD export: `GET /api/members/export` (B.3.4 + B.3.4.1) returns JSON archive of 16 personal-data tables with redactions per MATRIX §19B.4 — tokens nullified, password hashes dropped + replaced by `has_password` boolean, admin operational fields excluded. Soft-deleted accounts refused with 410 Gone; admin-mediated DSAR for soft-deleted members deferred to B.3.6. Settings page `/dashboard/candidate/settings` hosts 4 cards: ACCOUNT PREFERENCES placeholder + MATCHING CONSENT toggle + DATA EXPORT anchor + DELETE ACCOUNT confirm flow. No code path may hard-delete `members` rows. Audit trail preserved by row retention. Account-level controls belong to Settings, not ProfiLux Manage.

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
- Candidate self-export (private ProfiLux PDF snapshot) — lives in Manage / Settings per `docs/PROFILUX_MATRIX_V1.md` §19A. Doctrine locked; library and template deferred. View tab "Download PDF" placeholder is doctrinally misplaced and parked for cleanup.
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
- **View tab** = candidate's PRIVATE living professional document surface. Real names, real data. No completion language. Empty sections hide. No fake interactivity. Composition (post-V12 convergence, locked at commit `9dabff1`, May 11 2026): LEFT SPINE (Identity) + 7 ordered ViewZones — Current Role → Career Path → Education → Languages → Expertise → Availability → Maisons. Compensation and Clienteling are intentionally absent from View. Reorder of the View sequence requires an explicit doctrine reversal slice.
- **Edit tab** = enrichment/data capture surface. S1.5 prefill panel + CV card + 7 per-section drawers + 11-screen tunnel.
- **Manage tab** = live sharing-controls panel. Reads `/api/profilux/share` (status), writes `/api/profilux/share` (sharing toggle), and `/api/profilux/reset-link` (reserve / regenerate slug). All three operations LIVE per `docs/PROFILUX_MATRIX_V1.md` §19.4 (May 14 2026 reconciliation). STATE doctrine reconciled with live behavior; ledger `0e6f3271` should be reviewed / closed separately if it still exists. The broader Manage v1 rebuild (maskable toggles, export, account prefs) remains PARKED per MATRIX §19.3 / §19.4 / §19A.
- **Education truth surface lock (May 13, 2026 PM):** `education_records` is the sole education truth surface across DB, resolver, types, projections, and UI. No trio resurrection on `members.*`.
- **Languages preservation lock (May 13, 2026 PM):** Edit tab Languages is a read-only SectionCard rendering L1 parsed languages inline until a dedicated L2 language collection slice ships.

**Share state isolation contract (locked May 9, 2026; substrate retired May 18, 2026):**
- Share state lives in `share_links` (member_id-keyed). Legacy `profilux` table retired 2026-05-18.
- Share state stays OUT of `EditorView`, resolver, and `projectFor`; read via dedicated `GET /api/profilux/share` endpoint only.
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

- Member lifecycle: soft-delete only, never hard delete. Resolver enforces surface cascade. Audit trail preserved by doctrine, not by side-table flagging. (MATRIX §25.)

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
