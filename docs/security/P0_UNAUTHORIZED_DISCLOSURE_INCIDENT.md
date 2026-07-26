# P0 Unauthorized Recipient Disclosure Incident

**Date:** 2026-07-26  
**Severity:** P0 privacy / authorization / data isolation  
**Public surface:** https://care.niovlabs.com  

## Founder report

Fake user “Ray Charles”, family/friend claim, no invite/approval — connected to another person’s care information.

## Reproduction (API)

Server path was already fail-closed:

- `POST /auth/register` → `authorized_recipients: 0`
- `GET /me` → empty memberships
- `GET /recipients/cr-olivia/*` → **403 NO_RELATIONSHIP**

## Root cause (client)

Causal chain:

1. `careClient.activeCareRecipientId` **defaulted to seeded `careRecipient.id` (Evelyn / cr-olivia)**.
2. `getSessionIdentity()` **defaulted to Marcus (p-sadeil)** when null.
3. `rid()` fell back to seeded Evelyn.
4. On HTTP 403/failure, `fetchTodayProjection` / `fetchRecipientProfile` **fell through to package seed store** (`seedOlivia: true`) and returned private care data.
5. `saveActiveCareRecipientId("cr-none")` did not always sync the in-module `activeCareRecipientId`.
6. Lab seed membership table could apply without an explicit lab-session flag if authz state was wrong.

This is a **client-side isolation failure**, not a server membership grant.

## Containment

Deployed app SHA **eea7b79**:

- Default recipient = `cr-none` only  
- No package-seed for `p-acct-*` / pending / non-lab sessions  
- HTTP 403 never falls back to seed PHI  
- Lab seed membership requires `labPrincipalAuthorized`  
- Register path forces pending + cr-none  
- Nav blocked for zero-access accounts  
- Footer does not claim “caring for” without access  

Synthetic probe principal `p-acct-9556854676714bdd` **suspended** (incident cleanup).

## Status

**EXPOSURE CONTAINED: YES** (app deploy eea7b79 + API already denying memberships)

API SHA unchanged: **5b128f1** (server isolation held).

## Post-fix verification (login entry pass)

- Create-account path still forces `cr-none` + pending.  
- Package seed fallback remains blocked for `p-acct-*`.  
- Entry “Set up care for someone new” creates provisional only (no existing-recipient path).  
- “Create & connect” removed to avoid intent confusion.  
- Public isolation suite: see `docs/testing/P0_PUBLIC_SIGNUP_ISOLATION_20.json`.
