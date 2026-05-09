#!/usr/bin/env bash
# Bridge V1 — SessionStart hook.
# Print a small markdown summary of any .bridge/state/*.json files that exist.
# Silent if none. Stale flag if captured_at older than 1h.

set -e

ROOT="${CLAUDE_PROJECT_DIR:-.}"
LOG="$ROOT/.bridge/hooks.log"
DIR="$ROOT/.bridge/state"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

REPO="$DIR/repo.json"
DEPLOY="$DIR/deploy.json"
RUNTIME="$DIR/runtime.json"

if [ ! -f "$REPO" ] && [ ! -f "$DEPLOY" ] && [ ! -f "$RUNTIME" ]; then
  ( echo "$TS state-preload empty" >> "$LOG" ) 2>/dev/null || true
  exit 0
fi

# Stale check: print " (stale)" if captured_at is older than 1h.
stale_flag() {
  local f="$1"
  local cap cap_s now_s
  cap=$(jq -r '.captured_at // empty' "$f" 2>/dev/null || true)
  [ -z "$cap" ] && return
  cap_s=$(date -u -j -f "%Y-%m-%dT%H:%M:%SZ" "$cap" "+%s" 2>/dev/null || echo 0)
  now_s=$(date -u +%s)
  if [ "$cap_s" -gt 0 ] && [ $((now_s - cap_s)) -gt 3600 ]; then
    printf " (stale)"
  fi
}

echo "## Bridge state preload"

if [ -f "$REPO" ]; then
  branch=$(jq -r '.branch // "?"' "$REPO" 2>/dev/null || echo "?")
  sha7=$(jq -r '.head_sha_short // "?"' "$REPO" 2>/dev/null || echo "?")
  uncomm=$(jq -r 'if .uncommitted_changes then "dirty" else "clean" end' "$REPO" 2>/dev/null || echo "?")
  printf -- "- repo: %s @ %s — %s%s\n" "$branch" "$sha7" "$uncomm" "$(stale_flag "$REPO")"
fi

if [ -f "$DEPLOY" ]; then
  src=$(jq -r '.source // "?"' "$DEPLOY" 2>/dev/null || echo "?")
  match=$(jq -r '.matches_repo_head' "$DEPLOY" 2>/dev/null || echo "null")
  printf -- "- deploy: %s — matches_repo_head=%s%s\n" "$src" "$match" "$(stale_flag "$DEPLOY")"
fi

if [ -f "$RUNTIME" ]; then
  ok=$(jq -r 'if .ok then "ok" else "FAIL" end' "$RUNTIME" 2>/dev/null || echo "?")
  fails=$(jq -r '.failures | length' "$RUNTIME" 2>/dev/null || echo "?")
  printf -- "- runtime: %s (%s failures)%s\n" "$ok" "$fails" "$(stale_flag "$RUNTIME")"
fi

( echo "$TS state-preload printed" >> "$LOG" ) 2>/dev/null || true
exit 0
