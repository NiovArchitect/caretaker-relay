# CARE RECIPIENT SELF OWNERSHIP — REPRODUCTION

**Controller:** Agent Zero  
**Captured:** 2026-07-31T06:40:00Z (before repair)  
**Public API:** https://caretaker-relay-care-api.onrender.com  
**Public app:** https://care.niovlabs.com  

## Symptom

A registered account with `claimed_relationship: "self"` / path `receiving_care` cannot obtain an authorized care space:

1. Registration yields `authorized_recipients: 0`, roles include `claim:self` only.
2. `POST /api/v1/care/provisional-recipients` creates a **draft** only (`status: draft`).
3. `activate` without bind → `NOT_READY`.
4. Knowing a recipient id (e.g. `cr-olivia`) allowed **bind** before repair (security defect) but **activate still did not create membership**.
5. No Today / Care / Relay access for recipient-self.

## Root cause (product)

| Layer | Failure |
|-------|---------|
| Identity model | Account ≠ care recipient; claim:self is metadata only (correct). |
| Journey 1 gap | No product API created a **new** recipient + `care_recipient` relationship for self. Provisional path stopped at draft. |
| Journey 2 partial | Invitation with role `care_recipient` could create membership (works) but was not wired as the fixture path; self scopes omitted medications. |
| Security | Provisional bind allowed creator to attach to any known existing recipient id without controlling authority (takeover risk). Activate did not grant membership, but ready_to_activate state was unsafe. |

## Reproduction cases (before)

| Case | Result |
|------|--------|
| A. New self provisional only | Draft only; 0 memberships |
| B. Invite care_recipient + accept | Membership works (under-documented) |
| C. Link by knowing cr-olivia id + bind | Bind succeeded (BUG); no membership on activate |
| D. Wrong person bind by id | Same bind bug (FORBIDDEN after repair) |
| E. Same-name claim | No name match (correct — no auto-merge) |

## Expected after repair

| Journey | Behavior |
|---------|----------|
| 1. New self setup | `POST /api/v1/care/recipient-self/setup` with any preferred name → new `cr-*` + active `care_recipient` relationship |
| 2. Existing recipient | Authorized invite `role=care_recipient` → accept → membership on that recipient |
| Wrong claim | Bind to existing without control → FORBIDDEN + audit |
| Name-only | Never grants access |

## Privacy / takeover risks (pre-repair)

- Unverified self claims: registration alone (no access — OK)
- Cross-tenant bind attempt via known id: bind allowed (FAIL — fixed)
- Duplicate self: setup is idempotent after repair
