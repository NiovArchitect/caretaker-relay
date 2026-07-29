# Final coverage / handoff / appointment baseline

**Date (UTC):** 2026-07-29  
**Controller:** Agent Zero  

## Runtime

| Field | Value |
|-------|--------|
| App root | caretaker-relay |
| API root | caretaker-relay-foundation |
| Branch | checkpoint/caretaker-relay-track1-2026-07-22 |
| App HEAD/deploy | ab1c871eeca5e46550a42141622bec1dcb8eff02 / live same |
| API HEAD/deploy | 750f3823941a344a8f2b9aaf1e66de3add570552 / live same |
| Bundle | assets/index-Bvr6-hFB.js |
| Health | ok, prisma durable, llm ready |
| Parity | YES |
| Workers | 0 |

## Marcus → Evelyn snapshot (pre-edit)

| Surface | Value |
|---------|--------|
| Open work | 8 |
| Attention badge/groups | 7/7 |
| Handoffs (deduped) | 55 · buckets i=2 s=35 h=17 |
| Shifts | 47 (Marcus assignee: 0) |
| Appointments | 39 (scheduled 29, cancelled 8, moved 2) |
| Coverage slots API | GET …/coverage exists |
| Coverage timeline API | **404** (missing) |
| Handoff lifecycle service | CARE_HANDOFF_LC_V1 exists server-side |
| CareHandoff type status field | **absent** (lifecycle is side-table via updates) |

## Routes present

- shifts, handoffs (+ buckets), work-items, attention, state, today, coverage  
- handoff lifecycle: projection/lifecycle transition endpoints  

## Gaps entering campaign

1. No shared CareCoverageTimeline  
2. Handoff lifecycle not first-class on CareHandoff / not driving primary UI reduction  
3. 55 handoffs still too many for primary  
4. Appointments not lineage-partitioned  
5. Identity IDs residual  
6. 8 work + 7 attention not individually justified for Marcus role  
7. Multi-role browser journeys pending  
8. Founder desktop/phone PENDING  
9. Freeze NOT RESTORED  

## Non-goals

Med idempotency/ordinals, badge arithmetic formula, auth, revocation architecture, Grok Mode B, layout architecture.

## Agency selection

None at baseline — Agent Zero sole writer until specialty evidence requires otherwise.
