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

### LAST SHIPPED (May 1 2026 early — Matrix v1 utilities, inert)

- **c908fde** `feat(profilux): add Matrix v1 utilities (resolve, project, M6, completeness)` — 7 files under `lib/profilux/` (types, _m6Groups, resolveProfiLux, computeM6Eligible, computeProfileCompleteness, projectFor, index). 1045 insertions, 0 modifications elsewhere. Pure-as-possible: only `resolveProfiLux` touches the DB (single `.maybeSingle()`); compute and project utilities are pure functions. Type-checked clean. Pushed to `origin/main`. **Inert at runtime — no route consumes the utilities yet.**

- **Visual baseline locked for ProfiLux rebuild** (not a commit — captured here): GPT-approved storyboard direction (8.7/10) becomes the visual reference for any future tunnel/editor/dashboard work. ProfiLux = native premium extension of the candidate dashboard, not a bolted-on tool. DNA preserved (palette, cards, typography, spacing). Elevated execution (top step rail, right live preview rail, refined completion ring, luxury microcopy, calmer hierarchy). Avoid: generic form labels, crowded boxes, bright CTA spam, recruiter SaaS vibes.

- **Copy framing locked** for any product-facing surface build:
  - G1: prestige language at build time ("ProfiLux Passport," "Match Ready," "Executive Ready," "Unlock discreet opportunities," "We extracted your career foundations," ATS one-line differentiators)
  - G2: no quick-start mode in v1 — parked as v2
  - G3: only post-M6 reward microstate in v1 ("Visible to luxury houses · in private matching" + matching-assignment count if real); other reward moments parked
  - Executive-presence guardrail: every copy/microstate decision reads as "building executive presence, not filling a profile"

- **Admin direction approved as-is** — light SaaS shell stays, no redesign. Future polish (typography, spacing, ATS row signals) parked behind candidate-side ProfiLux catch-up. Hard rule: admin must not outshine member experience.

### CURRENT STEP — strict order, no skip, no resequence from broader ledger

**Path C item 1 sub-task 1 CLOSED** (utilities). Phase 2 — route migrations — is now active. Each migration: read-only audit → plan → GPT review → Code prompt → review → commit → push. One defect, one deploy, verify before next.

1. **Phase 2.1 — Migrate `/api/profilux` GET to Matrix v1** *(ledger `0c04c8b9`)* — refactor GET handler to return `projectFor(resolveProfiLux(memberId, supabase), 'editor')`. The 150-line route currently reads from frozen-out standalone `profilux` table at lines 17–21. After migration: reads from `members.*` via the resolver. No data migration of the 3 dormant `profilux` rows. No UI changes.

2. **Phase 2.2 — Migrate `/api/profilux` POST to Matrix v1** *(ledger `4397dd97`)* — gated on 2.1. Refactor POST to write `members.*` flat columns (NOT the standalone `profilux` table). After write: call `computeProfileCompleteness(resolveProfiLux(memberId))` and persist to `members.profile_completeness`. Lines 134–144 are the current frozen-out write target.

3. **Phase 2.3 — Align `/api/members/me`** *(ledger `081f3beb`)* — gated on 2.2. Closes F-members-me-incomplete. 25-line route currently selects 12 fields, none are L3. Add `profile_completeness`, `m6_confirmed_at`, `cv_url`, `cv_parsed_at`. Optionally use `projectFor(view, 'dashboard')` if the surface fits.

**Phase 3 — Wire cv-parse to UI** *(ledger `3a781f8b`, parked)* — gated on Phase 2 complete. Add Parse trigger in `/dashboard/candidate/profilux` flow. Parse output writes L1 only. User-confirmed prefill goes through migrated L2 edit endpoints. No direct `members.*` or `cv_parsed_data` reads in UI.

**Phase 4 — Premium ProfiLux tunnel + editor rebuild** *(ledger `8f82b3ac`, parked)* — gated on Phase 3. Visual baseline + copy framing + executive-presence guardrail all locked. 11-screen target.

**Phase 5 — Admin polish** *(ledger `35469863`, parked)* — gated on Phase 4 candidate-side landing first.

### DO NOT

- Touch cv-parse route again unless a new bug surfaces (currently green in prod).
- Deviate from `docs/PROFILUX_MATRIX_V1.md` without updating the spec first (per its §12.2).
- Use Hélène BILLARD as fixture (consent unconfirmed, blocked permanently).
- Read `members.*` or `cv_parsed_data` directly from any UI surface for ProfiLux fields — go through `projectFor`.
- Implement L1 → L2 silent writes from any code path.
- Migrate the 3 dormant `profilux` standalone rows during Phase 2 — data migration is post-v1 cleanup.
- Wire cv-parse to UI before Phase 2 lands.
- Touch `/api/profilux/reset-link` during Phase 2 — sharing UX rebuild is a separate post-migration concern.
- Refactor legacy `calculateProfileCompleteness` in `app/api/members/profile/route.ts` during Phase 2 — separate commit after Phase 2.3 lands. Per Mo decision C5.
- Resequence backlog from broader ledger.
- Build any product-facing surface (tunnel, editor, dashboard, admin) without first read-only inspecting the live components per the visual guardrail.
- Drift from the executive-presence guardrail in any copy or microstate.

### SESSION NOTE (May 1 2026 — utilities shipped + visual baseline locked)

- Two artifacts produced and validated by GPT this session: (1) three-mask projection preview, (2) 11-screen journey storyboard scoring 8.7/10. Both treated as working alignment, not committed to repo.
- Live JOBLUX vocabulary captured via read-only audit before any visual was drawn — preserved tunnel chrome (tab steps + sidebar + circular progress), card patterns, gold/green discipline, admin SaaS shell.
- Old ProfiLux UI declared visually outdated relative to the new direction. Old vocabulary preserved as patterns; field names and copy moved to Matrix v1 + GPT-locked framing.
- Discipline observation: the four-utility commit was inert by design and verified inert before push. The next phase touches live runtime — read-only audits remain mandatory before each migration prompt.

### PARKED (admin_tasks status=parked)

- `2847ac29` — Audit + migrate Anthropic model IDs across repo before Sonnet 4 retirement (deadline Jun 15 2026)
- `1e6162ea` — Replace inert RPC `submit_m6_admission` (incompatible with locked Apr-14 11-screen proto)
- `9b806aa3` — F-luxuryrecruiter — repo-wide purge of legacy domain
- `6aad3904` — Security review backlog — 37 remaining findings from ultra-review 2026-04-24
- `3a781f8b` — Phase 3 cv-parse UI wire (gated on Phase 2)
- `8f82b3ac` — Phase 4 premium ProfiLux tunnel + editor rebuild (gated on Phase 3)
- `35469863` — Phase 5 admin polish (gated on Phase 4)

### NEW FINDINGS LOGGED (out of immediate scope, surface separately)

*Carried forward from prior rotations. No new findings this session — utilities commit was clean.*

- **F-luxuryrecruiter** — see parked `9b806aa3`
- **F-magiclink-delivery** — Magic-link UI works, NextAuth token created, but SES delivery uncertain
- **F-pdfparse-anthropic-files** — Evaluate Anthropic Files API native PDF input as v2 parser path
- **F-admin_tasks-trigger** — `done` and `completed_at` derive trigger only fires via PATCH route, not direct UPDATE
- **F-cv_url-format-mixed** — 5/8 rows full-URL, 3/8 path-only; `normalizeCvStoragePath` handles both
- **F-public-slug-stub** — `app/[slug]/page.tsx` reads frozen-out `profilux` table; uses `.single()` not `.maybeSingle()`. Park alongside `profilux` table retirement (ledger `6aef236e`).
- **F-members-me-incomplete** — addressed by Phase 2.3 (`081f3beb`)
- **F-profilux-frozen-table-routes** — addressed by Phase 2.1 + 2.2 (`0c04c8b9` + `4397dd97`)

### LEDGER NOTE

- `c908fde` utilities commit: not a ledger ticket on its own — captured as LAST SHIPPED in this rotation.
- Storyboard validation: not a ledger ticket — visual baseline lock captured here.
- F-cv-parse-no-ui (`17a3534e`) CLOSED, superseded by Phase 3 (`3a781f8b`).
- Six new ledger rows added: `0c04c8b9`, `4397dd97`, `081f3beb` (open, Phase 2 sub-tasks); `3a781f8b`, `8f82b3ac`, `35469863` (parked, Phases 3–5).
- Outstanding parked items unchanged.

**Last updated:** May 1, 2026 (early — utilities shipped + visual baseline locked + Phase 2 sequenced)
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
