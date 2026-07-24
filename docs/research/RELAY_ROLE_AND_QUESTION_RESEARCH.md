# Relay Role and Question Research

**Purpose:** Ground persona-aware Relay answering for family caregivers, professional caregivers / DSPs, and health professionals.  
**Not an EHR.** Synthetic evaluation only.  
**Date:** 2026-07-24

## Terminology

| Role | Meaning | Track 1 relevance |
|------|---------|-------------------|
| **Family / unpaid caregiver** | Family or friend providing care without wage employment as primary identity | At least half of Track 1 winners must focus on family caregivers (ACL Caregiver AI Challenge) |
| **Professional caregiver** | Paid in-home support (private pay, agency) | Continuity, documentation, escalation |
| **Direct Support Professional (DSP)** | Professional who supports people with **I/DD** with person-centered supports: ADLs, medication support where authorized, behavioral observation, skill building, safety, community participation, documentation, handoffs | **Not** a synonym for “caretaker.” NADSP defines DSP practice as person-centered, rights-based support |
| **Health professional / physician** | Licensed clinical decision-maker | High-signal changes, provenance, verified vs reported |

### DSP sources

- NADSP: https://nadsp.org/ — person-centered supports, competency for DSPs  
- ACL Caregiver AI Challenge: https://acl.gov/caregiver-ai-challenge — meritorious focus includes I/DD, Alzheimer’s/dementias, EMR interoperability, multi-organization collaboration  

## High-value information needs (not ranked national frequencies)

There is **no** credible national ranking of exact caregiver questions 1–20. Do not invent that statistic.

Converging needs from NIA, AHRQ, Alzheimer’s Association, and caregiver guidance:

| Domain | Family need | DSP / professional need | Physician need |
|--------|-------------|-------------------------|----------------|
| Medications | What’s next, with food?, already given? | Authorized assist, last MAR, open discrepancy | Current regimen, uncertain doses, who reported |
| Changes | Since yesterday / since Maya | Since last visit / during visit | Since last encounter, timeline |
| Appointments | When, where, what to bring | Transport coming up | Pending tests / follow-ups |
| Safety / watch | What to watch for | Escalation thresholds | Functional/behavior change signal |
| Instructions | What Dr. Shah said | Current provider instructions | Prior instructions and adherence |
| Handoff | What Maya needs | Prepare my handoff / unfinished | Caregiver concerns summary |
| Team / contact | Who helps / how to reach | Who to call if changes | Caregiver context |

### Citations

- NIA caregiving FAQ: https://www.nia.nih.gov/health/caregiving/frequently-asked-questions-about-caregiving  
- NIA doctor visit tips: https://www.nia.nih.gov/health/medical-care-and-appointments/taking-someone-doctors-appointment-tips-caregivers  
- AHRQ IDEAL discharge / care transitions: https://www.ahrq.gov/patient-safety/patients-families/engagingfamilies/strategy4/index.html  
- NIA clinician older patients: https://www.nia.nih.gov/health/obtaining-older-patients-medical-history  
- NIA Alzheimer’s caregiver medical problems: https://www.nia.nih.gov/health/alzheimers-caregiving/common-medical-problems-alzheimers-disease-information-caregivers  
- Alzheimer’s Association medication safety: https://www.alz.org/help-support/caregiving/safety/medication-safety  
- HL7 FHIR Provenance R4: https://hl7.org/fhir/R4/provenance.html  
- HL7 FHIR Communication R4: https://www.hl7.org/fhir/R4/communication.html  

## Persona answer shapes (same truth)

| Persona | Tone | Emphasize |
|---------|------|-----------|
| Family | Reassuring, next-step | What matters now, simple next action |
| DSP / professional | Operational | Responsibility, document, escalate, authorized assist |
| Physician | Concise clinical | Signal, provenance, verified vs reported, timeline |

**Role-conditioned generation after permission-conditioned retrieval.**  
Truth is one. Projection differs.

## Dementia emphasis (Track 1 meritorious)

Medication adherence, behavioral changes, wandering/safety, eating/hydration, sleep, daily routine, functional decline, caregiver continuity.

## I/DD / DSP emphasis

Person preferences, communication style, daily supports, authorized medication support, behavioral observations, goals, rights and choice, continuity among support professionals.

## Architecture implication

Intent **classes** (not 60 hard-coded questions) + deterministic retrieval + plain-language composition + conversation working memory distinct from durable care truth.
