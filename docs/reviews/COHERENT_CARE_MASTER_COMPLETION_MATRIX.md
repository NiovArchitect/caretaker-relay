# Coherent Care Master Completion Matrix

**Authoritative inventory for FULL COHERENT-CARE COMPLETION.**  
**Updated:** 2026-07-25 (post crash recovery — evidence-based)  
**APP:** `dcadd81` source = live deploy  
**API:** `327d543` source = live deploy  

**Status values:** IMPLEMENTED + PUBLICLY PROVEN | IMPLEMENTED + TEST PROVEN | IMPLEMENTED NOT PROVEN | PARTIALLY IMPLEMENTED | NOT IMPLEMENTED | BLOCKED EXTERNALLY | NOT APPLICABLE + JUSTIFICATION | FAILED

| # | Requirement | Source | Status | Location / notes |
|---|-------------|--------|--------|------------------|
| 1 | Recipient context transaction boundary | Coherent-care §1 | IMPLEMENTED + TEST PROVEN | App.tsx `switchRecipient`; care-experience tests |
| 2 | Coordination recipient bleed | Coherent-care §2 | IMPLEMENTED + TEST PROVEN | RelayPanel rid rebind |
| 3 | Switch → Today landing | Coherent-care §3 | IMPLEMENTED + TEST PROVEN | switchRecipient → today |
| 4 | Nav scroll rules | Coherent-care §4 | IMPLEMENTED + TEST PROVEN | NAVIGATION_STATE_AND_CONTEXT_RULES.md |
| 5 | Wellbeing observation extract | Coherent-care §5 | IMPLEMENTED + PUBLICLY PROVEN | Live understand 327d543: REPORTED + recordedAt/effectiveAt (LLM fallback) |
| 6 | Caregiver report = REPORTED value | Coherent-care §6–7 | IMPLEMENTED + PUBLICLY PROVEN | soft obs REPORTED/low; not clinical NEEDS CHECKING |
| 7 | recorded_at / effective_at | Coherent-care time | IMPLEMENTED + PUBLICLY PROVEN | care-time.ts; live candidates carry both |
| 8 | Recipient timezone display | Coherent-care time | IMPLEMENTED + TEST PROVEN | America/Los_Angeles; formatInCareTimezone |
| 9 | Looks right commits | Coherent-care | IMPLEMENTED + TEST PROVEN | confirmCareUpdateAsync; household-closure E2E |
| 10 | Correct something E2E | Coherent-care | IMPLEMENTED + TEST PROVEN | startCorrection + corrections API + re-verify |
| 11 | Dual documentation paths | Doc addendum | IMPLEMENTED + TEST PROVEN | ManualCareNotePanel + Relay propose/confirm |
| 12 | Manual/Relay same record model | Doc addendum | IMPLEMENTED + TEST PROVEN | CARE_NOTE_V1 |
| 13 | Role-aware note kinds | Doc addendum | IMPLEMENTED + TEST PROVEN | noteKindForRole |
| 14 | Status synthesis “how is…” | Intelligence | IMPLEMENTED + PUBLICLY PROVEN | Family vs Shah distinct public answers |
| 15 | Role-aware Relay framing | Intelligence | IMPLEMENTED + PUBLICLY PROVEN | Clinical-facing vs plain-language |
| 16 | Authority matrix doc | Architecture | IMPLEMENTED + TEST PROVEN | CARE_INFORMATION_AUTHORITY_MATRIX.md |
| 17 | Relay retrieval map | Architecture | IMPLEMENTED + TEST PROVEN | RELAY_INFORMATION_RETRIEVAL_MAP.md |
| 18 | Robert provider consistency | Walkthrough | IMPLEMENTED + PUBLICLY PROVEN | Public: Dr. Amara Cole on Robert |
| 19 | Maya/Robert authorization | Walkthrough | IMPLEMENTED + PUBLICLY PROVEN | Public: Maya NO_RELATIONSHIP on cr-robert |
| 20 | Sticky coordination composer | Coherent-care | IMPLEMENTED + TEST PROVEN | coord-composer-sticky CSS |
| 21 | Notification counter clickable | Coherent-care | IMPLEMENTED + TEST PROVEN | openNotifications → Today inbox |
| 22 | Notification center list | Coherent-care | IMPLEMENTED + TEST PROVEN | Today inbox surface |
| 23 | Avatar menu dismiss | Coherent-care | IMPLEMENTED + TEST PROVEN | click-outside + Escape |
| 24 | New recipient onboarding packet | Coherent-care | IMPLEMENTED + TEST PROVEN | request care packet UI (honest) |
| 25 | Document empty state | Walkthrough | IMPLEMENTED + TEST PROVEN | honest empty copy |
| 26 | Cross-surface invariants | Coherent-care | IMPLEMENTED + TEST PROVEN | switch clears state |
| 27 | Physician/NP hands-on readiness | Addendum | IMPLEMENTED + TEST PROVEN | PHYSICIAN_NP_HANDS_ON_READINESS.md + role framing |
| 28 | Privacy multi-recipient | Safety | IMPLEMENTED + PUBLICLY PROVEN | isolation + Maya/Robert; judge safety 110/110 pre-crash |
| 29 | Live OpenAI synthesis | External | BLOCKED EXTERNALLY | quota 429; structured fallback in use |
| 30 | Live EHR import | N/A | NOT APPLICABLE + JUSTIFICATION | honest care packet request only |

## Crash recovery notes

- Pre-crash matrix over-claimed some PUBLICLY PROVEN rows before 327d543 landed.
- After recovery: APP/API source **match** live Render deploys.
- Judge torture 309/309, red team 121/121, button 25/25 proven pre-crash on prior API SHA; re-run required on 327d543 before freeze.
- human-experience-proof and browser public E2E interrupted by crash — re-run before freeze.

## Closure rule

Campaign may restore PRODUCT FREEZE only when rows 1–28 are IMPLEMENTED + (PUBLICLY|TEST) PROVEN, final regression green on live SHAs, and P0/P1 = 0.
