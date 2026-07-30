# FINAL RELAY STATIC ANSWER REPRODUCTION

Recorded against public API `3de0729` / app `646fc48` / bundle `index-CyXIpp0Y.js`.

## Method
Marcus (`p-sadeil`) → Evelyn (`cr-olivia`), 60 questions across 14 families via `/api/v1/care/answer`.

## Findings
- **147 identical cross-family answer pairs** (same fingerprint).
- **162 high-overlap pairs** (Jaccard ≥0.55 or bigram ≥0.45).
- Dominant failure: **UNKNOWN_QUESTION** identical generic fallback for message status, escalation, many handoff/shift paraphrases.
- Operating-plan vs unfinished/status collapse when intents miss exclusive plan.
- “When do we need to leave?” misrouted to medication administration history.
- “What should I add before sending?” misrouted to medication administration history.

Evidence: `docs/testing/FINAL_RELAY_STATIC_ANSWER_BEFORE.json`
