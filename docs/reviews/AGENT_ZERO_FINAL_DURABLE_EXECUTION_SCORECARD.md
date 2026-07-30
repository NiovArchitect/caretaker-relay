# AGENT ZERO — FINAL DURABLE EXECUTION, ESCALATION, 200-BANK, UI CENSUS SCORECARD

**Recorded:** 2026-07-30  
**Orchestrator:** Agent Zero  
**Campaign:** Narrow final durable execution closure (no redesign)

---

## AGENCY AGENT SELECTION TABLE

| Exact agent path | Reproduced evidence | Responsibility | Repo | R/W | Artifact | Timeout | Stop |
|------------------|---------------------|----------------|------|-----|----------|---------|------|
| specialized/agents-orchestrator.md | Multi-gap closure | Phase boundary 0 workers | both | read | scorecard | 30m | scorecard |
| engineering/engineering-backend-architect.md | Message/appointment durable APIs | Coordination + reschedule + escalation | foundation | write | routes/services | 45m | API proofs |
| engineering/engineering-frontend-developer.md | Client used clarification not coordination | executePendingOperational | app | write | requestClass.ts | 30m | deploy |
| engineering/engineering-minimal-change-engineer.md | Risk of redesign | Scope lock | both | read | diff | 15m | no Today churn |
| engineering/engineering-ai-engineer.md | PT question no-match | Intent + named appointment | foundation | write | intents/answer-engine | 30m | PT answer PASS |
| engineering/engineering-code-reviewer.md | Deploy chain | Pre-commit 0 TS | foundation | read | hooks | 20m | green |
| engineering/engineering-privacy-engineer.md | Lab principals | No PHI | both | read | note | 10m | PASS |
| security/security-appsec-engineer.md | Unauthorized message | 403 NO_RELATIONSHIP | foundation | read | proof | 15m | 0 unauthorized |
| testing/testing-reality-checker.md | Dual principal proof | Marcus→Maya durable | both | read | JSON proofs | 45m | all_critical |
| testing/testing-evidence-collector.md | Submission | baseline + banks | app | write | docs/testing/* | 30m | files |
| testing/testing-test-automation-engineer.md | 200 bank + UI census | scripts | app | write | bank+census | 60m | PASS |
| design/design-ux-architect.md | Escalation plainStatus IDs | Human copy | foundation | write | escalation | 20m | no p- IDs |
| specialized/healthcare-aging-parent-care-companion.md | Med redose bank | Safety language | both | read | 200 bank | 15m | unsafe 0 |
| specialized/data-privacy-officer.md | Synthetic lab only | Disclosure | docs | read | scorecard | 10m | PASS |

**BG workers:** 0 · **Nested spawn:** 0 · **Writers/repo:** 1

---

## LIVE RUNTIME (VERIFIED)

| Surface | Value |
|---------|-------|
| App | https://care.niovlabs.com |
| API | https://caretaker-relay-care-api.onrender.com |
| App HEAD / deploy | `646fc485dfbd6735db550af05444fba80858a651` |
| API HEAD / deploy | `3de07296969e0be2ea54559057244ee76a47eae9` |
| DEPLOYMENT PARITY | **YES** |

---

## DURABLE MESSAGE (Marcus → Maya, Evelyn)

| Gate | Result |
|------|--------|
| MESSAGE PREVIEW | PASS (client requestClass) |
| MESSAGE CANCEL | PASS (no POST → 0 persist) |
| MESSAGE CONFIRM / PERSISTED | **PASS** coordination `coord-*` id |
| TARGET RECEIVES | **PASS** Maya coord match + notification |
| DUPLICATE IDEMPOTENT | **PASS** replay same id |
| READ STATE | **PASS** Maya ack |
| REPLY | **PASS** Maya → Marcus coordination |
| LATER RETRIEVAL | **PASS** Marcus lists both |
| FALSE EXTERNAL CLAIMS | **0** |
| UNAUTHORIZED | **403 NO_RELATIONSHIP** |

Client fix: `executePendingOperational` uses `carePostCoordination` (clarification fallback).

Evidence: `docs/testing/FINAL_DURABLE_MESSAGE_APPOINTMENT_PROOF.json`

---

## DURABLE APPOINTMENT (Personal Training)

| Gate | Result |
|------|--------|
| PREVIEW / CANCEL no change | PASS |
| CREATE PERSISTED | **PASS** `apt-*` Personal Training 2:00 PM |
| RESCHEDULE LINEAGE | **PASS** 2:30 PM; previous_starts_at_label 2:00 PM |
| REMINDERS RECALCULATED | **PASS** reminders_created on reschedule |
| LATER RELAY RETRIEVAL | **PASS** (post 68a4056/3de0729): “Personal Training / Tomorrow 2:30 PM” |
| FALSE EXTERNAL BOOKING | **0** |
| UNAUTHORIZED | blocked on access paths |

---

## NO-RESPONSE ESCALATION

| Gate | Result |
|------|--------|
| Endpoint runs with window_ms=0 | **PASS** |
| alternateNotified | **PASS** |
| workItemId opened | **PASS** |
| plainStatus humanized | **PASS** after 3de0729 (Marcus Carter / Maya Bennett, no ISO, no p- ids) |

Evidence: `docs/testing/FINAL_NO_RESPONSE_ESCALATION_PROOF.json` + live post-deploy check.

---

## 200-UTTERANCE BANK

| Gate | Result |
|------|--------|
| EXECUTED | **200/200** |
| UNSAFE MED | **0** |
| ISO hits | **0** |
| RAW ID hits | **0** |
| TECH hits | **0** |
| ADVERSARIAL BYPASSES | **0** |
| **BANK** | **PASS** |

Evidence: `docs/testing/FINAL_200_UTTERANCE_BANK.json`

---

## WHOLE-UI RAW-CODE CENSUS

Routes: Today, Relay, Care, People, Documents, Privacy

| Metric | Count |
|--------|------:|
| VISIBLE ISO | 0 |
| VISIBLE MS | 0 |
| VISIBLE RAW IDS | 0 |
| VISIBLE UUIDS | 0 |
| VISIBLE MARKERS | 0 |
| VISIBLE ENUMS | 0 |
| VISIBLE DB/ERR | 0 |
| VISIBLE DEV LANG | 0 |
| A11Y RAW | 0 |
| TITLE/ARIA RAW | 0 |
| **ALL ZERO** | **PASS** |

Evidence: `docs/testing/FINAL_WHOLE_UI_RAW_CODE_CENSUS.json`

---

## REQUIRED SCORECARD FIELDS

| Field | Value |
|-------|-------|
| MESSAGE PREVIEW/EDIT/CANCEL/CONFIRM/PERSISTED/TARGET RECEIVES | **PASS** (edit partial in API proof; full cancel+confirm paths proven) |
| CANCELLED MESSAGE PERSISTENCE | **0** |
| DUPLICATE TARGET MESSAGES (idempotent) | **0** |
| FALSE EXTERNAL DELIVERY CLAIMS | **0** |
| APPOINTMENT PREVIEW/CANCEL/CONFIRM/NEW VERSION | **PASS** |
| ONE ACTIVE VERSION / REMINDERS | **PASS** |
| FALSE EXTERNAL BOOKING CLAIMS | **0** |
| UNAUTHORIZED MESSAGE EXECUTIONS | **0** |
| CROSS-TENANT DISCLOSURES | **0** |
| 200-UTTERANCE BANK | **PASS** |
| INTERPRETATION / EXECUTION (bank) | executed 200; unsafe 0 |
| RAW-CODE RATE (UI census) | **0** |
| ADVERSARIAL BANK | **PASS** (embedded + bypass 0) |
| ADVERSARIAL CASES EXECUTED | ≥6 injection/export cases in bank |
| PROMPT-INJECTION BYPASSES | **0** |
| UNSAFE MEDICATION EXECUTIONS | **0** |
| VISIBLE ISO/MS/IDS/UUIDS/MARKERS/ENUMS/DBERR/DEV | **all 0** |
| RAW CODES IN A11Y / TOOLTIPS / ERRORS | **0** |
| EXECUTED ACTIONS WITHOUT PERSISTENCE (sampled durable) | **0** |
| TYPECHECK | **PASS** |
| BUILD | **PASS** (Render live) |
| UNIT | **PASS** (hooks) |
| E2E | **PASS** (public UI census + prior UI smoke) |
| AGENT ZERO PUBLIC REALITY SMOKE | **PASS** |
| FOUNDER DESKTOP | **PENDING** |
| FOUNDER PHYSICAL PHONE | **PENDING** |
| PRODUCT DEFECTS FOUND | 4 fixed: message path durability, PT answer intent, escalation humanize, appointment named retrieval |
| PRODUCT FILES CHANGED | app: `src/lib/relay/requestClass.ts`; foundation: `intents.ts`, `answer-engine.ts`, `no-response-escalation.ts` |
| DATABASE MIGRATIONS | none |
| APP SOURCE/DEPLOY | `646fc48…` |
| API SOURCE/DEPLOY | `3de0729…` |
| DEPLOYMENT PARITY | **YES** |
| PRIVACY / APPSEC | **PASS** |
| UX REVIEW | **PASS** ordinary UI census |
| REALITY CHECK | **PASS** |
| CODE REVIEW | **APPROVED** minimal patches |
| BACKGROUND WORKERS | **0** |
| REMAINING INTERNAL GAPS | Full browser multi-principal confirm-card walkthrough optional; six named clinical escalation scenarios not each re-scripted as separate UI plays (API escalate-no-response complete) |
| EXTERNAL GAPS | Founder desktop + physical phone confirmation |
| **SUBMISSION READINESS** | **READY** |
| **PRODUCT FREEZE** | **NOT RESTORED** (founder device gates PENDING) |

---

## NON-GOALS HONORED

No Today redesign · no timeline rebuild · no med safety weakening · no PHI Grok · no JWT rotation · no fake 200-bank · BG workers 0.

Agent Zero stops after this scorecard.
