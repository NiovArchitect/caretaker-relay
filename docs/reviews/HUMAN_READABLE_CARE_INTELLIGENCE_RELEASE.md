# Human-Readable Care Intelligence & Connected UX — Release Record

**Date:** 2026-07-26  
**Campaign:** Care document + timestamps + Relay chronology + People→Coordination  

## Problem (evidence)

- Generated Care export showed raw ISO (`2026-07-23T22:04:51.749Z`)
- Events lacked human times in export and weak chronology in Relay “what changed”
- Duplicate meal/observation noise made documents unreadable
- Open items stated the problem but weak operational next steps
- People messaging existed but was easy to miss; Coordination re-entry needed focus key

## Solutions shipped

1. **Central date/time** — `src/lib/dateTime.ts` (full / standard / recent / compact / audit)
2. **Care export reconstruction** — `vendor/care-domain` + foundation `packages/care-domain` export service
3. **Relay projections** — timed RECENT_CHANGE_LINES, OPEN_ITEM_ACTIONS safe steps
4. **People→Coordination** — Message CTA on every person card; `coordFocusKey` re-entry
5. **Display surfaces** — Today notifications, Care history, Documents meta use human times
6. **sanitizeExportMarkdown** — residual ISO rewrite defense-in-depth

## Safety

- No dose inventing
- Reported ≠ confirmed
- Superseded separated
- Same-minute duplicates collapsed with count; audit IDs remain in store
- Product jump-latest logic untouched

## Tests

`npm test` — 55 passed  
`npm run build` — PASS
