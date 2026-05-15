# STATE rotation — 2026-05-15 PM close

Apply 4 changes to `docs/JOBLUX_STATE.md` (file SHA `020035d42f652a02d7ccb12cd4788d5ddf3bacee`).

---

## CHANGE 1 — Prepend 5 entries to `### LAST SHIPPED`

Insert ABOVE the existing `**4bf64be**` entry. Do not alter existing entries.

- **2ddb268** `docs(state): close 2026-05-15 PM — V12 PF-2 lane complete + doctrine absorption session` — May 15 2026 PM. SHIPPED (docs-only; STATE rotation, no code). Closes the V12 Product / Prototype Fidelity implementation lane (PF-2a + PF-2b.1 + PF-2b.2). Promotes the 4 PF commits from CURRENT STEP narrative into LAST SHIPPED. Records the doctrinal absorption session: 5 official doctrinal sources locked (REFONDATION, MODEL, MATRIX, UX_MAP, V12_LOCK); precedence order locked (V12 > UX_MAP > MATRIX > MODEL > REFONDATION); `WORKFLOW_RULES.md` excluded from doctrinal input. CRITICAL ARTIFACT produced this session: `docs/V12_DECISION_MATRIX.md` (pure doctrinal artifact built from committed repo truth via GitHub MCP only — STATE/live excluded — 110 DECIDED + 8 CONTRADICTION + 18 OPEN entries, every entry carries mandatory execution consequences). NEXT SESSION ENTRY POINT (STRICT): "OPEN Resolution Session" — produce `docs/PROFILUX_OPEN_RESOLUTION.md` from the 18 OPEN items, with per-OPEN: doctrinal context + impact + options + recommendation + Mo final decision + execution consequence → LOCKED. Triage proposed (Mo to confirm at next session open): A = 5 BLOQUANTS (O-1 Clienteling / O-5 canonical section IDs / O-6 Tier 1 schema shape / O-8 Consent field / O-14 Manage architecture) → resolve first; B+C+D = post-launch / infrastructure / polish — do not block Reloaded closure. STATE rotation only. No code. No schema. No V12_LOCK touch. No MATRIX touch.

- **18e9003** `feat(profilux): V12-PF-2b.2 — Edit section row hierarchy inverts to match View` — May 15 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED. V12-PF-2b.2 closes the PF-2 implementation lane on Edit hierarchy convergence against the locked V12 prototype. Career History rows render title-bold-first (`Boutique Leader — Hublot`). Education rows render 3-line stack: program/degree white bold / institution · city gold / year. Matches View hierarchy shipped at PF-1 (`f53a7ef`). Live QA PASS on Alex Mason (`mzaourmohammed@gmail.com`). Scope: section row hierarchy only. No schema. No backend. No resolver. No projector. No V12_LOCK touch. No MATRIX touch.

- **8266651** `feat(profilux): V12-PF-2b.1 — SectionCard headerAction refactor` — May 15 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 9/9. V12-PF-2b.1. All editable SectionCards in Edit tab now render eyebrow LEFT + Edit button RIGHT on the same row, empty inner wrapper row removed. SectionCard component change is additive — callers without `headerAction` render identically. Drawer onClicks preserved verbatim across all 9 sites including compound handlers on Career History (`setCareerHistoryDrawerOpen + cancelExperienceEdit`) and Education (`setEducationDrawerOpen + cancelEducationEdit`). Non-editable SectionCards (CV, Apply suggestions, Add education, Languages, Visibility & sharing) unchanged. Live QA layout 9/9 PASS on Alex Mason; drawer wiring not click-tested in this slice, code-path proof accepted. No schema. No backend. No V12_LOCK touch. No MATRIX touch.

- **3a5de09** `feat(profilux): V12-PF-2a — Edit page chrome + entry posture` — May 15 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 7/7. V12-PF-2a unifies Edit/Manage chrome with the View pattern (breadcrumb-LEFT + tab-pill-RIGHT), removes Edit H1 `ProfiLux`, adds `Re-upload CV` + `Done →` top-right pill actions, adds the `PROFILUX OVERVIEW` progress band and the `YOUR DOSSIER` eyebrow. Existing CV / Apply suggestions / Add education / Identity cards untouched (PF-2b scope). Live QA 7/7 PASS on joblux.com. No schema. No backend. No resolver. No projector. No V12_LOCK touch. No MATRIX touch.

- **f53a7ef** `feat(profilux): V12-PF-1 — View tab posture pass` — May 15 2026. SHIPPED + COOLIFY-GREEN + LIVE-VALIDATED 8/8. V12-PF-1 brings the View tab posture to match the locked V12 prototype across the LEFT SPINE + 7 ViewZones. Live QA 8/8 PASS on Alex Mason (`mzaourmohammed@gmail.com`). Caveat: Current Role `Since <date>` and Education `start_year–graduation_year` range passed by fallback omission — Alex lacks `is_current=true` + `start_date` and education `start_year`. Code path verified; visual proof deferred until a full fixture exists (parked observation, no fix scheduled). View order remains locked at `9dabff1`. No schema. No backend. No resolver. No projector. No V12_LOCK touch. No MATRIX touch.

---

## CHANGE 2 — Replace `### CURRENT STEP — strict order` block entirely

Replace from the `### CURRENT STEP — strict order` header through end of that section, stopping BEFORE the `### DO NOT` header (keep the `### DO NOT` header intact).

### CURRENT STEP — strict order

**Lane: ProfiLux — OPEN Resolution Session (BLOCKING ALL EXECUTION).**

The 2026-05-15 PM session terminated the path-fragmentation pattern that had been recurring since 2026-05-10. Root cause: doctrine was being re-questioned during execution slices, decisions classified as DECIDED were being silently reopened, and live/prototype divergences were being treated as doctrinal contradictions.

Remediation locked this session:
1. 5 official doctrinal sources locked: REFONDATION, MODEL, MATRIX, UX_MAP, V12_LOCK.
2. Precedence order locked: V12 > UX_MAP > MATRIX > MODEL > REFONDATION.
3. `WORKFLOW_RULES.md` explicitly EXCLUDED from doctrinal input (process, not product doctrine).
4. STATE = execution truth; MATRIX layer = doctrinal truth; do not mix layers.
5. `docs/V12_DECISION_MATRIX.md` artifact produced from committed repo truth only via GitHub MCP. 110 DECIDED / 8 CONTRADICTION / 18 OPEN. Every entry carries mandatory execution consequences.

**Strict step order:**

1. Open `docs/V12_DECISION_MATRIX.md` (committed this rotation).
2. Produce `docs/PROFILUX_OPEN_RESOLUTION.md`. For each OPEN: doctrinal context → impact → options → recommendation → Mo final decision → execution consequence → LOCKED.
3. Mo confirms triage. Default proposed triage:
   - **A. BLOQUANTS — Reloaded closure (5 items, resolve first):** O-1 Clienteling · O-5 Canonical section identifier system · O-6 Tier 1 schema shape · O-8 Consent column name + type · O-14 Manage architecture.
   - **B. IMPORTANTS — post-launch:** O-7 · O-13 · O-2/O-3/O-4.
   - **C. INFRASTRUCTURE — pure substrate:** O-9 · O-10 · O-16.
   - **D. POLISH / FAUX-BLOQUANTS — do not slow Reloaded:** O-11 · O-12 · O-15 · O-17 · O-18.
4. Resolve A first. B + C + D resolved in subsequent focused sessions or kept OPEN without blocking Reloaded.
5. Once A is LOCKED, V12-PF lane resumes from "Edit surface convergence review" (read-only walk of joblux.com Edit tab against V12 prototype scene 2). No code, no new slices, no surfaces until review completes.

**V12 PF lane status (paused, not abandoned):** PF-1 (`f53a7ef`) · PF-2a (`3a5de09`) · PF-2b.1 (`8266651`) · PF-2b.2 (`18e9003`) — all SHIPPED and LIVE-VALIDATED. PF-2 implementation lane complete on posture/chrome/hierarchy. Edit surface convergence review BLOCKED on OPEN Resolution A-triage closure.

**V12 launch-blocking functional subset (unchanged, all closed):** V12-JC-1 · V12-JC-2 · V12-JC-3.

**Naming convention lock:** V12-JC-N = closure subset; V12-PF-N = fidelity slices; MLV-x retired.

**Acceptable post-launch (unchanged):** maskable toggles, section-hide toggles, Add Section activation, Tier 1, CV merge modal, Languages L2 CRUD.

**Audits closed prior rotation (still parked):** S-D Sectors (`1609e494`), C2/C3/C8 substrate (`d243fc13`).

**C1 status:** S-A CLOSED · S-B CLOSED · S-C CLOSED · S-D PARKED · C2/C3/C8 PARKED.

**Ledger this rotation:** no writes.

**Handoff doc this rotation:** `docs/HANDOFF_2026-05-15-PM.md`.

**EXECUTION_PLAN status:** paused for OPEN Resolution. Resumption sequencing decided after A-triage LOCKED.

---

## CHANGE 3 — Append 6 bullets to END of `### DO NOT` block (before `### PARKED`)

- Do not reopen any decision classified as DECIDED in `docs/V12_DECISION_MATRIX.md`. DECIDED = locked. Reopening requires explicit Mo doctrine-reversal slice. Drift-reset phrase: "doctrine decided but not executed ≠ OPEN".
- Do not treat live/prototype divergences as doctrinal contradictions. A live UI divergence from doctrine is an execution gap, not a doctrinal re-question. CONTRADICTION class is reserved for source-to-source disagreements among the 5 doctrinal docs only.
- Do not consult `WORKFLOW_RULES.md` as a doctrinal input for ProfiLux product decisions. It governs process; excluded from the 5-source doctrinal precedence locked 2026-05-15 PM.
- Do not absorb doctrine from project-attached file copies or uploaded snapshots when GitHub MCP is available. Committed repo truth via GitHub MCP is the only legitimate doctrinal input.
- Do not start any ProfiLux execution slice at next session open before `docs/PROFILUX_OPEN_RESOLUTION.md` is produced and A-triage BLOQUANTS (O-1, O-5, O-6, O-8, O-14) are LOCKED.
- Do not chain new audit cycles onto OPEN Resolution Session. Decision-only → LOCKED → exit.

---

## CHANGE 4 — Replace footer block at bottom of LAST SHIPPED section

Find:

**Last updated:** May 15, 2026 (V12-PF-2b.2 live-validated via `18e9003`, closing PF-2 implementation lane). V12 Product / Prototype Fidelity progression: PF-1 `f53a7ef` (View), PF-2a `3a5de09` (Edit chrome), PF-2b.1 `8266651` (SectionCard headerAction), PF-2b.2 `18e9003` (Edit row hierarchy). PF-2 lane complete on posture/chrome/hierarchy. Next: Edit surface convergence review (read-only) before next slice or surface.
**Maintained by:** Claude AI (Opus) · JOBLUX Ops

Replace with:

**Last updated:** May 15, 2026 PM (STATE rotation `2ddb268`: PF lane closure promoted into LAST SHIPPED + doctrine absorption session recorded + OPEN Resolution Session locked as strict next step). V12 PF progression: PF-1 `f53a7ef` · PF-2a `3a5de09` · PF-2b.1 `8266651` · PF-2b.2 `18e9003`. PF-2 lane complete. PF lane PAUSED pending OPEN Resolution Session A-triage (O-1, O-5, O-6, O-8, O-14) LOCKED. Critical artifact this session: `docs/V12_DECISION_MATRIX.md` (110 DECIDED / 8 CONTRADICTION / 18 OPEN). Next: OPEN Resolution Session → produce `docs/PROFILUX_OPEN_RESOLUTION.md` → LOCK A-triage → resume PF.
**Maintained by:** Claude AI (Opus) · JOBLUX Ops

END OF STATE ROTATION PATCH
