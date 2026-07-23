# CARETAKER RELAY — ACL TRACK 1 EXTERNAL REVIEW BUNDLE

## Source 1 — Product Constitution Gap Audit

Source path: /Users/genghishameha/dev/NIOV Labs/github/caretaker-relay/docs/PRODUCT_CONSTITUTION_GAP_AUDIT.md

# Product Constitution Gap Audit — ACL Track 1 Phase 1

**Governing contract:** Caretaker Relay ACL Track 1 Product Constitution + Judging Contract, Version 1  
**Audit date:** 2026-07-22  
**Scope:** Existing Track 1 product/UX/docs/tests vs constitution — **audit only, no redesign**  
**Repos audited:**  
- App: `caretaker-relay` @ branch `checkpoint/caretaker-relay-track1-2026-07-22`  
- Foundation care substrate: `caretaker-relay-foundation` (care-domain + Care API)  
**Hard rules:** Do not invent caregiver validation. Do not claim live EMR, live remote model, physical mic reliability, or partnerships that do not exist.

---

## 0. Executive verdict

| Dimension | Verdict |
| --- | --- |
| Strategic track | **Track 1** family-caregiver continuity product; not Track 2 workforce |
| Substrate quality | **Strong** — care-domain, auth, Prisma, audit, provenance, med safety, stress + browser lab evidence |
| Product/UI alignment | **Partially aligned** — correct four-tab IA skeleton; Today hierarchy exists; several constitution surfaces incomplete or leak lab/engineering language |
| Judging readiness | **Implementation / safety evidence ahead of user-centered & partnership evidence** |
| Immediate action after review | Product constitution–driven **slice redesign** (not substrate rebuild); then real caregiver research |

**One-line product verdict:** Caretaker Relay already has a credible Track 1 *spine* (Today → natural update → verify → handoff → continuity) on real HTTP/Prisma substrate, but is not yet a complete Phase 1 *judging product* because care-recipient/provider experiences, Needs Attention depth, de-engineering of UI, and real caregiver input are missing.

---

## 1. Track 1 / Track 2 firewall audit

### 1.1 Decision rule applied

| Primary beneficiary | Classification |
| --- | --- |
| Caregiver supporting a specific care recipient | Track 1 — **may ship** |
| Employer / agency / state / staffing / scheduler / recruiter / trainer / supervisor / workforce ops | Track 2 — **must not expose** |

### 1.2 Search results (product-facing)

| Concept | Where found | Classification | Recommendation |
| --- | --- | --- | --- |
| Employee scheduling across clients | Not in app UI | — | Keep out |
| Workforce deployment / staffing dashboards | Not in app UI | — | Keep out |
| Overtime / payroll / retention / recruitment (HR) | Not in app UI | — | Keep out |
| Supervisor workforce console | Not in app UI | — | Keep out |
| Research “recruitment” of study participants | `docs/CAREGIVER_RESEARCH_PROTOCOL.md` | **TRACK 1 SUPPORTIVE** | Keep in research docs only |
| Track 2 firewall language | Checkpoint + constitution docs | **TRACK 1 SUPPORTIVE** | Keep |
| Foundation orgs / multi-tenant / roles / policies | Foundation substrate | **BACKEND-ONLY ACCEPTABLE** | Do not surface as workforce UI |
| Handoff CTA “Start my shift” | `HandoffPanel.tsx` | **TRACK 1 SUPPORTIVE** with mild professional tone risk | **ADAPT** copy toward family handoff (“I’m ready” / “Share with next caregiver”) — not Track 2 leakage, but not family-first language |
| Otzar reuse / capability maps | Foundation `docs/caretaker-relay/A_OTZAR_CAPABILITY_REUSE_MAP.md` | **BACKEND-ONLY / design docs** | Do not import Otzar workforce UX into Track 1 app |

### 1.3 Track 2 leakage summary

**No product-facing Track 2 workforce-management surfaces found in the Track 1 app.**

Risk is **future leakage** if Foundation org/assignment primitives are later exposed as staffing tools. Constitution §4/§60: retain backend seams; do not expose.

---

## 2. Current screen / surface inventory

### 2.1 Routes / navigation

| Surface | Implementation | Classification | Notes |
| --- | --- | --- | --- |
| App shell / header “Caretaker Relay” | `App.tsx` | **KEEP** | Brand OK |
| Evidence badge LIVE/SYNTHETIC | `App.tsx` | **ADAPT** (lab) / **HIDE** for competition screenshots | Internal evidence vocabulary — constitution §12/§49 forbid Foundation/lab chrome in judge path |
| Profile avatar “S” | `App.tsx` | **ADAPT** | Non-functional; needs real caregiver identity later |
| Bottom nav: Today / Care / Circle / Relay | `BottomNav.tsx` | **KEEP** | Matches constitution §11; label “Circle” vs “Care Circle” OK with page title |
| Contextual **Needs Attention** destination | Missing as distinct surface | **MISSING** | Partially covered by Today “Needs you” + handoff “Still needs attention” |
| Today page | `TodayPage.tsx` | **KEEP** + **ADAPT** | Hierarchy matches constitution; data/source line is lab-leaky |
| Care page | `CarePage.tsx` | **KEEP** + **ADAPT** | Progressive sections; meds buried; Documents/History placeholders |
| Care Circle page | `CirclePage.tsx` | **KEEP** + **ADAPT** | Who/helps/access shown; “Manage access (soon)” stub |
| Relay page | `RelayPage.tsx` | **KEEP** + **ADAPT** | Thread + suggested asks; Q&A not fully answered by AI yet |
| Composer (voice/text) | `Composer.tsx` | **KEEP** | Voice-first affordance; browser STT; editable transcript |
| Verify panel | `VerifyPanel.tsx` | **KEEP** | Core HITL; discrepancy UX present |
| Handoff panel | `HandoffPanel.tsx` | **KEEP** + **ADAPT** | Continuity signature; evidenceMode string lab-leaky |
| First-login caregiver | Missing | **MISSING** | Constitution §53 |
| Care recipient experience | Missing as role UX | **MISSING** | Constitution §17 |
| Other caregiver distinct UX | Same shell; API role enforcement partial | **MISSING / HIDE BY ROLE** later | Constitution §18 |
| Provider collaborator UX | Missing | **MISSING** | Constitution §19; keep bounded — not EHR |

### 2.2 Buttons / actions inventory (high signal)

| Control | Location | Classification | Track 1 value | Risk |
| --- | --- | --- | --- | --- |
| Looks right | VerifyPanel | **KEEP** | Human confirm | Good language (§50) |
| Correct something | VerifyPanel | **KEEP** | Override path | Full correction UX incomplete in app (message only) |
| Review handoff | Today / Handoff | **KEEP** | Continuity | — |
| Try care update / Fill demo | Today / Relay | **ADAPT** | Lab demo | Hide/rename for competition demo packaging |
| Mic / Send | Composer | **KEEP** | Natural capture | Physical mic reliability not proven |
| Manage access (soon) | Circle | **ADAPT** | Privacy | Stub; no real access management UI |
| Start my shift | Handoff | **ADAPT** | Continuity close | Professional tone |
| Export my information | Care Documents | **MISSING** (placeholder copy only) | Dignity / portability | Backend export partial elsewhere |

### 2.3 Developer / evidence surfaces (judge path risk)

| Surface | Classification | Recommendation |
| --- | --- | --- |
| Header LIVE/SYNTHETIC badge | **HIDE** in judge demo / **ADAPT** to plain “Connected” or remove | |
| Today “Today data: api · prisma” | **HIDE** | Constitution: no store backend vocabulary |
| Relay message “Evidence: …” / eventIds / handoffId | **ADAPT** | Human outcome language only |
| Handoff “Evidence: …” | **ADAPT** | Remove mode string from primary UI |
| E2E hooks `window.__crE2E` | **KEEP** (test-only) | Not user-facing |

---

## 3. Per-surface Track 1 audit (compressed matrix)

| Surface | User | Caregiver problem | Criterion | Purpose | Track 1 value | User-error risk | Track 2 drift | Recommendation | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Today | Family caregiver | Fragmented mental load | A, D | 5-second scan | High | Stale/static fallback vs durable | None | KEEP; remove lab source line; deepen Needs Attention | P0 product |
| Care | Family caregiver | Finding current instructions | A, D | Living context | Medium | Meds not first-class; static seed | None | ADAPT progressive disclosure + med states | P1 |
| Circle | Family caregiver | Who helps / who sees what | A, E | Access & continuity people | Medium | Access management stub | None | ADAPT real access review | P1 |
| Relay | Family caregiver | Capture + ask without forms | A, D, E | NL AI surface | High | Chatbot feel if Q&A weak | None | ADAPT real question answering + less lab chrome | P0 product |
| Verify | Family caregiver | Wrong care truth | D, E, user-error | HITL gate | Critical | Confirm without full identity/time clarity | None | KEEP; strengthen ACTION/TIME/SOURCE (§30) | P0 product |
| Handoff | Family / other caregiver | Re-explaining the day | A, D | Continuity package | High | “Shift” language | Low | ADAPT language | P1 |
| Composer | Family caregiver | Hands-busy capture | D, E | Voice/text | High | STT error → wrong person/med | None | KEEP; keep editable transcript | P0 keep |
| Needs Attention dedicated | Caregiver | Judgment items only | A, D, E | Conflict queue | High if done right | Alert fatigue | None | MISSING → design later | P0 design |
| Care recipient surfaces | Care recipient | Agency / dignity | E | Control | High for principles | Over-admin console risk | None | MISSING | P0 judging gap |
| Provider surfaces | Provider collab | Bounded share | D, F | Not EHR | Medium | Scope creep to EHR | None | MISSING bounded | P2 |
| Workforce dashboards | — | — | — | — | — | — | Would be leakage | Do not build | Permanent |

---

## 4. Role experience coverage

| Role (constitution §9) | Current product | Backend support | Gap |
| --- | --- | --- | --- |
| **Primary / family caregiver** | Full shell (Sadeil → Olivia) | Care auth principals, access | Strongest; still lab-chrome & incomplete depth |
| **Care recipient** | No dedicated UX | Self-access / consent types exist in domain | **Major gap** for §17, principles privacy/control |
| **Other caregiver / circle** | Circle list as seen by primary; no distinct login UX | Access scopes, revoke, Maya principal in lab | **Partial** — continuity for Maya in domain; no role-tailored UI |
| **Health professional / provider** | Not productized | Handoff/export boundaries docs; no EHR claim | **Missing bounded collaborator UX** |
| Workforce administrator | Not present | Foundation orgs possible | **Correctly absent** — keep absent |

---

## 5. First 30 seconds — judge simulation

Assuming judge opens app on Today (no narration):

| Question | Current answer | Pass? |
| --- | --- | --- |
| Who is this for? | Greeting + “For Olivia” | **Mostly yes** |
| What problem? | Needs you / What changed / Already handled / Next | **Yes if sections populated** |
| What needs attention? | “Needs you” list | **Partial** — not full Needs Attention narrative (what/why/know/don’t know/next) |
| What does AI do? | Not visible until they update | **Weak in first 10s** — composer on Today helps if noticed |
| Why trustworthy? | Not yet — verify/provenance after action | **Weak in first 30s** |
| Caregiver-first feel? | Warm IA intent; LIVE/SYNTHETIC badge hurts | **Mixed** |

**30-second verdict:** Structure is constitution-correct; **trust + AI value is deferred** until a care update. Lab badges and “Today data: …” undermine calm caregiver product. Demo path “Try care update” is essential but looks like a lab affordance.

---

## 6. AI experience verdict

| Behavior (constitution §20) | Evidence | UI feeling |
| --- | --- | --- |
| Natural speech → multi-event extract | Care-domain understand + demo utterance; fixture/live modes | Present after submit |
| Uncertainty preserved | Epistemic badges on verify | Good |
| Corrections | Domain loop correction/supersede; UI prompts then incomplete | Backend stronger than app |
| Conflicts / med discrepancy | VerifyPanel discrepancy block + stress CR-STRESS-030 | Strong lab |
| Handoff preparation | Handoff panel + domain | Good |
| Source explanation | Partial in verify/care observations | Incomplete (“Why am I seeing this?” sparse) |
| Q&A (“What changed?” as question) | Suggested asks listed; full conversational answer path limited | **Chat/list hybrid** — risk of “chatbot with forms” if questions don’t resolve |
| Branding | No “AI POWERED” plaster | Good |
| Lab mode strings in messages | evidenceMode, event counts | **Hurts** “felt intelligence” |

**Verdict:** AI is **real in the care loop**, not decorative. UI still intermittently feels like **verify form + evidence telemetry** rather than quiet continuity intelligence. Do not add AI marketing labels; deepen behavioral transparency.

---

## 7. User-error prevention verdict

| Area | Prevention by design? | Notes |
| --- | --- | --- |
| Care-recipient identity | Partial | Verify shows “For {name}”; no persistent wrong-person hard gate in UI chrome |
| Medications | Strong backend + discrepancy UI | Full state model (scheduled/due/reported/confirmed/not given/uncertain/conflicted/superseded) **not fully expressed in Care UI** (§31) |
| Appointments | Extract + list | Limited conflict UX |
| Communications | Prepared under policy | UI “Tell Maya” not full send status |
| Handoffs | Generated after confirm | Good |
| Corrections | Domain supersession | App “Correct something” does not complete full structured correction flow |
| Access | Server-side auth/access | UI does not manage/revoke; backend deny proven in browser campaign |
| Failure closed | Confirm does not false-success | Proven in browser E2E |

**Verdict:** **Prevention is stronger in substrate than in progressive UI.** Medication discrepancy is the best product expression of §30–§31. Care page still risks collapsing meds into a static dose line (“DONE” risk if oversimplified later — currently not “DONE” but also not full state machine UX).

---

## 8. Cognitive load verdict

| Load source | Assessment |
| --- | --- |
| Primary nav count (4) | **Good** — constitution-aligned |
| Care section tabs (7) | **Acceptable** progressive disclosure; watch density |
| Lab telemetry language | **Unnecessary load** for caregivers/judges |
| Duplicate Today content (static seed vs API) | **Confusion risk** when sources mix |
| Verify + handoff + relay messages | Core loop OK; post-confirm system messages too technical |
| Forms vs natural language | Loop is NL-first — **strength** |
| Missing Needs Attention depth | Caregiver must infer judgment from flat lists |

**Verdict:** IA is intentionally light. **Biggest cognitive tax is engineering language and incomplete judgment framing**, not too many product destinations.

---

## 9. Competition coverage matrix (judging criteria A–F)

| Criterion | Product evidence | Doc evidence | Test evidence | Missing evidence | Missing user input | Product change needed | Phase 1 narrative need |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **A. Responsiveness to need** | Today, handoff, multi-event extract, continuity | Research traceability (hypothesis), deep review | Founder smoke, brutal stress, browser E2E | Measured burden with real caregivers | All real caregiver insights | Sharpen Today/Needs Attention; hide lab chrome | Story: fragmented care picture → shared verified picture |
| **B. User-centered** | Family caregiver hero scenario Olivia/Sadeil | Protocol + traceability tags | None with humans | Interviews, usability sessions | **Critical** | After research: adapt IA | Honest “design with plan to involve”; no fake quotes |
| **C. Implementation** | Real HTTP Care API, Prisma, auth, care-domain | TRL card, architecture docs, checkpoint | Unit/e2e/stress/browser | Production deploy claim not required | — | Maintain; don’t rebuild substrate | Technical feasibility + TRL ≥3 path |
| **D. Usability & integration** | 4-tab mobile IA, verify, discrepancy | Demo script, screenshot plan | Browser 27/27 lab | Real-device fatigue studies; live EMR not claimed | Usability with tired caregivers | Error-prevention UX polish; interop boundaries clear | Before/after coordination story |
| **E. AI principles alignment** | HITL, access, audit, uncertainty, refusal, no auto dose | Bias, affordability, risk register | Access deny, med disc, protocol refuse | Fairness proof; CR agency UX | Care recipient input | Care-recipient control surfaces | Principles matrix with honest tags |
| **F. Partnerships** | None committed | Target list in foundation D_ACL doc | — | Letters, advisors, orgs | Partner conversations | None product | Named targets only; no fabrication |

---

## 10. Top 10 competition-killing gaps (by judging impact)

1. **No real caregiver input / validation** — criterion B critical; any claim of “user-centered proven” is false.  
2. **Care-recipient control experience absent** — principles (privacy, dignity, choice, control) under-shown.  
3. **Needs Attention not a true judgment surface** — missing what/why/know/don’t know/next (§16).  
4. **Lab/engineering chrome in primary UI** — undermines calm caregiver product and 30-second trust.  
5. **Correction UX incomplete in app** — empowerment path weaker than domain capability.  
6. **Medication state machine incomplete in Care UI** — risk judges underrate error prevention vs warnings.  
7. **Relay Q&A under-delivered** — suggested questions may not execute as intelligent answers.  
8. **No committed partnerships** — criterion F soft/zero without outreach plan evidence.  
9. **Burden reduction only lab-hypothesized** — metrics exist as LAB only; no CAREGIVER-VALIDATED metrics.  
10. **Provider collaborator story thin** — interoperability readiness may look like architecture-only slides.

---

## 11. Top 10 differentiators (evidence-backed only)

1. **Governed care loop** understand → verify → confirm → continuity — lab e2e + browser.  
2. **Human verification as product intelligence** — VerifyPanel “Looks right / Correct something”.  
3. **Medication discrepancy without dose recommendation** — CR-STRESS-030 closed; UI conflict display.  
4. **Provenance / source-aware design** — SourceRef, authorized source labels, audit rows.  
5. **Corrections with supersession lineage** — domain loop + stress/browser correction cases.  
6. **Permission-aware care context** — access deny server-side; not CSS-as-security.  
7. **Natural multi-fact capture from one utterance** — fixture/canonical demo path.  
8. **Handoff as continuity artifact** — generated after confirm; panel surfaces change/attention/watch.  
9. **Foundation-backed durable state** — Prisma isolation + reload continuity proven in lab.  
10. **Honest evidence discipline** — research tags, TRL card non-claims, live model BLOCKED_CREDENTIALS labeled.

---

## 12. Caregiver research gap

| Item | Status |
| --- | --- |
| Real interviews conducted | **None** |
| `[CAREGIVER INPUT]` / `[VALIDATED]` rows | **None** |
| Protocol prepared | **Yes** — `CAREGIVER_RESEARCH_PROTOCOL.md` |
| Traceability scaffolding | **Yes** — `CAREGIVER_RESEARCH_TRACEABILITY.md` |
| Minimum research before claiming user-centered validation | See below |

### Minimum immediate research (recommend only — do not fabricate)

| Participant type | N (suggest) | Learning objectives |
| --- | --- | --- |
| Family caregivers (primary) | 5–8 | Today 5-second comprehension; burden language; trust of verify; med conflict reaction |
| Secondary family / friend caregivers | 2–3 | Handoff usefulness; access anxiety |
| Professional home caregivers (not workforce managers) | 2–3 | Whether product stays useful without becoming staffing tool |
| Care recipients (if capable/consented) | 2–4 | Control, dignity, who-can-see-what clarity |

**Session types (from existing protocol):** kitchen comprehension; care update dictation; access walkthrough; correction flow.  
**Output required:** insight → design implication → decision → product change → retest — with honest tags.

---

## 13. Partnership gap

| Who | Why | What they contribute | Importance |
| --- | --- | --- | --- |
| Family caregiver advocacy orgs | Criterion F + recruitment for research | Participants, problem framing | **High** |
| Aging / AAA / community orgs | Home/community credibility | Context, outreach | **High** |
| Disability / I/DD orgs | Meritorious fit if natural | Need language, accessibility | **Medium** (don’t force) |
| Dementia / Alzheimer’s caregiver groups | Natural scenario adjacency (Olivia aging-at-home) | Validation of continuity needs | **Medium–High** natural |
| Health system / provider advisors | Interop boundary realism | Clinical collaboration constraints | **Medium** |
| Academic usability partner | Method rigor | Protocol, metrics | **Medium** |
| Assistive tech orgs | Interop meritorious | Device boundary | **Low–Medium** now |
| Committed letters of support | Phase 1 application weight | Named collaboration intent | **High for F** — currently **none** |

**Status:** Targets documented; **no committed partners claimed**.

---

## 14. Meritorious prize fit (do not distort product)

| Area | Rating | Rationale |
| --- | --- | --- |
| I/DD caregivers | **POSSIBLE** | Access/privacy/circle model transferable; no I/DD-specific product yet |
| Alzheimer’s / dementia caregivers | **STRONG NATURAL FIT** | Continuity, handoff, observation uncertainty, multi-caregiver, changing day picture |
| Health-system / EMR interoperability | **POSSIBLE** | FHIR-mapped boundary docs; **not** live EMR integrated |
| Assistive-technology interoperability | **WEAK / DISTRACTING** if chased now | No product surface; architecture future seam only |
| Multi-organization collaboration | **POSSIBLE** | Care circle + auth multi-party; Foundation multi-tenant backend | Keep as continuity, not workforce |

---

## 15. Exact UI/product areas likely to need change (after review)

1. Strip/hide lab evidence chrome (badge, store backend, evidenceMode in copy).  
2. Elevate **Needs Attention** judgment narrative (even if still driven by Today initially).  
3. Full **medication state** progressive UI on Care (not only discrepancy in verify).  
4. Complete **correction** path in app to match domain.  
5. **Care recipient** simple experience (my care / who sees / correct / revoke / export).  
6. Handoff language family-first (“Start my shift” → continuity language).  
7. Relay answers for constitution example questions (not only extract-on-statement).  
8. Access management beyond “soon”.  
9. Demo packaging for first 30s / 2 min judge story without developer narration.  
10. Optional distinct **other caregiver** authorized slice (not workforce).

---

## 16. What must NOT change

- Track 1 vs Track 2 firewall  
- Care-domain safety, med non-recommendation, refusal paths  
- Server-authoritative auth/access (no CSS security)  
- Human-in-the-loop verify before consequential truth  
- Audit / provenance / correction supersession model  
- Isolated Prisma care persistence pattern  
- Honest evidence classification and non-claims  
- Four primary destinations (Today / Care / Circle / Relay) as IA skeleton  
- Family caregiver as hero user  
- One care context around a person  
- Foundation substrate capabilities retained for future products without UI leakage  
- Original `niov-foundation` and Otzar untouched by Track 1 product drift  

---

## 17. Recommended next product slice (after this audit is reviewed)

**Slice name (proposed):** “Judge-path Today + de-lab + Needs Attention framing”  

**Goals:**  
1. Make first 30 seconds caregiver-pure (no engineering chrome).  
2. Make one natural update → multi-event verify → handoff feel inevitable.  
3. Frame Needs Attention items with constitution five-part explanation.  
4. Do **not** build Track 2; do **not** rebuild substrate; do **not** fake caregiver quotes.

**Explicit non-goals of next slice:** workforce features, EHR replacement, care-recipient full legal console, partnership fabrication, live model claims without keys.

---

## 18. Permanent product principle (constitution §80)

> Caretaker Relay should feel like a trusted care continuity layer that quietly carries the day forward.  
> The caregiver should manage **care**, not **software**.

**Current distance:** Substrate supports quiet continuity; UI still occasionally forces the caregiver (and judge) to manage **evidence modes and lab affordances**.

---

## 19. STOP

This audit does **not** authorize redesign implementation.  
**WAIT FOR REVIEW BEFORE REDESIGN.**

---

## Source 2 — ACL Track 1 Traceability

Source path: /Users/genghishameha/dev/NIOV Labs/github/caretaker-relay/docs/ACL_TRACK1_TRACEABILITY.md

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
