# Final temporal / shift / signal — after proof

**Date:** 2026-07-29  
**API SOURCE/DEPLOY:** `020293387f0c5655770a55d23d3e658988e301a5`  
**APP SOURCE/DEPLOY:** `fc9c19635c43f93cb0f3599859387c534cab3232`  
**Evidence:** `docs/incidents/evidence/final-temporal-shift-after/`

## Plan split

| Prompt | Intent | Composition |
|--------|--------|-------------|
| How did Evelyn feel yesterday? | `YESTERDAY_WELLBEING` | Fever-first wellbeing; Tylenol secondary |
| What changed today? | `CHANGES_TODAY` | Human category facts; no raw domain labels |
| What changed since yesterday? | `CHANGES_SINCE_YESTERDAY` | Comparison wording (corrected / remains / pending) |
| How was the previous shift? | `PREVIOUS_SHIFT` | Natural narrative; one correction sentence |
| What needs review? | `TASKS_REMAINING` | 3 open lines (Allegra, Metformin, one dose_unit) |

## Today attention

Public Today “What needs you today” reduced from 5 raw med-verification cards to **3** canonical cards:

1. Dose unit needs review (collapsed family)  
2. Allegra pending verification  
3. Tylenol medication change (from handoff still-needs)

Raw `open_safety_reviews` still has multiple historical rows (not deleted). Presentation is semantic-reconciled only.

## Census

Desktop 1366, mobile 390, tablet 768: Today + Care + Relay screenshots under `final-temporal-shift-after/`.  
Relay already-open detection avoids double-toggle on compact layouts.

## Freeze

Founder desktop + physical-phone recheck **PENDING** → product freeze **NOT RESTORED**.
