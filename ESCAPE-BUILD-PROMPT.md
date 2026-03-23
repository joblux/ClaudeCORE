# JOBLUX ESCAPE — Full Build Prompt for Claude Code

## CONTEXT

You are working on the JOBLUX platform at /Users/momo/Documents/GitHub/ClaudeCORE/. This is a Next.js 14 App Router project with Supabase (PostgreSQL), NextAuth, Tailwind CSS, and AWS SES for email. The admin panel is at /admin with a sidebar layout in app/admin/layout.tsx.

The email infrastructure is already built — 17 templates in lib/email-templates.ts with AWS SES sending via lib/ses.ts. The Escape email templates (#10 escapeConsultationEmail and #15 adminNewEscapeEmail) are already exported and ready to wire up.

You are building JOBLUX Escape — the travel advisory section of the platform. Escape is the travel pages of JOBLUX, like the weekend supplement of a quality newspaper. It is NOT a booking engine. JOBLUX is a media partner of Fora Travel — showcasing advisors and connecting clients. JOBLUX does not provide, arrange, or guarantee any travel services.

---

## STEP 1: DATABASE — Run SQL migrations via Supabase

Connect to Supabase using the existing client pattern (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local). Execute these SQL migrations:

### Table 1: escape_destinations
```sql
CREATE TABLE IF NOT EXISTS escape_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT,
  country TEXT,
  hero_image TEXT,
  description TEXT,
  content TEXT,
  category TEXT,
  experience_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_escape_destinations_slug ON escape_destinations(slug);
CREATE INDEX idx_escape_destinations_status ON escape_destinations(status);
CREATE INDEX idx_escape_destinations_featured ON escape_destinations(featured);
```

### Table 2: escape_consultations
```sql
CREATE TABLE IF NOT EXISTS escape_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES members(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  contact_preference TEXT DEFAULT 'email',
  trip_types TEXT[] DEFAULT '{}',
  destination_text TEXT,
  experience_prefs TEXT[] DEFAULT '{}',
  occasion TEXT,
  preferred_dates TEXT,
  duration TEXT,
  date_flexibility TEXT,
  budget_range TEXT,
  plan_scope TEXT[] DEFAULT '{}',
  past_trips_text TEXT,
  favorite_hotels TEXT,
  additional_notes TEXT,
  travelers JSONB DEFAULT '[]',
  is_cruise BOOLEAN DEFAULT false,
  cruise_details JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'replied', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_escape_consultations_status ON escape_consultations(status);
CREATE INDEX idx_escape_consultations_user_id ON escape_consultations(user_id);
CREATE INDEX idx_escape_consultations_created ON escape_consultations(created_at DESC);
```

### Table 3: escape_advisors
```sql
CREATE TABLE IF NOT EXISTS escape_advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  bases TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  regions TEXT[] DEFAULT '{}',
  bio TEXT,
  travel_style TEXT,
  min_budget_per_night TEXT DEFAULT '$250',
  social_links JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Modify existing table: bloglux_articles — add tags column
```sql
ALTER TABLE bloglux_articles ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_bloglux_articles_tags ON bloglux_articles USING GIN(tags);
```

### Seed Mo's advisor profile
```sql
INSERT INTO escape_advisors (name, photo_url, bases, languages, specialties, regions, bio, travel_style, min_budget_per_night, status)
VALUES (
  'Mohammed Alex Mzaour',
  NULL,
  ARRAY['Paris', 'London', 'Dubai'],
  ARRAY['English', 'French', 'Arabic', 'Spanish'],
  ARRAY['Luxury Hotels & Resorts', 'Cultural Immersion', 'Gastronomy', 'Honeymoons', 'Multi-destination', 'Cruises'],
  ARRAY['Europe', 'Middle East', 'Asia', 'Indian Ocean', 'Caribbean'],
  'A seasoned travel advisor with deep expertise across luxury hospitality. Multilingual and well-traveled, specializing in curated itineraries that balance cultural discovery with refined comfort. Every trip begins with a complimentary video consultation to understand your travel style, preferences, and wishes.',
  'Cultural discovery meets refined comfort — boutique properties, local gastronomy, meaningful encounters.',
  '$250',
  'active'
)
ON CONFLICT DO NOTHING;
```

Execute all SQL via the Supabase client's `.rpc()` or via a direct REST call to the SQL endpoint. If rpc isn't available, create a temporary script at scripts/migrate-escape.ts that runs the SQL, execute it with `npx tsx scripts/migrate-escape.ts`, then delete the script.

---

## STEP 2: ESCAPE DESIGN TOKENS

Create lib/escape-theme.ts:

```typescript
/** Escape-specific design tokens — used in Escape pages only */
export const ESCAPE = {
  bg: '#FDF8EE',
  accent: '#2B4A3E',
  gold: '#B8975C',
  text: '#2B4A3E',
  body: '#5C5040',
  hint: '#8B7A5E',
  cardBg: '#FFFDF7',
  border: '#D4C9B4',
} as const
```

---

## STEP 3: BUILD /escape PAGE

Create app/escape/page.tsx — the main Escape landing page.

**Design:** Warm yellow background (#FDF8EE), photography-led, editorial feel. Less black than the rest of JOBLUX. Deep green (#2B4A3E) for headings and buttons. Earth tones throughout.

### Section 1: Hero
- Full-width section with warm overlay (not black — use a gradient from #2B4A3E/60 to transparent)
- Small label: "Private Travel Advisory · In partnership with Fora Travel"
- Headline: "Your next chapter begins with a journey"
- Subline: "Curated travel intelligence from seasoned advisors. Cultural discovery, refined comfort, memorable experiences."
- NO search bar, NO CTA button in the hero — this is editorial
- Use a placeholder hero image URL (Unsplash landscape) or a solid gradient if no image is available. Store the hero image URL in a const at the top of the file so it's easy to swap later.

### Section 2: Featured Destination Spotlight
- Fetch 3 published destinations from escape_destinations where featured = true, ordered by updated_at DESC
- Layout: 1 large card (left 60%) + 2 stacked smaller cards (right 40%)
- Each card: hero_image background, name overlay, region, description snippet
- Cards link to /escape/[slug]
- If fewer than 3 featured destinations exist, show whatever is available. If none, hide the section entirely.

### Section 3: Experience Category Pills
- Horizontal scrollable row of pill buttons
- Categories: Hotels & Resorts · Gastronomy · Wellness · Art & Culture · Adventure · Cruises · Family · Multi-destination
- Style: pill shape, border #D4C9B4, text #5C5040, on hover/active: bg #2B4A3E, text white
- For now, pills are decorative (no filtering). Add a TODO comment for future filter implementation.

### Section 4: Destination Cards Grid
- Fetch all published destinations from escape_destinations, ordered by name
- 3 columns on desktop, 1 on mobile
- Card: hero_image, name, region, "X experiences" badge (from experience_count)
- Cards link to /escape/[slug]
- If no destinations exist, show a placeholder message: "Destinations coming soon."

### Section 5: Latest Travel Editorial
- Fetch up to 4 published articles from bloglux_articles where 'travel' = ANY(tags), ordered by published_at DESC
- Magazine-style layout: 1 large + 3 small, or 4 equal cards
- Card: cover_image, title, excerpt, published date
- Link to /bloglux/[slug] (existing article pages)
- If no travel-tagged articles exist, hide the section entirely.

### Section 6: Advisor Snapshot
- Fetch the first active advisor from escape_advisors
- Card with: photo (or initials circle if no photo), name, bases (comma-separated), languages, specialties (first 4 as tags), travel_style quote, min_budget_per_night
- "Start your consultation" button → /escape/consultation
- Style: warm white card (#FFFDF7), subtle border, deep green button

### Section 7: CTA Strip
- Full-width warm section
- "Your next escape, designed for you."
- "A seasoned travel advisor will craft your perfect itinerary — from boutique hotels to cultural discoveries. Complimentary consultation, no commitment."
- Button: "Plan Your Escape" → /escape/consultation
- Style: bg #2B4A3E, text white/gold

### Section 8: Partner Logos (placeholder)
- Empty section with a comment: {/* Partner logos — future */}
- Do NOT render anything visible. Just reserve the spot in the component tree.

**Layout:** This page does NOT use the main site navigation layout (no dark JOBLUX header). Create app/escape/layout.tsx with:
- A minimal top bar: "JOBLUX" wordmark (link to /) + "ESCAPE" label + "In partnership with Fora Travel" right-aligned
- Style: bg white, border-bottom, JOBLUX in #1a1a1a, ESCAPE in #2B4A3E, partnership text in #8B7A5E
- Include a link back to the main site and a link to /escape/consultation
- Footer: "JOBLUX LLC · Luxury Talent Intelligence" + "Travel advisory services provided by independent advisors affiliated with Fora Travel, Inc." + link to /help + link to /terms
- The layout wraps all /escape/* pages

---

## STEP 4: BUILD /escape/[slug] — Destination Detail Page

Create app/escape/[slug]/page.tsx

- Fetch destination by slug from escape_destinations (where status = 'published')
- Return 404 if not found or not published

### Sections:
1. **Hero** — Full-width hero_image with name + region overlay
2. **Content** — Render the `content` field as rich HTML (dangerouslySetInnerHTML). Wrap in prose-like styling: max-width 720px, centered, good typography, image support.
3. **Experience highlights** — If destination has experience_count > 0, show a "Experiences" section. For now, just show the count as a badge. (Detail experiences are future.)
4. **Advisor card** — Same advisor snapshot as on the main /escape page. Reuse the component.
5. **"Plan this escape" CTA** — Button links to /escape/consultation?destination=[destination name] (pre-fills the destination field)
6. **Related destinations** — Fetch up to 3 other published destinations (exclude current), show as cards linking to their detail pages.

Generate Next.js metadata (title, description, openGraph) from the destination data.

---

## STEP 5: BUILD /escape/consultation — Consultation Form Page

Create app/escape/consultation/page.tsx

This is a dedicated full page with a multi-section form. NOT a multi-step wizard — show all sections on one scrollable page with clear section headers and visual separation.

**Use react-hook-form** (already in package.json) with the following structure:

### Page header:
- "ESCAPE · IN PARTNERSHIP WITH FORA TRAVEL" label
- "Start planning your escape."
- "A seasoned travel advisor will review your request and reach out within 48 hours for a complimentary video consultation."

### Form sections (all on one page, separated by dividers):

**Section 1: What kind of trip?**
- Chip/pill multi-select (click to toggle)
- Options: Hotels & resorts, All-inclusive, Bespoke / tailor-made, Cruise, Family / group travel, Honeymoon, Discovery / adventure, Wellness / spa retreat, City break, Multi-destination, Skiing / winter sports, Gastronomy / wine tour, Cultural immersion, I'm not sure yet
- Store as string array: trip_types

**Section 2: Where would you like to go?**
- Single text input
- Placeholder: "A destination, a region, or just an idea — don't worry if you're not sure yet."
- Store as: destination_text
- Pre-fill from URL param ?destination= if present (use useSearchParams)

**Section 3: Experience preferences**
- Chip/pill multi-select
- Options: Cultural discovery, Beach & coast, City exploration, Gastronomy, Nature & mountains, Wellness & spa, Adventure, Skiing, All-inclusive, Multi-city, Family-friendly, Romantic
- Store as string array: experience_prefs

**Section 4: What's the occasion?**
- Single-select radio buttons or pill chips
- Options: Holiday, Anniversary, Honeymoon, Birthday, Bucket list, Family gathering, Business + leisure, Just because
- Store as: occasion

**Section 5: Dates & duration**
- "Preferred dates" — text input, placeholder: "e.g. Late June 2026"
- "How many days?" — text input
- "Date flexibility" — single-select pills: Flexible / Somewhat flexible / Fixed dates
- Store as: preferred_dates, duration, date_flexibility

**Section 6: Budget per night**
- Single-select pills
- Options: $250 – $400, $400 – $600, $600 – $1,000, $1,000+, Let the advisor suggest
- Store as: budget_range

**Section 7: What should we plan?**
- Chip/pill multi-select
- Options: Hotels, Activities & tours, Flights, Restaurant reservations, Transfers & transport, Special events, Everything — surprise me
- Store as string array: plan_scope

**Section 8: Tell us about you**
- "What trips have really worked for you before?" — textarea (4 rows)
- "Hotels you've loved" — text input
- "Anything else we should know? (accessibility needs, must-dos, deal-breakers)" — textarea (3 rows)
- Store as: past_trips_text, favorite_hotels, additional_notes

**Section 9: Travelers**
- Dynamic table — starts with 1 row, "Add traveler" button adds more (max 9)
- Each row: Full name (text), Age (number), Dietary needs (text), Allergies (text)
- Store as JSON array: travelers

**Section 10: Contact details**
- Full name — text input (pre-fill from session.user.firstName + lastName if logged in)
- Email — text input (pre-fill from session.user.email if logged in)
- Phone — text input (optional)
- Preferred contact method — pills: Email / Phone / WhatsApp
- Store as: name, email, phone, contact_preference

**Cruise section** (conditionally shown when "Cruise" is selected in Section 1):
- Render this section between Section 7 and Section 8
- Departure port preference — text input
- Stateroom type — pills: Balcony / Interior / Ocean view / Suite / No preference
- Number of staterooms — number input
- Cruise line preference — text input
- Prior cruising experience — textarea
- Loyalty program numbers — text input
- Desired cruise duration — text input
- Destinations/ports of interest — textarea
- Onboard amenity preferences — textarea
- Pre/post-cruise hotel nights? — pills: Yes / No
- Accessibility requirements (ADA cabin) — pills: Yes / No + text if yes
- Store all in cruise_details JSON object, set is_cruise = true

**Submit button:**
- "Submit your travel request"
- Style: bg #2B4A3E, text white, full width on mobile, centered on desktop
- Disabled while submitting, show spinner

**After successful submit:**
- Replace form with confirmation message (don't navigate away):
  - "Thank you — your request has been received."
  - "A travel advisor will review your details and reach out within 48 hours for a complimentary video consultation."
  - "No commitment, no booking fees charged to you."
  - If user is NOT logged in, show soft CTA: "Want to access JOBLUX career intelligence too?" with link to /members
  - Button: "Back to Escape" → /escape

**Legal footer (always visible below form):**
- "Travel advisory services featured on JOBLUX Escape are provided by independent advisors affiliated with Fora Travel, Inc. JOBLUX is a media partner and does not provide, arrange, or guarantee any travel services."

### Design notes:
- Background: #FDF8EE
- Card/form area: #FFFDF7 with subtle border
- Chip/pill style: border #D4C9B4, text #5C5040, selected: bg #2B4A3E text white
- Input style: bg white, border #D4C9B4, focus border #2B4A3E
- Section headers: text #2B4A3E, font-semibold, with subtle bottom border
- Generous spacing between sections (py-8 or similar)

---

## STEP 6: CONSULTATION API

Create app/api/escape/consultations/route.ts

### POST — Submit consultation
1. Parse and validate the request body
2. Check session — if logged in, attach user_id (session.user.memberId)
3. Insert into escape_consultations
4. Send confirmation email to the visitor using the EXISTING template:
   ```typescript
   import { sendEmail } from '@/lib/ses'
   import { escapeConsultationEmail, adminNewEscapeEmail, ADMIN_ALERT_EMAIL } from '@/lib/email-templates'
   ```
   - To visitor: escapeConsultationEmail({ firstName }) → subject: "We received your travel request"
   - To admin: adminNewEscapeEmail({ name, email, tripType, destination, budget, dates, tier }) → subject: "New travel request: [name] — [destination]"
   - For tier: if user is logged in, fetch their role from members table. If anonymous, pass tier: "Visitor"
5. Return { success: true, consultation_id }

### GET — List consultations (admin only)
1. Require admin session
2. Support query params: status, page, limit, search
3. Return consultations with pagination
4. Include user profile data if user_id is set (join members table for full_name, role, avatar_url)

---

## STEP 7: CONSULTATION STATUS API

Create app/api/escape/consultations/[id]/route.ts

### GET — Get single consultation (admin only)
- Return full consultation record with linked user profile if available

### PUT — Update consultation status (admin only)
- Accept { status } in body
- Valid statuses: new, replied, in_progress, completed
- Update the record

---

## STEP 8: DESTINATIONS API

Create app/api/escape/destinations/route.ts

### GET — List destinations
- Public: return published destinations only (status = 'published')
- Admin: return all destinations with status filter
- Support: featured filter, category filter, search, pagination

### POST — Create destination (admin only)
- Accept: slug, name, region, country, hero_image, description, content, category, experience_count, featured, status
- Generate slug from name if not provided (lowercase, hyphenated)
- Insert and return

Create app/api/escape/destinations/[id]/route.ts

### GET — Single destination
- Public: by slug or id, published only
- Admin: any status

### PUT — Update destination (admin only)
- Accept partial updates
- Set updated_at to now()

### DELETE — Delete destination (admin only)
- Soft or hard delete (hard delete is fine for now)

---

## STEP 9: ADVISORS API

Create app/api/escape/advisors/route.ts

### GET — List advisors
- Public: return active advisors only
- Admin: return all

### POST — Create advisor (admin only)

Create app/api/escape/advisors/[id]/route.ts

### GET — Single advisor
### PUT — Update advisor (admin only)
### DELETE — Delete advisor (admin only)

---

## STEP 10: ADMIN — ESCAPE PAGES

### 10a: Admin Escape page with tabs

Create app/admin/escape/page.tsx — admin escape management with 3 tabs:

**Tab 1: Destinations**
- Table: name, region, status badge (draft/published), featured toggle, experience_count, actions (edit/delete)
- "Add destination" button → opens inline form or /admin/escape/destinations/new
- Search bar
- Click row → edit form (inline or separate page, your choice — inline modal is fine)

**Tab 2: Articles**
- Fetch articles from bloglux_articles where 'travel' = ANY(tags)
- Table: title, published_at, status
- Link to existing article editor at /admin/articles/[id]
- This tab just shows travel-tagged articles — no separate CRUD needed

**Tab 3: Advisors**
- Table: name, bases, languages, status badge (active/inactive), actions
- "Add advisor" button → inline form
- Edit form: name, photo_url, bases (comma-separated input → array), languages, specialties, regions, bio, travel_style, min_budget_per_night, social_links, status

**Analytics strip at top of page:**
- 4 stat cards: Destinations (total published), Travel Articles, Pending Consultations, Total Requests
- Fetch counts from the respective tables

### 10b: Admin Consultations page

Create app/admin/escape/consultations/page.tsx

- Table listing all consultations ordered by created_at DESC
- Columns: Name, Email, Destination, Trip Type(s), Status badge, Date submitted, JOBLUX Member (show tier badge if user_id exists, "Visitor" if null)
- Search bar (search by name, email, destination_text)
- Filter by status (tabs or dropdown): All / New / Replied / In Progress / Completed
- Click row → expandable detail or slide-over panel showing ALL consultation fields
- Status update dropdown in the detail view (calls PUT API)
- Badge colors: New = blue, Replied = yellow, In Progress = purple, Completed = green

### 10c: Update admin sidebar

In app/admin/layout.tsx, add these nav items:

Under the CONTENT section (after WikiLux):
```
{ label: 'Escape', href: '/admin/escape', icon: Palmtree }
```
Note: Use `import { Palmtree } from 'lucide-react'` — if Palmtree doesn't exist in the installed version, use `Compass` or `Globe` instead. Check which escape-themed icons are available in lucide-react.

Under the ADMIN section (after Contributions):
```
{ label: 'Consultations', href: '/admin/escape/consultations', icon: MessageSquarePlus }
```
Note: If MessageSquarePlus doesn't exist, use `MessageCircle` or `ClipboardList`. Add a countKey for pending consultations:
```
{ label: 'Consultations', href: '/admin/escape/consultations', icon: MessageSquarePlus, countKey: 'pending_consultations' }
```

Update the sidebar counts API (app/api/admin/sidebar-counts/route.ts) to include pending_consultations count:
```sql
SELECT COUNT(*) FROM escape_consultations WHERE status = 'new'
```

---

## STEP 11: SITE INTEGRATION — Escape sprinkled across the platform

### 11a: Homepage — Section 8 (Travel Advisory card)

Find the homepage at app/page.tsx (or app/(public)/page.tsx). Add a new section near the bottom:

- Card with warm background (#FDF8EE)
- "Private Travel Advisory" label in #2B4A3E
- Pull the latest featured destination's hero_image as background (or use a warm gradient fallback)
- Brief text: "Curated travel intelligence from seasoned advisors."
- Button: "Discover Escape" → /escape
- Style: should feel like a warm invitation, distinct from the black/gold intelligence sections

### 11b: Dashboard — "Your next escape" card

Find the member dashboard at app/dashboard/page.tsx. Add a compact card:

- Only show for candidate tiers (rising, pro, professional, executive) — NOT business or insider
- Small warm card with Escape branding
- "Your next escape" + brief teaser
- Button: "Explore" → /escape
- If the user has submitted consultations, show a "Your travel requests" link too

### 11c: Footer — Add "Private Travel Advisory" link

Find the site footer component. Add under a Services or Explore column:
- "Private Travel Advisory" → /escape

### 11d: Article tag integration

In the existing article display/listing pages (app/bloglux/page.tsx or similar), articles with the "travel" tag should show a small "Escape" badge. No major changes needed — just a visual indicator.

---

## STEP 12: SHARED COMPONENTS

Create reusable components to avoid duplication:

### components/escape/AdvisorCard.tsx
- Reusable advisor card used on /escape, /escape/[slug], and admin
- Props: advisor object
- Shows: photo/initials, name, bases, languages, specialties, travel_style, min_budget

### components/escape/DestinationCard.tsx
- Reusable destination card for grids
- Props: destination object, size ('small' | 'large')
- Shows: hero_image, name, region, experience_count badge

### components/escape/ChipSelect.tsx
- Reusable chip/pill multi-select component for the consultation form
- Props: options (string[]), selected (string[]), onChange, multi (boolean), label
- Style: pill shape with Escape design tokens

### components/escape/EscapeCTA.tsx
- Reusable CTA section
- Props: variant ('strip' | 'card' | 'inline')
- Links to /escape/consultation

---

## STEP 13: METADATA & SEO

Add Next.js metadata for all Escape pages:

- /escape: title "Private Travel Advisory | JOBLUX Escape", description about curated travel
- /escape/[slug]: dynamic title from destination name, description from destination.description
- /escape/consultation: title "Plan Your Escape | JOBLUX", description about consultation

---

## STEP 14: LEGAL — Terms of Use addition

Find the Terms of Use page (likely app/terms/page.tsx or similar). Add a new section:

**"Travel Advisory Services"**
- "Travel advisory services featured on JOBLUX Escape are provided by independent advisors affiliated with Fora Travel, Inc. JOBLUX is a media partner and does not provide, arrange, or guarantee any travel services."
- "All bookings, itineraries, and travel arrangements are between the client and their Fora Travel advisor."
- "Each advisor is independently licensed and insured through Fora Travel, Inc."

---

## CONSTRAINTS

- Use the existing Tailwind + utility class patterns from the codebase
- Escape pages should feel like a visual break — warm, inviting, photography-led
- NEVER display any email address on any page or in any footer (use "Visit our help centre" links)
- Import email functions from lib/email-templates.ts and lib/ses.ts — do NOT create new email templates
- The consultation form is open to ALL visitors (no login wall)
- Pre-fill contact details for logged-in users (check session via useSession from next-auth/react on client, or getServerSession on server)
- All admin routes must check for admin role
- Mobile responsive throughout — test at 375px width mentally
- Use existing Supabase client patterns from the codebase (createClient with service role key for API routes)
- Do NOT create any new email template functions — import escapeConsultationEmail and adminNewEscapeEmail from lib/email-templates.ts
- Escape layout is SEPARATE from the main site layout — /escape/* pages have their own warm, minimal nav

---

## GIT

After all changes:
```
git add -A
git commit -m "Build JOBLUX Escape: travel advisory pages, consultation form, admin panel, site integration"
git push origin main
```
