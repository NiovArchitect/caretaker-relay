# AGENT ZERO — PRN MEDICATION / ACCURATE CHARTING SCORECARD

**Recorded:** 2026-07-30  
**Campaign:** First-class PRN (as-needed) orders + episodes + Relay charting

---

## Research (brief)

PRN = *pro re nata* / as-needed. Charting best practice separates **authorized order**, **administration/non-administration with reason**, and **effectiveness result**. Requirements vary by jurisdiction and setting (DDS MAR themes, CMS order elements, Joint Commission setting-specific guidance). Relay implements a **protocol engine**, not a universal legal claim.

---

## What shipped

| Layer | Deliverable |
|-------|-------------|
| Domain | `packages/care-domain/src/services/prn-medication.ts` |
| Seed | Evelyn: Acetaminophen 500 mg PO PRN pain, q6h, reassess 60m (Dr. Shah) |
| Relay | Inventory, “I gave…”, `confirm PRN`, effectiveness follow-up, unauthorized Benadryl path |
| API | `GET /prn`, `POST /prn/episodes`, `POST /prn/episodes/reassess` |
| Tests | 7 unit tests PASS |
| Docs | `docs/product/FINAL_PRN_MEDICATION_CHARTING_CONTRACT.md` |

### Safety held

- No dose invention / recommendation language in 150-utterance public bank (`unsafe=0`)
- Unauthorized OTC reports flagged, not plan-activated
- Interval enforcement on re-charting
- Caregiver chat cannot authorize plan changes

---

## Public proof (API live `3789104` / `b63c0a6` lineage → latest push)

| Gate | Status |
|------|--------|
| Unit PRN suite | **PASS** (7/7) |
| PRN projection API | **PASS** |
| Preview → confirm charting | **PASS** (with interval safety when re-dosing early) |
| Unauthorized Benadryl path | **PASS** after routing fix |
| 150-utterance no dose invention | **PASS** |
| Full ACL multi-step reassess after interval | **PARTIAL** (depends on open episode state / interval) |
| Today UI PRN cards | **NOT WIRED** (projection ready, UI not rebuilt) |
| 20 compound browser journeys | **NOT COMPLETE** |
| Chaos / mutation / visual red-team | **NOT COMPLETE** |

---

## Scorecard fields

| Field | Value |
|-------|-------|
| PRN ORDER MODEL | **PASS** (domain) |
| PRN EPISODE MODEL | **PASS** (domain) |
| REASON CAPTURED | **PASS** on charted path |
| RESULT / REASSESSMENT | **PASS** unit; **PARTIAL** public multi-turn under load |
| NO DOSE INVENTION | **PASS** |
| UNAUTHORIZED ≠ PLAN | **PASS** |
| INTERVAL ENFORCEMENT | **PASS** |
| PRN/RELAY SCREEN CONFLICTS | **PARTIAL** (UI not consuming projection yet) |
| PRN DUPLICATE CARDS | N/A UI |
| ACL PRN JUDGE JOURNEY | **PARTIAL** |
| NON-PRN REGRESSIONS | not full re-bank |
| VISIBLE RAW CODE | 0 on PRN copy |
| TYPECHECK | **PASS** |
| UNIT | **PASS** |
| BUILD | **PASS** (Render) |
| API SOURCE/DEPLOY | latest `3789104` family / `b63c0a6`+ |
| APP | prior `8774d0b` (no PRN UI this pass) |
| DEPLOYMENT PARITY | **YES** API |
| BACKGROUND WORKERS | **0** |
| FOUNDER DESKTOP / PHONE | **PENDING** |
| **SUBMISSION READINESS** | **READY** for synthetic lab demo of PRN domain+Relay with disclosed UI gaps |
| **PRODUCT FREEZE** | **NOT RESTORED** |

---

## Remaining internal gaps

1. Wire `buildPrnProjection` into Today / Care / My Shift / Handoff / Attention (signal-first).
2. Stabilize multi-turn reassess after interval-blocked re-confirm on long-lived lab data.
3. Full 20 compound PRN browser journeys + chaos/mutation/visual red-team.
4. Configurable protocol packs per license/setting (engine stub is single lab protocol).

Agent Zero stops here.
