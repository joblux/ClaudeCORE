# PROFILUX V12 — WORKING-LOOP BASELINE LOCK

**Status:** Locked May 6, 2026 — re-anchored May 10, 2026 PM after drift detection
**Authority:** Subordinate to `docs/JOBLUX_STATE.md`. On conflict, STATE wins until reconciled.
**Companion docs:** `docs/PROFILUX_MODEL.md` (canonical model), `docs/PROFILUX_MATRIX_V1.md` (technical contract v1.2)
**Maintained by:** Claude AI (Opus) · JOBLUX Ops

---

## 1. WHAT V12 IS

V12 is the **strategic working-loop baseline** for the ProfiLux candidate ecosystem. Locked May 6, 2026.

**File:** `profilux_journey_v12.html` (194 KB, 6074 lines)
**Repo storage:** `docs/prototypes/profilux_journey_v12.html` (committed in Action 0-bis).
**Mo's local copy:** `/Users/momo/Downloads/profilux_journey_v12.html`

**Hash note:** repo copy SHA256 = `4c7d29e6125121a4eb70d7e2e49e06e11d243ad9d1d2d8b2be8d794c3bdb3920` (committed as `ed9e206`). Original May 6 MCP memory reference hash = `efbe5ae8d5c6c049409deb7eb3f90945da6aaeee1604eb62d634912fb843a856`. Mismatch logged 2026-05-11. Repo copy is operationally identical (same working-loop content); byte-level drift between May 6 source and current Downloads source likely due to viewer normalization or transit reformat. **Repo copy at commit `ed9e206` is the authoritative operational baseline going forward.**

V12 is the binding structural reference for the entire candidate-facing ProfiLux surface. It supersedes the April-locked `profilux-journey.html` (11-screen tunnel) which is doctrinally retired per `PROFILUX_MODEL.md` §9 and `PROFILUX_MATRIX_V1.md` §7.6.2 (RETIRED v1.1).

**Critical lesson logged (2026-05-10 PM):** Earlier interpretations treating V12 as "obsolete tunnel doctrine" or "directional only" are **INVALIDATED**. V12 was always the locked working-loop baseline. Drift happened because V12 was not anchored in repo truth — only in MCP memory and on Mo's Desktop. This doc is the remediation.

---

## 2. STRUCTURAL LOCKS — BINDING (HARD)

**Structural composition is binding unless explicitly superseded by a Mo + GPT reconciliation decision recorded in this doc and STATE.**

Any code that violates a structural lock is treated as a defect, regardless of how it shipped.

### 2.1 — Three modes

- **View** — passport mode, candidate's private read surface
- **Edit** — section drawer mode for data capture
- **Manage** — visibility / maskable controls / sharing / settings

### 2.2 — Six scenes covering full lifecycle

1. **Dashboard** — entry point (Continue ProfiLux CTA)
2. **Edit mode** — section drawer authoring
3. **View mode** — passport read surface
4. **Manage mode** — visibility/maskable controls
5. **Return user flow** — re-entry after first session
6. **CV merge re-upload modal** — diff modal on re-parse

### 2.3 — 9 default sections (always present, V12 order)

| # | V12 default section | Live prod card today | Status |
|---|---|---|---|
| 1 | Identity | Identity | aligned |
| 2 | Current role | Current Position | aligned (label drift only) |
| 3 | Career path | Career History | aligned (label drift only) |
| 4 | Education | Education (View) — combined Edit drawer temporarily | shipped 1ac1f80: View split per V12; Edit drawer combined pending L2 languages migration (ledger 1609e494) |
| 5 | Languages | Languages (View) — combined Edit drawer temporarily | shipped 1ac1f80: View split per V12; Edit drawer combined pending L2 languages migration (ledger 1609e494) |
| 6 | Expertise (sectors + tags) | Expertise (View — unified) — Edit kept split temporarily | shipped b2a7824: View unified per V12 (one Expertise card, 6 sub-rows preserving luxury relevance order); Edit kept split pending taxonomy review |
| 7 | Compensation (current + target) | Compensation | VIOLATION — see §5 |
| 8 | Availability | Availability & Targets | aligned (label drift only) |
| 9 | Maisons (brands_worked_with) | (absent) | MISSING — V12 lists Maisons as a default section |

Live prod also renders **Clienteling** as a View card. V12 does not list Clienteling among the 9 defaults. **Status: divergent — needs reconciliation decision.**

### 2.4 — 8 library sections (opt-in via "Add Section" trigger)

Triggered by a single calm "Add Section" affordance top-right of the passport. Curated library, not free-form taxonomy.

1. Awards
2. Certifications
3. Portfolio
4. Projects
5. Memberships
6. Press & features
7. References
8. Internships

None implemented in live prod today. **Status: missing — feature gap, not violation.**

### 2.5 — Behavioral rules (HARD LOCKS)

- **View-first passport** — the default landing inside ProfiLux is View, not Edit.
- **Section-specific drawers** — NOT generic forms. Each drawer is purpose-built for its section's data.
- **Add Section single calm trigger top-right** — not a sidebar, not a modal, not a wizard step.
- **Curated section library** — only the 8 above can be added; no user-invented sections.
- **Compensation NEVER in View mode** — always private regardless of public URL state. **HARDEST LOCK.**
- **No placeholders, no dead controls** — every visible control does something real.
- **No wizard / tunnel surface** — the 11-screen tunnel is doctrinally retired. Living document model only.

### 2.6 — Sections NOT in V12 today (no schema yet — Tier 1 gaps)

V12 acknowledges these fields are needed but not in the prototype substrate. They map to MATRIX §15.2 Tier 1:

- `notice_period`
- `work_authorization`
- `salary_history` (multi-row?)
- `reporting_line`
- `budget_responsibility`
- `team_size`

Schema migration parked. Sections deferred until columns exist.

---

## 3. VISUAL REFERENCE LANGUAGE — BINDING POSTURE (NOT PIXEL)

**Visual rhythm, restraint, centering, density, and premium editorial posture are binding references.**

This means: the V12 HTML expresses a luxury editorial tone that the live product must preserve. Not the exact pixels, but the felt experience.

### 3.1 — Binding visual qualities

- **Restraint** — minimal chrome, no noise. Every visible element earns its place.
- **Centering** — content is centered, not edge-aligned. The passport is a document, not a dashboard.
- **Density** — air around sections. No SaaS-table cramming. A 9-card passport breathes.
- **Premium editorial posture** — typography, hierarchy, and pacing match a luxury print editorial. Playfair Display for headings, Inter for body. Generous line-height. Italic accents used as accents, not decoration.
- **Gold restraint** — gold (#a58e28) appears as accent only, never as fill or background expanse. Max 3 uses per page per STATE §15.
- **No SaaS patterns** — no progress wizards, no toast spam, no "step 3 of 7", no aggressive notifications, no Lucide icon collages.

### 3.2 — Drift detection rules

A slice introducing any of the following is treated as a visual posture drift requiring Mo + GPT reconciliation before merge:

- Multi-column dashboard-style layouts on the passport surface
- Edge-aligned full-width content blocks
- Color-coded status banners (success/warning/danger styling)
- Iconography beyond the V12 chevron / dot vocabulary
- SaaS-style notification clusters
- Form-density data entry (over the drawer pattern)

### 3.3 — Compatibility with tonight's additive layers

- **A2.6 Missing / Review pills** — compatible with V12 posture (subtle inline pills, gold restraint honored).
- **A2.7-A neutral completeness bar** — compatible (neutral fill, no gold expanse).
- **A2.7-B Readiness card with green/gray dots** — compatible (subtle, no banner aesthetic).
- **A2.8 chevron collapse/expand** — compatible (single chevron glyph, no busy iconography).

---

## 4. NON-BINDING POLISH — OPEN TO EVOLUTION

**Micro-spacing, exact color values, typography sizing, and component dimensions are not pixel-locked.**

Implementation may evolve these freely within the §3 posture, subject only to STATE §15 design system constraints.

### 4.1 — Open to evolution

- Card padding values (currently 20px 24px in prod)
- Card border-radius (currently 6)
- Exact font-size scale (currently 10/11/13/14/18/22/28)
- Spacing scale (currently 8/10/12/16/24)
- Hover states, focus rings, transition durations
- Mobile breakpoint behavior beyond what §23 in MATRIX specifies
- Empty-state copy wording within the Missing / Review marker family
- Exact percentage placement on the completeness bar

### 4.2 — Constraints on polish evolution

Polish changes must:
- Pass STATE §15 design system checks (gold budget, contrast, layout band)
- Not introduce visual posture drift per §3.2
- Not change structural composition per §2

---

## 5. HARD VIOLATIONS — MUST FIX

### 5.1 — Compensation in View mode

**Live prod:** `app/dashboard/candidate/profilux/page.tsx` renders Compensation as §22.1 row 9 in the View tab.

**V12 lock:** "Compensation NEVER in View mode (always private regardless of public URL state)." — §2.5 hardest lock.

**Status:** OBJECTIVE VIOLATION. Not a stylistic divergence. Direct contradiction of a behavioral lock.

**Fix scope:** Remove Compensation SectionCard from the View IIFE only. Edit tab Compensation drawer stays (private editing is fine). Manage tab unaffected. Schema unaffected. Resolver / projector / API unaffected.

**Tracking:** Deferred to the next session per Mo's 2026-05-10 PM freeze decision. Logged in ledger as V12-violation-1.

---

## 6. ROADMAP DIVERGENCES — NUANCED, RECONCILE DELIBERATELY

These are NOT hard violations. They are evolutions that may or may not be intentional, requiring a Mo + GPT call to ratify or correct.

### 6.1 — Section composition

| V12 baseline | Live prod | Reconciliation needed |
|---|---|---|
| Education separate / Languages separate | Education & Languages combined into one card | Decide: split per V12, OR keep combined and update V12 doctrine |
| Expertise unified (sectors + tags) | Luxury Fit (sectors/product_categories/expertise) + Skills & Markets (key_skills/market_knowledge) — 2 cards | Decide: unify per V12, OR keep split and update V12 doctrine |
| Maisons (brands_worked_with) as standalone section | absent from View | Decide: add Maisons section, OR drop from V12 if brands_worked_with usage is recruiter-only |
| Clienteling absent from V12 9-default | rendered as View §22.1 row 7 | Decide: keep (V12 expansion), OR move to library (opt-in), OR drop from View |

**Resolution log:**

- 2026-05-11 — V12-divergence-1 (ledger 034bf165) — Education + Languages:
  RESOLVED A-lite. View split into 2 cards per V12 baseline.
  Doctrine commit 5ae3bc2, code commit 1ac1f80, prod QA passed via
  Chrome MCP (9-card V12 order verified, Compensation absent from View,
  Edit drawer combined retained). Edit tab keeps one combined
  "Education & Languages" drawer temporarily; will split when L2
  languages substrate ships (ledger 1609e494). MATRIX §22.1 reflects
  the new row 5 (Education) + row 6 (Languages) composition.

- 2026-05-11 — V12-divergence-2 (ledger 99b61c19) — Expertise unified vs split:
  RESOLVED C.2. View unifies Luxury Fit + Skills & Markets into a single
  "Expertise" card per V12 baseline (V12 prototype state engine line 5194).
  Doctrine commit e690ce2, code commit b2a7824, prod QA passed via Chrome
  MCP (8-card V12 order verified; Expertise card shows 6 sub-rows in locked
  order: Years in luxury → Sectors → Product categories → Areas of expertise
  → Skills → Markets; standalone Luxury Fit + Skills & Markets cards absent
  from View; Edit tab Luxury Fit + Skills & Markets SectionCards + drawers
  retained). "Years in luxury" and "Sectors" sit visibly above the
  skill/market chips to preserve JOBLUX luxury relevance while honoring
  V12's single-card structure. Edit tab keeps the two existing SectionCards
  (Luxury Fit + Skills & Markets) and their two drawers — split is
  intentional, pending taxonomy review (NOT substrate-blocked; distinct
  from divergence-1's L2-migration gate). MATRIX §22.1 reflects the new
  unified row 3 (Expertise) composition.

### 6.2 — Missing structural features

- **Add Section library trigger** — V12 locks this as the only path to add sections 10-17. Not implemented.
- **Manage tab maskable controls** — V12 puts per-field visibility toggles here. Live prod Manage = read-only sharing status only.
- **CV merge re-upload modal** — V12 scene 6. Not implemented. Current `/api/members/cv-parse` re-runs L1 overwrite-in-place per MATRIX §5.1, but no merge UX surfaces the diff.

### 6.3 — Tonight's additive layers (A2.6 / A2.7 / A2.8)

Already cross-checked in §3.3. All compatible with V12 posture. None violate structural locks. Treat as intentional extensions of the V12 baseline.

---

## 7. AUTHORITY HIERARCHY

When V12, STATE, MATRIX, MODEL conflict:

1. **STATE wins** by `PROFILUX_MATRIX_V1.md` §12.1 ("On conflict, STATE wins").
2. STATE must reconcile to V12 when divergence is detected — V12 is the locked baseline. STATE drift away from V12 without explicit Mo + GPT decision is a doctrine breach.
3. MATRIX / MODEL inherit from V12 structurally. Where MATRIX §22.1 lists 9 sections that diverge from V12 9 defaults, MATRIX is the drift candidate, not V12.
4. **2026-05-10 PM lesson logged:** V12 was mentioned in MATRIX §14.4 only as a parenthetical principle ("locked v12 prototype principle, May 6"), never as an anchored doctrine reference. STATE and MODEL did not reference V12 at all. The parenthetical was too weak to prevent drift. This doc is the remediation. STATE §25 (added in the same commit as this correction) anchors V12 as a first-class doctrine reference.

---

## 8. ENFORCEMENT RULE — FUTURE SLICES

Any future slice touching `app/dashboard/candidate/profilux/page.tsx` View / Edit / Manage tabs MUST:

1. Read this doc BEFORE scoping.
2. Cross-check the slice's proposed changes against §2 (structural locks) and §3 (visual posture).
3. Flag any drift (intentional or accidental) in the scoping output, with explicit reference to the §2 or §3 clause potentially violated.
4. Refuse to ship structural drift (§2) without an explicit Mo + GPT reconciliation decision.
5. Surface visual posture drift (§3) as a flag for Mo review before merge.
6. Polish changes (§4) may proceed under normal slice review.

This is now a hard process gate, equivalent to STATE / MATRIX / MODEL reads.

---

## 9. CHANGE CONTROL

To update V12:

1. Mo + GPT decide a structural change.
2. New V13 (or V12.1) HTML produced.
3. THIS DOC updated in the same commit.
4. STATE referenced and updated if the change reaches doctrine layer.
5. Memory entry updated via memory_update or new memory_store with versioned tag.
6. Repo prototype file in `docs/prototypes/` replaced or added (versioned alongside V12).

V12 cannot drift silently again.

---

*End of PROFILUX_V12_LOCK.md*
