# WikiLux Source Catalog v1 — Operational Destinations

> **STATUS: Extraction/source reference only — NOT the final acquisition
> strategy.** The acquisition strategy lives in
> `docs/luxai/LUXAI_ACQUISITION_LAYER_V1_DECISION_NOTE.md` (architecture) and
> `docs/luxai/LUXAI_ACQUISITION_PROBE_2026-06-09.md` (yield evidence). This
> catalog is a useful per-section source map — keep it as a reference for which
> destinations feed which brand-page section, not as the system design.

Per-section destination map for the WikiLux brand dossier. For each
BRAND-PAGE-V1 section: **named target sites → example query → what it verifies →
source type → accessibility.** This is the concrete instruction set Haiku/Code
needs, not a conceptual taxonomy.

**Status:** reference doc. No build, no route, no probe, no DB, no Haiku run.
**Truth sources read:** `lib/luxai/source-governance.ts` (@5024bd5) +
`docs/prototypes/BRAND_PAGE_V1_LOCKED.html`. Walls measured in B2b
(OFFICIAL 403, REUTERS 401).
**Provenance doctrine:** LOCKED. Sourced-or-empty. This catalog routes each
section to named destinations; it does not authorise free generation.

## Legend

**Type:** `foundational` · `fresh` · `institutional` · `press` · `registry`

**Access (validated vocabulary — used in `validated_access`):**
- `direct_open` — page loaded and was readable
- `search_open` — found via search; article/page loaded and was readable
- `snippet_first` — likely useful through search snippets / result previews; not reliable as a direct fetch
- `premium_or_blocked` — access failed or premium domain; do NOT assume readable
- `tool_blocked_ambiguous` — blocked in the current tool environment; NOT enough to classify as a paywall

Placeholders: `{brand}` = brand name · `{official_domain}` = resolved P856 host.

## Method note (live validation, 2026-06-09)

Destinations were tested live in a real browser on **Baccarat**: navigate →
load → read. A result is only `direct_open`/`search_open` if the page actually
loaded and showed readable content. Crucially, **some domains returned "blocked"
in the tool environment that are normally public** (Yahoo Finance,
CompaniesMarketCap) — this reflects a browser/tool allowlist, NOT a proven
paywall. Those are labelled `tool_blocked_ambiguous` and are **not** counted as
negative validation. Premium domains that are independently known to gate
content (Vogue Business, WWD) are `premium_or_blocked`. Official brand sites are
brand-dependent — test per brand (Baccarat official: tool-blocked + the B2b
server test saw 403).

---

## Validated destinations (live, Baccarat) — `validated_access`

| Source | Type | Query tested | Loaded & readable? | validated_access | Sections it can feed |
|---|---|---|---|---|---|
| Wikipedia (en) | foundational | `/wiki/Baccarat_(company)` | ✅ very rich | **direct_open** | history, founder*, key_facts, facts, presence (+ corrob. exec/stock) |
| Wikidata | foundational/registry | entity claims | ✅ structured | **direct_open** | key_facts, founder_name, stock/parent, presence |
| FashionNetwork | press | article via search | ✅ full text, no paywall | **search_open** | market_position, key_executives, creative_directors, careers |
| Luxury Daily | press | `luxurydaily.com/?s=baccarat` | ✅ result + readable | **search_open** | market_position, brand_dna, fresh signals |
| Vogue Business | press | `voguebusiness.com/search` | ❌ gated | **premium_or_blocked** / snippet_first | market_position, creative_directors (snippet) |
| WWD | press | `wwd.com/?s=Baccarat` | ❌ gated | **premium_or_blocked** / snippet_first | creative_directors, key_executives (snippet) |
| Official brand site | institutional | `baccarat.com/en/` | ❌ | **tool-blocked + official 403 (B2b)** — brand-dependent, test per brand | tagline, careers, brand_dna (snippet via `site:`) |
| Jing Daily | press | (cited by Wikipedia refs) | not live-tested | snippet_first (to validate) | brand_dna, market (China) |
| CompaniesMarketCap | registry | `?s=baccarat` | ❌ in tool | **tool_blocked_ambiguous** (not negative) | stock (parent) |
| Yahoo Finance | registry | `quote/CFR.SW` | ❌ in tool | **tool_blocked_ambiguous** (not negative) | stock (parent listed) |

**Proven open layer:** Wikipedia + Wikidata (`direct_open`) and FashionNetwork +
Luxury Daily (`search_open`) — these carry the core of the page. **Confirmed
gated:** Vogue Business, WWD (`premium_or_blocked`). **Not validated negatively:**
financial registries (`tool_blocked_ambiguous`) — `stock` falls back to Wikidata
parent/listed-status, which is `direct_open`.

---

## GROUP A — Foundational / registry (open, high confidence)

### `history`
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Wikipedia (en) | `{brand} history` / direct article | founding year, milestones, ownership arc | foundational | direct_open |
| Wikidata | entity claims (inception P571, parent P749) | structured dates, parent | registry | direct_open |
| Britannica | `{brand} Britannica` | corroboration of founding narrative | foundational | search_open |
| Official site | `site:{official_domain} heritage OR history` | self-told history | institutional | snippet_first |

### `founder_name` / `founder` / `founder_facts`
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Wikidata | founder claim (P112), person entity | founder name, dates | registry | direct_open |
| Wikipedia (en) | `{brand} founder` / founder article | bio, lineage, origin | foundational | direct_open |
| Britannica | `{brand} founder {name}` | corroboration | foundational | search_open |
| Official site | `site:{official_domain} founder OR maison` | self-told origin | institutional | snippet_first |

### `key_facts` (Founded / HQ / Founder / Group / Website)
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Wikidata | claims: inception, HQ (P159), parent (P749), website (P856) | all five key facts, structured | registry | direct_open |
| Wikipedia infobox | `{brand}` article infobox | corroboration | foundational | direct_open |
| Official site | `{official_domain}` | website confirm | institutional | snippet_first |

### `facts` (icons / signature creations)
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Wikipedia (en) | `{brand} iconic products` / article sections | named creations + years (Santos, Tank…) | foundational | direct_open |
| Wikidata | product entities linked to brand | structured product list | registry | direct_open |
| Official site | `site:{official_domain} icons OR collections` | brand-confirmed naming | institutional | snippet_first |

### `presence` (boutiques / footprint)
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Wikidata | outlet/store count claims if present | boutique count | registry | direct_open |
| Annual report (parent) | `{parent_group} annual report {brand} stores` | store count, regions | institutional | search_open / snippet_first |
| Official store locator | `site:{official_domain} boutiques OR stores` | live footprint | institutional | premium_or_blocked |
| Wikipedia | `{brand}` article "operations" | corroboration | foundational | direct_open |

---

## GROUP B — Press / fresh (reach via search, open results)

### `brand_dna` (values, positioning identity)
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Business of Fashion | `{brand} brand identity BoF` | editorial read on values | press | search_open / snippet_first |
| Vogue Business | `{brand} strategy Vogue Business` | positioning language | press | premium_or_blocked / snippet_first |
| FashionNetwork | `{brand} FashionNetwork` | open trade coverage | press | search_open |
| Wikipedia | `{brand}` article intro | stable identity corrob. | foundational | direct_open |

### `creative_directors`
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| FashionNetwork | `{brand} creative director FashionNetwork` | current creative roles | press | search_open |
| Vogue Business | `{brand} creative director Vogue Business` | current creative direction | press | snippet_first |
| WWD | `{brand} creative director WWD` | appointments | press | premium_or_blocked |
| Business of Fashion | `{brand} creative director BoF` | appointment context | press | snippet_first |
| Official newsroom | `site:{official_domain} creative director` | official confirmation | institutional | premium_or_blocked |
| Wikipedia/Wikidata | `{brand} creative director` | fallback, stable named roles | foundational | direct_open |

### `market_position`
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Business of Fashion | `{brand} market position BoF` | competitive standing | press | search_open / snippet_first |
| Vogue Business | `{brand} market share Vogue Business` | sector positioning | press | snippet_first |
| FashionNetwork | `{brand} sales FashionNetwork` | open coverage of results | press | search_open |
| Reuters | `{brand} Reuters` | revenue/move snippets | press | snippet_first |
| Annual report (parent) | `{parent_group} annual report {brand}` | segment revenue | institutional | search_open / snippet_first |

### `hiring_intelligence`
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Official careers | `site:{official_domain} careers` | hiring areas, values | institutional | premium_or_blocked |
| FashionJobs | `{brand} FashionJobs` | open job listings = hiring signal | press | search_open |
| Business of Fashion (careers) | `{brand} jobs BoF Careers` | role types | press | snippet_first |
| Exec interviews | `{brand} CEO interview talent OR hiring` | culture/hiring intent | fresh | search_open |

---

## GROUP C — Primary-only (strict: named people / quotes / financials)

### `key_executives` (current named execs)
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Parent investor page | `{parent_group} leadership {brand}` | official exec listing | institutional | search_open / snippet_first |
| Reuters | `{brand} CEO appointed Reuters` | appointment confirmation | press | snippet_first |
| Bloomberg | `{brand} CEO Bloomberg` | exec profile | press | snippet_first |
| FashionNetwork | `{brand} names CEO FashionNetwork` | open appointment report | press | search_open |
| Official newsroom | `site:{official_domain} appoints OR CEO` | official confirmation | institutional | premium_or_blocked |
| Wikipedia | fallback only — never sole support (primary_only) | stable named role | foundational | direct_open |

### `quote`
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Exec interview | `{brand} CEO interview "{topic}"` | verbatim sourced quote | fresh | search_open |
| Reuters / FT | `{brand} CEO said Reuters` | attributed statement | press | snippet_first |
| Official newsroom | `site:{official_domain} press release` | official statement | institutional | premium_or_blocked |
| Wikipedia | historic attributed quotes only | stable quote | foundational | direct_open |

### `stock` / parent / listed status
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Wikidata | ownership (P749), listed-status, ticker (P414) | private vs listed, parent | registry | direct_open |
| CompaniesMarketCap | `{parent_group} CompaniesMarketCap` | market cap of parent | registry | search_open |
| Yahoo Finance | `{parent_group} stock Yahoo Finance` | live quote (parent only) | registry | search_open |
| Parent investor relations | `{parent_group} investor relations` | financials | institutional | search_open / snippet_first |
| Annual report | `{parent_group} annual report PDF` | audited figures | institutional | search_open |

---

## GROUP D — Institutional self-description

### `tagline`
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Wikipedia | `{brand}` article (historic tagline) | stable tagline | foundational | direct_open |
| Official site | `site:{official_domain}` homepage | current brand tagline | institutional | snippet_first |
| Business of Fashion | `{brand} tagline OR motto BoF` | editorial corrob. | press | search_open |

### `careers` (career-path families)
| Site | Query | Verifies | Type | Access |
|---|---|---|---|---|
| Official careers | `site:{official_domain} careers OR jobs` | role families, métiers | institutional | premium_or_blocked |
| FashionJobs | `{brand} FashionJobs` | open roles by function | press | search_open |
| FashionNetwork | `{brand} recruitment FashionNetwork` | hiring coverage | press | search_open |
| Wikipedia | `{brand}` operations section | function areas fallback | foundational | direct_open |

---

## Resolver dependencies (so queries are concrete, not abstract)

For the `{...}` placeholders to be real per brand, the engine needs three
identifiers up front — all from the **open layer**:

| Placeholder | Resolved from | Access |
|---|---|---|
| `{official_domain}` | Wikidata P856 (already live) | direct_open |
| `{parent_group}` | Wikidata parent P749 | direct_open |
| `{ticker}` (if listed) | Wikidata P414 | direct_open |

These three resolve from Wikidata before any search runs — which is why
foundational/registry must run first: it produces the keys the press/fresh
queries need.

---

## Hard rules carried from the walls

1. **Never block a section on a walled domain.** Official/Reuters/WWD/FT/Bloomberg
   are `snippet`/`walled` — usable as corroboration via search, never as a feed to
   fetch directly. If a section's only listed site is walled and search yields no
   open result → section returns **empty**, never generated.
2. **`primary_only` sections** (key_executives, quote, stock) may NOT stand on
   Wikipedia alone. They need a primary/secondary open result (appointment report,
   interview, registry) or they stay empty.
3. **`{official_domain}` queries use `site:` search**, not direct fetch — the
   snippet is the corroboration; the wall stays unbreached.

---

## Recommendation — next slice (for Mo + GPT, NOT started)

The catalog is now operational: named sites, real queries, accessibility per
section. The single missing capability that makes it executable is **web search
as a tool for Haiku** — run the query, read the open result, attach its URL.

> **Slice 2A — Search-grounded single-section fill (1 section, 1 brand, read-only).**
> Pick `creative_directors` on Baccarat (Group B, exercises the search path +
> primary-preference). Give Haiku the catalog row's queries, let it search, read
> open results, fill that one section with `source_url`. Judge: page-quality +
> real provenance. No DB, no publish, no multi-section, no walled crawl.

If it works, every other section is the same mechanic with a different catalog
row.
