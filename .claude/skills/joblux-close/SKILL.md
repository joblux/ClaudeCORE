---
name: joblux-close
description: Close a JOBLUX session. V1.1 chat-side: emit a compact close-card YAML (~30-60 lines) to chat. NO STATE/HANDOFF body inline. Mo saves the YAML to .bridge/relay/close-card.yaml; a separate Code invocation reads it and applies STATE/HANDOFF updates with reasoning. Skill itself NEVER writes files, NEVER commits. Use when Mo says "Close JOBLUX session" or invokes /joblux-close.
---

# joblux-close

## Purpose
V1.1 chat-side close: surface a compact close-card YAML to chat for Mo to save. Application of STATE rotation + HANDOFF composition happens in a separate Code invocation that reads the saved card with reasoning. Skill never writes files. Mo commits manually.

## Required reads (in order)
1. GitHub MCP `get_file_contents` on `docs/JOBLUX_STATE.md` (current content to rotate, not rewrite).
2. GitHub MCP `list_commits` for the session window (HEAD back to session-start SHA recovered from chat memory).
3. Supabase MCP `execute_sql` SELECT on `admin_tasks` for ledger snapshot.
4. Session conversation memory: every "SHIPPED + PROD-VALIDATED" claim, every doctrine lock, every parked task, every QA outcome.

## Composition rules
- STATE rotation guidance (for the Code-side apply step): replace ACTIVE CHAIN > LAST SHIPPED with this session's slices. Keep ~5 most recent. Update DO NOT, PARKED, FINDINGS, "Last updated" footer.
- HANDOFF V3 format target: ~60-80 lines, exactly 3 sections — SHIPPED THIS SESSION / UNRESOLVED / NEXT STRICT STEP. Filename: `HANDOFF_<YYYY-MM-DD>[<suffix>].md`.
- V1.1 chat-side: skill emits a compact close-card YAML (~30-60 lines) to chat. NO STATE body. NO HANDOFF body. NO heredoc.
- Mo saves the close-card to `.bridge/relay/close-card.yaml`.
- Claude Code (separate invocation) reads the close-card + `docs/JOBLUX_STATE.md` + git log, applies the rotation + composes HANDOFF with reasoning, writes to `docs/`, shows diff, STOPS.
- Skill itself NEVER writes files, NEVER commits.

## Allowed
- All read-only GitHub MCP tools.
- Supabase MCP `execute_sql` SELECT only.
- Emit close-card YAML to chat per V1.1 schema.

## Forbidden (hard)
- All GitHub MCP writes.
- All Supabase mutations.
- Memory mutations.
- Chrome MCP, web mutations.
- Auto-execution of any Claude Code prompt. Mo invokes /joblux-close and the apply step himself.
- Emitting full STATE body in chat.
- Emitting full HANDOFF body in chat.
- Heredoc-embedding any payload >100 lines in any prompt.
- Composing or proposing a bash compiler for STATE.
- Writing files to `/tmp/joblux-handoff/` or any path.

## Output card schema (CARD-FIRST)
```yaml
type: close
session_kind: product | workflow_infrastructure
meta:
  session_head: <SHA>
  session_started_at: <ISO>
  handoff_for_date: <YYYY-MM-DD>
  handoff_suffix: ""
shipped:
  - sha: <SHA>
    one_line_title: <text>
    qa_result: <text>
    surface_kind: product | infra | docs
doctrine_locks:
  - <bullet>
do_not_additions:
  - <line>
findings_changes:
  - id: <text>
    before: <text>
    after: <text>
    note: <text>
unresolved:
  - <bullet>
next_strict_step:
  text: |
    <free text>
rotation_directive:
  new_top_entry: <SHA>
  keep_window_size: 5
  drop_off_oldest: true
product_state_carry:
  current_step_unchanged: true | false
  next_recommended_product_slice: <text>
mo_approval_required_for:
  - "review close-card content"
  - "review git diff after Code applies updates"
  - "issue commit + push manually"
```

## Mo workflow

1. Mo reviews close-card in chat.
2. Mo saves close-card to `.bridge/relay/close-card.yaml`.
3. Mo runs `.bridge/skills/close-precheck.sh` (optional but recommended).
4. Mo invokes `/joblux-close` in Claude Code, which:
   - reads the close-card + STATE + git log
   - applies STATE rotation + composes HANDOFF using reasoning
   - writes both files
   - shows diff/stat/status
   - STOPS
5. Mo reviews diff.
6. Mo issues commit + push manually.
7. Optional cleanup: archive or delete `.bridge/relay/close-card.yaml`.

## Mo approval
Three explicit gates: (1) review the close-card content in chat; (2) review git diff after Code applies updates; (3) issue commit + push manually. The skill never writes files; the Code apply step never commits.
