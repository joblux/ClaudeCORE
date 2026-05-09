---
name: joblux-runtime-check
description: HTTP smoke against public JOBLUX URLs. Read-only GET only. Writes .bridge/state/runtime.json. URLs hardcoded in V1. Does NOT create /api/health.
---

# joblux-runtime-check

## URL list (V1, hardcoded)
- `https://joblux.com/`
- `https://joblux.com/escape`
- `https://joblux.com/api/health` — **only if** the route already exists. Detect at runtime by checking for `app/api/health/route.ts` (or `.tsx` / `.js` / `.mjs`). Do **not** create the route.

## Required actions
1. Detect `/api/health` route presence via `ls app/api/health/route.* 2>/dev/null`. Include URL only on match.
2. For each URL:
   ```
   curl -sS -o /dev/null -w '%{http_code} %{time_total} %{size_download}\n' --max-time 10 <url>
   ```
3. Parse: status (int), ms (`time_total * 1000`, integer), bytes.
4. `ok` is `true` iff every status is 2xx.
5. `failures[]` lists URLs whose status is not 2xx.

## Atomic write
Compose JSON per schema below. Write to `.bridge/state/runtime.json.tmp`, then `mv` to `.bridge/state/runtime.json`. Never write the final path directly.

## Schema
```json
{
  "captured_at": "<ISO UTC>",
  "checks": [
    {"url": "https://joblux.com/", "method": "GET", "status": 200, "ms": 145, "bytes": 24512}
  ],
  "ok": true,
  "failures": []
}
```

## Output card (CARD-FIRST)
```yaml
type: runtime-check
state_path: .bridge/state/runtime.json
captured_at: <ISO>
urls_checked: <n>
ok: true|false
failures: [<url>...]
```

## Allowed
- `curl` GET requests against the listed URLs only.
- Filesystem read of `app/api/health/` for route detection only.
- Writes to `.bridge/state/runtime.json` and its `.tmp` sibling only.

## Forbidden (hard)
- Any non-GET HTTP method.
- Any URL outside the listed set.
- Any browser automation, Chrome MCP, Playwright, or headless browser.
- Creating `/api/health` or any other route.
- Any DB read or Supabase access.
- Any GitHub MCP write.
- Any write outside `.bridge/state/runtime.json` and its `.tmp`.
- Any chat output beyond the card.
