#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CARD="${1:-$REPO_ROOT/.bridge/relay/close-card.yaml}"

if [[ ! -f "$CARD" ]]; then
  echo "close-precheck: close-card not found at $CARD" >&2
  exit 1
fi

if command -v python3 >/dev/null 2>&1 && \
   python3 -c "import yaml" >/dev/null 2>&1; then
  SUMMARY="$(python3 - "$CARD" <<'PY'
import sys, yaml
with open(sys.argv[1]) as f:
    d = yaml.safe_load(f)
if not isinstance(d, dict):
    print("INVALID: top-level not a mapping", file=sys.stderr); sys.exit(2)
meta = d.get("meta") or {}
shipped = d.get("shipped") or []
print("session_kind:", meta.get("session_kind", "?"))
print("session_head:", meta.get("session_head", "?"))
print("handoff_for_date:", meta.get("handoff_for_date", "?"))
print("shipped_count:", len(shipped))
for i, s in enumerate(shipped):
    print(f"  [{i}] {s.get('sha','?')[:7]}  {s.get('one_line_title','?')}")
nss = (d.get("next_strict_step") or {}).get("text","")
print("next_strict_step_lines:", len(nss.splitlines()))
PY
)"
else
  SUMMARY="$(grep -E '^(meta:|shipped:|session_kind:|session_head:|handoff_for_date:)' "$CARD" || true)"
fi

echo "── Bridge V1.1 close-card precheck ──"
echo "card: $CARD"
echo "$SUMMARY"
echo "── precheck OK. Now invoke /joblux-close in Claude Code. ──"
