---
name: joblux-repo-state
description: Capture local repo truth (branch, HEAD, working tree, ahead/behind, recent commits, open PRs via GH MCP) into .bridge/state/repo.json. Read-only repo + read-only GitHub MCP. Standalone, or pre-step for /joblux-close.
---

# joblux-repo-state

## Purpose
Capture a small machine-readable snapshot of repo truth so Claude AI (planning brain) can read it via GitHub MCP after Mo pushes. Single writer of `.bridge/state/repo.json`.

## Required reads (no writes to repo state)
1. Local git plumbing:
   - `git rev-parse --abbrev-ref HEAD` → branch
   - `git rev-parse HEAD` → head_sha
   - `git rev-parse --short HEAD` → head_sha_short
   - `git log -1 --format='%s%n%an%n%aI'` → head_subject, head_author, head_committed_at
   - `git rev-list --left-right --count HEAD...origin/<branch>` → ahead_of_origin, behind_origin
   - `git status --porcelain` → uncommitted_changes (bool), untracked_count
   - `git log -5 --format='%h%x09%s%x09%aI'` → recent_commits[]
2. GitHub MCP `list_pull_requests` for `joblux/ClaudeCORE`, state=open, perPage=20. Capture: number, title, author.login, draft, updated_at.

## Atomic write
Compose JSON matching the schema below. Write to `.bridge/state/repo.json.tmp`, then `mv` to `.bridge/state/repo.json`. Never write the final path directly.

## Schema
```json
{
  "captured_at": "<ISO UTC>",
  "branch": "<name>",
  "head_sha": "<full>",
  "head_sha_short": "<7-char>",
  "head_subject": "<text>",
  "head_author": "<name>",
  "head_committed_at": "<ISO UTC>",
  "ahead_of_origin": 0,
  "behind_origin": 0,
  "uncommitted_changes": false,
  "untracked_count": 0,
  "open_prs": [
    {"number": 0, "title": "...", "author": "...", "draft": false, "updated_at": "..."}
  ],
  "recent_commits": [
    {"sha": "...", "subject": "...", "ts": "..."}
  ]
}
```

## Output card (CARD-FIRST)
```yaml
type: repo-state
state_path: .bridge/state/repo.json
captured_at: <ISO>
branch: <name>
head: <sha7> "<subject>"
working_tree: clean|dirty (<n> uncommitted, <n> untracked)
origin_drift: <ahead>/<behind>
open_pr_count: <n>
```

## Allowed
- Read-only git plumbing.
- GitHub MCP read-only tools (`list_pull_requests`, `get_file_contents`, `list_commits`).
- Writes to `.bridge/state/repo.json` and its `.tmp` sibling only.

## Forbidden (hard)
- Any git mutation (no commit, push, fetch, reset, checkout, merge, rebase, tag).
- Any GitHub MCP write (no create_or_update_file, push_files, issue_write, pull_request_review_write, etc.).
- Any Supabase access of any kind.
- Any chat output beyond the card.
- Any write outside `.bridge/state/repo.json` and its `.tmp`.
