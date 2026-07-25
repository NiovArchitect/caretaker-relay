# Caregiver Task-Time and Burden Evidence

**Mode:** Controlled product workflow measurement on public deploy
**Public URL:** https://care.niovlabs.com
**Generated:** 2026-07-25T02:33:36.827Z

## Important limitations

- Times are **controlled product tests**, not real-world population caregiver studies.
- Manual baselines are **structured workflow models** (reconstruct care continuity without Relay), not clinical research.
- Do **not** claim “saves X minutes in real life.” Use: *In controlled product testing…*
- No caregiver ranking, workforce analytics, or employee surveillance.
- Quality requires correct outcome **and** reduced friction.

## Summary table

| Workflow | Role | Relay ms | Relay steps | Baseline s | Baseline steps | Time saved ms | Steps saved | Quality |
|---|---|---:|---:|---:|---:|---:|---:|---|
| Primary family caregiver orientation | Primary family caregiver | 16769 | 4 | 180 | 14 | 163231 | 10 | PASS |
| Professional caregiver (DSP) orientation | Professional caregiver (DSP) | 15525 | 4 | 210 | 16 | 194475 | 12 | PASS |
| Natural care update (family) | Primary family caregiver | 14558 | 5 | 150 | 11 | 135442 | 6 | PASS |
| Prepare / review handoff | Primary family caregiver | 18677 | 3 | 200 | 12 | 181323 | 9 | PASS |
| Provider-facing summary | Primary family caregiver | 421 | 1 | 240 | 13 | 239579 | 12 | PASS |
| Schedule new appointment (lab slots) | Primary family caregiver | 293 | 3 | 180 | 10 | 179707 | 7 | PASS |
| Reschedule PT (honest workflow) | Primary family caregiver | 317 | 1 | 200 | 11 | 199683 | 10 | PASS |
| Clarification / multi-person continuity | Marcus + Maya | 23653 | 4 | 160 | 9 | 136347 | 5 | PASS |

**All outcomes correct:** YES
**Aggregate controlled time saved (sum of workflows):** 1429787 ms (~1430 s)
**Aggregate steps reduced:** 71

## Per-workflow detail

### Primary family caregiver orientation

- **Start:** Login gate (fresh session)
- **End:** Orientation + About visible with recipient context
- **Role:** Primary family caregiver
- **Recipient:** Evelyn Carter
- **Steps / interactions:** 4 (clicks≈3)
- **Questions asked:** 0
- **Corrections:** 0
- **Elapsed:** 16769 ms
- **Relay actions:** orientation card; coverage; About profile
- **Manual-style baseline:** 180s / 14 steps — Open multiple places: profile notes, med list, calendar, messages, last handoff text; re-read to assemble picture.
- **Controlled time saved:** 163231 ms (91% of baseline time)
- **Steps reduced:** 10 (71% of baseline steps)
- **Quality:** PASS (outcomeOk=true)

### Professional caregiver (DSP) orientation

- **Start:** Login gate (fresh session)
- **End:** Orientation + About visible with recipient context
- **Role:** Professional caregiver (DSP)
- **Recipient:** Evelyn Carter
- **Steps / interactions:** 4 (clicks≈3)
- **Questions asked:** 0
- **Corrections:** 0
- **Elapsed:** 15525 ms
- **Relay actions:** orientation card; coverage; About profile
- **Manual-style baseline:** 210s / 16 steps — Find responsibilities, last notes, meds, provider guidance, open concerns, next appointment across sources.
- **Controlled time saved:** 194475 ms (93% of baseline time)
- **Steps reduced:** 12 (75% of baseline steps)
- **Quality:** PASS (outcomeOk=true)

### Natural care update (family)

- **Start:** Logged-in Marcus; empty composer
- **End:** Verified care update / structured response
- **Role:** Primary family caregiver
- **Recipient:** Evelyn Carter
- **Steps / interactions:** 5 (clicks≈4)
- **Questions asked:** 0
- **Corrections:** 0
- **Elapsed:** 14558 ms
- **Relay actions:** understand; verify UI; confirm → care note path
- **Manual-style baseline:** 150s / 11 steps — Write free text in notes app, copy into message, separately update med log if needed, flag uncertainty manually.
- **Controlled time saved:** 135442 ms (90% of baseline time)
- **Steps reduced:** 6 (55% of baseline steps)
- **Quality:** PASS (outcomeOk=true)

### Prepare / review handoff

- **Start:** Logged-in Marcus on Today
- **End:** Handoff panel/content visible
- **Role:** Primary family caregiver
- **Recipient:** Evelyn Carter
- **Steps / interactions:** 3 (clicks≈2)
- **Questions asked:** 0
- **Corrections:** 0
- **Elapsed:** 18677 ms
- **Relay actions:** handoff projection from care truth
- **Manual-style baseline:** 200s / 12 steps — Re-scan day, write summary, send to next caregiver, confirm they received.
- **Controlled time saved:** 181323 ms (91% of baseline time)
- **Steps reduced:** 9 (75% of baseline steps)
- **Quality:** PASS (outcomeOk=true)

### Provider-facing summary

- **Start:** Authorized Marcus session
- **End:** Provider-ready answer returned
- **Role:** Primary family caregiver
- **Recipient:** Evelyn Carter
- **Steps / interactions:** 1 (clicks≈0)
- **Questions asked:** 1
- **Corrections:** 0
- **Elapsed:** 421 ms
- **Relay actions:** deterministic/provider-prep projection
- **Manual-style baseline:** 240s / 13 steps — Gather meds, observations, timeline, questions into one document by hand.
- **Controlled time saved:** 239579 ms (100% of baseline time)
- **Steps reduced:** 12 (92% of baseline steps)
- **Quality:** PASS (outcomeOk=true)

### Schedule new appointment (lab slots)

- **Start:** Natural schedule request
- **End:** Appointment request saved or idempotent
- **Role:** Primary family caregiver
- **Recipient:** Evelyn Carter
- **Steps / interactions:** 3 (clicks≈0)
- **Questions asked:** 3
- **Corrections:** 0
- **Elapsed:** 293 ms
- **Relay actions:** availability; draft; confirm book
- **Manual-style baseline:** 180s / 10 steps — Call/email clinic, wait, write time in personal calendar, notify circle.
- **Controlled time saved:** 179707 ms (100% of baseline time)
- **Steps reduced:** 7 (70% of baseline steps)
- **Quality:** PASS (outcomeOk=true)

### Reschedule PT (honest workflow)

- **Start:** Natural reschedule request
- **End:** Workflow + current apt shown
- **Role:** Primary family caregiver
- **Recipient:** Evelyn Carter
- **Steps / interactions:** 1 (clicks≈0)
- **Questions asked:** 1
- **Corrections:** 0
- **Elapsed:** 317 ms
- **Relay actions:** reschedule guidance; current truth
- **Manual-style baseline:** 200s / 11 steps — Contact clinic, update calendar, notify helpers, recompute leave time mentally.
- **Controlled time saved:** 199683 ms (100% of baseline time)
- **Steps reduced:** 10 (91% of baseline steps)
- **Quality:** PASS (outcomeOk=true)

### Clarification / multi-person continuity

- **Start:** Marcus needs confirmation of Maya involvement
- **End:** Maya can answer in own session; coverage known
- **Role:** Marcus + Maya
- **Recipient:** Evelyn Carter
- **Steps / interactions:** 4 (clicks≈0)
- **Questions asked:** 4
- **Corrections:** 0
- **Elapsed:** 23653 ms
- **Relay actions:** coverage; per-principal private Relay; answer
- **Manual-style baseline:** 160s / 9 steps — Text Maya, wait, re-read reply, re-enter into notes, tell Marcus manually.
- **Controlled time saved:** 136347 ms (85% of baseline time)
- **Steps reduced:** 5 (56% of baseline steps)
- **Quality:** PASS (outcomeOk=true)

## Net time saved (controlled)

NET TIME SAVED = sum(baseline_ms − relay_ms) across flagship workflows measured in this run.

**Result:** 1429787 ms controlled aggregate.

## ACL rubric mapping (evidence only)

| Criterion | How this evidence helps |
|---|---|
| Caregiver burden reduction | Fewer steps/time vs manual reconstruction baselines |
| Realistic usability | Public browser + API timed missions |
| User error reduction | Outcome correctness + zero corrections in measured paths |
| Human-in-the-loop | Care update path includes verify when consequential |
| Deployment readiness | Measured against live public product |
| Measurable impact | Transparent controlled metrics (not population claims) |
