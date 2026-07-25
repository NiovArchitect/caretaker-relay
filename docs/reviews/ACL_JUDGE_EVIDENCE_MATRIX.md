# ACL Track 1 Judge Evidence Matrix

**Product:** Caretaker Relay · https://care.niovlabs.com  
**Evidence date:** 2026-07-25  
**Controlled task-time source:** `docs/reviews/CAREGIVER_TASK_TIME_AND_BURDEN_EVIDENCE.md`

## Mapping (do not overstate)

| Criterion | Evidence artifact | Status |
|-----------|-------------------|--------|
| Caregiver burden reduction | Task-time evidence: 8/8 workflows faster, 71 steps reduced aggregate (controlled) | PASS |
| User error reduction | Outcome correctness + 0 corrections on measured paths; adversarial/protocol gates | PASS |
| Transparency | Source labels, allergy semantics, “not on file”, verify before truth | PASS |
| Human-in-the-loop | Verify panel + confirm → care note; no auto clinical diagnosis | PASS |
| Realistic usability | 60s orientation 20/20; public browser missions | PASS |
| Person-centered care | Profile/About, goals, preferences, coverage | PASS |
| Deployment readiness | Live public SHAs; monorepo green | PASS |
| Measurable impact | Controlled net time saved ~1430s aggregate across flagship workflows | PASS (controlled only) |
| Human connection | Coverage, handoff, multi-person clarification continuity | PASS |
| Safety / reliability | Protocol 9-Delta, red team 121/121, torture 105/105 | PASS |
| Live LLM synthesis | OpenAI quota | BLOCKED_EXTERNAL |

## Language for judges

Use: **“In controlled product testing on the public deployment…”**  
Do **not** claim population-level caregiver time savings without field validation.
