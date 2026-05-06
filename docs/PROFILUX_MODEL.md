# PROFILUX — CANONICAL MODEL

**Status:** Locked May 6, 2026  
**Supersedes:** ProfiLux journey wizard, M6 admission gate, submit / pending / approval workflow

---

## 1. CANONICAL OBJECT

ProfiLux is a single living professional profile object, owned continuously by the user.

It is simultaneously:
- resume
- recruiter profile
- matching profile
- share profile
- export profile
- living career passport

All views are projections of the same object:
- self dashboard
- ATS view (Mo)
- recruiter view
- public share `/p/[name]`
- PDF exports
- matching layer

There is no separate candidate submission object.

---

## 2. WHAT IS REMOVED

Removed from the model:
- onboarding wizard
- submit/finalize flow
- pending state
- Mo approval of profile
- frozen/locked profile
- candidate submission object
- wizard mentality

Mo approval only applies to:
- platform access
- contributions (salary reports, insider voices, brand corrections)

Never to ProfiLux itself.

---

## 3. FLOW

Access request  
→ Mo approval (platform access only)  
→ dashboard (`/dashboard/candidate`)  
→ Continue ProfiLux  
→ fresh CV upload  
→ Haiku parse  
→ populated ProfiLux generated automatically  
→ user lands on living document  
→ reviews / corrects / enriches inline  
→ profile grows continuously over time

Identity basics are seeded from signup before CV upload.

---

## 4. UI MODEL

View-first passport model (Apr 13 feeling preserved).

No Airtable/global edit mode.

### Highlight pattern
- subtle gold border/glow
- pills: Missing / Review / AI inferred
- top completion bar
- sidebar readiness breakdown

### Edit interactions
- inline = short fields
- drawer = rich objects
- modal = destructive only

### AI inferred
1-click confirm removes the pill and verifies the field.

---

## 5. SHARE / EXPORT

### Public URL
`/p/[name]`
- OFF by default
- user activates explicitly

### PDFs
- Download PDF = full private version
- Share PDF = filtered via maskable toggles

### Email
Sends share link first. PDF attachment later.

### Settings
"Edit profile" becomes Settings:
- public URL ON/OFF
- maskable fields
- export
- account preferences

Maskable fields:
- employer
- salary
- availability
- phone
- references

---

## 6. CV RE-UPLOAD

User can re-upload CV anytime.

Behavior:
- modal "X changes detected"
- accept/reject field by field
- merge into existing ProfiLux

No silent auto-merge.

---

## 7. FIELDS

### Tier 0
Seeded at signup:
- name
- email
- location

### Tier 1
Recruiter-critical:
- notice period
- work authorization
- salary history
- reporting line
- budget responsibility
- team size

### Tier 2
Credibility enrichment:
- certifications
- awards
- references
- portfolio
- publications
- memberships

### Existing Phase 4 fields
- expertise_tags
- skills
- markets
- departments
- locations
- contract_types
- seniority
- total_years_experience
- years_in_luxury
- salary_min/max/currency
- education_records
- member_languages

---

## 8. MATCHING ENTRY

Matching requires BOTH:
1. Core fields complete:
   - identity
   - current role
   - at least 1 experience
   - availability
   - work authorization
   - notice period

2. User consent toggle:
   - Considering opportunities = ON

No arbitrary threshold.
No Mo bottleneck.

---

## 9. RELATIONSHIP TO PHASE 4

Phase 4 editor/resolver work remains valid substrate.

What changes:
- wizard framing
- M6 admission mentality
- submit/pending logic

The living-object model replaces them.

---

## 10. PROTOTYPE STATUS

`~/Desktop/joblux-prototypes/profilux_flow_v3.html`

Directional only.
Not implementation source.
Real implementation must start from:
- live dashboard
- real Continue CTA
- existing repo/API flows
