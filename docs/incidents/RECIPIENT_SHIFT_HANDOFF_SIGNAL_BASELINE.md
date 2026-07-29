# Recipient / Shift / Handoff / Signal baseline

**Date (UTC):** 2026-07-29  
**Controller:** Agent Zero  
**Public app:** https://care.niovlabs.com  
**Public API:** https://caretaker-relay-care-api.onrender.com  

## Runtime

| Field | Value |
|-------|--------|
| App HEAD / deploy | `6c0c15ebc5288660acfb01d8bdc7dceea319c4e0` / live same |
| API HEAD / deploy | `a7d10d7e97c988318872dd61948d026540e9909b` / live same |
| Active app bundle | `/assets/index-CLIBddUV.js` |
| Health | ok, prisma durable |
| Deployment parity | YES |
| Background workers | 0 |

## Principal under audit

- **Marcus Carter** (`p-sadeil`) — family_caregiver, primary  
- **Active recipient:** Evelyn Carter (`cr-olivia`)  
- Authorized recipients for Marcus: **43** (many greenfield campaign spaces exist; audit focuses on Evelyn projections)

## Public counts (Marcus → Evelyn)

| Surface | Count / note |
|---------|----------------|
| Attention groups / badge | 7 / 7 |
| Work items (open list) | **54** (include_terminal same 54 — none terminal in open set) |
| Notifications | **1164** (unread 7) |
| Handoffs | **71** |
| Shifts total | **47** |
| Shifts assigned to Marcus | **0** |
| Appointments in state | **39** (includes cancelled, duplicate PT, Judge demo PT) |
| Noise-action work (probe/campaign regex) | **15** |
| Noise notifications | **52** |

### Top duplicate work actions

- 12× Allegra medication verification  
- 10× Follow up: Needs an owner  
- Multiple HOLms… / FMHms… / PROBESEED / Flagship / Judge PT / Public smoke strings  

### Shift coherence failure

UI can show “No shift assignment” for Marcus while work/handoffs/attention treat him as active primary.  
Marcus has **0** formal shift rows; he is ongoing primary coverage — product lacks explicit coverage projection.

### Relay failure (reproduced)

Q: “What caretaker helped Evelyn before my shift?”  
A: Intent **CARE_TEAM** — lists entire team (Marcus, Daniel, Dr. Shah, Public PreShift DSP, Public Doc DSP, Maya) — **not** previous-shift-scoped.

### Handoff noise

Mixed sent/received; summaries contain `[HOLms…]` campaign tags; many near-duplicates.

### Privacy / emergency

- Privacy nav tab present (`PrivacyCenterPage`)  
- Emergency entry points exist on Today/Care; synthetic blood type / labeled demo emergency contact not verified as complete

## Non-goals (do not reopen)

Medication idempotency/ordinals, exact badge math, auth architecture, attention 5→0 lifecycle, post-revocation API matrix, Grok Mode B.

## Required closures (this campaign)

1. Recipient data-space isolation proof + noise classification  
2. Shift hours **or** ongoing primary coverage (no contradictory empty shift)  
3. Relay previous/current/next caregiver shift answers  
4. Handoff Incoming / Sent / Draft / History  
5. Canonical active work (dedupe + hide probe/terminal/stale)  
6. Signal-first Today/Shift (no bottom attention wall; appointments cleaned)  
7. Remove Privacy nav (keep server enforcement)  
8. Synthetic emergency blood type + contact  
9. Deploy + scorecard; freeze only if internal gaps = 0 and founder PASS  

## Agency selection

None at baseline. Agent Zero is sole writer until specialty evidence requires otherwise.
