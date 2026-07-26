# Session Revocation Gap Audit

**Date:** 2026-07-26

| Path | Before | After this pass |
|------|--------|-----------------|
| Lab JWT logout | Token valid until exp | **Denylist by sid** — immediate 401 |
| Foundation session logout | terminateSession | Unchanged (DB TERMINATED) |
| Membership revoke | Access 403; token still authN | AuthN remains; **authZ fails** (correct) |
| Account suspension | Foundation entity status | EXTERNAL ops for mass revoke |
| Password reset | Not productized for care | EXTERNAL IdP |
| Unbounded denylist | Risk | **TTL 12h + max 50k + prune** |

Architecture: `SessionDenylist` + `CareAuthService.revokeSession` + `logoutSession` dual-path.
