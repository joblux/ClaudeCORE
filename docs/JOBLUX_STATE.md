# JOBLUX CONSTITUTION

This file is the supreme execution source of truth for JOBLUX.

This file overrides:
- prior chats
- handoff notes
- memory summaries
- skills if conflicting
- stale project docs
- assumptions

If any source conflicts with this file: this file wins.

No work begins before reading this file.

No feature or repair proceeds without contract-first verification:
schema → enums → constraints → routes → UX.

## Authority layers (limited roles)
- Ledger (`/admin/tasks`) = task tracking only
- Handoff = session continuity only
- Skills = prompt formatting behavior only
- Memory = quick recall only
- None of the above may redefine architecture.

## Canonical objects (only sources of truth in the system)
- WikiLux = brand / market truth
- ProfiLux = professional / human truth
- Businesses = demand truth
- LuxAI = sourced transformation layer (never source of truth)
- content_queue = moderation gate (no content type bypasses it)

## Session start command
"Read docs/JOBLUX_STATE.md. Ignore conflicting stale sources."

---

## ACTIVE CHAIN

Execution order. Ledger statuses untouched — this is the mental map, not DB truth.

### LAST SHIPPED (Apr 30 2026 evening — ProfiLux Matrix v1 spec locked + .env.local cleanup)

Two clean closes, single-scope each, zero code changes:

- **5cb1e0d** `docs(profilux): add Matrix v1 specification — locked Q1-Q6` — created `docs/PROFILUX_MATRIX_V1.md` (436 lines), the ProfiLux domain contract. Locks: storage shape (hybrid: L1=`cv_parsed_data` jsonb, L2=`members.*` flat, L3=`profile_completeness`+`m6_confirmed_at` cached), re-upload rule (overwrite-in-place, L2 sovereign), resolver contract (Rule A — L2 wins, L1 fills NULLs, single server-side resolver), projection contract (6 surfaces, single `projectFor` switch, per-surface masks), M6 eligibility model (computed from resolved view, M6-confirmed = explicit user action only), guardrails, change control, and v2 deferred items. See §24 of this doc for product doctrine, see `docs/PROFILUX_MATRIX_V1.md` for implementation contract.

- **`.env.local` cleanup (local-only, no commit — gitignored)** — `DEV_AUTH_BYPASS=1` removed; `# TEMPORARY — REMOVE AFTER cv-parse TEST` comment removed; `NEXTAUTH_URL` restored from `http://localhost:3000` to `https://joblux.com`. Side-state from Apr 30 morning session fully closed. Two backups preserved (`.env.local.backup`, `.env.local.precleanup.<ts>`), both gitignored.

### Earlier same-day (Apr 30 afternoon — cv-parse green in prod)

Reference, not new shipment:

- **a6fc9f6** ship sanitized cv-parse route · **ca596e2** F-cv_url normalize · **3fe6462** F-pdfworker pdf-parse v1 · **cc93436** F-pdfparse-testfile subpath import · **4ff5f14** F-schema-toosmall description max 2000
- Prod fixture test on member `49542211-fe29-4833-a141-eb1eaa7d248f`: STATUS 200, 5 experiences extracted, confidence 0.92, sanitization confirmed (`luxai_history.response = {}`)
- Ticket `0be2284c` CLOSED Apr 30 13:08:46

### CURRENT STEP — strict order, no skip, no resequence from broader ledger

**Path C locked (Apr 30 late evening).** Audit revealed `/api/profilux` reads/writes the FROZEN-OUT standalone `profilux` table (Matrix v1 §9 violation in code today). cv-parse cannot wire to a surface that violates the contract it's supposed to serve. Migration sequenced first.

1. **Migrate `/api/profilux` to Matrix v1 contract** — refactor route handlers to read/write `members.*` per Matrix v1 §6 (resolver) and §11 (forbidden patterns):
   - Build `lib/profilux/resolveProfiLux.ts` (Q3 contract: L2 wins, L1 fills NULL gaps, single server-side function)
   - Build `lib/profilux/projectFor.ts` (Q5 contract: 6 surface projections, single switch)
   - Build `lib/profilux/computeProfileCompleteness.ts` (Q4 contract: recompute on write)
   - Build `lib/profilux/computeM6Eligible.ts` (Q6 contract: computed from resolved view)
   - Refactor `/api/profilux` GET to return `projectFor(resolveProfiLux(memberId), 'editor')`
   - Refactor `/api/profilux` POST to write `members.*` flat columns + recompute completeness (NOT the standalone `profilux` table)
   - Refactor `/api/members/me` to include `profile_completeness`, `m6_confirmed_at`, `cv_url`, `cv_parsed_at` (currently all missing)
   - Park `/api/profilux/reset-link` separately (still writes frozen-out table; not in v1 scope until sharing UX is rebuilt)
   - **No data migration of the 3 standalone `profilux` rows.** They are dormant (`sharing_enabled = false` on all 3, 0 live public routes). Treat as frozen legacy data; cleanup is a separate post-v1 deprecation session.
   - **Implementation likely breaks into:** (1) Matrix utilities, (2) `/api/profilux` GET migration, (3) `/api/profilux` POST migration, (4) `/api/members/me` alignment. Do not pre-commit to commit count; sequence ships as it lands cleanly.

2. **Wire cv-parse to UI** — add Parse trigger in `/dashboard/candidate/profilux` flow, gated on item 1. Parse output writes L1 only (`cv_parsed_data`). User-confirmed prefill goes through the migrated L2 edit endpoints. No direct `members.*` or `cv_parsed_data` reads in UI.

3. **Resume 11-screen ProfiLux tunnel** — Refoundation L1-L5 + M6 enforcement, gated on items 1+2.

### DO NOT
- Touch cv-parse route again unless a new bug surfaces (currently green in prod, do not regress).
- Deviate from `docs/PROFILUX_MATRIX_V1.md` without updating the spec first (per its §12.2 — code that diverges from the spec is a defect).
- Use Hélène BILLARD as fixture (consent unconfirmed, blocked permanently).
- Read `members.*` or `cv_parsed_data` directly from any UI surface for ProfiLux fields — go through `projectFor`.
- Implement L1 → L2 silent writes from any code path.
- Migrate the 3 dormant `profilux` standalone rows during item 1 — data migration is post-v1 cleanup, not part of route migration.
- Wire cv-parse to UI before item 1 lands (would create the parallel-surface mess Matrix v1 was written to prevent).
- Touch `/api/profilux/reset-link` during item 1 — sharing UX is a separate post-migration concern.
- Resequence backlog from broader ledger.

### SESSION NOTE (Apr 30 late evening — audit + Path C re-sequence)
- Two-stage read-only audit performed before any wiring work: (1) cv-parse → UI surface inventory; (2) `/api/profilux` + `/api/members/me` + `/api/profilux/reset-link` integration audit.
- Audit findings forced re-sequencing: `/api/profilux` GET reads from the standalone `profilux` table (Matrix v1 §9 frozen-out), POST writes to it, reset-link writes to it. The entire ProfiLux UI surface today operates against the wrong source of truth. cv-parse cannot wire cleanly until that path is migrated.
- DB verification via Supabase MCP: standalone `profilux` table has 3 rows, ALL with `sharing_enabled = false`, 0 live public routes. Schema confirms no `member_id` FK — the table is fully detached, linked only by email. Dormant, not data-loss-risky.
- Path C decision (Mo + GPT, this session): migrate `/api/profilux` to Matrix v1 contract first; cv-parse UI second; tunnel third. Path B (parallel surfaces) explicitly rejected as "the trap Matrix v1 was written to prevent." No data migration on the 3 dormant rows in v1 scope.
- Discipline observation: the audit caught a major architectural drift before any code was touched. Read-only-first is now reinforced as a hard pattern: audit → reconcile → spec/sequence → code.

### PARKED (admin_tasks status=parked, created Apr 29 2026)
- `2847ac29` — Audit + migrate Anthropic model IDs across repo before Sonnet 4 retirement (deadline Jun 15 2026)
- `1e6162ea` — Replace inert RPC `submit_m6_admission` (incompatible with locked Apr-14 11-screen proto)

### NEW FINDINGS LOGGED (out of immediate scope, surface separately)
*Carried forward from prior rotations, plus 3 added Apr 30 late evening:*
- **F-luxuryrecruiter** — Legacy domain `luxuryrecruiter.com` resurfaced in `.env.local` (now cleaned per CURRENT STEP item 1 close, but repo still has refs in `SETUP-GUIDE.md`, `.env.example`, `scripts/seed-all.sh`). Full audit needed across: repo source code, .env files (Coolify), DNS records, OAuth provider redirect URLs, SES verified identities, hardcoded refs in middleware/auth/email templates. Dedicated session required.
- **F-magiclink-delivery** — Magic-link UI works, NextAuth token created in DB, but SES delivery to gmail address never completed during the Apr 30 morning session. Cause not isolated. STATE sections 2/19/20 are STALE and claim magic-link not configured — they are wrong: magic-link IS configured at code level, but delivery channel uncertain.
- **F-pdfparse-anthropic-files** — Followup to F-pdfworker fix: evaluate Anthropic Files API native PDF input (Haiku 4.5 supports PDF document blocks) as v2 of parser path. Documented as deferred in `docs/PROFILUX_MATRIX_V1.md` §13.
- **F-admin_tasks-trigger** — `admin_tasks` `done` and `completed_at` derive trigger does NOT fire on direct UPDATE via Supabase MCP, only on PATCH route. Trigger logic likely lives in API route handler, not in DB trigger.
- **F-cv_url-format-mixed** — 5/8 `members.cv_url` rows in full-URL format, 3/8 in path-only. Route now handles both via `normalizeCvStoragePath` helper. Audit confirmed current upload route (`app/api/members/cv-upload/route.ts:68-71`) writes path-only consistently — legacy rows are historical, not from current code.
- **F-cv-parse-no-ui** — cv-parse route functional but no UI button calls it. **Now CURRENT STEP item 2** (gated on item 1 migration).
- **F-public-slug-stub** *(NEW Apr 30 late evening)* — `app/[slug]/page.tsx` (156 lines) reads from frozen-out standalone `profilux` table at lines 26–31, uses `.single()` instead of `.maybeSingle()` (CLAUDE.md violation). DB verified dormant: 3 rows, all `sharing_enabled = false`, 0 live public routes. Compiles and serves but never returns data. Park as separate cleanup ticket alongside `profilux` table retirement (Matrix v1 §13).
- **F-members-me-incomplete** *(NEW Apr 30 late evening)* — `/api/members/me/route.ts` (25 lines) selects 12 fields, returns NONE of: `profile_completeness`, `m6_confirmed_at`, `cv_parsed_data`, `cv_url`, `cv_parsed_at`. Dashboard cannot display any L3 status today even if the cached fields existed. Will be addressed inside CURRENT STEP item 1 (migration).
- **F-profilux-frozen-table-routes** *(NEW Apr 30 late evening)* — `/api/profilux/route.ts` (150 lines) GET reads standalone `profilux` table (lines 17–21), POST writes to it (lines 134–144); `/api/profilux/reset-link/route.ts` (58 lines) reads + writes the same table. 7 `from('profilux')` hits across these two routes. This is the migration scope of CURRENT STEP item 1.

### LEDGER NOTE
- Ticket `0be2284c` CLOSED Apr 30 (verified: status=closed, done=true, completed_at=2026-04-30 13:08:46).
- ProfiLux Matrix v1 spec lock: not a ledger ticket — captured as commit `5cb1e0d` and as `docs/PROFILUX_MATRIX_V1.md` itself.
- `.env.local` cleanup: not a ledger ticket — local-only side effect, captured in this rotation only.
- Outstanding parked items unchanged.

**Last updated:** April 30, 2026 (late evening — audit + Path C re-sequence)
**Maintained by:** Claude AI (Opus) · JOBLUX Ops

---

## 1. WHAT IS JOBLUX

Confidential careers intelligence gateway for the luxury industry. Not a job board, not a social network.

**Slogan:** "Luxury Talent Intelligence"
**Baseline:** "Luxury, decoded."
**Revenue:** Private executive recruitment (fees 18-20%) + Fora Travel advisory commissions (Escape)
**Model:** Free-against-contribution. No subscriptions, no paywalls, no ads.
**Kill words:** society, community, members, join, membership, internships
**Use instead:** confidential, discreet, intelligence, contribution

**Co-founder:** Alex Mason (London)
**Only valid public email:** alex@joblux.com

---

## 2. TECH STACK

- **Framework:** Next.js 14.2, TypeScript, Tailwind CSS
- **DB:** Supabase (project ID: `zspcmvdoqhvrcdynlriz`, eu-west-1)
- **Auth:** NextAuth v4 (Google OAuth ✅, LinkedIn OAuth ✅, Magic links ❌ not configured)
- **Email:** AWS SES (domain verified, emails working)
- **Deploy:** Coolify on Hetzner VPS, SSH push to GitHub
- **Repo:** github.com/joblux/ClaudeCORE
- **Build:** `NODE_OPTIONS=--max-old-space-size=4096` in package.json

---

## 3. THREE-BRAIN WORKFLOW

- **Claude Opus (this instance):** DB verification, audit, guardrails, architecture decisions, prompt quality control
- **GPT:** Strategy, content design, risk detection
- **Claude Code:** Execution — receives prompts from Mo, pushes via SSH to Coolify
- **Mo:** Copy-pastes between tools, makes all final calls

**Execution control rule:** Never execute without Mo's approval. Sequence: Propose → Wait → Mo approves → Execute. No chaining. No scope expansion.

---

## 4. PLATFORM ARCHITECTURE

### Three modules:
1. **Intelligence module** — LuxAI-powered data, signals, salary/interview intelligence, editorial. Public trust layer. Core differentiator.
2. **Recruiting module** — ATS, business briefs, candidate flows, assignments. Revenue engine.
3. **Escape module** — Separate travel magazine entity. Fora commissions. Limited crossover.

### Four layers:
- **Layer A — Public:** Homepage, brands, signals, careers, insights, events, The Brief, Access
- **Layer B — Access:** /connect, /join, /select-profile, registration, pending/approval, role routing
- **Layer C — Private:** Candidate/business/insider dashboards, profile, contributions
- **Layer D — Operations:** Admin command centers (LuxAI, ATS, Contributions, Content Queue, Members)

---

## 5. LIVE URLS & ROUTING

### Active public pages:
`/brands`, `/brands/[slug]`, `/signals`, `/signals/[slug]`, `/careers`, `/insights`, `/events`, `/interviews`, `/escape`, `/connect`, `/select-profile`, `/join`, `/join/employer`, `/about`, `/faq`, `/privacy`, `/terms`, `/terms/business`

### Dead/retired (never link here):
`/wikilux` (old cream design), `/salaries` (standalone old page)

### Naming convention (frozen Apr 4):
- Public: `/insights/[slug]` (articles), `/brands/[slug]` (WikiLux), `/p/[name]` (ProfiLux)
- DB stays: `bloglux_articles`, `wikilux_content`, `profilux`
- Redirect `/bloglux/[slug]` → `/insights/[slug]`
- No DB renames ever

---

## 6. DATABASE STATE (verified Apr 13, 2026)

| Table | Count | Status |
|---|---|---|
| wikilux_content (brands) | 176 live | 175 seeded, Tiffany & Co empty shell |
| signals | 11 | All real RSS-sourced, all have source_url |
| bloglux_articles | 25 seed | 7 AI unpublished. ALL detail pages return 404 |
| events | 9 live (18 AI unpublished) | ALL detail pages return 404 |
| search_assignments | 26 | All published |
| applications | 1 | Stage: rejected (test by Mo) |
| business_briefs | 2 | Test data |
| salary_benchmarks | 5,609 | ⚠️ ALL AI-generated, no source URL — pending unpublish |
| interview_experiences | 0 | 28 fabricated entries deleted Apr 10 |
| contributions | 54 | All type interview_experience, all approved (seeds) |
| members | 4 | 1 business role, 4 pending, 0 approved |
| content_queue | 150 | 106 signals, 26 events, 8 articles, 10 salary benchmarks |

### DB rules:
- DB is single source of truth everywhere. No static arrays.
- Before any insert/update: run `information_schema.columns` to verify column names
- `search_assignments` status: only `draft/published/closed` — 'active' violates constraint
- `bloglux_articles` uses `body` (not `content`), `read_time_minutes` (not `read_time`)
- `wikilux_content`: `status` (approved/pending/draft) + `is_published` boolean — can fall out of sync
- `article_status` enum: `draft, review, published, archived, submitted, revision_requested, rejected`
- `content_queue` check constraints: `content_type` ∈ {signal/event/article/research_report/voice_card/salary_benchmark/brand_profile}
- Admin pattern: always `SUPABASE_SERVICE_ROLE_KEY`, always `.maybeSingle()` never `.single()`

---

## 7. CONTENT DOCTRINE

### What's clean:
- **Signals** ✅ — 11 real RSS-sourced, all with source_url
- **Articles** ✅ — 25 seed articles (7 AI unpublished)
- **Events** ✅ — 9 live (18 AI unpublished)
- **Brands** ✅ — 176 live, all seeded with real data
- **Interviews** ✅ — 28 fabricated entries deleted

### What's NOT clean:
- **Salary** ❌ — 5,609 AI records still live, no source URL, frontend impact audit required before unpublishing
- **Insights tabs** — Research + Insider Voices tabs hidden (correct)

### Hard rules:
- No AI-generated content about real named people without verified sourcing
- `generate-insider-voice` route retired permanently
- All content through `content_queue` before any publish
- Mo approves everything — nothing auto-publishes
- `content_origin: 'ai'` on all LuxAI-generated inserts

---

## 8. REGISTRATION & ACCESS

### Current flow:
1. `/connect` → two-column split: professional (left) or employer (right)
2. Professional → `/select-profile` → choose tier (Emerging/Established/Senior & Executive)
3. Sign in: Google OAuth / LinkedIn OAuth / Magic link (not configured)
4. Registration form → upload CV
5. All → PENDING status
6. Admin approves → welcome email → dashboard

### Tiers (DB keys):
- `rising` = Emerging Professional
- `pro` = Established Professional
- `executive` = Senior & Executive
- `business` = Employer (label: "Company")
- `insider` = Trusted Contributor

### Access model:
- No tier gates on content
- Contribution-gated only: partial visible to all, full depth unlocked by contributing
- Tier determines opportunity, not access

### Emails (SES, all working):
- Pending → user confirmation
- Notification → admin
- Approval → welcome email

---

## 9. CONTRIBUTION SYSTEM

### Active contribution types:
1. **Salary data** (`salary_data`) — Form on `/contribute` + `/dashboard/insider/submit-salary`. Points: 10
2. **Interview experience** (`interview_experience`) — Form on `/contribute`. Points: 10
3. **Insider Voices** — Insider tier only. Saves to `bloglux_articles` as draft. Points: 5
4. **Brand corrections** — Admin contributions tab

### Access level thresholds (DB: `access_thresholds`):
- Basic: 0 pts
- Standard: 10 pts (unlocks salary benchmarks overview)
- Premium: 25 pts (unlocks full salary + compare)
- Full: 50 pts (unlocks calculator + priority access)

### Who can contribute what:
- **Professionals** (rising/pro/executive): salary + interviews + signal tips
- **Insider**: all above + Insider Voices + brand corrections
- **Business**: brand corrections + signal tips only

### Admin: `/admin/contributions` — 4 active tabs (Voices, Salary, Interviews, Brand Corrections) + 2 placeholders (Signals, Reports)

---

## 10. RECRUITING MODULE

### Search Assignments:
- 26 published assignments in DB
- Admin creates/edits at `/admin/assignments`
- Public listing on `/careers` (Assignments tab)
- Confidential brand reveal mechanic works

### ATS Pipeline:
- Admin at `/admin/ats` — Kanban + table views
- Stages: applied → screening → shortlisted → submitted_to_client → interview_1 → interview_2 → interview_final → client_reviewing → offer_made → offer_accepted + terminal (hired, rejected, withdrawn, on_hold)
- Application detail page at `/admin/ats/[id]` — candidate info, brief, timeline, notes, recruiter assignment
- Current state: 1 application (test), stage: rejected

### Applications API (`/api/applications`):
- Candidate: self-apply (source = 'self_applied'), anti-duplicate protection
- Admin: create for any member, assign recruiter, add note, choose source

### Business Briefs:
- 2 test briefs in DB
- Employer submits from `/dashboard/business`
- Admin views at `/admin/business-briefs` and `/admin/briefs`

### Email templates (SES, built but not all tested end-to-end):
- Employer side: brief received, search update, candidates shared, placement confirmed
- Candidate side: opportunity matched, interview scheduled, offer, placement confirmed

### Terms of Business (`/terms/business`):
- Fees: 18% (up to $150K), 20% (above $150K). Contingency only.
- 12-month candidate attribution. 90-day replacement.

---

## 11. DASHBOARDS

### Candidate (`/dashboard/candidate`):
- 4-card next-steps: Profile, Careers, Intelligence, Contribute
- Conditional ProfiLux completion bar
- ProfiLux 7-step form at `/dashboard/candidate/profilux`

### Business (`/dashboard/business`):
- Submit brief CTA
- Request status view
- "How it works" 4-step process
- Nav: Dashboard, Recruiting, Intelligence, Account

### Insider (`/dashboard/insider`):
- Role framing block (Trusted Contributor)
- Contribution stats (total, points, by type)
- Write perspective CTA
- Contribution history

### Router: admin→/admin, business→business, insider→insider, others→candidate

---

## 12. PROFILUX

- 7-step form: Personal, Experience, Expertise & Languages, Sectors, Salary, Availability, Share
- Profile completeness % calculated and stored
- `profile_completeness` field in members table
- Fields cover: personal info, work experiences, education, languages, skills, luxury-specific data (sectors, product categories, client segments, clienteling), availability, salary expectations
- CV upload exists (stored in Supabase storage)
- `cv_parsed_at` field exists but parsing NOT implemented
- Two surfaces currently: ProfiLux (dark, `/dashboard/candidate/profilux`) and Profile (light, `/profile`) — overlap exists

---

## 13. LUXAI SYSTEM

- Always Claude Haiku 3.5 — never Sonnet or Opus for generation
- Haiku wraps JSON in markdown backticks — always strip by finding first `{` and last `}`
- All generation endpoints write `content_origin: 'ai'`
- Command Center at `/admin/luxai`
- Content Queue at `/admin/content-queue` (single editorial gate)
- RSS pipeline: RSS ingest → brand-list filter → LuxAI structures → confidence gate → auto-approve
- Known issue: headline-similarity dedup needed on RSS route

---

## 14. ADMIN

### Sidebar structure:
Overview, Members, Intelligence (WikiLux + Insights + Comments + Brief), LuxAI (Command Center + Content Queue), Contributions, Recruiting (Assignments + ATS Pipeline + Briefs + Business Briefs), Escape, System (Tasks + Media + Contact + Email Templates + Settings + Trash)

### Admin design rules:
- `#f5f5f5` bg, `#fff` cards, `#e8e8e8` borders, `#111` text
- Zero gold, zero Playfair Display in admin
- All admin routes: `export const dynamic = 'force-dynamic'`

---

## 15. DESIGN SYSTEM

- **Gold** `#a58e28` — max 3 uses per page: active tab underline, italic taglines/accents, primary CTA only
- **Dark bg** `#1a1a1a`, **cards** `#222`
- **Logo** = `joblux-header.png` — never typed as text
- **Headings:** Playfair Display 400. **Body:** Inter
- **Signal dots:** green=Growth, amber=Leadership, red=Contraction, blue=Expansion, purple=M&A

### Text contrast rule (hard):
On dark backgrounds: Headings = `#fff`. Body = `#ccc` minimum. Secondary = `#999` minimum. Hints = `#777` minimum. Banned: `#666` and below on dark bg.

### Layout rule (hard):
Every horizontal band must wrap in `max-width:1200px` + `margin:0 auto` + `padding:0 28px`

### Copy rules:
- "Considering opportunities" (never "Open to approaches")
- "Company" (never "Luxury Employer")
- American English throughout
- "Express interest" = "apply"

---

## 16. ESCAPE MODULE

- Monthly luxury travel magazine, separate business
- Revenue: Fora advisory commissions
- Nav: Blog · Itineraries · Hotels Reserve · City Life · Deals · Plan Your Trip
- Warm yellow bg `#F7F3E8` — never mix with main dark theme
- No cross-links to JOBLUX career/salary content from inside Escape
- Consultation form emails: `mo.mzaour@fora.travel`
- First edition: "April knows better."
- Status: ✅ LAUNCHABLE

---

## 17. EVENTS MODULE

- Full calendar at `/events`
- Each event: list card → `/events/[slug]` detail + `.ics` download
- Filters: sector, region, month, invitation-only
- ~94 events/year, 38 countries
- Bridge to Luxury PDF = seed source (Mo to re-upload)
- Status: ❌ detail pages all 404

---

## 18. SHARED SYSTEMS

### Taxonomy:
8 locked sectors: Fashion, Jewelry, Watches, Beauty, Hospitality, Automotive, Spirits & Wine, Art & Culture. 177/180 brands mapped. 3 intentionally NULL.

### Social sharing:
Copy link + LinkedIn + Send to colleague (SES modal) — discreet, hover-triggered.

### Tab SEO (Apr 4):
All tabbed pages use `?tab=` query params. Brands: 5 tabs (~760 sitemap URLs).

---

## 19. LAUNCH BLOCKERS (as of Apr 10 audit)

| Priority | Issue | Impact |
|---|---|---|
| 🔴 1 | Article detail pages all 404 | /insights broken |
| 🔴 2 | Event detail pages all 404 | /events broken |
| 🔴 3 | 5,609 AI salary records live, labeled "verified" | False claims on homepage + /careers |
| 🔴 4 | Interview page shows stale counts (28 experiences, 12 maisons) | Data was deleted, counts not updated |
| 🔴 5 | Hardcoded wrong numbers across site | "500+ houses", "20 sectors", "250K+ briefing", "1000 data points" |
| 🔴 6 | Protected pages (dashboards, admin) not audited | Unknown state |
| 🟡 7 | Tiffany & Co empty shell | Needs single regen |
| 🟡 8 | Magic links not configured (Resend) | Registration limited to OAuth only |
| 🟡 9 | Tiffany duplicate (slug: tiffany-co) unpublished | Minor |

---

## 20. WHAT IS LAUNCHABLE TODAY

✅ Browse 176 brand dossiers
✅ Read 11 real market signals + detail pages
✅ Browse 26 confidential assignments
✅ Register as employer or professional (OAuth only)
✅ Escape module
✅ /join, /connect, /select-profile, /about, /faq, /privacy, /terms

❌ Article detail pages (all 404)
❌ Event detail pages (all 404)
❌ Salary data (all AI, falsely labeled)
❌ Interview intelligence (zero real data)
❌ Dashboards (not audited)
❌ The Brief newsletter (Resend not configured)

---

## 21. ROADMAP ITEMS (NOT YET STARTED)

- WikiLux multilingual SEO: /brands/[slug]/[lang] — EN + AR, ZH, JA = 528 additional indexed pages
- Brand autopilot: quarterly regen, display only in admin, not wired to cron
- Headline-similarity dedup on RSS signal route
- Salary `is_published` audit before bulk unpublish
- Account page (`AccountClient_v1.tsx`) — built, not deployed/tested
- BIMI: DMARC + DNS record + SVG logo
- Member Directory `/directory` — built but deactivated
- CV parsing by AI — field `cv_parsed_at` exists, not implemented

---

## 22. DEPLOYMENT

- SSH push to GitHub → Coolify auto-deploys
- Terminal only, never GitHub Desktop
- One-line copy-paste commands only
- Uniquely named files every time (never `page.tsx` in Downloads)
- Claude Code prompts: single copyable lines in code blocks, no placeholders

---

## 23. DIAGNOSTIC RULES

- Curl the live URL first, diagnose from facts, fix the exact problem
- For count/state bugs: DB truth → API endpoint code → frontend filter (bug is almost always in the middle layer)
- When Supabase returns correct data but Next.js shows null: check middleware redirects and container staleness first
- Before writing any file that connects to existing code: `cat` the existing file first
- Confirm which file renders the live URL before touching any code

---

## 24. PROFILUX ENFORCEMENT & ADMISSION THRESHOLD (REFOUNDATION)

**Status:** Locked. Refoundation enforcement.

**Implementation contract:** see `docs/PROFILUX_MATRIX_V1.md` (commit `5cb1e0d`). That doc is the canonical ProfiLux storage / resolver / projection contract. This §24 stays as the product doctrine summary (L1–L5 + M6 fields); the Matrix v1 doc governs how it is implemented in code. On conflict, pause and reconcile against STATE before coding.

**Drift reset phrase:** *"follow L1–L5 + M6 exactly"*

### L1–L5 — ProfiLux locks

- **L1** — ProfiLux is the unified object across candidate dashboard, admin review, ATS/recruiting, and client submission. No parallel candidate records.
- **L2** — Candidate-authored core is canonical. Recruiter overlay (notes, assessments, internal flags) is additive, never replacing. Client-shared version is a render of the same data.
- **L3** — Minimum ProfiLux satisfies three constraints simultaneously: sufficient for Mo's admission review; sufficient for the recruiting loop to operate (search, shortlist, basic match signals); sufficient to be presentable to a client if Mo chose to submit early.
- **L4** — Readiness ProfiLux is the application + matching threshold. Above readiness, candidate is fully functional in the recruiting loop and self-serve application is meaningful.
- **L5** — Admin candidate surface is recruiting-loop-shaped. Pending review is one entry; the same surface family supports search, shortlist, profile management, client submission.

### M6 — Minimum ProfiLux for admission

Required fields before submission for Mo's review:

- **Identity:** full name (first, last); city + country; primary email (OAuth-confirmed)
- **Professional core:** current/most-recent role (brand + title + start date, end date if not current); one additional prior role (brand + title + dates); total years of experience; seniority level (per JOBLUX 9-level vocabulary, aligned with tier)
- **Luxury fit:** primary sector (one of 8 locked sectors); sub-sector or specialization (per 35 subsectors / 28 specializations vocabulary)
- **Capability:** at least one language with proficiency
- **Authenticity:** CV file uploaded (prefill source, retained as evidence); user confirmation that the prefilled ProfiLux is accurate
- **Phone:** OPTIONAL at M6

CV alone does not create a candidate. **User confirmation of M6 is the act that creates a Pending Candidate.**

### Phone policy

- **Optional at M6 (admission).**
- **Required at readiness, before any client submission.**

Excluded from M6 (deferred to readiness): salary expectations, availability, education detail, skills/clienteling/product categories, photo, bio, portfolio, references, sharing settings.

---

*This document replaces: JOBLUX_MASTER_DOC_v1.docx, JOBLUX_Consolidated_System_v1_1.docx, JOBLUX_CURRENT_STATE_v1_1.docx, JOBLUX_SYSTEM_BLUEPRINT_v1.docx, JOBLUX_Architecture_Blueprint_v2.docx, Claude_build_charter.docx, and all previous context/handoff files.*

*Update this file at the end of every session. Replace in project. One document, always current.*
