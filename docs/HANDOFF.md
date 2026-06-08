# JOBLUX HANDOFF — 2026-06-08

## 🔥 SNAPSHOT
- **No blockers.** Remote main @2724827, working tree clean.
- Active focus shifted: **P2-A closed → WikiLux Engine** (ledger 14650938).
- Next 3: (1) run `wikilux-build` on Baccarat (read-only) + judge vs BRAND-PAGE-V1; (2) if worthy → persist-draft slice + `content_origin` column; (3) grow Discovery beyond first source families.

## 1. WHAT WAS COMPLETED TODAY
- **P2-A wrapper migration FULLY CLOSED.** All runtime Sonnet/WIKILUX_API_KEY callers migrated to `callClaude` (Haiku/ANTHROPIC_API_KEY), each prod-QA PASS: members/ai-review @c9b2499, wikilux/translate @ad78b64, assignments/import paste @11fe452 / url @05c1a85 / enrich @a523481. STATE close @3383809. Repo-wide re-grep: 0 active runtime caller (P0-1 dormant remains; UI literals inert; scripts/* not ported).
- **WikiLux Engine Design V2 = reference** @0747107 (`docs/WIKILUX_ENGINE_DESIGN_V2.md`). Mission: regenerateBrand memory→corpus; analyst over real sources; 6-module architecture; per-fact provenance.
- **Key discovery (read-only):** the reasoning engine already exists (`regenerateBrand.ts`, 16 sections, Haiku, orphan/P0-5) and the review workflow already exists (`wikilux-drafts`). NOT a reconstruction — only the fuel changes (memory→corpus).
- **WikiLux slice-1 prototype route SHIPPED** @2724827 (`app/api/admin/luxai/wikilux-build/route.ts`): POST{brand} → derive Wikidata/Wikipedia/official sources → fetch corpus → Haiku reasons sourced-or-empty → returns payload. NO DB write, NO publish, NOT run. tsc PASS.
- Provenance form decided (Mo+GPT): `content_origin` column (fiche) + per-fact `source_url`/`source_ref` (JSON).

## 2. STILL OPEN — ACTIVE ONLY
- `14650938` — WikiLux corpus reconstruction (engine lane) — luxai / high / open
- `427e69b1` — F-wikilux-build-prototype: route live, run Baccarat + judge, then persist-draft — luxai / high / open
- `22ddc956` — assignments-import-ui-response-contract-crash (admin import page crash, UI↔API) — System / normal / parked
- `1fa19868` — translate-open-post-write (unauth POST writes brand truth) — Security / medium / parked

## 3. NEXT 3 STEPS
1. Run `wikilux-build` on Baccarat — read-only (fetch + reason + return payload, no DB write); judge output vs BRAND-PAGE-V1.
2. If worthy → next slice: persist draft (status=pending, is_published=false) + add `content_origin` column + per-fact source_url/source_ref.
3. Grow Discovery beyond the first reliable source families (analyst-driven, not a fixed list).

## 4. NEXT SESSION START
- **Focus:** WikiLux Engine — prove reasoning-from-corpus on Baccarat.
- **IN:** run wikilux-build @2724827 on Baccarat (read-only QA, admin authed); judge vs BRAND-PAGE-V1; persist-draft slice if worthy.
- **OUT:** P2-A (closed); autonomous Discovery engine; the parked findings (import-UI crash, translate-open-post-write); publishing anything.

— Claude AI
