# LuxAI Acquisition Probe — 2026-06-09 (12-brand, Apify-only)

Yield/noise measurement run for the LuxAI Acquisition Layer, before any
implementation. Companion to
[`LUXAI_ACQUISITION_LAYER_V1_DECISION_NOTE.md`](./LUXAI_ACQUISITION_LAYER_V1_DECISION_NOTE.md).

**Status:** evidence record. Read-only. No DB write, no publish, no scheduled
actor, no vendor-lock-in decision, no implementation. STATE not rotated.

## Objective

Measure whether one connected sensor (Apify) can act as a real luxury **detection
radar** — finding fresh, useful signals without being handed URLs — and quantify
yield vs. noise before committing to a V1 build.

## Method

- Sensor: **Apify `apify/rag-web-browser` only** (Google search + full-browser
  scrape → clean Markdown). No Firecrawl/Tavily/Exa.
- One query per brand combining the 3 signal types (executive moves / events /
  market-financial), `maxResults` 2 per query.
- Each returned page read for: brand, signal type, extracted facts, freshness,
  extractability, duplicate status, noise.
- All read-only via the connected Apify MCP. No persistence.

## Brands tested (12, contrasted)

Baccarat · Cartier · Alaïa · Aman · Louis Vuitton · Gucci · Hermès · Chanel ·
Bulgari · Four Seasons · Rolex · Tiffany · Dior · Loro Piana · Burberry ·
Saint Laurent. (Core 12 + overflow from the 4-brand pilot — heritage, group
maisons, fashion, jewellery, watches, hospitality.)

## Signal types tested

Executive moves · Events / expansion · Market-financial signals.

## Results

| # | Metric | Value |
|---|---|---|
| 1 | Raw results | ~24 (2 × 12 brands) |
| 2 | Retained useful signals | **14** |
| 3 | Duplicates detected | 3 clusters (Baccarat ×2, Alaïa ×3, Bulgari ×2) |
| 4 | Rejected noise | 5 (Instagram ×2, YouTube ×2, Facebook ×1) |
| 5 | Failed / blocked extractions | 6 (see below) |
| 6 | Est. cost / duration per run | ~8–12 s per query; ~$0.01–0.02 per brand (rag-web-browser bills per scraped result) |
| 7 | Est. cost per retained signal | ≈ $0.015–0.03 |

### Sample fresh signals detected (all 2026, none from model memory)

- Baccarat — Thais Roda CEO North America (Apr 2026); Laurence Nicolas Global CEO
- Cartier — Richemont FY25 results (€21.4bn group, Jewellery +8%); Louis Ferla CEO Cartier to SEC
- Alaïa — Pieter Mulier exits to Versace (Jul 1 2026); CEO Myriam Serrano (3 sources)
- Aman / Four Seasons — detailed 2026 opening pipelines (official newsrooms)
- Bulgari — Laura Burdese CEO eff. Jul 2026, succeeds Babin (BoF + National Jeweler)
- Chanel — return to growth, op profit $4.7bn, Blazy designs (Reuters snippet)
- Burberry — FY26 full results (£2.42bn, return to profit, CEO Schulman; newsroom full text)
- Dior — Jonathan Anderson creative director, Summer 2026 (LVMH)
- Loro Piana — SS26 campaign (LVMH newsroom, full)
- Rolex — Watches & Wonders 2026 (official newsroom, full)
- Saint Laurent — SS26 show, Vaccarello (WWD)

### Failed / blocked extractions (item 5)

| Source | Status | Nature |
|---|---|---|
| Reuters (Gucci, Chanel) | 401 | premium walled (snippet still carried the fact) |
| Chanel official | 403 | walled |
| WWD (Tiffany query) | 0 items | empty search |
| Reddit (Dior) | 403 | blocked |
| Drapers (Alaïa) | 403 | walled |
| Hermès finance | PDF skipped | rag-web-browser does not render PDF |

## Source quality breakdown (item 8)

- **High reliability, full extraction (the gold vein):** official newsrooms
  (Richemont, Burberry, Four Seasons, Rolex, LVMH, Aman) + trade press (BoF,
  National Jeweler, FashionNetwork, Formes de Luxe, Heidrick, WWD when open).
- **Snippet-only:** Reuters, Vogue Business — walled, but the Google snippet
  already carried the core fact.
- **Noise:** Instagram / YouTube / Facebook posts — detectable, rejectable at
  triage (importance ≤ 2).
- **Technical gap:** PDFs (Hermès finance, many financial reports) are not
  extracted by rag-web-browser → a PDF parser is needed in the extraction layer.

## Lessons learned

1. **Discovery works.** Apify detected fresh 2026 signals for every one of the 12
   brands without being handed a URL. Zero empty brands. The single connected
   sensor is enough to start.
2. **Yield ≈ 58%** raw→useful, with clean, filterable duplicates and noise.
3. **Two technical gaps for V1:** a PDF parser (financial reports) and
   social-noise filtering (Instagram/YouTube/Facebook) at the Haiku triage step.
4. **Newsrooms + open trade press = the reliable feed.** Reuters/Vogue stay
   snippet-only — not a blocker.
5. **The strong-model split is visible in the data:** the importance-9 items
   (group results, creative-director exits, opening pipelines) are exactly the
   ones needing synthesis/contradiction handling — not Haiku alone. Simple
   appointments fill from Haiku. This is the concrete evidence behind the
   doctrine-candidate model split.

## Recommendation

**A minimal V1 is justified.** Build, in order, behind Mo's gate (not started
here): Source Registry (the ~10 newsrooms + trade-press sources that returned
full text) → Discovery Runner (the per-brand×signal query, already proven) →
Haiku triage (luxury/brand/type/importance/dup, with social-noise filter) →
Command Center queue. Sensor stays Apify-only; add Tavily/Exa/Firecrawl only if a
concrete gap appears. Add a PDF parser to the extraction path.

## Explicit limits

Read-only · no DB write · no publish · no scheduled actor · no vendor-lock-in
decision · no implementation. Costs are estimates, not billed figures. STATE not
rotated. Doctrine unchanged.
