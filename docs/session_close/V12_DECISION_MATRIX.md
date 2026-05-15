# V12 DECISION MATRIX

**Status:** doctrinal artifact, pure
**Generated:** 2026-05-15
**Sources (committed truth via GitHub MCP, joblux/ClaudeCORE):**
- V12_LOCK fd14a485 — docs/PROFILUX_V12_LOCK.md
- UX_MAP 07fa2c67 — docs/PROFILUX_RELOAD_UX_MAP.md
- MATRIX ff11fde2 — docs/PROFILUX_MATRIX_V1.md
- MODEL 54c04bf3 — docs/PROFILUX_MODEL.md
- REFONDATION 82e6857d — docs/REFONDATION.md

**Excluded:** WORKFLOW_RULES.md (process, not product doctrine).

**Precedence:** V12_LOCK > UX_MAP > MATRIX > MODEL > REFONDATION.

**Classification:**
- DECIDED — locked across sources (or higher-precedence rules, lower aligns/silent).
- CONTRADICTION — sources at different precedence ranks disagree. Precedence resolves; conflict logged.
- OPEN — no source decides. True doctrinal void.

**Rule:** doctrine vs live/prototype divergence ≠ contradiction. Live state is OUT OF SCOPE.

**Format:** every entry produces EXECUTION CONSEQUENCES.

---

## 1. OBJECT IDENTITY

### D-1.1 — Living object, owned continuously
**Source:** MATRIX §2 + MODEL §1 + UX_MAP §1.1
**Decision:** DECIDED
**Execution consequence:** Remove submit/finalize/approve language. Remove wizard/completion/onboarding framing. Preserve continuous-edit substrate (members.* + cv_parsed_data + relational L2). Preserve resolver. Preserve L2 write path (/api/profilux POST).

### D-1.2 — NOT wizard/submission/pending/approved/frozen/job-board/LinkedIn-style/CV-duplicate/discovery
**Source:** MATRIX §2 + MODEL §2
**Decision:** DECIDED
**Execution consequence:** Retire submit/pending/approval state machine. Retire admission UX. Preserve Mo approval ONLY at registration + contributions. Drift-reset: "living object, not wizard / not submission / not approval / not completion funnel".

### D-1.3 — Single object across 5/6 faces
**Source:** MATRIX §2 (5) + MODEL §1 (6) + REFONDATION §1 (5)
**Decision:** DECIDED (granularity diff, not conflict)
**Execution consequence:** Every surface reads canonical object via resolveProfiLux + projectFor. Forbid parallel candidate objects. Preserve 6-surface projectFor: dashboard / editor / public / admin / ats / client.

### D-1.4 — Mo approval scope narrow
**Source:** MATRIX §2 + MODEL §2 + REFONDATION §3
**Decision:** DECIDED
**Execution consequence:** Mo approves: platform access + contributions only. Mo never approves: ProfiLux content/completion/edits. Forbid ProfiLux-level admin approval UX.

---

## 2. MODE ARCHITECTURE

### D-2.1 — Three modes (View/Edit/Manage)
**Source:** V12_LOCK §2.1 + MATRIX §21 + UX_MAP §2
**Decision:** DECIDED
**Execution consequence:** Preserve three modes. Forbid 4th mode (no Onboarding/Wizard/Review). Forbid global edit toggle. User always in exactly one mode.

### D-2.2 — View is default landing
**Source:** V12_LOCK §2.5 + MATRIX §14.1 + §21.1 + UX_MAP §2.1
**Decision:** DECIDED
**Execution consequence:** /dashboard/candidate/profilux defaults to View. Forbid Edit as default. Preserve View as PRIVATE living document surface.

### D-2.3 — Six scenes
**Source:** V12_LOCK §2.2
**Decision:** DECIDED
**Execution consequence:** Preserve: Dashboard entry → Edit → View → Manage → Return flow → CV merge modal. CV merge modal is doctrinal scene (cross-ref §7).

### D-2.4 — Belongs in View
**Source:** V12_LOCK §2.1 + MATRIX §21.1 + UX_MAP §2.1
**Decision:** DECIDED
**Execution consequence:** Render: identity strip, section cards, completeness signal, sidebar readiness, drawer triggers. Forbid: editing forms, sharing/export, admin fields, privacy toggles.

### D-2.5 — Belongs in Edit
**Source:** MATRIX §21.2 + UX_MAP §2.2
**Decision:** DECIDED
**Execution consequence:** Section-scoped drawers only. Inline only where field IS affordance. Validation, save state, dirty tracking, AI-inferred confirm/dismiss. Forbid: sharing/export, maskable toggles, prefs, destructive actions.

### D-2.6 — Belongs in Manage
**Source:** V12_LOCK §2.1 + MATRIX §21.3 + UX_MAP §2.3
**Decision:** DECIDED
**Execution consequence:** Public URL toggle, maskable toggles, export controls, account prefs. Forbid: profile authoring, sectional editing.

### D-2.7 — Transitions
**Source:** MATRIX §21.4 + UX_MAP §2.4
**Decision:** DECIDED
**Execution consequence:** View↔Edit section-scoped drawer. View↔Manage navigation. Forbid persistent global edit mode.

### D-2.8 — Mental model: user always in View
**Source:** MATRIX §21.5 + UX_MAP §2.5
**Decision:** DECIDED
**Execution consequence:** Edit = transient drawer. Manage = separate surface. Passport = home.

---

## 3. SECTION CATALOG

### D-3.1 — 9 default sections (V12 baseline)
**Source:** V12_LOCK §2.3 + UX_MAP §3.1
**Decision:** DECIDED
**Note:** MATRIX §22.1 v1.3 documents LIVE composition; doctrine remains 9.
**The 9 (V12 order):** Identity / Current role / Career path / Education / Languages / Expertise / Compensation / Availability / Maisons.
**Execution consequence:** Preserve 9-section catalog. Forbid silent reduction/addition. Field assignments per EditorView §7.6.1. Identity may render as LEFT SPINE.

### D-3.2 — 8 library sections (canonical, v1.6)
**Source:** MATRIX §22.2 v1.6 (post-V12 reconciliation by Mo)
**Decision:** DECIDED
**The 8:** Awards / Certifications / Portfolio / Strategic Initiatives (renamed from Projects, locked meaning) / Memberships / Press & features / References / Internships (Emerging-user exception to kill-word).
**Execution consequence:** Library renders 8 entries. All inert until Tier 2 substrate ships. Preserve EXTEND DOSSIER single-trigger top-right. Forbid Speaking/events, Volunteer/board, "Publications /" prefix.

### D-3.3 — Add Section: single calm trigger top-right
**Source:** V12_LOCK §2.5
**Decision:** DECIDED — HARD LOCK
**Execution consequence:** Preserve single trigger. Forbid sidebar/modal-picker/wizard-step picker.

### D-3.4 — Section ordering: JOBLUX-controlled, fixed
**Source:** MATRIX §22.3 v1.6
**Decision:** DECIDED
**Execution consequence:** Candidate reorder forbidden (default + library). No candidate-facing ordering persistence. Canonical section identifier system still required for §10 hide write path + library activation write path. Forbid drag-to-reorder UI.

### D-3.5 — Removable vs permanent
**Source:** MATRIX §22.4 + UX_MAP §3.4
**Decision:** DECIDED
**Execution consequence:** Default 9: permanent. Library 8: opt-in. Empty default sections render empty-state marker (modulo D-3.6).

### D-3.6 — Hide-when-empty: Maisons only
**Source:** V12_LOCK §2.3 row 9 + MATRIX §22.1
**Decision:** DECIDED
**Execution consequence:** Maisons hidden when brands_worked_with empty. Other defaults render empty state with Missing marker. Per-section exception, not blanket rule.

### D-3.7 — Compensation NEVER in View
**Source:** V12_LOCK §2.5 + MATRIX §22.1
**Decision:** DECIDED — HARDEST LOCK
**Execution consequence:** Compensation absent from View IIFE. Drawer present in Edit only. Absent regardless of public URL state. Forbid in public/client projections.

### D-3.8 — Tier 1 sections gap (acknowledged)
**Source:** V12_LOCK §2.6 + MATRIX §15.2
**Decision:** DECIDED
**Execution consequence:** notice_period, work_authorization, salary_history, reporting_line, budget_responsibility, team_size — no substrate today. Sections deferred. Schema parked. Forbid Tier 0/2 placeholder surfacing.

---

## 4. FIELD PROJECTIONS

### D-4.1 — Six surfaces, six contracts
**Source:** MATRIX §7.2
**Decision:** DECIDED
**Execution consequence:** Preserve projectFor(view, surface) server-side. 6 surfaces. Forbid client-side resolution. Forbid direct DB reads of members.*/cv_parsed_data from any surface.

### D-4.2 — Surface masks (deterministic per surface)
**Source:** MATRIX §7.3
**Decision:** DECIDED
**Execution consequence:** Preserve §7.3 field×surface mask table. email/phone/linkedin_url hidden in dashboard/public/client. desired_salary_* hidden in public/client. current_employer toggle-controlled in public+client. Admin notes/L1 raw: admin-only.

### D-4.3 — email exception (OAuth-confirmed, immutable from L1)
**Source:** MATRIX §6.3
**Decision:** DECIDED
**Execution consequence:** Resolver always returns members.email. Forbid CV-parse overwriting email.

### D-4.4 — linkedin_url doctrine: secondary
**Source:** MATRIX §7.4
**Decision:** DECIDED
**Execution consequence:** Preserve members.linkedin_url column. Render in editor/admin/ATS when non-empty. Hide in dashboard/public/client. Forbid CV-parse extraction. Forbid dedicated LinkedIn section.

### D-4.5 — Public /p/[slug] vs client share: distinct contracts
**Source:** MATRIX §7.5 + UX_MAP §8.5
**Decision:** DECIDED
**Execution consequence:** /p/[slug] = candidate-controlled premium curated. Client share = JOBLUX-controlled recruiter-curated opportunity-bound. Same substrate, different masks, different ownership. Forbid unifying.

### D-4.6 — Editor projection is EditorView
**Source:** MATRIX §7.6 + §7.6.1
**Decision:** DECIDED
**Execution consequence:** UI consumes EditorView only. Forbid raw view/legacy profile. Preserve snake_case shape. Education = L2 (education_records) + L1 passthrough merge.

---

## 5. EDITING MODEL

### D-5.1 — Section-scoped drawers
**Source:** V12_LOCK §2.5 + MATRIX §14.2 + UX_MAP §5.1
**Decision:** DECIDED — HARD LOCK
**Execution consequence:** One drawer per section, purpose-built. Forbid generic edit forms. Drawer overlays passport.

### D-5.2 — Inline only when field IS affordance
**Source:** MATRIX §14.2 + UX_MAP §5.2
**Decision:** DECIDED
**Execution consequence:** Inline OK for single-line text, single-select. Forbidden for multi-field forms, multi-select chips, structured items.

### D-5.3 — Modal: destructive only
**Source:** MATRIX §14.2 + UX_MAP §5.3
**Decision:** DECIDED
**Execution consequence:** Modals = delete confirmation, irreversible. Forbid modals for primary edits, tunnels, wizards, Add Section picker.

### D-5.4 — Drawer is overlay, not navigation
**Source:** UX_MAP §12.4 + MATRIX §24.2
**Decision:** DECIDED
**Execution consequence:** Drawer overlays. Forbid drawer-as-route. Forbid back-button closing passport instead of drawer.

### D-5.5 — Save honors W1/W2/W3
**Source:** MATRIX §4.5 + §14.2
**Decision:** DECIDED
**Execution consequence:** W1 empty-string→NULL. W2 partial-body (only present fields). W3 unconditional recompute. Save dismisses drawer; cancel = no write.

### D-5.6 — 11-screen tunnel retired
**Source:** MATRIX §7.6.2 + V12_LOCK §2.5 + UX_MAP §10
**Decision:** DECIDED
**Execution consequence:** Tunnel doctrinally retired. Living document only. Preserve substrate (EditorView, write contract, vocab, parser, resolver, projector). Code preservation (TUNNEL_VISIBLE=false) is execution choice.

---

## 6. STATE MARKERS

### D-6.1 — Three markers: Missing/Review/AI-inferred
**Source:** MATRIX §14.3 + MODEL §4 + UX_MAP §6.1
**Decision:** DECIDED
**Execution consequence:** Preserve three-marker family. Subtle visual cues, gold border/glow.

### D-6.2 — Markers are visual cues, not gates
**Source:** MATRIX §14.3 + §24.3 + UX_MAP §6.3
**Decision:** DECIDED — HARD LOCK
**Execution consequence:** MUST NOT block save. MUST NOT prevent matching. MUST NOT escalate to modals/banners. MUST NOT change layout. Forbid "must fix" treatment.

### D-6.3 — Non-blocking by design
**Source:** UX_MAP §6.4 + MATRIX §20.4
**Decision:** DECIDED
**Execution consequence:** User never blocked. No completion gate. No threshold % admission.

---

## 7. CV INGESTION + L1→L2 CONTRACT

### D-7.1 — L1 = canonical CV parse (overwrite-in-place)
**Source:** MATRIX §3.1 + §5.1 + UX_MAP §7.5
**Decision:** DECIDED
**Execution consequence:** members.cv_parsed_data is L1 store. Re-upload replaces cv_url, cv_parsed_at, cv_parsed_data. No versioning. L1 = pre-fill source, NOT profile source.

### D-7.2 — L2 sovereignty (no silent L1→L2 writes)
**Source:** MATRIX §5.2 + §11.1 + MODEL §6 + UX_MAP §7.4
**Decision:** DECIDED — HARD GUARDRAIL
**Execution consequence:** L1 never silently writes L2. L1 may prefill L2 ONLY when L2 NULL AND user confirms. Once L2 populated, L1 cannot overwrite. Forbid background L1→L2 promotion.

### D-7.3 — Re-upload merge UX
**Source:** MATRIX §17 + MODEL §6 + UX_MAP §7
**Decision:** DECIDED (doctrine), implementation PARKED
**Execution consequence:** Modal-style "X changes detected". Per-field diff. Accept/reject per field. Commits via §4.5. No silent auto-merge. Forbid bulk-accept without per-field review.

### D-7.4 — Email never CV-overwritten
**Source:** MATRIX §6.3
**Decision:** DECIDED (cross-ref D-4.3)

### D-7.5 — Parser preserves resolution_state
**Source:** MATRIX §5.2
**Decision:** DECIDED
**Execution consequence:** Parser preserves cv_parsed_data.resolution_state on re-parse. Parser never writes it. Only /api/profilux/suggestions writes it.

---

## 8. PUBLIC SHARING

### D-8.1 — /p/[slug] OFF by default
**Source:** MATRIX §18.1 + MODEL §5 + UX_MAP §8.1
**Decision:** DECIDED
**Execution consequence:** New candidates: sharing_enabled=false. Candidate activates consciously. UI in Manage.

### D-8.2 — Share state on profilux standalone table
**Source:** MATRIX §9 + §18.2 + UX_MAP §8.2
**Decision:** DECIDED
**Execution consequence:** profilux table = share_slug + sharing_enabled only. Read by app/[slug]/page.tsx, written by /api/profilux/reset-link + /api/profilux/share. NOT a profile source. Forbid adding share fields to members.*.

### D-8.3 — Share state isolated from EditorView/resolver/projector
**Source:** MATRIX §9 + UX_MAP §8.2
**Decision:** DECIDED
**Execution consequence:** share_slug + sharing_enabled NEVER on EditorView. Resolver never reads profilux. projectFor never emits share state. Read via dedicated endpoint only.

### D-8.4 — Candidate-controlled outbound link
**Source:** MATRIX §7.5 + §18 + MODEL §5
**Decision:** DECIDED
**Execution consequence:** Candidate owns activation. Premium curated subset. Forbid recruiter activation. Forbid public discovery index.

### D-8.5 — Activation UI in Manage
**Source:** MATRIX §18.3 + §19.1 + UX_MAP §8.3
**Decision:** DECIDED
**Execution consequence:** Toggle in Manage. Forbid in View. Forbid in Edit.

---

## 9. MASKABLE LAYER (FIELD-LEVEL)

### D-9.1 — Maskable set: exactly 6 fields (v1.6)
**Source:** MATRIX §16.2 v1.6
**Decision:** DECIDED (MODEL §5 lists 5 — see C-1)
**The 6:** phone / email / current_employer / salary fields / availability / references (Tier 2).
**Execution consequence:** Forbid additions without Mo+GPT reopen. Tier 1/2 fields NOT auto-maskable. Schema parked.

### D-9.2 — Distinct from §7.3 surface masks
**Source:** MATRIX §16.3 + UX_MAP §8.4
**Decision:** DECIDED
**Execution consequence:** §7.3 = deterministic per surface. §16 = user-controlled additive. Can hide what §7.3 shows. Forbid replacing §7.3 with §16.

### D-9.3 — Affects Public + PDF only
**Source:** MATRIX §16.4 + cross-ref §16A.2
**Decision:** DECIDED
**Execution consequence:** Maskable affects public + PDF. Does NOT affect dashboard/editor/admin/ats/client.

### D-9.4 — Storage + projection (future contract)
**Source:** MATRIX §16.5 + §16.6
**Decision:** DECIDED (contract), implementation PARKED
**Execution consequence:** When schema lands: public + PDF projections replace masked field with null. Resolver unchanged. EditorView unchanged. Forbid resolver-layer masking.

---

## 10. SECTION VISIBILITY (SECTION-LEVEL)

### D-10.1 — Hide whole sections from Public + PDF only
**Source:** MATRIX §16A.2 v1.6
**Decision:** DECIDED
**Execution consequence:** Affects public + PDF. Does NOT affect dashboard/editor/admin/ats/client. Internal truth complete. Forbid hiding from JOBLUX internal surfaces.

### D-10.2 — Default = show all
**Source:** MATRIX §16A.3
**Decision:** DECIDED
**Execution consequence:** New candidates: zero hidden sections. Opt-in per section. Forbid hide-by-default (Maisons hide-when-empty per D-3.6 is data-driven, not choice-driven).

### D-10.3 — Distinct from §16 field mask
**Source:** MATRIX §16A.5
**Decision:** DECIDED
**Execution consequence:** §16 = field-level, §16A = section-level. They compose. Forbid conflating.

### D-10.4 — Projection-time, not storage-time
**Source:** MATRIX §16A.7
**Decision:** DECIDED
**Execution consequence:** Projections receive hidden-section list at projection time. Resolver unchanged. EditorView unchanged. Forbid stripping sections from members.*.

### D-10.5 — Substrate dependency
**Source:** MATRIX §16A.6
**Decision:** DECIDED (blocker acknowledged)
**Execution consequence:** Write path requires canonical section identifier system (§22.3 prerequisite 1). Schema PARKED until canonical ID lands.

---

## 11. MATCHING ENTRY + CONSENT

### D-11.1 — Backend-only readiness signal
**Source:** MATRIX §8 + §20 + MODEL §8 + UX_MAP §1.4
**Decision:** DECIDED
**Execution consequence:** No admission UX. No "Confirm my ProfiLux" button. No % threshold on View. Forbid resurrecting M6 admission.

### D-11.2 — Two conditions
**Source:** MATRIX §8.1 + §20.2 + MODEL §8
**Decision:** DECIDED
**Conditions:** (1) Core fields complete: identity + current role + ≥1 experience + availability + work_authorization + notice_period. (2) Explicit consent (future toggle, NOT availability).
**Execution consequence:** Preserve computeM6Eligible + computeProfileCompleteness as backend signals. Matching cannot wire until Tier 1 (work_authorization, notice_period) ships. Forbid matching on availability alone. Matching enters automatically.

### D-11.3 — availability ≠ consent
**Source:** MATRIX §20.x + §20.5
**Decision:** DECIDED — HARD GUARDRAIL
**Execution consequence:** Consent = new dedicated field. Until consent ships: no recruiter/ATS/matching surface may treat availability as opt-in. Forbid availability=open → consent. Forbid recruiter UI "ready to match".

### D-11.4 — Consent is future Tier 1 work
**Source:** MATRIX §20.5 + §15.2
**Decision:** DECIDED
**Execution consequence:** Column name + DB type deferred. Part of Tier 1 schema. Forbid premature wiring.

### D-11.5 — m6_confirmed_at retained
**Source:** MATRIX §8.3
**Decision:** DECIDED
**Execution consequence:** Column stays. No UX writes it. Future use: matching-entry timestamp OR retire. Forbid candidate-facing reads.

### D-11.6 — No threshold percentage
**Source:** MATRIX §20.4
**Decision:** DECIDED
**Execution consequence:** No X%-complete admission gate. Forbid UX gate on profile_completeness. profile_completeness = internal-only.

---

## 12. EXPORT DOCTRINE

### D-12.1 — Two CV artifacts coexist
**Source:** MATRIX §19A.1 Q1
**Decision:** DECIDED (v1.4)
**Execution consequence:** Uploaded original = archive/input in member-cvs bucket, immutable. ProfiLux-rendered export = generated private snapshot. Neither replaces the other.

### D-12.2 — Export = private snapshot from canonical pipeline
**Source:** MATRIX §19A.1 Q2
**Decision:** DECIDED (doctrine), implementation PARKED
**Execution consequence:** Consumes resolveProfiLux + future projection helper. PDF library + template deferred. Forbid parallel rendering pipeline. Forbid build from raw members.* reads.

### D-12.3 — Per-export-type projection mapping
**Source:** MATRIX §19A.1 Q3
**Decision:** DECIDED
**Mapping:** Candidate self-export = private full ProfiLux from canonical pipeline. Recruiter = PARKED on C-B-2. Client share = PARKED on C-B-3. Public export DOES NOT EXIST.

### D-12.4 — No public PDF
**Source:** MATRIX §19A.1 Q4
**Decision:** DECIDED
**Execution consequence:** Public sharing stays web-first via /p/[slug] HTML. Forbid public PDF. Forbid linking PDF from /p/[slug].

### D-12.5 — No recruiter/client PDF (current scope)
**Source:** MATRIX §19A.1 Q5
**Decision:** DECIDED
**Execution consequence:** Recruiter PDF: PARKED on C-B-2. Client PDF: PARKED on C-B-3.

### D-12.6 — Export surface: Manage/Settings only
**Source:** MATRIX §19A.2
**Decision:** DECIDED
**Execution consequence:** Download PDF in Manage/Settings. Forbid in View. Forbid in Edit.

---

## 13. FIELD TIER MODEL

### D-13.1 — Tier 0: signup-seeded
**Source:** MATRIX §15.1 + MODEL §7
**Fields:** first_name, last_name, email, city, country
**Decision:** DECIDED
**Execution consequence:** Seeded before CV upload. email immutable per D-4.3. Forbid Tier 0 fields lacking signup defaults.

### D-13.2 — Tier 1: recruiter-critical (PARKED)
**Source:** MATRIX §15.2 + MODEL §7 + V12_LOCK §2.6
**Fields:** notice_period, work_authorization, salary_history, reporting_line, budget_responsibility, team_size
**Decision:** DECIDED (gap acknowledged)
**Execution consequence:** Schema does not exist. Required for matching per D-11.2. Schema parked. Forbid surfacing as Tier 0/2.

### D-13.3 — Tier 2: credibility (PARKED)
**Source:** MATRIX §15.3 + MODEL §7 (cross-ref §22.2 v1.6 = 8 library)
**Decision:** DECIDED (see C-2 for MODEL ↔ MATRIX delta)
**Execution consequence:** Schema deferred per-section. Each needs column or relational table. Forbid surfacing as Tier 0/1.

### D-13.4 — Existing Phase 4 fields
**Source:** MATRIX §15.4 + MODEL §7
**Decision:** DECIDED
**Execution consequence:** All EditorView fields not in Tier 0/1/2 are existing Phase 4. Trio retirement locked at S-B.2C. education_records = sole education truth. Forbid trio resurrection.

---

## 14. VISUAL POSTURE

### D-14.1 — Restraint/centering/density/premium editorial
**Source:** V12_LOCK §3.1
**Decision:** DECIDED — BINDING POSTURE (not pixel)
**Execution consequence:** Preserve restraint, centering, density, premium editorial. Playfair Display headings, Inter body. Italic accents as accents only.

### D-14.2 — Gold restraint (max 3 uses/page)
**Source:** V12_LOCK §3.1 (refs STATE §15)
**Decision:** DECIDED
**Execution consequence:** Gold (#a58e28) as accent only. Never fill/background expanse. Max 3/page. Forbid gold blocks/backgrounds/large borders.

### D-14.3 — Drift triggers
**Source:** V12_LOCK §3.2
**Decision:** DECIDED
**Execution consequence:** Forbid: multi-column dashboard layouts on passport, edge-aligned full-width blocks, color-coded status banners, iconography beyond V12 chevron/dot, SaaS notification clusters, form-density data entry. Any = Mo+GPT reconciliation before merge.

### D-14.4 — Polish open to evolution
**Source:** V12_LOCK §4
**Decision:** DECIDED
**Execution consequence:** Card padding, border-radius, font scale, spacing scale: open. Hover/focus/transitions: open. Mobile breakpoint: open beyond §23. Empty-state copy: open. Polish must pass STATE §15 + not violate §3.2 + not change §2 structure.

### D-14.5 — Functional engine real (no placeholders)
**Source:** V12_LOCK §2.5 + MATRIX §14.4
**Decision:** DECIDED — HARD LOCK
**Execution consequence:** Every visible control does something real. Forbid placeholders, dead controls, "coming soon" interactive buttons.

---

## 15. BEHAVIORAL HARD LOCKS (cross-ref)

### D-15.1 — View-first passport (see D-2.2)
### D-15.2 — Section-specific drawers (see D-5.1)
### D-15.3 — Add Section single calm trigger (see D-3.3)
### D-15.4 — Curated section library (see D-3.2)
**Execution consequence:** Only the 8 canonical sections. Forbid user-invented sections. Forbid free-form taxonomy.
### D-15.5 — Compensation NEVER in View (see D-3.7)
### D-15.6 — No placeholders (see D-14.5)
### D-15.7 — No wizard/tunnel (see D-5.6)

---

## 16. VOCABULARY CONTRACT

### D-16.1 — ProfiLux vocab in lib/profilux/vocabulary.ts
**Source:** REFONDATION (assignment-options.ts) vs MATRIX §10/§24.7 (profilux/vocabulary.ts) — see C-4
**Decision:** DECIDED (ProfiLux scope: MATRIX wins; cross-domain split valid)
**Execution consequence:** ProfiLux UI consumes lib/profilux/vocabulary.ts. Does NOT consume lib/assignment-options.ts directly. Forbid local vocab in components. Forbid inferring vocab from DB at render time.

### D-16.2 — 8 sectors (doctrinal claim, code gap)
**Source:** REFONDATION Pilier 5 + Known Gap 3
**Decision:** OPEN — see O-2
**Execution consequence:** Doctrine = 8 sectors. No SECTORS constant exists. wikilux_content.sector = 12 drifted DB values. Forbid drifted DB values as truth.

### D-16.3 — 35 subsectors (claim, no code)
**Source:** REFONDATION Pilier 5 + Known Gap 4
**Decision:** OPEN — see O-3
**Execution consequence:** No SUBSECTORS constant. No DB column. ProfiLux cannot express granularity until defined.

### D-16.4 — 20 departments (canonical in code)
**Source:** REFONDATION canonical DEPARTMENTS
**Decision:** DECIDED
**Execution consequence:** DEPARTMENTS in lib/assignment-options.ts canonical (20 values, verbatim). Preserve. Forbid local department lists.

### D-16.5 — 9 seniority code vs 7 DB CHECK
**Source:** REFONDATION canonical SENIORITY_LEVELS + Known Gap 1
**Decision:** CONTRADICTION — see C-5
**Execution consequence:** SENIORITY_LEVELS = 9. DB CHECK enforces 7. Missing: Lead/Manager, Board/Advisory. Action: extend CHECK or rename canonical. Forbid Lead/Manager + Board/Advisory on search_assignments until DB updated.

### D-16.6 — 28 specializations (claim, no code)
**Source:** REFONDATION Pilier 5 + Known Gap 5
**Decision:** OPEN — see O-4
**Execution consequence:** No SPECIALIZATIONS constant. No DB column. Matching cannot use specialization signal until defined.

### D-16.7 — Shared vocabulary across all 4 surfaces
**Source:** REFONDATION Pilier 5
**Decision:** DECIDED
**Execution consequence:** Same vocab WikiLux/ProfiLux/Business Briefs/matching. Forbid divergent vocabs per surface. Substrate: shared constant + DB CHECK constraints (currently missing on business_briefs per Known Gap 6).

---

## 17. SUBSTRATE/STORAGE CONTRACT

### D-17.1 — Three layers (L1/L2/L3)
**Source:** MATRIX §3
**Decision:** DECIDED
**Execution consequence:** L1 = cv_parsed_data jsonb. L2 = members.* flat + relational L2 collections. L3 = scored intelligence. Every read/write maps to one layer. Forbid mixing.

### D-17.2 — L2 storage scope
**Source:** MATRIX §4
**Decision:** DECIDED
**Execution consequence:** Primary L2: members.* row. Active relational L2: education_records (S-B.2C), work_experiences (S-C). Dormant: member_languages, member_sectors (parked 1609e494). Forbid candidate_profiles, profilux standalone (except share state), member_ai_reviews as profile source.

### D-17.3 — L2 write contract: W1/W2/W3
**Source:** MATRIX §4.5
**Decision:** DECIDED
**Execution consequence:** W1 empty→NULL. W2 partial body only. W3 unconditional recompute. Forbid full-object writes minting defaults from NULL. Adapters MUST NOT mint synthetic defaults.

### D-17.4 — Inverse-mapping for lossy normalization
**Source:** MATRIX §4.5 Phase 4.1
**Decision:** DECIDED
**Execution consequence:** availability UI 4-value enum maps via normalizeAvailability (read) + denormalizeAvailability (write). Preserve: active→actively_looking, open→not_actively_looking, passive→passively_exploring, unavailable→unavailable, null→null. Forbid Continue round-trip drift.

### D-17.5 — profilux standalone = share-state only
**Source:** MATRIX §9 + §18.2
**Decision:** DECIDED
**Execution consequence:** Holds share_slug + sharing_enabled only. 17 legacy columns = doctrine drift, cleanup parked. Forbid adding profile fields to profilux. Forbid reading profile fields from profilux.

### D-17.6 — Frozen-out tables
**Source:** MATRIX §9
**Decision:** DECIDED
**Execution consequence:** candidate_profiles dormant. work_experiences ACTIVE. education_records ACTIVE. member_languages dormant. member_sectors dormant. Forbid treating dormant as authoritative.

### D-17.7 — Tables out of L2 scope
**Source:** MATRIX §4.3 + §9
**Decision:** DECIDED
**Execution consequence:** member_documents = provenance only. luxai_history = telemetry only. Forbid reading profile data from luxai_history.

### D-17.8 — Future migration GRANT lock
**Source:** STATE §6 (cross-layer, not exclusive to 5 sources)
**Decision:** DECIDED
**Note:** Platform-wide rule, authoritative at STATE §6.

---

## 18. RESOLVER + PROJECTOR

### D-18.1 — resolveProfiLux(memberId) = single resolver
**Source:** MATRIX §6.1 + §10 + UX_MAP §12.1
**Decision:** DECIDED
**Execution consequence:** Server-side only. Input: members row + cv_parsed_data. Output: ProfiLuxResolved. Forbid client-side resolution. Forbid alternate resolvers per surface.

### D-18.2 — Precedence Rule A
**Source:** MATRIX §6.2
**Decision:** DECIDED
**Execution consequence:** For each L1+L2 field: (1) members.<field> non-NULL/non-empty → return that. (2) Else L1 path has value → return that. (3) Else null/empty. L1 fills NULL gaps. L2 wins when populated. L1 never auto-writes L2 (cross-ref D-7.2).

### D-18.3 — Collection merge contract (S-B.1A)
**Source:** MATRIX §6.4 + STATE §12 via MATRIX
**Decision:** DECIDED
**Execution consequence:** view.<collection> = [...L2_rows, ...L1_passthrough]. L2 first, L1 second, no dedup, no replace, no silent L1→L2 promotion. Applied: education (S-B), experiences (S-C). To apply: languages, sectors (parked). Forbid silent promotion.

### D-18.4 — projectFor(view, surface) = single projector
**Source:** MATRIX §7.1 + §10
**Decision:** DECIDED
**Execution consequence:** Single switch. Server-side only. Forbid client-side projection. Forbid bypassing projectFor.

### D-18.5 — Forbidden patterns
**Source:** MATRIX §10.1
**Decision:** DECIDED
**Execution consequence:** Forbid: direct DB reads of members.*/cv_parsed_data from any surface, client-side resolution, L1→L2 silent writes, separate completeness logic per surface, reading m6_confirmed_at to infer eligibility.

---

## 19. RECOMPUTE BOUNDARIES

### D-19.1 — profile_completeness recompute on every L1+L2 write
**Source:** MATRIX §4.4 + §10.2
**Decision:** DECIDED
**Execution consequence:** Triggered after cv-parse L1 write + every L2 edit endpoint write. Computed against resolved view, not raw members.*. In route code, not DB triggers. W3 applies.

### D-19.2 — Canonical scorer: computeProfileCompleteness
**Source:** MATRIX §10
**Decision:** DECIDED
**Execution consequence:** Single function for L3 cache. Binary group scorer over G1-G6. Returns 0-100. Forbid alternate per-surface implementations. Forbid candidate-facing reads on View (D-11.6).

### D-19.3 — m6_confirmed_at: user-action only (column retained)
**Source:** MATRIX §4.4 + §8.3
**Decision:** DECIDED
**Execution consequence:** Column stays. Forbid auto-set, forbid auto-clear in v1. Future use deferred.

### D-19.4 — Confidence + needs_review = read-through
**Source:** MATRIX §4.4 + §4.2
**Decision:** DECIDED
**Execution consequence:** Read-through from L1. Never re-cached on members.*. Computed at parse time.

---

## 20. AUTHORITY HIERARCHY

### D-20.1 — Doctrinal precedence (this matrix's scope)
**Source:** Mo lock 2026-05-15
**Decision:** DECIDED
**Execution consequence:** V12 > UX_MAP > MATRIX > MODEL > REFONDATION. WORKFLOW_RULES.md excluded.

### D-20.2 — STATE supremacy (cross-layer)
**Source:** MATRIX §12.1 + V12_LOCK §7
**Decision:** DECIDED
**Note:** STATE = execution truth, not part of doctrinal 5. Cited for cross-layer authority.
**Execution consequence:** STATE wins on execution conflict; doctrine wins on intent. STATE drift = execution gap, not doctrinal redefinition. Reconciliation appendix tracks drift.

### D-20.3 — Change control: doctrine first
**Source:** MATRIX §12.2
**Decision:** DECIDED
**Execution consequence:** Behavior change contradicting doctrine: update doctrine FIRST or same commit. Code diverging without doctrine update = defect. Forbid silent product drift.

### D-20.4 — V12 cannot drift silently
**Source:** V12_LOCK §9
**Decision:** DECIDED
**Execution consequence:** V12 structural change requires: Mo+GPT decision → new V13/V12.1 HTML → doctrine update same commit → STATE update if doctrine-level → memory update → repo prototype replaced. Forbid V12 evolution outside this process.

---

## 21. CONTRADICTIONS LOG

### C-1 — Maskable: MODEL 5 vs MATRIX 6
**Sources:** MODEL §5 (5: employer, salary, availability, phone, references) vs MATRIX §16.2 v1.6 (6: phone, email, current_employer, salary, availability, references)
**Resolution:** MATRIX wins (higher rank + later v1.6 lock).
**Execution consequence:** MODEL §5 superseded. 6-field set canonical per D-9.1.

### C-2 — Tier 2: MODEL 6 vs MATRIX library 8
**Sources:** MODEL §7 (6 items) vs MATRIX §22.2 v1.6 (8 items)
**Resolution:** MATRIX wins (higher rank + v1.6 canonicalization).
**Execution consequence:** Locked 8 per D-3.2: Strategic Initiatives (renamed from Projects), Internships exception, Speaking/Volunteer dropped, "Publications /" prefix dropped. MODEL §7 list superseded.

### C-3 — Faces: 5 (MATRIX/REFONDATION) vs 6 (MODEL)
**Resolution:** Not a true contradiction — different granularities.
**Execution consequence:** Preserve 6-surface projectFor (consistent with both framings).

### C-4 — Vocab file: REFONDATION vs MATRIX
**Sources:** REFONDATION (lib/assignment-options.ts) vs MATRIX §10/§24.7 (lib/profilux/vocabulary.ts)
**Resolution:** Two distinct surfaces by domain. MATRIX wins for ProfiLux scope.
**Execution consequence:** ProfiLux: profilux/vocabulary.ts. Assignments/Briefs: assignment-options.ts. Shared values sourced once and re-exported.

### C-5 — Seniority: code 9 vs DB CHECK 7
**Sources:** REFONDATION Pilier 5 (9 doctrinal + 9 in code) vs REFONDATION Known Gap 1 (DB CHECK enforces 7)
**Resolution:** Doctrine = 9. DB = 7. REFONDATION self-logs the gap. Not doctrinal split within 5 sources; substrate gap.
**Execution consequence:** REFONDATION follow-up #4 required (extend CHECK or rename canonical). Per D-16.5.

### C-6 — V12 9 defaults vs MATRIX §22.1 live composition
**Sources:** V12_LOCK §2.3 + UX_MAP §3.1 (9 defaults) vs MATRIX §22.1 v1.3 (live: Identity LEFT SPINE + 7 ViewZones + 2 Edit-only)
**Resolution:** Not doctrinal contradiction. MATRIX §22.1 v1.3 documents LIVE composition post-V12 convergence + S-B.2C — a reconciliation log, not redefinition. 9 defaults remain doctrinal per D-3.1.
**Execution consequence:** Live UI may render Identity as LEFT SPINE. 9-section default catalog remains doctrinal. Maisons hide-when-empty per D-3.6.

### C-7 — V12 §6.1 section divergences
**Sources:** V12_LOCK §6.1 (4 divergences)
**Resolution:** 3 SHIPPED + RESOLVED (V12-divergence-1/-2/-3). Clienteling-absent-from-View = "live truth, no doctrine commitment to add" per MATRIX §22.1.
**Execution consequence:** -1/-2/-3 are DECIDED (resolved). Clienteling = O-1 OPEN.

### C-8 — Library canonicalization (V12 vs MATRIX v1.6)
**Sources:** V12_LOCK §2.4 (8 items inc. Projects) vs MATRIX §22.2 v1.6 (8 items inc. Strategic Initiatives)
**Resolution:** MATRIX v1.6 = explicit Mo reconciliation post-V12-lock.
**Execution consequence:** Use MATRIX v1.6 canonical 8. V12_LOCK §2.4 superseded.

---

## 22. OPEN LOG

### O-1 — Clienteling: View / library / Edit-only?
**Source silence:** V12_LOCK §6.1 row 4 flags decision needed. MATRIX §22.1 records live status as Edit-only (no doctrine commitment). UX_MAP §3.1 lists Clienteling as default #7.
**Decision needed:** (a) UX_MAP §3.1 default → re-render in View; (b) opt-in library → move to library; (c) Edit-only forever → doctrinal lock against View.
**Execution consequence:** Pending Mo decision. Live tolerance does not bind doctrine.

### O-2 — Sectors canonical definition
**Source silence:** REFONDATION claims 8, no SECTORS constant.
**Decision needed:** Define 8 verbatim + create constant in lib/assignment-options.ts.
**Execution consequence:** Until defined: ProfiLux cannot use canonical sector vocab; DB drift uncontrolled.

### O-3 — Subsectors canonical definition
**Source silence:** REFONDATION claims 35, no constant, no DB column.
**Decision needed:** Define 35 + decide substrate (column vs table).
**Execution consequence:** Until defined: ProfiLux cannot express subsector granularity.

### O-4 — Specializations canonical definition
**Source silence:** REFONDATION claims 28, no constant, no DB column.
**Decision needed:** Define 28 + decide substrate.
**Execution consequence:** Until defined: matching cannot use specialization signal.

### O-5 — Canonical section identifier system
**Source silence:** MATRIX §22.3 lists 5 parallel naming surfaces; none canonical.
**Decision needed:** Define canonical section ID system used across resolver/projector/UI/parser.
**Execution consequence:** Until defined: §10 hide write path + library activation write path cannot wire.

### O-6 — Tier 1 schema shape
**Source silence:** MATRIX §15.2 lists fields, not shape (e.g. salary_history "multi-row?").
**Decision needed:** Per-field shape (column vs table; type; nullable; CHECK).
**Execution consequence:** Until decided: matching entry cannot wire (D-11.2).

### O-7 — Tier 2 substrate per library section
**Source silence:** MATRIX §22.2 + §15.3 lock 8 sections, park substrate per-section.
**Decision needed:** Per-section substrate (Strategic Initiatives shape, Certifications structured vs flat text[], etc.).
**Execution consequence:** Until decided: all 8 library sections remain inert.

### O-8 — Consent column name + type
**Source silence:** MATRIX §20.5 defers column name + DB type.
**Decision needed:** Column name, DB type, default.
**Execution consequence:** Until decided: matching entry cannot wire.

### O-9 — m6_confirmed_at future use
**Source silence:** MATRIX §8.3 leaves two options (repurpose vs retire).
**Decision needed:** Repurpose, retire, or dormant.
**Execution consequence:** Column stays with no UX writer; ledger drift if not decided.

### O-10 — profilux standalone table future
**Source silence:** MATRIX §9 + §18.4 leave two options.
**Decision needed:** Migrate share state to members.* OR keep narrow.
**Execution consequence:** Parked.

### O-11 — PDF library + render template
**Source silence:** MATRIX §13 + §19A.3 explicit out-of-scope.
**Decision needed:** Library selection (none in deps); template.
**Execution consequence:** Self-export cannot ship.

### O-12 — /api/resume/[slug] retirement
**Source silence:** MATRIX §13 + §19A.3 out-of-scope.
**Decision needed:** Retire route + planned columns + slug space (Resume fossil).
**Execution consequence:** Parked.

### O-13 — CV merge state machine + API
**Source silence:** MATRIX §17.3 parks diff endpoint + accept/reject API + state machine + audit.
**Decision needed:** State machine shape, API, audit table (e.g. cv_parse_history).
**Execution consequence:** Re-upload merge UX cannot ship.

### O-14 — Settings: separate page or tab inside passport
**Source silence:** UX_MAP §2.3 + MATRIX §21.3 + §19 open.
**Decision needed:** Surface placement.
**Execution consequence:** Parked alongside Settings rebuild.

### O-15 — Mobile vs desktop layout
**Source silence:** MATRIX §23 parks multiple decisions (single vs two-column desktop, drawer slide, sidebar collapse).
**Decision needed:** Per-decision in implementation slice.
**Execution consequence:** Parked alongside passport rewrite.

### O-16 — Add-library ordering
**Source silence:** UX_MAP §3.3 + MATRIX §22.3 acknowledge order is "frequency-of-use (estimated)"; MATRIX v1.6 locks JOBLUX-controlled fixed order but not the specific library order.
**Decision needed:** Final fixed order for 8 library sections.
**Execution consequence:** Add-library cannot ship until ordered (composes with O-7).

### O-17 — Per-card collapse default state
**Source silence:** UX_MAP §4.2 leaves default per-section "TBD"; STATE notes A2.8 ephemeral lock.
**Decision needed:** Default per section + persistence.
**Execution consequence:** UI choice, no doctrinal lock.

### O-18 — Visibility status copy in Manage
**Source silence:** None of 5 docs lock Manage status copy.
**Decision needed:** Final Manage status strings.
**Execution consequence:** UI choice, deferred to Manage slice.

---

*End of V12_DECISION_MATRIX.md*
