# JOBLUX WORKFLOW RULES

Persistent execution behavior layer for Claude AI working on the JOBLUX repo.
Loaded every session start AFTER `docs/JOBLUX_STATE.md`.

If any rule here conflicts with `docs/JOBLUX_STATE.md`, STATE wins.
If any rule here conflicts with a skill, this file wins.

---

## Session start order

1. GitHub MCP - read docs/JOBLUX_STATE.md @ main HEAD (committed repo truth).
2. GitHub MCP - read docs/WORKFLOW_RULES.md @ main HEAD.
3. Claude Code - git status + git log --oneline -5 (local truth: uncommitted, unpushed). Only after MCP committed reads.
4. Reconcile via Supabase MCP only when work touches DB or admin_tasks ledger.
5. Execute the first unfinished item from CURRENT STEP.

---

## EXECUTION SURFACE BOUNDARY (May 2026)

- Claude AI = planning, connected reads (GitHub MCP / Supabase MCP), browser QA via Chrome MCP, prod validation. Runs these directly. Never relays to Mo as a prompt.
- Claude Code = local repo execution: patch / test / build / git status / commit / push, deploy confirmation. No committed-file reads via Code (use GitHub MCP).
- Mo = product authority + approval gate (Propose → Wait → Approve → Execute). Not transport middleware between tools.
- Prod QA happens only after commit + push + Coolify deploy green. Never on uncommitted local state.

---

## DOCTRINE EXECUTION REPORT (DER) — mandatory (locked 2026-06-05)

A locked doctrine is NOT closed when it is decided. Deciding a doctrine without propagating it leaves competing truths in the repo (the DER-001 root cause). Therefore:

**Any newly locked doctrine triggers a mandatory Doctrine Execution Report (DER) before it is considered closed.**

A DER is closed only when all five steps pass:

1. Doctrine is written into the authoritative file (Constitution / STATE).
2. Conflicting documents are found (read-only precedence/drift audit).
3. Conflicting documents are updated or superseded (banner / rewrite / supersede / quarantine).
4. Precedence is recorded (explicit hierarchy: Constitution > Doctrine > Rulebooks > Archive > Scaffolding).
5. A fresh audit passes (a new agent reaches exactly one conclusion; no competing truth remains).

No exceptions. A doctrine decision with no DER is an OPEN item, not a closed one. Reference: DER-001 (@0475d39).

---

## PROFILUX CONVERGENCE MODE (locked 2026-05-11)

For all visual work on ProfiLux surfaces (View / Edit / Manage / CV Merge):

- The locked HTML prototype at `docs/prototypes/profilux_journey_v12.html` is the product spec.
- Specs and docs (V12_LOCK, MATRIX, MODEL) are guardrails, not the primary visual authority.
- Live `/dashboard/candidate/profilux` is the lagging implementation.
- For visual ProfiLux work, ALWAYS read/open the locked HTML prototype BEFORE reasoning from MATRIX / V12_LOCK / STATE.

### Workflow loop

1. Open locked HTML prototype.
2. Open live surface.
3. Compare visually.
4. Identify highest-impact shell gap.
5. Ship one convergence slice.
6. Repeat.

### Priority order

1. View shell
2. Manage shell
3. CV Merge shell
4. Edit shell refinement
5. Behavioral refinements / divergence cleanup

### Bans

- No ontology / philosophy / object-identity pass unless Mo explicitly asks.
- No field-level debates when the prototype answers visually.
- No doctrine-first interpretation when the HTML answers the same question.
- No heavy ledger / doc prose around tiny visual changes.
- No treating V12 as a documentation artifact. Treat it as the product to reproduce.

### Convergence-mode session opening

Trigger phrase: **"Open JOBLUX session — convergence mode"**

Opening sequence:

1. GitHub MCP — read `docs/JOBLUX_STATE.md` @ main HEAD.
2. GitHub MCP — read `docs/WORKFLOW_RULES.md` @ main HEAD.
3. GitHub MCP — read/open `docs/prototypes/profilux_journey_v12.html` @ main HEAD.
4. GitHub MCP — `list_commits perPage=8` (drift check).
5. Chrome MCP — open live `/dashboard/candidate/profilux`.
6. Start with View shell comparison. Declare highest-impact gap. Propose slice.

---

## Output discipline (default ON)

| Surface | Default | Override |
|---|---|---|
| Output style | Structured summary — counts, diff stats, pass/fail. Headlines, not transcripts. | Mo says "show full" / "verbatim" / "paste raw" |
| VERBATIM MODE prompt header | OFF. Drop from new prompts. | Mo requests it, OR last attempt failed and exact terminal text is needed |
| File reads | Diff + occurrence counts + tail of relevant section. No `cat <file>`. | Genuine ambiguity OR file under ~60 lines |
| TSC / build output | Exit code + `tail -10` only | Failure → expand |
| Multi-step verification | Single line per check (e.g. `desired_locations: 1 ✅`) | Failure → expand that one |
| MCP DB reads | Field deltas only (changed vs preserved), not full row dumps | End-of-phase cross-screen drift check |
| Code prompts | Short, focused. One operation per prompt where possible. | Multi-step only when steps are tightly coupled |

When something breaks, escalate to verbose mode automatically — do not wait for Mo to ask twice.

---

## What this DOES NOT change

- `docs/JOBLUX_STATE.md` remains the supreme source of truth
- Propose → Wait → Approve → Execute discipline
- Contract-first verification (schema → enums → constraints → routes → UX)
- MCP-first for DB / ledger / live-data work
- Read-before-write rule
- No user-facing UI changes without explicit request
- Single-file surgical changes preferred
- Commit discipline (plain ASCII hyphens, scoped messages)
- `joblux-code-prompts` skill still governs prompt formatting when VERBATIM MODE is on
- `joblux-handoff` skill still governs end-of-session handoff structure

---

## Rationale

Verbose terminal dumps were designed to defeat Claude Code's LEAN MODE collapsing. They work, but cost throughput on normal turns. Default to summaries. Reach for verbose only when summaries fail.
