# FINAL MISSING ROLE AND BROWSER BASELINE

**Controller:** Agent Zero  
**Captured:** 2026-07-31T06:20:00Z  
**Purpose:** Preserve live public baseline before completing remaining role/browser/CI gates.

## Public runtime (at capture)

| Surface | Value |
|--------|--------|
| App | https://care.niovlabs.com |
| API | https://caretaker-relay-care-api.onrender.com |
| App source/deploy SHA (pre-restoreSession fix) | `0346e1787cfcc1d5dde43c535208ed4208e7f5f7` |
| App bundle (pre-fix) | `index-BJKEDyRH.js` |
| App deploy (memberships list fix) | `dep-d9m3foajnfac73biofag` |
| API source/deploy SHA | `340c546a0cd74f99c9022c576e88e786b6d05bc9` |
| API deploy | `dep-d9m18noae00c73b840ag` |
| Public health | PASS (`/api/v1/care/health` ok) |
| Deployment parity (API) | YES |
| Background workers | 0 |

## Unit baselines (required preserve)

| Suite | Result |
|-------|--------|
| Care unit (`npm run test:care`) | **359/359 PASS** (16 skipped) |
| App unit (`npm test`) | **98/98 PASS** |

## Locked-closed public gains (do not regress)

- Physician clinical retrieval deployment
- Retrieve-before-record on executed paths
- Three-language retrieval 75/75 (prior campaign)
- API clinical journey bank 30/30 (reconfirmed this campaign)
- Identity/safety strip + H&P + Why?/Learn more (lab roles)
- Shift-plan canonical template response
- Field-consent server projection (executed set)
- Refill claim empty-body defect repaired (`body:{}`)
- Targeted units green
- Session memberships honored in `listAuthorizedCareSpaces` for invitees (list path)

## Defect discovered during this campaign

**D-RESTORE-MEMBERSHIPS-001:** `restoreSession()` re-persisted `token` + `identity` without `memberships`, wiping invitee access after reload and forcing `p-acct-*` principals to AuthorizationGate despite server memberships on `/care/me`.

**Repair SHA:** `f971c3e71c692a6f9f6d7f71122da2875fc9ec28`  
**Deploy:** `dep-d9m3t7m417fc73dunppg` (web only)

## Pre-repair browser matrix snapshot (post-0346e17, pre-f971c3e)

| Metric | Value |
|--------|-------|
| Roles executed | 8 |
| Identity strips | 4 (lab principals only) |
| H&P open | 4 |
| Clinical API 30 | 30/30 |
| Shift plan template | PASS |
| Unauthorized disclosures | 0 |
| Product gap | care_recipient_self_bound_to_cr_olivia |
| Coordinator/temp browser strip | FAIL (restoreSession wipe) |

## Fixture creation paths supported

- Lab principals: Marcus, Maya, Daniel, Dr. Shah, unauthorized
- Register + invite + accept: coordinator, temporary active
- Register + invite + accept + revoke: temporary revoked
- Register claim:self without ownership bind: care-recipient self → **PRODUCT_GAP**

## Internal gaps at baseline (non-zero → freeze NOT_RESTORED)

1. Missing care-recipient-self product binding  
2. Identity/H&P/consent incomplete across all 8 browser roles (coord/temp blocked by restore defect)  
3. Full Today card families / shift 30 time matrix / med 20 formal bank partial  
4. Full PRN public browser bank / non-PRN / durable matrix partial  
5. Full lint, integration, API contract, Playwright suite, multi-role E2E, privacy, AppSec, a11y, CI unproven  
6. Founder desktop/phone PENDING (blocked until internal gaps = 0)

## External gaps

- interRAI licensing  
- State POLST form packs  
