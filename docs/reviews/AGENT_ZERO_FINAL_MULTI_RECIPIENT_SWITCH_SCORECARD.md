# AGENT ZERO — FINAL MULTI-RECIPIENT SWITCH / CONTEXT / SESSION SCORECARD

**Date:** 2026-07-29  
**Controller:** Agent Zero  
**Public app:** https://care.niovlabs.com  

## Agency selection

| Path | Evidence | Responsibility | Repo | R/W | Artifact | Timeout | Stop |
|------|----------|----------------|------|-----|----------|---------|------|
| *(none)* | Sole writer closed multi-recipient UI isolation | — | caretaker-relay | write | deploy + proof | — | public switch PASS |

## Results

```text
MULTI-RECIPIENT PRINCIPAL: PASS (Marcus Carter · p-sadeil)
RECIPIENT A: Evelyn Carter (cr-olivia)
RECIPIENT B: Robert Hale (cr-robert)
VISIBLE SWITCHER: PASS (Account → Switch care recipient)
ONE CANONICAL ACTIVE RECIPIENT: PASS (data-active-recipient + sessionStorage + careClient rid)
CONTEXT_VERSION GATING: PASS (ActiveRecipientContext + stale Relay/confirm reject)
RELAY THREAD PARTITION: PASS (per-recipient message map)
WRONG-RECIPIENT FLASH: 0 observed
EVELYN → ROBERT HEADER: PASS
ROBERT NO EVELYN HEADER: PASS
ROBERT NO BETA/EVELYN WORK LEAK: PASS
ROBERT HAS ALPHA WORK/APPOINTMENT SIGNAL: PASS
SWITCH BACK TO EVELYN: PASS
EVELYN NO ALPHA LEAK: PASS
SESSION RESTORE: PASS (shell + label after reload)
SWITCHER STILL HAS BOTH: PASS

MULTI-RECIPIENT PUBLIC UI SWITCH: PASS
IN-FLIGHT STALE RESPONSE REJECTION: PASS (version/token gate)
SESSION RESTORE: PASS

AGENT ZERO PUBLIC SMOKE: PASS
BACKGROUND WORKERS: 0

FOUNDER DESKTOP RECHECK: PENDING
FOUNDER PHYSICAL-PHONE RECHECK: PENDING

PRODUCT FREEZE: NOT RESTORED
```

## SHAs

```text
APP SOURCE/DEPLOY: 2d928d7b786057b443cc3b03aa03a520814a912a
APP BUNDLE: assets/index-CKAzvvON.js
API SOURCE/DEPLOY: 4394cc53d18bba015ce7220865a91cc58c138176
DEPLOYMENT PARITY: YES
```

## Product files changed

- `src/lib/activeRecipientContext.ts` (new)
- `src/App.tsx` — atomic switch, Relay partition, submit/confirm gating
- `src/foundation/careClient.ts` — bind context on setActiveCareRecipientId
- `scripts/multi-recipient-switch-proof.mjs`
- `docs/incidents/FINAL_MULTI_RECIPIENT_SWITCH_BASELINE.md`
- `docs/testing/MULTI_RECIPIENT_BASELINE_DATA.json`
- `docs/testing/multi-recipient-switch/*`
- `docs/incidents/evidence/multi-recipient-switch-after/*`

## Remaining gaps

**Internal:** 0 for multi-recipient visible switch (this campaign).

**External:**

1. Founder desktop confirmation — PENDING  
2. Founder physical-phone confirmation — PENDING  

## Founder checklist (do not mark PASS without founder)

### Desktop

1. Open https://care.niovlabs.com in a clean desktop browser.  
2. Sign in as Marcus Carter.  
3. Confirm header shows Evelyn Carter.  
4. Account → Switch care recipient → Robert Hale → accept confirm.  
5. Confirm header is Robert Hale; no Evelyn work/handoff cards.  
6. Switch back to Evelyn; confirm Evelyn-only work returns.  
7. Hard refresh; session restores correct recipient.  

### Physical phone

1. Same journey on a real phone browser.  
2. Confirm Account menu switcher is tappable.  
3. Confirm no wrong-recipient flash after switch.  

## Freeze rule

Restore freeze only when founder desktop + physical-phone are explicitly confirmed PASS and remaining internal gaps = 0.
