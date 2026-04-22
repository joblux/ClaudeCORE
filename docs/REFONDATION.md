# JOBLUX — Refondation

> **Status:** LOCKED DOCTRINE
> **Date locked:** 13–14 April 2026
> **Owner:** Mo (Mohammed Mzaour)
> **Ledger entry point:** `d51c8c40-88c2-4c08-a54c-129724f41fad` (admin_tasks)
> **Related:** `3ee2c38b-43e3-4dbb-8d72-05ea9ff1f4cb` (Defect Anchor — 27 defects)
>
> This document is the canonical reference for the JOBLUX Refondation.
> It is locked. It should be cited at the start of any session that touches
> profiles, contributions, access, registration, or vocabulary.
>
> Its companion document is the Defect Anchor, which inventories where the
> live product still diverges from this doctrine.

---

## Point de départ

JOBLUX avait un beau site public (brands, signals, insights) mais le moteur
interne — ce qui fait que les gens s'inscrivent, contribuent, et reviennent —
n'était pas pensé en profondeur. On a tout repris.

---

## Pilier 1 — ProfiLux repensé (verrouillé)

- Plus un formulaire : **l'objet central de la plateforme**
- **5 faces** : candidat, client, admin, vitrine externe, système
- **Un seul ProfiLux pour tous les tiers** (pas de ProfiLux Light vs Premium)
- **Tunnel d'inscription fermé** : pas de nav site pendant l'onboarding
- **CV parsing via Haiku** (~$0.001 par CV)
- **Vérification étape par étape** : CV prefill → user validation → admin moderation
- **Prototype interactif 11 écrans** livré (`~/Desktop/joblux-prototypes/`)

**Principe** : Le CV n'est pas le système — seulement prefill + validation admin.
ProfiLux = source of truth. Devient : recruiting asset (envoyé aux clients),
shareable luxury-standard resume, contribution trigger system.

---

## Pilier 2 — Contribution model repensé (verrouillé)

- **Pilier unique** : **salaire vérifié par poste** (company + title + city + country + period)
- **Un candidat = plusieurs salaires** (un par poste de sa carrière, pas un salaire "actuel" unique)
- **Même logique pour interviews et culture** (per-position, pas per-person)
- **3 statuts** :
  - `Approved` — publié, contributeur notifié
  - `Unapproved` — rejeté, contributeur notifié
  - `Filed` — archivé silencieusement (pas de notification)
- **Sollicitation à chaque expérience** déclarée dans ProfiLux, **sans filtre
  luxe/non-luxe** (si tu as bossé chez McDonald's avant Dior, JOBLUX demande
  le salaire McDonald's aussi)
- **Unlock system désactivé au lancement** (pas de paywall "contribue pour voir")

**Principe** : construire un dataset propriétaire par accumulation, pas par
échange transactionnel.

---

## Pilier 3 — Access model clarifié (verrouillé)

- **Zéro tier gates** — tout le contenu est ouvert à tous les tiers
- **Contribution-gated seulement** — la profondeur se débloque par contribution,
  pas par tier
- **Le tier détermine l'opportunité, pas l'accès**
- **Business** est renommé **"Company"** côté UI (DB reste `business`)

**Principe** : un Rising qui contribue voit plus qu'un Executive passif.
Le tier signale un segment de marché (early / mid / senior / company / insider),
pas un niveau de privilège.

---

## Pilier 4 — Registration flow redessiné (verrouillé)

**Séquence** :

    /connect
      → /select-profile (3 tiers + lien discret Insider)
      → Auth (5 options : Google, LinkedIn, Apple, Microsoft, email)
      → Tunnel ProfiLux fermé
      → CV upload
      → Parsing (Haiku)
      → Vérification utilisateur étape par étape
      → Submit
      → Pending
      → Mo approuve
      → Welcome email + accès dashboard

**Règles** :

- **Auth crée une entrée DB, PAS un compte** — l'utilisateur n'a pas de compte
  tant que Mo n'a pas approuvé
- **Tunnel fermé** : pas de header global, pas de nav site pendant l'onboarding
- **Insider retiré de `/select-profile`** — page dédiée `/insider`, sur invitation Mo uniquement
- **Minimum submit** :
  - Rising / Executive : nom + ville + pays + rôle actuel + (CV OR 1 expérience)
  - Business (Company) : infos company + contact
  - Insider : via lien d'invitation

---

## Pilier 5 — Nomenclature unifiée (verrouillé)

Vocabulaire **partagé** entre WikiLux (brands), ProfiLux (profils),
Business Briefs (demande), et le moteur de matching.

**Doctrinal counts (locked):**

| Dimension | Doctrine claims | Canonically defined in code? |
|---|---|---|
| Secteurs | 8 | ❌ Not defined — see canonical section + known gaps |
| Sous-secteurs | 35 | ❌ Not defined |
| Départements | 20 | ✅ `DEPARTMENTS` in `lib/assignment-options.ts` |
| Niveaux de séniorité | 9 | ✅ `SENIORITY_LEVELS` in `lib/assignment-options.ts` |
| Spécialisations | 28 | ❌ Not defined |

**Principe** : un Business Brief qui demande "Director, E-commerce, Fashion,
EMEA, French+English" doit parler exactement le même vocabulaire qu'un
ProfiLux qui dit "Director, E-commerce, Fashion, Paris, FR+EN". Sinon le
matching ne marche pas.

---

## Cadre global (meta-doctrine)

Ces 5 piliers s'inscrivent dans une architecture plus large (source : project file `refoundation`) :

**3 sources de vérité**

- **WikiLux** = Market Truth (brands comme nodes fixes d'intelligence)
- **ProfiLux** = Human Truth (profils structurés, vivants, non-CV)
- **Businesses** = Demand Truth (besoin, couche secondaire — ne définit pas la réalité du système)

**2 moteurs d'intelligence**

- **LuxAI + sourcing externe** : couche de transformation (recherche, structure,
  synthèse, formate) — PAS une source de vérité
- **Contributions + data interne** : déclenchées depuis ProfiLux, pas des
  formulaires passifs

**1 couche analytique** : interprète le système, ne remplace ni le sourcing
ni les contributions.

**Positioning** : pas un social network, pas un job board, pas un resume service
→ plateforme d'intelligence luxe curée, high-integrity.
*"Luxury, decoded"*.

---

# Canonical vocabulary

The shared taxonomy is sourced from a single file:
`lib/assignment-options.ts`.

Two other files form the shim chain:
- `lib/job-brief-options.ts` — re-exports everything from `assignment-options.ts`
- `lib/profile-options.ts` — re-exports the shared subset

If a value is not in `lib/assignment-options.ts`, it is not canonical.

## DEPARTMENTS (20 values — canonical)

Source: `lib/assignment-options.ts`, `export const DEPARTMENTS`.
Verbatim as of 22 April 2026.

1. Retail
2. E-commerce
3. Marketing & Communications
4. Merchandising
5. Buying
6. Design & Creative
7. Product Development
8. Supply Chain & Logistics
9. Finance & Administration
10. Human Resources
11. IT & Digital
12. Legal & Compliance
13. Client Relations (CRM)
14. Visual Merchandising
15. Store Operations
16. Wholesale
17. PR & Events
18. Sustainability
19. Executive / General Management
20. Other

**Matches doctrine claim (20).** ✅

## SENIORITY_LEVELS (9 values — canonical in code)

Source: `lib/assignment-options.ts`, `export const SENIORITY_LEVELS`.
Verbatim as of 22 April 2026.

1. Intern/Trainee
2. Junior (0–2 yrs)
3. Mid-level (3–5 yrs)
4. Senior (6–10 yrs)
5. Lead / Manager
6. Director
7. VP / Head of
8. C-Suite / Executive
9. Board / Advisory

**Matches doctrine claim (9) in code.** ✅
**Does NOT match DB enforcement.** ❌ — see known gaps.

## SECTORS (doctrine: 8 — NOT canonically implemented)

**Status:** claimed by doctrine, not defined in any shared constant.

- No `export const SECTORS` anywhere in `lib/`, `components/`, or `app/`.
- Page-local derivations only:
  - `app/brands/all/page.tsx` — `useMemo` from `wikilux_content.sector` DB values
  - `app/wikilux/all/page.tsx` — `useMemo` from `wikilux_content.sector` DB values
  - `app/admin/events/page.tsx` — derived from `events.sector` DB values
- Each page reads drifted DB values at runtime — see gap section.

**The 8 sectors remain doctrinal until a canonical `SECTORS` constant is added.**

## SUBSECTORS (doctrine: 35 — NOT canonically implemented)

**Status:** claimed by doctrine, not defined anywhere in code.

No `SUBSECTORS` or `SUB_SECTORS` export exists.
Not used by any surface today.

## SPECIALIZATIONS (doctrine: 28 — NOT canonically implemented)

**Status:** claimed by doctrine, not defined anywhere in code.

No `SPECIALIZATIONS` or `SPECIALISATIONS` export exists.
Not used by any surface today.

---

# Known gaps (doctrine vs live reality, as of 22 April 2026)

This section is the honest counterpart to the doctrine above.
It exists so the doctrine can be read without illusion.

## Gap 1 — Seniority split (code 9, DB 7)

- `lib/assignment-options.ts` `SENIORITY_LEVELS` = 9 values
- `search_assignments.job_briefs_seniority_check` enforces only 7:
  `intern, junior, mid-level, senior, director, vp, c-suite`
- **Missing from DB CHECK constraint:**
  - `Lead / Manager`
  - `Board / Advisory`
- **Consequence:** two code-only values cannot be persisted on an assignment.

## Gap 2 — Seniority vocabulary mismatch (briefs vs assignments)

- `search_assignments.seniority` uses:
  `mid-level, senior, director, vp, c-suite` (lowercase enum)
- `business_briefs.seniority_level` uses (no CHECK constraint):
  `Manager, Senior Manager, Director` (title-case, different scale)
- **Consequence:** the brief → assignment bridge must map values across vocabularies.
  Matching algorithm will produce false negatives until vocabularies are reconciled.

## Gap 3 — Sector drift in DB

- No canonical `SECTORS` constant in code.
- `wikilux_content.sector` DB contains 12 drifted values observed on 22 April 2026:
  - Watches & Jewellery (41)
  - Fashion (35)
  - Fashion & Accessories (24)
  - Hospitality (14)
  - Wine & Spirits (12)
  - Art & Culture (11)
  - Beauty & Fragrance (10)
  - Hospitality & Fine Food (10)
  - Automotive (9)
  - Spirits & Dining (7)
  - Beauty (2)
  - Aviation & Yachting (1)
- **Drift pairs:**
  - Fashion ↔ Fashion & Accessories
  - Beauty ↔ Beauty & Fragrance
  - Hospitality ↔ Hospitality & Fine Food
  - Wine & Spirits ↔ Spirits & Dining
- **Consequence:** sector filters, brand taxonomies, and analytics are all
  reading inconsistent values.

## Gap 4 — Subsectors not implemented

- Doctrine: 35 values.
- Code: zero.
- DB: no column dedicated to subsector.
- Consequence: ProfiLux cannot express subsector granularity today.

## Gap 5 — Specializations not implemented

- Doctrine: 28 values.
- Code: zero.
- DB: no column.
- Consequence: matching cannot use specialization signal today.

## Gap 6 — Business briefs taxonomy not enforced

- `business_briefs` has no CHECK constraints at all on `sector`, `function`,
  or `seniority_level`.
- Observed values in DB:
  - `function` (4 distinct): E-commerce, General Management, Retail, Strategy
  - `sector` (3 distinct): Watches & Jewellery, Fashion, Jewellery
  - `seniority_level` (3 distinct): Manager, Senior Manager, Director
- Consequence: free-text drift on the demand side.

---

# Follow-up ledger candidates

These are NOT yet created as ledger rows — Mo's call on whether to open them.
Recommended at normal priority, System category.

1. Define `SECTORS` canonically (8 values) in `lib/assignment-options.ts`
2. Define `SUBSECTORS` canonically (35 values) in `lib/assignment-options.ts`
3. Define `SPECIALIZATIONS` canonically (28 values) in `lib/assignment-options.ts`
4. Extend `search_assignments.seniority` CHECK constraint to include
   `lead-manager` and `board-advisory` (or rename the canonical values
   for DB-compat casing)
5. Add CHECK constraints to `business_briefs` for sector / seniority_level /
   function once canonical lists exist
6. Reconcile `wikilux_content.sector` drift against canonical SECTORS
   (data migration + bulk update)

---

# Usage

- Cite this doc at session open instead of restating the 5 pillars.
- If a change touches profiles, contributions, access, registration, or
  vocabulary, check against this doc first.
- If the doctrine needs to evolve, update this file + the ledger row,
  never improvise in code.

---

*End of REFONDATION.md — generated from Apr 13–14 locked sessions, Apr 18
audit alignment, and Apr 22 vocabulary verification against
lib/assignment-options.ts.*
