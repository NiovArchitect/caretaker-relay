# P0 Public Recovery Evidence
**Deploy SHA:** `eea3d2cd0c16b7e1c0272e205f591467ab3656db`  
**Date:** 2026-07-26  
**Bundle:** `assets/index-DM3KKaaI.js` (contains `login-wait-hint`)

## Before (270d0fa)
- shell: **false** after 90s
- React **#310** at ~25s
- body text empty after crash
- Evidence: `evidence/repro-log.json`, `02-after-login.png`

## After (eea3d2c) — Playwright Chromium
| Run | Login visible | Shell | shellMs | React #310 | Blank after scroll |
|-----|---------------|-------|---------|------------|--------------------|
| Desktop 1440 | true | **true** | ~28s (API warm variance) | **false** | **false** |
| Mobile 390 | true | **true** | ~22s | **false** | **false** |
| WebKit | — | skipped | Playwright WebKit binary not installed | — | — |

Screenshots: `evidence/recovery-chromium-desktop.png`, `recovery-chromium-mobile.png`  
JSON: `evidence/recovery-results.json`

## Notes
- ShellMs remains API-latency bound on free-tier cold/warm; UI no longer blanks.
- Login form stays visible with wait hint during delay.
