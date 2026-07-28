# MOBILE HALF-SCREEN ROOT CAUSE

**Date:** 2026-07-28  
**Public app:** https://care.niovlabs.com (deploy `3b5d781` at diagnosis)  
**Founder report:** After login on physical phone, approximately half the screen is missing.

## Reproduction (authenticated, Chromium mobile emulation)

Evidence: `docs/incidents/evidence/mobile-half-screen-before/`

| Viewport | document.scrollWidth ≤ clientWidth | Shell width | Main width | Notes |
|----------|------------------------------------|-------------|------------|-------|
| 390×844 | yes (scrollWidth=390) | **342** | **701** | shell clips main |
| 320–430 portrait | yes | ~viewport−48 | ~700 | same pattern |
| Landscape 844×390 | yes | — | 796 | wider shell |

Key measurement at 390×844 (`SHELL_LAYOUT_390.json`):

```json
{
  "innerWidth": 390,
  "shell": {
    "width": 342,
    "maxWidth": "342px",
    "overflow": "hidden",
    "gridTemplateColumns": "700.625px"
  },
  "main": {
    "width": 701,
    "class": "workspace",
    "overflowX": "auto"
  },
  "topbar": { "width": 701 },
  "bottomNav": { "width": 701 }
}
```

`hasCrShell: false` — live app uses legacy grid path  
`.app-shell[data-testid="app-shell"]:not(:has(.cr-shell))`

## Exact causes (compound)

### 1. Desktop floating-shell max-width not cleared on mobile

Base rule (`global.css` ~403–404):

```css
width: min(var(--cr-shell-max), calc(100vw - 48px));
max-width: calc(100vw - 48px);
overflow: hidden;
```

`@media (max-width: 900px)` sets `width: 100%` and `margin: 0` but **does not reset `max-width`**.

On a 390px phone: `max-width = 390 − 48 = 342px`.

The product shell only occupies ~88% of the physical width, and with overflow hidden, content outside the shell is invisible — reads as “half the screen missing.”

### 2. Main content intrinsic width ~700px

Unbreakable strings (raw ISO timestamps, long labels, smoke tags) expand `main.workspace` / topbar / bottom-nav to ~700px.

### 3. Shell `overflow: hidden` + child wider than shell

Shell clips the 701px content to 342px. Only the left portion of cards and text is visible. Horizontal scroll is suppressed at document level (`scrollWidth ≈ clientWidth`) so users cannot even pan to the rest.

### 4. Closed relay drawer still off-screen (secondary)

Relay panel uses `transform: translateX(105%)` when closed — contributes to off-viewport element inventory but is not the primary “half screen” clip.

## Not the primary cause

- Desktop sidebar still in layout flow (sidenav `display: none` on mobile)  
- Service worker (not required for this measurement)  
- Missing `cr-shell` wrapper alone (legacy path is intentional)  
- Pure “stacked desktop cards” (that is a separate clarity defect)

## Fix order

1. **P0 shell:** mobile max-width 100%; overflow-x safe; min-width 0 on grid children; constrain content.  
2. **P0 content width:** word-break / presentation adapters so intrinsic width cannot force 700px.  
3. **P1 clarity:** humanize times/enums, remove smoke tags, collapse Today dump.

## Acceptance

For every primary authenticated route on phone viewports:

- shell width = `innerWidth` (±1px)  
- main width ≤ shell width  
- `scrollWidth ≤ clientWidth + 1`  
- no half-clipped cards  
- founder physical phone recheck required  
