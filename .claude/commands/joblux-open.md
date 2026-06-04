---
description: Open a JOBLUX session (thin pointer). Invokes the canonical joblux-open skill — read-only, no autonomy.
---

Invoke the **`joblux-open`** skill (`.claude/skills/joblux-open/SKILL.md`).

This command is a thin pointer. It adds no logic of its own.

All behaviour — required reads (STATE → last 8 commits → admin_tasks ledger),
the read-only constraint, the open-card schema, and the Mo-approval gate on
CURRENT STEP — is governed entirely by that skill and by JOBLUX doctrine
(`CLAUDE.md`, `docs/JOBLUX_STATE.md`, `docs/WORKFLOW_RULES.md`).

STOP after emitting the open-card. Wait for Mo to confirm or override CURRENT STEP.
