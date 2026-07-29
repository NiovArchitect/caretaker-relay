# Multi-medication projection reproduction

## Failure
Three distinct pending medication-plan statements with colliding client idempotency keys (shared 30-char prefix) produced **one** durable event (deduped: true, same event ID).

## Answers
1. Not all three events persisted under colliding keys.
2. One candidate created.
3. One pending projected.
4. Semantic/content dedupe via idempotency key incorrectly collapsed distinct medications.
5. Extraction would work if three events existed (Cetirizine path proven).
6–10. Root: `buildDedupeKey` returns `idem:rid:key` without medication identity; bad keys hide distinct meds.

## Fix plan
Include medication semantic fingerprint in event dedupe for medication-change statements; order candidates by report_time then name.
