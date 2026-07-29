# P0 Relay canned / question-insensitive responses — reproduction

**Date:** 2026-07-29  
**Public API:** https://caretaker-relay-care-api.onrender.com  
**Public app:** https://care.niovlabs.com  
**Principal:** Marcus Carter (`p-sadeil`)  
**Recipient:** Evelyn Carter (`cr-olivia`)  
**API SHA at repro:** `146a934`  
**App deploy bundle at repro:** `index-BpKOS6ON.js`  

Evidence: `docs/incidents/evidence/p0-relay-canned-before/`

## Method

Authenticated HTTP `POST /api/v1/care/answer` and `POST /api/v1/care/understand` with Marcus JWT and `care_recipient_id=cr-olivia`. No product edits before this document.

## Results (public)

| Question | Primary intent | Defect |
|----------|----------------|--------|
| How is Evelyn today? | STATUS_SYNTHESIS + **CHANGE_SINCE** | Status block **and** “what changed” dump; Allegra duplicate; smoke tags `[AZms…]` `[HOLms…]` |
| How was the previous shift? | STATUS_SYNTHESIS + CHANGE_SINCE + OBSERVATION + HANDOFF | **Near-identical** to Q1 (Jaccard **0.92**); longer concatenation of all templates |
| What changed today? | CHANGE_SINCE | Smoke-run observation lines with tags |
| What happened yesterday? | CHANGE_SINCE | **Identical** answer to “what changed today” (1.00) |
| What medication does Evelyn take? | MEDICATION_CURRENT | PASS (plan only) |
| Was medication administered? | MEDICATION_ADMINISTRATION_HISTORY | PARTIAL — surfaces plan-change handoff, not admin truth |
| What remains unfinished? | **SAFETY_CONCERN** (wrong) | Flood of RESPONSE_RECEIVED / Open list IDs |
| Who is helping next? | **SAFETY_CONCERN** (wrong) | Partial care-team content mixed with wrong intent |
| Am I getting the same response? | UNKNOWN_QUESTION | Generic “no matching record”; **without `?` client gate fails** → falls through to understand/verify care path |
| Why did you repeat yourself? | UNKNOWN_QUESTION | Same generic as meta Q |

## Understand path (meta)

`Am I getting the same response?` → `kind: verify` with empty/no-extractable items (care-update path), not conversational meta.

## Similarity

- Q1 vs Q2: **0.92** (substantially identical canned bundle)
- Q3 vs Q4: **1.00**
- High-similarity pairs ≥0.45: **8**

## Root cause classes

1. Intent classifier forces `STATUS_SYNTHESIS` + `CHANGE_SINCE` together for “how is…”.
2. `composeAnswer` concatenates **every** matched intent block (not primary-only plan).
3. Previous-shift questions inherit status synthesis priority over handoff/shift scope.
4. Projection `RECENT_CHANGES` embeds smoke correlation tags in human strings.
5. Meta questions lack `META_CONVERSATION` intent; client question gate misses `am`/`why` without `?`.
6. Semantic duplicates (Allegra verification) not collapsed.
