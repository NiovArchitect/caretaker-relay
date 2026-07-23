# Caretaker Relay — Master Continuity Checkpoint

**Purpose:** Recover full operational state with **zero chat history**.  
**Audience:** A new Grok (or human) session.  
**Written from:** Git truth + committed docs (verified 2026-07-22).  
**This is not a product redesign.**  

---

## NEW GROK SESSION — START HERE

1. `cd "/Users/genghishameha/dev/NIOV Labs/github"`  
2. Verify repos exist: `caretaker-relay`, `caretaker-relay-foundation`, `niov-foundation`.  
3. Read **this file** completely.  
4. Read `docs/CARETAKER_RELAY_CURRENT_STATE.json`.  
5. Read `docs/CARETAKER_RELAY_CONTINUITY_INDEX.md` and open the gate-specific docs it lists.  
6. Run Git: branches, HEADs, remotes, `git status`, confirm product freeze SHAs.  
7. Reconcile docs vs Git; **Git wins** on commits.  
8. Report: recovered state, current gate, unresolved decisions, next authorized action.  
9. **Do not** execute the next action until the founder instructs.  

---

## 1. What we are building

| Field | Value |
| --- | --- |
| **Product** | Caretaker Relay |
| **Competition** | Administration for Community Living — **Caregiver AI Challenge** |
| **Track** | **TRACK 1** — AI Tools to Support Caregivers |
| **Phase** | **TRACK 1 Phase 1 — Design** |
| **Hero user** | Family / home / community **caregiver** supporting a **specific care recipient** |
| **Core promise** | **Care without re-explaining** |
| **Core loop** | Natural caregiver communication → AI understands **multiple** care events → consequential uncertainty preserved → human verifies/corrects → durable care truth → continuity/handoff for the next person |

### Track 2 firewall (hard)

**NOT** current product scope:

workforce management · employee scheduling · agency ops · recruitment · retention · payroll · overtime · supervisor dashboards · workforce deployment · enterprise HR.

Foundation may keep backend primitives (orgs, roles, multi-tenant) for **later**. They must **not** leak into Track 1 UI.

---

## 2. Product character and constitution IA

**Navigation (do not casually expand):**

| Surface | Purpose |
| --- | --- |
| **Today** | Current care picture + judgment/action (Needs Attention, What Changed, Already Handled, Next) |
| **Care** | Living care context for the person |
| **Circle** | People / access / coordination context |
| **Relay** | Natural language intelligence surface (voice + text) |

**Principle:** Caregiver manages **care**; Relay reduces **coordination burden**.

**Feel:** calm, human, warm, competent, quietly intelligent, trustworthy, clear, lightweight.  

**Not:** developer console, generic chatbot, hospital enterprise EHR, AI toy, workforce management, clinical decision engine, form-heavy case management.

Authoritative audits: `docs/PRODUCT_CONSTITUTION_GAP_AUDIT.md`, `docs/ACL_TRACK1_TRACEABILITY.md`.

---

## 3. ACL Track 1 judging framework

Major areas we build/trace against (see `ACL_TRACK1_TRACEABILITY.md` for full matrices):

Responsiveness to Need · Understanding of Need · Impact · Caregiver Input · Co-Implementation · Deployment Readiness · Timeline · Metrics · Evaluation/Adaptation · User Error Reduction · Transparency · Empowerment · Usability · Home Integration · Interoperability · Privacy/Dignity/Choice · HITL · Caregiver well-being/burden · Supplement human connection · Personalization · Safety/reliability/transparency · Affordability/access · Partnerships.

**Do not invent caregiver validation to fill these.** Lab evidence ≠ validated.

---

## 4. Repository architecture

| Role | Path |
| --- | --- |
| Workspace | `/Users/genghishameha/dev/NIOV Labs/github` |
| **App** | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay` |
| **Foundation clone (Caretaker care runtime)** | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation` |
| **Original Foundation** | `/Users/genghishameha/dev/NIOV Labs/github/niov-foundation` |
| Otzar / other NIOV products | e.g. `otzar-control-tower`, `otzar-relay` — **do not modify for Track 1** |

### Why caretaker-relay-foundation exists

Isolated working copy of Foundation substrate for care-domain, Care API, Prisma care store, stress harness — **without** pushing Caretaker product work onto original `niov-foundation` by default.  
Remote: `origin` → GitHub `NiovArchitect/caretaker-relay-foundation`; also `foundation-upstream` → local `niov-foundation`.

**DO NOT modify original `niov-foundation` unless founder explicitly authorizes.**

---

## 5. Important Git commits (verify with Git)

### Product freeze (participants evaluate this)

| Component | Branch | SHA |
| --- | --- | --- |
| App product (Judge Loop) | `checkpoint/caretaker-relay-track1-2026-07-22` | **`ff95159d8803feaca0e6e245d5a77ee28ee40c99`** |
| Foundation product | same branch | **`9182c7511c1ffae9dc79082297ae92d7a5079b1a`** |

### Documentation commits above product freeze (app only)

| Role | SHA | Subject (approx.) |
| --- | --- | --- |
| Research package | `ccfdbeba91a11ffbbd3074ee35d74d4c0d314f10` | freeze research build + first research package |
| Session 1 activation pack | `f4a6c39c15815b5329c9e4f84f0b5e3043bc5e81` | consent/storage/recruitment templates |
| **Current app HEAD** (at continuity write) | *will be tip after this continuity commit* | docs continuity checkpoint |

`git diff ff95159..HEAD -- src` must be **empty** while product frozen (confirmed empty at continuity write).

### Remotes (app)

- `origin` → `https://github.com/NiovArchitect/caretaker-relay.git`  
- Branch tracking `origin/checkpoint/caretaker-relay-track1-2026-07-22`

### Remotes (foundation)

- `origin` → `https://github.com/NiovArchitect/caretaker-relay-foundation.git`  
- HEAD matches product freeze SHA when last verified.

---

## 6. What has been built (substrate + product expression)

### Foundation-backed substrate (lab-proven)

Care API · Prisma durability · server-authoritative auth/access · privacy isolation · audit · provenance · correction supersession · epistemic uncertainty · medication discrepancy / unit handling · **no autonomous dose selection/recommendation** · human verification · handoff · reload continuity · natural-language understand (fixture mode default in research stack) · semantic/idempotency where tested · FHIR/interop seams (mapped ≠ live EMR).

### Judge Loop slice (lab PASS)

**Name:** Track 1 Judge Loop — Care Without Re-Explaining  

Caregiver-readable Today → one natural update → multi-event understand → med ambiguity held → verify/correct → durable Today + handoff → reload preserves → unauthorized denied · de-lab chrome removed from judge path.

**Evidence:** Playwright e2e **18/18**; app vitest **9/9**; foundation care unit suites including judge-loop extract; screenshots under `evidence/phase1/screenshots/real-browser-v1/`.  
Authoritative narrative: `docs/TRACK1_JUDGE_LOOP_EXTERNAL_REVIEW.md`, `docs/JUDGE_LOOP_SLICE_2026-07-22.md`.

### Canonical synthetic scenario

- Care recipient: **Olivia** (synthetic)  
- Primary caregiver lab persona: **Sadeil**  
- Continuity person: **Maya**  

Engineering utterance exists (`JUDGE_LOOP_UTTERANCE`) for fixture/E2E — **research participants get scenario facts and speak naturally**; product must not be hard-coded to that string alone.

---

## 7. Important bug history (do not reintroduce)

| Issue | Severity | Cause | Fix | Evidence |
| --- | --- | --- | --- | --- |
| Relay Q&A matched “Maya” in care updates, skipped `/understand` | **P0** | Over-broad question matcher | Interrogative-only gate in `answerCareQuestion` | Playwright core re-pass 18/18 |
| App unit tests hung on live HTTP | P1 | Auto transport to API in vitest | Force package when `MODE=test` | vitest 9/9 |
| Engineering chrome in judge UI | P1 (product expression) | Lab badges / prisma line / IDs in chat | De-lab Judge Loop UI | Screenshots + review export |
| Correction was dead-end | P1 | UI only messaged | Correction mode + domain/HTTP correction | Judge Loop review |

---

## 8. Evidence classification (CRITICAL)

| Class | Current status |
| --- | --- |
| `[FOUNDER HYPOTHESIS]` | Many IA/need claims until humans react |
| `[LAB RESULT]` | Stress, browser, unit, Judge Loop |
| **`[CAREGIVER INPUT]`** | **NONE** |
| **`[CARE RECIPIENT INPUT]`** | **NONE** |
| **`[VALIDATED]`** | **NONE** |
| Caregiver-validated burden metrics | **NONE** |
| Partnerships committed | **NONE** |
| Outreach sent | **NO** |

**Never convert LAB RESULT → VALIDATED without real humans.**

---

## 9. Current strategic phase

**Engineering of the research build is frozen.**  
Product is strong enough for formative caregiver research.  

Highest value next: **human evidence**, not another substrate campaign.

```text
RESEARCH FINDING → DESIGN DECISION → CHANGE → RETEST
```

Do not silent-polish product during research without a finding ID.

---

## 10. Research package (paths)

All under `caretaker-relay/docs/` unless noted.

### Cycle core

| Doc | Path |
| --- | --- |
| Cycle overview | `research/FIRST_CAREGIVER_RESEARCH_CYCLE.md` |
| Build freeze manifest | `research/RESEARCH_BUILD_MANIFEST.md` |
| Moderator guide | `research/MODERATOR_GUIDE.md` |
| Session tasks T1–T8 | `research/SESSION_TASKS.md` |
| Observation sheet | `research/OBSERVATION_SHEET.md` |
| Post-session Qs | `research/POST_SESSION_QUESTIONS.md` |
| Findings register (empty) | `research/FINDINGS_REGISTER.md` |
| Design decision log (empty) | `research/DESIGN_DECISION_LOG.md` |
| Metrics template | `research/METRICS_TEMPLATE.md` |
| Protocol index | `CAREGIVER_RESEARCH_PROTOCOL.md` |
| Traceability (no fake input) | `CAREGIVER_RESEARCH_TRACEABILITY.md` |

### Session 1 activation

| Doc | Path |
| --- | --- |
| Consent draft | `research/PARTICIPANT_INFORMATION_AND_CONSENT_TEMPLATE.md` |
| Data handling | `research/RESEARCH_DATA_HANDLING_PROTOCOL.md` |
| Screener | `research/FAMILY_CAREGIVER_RECRUITMENT_SCREENER.md` |
| Invitation | `research/FAMILY_CAREGIVER_RESEARCH_INVITATION.md` |
| Tracking (codes only) | `research/PARTICIPANT_TRACKING_TEMPLATE.md` |
| Moderator card | `research/SESSION_1_MODERATOR_CARD.md` |
| Data packet structure | `research/SESSION_1_DATA_PACKET.md` |
| Readiness gate | `research/SESSION_1_READINESS_GATE.md` |
| Activation external review | `research/SESSION_1_ACTIVATION_EXTERNAL_REVIEW.md` |

### Other

| Doc | Path |
| --- | --- |
| Partnership prep (not sent) | `PARTNERSHIP_OUTREACH_PLAN.md` |
| Dementia fit hypothesis | `DEMENTIA_CAREGIVER_FIT_HYPOTHESIS.md` (`[FOUNDER HYPOTHESIS]`) |
| Research external review | `research/FIRST_CAREGIVER_RESEARCH_EXTERNAL_REVIEW.md` |
| Judge Loop external review | `TRACK1_JUDGE_LOOP_EXTERNAL_REVIEW.md` |
| Constitution audit | `PRODUCT_CONSTITUTION_GAP_AUDIT.md` |
| ACL traceability | `ACL_TRACK1_TRACEABILITY.md` |
| Constitution bundle | `ACL_TRACK1_EXTERNAL_REVIEW_BUNDLE.md` |
| Memory | `MEMORY.md` |

### Research tasks summary

T1 first 5s Today · T2 natural update · T3 interpretation · T4 med safety · T5 correction · T6 Maya handoff · T7 privacy · T8 burden baseline · debrief.

### Research principles

Test product not participant · do not sell · do not explain failures away · record misunderstanding first · synthetic only · no real PHI in prototype · no medical advice · product failure is evidence · observed ≠ statement ≠ interpretation.

### Participants (plan vs actual)

| | Recommended | Recruited | Scheduled | Completed |
| --- | --- | --- | --- | --- |
| Family caregivers | 5–8 | **0** | **0** | **0** |
| Secondary | 2–3 | 0 | 0 | 0 |
| Professional home (not workforce mgr) | 2–3 | 0 | 0 | 0 |
| Care recipients | 2–4 | 0 | 0 | 0 |

---

## 11. Session 1 gate (current)

**Research infrastructure:** **READY** (founder operational decisions recorded 2026-07-22).  
**Recruitment / Session 1 run:** **NOT STARTED** (0 recruited, 0 scheduled, 0 completed).

**Resolved founder decisions** — see `docs/research/FOUNDER_DECISIONS_SESSION_1.md`:

- Recording OFF (A/V/screen)  
- PHI in prototype prohibited  
- Identifying data out of Git  
- Private path: `/Users/genghishameha/CaretakerRelayResearch`  
- Formative retention / data minimization  
- Consent: info sheet + private acknowledgment before product use  
- Quotes only with permission  

**Still human-only:** recruit/screen/schedule Caregiver #1; confirm institutional/IRB policy if applicable; founder authorize outreach.

**Execution checklist:** `docs/research/SESSION_1_EXECUTION_GATE.md`  
**Next authorized action (when founder allows):** RECRUIT / SCREEN first real family caregiver — **do not automate contact**.

---

## 12. Known limitations (do not erase)

- Understand **fixture-backed** by default in research stack (still multi-event + real verify/confirm/Prisma path when stack up)  
- Physical mic **not** validated as real-device evidence  
- Live remote LLM **BLOCKED_CREDENTIALS**  
- No caregiver / care-recipient validation  
- No caregiver-validated burden metrics  
- Care-recipient control UX thin  
- No committed partnerships  
- Maya continuity ≠ full independent second-user product experience  

---

## 13. DO-NOT-DO list (next Grok session)

Do **not** automatically:

- redesign product · new substrate phase · Track 2 · workforce features · provider portal · full care-recipient product · production deploy  
- modify original `niov-foundation` · modify Otzar  
- claim caregiver validation · invent interviews/metrics/partners  
- start Session 1 · contact participants · send partnership outreach  

First: recover state and report gate; wait for founder instruction.

---

## 14. Current next action

```text
0. ONLINE ENVIRONMENT (CURRENT GATE)
   - Research admin path ~/CaretakerRelayResearch is NOT the product
   - Deploy Care API + Web via Render blueprints + isolated Postgres
   - Founder must supply valid Render credentials + DATABASE_URL (agent: Render API 401)
   - Prove public HTTPS Judge Loop smoke before recruitment

1. Then: FOUNDER AUTHORIZES RECRUITMENT
2. RECRUIT / SCREEN first family caregiver
3. RUN Session 1 against ONLINE product URL (same semantics as Judge Loop freeze)
4. CAPTURE real [CAREGIVER INPUT]
5. SYNTHESIZE findings → only then product behavior changes
```

**Docs:** `docs/ONLINE_DEPLOYMENT_ARCHITECTURE.md`, `docs/ONLINE_READINESS_MATRIX.md`

---

## 15. Authoritative document map

| Need | Read |
| --- | --- |
| Full recovery | **This file** + `CARETAKER_RELAY_CURRENT_STATE.json` |
| Reading order | `CARETAKER_RELAY_CONTINUITY_INDEX.md` |
| Constitution gaps | `PRODUCT_CONSTITUTION_GAP_AUDIT.md` |
| Judging traceability | `ACL_TRACK1_TRACEABILITY.md` |
| Judge Loop proof | `TRACK1_JUDGE_LOOP_EXTERNAL_REVIEW.md` |
| Research method | `research/FIRST_CAREGIVER_RESEARCH_EXTERNAL_REVIEW.md` |
| Session 1 blockers | `research/SESSION_1_ACTIVATION_EXTERNAL_REVIEW.md` |
| Run a session (later) | `research/SESSION_1_MODERATOR_CARD.md` + `MODERATOR_GUIDE.md` |
| Freeze SHAs | `research/RESEARCH_BUILD_MANIFEST.md` |

---

## 16. Cold-context recovery self-test (passed at write time)

| Question | Recoverable answer |
| --- | --- |
| What is Caretaker Relay? | Track 1 caregiver continuity product — care without re-explaining |
| ACL track? | Track 1 Phase 1 Design |
| Hero user? | Family/home caregiver |
| Built/proven? | Judge Loop lab PASS; real HTTP/Prisma/auth/med safety |
| Unproven? | Caregiver input, validated burden, partnerships, live model, physical mic |
| Product SHAs? | ff95159… / 9182c75… |
| Product frozen? | YES |
| Research begun? | NO sessions |
| Session 1 gate? | BLOCKED on founder decisions + recruitment |
| Forbidden? | See §13 |
| Next action? | Founder decisions → recruit → Session 1 |

---

**End of master continuity. Wait for founder instruction.**
