# JOBLUX MASTER DOCTRINE
**Version:** 2026-04-10
**Status:** Locked
**Authority:** This document supersedes all previous doctrine, rulebook, and system docs.

---

## 1. CORE PRINCIPLE

JOBLUX is a brand-first luxury careers intelligence platform.

> **One brand = one intelligence node.**
> Everything sources from, connects to, or surfaces through a tracked brand.

**The three-layer rule:**
- WikiLux defines who matters (the brand universe)
- Sources define what is real (traceable origin)
- LuxAI defines how it is structured (transformation only)

**LuxAI transforms. It never originates.**

---

## 2. SOURCE & TRACEABILITY RULES

Every object published on JOBLUX must start from a real source appropriate to its family.

**Required for all published content:**
- `content_origin` must not be `ai`, `luxai`, or any AI-derived origin unless explicitly allowed by the family rules below
- `source_url` must be present for signals, salary, and events
- If source is missing → object goes to queue as draft, never auto-publishes

**Forbidden in all families:**
- Inventing statistics, percentages, or counts not in the injected data
- Stating inferred motives as facts
- Generating from zero real data
- Presenting AI estimates as market truth

**Claim language required:**
- Use: *suggests, indicates, may imply, points to, based on X data points*
- Never: *confirms, proves, shows, the industry is*

---

## 3. CONTENT FAMILY RULES

### SIGNALS
- **Source:** RSS feeds, press releases, newsrooms, earnings announcements
- **Allowed origins:** `rss`, `manual`
- **Forbidden origins:** `ai`, `joblux_generation`
- **Required fields:** `headline`, `category`, `what_happened`, `why_it_matters`, `brand_tags`, `source_url`
- **Auto-publish:** Only if confidence=high + source_url present + what_happened present + brand_tags present
- **Otherwise:** Queue → Mo approves

### ARTICLES & REPORTS
- **Source:** Real published signals + datasets + editorial input
- **Allowed origins:** `seed`, `editorial`, `contributor`
- **Forbidden origins:** `ai`
- **Auto-publish:** Never. Manual only.
- **Research Reports:** Same table (`bloglux_articles`), same rules. No AI-origin reports.

### EVENTS
- **Source:** Official event sites, brand announcements, verified calendars, RSS
- **Allowed origins:** `rss`, `seed`, `manual`
- **Forbidden origins:** `ai`
- **Required fields:** `title`, `date`, `location`, `source`
- **Auto-publish:** Never. Queue only.

### SALARY
- **Source:** Job boards (Indeed, LinkedIn, Glassdoor), company career pages, public listings, user contributions
- **Allowed origins:** `job_board`, `manual_verified`, `user_verified`
- **Forbidden origins:** `ai`, `luxai`, `ai_estimated`
- **Required fields:** `job_title`, `brand_slug`, `salary_min`, `salary_max`, `source_url`
- **Labeling:** Must state "Advertised" or "User-reported" with clear context. No synthetic or model-generated estimates allowed.
- **Auto-publish:** Never.

### INTERVIEWS
- **Source:** Real user submissions only
- **Allowed origins:** `user`, `contributor`
- **Forbidden origins:** `ai`, `example`
- **Auto-publish:** Never.

### BRANDS (WikiLux)
- **Source:** Official sites, annual reports, IR pages, verified references
- **Allowed origins:** `luxai_generation` (structured from verified reference facts)
- **Auto-publish:** Yes — brand dossiers are reference data, stable facts, low fabrication risk
- **LuxAI may NOT:** Invent recent developments, invent financial changes, invent executives

---

## 4. WIKILUX NODE RULE

**One name users search for = one node, if it has its own intelligence life.**

A brand earns its own node if:
- A luxury professional would search for it by name directly
- It generates distinct signals, hiring, and salary data (even if currently low-volume, but with clear potential for independent intelligence)
- It has a separate operating reality — own leadership, culture, business logic

**Groups:** Exist as nodes only if they generate standalone intelligence worth tracking. Not automatically because they own brands.

**Sub-lines:** Live inside the parent dossier unless they have a fully separate operating entity.

**Sectors:** Filters only — not structural layers. A brand can span multiple sectors. Do not overfit.

**Ownership:** Lives inside `content.stock` — not in URL or page hierarchy.

---

## 5. GENERATION RULES (LuxAI behavior)

### Pre-generation check (required before any generation)

**These checks must be enforced programmatically in all LuxAI routes before prompt execution.**

1. Identify the data family
2. Verify data is sufficient (not empty, not fabricated)
3. Confirm output type is allowed for that family
4. Confirm queue review is mandatory

**If data is insufficient → decline generation or return draft marked "insufficient evidence". Never fill gaps creatively.**

### Per-family generation trust levels

| Family | Trust Level | LuxAI Role |
|---|---|---|
| Signals | Medium-high | Summarize, classify, contextualize |
| Salary | High (numeric) | Aggregate, compare, benchmark |
| Brands | High reference | Structure, enrich, connect |
| Articles | High when grounded | Synthesize from real injected data |
| Events | High (factual) | Summarize, classify |
| Interviews | Medium-high (user-reported) | Aggregate patterns only |

### Universal generation rules
1. Never invent statistics not in the injected data
2. Never state inferred motives as facts
3. Distinguish observation from interpretation
4. All LuxAI outputs → `content_queue` as draft first
5. Nothing generated by LuxAI auto-publishes without editorial review (except signals meeting all 4 auto-approve conditions)
6. Mo's approval is the only publish trigger for editorial content

---

## 6. PRODUCT SYSTEM LOGIC

### The irrigation model
JOBLUX is not assembled page by page. It is fed by a central intelligence layer.

**Sources feeding the system:**
- RSS ingestion (signals, events)
- Admin curation (editorial decisions)
- Contributor submissions (salary, interviews, insider)
- LuxAI structuring (transformation of real inputs)
- Structured datasets (brands, assignments)

**Every room must feel fed, not assembled.**

### Room types

| Room type | Examples | Primary purpose |
|---|---|---|
| Intelligence | Brands, Signals, Insights, Events | Consume structured intelligence |
| Dossier | /brands/[slug], /signals/[slug] | Deep-dive on single entity |
| Action | Careers, /join, contributions | Drive user decision |
| Personal | Dashboards | Member operational home |
| Control | Admin, LuxAI center | Operate the platform |

### Cross-room rules
- Borrowed data is always secondary (smaller, lower hierarchy)
- Maximum 2 borrowed layers per room
- Borrowed data adds context, never competes

### Alive vs dead criteria

**A room is ALIVE when:**
- Real, recent data visible without scrolling
- Signal indicators show movement
- Timestamps within last 7 days
- Stats bar shows dynamic counts

**A room is DEAD when:**
- Content could have been written 6 months ago
- No signal indicators
- Hardcoded round numbers
- Feels like a template, not a live surface

**The test:** "Does this feel like it was updated today?" If no → fix it.

---

## 7. UI TRUTH RULE

**No dead UI. No empty surfaces. No fake metrics.**

- Never ship a button, toggle, or tab that has no real content behind it
- Never show a count that is hardcoded or stale
- Hide tabs when the family has no real data
- All counts must come from live DB queries, never from `.length` of stale arrays
- Admin dashboard metrics must reflect live DB truth at all times

---

## 8. PUBLISHING GATES

| Gate | Applies to | Trigger |
|---|---|---|
| **Auto-publish** | Signals (high confidence, sourced), Brands | All conditions met automatically |
| **Queue → Mo approves** | Medium signals, events, salary, interview prep | Human review required |
| **Manual only** | Articles, reports, major brand rewrites | Mo publishes directly |

---

## 9. LEGACY DATA POLICY

Any data that violates these family rules must be unpublished before launch and not replaced with AI-generated substitutes.

**Forbidden to show live:**
- Any record with `content_origin = 'ai'` or `content_origin = 'luxai'` in salary, events, articles, or interviews
- Any record with no `source_url` in signals, salary, or events
- Interview experiences with `content_origin = 'example'`

**Cascade rule:** When a brand is removed or unpublished, cascade cleanup to `salary_benchmarks`, `signals` (brand_tags), and `events` referencing that brand. No orphaned records with missing brand references.

---

## 10. NON-NEGOTIABLES

1. **Brand is the center.** Every piece of intelligence anchors on a tracked brand.
2. **No fabrication.** LuxAI transforms real data. It never invents.
3. **Source required.** Signals, salary, events must have traceable source URL.
4. **Queue before publish.** Nothing auto-publishes except signals meeting all 4 conditions.
5. **No dead UI.** Empty tabs, fake counts, and broken buttons are forbidden.
6. **Doctrine over convenience.** If generation requires inventing data → decline.
7. **One surface of truth per decision.** Content queue = single review surface. Admin counts = live DB only.
8. **This document governs.** If code contradicts this document → fix the code.
9. **System enforcement required.** Doctrine rules must be implemented in code-level validation, not only in prompts.

---

*Last updated: April 10, 2026*
*Sources: JOBLUX_DATA_DOCTRINE_V1.md + LuxAI_generation_rulebook_V1 + JOBLUX_Consolidated_System_v1_1*
