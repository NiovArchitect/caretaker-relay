# ACL Track 1 Traceability Matrix

**Product:** Caretaker Relay  
**Challenge:** Administration for Community Living — Caregiver AI Challenge  
**Track:** **1 — AI Tools to Support Caregivers** (not Track 2)  
**Phase:** **1 — Design**  
**Governing contract:** Track 1 Product Constitution v1  
**Companion audit:** `docs/PRODUCT_CONSTITUTION_GAP_AUDIT.md`  
**Last updated:** 2026-07-22  

## Evidence classification (mandatory)

| Tag | Meaning |
| --- | --- |
| `[CHALLENGE REQUIREMENT]` | From ACL challenge materials / constitution |
| `[FOUNDER HYPOTHESIS]` | Internal assumption — not caregiver-validated |
| `[LITERATURE]` | External published evidence (cite when used) |
| `[LAB RESULT]` | Controlled lab / synthetic scenario measurement |
| `[CAREGIVER INPUT]` | Real caregiver contribution |
| `[CARE RECIPIENT INPUT]` | Real care recipient contribution |
| `[VALIDATED]` | Confirmed with appropriate real participants |

**Hard rule:** Do not convert `[FOUNDER HYPOTHESIS]` or `[LAB RESULT]` into `[VALIDATED]` without real participants.

---

## 0. Strategic positioning

| Item | Statement | Tag |
| --- | --- | --- |
| Track | Track 1 Phase 1 Design | `[CHALLENGE REQUIREMENT]` |
| Advancement path | Track 1 Phase 2 (not Track 2) | `[CHALLENGE REQUIREMENT]` |
| Hero user | Family caregiver | `[CHALLENGE REQUIREMENT]` `[FOUNDER HYPOTHESIS]` (persona Sadeil) |
| Primary problem | Fragmented, changing care picture carried in heads/texts/calls | `[CHALLENGE REQUIREMENT]` `[FOUNDER HYPOTHESIS]` |
| Value proposition | Shared, verified, current, permission-aware, source-traceable care picture | `[FOUNDER HYPOTHESIS]` + lab implementation |
| Track 2 exclusion | No workforce scheduling/ops UI | `[CHALLENGE REQUIREMENT]` — enforced in app inventory |

---

## 1. Judging criteria spine (A–F)

### A. Responsiveness to need

| Feature | Caregiver problem | Insight source | AI role | Human control | Error prevention | Test | Metric | Evidence | Limitation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Today hero | Mental load / what needs me | `[FOUNDER HYPOTHESIS]` | Organize day picture | Caregiver acts on lists | Clear hierarchy | Browser Today loads; founder smoke | Time-to-comprehension (lab target ≤5s) | UI `TodayPage`; demo script | Not caregiver-timed |
| Multi-event extract | Repeated documentation | `[FOUNDER HYPOTHESIS]` | Parse one utterance → many candidates | Verify before truth | No silent fact promotion | Care loop e2e; browser | Steps to capture (lab) | Canonical demo utterance | Fixture often used |
| Handoff | Re-explain day | `[FOUNDER HYPOTHESIS]` | Package change/attention/watch | Review handoff | Source list | Handoff tests; browser | Handoff prep time (lab) | `HandoffPanel` + domain | Language “shift” slight pro tone |
| Needs Attention depth | Missed conflicts | `[FOUNDER HYPOTHESIS]` | Surface judgment items | Caregiver decides | Explain know/don’t know | Partial via discrepancy/handoff | Open judgment items | **Incomplete vs constitution §16** | Product gap |
| Continuity after reload | Stale mental model | `[LAB RESULT]` | Durable projection | — | Server truth | Browser reload continuity | State retention | Prisma path | Lab DB |

### B. User-centered

| Feature | Caregiver problem | Insight source | AI role | Human control | Error prevention | Test | Metric | Evidence | Limitation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Family-caregiver IA | Too much software | `[FOUNDER HYPOTHESIS]` | — | Four destinations | Small nav | Visual IA | Nav destinations ≤4 | BottomNav | Not usability-tested with families |
| Research protocol | Involvement required | `[CHALLENGE REQUIREMENT]` | — | Founders run sessions | Tag honesty | Process only | Sessions completed = 0 | `CAREGIVER_RESEARCH_PROTOCOL.md` | **No sessions yet** |
| Traceability log | False validation risk | `[CHALLENGE REQUIREMENT]` | — | Process | Tags | Doc review | Tag compliance | `CAREGIVER_RESEARCH_TRACEABILITY.md` | Empty of real input |

### C. Implementation

| Feature | Caregiver problem | Insight source | AI role | Human control | Error prevention | Test | Metric | Evidence | Limitation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Care API + Prisma | Durable home/community use | `[LAB RESULT]` | Runtime understand/confirm | Auth principals | Fail closed | Stress + browser | Uptime lab; finite lifecycle | Foundation care-app | Not production multi-tenant household ops |
| Auth + access | Wrong-person / privacy | `[CHALLENGE REQUIREMENT]` `[LAB RESULT]` | — | Server deny | No CSS security | Unauthorized browser cases | Unauthorized disclosure rate = 0 lab | care-auth + routes | Recipient UX missing |
| Care-domain package | Shared truth substrate | `[LAB RESULT]` | Loop services | Confirm/correct | Safety classes | Unit + stress | Pass rates | `@caretaker-relay/care-domain` | Live remote model blocked |
| Commodity device path | Affordability | `[CHALLENGE REQUIREMENT]` | Browser STT optional | Type fallback | No specialized HW required | Architecture docs | Device requirements | AFFORDABILITY_ACCESS | Pricing not set |

### D. Usability and integration

| Feature | Caregiver problem | Insight source | AI role | Human control | Error prevention | Test | Metric | Evidence | Limitation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Verify panel | Trust / wrong capture | `[CHALLENGE REQUIREMENT]` | Show understood items | Looks right / Correct | HITL | Browser verify | Confirm before persist | VerifyPanel | Technical message after confirm |
| Med discrepancy UI | Med documentation fear | `[FOUNDER HYPOTHESIS]` `[CHALLENGE REQUIREMENT]` | Detect unit/dose conflict | Human review | Never choose dose | CR-STRESS-030; dose-units | Med-state accuracy lab | Verify discrepancy + dose-units | Care UI state machine incomplete |
| Voice/text same pipeline | Hands busy | `[CHALLENGE REQUIREMENT]` | STT → same understand | Edit transcript | Consequential review flags | Browser voice inject | STT reliability unproven physical | Composer | PHYSICAL_MIC = manual not automatable |
| FHIR / interop boundary | System fragmentation | `[CHALLENGE REQUIREMENT]` | Mapping readiness | — | No false live EMR claim | Map docs/tests if present | Interop claims honesty | FHIR mapping module | **Not live EMR** |
| Home integration pattern | Fit routines | `[FOUNDER HYPOTHESIS]` | Speak → organize → verify | Confirm matters only | Low form burden | Demo script | Task completion lab | App loop | Field fit unproven |

### E. Alignment with Caregiver Challenge AI principles

| Feature | Caregiver problem | Insight source | AI role | Human control | Error prevention | Test | Metric | Evidence | Limitation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Uncertainty / epistemic status | Over-trust AI | `[CHALLENGE REQUIREMENT]` | Label REPORTED etc. | Confirm | No silent fact | Loop tests | Ambiguity detection lab | Epistemic badges | Incomplete plain-language “why” |
| Audit + provenance | Accountability | `[CHALLENGE REQUIREMENT]` `[LAB RESULT]` | Attach sources | Inspect | Lineage | Prisma audit rows | Audit completeness lab | prisma-care-store | Not full recipient-facing audit UX |
| Correction / supersession | Fix without erase history | `[CHALLENGE REQUIREMENT]` `[LAB RESULT]` | Supersede events | Correct path | Preserve prior | Correction tests | Correction propagation | loop.correct | App UI incomplete |
| Access / revoke | Dignity / privacy | `[CHALLENGE REQUIREMENT]` `[LAB RESULT]` | Enforce scopes | Review access (stub UI) | Server deny | Browser unauthorized | Unauthorized disclosure | access + auth | Manage access UI stub |
| Protocol refusal | Hallucinated instructions | `[CHALLENGE REQUIREMENT]` `[LAB RESULT]` | Refuse unknown protocol | Caregiver informed | Refuse unsafe | Adversarial / stress | Hallucination refuse rate lab | safety.ts | — |
| Bias / fairness | Unequal performance | `[CHALLENGE REQUIREMENT]` | — | Process | Doc honesty | Bias doc only | Fairness **not proven** | BIAS_AND_REPRESENTATION | Synthetic only |
| Affordability | Access barriers | `[CHALLENGE REQUIREMENT]` | — | Phone/browser | No special hardware | Architecture | Cost model TBD | AFFORDABILITY_ACCESS | No pricing claim |
| Human connection | Isolation / over-automation | `[CHALLENGE REQUIREMENT]` | Free time via continuity | Care circle people | Not companion bot | Doctrine | Perceived connection | Product doctrine | Not measured |

### F. Partnerships and collaboration

| Feature | Caregiver problem | Insight source | AI role | Human control | Error prevention | Test | Metric | Evidence | Limitation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Partner targets list | Ecosystem credibility | `[FOUNDER HYPOTHESIS]` | — | Outreach | No fabrication | — | Committed partners = 0 | Foundation D_ACL + this matrix | **No commitments** |
| Multi-person care circle | Coordination | `[FOUNDER HYPOTHESIS]` | Prepare updates | Access limits | Scope by category | Circle UI + access tests | Handoff completeness lab | CirclePage + domain | Not multi-org product |

---

## 2. Constitution capabilities checklist

| Capability | Status | Trace |
| --- | --- | --- |
| Track 1 firewall | **PASS** (no workforce UI) | Audit §1 |
| Family caregiver hero | **PASS** (Sadeil/Olivia) | Scenario + UI |
| Care recipient experience | **GAP** | Constitution §17 |
| Other caregiver slice | **PARTIAL** | Domain > UI |
| Provider collaborator | **GAP** (bounded) | Constitution §19 |
| Today 5-second hierarchy | **PASS structure** | TodayPage |
| Care progressive disclosure | **PARTIAL** | CarePage |
| Care Circle who/access | **PARTIAL** | CirclePage |
| Relay NL surface | **PARTIAL** | Relay + Composer |
| Needs Attention full framing | **GAP** | §16 |
| HITL verify | **PASS lab** | VerifyPanel |
| Med non-recommendation | **PASS lab** | dose-units + UI |
| Evidence honesty | **PASS process** | Tags + TRL + live model blocked |
| Real caregiver validation | **GAP** | Research protocol only |

---

## 3. Feature → problem → evidence (major capabilities)

| FEATURE | CAREGIVER PROBLEM | USER INSIGHT SOURCE | TRACK 1 CRITERION | AI ROLE | HUMAN CONTROL | ERROR PREVENTION | TEST | METRIC | EVIDENCE | CURRENT LIMITATION |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Today | Fragmented day picture | `[FOUNDER HYPOTHESIS]` | A, D | Project needs/changed/handled/next | Act on items | Hierarchy clarity | Browser | Comprehension time | TodayPage + projection API | Lab chrome; static fallback |
| Care context | Finding current truth | `[FOUNDER HYPOTHESIS]` | A, D | — | Browse sections | Progressive disclosure | Manual | Find-instruction time | CarePage | Placeholders; meds not first-class |
| Care Circle | Who helps / sees what | `[FOUNDER HYPOTHESIS]` | A, E | — | Review members | Explicit access labels | Partial | Role clarity | CirclePage | Manage access stub |
| Relay capture | Coordination tax | `[FOUNDER HYPOTHESIS]` | A, D, E | Understand utterance | Edit + confirm | Verify gate | Stress/browser | Steps ≤3 lab claim | App + care-domain | Q&A incomplete |
| Verify | Wrong care facts | `[CHALLENGE REQUIREMENT]` | D, E | Present candidates | Looks right / Correct | Safety class + disc. | E2E | Confirm before persist | VerifyPanel | §30 fields incomplete |
| Med unit safety | 1000× dose language risk | `[LAB RESULT]` product fix | D, E | Detect discrepancy | Human review | Strong expectDisc | CR-STRESS-030 closed | Med accuracy | dose-units + evidence JSON | Live speech accents unproven |
| Handoff | Incomplete shift change | `[FOUNDER HYPOTHESIS]` | A, D | Generate package | Review | Sources listed | Browser/stress | Prep time | HandoffPanel | Copy tone |
| Auth/access | Unauthorized disclosure | `[CHALLENGE REQUIREMENT]` | E | — | Server authority | Deny by default | Browser unauthorized | Disclosure rate lab | care-auth | Recipient UX gap |
| Corrections | Fix without rewrite history | `[CHALLENGE REQUIREMENT]` | E | Supersede | Correct path | Lineage | Domain tests | Propagation | loop.ts | App incomplete |
| Export / portability | Data trap | `[CHALLENGE REQUIREMENT]` | E | — | Export | — | Partial API/docs | Portability | Placeholder Documents | Full export UX gap |
| Lifecycle finite services | Hung validation / ops pain | `[LAB RESULT]` eng | C | — | — | Clean stop | lifecycle tests | Finite exit | dev-service-lifecycle | Eng quality not judge-facing |

---

## 4. Metrics plan (candidate)

| Metric | Class now | Target class later |
| --- | --- | --- |
| Time to capture care update | `[LAB RESULT]` candidate | `[CAREGIVER INPUT]` / `[VALIDATED]` |
| Steps/taps to confirm | Lab observed path ~3 | Validated with users |
| Handoff preparation time | Lab | Validated |
| Time to find current instruction | Not measured | Usability sessions |
| Medication-state accuracy | Lab (stress matrix) | Field |
| Negation accuracy | Lab | Field |
| Unauthorized disclosure | Lab deny | Security review + field |
| Caregiver perceived burden | **Not measured** | Required for burden claims |
| Trust / over-reliance | **Not measured** | Required |
| Task completion success | Lab browser pass rates | Caregiver tasks |

Separate **LAB METRIC** from **CAREGIVER-VALIDATED METRIC** in all application text.

---

## 5. Phase 2 / Phase 3 plan (describe only — do not build now)

| Phase | Focus | Constitution |
| --- | --- | --- |
| Phase 2 | Implementation, caregiver testing, performance, usability, model/safety eval, real workflow adaptation | §27 |
| Phase 3 | Additional environments, scale, sustainability, broader implementation, long-term operating model | §27 |

---

## 6. Track 2 leakage log

| Item | Classification | Action |
| --- | --- | --- |
| App UI workforce features | None found | Maintain firewall |
| Foundation org/multi-tenant | BACKEND-ONLY ACCEPTABLE | Do not expose as Track 1 UI |
| Handoff “Start my shift” | TRACK 1 SUPPORTIVE (language risk) | Adapt copy in future product slice |
| Research participant recruitment | TRACK 1 SUPPORTIVE | Keep out of product UI |

---

## 7. Living maintenance rule

Before adding any page/card/button/workflow/role/feature, pass constitution §59 Product Slippage Gate. If secretly Track 2 → **DO NOT BUILD**.

Update this matrix whenever a major capability ships or a real caregiver insight is recorded.

---

## 8. Related artifacts

| Artifact | Path |
| --- | --- |
| Constitution gap audit | `docs/PRODUCT_CONSTITUTION_GAP_AUDIT.md` |
| Caregiver research protocol | `docs/CAREGIVER_RESEARCH_PROTOCOL.md` |
| Caregiver research traceability | `docs/CAREGIVER_RESEARCH_TRACEABILITY.md` |
| TRL card | `docs/CARETAKER_RELAY_TRL_CARD.md` |
| Risk register | `docs/CARETAKER_RELAY_RISK_REGISTER.md` |
| Demo script | `docs/PHASE1_DEMO_SCRIPT.md` |
| Foundation criteria draft | `caretaker-relay-foundation/docs/caretaker-relay/D_ACL_TRACK1_TRACEABILITY.md` |
