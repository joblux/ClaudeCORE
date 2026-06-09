# JOBLUX HANDOFF — 2026-06-10

## 🔥 SNAPSHOT
- **No blockers.** Remote main @f599220, working tree clean (`.claude/settings.local.json` untracked by design). `APIFY_TOKEN` set in `.env.local` (Mo, never committed).
- Active focus: **LuxAI Acquisition Layer — DISCOVERY LAYER VALIDATED.** Provider-abstracted retrieval shipped, 2 real read-runs PASS, real business signal found (Louis Ferla CEO Cartier). Next = Haiku triage.
- Next 3: (1) Haiku triage cadrage (incl. date extraction from page) — Mo+GPT approval BEFORE any Code prompt; (2) triage slice build + read-only validation on the 43-discovery Cartier v2 corpus; (3) Review Queue → Mo Review → Publish wiring (no auto-publish).

## 1. WHAT WAS COMPLETED TODAY
- **V1-C2 First Production Retrieval Provider SHIPPED** @35a3fb7 — neutral `DiscoveryProvider` seam (`lib/luxai/discovery-provider.ts`); Apify CONFINED to `lib/luxai/providers/apify-provider.ts` (sole apify-client/APIFY_TOKEN file, sequential FREE-plan, per-query errors degrade to `[]`); `runDiscovery()` injectable BESIDE preserved `runDiscoveryDryRun()`; mechanical validation (social-noise / freshness on RESULT date / dedup). Decisions D1 `access?: Access` on Discovery = YES, D2 entry point = library-only (Mo+GPT). No DB, no routes, no triage.
- **Scope control SHIPPED** @9a1c3aa — `opts.sources?: string[]` on `runDiscovery` with unknown-name throw guard; enables bounded read-runs (66 → 18 queries for 1 brand).
- **Query scoping SHIPPED** @f599220 — every discovery query now `site:{entry}`-scoped; placeholder-entry sources (`{brand_domain}`) excluded from pool (20 eligible × 3 intents); generic QUERY_PATTERN no longer used by runner; `{year}` dropped from queries (learning c). Root-cause fix, Variante B (Mo+GPT GO).
- **Read-run v1 Cartier** (6 src / 18 q / 290 s, read-only, throwaway script): 21 discoveries incl. REAL signal **Louis Ferla appointed CEO of Cartier** (Richemont newsroom). Revealed: off-domain leak (ft.com under FashionNetwork), fictional source attribution (unscoped duplicate queries), `{brand_domain}` placeholder root-caused (Brand official sites 0 hits), 21/21 null dates.
- **Read-run v2 post-scoping** (5 src / 15 q / 188 s): **43 discoveries, off_domain = 0 PASS**, attribution real (each source fills own quota), yield 2× with fewer queries. Scoping validated on live data. Artifacts: /tmp/readrun-cartier{,-v2}.json (session-local).
- **Decisions locked (Mo+GPT):** dates → Haiku triage, NOT provider (Discovery stays retrieval-only; triage reads the page); hub-page noise (Investors/Careers) + sibling-brand hits (Van Cleef on Cartier query) → triage's job; V1-C2 framed as "First Production Retrieval Provider", never "Apify integration" (provider = replaceable commodity; durable contract = Source Pack → Discovery Object → Queue → Analysis).

## 2. STILL OPEN — ACTIVE ONLY
- `538e9008` — LuxAI Acquisition: Discovery Layer validated; NEXT = Haiku triage cadrage — luxai / high / open
- `14650938` — WikiLux corpus reconstruction (engine parent lane, pursued through Acquisition Layer) — luxai / high / open
- `427e69b1` — F-wikilux-build-prototype: route live, run Baccarat + judge, then persist-draft — luxai / high / open
- `26ac46b4` — F-brand-official-domain-resolution: `{brand_domain}` placeholder, excluded from pool; needs brand→domain map — luxai / low / parked (NEW)

## 3. NEXT 3 STEPS
1. **Haiku triage cadrage** — luxury/brand/type/importance/dup + DATE EXTRACTION from page; consumes Discovery objects (never provider JSON); queue-only, no auto-publish. Full cadrage → GPT review → Mo GO before any Code prompt.
2. **Triage slice build + validation** — read-only run against the Cartier v2 corpus (43 discoveries) as acceptance set; observe Four Seasons apex inference + walled flags along the way.
3. **Review Queue → Mo Review → Publish** wiring (fixed flow: LuxAI discovers, Mo decides, JOBLUX publishes).

## 4. NEXT SESSION START
- **Focus:** LuxAI Acquisition — first intelligence layer (Haiku triage) on top of the validated Discovery Layer.
- **IN:** triage cadrage (fields, date-from-page, dup rule, importance scale, cost guard, Discovery-only input contract); GPT review; then slice.
- **OUT:** any publish/queue write before triage is validated; provider changes (Firecrawl/web-search = future providers, not now); brand_domain resolution (26ac46b4 parked); persist-draft (427e69b1, separate lane).

— Claude AI
