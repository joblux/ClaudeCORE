# LUXAI ARTICLE IMPORT — PRODUCT SPEC (V1)

## Vision

LuxAI Article Import is an AI-assisted ingestion and transformation system.

It converts raw content (articles, drafts, external sources) into structured, JOBLUX-ready intelligence.

It is NOT a simple CMS import tool.
It is an editorial engine that:
- understands content
- improves it
- structures it
- routes it across the platform

---

## Core Principles

- Structured input → structured output
- AI-assisted, human-controlled
- Fully editable before publishing
- Queue-gated (never auto-publish)
- Multi-surface distribution ready

---

## Supported Input Sources

### 1. Manual Paste
- Raw article text
- Draft content
- Contributor submissions

### 2. URL Import
- Blog articles
- External sources
- Legacy JOBLUX content

### 3. File Upload (V2)
- .docx / .pdf
- Exported content

---

## V1 Features

### 1. Content Ingestion
- Accept raw text or URL
- Extract main article body
- Remove noise (navigation, ads, formatting issues)

---

### 2. AI Classification

LuxAI automatically suggests:

- Tab:
  - Editorial
  - Research
  - Insider Voices
  - Luxury Map (future)

- Content Type:
  - Article
  - Research Report
  - Opinion
  - Experience / Testimonial

- Category
- Tags
- Sector(s)
- Country / geography relevance
- Brand mentions

---

### 3. AI Enhancement

LuxAI generates:

- 2–3 improved headline options
- Clean excerpt / summary
- Structured body (headings, flow)
- Tone alignment with JOBLUX (professional, insider)
- “Why this matters” framing
- Suggested internal links:
  - Careers
  - Brands
  - Signals
  - Events

---

### 4. Entity Extraction

Automatically detect and attach:

- Brands
- Countries
- Sectors
- Roles / departments

Used for:
- linking
- SEO
- cross-platform distribution

---

### 5. Editable Output (CRITICAL)

All fields must be manually editable before queue:

- Title
- Slug
- Excerpt
- Body content
- Category
- Tags
- Tab destination
- Related brands
- Related countries
- Related sectors
- Internal links
- CTA links

---

### 6. Queue Integration

Output is saved to:

**content_queue**

Fields:
- content_type = 'article'
- source_type = 'luxai_import'
- status = 'draft'
- processed_content = full structured article payload

Admin actions:
- preview
- edit
- approve
- reject

---

## Admin Flow

1. Open "Import Article"
2. Choose input method (paste / URL)
3. Submit content
4. LuxAI processes + structures
5. Admin reviews and edits
6. Save to queue
7. Approve → publish to Insights

---

## Content Transformation (V2+)

From one source, LuxAI can generate:

- Full article (Insights)
- Short summary (Brief)
- Snippet (newsletter)
- Social caption

---

## Platform Integration

Content can be routed to:

- Insights (primary)
- Brief (summary layer)
- Brand pages (contextual embedding)
- Future: map / signals cross-linking

---

## Control Parameters (Future)

Optional admin inputs:

- Tone:
  - Analytical
  - Opinionated
  - Executive
  - Career-focused

- Adaptation level:
  - Light (clean only)
  - Moderate (rewrite + improve)
  - Strong (transform + restructure)

---

## Anti-Patterns (DO NOT BUILD)

- One-click "generate article" button
- Auto-publish after import
- Non-editable AI output
- Generic rewriting without structure

---

## Definition

"Turn any raw content into structured, high-quality JOBLUX intelligence — with full editorial control."
