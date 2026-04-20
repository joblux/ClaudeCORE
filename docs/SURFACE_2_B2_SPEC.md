# SURFACE #2 B2 — Admin Widening for Insider Voice

**Status:** open, not yet started
**Parent:** Surface #2 — Contributions canonical spine
**Created:** Apr 20, 2026
**Author:** JOBLUX session (Opus 4.7 guardrail)
**Related:** `SURFACE_2_STEP_1` (schema migration, done) · `SURFACE_2_STEP_2` (endpoint widening, committed+deployed) · `SURFACE_2_STEP_3` (reroute, deferred pending this spec)

---

## 1. Problem statement

Surface #2 Step 2 successfully widened `/api/contributions` to accept `contribution_type='insider_voice'`, inserting into `contributions` + `insider_voices` with full email parity.

Surface #2 Step 3 was intended to reroute the legacy writer `/api/insider/submit-voice` (which currently writes directly to `bloglux_articles`) onto the canonical spine.

**Step 3 was halted at Phase 1 pre-flight for a real architectural reason:**

The admin moderation workflow is coupled end-to-end to `bloglux_articles`.

- `/api/admin/contributions` voices counts, voices GET, and voices POST (approve / reject / revision / delete) all read and write `bloglux_articles` only.
- `app/admin/contributions/page.tsx` is hardcoded to the legacy table.
- `app/api/admin/luxai/approve/route.ts` handles `type='insider_voice'` only as a `bloglux_articles` publishing flow.

**Consequence:** if `/api/insider/submit-voice` is rerouted to write into `contributions` + `insider_voices` without widening the admin side, submissions become invisible to admin → stuck in `pending` forever → contributor sees no feedback → regression vs. legacy path.

The canonical spine exists. The admin side must be widened before traffic can be switched.

---

## 2. Goal

Make `contributions` + `insider_voices` the **live source of truth** for insider voice submissions, while:

- preserving the full admin moderation workflow (approve / reject / request revision)
- preserving contributor dashboard continuity (`my-voices` feed)
- preserving the published article surface (`/insights/:slug`) once approved

---

## 3. End-to-end chain contract

The chain that must work end-to-end after B2 ships:

```
1. Insider submits voice
   → /api/insider/submit-voice rerouted to canonical
   → writes to contributions + insider_voices

2. Admin sees the submission
   → /api/admin/contributions voices GET returns union of:
     - bloglux_articles (legacy, read-only, transitional)
     - contributions + insider_voices (new, live)

3. Admin actions work
   → approve / reject / revision routed correctly based on row source
   → action on new-path row updates contributions.status

4. On approve of a new-path insider_voice
   → MATERIALIZE a bloglux_articles row (slug + status='published')
   → this is the publish step, not a duplicate-write

5. Contributor dashboard reflects truth
   → /api/insider/my-voices dual-read returns merged + sorted feed
   → new-path items with status='approved' resolve to 'published' via
     the materialized bloglux_articles row and expose slug for "View →"
```

**Invariant:** each hop must not leak data across members. Every query filters by `member_id = current session memberId` (or equivalent auth scope on admin routes).

---

## 4. Likely files in scope

Minimum set; final scope TBD at B2a pre-flight.

| # | File | Purpose |
|---|---|---|
| 1 | `app/api/admin/contributions/route.ts` | Union voices GET; route POST actions by source; add materialize-on-approve |
| 2 | `app/admin/contributions/page.tsx` | Handle both row shapes in the voices tab; no UI redesign |
| 3 | `app/api/insider/my-voices/route.ts` | Dual-read + status resolution via materialized article lookup |
| 4 | `app/api/insider/submit-voice/route.ts` | Final reroute to canonical (deferred from Step 3) |
| 5 | (possible helper) shared slug/materialization module | One source of truth for the approve → publish transform |

**Not in scope:** any schema change, any frontend redesign, any LuxAI pipeline change, any dual-write, any migration of existing `bloglux_articles` 'Insider Voice' rows.

---

## 5. Materialization rule — approve → publish

On approve of a contribution with `contribution_type='insider_voice'`:

1. Set `contributions.status = 'approved'`
2. Insert a new `bloglux_articles` row with:
   - `slug`: `slugify(title) + '-' + Date.now()` (match legacy behavior verbatim — do not invent a new slug rule)
   - `title`, `excerpt`, `body`: pulled from the joined `insider_voices` row
   - `category`: `'Insider Voice'` (match legacy)
   - `content_origin`: `'contributed'` (match legacy)
   - `author_id`: `contributions.member_id`
   - `author_name`, `author_role`, `cover_image_url`: from `insider_voices`
   - `external_link`: from `insider_voices` (latent-bug fix — legacy route dropped this)
   - `status`: `'published'`
   - `meta_title`, `meta_description`: derived from title/excerpt
   - `submitted_at`, `read_time_minutes`, `created_at`, `updated_at`: set per current convention
3. Store a back-reference: add `contributions.published_article_id` (nullable FK to `bloglux_articles.id`)
   - **⚠ schema touch required** — either add this column (out of stated non-schema scope) OR resolve the link on-the-fly via slug/title match. Decision deferred to B2a.
4. Fire the same "voice published" email that the legacy path fires today (if any — verify at pre-flight)

**Not permitted:** dual-writing the body content in both tables as an ongoing state. Materialization is a one-way transform at approval time. Once published, `bloglux_articles` is the canonical public-facing copy; `insider_voices` remains the submission-time record.

---

## 6. Status logic

**Principle:** `contributions.status` is moderation truth. `bloglux_articles` existence is publish truth. Dashboard display resolves both.

| `contributions.status` | Materialized article? | Dashboard label | `View →` link? |
|---|---|---|---|
| `pending` | — | `SUBMITTED` (or `PENDING`) | No |
| `approved` | No | `APPROVED` (transient) | No |
| `approved` | Yes | `PUBLISHED` | Yes (`/insights/:slug`) |
| `rejected` | — | `REJECTED` | No |

**Legacy `bloglux_articles.status` vocabulary** (`draft | submitted | review | revision_requested | published | archived | rejected`) remains authoritative for legacy rows. Dashboard display uses status source: legacy rows use their own status; new-path rows use the table above.

**Do not invent a second moderation system.** Contributions status is the only moderation state for new-path rows.

---

## 7. Read strategy

### `/api/admin/contributions` voices GET
- **Union** legacy + canonical on the server side
- Shape results to a common row interface before returning to admin UI
- Sort by submission time DESC
- Do not paginate across sources — paginate each then merge, or fetch top-N from each and merge (simpler for transition period)

### `/api/insider/my-voices` GET (already designed in Step 3 Phase 1, never shipped)
- Dual-read, member-scoped on both queries
- Each row carries `source: 'legacy' | 'contribution'`
- Status resolution table (section 6) applied server-side
- Slug lookup for approved contributions resolves via `contributions.published_article_id` (if column added) or join-on-content (if not)

### Member scoping
- Every query in both routes filters by `member_id` or `author_id` matching the current session
- No cross-member leakage under any circumstance
- Admin routes bypass the member filter only when the caller role is admin

---

## 8. Execution sequencing

Recommended split — three cohesive sub-blocks, one parent feature:

### B2a — Admin visibility + actions
**Files:** `app/api/admin/contributions/route.ts`, `app/admin/contributions/page.tsx`
**Goal:** admin can see new-path submissions in the voices tab and take approve / reject / revision actions on them.
**No materialization yet.** Approve just sets `contributions.status='approved'`. Published state not yet reflected on contributor side. Acceptable interim state.

### B2b — Approve → materialize
**Files:** `app/api/admin/contributions/route.ts` (extend approve branch), possibly new helper
**Goal:** on approve of new-path insider_voice, create the `bloglux_articles` published row.
**Includes:** slug generation, optional `published_article_id` column decision, back-reference strategy.

### B2c — Contributor dashboard alignment
**Files:** `app/api/insider/my-voices/route.ts`
**Goal:** dual-read with status resolution and slug exposure for approved+materialized rows.
**Includes:** the shipped version of the Step 3 Phase 1 my-voices proposal, extended with status mapping.

### Final: Step 3 reroute
**Files:** `app/api/insider/submit-voice/route.ts`
**Goal:** now safe to reroute. The full chain works.
This is the Step 3 that was deferred.

**Alternative:** ship B2a + B2b + B2c + Step 3 as one session if scope allows. Recommend the split for surgical execution and easier rollback. One session per sub-block keeps each commit reviewable.

---

## 9. Out of scope (hard rails)

- ❌ No schema changes beyond `contributions.published_article_id` (itself debatable — decide at B2a)
- ❌ No LuxAI pipeline redesign
- ❌ No frontend redesign of `app/dashboard/insider/page.tsx` or `app/admin/contributions/page.tsx` beyond minimum data-shape compatibility
- ❌ No dual-write (never write the same content to both tables during active state)
- ❌ No migration of existing legacy `bloglux_articles` 'Insider Voice' rows — they stay as-is, readable, not rewritten
- ❌ No changes to `/api/contributions` (already correct after Step 2)
- ❌ No changes to `lib/email-templates.ts` (already widened in Step 2)

---

## 10. Open questions to resolve at B2a pre-flight

1. **Back-reference column:** add `contributions.published_article_id` (clean) OR resolve via content match (ugly but no schema)?
2. **Admin UI row shape:** does `app/admin/contributions/page.tsx` iterate over fields that exist on both legacy and new rows, or does it require a shape normalizer before union?
3. **Legacy row write freeze:** when B2a ships, does `/api/insider/submit-voice` immediately reroute to canonical (making legacy table read-only for insider voices), or does reroute wait until B2c ships?
4. **Email on publish:** does the current legacy approve flow send a "your voice is published" email? If yes, materialization must preserve this.
5. **LuxAI approve interaction:** `/api/admin/luxai/approve/route.ts` references `type='insider_voice'` as a `bloglux_articles` publish flow. Is this path live, dormant, or retired? If live, it must either be deprecated or also widened.

---

## 11. Success criteria

B2 is validated when:

- An insider submits a voice → row appears in `/admin/contributions` voices tab within one UI refresh
- Admin approves → `contributions.status='approved'` + new `bloglux_articles` row materialized with correct slug
- The public URL `/insights/:slug` resolves and renders the piece
- The contributor's `my-voices` dashboard shows the voice as `PUBLISHED` with a working `View →` link
- All of the above works for new-path submissions; legacy-path submissions continue to work unchanged
- No cross-member data leakage in any query
- No duplicate rows in either `contributions` or `bloglux_articles` from a single submission

---

## 12. What this spec does NOT commit to

- A specific timeline
- A specific session count
- Whether Step 3 reroute happens before or after B2c
- Any UI polish beyond data-shape compatibility
- Any refactor of the duplicated `typeLabels` maps in `lib/email-templates.ts` (logged as separate tech debt)

---

**End of spec.** Next action when B2 is scheduled: read this doc, run B2a pre-flight against current repo state (repo may have drifted), then proceed per locked execution workflow.
