# P0 Relay chat missing — reproduction

**Date:** 2026-07-28  
**Public app:** https://care.niovlabs.com  
**App deploy at repro:** `67da9ee` · bundle `index-BfWNyDnO.js` · CSS `index-D3YlPOwz.css`  
**API deploy:** `146a934`  

## Evidence

`docs/incidents/evidence/p0-relay-missing/REPRODUCTION.json`

## Results (public Playwright)

| Case | Shell | Panel mounts | Composer default | Toggle | After open |
|------|-------|--------------|------------------|--------|------------|
| desktop Marcus 1366 | yes | yes | **yes** | no (desktop rail) | n/a |
| desktop Marcus 1440 | yes | yes | **yes** | no | n/a |
| mobile Marcus 390 | yes | yes | **no** (drawer closed) | **yes** | **composer yes** |
| mobile Walter 390 | yes | yes | **no** | **yes** | **composer yes** |
| desktop Maya 1366 | yes | yes | **yes** | no | n/a |

Desktop send path: user message + Relay reply **PASS** (Evelyn care answer returned).  
Mobile bottom-nav Relay + topbar toggle: **open composer PASS**.

## Root cause (classification)

**Not** a removed route or deleted API.  

**Primary product failure for founder “gone” report:**

1. **Mobile/tablet drawer defaults closed** (`relayOpen=false` → `visibility:hidden` + off-screen transform). Without opening Relay (topbar button or bottom-nav tab), there is no conversation UI.  
2. **Mid-width risk:** drawer CSS previously started only at 900px; tablets ~900–1100px could still use a three-column desktop grid with `overflow:hidden`, making the Relay rail easy to clip or hard to discover without a toggle.

Console errors on repro: **0**. Historical messages: **not deleted**.

## Repair applied

1. Auto-open Relay on compact layouts after sign-in / session restore (`max-width: 1100px`).  
2. Raise drawer layout breakpoint to **1100px**.  
3. Force `relay-drawer-toggle` and `bottom-nav` `display: flex/inline-flex !important` in drawer mode.  

No conversation or care data deleted.
