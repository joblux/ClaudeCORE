# JOBLUX WORKFLOW RULES

Persistent execution behavior layer for Claude AI working on the JOBLUX repo.
Loaded every session start AFTER `docs/JOBLUX_STATE.md`.

If any rule here conflicts with `docs/JOBLUX_STATE.md`, STATE wins.
If any rule here conflicts with a skill, this file wins.

---

## Session start order

1. Read `docs/JOBLUX_STATE.md` (constitution + ACTIVE CHAIN + CURRENT STEP)
2. Read `docs/WORKFLOW_RULES.md` (this file)
3. `git status` + `git log --oneline -5`
4. Reconcile via Supabase MCP only when work touches DB / ledger / live data
5. Execute the first unfinished item in CURRENT STEP

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
