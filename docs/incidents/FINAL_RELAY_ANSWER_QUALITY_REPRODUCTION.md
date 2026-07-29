# Final Relay answer quality — pre-edit reproduction

**Date:** 2026-07-29  
**App:** da11d8d · **API:** 30f9150  
**Principal:** Marcus · **Recipient:** Evelyn (`cr-olivia`)  
**Evidence:** `docs/incidents/evidence/final-intent-signal-before/SUMMARY.json`

## Gaps confirmed on public

| Prompt | Intent | Issue |
|--------|--------|-------|
| How is Evelyn today? | STATUS_SYNTHESIS | Templated “plain-language picture” blocks |
| How is she right now? | STATUS_SYNTHESIS | Identical to today (Jaccard 1.0) |
| Is anything urgent today? | UNKNOWN | Generic no-record fallback |
| How was the previous shift? | PREVIOUS_SHIFT | Only Allegra line — incomplete |
| What did Maya report… | UNKNOWN | No shift-scoped Maya answer |
| How did Evelyn feel yesterday? | CHANGE_SINCE | Same change wall as “today” |
| Is Allegra active? | UNKNOWN | No pending-change answer |
| What remains unfinished? | TASKS_REMAINING | Duplicate med-review confirmations |
| Make that shorter. | UNKNOWN | Not meta |
| That did not answer… | UNKNOWN | Not meta |
| Am I getting the same response? | META on `/answer` | `/understand` still `kind=verify` |

Jaccard today vs previous shift: **0.204** (good separation).  
Markers in answers: **0**.  
`/understand` meta: **verify** (not META short-circuit).
