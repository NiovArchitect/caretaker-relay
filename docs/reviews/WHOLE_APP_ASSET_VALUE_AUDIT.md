# Whole-app asset value audit (signal-first)

**Date:** 2026-07-29  
**Scope:** Authenticated caregiver surfaces for Evelyn Carter (Marcus).  
**Rule:** Keep only assets that answer a user question, enable action, communicate required state/risk, or provide necessary navigation.

| route | component | purpose | user value | duplication | actionability | current/history | mobile cost | decision | rationale | before | after |
|-------|-----------|---------|------------|-------------|---------------|-----------------|-------------|----------|-----------|--------|-------|
| / (Today) | today-hero | Recipient orientation | High | Low | Low | current | med | keep | Answers “who am I caring for today?” | 1 | 1 |
| / (Today) | accordion: needs attention | Open high-signal items | High | Med (vs Care open work) | High | current | high if flooded | collapse | Deduplicate smoke + semantic twins; cap list | many | ≤5 unique |
| / (Today) | accordion: wellbeing | Meals/mood/mobility | Med | Med | Med | mix | med | keep | Current period only after smoke filter | many | ≤3 themes |
| / (Today) | notifications strip | Unread care alerts | High | Low | High | current | med | keep | Real alerts only | n | n |
| Care | Active medications | Plan truth | High | Low | Med | current | low | keep | Plan only | 1 | 1 |
| Care | Pending medication changes | Plan verification | High | High (Allegra twins) | High | current | med | collapse | One semantic card for Allegra verification | 2+ | 1 |
| Care | CorrectionAwarenessPanel | Corrected records | High | **Critical** (smoke cards) | High | current | high | collapse | One current correction + history expand | 10+ | 1–2 |
| Care | MedicationCorrectionPanel | File correction | High | Low | High | action | med | keep | Real workflow | 1 | 1 |
| Care | Observation history | Past notes | Med | High (smoke) | Low | history | high | move | Behind “Review history”; filter smoke | many | collapsed |
| Relay | status synthesis | How is she today | High | was high | Low | current | med | keep | Exclusive plan: Right now / Needs / Coming up | multi-block | 1 plan |
| Relay | change dump | What changed | High | was identical to status | Low | period | med | keep | Only on change intents | always | on intent |
| Relay | previous shift | Last shift | High | was status clone | Low | prior | med | keep | Handoff + unfinished only | clone | distinct |
| Relay | meta | Am I getting same | High | n/a | Low | n/a | low | keep | Conversational; never care candidate | care-update | meta |
| People | circle list | Who helps | High | Low | Med | current | low | keep | Authorized helpers | n | n |
| Documents | care summary | Share prep | Med | Low | High | on demand | med | keep | Human confirm required | 1 | 1 |
| Privacy | access log | Who saw what | High | Low | Med | history | low | keep | Required trust | 1 | 1 |

## Product defects addressed this pass

1. Multi-intent answer concatenation (status + what-changed).
2. Previous-shift classified as current status.
3. Meta questions routed as care updates (client gate + intent).
4. Smoke correlation tags in human projections.
5. Duplicate Allegra verification + correction cards.

## Remaining gaps (honest)

- Full every-widget mobile census screenshots not re-shot post-deploy in this pass.
- Historical smoke events remain in durable store (by design); primary projections filter them.
- “Who is helping next” may still attach secondary identity intents; exclusive answer plan suppresses profile dump.
