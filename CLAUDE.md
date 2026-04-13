# CLAUDE.md

Execution rules for Claude Code working in this repository.
Full platform state is in `docs/JOBLUX_STATE.md` — read it before any scoped task.

---

## Commands

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build (NODE_OPTIONS=--max-old-space-size=4096)
npm run lint         # ESLint
```

No test framework configured. Coolify auto-deploys on push to main (~3 min).

---

## Hard Rules — Never Break

1. Read existing files before writing anything that connects to them
2. Prefer minimal changes. Do not rewrite full files unless necessary.
3. Never build before Mo approves the design/approach
4. Never execute without Mo's approval — Propose → Wait → Approve → Execute
5. No scope expansion, no chaining, no extra features beyond what was asked
6. No redesign of existing pages unless explicitly requested
7. DB is single source of truth — no static arrays, no hardcoded data
8. Do not add UI sections or data fields not already present in the live product.
9. Never invent data. If data is missing, show empty state or fallback — do not fabricate.
10. Always trace data origin (DB table / query / source) before modifying UI.
11. Do not duplicate content across modules. Use existing pipelines as source.
12. Signals displayed on brand pages must come from the signals table — never re-created or manually written.

---

## Content Rules

- No AI-generated content about real named people without verified sourcing
- `content_origin: 'ai'` required on all LuxAI-generated inserts
- All content flows through `content_queue` before publish — nothing auto-publishes
- `generate-insider-voice` route is retired permanently
- LuxAI generation: Claude Haiku 3.5 only — never Sonnet or Opus
- Haiku wraps JSON in markdown backticks — always strip by finding first `{` and last `}`
- Signals must be based on current-month information only — no outdated content.

---

## Supabase Rules

- Admin routes: always `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- Always `.maybeSingle()` — never `.single()` (throws on empty)
- `auth.users` is always empty — NextAuth handles sessions
- Before any insert/update: verify column names against `information_schema.columns`
- `bloglux_articles`: column is `body` (not `content`), `read_time_minutes` (not `read_time`)
- `signals` uses `is_published` boolean — do not assume a `status` string exists
- `wikilux_content`: `status` + `is_published` can fall out of sync — check both
- `search_assignments` status: only `draft/published/closed` — `active` violates constraint
- `article_status` enum: `draft, review, published, archived, submitted, revision_requested, rejected`
- `content_queue` content_type: `signal/event/article/research_report/voice_card/salary_benchmark/brand_profile`

---

## Architecture Constraints

### Modules are logically separated. Do not mix responsibilities or duplicate data across modules.
1. **Intelligence** — brands, signals, salaries, interviews, editorial
2. **Recruiting** — ATS, assignments, briefs, applications
3. **Escape** — separate travel magazine, warm yellow `#F7F3E8`, no crossover with main site

### Routing:
- DB table names stay forever — no renames (`bloglux_articles`, `wikilux_content`, `profilux`)
- Public URLs use clean names: `/insights/[slug]`, `/brands/[slug]`, `/p/[name]`
- Redirect `/bloglux/[slug]` → `/insights/[slug]`, `/wikilux/[slug]` → `/brands/[slug]`
- Dead routes: `/wikilux`, `/salaries` — never link to these

### Brand page tabs must match the current implementation. Verify in code before modifying.

---

## Design Rules

### Public pages (dark theme):
- Gold `#a58e28` — max 3 uses per page: active tab underline, italic accents, primary CTA
- Dark bg `#1a1a1a`, cards `#222`, borders `#2a2a2a`
- Headings: Playfair Display 400. Body: Inter
- Logo: always `joblux-header.png` — never type "JOBLUX" as text
- Signal dots: green=Growth, amber=Leadership, red=Contraction, blue=Expansion, purple=M&A

### Text contrast (hard — all dark pages):
- Headings: `#fff`
- Body: `#ccc` minimum
- Secondary: `#999` minimum
- Hints: `#777` minimum
- Banned: `#666` and below on dark backgrounds

### Layout (hard):
Every horizontal band: `max-width:1200px` + `margin:0 auto` + `padding:0 28px`

### Admin pages (separate system):
- `#f5f5f5` bg, `#fff` cards, `#e8e8e8` borders, `#111` text
- Zero gold, zero Playfair Display
- All admin routes: `export const dynamic = 'force-dynamic'`

---

## Copy Rules

- Kill words: society, community, members, join, membership, internships
- Use instead: confidential, discreet, intelligence, contribution
- "Considering opportunities" (never "Open to approaches")
- "Company" (never "Luxury Employer")
- "Express interest" = "apply"
- American English throughout

---

## Deployment

- SSH push to GitHub → Coolify auto-deploys (~3 min)
- Terminal only — never GitHub Desktop
- `git add` + `git commit` + `git push` in terminal
- Batch related fixes into single commits to minimize builds
- Unique descriptive filenames — never generic `page.tsx` as output

---

## Diagnostics

- Curl the live URL first — diagnose from facts, not assumptions
- Bug tracing order: DB truth → API endpoint code → frontend render
- When Supabase returns correct data but Next.js shows null: check middleware redirects and container staleness first
- Confirm which file renders the live URL before touching any code
- Never paste full terminal output from zip/file-listing commands — causes context exhaustion
