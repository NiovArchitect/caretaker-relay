# Relay action execution — founder failure reproduction

**Date:** 2026-07-29  
**Before deploy:** generic no-match, Meal misroutes, raw ISO times, no cancel  
**After deploy:** `95b5e687` / `index-C6YYw37E.js`

## Founder turns (after repair — public UI)

| # | Utterance | Result |
|---|-----------|--------|
| 1 | How is Evelyn today? | Status from care reports (not meal) |
| 2 | what am I doing today? | Operating plan from priorities/projections |
| 3 | What happened during the last shift? | Daniel Kim prior coverage, human times (no ISO) |
| 4 | What is on my shift today? | Current coverage plan |
| 5 | Send a message to May saying hello. | In-app message preview → Maya Bennett (not Meal) |
| 6 | Change meeting time to 2pm for Personal Training tomorrow. | Internal schedule update preview (not Meal/med) |
| 7 | Cancel that | Draft cancelled; nothing executed |

Evidence: `docs/testing/RELAY_FOUNDER_EXACT_FAILURES_AFTER.json`, screenshots `docs/incidents/evidence/relay-action-execution-after/`
