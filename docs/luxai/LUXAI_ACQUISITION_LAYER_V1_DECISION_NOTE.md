# LuxAI Acquisition Layer v1 — Architecture Decision Note

Status: **ACCEPTED IN PRINCIPLE (Mo + GPT, 2026-06-09) — held as PROPOSED /
DOCTRINE-CANDIDATE, NOT active doctrine.** Architecture framing is accepted; the
model-layer evolution is a candidate to be tested before it becomes doctrine. No
constitutional change to CLAUDE.md. The detection test has since been RUN
read-only (4-brand, then a 12-brand enlarged probe) — see
[`LUXAI_ACQUISITION_PROBE_2026-06-09.md`](./LUXAI_ACQUISITION_PROBE_2026-06-09.md).
Probe outcome: detection proven, minimal V1 justified. **No implementation
started; no Source Registry built; STATE not rotated.**

Companion reference (source map, secondary): `docs/WIKILUX_SOURCE_CATALOG_V1.md`
— extraction/source reference only, NOT the final acquisition strategy.

## Framing (locked by Mo + GPT, 2026-06-09)

> The radar is not the model. The radar is sensors + extraction + triage +
> synthesis + validation.

Changing Haiku for Sonnet/Opus/Gemini does NOT create a radar — no model has
real-time web access on its own; every model is a brain without sensors. The
capability gap is **around** the model (sensors + extraction), not inside it.

Consequence for doctrine: the `LuxAI generation: Haiku only` rule in CLAUDE.md
was written when LuxAI = simple generation. LuxAI is now an
acquisition/intelligence engine with two distinct model jobs (cheap triage vs.
high-value synthesis). The Haiku-only rule therefore needs Mo + GPT
reconsideration — flagged here, NOT changed in this note (constitutional change
is Mo's gate).

---

## The five-function architecture

### 1. Sensors — detect + extract public luxury-relevant information

Find candidate URLs and pull readable content. No single tool is "the" sensor;
each has a role. Tools in scope: Apify (browser extraction + scheduled actors),
Firecrawl (search + scrape + markdown/JSON), Tavily (real-time search for
agents), Exa (semantic/deep search), plus RSS, filings (SEC EDGAR), press wires
(GlobeNewswire / PR Newswire), parent-group newsrooms (LVMH / Kering / Richemont
/ Hermès).

Today: **only Apify is connected.** Firecrawl / Tavily / Exa require connectors
before they can be tested live.

Extraction path, lightest-first: RSS/API → direct HTML → PDF parser →
browser/Apify → abandon on login/paywall. Never force a walled source.

### 2. Haiku layer — cheap high-volume triage

Haiku receives extracted content and returns, per item:
- luxury / not luxury
- brand detected
- signal type (executive move / event / market-financial signal / brand update)
- duplicate check
- importance score
- suggested Command Center destination

This is repetitive classification at volume — exactly Haiku's strength. Using a
strong model here would waste cost for no gain.

### 3. Strong model layer — retained / high-value items ONLY

Used only on items Haiku retains:
- synthesis across multiple sources
- contradiction handling / arbitration
- brand-page writing
- market report drafting
- final editorial summary

This is where Haiku shows limits (nuance, contradiction, editorial quality).
Model choice (Sonnet vs. Opus-on-hard-cases) is a later cost/quality decision —
NOT settled here. Gated by the Haiku-only doctrine review above.

### 4. Mo review — Command Center

Nothing publishes automatically. All output lands in the existing queue
(Signals / Brands / Market Reports / Events / Hiring) for Mo to validate, reject,
edit, or publish. This honours the locked content_queue moderation gate.

---

## Flow

```
Sensors (Apify / Firecrawl / Tavily / Exa / RSS / wires / filings)
        ↓  candidate URL + extracted content
Haiku layer (cheap, high-volume)  → triage: luxury? brand? type? dup? importance? destination?
        ↓  retained items only
Strong model layer (few, expensive) → synthesis / contradiction / writing
        ↓
Mo review (Command Center queue) → validate / reject / edit / publish
        ↓
JOBLUX surfaces (Signals / Brands / Market Reports / Events / Hiring)
```

Principle: **a controlled luxury radar, not a general web crawler.** Lightest
extraction path per source; empty beats invented; provenance (source_url)
attached at the Haiku layer and carried through.

---

## Smallest real test (proposed — runs ONLY after this note is accepted)

Not the full 20-brand system. Prove the detection maillon first.

- **Brands:** 3 to 4 priority brands.
- **Signal types:** 2 to 3 (executive moves / events / market-financial signals).
- **Acquisition tools:** 1 to 2 max — **Apify** (connected today); a second only
  if Mo connects it first.
- **Output per detected item:**
  detected URL · source · brand · signal type · extracted facts ·
  Haiku-style classification (luxury?/importance/dup) ·
  strong-model synthesis need (yes/no) · Command Center destination.

Read-only. No DB write, no publish, no scheduled actor. Proves **detection**, not
page-filling.

---

## Decisions (Mo + GPT, 2026-06-09)

1. **Haiku-only doctrine — DO NOT change CLAUDE.md yet.** Recorded as
   doctrine-candidate: Haiku = high-volume triage / classification /
   deduplication / simple extraction; a stronger model = possible later for
   retained/high-value synthesis, contradiction handling, brand-page writing,
   market reports. **Must be tested before becoming doctrine.**
2. **Sensor set for first test — Apify ONLY.** No Firecrawl / Tavily / Exa or any
   second tool yet. The point is to prove the acquisition architecture, not
   compare vendors. If Apify proves insufficient, compare others afterward.
3. **Brand sample — Baccarat · Cartier · Alaïa · Aman.** Contrasted on purpose:
   heritage / group maison / editorial-discreet / hospitality (tests coverage
   beyond fashion-jewellery).

Test scope (authorised): read-only · no DB write · no publish · no scheduled
actor · no doctrine rewrite · no automation expansion. Output per detected item:
detected URL · source · brand · signal type · extracted facts · Haiku-style
classification · importance · duplicate risk · strong-model synthesis need
(yes/no) · suggested Command Center destination. Goal: prove whether LuxAI can
act as a controlled luxury radar — NOT fill brand pages yet.
