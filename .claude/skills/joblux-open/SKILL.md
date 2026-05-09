---
name: joblux-open
description: Open a JOBLUX session. Read supreme truth (docs/JOBLUX_STATE.md) + last 8 commits + admin_tasks ledger. Reconcile and emit a single open-card declaring CURRENT STEP. Pure read-only. No autonomy. Use when Mo says "Open JOBLUX session" or invokes /joblux-open.
---

# joblux-open

## Purpose
Replace the manual "Open JOBLUX session" trigger with a single skill that reads supreme truth, reconciles ledger and recent commits, and emits an open-card.

## Required reads (in order)
1. GitHub MCP `get_file_contents` on `joblux/ClaudeCORE:docs/JOBLUX_STATE.md` — declare path + branch + "committed truth, local uncommitted changes invisible".
2. GitHub MCP `list_commits` on `joblux/ClaudeCORE` perPage=8.
3. Supabase MCP `execute_sql` SELECT on `admin_tasks` (project `zspcmvdoqhvrcdynlriz`): id, label, status, priority, ORDER BY updated_at DESC LIMIT 30.
4. If STATE last-updated date is not today and HANDOFF dir has a more recent file: read most recent `docs/handoffs/HANDOFF_*.md`.

## Allowed
- All read-only GitHub MCP tools.
- Supabase MCP `execute_sql` for SELECT only.
- `recent_chats` and `conversation_search` if STATE appears stale relative to recent activity.
- Memory `memory_user_edits view`.

## Forbidden (hard)
- Any GitHub MCP write: create_or_update_file, push_files, delete_file, issue_write.
- Any Supabase MCP mutation: INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, apply_migration.
- Any memory mutation: add, remove, replace.
- Chrome MCP, browser automation, web mutations.
- Drafting Claude Code prompts.

## Output card schema (CARD-FIRST)
```yaml
type: open
session_head: <SHA>
generated_at: <ISO>
sources: [list of reads performed]
last_shipped:
  - sha: <SHA>
    summary: <one-line>
    qa: <e.g. 8/8 PROD>
ledger_snapshot:
  open: <int>
  parked: <int>
  validated: <int>
  notable_open: [{ id: <uuid>, label: <text> }]
findings_observation_only:
  - id: <uuid>
    label: <text>
    status: open
current_step: <verbatim from STATE CURRENT STEP section>
do_not_violations_to_remember: [<relevant DO NOT lines>]
mo_approval_required_for:
  - "confirm CURRENT STEP or override"
```

## Mo approval
The card declares CURRENT STEP but does not start work. Mo confirms or overrides before any subsequent skill (review, slice draft) is invoked.
