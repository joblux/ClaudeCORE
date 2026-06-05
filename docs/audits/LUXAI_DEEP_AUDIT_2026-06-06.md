# LuxAI Deep Audit — 2026-06-06

**Framing: Audit → Refactor → Align to doctrine 46fe190. NOT a rebuild.**
LuxAI already exists (since the site's founding) and generates brands, salaries, events,
signals, articles, interviews under the OLD spec. ~2 of 6 Core modules are already shared
(`lib/luxai-rules.ts` = Contract Adapter + Review Queue; `lib/duplicate-check.ts` = dedup).
The engine is ~60–80% there; the work is to align it to the new cahier des charges
(source-grounded reasoning + LuxAI Core architecture + BRAND-PAGE-V1 + User Journey First),
not to recreate it. Reference implementations to HARVEST, not rebuild: `key-facts` (Wikidata
discovery/qualification/provenance), `ingest-rss` (source-grounded reasoning), `enrich-card-intelligence`
(gated reasoning with model claims overridden).

This document is cartography only — no fixes proposed, no code, no reconciliation yet.

---

## Prioritised risk register

### P0 — dangerous paths / live-write / auto-publish / dead-wired triggers

- **P0-1 — Public page → live Sonnet write on cache miss.** `app/wikilux/[slug]/[lang]/page.tsx:96-113` can call Sonnet and upsert `wikilux_content` live, unauth, unthrottled.
  **STATUS: NEUTRALIZED today (verified by curl 2026-06-06).** All of `/wikilux/cartier`, `/wikilux/cartier/en`, nonexistent slug + `/en` → redirect (2 hops) to `https://joblux.com/holding` (http 200). The component is unreachable while the site sits behind the holding page. ⚠️ Neutralized by the HOLDING page, NOT by the `/wikilux→/brands` redirect. When holding is removed to open the site, re-verify the `/wikilux→/brands` redirect covers the `/[lang]` sub-path, or the hole reopens.
- **P0-2 — `ingest-rss` auto-publishes to live `signals`.** Confidence==high branch inserts `signals` with `is_published:true`, bypassing review. Reachable via autopilot `rss_ingestion` cron. `ingest-rss:212-270`, gate `:213-218`. **ACTIVE risk (cron-wired).**
- **P0-3 — `wikilux/generate` Sonnet LIVE upsert**, no status gate, no provenance, no auth; can overwrite published content. `wikilux/generate:88`.
- **P0-4 — `wikilux/regenerate` Sonnet delete-then-upsert to live** (destructive). `wikilux/regenerate:21,42`.
- **P0-5 — `lib/luxai/regenerateBrand.ts` re-publishes model facts to live** (preserves `approved`). Currently unwired but intact. `regenerateBrand.ts:11-19`.
- **P0-6 — `interview-detail` unreviewed live AI to candidate page**; fabricates named-brand processes/salary; only `if(!session)`. `interview-detail.ts:90-107`, `CareersClient.tsx:395`.
- **P0-7 — Vercel cron `0 3 1 * *` → `/api/cron/wikilux-refresh` returns 410** (monthly failing cron). `vercel.json`, `cron/wikilux-refresh:21`.
- **P0-8 — Autopilot fires dead tasks**: `signals→generate-signals` (410) and `brand_refresh→regenerate-wikilux` (410). `autopilot:61-71`.

### P1 — Brands schema divergence
- **P1-1 — `key_facts` OBJECT vs ARRAY.** Page reads ARRAY only (`brands/[slug]/page.tsx:88`, `getKeyFact`, labels Founded/Headquarters/Ownership/Employees). OBJECT emitters (`wikilux/generate`, `wikilux/regenerate`, via `lib/wikilux-prompt.ts:46`) render every key fact BLANK. **Canonical = ARRAY** (`key-facts:209`, `regenerateBrand:58`).
- **P1-2** — approve SIGNAL path stamps `content_origin:'ai'` even for feed-sourced queue items (`approve:500`).
- **P1-3** — event queue keys (`city`/`country`) vs `events` columns (`location_city`); remap exists only in approve route.

### P2 — duplicated model / parse / provenance
- No shared Anthropic client: ~19 call sites, SDK×11 / fetch×8, model literal repeated ~44×, two keys (`WIKILUX_API_KEY` vs `ANTHROPIC_API_KEY`).
- **Sonnet drift (violates Haiku-only):** `wikilux/generate|regenerate|translate`, `assignments/import/{url,enrich,paste}`, `admin/members/ai-review`, public `[lang]` page.
- JSON-strip copy-pasted ~10× (+ divergent greedy regex in `interview-detail`).
- `parseItems` duplicated (`ingest-rss` ≈ `ingest-events-rss`); platform-context 6-query block duplicated (article ≈ report).
- Provenance stamping scattered insert-time vs approve-time; `content_origin` set by NO generator (only at approve).
- Two cockpits with duplicated trigger wiring: default `/admin/luxai` = `LUXAICommandCenter.tsx`; `/admin/luxai/v17` = `CommandCenterV17.tsx`. The Brands draft-review card (this session) lives ONLY in V17.

### P3 — dead/orphaned + Core-extraction candidates
- `content.card_intelligence` orphaned (written by `enrich-card-intelligence`, read by zero components).
- §218 vs `joblux_generation`: article/report/interview/event drafts are unpublishable through approve (generator↔approver contradiction → queue rows that can never publish).
- Orphaned/unwired: `generate-signal` (singular, no trigger), `admin/luxai/key-facts` (no UI trigger — the engine seed route is unwired), `regenerateBrand.ts` (callers are 410).
- ~9 admin buttons (both cockpits + `admin/wikilux/page.tsx`) call 410 routes.
- **Core-extraction candidates:** one Anthropic wrapper (+ pinned Haiku model), one `extractJson`, one provenance stamper, one source-discovery interface (Wikidata/RSS currently siloed).

---

## Per-family flow summary

**Brands:** `key-facts` (Wikidata, ARRAY, draft, provenance ✅ — but UNWIRED) is the clean reference. `add-brand` (empty draft, clean). `wikilux/generate` + `wikilux/regenerate` (Sonnet, memory, LIVE, no provenance, OBJECT shape → renders blank) = P0. `regenerateBrand.ts` (Haiku, memory, re-publish, unwired) = P0 latent. `fill-brand-metadata` (Haiku, null-only flat cols, validated). `enrich-card-intelligence` (Haiku, gated, source_ref — but output orphaned).

**Signals/Events:** `ingest-rss` (Haiku, source-grounded — but AUTO-PUBLISHES = P0-2). `ingest-events-rss` (Haiku, queue, draft, needs queue→table remap). `generate-signal` (memory, orphaned). `generate-events` (memory, §218 dead-end). `generate-signals` (410, dead-wired).

**Articles/Interviews/Reports:** `generate-article`/`generate-report`/`generate-interview` (Haiku, queue draft, but §218 blocks joblux_generation → can't publish). `interview-detail` (Haiku SDK, NO table, returns live AI to candidate modal = P0-6, fabricates named-brand interviews/salary).

---

## First recommended remediation order (NOT started — for review)

1. **P0 first — neutralise unreviewed-AI-to-public paths.** P0-2 (RSS auto-publish, cron-wired = most active) and P0-3/P0-4 (Sonnet live writes). P0-1 already neutralized by holding (re-check before site opens). Disable dead cron/autopilot wiring (P0-7, P0-8).
2. **P1 — standardise Brands schema on ARRAY** `key_facts`; retire OBJECT prompt path.
3. **P2 — extract Core shared pieces:** one Anthropic wrapper (pin Haiku, kill Sonnet drift + 44 literals), one `extractJson`, one provenance stamper (set `content_origin` at write).
4. **P3 — Core architecture + first Brands slice:** align the Brands generator onto Core, reproduce the hand-made Cartier reference, BRAND-PAGE-V1-conformant, test on Bulgari first. Resolve §218 vs generators. Clean orphaned routes/buttons.

Reconciliation must follow Propose → Mo decides → Execute. This is several weeks of work. Do NOT start fixes before the order is approved.
