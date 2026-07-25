# Care Recipient Information Needs

**Purpose:** Person-first information caregivers need before event/task lists.  
**Not an EHR.** Informed by NIA medical-history guidance, CMS person-centered HCBS planning, ACL Caregiver AI framing, and HL7 conceptual boundaries.

## Core insight

Relay must know **who the person is** before **what happened around them**.

## Information families (NIA / caregiver practice)

| Family | Examples | Authority note |
|--------|----------|----------------|
| Identity | Preferred name, DOB/age, language, pronouns | Age derived from DOB only |
| Conditions | Confirmed diagnoses | Distinct from symptoms |
| Concerns | Dizziness, fatigue | Observation ≠ diagnosis |
| Allergies | Drug/food intolerances | Never invent |
| Medications | Schedule, dose, source | Existing care truth |
| Function | Mobility, assistive devices | Baseline, not claims |
| Routine | Daily pattern, meals | Preferences + plan |
| Social / transport | Who drives, where care happens | Care logistics |
| Goals | What good looks like | Person-centered |
| Team | Family, DSP, providers | Relationship-scoped |
| Emergency | Contacts, essentials | Verified only |

## ACL Technology Readiness

- **Protocol 9-Delta** (and similar fabricated protocols) must be refused — no hallucination of clinical instructions.

## Sources (conceptual)

- National Institute on Aging — medical history / caregiver communication
- CMS — person-centered HCBS planning
- ACL Caregiver AI Challenge / Tech Readiness Guide
- HL7 FHIR R5 — Patient, Condition, AllergyIntolerance, CarePlan, Goal, CareTeam, Appointment, Schedule, Slot, Provenance
