# WIKILUX ENGINE — DESIGN V1

Status: **DESIGN DRAFT — for Mo + GPT review. Not approved. No code yet.**
Date: 2026-06-08
Author context: produced by reading committed repo truth (main @ post-3383809), read-only.

---

## 0. Purpose & framing

This document specifies the **final WikiLux generation engine**, not a one-off Baccarat test.
Baccarat is a future validation case, nothing more.

The mission, stated once:

> Transform `lib/luxai/regenerateBrand.ts` from
> **`Brand Name → LLM memory → page`**
> into
> **`Brand Name → Discovery → Qualification → Corpus → Reasoning → Page`**, with provenance, behind the existing Draft → Review → Publish workflow.

This is **not a reconstruction**. The output schema (16 sections), the page (BRAND-PAGE-V1), the review surface, the Haiku model, the provenance doctrine, and the publish workflow already exist. The single thing that changes is **the fuel**: the engine must reason over *fetched sources* instead of model memory.

This design is structured on the **6 LuxAI Core modules already locked in `docs/JOBLUX_STATE.md`**:
Source Discovery · Source Qualification · Reasoning Layer · Content Contract Adapter · Provenance Layer · Draft/Review Queue.
Brands is the **first consumer** of these shared modules.

---

## 1. Governing doctrine (non-negotiable, from STATE)

- **No source → no fact.** A generated factual claim about a real entity with no source is forbidden (free hallucination).
- **Reasoning is REQUIRED, extraction-only is RETIRED.** LuxAI behaves like a JOBLUX analyst: understand the mission, find the right sources, cross-reference, SELECT, prioritise, NORMALISE, synthesise — with provenance attached. Not a photocopier, not an ETL.
- **The information need drives the source.** Each section has a nature of information; the engine reasons about *which family of source* answers that need. Mo does not hand-map sources to sections.
- **Provenance form (locked Mo+GPT, Jun 8):** fiche-level `content_origin` (DB column); fact-level `source_url` + `source_ref` (in JSON, per fact/section).
- **Nothing auto-publishes.** Every output is a draft; human review gates publication.

---

## 2. Pipeline overview

```
Input: Brand Name (+ slug)
   │
   ▼
[1] SOURCE DISCOVERY      → determine the information needs of each section,
                            map each need to a family of sources, produce a
                            candidate source list (URLs)
   │
   ▼
[2] SOURCE QUALIFICATION  → rank/filter candidates, drop weak/irrelevant/
                            homonym/spam sources, keep an approved working set
   │
   ▼
[3] CORPUS BUILDER        → fetch the qualified sources, extract clean text,
                            assemble a structured corpus WITH provenance handles
   │
   ▼
[4] REASONING LAYER       → produce the 16 sections from the corpus ONLY;
                            a section with no supporting source is left empty,
                            never invented
   │
   ▼
[5] CONTENT CONTRACT      → shape the reasoning output into the exact JSON the
    ADAPTER                 page (BRAND-PAGE-V1 / buildBrandData) reads
   │
   ▼
[6] PROVENANCE LAYER      → attach content_origin (fiche) + source_url/source_ref
                            (per fact/section); write nothing unsourced
   │
   ▼
[7] DRAFT / REVIEW QUEUE  → persist as is_published=false / status=pending,
                            surface in the review card, await human decision
   │
   ▼
Publish (existing workflow, unchanged)
```

---

## 3. Module-by-module spec (with repo reality)

For each module: **role · input → output · what already exists · the gap · contract to next module.**

### [1] Source Discovery
- **Role:** given a brand + the known section needs, decide *what kinds of information* are required and *which families of sources* likely hold them, and emit a candidate source list.
- **In → Out:** `brandName` → `candidateSources[] { url, expected_for: [sections], family }`
- **Need → source-family map (reasoning target, not a hardcoded table):**
  | Section need | Source family |
  |---|---|
  | Founded / HQ / Ownership / key_facts | Wikidata, structured registries |
  | Heritage / history / founder | Wikipedia, official site, archives |
  | Leadership / creative_directors | official site, press releases, press |
  | Signature creations / market_position | official site, catalogues, trade press |
  | Culture / hiring_intelligence | employee reviews, interviews, HR press |
  | Career paths | careers pages, job postings, real profiles |
  | Signals | RSS, press, announcements (existing `signals` pipeline) |
- **Exists in repo:** `app/api/admin/luxai/key-facts/route.ts` already does a *narrow* discovery+qualification for ONE family (Wikidata): `wbsearchentities` resolution, walks candidates, verifies entity is a brand/org (anti-homonym via `instance_of`), rejects if none qualify. This is the **proof that discovery+qualification is feasible** — for one source family.
- **The gap:** no multi-family discovery; no mapping of section-needs → source-families; no candidate URL emission beyond Wikidata.
- **Contract to [2]:** a list of candidate sources with the sections each is expected to serve.

### [2] Source Qualification
- **Role:** rank candidates, drop weak/irrelevant/duplicate/homonym/low-trust sources, keep an approved working set.
- **In → Out:** `candidateSources[]` → `qualifiedSources[] { url, trust, family }`
- **Exists in repo:** the Wikidata anti-homonym verification in `key-facts` (org-label regex on `instance_of`, industry-claim check, "write NOTHING if none verify"). This is qualification logic — for Wikidata only.
- **The gap:** no general trust/ranking for web sources; no dedup; no per-family qualification rules.
- **PHASE-1 SIMPLIFICATION (Mo+GPT):** Discovery+Qualification can be **simulated** with a fixed approved set (Wikidata + Wikipedia + official site) to prove the Reasoning Layer first. Build the real Discovery/Qualification engine **only after** Reasoning is proven on real fetched sources.
- **Contract to [3]:** a qualified, deduplicated source set.

### [3] Corpus Builder
- **Role:** fetch the qualified sources, extract clean readable text, assemble a structured corpus that keeps each chunk tied to its origin.
- **In → Out:** `qualifiedSources[]` → `corpus { chunks: [{ text, source_url, source_ref, family }] }`
- **Exists in repo:** `app/api/assignments/import/url/route.ts` already fetches an external page (User-Agent, 10s timeout, structured-data extraction + text fallback). This is a **working page-fetch + extraction pattern to reuse** — not brand-specific, but the mechanics exist.
- **The gap:** no corpus assembly that preserves per-chunk provenance handles for downstream reasoning.
- **Contract to [4]:** a provenance-tagged corpus the reasoning prompt can cite.

### [4] Reasoning Layer
- **Role:** the analyst. Produce the 16 sections **from the corpus only**. Select, normalise, synthesise. Leave a section empty if the corpus does not support it. Never invent.
- **In → Out:** `corpus` → `reasonedSections { ...16 fields, each carrying which corpus chunk(s) support it }`
- **Exists in repo:** `lib/luxai/regenerateBrand.ts` — **this is the engine.** It already produces all 16 sections via Haiku (tagline, brand_dna, history[7-10], founder, founder_facts, key_facts, key_executives, creative_directors, careers, hiring_intelligence{values/culture/growth/pace/access}, quote, market_position, presence, facts, stock). Model already migrated to Haiku (`claude-haiku-4-5-20251001`) and cost/token logging to `luxai_history` exists.
- **The gap — THE core change:** today its prompt says *"Generate encyclopedic content for {brandName}"* with **no corpus injected** and **"ALL 16 fields MANDATORY"**. This forces memory-invention. It must become: *"Here is the corpus. Reason over it ONLY. Produce the schema. A field with no supporting source is omitted/empty — never fabricated."* I.e. swap the input (brandName → corpus) and relax "mandatory" to "sourced-or-empty".
- **Status note:** module is **orphaned (0 callers)** — STATE lists it P0-5 latent-unwired. Safe to modify; needs a new entry route to drive it.
- **Contract to [5]:** the 16 reasoned sections, each annotated with its supporting source(s).

### [5] Content Contract Adapter
- **Role:** shape the reasoning output into the **exact JSON the page reads**, so the page renders with no change.
- **In → Out:** `reasonedSections` → `content` object matching `buildBrandData()`.
- **Exists in repo (the contract is KNOWN):** `app/brands/[slug]/page.tsx → buildBrandData()` reads precisely: `hiring_intelligence`, `stock`, `key_executives`, `key_facts` (`[{label,value}]`, labels Founded/Headquarters/Ownership/Employees), `careers.paths` + `careers.prose`, `history[]`, `founder_name`/`founder`, `quote`, `brand_dna`, `founder_facts`, `signature_products[]`, `creative_directors[]`, `tagline`, `salaries`. `regenerateBrand`'s output already matches most of this shape.
- **The gap:** minor — reconcile field names where reasoning output and page contract differ (e.g. ensure `key_facts` stays the `[{label,value}]` ARRAY the page expects, not the OBJECT form retired in P1).
- **Contract to [6]:** a page-valid `content` object.

### [6] Provenance Layer
- **Role:** attach origin so nothing unsourced is written and everything is auditable in admin (invisible to the public visitor).
- **In → Out:** `content` → `content` + provenance: fiche-level `content_origin` (DB column, NEW), fact-level `source_url`/`source_ref` inside each fact/section in JSON.
- **Exists in repo:** `key-facts` already stores `_sources` (Wikidata qid/url) + `_raw_facts` at the FICHE level. The **shape exists**, but at fiche level only, and there is **no `content_origin` column** on `wikilux_content` (confirmed: schema has none — this is the root cause the STATE names behind the purge).
- **The gap:** (a) add `content_origin` column (small migration); (b) move provenance from fiche-level to **per-fact** (`source_url`/`source_ref` on each key_fact / history entry / etc.), the form locked Jun 8.
- **Contract to [7]:** a fully provenance-stamped draft.

### [7] Draft / Review Queue
- **Role:** persist as unpublished pending draft, surface in the review card, await human decision. Nothing auto-publishes.
- **In → Out:** provenance-stamped `content` → row in `wikilux_content` (`is_published=false`, `status='pending'`) → visible in review surface.
- **Exists in repo (DONE):** `app/api/admin/luxai/wikilux-drafts/route.ts` + `.../[slug]/decision/route.ts` (approve/reject, admin-gated) — the v17 Brands review card. `key-facts` already writes `status=pending, is_published=false`. The whole Draft→Review→Publish workflow is built.
- **The gap:** none structurally — the new engine plugs into this existing surface.
- **Contract:** human review → publish via existing workflow (unchanged).

---

## 4. What already exists vs what must be built

| Module | Exists | Gap |
|---|---|---|
| 1 Discovery | Wikidata resolution+verify (`key-facts`) | multi-family discovery; need→family mapping |
| 2 Qualification | Wikidata anti-homonym (`key-facts`) | general web trust/rank/dedup (Phase-1: simulate) |
| 3 Corpus Builder | page fetch+extract (`import/url`) | provenance-tagged corpus assembly |
| 4 Reasoning | **`regenerateBrand.ts` (all 16 sections, Haiku)** | **swap input memory→corpus; sourced-or-empty** |
| 5 Contract Adapter | page contract known (`buildBrandData`) | minor field reconciliation |
| 6 Provenance | fiche-level `_sources` (`key-facts`) | `content_origin` column; per-fact provenance |
| 7 Draft/Review | **full workflow built (`wikilux-drafts`)** | none |

**Headline:** 2 of 7 stages are essentially done (Reasoning engine exists; Review workflow exists). The real build is **Corpus Builder + the input-swap in Reasoning + per-fact Provenance**. Discovery/Qualification can be simulated first.

---

## 5. Phased implementation (to be cut AFTER this design is approved)

- **Phase 1 — Prove Reasoning-from-corpus.** Discovery/Qualification SIMULATED (fixed set: Wikidata + Wikipedia + official site). Build Corpus Builder (fetch the fixed set → provenance-tagged corpus) + swap `regenerateBrand` input memory→corpus + sourced-or-empty. New admin test route drives it. Output: a draft. **Decision gate: is the corpus-fed page worthy of BRAND-PAGE-V1?** If no, stop — do not build Discovery.
- **Phase 2 — Provenance hardening.** `content_origin` column + per-fact `source_url`/`source_ref`.
- **Phase 3 — Real Discovery + Qualification.** Replace the simulated fixed set with the need→family discovery + qualification engine.
- **Phase 4 — Generalise** across brands; wire into v17; cutover.

Phase order enforces: **prove the reasoning before investing in autonomous source acquisition.**

---

## 6. Open decisions for Mo + GPT (before any code)

1. **Approve this 6-module design as the WikiLux engine reference** (or amend the structure).
2. **Confirm the doctrine guard:** section unsupported by corpus → **empty, never invented** (this is the honest test; a partial-but-sourced page is a true signal, not a failure).
3. **Confirm Phase 1 simulated source set** = Wikidata + Wikipedia + official site (URLs, fetched — not Mo-pasted text), reasoning proven before Discovery is built.
4. **Confirm scope discipline:** this is the WikiLux lane, distinct from the now-closed P2-A; one phase → review → stop.

No code is written until this design is approved.
