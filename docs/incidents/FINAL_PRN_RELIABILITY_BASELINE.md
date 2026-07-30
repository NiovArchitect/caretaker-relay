# FINAL PRN RELIABILITY BASELINE

**Recorded:** 2026-07-30T07:05:00Z  
**Controller:** Agent Zero  
**Phase:** Baseline only — no product code modified before this artifact.

## Public runtime

| Surface | Value |
|---------|-------|
| APP | https://care.niovlabs.com |
| API | https://caretaker-relay-care-api.onrender.com |
| API health | `ok: true`, service `caretaker-relay-care-api`, store `prisma`, mode `regulated_restricted`, lab_login `false` |
| APP bundle | `assets/index-DciNDcpz.js` |

## Repository HEADs

| Repo | Branch | HEAD | Dirty |
|------|--------|------|-------|
| caretaker-relay-foundation | checkpoint/caretaker-relay-track1-2026-07-22 | `505d432416a41ef6f971ae984dbde206cd2bc8ea` | untracked `scripts/judge-browser-journeys.mjs` only |
| caretaker-relay (app) | checkpoint/caretaker-relay-track1-2026-07-22 | `d26d4dcb0e6bc07dbb02c9737124964611c8b9d8` | prior campaign docs/e2e noise; product PRN at `c5dea92` lineage |

## Deploy SHAs (Render)

| Service | Status | Commit |
|---------|--------|--------|
| caretaker-relay-care-api | live | `48ad56bf45be` (product reliability baseline parent) |
| caretaker-relay-web | live | `c5dea925de33` |

**Deployment note:** API HEAD docs commit `505d432` is ahead of live product `48ad56b` by docs-only journey results; product code at live is `48ad56b`. App HEAD docs `d26d4dc` ahead of live product `c5dea92`.

## Environment / workers

| Item | Value |
|------|-------|
| Database | prisma (public health) |
| Migration this campaign | none planned unless defect forces |
| Background workers (campaign) | 0 |
| Open campaign processes | 0 matching prn/playwright/vitest |

## Accepted PRN foundation (do not rebuild)

- Canonical order/episode; reason→admin→reassess→result
- Bounded next-caregiver continuity; overdue-once; idempotent open-episode confirm
- OTC ≠ plan; interval; no dose invention
- Screen projections + Relay retrieval + 28 journeys + visual red-team

## Open reliability gates (this campaign)

1. J29 stale confirm after order deactivated  
2. J30 offline/unknown-result with stable idempotency key  
3. Timed overdue lifecycle + repeated worker idempotency  
4. Multi-tenant attack matrix (similar display names)  
5. Full non-PRN regression re-bank  
6. Founder desktop / phone PENDING without explicit confirmation  

## Historical freeze review

July 25–26 report (app `d8d56c13…` / API `45eebba…`) is regression history only — not freeze evidence for `48ad56b` / `c5dea92`.
