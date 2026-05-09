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

## V1 truth probes (pre-step)

Before drafting STATE/HANDOFF, capture machine-readable truth into `.bridge/state/`.

- If all three of `.bridge/state/{repo,deploy,runtime}.json` exist with `captured_at` within the last 10 minutes, reuse them as-is.
- Otherwise, perform the probes **inline** — do **not** invoke other slash skills:
  - **repo.json**: `branch`, `head_sha` (full + 7-char), `head_subject` / `head_author` / `head_committed_at`, `ahead_of_origin`, `behind_origin`, `uncommitted_changes`, `untracked_count`, `recent_commits` (5), `open_prs` from GH MCP `list_pull_requests` (state=open).
  - **deploy.json**: V1 `git_only` fallback. Fields: `source: "git_only"`, `method: "coolify"`, `assumed_deploy_sha: <sha7>`, `verified_deploy_sha: null`, `matches_repo_head: null`, `drift_seconds: null`, `notes: "Deploy SHA not verified in V1. Header probe is a follow-up slice."`
  - **runtime.json**: `curl -sS` GET against `https://joblux.com/` and `https://joblux.com/escape` (and `https://joblux.com/api/health` only if `app/api/health/route.*` exists in the repo). `ok` is `true` iff every status is 2xx.

All three writes use `<file>.tmp` + `mv` (atomic). The probes never push, never deploy, never write to DB.

## Composition rules
- STATE rotation: replace ACTIVE CHAIN > LAST SHIPPED with this session's slices. Move prior LAST SHIPPED entries down or out per the rotation pattern (~5 most recent kept). Update DO NOT, PARKED, FINDINGS, "Last updated" footer.
- HANDOFF V3 format: ~60-80 lines, exactly 3 sections — SHIPPED THIS SESSION / UNRESOLVED / NEXT STRICT STEP. Filename: `HANDOFF_<YYYY-MM-DD>.md`.
- Artifacts written to `/tmp/joblux-handoff/JOBLUX_STATE.md` and `/tmp/joblux-handoff/HANDOFF_<date>.md`.
- Surface the local paths and preview summaries to Mo (the close-card lists both paths plus a state_diff_preview and handoff_section_summaries). Mo opens the files locally to review.

## V1 relay-card (post-step)

After STATE/HANDOFF previews land in `/tmp/joblux-handoff/`, also write a short relay-card markdown (≤60 lines) to `.bridge/outbox/<UTC-timestamp>.md`. Filename uses the `2026-05-09T221400Z.md` shape — no colons.

Sections:
- one-line **Repo / Deploy / Runtime** summaries sourced from the three state JSONs
- pointers to `state_rotated_path` and `handoff_preview_path` in `/tmp/joblux-handoff/`
- the three `.bridge/state/*.json` paths
- optional 1–2 line notes

Atomic write via `<file>.tmp` + `mv`. The relay-card body never appears in chat — output only its path.

The embedded `claude_code_prompt` returned in the close-card MUST `git add` the relay-card and the three state files alongside the existing STATE/HANDOFF files.

## Allowed
- All read-only GitHub MCP tools.
- Supabase MCP `execute_sql` SELECT only.
- File creation in `/tmp/joblux-handoff/` only.
- Atomic writes to `.bridge/state/{repo,deploy,runtime}.json` (and their `.tmp` siblings) and `.bridge/outbox/<UTC-timestamp>.md` (V1).
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
relay_card_path: .bridge/outbox/<UTC-timestamp>.md
state_files:
  repo: .bridge/state/repo.json
  deploy: .bridge/state/deploy.json
  runtime: .bridge/state/runtime.json
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
