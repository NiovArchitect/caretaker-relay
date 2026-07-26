# Human Validation Plan (Phase 2 Research Package)

**Status:** READY to execute **after founder authorization only**  
**CAREGIVER INPUT:** NONE  
**CARE RECIPIENT INPUT:** NONE  
**VALIDATED:** NONE  
**RECRUITMENT:** PAUSED  

This package prepares research; it does **not** authorize product code changes or recruitment launch.

---

## 1. What must be tested first (priority order)

1. **Can a family caregiver orient to Evelyn in ≤60–90s without training?**  
2. **Can they complete a natural care update with verify/confirm and understand what was recorded?**  
3. **Can they prepare a handoff for the next person without re-explaining everything?**  
4. **Do they trust refusal language (false med premise / Protocol 9-Delta) or find it broken?**  
5. **Can a DSP use the same product for baseline + support note without workforce features?**  
6. **Does the care recipient (if included) feel dignified, in control, and able to correct?**  

Do **not** start with feature preference surveys.

---

## 2. Caregiver interview guide (family)

**Duration:** 45–60 min  
**Materials:** Public or lab build on freeze SHA; synthetic scenario card; consent  

### Warm-up (5 min)
- Who do you help? (no unnecessary PHI)  
- Hardest coordination moments this week?  

### Task block (25 min) — observe, don’t rescue  
1. Login as assigned lab principal / or guided guest path if authorized  
2. “Figure out who Evelyn is and what she needs today.”  
3. “Tell the system Evelyn was more tired after lunch.”  
4. “Get ready to hand off to the next person.”  
5. “Ask if she takes insulin.” (expect refuse)  

### Interview (15 min)
- What felt clear vs confusing?  
- Where would you not trust this?  
- What would you still text a sibling about?  
- Time: faster/slower than your current method?  
- Anything scary or wrong?  

### Close (5 min)
- One change that would make this useful tomorrow  
- Would you try again next week? (Y/N + why)

---

## 3. DSP interview guide

**Focus:** Continuity for individual care, **not** shift marketplace or workforce management.

### Tasks
1. Orient to recipient baseline (mobility, preferences, open concerns)  
2. “What changed since last visit?”  
3. Document a support observation  
4. Handoff for next professional/family  
5. Authorization boundary: what can you update?

### Probes
- Does terminology feel clinical enough / too clinical?  
- Missing info for a safe visit?  
- Risk of double documentation with agency systems?

---

## 4. Care recipient interview guide (ethical fit only)

**Include only** if capable, consented, and scenario is synthetic/non-harmful.

### Themes
- Dignity and control  
- Privacy comfort  
- Ability to correct wrong info  
- Preference for how caregivers share notes  
- Anything that feels surveillance-like  

### Forbidden
- Real diagnosis fishing  
- Pressure to approve the product  
- Recording without consent  

---

## 5. Usability test protocol

| Item | Spec |
|------|------|
| Build | Frozen SHA only |
| Environment | Quiet; mobile + desktop available |
| Facilitator | Does not drive the mouse unless stuck >90s |
| Think-aloud | Encouraged |
| Recording | Only with consent; store per data protocol |
| Scenario | Synthetic Evelyn household card |
| Success | Task complete without critical error |
| Critical error | Wrong recipient action; accepted false med premise; privacy leak attempt succeeds |

---

## 6. Measures

| Measure | Type | Notes |
|---------|------|-------|
| Time on task | Quantitative | Compare to controlled baselines directionally only |
| Steps / clicks | Quantitative | |
| Task success | Binary + notes | |
| Errors / corrections | Count | |
| SUS or single ease question | Optional | Avoid survey overload |
| Trust in AI answers | 1–5 + why | |
| Understandability of refuse | Pass/fail | |
| Would use again | Y/N | |
| Open findings | Qualitative | → FINDINGS_REGISTER |

Use `docs/research/METRICS_TEMPLATE.md` when filling.

---

## 7. Recruitment language (paused — do not send)

**Subject (draft):** Research session: home caregiving coordination tool (synthetic data)

**Body draft:**  
We’re inviting people who help a family member or client at home to try a care coordination prototype for about 45–60 minutes. We’ll use **synthetic** care data (not your real medical records). You’ll complete a few everyday tasks and share what was clear or frustrating. No sales pitch. Optional $— compensation if authorized. Reply only if interested; recruitment is currently **paused** until founder authorization.

---

## 8. Observation rubric

| Code | Meaning |
|------|---------|
| C1 | Confusion about who the product is for |
| C2 | Could not find active person / orientation |
| C3 | Did not notice verify step |
| C4 | Misread refuse as system failure |
| C5 | Tried to treat as diagnosis engine |
| C6 | Role confusion (family vs DSP) |
| S1 | Safety win (correct refuse appreciated) |
| S2 | Safety miss (would have acted on wrong info) |
| T1 | Time burden reduced (self-report) |
| T2 | Time burden same/worse |
| P1 | Privacy concern raised |
| H1 | Handoff usable |
| H2 | Handoff incomplete |

Facilitator marks codes live on `OBSERVATION_SHEET.md`.

---

## 9. Existing research assets to reuse

- `docs/research/FIRST_CAREGIVER_RESEARCH_CYCLE.md`  
- `docs/research/MODERATOR_GUIDE.md`  
- `docs/research/METRICS_TEMPLATE.md`  
- `docs/research/OBSERVATION_SHEET.md`  
- `docs/research/FAMILY_CAREGIVER_RECRUITMENT_SCREENER.md`  
- `docs/research/PARTICIPANT_INFORMATION_AND_CONSENT_TEMPLATE.md`  
- `docs/research/RESEARCH_DATA_HANDLING_PROTOCOL.md`  

---

## 10. Post-authorization first week plan

1. Founder unpauses recruitment  
2. Screen 5–8 family caregivers  
3. Run 3 pilot sessions → refine protocol only (docs), **not** product code unless P0/P1  
4. Full cycle 5–8 family + optional DSP  
5. Findings → FINDINGS_REGISTER → decision log → only then later-build changes  

**Until authorization: RECRUITMENT remains PAUSED.**
