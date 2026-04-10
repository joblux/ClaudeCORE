---

# JOBLUX DATA DOCTRINE — V1
*Locked: April 10, 2026*

## MASTER RULE
Every object must start from a real source appropriate to its family.
LuxAI only transforms — never originates (except slow reference facts).
No family starts with AI. Each family starts with a real source. Then LuxAI transforms it.

WikiLux defines who matters.
Sources define what is real.
LuxAI defines how it is structured.

## SOURCING MODEL
Two layers:

Passive layer — RSS runs in the background. Catches what the 5 configured sources publish that day, filtered against the WikiLux brand list.

Active layer — Brand-first sourcing. For any brand in WikiLux:
- Signals: search news / press / announcements for the brand
- Events: search official event / brand / calendar sources for the brand
- Salaries: search job boards / company careers pages for the brand
- Interview prep: search job descriptions + brand context for the brand
- Articles / Reports: built from real imported material already gathered around those brands

The brand list is the center of the sourcing system. JOBLUX does not import broadly. It imports because content matches a brand it tracks.

## THE FLOW (ALL FAMILIES)
Source → LuxAI transform → confidence gate → publish → surface
No exceptions.

---

## 1. BRAND DOSSIER
- Source: official sites, annual reports, IR pages, verified references
- LuxAI: structure + summarize
- Publish: auto (low risk, stable facts)
- Feeds: /brands cards, brand page
- LuxAI may NOT: invent recent developments, invent hiring status, invent financial changes

## 2. SIGNALS
- Source: RSS, press releases, newsrooms, earnings announcements
- LuxAI: extract + classify + summarize → what_happened, why_it_matters, category, brand_tags, card_marker, confidence
- Publish: high confidence + source URL present → auto | else → queue
- Feeds: /signals, brand page, /brands card markers
- LuxAI may NOT: invent a signal without a source, generate movement from general knowledge

## 3. EVENTS
- Source: official event sites, brand announcements, verified calendars
- LuxAI: structure + dedupe (title, date, location, linked brands, type)
- Publish: verified date + location → auto | else → queue
- Feeds: /events, brand page
- LuxAI may NOT: invent dates, invent locations, invent events

## 4. SALARY INTELLIGENCE
- Source: job boards (Indeed, LinkedIn, Glassdoor), company career pages, public salary listings
- LuxAI: extract range + normalize currency/city/role + sanity check
- Publish: auto only if sourced | must be labeled (Advertised / Estimate)
- Feeds: /careers salary tab, brand page salary section
- LuxAI may NOT: present unsupported numbers as fact, keep outliers (salary_max > 500,000 = delete)

## 5. INTERVIEW PREP (public)
- Source: job descriptions + brand dossier fields + recent published signals
- LuxAI: synthesize public prep briefing
- Publish: queue (quality control)
- Feeds: /careers interview prep, brand page prep module
- LuxAI may NOT: invent actual interview questions asked, invent internal process details

## 6. ARTICLES
- Source: real published signals + datasets + editorial input
- LuxAI: assist drafting only
- Publish: manual only
- Feeds: /insights editorial tab, homepage features
- LuxAI may NOT: be sole factual origin, fabricate claims without source

## 7. REPORTS
- Source: aggregated real datasets (signals, salaries, assignments, brand data)
- LuxAI: structure + summarize findings
- Publish: manual only
- Feeds: /insights research tab
- LuxAI may NOT: invent findings, invent data points, fabricate methodology

## 8. ASSIGNMENTS
- Source: internal real mandates only (Mo curates directly)
- LuxAI: formatting + normalization only
- Publish: direct
- Feeds: /careers, brand pages
- LuxAI may NOT: invent assignments

---

## PUBLISHING GATES
- Auto: high-confidence sourced signals, verified events, advertised salaries, stable dossier refreshes
- Queue: medium-confidence signals, events with weak source certainty, salary records with odd ranges, interview prep drafts
- Manual only: articles, reports, major dossier rewrites, anything reputational

---

## CLEANUP DECISIONS (April 10, 2026)
- Salary records with salary_max > 500,000 → DELETED
- AI-generated signals with no source_url → UNPUBLISHED (off public feed)
- Seeded interview experiences → LABELED as content_origin='example' (not deleted)

---

## WHAT THIS FILE IS
This is the operating constitution for all data and content decisions on JOBLUX.
Before touching any LuxAI route, generation prompt, or data pipeline — read this file.
Before approving any content architecture decision — check against this file.
If in doubt: does this object start from a real source? If no, do not publish it.

---
