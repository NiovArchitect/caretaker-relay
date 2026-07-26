# ACL Privacy & Security Traceability

**Date:** 2026-07-26  
**Product:** Caretaker Relay (ACL Caregiver AI Challenge Track 1 context)

## Mapping (judging expectation ≠ legal compliance)

| Expectation theme | Product control | Evidence |
|-------------------|-----------------|----------|
| Caregiver privacy | Fail-closed zero recipients on create | LoginGate + `/auth/register` + AuthorizationGate |
| No role→access shortcut | Role claim stored as metadata only | `registerAccount` roles `claim:*`; no memberships |
| Server enforcement | `authorize()` + `evaluateAccess` on care routes | care.routes.ts, authorize.ts |
| AI before retrieval | `/answer` checks access before `answerRelayQuestion` | care.routes.ts CARE_ANSWER audit |
| Auditability | CareAuditRow actions | ACCOUNT_REGISTERED, ACCESS_REQUEST_*, INVITATION_*, ACCESS_REVOKED |
| Honest AI | Provenance / grounded answers; fixture vs llm labeled | care health `understand_mode` |
| No over-claim compliance | Docs use HIPAA-READY language | HIPAA_APPLICABILITY_MATRIX.md |

## Explicit non-claims

- Not HIPAA certified  
- Not penetration-test cleared  
- Not production IdP/MFA complete  
- BAAs with AI vendors not evidenced as executed
