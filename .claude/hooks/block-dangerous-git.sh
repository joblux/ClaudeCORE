#!/usr/bin/env bash
# JOBLUX git guardrails - block destructive commands only
# Normal git push is ALLOWED (Coolify auto-deploy depends on it)

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

BLOCKED_PATTERNS=(
  'git[[:space:]]+reset[[:space:]]+--hard'
  'git[[:space:]]+clean[[:space:]]+-[a-z]*f'
  'git[[:space:]]+checkout[[:space:]]+\.'
  'git[[:space:]]+restore[[:space:]]+\.'
  'git[[:space:]]+branch[[:space:]]+-D'
  'git[[:space:]]+push[[:space:]]+.*--force'
  'git[[:space:]]+push[[:space:]]+.*-f([[:space:]]|$)'
  'rm[[:space:]]+-rf'
  'rm[[:space:]]+-fr'
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    cat <<JSON_EOF
{
  "decision": "block",
  "reason": "JOBLUX guardrail: destructive command blocked. Pattern matched: $pattern. If you really need this, run it manually in your own terminal."
}
JSON_EOF
    exit 0
  fi
done

exit 0
