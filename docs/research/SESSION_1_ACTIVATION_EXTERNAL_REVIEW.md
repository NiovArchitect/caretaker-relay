# SESSION 1 ACTIVATION — EXTERNAL REVIEW (FOUNDER DECISION PACKAGE)

**Export type:** Final readiness gate review only  
**Date:** 2026-07-22  
**Session 1 authorized:** **NO**  
**Product modified for this export:** **NO**  
**Recruitment executed:** **NO**  

---

## 1. Frozen product

| Item | Value |
| --- | --- |
| **APP PRODUCT BUILD** | `ff95159d8803feaca0e6e245d5a77ee28ee40c99` |
| **FOUNDATION PRODUCT BUILD** | `9182c7511c1ffae9dc79082297ae92d7a5079b1a` |
| Product changed since freeze | **NO** (`src/` empty since freeze; freeze is ancestor of tip) |
| Research docs tip (not product) | `f4a6c39c15815b5329c9e4f84f0b5e3043bc5e81` |
| Branch | `checkpoint/caretaker-relay-track1-2026-07-22` |

Participants must test the **product** SHAs above, not “whatever is latest on main.”

---

## 2. Activation files inventory

Paths under `docs/research/` unless noted.

| Artifact | Path | Status |
| --- | --- | --- |
| PARTICIPANT_INFORMATION_AND_CONSENT_TEMPLATE | `PARTICIPANT_INFORMATION_AND_CONSENT_TEMPLATE.md` | **READY** (draft for founder review) |
| RESEARCH_DATA_HANDLING_PROTOCOL | `RESEARCH_DATA_HANDLING_PROTOCOL.md` | **READY** (storage/retention blanks for founder) |
| FAMILY_CAREGIVER_RECRUITMENT_SCREENER | `FAMILY_CAREGIVER_RECRUITMENT_SCREENER.md` | **READY** (not sent) |
| FAMILY_CAREGIVER_RESEARCH_INVITATION | `FAMILY_CAREGIVER_RESEARCH_INVITATION.md` | **READY** (not sent) |
| PARTICIPANT_TRACKING_TEMPLATE | `PARTICIPANT_TRACKING_TEMPLATE.md` | **READY** (codes only) |
| SESSION_1_MODERATOR_CARD | `SESSION_1_MODERATOR_CARD.md` | **READY** |
| MODERATOR_GUIDE | `MODERATOR_GUIDE.md` | **READY** |
| SESSION_TASKS | `SESSION_TASKS.md` | **READY** |
| OBSERVATION_SHEET | `OBSERVATION_SHEET.md` | **READY** |
| METRICS_TEMPLATE | `METRICS_TEMPLATE.md` | **READY** |
| POST_SESSION_QUESTIONS | `POST_SESSION_QUESTIONS.md` | **READY** |
| FINDINGS_REGISTER | `FINDINGS_REGISTER.md` | **READY** / empty of real findings |
| DESIGN_DECISION_LOG | `DESIGN_DECISION_LOG.md` | **READY** / empty |
| RESEARCH_BUILD_MANIFEST | `RESEARCH_BUILD_MANIFEST.md` | **READY** |
| SESSION_1_READINESS_GATE | `SESSION_1_READINESS_GATE.md` | **READY** |
| SESSION_1_DATA_PACKET | `SESSION_1_DATA_PACKET.md` | **READY** |

**None MISSING** among the listed set.

---

## 3. Founder decisions still required

### DECISION FD-01 — Consent approach

| | |
| --- | --- |
| **QUESTION** | Will Session 1 use written acknowledgment, verbal acknowledgment, or both? Will the draft template be used as-is or after legal/org review? |
| **OPTIONS** | Written only · Verbal only · Written + verbal · Delay until org counsel/IRB path |
| **RECOMMENDED DEFAULT** | Use draft information sheet; obtain **written or clear verbal acknowledgment** recorded in private notes; fill founder contact fields first |
| **WHY** | Template is ready but not certified; founder must accept residual process risk |
| **BEFORE SESSION 1** | Review template; fill contact lines; decide written vs verbal; store signed/verbal record **outside Git** |

### DECISION FD-02 — Recording policy

| | |
| --- | --- |
| **QUESTION** | Confirm Cycle 1 Session 1 recording media? |
| **OPTIONS** | All off (package default) · Enable one medium with updated consent |
| **RECOMMENDED DEFAULT** | **All OFF** |
| **WHY** | Matches prepared protocol; reduces handling complexity |
| **BEFORE SESSION 1** | Confirm OFF (or document explicit exception) |

### DECISION FD-03 — Private note storage

| | |
| --- | --- |
| **QUESTION** | Where do completed observation sheets / consent records live? |
| **OPTIONS** | A encrypted local folder outside Git · B org drive · C approved research repo · Other |
| **RECOMMENDED DEFAULT** | **A — encrypted local folder outside Git** (if founder accepts device responsibility) |
| **WHY** | Protocol already lists A as primary option; no cloud invented |
| **BEFORE SESSION 1** | Fill decision block in `RESEARCH_DATA_HANDLING_PROTOCOL.md` (or private copy of that decision) |

### DECISION FD-04 — Retention

| | |
| --- | --- |
| **QUESTION** | How long keep raw notes, consent records, de-identified findings, contact info? |
| **OPTIONS** | Founder-defined dates/rules · Org policy if any |
| **RECOMMENDED DEFAULT** | Minimize contact retention; keep de-identified findings for design history; raw notes until cycle synthesis complete then review deletion — **founder must write actual values** |
| **WHY** | Protocol forbids invented legal periods |
| **BEFORE SESSION 1** | Fill retention fields |

### DECISION FD-05 — Quote permission process

| | |
| --- | --- |
| **QUESTION** | Confirm separate quote permission checkbox/process as drafted? |
| **OPTIONS** | Use template as written · Quotes never · Quotes only post-session written email |
| **RECOMMENDED DEFAULT** | Use separate Y/N on consent template |
| **WHY** | Already in package |
| **BEFORE SESSION 1** | Confirm and train moderator to ask |

### DECISION FD-06 — Recruitment / Caregiver #1

| | |
| --- | --- |
| **QUESTION** | Who is Caregiver #1 and when is Session 1? |
| **OPTIONS** | Recruit via invitation/screener · Delay research |
| **RECOMMENDED DEFAULT** | Human founder recruits one family caregiver using neutral invitation |
| **WHY** | Methodology ready; evidence is empty without a human |
| **BEFORE SESSION 1** | Screen, schedule, consent; **COMPLETED recruitment still 0** |

### DECISION FD-07 — Institutional / IRB path (if applicable)

| | |
| --- | --- |
| **QUESTION** | Does any institution require human-research review for this formative work? |
| **OPTIONS** | Confirm not applicable · Confirm and obtain required review · Pause |
| **RECOMMENDED DEFAULT** | Founder answers honestly for their context; package does **not** declare exemption |
| **WHY** | Ethics honesty rule in protocol |
| **BEFORE SESSION 1** | Explicit founder check |

---

## 4. Proposed founder defaults vs prepared protocol

| Proposed default (review) | Matches prepared protocol? | Conflict? |
| --- | --- | --- |
| AUDIO OFF | **Yes** | None |
| VIDEO OFF | **Yes** | None |
| SCREEN OFF | **Yes** | None |
| Capture = notes + timing + counts + optional quotes | **Yes** | None |
| Private notes = encrypted local folder outside Git | **Yes as Option A** — not yet **selected as fact** | **No conflict** with text; still **FOUNDER DECISION REQUIRED** until filled |
| Git = templates, codes, de-identified findings, decisions only | **Yes** | None |
| Real PHI in prototype PROHIBITED | **Yes** | None |
| Identifying research data in Git PROHIBITED | **Yes** | None |

**Do not treat private storage as “chosen” until founder fills SELECTED OPTION.**

---

## 5. Consent template — exact participant-facing wording (current)

### Information sheet (from template)

**What is Caretaker Relay?**  
Caretaker Relay is a **prototype** product intended to help people coordinate care for someone at home or in the community. It is early software under development.

**Purpose of this session**  
We want to learn how well the prototype makes sense for people who give care, what is confusing, and how it compares with how caregivers coordinate information today.

**We are evaluating the software, not you.** There are no right answers. Anything confusing is useful for us to learn.

**What you will do**  
- One session of about **45–60 minutes**  
- Look at the prototype and try a few simple tasks  
- Answer questions about what you noticed  

**Synthetic scenario only**  
You will use **made-up** care information about a fictional person named **Olivia**.  
**Please do not enter real private health information** about yourself or anyone you care for into the prototype.

**Not medical advice**  
Caretaker Relay and this session **do not provide medical advice**.  
The prototype will not recommend medication doses. For health decisions, talk with a clinician.

**Voluntary participation**  
Participation is **voluntary**. You may **stop at any time**, skip any question, or decline any task without penalty.

**What we collect**  
Audio/Video/Screen **OFF**; moderator notes ON; task timing/counts ON; optional quotes only with permission.  
Notes used to improve product and understand caregiver needs. De-identified findings may inform design and competition documentation. Identifying contact information is not stored in the public project repository.

**Quotes**  
Asked separately; may refuse quotes while allowing notes.

**Risks / discomfort**  
May feel tired or emotional; may stop anytime. Prototype failure/confusion is feedback, not a test of ability.

**Contact**  
Founder/research contact lines are **blank placeholders** to fill before use.

### Consent acknowledgment bullets (current)

- Evaluating product, not graded  
- May stop anytime  
- Synthetic care information only  
- Should not enter real private health information  
- No medical advice  
- Notes as described  
- Recording off for Session 1 unless separately agreed later  

### Flags (review only — not rewritten)

| Issue | Note |
| --- | --- |
| Ambiguous | Written vs verbal acknowledgment both allowed — founder must pick practice |
| Too legalistic | Header disclaimers are necessary honesty; body is mostly plain |
| Missing | Explicit data-controller identity beyond blank founder field; formal privacy-policy URL not present |
| Medical-care risk | **Low** — “not medical advice” and “no dose recommendation” explicit |
| Proven safety/effectiveness risk | **Low** — says prototype / early software; does not claim proven outcomes |
| Contact blank | **Must fill** before Session 1 |

---

## 6. Data storage rules (prepared)

| Data type | Git? | Outside Git? | Status |
| --- | --- | --- | --- |
| Raw moderator notes (identifying) | **MUST BE OUTSIDE GIT** | Yes | Decided by protocol |
| Participant contact information | **MUST BE OUTSIDE GIT** | Yes | Decided |
| Consent records (signed/name) | **MUST BE OUTSIDE GIT** | Yes | Decided |
| Optional quotes (if identifying context) | Prefer de-identified in Git findings only | Raw outside | Decided |
| De-identified findings | **MAY BE IN GIT** | Optional | Decided |
| Aggregate metrics | **MAY BE IN GIT** | Optional | Decided |
| Research design decisions | **MAY BE IN GIT** | Optional | Decided |
| Private folder path selection | — | **UNDECIDED** until founder fills form | **FOUNDER DECISION** |
| Retention periods | — | **UNDECIDED** until founder fills form | **FOUNDER DECISION** |

---

## 7. Session 1 Moderator Card — complete current text

```text
# Session 1 Moderator Card (one page)

**Build:** App `ff95159…` · Foundation `9182c75…`  
**Recording:** OFF · Notes ON · Quotes only with permission  

## DO NOT SELL THE PRODUCT DURING THE SESSION

**DO NOT EXPLAIN A FAILURE AWAY.**  
**DO NOT SAY** “That’s supposed to…” / “What it means is…” / “The AI actually…”  
**until observation for that task is done.**  
If they misunderstand: **record the misunderstanding FIRST.** That is evidence.

### OPENING (~3 min)
**Say:** We are evaluating a home care-coordination **prototype**, not you — no right answers; confusion is useful. Synthetic **Olivia** only — do not enter real private health info. No medical advice. Voluntary; stop anytime. **No recording** this session; I will take notes. Quotes only with your permission.
**Record:** Consent · quote permission · start time  

### T1 — Five seconds
**Prompt:** Today open. No explanation. What is this showing? Who for? What first? Attention / changed / handled / next?  
**Don’t say:** How the sections work.  
**Record:** First actions · misreads · time to coherent description  

### T2 — Natural update
**Facts (paraphrase OK):** Olivia morning — dizzy getting up; ate ~nine; two blue pills; Maya ~three not two; want Maya informed.  
**Prompt:** Tell Relay what happened however you normally would.  
**Don’t say:** Force the engineering sentence.  
**Record:** Time · actions · voice/text · form-seeking · confusion  

### T3 — Interpretation
**Prompt:** What does Relay believe happened? Reported / Needs checking? Missing or invented?  
**Don’t say:** Correct their labels yet.  
**Record:** Events noticed/missed · epistemic understanding  

### T4 — Medication stop
**Prompt:** Why stop? What does it know / not know? Trust more or less? What next?  
**Don’t say:** “Do you like that it refused to guess?”  
**Record:** Safety understanding · false trust · distrust  

### T5 — Correction
**Setup:** Synthetic error (meal or visit time wrong).  
**Prompt:** Something’s not right — fix it as you would if real.  
**Don’t say:** Point at Correct something.  
**Record:** First action · time · history-erasure belief  

### T6 — Maya handoff
**First:** Imagine Maya takes over — what does she need?  
**Then show** handoff. Compare. Missing/extra? Reduce re-explaining? Still text/call Maya?  
**Record:** Expected vs Relay · trust · re-explain hypothesis  

### T7 — Privacy
**Prompt:** Family / friend / professional / provider / recipient — who sees what? Invasive? Never auto-share? Remove access? Recipient control?  
**Record:** Expectations (not legal conclusions)  

### T8 — Current burden
**Prompt:** How do you coordinate today (texts, calls, notes, memory, portal…)? Places checked? What gets missed? Useful vs not here?  
**Don’t say:** Isn’t this better?  
**Record:** Baseline tools · worry · unprompted valuation  

### DEBRIEF
Use `POST_SESSION_QUESTIONS.md` neutrally.

### CLOSE
Thanks · stop anytime · synthetic only · no medical advice.

### IF PRODUCT FAILS
Say neutrally it’s a prototype glitch. Record PRODUCT FAILURE · task · what happened · participant response · continue Y/N. Do not coach around serious failures to finish a demo.
```

---

## 8. Recruitment — invitation and screener (complete current)

### Invitation (do not send)

Subject: Formative product research session (family caregivers, ~45–60 min)

Hello,

We are developing a **prototype** intended to help people coordinate care for someone at home or in the community.

We are looking for **family or friend caregivers** to take part in a **45–60 minute formative product research session**. The session uses **made-up** care information (not your real health records). We are interested in **what makes sense, what does not, and how this compares with how you currently coordinate care**.

- There are no right answers.  
- We evaluate the **software**, not your skill.  
- **No medical advice** is provided.  
- You may stop at any time.  
- For the first sessions, we take **notes only** (no audio/video recording by default).

If you might be interested, reply and we can share a short screener and schedule options.

Thank you for considering it.

[Founder / contact name]  
[Contact method]  
[Organization if any]

### Screener — who qualifies (first formative cycle)

Unpaid family/friend caregiver currently or recently supporting someone in home/community, and helps coordinate care information and/or organizes updates among helpers.

### Screener intentionally does NOT collect

Specific diagnoses; real medication lists; insurance details; government IDs.

### Outreach status

**NOT SENT** by this project automation. Recruited = 0.

---

## 9. Session 1 readiness ratings

| Area | Rating |
| --- | --- |
| PRODUCT BUILD | **READY** |
| CONSENT | **FOUNDER DECISION REQUIRED** (template READY) |
| RECORDING | **READY** (default OFF) |
| DATA STORAGE | **FOUNDER DECISION REQUIRED** (rules READY) |
| RETENTION | **FOUNDER DECISION REQUIRED** |
| RECRUITMENT MATERIALS | **READY** |
| RECRUITMENT EXECUTION | **BLOCKED** (0 participants) |
| MODERATOR GUIDE | **READY** |
| TASKS | **READY** |
| METRICS | **READY** |
| PHI SAFETY | **READY** |
| MEDICATION SAFETY TASK | **READY** |
| CORRECTION TASK | **READY** |
| HANDOFF TASK | **READY** |
| PRIVACY TASK | **READY** |
| POST-SESSION WORKFLOW | **READY** |

**Overall SESSION 1 READINESS: BLOCKED** until FD-01–FD-07 (as applicable) + Caregiver #1 scheduled.

---

## 10. Exact activation gate (minimum)

Session 1 may begin only when **all** of the following are true:

1. Product still at frozen SHAs (or documented blocking-bug amendment).  
2. Founder has reviewed consent draft and chosen written/verbal practice; contact fields filled.  
3. Recording confirmed OFF (or exception documented with consent).  
4. Private storage option selected and usable.  
5. Retention fields filled at founder level.  
6. Institutional/IRB check answered for founder’s context.  
7. One eligible family caregiver screened, scheduled, and consented.  
8. Moderator has card + observation sheet + timer; stack boots with synthetic Olivia.  

**Not required for Session 1:** more engineering, more stress campaigns, Track 2, live remote model, physical mic validation, partnerships signed.

---

## 11. Source control

| Item | Value |
| --- | --- |
| Activation-pack commit SHA | `f4a6c39c15815b5329c9e4f84f0b5e3043bc5e81` |
| Remote SHA | `f4a6c39c15815b5329c9e4f84f0b5e3043bc5e81` |
| Remote verified | **YES** |
| Product files changed in activation pack | **NO** |
| Foundation changed in activation pack | **NO** |
| **This export file committed** | **NO** at creation (uncommitted docs-only export) |

---

## 12. Evidence state

| | |
| --- | --- |
| CAREGIVER INPUT | **NONE** |
| CARE RECIPIENT INPUT | **NONE** |
| VALIDATED | **NONE** |

---

**STOP. DO NOT START SESSION 1.**
