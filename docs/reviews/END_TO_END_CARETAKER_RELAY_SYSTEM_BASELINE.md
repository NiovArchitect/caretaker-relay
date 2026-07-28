# End-to-end Caretaker Relay system baseline

**Date:** 2026-07-28  
**Controller:** Agent Zero  
**Posture:** Fail-closed on PHI-bearing live Grok; fixture-mode product must still be complete.

## Runtime map

| Surface | Value |
|---------|--------|
| APP repo | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay` |
| API repo | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation` |
| Public app | https://care.niovlabs.com |
| Public API | https://caretaker-relay-care-api.onrender.com |
| Branch (both) | `checkpoint/caretaker-relay-track1-2026-07-22` |
| APP HEAD (docs) | `de21f96` |
| APP deploy | `c3e4f14` |
| API HEAD / deploy | `d299ebd` (parity YES) |
| APP runtime parity | NO if counting docs-only HEAD ahead of deploy; **product deploy** = `c3e4f14` |
| Migrations | none pending this campaign |
| Background workers | 0 |

## AI / security posture (do not change without BAA)

| Flag | Value |
|------|--------|
| understand_mode | fixture |
| llm_ready | false |
| llm_provider_ready | false |
| llm_keys_present | true (xAI key retained) |
| ai_live_allowed | false |
| deployment_mode | regulated_restricted |
| CARE_AI_BAA_EXECUTED | 0 |
| CARE_AI_PHI_ALLOWED | 0 |
| Forced mode=llm | 403 LLM_PATH_DISABLED |

## Major subsystems (present)

| System | Location / notes |
|--------|------------------|
| Auth | Foundation AuthService + care JWT; lab principals seeded |
| Authorization | care-domain access / authorize / minimum-necessary |
| Fixture interpreter | `packages/care-domain/src/services/understand.ts` |
| Care loop confirm | `loop.ts` confirmAndPersist |
| Execution receipts | `execution-receipt.ts` |
| Open work | `care-work-items.ts` |
| Handoff | built in loop + Today merge |
| Notifications | CARE_NOTIF_V1 + work-item circle notify |
| Invites / access | invitation.ts, access-request.ts, Privacy decide |
| Documents | document-actions.ts ingest + proposals |
| Projections | Today, Care, role projection, handoff |
| Routing registry | `docs/product/CARE_EVENT_TO_SURFACE_ROUTING_REGISTRY.md` |
| 50-action contract | `docs/product/CARETAKER_RELAY_50_ACTION_CONTRACT.md` |
| Mobile shell | half-screen fix prior; purpose leads on major pages |
| Relay | server answer + understand/confirm path |

## Agent selection (this campaign)

| Agent | Evidence | Gap | Auth |
|-------|----------|-----|------|
| agents-orchestrator | Whole-product mission | Integration | control |
| product / workflow | Intake completeness | Contracts | write docs |
| medication-safety | Plan-change boundary | Preserve D authority | read |
| projection / UX | Destinations vs screens | R2R already green | test |
| privacy / AppSec | Grok disabled | Keep fail-closed | read |
| reality checker | Public truth | Multi-journey | execute tests |
| evidence collector | Required artifacts | Baseline + scorecard | write docs |

## Proven public behaviors (carry-forward)

- Medication plan-change receipt-to-reality 6/6 + next-shift  
- Access create → list → decide  
- Document ingest → proposals → reject  
- Multi-family interpret/execute/persist rates 1.0 (API, prior)  
- Invalid JWT / unauthorized access denied  

## Explicit non-goals this campaign

- Re-enable PHI-bearing live Grok  
- Bulk environment replacement  
- Broad rewrites of care-domain  
