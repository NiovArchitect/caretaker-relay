# Server medication idempotency contract

## Durable boundary
1. **Client idempotency key** on `POST /api/v1/care/confirm` → `CareIdempotencyRow` / Prisma map (`getIdempotent`/`putIdempotent`).
2. **Semantic MAR hash** `medAdminHash` / `medOccurrenceKey` over recipient × normalized med name × dose × actor × day × requested state.
3. **PrismaCareStore.addMedRecord** returns existing row when content hash matches.
4. **Event persist** uses same `medOccurrenceKey` as `dedupeKey` and reuses prior non-superseded event.

## Guarantees
- Identical key replay: same HTTP body, zero new MAR/event.
- Different key, same semantic administered occurrence same day/actor: reuse MAR + event.
- Concurrent identical: first writer wins; second returns existing via store dedupe.
- Contradictory administered → not_administered: correction (void prior MAR, new not-administered truth).

## Non-guarantees
- Distinct medications / doses / days are not deduped.
- Authorization is never expanded by idempotency keys.
