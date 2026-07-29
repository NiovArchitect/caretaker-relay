# Server medication idempotency — reproduction & proof plan

**Campaign:** Final idempotency / notification / probe / isolation  
**Runtime:** public care API

## Pre-fix observation (Evelyn lunch admin)
- Same confirm key → `idempotent_replay: true`
- Different key same day lunch administered → MAR id reused (`mar-4gz89y04-…`)
- Events could still multiply before occurrence-key event dedupe

## Repair
- `medOccurrenceKey` on MAR + events
- Event persist reuses prior non-superseded occurrence
- Corrections void prior same-day recorded MAR

## Proof artifact
`docs/testing/SERVER_MEDICATION_IDEMPOTENCY_RESULTS.json`
