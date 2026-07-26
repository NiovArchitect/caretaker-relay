# P0 Live Frontend Availability Incident
**Opened:** 2026-07-26  
**Public:** https://care.niovlabs.com  
**SHA at report:** 270d0faf58e56a6c370ab56482e408cd2a5a8f97

## User report
- Extremely long login
- After login app can remain completely invisible
- Black screen while scrolling (several seconds)
- Extremely slow
- No usable screen after login at time of report

## Reproduction (Playwright headless Chromium)
Evidence: `docs/incidents/evidence/repro-log.json`
- Login screen visible ~1.1s
- After submit: shell **never appeared** for 90s
- At t≈25s: **React minified error #310** (`Rendered more hooks than during the previous render`)
- After error: body `innerText` became **empty** (blank app) while background stayed powder-blue

## Root cause (primary)
**React hooks order violation in `App.tsx`:**
`useEffect` for `cr-navigate` was registered **after** conditional early returns for `!authReady` / `!session`.
On login, session becomes non-null, component path adds a hook → React #310 crash → blank tree.

## Contributing factors
1. Heavy multi-layer `backdrop-filter` / blur on many surfaces (scroll black-frame risk)
2. Aggressive dual/triple polling (2s/4s/5s) after auth
3. API cold-start can delay login 10–60s (secondary; not the blank crash)

## Fix
1. Move `cr-navigate` effect above early returns
2. Reduce blur tokens; disable backdrop-filter on scrolling cards/sections
3. Slow notification/coord polls to 8–15s
4. Login wait hint for cold start

## Status
Fixed in recovery commit; deploy required.
