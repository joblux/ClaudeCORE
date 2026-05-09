#!/usr/bin/env bash
# Bridge V1 — UserPromptSubmit hook.
# If .bridge/PAUSE exists, refuse the prompt with a JSON block decision.
# Otherwise pass silently. Always non-fatal (exit 0).

set -e

ROOT="${CLAUDE_PROJECT_DIR:-.}"
LOG="$ROOT/.bridge/hooks.log"
PAUSE="$ROOT/.bridge/PAUSE"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Drain stdin (UserPromptSubmit sends JSON; we don't need it here).
cat > /dev/null 2>/dev/null || true

if [ -f "$PAUSE" ]; then
  cat <<'JSON'
{"decision":"block","reason":"Bridge paused. Remove .bridge/PAUSE to continue."}
JSON
  ( echo "$TS pause-guard block" >> "$LOG" ) 2>/dev/null || true
  exit 0
fi

( echo "$TS pause-guard pass" >> "$LOG" ) 2>/dev/null || true
exit 0
