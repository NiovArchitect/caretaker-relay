# Universal Relay action and signal gap matrix

**Date:** 2026-07-28  
**Runtime before this campaign:** app `14e3445` · API `ed46465` · understand_mode fixture  
**Constraint:** no Evelyn/Marcus/Tylenol-specific product logic in production paths

## Domains

| Domain | Existing | Gap | Target |
|--------|----------|-----|--------|
| Med administration | Partially hard-coded “lunch med” | Generic names, forms, PRN | Universal report as given |
| Med plan change | Tylenol-leaning regex | Any named/misspelled med | Pending verification task |
| Med refusal / missed | Weak / lunch-specific | Any med | Note/report not “given” |
| Med discontinued / dose change | Partial plan-change | Explicit discontinue/change | Pending verification |
| Med effect after dose | Observation only | Link to reported med without causation | Observation + optional link |
| Med supply / refill | None | Task for supply | Task |
| Dose advice request | Partial | Universal refusal of advice | Note + boundary |
| Meals / hydration / mood / sleep | Present | Keep | Reported observations |
| Mobility / toileting / pain | Partial | Expand soft observations | Observation |
| Appointments / transport | Present | Keep | Appointment change / task |
| Tasks / handoffs | Present | Intent → task | Task |
| Corrections | Present | Keep lineage | Correction |
| Helpers / privacy / documents | Present | Signal first | Existing surfaces |
| Fallbacks | Generic empty string | Personalized with extracted entities | Specific clarification |

## Medication intent model (required)

| Intent | Example phrasing (any med name) | Save as | Active plan |
|--------|----------------------------------|---------|-------------|
| taken | “She took {med}” | medication_administration | No |
| refused | “Wouldn’t take {med}” | note (refusal) | No |
| missed | “Missed the {med}” | note (missed) | No |
| uncertain admin | “I think someone gave {med}” | note UNCERTAIN | No |
| effect | “Dizzy after {med}” | observation (no causation claim) | No |
| plan add | “Add {med} 10mg” | task pending verification | No |
| discontinue | “Doctor stopped {med}” | task pending verification | No |
| dose change | “Change {med} to 5mg” | task pending verification | No |
| supply | “Almost out of {med}” | task | No |
| advice | “Should I give {med}?” | note (no advice) | No |

## Zero silent loss

Every consequential input → saved report | pending verification | action request | clarification draft | auth denial | cancel | visible error.

## Screen purposes (signal first)

| Screen | Purpose |
|--------|---------|
| Today | Attention + next + change (not full ledger) |
| Care | Plan + history + pending verification |
| People | Helpers / access |
| Relay | Interpret + act + explain |
| Handoff | Continuity for next shift |
| Notifications | Delivery / ack, not duplicate task dump |

## Completion gate for this campaign

- Universal med name extraction (not catalog-bound)  
- Refusal / missed / discontinue / supply / effect  
- Personalized fallback when entities present  
- No hard-coded recipient or drug in production extract path  
- Multi-profile synthetic utterance suite  
- Public understand smoke for novel med names  

## Agents selected

| Agent | Responsibility |
|-------|----------------|
| Agents Orchestrator | Integration control |
| Minimal-change engineer | Extend fixtureExtract |
| Medication safety | Authority boundaries |
| Content design | Personalized fallbacks |
| Frontend developer | Honest UX copy only if needed |
| Reality checker | Public API smoke |
