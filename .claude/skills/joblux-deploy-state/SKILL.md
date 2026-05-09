---
name: joblux-deploy-state
description: Capture deploy truth via honest V1 git_only fallback. Writes .bridge/state/deploy.json. Header-based deploy verification is a follow-up slice — not V1.
---

# joblux-deploy-state

## Purpose
Capture a deploy-truth snapshot. V1 ships an honest `git_only` fallback: deploy SHA is *assumed* to equal repo HEAD but is **not** verified against the live runtime. A header-based probe (e.g., `X-Build-SHA`) is a planned follow-up slice, intentionally out of V1 scope.

## Required reads
1. If `.bridge/state/repo.json` exists and its `captured_at` is within the last 10 minutes, read `head_sha_short` from it.
2. Otherwise, compute `head_sha_short` directly via `git rev-parse --short HEAD`.

## Atomic write
Compose JSON exactly per the schema below. Write to `.bridge/state/deploy.json.tmp`, then `mv` to `.bridge/state/deploy.json`. Never write the final path directly.

## Schema (V1 git_only — exact field shape)
```json
{
  "captured_at": "<ISO UTC>",
  "source": "git_only",
  "method": "coolify",
  "assumed_deploy_sha": "<7-char>",
  "verified_deploy_sha": null,
  "matches_repo_head": null,
  "drift_seconds": null,
  "notes": "Deploy SHA not verified in V1. Header probe is a follow-up slice."
}
```

The `notes` string is canonical for V1. Do not paraphrase, translate, or expand it.

## Output card (CARD-FIRST)
```yaml
type: deploy-state
state_path: .bridge/state/deploy.json
captured_at: <ISO>
source: git_only
assumed_deploy_sha: <sha7>
verified: false
note: "Deploy SHA not verified in V1."
```

## Allowed
- Read-only git plumbing.
- Reading `.bridge/state/repo.json`.
- Writes to `.bridge/state/deploy.json` and its `.tmp` sibling only.

## Forbidden (hard)
- Any Coolify API call.
- Any HTTP request to prod or any external host (no curl, no fetch, no MCP web tools) for deploy verification — V1 does not probe.
- Inventing a `verified_deploy_sha` value. The field is `null` in V1.
- Any GitHub MCP write or Supabase access.
- Any write outside `.bridge/state/deploy.json` and its `.tmp`.
- Any chat output beyond the card.
