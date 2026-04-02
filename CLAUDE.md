# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# JOBLUX — Claude Code Briefing Document
_Last updated: April 2, 2026. Read this entire file before touching any code._

---

## What is JOBLUX

JOBLUX is a **confidential luxury careers intelligence platform** — not a job board, not a community. It is a free-against-contribution intelligence gateway for luxury industry professionals globally.

**Revenue model:** Private executive recruitment fees + travel advisory commissions (Fora Travel partnership). Zero advertising.

**Slogan:** "Luxury Talent Intelligence"  
**Baseline:** "Luxury, decoded." — used under logo on holding page and anywhere a tagline appears.

**Kill words — never use:** society, community, members, join  
**Use instead:** confidential, discreet, intelligence, contribution

**Co-founder:** Alex Mason (London-based)

---

## Tech Stack

- **Framework:** Next.js 14.2.0, TypeScript, Tailwind CSS
- **Database:** Supabase (project ID: `zspcmvdoqhvrcdynlriz`, eu-west-1)
- **Auth:** NextAuth v4
- **Email:** AWS SES
- **Repo:** `github.com/joblux/ClaudeCORE`
- **Deployed via:** Coolify on Hetzner VPS (IP: 91.99.193.225)
- **Production:** `joblux.com` (preview cookie)
- **Old staging:** `luxuryrecruiter.com`

---

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm start            # Start production server

# Database seed scripts (require .env.local with Supabase credentials)
npm run seed:wikilux
npm run seed:bloglux
npm run seed:salaries
npm run seed:interviews
npm run seed:translations
npm run seed:all          # Run all seeds sequentially
```

No test framework is configured. Coolify auto-deploys on push to main (~3 min).

---

## Locked Workflow Rules — Never Break These

1. Always `cat` existing files before writing anything that connects to existing code
2. Complete replacement files only — never partial patches or sed commands
3. Always use unique descriptive filenames — never generic `page.tsx` as output name
4. Every horizontal band (topbar, hero, steps bar, ticker) must wrap content in `max-width:1200px + margin:0 auto + padding:0 28px` — same as header
5. Design mockup → approval → build. Never build before Mo approves design
6. One command at a time
7. git add/commit/push in terminal — never GitHub Desktop
8. Coolify auto-deploys on push (~3 min)
9. Before any build phase, read the relevant files first

---

## Design System — Hard Rules

**Colors:**
- Gold: `#a58e28`
- Dark background: `#1a1a1a`
- Cards: `#222`
- Borders: `#2a2a2a`

**Typography:**
- Headings: Playfair Display 400
- Body: Inter
- Italic gold accents for: "intelligence", "Brief", "Escape"

**Logo:** Always use the image file `joblux-header.png` — never type "JOBLUX" as text in the UI. Logo = "JOBLUX." all gold with period.

**Aesthetic:** Bloomberg-meets-luxury. Dark, editorial, precise.

**Text contrast rule — HARD, ALL PAGES:**
On dark backgrounds (`#0f0f0f`, `#1a1a1a`, `#111`, `#141414`, `#222`):
- Headings = `#fff` always
- Body text = `#ccc` minimum
- Secondary text = `#999` minimum
- Hints/captions = `#777` minimum
- BANNED: `#666`, `#555`, `#444`, `#333`, `#2e2e2e`, `text-white/50` or lower, `rgba(255,255,255,0.5)` or lower

**Signal dots:** green=Growth, amber=Leadership, red=Contraction, blue=Expansion, purple=M&A

**Admin design (separate system):**
- `#f5f5f5` bg, `#fff` cards/sidebar, `#e8e8e8` borders, `#111` text
- Color-coded badges, zero gold anywhere in admin

---

## Global Header — Locked

- `py-[28px]`
- Right side: *Escape* (italic gold) + separator `|` + Connect (links to `/members`)
- No "Request access" button, no "Sign in" text
- Mobile nav matches — Connect replaces Sign in

---

## Database — Key Patterns

- All admin data routes use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- `auth.users` is always empty — NextAuth handles sessions
- Always use `.maybeSingle()` not `.single()`
- `bloglux_articles` columns: `body` (NOT content), `read_time_minutes` (NOT read_time), `author_role`
- Signal status field: `is_published` (boolean, not `status`)

---

## Architecture — Active Pages

### Nav items (live):
Brands | Insights | Signals | Careers | Events

### Active dark pages (DO NOT touch design):
`/` `/about` `/brands` `/brands/[slug]` `/careers` `/careers/[slug]` `/connect` `/dashboard` `/dashboard/candidate` `/dashboard/business` `/dashboard/insider` `/events` `/events/[slug]` `/insights` `/join` `/signals` `/signals/[slug]` `/account` `/services` `/privacy` `/terms` `/holding`

### Already redirecting (DO NOT touch):
`/coaching` → `/careers` | `/jobs` → `/careers` | `/opportunities` → `/careers` | `/directory` → `/` | `/profile` → `/account` | `/wikilux/[slug]` → `/brands/[slug]` | `/bloglux` → `/insights`

### Needs dark theme conversion:
`/salaries` `/interviews` `/interviews/[slug]` `/bloglux/[slug]` `/contribute` `/faq` `/the-brief` `/members` `/members/check-email` `/r/[slug]`

### Old routes needing redirects:
`/wikilux` → `/brands` | `/wikilux/all` → `/brands` | `/bloglux` → `/insights`

---

## Brand Page — `/brands/[slug]`

**Tabs:** Overview | Culture | Career paths | Salaries | Signals | Library | Map

Library and Map are "coming soon" placeholders.

**Tab structure is sacred** — never add sections not in the approved prototype.

---

## Insights Page — `/insights`

**Tabs:** Editorial | Research reports | Insider voices | Luxury map

Luxury map = coming soon placeholder.

Insider Voices: cards must be clickable → `/bloglux/[slug]`, show real `author_name`, initials from author name not title.

---

## Careers Page — `/careers`

**Tabs:** Assignments | Salary intelligence | Interview prep

Fetches from: `search_assignments` (26 published), `salary_benchmarks` (160 rows), `interview_experiences` (28 rows)

---

## Registration Tiers

DB keys: `rising` (Emerging), `pro` (Established), `executive` (Senior & Executive), `business` (Employer), `insider` (Trusted Contributor)

All new registrations → PENDING status. Emails: pending→user, notification→admin, approval→welcome.

---

## Contribution System

- **Professionals** (rising/pro/executive): salary data + interview experiences + signal tips → earn points → unlock deeper access
- **Insider**: all of the above + Insider Voices (perspective articles) + brand corrections
- **Employer**: brand corrections + signal tips only (no salary/interview — conflict of interest)

Contribution Command Center: `/admin/contributions` — 4 active tabs (Voices, Salary, Interviews, Brand Corrections) + 2 placeholder tabs (Signals, Reports)

Insider Voice submission API: `/api/insider/submit-voice` — insider tier only, saves to `bloglux_articles` as draft with `category = 'Insider Voice'`, `content_origin = 'contributed'`

---

## LUXAI System

- Always use Claude Haiku 3.5 only — never Sonnet or Opus for generation
- Claude Haiku wraps JSON in markdown backticks despite instructions — always strip by finding first `{` and last `}` characters
- All LUXAI generation endpoints write `content_origin: 'ai'` on insert
- Command Center at `/admin/luxai`

**WikiLux:** 154 brands in static array (`lib/wikilux-brands.ts`). 24 approved in DB. 130 still need LUXAI generation (~$1.87 total).

**Approved 15-field data structure for WikiLux:**
- `history`: `{year, event}[]` array
- `careers`: `{prose, paths[]}`
- `hiring_intelligence`: `{values[], culture, growth, pace, access}`
- `quote`: `{text, author}`

---

## Salary Data Format

The salary endpoint generates `cities[]` array format. The brand page renderer reads `ranges{}` object format. Normalization happens in `buildBrandData()` in `app/brands/[slug]/page.tsx` — DO NOT change either format.

---

## Copy Rules

- "Open to approaches" → always display as "Considering opportunities"
- "The Brief" → always "BIWEEKLY" not weekly
- Availability = "Considering opportunities" everywhere

---

## Escape Module

Completely separate design system — warm yellow `#F7F3E8`. Do NOT mix with main site dark theme. Never cross-link salary/WikiLux/career content from inside Escape. Consultation emails → `mo.mzaour@fora.travel`

---

## Roadmap (DO NOT BUILD without Mo's go-ahead)

1. **SEO URL tab migration** — convert all JS tabs to `?tab=` URL params across `/insights`, `/careers`, `/brands/[slug]`. 770+ indexable pages.
2. **Luxury Map** — `/insights` Luxury Map tab + `/brands/[slug]` Map tab. Needs `luxury_map_countries` Supabase table Mo curates. Design: black bg, gold borders on luxury countries, silver fills by dominant sector.
3. **Contribution system full build** — per-tier contribution dashboards, edit/delete flows, `member_id` on `bloglux_articles`.
4. **WikiLux multilingual SEO** — `/brands/[slug]/[lang]` server-rendered routes, 150 brands × 9 languages = 1,350 indexed pages.
5. **Escape module** — monthly travel magazine, separate session.
6. **Events module** — full calendar at `/events` with `.ics` download.
7. **Admin dashboard overhaul**
8. **Account page deploy + test** (file: `AccountClient_v1.tsx`)

---

## Pending Fixes (priority order)

1. Brief = BIWEEKLY copy fix
2. Opportunities → Careers in nav
3. "Submit a brief" = exec search language
4. Test search fields
5. Trusted Contributor tier placement
6. Round 2 registration test
7. Seed content
8. Admin dashboard overhaul
9. Deploy + test Account page
10. Contribution unlock thresholds
11. Dark theme audit: `/salaries`, `/interviews`, `/bloglux/[slug]`, `/contribute`, `/faq`, `/the-brief`, `/members`

---

## Key Learnings — Never Repeat These Mistakes

- Never use `sed` patches — always write complete replacement files
- Never build before design approval
- Always `cat` existing files before writing anything connected to existing code
- Never paste full terminal output from zip or file-listing commands — causes context exhaustion
- Never add sections not in the approved prototype
- Shareable member profiles (`/r/[slug]`) must always have `noindex/nofollow`
- Admin routes always use service role key — RLS bypassed
- `.maybeSingle()` everywhere in admin — `.single()` throws errors when empty
- Batch related fixes into single commits to minimize Coolify builds
- `bloglux_articles` has no `article_type` column — use `category` field instead
- Signals table uses `is_published` boolean not `status`
