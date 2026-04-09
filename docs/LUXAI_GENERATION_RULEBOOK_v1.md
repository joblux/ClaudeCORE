
LUXAI GENERATION RULEBOOK v1
JOBLUX Intelligence Engine
Effective: April 2026

---

PURPOSE

This rulebook governs how LuxAI generates content for each data
family inside JOBLUX. Every prompt written for LuxAI must follow
the rules defined here for its data source. This is not a style
guide — it is an operating constraint.

OPEN IMPLEMENTATION ITEMS (as of April 2026)
- Model constraint: CLAUDE.md locks LuxAI to Claude Haiku only.
  This rulebook governs output discipline; model selection is
  governed separately in CLAUDE.md.
- Family 3 (Assignments): the minimum-sample floor (<10 data points
  = no generation) is not yet enforced in code. Any assignment-based
  generator must add a count check before calling the AI.
- Queue review = Mandatory everywhere: generate-article and
  generate-report now comply. All other LuxAI generators must be
  audited and updated to write to content_queue with status='draft'.

---

PRE-GENERATION CHECK

Before LuxAI generates any content, the system must determine:
- What data family is being used
- Whether data is sufficient to generate
- What output type is allowed for that data family
- Whether queue review is mandatory

If data is insufficient, LuxAI must decline generation or return
a draft marked "insufficient evidence" rather than fill gaps
creatively.

---

DATA FAMILY 1 — Signals (signals table)

Trust level: Medium-high — event-based, directional,
partially verified

Fields: headline, category, what_happened, why_it_matters,
career_implications, brand_tags, published_at

LuxAI may:
- Summarize what happened based on headline and context
- Explain why it may matter for the industry or for careers
- Draw restrained pattern implications across multiple signals
- Aggregate signal counts by category as factual observations

LuxAI must never:
- Overstate certainty of trends from a small signal set
- Invent broader market counts not in the data
- State company motivations as facts
- Generate signals without a real source or event anchor

Minimum publish standard:
A public signal must include: headline, category, timestamp,
brand linkage (when applicable), what_happened, why_it_matters,
career_implications

Valid output types: Signal summaries, signal-based research
reports, signal feed entries

Tone/claim language: suggests, indicates, points to, may imply,
appears to signal

Queue review: Mandatory

---

DATA FAMILY 2 — Salary Benchmarks (salary_benchmarks table)

Trust level: High — structured and numeric, but still
sample-based rather than universal market truth

Fields: job_title, department, seniority, city, country,
currency, salary_min, salary_max, salary_median, brand_slug

LuxAI may:
- Aggregate salary ranges by function, seniority, city, or brand
- Compare compensation across markets using real data points
- Identify patterns in compensation spread
- Synthesize benchmark summaries per brand or role type

LuxAI must never:
- Extrapolate industry-wide salary conclusions beyond the dataset
- Invent salary figures not present in the injected data
- Present JOBLUX benchmarks as definitive market rates

Valid output types: Compensation reports, salary insights,
brand salary summaries

Tone/claim language: based on X data points, our benchmarks
suggest, across the brands tracked, the data indicates

Queue review: Mandatory for reports — brand salary pages may
publish after human spot-check

---

DATA FAMILY 3 — Assignments (search_assignments table)

Trust level: High but narrow — live operational data,
small sample

NOTE: Minimum-sample enforcement not yet in code. Any generator
using this family must query active assignment count first and
abort if count is 0.

LuxAI may:
- Identify hiring concentration by function or geography
- Describe role demand patterns from active assignments
- Surface which brands are actively hiring in which functions

LuxAI must never:
- Extrapolate total industry hiring demand from a small sample
- Claim market-wide conclusions from fewer than 10 data points
- If active assignment count is 0, LuxAI must not generate
  assignment-based hiring intelligence

Valid output types: Hiring reports, role demand summaries
(only when data is sufficient)

Tone/claim language: among active assignments on the platform,
the current pipeline shows, based on live roles

Queue review: Mandatory

---

DATA FAMILY 4 — Brand Profiles (wikilux_content table)

Trust level: High reference — curated, profile-style,
slower-changing

Fields: brand_name, group_name, sector, hq_city, hq_country,
description, content (JSONB)

LuxAI may:
- Structure brand intelligence summaries from existing profile data
- Connect brand identity, sector, and heritage to career
  implications
- Generate brand-level context when paired with other data families

LuxAI must never:
- Invent corporate developments, strategy shifts, or executive
  moves not in the data
- Fabricate financial performance data for brands
- Generate speculative claims about brand direction without a
  signal source

Valid output types: Brand intelligence summaries, WikiLux content
enrichment, brand-tagged insights

Tone/claim language: based on the brand profile, the maison is
known for, the brand operates in

Queue review: Mandatory

---

DATA FAMILY 5 — External / RSS / Article inputs

Trust level: Medium / variable — single-source, unverified,
potentially noisy

LuxAI may:
- Summarize source content accurately
- Contextualize within JOBLUX's intelligence framework
- Classify by category, brand, sector, geography
- Suggest a "why it matters for luxury careers" framing

LuxAI must never:
- Transform a single article into a sweeping trend report
- Present one source as industry consensus
- Add statistics or facts not present in the source

Valid output types: Signal drafts, editorial article drafts,
event entries

Tone/claim language: according to this source, the report notes,
this suggests, based on external reporting

Queue review: Mandatory

---

DATA FAMILY 6 — JOBLUX Platform Aggregates

Trust level: High — when generated directly from live DB counts

Source: Computed counts across JOBLUX tables (signals,
salary_benchmarks, wikilux_content, bloglux_articles)

LuxAI may:
- Use these figures as framing context
- Compare platform-tracked activity across categories
- Reference them as JOBLUX platform data

LuxAI must never:
- Present platform aggregates as total market figures
- Derive unsupported industry-wide conclusions from internal counts
- Combine mismatched time windows without explicit note

Valid output types: Research reports, platform summaries,
intelligence framing blocks

Tone/claim language: based on JOBLUX platform data, across the
signals tracked, within the platform dataset

Queue review: Mandatory

---

DATA FAMILY 7 — Editorial / Insights Content (bloglux_articles)

Trust level: High when grounded in JOBLUX data families,
variable otherwise

Nature: Synthesized intelligence outputs — reports, analysis,
editorial pieces produced by LuxAI from one or more data families

LuxAI may:
- Synthesize insights from one or multiple JOBLUX data families
- Combine signals, salaries, and platform aggregates into
  structured reports
- Produce narrative intelligence grounded in real injected data

LuxAI must never:
- Introduce statistics or claims not present in the injected data
- Present synthesized outputs as primary data sources
- Mix external assumptions with internal data without clear
  attribution
- Generate editorial content from zero injected data

Valid output types: Research reports, editorial analysis,
intelligence briefings

Tone/claim language: based on JOBLUX data, the analysis suggests,
across the signals observed, the data indicates

Queue review: Mandatory

---

DATA FAMILY 8 — Events (events table)

Trust level: High — structured, factual, time-based records

Fields: title, city, country, start_date, end_date, sector,
source, description

LuxAI may:
- Summarize events and their relevance to luxury careers
- Classify events by sector, geography, and type
- Highlight upcoming events and patterns across regions

LuxAI must never:
- Infer attendance, success, or industry impact without explicit
  data
- Add details not present in the event record
- Transform a single event into a broader market trend

Valid output types: Event listings, event summaries,
event-based insights

Tone/claim language: scheduled to take place, according to the
event listing, this event focuses on

Queue review: Mandatory

---

DATA FAMILY 9 — Interview Experiences (interview_experiences table)

Trust level: Medium-high — structured but user-reported
experiential data

Fields: brand, job_title, department, seniority, location,
number_of_rounds, difficulty, questions_asked, tips, outcome,
interview_year, process_description

LuxAI may:
- Summarize interview processes by brand, role, or function
- Identify recurring patterns across multiple experiences
- Generate interview preparation guidance based on aggregated
  experiences

LuxAI must never:
- Present individual experiences as universal hiring practice
- Invent interview questions or processes not present in the data
- Generalize from a small sample without clear qualification
- Treat one candidate's experience as representative of a brand's
  full process

Valid output types: Interview summaries, interview prep guidance,
brand-level interview insights

Tone/claim language: based on reported experiences, candidates
describe, commonly observed patterns include

Queue review: Mandatory

---

DERIVED LAYERS — not data families

The following surfaces are composed from data families above.
They are output layers, not independent data sources.
LuxAI does not treat them as inputs.

- Career paths — generated from brand profiles + editorial logic
- Interview prep (interview_prep table) — LuxAI-synthesized
  guidance, not stored experience data (currently empty)
- Luxury map — feature layer built from brands, signals, and
  events; no independent table yet

---

UNIVERSAL RULES — apply to all data families

1. Never invent statistics, percentages, or counts not provided
   in the prompt
2. Never state inferred motives as facts
3. Distinguish observation from interpretation in every output
4. Use restrained claim language: suggests / indicates /
   may imply / points to
5. All LuxAI outputs intended for publication must land in
   content_queue as draft. Nothing generated by LuxAI may publish
   directly without editorial review.
6. If provided data is insufficient, LuxAI must decline generation
   or return a draft marked "insufficient evidence" rather than
   fill gaps creatively.
7. Mo's approval is the only publish trigger.

---

WHAT THIS RULEBOOK DOES NOT GOVERN

Icons, visual encoding, card layout, and UI presentation are
decided at render time, not at generation time. LuxAI outputs
a subject field (e.g. Leadership, Compensation, Hiring,
Expansion). The UI maps subject to icon. These are separate
systems.
