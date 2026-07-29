# Final idempotency and signal release notes

**Date:** 2026-07-29  
**API:** d06b75a95c622f8194876216f11cdfb36ae2662d  
**APP:** d514ebef6ef5422073cd1987756f97b3e82b8374  

## Durable medication idempotency
- Client `idempotency_key` → `CareIdempotencyRow` / store map
- Semantic `medAdminHash` / `medOccurrenceKey` for MAR + events
- Prisma `addMedRecord` content-hash reuse

## Attention badge
Class A only (requires this user action; groups not raw rows). Live proof: ~9 new.

## Probe exclusion
`isProbeExcludedEvent` / `isSmokeResidueLine` on projections; no probe in primary Relay samples.

## Freeze
NOT RESTORED — founder desktop + phone pending; five-universe matrix partial.
