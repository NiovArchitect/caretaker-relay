# Caretaker Relay — Care Workflow Research

**Purpose:** Ground product terminology, information hierarchy, medication presentation, handoffs, and notifications in authoritative care-coordination practice.  
**Not an EHR.** This research informs a home/family care coordination companion.

**Date:** 2026-07-23

---

## 1. Product stance

Caretaker Relay is:

- **One governed care context per recipient**
- **Authorized humans** (care circle)
- **Relay intelligence** (ask + tell + organize)
- **Durable care truth** with provenance
- **Coordination, notifications, safe outputs**

It is **not** a hospital EHR, not a prescribing system, and not automatic clinical decision support.

---

## 2. AHRQ — care transitions, handoffs, medication reconciliation

### Findings

1. **Medication reconciliation** should occur at every care transition involving medications. Patients and caregivers are essential participants, not passive recipients of a clinician-only checklist.  
   Sources: AHRQ MATCH toolkit; AHRQ PSNet transitions primers.

2. **Handoffs** fail when information is incomplete, jargon-heavy, or not action-oriented. Effective handoffs answer: what changed, what still needs attention, what to watch, and who to contact.

3. **Plain language / teach-back** improves safety: say what the caregiver needs to *do*, not system architecture. Avoid internal process vocabulary.

### Product implications

| Research | Relay product language |
|----------|------------------------|
| Transition / handoff | **Care handoff**, **Update for Maya**, **What Maya needs to know** |
| Not | “lay continuity”, “care object”, “compatible dimensions” |
| Med recon | Show authorized instruction + reported administration + discrepancy in plain language |
| Engagement | Ask + Tell; human confirms consequential items |

### Citations

- AHRQ MATCH toolkit: https://www.ahrq.gov/sites/default/files/publications/files/match.pdf  
- AHRQ MATCH chapter (designing reconciliation): https://www.ahrq.gov/patient-safety/settings/hospital/match/chapter-3.html  
- AHRQ/PSNet inpatient transitions primer: https://psnet.ahrq.gov/primer/inpatient-transitions-care-challenges-and-safety-practices  
- MATCH application (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC7247934/

---

## 3. ACL — caregiver experience and burden

### Findings

Family caregivers carry coordination load: schedules, medications, transportation, and re-explaining the story across people. Tools should **reduce re-explanation**, surface **what needs me now**, and support **handoffs between caregivers** without adding administrative vocabulary.

### Product implications

- **Today** = command center: WHO / NOW / NEXT / CHANGE / ATTENTION  
- Remove branding slogans that do not help action  
- Contact actions (call/message) reduce phone-tree burden  
- Multi-recipient architecture anticipates real households (one caregiver, more than one person)

### Citations

- ACL caregiver resources (Administration for Community Living): https://acl.gov/  
- Family caregiver support framing (ACL programs overview): https://acl.gov/programs  

---

## 4. HL7 FHIR — safe data shapes (not full EHR)

Use FHIR *concepts* for structure; do not dump FHIR IDs into caregiver UI.

| FHIR resource | Relay concept |
|---------------|---------------|
| CareTeam | Care circle / authorized people |
| CarePlan | Care plan / instructions (high level) |
| MedicationRequest | Authorized medication instruction |
| MedicationAdministration | Reported administration |
| Observation | Caregiver/professional observation |
| Appointment | Appointment with start/end/location/status |
| Communication | Human coordination messages |
| DocumentReference | Care documents / export summaries |

### Medication instruction hierarchy (when source provides it)

1. Name + strength + dose + route  
2. Clock time **only if prescribed/configured**  
3. Acceptable window **only if present**  
4. Meal relationship (e.g. with food)  
5. Special instructions  
6. Prescriber / effective date  
7. Last administration + who  

**Rule:** Never invent a clock time when the source only says “with lunch.”

### Citations

- FHIR MedicationRequest: https://build.fhir.org/medicationrequest.html  
- FHIR R4 core resources overview: https://hl7.org/fhir/R4/  

---

## 5. WCAG — notifications and accessibility

### Findings

1. **Do not rely on color alone** for meaning (icons, labels, text, shape/border).  
2. **Motion:** respect `prefers-reduced-motion`; avoid flashing; keep ambient pulse slow and subtle (opacity/glow, not rapid luminance inversion).  
3. **Status messages** should be available to assistive tech (`role="status"` / live regions as appropriate).  
4. Flashing content must stay well under 3 flashes/second (WCAG 2.3).

### Product notification model

Categories: medication due, appointment soon, verification needed, care update, handoff ready, provider update, invitation, important change.

Each notification: id, recipient, type, severity, title, plain description, source, created/due, acknowledged, action.

Urgent unresolved items may use a **slow ambient pulse** until acknowledged; reduced-motion users get a **static border emphasis** instead.

### Citations

- WCAG 2.2: https://www.w3.org/TR/WCAG22/  
- Animation from interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html  
- Foundations: animations and flashing: https://tetralogical.com/blog/2022/01/10/animations-and-flashing-content/

---

## 6. Terminology decisions (locked for this campaign)

| Forbidden in caregiver UI | Use instead |
|---------------------------|-------------|
| Care object | Medication / Appointment / Observation / Instruction / Care update |
| Lay continuity / lay | Care handoff / Caregiver handoff / Update for {Name} |
| create token / invite lifecycle | Invite to {Name}'s care circle |
| compatible dimensions | Reported amount doesn't match instructions… |
| Technical IDs (cr-*, p-*) | Human names only |
| Raw markdown | Rich document structure |

---

## 7. Information hierarchy for caregivers

1. **Who** am I helping?  
2. **What needs me** (attention / verification)?  
3. **What is coming up** (meds, appointments)?  
4. **What changed** (deduplicated signal)?  
5. **Who else is involved** (circle + contact)?  
6. **What can I ask Relay** without navigating?

Relay is an intelligence layer across the recipient context, not a single incident box.

---

## 8. Multi-recipient architecture

Authenticated caregiver → **authorized care spaces** → **active care recipient**.

Demo: Evelyn Carter (full depth) + Robert Hale (lightweight second space).  
Not Track 2 workforce management.

---

## 9. Explicit non-goals

- Do not become an EHR  
- Do not prescribe or invent clinical truth  
- Do not claim OS push notifications unless implemented  
- Do not present synthetic data as real medical advice  

---

## 10. Implementation traceability

| Area | Primary code |
|------|----------------|
| Identity resolution | `src/lib/identity.ts` |
| Plain language | `src/lib/humanCopy.ts` |
| Observation clustering | `src/lib/observations.ts` |
| Notifications | `src/lib/notifications.ts` |
| Multi-recipient | `src/lib/careContext.ts` |
| Document render | `src/lib/documentRender.tsx` |
| Med seed structure | `vendor/care-domain/src/scenario/olivia.ts` |
| Accessibility CSS | `src/styles/global.css` (notify + reduced-motion) |
