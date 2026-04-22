# JOBLUX — EXECUTION PLAN

**Source:** `docs/DEFECT_ANCHOR.md` (commit `bd1b658`)
**Rule:** Fix in order. No parallel work. No skipping phases.

---

## PHASE 1 — STRUCTURAL BLOCKERS (FOUNDATION FIRST)

👉 These break the system logic. Nothing else matters until they're fixed.

### 1. Unify intake system

- D1, D2, D3, D5, D6, D30
  👉 Outcome: ONE contribution object, ONE pipeline

### 2. Enforce moderation pipeline

- D7, D10, D11, D12
  👉 Outcome: ONE moderation flow, ONE status model

### 3. Fix content integrity violation

- D22 (critical)
  👉 Outcome: No data without source_url

### 4. Fix profile architecture

- D15, D17
  👉 Outcome: members = single source of truth

---

### 🚫 STOP CHECKPOINT

System must now:

- Accept → moderate → store → display consistently
- No duplicate flows
- No bypass paths

---

## PHASE 2 — SYSTEM CONSISTENCY

👉 Remove contradictions across system layers

### Moderation coherence

- D8, D9, D13, D14

### Vocabulary alignment

- D20

### Contribution model consistency

- D27

---

## PHASE 3 — DATA STRUCTURE CLEANUP

👉 Clean the database so it matches reality

### Remove parallel tables

- D23, D24

### Fix data tracking

- D25, D26

### Profile cleanup

- D16, D18

### System tables cleanup

- D28, D29

---

## PHASE 4 — SURFACE + EXPERIENCE FIXES

👉 Now fix what users actually experience

### Missing or broken surfaces

- D4

### Minor UI / logic issues

- D19, D21

---

## PHASE 5 — FINAL CONSOLIDATION

👉 Ensure everything connects cleanly

- Validate full contribution lifecycle (end-to-end)
- Validate moderation triggers
- Validate profile → contribution linking

(No new work — only validation)

---

## EXECUTION RULES (CRITICAL)

- One defect at a time
- One deploy at a time
- Verify before next
- No redesign
- No "while we're here"

---

## ORDER SUMMARY

```text
PHASE 1 → Core system works
PHASE 2 → System becomes consistent
PHASE 3 → Data becomes clean
PHASE 4 → UX becomes correct
PHASE 5 → System becomes reliable
```

---

## FIRST ACTION (start here)

👉 **D1 — Unify intake endpoints**

Everything else depends on it.

---

## WHY THIS PLAN WORKS

Because it follows:

**Structure → Consistency → Data → UX**

Not the reverse.
