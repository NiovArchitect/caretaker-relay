# AGENT ZERO — SIX-FOCUS CLOSURE SCORECARD

**Recorded:** 2026-07-30 post-deploy public proof  
**Controller:** Agent Zero  
**PRN architecture changed this pass:** **NO**

---

## Phase 1 — Deployment (CLOSED)

| Item | Value |
|------|-------|
| Service | `caretaker-relay-care-api` `srv-d9h0ku3bc2fs739eo660` |
| Live deploy | `dep-d9lu2pv10e5c73ecs2sg` |
| Trigger | `api` (`render deploys create … --commit c511f12`) |
| Finished | `2026-07-30T23:43:11.893982Z` |
| Prior live (manual) | `dep-d9lu1c710e5c73ecpl10` also `c511f12` (then superseded) |
| API source SHA | `c511f12fccab31470acf2834205b01017389b714` |
| API deploy SHA | `c511f12fccab31470acf2834205b01017389b714` |
| Source/deploy parity | **YES** |
| Public health | **200 / ok / config_ok** |
| Dirty product repair on API HEAD | **NO** (HEAD = `c511f12`) |

```text
PUBLIC API HEALTH: PASS
API SOURCE/DEPLOY: c511f12 / c511f12
DEPLOYMENT PARITY: YES
RENDER AUTH: RESTORED (CLI OAuth; stale RENDER_API_KEY must stay unset)
```

Render note: shell `RENDER_API_KEY` remains **invalid (401)** and short-circuits CLI. Use `env -u RENDER_API_KEY` (or remove the key) with the fresh CLI token.

Evidence: `docs/testing/PUBLIC_POST_DEPLOY_c511f12_EVIDENCE.json`

---

## Phase 2 — Public repair proof

### Today payload (public)

| Metric | Before (`cc41d05`) | After (`c511f12`) |
|--------|--------------------|-------------------|
| Uncompressed Today JSON | **406 347** bytes | **57 634** bytes |
| Gzip of Today JSON | (not baseline) | **7 547** bytes |
| Events | **237** | **12** |
| Tasks | large | **20** (bound) |
| Observations | large | **12** (bound) |
| Appointments | large | **20** (bound) |
| Open safety reviews | — | **8** (bound) |
| Latest handoff present | yes | **yes** |
| Size vs 120 KB target | FAIL | **PASS** (−85.8%) |

```text
TODAY UNCOMPRESSED PAYLOAD: 57634  (<120 KB target) PASS
TODAY COMPRESSED PAYLOAD (gzip of JSON): 7547
TODAY EVENT COUNT: 12 (bounded) PASS
CURRENT ACTIONABLE ITEMS OMITTED (sample): 0  — handoff, appts, safety, prn projection present
HISTORY-ONLY UNBOUNDED DUMP: 0 (events no longer 237)
RELAY RETRIEVAL: PATH NOT RE-PROVED THIS RUN (wrong /answer route 404; use /understand)
SEMANTIC COMPLETENESS: SAMPLE PASS — not full clinical gate
```

**Do not treat size PASS as full semantic closure.** Recency/bounds only; corrected-older-truth priority still needs a dedicated fixture.

### Clarification lifecycle (public)

All six open unauthorized Benadryl rows are **&lt; 24h old** (≈1.2h–17.7h). Under the shipped **age-only** rule they correctly remain operational.

| Check | Result |
|-------|--------|
| AGED (&gt;24h) LOW-RISK CLARIFICATIONS OPEN | **0 — PASS** under age rule |
| FRESH (&lt;24h) UNAUTH CLARIFICATIONS OPEN | **6** (same-day lab reports) |
| DUPLICATE ACTIVE CLARIFICATIONS | **FAIL** — 6× Benadryl `needs_clarification` |
| ARCHIVED WITH LIFECYCLE NOTE THIS RUN | **0** (none aged past threshold yet) |
| SAFETY-RELEVANT SILENT ARCHIVES | **NEEDS_VALIDATION** — age-only; no adverse/admin classifier |
| UNAUTHORIZED ACTIVATING PLAN | **0** observed (still `needs_clarification` / unauthorized) |

```text
AGE-ONLY RULE BEHAVING AS CODED: YES
CAMPAIGN TARGET "0 UNAUTH OPEN" WITH SAME-DAY LAB POLLUTION: NOT MET (expected under 24h window)
DUPLICATE COLLAPSE: NOT IN c511f12
SAFETY-AWARE CLASSIFIER: NOT IN c511f12
```

**No PRN domain architecture change applied.** Full safety-aware lifecycle remains a **follow-on** after this deploy proof, not a silent edit.

### Notification-action duplication

Still an **app** defect (not fixed by API `c511f12`). Public UI census after Marcus lab login on Today:

| Control | Count (Today surface) |
|---------|------------------------|
| Resolve | **8** |
| Mark seen | **10** |

```text
NOTIFICATION-ACTION DUPLICATION: FAIL / OPEN
CANONICAL ISSUES WITH MULTIPLE RESOLVE CONTROLS: >0 (8 Resolve buttons visible)
MARK-SEEN / RESOLVE ON DELIVERY ROWS: PRESENT
CANONICAL ISSUE MODEL: NOT IMPLEMENTED
```

---

## Accurate status (post `c511f12` live)

```text
API SOURCE SHA:     c511f12fccab31470acf2834205b01017389b714
API DEPLOY SHA:     c511f12fccab31470acf2834205b01017389b714
DEPLOYMENT PARITY:  YES
PUBLIC HEALTH:      PASS

TODAY PAYLOAD BEFORE/AFTER: 406347 → 57634 uncompressed (gzip ~7547)
TODAY SIZE TARGET <120KB:   PASS
TODAY SEMANTIC GATE:        SAMPLE ONLY — full clinical completeness OPEN
TODAY HISTORY DUMP:         FIXED (237 → 12 events)

CLARIFICATION OPEN BEFORE:  6 unauthorized
CLARIFICATION OPEN AFTER:   6 unauthorized (all FRESH <24h)
AGED LOW-RISK OPEN:         0 PASS (age rule)
DUPLICATE ACTIVE:           6 FAIL
SAFETY SILENT ARCHIVES:     NEEDS_VALIDATION
UNAUTHORIZED → PLAN:        0

NOTIFICATION-ACTION DUP:    FAIL (8 Resolve / 10 Mark seen on Today public UI)
EVERY-BUTTON DURABLE:       OPEN
CLEAN-UNIVERSE ETL:         PASS — UNIT (unchanged)
PUBLIC FRESH PRN ETL:       PARTIAL (lab interval / pollution)

PRN ARCHITECTURE CHANGED:   NO
BACKGROUND WORKERS:         NOT RE-AUDITED THIS RUN
FOUNDER DESKTOP:            PENDING
FOUNDER PHYSICAL PHONE:     PENDING
PRODUCT FREEZE:             NOT RESTORED
```

---

## What `c511f12` closed publicly

1. **Deploy parity** for the two source repairs.  
2. **Today payload bloat** — material reduction with bound counts; handoff/appts/safety still present in sample.  

## What `c511f12` did **not** close

1. **Safety-aware clarification classifier** (admin / adverse / review vs low-risk abandon).  
2. **Duplicate clarification collapse**.  
3. **Same-day unauth open count = 0** (age window keeps fresh reports).  
4. **Notification-action canonicalization** (app).  
5. **Full semantic Today priority model** (beyond recency bounds).  
6. **Founder devices / freeze**.

---

## Freeze gate (unchanged)

Do **not** restore product freeze until:

- repairs publicly deployed + parity exact — **YES for c511f12**  
- clarification lifecycle safety-aware — **NO**  
- Today bounded **and** semantically complete — **bounded YES; complete OPEN**  
- notification actions canonical — **NO**  
- regressions + workers + founder desktop/phone confirmed — **NO**

```text
PRODUCT FREEZE: NOT RESTORED
```
