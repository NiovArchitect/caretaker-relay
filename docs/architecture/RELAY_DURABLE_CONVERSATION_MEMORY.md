# Relay Durable Conversation Memory

## Three layers (must stay distinct)

| Layer | Authority | Storage |
|-------|-----------|---------|
| Durable care truth | Authoritative | Care events, meds, appointments, reviews |
| Shared human coordination | Authorized circle | Coordination CareUpdates |
| Relay conversation memory | Private principal × recipient | CareUpdates `RELAY_TURN_V1:` / `RELAY_FOCUS_V1:` |

## Encoding (no extra Prisma migration)

Uses existing `CareUpdate` / `CareUpdateRow`:

- **Turn:** `summary = RELAY_TURN_V1:{json}` · `toPersonId = principalId` (private)
- **Focus:** `summary = RELAY_FOCUS_V1:{json}` · working entities for "it" / yesterday

Prisma persistence already maps CareUpdates when runtime uses durable store.

## Isolation

- **Principal:** Maya cannot list Marcus turns (`toPersonId` + decode filter)
- **Recipient:** Evelyn focus never applies to Robert conversation id
- **Truth refresh:** Same question re-runs projections; never replays prior answer as truth

## Session continuity

Refresh / new session: turns reload from store via `listTurns` / `getFocus` on next `/answer`.  
Not React state. Not sessionStorage.
