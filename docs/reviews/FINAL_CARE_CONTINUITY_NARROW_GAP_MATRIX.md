# Final Care-Continuity Narrow Gap Matrix

**Date:** 2026-07-27  
**App runtime baseline:** `3a63456`  
**API runtime:** `6ede239` (preserve; minimal wire-up only if required)

## Rules

- Preserve Relay, authz, shift states, correction model, fast login  
- App-first; API only if existing endpoints cannot complete journey  
- No API-only labeled browser PASS  

| Gap | API capability | App surface before | Missing | Gate |
|-----|----------------|--------------------|---------|------|
| Incoming handoff ack | lifecycle GET/POST, packet, HANDOFF_READY notif | HandoffPanel mark/ack buttons only | Inbox discovery, first-class ack flow, ownership | HANDOFF ACK PASS |
| Correction fan-out | loop creates CORRECTION notifs | Med panel local only | Inbox alert + ack for User B | CORRECTION FAN-OUT PASS |
| Rich pre-shift briefing | handoff packet, today, state | Thin assignment times | Live handoff + tasks + schedule + prefs | RICH PRE-SHIFT PASS |
| Three-shift E2E | shift + handoff + events | Partial workspace | Continuous browser demo | THREE-SHIFT PASS |

## Completion plan

1. Wire shift handoff complete → lifecycle `sent` + optional `toPersonId`  
2. Incoming handoff inbox on Today + Shift  
3. Correction awareness list from notifications  
4. Pre-shift briefing from lifecycle packet + care state  
5. Public Playwright three-shift continuity suite  
