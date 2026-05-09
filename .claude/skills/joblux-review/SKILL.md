---
name: joblux-review
description: Read-only audit of a stated scope (route, file, feature, finding ID). Surface bug cards, risk cards, and a suggested-slice card. No fixes, no Claude Code prompts, no implementation recommendations. Use when Mo asks to audit, review, scope, or investigate a specific area.
---

# joblux-review

## Purpose
Replace ad-hoc audit prompts with a structured surface-findings-only skill. Outputs Bug / Risk / Suggested Slice cards. Mo + GPT decide what to act on.

## Invocation
`/joblux-review scope="<free-text scope>"`

Examples:
- `/joblux-review scope="app/api/members/cv-parse/route.ts"`
- `/joblux-review scope="business dashboard Settings flow"`
- `/joblux-review scope="finding f6508e54"`
- `/joblux-review scope="D2"`

## Required reads (in order)
1. Resolve scope:
   - If file path: GitHub MCP `get_file_contents` on the path.
   - If feature/flow: scan likely call sites via direct GitHub MCP file reads (no code search index assumed).
   - If finding ID (UUID or letter prefix): Supabase MCP read of `admin_tasks` row notes.
2. For each scope target, read every file it imports/exports/cross-references (committed truth only).
3. If scope touches DB: Supabase MCP `execute_sql` SELECT against live schema (information_schema, pg_policies, etc.).
4. Read `docs/JOBLUX_STATE.md` ACTIVE CHAIN section to position findings.

## Allowed
- All read-only GitHub MCP tools.
- Supabase MCP `execute_sql` for SELECT only.
- Chrome MCP read-only operations against prod for live behavior verification: navigate, get_page_text, read_console_messages, read_network_requests.
- web_fetch / web_search if scope explicitly references external standards or docs.

## Forbidden (hard)
- All GitHub MCP writes.
- All Supabase mutations.
- All Chrome MCP mutations: left_click on submit-style elements, type into prod forms, javascript_tool against prod, file_upload, form_input.
- Drafting any Claude Code prompt. Even if a fix is obvious, the skill stops at suggested-slice framing.
- Any "recommendation" beyond surfacing what exists. The skill describes; Mo + GPT decide.

## Output card schema (CARD-FIRST)
```yaml
type: review
scope: <input string>
session_head: <SHA>
generated_at: <ISO>
sources: [list of reads]
bug_cards:
  - id: B1
    severity: high|medium|low
    title: <one-line>
    evidence: <file:line + DB query if relevant>
    impact: <one paragraph>
    no_recommendation: true
risk_cards:
  - id: R1
    title: <one-line>
    type: doctrine|security|drift|perf|UX
    evidence: <where>
    no_recommendation: true
suggested_slice:
  - title: <one-line>
    rationale: <why this could be next>
    blockers: [<list>]
    not_drafted: true
mo_approval_required_for:
  - "pick a finding to act on, or none"
```

## Mo approval
Review never produces fixes. Mo + GPT pick a finding (or none), then a separate slice-drafting step runs (outside this skill).
