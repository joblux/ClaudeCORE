# WIKILUX ENGINE — DESIGN V2

Status: **DESIGN DRAFT — for Mo + GPT review. Not approved. No code yet.**
Date: 2026-06-08
Supersedes: WIKILUX_ENGINE_DESIGN_V1.md (same 6-module architecture; V2 recentres on the Reasoning Layer, demotes the "simulated proof" phase, and reframes the mission as an analyst building a brand dossier from real sources).
Source of truth: produced by reading committed repo truth (main @ post-3383809), read-only.

---

## 0. Mission (single sentence)

> **LuxAI acts as a luxury-industry analyst who builds a brand dossier from real sources** — it understands what each part of the page needs to know, finds and weighs the right sources, resolves contradictions, synthesises, attaches provenance, and fills the BRAND-PAGE-V1 contract. It never invents.

This is the whole point of the word *intelligent* in LuxAI. The engine is not an ETL that maps "field X ← source Y" by hand, and it is not a memory generator that writes plausible prose from nothing. It is an analyst.

The build is **not a reconstruction**. The 16-section output schema, the page (BRAND-PAGE-V1), the review surface, the Haiku model, the provenance doctrine, and the Draft→Review→Publish workflow already exist. The one thing that changes: the engine **reasons over fetched real sources** instead of model memory.

Baccarat (and later Chanel, Rolex, Hermès, Dior, Berluti…) are validation cases. The subject of this document is the **engine**, not any one brand.

---

## 1. Governing doctrine (from STATE, non-negotiable)

- **No source → no fact.** A generated factual claim about a real entity with no source is forbidden.
- **Reasoning is REQUIRED; extraction-only is RETIRED.** Understand the mission, find the right sources, cross-reference, SELECT, prioritise, NORMALISE, synthesise — with provenance. A brain, not a photocopier.
- **The information need drives the source.** Each section has a nature of information; the engine reasons about which family of source answers it. Mo does not hand-map sources to sections, and Mo does not pre-supply the sources per brand at scale (180+ brands — Mo is not WikiLux's human search engine).
- **Provenance form (locked Mo+GPT, Jun 8):** fiche-level `content_origin`; fact-level `source_url` + `source_ref`. Tracked in admin, invisible to the public visitor.
- **Nothing auto-publishes.** Every output is a draft; human review gates publication.
- **Empty-not-invented is a *consequence*, not a feature:** if the analyst finds nothing credible for a section, it writes nothing there. That is all — not a design pillar, just the doctrine applied.

---

## 2. The Reasoning Layer — the heart of the engine (expanded)

This is the module the rest of the system serves. It is specified here first and in most depth, because it is the engine's intelligence.

**Behaviour expected of the analyst, end to end:**

1. **Understand the information need.** For each part of the brand dossier (heritage, founder, leadership, signature creations, market position, work culture, career paths, key facts, signals), the analyst knows *what kind of fact* it requires — a date, a name, a structured attribute, a qualitative read, a trajectory.
2. **Determine which sources are relevant** to that need. Structured registries for hard attributes; encyclopaedic + official sources for history and identity; press and official communications for leadership and creations; employee/interview material for culture; careers pages and real postings for paths; news/RSS for signals. The analyst reasons this mapping — it is not handed a per-section URL list.
3. **Acquire and read** the relevant sources (via the Corpus Builder).
4. **Arbitrate between contradictory sources.** When two sources disagree (founding year, ownership after an acquisition, a contested attribution), the analyst weighs them — recency, authority, specificity — and chooses, rather than averaging blindly or picking the first hit.
5. **Prioritise the most reliable.** Official/primary sources outrank aggregators; structured data outranks prose for hard attributes; a dated press release outranks an undated blog.
6. **Normalise.** Render a sourced raw value into the user-useful value (the locked doctrine example: Wikidata "cité du Retiro" → display "Paris, France"), keeping the raw value + source as provenance. This is normalisation, not invention.
7. **Select & synthesise.** Choose what is relevant and material for a luxury-careers audience, compress to the page's character constraints, write in the encyclopaedic factual tone — every claim traceable to a chunk of the corpus.
8. **Attach provenance** to each fact/section (`source_url`/`source_ref`), and the fiche-level `content_origin`.
9. **Fill the BRAND-PAGE-V1 contract** exactly, so the page renders unchanged.
10. **Leave empty what the corpus does not support.** No fabrication to satisfy a schema slot.

**What the analyst is NOT allowed to do:** assert a fact no source supports; copy a field blindly without judgement; publish; merge contradictory data without choosing; fabricate a quote, a salary, a name, or a date.

**Repo reality of this module:** `lib/luxai/regenerateBrand.ts` already produces all 16 sections via Haiku (model already migrated to `claude-haiku-4-5-20251001`; token/cost logging to `luxai_history` exists). It is **the engine** and it is **orphaned (0 callers, STATE: P0-5 latent-unwired)** — safe to evolve. **The core change:** its prompt today says *"Generate encyclopedic content for {brandName}"* with **no corpus** and **"ALL 16 fields MANDATORY"** — which forces memory-invention. It must become an analyst prompt that reasons over an injected, provenance-tagged corpus and fills only what the corpus supports.

---

## 3. The 6 Core modules (architecture — unchanged from V1)

Locked LuxAI Core modules, Brands as first consumer:
**Source Discovery · Source Qualification · Reasoning Layer · Content Contract Adapter · Provenance Layer · Draft/Review Queue.**

```
Brand Name
   │
   ▼
[1] SOURCE DISCOVERY      reason from section-needs → families of sources → candidate sources
   ▼
[2] SOURCE QUALIFICATION  rank / filter / dedup / anti-homonym → qualified working set
   ▼
[3] CORPUS BUILDER        fetch + extract clean text → provenance-tagged corpus
   ▼
[4] REASONING LAYER       the analyst (section 2) → 16 sections, each tied to its source(s)
   ▼
[5] CONTENT CONTRACT      shape into the exact JSON buildBrandData() reads
   ▼
[6] PROVENANCE LAYER      content_origin (fiche) + source_url/source_ref (per fact)
   ▼
[7] DRAFT / REVIEW QUEUE  is_published=false / pending → review card → human decision → publish
```

### Module reality (what exists / the gap)

| Module | Exists in repo | Gap |
|---|---|---|
| 1 Discovery | Wikidata resolve+verify in `key-facts` (one family) | multi-family discovery; section-need → source-family reasoning |
| 2 Qualification | Wikidata anti-homonym in `key-facts` | general web trust / ranking / dedup |
| 3 Corpus Builder | page fetch+extract pattern in `import/url` | provenance-tagged corpus assembly |
| 4 **Reasoning** | **`regenerateBrand.ts` — all 16 sections, Haiku** | **input memory→corpus; analyst behaviour (§2); sourced-or-empty** |
| 5 Contract Adapter | page contract known (`buildBrandData`) | minor field reconciliation (key_facts ARRAY, not OBJECT) |
| 6 Provenance | fiche-level `_sources` in `key-facts` | `content_origin` column; per-fact provenance |
| 7 Draft/Review | **full workflow built (`wikilux-drafts`)** | none |

**Headline:** the Reasoning engine and the Review workflow already exist. The real build is **Discovery + Qualification + Corpus Builder feeding the analyst**, plus the input-swap and per-fact provenance.

---

## 4. Implementation order (demoted from "proof phases" to a build sequence)

The architecture above is the target. The build is sequenced to surface the analyst's real output early — **without** turning the whole effort into a "controlled test" that proves something which won't exist in production.

- **Build the corpus path for real**, not a paste-box: the engine fetches its sources. (Reusing the `import/url` fetch pattern.)
- **Evolve `regenerateBrand` into the analyst** (§2): corpus-fed, provenance-attaching, sourced-or-empty.
- **Discovery/Qualification:** **LuxAI decides the source families according to the section's information need.** Implementation may begin with the most reliable families (structured + encyclopaedic + official), but this is **not a fixed list** — it is the analyst's own source-selection, which expands as it proves out. This is *not* "Mo prepares the sources".
- **Provenance hardening:** `content_origin` column + per-fact `source_url`/`source_ref`.
- **Generalise** across brands; wire into v17; cutover.

There is one natural checkpoint, stated without ceremony: **once the analyst produces a real dossier from real sources, Mo + GPT judge it against BRAND-PAGE-V1** and steer from there. That is review, not a gated "proof phase".

---

## 5. Decision

**Decision (Mo + GPT, Jun 8): V2 is the reference design for the WikiLux Engine.**

It carries:
- the 6-module architecture (§3),
- the Reasoning Layer behaviour spec (§2) as the definition of what "LuxAI reasons" means for Brands,
- the mission framing (§0): an analyst building a brand dossier from real sources — not a paste-box, not a memory generator,
- scope discipline: WikiLux lane, distinct from the now-closed P2-A; one build step → review → steer.

Implementation is cut from this reference.
