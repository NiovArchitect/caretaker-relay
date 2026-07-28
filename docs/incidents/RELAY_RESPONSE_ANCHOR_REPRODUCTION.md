# Relay response anchor reproduction

**Date:** 2026-07-28  
**App:** https://care.niovlabs.com  
**Persona:** Marcus (p-sadeil lab)  
**Viewport:** 390×844  

## Steps

1. Sign in; open Relay drawer (`relay-open-mobile`).  
2. Note: `relay-thread` has no scroll anchoring on message append (`RelayPanel.tsx` maps messages only).  
3. Submit any care question via Composer.  
4. Observe: new user bubble is at the bottom of the thread list; after answer returns, thread grows downward.  
5. With prior messages, the **start** of the new answer is often below the visible viewport unless the user was already pinned to the absolute bottom.  

## Root mechanism

- `submitText` in `App.tsx` appends user then later assistant messages.  
- `RelayPanel` AI mode has **no** `scrollIntoView` / pin state (unlike Coordination mode’s `scrollCoordToLatest` + jump-latest).  
- Default browser scroll position stays on older content or mid-thread.  

## Evidence directory

`docs/incidents/evidence/relay-anchor-before/`

## Acceptance

After fix:

- Submitted question visible near top of thread  
- First line of answer visible under it without manual hunt  
- No forced jump to middle/bottom of long answers  
- User scroll away → “New response” control  
