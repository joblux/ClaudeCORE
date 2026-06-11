# JOBLUX HANDOFF — 2026-06-11 (PM session)

## 🔥 SNAPSHOT
- Active blockers: none. ADM-1 + ADM-3 shipped + remote-verified (@79d62cf, @2ecd588); Coolify deploy green expected; first live proof = scheduled sweep #2.
- Next 3 steps: (1) observe sweep #2 Mon Jun 15, (2) ADM-2 cadrage after observation, (3) cadence re-eval after sweeps 3-4 → WikiLux corpus (14650938).

## 1. WHAT WAS COMPLETED TODAY
- **ADM-1 @79d62cf** — mechanical brand_relevance≥0.7 gate at queue admission (queue-writer only, +19/−2). Missing/non-numeric score rejected (precision over recall). `skipped_low_relevance` counter separate from `not_recommended`. The 3 drafts that leaked Jun 10 (0.00/0.00/0.30) would all have been blocked.
- **ADM-3a lab (read-only, /tmp, ~13 Haiku calls, zero repo/DB)** — 3 iterations over the 16-draft ground truth. v1/v2 wording failed; v3 mission-prompt to Code found the root causes: structural ANCHORING (subject extraction inside the brand-scoped triage prompt) + lexical trap ("Burberry Group Plc" vs group blocklist). Experiment B (brand-NEUTRAL separate call): all 4 checks PASS.
- **ADM-3b @2ecd588** — two-call architecture promoted (5 files, +189/−4): `subject-extraction.ts` NEW (brand-neutral canon-lift), `triage.ts` +content_nature (observation-only), queue-writer mechanical tag rule (KNOWN_MAISONS 5 pilots = named V1 limitation, GROUP_BLOCKLIST, `brand_tags:[d.brand]` DEAD, no fallback), radar-sweep neutral call per brand (failure non-blocking → extraction_failed), UNTAGGED/EXTRACTION FAILED operator chips. Diff review PASS 6/6 vs GPT grid.
- **Decisions finalized:** two-call architecture LOCKED (supersedes "same Haiku call" cadrage assumption); UNTAGGED = normal explicable state (industry/group/off-pilot), not an error; subject_brands stored distinctly from computed tags; observe sweep #2 BEFORE ADM-2 (GPT, ratified).
- **Workflow rule (Mo, memorized):** solicit Code as REASONER proactively — closed problem = recipe prompt, open problem = mission prompt.

## 2. STILL OPEN — ACTIVE ONLY
- 1003c355 — Admission Quality lane: ADM-1 ✅ ADM-3 ✅, ADM-2 remaining (held until sweep #2 observed)
- aac20c79 — Cartier triage count-mismatch: watch recurrence at sweep #2 (parked, observation-only)
- b00573d9 — discovery noise share under recency: measure at sweeps 2-3 (parked)
- 14650938 — WikiLux corpus reconstruction: next big lane AFTER ADM (pilot brands still have no wikilux_content rows — brand_tags light nothing on brand pages until this runs)
- 633d6f8c — CLOSED Jun 11 AM (reference only: synthesis + mapper provenance, 10 sourced signals live)

## 3. NEXT 3 STEPS
1. Observe sweep #2 (Mon Jun 15 ~06:00 Paris): Coolify task log (`skipped_low_relevance`, `untagged`, extraction failures) + luxai_sweep_runs + cockpit chips on fresh cards.
2. ADM-2 cadrage (source-tier chips PRIMARY/TRADE PRESS/THIRD-PARTY PR + press_wire caution in synthesis prompt; chip-not-gate; fold in the two parked cosmetics) → GPT → Mo GO.
3. Cadence re-eval after sweeps 3-4 (freq/coverage/noise/cost/yield) → return to WikiLux corpus (14650938).

## 4. NEXT SESSION START
- Focus: sweep #2 observation readout (if post-Jun 15) OR ADM-2 cadrage prep (if before).
- IN: luxai_sweep_runs + content_queue reads, cockpit visual check of new chips, ADM-2 cadrage.
- OUT: editorial/prompt tuning (frozen), freshness tiers (frozen, measure sweeps 2-3), WikiLux corpus build (after ADM), any auto-publish, KNOWN_MAISONS expansion (V2 — includes the Prada-vs-Prada-Group name collision wrinkle).

— Claude AI
