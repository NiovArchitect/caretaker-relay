# P0 Relay restoration scorecard

**Date:** 2026-07-28  
**APP deploy:** `eff3a6e`  
**API deploy:** `146a934` (unchanged)  

## Reproduction

| Layout | Before fix | After fix |
|--------|------------|-----------|
| Desktop 1366 | Composer visible; send works | Same — rail always on |
| Mobile 390 | Panel **closed** (chat off-screen) | **panelOpen true**, composer true after login |
| Tablet 1024 | Risk of clipped rail | Drawer mode + open after login |

Evidence: `docs/incidents/evidence/p0-relay-missing/`

## Root cause

Mobile/tablet drawer defaults closed + mid-width three-column clip risk — **not** API death, **not** history deletion.

## Repairs

1. Auto-open Relay on ≤1100px after sign-in / restore  
2. Drawer breakpoint raised to **1100px**  
3. Toggle + bottom-nav force-visible in drawer mode  

## Non-regression

- HISTORICAL MESSAGES DELETED: **0**  
- CARE EVENTS DELETED: **0**  
- Desktop send + answer path: previously proven PASS  

## PRODUCT FREEZE

**NOT RESTORED** — founder physical-phone confirmation still required for P0 close.  
