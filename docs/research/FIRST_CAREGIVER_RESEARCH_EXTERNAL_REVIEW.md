# FIRST CAREGIVER RESEARCH CYCLE — EXTERNAL REVIEW EXPORT

**Export type:** Synthesis of prepared research artifacts only  
**Date:** 2026-07-22  
**Sessions conducted:** **0**  
**Product modified during research prep:** **NO**  
**Session 1 started:** **NO**  

**Hard honesty:** No fabricated participants, quotes, metrics, or validation.

---

## 1. Frozen research build

### APP REPO

| Field | Value |
| --- | --- |
| Path | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay` |
| Branch | `checkpoint/caretaker-relay-track1-2026-07-22` |
| **PRODUCT BUILD SHA** (participants see) | `ff95159d8803feaca0e6e245d5a77ee28ee40c99` |
| **Current branch tip SHA** | `ccfdbeba91a11ffbbd3074ee35d74d4c0d314f10` |
| Remote SHA (same tip) | `ccfdbeba91a11ffbbd3074ee35d74d4c0d314f10` |
| Local == remote | **YES** (after fetch at export verification) |

### FOUNDATION REPO

| Field | Value |
| --- | --- |
| Path | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation` |
| Branch | `checkpoint/caretaker-relay-track1-2026-07-22` |
| **PRODUCT BUILD SHA** | `9182c7511c1ffae9dc79082297ae92d7a5079b1a` |
| **Current SHA** | `9182c7511c1ffae9dc79082297ae92d7a5079b1a` |
| Remote SHA | `9182c7511c1ffae9dc79082297ae92d7a5079b1a` |

### Distinction: product vs documentation SHAs

| Layer | SHA | Contents |
| --- | --- | --- |
| **Product build (frozen)** | App `ff95159…` · Foundation `9182c75…` | Judge Loop implementation participants test |
| **Research documentation** | App `ccfdbeb…` | Research package + protocol docs only (`docs/**`) |

**Product behavior after freeze:** **UNCHANGED.**  
`git diff --name-only ff95159..ccfdbeb -- src` is empty (docs-only commit above product freeze).  
Foundation product tip remains `9182c75…` with no further product commits after freeze.

**Participants should be shown the product at:**

- App: **`ff95159d8803feaca0e6e245d5a77ee28ee40c99`**  
- Foundation: **`9182c7511c1ffae9dc79082297ae92d7a5079b1a`**

Operator may check out those SHAs (or run current tip only if still byte-identical for `src/` — tip’s product tree is the freeze tree). Manifest requires SHA confirmation before Session 1.

---

## 2. Research package inventory

| Path | Purpose | Status | Participant-facing | Moderator-facing | Internal-only |
| --- | --- | --- | --- | --- | --- |
| `docs/research/RESEARCH_BUILD_MANIFEST.md` | Freeze SHAs, limitations, boot notes | Ready | No | Yes | Partial |
| `docs/research/FIRST_CAREGIVER_RESEARCH_CYCLE.md` | Cycle goals, N, non-goals | Ready | No | Yes | No |
| `docs/research/MODERATOR_GUIDE.md` | Role, opening script, bias, PHI stops | Ready | No | **Yes** | No |
| `docs/research/SESSION_TASKS.md` | Tasks 1–8 | Ready | No | **Yes** | No |
| `docs/research/OBSERVATION_SHEET.md` | Per-session capture form | Ready | No | **Yes** | No |
| `docs/research/POST_SESSION_QUESTIONS.md` | Neutral debrief | Ready | Spoken to participant | **Yes** | No |
| `docs/research/FINDINGS_REGISTER.md` | Real findings only (empty) | Ready / empty | No | Yes | Yes |
| `docs/research/DESIGN_DECISION_LOG.md` | Research-driven decisions (empty) | Ready / empty | No | Yes | Yes |
| `docs/research/METRICS_TEMPLATE.md` | Measures definitions | Ready | No | Yes | Yes |
| `docs/PARTNERSHIP_OUTREACH_PLAN.md` | Outreach prep, nothing sent | Ready | No | Optional | Yes |
| `docs/DEMENTIA_CAREGIVER_FIT_HYPOTHESIS.md` | Founder hypothesis only | Ready | No | Optional | Yes |
| `docs/CAREGIVER_RESEARCH_PROTOCOL.md` | Protocol index + freeze pointer | Updated | No | Yes | No |
| `docs/CAREGIVER_RESEARCH_TRACEABILITY.md` | Decision log; still no real input | Updated | No | Yes | Yes |
| `docs/TRACK1_JUDGE_LOOP_EXTERNAL_REVIEW.md` | Prior product slice export | Exists | No | Optional | Yes |
| **This file** | External review export | Created by export request | No | Reviewer | Yes |

**Missing as standalone formal legal instruments (not fabricated):** IRB/ethics approval packet; signed consent form template with legal review; data-retention policy document beyond PHI redirects in moderator guide. Marked in readiness audit below.

---

## 3. Session 1 — exact run of show (chronological)

**Total target:** ~45–60 minutes (flexible).  
**Sources:** `MODERATOR_GUIDE.md` + `SESSION_TASKS.md` + `OBSERVATION_SHEET.md` + `POST_SESSION_QUESTIONS.md` + `METRICS_TEMPLATE.md`.

### Stage 0 — Pre-arrival (operator, ~15–30 min)

| | |
| --- | --- |
| **Duration** | 15–30 min |
| **Moderator action** | Confirm SHAs; boot Care API + app; synthetic Olivia only; reset polluted lab state; timer; observation sheet; decide recording off by default |
| **Language** | None to participant |
| **Must NOT** | Change product mid-prep without finding ID |
| **Capture** | SHA verification; stack health |
| **Metric** | Build match Y/N |
| **Safety** | Stack uses synthetic data only |

### Stage 1 — Welcome + consent (~3–5 min)

| | |
| --- | --- |
| **Duration** | 3–5 min |
| **Moderator action** | Opening script; consent; withdraw; synthetic only; no medical advice |
| **Scripted language** | See §4 Opening script |
| **Participant task** | Agree/decline; ask questions |
| **Must NOT explain** | How Today/Relay “should” work |
| **Capture** | Consent; quote permission; recording decision |
| **Metric** | Session start time |
| **Safety** | Voluntary; stop anytime |

### Stage 2 — Task 1 First five seconds (~3–5 min)

| | |
| --- | --- |
| **Duration** | 3–5 min |
| **Screen** | **Today** only |
| **Moderator action** | Open Today; **no UI explanation** |
| **Language** | “What do you think this is showing you?” / “Who do you think it’s for?” / “What would you do first?” / attention/changed/handled/next probes |
| **Participant task** | Interpret screen |
| **Must NOT explain** | Section meanings, product story, AI |
| **Capture** | First click/gaze; misread labels; spontaneous comments (`OBSERVATION_SHEET`) |
| **Metric** | Time to coherent description of Today (sec) |
| **Follow-ups** | Only after observation |

### Stage 3 — Task 2 Care update (~8–12 min)

| | |
| --- | --- |
| **Duration** | 8–12 min |
| **Facts given** | See §7 (situation facts, not forced engineering sentence) |
| **Moderator action** | Give synthetic situation; prompt natural update |
| **Language** | “Tell Relay what happened — however you’d normally share an update.” |
| **Participant task** | Voice and/or text of choice |
| **Must NOT** | Dictate the engineering `JUDGE_LOOP_UTTERANCE` unless participant asks for example wording |
| **Capture** | Time, actions, voice/text, form-seeking, confusion |
| **Metric** | Time to capture; interaction count; completion Y/N |
| **Safety** | Redirect real PHI |

### Stage 4 — Task 3 Verify (~5–8 min)

| | |
| --- | --- |
| **Duration** | 5–8 min |
| **Moderator action** | Observe verify UI after extract |
| **Language** | “What do you think Relay believes happened?” / Reported vs Needs checking / missing or invented |
| **Capture** | Multi-event understanding; label confusion |
| **Metric** | Verification success Y/N (understood multi-event grouping) |

### Stage 5 — Task 4 Medication safety (~5–8 min)

| | |
| --- | --- |
| **Duration** | 5–8 min |
| **Moderator action** | Ensure ambiguous med moment visible; **no leading** |
| **Language** | “Why do you think it stopped here?” / know vs don’t know / trust more or less / what next |
| **Must NOT** | “Do you like that Relay refused to guess?” |
| **Capture** | Understood stop; trust direction; expected action |
| **Safety** | No dose recommendation discussion as product feature |

### Stage 6 — Task 5 Correction (~5–8 min)

| | |
| --- | --- |
| **Duration** | 5–8 min |
| **Moderator action** | Introduce synthetic error (e.g. meal time wrong; visit time wrong) |
| **Language** | “Something’s not right — fix it the way you would if this were real.” |
| **Must NOT** | Coach path to Correct something |
| **Capture** | First action; time; navigation errors; history-erasure belief |
| **Metric** | Corrections required; completion without coaching Y/N |

### Stage 7 — Task 6 Handoff (~5–8 min)

| | |
| --- | --- |
| **Duration** | 5–8 min |
| **Moderator action** | **First** ask Maya needs; **then** show handoff |
| **Language** | Pre: “Imagine Maya is taking over. What does she need to know?” Post: compare / reduce re-explaining / missing or unnecessary |
| **Capture** | Expected vs generated; trust; still call/text Maya? |
| **Metric** | Handoff comprehension (0–2 or notes) |

### Stage 8 — Task 7 Privacy (~4–6 min)

| | |
| --- | --- |
| **Duration** | 4–6 min |
| **Roles** | Family member; secondary friend; professional caregiver; provider; care recipient |
| **Language** | Who should see what; invasive; remove access; never auto-share |
| **Capture** | Expectations (not legal conclusions) |

### Stage 9 — Task 8 Burden baseline + comparison (~5–8 min)

| | |
| --- | --- |
| **Duration** | 5–8 min |
| **Language** | How handle today (texts, calls, notes, memory, portals…); places checked; missed info; useful/not vs Relay |
| **Must NOT lead** | “Isn’t this better?” |
| **Capture** | Baseline tools; worry sources; unprompted valuation |

### Stage 10 — Post-session questions (~5 min)

| | |
| --- | --- |
| **Source** | `POST_SESSION_QUESTIONS.md` |
| **Capture** | Understanding, trust, safety, continuity, privacy, burden, one change |

### Stage 11 — Close (~2 min)

| | |
| --- | --- |
| **Language** | Thanks; stop anytime already covered; no medical advice; synthetic only reminder |
| **After** | Complete observation sheet same day; findings register if real notes |

---

## 4. Opening script (prepared)

From `MODERATOR_GUIDE.md` (verbatim prepared language):

> “We’re testing a prototype that helps people coordinate care for someone at home. You’ll use **made-up** care information about a person named Olivia — not your real records. There are no right answers. I’m interested in what makes sense, what confuses you, and how this compares to what you already do.”

### Implied coverage vs gaps

| Topic | Covered in prepared package? | Gap before Session 1 |
| --- | --- | --- |
| What is being tested | **Yes** (prototype for home care coordination) | Optional: name “Caretaker Relay” explicitly if desired |
| Testing product not participant | **Partial** (“no right answers”) | Strengthen: “We’re evaluating the software, not your skill” |
| Synthetic scenario | **Yes** | — |
| No real private health info in app | **Yes** (synthetic + PHI redirect table) | — |
| No medical advice | **Yes** (safety table) | State in opening if not already said |
| Consent / voluntary / withdraw | **Yes** (before session list + after) | **Formal written consent form** not in package — **decision required** |
| Recording / note-taking | Notes assumed; recording **off unless explicit permission** | **Explicit decision** per session |
| Ability to stop | **Yes** | Reiterate verbally |

**Must decide before Session 1:** written vs verbal consent standard; whether to record; where session notes are stored (repo vs private offline) without PHI.

---

## 5. First-five-seconds test (Task 1)

| Item | Spec |
| --- | --- |
| **Screen** | Today (default landing) |
| **Hidden / not explained** | All product narration; Care/Circle/Relay unless they navigate alone; engineering/lab details |
| **Exact questions** | What is this showing? Who for? What do first? Needs attention / changed / handled / next? |
| **SUCCESS** | Participant identifies: (a) about someone’s day/care, (b) for a caregiver, (c) can point to at least one of attention/changed/handled/next with plausible meaning |
| **PARTIAL** | Gets person/day but misreads “Needs your attention” as emergency-only or fails 2+ hierarchy questions |
| **FAILURE** | Cannot form any coherent purpose; confuses product with EHR/workforce tool; cannot name care recipient context |
| **Recorded** | First click/gaze; misread labels; spontaneous comments; stated interpretation; time-to-description |

**Do not redefine success after seeing behavior** — use this rubric consistently.

---

## 6. Care update task (Task 2)

### FACTS PROVIDED TO PARTICIPANT (situation seed)

From `SESSION_TASKS.md` (moderator may paraphrase; not forced exact words):

> You’ve been with Olivia this morning. She seemed dizzy getting up, ate around nine, mentioned taking two of the blue pills, and Maya is coming around three instead of two. You want Maya to know what’s going on.

### CANONICAL ENGINEERING UTTERANCE (NOT forced on participant)

Used in lab/engineering only (`JUDGE_LOOP_UTTERANCE`):

> Mom was dizzy again when she got up. She ate around nine. She said she took two of the blue pills, and Maya is coming around three instead of two. Can you make sure she knows what's going on?

**Participant instruction:** “Tell Relay what happened — however you’d normally share an update.”  
**Voice or text:** participant choice.  
**Completion:** Sends an update that produces a verify (or clear refusal) without moderator dictating wording.  
**Metrics:** time start→send; action count; confusion markers; form-seeking Y/N.

---

## 7. AI understanding task (Task 3)

After Relay shows interpretation, ask:

- What does Relay believe happened?  
- What do “Reported” / “Needs checking” mean?  
- Missing or invented?

**Capture:**

| Capture | Type |
| --- | --- |
| Events noticed | Observed + statement |
| Events missed | Observed + statement |
| Invented (participant belief) | Statement |
| Missed (participant belief) | Statement |
| Epistemic language understood | Statement + partial metric |
| Source information understood | Statement |

---

## 8. Medication safety task (Task 4)

| Item | Spec |
| --- | --- |
| **Synthetic ambiguity** | “two of the blue pills” (or equivalent natural language from Task 2 that yields high-review med moment) |
| **Expected Relay behavior (lab build)** | High-review med candidate; discrepancy/ambiguity; refuses to invent/recommend dose |
| **Moderator instruction** | Ensure moment is visible; do not explain safety model first |
| **Ask BEFORE explaining** | Why stop? What know/don’t know? Trust more or less? What next? |
| **Understood safety** | Articulates need for human check / uncertainty / no automatic dose |
| **Misunderstood safety** | Thinks Relay is broken, or thinks Relay already chose a dose |
| **False trust** | “It’s fine, just confirm” without noticing ambiguity |
| **Loss of trust** | “I don’t trust any of this” / would abandon product |

**Prohibited:** “Do you like that Relay refused to guess?”

---

## 9. Correction task (Task 5)

| Item | Spec |
| --- | --- |
| **Synthetic error** | e.g. meal time wrong or visit time wrong (moderator introduces intentional change/mistake) |
| **Prompt** | “Something’s not right — fix it the way you would if this were real.” |
| **No coaching** | Do not point to Correct something |
| **Record** | First action; time to correction; navigation errors; understands change; believes original erased?; understands current truth |

---

## 10. Handoff task (Task 6) — Care Without Re-Explaining

1. **Before handoff UI:** “Imagine Maya is taking over. What does she need to know?” → capture list.  
2. **Show** Relay handoff.  
3. **Compare** expected vs generated.  
4. **Ask** missing/unnecessary/incorrect; trust; reduce re-explaining; would still call/text Maya and why.

This is the primary test of the continuity hypothesis.

---

## 11. Privacy / control task (Task 7)

Roles: primary caregiver; secondary family/friend; professional caregiver; provider; care recipient.

Capture expectations: who sees what; permission; never auto-share; remove access; recipient control.  
**Not** legal advice or legal conclusions.

---

## 12. Burden baseline (Task 8)

**Channels to probe (from package):** texts, phone calls, paper notes, memory, calendar, group chat, patient portal, medication list, whiteboard, shared spreadsheet, notebook, other.

**Capture where credible:** places checked; handoff time; repeated explanations; missed information; coordination worry; frequency.  
**Do not force** estimates participant cannot give.

---

## 13. Metrics (Cycle 1)

From `METRICS_TEMPLATE.md`:

| Name | Definition | How | Task | Unit | Success interpretation | Objective/self | Level |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Time to understand Today | Start Task 1 → coherent description | Timer | T1 | sec | Lower not always better; note confusion | Objective | Individual |
| Time to capture update | Start T2 → send | Timer | T2 | sec | Formative | Objective | Individual |
| Interaction count | Taps/clicks/sends | Count | T2 | count | Formative | Objective | Individual |
| Corrections required | Attempts in T5 | Count | T5 | count | Formative | Objective | Individual |
| Task completion | Binary success T2–T6 | Rubric | T2–6 | Y/N | Completes without coaching | Objective | Individual |
| Handoff comprehension | Understood package | Notes/score 0–2 | T6 | score | Formative | Mixed | Individual |
| Verification success | Multi-event understood | Judgment | T3 | Y/N | Formative | Mixed | Individual |
| Navigation errors | Wrong tab/dead ends | Count | All | count | Formative | Objective | Individual |
| Care-recipient ID errors | Confuses person | Count | All | count | Any is critical signal | Objective | Individual |
| Theme codes | BURDEN/TRUST/etc. | Coding | After | themes | Pattern, not significance | Interpretation | Aggregate later |

**Evidence type discipline:**

| Type | Examples |
| --- | --- |
| OBSERVED BEHAVIOR | Clicks, pauses, ignores |
| TASK METRIC | Seconds, counts |
| PARTICIPANT STATEMENT | Quotes, answers |
| MODERATOR INTERPRETATION | Severity coding — labeled as such, not as fact |

---

## 14. Anti-bias controls

**Prohibited (MODERATOR_GUIDE):**  
“Wasn’t that easier?” · “Did you like how the AI caught that?” · “Wouldn’t this save you time?” · “Isn’t that safer?” · “Most people love this part.”

**Neutral replacements:**  
What happened? / What did you expect? / How would you handle that today? / What was confusing? / What if anything was useful? / What would you change? / What would make you distrust this?

**Process:** Observe first → then questions. Do not explain UI early, defend Relay, sell product, or correct misunderstandings before observing them. Separate observed behavior from stated preference.

---

## 15. Findings traceability

### Schema (`FINDINGS_REGISTER.md`)

FINDING ID · DATE · PARTICIPANT CLASS · PARTICIPANT CODE · TASK/CONTEXT · OBSERVATION · QUOTE (if consented) · EVIDENCE TYPE · SEVERITY · CAREGIVER PROBLEM · TRACK 1 CRITERION · DESIGN IMPLICATION · DECISION (CHANGE/KEEP/INVESTIGATE/REJECT) · PRODUCT CHANGE · RETEST · BUILD SHA

### Process

```text
RAW SESSION
  → OBSERVATION SHEET (same day)
  → FINDING (register)
  → SYNTHESIS (themes across sessions)
  → DESIGN DECISION LOG
  → PRODUCT CHANGE (later build, not freeze)
  → RETEST
```

**Current register rows with real data:** **0**

---

## 16. Participant plan

| Class | Recommended | Recruited | Scheduled | Completed |
| --- | --- | --- | --- | --- |
| Family caregivers | 5–8 | **0** | **0** | **0** |
| Secondary family/friend | 2–3 | **0** | **0** | **0** |
| Professional home caregivers | 2–3 | **0** | **0** | **0** |
| Care recipients | 2–4 | **0** | **0** | **0** |

**COMPLETED = 0.** Recruitment has **not** occurred in this preparation phase.

---

## 17. PHI / safety

| Safeguard | Prepared? |
| --- | --- |
| Real PHI disclosure → redirect synthetic | Yes |
| Medical-advice requests → refuse clinical role | Yes |
| Distress → pause/stop | Yes |
| Recording default off | Yes |
| Notes without inventing quotes | Yes |
| Synthetic scenario boundary | Yes |

**Unresolved before Session 1:**

1. **Formal consent instrument** (written vs verbal; who owns legal review)  
2. **Session data storage location** (private notes vs any repo — default: **no PHI in git**)  
3. **Recording decision** per session  
4. **Recruitment** not started  
5. **IRB/ethics** path if organization requires it  

---

## 18. Care-recipient research

| Item | State |
| --- | --- |
| Prepared | Secondary N 2–4; focus dignity/control/privacy; separate class in findings |
| Conflated with caregiver findings? | **No** — protocol forbids |
| **CARE RECIPIENT INPUT** | **NONE** |

No separate care-recipient portal built; research is formative on control expectations, not a full CR product test.

---

## 19. Partnership outreach

From `PARTNERSHIP_OUTREACH_PLAN.md` (prep only):

| Category | Why | Ask | Offer | Judging evidence | Priority |
| --- | --- | --- | --- | --- | --- |
| Family caregiver advocacy | Hero users | Participants; language | Honest feedback loop | User-centered | High |
| Aging/AAA/community | Home context | Intros; hosts | Transparent lab status | Need; partnerships | High |
| Dementia caregiver orgs | Natural fit hypothesis | Formative caregivers | Continuity prototype, no false claims | Meritorious later | High (research) |
| Disability orgs | Access/dignity | Participants; a11y critique | Access principles | Bias/access | Medium |
| Academic usability | Method | Protocol review | De-identified formative data | Metrics credibility | Medium |
| Provider advisors | Interop boundaries | Scope advice | Non-EHR positioning | Interop honesty | Medium |
| Assistive-tech | Future | Boundary advice | Seams only | Optional | Low now |

**OUTREACH SENT = NO**  
**Committed partners = NONE**

---

## 20. Dementia fit

| | |
| --- | --- |
| **Why architecture may fit** | Changing day state; multi-caregiver; repeated handoffs; uncertain observations; meds; appointments; continuity |
| **Classification** | **`[FOUNDER HYPOTHESIS]`** |
| **Prohibited claims** | Preference, clinical benefit, prize proof, “dementia product” |
| **Research questions required** | See `DEMENTIA_CAREGIVER_FIT_HYPOTHESIS.md` (Today comprehension; multi-event fit; med stop trust; handoff fit; privacy when agency fluctuates; respectful language; new work vs less work) |

---

## 21. Track 1 judging traceability (research tasks → criteria)

| Criterion | Cycle 1 can inform? | Via |
| --- | --- | --- |
| Understanding of Need | **Yes (formative)** | T8 baseline; free language |
| Responsiveness to Need | **Yes (formative)** | T2–T6 usefulness |
| Impact | **Partial formative only** | T8 comparison — not validated burden metrics |
| Caregiver Input | **Yes if sessions run** | Currently NONE |
| Co-Implementation | **Yes if continuous involvement** | Cycle plan only so far |
| Deployment Readiness | **No via this cycle** | Engineering already lab-proven |
| Metrics | **Yes (formative measures defined)** | Not yet collected |
| Evaluation and Adaptation | **Yes after findings→change** | Process ready |
| User Error Reduction | **Yes formative** | T4 med stop |
| Transparency | **Yes** | T3/T4 source/why |
| Empowerment | **Yes** | T5 correction |
| Usability | **Yes** | T1–T6 |
| Integration / home fit | **Yes** | T2 natural update; T8 |
| Interoperability | **Cannot establish live EMR** | Out of scope |
| Privacy/Dignity/Choice | **Yes formative** | T7; CR later |
| HITL | **Yes** | T3–T5 |
| Burden Reduction | **Formative only until real metrics** | T8 |
| Human Connection | **Formative** | T8 free time probe |
| Personalization | **Weak this cycle** | Not primary |
| Safety/Reliability | **Formative trust + lab already** | T4 |
| Affordability | **Weak** | Device may be observed only |
| Partnerships | **Not via sessions alone** | Outreach plan prep only |

**Cannot establish this cycle alone:** statistical impact, clinical safety, live model quality, physical mic reliability, committed partnerships, validated burden reduction.

---

## 22. Session 1 readiness audit

| Item | Status |
| --- | --- |
| Research build frozen | **READY** |
| Synthetic scenario | **READY** |
| Opening script | **READY** (minor strengthen optional) |
| Participant instructions | **READY** |
| Moderator guide | **READY** |
| Observation sheet | **READY** |
| Metrics sheet | **READY** |
| Medication safety task | **READY** |
| Correction task | **READY** |
| Handoff task | **READY** |
| Privacy task | **READY** |
| PHI protocol | **READY** (operational) |
| Consent expectations | **PARTIAL** — formal written instrument pending |
| Recording decision | **PARTIAL** — default off; per-session choice |
| Data storage decision | **PARTIAL** — “no PHI in git” clear; private store path not formalized |
| Post-session workflow | **READY** |
| Participant recruited | **BLOCKED** for actual Session 1 execution |

**Overall Session 1 readiness for conducting research once a participant is scheduled:** **PARTIAL**  
**Blocked solely by:** recruitment + formal consent/storage decisions (not by missing task design).

---

## 23. Session 1 operational checklist

### BEFORE PARTICIPANT ARRIVES

- [ ] Confirm app product SHA `ff95159…` and foundation `9182c75…`  
- [ ] Boot Care API + app (ports 3100 / 5180 / DB 5434 as lab standard)  
- [ ] Synthetic Olivia only; reset polluted state  
- [ ] Observation sheet + timer ready  
- [ ] Recording decision: off unless consented  
- [ ] Consent approach decided (written/verbal)  
- [ ] No product “quick fixes” pending  

### START OF SESSION

- [ ] Opening script  
- [ ] Voluntary / stop anytime  
- [ ] Synthetic only; no real PHI in app  
- [ ] No medical advice  
- [ ] Quote permission  

### DURING TASKS

- [ ] Task 1 no UI explanation  
- [ ] Observe before opinion every task  
- [ ] No leading praise questions  
- [ ] PHI redirect if needed  
- [ ] Distress pause if needed  

### END OF SESSION

- [ ] Post-session questions  
- [ ] Thanks; stop; synthetic reminder  
- [ ] Do not promise features  

### IMMEDIATELY AFTER SESSION

- [ ] Complete observation sheet same day  
- [ ] Store notes **without PHI** in private location  
- [ ] Log FINDING rows only from real data  
- [ ] No inventing quotes  

### BEFORE MODIFYING PRODUCT

- [ ] FINDING ID exists  
- [ ] DESIGN DECISION logged  
- [ ] Change only after freeze cycle decision  
- [ ] Retest plan named  
- [ ] Manifest amendment if product SHA changes  

---

## 24. Evidence state (preparation ≠ evidence)

| Item | Status |
| --- | --- |
| **CAREGIVER INPUT** | **NONE** |
| **CARE RECIPIENT INPUT** | **NONE** |
| **VALIDATED** | **NONE** |
| **CAREGIVER-VALIDATED BURDEN METRICS** | **NONE** |
| **PARTNERSHIPS** | **NONE** (plan only) |
| **OUTREACH SENT** | **NO** |

---

## 25. Source control (research prep)

| Item | Status |
| --- | --- |
| Research-prep commit | `ccfdbeba91a11ffbbd3074ee35d74d4c0d314f10` |
| Remote SHA | `ccfdbeba91a11ffbbd3074ee35d74d4c0d314f10` |
| Local == remote | **YES** |
| Product files changed during prep | **NO** (`src/` empty in prep commit) |
| Foundation changed during prep | **NO** (remains product freeze SHA) |
| Original niov-foundation | **UNCHANGED** |
| Otzar | **UNCHANGED** |
| **This external-review export committed** | **NO** at creation time (export-only file; may be uncommitted until later docs commit) |

---

## 26. STOP

Export only. No Session 1. No product change. No fake results.

**WAIT FOR EXTERNAL REVIEW.**
