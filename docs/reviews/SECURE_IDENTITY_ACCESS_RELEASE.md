# Secure Identity & Access Release

**Date:** 2026-07-26  
**App baseline before:** `095af0fe`  

## Defects closed (internal)

| Defect | Fix |
|--------|-----|
| Role → lab principal with Evelyn access | Removed `labPrincipalForPath` grant |
| Optional name | Required preferred name + email |
| Auto recipient assumption | No prefill; empty spaces for pending |
| First-time “Set up care” for established users | Onboarding gated; AuthorizationGate for zero access |
| Fail open default Evelyn | `NO_RECIPIENT_SPACE` / fail closed |

## Remaining EXTERNAL

- Real IdP / MFA / email verification delivery  
- Server-side pending accounts  
- BAA / model provider contracts  
- Penetration test  
- Legal HIPAA determination  
