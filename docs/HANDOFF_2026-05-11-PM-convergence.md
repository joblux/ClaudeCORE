# JOBLUX HANDOFF — 2026-05-11 PM (convergence)

## Shipped

- **`868ccd9`** — V12-divergence-4 Phase 1. Clienteling removed from View tab. Edit drawer + columns + API + EditorView fields preserved transitionally. Prod QA via Chrome MCP: PASS.
- **`e9fe284`** — V12-divergence-5 Phase 1 visual shell. Add Section trigger + EXTEND DOSSIER drawer with 8 disabled library rows (single file, +79 lines). 8 library rows in V12 order, B3 disabled (`opacity: 0.4`, `pointer-events: none`). Prod QA via Chrome MCP: PASS visually. Functional add behavior pending — user cannot actually add a section yet.
- **`docs(workflow): lock ProfiLux convergence mode`** — WORKFLOW_RULES.md gains PROFILUX CONVERGENCE MODE section; STATE CURRENT STEP rewritten; this handoff created.

## Unresolved (open ledger rows)

- **`3e8d6de2`** V12-divergence-4 — Phase 1 done. Final disposition deferred pending Skills / Luxury Fit / full ProfiLux review. **Open**, not closed.
- **`d243fc13`** V12-divergence-5 — Phase 1 visual shell done. Functional add behavior pending. **Open**, not closed.

## Posture reset

Convergence Mode locked. Locked HTML prototype is now the product spec for ProfiLux visual work. Workflow loop: read prototype → read live → compare → ship slice → repeat. Priority order: View → Manage → CV Merge → Edit refinement → behavioral cleanup. See WORKFLOW_RULES.md for full doctrine.

## Next strict step

Open next session with: **"Open JOBLUX session — convergence mode"**

Start with Priority 1 — View shell. Side-by-side compare against `docs/prototypes/profilux_journey_v12.html` scene 3. Declare highest-impact gap. Propose smallest convergence slice. Ship.

## Parked (unchanged)

- `12745f9d` — F-view-identity-mask-leak
- `ab6982db` — F-profilux-drawer-inline-maxwidth-deadcap
