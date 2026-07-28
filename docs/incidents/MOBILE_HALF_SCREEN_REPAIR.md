# Mobile half-screen repair — post-fix verification

**Date:** 2026-07-28  
**Root cause:** `docs/incidents/MOBILE_HALF_SCREEN_ROOT_CAUSE.md`  
**Before evidence:** `docs/incidents/evidence/mobile-half-screen-before/`  
**After evidence:** `docs/incidents/evidence/mobile-half-screen-after/`

## Before (public deploy `3b5d781` @ 390×844)

| Metric | Value |
|--------|-------|
| shell width | **342** (max-width: 100vw−48) |
| main width | **701** |
| grid columns | `700.625px` |
| overflow | shell `hidden` clips content |
| document.scrollWidth | 390 (= client) — no pan escape |

## After (local production preview of repair build)

| Metric | Value |
|--------|-------|
| shell width | **390** (`max-width: 100%`) |
| main width | **390** |
| grid columns | `390px` / `minmax(0,1fr)` |
| overflowEls wider than viewport | **0** |
| raw ISO on Today | **0** |
| internal enums (`available_to_claim`, `work_item`, …) | **0** |
| smoke tags `[HOLms…]` / `[FMHms…]` | **0** (on measured Today surface) |

## Viewport matrix (authenticated family caregiver)

All phone portrait + phone landscape + short-landscape + tablets ≤820:

`scrollWidth ≤ clientWidth + 1` · `shell.width ≈ innerWidth` · `main.width ≤ shell`

| Viewport | Shell | Main | Scroll | Pass |
|----------|-------|------|--------|------|
| 320×568 … 430×932 | =vw | =vw | ok | PASS |
| 568×320 … 915×412 landscape | =vw | =vw | ok | PASS |
| 768×1024, 820×1180 | =vw | =vw | ok | PASS |
| 1024×768 | 976 (desktop inset) | multi-col | ok | DESKTOP (not phone bug) |

Routes at 390×844: Today, Care, People, Privacy, Documents — all shell/main 390.

## Code changes

1. **Shell CSS** (`src/styles/global.css` `@media (max-width:900px), ((max-height:500px) and (max-width:960px))`):
   - `max-width: 100% !important` on app-shell
   - `grid-template-columns: minmax(0,1fr)`
   - min-width 0 / overflow-wrap on content
   - safe-area topbar + bottom-nav padding
   - full-width mobile Relay
   - topbar: hide date/session label on phone; keep Relay tappable

2. **Presentation adapters** (`src/lib/humanCopy.ts`):
   - `stripLabResidue`, `workStatusLabel`, `sourceTypeLabel`, `humanCareLine`
   - embedded ISO → human time

3. **Today + handoff surfaces** apply adapters; cap dump sizes; human status labels.

## Remaining

- Founder physical-phone recheck required before freeze restore.
- Desktop ≥1024 still uses intentional floating shell margins.
- Deeper IA role variants (DSP pre-shift / care-recipient self) still partial.
- Virtual keyboard + 200% zoom + full screen-reader matrix not fully automated this pass.
