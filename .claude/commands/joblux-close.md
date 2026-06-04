---
description: Close a JOBLUX session (thin pointer). Invokes the canonical joblux-close skill — emits close-card only, never writes or commits.
---

Invoke the **`joblux-close`** skill (`.claude/skills/joblux-close/SKILL.md`).

This command is a thin pointer. It adds no logic of its own.

All behaviour — required reads, the V1.1 compact close-card YAML schema, the
`.bridge/relay/close-card.yaml` workflow, STATE rotation / HANDOFF composition
deferred to a separate Code apply step, and the three Mo-approval gates — is
governed entirely by that skill and by JOBLUX doctrine (`CLAUDE.md`,
`docs/JOBLUX_STATE.md`, `docs/WORKFLOW_RULES.md`).

The skill NEVER writes files and NEVER commits. STOP before any commit.
Mo issues commit + push manually. GPT remains required for
doctrine/product/UX/architecture/prioritization decisions.
