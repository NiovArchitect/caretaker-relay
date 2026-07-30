# FINAL PRN MEDICATION CHARTING CONTRACT

## Research note (not universal law)

**PRN** (*pro re nata*) means **as needed** — not a fixed daily schedule. Charting best practice across many care settings separates:

1. the **authorized order** (what may be given, for what reason, how often);
2. the **administration or non-administration event** (what was done, by whom, when, why);
3. the **effectiveness / result** (whether it helped, adverse effects, follow-up).

Authoritative themes (setting-dependent):

- Right person, medication, dose, time, route, **reason**, and **documentation** (e.g. California DDS medication rights guidance).
- MAR-style records for PRN often require **reason given** and **result** (DDS MAR guidance themes).
- CMS medication-order expectations emphasize drug, strength, directions, prescriber/authorization — not free-form caregiver invention of orders.
- The Joint Commission and similar bodies publish setting-specific PRN documentation expectations; home-care, DSP, SNF, and family care differ.

Caretaker Relay therefore implements a **configurable PRN protocol engine**, not a single nationwide legal claim.

## Canonical objects

### PrnOrder (authorized instruction)

medication, strength, allowed dose, route, indication, min interval, max frequency, reassessment interval, authorized by, active dates, status.

### PrnEpisode (chart episode)

order link, symptom/reason, severity before, dose/route/time, actor, lifecycle, reassessment due/completed, effect, adverse reaction, follow-up, unauthorized flag.

## Safety invariants

- Never invent or recommend a dose.
- Never activate medication-plan changes from caregiver chat.
- Never treat OTC caregiver reports as authorized PRN orders.
- Interval violations block confirmed charting with plain language.
- Unauthorized reports remain REPORTED and flagged for review.

## Lifecycle (internal; UI shows human labels)

symptom → order match → clarification → eligible → awaiting confirmation → administered → reassessment due → effective / ineffective / adverse → completed / escalated.

## Surfaces

- **Relay:** ask inventory, preview charting, confirm, reassess, follow-up.
- **API:** `GET …/prn`, `POST …/prn/episodes`, `POST …/prn/episodes/reassess`.
- **Today / Attention / Handoff / MAR history:** consume `buildPrnProjection` (shared); Today must remain signal-first (open reassessments only).

## Lab seed

Evelyn Carter: Acetaminophen 500 mg PO PRN pain, min every 6h, reassess 60m, authorized by Dr. Priya Shah (synthetic).
