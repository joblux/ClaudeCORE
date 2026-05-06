# PROFILUX RELOAD — UX MAP

Canonical UX architecture capture for the ProfiLux Reload.

This document **freezes the approved UX direction** before frontend rewrite begins. It is doctrine capture, not implementation. No code follows from this file directly — implementation requires scoped sessions per Phase 4 onwards.

**Status:** locked May 6, 2026
**Maintained by:** Claude AI · JOBLUX Ops

---

## 0. Source hierarchy and provenance

This document draws from two source classes. Provenance is marked at every section.

### 0.1 — Locked repo doctrine (authoritative)

- `docs/JOBLUX_STATE.md` (HEAD `fb2e14a`, May 6 2026 PM) — supreme execution truth
- `docs/PROFILUX_MODEL.md` (locked May 6 2026, 218 lines) — canonical product model
- `docs/PROFILUX_MATRIX_V1.md` v1.1 (locked May 6 2026, 783 lines) — implementation contract

When this UX map cites these, the cite is **doctrine-locked**.

### 0.2 — Approved UX capture (pending MATRIX promotion)

- v12 ProfiLux candidate ecosystem HTML prototype (visual + interaction baseline, approved)
- May 6 mission prompt (UX direction lock)

When this UX map cites these, the section carries the label **"Approved UX capture — pending MATRIX promotion."** These sections preserve validated intent but require a future MATRIX patch (§§21+) to become full repo doctrine. See §13.

### 0.3 — On conflict

`docs/JOBLUX_STATE.md` wins. Then `docs/PROFILUX_MATRIX_V1.md`. Then `docs/PROFILUX_MODEL.md`. Then this UX map. Then approved-capture sources.

---

## 1. Core doctrine

**Source:** MODEL §§1–2; MATRIX §2; STATE §24. Doctrine-locked.

ProfiLux is a single living professional profile object, owned continuously by the user. It is simultaneously: resume, recruiter profile, matching profile, share profile, export profile, living career passport. Every projection (self dashboard, ATS, recruiter view, public share `/p/[name]`, PDF exports, matching layer) reads the same object.

### 1.1 — What ProfiLux is

- A living, continuously-owned professional object
- The single canonical record per candidate
- The substrate for all five faces (candidate / client / admin / external share / system) per MATRIX §2

### 1.2 — What ProfiLux is NOT

- Not a wizard
- Not a submission object
- Not a pending state
- Not approved by Mo
- Not frozen / locked / finalized
- Not a job-board profile
- Not a duplicate of the CV

### 1.3 — Mo approval scope (narrow)

Per MATRIX §2 + STATE §24: Mo approves only **platform access at registration** and **contributions** (brand corrections, salary data, insider voices). **Never ProfiLux itself.** ProfiLux grows continuously through user edits; there is no submit/finalize gate.

### 1.4 — Matching entry replaces admission

Per MATRIX §20 + MODEL §8. Matching entry is a backend-only readiness signal. No user-facing confirm action. No threshold percentage. No "Pending Candidate" state. Computed from Tier 1 core fields when those land + explicit consent (future, not derived from `availability` by default).

### 1.5 — Substrate survives the rewrite

Per MATRIX §13 (non-goals): the `EditorView` projection (§7.6.1), the L2 write contract (§4.5), the resolver and projector utilities (§10), the vocabulary contract, the parser contract — all survive. The UX shell changes; the substrate does not.

### 1.6 — Drift reset phrase

Per STATE §24:

> *"living object, not wizard / not submission / not approval"*

---

## 2. Ecosystem architecture — View / Edit / Manage

**Source:** Approved UX capture (May 6 mission + v12 prototype) — **pending MATRIX promotion.**

MATRIX §14.1 locks "view-first passport" and §14.2 locks the inline/drawer/modal hierarchy. The explicit **three-mode triad (View / Edit / Manage)** as named modes is an extension of MATRIX doctrine into a UX architecture. It must be promoted to MATRIX §21 (or equivalent) before becoming repo-locked. See §13.

### 2.1 — View mode (default landing)

The candidate's passport. What they see when they land on `/dashboard/candidate/profilux`.

**Responsibilities:**
- Render the living ProfiLux as a curated read view
- Surface state markers (Missing / Review / AI inferred — per §6)
- Anchor the user mental model: *this is my passport*
- Provide entry points into Edit interactions

**Belongs in View:**
- Identity strip (name, headline, location)
- Section cards (collapsed/expanded, see §4)
- Completion bar
- Sidebar readiness breakdown (per MODEL §4)
- Entry affordances to Edit drawers

**Does NOT belong in View:**
- Wholesale editing forms
- Sharing/export controls (those belong in Manage / Settings — §9)
- Admin-only fields
- Privacy / maskable toggles (Manage)

### 2.2 — Edit mode (per-section drawer)

Triggered from any section card. Edit mode is **section-scoped**, not page-scoped. There is no global edit toggle.

**Responsibilities:**
- Allow the user to edit one section at a time via drawer
- Apply L2 writes per MATRIX §4.5 (W1 empty-string coercion, W2 partial-body, W3 recompute)
- Honor inline-vs-drawer-vs-modal hierarchy per MATRIX §14.2

**Belongs in Edit:**
- Drawer content for the active section only
- Inline editors for short fields where the field IS the affordance (single-line text, single-select)
- Validation, save state, dirty tracking
- Confirm/dismiss for AI-inferred values (per MODEL §4)

**Does NOT belong in Edit:**
- Sharing/export controls
- Privacy / maskable toggles
- Account preferences
- Destructive irreversible actions (those use modals — MATRIX §14.2)

### 2.3 — Manage mode (configuration scope)

**Approved UX capture — pending MATRIX promotion.**

Manage covers configuration of how the ProfiLux is exposed and shared, as distinct from authoring its content.

**Responsibilities:**
- Public URL activation toggle (per MATRIX §18)
- Maskable field toggles (per MATRIX §16)
- Export controls (download PDF, share PDF)
- Account preferences (notifications, contact)

**Belongs in Manage:**
- All items above

**Does NOT belong in Manage:**
- Authoring of profile content (that is Edit)
- Sectional editing (that is Edit drawers)

**Relationship to Settings (per §9):** MATRIX §19 defines a "Settings surface." Manage and Settings refer to the same conceptual surface. Implementation may render them as one page or as a tab within the passport — that decision is parked. The doctrine is: configuration is separated from authoring.

### 2.4 — Transitions

- **View → Edit** = section-scoped, opens drawer
- **Edit → View** = drawer dismiss (saved or cancelled)
- **View → Manage** = navigation affordance (location TBD per implementation)
- **Manage → View** = back navigation
- **No persistent global edit mode.** The user is never in "edit-everything-at-once" state.

### 2.5 — User mental model

The user is **always in View**. Edit is a transient drawer. Manage is a separate surface. The passport is the home.

---

## 3. Section architecture

**Source:** Approved UX capture (v12 prototype + May 6 mission) — **pending MATRIX promotion.**

The **9 default sections + 8 add-library sections** structure is captured from the v12 prototype and May 6 mission. MATRIX v1.1 retires the §7.6.2 11-screen tunnel but does not yet lock a replacement section catalog. This must be promoted to MATRIX before becoming repo-locked. See §13.

### 3.1 — 9 default sections (always present, ordered)

The default passport renders these nine sections in fixed order. They cover the core ProfiLux fields per `EditorView` (MATRIX §7.6.1):

1. **Identity** — first_name, last_name, city, country, nationality, phone, headline, avatar
2. **Current Position** — job_title, current_employer, seniority, total_years_experience
3. **Luxury Fit** — years_in_luxury, sectors (L1), product_categories, expertise_tags
4. **Career History** — experiences (L1 passthrough)
5. **Education & Languages** — university, field_of_study, graduation_year, education[], languages[]
6. **Skills & Markets** — key_skills, market_knowledge
7. **Clienteling** — clienteling_experience, clienteling_description
8. **Availability & Targets** — availability, desired_locations, desired_departments, desired_contract_types, open_to_relocation, relocation_preferences
9. **Compensation** — desired_salary_min, desired_salary_max, desired_salary_currency

**Provenance note:** the field assignments above mirror MATRIX §7.6.1 `EditorView` exactly — that part is doctrine-locked. The grouping into 9 named sections **is approved capture, pending MATRIX**.

### 3.2 — 8 add-library sections (opt-in)

The candidate can extend the passport with credibility sections from a library. These map to MATRIX §15.3 Tier 2 fields (PARKED — schema not yet built):

1. **Certifications** (structured)
2. **Awards**
3. **References**
4. **Portfolio**
5. **Publications / press features**
6. **Memberships**
7. **Speaking / events**
8. **Volunteer / board roles**

**Status per MATRIX §15.3:** Tier 2 schema does not exist on `members.*` today. Each section requires a new column or relational table + `MemberRow` extension + `ProfiLuxResolved` field + `EditorView` field + write payload. The 8-item list above is **approved capture for the UX library**; the schema work is parked.

### 3.3 — Section ordering philosophy

- **Default 9** are ordered by recruiter/matching priority: identity → current role → fit → history → credentials → execution → clienteling → readiness → comp.
- **Add-library 8** are ordered by frequency-of-use (estimated). Final ordering decided when sections ship.
- Order is **fixed in v1**. User cannot reorder default sections.
- User can show/hide add-library sections individually.

### 3.4 — Removable vs permanent

- **Permanent (cannot remove):** all 9 default sections.
- **Removable (opt-in/out):** all 8 add-library sections.
- Empty default sections are visible but render an empty state (per §6 markers).

### 3.5 — Expansion philosophy

The passport grows by adding sections from the library, not by exploding the default into more screens. New canonical fields land in a default section (Tier 0/1) or as an add-library section (Tier 2).

---

## 4. Card architecture

**Source:** MODEL §4, MATRIX §14.4. Doctrine-locked.

Every section renders as a **card**. Cards are the unit of visual rhythm in the passport.

### 4.1 — Section cards

- One card per section (default + opted-in library)
- Card title = section name
- Card body = section content (collapsed or expanded)
- Card edit affordance = drawer trigger (per §5)

### 4.2 — Information density

- **Collapsed state:** card title + 1–2 line summary of section content (e.g. "Senior Manager · LVMH · 12 yrs experience" for Current Position).
- **Expanded state:** all section fields rendered as labelled rows.
- Default state per section: TBD by implementation. Recommendation: collapsed for sections with summary line, expanded for empty-state sections (to nudge completion).

### 4.3 — Luxury shell principles

Per MATRIX §14.4: visual shell follows the dark luxury design system. Functional engine is real — no placeholders, no dead controls.

### 4.4 — Read vs Edit behavior

- **Read (View mode):** card shows current values; edit affordance opens drawer.
- **Edit (drawer open):** card stays in place; drawer overlays/slides; saving updates card content live on dismiss.

---

## 5. Drawer architecture

**Source:** MODEL §4, MATRIX §14.2. Doctrine-locked.

Editing is drawer-first. The passport stays visible.

### 5.1 — Drawer-based editing philosophy

Per MATRIX §14.2: drawer is for **rich object editing** (multi-field forms, multi-select chip groups, structured items like experience entries, education entries). One drawer per section.

### 5.2 — Inline edit (the small exception)

Per MATRIX §14.2: inline edit is allowed only when **the field IS the affordance** — single-line text, single-select. Examples: headline, phone. Inline edit is the exception, not the default.

### 5.3 — Modal usage restrictions

Per MATRIX §14.2: modals are **reserved for destructive actions only** — delete confirmation, irreversible operations. No modals for primary edits. No tunnels. No multi-step wizards.

### 5.4 — Section-specific editing flows

Each section drawer is independent:
- Identity → form drawer
- Current Position → form drawer (snake_case write per MATRIX §4.5 W2)
- Luxury Fit → chip multi-toggle drawer
- Career History → list drawer with per-entry editor (Tier 2 / future)
- Education & Languages → form drawer + L1 passthrough display
- Skills & Markets → chip multi-toggle drawer
- Clienteling → tri-state Yes/No + conditional textarea
- Availability & Targets → mixed (select + chips + tri-state)
- Compensation → numeric range + currency select
- Add-library sections → drawer per Tier 2 schema (parked)

The Phase 4.A write contracts (per STATE LAST SHIPPED) are the substrate — those continue to govern data flow through whichever drawer hosts the field.

---

## 6. State markers

**Source:** MODEL §4, MATRIX §14.3. Doctrine-locked.

Field-level state surfaces via subtle visual markers.

### 6.1 — The three markers

Per MATRIX §14.3 + MODEL §4:

- **Missing** — field expected but empty
- **Review** — value parsed from CV (L1), awaits user confirmation
- **AI inferred** — generated suggestion, click to confirm and remove the marker

### 6.2 — Visual role

Markers are **subtle visual cues** (gold border/glow per MODEL §4), not intrusive prompts. They inform; they don't interrupt.

### 6.3 — What markers MUST NOT become

Per MATRIX §14.3:

> Markers are visual cues, not admission gates. They inform the user; they do not block.

Specifically:
- Markers MUST NOT block save
- Markers MUST NOT prevent matching (matching is gated by Tier 1 core fields per MATRIX §20, not markers)
- Markers MUST NOT escalate into modals or banners
- Markers MUST NOT change page layout

### 6.4 — Non-blocking philosophy

Per MATRIX §14.3 and the "living object" doctrine (§1): the user is never blocked from progressing. Missing fields stay marked Missing; the user fills them on their own timeline. There is no completion gate.

---

## 7. CV merge UX target

**Source:** MODEL §6, MATRIX §17. Doctrine-locked. UX implementation parked.

### 7.1 — Re-upload flow

Per MATRIX §17.1: the user re-uploads a CV at any time. System parses via Haiku 4.5 (existing `/api/members/cv-parse`). UI presents a merge review:

- Modal-style "X changes detected"
- Field-by-field diff (current value vs newly parsed value)
- Accept / reject per field
- Apply commits accepted changes to `members.*`

### 7.2 — Detected changes

The diff is computed against `cv_parsed_data` (L1) before vs after re-parse, joined with `members.*` (L2) for the current value. Fields that changed in L1 OR have a Review marker (§6.1) appear in the diff.

### 7.3 — Accept / reject per field

User explicitly accepts each change. **No silent auto-merge** (per MODEL §6 + MATRIX §17).

### 7.4 — No silent overwrite

Per MATRIX §5.2 and §17.2: L1 never silently writes to L2. The merge UX is the explicit confirmation envelope — once user clicks Accept on a field, that field is written to `members.*` per the §4.5 write contract.

### 7.5 — Relationship between parser and living profile

- **Parser writes L1** (`cv_parsed_data` jsonb) — overwrite-in-place per MATRIX §5.1
- **L1 suggests, never authors L2** — per MATRIX §5.2
- **Merge UX is the only path** for L1 → L2 promotion after first parse
- **Parser already produces** `cv_parsed_data.needs_review[]` (per cv-parse zod schema, MATRIX §17.3) — seeds the merge UX

### 7.6 — Status

Per MATRIX §17.3: UI greenfield. State machine greenfield. API endpoints (diff, accept/reject) PARKED. Schema unchanged for the diff itself; only the audit/state of the merge action would require future tables.

---

## 8. Public profile / sharing philosophy

**Source:** MODEL §5, MATRIX §16, §18, §7.5. Doctrine-locked. Activation UI parked.

### 8.1 — `/p/[slug]`

Per MATRIX §7.5 + §18:
- Candidate-controlled, candidate's outbound link
- Premium feel (premium curated subset of fields)
- **OFF by default** (per MATRIX §18.1)

### 8.2 — Share-state-only doctrine

Per MATRIX §9 + §18.2: the `profilux` standalone table is **share-state-only** — it holds `share_slug` + `sharing_enabled`. It is **NOT** a profile data source. Read by `app/[slug]/page.tsx`, written by `/api/profilux/reset-link`.

### 8.3 — Activation philosophy

Per MATRIX §18.1: explicit user activation. The candidate must consciously turn the public URL ON. This activation lives in Manage / Settings (§9, §19).

### 8.4 — Maskable layer philosophy

Per MATRIX §16:
- Per-field user-controllable visibility flags
- Maskable fields (per MODEL §5): `current_employer`, `desired_salary_*`, `availability`, `phone`, references (Tier 2)
- Distinct from §7.3 surface masks: §7.3 masks are deterministic per surface; §16 maskable flags are user-controlled and additive

**Status per MATRIX §16.4:** schema and projection changes PARKED. Doctrine only.

**Future projection contract per MATRIX §16.5:** when schema lands, `public` and `client` projections honor maskable flags by replacing the masked field with `null` before serialization. Resolver and `EditorView` unchanged — the maskable flag is a projection-time concern, not a storage-time one.

### 8.5 — Public vs Client share are distinct

Per MATRIX §7.5: `/p/[name]` is candidate-controlled, premium-curated. Client share is JOBLUX-controlled, recruiter-curated, opportunity-bound. Same substrate, **different masks, different ownership**. Future product decisions may diverge them further.

---

## 9. Settings philosophy

**Source:** MODEL §5, MATRIX §19. Doctrine-locked. Implementation parked.

### 9.1 — What belongs in Manage / Settings

Per MATRIX §19.1:
- Public URL ON/OFF toggle (per §18)
- Maskable field toggles (per §16)
- Export controls (download PDF, share PDF — per MODEL §5)
- Account preferences (notifications, contact, etc.)

### 9.2 — What belongs in the passport (View / Edit)

- All section authoring
- All field editing
- All section drawers

### 9.3 — Export / share / privacy separation

Per MODEL §5 + MATRIX §19: export and sharing are **separated from authoring**. The user authors in the passport; the user shares from Settings.

**Email behavior per MODEL §5:** sends the share link first; PDF attachment later. No PDF-first email flow.

**PDF behavior per MODEL §5:**
- Download PDF = full private version
- Share PDF = filtered via maskable toggles

### 9.4 — Replaces

Per MATRIX §19.2: Settings replaces the current `/profile` (light) surface — slated for retirement once Settings ships. The dark `/dashboard/candidate/profilux` surface continues as the editor (passport per §7.6 + §14).

### 9.5 — Status

Per MATRIX §19.3: PARKED. Greenfield page.

---

## 10. Tunnel → passport migration

**Source:** MATRIX §7.6 (rewritten) + §7.6.2 (retired) + STATE LAST SHIPPED. Doctrine-locked.

### 10.1 — Current 11-screen tunnel

`app/dashboard/candidate/profilux/page.tsx`:
- 754-line literal tunnel (per mission prompt + STATE LAST SHIPPED)
- Switch-based render across 11 screens (per commit `60ed661`)
- Phase 4.A milestone: 7 screens write-enabled (3, 4, 6, 7, 8, 9, 10) — per STATE LAST SHIPPED
- Screen 5 (Career History) read-only L1
- Screen 11 (Confirm) separate `m6_confirmed_at` route

**Status per MATRIX §7.6.2:** retired by v1.1.

> The 11-screen tunnel UX previously prescribed here is retired. ProfiLux UX is now passport-with-drawer per §14. The EditorView shape (§7.6.1) and the §4.5 partial-body write contract remain unchanged — they continue to govern the editor's data flow regardless of UX shell.

### 10.2 — Future passport structure

Per MATRIX §7.6 (rewritten):

> view-first passport with drawer-based section editing. Identity strip + section cards rendered together; per-section drawer for rich edits; modal reserved for destructive actions only.

Concretely (cross-ref §3 above): 9 default section cards + add-library extensions, all visible together; per-section drawers; passport-as-home.

### 10.3 — What survives the rewrite

Per MATRIX §13 non-goals + §7.6 locked decisions:

- **`EditorView` projection** (§7.6.1) — UI consumes `EditorView` only, never raw `view` or legacy `profile`
- **L2 write contract** (§4.5 W1/W2/W3) — empty-string coercion, partial-body writes, unconditional recompute
- **`normalizeAvailability` (read) + `denormalizeAvailability` (write)** — UI uses 4-value enum
- **Vocabulary contract** (`lib/profilux/vocabulary.ts`) — 11 vocabularies registered, consumed by 7 screens today
- **Resolver and projector utilities** (per MATRIX §10) — `resolveProfiLux`, `projectFor`
- **Phase 4.A write handlers** — all 7 screens' POST routes survive; the UI shell consuming them changes

### 10.4 — What disappears

- The 11-screen switch render
- Screen-by-screen Prev/Next nav
- Per-screen "Continue" buttons
- The completion-as-progress mental model (replaced by living-object marker model — §6)
- Screen 11 "Confirm" admission UX (matching entry replaces M6 admission per MATRIX §20)

### 10.5 — Dangerous migration areas

These deserve explicit attention during rewrite:

- **The 7 write-enabled screens' state quartets** (`draft<N>` / `saving<N>` / `savedAt<N>` / `saveError<N>`) — must consolidate into per-section state without losing W2 partial-body discipline
- **Refetch fan-out** (currently to all 7 drafts) — the shared `refetch()` helper must continue to update all drafts; the section-card model changes the fan-out shape
- **`tri-state Yes/No` pattern** (Screen 8 clienteling, Screen 9 `open_to_relocation`) — must survive into drawers, including clear-on-transition rules
- **L1 fallback rendering for Screen 6 Education** (DB L2 NULL with `cv_parsed_data.education[0]` fallback) — preserve this pattern in the section drawer
- **Range-guard error UX** (Screen 10 Compensation: HTTP 400 + DB unchanged when `min > max`) — preserve the inline error span behavior
- **Screen 11 confirm logic** — must NOT migrate to passport. Matching entry per §20 replaces it. `m6_confirmed_at` field retention decision per MATRIX §8.3 (deferred)
- **Identity prefill from CV upload** (per commit `408cd7d`) — Identity-only prefill (firstName, lastName, city, nationality), no overwrite of non-empty fields, no silent POST. Pattern preserved through merge UX (§7)

---

## 11. Responsive philosophy

**Source:** Approved UX capture (May 6 mission) — **pending MATRIX promotion.**

MATRIX v1.1 and MODEL.md do not specify responsive behavior. The capture below preserves direction; promotion to MATRIX is required. See §13.

### 11.1 — Desktop (primary)

- Identity strip top-fixed
- Section cards in single-column flow OR two-column grid (TBD by implementation, decision parked)
- Drawer slides from right (recommendation, not locked)
- Sidebar readiness breakdown visible per MODEL §4

### 11.2 — Mobile

- Identity strip top-fixed
- Section cards stack single-column
- Drawer occupies full screen height (recommendation, not locked)
- Sidebar collapsed into a top-accessible panel or moved into Manage

### 11.3 — Card stacking

- Default-9 sections stack first, in order
- Add-library sections stack after, in user-chosen order or fixed order (decision parked)

### 11.4 — Drawer behavior on mobile

- Drawer occupies full viewport
- Back affordance returns to passport without losing scroll position
- Save dismisses drawer; passport reflects new state

### 11.5 — Information hierarchy on small viewports

- Identity → Current Position → Luxury Fit visible without scroll on a typical phone (recommendation)
- Other sections accessible by scroll
- Completion bar always visible

### 11.6 — Density priorities

- Mobile: collapsed cards by default
- Desktop: mixed (collapsed for filled sections, expanded for empty-state sections — recommendation)

**All §11 items above are pending MATRIX promotion. Implementation decisions parked.**

---

## 12. Component strategy (high-level only)

**Source:** Mixed. §12.1 doctrine-locked. §§12.2–12.4 are approved capture — **pending MATRIX promotion.**

This section deliberately avoids implementation. No components named beyond family-level.

### 12.1 — What MUST remain centralized (doctrine-locked)

Per MATRIX §10 + §10.1:

- **`resolveProfiLux(memberId)`** — server-side only resolver
- **`projectFor(view, surface)`** — server-side only projector
- **`computeProfileCompleteness(view)`** — single source for L3 cache compute
- **`computeM6Eligible(view)`** — backend-only readiness signal (per §20)
- **`lib/profilux/vocabulary.ts`** — single source of truth for option lists (eb1093a)

### 12.2 — Expected reusable component families (approved capture)

**Pending MATRIX promotion.** Family-level only — no specific components named.

- **Section card family** — collapsed/expanded card primitive consumed by all 9 default + 8 add-library sections
- **Drawer family** — section editing drawer with consistent open/dismiss/save behavior
- **State marker family** — Missing / Review / AI inferred visual primitives (per §6)
- **Chip multi-toggle family** — already a stable pattern in current screens 4, 7, 9 (per Phase 4.A LAST SHIPPED)
- **Tri-state Yes/No family** — already a stable pattern in current screens 8, 9 (clienteling, relocation)
- **Identity strip family** — top-fixed presence card for the passport

### 12.3 — Section system philosophy (approved capture)

**Pending MATRIX promotion.**

- Sections are first-class: each section is its own card + drawer pair
- Sections compose into the passport: the passport is the sum of its sections
- Adding a new field = extending an existing section's drawer
- Adding a new section = card + drawer + (Tier 2) schema work

### 12.4 — Layout philosophy (approved capture)

**Pending MATRIX promotion.**

- Single passport page is the home
- No multi-page navigation for content
- Manage / Settings is a separate surface (per §2.3 + §9)
- Drawer is overlay, not navigation

---

## 13. Doctrine promotion needed

The following sections of this UX map extend beyond MATRIX v1.1 + MODEL.md. They are **approved capture today** and must be promoted to MATRIX in a future scoped session before becoming repo-locked.

1. **View / Edit / Manage triad** (§2) — MATRIX §14 locks view-first + inline/drawer/modal hierarchy. The explicit named-mode triad (View / Edit / Manage) requires MATRIX §21 (or equivalent).

2. **9 default sections + 8 add-library sections** (§3) — MATRIX §7.6.2 retires the 11-screen tunnel without locking a replacement section catalog. The 9+8 structure requires MATRIX §22 (or equivalent), with field assignments per `EditorView` already locked in §7.6.1.

3. **Responsive philosophy** (§11) — MATRIX and MODEL do not specify responsive behavior. The desktop / mobile direction here requires MATRIX §23 (or equivalent).

4. **Reusable component family strategy** (§§12.2–12.4) — MATRIX §10 locks server-side utilities. UI-side component families (cards, drawers, markers, chips) require MATRIX §24 (or equivalent) — family-level only, not component-level naming.

Until promoted, sections 2, 3, 11, 12.2–12.4 of this UX map are **doctrine-pending**. They preserve approved direction but are subordinate to MATRIX on conflict.

---

## 14. Hard guardrails for this document

Locked at creation, May 6 2026.

- This document is **doctrine capture**, not implementation.
- No code is implied by this document.
- No frontend edits, no schema changes, no migrations, no route changes, no component creation are authorized by this document.
- This document does not override MATRIX or MODEL on conflict — it cites and synthesizes them.
- Implementation of any UX described here requires a future scoped session against the live `/dashboard/candidate/profilux` route, the existing `EditorView` projection, and the existing Phase 4.A write handlers — substrate per MATRIX §13.

---

*End of PROFILUX_RELOAD_UX_MAP.md (v1, May 6 2026 — capture-with-provenance).*
