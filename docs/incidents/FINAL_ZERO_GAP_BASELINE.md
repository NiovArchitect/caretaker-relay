# Final zero-gap baseline

**Date:** 2026-07-29  
**App:** 30dd791714764420d497f878f10f6d83ec9ccd54 (live)  
**API:** 6479d7ad55febe31a64987e9564ce3ca97dacb3c (live)  
**Branches:** checkpoint/caretaker-relay-track1-2026-07-22  

## Proven
- Attention 7=7 exact badge
- Med idempotency CareIdempotencyRow
- Five care spaces creatable
- Revocation sample 403

## Gap reproduction (multi-med)
Seeding three medication-change events with idempotency_key = `${RUN}-${statement.slice(0,30)}` collapses to **1 event** because all three share the same first 30 characters ("Medication change needs verification:").

Public result: 1 persisted event, 1 projected candidate.

## Ordering
- buildOrderedMedicationCandidatesFromLines sorts name ASC (must switch to report_time then name for contract)
