# Phase 1 evidence index

**Last updated:** 2026-07-22  
**Rule:** No inflated claims. Evidence class must match reality.

| CLAIM | IMPLEMENTATION PATH | TEST | LOG / ARTIFACT | EVIDENCE CLASS | LIMITATION |
| --- | --- | --- | --- | --- | --- |
| Care app uses Foundation HTTP care API | `careHttpClient` → `/api/v1/care/*` | care-http, care-prisma-auth | API inject | LAB | Needs care API running for full live UI |
| Foundation AuthService login for care | `POST /care/auth/login` → AuthService + CarePrincipalLink | care-prisma-auth | entity_id in response | LAB | Lab-seeded entities |
| Durable Prisma care store | `PrismaCareStore` `cr_*` | care-prisma-auth restart | 5434 or 5433 | LAB | Dev/test DB only |
| Dedicated dev DB 5434 | docker-compose.local.yml postgres | manual + LOCAL_DEV_DB.md | cr-local-pg | LAB | Ops not automated CI |
| Semantic med/appt/comm/handoff dedupe | `idempotency.ts` + loop | idempotency-semantic | unit | LAB | Provider actions partial |
| Confirm-key idempotency | care confirm route | care-http / prisma | idempotent_replay | LAB | Client must send key |
| Uncertainty not flattened | understand epistemicStatus | care-loop, http | REPORTED fatigue | LAB | Fixture default |
| Protocol 9-Delta refused | safety.ts | adversarial | refusal | LAB | — |
| Med discrepancy no auto-choose | loop + safety | med tests | needs_review | LAB | — |
| Negation ≠ given | understand | med states | no MAR | LAB | — |
| Access isolation | evaluateAccess | access suite | 403 | LAB | Not full TAR ABAC |
| Revocation works | revoke + access | prisma revoke | 403 | LAB | — |
| Export human+structured+FHIR map | exportCareData | http export | FHIR_MAPPED claim | LAB | Not EMR |
| Voice same pipeline | Composer STT + voice/understand | voice understand HTTP | transcript_meta | LAB | Mic UI browser-only; CI no mic |
| Handoff continuity | confirm → handoff row | prisma restart | handoff present | LAB | — |
| Live remote LLM | Foundation LLMProvider | — | **BLOCKED if no keys** | LIVE or BLOCKED | Keys/quota |
| Caregiver burden reduced | BurdenMetrics | lab only | steps=3 | LAB RESULT | Not caregiver-validated |
| Caregiver research | protocol docs | — | CAREGIVER_RESEARCH_PROTOCOL | PREPARED | **No sessions** |

## ACL principles (technical)

| # | Principle | Technical status |
| --- | --- | --- |
| 1–3 | Privacy / control / limits | Access, household, revoke, export audit — LAB |
| 4 | Portability | Export API — LAB |
| 5–6 | HITL / override | Verify + correction — LAB |
| 7 | Burden | Lab metrics only |
| 8–9 | Daily care / human connection | Olivia demo + doctrine |
| 10 | Personalization | Preference types partial |
| 11–12 | Safety / bias | Safety suite + bias doc; fairness not proven |
| 13 | Best practice | TRL card + risk register |
| 14 | Affordability | Architecture doc |
| 15–16 | User-centered / usability | Research pending; Today 5s structure LAB |
