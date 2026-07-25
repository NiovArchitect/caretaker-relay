# Caregiver Documentation and Charting (Role-Aware)

## Sources (authoritative)

- **NADSP** — Documentation as a DSP competency: accurate records, data collection, timely submission ([NADSP](https://nadsp.org/documentation-people-behind-the-paperwork/)).
- **AHRQ** — Care teams communicate via medical record, caregiver notes, handoffs, instructions (LTC communication modules).
- **AHRQ** — Caregiver medicine lists: name, allergies, emergency contact, medicine, strength, purpose, when/how/how much.
- **ACL** — AI that automates processes/documentation so caregivers focus on people; Track 1 burden + HITL criteria.
- **CMS** — Person-centered HCBS planning (needs, preferences, goals — not only services performed).

## Principles for Caretaker Relay

1. **Family speaks naturally** — never forced into clinical charting UI.
2. **DSP may need structured support notes** — still generated from conversation + verify, not blank forms.
3. **Original wording is raw evidence** — structured note is projection with provenance.
4. **Professional readability ≠ clinical authority** — observations stay reported until confirmed.
5. **Not an EHR** — interoperability-informed types, human caregiver product.

## Pipeline

```
Natural human input
  → raw original evidence (preserved)
  → role + recipient + time context
  → AI/deterministic structured extraction
  → classify information type
  → detect consequential → verify
  → structured care record
  → role-aware care note (family update / support note / handoff / provider summary)
  → history + handoff + reminders + documents
```

## Note types (user-facing labels)

| Type | Audience |
|------|----------|
| Care update | Family |
| Support note | DSP / professional |
| Handoff summary | Next caregiver |
| Provider update | Clinician-facing summary |
| Daily care summary | Documents |
| Essential / emergency snapshot | Crisis orientation |

## Coaching (gentle)

Vague: “She was weird.” → “What seemed different from normal?”  
Vague: “She ate poorly.” → “About how much did she eat?”  
Never interrogate with multi-page forms.
