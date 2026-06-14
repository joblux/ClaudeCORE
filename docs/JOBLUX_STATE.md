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

## PROVENANCE DOCTRINE (LOCKED 2026-06-05, Mo+GPT — constitutional)

Promoted from emerging observation to locked constitutional doctrine via DER-001. This clause is supreme: it overrides every operating rulebook, archived doctrine, scaffold, and handoff. Where any lower document permits otherwise, this clause wins.

- Sourced data is allowed.
- Real user contribution (ProfiLux) is allowed.
- AI-invented proprietary salary data is FORBIDDEN.
- AI-invented proprietary interview data is FORBIDDEN.
- Approval does NOT legitimize invented proprietary data. A moderation/queue gate is not a provenance source.
- LuxAI transforms sourced information; it does NOT originate proprietary truth.
- ProfiLux and contributions are the human truth layer; the only accepted origins are sourced intelligence and real user contributions.

Legitimacy test: provenance, not authorship. AI-assisted + sourced/attributed content is legitimate; a generated factual claim or human testimony about a real entity with no source is not.

### SOURCE-GROUNDED REASONING (LOCKED 2026-06-05, Mo+GPT — constitutional clarification)

The reset correctly killed FREE HALLUCINATION. It must NOT kill USEFUL REASONING. These are not the same thing. A JOBLUX analyst does not invent — but he THINKS. LuxAI must behave like a JOBLUX analyst, NOT a sophisticated ETL. Extraction-only (copy field → store field) needs no intelligence engine; a crawler + SQL mappings would do. The value of LuxAI is to understand the mission, find the right sources, cross-reference, SELECT what is relevant, prioritise, NORMALISE, and synthesise — with provenance attached.

- FORBIDDEN: asserting a fact that NO source supports (free hallucination).
- REQUIRED: reasoning, normalising, summarising, and selecting the correct value WHEN sources support it.
- "extraction-only / any transformation = invention" is RETIRED. It was an over-correction that turned the brain into a photocopier.

Worked example: Wikidata P159 = "cité du Retiro"; LuxAI displays "Paris, France". This is factual NORMALISATION (Retiro is a quarter of Paris), not invention. Raw value + source_url are retained as provenance; the user-useful value is displayed.

Engine flow: Sources → extraction → CONSTRAINED REASONING → user-readable value → source_url kept → Mo review. Use IQ as a brain, not a photocopier: no hallucination, no dumb copy — sourced reasoning.

Enforced: §218 AI-forbidden-family approve guard (@fa2d8bc); provenance lock 378f9c4b. §218 is not to be narrowed.

## LUXAI / SIGNALS / WIKILUX — LOCKED DOCTRINE (lifted from ship-log, Mo+GPT)

Operational doctrine for the LuxAI / Signals / WikiLux lane. The living counterpart to the ProfiLux DO NOT block. Lifted from ship-log records so it survives ship-log archival. Subordinate to the Provenance Doctrine and Source-Grounded Reasoning clauses above; where those conflict, they win.

### Source pyramid (locked)
- L1 Wikidata / Wikipedia = baseline, NOT product.
- L2 institutional (annual reports, heritage pages).
- L3 sector press (Signals V1 approved list).
- L4 JOBLUX proprietary (careers / hiring_intelligence / salary) = the differentiation Wikipedia will never have; the still-empty sections are the goal, not a gap.
- A mono-source (L1-only) fiche is technical proof, not a publishable JOBLUX-grade fiche.

### Signals — two-call architecture (locked, lab-validated)
- Pipeline: Triage (brand-scoped) -> Subject Extraction (brand-NEUTRAL call) -> mechanical tag rule -> content_queue.
- Subject extraction MUST be a separate brand-neutral call; brand-scoped wording structurally anchors and cannot be fixed from inside the triage prompt.
- subject_brands (who the story is about) is stored DISTINCTLY from computed_tags (what is inside the pilot perimeter).
- UNTAGGED is a normal, explicable state (industry-level / group-level / off-pilot maison), NOT an error.
- Extraction failure is NON-BLOCKING: admit untagged + extraction_failed. No `brand_tags:[d.brand]` fallback (that path is dead repo-wide).

### Signals — publication doctrine (locked Mo+GPT)
- Signal headline = JOBLUX-written, NEVER the source title.
- NO public source attribution: JOBLUX signs the intelligence; provenance stays internal. Source-link display = decided NO.
- Thin-source content is reviewable but NEVER publishable.
- Tags = the truth of the story (maison-only doctrine); never the discovery query's brand.

### Triage / admission gates (locked)
- Triage shape = single-call full-corpus, LOCKED.
- Admission window = 30 days.
- MIN_BRAND_RELEVANCE = 0.7 mechanical gate between model filter and freshness window; missing/non-numeric score is rejected (precision over recall). skipped_low_relevance counter stays separate from model not_recommended.

### Safety posture (locked)
- luxai_sweep_runs is reporting-only (no FK guard); never a write/coupling surface.
- AUTO_PUBLISH_SIGNALS flag is OFF by default (kill-switch); nothing in this lane auto-publishes.

### Workflow rule
- Use Code as a REASONER proactively on doubts / obstacles / repeated failures. Closed problem = recipe prompt; open problem = mission prompt (context + candidate hypotheses + success criteria + guardrails).

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
- **ef280ff → 3a6cf97** `WikiLux S2 — persist draft via content_queue + provenance-gated brand_profile approve (approve != publish)` — Jun 13 2026. BOTH SHIPPED + PUSHED + REMOTE-VERIFIED (remote main = 3a6cf9712b13 = local; tree clean except untracked LINKEDIN_ASSETS/) + DEPLOYED + **PROD QA 4/4 PASS**. 1-page S2 cadrage validated Mo+GPT BEFORE any Code prompt (6 answers locked: object = content_queue row, no wikilux_content write at synthesis; storage = queue-only until approve; content_origin canonical = 'sourced' — 'wikilux_sourced' RETIRED; review path = signals-pattern gates; provenance = _provenance carried VERBATIM into content jsonb; slug = shared transliteration helper). **(ef280ff slice 1)** `lib/slugify.ts` NEW — `slugifyBrand` NFD normalize + strip diacritics + lowercase + hyphenate (acceptance 5/5: Hermès→hermes, Loro Piana→loro-piana, Van Cleef & Arpels→van-cleef-arpels, Chloé→chloe, Tod's→tod-s); wikilux-build: slugifyBrand wired, content_origin 'sourced', literal-dates-only hard rule in synthesis prompt (no estimation/circa/range-completion — Nichanian-class inference killed), `persist?: boolean` flag default OFF (absent/false = byte-identical) → when true ONE content_queue draft row (brand_profile / draft / external_feed, source_url = Wikidata entity URL — never null, `if (!qid)` early-return upstream, GPT-verified construction line). **(3a6cf97 slice 2)** approve route brand_profile branch above the generic fallback (+123/−0 → all other branches byte-identical by construction): gates = external_feed + source_url; pc.slug + pc._provenance present; sourced-or-empty (every FILLED section needs a _provenance entry, 400 listing offenders, mapper NEVER repairs); write = INSERT {slug, brand_name, content verbatim incl. _provenance, content_origin='sourced', status='approved', **is_published=FALSE**}; existing row status='rejected' → 409 archive-dead manual decision (the 72 purged rows untouchable); other existing → UPDATE content + content_origin + updated_at ONLY, is_published NEVER touched (regeneration cannot auto-publish); queue row → status='approved' NOT 'published' + destination_table/destination_id; response {approved:true, published:false}. Brand page values read switched to content.values with legacy hiring_intelligence.values fallback. **PROD QA (Claude AI, Chrome MCP admin + Supabase MCP):** (1) build Hermès persist=true → 200 in 44s, 15/15 sections filled, slug `hermes`; (2) queue row e3d2531b conform (brand_profile/draft/external_feed, Wikidata Q843887, 15 _provenance entries, derived_sources 2); (3) approve → fiche 989f9015: content_origin='sourced', status='approved', is_published=false, 15 provenance entries verbatim; queue approved + destination linked; (4) anonymous /brands/hermes serves generic site shell — ZERO Hermès content public. **GPT D-decisions recorded:** D1 approve = content/provenance validation, publication = SEPARATE act after visual audit; D2 queue source_url = Wikidata entity URL (socle); D3 upsert-by-slug only for future regenerations, never the 72 archive-dead. **First full WikiLux cycle PROVEN end-to-end: Source → Synthesis → Draft → Review → Approve → fiche created, unpublished.** Hermès fiche awaits Mo visual audit = the gate before publication AND before editorial-production mode. Ledger: 427e69b1 CLOSED (prototype delivered through S2); 14650938 updated (stays open); NEW **0414712b** (Hermès visual audit, luxai/high/open — single mission next session).
- **13de889 → 4489a6e → 573b0c8 → 9bda196** `WikiLux S0+S1+S1b+S1c — provenance column + engine contract repair + corpus window, Hermès source-first proven` — Jun 12 2026 overnight. ALL SHIPPED + PUSHED + REMOTE-VERIFIED (session-final HEAD = origin/main = 9bda196; tree clean except untracked LINKEDIN_ASSETS/). **(13de889)** docs/notes/WORKFLOW_OBSERVATIONS_2026-06.md — non-doctrinal note (gate economics: operator review bandwidth as future scaling constraint; family-lane contract: Signals pattern + boundary contracts reusable for Events/Salaries/Reports; STATE growth: 370KB/~89k tokens measured, future hot/cold split consideration). Preservation only, no precedence. **(4489a6e S0)** wikilux_content.content_origin column (text, nullable, no default, CHECK seed/rss/ai/sourced mirroring signals; no backfill — 72 rejected stay NULL archive-dead; source_url/source_ref stay INSIDE content jsonb per locked V1 form). DB migrated via Code Supabase MCP + migration file committed. **(S1 dry-run, no commit)** Hermès via throwaway script (route logic, zero write): integrity PASS — sourced-or-empty held (3 empties = exactly what corpus can't support), placement correct, provenance 13/13; completeness FAIL — mono-source Wikipedia (Wikidata=resolution only, hermes.com 403), truncated at 1970s. Provenance/copyright audit PASS: zero NEAR-VERBATIM, only irreducible factual phrases echo; synthesis confirmed, not copy. **(573b0c8 S1b)** contract/mapping repair: signature_products ADDED ({name,year,note} — page consumed it but v1 schema never produced it = structural gap); `values` SPLIT OUT of hiring_intelligence as top-level (maison identity ≠ employee experience — Mo+GPT: two different truths; page-side mapping follow-up documented in route header for S2); creative_directors prose→ARRAY ({period,name,role} — page only renders arrays, v1 string could never display) + selection guidance; careers clarified = typical roles/pathways structuring the maison, NEVER live job listings; market_position/presence/facts CUT (zero UI consumer, audit-verified; tagline stays, consumed). **(9bda196 S1c)** CORPUS_CHAR_CAP 12000→60000, ONE variable: 13/15 sections (12/15 before), creative_directors 3→17 entries incl. Vanhée/Nichanian/Wales Bonner (Oct 2025), signature_products 3→9 incl. Kelly/Birkin/carrés, real Dumas quote verbatim-verified, since-dates + market cap gained; ~22K input tokens/fiche (Haiku, centimes). **VERDICT: corpus depth was the bottleneck, NOT Wikipedia.** **SOURCE PYRAMID LOCKED (Mo+GPT):** L1 Wikidata/Wikipedia = socle not product → L2 institutional (annual reports, heritage pages) → L3 sector press (Signals V1 list) → L4 JOBLUX proprietary (careers/hiring_intelligence/salary — the still-empty sections = the differentiation Wikipedia will never have). Persist NOT started; public corpus unchanged (72 rejected + Cartier live). Known S2 inputs: content_origin value alignment (engine emits 'wikilux_sourced' — violates S0 CHECK), slug accent fix (herm-s), no-inferred-dates (Nichanian "1988–2026" = mild inference), page-side values mapping, queue routing DECIDED = content_queue brand_profile (Mo: no wikilux_content.status bypass). Ledger: 14650938 updated; 58d888cd ADDED (pipeline efficiency micro-slice, parked); f12ccc0e ADDED (finance display module, parked); 9b806aa3 re-confirmed (luxuryrecruiter purge — .env.example NEXTAUTH_URL misled a prod read this session).
- **79d62cf → 2ecd588** `Admission Quality — ADM-1 mechanical relevance gate + ADM-3 truth-based maison tagging (two-call architecture, lab-validated)` — Jun 11 2026 PM. BOTH SHIPPED + PUSHED + REMOTE-VERIFIED (session-final HEAD = origin/main = 2ecd588; tree clean). **(79d62cf ADM-1)** queue-writer mechanical gate: MIN_BRAND_RELEVANCE=0.7 between model-recommended filter and freshness window; missing/non-numeric score rejected (precision over recall, Mo+GPT); `skipped_low_relevance` counter SEPARATE from not_recommended (model refusals vs code refusals stay distinguishable) + console line; no migration, no luxai_sweep_runs column, radar-sweep/triage untouched; ground truth: the 3 leaked drafts (0.00/0.00/0.30) would all have been blocked, 13 legitimate pass. **(ADM-3a LAB — /tmp only, read-only, zero repo/DB, ~13 Haiku calls)** v1: Oakridge negative control PASS but Burberry missed (multi-subject=0); v2 wording ("include secondary subjects") = REGRESSION, broke Oakridge, Burberry still missed; v3 = MISSION PROMPT to Code (own diagnosis first) → root causes: (1) **structural ANCHORING** — subject extraction inside the brand-scoped triage prompt reads co-subject maisons as comparison context; wording cannot fix from inside (Experiment A anti-anchor wording proved it: C2 still FAIL); (2) lexical trap "Burberry Group Plc" collides with group-blocklist rule. **Experiment B (separate brand-NEUTRAL extraction call) = ALL 4 CHECKS PASS** (Oakridge untagged, Burberry detected, multi-subject=2, events 6/16 credible, boutique=signal). **DECISION LOCKED (Mo+GPT): TWO-CALL ARCHITECTURE** — Triage (brand-scoped) → Subject Extraction (brand-neutral) → mechanical tag rule → queue; original "same Haiku call" cadrage assumption SUPERSEDED by lab evidence. UNTAGGED = normal explicable state (industry-level / group-level / off-pilot maison), NOT an error state. subject_brands (who the story is about) stored DISTINCTLY from computed tags (what is in pilot perimeter). **(2ecd588 ADM-3b)** 5 files +189/−4: `lib/luxai/subject-extraction.ts` NEW (canon-lift VERBATIM from /tmp/adm3a-v3.ts Experiment B, 4 named deviations; brand-NEUTRAL by construction — Discovery.brand deliberately EXCLUDED from items sent); `triage.ts` deviation 5 = content_nature spec (Experiment A wording, observation-only, stored never routed, defensive null-normalize); `queue-writer.ts` mechanical tag rule (KNOWN_MAISONS = 5 pilots commented as NAMED V1 LIMITATION + GROUP_BLOCKLIST LVMH/Richemont/Kering/Prada Group; brand_tags = case-insensitive intersection; **`brand_tags:[d.brand]` DEAD repo-wide, no fallback on extraction failure**; raw_content.tagging = {subject_brands, computed_tags, tag_state tagged|untagged|extraction_failed}; untagged counter + console line); `radar-sweep.ts` ONE neutral call per brand on recommended non-other items (prompt neutral, per-brand batching = sweep failure isolation ONLY; extraction failure NON-BLOCKING → admitted untagged + extraction_failed); ContentQueueTable red UNTAGGED / EXTRACTION FAILED chips (one conditional, admin palette, no redesign). Claude AI line-by-line diff review vs GPT 6-point grid: PASS 6/6. **WORKFLOW RULE (Mo directive, memorized): solicit Code as REASONER proactively** on doubts/obstacles/repeated failures — closed problem = recipe prompt, open problem = mission prompt (context + candidate hypotheses + success criteria + guardrails); the v3 breakthrough came directly from this switch. Live validation = **sweep #2 Mon Jun 15** (first run through ADM-1 gate + truth-based tagging; watch Coolify task log for skipped_low_relevance + untagged counters and the new chips on fresh cards). Ledger: 1003c355 stays OPEN — ADM-2 last (source-tier chips PRIMARY/TRADE PRESS/THIRD-PARTY PR + press_wire caution line, chip-not-gate); non-blocking observations in lane notes (extraction runs pre-ADM-1-gate = token waste only; "no brand tag" text vs UNTAGGED chip cosmetic redundancy → smooth in ADM-2). GPT recommendation recorded: observe sweep #2 BEFORE shipping ADM-2.
- Full ship-log history (entries before the 3 above) -> docs/JOBLUX_STATE_ARCHIVE.md. Doctrine from archived ships already lifted into living sections (commits 49cb2d9, 9c4bc92).


### CURRENT STEP — strict order

ACTIVE FOCUS (Jun 13 close, supersedes prior): **WikiLux S2 SHIPPED + PROD-QA 4/4 PASS (@ef280ff, @3a6cf97) — the full validation path Draft → Review → Approved-unpublished → visual audit → publication EXISTS and is PROVEN live on Hermès. Approve ≠ Publish enforced in code and verified in prod (is_published=false; nothing public on /brands/hermes).** First fiche: Hermès (wikilux_content 989f9015, queue e3d2531b, 15/15 sections, 15 _provenance entries, slug=hermes). Contracts locked this session: content_origin canonical = 'sourced' ('wikilux_sourced' retired); shared `lib/slugify.ts` slugifyBrand = the only slug path for brand_profile; literal-dates-only in synthesis; sourced-or-empty mechanically gated at approve (mapper never repairs); 72 archive-dead rows untouchable (409 at approve); regeneration updates can never flip is_published. **NEXT SESSION = ONE MISSION (Mo+GPT, NOTHING auto-starts): Hermès fiche visual audit (ledger 0414712b)** — open the fiche, read it as a user, judge quality/tone/structure/provenance, list real observed defects, THEN decide whether WikiLux moves from technical-proof mode to editorial-production mode. No new architecture, no new lane, no dev before that verdict. Publication remains a separate act after the audit. AFTER the audit (order unchanged from prior focus): (2) source-family prioritization with the pyramid grid — L2 institutional (annual reports, heritage pages) first candidate, target = the still-empty proprietary sections; (3) observe sweep #2 (Mon Jun 15 ~06:00 Paris) — ADM lane untouched again this session: 1003c355 OPEN, ADM-2 cadrage-approved but NOT shippable until sweep observation. OPEN QUESTIONS for S2+ unchanged (which completeness level is publishable; what is the JOBLUX-grade fiche; how to feed the proprietary sections). FROZEN: editorial/prompt tuning, freshness tiers, real-confidence Option B. Sequence enforced: **Propose → Stop → Mo decides → Execute.**


The WikiLux-Engine focus below remains the parent lane (corpus reconstruction, ledger 14650938) but is now pursued THROUGH the Acquisition Layer; B2b "discovery expansion via direct fetch" is closed-as-walled, superseded by the radar approach above.



**WIKILUX V1 — STATUS GUARDRAILS (do NOT treat as approved truth):** Cartier V1 = reference draft, NOT approved, NOT published — do NOT enrich Cartier by hand (Mo, Jun 6); manual Opus drafts only clarified the target, STOP. BRAND-PAGE-V1 = working reference, NOT visually validated — filename says "LOCKED" but that is aspirational; truly locked only after Mo's visual audit + iterations. "Creative Directors" placement NOT validated — known conflict: the locked decision places this section in Overview ("Who shapes it today"), NOT as a standalone block; deployed code diverges → resolve by visual audit. "Signature Products" — section content validated, on-page display NOT validated. Capability #1 PROVEN ≠ system PROVEN — still fails on homonyms / private brands / groups-vs-maisons / hotels / automotive (Aman, Rolex, AP not yet handled). Visual judge = Mo + GPT, never Claude/Code.


Queue UX legibility lane CLOSED @ **18ab087** (G4 = Option C: `/admin/content-queue` kept alive + made legible; 5 presentation-only slices, prod-QA PASS). New parked finding: AI-forbidden-family enforcement gap — the badge is advisory-only, approve route still publishes AI forbidden families (article/event content_origin=ai); reconciliation lane PARKED by Mo, do not start. This sits inside NEXT STEP item 3 (retirement execution) + item 4 (enforcement-rule table → code) below — same root, now with a concrete entry point at the approve route. Items 1-5 below unchanged.

Market-Salary Queue V1 SHIPPED @ **757b6b1** (COOLIFY-GREEN + PROD-QA PASS). Source-backed market salary now flows: `market-salary` route → `content_queue` (`external_feed`, `source_url` required) → approve → `salary_benchmarks` (`content_origin='market'`, `confidence='verified'`, source year preserved). Direct-write bypass closed (`salaries/admin` POST→410). **Option B provenance LOCKED** (table = origin lane; no `source_origin`; blended public estimate OK while internal provenance stays traceable). NEXT STEP item 1 (Salary implementation) is therefore **PARTIALLY delivered** — the queue+approve market write-path now exists; what remains = external source list, market-salary curate UI (V1.1), optional audit columns, and the V1 hardening slice (per-record field validation + URL format). Items 2-5 below unchanged.

Security class F-admin-api-auth-class SHIPPED + QA-PASS @ 3c3cc56 (1ed4828d closed). No unresolved security blocker; v17 cutover now gated by implementation decisions (not security). LuxAI PROVENANCE DOCTRINE LOCKED this session (ledger 378f9c4b): per-family operating model — AI may transform source material, never originate factual content or human testimony from nothing. WikiLux = strict no-memory (no source → no fact); regenerate-wikilux NON-COMPLIANT until retrieval layer or disabled. Salary = hybrid + provenance-segregated (Contribution Intelligence vs Market Intelligence NEVER merged; no source → no figure); regenerate-salary NON-COMPLIANT, PAUSED. AI Signals/Events/Interviews = RETIREMENT candidates. Card Intelligence = KEEP, reference pattern. Articles/Reports = KEEP (second-order). Library = KEEP.

NEXT STEP — strict order — REORDERED Jun 5 2026 (Mo + GPT validated). GOVERNING PRINCIPLE: doctrine execution BEFORE cutover. No v17 cutover while any family publishes in violation of provenance doctrine (378f9c4b). The visible (UI/cockpit) never precedes the invisible (enforcement). One step → QA → STOP. Reorder rationale: the Queue UX legibility lane (74b5782→18ab087, Jun 4) was executed AFTER the provenance lock (378f9c4b, Jun 3) and AFTER the "two write architectures" finding (38eedfc, Jun 3) named WikiLux as highest-ROI target — i.e. visible UI work took priority over already-identified enforcement debt. This reorder corrects that inversion. Audit basis: 5-family pipeline audit + 4-RED verification (Jun 5, read-only).

0. Neutralize seed-brand-salaries / salary AI producers. Decision LOCKED (Mo+GPT): §218 wins — do NOT narrow §218. seed-brand-salaries currently creates salary_benchmark+joblux_generation drafts the canonical approve guard now blocks (403) → producer/approver contradiction created by fa2d8bc. Neutralize the AI salary producers; the market source-backed lane (757b6b1) remains the only salary publish path.
1. Neutralize admin/luxai/approve legacy route. Lives in app/ (POST-reachable, admin-gated) but has NO §218 guard and writes signal/event/article to live tables WITHOUT content_origin. No app/ UI caller (the LUXAIAdminClient.tsx caller is in untracked-from-build luxai_admin_fixed/). Neutralize (410/404) or apply the same guard.
2. Fix add-brand direct publish. Inserts wikilux_content is_published=true BEFORE generation (bypasses queue entirely; also F-7a64d29d publishes-empty-on-gen-failure). Route via queue OR default is_published=false.
3. Fix bulk-regenerate-wikilux + cron/wikilux-refresh direct publish. Both update wikilux_content status=approved/is_published=true with no queue, no human gate, no content_origin. Disable OR route via queue/review.
4. Generalize enforcement: provenance guard per family at approval — signals=source_url, events=source_url, interviews=contribution_id, card_intel=source_ref, wikilux=source-set, salary=source+origin required. Generalizes the Baselworld fix (fa2d8bc) across the 5 families.
5. WikiLux retrieval layer — build retrieval from sourced material (website/reports/earnings/prior signals/internal intelligence) OR disable regenerate-wikilux per strict doctrine. (Raised ahead of retirement per GPT: WikiLux is brand source-of-truth.) regenerate-wikilux is declared NON-COMPLIANT until this resolves.
6. Retirement execution — disable AI signals/events/interviews pure-memory generators (decision leans yes; confirm with GPT; not yet executed).
7. Legacy seed data audit/decision. DB-revealed: content_origin='seed' rows live in prod, never gated (salary_benchmarks 5595 ai + 5 luxai context, bloglux_articles 28 seed, events 8 seed, signals 9 seed). Audit keep/retire/re-source. Mo decision, outside cutover.
8. v17 cutover tail — ONLY after 0-6 are GREEN. G3 bulk-regenerate-wikilux wire-or-drop; G4 queue moderation RESOLVED (Option C, /admin/content-queue kept alive @18ab087). The cockpit does not cut over onto a non-compliant engine.
DOCTRINE LOCK ref: 378f9c4b (provenance), 6c502fbf (salary/interview autonomy), f0e9be64 (taxonomy governance). §218 = AI-forbidden-family approve guard, enforced @fa2d8bc, NOT to be narrowed (Mo+GPT, Jun 5).

CLASSIFICATION RULE (3 axes, this lane): a v17 port target is wired only if (1) per-brand/operator real (non-hardcoded, scales), (2) correct write-target, AND (3) hunter or hybrid-sourced. Pure-memory generators are doctrine debt — port only if re-sourced, else retire. Migration scripts / hardcoded lists / backfills / null-repair tools are NOT ported.

DOCTRINE LOCK (`6c502fbf`): Salary + Interview are autonomous families (own data/validation/sources/lifecycle). Brand is a presentation hub, NOT a pipeline owner. regenerate-salary stays decoupled from regenerate-wikilux permanently.

NEXT — none auto-started beyond P2.8 classify. Mo picks scope.

Candidates (per STATE NEXT block):
- Taxonomy V2 implementation — boundary-map lib/profilux/taxonomy-bridge.ts (build WITH auto-matching consumer, not before; governed by f0e9be64)
- ProfiLux Versions V2 — parked (101f4deb)
- cv-merge route/API deletion — cleanup slice (ledger 8aee8108, parked, low)
- Seniority taxonomy — dedicated session needed

HELD (Mo): ProfiLux cosmetic debt (ledger parked) — Edit overview eyebrow "ProfiLux Overview" -> "Overview" (mock approved) + apply/route.ts stale "cv_parsed_data is swapped" JSDoc (false since S-C).

OPEN FINDING:
- `378f9c4b` — STRATEGIC FINDING (parked, high): LuxAI = two incompatible modes — Hunter (source-backed: ingest-rss/ingest-events-rss/generate-library/enrich-card-intelligence) vs Generator (model-memory: regenerate-wikilux/regenerate-salary/generate-signal(s)/generate-events/generate-interview). Sharpest point: generate-signals + ingest-rss coexist = two competing definitions of a Signal. Mo product history favors Hunter-first. NOT doctrine — revisit after v17 + recruiting-loop stabilization.
- `e880ee2a` — F-wikilux-sourcing-asymmetry (parked, low): WikiLux brand content model-generated, below the Signals sourcing bar; acceptable for launch.
- `5ef57f0b` — F-careers-salary-tab-reactivation (parked, normal): reconsider a Salary surface on /careers within a broader /careers rethink.
- `7a64d29d` — F-add-brand-publishes-empty-on-gen-failure (parked, low). add-brand publishes is_published=true + content={} before generation; if gen fails, brand left published+empty and Fill empty (is_published=false filter) never catches it. Not urgent (all 73 brands have content). Surfaced during cockpit Brands design.
- `9d5b95e4` — LuxAI Command Center refoundation FROZEN pending admin-wide reorg (parked, normal).
- `c93de043` — F-interviews-api-insert-is-publish (parked, normal): /api/interviews has no status/origin gate; approve mapper is sole publish gate.
- `b93fb82e` — F-wikilux-brands-empty-decoy (parked, low): wikilux_brands 0 rows/unused; brand truth is wikilux_content (72). Not a blocker.
- `5fafbd5d` — backend-prep slice CLOSED (inventory 3646517 + brands-enriched e9c854f shipped this session).
- `0e2a2240` — OPEN: Mo chooses Phase 2 TSX shell (A) vs optional Slice 3 domain endpoint (B). No TSX until confirmed.
- `dec8739e` — PARKED: WikiLux page-completeness / code-vs-data drift. Generator (lib/wikilux-prompt.ts) defines 16 keys incl. signature_products + current_strategy (present on only 5/73); stored data carries quote(68)/salaries(69)/founder_name(68) NOT in the generator's 16. Code-canonical ≈5/73 complete vs prototype quote-based 68/73. Mo-only canonical-definition decision; no completeness logic until decided.
- PARKED (v17 cockpit): **72 vs 73 brands count discrepancy** — surfaced building the v17 cockpit. Inventory/Brands views report a brands total that does not match the "73 brands" baseline used elsewhere in this file (one brand short, 72 vs 73). Source not yet isolated (is_published filter vs raw count, or a tombstoned/draft row). Surface count source before wiring the Brands tab so the KPI/matrix doesn't silently undercount.
- PARKED (v17 cockpit): **Research Reports in_queue mapping gap** — the inventory endpoint counts the Reports row by `content_type = report`, but `generate-report` writes drafts with `content_type = article` + `category = 'Research Report'`. Result: generated reports do NOT increment the Reports in_queue count in Overview (they land under articles). Reconcile the counting key (match on category, or align the write content_type) before trusting the Reports row.
- PARKED (this rotation): WikiLux View/Edit/Delete + admin management absorption into cockpit; admin sidebar / IA reorg + removal of standalone admin pages; Overview 12-week trend sparkline (no pre-aggregated time-series).

**Approved candidate structure:**

CORE (9)
- Identity
- Current Position
- Career Path
- Education
- Languages
- Luxury Sectors
- Business Functions
- Availability / Mobility
- Compensation

OPTIONAL (8)
- Technical Skills
- Certifications
- Awards
- Strategic Initiatives
- Portfolio
- Press & Features
- References
- Internships

Dropped:
- Memberships

Internal/admin-only (DB-resident, no candidate Edit surface):
- `market_knowledge`
- `clienteling_*`
- `brands_worked_with`
- `product_categories`

**PF-MANAGE V12 follow-ups parked (not active queue, pickable when relevant):**
- `7ceca5fc` — F-pf-manage-delete-account-absorption (medium). Settings page still hosts Delete account + RGPD export. Per Mo Q1 directive, Settings progressively absorbs into Manage. Next slice should move Delete account row to Manage Account section + decide if RGPD JSON export stays on Settings or moves to Share & export.
- `f6c3d8ed` — F-pf-manage-tab-url-sync (low). Initial-only URL read works; URL doesn't update when user switches tabs via UI. Polish slice for shareable deep links.
- `92e3fb8a` — F-pf-manage-share-pdf-download (low). Disabled Coming Soon button is V12-honoring; real implementation requires masked client PDF projection, gated on C-B-2 / C-B-3 per §19A.3.

**ProfiLux candidate experience open items (audit-surfaced, parked):**
- `de93a399` — F-pf-cold-start-no-editor-data (medium). Line 1723 of `app/dashboard/candidate/profilux/page.tsx` renders literal "No editor data." on cold-start.
- `761cda8e` — F-pf-completion-vs-living-document-tension — RESOLVED-BY-PIVOT (pending QA). % removed candidate-facing per MATRIX v1.16; scorer stays internal.
- `1d48010d` — F-pf-candidate-visible-confessional-copy (medium). "Substrate ships now" wording leaks substrate vocab to candidates.

**Maintenance debt (pickable before next maintenance_mode toggle):**
- `4fca2c39` — F-MAINT-1. `/client-submissions/*` not in `MAINTENANCE_BYPASS`. Address before any future maintenance_mode true flip — would break tokenized client dossiers.

**ProfiLux + Matching substrate audit CLOSED** (ledger `cca052d0-9931-4241-a060-0f53a8e18d8d`). 9 findings produced + triaged.

**Final repo HEAD: `79d81d9`** (ProfiLux one-world convergence A+B1+B2+C1+C1.1). Next session = C2 (remove banner + Resolve link + simplify Done) then C3. Coolify GREEN.

**Parked findings opened this session:**
- `63a0104e-04c6-43c2-aae8-c84f584c559a` — F-AUDIT-4 directory §10.1 bypass (normal)
- `46ceb39b-b5d3-428a-99d6-2e1c84efa337` — F-AUDIT-7 5 dormant members columns (low)
- `c8cd77d5-8aaf-4667-8ab4-6a7f5c0b3afa` — F-AUDIT-9 ResolvedEducation.degree legacy (low)
- `4fca2c39-1f64-4f35-88f6-a53567b3eb03` — F-MAINT-1 /client-submissions/* not in MAINTENANCE_BYPASS (medium; address before next maintenance_mode toggle)

**Pack E post-launch backlog (parked, unchanged):** ledger `0b6bfc85-c09f-493c-84aa-914dedb14f63` (E.5c-g, E.6.4, E.6.5, revocation UI).

**Out of scope until next lane defined:**
- Any further backend audit work
- Further code on F-AUDIT-1 / F-AUDIT-3 / F-MAINT-1 (shipped or parked)
- MATRIX doctrine expansion
- Auto-matching engine (`computed_by='auto_v1'`)
- Brief-source accept conversion (Option C lock holds)

### DO NOT

- **CV merge apply = PRESERVE-OLD-ONLY (S-C, live RPC `apply_cv_merge`, migration `apply_cv_merge_preserve_cv_parsed_data`, 2026-05-25):** never reintroduce the wholesale `cv_parsed_data := pending` swap. Accepted items write to L2 only; the final RPC step clears `cv_parsed_pending` and leaves `cv_parsed_data` / `cv_parsed_at` untouched; `p_new_cv_parsed_data` stays in the signature unused. Reintroducing the swap = the 83->49 destructive regression + silent import of unaccepted CV data. Clarification (v1.16): the initial-path parse writing cv_parsed_data is the first-pass pre-fill, NOT the forbidden apply-time `cv_parsed_data := pending` swap, which remains forbidden on the re-upload path.
- **CV merge UI = no silent overwrite (S-D, `cv-merge/page.tsx`, 2026-05-25):** identity `changed` rows default to Keep existing (omitted from accept); the user must actively pick Apply new (supersedes 1b49091 auto-select). Do not re-add an `Ignore` option to identity rows (Keep existing already = omit). `matched` rows stay informational, no control. Applies to the re-upload conflict resolution layer only (v1.16).
- 'Review' is retired as a ProfiLux product concept (CV pre-fill model pivot, v1.16). Re-upload uses a conflict resolution layer, not a review screen. The word survives only in historical LAST SHIPPED commit descriptions and as the technical route name cv-merge. Do not reintroduce a candidate-facing Review/confirm screen on the initial path.
- ONE-WORLD LOCK (2026-05-30, Mo+GPT): the candidate NEVER leaves ProfiLux to review CV data — ProfiLux IS the review surface. cv-merge, the 'CV analysis ready' banner, 'Resolve CV updates', and any routing detour are REMOVED from the candidate journey. Re-upload = file picker -> cv-upload -> parse mode:initial (cv_parsed_data overwritten; L2 always survives; new CV rows surface as L1 with Looks good/Edit). Do NOT write cv_parsed_pending on the candidate path. Do NOT reintroduce cv-merge as a candidate destination. The title-changed-on-already-confirmed-role duplicate is an ACCEPTED impl detail — build nothing for it.
- **Taxonomy Governance Rule (ledger `f0e9be64`, permanent doctrine):** any change to vocabulary, job-family, sector, target-role, matching-tag, or category taxonomies requires an explicit Mo decision BEFORE any mock, plan, or code work begins. Claude and GPT may only audit existing taxonomy state, propose options, or ask clarifying questions — they may NOT introduce, rename, merge, split, or reorder taxonomy entries without prior written approval from Mo. This rule blocks Career History V2 gaps G5 and G9, and any future slice whose surface touches a taxonomy axis.
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
- Render completion/readiness % on ANY candidate-facing surface (View, Edit, dashboard). Completion is internal-only (matching/admin) per MATRIX §8.2. Superseded the prior 'Edit keeps % as maintenance signal' allowance (CV pre-fill model pivot, MATRIX v1.16).
- Reintroduce demo drawers, demo buttons, or "preview" UI in Manage tab. Manage tab is now production read-only; future controls must replace, not coexist with, the current state panel.
- Build any product-facing surface (tunnel, editor, dashboard, admin) without first read-only inspecting the live components per the visual guardrail.
- Drift from the executive-presence guardrail in any copy or microstate.
- Delete or remap tunnel `renderStep()` cases for sections that have an active drawer integration.
- Touch `/api/profilux` POST recompute or the canonical M6 scorer in `lib/profilux/computeProfileCompleteness` / `lib/profilux/_m6Groups`. The doctrine fork on what `profile_completeness` semantically represents is parked observation-only under `f6508e54`.
- Section-visibility revert note (Pack F `5ce934e`) is STALE as of 2026-05-22: candidate-side section visibility is intended and shipped. Do not re-revert.
- TAXONOMY GOVERNANCE (Mo 2026-05-22): any change to vocabulary / job families / sectors / target roles / luxury capabilities / matching tags / category naming requires Mo decision BEFORE mock, plan, or code. Claude/GPT may only audit, identify gaps, propose options, ask Mo to choose — never rename, merge/split, introduce job families, decide final labels, or wire a different vocabulary without Mo approval.
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
- Do not auto-generate `share_links` on submit-to-client. E.4 records the submission act only (timestamp + stage + optional metadata + stage_history). Client-facing share artifact is E.6 (PARKED, gated on Mo + GPT client-template visual lock). Do not pre-stub, do not pre-scaffold, do not invoke `projectFor('client')` from this endpoint or any sibling write path. The existing PUT `/api/applications/[id]/stage` endpoint stays backward-compatible for `stage='submitted_to_client'` — do not reject that value there until a future explicit deprecation slice.
- Do not reuse candidate-style email templates for admin/recruiter alerts. Admin templates use `adminLayout` (matches `adminApplicationWithdrawnEmail`), allow full identity disclosure, and contain no gold accent. Candidate-style templates (`candidateMatchedEmail`, `applicationStatusEmail`, etc.) stay candidate-facing. Cross-use is a doctrine break.
- Do not silent-catch `sendEmail()` on new notification call sites. New code must capture the result, branch on `!result.success`, and `console.error` with `{error, recipient, context_id}` payload. The pre-existing `.catch(()=>{})` pattern on legacy call sites is parked debt (`contributionApprovedEmail` and ~10 others), not a precedent. Wrap the entire enrichment + send block in `try/catch` with a top-level `[E.5*] Unexpected enrichment error` log so email failures never fail the HTTP response.
- Do not extend admin alerts with new templates by reusing brittle anchors. New admin templates go through the `adminLayout` + `adminRow` + `adminButton` primitives already present in `lib/email-templates.ts`. CTA URLs must point at routes that exist in `app/admin/*` — if no admin route exists for a given resource, omit the CTA rather than ship a dead link.
- Do not convert `POST /api/contribute` to 410/Gone or delete the route file. D1.a (2026-05-18) confirms the endpoint has 1 live caller (`app/dashboard/insider/submit-correction/page.tsx`, linked from insider dashboard nav), an admin moderation surface (`app/api/admin/contributions/route.ts` reads `brand_contributions`), and an RGPD export contract dependency (Pack B.3.4 / MATRIX §19B). Any future D1 slice that removes `/api/contribute` MUST first migrate the insider caller, the admin surface, and the export contract — in that order. D2 in `docs/DEFECT_ANCHOR.md` is marked OBSOLETE; do not act on the original "orphan endpoint" framing. D1 structural intake debt remains OPEN as a multi-slice lane (see D1, D3, D5, D10, D11).
- Do not alter the E.6.4 business relationship layer without a new slice + Mo approval: `business_member_id` remains REQUIRED on submit-to-client, `client_business_name` stays a derived snapshot label (never free-text), and the ATS compose + Business detail submissions surfaces are locked from ad-hoc redesign.
- Do not use gold (`#a58e28`) for visibility, operational, or activation feedback. Gold stays editorial only (filets, italic accents, header eyebrows, hairlines on luxury surfaces). Operational state — visibility/hide toggles, activation success, save confirmations, "On"/"Off" affirmations — uses brand-green `#1D9E75` (or `rgba(29,158,117,0.18)` for glow). Anchors: PF-PUBLIC V12 spine availability dot, ProfiLux Edit "Hidden from shared CV" toggle track (`renderMaskToggle`), Slice 2a library-section activation pulse, Saved indicators across the candidate page.

- Section visibility & sovereignty doctrine LOCKED (MATRIX §26, 2026-05-23): core sections (`section_visibility` hide/show) and optional sections (`activated_sections` add/remove) are SEPARATE substrates — UX coherence only, never DB merge. Core-section VISIBILITY actions never delete data (hide/show only). OPTIONAL-section REMOVAL deletes that section's data (Mo decision 2026-05-23 — see §26 AMENDMENT bullet below). Core-section content deletion remains an explicit in-drawer row action only. Candidate owns outbound visibility; admin/operator surfaces read full data through their own projection paths and never silently alter candidate visibility. Candidate's AUTHENTICATED Edit/View is the cockpit — never hides data from the candidate; `/[slug]` is an outbound projection, NOT the cockpit. Public/share/client honor `section_visibility` + `masked_fields`.
- Canonical visibility vocabulary (LOCKED MATRIX §26.6): "Visible on shared profile" / "Hidden from shared profile" / "Removed from my passport". Do NOT use "inactive" and "hidden" interchangeably; for CORE sections do NOT imply deletion when hiding; for OPTIONAL sections removal IS deletion and copy must say so (confirm dialog: "permanently deletes… cannot be undone"); do NOT use "deactivate" as candidate-facing copy.
- G2 scope boundary (LOCKED MATRIX §26.7): a "Hidden from shared profile" core section stays fully editable in Edit with a dim/label treatment on the existing `section_visibility=false` state. Presentation only — no new substrate, no DB change. The dim is a SOVEREIGNTY INDICATOR, never an error/disabled/incomplete state. Any G2 slice that adds a mechanism rather than a presentation treatment, or that makes a hidden section read as broken, is out of scope.
- **§26 AMENDMENT — Optional-section REMOVE = DELETE (Mo decision 2026-05-23, supersedes prior preserve-on-remove).** Shipped at 347c14b + b5cbc0b. The earlier 190c44d "keep data" / filter-only behavior is REVERSED. Removing an OPTIONAL/library section drops its key from activated_sections AND clears members.<section> in the same write; a confirm dialog fires when content exists; re-adding does NOT restore prior content. The resolver reads activated_sections literally — no implicit reactivation from non-empty content columns. Applies to OPTIONAL sections only. CORE sections are unaffected: section_visibility stays a non-destructive hide/show, and the G2 dim/label is presentation-only and never deletes. The §26 "no-delete-on-visibility" rule remains true for CORE visibility; it does NOT govern OPTIONAL removal. (Ledger b3a2180d notes this as the deferred §26.2 doctrinal reconciliation.)

- Do not add cross-surface taxonomy equality-matching (candidate axis vs search_assignments axis) without first introducing the boundary-map (lib/profilux/taxonomy-bridge.ts, planned, not built). THREE representations coexist by design: canonical snake_case (vocabulary.ts), Title-Case UI labels (assignment-options.ts), persisted recruiting shorthand (DB: senior/permanent etc). The map normalizes all three to canonical at READ time only; first axes seniority/department/contract_type; pure functions, explicit tables, null on unmapped, no fuzzy. Build it WITH the auto-matching (computed_by=auto_v1) consumer. No file rename, no DB value migration. Governance f0e9be64; doctrine MATRIX §29.

### LIFTED GOVERNANCE LOCKS (pre-archival)

- Department axis: `department` is a parasitic axis from the old recruiting core, NOT a live ProfiLux primitive — redundant with Business Functions, taxonomically divergent vs assignment Title-Case departments. DB column + resolver/projectFor/types kept INERT (no drop), removed from candidate UI.
- Availability canonical set (5 values, locked): not_specified / actively_looking / quietly_considering / passively_exploring / not_available. Legacy vocabularies retired; legacy code fallbacks are temporary debt for a later cleanup.
- URL guard (Pack D canonical, forward): lowercase `http://` or `https://` prefix only, row rejected if invalid, NO normalization.

### PARKED (admin_tasks status=parked)

- `MS-V1-harden` (ledger ADD proposed 2026-06-04) — Market-salary V1 hardening: per-record required-field validation (salary_min/max/job_title/city/country NOT NULL → 400 at ingestion instead of 500 at approve) + `source_url` format validation. Deferred from V1 (GPT-approved scope cut). Low.
- `MS-V1.1-curate` (ledger ADD proposed 2026-06-04) — Market-salary V1.1: admin curate/import UI on the market-salary route (form + CSV) + optional audit columns (`verified_by`/`retrieved_at`/evidence ref = 1 additive migration). Paid sources (Mercer/WTW/Korn Ferry) + assisted extraction = later tiers. Normal.
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

### TRUTH RESET — emerging doctrine + parked candidates (NOT constitutional yet)


DOCTRINE CANDIDATE — 9-family sourcing model (PENDING Truth Reset completion and launch review; do NOT move into Matrix/Constitution/Modus Operandi): 1 Signals/News=source now; 2 Events=source now; 3 WikiLux facts=source now (Wikidata CC0); 4 Salary=contribution + cited/paid benchmarks later; 5 Interviews=contribution-only; 6 Market reports=cite+synthesize never reproduce; 7 Blog/editorial (incl. Insider Voices as excerpt/display format)=owned authored / attributed excerpts; 8 Images=licensed/generic now, Getty later; 9 Store/map=filings+OSM now, paid POI later. Three-truth-systems framing: Retrievable / Contributed / Editorial-Intelligence. "Sourceable ≠ worth sourcing" (Glassdoor interviews: scrapable but ToS-barred + strategically inferior to a contribution engine). Full memo lives in session artifact.

PARKED SCHEMA FINDINGS (Truth Reset): (a) events need source/verification fields + provisional-date flag (website_url alone insufficient); (b) provenance field standardization across content families; (c) explicit separation of generated-draft vs source-backed-publishable content.

TRUTH RESET pass 1 — ARCHITECTURE FINDING (repo investigation @ 5de9441, read-only): JOBLUX has TWO write architectures. (A) QUEUE-GATED: LuxAI generate/ingest routes go through lib/luxai-rules.ts → content_queue (status forced 'draft') → Mo review → approve mapper (app/api/admin/content-queue/[id]/approve) → live table. Validated, typed, deduped, gated. Families: signal→signals, article→bloglux_articles, event→events, interview→interview_experiences, salary_benchmark→salary_benchmarks. (B) DIRECT-WRITE, NO GATE: regenerate-wikilux and regenerate-salary write straight to live tables, bypassing content_queue / review / provenance. CORE FINDING: the direct-write exceptions are exactly where provenance, review, and truth discipline disappear. WIKILUX: regenerate-wikilux (lib/wikilux-prompt.ts buildRichPrompt) writes directly to wikilux_content; generates 17 sections in ONE model pass; some flat cols (founded/headquarters/group_name) seeded from real input but JSONB prose is model-authored around them; quote+salaries are legacy keys NOT in the generator's 17 (cf dec8739e); wikilux_content has NO content_origin/provenance column. 17 sections split: should-be-SOURCED (founder, history, founded, headquarters, presence, key_facts, key_executives, creative_directors, stock) / legit-EDITORIAL (brand_dna, tagline, market_position, careers) / FABRICATION-RISK (quote, salaries, hiring_intelligence, facts, founder_facts). WikiLux = highest-ROI Truth Reset target, NOT an active build lane yet. SALARY: regenerate-salary is destructive DELETE+INSERT on live salary_benchmarks (gen failure after delete = data loss) — reinforces db8e07d1 salary doctrine blocker. INTERVIEWS: constraint fix lets generated interviews reach the queue, but approve mapper has no interview publish branch — publish path intentionally unresolved (breakpoints 2/3). DOCTRINE CANDIDATE (supersedes the abstract provenance taxonomy for now): "Each family needs a concrete data journey map: source → transformation → queue/review → publish → reuse/analytics." Parked, not constitutional.

### NEW FINDINGS LOGGED (out of immediate scope, surface separately)

- **F-D2-obsolete** *(NEW 2026-05-18 PM session 3, audit-resolved)* — D1.a `/api/contribute` orphan check ran on HEAD `82290a4`. Full repo grep across 548 source files. Result: NEGATIVE — endpoint is NOT orphaned. 1 live caller: `app/dashboard/insider/submit-correction/page.tsx` (163-line client component), linked from insider dashboard nav (`app/dashboard/insider/page.tsx` lines 45 + 360 + 388-389, label 'Flag correction', icon '🔍 '). 4 real rows in `brand_contributions` reflect actual member usage. Admin moderation surface exists at `app/api/admin/contributions/route.ts` (5 hits on `brand_contributions`). RGPD export contract (`app/api/members/export/route.ts`, Pack B.3.4 `a6e3a95`, MATRIX §19B) depends on the table with `admin_notes` redaction. D2 in `docs/DEFECT_ANCHOR.md` marked OBSOLETE in same commit. D1-S0 Option A (convert `/api/contribute` to 410 Gone) is therefore NOT viable. D1 structural debt remains OPEN — multi-slice intake fragmentation lane (D1, D3, D5, D10, D11) unaffected by this audit. Read-only sub-audit; zero writes; zero code; zero DDL; zero ledger mutation; no LAST SHIPPED entry. Original DEFECT_ANCHOR provenance commit `bd1b658` left pinned; obsolescence note dated inline.
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

**2026-06-04 rotation — Market-Salary Queue V1 + close:** repo HEAD **3c3cc56**(STATE)/04da9a1(actual, prior docs-rotation commit) → **757b6b1**. The 04da9a1 "drift" was cosmetic — a docs(state) commit recording 3c3cc56 + provenance lock 378f9c4b, not an unrecorded feature — superseded by this rotation. Shipped: Market-Salary Queue V1 (757b6b1, code, COOLIFY-GREEN + PROD-QA PASS) + Hermès orphan unpublish (DB-only, c9cbc294 is_published=false). Option B provenance LOCKED (table = origin lane; no source_origin). CURRENT STEP updated (NEXT item 1 partially delivered). Parked: MS-V1-harden, MS-V1.1-curate. Proposed ledger ops (await Mo): ADD those 2 parked rows; db8e07d1 stays OPEN with a resolution-candidate note (no validation flag). No schema, no migration, no UI.

**2026-06-01 rotation B — LuxAI v17 cockpit session close (docs only):** repo HEAD at close = **4c41f0f** (app HEAD; this docs commit sits on top). Session shipped the v17 parallel cockpit Slices 1 → 3b across 9 commits (e087074 shell, 314970c A3 standalone guard, b6e2eec Overview/inventory, 74439f0 Operations scaffold, 8616e45/4e3766c/2b69d20/3a70bb2 review-first actions queue-only, 4c41f0f Generate signals behind 2-click confirm/auto-publish). Built parallel at `/admin/luxai/v17`; old cockpit untouched, NO cutover. CURRENT STEP rewritten: finish Operations (wire Pull RSS signals w/ 2-click confirm) → build Brands · Signals · Events · Articles · Analytics · Queue one slice each → cutover `/admin/luxai` only after all tabs built + QA-passed. Ledger 0e2a2240 resolved → option A (TSX shell now). Two new parked findings logged: 72-vs-73 brands count discrepancy; Research Reports in_queue mapping gap (counts content_type=report but generate-report writes content_type=article+category=Research Report). Preserved parked: dec8739e (WikiLux completeness drift), 9d5b95e4 (admin-wide reorg frozen). No schema, no DB, no public UI in this rotation.

**2026-06-01 rotation (docs only):** repo HEAD at close = c86b63a (close-completion). Session shipped: Escape disabled (ceb41ed + 6487485), Insights at root + nav reorder + root canonical (5e47cf2), public header resize (81c2a45), LuxAI inventory endpoint (3646517), LuxAI brands-enriched endpoint (e9c854f), HANDOFF V3 (c86b63a). LuxAI v17 Part 1 cockpit prototype LOCKED as TSX target (HTML-only, not shipped to TSX). CURRENT STEP rewritten to Mo A/B decision (ledger 0e2a2240 open): A = Phase 2 v17 TSX shell now; B = optional Slice 3 domain endpoint first; NO TSX until Mo confirms. Ledger reconciled: 5fafbd5d closed, 0e2a2240 open, dec8739e parked (WikiLux completeness drift). Parked: View/Edit/Delete + admin absorption, admin sidebar/IA reorg, Overview 12-week trend; further backend endpoints optional (only on real TSX data gap). No code, no schema, no UI.

**Last updated:** May 24, 2026 — HANDOFF V3 rotation (docs only). Rotated STATE from 716c9e7 (drift-close) to live HEAD e995b12. Prepended 4 LAST SHIPPED entries: 63737a2 (availability taxonomy convergence + migration), a95703e (Slice 1 desired_departments UI removal), 1548f1b (rejected wrapper, history only), e995b12 (Slice 2 redo single Opportunity Preferences frame). Advanced Final repo HEAD pointer 4f2e0ce -> e995b12. Appended LANE 2 partial-progress block to CURRENT STEP with the two locked model decisions (department = parasitic non-primitive axis; surface fusion != substrate fusion). Logged convergence-audit-2 finding d87953f9. Ledger: 3 closed (e190ece9 / 2f9aba8c / e7814d8e) + 1 open finding (d87953f9). Semantics / Taxonomy V2 deferred to next session per Mo. No code, no schema, no UI, no new lane in that rotation.

**2026-05-30 rotation (docs only):** repo HEAD 9ea52bc -> 79d81d9. ProfiLux one-world convergence SHIPPED: A (1ac0331), B1 (b696a98 apply_edited), B2 (4129c0f Looks good+Edit, tri-path save, experienceRouting), C1 (176ac30 re-upload->picker+mode:initial), C1.1 (79d81d9 render missing file input). All Coolify-green + live-validated (Chrome MCP picker fires + Supabase QA net delta 0). Doctrine pivot locked: one-world ProfiLux, candidate never leaves to review CV. Ledger 08e74eb1 label refreshed (May-26 UX-revert framing superseded). DO NOT += ONE-WORLD LOCK. CURRENT STEP rewritten: C2 (prompt ready uncommitted) -> C3 (orphan cv-merge + orientation cards). 2 UX findings logged. No schema, no taxonomy, no V2 touch.

**2026-05-29 rotation (docs only):** repo HEAD 2b1bc6a -> 9ea52bc. CV pre-fill model pivot: doctrine v1.16 lock (2afc49f) + 3 code slices (57369c5 initial-parse target, 8398836 v4 Edit copy/%, 9ea52bc dashboard de-framing). All prod Coolify-green. QA DB-side (browser login 2FA-blocked). Ledger 08e74eb1 carries the lane (no new finding). Next strict step: Edit framing pass (remove Re-analyze button + ?reanalyze reader; demote initial-path banner; Overview box -> v4 invitation). Direct-edit-to-L2 rewiring parked as optional follow-up.

**2026-05-26 rotation (docs only):** repo HEAD 7c8a38d -> 2f28d08 (1 taxonomy docs commit d9f4e7e + 8 CV onboarding commits 68afd32->2f28d08, advanced by this rotation). Prepended CV->ProfiLux onboarding lane entry. Two lanes: Taxonomy V2 docs (KEEP, d9f4e7e, MATRIX §29) + CV onboarding 8-commit lane (PARTIAL). Mo decision at close: recovery layer over-engineered, next session does a targeted UX revert to upload->parse->review->(Apply|Cancel)->continue; SliceA data contract + SliceC detector fix + identity tri-state STAY, B/flow-patch/nav recovery UX strips out. Ledger: 08e74eb1 reopened+rewritten as F-cv-onboarding-flow-simplification (high/open) carrying full keep/remove spec + open question (does Edit tab already cover manual editing -> if yes Discard fully redundant). Genny test acct left S1. Maintenance OFF. No new lane started; next session is Mo-led from the simplification spec. Mock: joblux-dashboard-flow.html.

**2026-05-25 rotation (docs only):** repo HEAD e995b12 -> 7c8a38d. Prepended CV re-upload coherence V1 (S-A..S-E). Rewrote CURRENT STEP head: V1 CV coherence CLOSED; next lane = Taxonomy V2 read-only audit (gated f0e9be64) OR ProfiLux Versions V2 (parked) — Mo picks. Added 2 DO NOT bullets (preserve-old-only RPC contract; no-silent-overwrite merge UI). Ledger: 69c7fb97 + c760d5a2 closed; Taxonomy-V2 + ProfiLux-cosmetic-debt parked; 101f4deb (Versions V2) already parked. Taxonomy V2 NOT started per Mo.

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

> HISTORICAL SNAPSHOT (Apr 13, 2026) — NOT active operational truth. Counts below predate the corpus reset (wikilux purge, salary unpublish, RSS signals). For live counts, query Supabase. Superseded operationally by the ACTIVE CHAIN ship-records.

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

> HISTORICAL SNAPSHOT (Apr 2026) — the "What's clean" and "What's NOT clean" counts below (signals 11, brands 176, salary 5,609, etc.) predate the corpus reset and are NOT active operational truth. For live counts, query Supabase. The "Hard rules" subsection below this block IS active doctrine.

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
- AI may transform sourced data; it may NEVER originate salary or interview data. Approval does not legitimize invented proprietary data. See `## PROVENANCE DOCTRINE` (constitutional, locked 2026-06-05).

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
- ProfiLux editor at `/dashboard/candidate/profilux`: View / Edit / Manage triad. View = candidate's private living professional document. Edit = enrichment/data capture surface (S1.5 prefill panel + 7 per-section drawers + 11-screen tunnel coexisting). Manage = read-only Visibility & sharing panel (v0 shipped at `a829033`); reads `/api/profilux/share`; sharing toggle UX gated on reset-link unparking (`0e6f3271`). Transition: Edit (control) -> Done -> View (result); dashboard is a separate voluntary exit (v1.16).

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
- Identity prefill: registration-wins + fill-if-empty on the initial path; edit/save promotes L1->L2 (explicit act). Silent L1->L2 writes (without a user action) remain forbidden across all code paths (v1.16).
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

- Always Claude Haiku 4.5 (claude-haiku-4-5-20251001) — never Sonnet or Opus for generation. (Haiku 3.5 retired Feb 2026.)
- Haiku wraps JSON in markdown backticks — always strip by finding first `{` and last `}`
- All generation endpoints write `content_origin: 'ai'`
- Command Center at `/admin/luxai`
- Content Queue at `/admin/content-queue` (single editorial gate)
- RSS pipeline: RSS ingest → brand-list filter → LuxAI structures → confidence gate → content_queue (status='approved', NOT published). Approve != publish — no public publish without explicit Mo gate.
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
- **Tap-target rule:** NO global 44×44 tap-target selector (it inflated editorial density platform-wide). 44×44 is opt-in only via the `.touch-target` class; default UI keeps declared V12 dimensions.

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

> HISTORICAL SNAPSHOT (Apr 10, 2026) — pre-reset launch state. NOT active truth. Reflects 176-brand / 5,609-salary / 11-signal era. Retained as audit trail only.

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

> HISTORICAL SNAPSHOT (Apr 2026) — mirrors stale §6 counts. NOT active truth. Retained as audit trail only.

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
- Initial path: registration values win; CV fills EMPTY identity fields only (fill-if-empty, non-destructive). Editing/saving an identity field writes L2 (explicit act). Visible copy: 'Kept from your registration — never overwritten by your CV.'
- Re-upload path: identity conflicts handled by the conflict resolution layer (never silent overwrite)
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

**Last updated:** 2026-05-21
**Session summary:** PF-PUBLIC V12 `/[slug]` controlled-share lane closed (View-fidelity through PublicProjection, three-lever masking, contact in spine, editorial refonte); ProfiLux Edit taxonomy restructuring (Luxury Sectors / Business Functions / Technical Skills exposed; Luxury Fit / Skills & Markets / Clienteling / Maisons retired from candidate Edit; DB columns preserved); guided added-section flow on the 5 structured library sections (intro + examples + meaningful labels + green activation feedback). Next lane: ProfiLux dossier restructuring — Slice 2b → 5.

*This document replaces all prior context/handoff files. Update this file at the end of every session. One document, always current.*
