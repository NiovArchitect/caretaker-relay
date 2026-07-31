# FINAL DOCTOR REVIEW PRODUCT CONTRACT

**Controller:** Agent Zero  
**Sources:** `docs/clinical/DOCTOR_REVIEW_1_VERBATIM.md`, `docs/clinical/DOCTOR_REVIEW_2_VERBATIM.md`  
**Status:** LOCKED physician-validation acceptance criteria (not soft UX feedback)

## Product principle

Caretaker Relay is a **role-aware, plain-language care command center**:

1. Show what matters **now**
2. Keep the full verified picture **one tap away**
3. **Retrieve before record**
4. Every instruction is **traceable**
5. **One canonical truth** supports multiple contextual views
6. Never confuse a **question** with a **clinical update**
7. Never present AI/software as clinical authority

## Acceptance criteria (release gates)

### Identity & safety strip (main page)

| ID | Criterion | Gate |
|----|-----------|------|
| AC-ID-01 | Name · Age visible beside recipient | Must |
| AC-ID-02 | DOB visible when on file | Must |
| AC-ID-03 | Allergies highly visible | Must |
| AC-ID-04 | Emergency contact visible when on file | Must |
| AC-ID-05 | Code status shown only when verified; never invented | Must |
| AC-ID-06 | Learn more / Health & Care Details opens full picture | Must |
| AC-ID-07 | Role-adaptive label (Health & Care Details / H&P) | Must |
| AC-ID-08 | Sensitive sections role/consent controlled per field | Must |

### Today simplicity

| ID | Criterion | Gate |
|----|-----------|------|
| AC-TD-01 | No full medical history dump on Today | Must |
| AC-TD-02 | Essentials: attention, next, meds, checks, appts, ADLs, meals, refills, engagement, baseline changes | Must |
| AC-TD-03 | Optional Why?/Learn more on meaningful items | Should |

### Relay intents

| ID | Criterion | Gate |
|----|-----------|------|
| AC-RL-01 | Retrieve prompts never produce med-entry clarification language | Must (blocking) |
| AC-RL-02 | Missing data: gap language + authorized path | Must |
| AC-RL-03 | Mobility retrieve before observation create | Must |
| AC-RL-04 | Oxygen query answers oxygen/devices domain, not appointments | Must (blocking) |
| AC-RL-05 | Complete med answers include frequency | Must |
| AC-RL-06 | No invented pre-dose checks | Must |
| AC-RL-07 | Three language layers → same structured data | Must |
| AC-RL-08 | Shift-plan answers are time-aware and traceable | Must |

### Work actions

| ID | Criterion | Gate |
|----|-----------|------|
| AC-WK-01 | I can help claims/assigns without raw JSON errors | Must (blocking) |
| AC-WK-02 | Next step shown after claim | Must |
| AC-WK-03 | Refill context preserved | Must |

### Clinical authority

| ID | Criterion | Gate |
|----|-----------|------|
| AC-AU-01 | No AI diagnosis/dosing/authorization | Must |
| AC-AU-02 | POLST ≠ advance directive; provenance required | Must |
| AC-AU-03 | References shape IA only — not treatment engine | Must |

## Regression prompt bank (minimum)

```
last vitals
vital signs
orientation status
any therapies
surgeries
other comorbidities
ambulation or mobility status
Is the patient on oxygen?
What medications is she on?
What should I do today?
Can she walk by herself?
What help does she need getting around?
What is her ambulatory and weight-bearing status?
Is she acting like herself?
What can she eat?
What machines does she use?
Can she take care of herself?
What does she have?
What is her code?
She now needs help walking
I gave her metformin 500 mg with food at noon
```

## Locked systems (do not rebuild unless reproduced defect)

- Proven PRN architecture
- Semantic Today engine
- Clarification lifecycle
- Notification domain / badge math
- Overlay D-DURABLE-001
- R-CONTEXT
- Dual-org unit isolation
- Lineage systems

## Freeze rule

**PRODUCT FREEZE NOT RESTORED** while any Must-gate doctor finding, engineering gap, or founder device gate remains unresolved.
