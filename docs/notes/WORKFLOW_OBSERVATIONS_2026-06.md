# WORKFLOW OBSERVATIONS — June 2026

**Non-doctrinal note — observations only — no precedence over STATE, CLAUDE.md, ledger, or active lane.**

**Guardrail:** This note must not trigger immediate workflow refactor; it preserves observations for later review only.

Origin: Fable 5 architecture discussion (Jun 2026), assessed by Claude AI, validated by GPT, approved by Mo (2026-06-11).

---

## Observation 1 — Gate Economics

As LuxAI coverage expands, the primary scalability constraint may become operator review bandwidth rather than discovery or generation capacity.

Context: one sweep over 5 pilot brands produced 16 drafts; every draft passes through a single constitutional gate (content_queue → Mo review, no auto-publish). The gate cannot be bypassed — only measured and optimized. When WikiLux corpus reconstruction (14650938) multiplies brand coverage, the binding constraint becomes review throughput, not discovery.

Future evaluation should consider:

- drafts reviewed
- review time
- review cost per sweep
- review cost per brand

These metrics align naturally with existing `luxai_sweep_runs` instrumentation.

## Observation 2 — Family Lane Contract

Signals may have established a reusable family-lane pattern:

Discovery → Admission → Synthesis → Queue → Review → Approve → Publish

Future family lanes (Events, Salaries, Reports) should be compared against this pattern before designing custom workflows.

Refinement: the reusable asset is the boundary contracts, not only the stage order — normalized Discovery object, mechanical admission gates (relevance score + subject truth), sourced-or-empty synthesis, approve mapper carrying provenance. A lane that copies the stage sequence but not the boundary contracts will reinvent the expensive parts.

## Observation 3 — STATE Growth

STATE size is no longer a projection — it is measured: **370 KB / ~89k tokens as of 2026-06-11**, unreadable in a single pass by standard tooling (session-start reads now require fragmented access).

Future consideration: split operational hot state from historical archive while preserving STATE supremacy. This remains a consideration, not a decision.

---

Not documented here (future decisions, not observations): bridge activation/retirement, newsletter strategy, dead cron, specific workflow changes.
