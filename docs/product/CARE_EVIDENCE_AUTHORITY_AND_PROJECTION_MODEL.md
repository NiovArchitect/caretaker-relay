# Care evidence, authority, and projection model

## Evidence fields (every durable care fact)

| Field | Meaning |
|-------|---------|
| tenant / household | Isolation boundary |
| recipient | Care person bound at auth time |
| reporter | Actor person id + display name |
| reporter role | family / DSP / provider / recipient / system |
| event time | When it happened (may be approximate) |
| report time | When recorded |
| source | caregiver_text, document, system_derived, correction |
| epistemic status | REPORTED · CONFIRMED · UNCERTAIN · CONFLICTED · SUPERSEDED |
| authority status | reportable · draftable · review_required · fully_executable · unsupported |
| verification status | pending · verified · rejected |
| correction lineage | supersedes event id |
| uncertainty | free-text or structured flags |
| audit correlation | audit id(s) |

## Authority classes (do not flatten)

| Class | May become “active plan / membership / schedule truth”? |
|-------|--------------------------------------------------------|
| Caregiver-reported observation | No — REPORTED care fact |
| DSP-reported care event | Yes as report; not clinical order |
| Clinician-confirmed | Yes when role + flow support |
| Document-extracted candidate | **Never** until human confirm |
| Active authorized medication plan | Only authorized review path |
| Pending plan-change | Visible pending only; plan unchanged |
| Relay synthesis | Display only, not durable without confirm |
| External confirmation pending | Labeled pending |

## Projection destinations

| Destination | Purpose question |
|-------------|------------------|
| Today | What matters now? |
| Care | What is the current care picture? |
| Open work | Who owns what? |
| Schedule | What is happening when? |
| Notifications | What needs acknowledgment? |
| Handoff | What must the next caregiver know? |
| People / Privacy | Who is authorized? |
| Documents | What sources await review? |
| Relay retrieval | Can I answer from saved truth later? |

Receipts declare destinations; **screens and APIs must prove them**.

## Medication boundary

Caregiver chat **never** silently mutates active medication plan. Plan changes are D: pending verification + open work + handoff stillNeeds.  
