# .bridge/ — JOBLUX Bridge V1 State Mirror

A small filesystem protocol that mirrors operational truth into the repo so
Claude AI (planning brain) can read it via GitHub MCP after Mo pushes.

## Purpose

V1 establishes three things:
1. A directory layout for state, briefs, close-cards, and (future) reports.
2. Three single-writer JSON files capturing repo / deploy / runtime truth.
3. A PAUSE switch that halts Bridge skills via the UserPromptSubmit hook.

This is **not** Away Mode. There are no schedules, no automations, no
overnight runs. V1 is just the foundation those layers will sit on later.

## Layout

| Path | Purpose | Writer |
|---|---|---|
| `inbox/`            | Briefs from planning brain → Code (V2 fills) | planning brain |
| `outbox/`           | Close-cards Code → planning brain            | `/joblux-close` |
| `state/repo.json`   | Local repo truth                             | `/joblux-repo-state` |
| `state/deploy.json` | Deploy truth (V1 git_only fallback)          | `/joblux-deploy-state` |
| `state/runtime.json`| HTTP smoke of public URLs                    | `/joblux-runtime-check` |
| `reports/`          | Daily aggregates (V2)                        | aggregator (V2) |
| `runs/`             | Per-task scratch (V2; gitignored)            | per-task        |

**Single-writer rule:** each state file has exactly one skill that writes it.
Atomic writes use `<file>.tmp` + `mv` to avoid half-written reads.

## PAUSE protocol

`touch .bridge/PAUSE` → the `UserPromptSubmit` hook (`pause-guard.sh`) refuses
all subsequent prompts with a "Bridge paused" message until the file is
removed (`rm .bridge/PAUSE`). The PAUSE file is gitignored — never committed.

## Hooks installed by V1

- `PreToolUse:Bash`  → `block-dangerous-git.sh` (V0; unchanged)
- `UserPromptSubmit` → `pause-guard.sh`
- `SessionStart`     → `state-preload.sh`
- `Stop`             → `cleanup-reminder.sh`

## Cross-brain handoff

After Mo runs `/joblux-close` and pushes, planning brain reads via GitHub MCP:
- `.bridge/state/repo.json`
- `.bridge/state/deploy.json`
- `.bridge/state/runtime.json`
- the latest `.bridge/outbox/<timestamp>.md`

No copy-paste of card bodies. Mo's relay shrinks to a path or "closed".

## What's NOT in V1

No scheduled ticks, no launchd, no GitHub Actions, no webhooks, no issue-queue
consumption (`inbox/` exists but is unused), no sub-agents/worktrees, no PR
pre-review automation, no browser automation, no autonomous commits or pushes
or deploys. Those are V2/V3/V4 candidates. V1 stays small on purpose.
