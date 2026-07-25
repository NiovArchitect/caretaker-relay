# ACL Track 1 — Human Experience Reassessment

**Date:** 2026-07-25  
**Sources (official ACL site, current competition cycle):**

- [Judging Criteria: Track 1, Phase 1](https://acl.gov/caregiver-ai-judging-track1)
- [Technology Readiness Guide](https://acl.gov/caregiver-ai-tech-readiness-guide)
- [Caregiver AI Challenge home](https://acl.gov/caregiver-ai-challenge)
- [Phase 1 announcement](https://acl.gov/news-and-events/announcements/acl-launches-phase-1-caregiver-ai-prize-competition)

## North-star product job

Not “chatbot + features.” The caregiver operating problem:

> Understand the person → know what matters → know what happened → know what to do → know what others did → know uncertainty → communicate → document accurately → hand off — without reconstructing everything.

## Track 1 criteria (must exceed, not merely touch)

| Criterion | Product implication |
|-----------|---------------------|
| Responsiveness to need | Orientation + attention that match real home caregiving |
| Caregiver burden reduction | Natural language in; Relay structures; no form-heavy charting for family |
| User error reduction | Verify consequential claims; no silent promotion; coaching questions |
| Transparency | Source / verification / “not on file” visible |
| Human-in-the-loop | Confirm before care truth |
| Empowerment | Clear next actions, not medical jargon traps |
| Person-centered care | Profile, goals, preferences before event dumps |
| Realistic usability | 60s orientation; 5-minute missions |
| Home integration | Mobile-first, coverage/handoff, multi-person circle |
| Interoperability | Structured notes + FHIR-informed types (not full EHR) |
| Privacy / dignity / choice | Role-scoped access; no unauthorized mix |
| Safety / reliability | Protocol 9-Delta refuse; adversarial perimeter |
| Human connection | Coordination + handoff, not productivity tracking |
| Personalization | Recipient profile + role-aware notes |
| Deployment feasibility | Static web + care API already live |
| Measurable impact | Task-time, orientation, smart scenarios |

## Technology readiness (must prove)

- **Input → AI analysis → caregiver action** loop (understand → verify → confirm → projections)
- Explicit **I don't know** / not on file
- HITL verification evidence
- Messy language + scheduling stress tests
- Protocol 9-Delta hallucination resistance

## Documentation philosophy (role-aware)

| Role | User language | Not |
|------|---------------|-----|
| Family | Care update / care note | Nursing flowsheet |
| DSP / professional | Support note / visit note | Workforce productivity |
| Provider | Provider update / caregiver observations | Auto-diagnosis |

## Gap vs previous freeze

Architecture green ≠ human experience win. Founder live use exposed person-intelligence and scheduling honesty gaps; this campaign closes the **operating experience** around person → documentation → continuity.
