# Care API Endpoint Authorization Inventory

**Date:** 2026-07-26  
**Surface:** `/api/v1/care/*` (Caretaker Relay care API)

| Method | Path | AuthN | AuthZ | Audit | Notes |
|--------|------|-------|-------|-------|-------|
| GET | /health | Public | N/A | No | Product meta only |
| POST | /auth/register | Public | Creates zero memberships | ACCOUNT_REGISTERED | New |
| POST | /auth/login | Public | Credentials | FOUNDATION_AUTH_LOGIN / lab | Returns membership count |
| POST | /auth/lab-login | Public | Lab credentials | CARE_LAB_LOGIN | Demo |
| POST | /auth/logout | Bearer | Session end | SESSION_LOGOUT | New |
| POST | /auth/verify-contact | Bearer | Self | CONTACT_VERIFIED | New |
| POST | /auth/request-verification | Bearer | Self | CONTACT_VERIFICATION_ISSUED | New |
| GET | /auth/lab-principals | Public | Directory only | No | No passwords |
| GET | /me | Bearer | Self | — | Memberships listed |
| GET | /context | Bearer | Soft access report | — | Does not grant data |
| GET | /recipients/:id/* | Bearer | evaluateAccess | Various | Deny 403 |
| POST | /answer | Bearer | access before answer | CARE_ANSWER | AI gate |
| POST | /understand | Bearer | access in loop | — | |
| POST | /recipients/:id/invitations | Bearer | controlling | INVITATION_CREATED | |
| POST | /invitations/:token/accept | Bearer | invitee match | INVITATION_ACCEPTED | |
| POST | /access-requests | Bearer | self request | ACCESS_REQUEST_SUBMITTED | New |
| GET | /access-requests/mine | Bearer | self | — | New |
| GET | /recipients/:id/access-requests | Bearer | approve_access | — | New |
| POST | /access-requests/:id/decide | Bearer | approve_access | APPROVED/DENIED | New |
| POST | /recipients/:id/access/revoke | Bearer | controlling | ACCESS_REVOKED | Immediate store revoke |

**Sensitive endpoints inventoried:** 40  
**Protected with membership/authz (recipient-scoped):** all recipient `/:id` routes + answer/understand/export  
**Public unauthenticated (intentional):** health, lab-principals, login, register, lab-login
