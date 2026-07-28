# Bounded final campaign scorecard

**Date:** 2026-07-28  
**Scope:** Access review · document review · multi-family receipts · page purpose · **no broad rebuild**  
**Controller:** Agent Zero  

---

## Live runtime

| Surface | SHA | Parity |
|---------|-----|--------|
| APP | `c3e4f14` | YES |
| API | `e0741f7` | YES |

Primary plan-change harness still **6/6** / `cross_screen_rate: 1.0` on this runtime.

---

## Access orchestration (fuller path)

```text
Unauthorized (or Relay) submits access request
→ durable ACCESS_REQ_V1 record
→ open work + manager notifications (Relay path)
→ Privacy lists pending request with reason
→ Approve / Deny UI
→ decide API → membership or denial + audit
```

**Public proof (multi-family harness):**

| Step | Result |
|------|--------|
| Create (`POST /access-requests` as p-unauthorized) | PASS (201) |
| List for Marcus on recipient | PASS |
| Decide deny | PASS (`status: denied`) |
| Privacy approve/deny buttons | shipped in app `PrivacyCenterPage` |
| Relay “I need access…” | durable request + people_privacy + open_work destinations |

**Status: PASS** for create → list → decide → audit path.  
Limits remain: browser dual-session approve→membership UI proof not fully automated; approve-path membership browser check optional next.

---

## Document orchestration (fuller path)

```text
Relay/API document text
→ original preserved
→ proposals extracted (not care truth)
→ Documents review confirm/reject
→ reject keeps original; confirm may create work/schedule only after human decision
```

**Public proof:**

| Step | Result |
|------|--------|
| Ingest via API | PASS |
| Proposals created | PASS (2) |
| Reject proposal | PASS |
| Relay document ingest destinations | documents + open_work + relay_retrieval |
| No auto care-truth claim | PASS (copy + proposal model) |

**Status: PASS** for text ingest → proposals → reject.  
Binary PDF OCR still out of scope (honest product boundary).

---

## Multi-family receipt metrics (12 families)

Source: `docs/testing/MULTI_FAMILY_RECEIPT_RESULTS.json`

| Metric | Rate |
|--------|------|
| Interpretation | **1.000** |
| Execution | **1.000** |
| Persistence | **1.000** |
| Destinations (soft API) | **1.000** |
| Plan safety | **1.000** |
| Causation ok | **1.000** |

Families: med plan-change, med admin, med refusal, med effect, symptom, meal, transport, task, invite, access change, access request, document ingest.

**Note:** Full browser projection for every family remains plan-change-primary (6/6 dual-browser). Other families are API receipt + destination declarations + plan safety; browser projection matrix expansion is next-tier work.

---

## Page-purpose / signal

| Page | Purpose lead |
|------|----------------|
| Today | What matters now |
| Care | Current care picture; pending ≠ active |
| People | Who is authorized |
| Privacy | Who can access what + approve/deny |
| Documents | Source records + proposed facts |
| Relay | Ask / report / do — no invented orders |

Contract module: `src/lib/pagePurpose.ts` (budgets + questions).  
Today still caps needsYou/notifications. Full density re-census of every accordion remains **partial**.

---

## Accurate status

```text
RECEIPT-TO-REALITY — MED PLAN CHANGE: PASS 6/6
MULTI-FAMILY INTERPRET/EXECUTE/PERSIST/PLAN: PASS 12/12
ACCESS LIFECYCLE (create→list→decide): PASS
DOCUMENT LIFECYCLE (ingest→proposals→reject): PASS
INVITE PEOPLE SEAM: PASS
PAGE PURPOSE LEADS: PASS (major screens)
PAGE DENSITY FULL ENFORCEMENT: PARTIAL
BROWSER PROJECTION ALL FAMILIES: PARTIAL (plan-change proven dual-browser)
LIVE LLM: DISABLED
FOUNDER PHYSICAL-PHONE: PENDING

PRODUCT FREEZE: NOT RESTORED
```

---

## Freeze rule

Freeze restores only when:

1. Founder physical-phone confirmation = PASS  
2. Remaining internal gaps acceptable at zero for release bar (or explicitly waived)  
3. Optional: browser projection sample expanded beyond plan-change for top 5 families  

This campaign **does not restore freeze**.
