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
5. Read `docs/CARETAKER_RELAY_CONTINUITY_INDEX.md`.  
6. **If online deploy / research env is the gate:** read `docs/ONLINE_READINESS_CURRENT_STATE.md` **before any deploy action**.  
7. Run Git: branches, HEADs, remotes, `git status`, confirm product freeze SHAs.  
8. Reconcile docs vs Git; **Git wins** on commits.  
9. Report: recovered state, current gate, exact blockers, next authorized action.  
10. **Do not** resume deployment from chat memory. Resume from disk blockers.  
11. **Do not** execute deploy/recruit until founder has resolved true external access blockers and instructs.  

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
**Online research environment:** **READY** (public HTTPS app + Care API + isolated Postgres; public smoke PASS — see §14 and `ONLINE_READINESS_CURRENT_STATE.md`).  
**Recruitment / Session 1 run:** **PAUSED / NOT STARTED** (0 recruited, 0 scheduled, 0 completed).  
**Do not recruit** until founder explicitly authorizes Caregiver #1 outreach.

**Resolved founder decisions** — see `docs/research/FOUNDER_DECISIONS_SESSION_1.md`:

- Recording OFF (A/V/screen)  
- PHI in prototype prohibited  
- Identifying data out of Git  
- Private path: `/Users/genghishameha/CaretakerRelayResearch`  
- Formative retention / data minimization  
- Consent: info sheet + private acknowledgment before product use  
- Quotes only with permission  

**Still human-only:** valid Render access + isolated DB secrets; then recruit/screen/schedule Caregiver #1; confirm institutional/IRB policy if applicable; founder authorize outreach.

**Execution checklist:** `docs/research/SESSION_1_EXECUTION_GATE.md`  
**After online env ready + founder allows:** RECRUIT / SCREEN first real family caregiver — **do not automate contact**.

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

- redesign product · redesign stack because of Render 401 · switch cloud providers solely to avoid auth fix  
- new substrate phase · Track 2 · workforce features · provider portal · full care-recipient product · production deploy  
- DNS changes without founder · duplicate infrastructure · resume deploy from chat memory after compaction  
- modify original `niov-foundation` · modify Otzar  
- claim caregiver validation · invent interviews/metrics/partners  
- recruit / start Session 1 while online env blocked · contact participants · send partnership outreach  

First: recover state from disk (including `ONLINE_READINESS_CURRENT_STATE.md`); report gate; wait for founder instruction.

---

## 14. Current next action — ONLINE ENVIRONMENT READY

```text
ONLINE RESEARCH ENVIRONMENT: READY
RECRUITMENT: PAUSED (await founder authorization)

Public app (canonical): https://care.niovlabs.com
Public app (Render fallback): https://caretaker-relay-web.onrender.com
Public API: https://caretaker-relay-care-api.onrender.com
Health:     GET /api/v1/health → 200 (prisma durable)

Render (Caretaker only — do not touch Otzar):
  caretaker-relay-web      srv-d9h0l2n41pts73dksrmg
  caretaker-relay-care-api srv-d9h0ku3bc2fs739eo660
  caretaker-relay-db       dpg-d9h0ifjeo5us73d0l0eg-a (db: caretaker_relay)

Auth: CLI OAuth (~/.render/cli.yaml). Shell RENDER_API_KEY may be stale 401 — unset for CLI.
Understand mode: fixture-backed (honest; not live remote LLM).
Public smoke: PASS (auth isolation, multi-event, med uncertainty, confirm, correction, handoff, restart persistence).

0. FOUNDER AUTHORIZES RECRUITMENT
1. RECRUIT / SCREEN first family caregiver
2. RUN Session 1 against ONLINE product URL
3. CAPTURE real [CAREGIVER INPUT]
4. SYNTHESIZE findings → only then product behavior changes
```

**Docs:** `docs/ONLINE_READINESS_CURRENT_STATE.md`, `docs/ONLINE_DEPLOYMENT_ARCHITECTURE.md`

---

## 15. Authoritative document map

| Need | Read |
| --- | --- |
| Full recovery | **This file** + `CARETAKER_RELAY_CURRENT_STATE.json` |
| Reading order | `CARETAKER_RELAY_CONTINUITY_INDEX.md` |
| **Online readiness audit** | **`ONLINE_READINESS_CURRENT_STATE.md`** |
| Online architecture | `ONLINE_DEPLOYMENT_ARCHITECTURE.md` |
| Online gap matrix | `ONLINE_READINESS_MATRIX.md` |
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
| Unproven? | Caregiver input, validated burden, partnerships, live model, physical mic, **online public URLs** |
| Product SHAs? | ff95159… / 9182c75… |
| Product frozen? | YES |
| Online audit? | COMPLETED TO BOUNDARY — see ONLINE_READINESS_CURRENT_STATE.md |
| Online env ready? | **NO** |
| Top online blockers? | Render 401 (access); no isolated DB; no public app/API URLs |
| Render 401 class? | ACCESS/AUTHORIZATION — not architecture failure |
| Research begun? | NO sessions; recruitment PAUSED |
| Forbidden? | See §13 + no deploy-from-chat-memory |
| Next action? | Founder Render auth + isolated DB → public smoke → then recruit |

---

**End of master continuity. Wait for founder instruction. After compaction: recover from disk, do not deploy until access blockers resolved.**
