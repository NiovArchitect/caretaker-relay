# Final Product Surface Gap Matrix

**Date:** 2026-07-27  
**App runtime baseline:** `61ca1df`  
**API runtime (preserve):** `6ede239`

## Rules

- Preserve Relay authz, shift state machine, correction model, appointment model  
- Product-surface completion only  
- No API-only labeled browser PASS  

## Gaps

| Gap | API capability | Browser surface before | Required completion | Gate |
|-----|----------------|------------------------|---------------------|------|
| DSP lifecycle chrome | shift assign/respond/handoff/expire | Active Relay only | Invitation→expired workspace | FULL DSP BROWSER PASS |
| Pre/doc/expiry UI | phase derivation | Missing | Human-language state panels | PRE/DOC/EXP PASS |
| Med correction 2-user | void/correct projections | Partial Care list | Correction alert + current vs history | MED CORRECTION PASS |
| 3-shift continuity | durable events | Partial | Shift workspace + handoffs + Relay | THREE-SHIFT PASS |
| Multi-recipient | switchRecipient | Exists, needs proof | Confirm language + isolation | MULTI-RECIPIENT PASS |
| Sign-out discovery | clearSession + multi-tab | Hidden avatar only | Labeled Account menu | SIGN-OUT PASS |

## Implementation plan

1. Discoverable Account / Sign out control  
2. `ShiftWorkspacePage` driven by `/recipients/:id/shifts*`  
3. Medication correction panel on Care  
4. Continuity cues on Today  
5. Public browser e2e for new surfaces  
