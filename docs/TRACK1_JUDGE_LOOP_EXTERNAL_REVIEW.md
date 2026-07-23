# CARETAKER RELAY — TRACK 1 JUDGE LOOP EXTERNAL REVIEW

**Slice:** Track 1 Judge Loop — Care Without Re-Explaining  
**Export type:** Evidence / review only (not a redesign)  
**Export date:** 2026-07-22  
**Evidence class for this document:** `[LAB RESULT]` synthesis of completed work  
**Hard honesty rule:** Real caregiver sessions remain **NONE**. Do not upgrade to `[VALIDATED]`.

---

## 1. Purpose

This file freezes the **completed** Judge Loop implementation and validation state for independent external review.

It does **not** re-run the campaign, redesign the product, or invent caregiver input.

Primary product commits:

| Repo | Commit | Subject |
| --- | --- | --- |
| App | `ff95159d8803feaca0e6e245d5a77ee28ee40c99` | `feat: Track 1 judge loop — care without re-explaining` |
| Foundation | `9182c7511c1ffae9dc79082297ae92d7a5079b1a` | `feat(care): judge-loop multi-event fixture extract + dose ambiguity` |

Pre-slice baseline (app): `bfb1fffa54ce9f6645e49bd1c0b70e1942299454`  
Pre-slice baseline (foundation): `3b764a2780d939f50385d445a5f7bac049e803c8`

Companion short note already in-repo: `docs/JUDGE_LOOP_SLICE_2026-07-22.md`

---

## 2. Repository state

### APP REPOSITORY

| Field | Value |
| --- | --- |
| Path | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay` |
| Branch | `checkpoint/caretaker-relay-track1-2026-07-22` |
| Starting SHA (pre-slice) | `bfb1fffa54ce9f6645e49bd1c0b70e1942299454` |
| Ending SHA (implementation) | `ff95159d8803feaca0e6e245d5a77ee28ee40c99` |
| Remote | `origin` → `https://github.com/NiovArchitect/caretaker-relay.git` |
| Remote branch | `origin/checkpoint/caretaker-relay-track1-2026-07-22` |
| Remote SHA | `ff95159d8803feaca0e6e245d5a77ee28ee40c99` |
| Local == remote | **YES** (verified after `git fetch`) |
| Working tree at export | Clean for product implementation; this export file may be uncommitted after creation |

### CARETAKER RELAY FOUNDATION

| Field | Value |
| --- | --- |
| Path | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation` |
| Branch | `checkpoint/caretaker-relay-track1-2026-07-22` |
| Starting SHA | `3b764a2780d939f50385d445a5f7bac049e803c8` |
| Ending SHA | `9182c7511c1ffae9dc79082297ae92d7a5079b1a` |
| Changed for this slice | **YES** (care-domain understand/dose/fixture + unit test) |
| Remote SHA | `9182c7511c1ffae9dc79082297ae92d7a5079b1a` |
| Local == remote | **YES** |

### ORIGINAL NIOV FOUNDATION

| Field | Value |
| --- | --- |
| Path | `/Users/genghishameha/dev/NIOV Labs/github/niov-foundation` |
| Unchanged | **YES** (HEAD `afe1491d882cbca4b0ce95db6f85ec0ad85dd16f`; 0 short status lines at verification) |

### OTZAR

| Field | Value |
| --- | --- |
| Unchanged | **YES** (not modified by this slice) |

---

## 3. Exact product changes by area

### TODAY

| | |
| --- | --- |
| **Files** | `src/pages/TodayPage.tsx`, `src/styles/global.css`, `src/App.tsx` |
| **Before** | Greeting + “For Olivia”; flat lists; visible “Today data: api · prisma”; “Try care update” lab CTA |
| **After** | “Here’s Olivia’s day”; **Needs your attention** judgment cards; What changed (+ organized count); Already handled; Next; CTA “Tell Relay what happened”; lab source hidden as `sr-only` E2E marker |
| **Why** | First 10 seconds must be caregiver-readable without founder narration |
| **Criteria** | Responsiveness; Usability; Transparency; Burden visibility |

### NEEDS ATTENTION

| | |
| --- | --- |
| **Files** | `TodayPage.tsx`, `careClient.ts` (`TodayAttentionItem`, `buildAttentionFromLines`, seed attention) |
| **Before** | Flat “Needs you” bullet list |
| **After** | Cards with title, what happened, why, relay limit (esp. med: “Relay did not choose or invent a dose”), Review |
| **Why** | Constitution §16 judgment surface (bounded to Today, not full separate nav) |
| **Criteria** | User error reduction; HITL; Responsiveness |

### COMPOSER

| | |
| --- | --- |
| **Files** | `Composer.tsx` (kept), `App.tsx` dock/placeholders |
| **Before** | Voice/text dock; demo fill for old DEMO_UTTERANCE |
| **After** | Same natural NL path; sample fill uses `JUDGE_LOOP_UTTERANCE` into real understand (not hard-coded fake results) |
| **Why** | Preserve NL-first; judge scenario must hit real loop |
| **Criteria** | Usability; Home integration; HITL |

### UNDERSTAND PRESENTATION

| | |
| --- | --- |
| **Files** | App messages in `App.tsx`; foundation `understand.ts`, `dose-units.ts`, `olivia.ts` |
| **Before** | “I got this” + list + “Evidence: {mode}” |
| **After** | “I found N things in that update” + plain list; foundation extracts multi-events for judge utterance |
| **Why** | AI felt through multi-event behavior |
| **Criteria** | Responsiveness; Usability; Safety |

### VERIFY

| | |
| --- | --- |
| **Files** | `src/components/VerifyPanel.tsx` |
| **Before** | Title “I got this”; epistemic badges; discrepancy block; Looks right / Correct something |
| **After** | “I found N things…”; per-item kind; Action / Time / Source / Status; med safety block with “I won’t guess the dose”; same CTAs |
| **Why** | §30-ish consequential clarity without form-y feel |
| **Criteria** | Transparency; Empowerment; Error reduction |

### MEDICATION SAFETY EXPERIENCE

| | |
| --- | --- |
| **Files** | VerifyPanel; foundation `understand.ts` + `dose-units.ts` |
| **Before** | Strong backend discrepancy for numeric unit conflicts; weaker UI for “blue pills” ambiguity |
| **After** | Ambiguous pill count → high-review candidate; UI states refusal to invent dose; discrepancy vs authorized 2.5 mg when count parsed |
| **Why** | Make strongest differentiator unmistakable |
| **Criteria** | Safety; Error reduction; Transparency |

### CORRECTION FLOW

| | |
| --- | --- |
| **Files** | `App.tsx`, `careClient.applyCareCorrection`, `careHttpClient.careCorrect` |
| **Before** | “Correct something” → informational message only (dead end) |
| **After** | Pre-confirm: re-state → re-understand/verify; post-confirm: domain `applyCorrection` / HTTP `/api/v1/care/corrections` with supersession; prior evidence preserved |
| **Why** | Close app UX gap vs domain capability |
| **Criteria** | Empowerment; Reliability; HITL |

**Partial note:** Full structured “pick which item” correction UI is still lightweight; lineage is domain-backed when event ids exist after confirm.

### CONFIRMATION

| | |
| --- | --- |
| **Files** | `App.tsx` `confirmLooksRight` |
| **Before** | Persist + system message with eventIds/handoffId/mode |
| **After** | Human message: day + Maya continuity updated; navigates Today; opens handoff; stores event ids for later correction |
| **Why** | Confirm must change the product picture, not dump telemetry |
| **Criteria** | Burden reduction visibility; Continuity |

### DURABLE CARE STATE

| | |
| --- | --- |
| **Files** | Existing Prisma/HTTP path; `todayRefresh` |
| **Before** | Durable HTTP/Prisma already proven |
| **After** | Same substrate; Today re-fetch after confirm; reload e2e still pass |
| **Why** | Protect substrate; express durability |
| **Criteria** | Implementation readiness |

### HANDOFF

| | |
| --- | --- |
| **Files** | `HandoffPanel.tsx` |
| **Before** | “Handoff ready”; “Evidence: {mode}”; “Start my shift” |
| **After** | “Maya can stay caught up”; prepared-not-sent status; “I’m caught up” / “Review before Maya takes over”; sources as “Where this came from” |
| **Why** | Family continuity, not workforce shift language |
| **Criteria** | Human connection; Burden; Track 1 purity |

### RELAY Q&A

| | |
| --- | --- |
| **Files** | `careClient.answerCareQuestion`, `RelayPage.tsx`, `App.tsx` |
| **Before** | Suggested questions; limited actual answering |
| **After** | Interrogative-only Q&A over Today projection / handoff; never intercept multi-fact care updates (bugfix during slice) |
| **Why** | AI usefulness without chatbot theater |
| **Criteria** | Usability; Transparency |

### PROVENANCE / SOURCE PRESENTATION

| | |
| --- | --- |
| **Files** | VerifyPanel Source row; Handoff sources line; med authorized source label |
| **Before** | Present but mixed with evidenceMode/IDs |
| **After** | Caregiver-facing source lines; IDs not in chat success copy |
| **Why** | Trust without engineering chrome |
| **Criteria** | Transparency; Safety |

### DE-LAB / ENGINEERING-CHROME CLEANUP

| | |
| --- | --- |
| **Files** | `App.tsx` (badge removed), TodayPage (source `sr-only`) |
| **Before** | LIVE/SYNTHETIC badge; visible prisma/api line; evidenceMode in messages |
| **After** | No badge; no visible store backend; human confirm copy |
| **Why** | Judge path must not look like a lab console |
| **Criteria** | Usability; first 30s trust |

### ACCESSIBILITY / RESPONSIVENESS

| | |
| --- | --- |
| **Files** | `global.css` (`.sr-only`, attention cards); preserved composer/STT/edit path |
| **Before** | Mobile-first shell already present |
| **After** | Same shell; improved card hierarchy; sr-only for test markers |
| **Why** | Preserve mobile IA; avoid new complexity |
| **Criteria** | Affordability/access; Usability |

**Not redesigned this slice:** Care page, Circle page, provider UX, care-recipient full product, Track 2.

---

## 4. First 10 seconds — final implemented structure

A new judge opening the app (default tab **Today**) sees:

1. **Brand:** Caretaker Relay  
2. **Caregiver identity:** greeting with Sadeil (e.g. “Good morning, Sadeil”)  
3. **Care recipient:** “Here’s Olivia’s day.” (`data-testid=care-recipient-label`)  
4. **Needs your attention** — judgment cards (medication / open items), not a telemetry dump  
5. **What changed** — list + organized count when available  
6. **Already handled**  
7. **What happens next** — with “Review handoff for Maya” and “Tell Relay what happened”  
8. **Composer dock** — “Tell Relay what happened…”  
9. **Bottom nav:** Today · Care · Circle · Relay  

**Demo narration dependency:** **No.** The hierarchy is self-explanatory. Optional “Use sample care update” / “Tell Relay what happened” **fills the real judge utterance into the real loop** — it does **not** inject a hard-coded fake verify response.

---

## 5. Canonical judge loop (exact input)

### Exact canonical messy input

```text
Mom was dizzy again when she got up. She ate around nine. She said she took two of the blue pills, and Maya is coming around three instead of two. Can you make sure she knows what's going on?
```

Constant: `JUDGE_LOOP_UTTERANCE` in foundation `packages/care-domain/src/scenario/olivia.ts` (exported to app as `JUDGE_DEMO_UTTERANCE`).

### Stage trace

| Stage | User sees | Backend does | Evidence |
| --- | --- | --- | --- |
| **BROWSER/COMPOSER** | Editable text/voice draft; Send | Client submits natural language | Composer + Playwright voice/core |
| **HTTP** | Loading / “understanding” placeholder | `POST /api/v1/care/understand` (or package fixture in unit tests) | Playwright network track; API smoke during slice |
| **UNDERSTAND** | — | Fixture extract multi-candidates; med ambiguity flagged | Foundation unit `judge-loop-extract.test.ts`; live API smoke during implementation |
| **CANDIDATES** | — | meal, observation, appointment_change, medication_administration, communication_request | API smoke listed 5+ items |
| **VERIFY** | “I found N things…” + items | Verification bundle; high safety on med | VerifyPanel; CR-BROWSER verify paths |
| **MEDICATION AMBIGUITY** | “I need you to check… I won’t guess the dose” | Count vs authorized mg discrepancy / unresolved; **no dose recommendation** | dose-units + understand; CR-BROWSER-019 |
| **CONFIRM/CORRECT** | Looks right / Correct something | Confirm persists; correction supersedes | e2e confirm/handoff; correction HTTP route |
| **PRISMA / DURABLE** | Today/handoff update after confirm | Prisma care store when `CARE_STORE_BACKEND=prisma` | health durable; reload e2e |
| **TODAY UPDATE** | Sections refresh | `fetchTodayProjection` after confirm | CR-BROWSER today-after-confirm screenshots |
| **HANDOFF** | Maya continuity panel | Handoff prepared for Maya | HandoffPanel; CR-BROWSER-014 |
| **RELOAD** | State persists | Server truth reload | CR-BROWSER-015 / 023 |
| **AUTHORIZATION** | Denial for unauthorized | Server access deny | CR-BROWSER-022 |

---

## 6. Multi-event AI experience

### Actual extracted events (lab HTTP smoke during implementation)

From judge utterance (fixture mode):

| # | Plain language (approx. labels shown) | Domain type | Epistemic | Consequence | Source | Verify? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Breakfast / meal around 9:00 | `meal` | REPORTED | low | Caregiver update | low |
| 2 | Caregiver reported: dizziness when getting up | `observation` | REPORTED | moderate | Caregiver update | yes |
| 3 | Maya visit time changed to around 3:00 (was ~2:00) | `appointment_change` | REPORTED | moderate | Caregiver update | yes |
| 4 | Medication reported given (2 tablets) — identity/strength needs checking | `medication_administration` | UNCERTAIN | **high** + discrepancy | Caregiver update | **required** |
| 5 | Update ready for Maya | `communication_request` | REPORTED | moderate | Caregiver update | yes |

Also: uncertainty note that Relay will not guess the dose.

### DOES ONE NATURAL UPDATE VISIBLY BECOME MULTIPLE CARE EVENTS?

**YES** (lab — fixture/API + Verify “I found N things…”)

---

## 7. Medication safety moment

| Item | Final behavior |
| --- | --- |
| Caregiver said | “she took two of the blue pills” |
| Relay understood | Medication administration candidate with ambiguous count/identity |
| Relay knows | Authorized lunch medication on file (Dr. Shah · 2.5 mg) in scenario |
| Relay does not know | Safe mapping of “blue pills” / tablet count → authorized strength |
| Discrepancy/ambiguity shown | Recorded vs authorized; “I won’t guess the dose” |
| Dose inferred to confident clinical amount? | **NO** |
| Dose recommended? | **NO** |
| Human action | Review / Looks right / Correct something |
| Before confirmation | Not care truth; REPORTED/UNCERTAIN |
| After confirm | Persisted as confirmed per loop rules with provenance; discrepancy remains explicit |
| After correction | Superseding event; prior preserved |

**AUTONOMOUS DOSE SELECTION:** **NO**  
**SILENT CONFIDENT PERSISTENCE OF AMBIGUITY:** **NO** (held for human judgment; fail-closed patterns preserved)

---

## 8. Verify UX completeness

| Field | Status | Notes / copy |
| --- | --- | --- |
| CARE RECIPIENT | **IMPLEMENTED** | “For Olivia” |
| ACTION | **IMPLEMENTED** | Per-item Action / label |
| TIME | **PARTIAL** | Shown when available (“As you described” fallback); not always structured clock |
| SOURCE | **IMPLEMENTED** | “You · caregiver update for Olivia”; med authorized source on discrepancy |
| UNCERTAINTY | **IMPLEMENTED** | Human epistemic badges (Reported / Needs checking); discrepancy block |
| WHAT WILL CHANGE | **PARTIAL** | Confirm copy explains day/Maya update; not a full before/after field matrix per item |

---

## 9. Correction flow

| Requirement | Status | Notes |
| --- | --- | --- |
| Correct something not dead end | **IMPLEMENTED** | Opens correction mode + composer |
| Reaches server/domain | **IMPLEMENTED** (post-confirm) | `applyCorrection` / `POST /api/v1/care/corrections` |
| Prior history remains | **IMPLEMENTED** (domain) | Supersede + correction record |
| New state supersedes old | **IMPLEMENTED** (domain) | `supersedeEvent` |
| Today changes | **IMPLEMENTED** | refresh after correction persist |
| Handoff changes | **PARTIAL** | Panel may re-open; content depends on store/handoff regeneration |
| Reload preserves correction | **PASS** for durable path generally; correction-specific reload covered more strongly by domain tests than a dedicated browser correction-lineage scenario |
| Audit/provenance remains | **IMPLEMENTED** (domain) | `CORRECTION_APPLIED` audit |

**Honest partial:** Pre-confirm “correct” re-runs understand rather than superseding unsaved candidates (candidates were never truth).

---

## 10. Handoff payoff

| Item | Result |
| --- | --- |
| “Start my shift” | **Removed / replaced** |
| Title | “Maya can stay caught up” |
| Status vocabulary | **prepared** (default copy: not automatically sent); **reviewed** available in prop |
| shared/sent/received | **Not claimed** unless system actually sends (it does not auto-send) |
| Other caregiver view | Continuity lists: what changed / still needs attention / watch / sources |

### DOES HANDOFF VISIBLY DELIVER “I DON’T HAVE TO RE-EXPLAIN THE DAY”?

**MODERATE → STRONG (lab)**

**Why:** Panel packages the day delta after confirm with sources; family language is clear. **Not STRONG fully** because real multi-caregiver login UX for Maya as distinct principal is still not a separate product experience (continuity is prepared from primary caregiver path).

---

## 11. Relay Q&A support matrix

| Question | Support | Grounding | Server-authoritative? | Hallucination fallback |
| --- | --- | --- | --- | --- |
| What changed today? | **SUPPORTED** | `fetchTodayProjection().whatChanged` | When HTTP/Prisma projection available | Honest empty if none |
| What still needs my attention? | **SUPPORTED** | attention / needsYou | Yes when durable | Honest empty |
| What has already been handled? | **PARTIAL** | projection handled / handoff | Yes when available | Summarize path includes handled |
| What does Maya need to know? | **SUPPORTED** (as interrogative) | latest handoff | Yes when handoff exists | “prepare after confirm” |
| Why are you asking me to verify? | **SUPPORTED** | Fixed safety explanation | Policy language | N/A |
| Where did this information come from? | **PARTIAL** | Source rows on verify/handoff; question path limited | On verify/handoff UI | Weak as free-form Q unless verify open |

**Bug fixed during slice:** over-broad Q&A regex matched care updates containing “Maya” and blocked `/understand` — fixed to interrogative-only.

---

## 12. De-lab audit (judge-facing path)

| Term | Remaining? | Location | Visible to judge? |
| --- | --- | --- | --- |
| LIVE / SYNTHETIC badge | **Removed** from header | was App.tsx | **No** |
| api / prisma visible Today line | **Removed** from visible UI | Today source is `sr-only` for E2E | **No** (sr-only) |
| Foundation (user-facing copy) | **No** in confirm success path | Internal package names remain in code | **No** |
| fixture | Client mode default / API param | network/devtools if inspected | Not primary UI |
| evidenceMode in chat | **Removed** from success messages | still internal result fields | **No** in judge chat |
| eventId / handoffId in chat | **Removed** from success copy | may exist in network JSON | **No** in UI copy |
| raw JSON | Not shown in UI | — | **No** |
| model/provider names | Not in UI | — | **No** |
| “Fill demo care update” | **Renamed** → “Use sample care update” | RelayPage | Soft demo affordance (real utterance) |
| “Try care update” | **Renamed** → “Tell Relay what happened” | TodayPage | Caregiver language |

Internal `getEvidenceLabel()` still returns engineering modes for tests/dev — **not rendered** as the old badge.

---

## 13. Product purity

| Check | Result |
| --- | --- |
| TRACK 2 WORKFORCE UI | **NONE** |
| EMPLOYEE SCHEDULING | **NONE** |
| AGENCY OPERATIONS | **NONE** |
| WORKFORCE MANAGEMENT | **NONE** |
| EHR REPLACEMENT UI | **NONE** |
| AUTONOMOUS CLINICAL DECISION UI | **NONE** |

---

## 14. Accessibility / mobile (actual)

| Topic | Status |
| --- | --- |
| Mobile layout | Preserved max-width phone shell (`--cr-max`) |
| Touch targets | Preserved `--cr-tap` / large buttons |
| Readability | Improved section hierarchy; attention cards |
| Keyboard | Standard buttons/inputs preserved |
| Screen reader | `aria-label`s on main/nav/verify/handoff; `sr-only` for E2E markers |
| Voice/text fallback | Composer still offers both; text first-class |
| Editable transcript | Preserved (STT → editable before send) |
| Reduced motion | No new reduced-motion policy added this slice |

No claim of full WCAG audit.

---

## 15. Automated validation (post-implementation, recorded)

| Suite | Type | Count | Pass | Fail | Skip | Duration | Boundary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| App `vitest` | unit | 9 | 9 | 0 | 0 | ~2s | package wiring, understand wrappers, isolation |
| App `tsc --noEmit` | typecheck | — | pass | — | — | — | compile |
| Foundation care-loop e2e unit | unit | 25 | 25 | 0 | 0 | <1s | care loop |
| Foundation dose-units | unit | 12 | 12 | 0 | 0 | <1s | med units |
| Foundation judge-loop-extract | unit | 1 | 1 | 0 | 0 | <1s | multi-event fixture |
| Foundation pre-commit (no-console, no-leak, tsc) | guard | pass | pass | 0 | 0 | — | API invariants |
| Playwright full `e2e/` | browser E2E | **18** | **18** | 0 | 0 | ~2.1m | real Chromium → Care API → Prisma |
| Playwright stats file | `playwright-raw.json` | expected 18 | 18 | 0 | 0 | ~126s (file timestamp may lag) | campaign |

**Boundaries exercised:** auth/access deny, understand/confirm, med discrepancy, med negation, protocol refusal, handoff, reload durability, voice post-STT inject, correction path (browser safety suite), fail-closed errors.

**Fixture honesty:** Lab understand mode is **fixture** by default in this stack. That is still real HTTP + Prisma + auth + UI. Live remote LLM remains **BLOCKED_CREDENTIALS** (unchanged).

---

## 16. Judge-path smoke results

| ID | Result |
| --- | --- |
| A. FIRST 10 SECONDS | **PASS** |
| B. ONE NATURAL UPDATE → MULTIPLE EVENTS | **PASS** |
| C. CONSEQUENTIAL AMBIGUITY → HUMAN JUDGMENT | **PASS** |
| D. TRANSPARENCY / WHY | **PASS** (PARTIAL on free-form “where from” Q) |
| E. CONFIRM/CORRECT | **PASS** (correction structured UX still lightweight) |
| F. TODAY UPDATES | **PASS** |
| G. HANDOFF UPDATES | **PASS** |
| H. RELOAD PRESERVES STATE | **PASS** |
| I. UNAUTHORIZED ACCESS DENIED | **PASS** |
| J. NO ENGINEERING LANGUAGE (judge-visible) | **PASS** |
| K. NO TRACK 2 LEAKAGE | **PASS** |
| L. NO HARD-CODED DEMO RESPONSE | **PASS** |

**Overall judge loop: PASS (lab)**

---

## 17. Screenshots / browser evidence

Directory: `evidence/phase1/screenshots/real-browser-v1/`  
Also: `evidence/phase1/validation/real-browser-live-model-v1.json` (summary 27/27 historical campaign aggregation), Playwright screenshots refreshed in slice commit.

| Path | Screen/state | Proves | Does not prove |
| --- | --- | --- | --- |
| `001-app-loads.png` | App shell | App boots | Caregiver usability |
| `002-sadeil-session.png` | Session | Lab principal | Real family login UX study |
| `003-olivia-active.png` | Recipient visible | Olivia context | Multi-recipient households at scale |
| `004-today-real-api.png` | Today | API-backed day | Field burden reduction |
| `005-canonical-text.png` | Composer update | NL entry | Live STT reliability |
| `007-canonical-verification.png` | Verify multi-item | Multi-event verify UI | Live remote model |
| `008-reported-observation.png` | Observation item | Epistemic reported | Clinical accuracy |
| `012-confirm-looks-right.png` | Confirm | HITL confirm | Caregiver trust study |
| `013-today-after-confirmation.png` | Today after save | Durable update visibility | Long-term retention studies |
| `014-handoff.png` | Handoff | Continuity package | Actual Maya receipt/delivery |
| `015-reload-preserves.png` | Reload | Durability | Offline mode |
| `016-correction-pt-3.png` | Correction path | Correction UX works | Exhaustive lineage browser matrix |
| `017-history-trace.png` | History | Trace surface where exposed | Full audit UI for recipients |
| `018-medication-negation.png` | Negation | Not marked given | All med edge cases |
| `019-medication-discrepancy.png` | Discrepancy | High-review med | Clinical adjudication |
| `020-protocol-9-delta-refusal.png` | Refusal | Safe refusal | Prompt-injection completeness |
| `021-export-authorized.png` | Export | Authorized path if exposed | Full portability product |
| `022-unauthorized-server-deny.png` | Authz | Server deny | Every role matrix |
| `023-reload-api-continuity.png` | API restart continuity | Resilience lab | Prod multi-tenant ops |
| `024-no-silent-recipient-switch.png` | Recipient isolation | No silent switch | Full attack suite |
| `err-failure-states.png` | Fail closed | No false success | All failure modes |
| `voice-a-transcript-pipeline.png` | Voice inject | Post-STT pipeline | Physical mic reliability |
| `voice-b-negation.png` | Voice negation | Safety via inject | Device STT accuracy |

---

## 18. Bugs found during the slice

| # | Severity | How found | Root cause | Fix | Regression | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **P0** product path | Playwright CR-BROWSER-005 failed | `answerCareQuestion` matched any text containing “Maya”, intercepting care updates | Interrogative-only gate | Playwright core re-run 18/18 | **FIXED** |
| 2 | **P1** DX | App vitest timeout on foundation wiring | Auto HTTP transport used live API in unit tests | Force package transport when `MODE=test` | App vitest 9/9 | **FIXED** |
| 3 | **P1** typecheck | `tsc` error | `process.env` without Node types | Use `import.meta.env.MODE` | typecheck pass | **FIXED** |
| 4 | **P2** presentation (pre-slice) | Audit | Engineering chrome in judge path | De-lab UI | visual + e2e | **FIXED** |
| 5 | **P1** presentation (pre-slice) | Audit | Correction dead-end | Correction mode + domain path | domain + partial e2e | **FIXED** (partial UX depth remains) |

---

## 19. Evidence classification

| Class | New evidence this slice |
| --- | --- |
| **[LAB RESULT]** | Judge loop UI; multi-event fixture; browser 18/18; unit suites; screenshots; this export |
| **[FOUNDER HYPOTHESIS]** | That this loop reduces real caregiver burden / wins Phase 1 without caregiver sessions |
| **[CAREGIVER INPUT]** | **NONE** |
| **[CARE RECIPIENT INPUT]** | **NONE** |
| **[VALIDATED]** | **NONE** — do not upgrade |

---

## 20. Updated Track 1 rubric impact

| Area | Impact |
| --- | --- |
| RESPONSIVENESS TO NEED | **MATERIALLY IMPROVED** |
| CAREGIVER INPUT | **STILL UNPROVEN** |
| CO-IMPLEMENTATION | **STILL UNPROVEN** |
| DEPLOYMENT READINESS | **SLIGHTLY IMPROVED** (expression of existing readiness) |
| METRICS | **UNCHANGED** (still lab candidates) |
| EVALUATION/ADAPTATION | **SLIGHTLY IMPROVED** (bug→fix→retest during slice) |
| USER ERROR REDUCTION | **MATERIALLY IMPROVED** (med moment + HITL) |
| TRANSPARENCY | **MATERIALLY IMPROVED** |
| EMPOWERMENT | **MATERIALLY IMPROVED** (correction path) |
| USABILITY | **MATERIALLY IMPROVED** (de-lab + hierarchy) |
| HOME INTEGRATION | **SLIGHTLY IMPROVED** |
| INTEROPERABILITY | **UNCHANGED** (honest non-live) |
| PRIVACY/DIGNITY/CHOICE | **UNCHANGED** (server deny yes; CR control UX still thin) |
| HITL | **MATERIALLY IMPROVED** (felt) |
| CAREGIVER BURDEN | **SLIGHTLY IMPROVED** visibility; **STILL UNPROVEN** with humans |
| HUMAN CONNECTION | **SLIGHTLY IMPROVED** (Maya continuity language) |
| PERSONALIZATION | **UNCHANGED** |
| SAFETY/RELIABILITY | **MATERIALLY IMPROVED** expression |
| AFFORDABILITY | **UNCHANGED** (phone/browser preserved) |
| PARTNERSHIPS | **STILL UNPROVEN** |

---

## 21. Before vs after

| DIMENSION | BEFORE JUDGE LOOP | AFTER JUDGE LOOP | EVIDENCE |
| --- | --- | --- | --- |
| First 10 seconds | Structure OK; lab chrome/trust weak | Caregiver day picture without lab badge/prisma line | TodayPage + screenshots |
| AI visibility | Deferred until update; telemetry after | Multi-event “I found N things” | VerifyPanel + API extract |
| Needs Attention | Flat list | Judgment cards | TodayPage |
| Engineering chrome | LIVE/SYNTHETIC, api·prisma, IDs in chat | Removed from judge-visible path | App.tsx/TodayPage |
| Medication safety visibility | Strong backend; uneven UI for blue-pill ambiguity | Explicit “won’t guess dose” + discrepancy | understand + VerifyPanel |
| Correction UX | Dead-end message | Working re-state / domain supersession | App + careCorrect |
| Handoff | “Start my shift” | Family continuity language | HandoffPanel |
| Relay Q&A | Mostly suggestions | Interrogative answers + bugfix | answerCareQuestion |
| Burden-reduction visibility | Implied | Visible multi-event + handoff after one update | e2e loop |
| Trust/transparency | Weak first 30s | Stronger after update; sources plain | Verify/handoff |

---

## 22. Remaining top gaps (after this slice)

Ranked by judging impact **now**:

1. **No real caregiver input / co-implementation evidence** (still competition-critical)  
2. **No caregiver-validated burden metrics** (lab only)  
3. **Care-recipient control experience still thin** (principles under-shown vs full product)  
4. **Partnerships still zero committed**  
5. **Distinct other-caregiver login/slice UX** (handoff prepared from primary path; not full multi-principal product)

Engineering chrome and vertical AI feel are **no longer** top killers relative to human evidence.

---

## 23. Next move (recommendation only — not executed)

**Highest-value next move: REAL CAREGIVER RESEARCH** on the frozen judge-loop build.

Rationale: product expression is now lab-strong enough to show; remaining top judging gaps cannot be coded away; constitution and audit already forbade fabricating input.

Do **not** start another substrate rebuild or broad redesign until sessions produce `[CAREGIVER INPUT]`.

---

## 24. Source control

| Item | Status |
| --- | --- |
| Slice committed | **YES** (app `ff95159…`, foundation `9182c75…`) |
| Slice pushed | **YES** |
| Remote SHA verified | **YES** (local == remote after fetch) |
| Secrets excluded | **YES** |
| Working tree clean (implementation) | **YES** at verification |
| **This export document** | May be **uncommitted** until a later docs checkpoint — distinguish from product implementation state |

---

## 25. Unresolved severity snapshot

| Level | Count | Notes |
| --- | --- | --- |
| Unresolved **P0** (product path) | **0** | P0 intercept bug fixed |
| Unresolved **P1** (open product debt) | **~3–5** residual (CR control, structured correction depth, Maya distinct UX, partnerships, human metrics) — not blocking lab PASS of slice |

---

## 26. STOP

Export only. No product behavior changes by this document’s creation intent.

**WAIT FOR EXTERNAL REVIEW.**
