#!/usr/bin/env bash
# Bridge V1 — Stop hook. Print one cleanup nudge.

set -e

ROOT="${CLAUDE_PROJECT_DIR:-.}"
LOG="$ROOT/.bridge/hooks.log"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "Cleanup review reminder: scan diffs for stray comments, dead code, debug logs before commit."
( echo "$TS cleanup-reminder printed" >> "$LOG" ) 2>/dev/null || true
exit 0
