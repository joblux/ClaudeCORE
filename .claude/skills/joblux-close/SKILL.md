---
name: joblux-close
description: Close a JOBLUX session. Draft STATE rotation + HANDOFF V3 into preview artifacts at /tmp/joblux-handoff/. Surface local paths + preview summaries to Mo, plus the Claude Code prompt to commit both. Skill itself NEVER commits. Use when Mo says "Close JOBLUX session" or invokes /joblux-close.
---

# joblux-close

## Purpose
Replace the manual session-close STATE composition with a skill that drafts the rotation + handoff and surfaces them as preview artifacts. Mo runs the Claude Code commit prompt himself.

## Required reads (in order)
1. GitHub MCP `get_file_contents` on `docs/JOBLUX_STATE.md` (current content to rotate, not rewrite).
2. GitHub MCP `list_commits` for the session window (HEAD back to session-start SHA recovered from chat memory).
3. Supabase MCP `execute_sql` SELECT on `admin_tasks` for ledger snapshot.
4. Session conversation memory: every "SHIPPED + PROD-VALIDATED" claim, every doctrine lock, every parked task, every QA outcome.

## Composition rules
- STATE rotation: replace ACTIVE CHAIN > LAST SHIPPED with this session's slices. Move prior LAST SHIPPED entries down or out per the rotation pattern (~5 most recent kept). Update DO NOT, PARKED, FINDINGS, "Last updated" footer.
- HANDOFF V3 format: ~60-80 lines, exactly 3 sections — SHIPPED THIS SESSION / UNRESOLVED / NEXT STRICT STEP. Filename: `HANDOFF_<YYYY-MM-DD>.md`.
- Artifacts written to `/tmp/joblux-handoff/JOBLUX_STATE.md` and `/tmp/joblux-handoff/HANDOFF_<date>.md`.
- Surface the local paths and preview summaries to Mo (the close-card lists both paths plus a state_diff_preview and handoff_section_summaries). Mo opens the files locally to review.

## Allowed
- All read-only GitHub MCP tools.
- Supabase MCP `execute_sql` SELECT only.
- File creation in `/tmp/joblux-handoff/` only.
- Drafting the Claude Code commit prompt as a string in the close-card.

## Forbidden (hard)
- All GitHub MCP writes.
- All Supabase mutations.
- Memory mutations.
- Chrome MCP, web mutations.
- Auto-execution of the Claude Code prompt. The skill outputs the prompt; Mo runs it.
- Skipping the preview step. Mo MUST see both artifacts before approving the commit prompt.
- Writing artifacts anywhere outside `/tmp/joblux-handoff/`.

## Output card schema (CARD-FIRST)
```yaml
type: close
session_head: <SHA>
generated_at: <ISO>
slices_shipped_this_session:
  - sha: <SHA>
    title: <one-line>
    qa_result: <e.g. 5/5 PROD>
    file_count: <int>
    diff_stat: <+X/-Y>
doctrine_changes_locked: [<list>]
findings_state_changes:
  - id: <uuid>
    before: <state>
    after: <state>
state_diff_preview: <summary of STATE deltas>
handoff_section_summaries:
  shipped: <one-line summary of SHIPPED THIS SESSION block>
  unresolved: <one-line summary of UNRESOLVED block>
  next: <one-line summary of NEXT STRICT STEP block>
state_rotated_path: /tmp/joblux-handoff/JOBLUX_STATE.md
handoff_preview_path: /tmp/joblux-handoff/HANDOFF_<date>.md
recommended_next_slice: <one-line>
claude_code_prompt: |
  <full prompt block ready to copy into Code>
mo_approval_required_for:
  - "review STATE preview at /tmp/joblux-handoff/JOBLUX_STATE.md"
  - "review HANDOFF preview at /tmp/joblux-handoff/HANDOFF_<date>.md"
  - "execute the Claude Code prompt to commit both files"
```

## Mo approval
Three explicit gates: review STATE, review HANDOFF, execute commit prompt. The skill never commits. Mo runs the Claude Code prompt himself.
