# P0 Desktop Relay missing — reproduction

**Date:** 2026-07-28  
**Public app:** https://care.niovlabs.com  
**Principal:** Marcus Carter (`p-sadeil`)  
**Evidence:** `docs/incidents/evidence/p0-desktop-relay-missing/`

## Founder report (accepted as production truth)

Signed into the public desktop app; Relay chat window not usable. Prior “desktop PASS” rejected.

## Live runtime at investigation start

| Item | Value |
|------|--------|
| HTML | `/assets/index-D7XonDz3.js`, `/assets/index-Mw3DNFxk.css` |
| App tip (repo) | `70370f8` (docs) / product `eff3a6e` in lineage |
| API health | `understand_mode=llm`, `care_ai_data_class=synthetic`, Mode B |
| API SHA | `146a934` |
| Service worker | none |

## Visual repro (public, authenticated, viewport screenshots)

Evidence: `SCROLL_AWAY.json`, `*-at-top.png`, `*-after-scroll.png`.

| Viewport | Panel in view (top) | Toggle visible | Defect |
|----------|---------------------|----------------|--------|
| 1280×720 | partial / composer below fold | **no** | shell taller than viewport; composer clipped |
| 1366×768 | yes at top | **no** | no reopen control |
| 1440×900 | yes at top | **no** | no reopen control |
| 1512×982 | yes at top | **no** | no reopen control |
| 1920×1080 | yes at top | **no** | no reopen control |

### Root cause (proven)

1. **Desktop shell not viewport-locked** — `min-height` only; grid row grew with tall Today content; page scroll moved the rail; `position: sticky` failed under shell `overflow: hidden`.
2. **`.relay-thread { min-height: min(48vh, 420px) }`** — forced thread height pushed the composer below the panel bottom (overflow hidden / off viewport on short desktops e.g. 1280×720).
3. **No desktop reopen control** — `.relay-drawer-toggle { display: none }` outside drawer media; SideNav has no Relay item. Close/minimize left no obvious labeled control.
4. **Prior automated PASS was a false pass** — counted mounted DOM / initial top-of-page bounding boxes without scroll, short-height composer fit, or reopen-control contract.

## Contract chosen

**A + B hybrid:** persistent right-side desktop rail locked to the viewport; deliberate close minimizes rail; permanently visible labeled **Relay** control reopens it. Compact ≤1100 remains drawer with auto-open after auth/resize.

## Repair (product files only)

- `src/styles/global.css` — viewport-locked shell; rail `height:100%` (not sticky); thread `min-height:0`; desktop toggle always visible; `.relay-desktop-closed` collapses rail.
- `src/App.tsx` — `relayOpen` default true; `relay-desktop-closed` class; breakpoint resize re-opens; toggle aria; hooks above early returns.

No conversation wipe, no care-event delete, no Mode B / auth / medication workflow changes.
