# LuxAI Acquisition V1-A — Spec (Source Registry + Discovery Runner, read-only)

**Status: PROPOSED — read-only planning spec. NOT implemented.**

Execution spec for the first slice of the LuxAI Acquisition Layer. Derived from
[`LUXAI_ACQUISITION_LAYER_V1_DECISION_NOTE.md`](./LUXAI_ACQUISITION_LAYER_V1_DECISION_NOTE.md)
(architecture) and [`LUXAI_ACQUISITION_PROBE_2026-06-09.md`](./LUXAI_ACQUISITION_PROBE_2026-06-09.md)
(yield evidence, remote `dce079c`). This is a specification, not a new strategy
manifesto — it defines exactly what V1-A is and what it deliberately is not.

V1-A covers only the first two of the five functions (Sensors → triage → strong
model → review → surfaces): the **Source Registry** (what we watch) and the
**Discovery Runner** (how we find candidates). Triage, synthesis, queue, and
publish are out of scope.

---

## 1. Source Registry — definition

A declarative list of the sources LuxAI is allowed to discover from, with the
metadata the runner needs to choose and rate them. In V1-A it is a
**specification of the shape**, not a built table — it describes the fields a
future registry will hold.

Proposed record shape (one row per source):

| Field | Meaning | Example |
|---|---|---|
| `name` | human label | "Richemont Newsroom" |
| `type` | source category (see §2) | `parent_newsroom` |
| `entry` | how the runner reaches it | URL root or search query template |
| `extraction_path` | lightest viable path | `direct_html` / `search` / `pdf` (gap) |
| `access` | observed reachability (probe vocabulary) | `direct_open` / `search_open` / `snippet_first` / `premium_or_blocked` |
| `trust` | reliability rank | `primary` / `secondary` / `tertiary` |
| `feeds` | which JOBLUX surfaces it can serve | `[signals, brands, market_reports, events, hiring]` |
| `cadence` | how often it should be checked (see §5) | `daily` / `weekly` / `manual` |
| `notes` | caveats | "PDF reports not yet parseable" |

The registry is the **acquisition map of the Command Center** — but in V1-A it
exists only as this spec, to be reviewed before any table is created.

---

## 2. Initial source categories + candidate sources

Categories (from the architecture note, narrowed to what the probe actually
proved reachable):

- **`parent_newsroom`** — group press rooms. Probe-proven full extraction.
  Candidates: Richemont, LVMH, Kering, Four Seasons, Aman, Rolex newsrooms.
- **`trade_press_open`** — luxury/business press that returned open full text.
  Candidates: FashionNetwork, National Jeweler, Formes de Luxe, Luxury Daily,
  Heidrick interviews. **BoF / WWD are opportunistic only:** use only when full
  extracted text is available; otherwise snippet/corroboration only. They are
  NOT stable primary feeds.
- **`brand_official`** — maison sites/newsrooms. Brand-dependent; many walled
  (Chanel 403, Baccarat 403). Keep as `snippet_first` unless a brand proves open.
- **`press_wire`** — GlobeNewswire / PR Newswire (declared, not yet probed).
- **`filing`** — SEC EDGAR / annual reports (declared; PDF gap noted).
- **`encyclopedic`** — Wikipedia / Wikidata (always-open backbone; from the
  Source Catalog).

Snippet-only / not a primary feed: Reuters, Vogue Business, FT, Bloomberg —
recorded for corroboration, never as the feed the runner depends on.

---

## 3. Discovery Runner — rules (spec only, no runner built)

What a future read-only runner would do, defined as behaviour, not code:

1. For each priority brand × signal type, build a query from the registry entry.
2. Send it to the sensor (Apify `rag-web-browser` — the only connected sensor).
3. Collect candidate results: URL + source + extracted Markdown.
4. Tag each with the registry `type`, `access`, `trust`.
5. Mark obvious noise (social domains) and likely duplicates — **flagging only**,
   no model call in V1-A.
6. Emit a structured candidate list (the §6 output contract). **No persistence,
   no triage, no write.**

Rules carried from the probe:
- Lightest extraction path first; never force a walled domain.
- Social posts (Instagram/YouTube/Facebook) are noise — flag, don't keep.
- PDFs are a known gap — flag `pdf_unparsed`, do not fail the run.
- Snippet-only sources contribute corroboration, not primary feed.

---

## 4. Query patterns

Per brand×signal, the pattern proven in the probe:

```
{brand} {year} {signal_intent}
```

- executive moves → `{brand} {year} executive appointment OR CEO OR creative director`
- events/expansion → `{brand} {year} opening OR show OR event OR expansion`
- market-financial → `{brand} {year} results OR sales OR revenue`

Newsroom-scoped variant (for `parent_newsroom` / `brand_official`):

```
site:{newsroom_domain} {brand} {signal_intent}
```

`maxResults` small (2–3) per query, as in the probe.

---

## 5. Frequency / cadence proposal

Cadence is a **field in the spec**, not a scheduler (no scheduled actor in V1-A):

- `parent_newsroom`, `trade_press_open` → **daily** candidate (highest signal yield).
- `brand_official`, `press_wire` → **weekly**.
- `filing` → **manual / quarterly** (earnings cycle; PDF gap unresolved).
- `encyclopedic` → **manual** (stable; pulled on demand for backbone facts).

These are proposed defaults for review — V1-A does not schedule anything.

---

## 6. Output contract for a future read-only runner

The candidate-list shape the runner would emit (consumed later by the triage
slice — NOT built here):

```
{
  brand, signal_type,
  detected_url, source_name, source_type,
  access, trust,
  extracted_facts,           // raw text / markdown excerpt
  freshness_hint,            // published date if available
  duplicate_risk,            // flag only, no model
  noise_flag,                // social/irrelevant
  extraction_status          // ok / pdf_unparsed / blocked
}
```

No `importance`, no `destination`, no synthesis — those belong to the triage
(Haiku) slice, explicitly out of V1-A.

---

## 7. Explicit non-goals (V1-A does NOT do)

- No DB table, no schema, no migration.
- No route, no API endpoint.
- No Apify execution: **V1-A does not execute Apify. V1-C may execute Apify in
  read-only mode.** Apify is NOT excluded from the future runner — it is the
  connected sensor; V1-A only specifies the runner rather than running it.
- No Haiku call, no triage, no importance scoring.
- No Command Center write, no queue integration.
- No publish, no auto-publish.
- No scheduled actor.
- No Tavily/Exa/Firecrawl — Apify-only assumption holds.
- No CLAUDE.md change. No STATE rotation (unless Mo asks).
- No vendor-lock-in decision.

---

## 8. What comes after V1-A (named, not started)

V1-B = build the Source Registry as a declarative artifact. **Implementation form
(DB table vs. typed module) is explicitly UNDECIDED — it is a V1-B decision, not
a default.** Do not assume a DB table by reflex. V1-C = the read-only Discovery Runner. Triage (Haiku),
strong-model synthesis, and Command Center queue are later, separate, gated
slices. Each waits for Mo's gate and GPT approval before any Code prompt.
