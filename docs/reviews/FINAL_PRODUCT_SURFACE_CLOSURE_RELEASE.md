# Final Product-Surface Closure Release

**Date:** 2026-07-27  
**App deploy:** `3a634567a9a972a9bbee2a13e2c060611b723b31` (live)  
**API deploy:** `6ede239daca2e5401082803e57f010815fa79a5c` (preserved)

## Product surfaces delivered

1. **Account / Sign out** — labeled “Account” trigger + menu with Sign out (`data-testid=sign-out`), Accessibility & privacy, recipient switcher.  
2. **DSP My shift** — Care → My shift workspace: invitation accept/decline, scheduled, pre-shift, active, ending, documentation window, expired panels; handoff + observation save; Relay gating by phase.  
3. **Medication correction** — Care → Medications panel: report administered, correct not administered, current vs history, correction alert.  
4. **Multi-recipient** — confirm dialog when switching among multiple authorized recipients.  

## Browser proof (public)

`e2e/product-surface-closure.spec.ts` against https://care.niovlabs.com:

| Test | Result |
|------|--------|
| PS1 Account + Sign out | PASS |
| PS2 DSP My shift | PASS |
| PS3 Med correction panel | PASS |
| PS4 Multi-recipient menu | PASS |
| PS5 Mobile Account label | PASS |

## Freeze

**NOT RESTORED** — full continuous three-shift demo + dual-user live correction propagation + invitation accept chrome still partial vs complete A–G DSP product vision; core surfaces now exist and pass public browser checks.
