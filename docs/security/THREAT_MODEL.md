# Threat Model — Caretaker Relay Care Surfaces (Partial)

**Date:** 2026-07-26  
**Method:** Asset-focused STRIDE-lite; **not** a formal TARA substitute.

## Assets

- Care recipient profiles, meds, observations, appointments  
- Care circle membership and consent  
- Session tokens / Entity credentials  
- Relay answers and understand bundles  
- Audit trails  

## Trust boundaries

1. Browser UI (untrusted)  
2. Care API `/api/v1/care/*` (authorization enforcement boundary)  
3. Postgres Care* tables  
4. LLM provider (semi-trusted; may retain under vendor policy)  
5. Lab seed principals (demo only)

## Top threats and mitigations

| Threat | Mitigation | Residual |
|--------|------------|----------|
| Role claim → recipient access | Register grants zero memberships; claim roles metadata only | Low if server path used |
| IDOR / BOLA on recipient ids | `evaluateAccess` / `authorize` on recipient routes | Continuous inventory needed |
| Access matrix leak | `/access` requires membership; full matrix controlling only | Closed this pass |
| AI cross-recipient | `/answer` and understand require access before work | Monitor for missing checks |
| Invitation token replay | Token hash storage; consume on accept | Partial multi-recipient invite search improved |
| Session theft | HTTPS; logout terminates foundation session | Lab JWT lacks server-side revoke list |
| Prompt injection | Adversarial guard in domain; output as data | Ongoing |
| Over-broad client download | Server filters state; client must not be sole gate | Client gate remains UX only |
| Insider / vendor | EXTERNAL BAAs, least privilege ops | High residual without contracts |

## Out of scope this model

- Physical security of Render/DB  
- Full multi-tenant org admin  
- Formal red-team report
