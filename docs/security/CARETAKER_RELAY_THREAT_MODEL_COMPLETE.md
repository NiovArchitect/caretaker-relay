# Caretaker Relay Threat Model (Complete for care surface)

**Date:** 2026-07-26  
**Method:** STRIDE + abuse cases  
**Scope:** Care product boundary (`/api/v1/care/*` + caregiver UI)

## Trust boundaries

Browser → Care API → Postgres Care* → LLM vendor → Render ops

## STRIDE summary

| Category | Examples | Mitigations | Residual |
|----------|----------|-------------|----------|
| Spoofing | Stolen JWT | Logout denylist; foundation terminate; TLS | Lab JWT process-local denylist |
| Tampering | Scope escalation | Server authorize + scope API controlling only | Continuous review |
| Repudiation | Deny access grant | CareAuditRow taxonomy | Retention legal EXTERNAL |
| Info disclosure | IDOR, matrix leak, over-fetch | Membership + min-necessary projection | Full field matrix ongoing |
| DoS | Auth flood | Rate limits partial | Edge WAF EXTERNAL |
| Elevation | Role claim → access | Register zero memberships | Proven |

## Abuse cases

See `ABUSE_CASE_MATRIX_COMPLETE.md`.
