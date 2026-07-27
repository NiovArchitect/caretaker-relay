# CARETAKER RELAY — HARMONIZED AMBIENT CARE EXPERIENCE RELEASE

**Date:** 2026-07-27  
**Public app:** https://care.niovlabs.com  
**Public API:** https://caretaker-relay-care-api.onrender.com  

## Deployed SHAs (exact)

| Surface | Service | Deploy | SHA |
|---|---|---|---|
| Care API | `srv-d9h0ku3bc2fs739eo660` | `dep-d9jnr7f41pts73d0ir8g` live | `8aff0b80d9feeaeac21484d26724ecca763297c1` |
| Web app | `srv-d9h0l2n41pts73dksrmg` | `dep-d9jnrat8nd3s73bppq5g` live | `5101f5384f25bf9ff29cab7a3f7422b54e6a1f80` |

## Product files changed

**YES** — product domain, API routes, and Today surfaces were modified after gap proof.

### Foundation (`8aff0b8`)
- `packages/care-domain/src/services/care-work-items.ts` (new)
- `packages/care-domain/src/services/harmonized-ops.ts` (new)
- `packages/care-domain/src/index.ts` (exports)
- `apps/api/src/routes/care.routes.ts` (work, since-last-visit, emergency, handoff projection, notification-ops, shift boundary, calendar-truth)
- `tests/unit/care/harmonized-ops.test.ts` (7/7 pass)
- `docs/reviews/HARMONIZED_CARE_EXPERIENCE_GAP_MATRIX.md`

### App (`5101f53`)
- `src/foundation/careHttpClient.ts` / `careClient.ts`
- `src/pages/TodayPage.tsx` (ownership panel, since-last-visit, sync, notif ops, recipient confirm)
- `e2e/harmonized-care-experience.spec.ts` (4/4 public pass)

## Public proof summary

| Proof | Result |
|---|---|
| Unit `harmonized-ops.test.ts` | 7/7 PASS |
| Public browser smoke | 4/4 PASS |
| API health durable | PASS |
| Unauth work list/create | 401 |
| Auth create + claim | PASS (live work ids) |
| Since-last-visit briefing | PASS |
| Emergency card | PASS (Evelyn, contacts audited) |
| Recipient context mismatch | 409 `RECIPIENT_CONTEXT_MISMATCH` |
| Browser create with confirm | PASS (`Pick up prescription refill` observed in API) |

## Capability status

| Capability | Status |
|---|---|
| Next-action ownership | SHIPPED + public |
| Unassigned work / claiming | SHIPPED + public |
| Cross-role handoff projection | SHIPPED (API) |
| Shift-end boundary | SHIPPED (API) |
| No-replacement / overdue escalation | SHIPPED + UI escalate |
| Since-last-visit | SHIPPED + public |
| Multi-recipient isolation / confirm | SHIPPED + public (409 + checkbox) |
| Shared-device protection | PARTIAL (confirm + prior session revoke) |
| Notification delivery/ack/no-response | SHIPPED (ops labels; external SMS not claimed) |
| Correction / evidence labels | SHIPPED (since-last-visit badges) |
| Calendar truth | SHIPPED |
| Emergency information | SHIPPED + public |
| Representative authority | PRIOR (privacy center) |
| Offline / sync states | SHIPPED (honest label) |
| Document-to-action | PARTIAL (create work from Today) |
| Recurrence exceptions | PARTIAL (honest calendar truth only) |
| Empty states | SHIPPED (work empty) |
| Leaving / archive | PRIOR (revoke/export) |
| Flagship judge journey | PASS public H1 |
| Adversarial bank | PASS unauth + unit stranger deny |

## Agents

- Agent Zero process: `docs/agent-zero/AGENTS.md` (reuse, prove, cite)
- Agency: healthcare clinical-evidence + product/engineering patterns for ownership/handoff safety
- No HIPAA-compliant claims; Soft Translucent preserved; server authz authority; flush/login path not reopened
