# AGENT ZERO — WHOLE-APP SIGNAL-FIRST / VISUAL UX SCORECARD

**Date:** 2026-07-29  
**Controller:** Agent Zero  

## Agency selection

| Path | Evidence | Responsibility | Repo | R/W | Artifact | Timeout | Stop |
|------|----------|----------------|------|-----|----------|---------|------|
| *(none)* | Sole writer | signal-first UX | caretaker-relay | write | Today + handoff densify | — | public smoke |

## Before (family Today, live)

From census (desktop-1366 / mobile-390 before repair): Today stacked handoff inbox, create-work form, notification ops, ambient essay, orientation wall, 6 work rows with escalate. Full-page height far above one viewport.

## After (public deploy `5df4d14` / `index-BUS525Zj.js`)

```text
TODAY NO CREATE WORK: PASS
TODAY NO FULL HANDOFF INBOX: PASS
TODAY COMPACT HANDOFF: PASS
TODAY NO NOTIF OPS: PASS
TODAY NO AMBIENT ESSAY: PASS
TODAY NO ORIENT CARD: PASS
TODAY PRIORITIES ≤3: PASS
PROBE MARKERS: PASS (0)
TODAY SCROLL RATIO: PASS (~1.0 mobile, ~1.03 desktop)

MOBILE TODAY: PASS (scrollH ≈ vh)
DESKTOP TODAY: PASS

FAMILY CAREGIVER EXPERIENCE: PASS (primary Today path)
DSP / CLINICIAN / SELF / MULTI-RECIPIENT FULL VISUAL CENSUS: PARTIAL (not re-censused all roles this deploy)

PEOPLE / DOCUMENTS / HISTORY / RELAY: PARTIAL (placement matrix defined; Today was the overloaded primary)

FOUNDER DESKTOP RECHECK: PENDING
FOUNDER PHYSICAL-PHONE RECHECK: PENDING

PRODUCT FREEZE: NOT RESTORED
```

## What moved where

| Removed from Today | Destination |
|--------------------|-------------|
| Full IncomingHandoffInbox | Care → My shift (sent/history collapsed) |
| Create unassigned work | Care / work (not on Today) |
| Escalate / Complete multi-actions | Claim only on Today |
| Notification delivery ops | Off caregiver primary |
| Ambient + Orient essays | Hero orientation line only |

## SHAs

```text
APP SOURCE/DEPLOY: 5df4d142c23f8e5e01e3a64fd4ead1251b8faae2
BUNDLE: assets/index-BUS525Zj.js
API SOURCE/DEPLOY: 4394cc53d18bba015ce7220865a91cc58c138176
DEPLOYMENT PARITY: YES
BACKGROUND WORKERS: 0
```

## Remaining internal gaps

1. Full multi-role multi-viewport after-census for Care/People/Documents/DSP/clinician still not exhaustive.  
2. Schedule/History as first-class nav destinations remain section-based under Care (placement matrix ok; dedicated tabs not required for freeze of this density fix).  
3. Founder desktop + physical-phone PENDING.

## Product files

- `src/pages/TodayPage.tsx`
- `src/components/IncomingHandoffInbox.tsx`
- `src/lib/humanCopy.ts`
- `src/App.tsx` (navigate to Care → shift)
- docs: placement matrix, baseline, before census, after smoke, screenshots
