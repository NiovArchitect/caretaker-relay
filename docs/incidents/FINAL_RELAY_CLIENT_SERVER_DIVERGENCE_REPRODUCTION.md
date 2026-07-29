# FINAL RELAY CLIENT/SERVER DIVERGENCE REPRODUCTION

Recorded against API deploy `b6fa721571a0ade0a0d9c096067f3d11dfd13357` (pre-fc7af03 follow-up).
Principal: Marcus (`p-sadeil`) · Recipient Evelyn (`cr-olivia`).

## Method
- A: Public Relay UI (client request-class router + answer/action paths) — proven earlier campaign (95b5e687).
- B: Public API `/api/v1/care/answer` — this matrix.
- C: `/api/v1/care/understand` — verification-bundle path (not full action planner).

## Summary (API answer path, pre-fc7af03 fix)
- Questions: 15
- no_match answers: 1
- ISO total: 0
- raw ID total: 0
- tech-language total: 0

## Per-question (API /answer)

| # | Question | no_match | ISO | ID | Preview |
|---|----------|----------|-----|----|---------|
| 1 | How is Evelyn today? | False | 0 | 0 | Evelyn Carter's most recent report on file is caregiver reported: slept (last noted Saturday, July 25, 2026 at 12:06 PM  |
| 2 | What am I doing today? | False | 0 | 0 | Care updates recorded for Evelyn Carter today: • A fever observation was recorded. • Tylenol was reported as a proposed  |
| 3 | What is on my shift today? | False | 0 | 0 | Care updates recorded for Evelyn Carter today: • A fever observation was recorded. • Tylenol was reported as a proposed  |
| 4 | What happened during the last shift? | False | 0 | 0 | Daniel Kim covered Evelyn Carter before you from recently to recently. They completed or recorded: Medication administra |
| 5 | Send a message to May saying hello. | True | 0 | 0 | No matching reminder/coverage/message acknowledgment is on file for that ask. Check People for coverage and Today for op |
| 6 | Change Personal Training tomorrow to 2pm. | False | 0 | 0 | Draft confirmation (not booked yet):  Reply “confirm appointment request” to save this as a caregiver-requested appointm |
| 7 | Cancel that. | False | 0 | 0 | I don't have a matching record for that specific ask about Evelyn Carter.  I can help with status, medications, appointm |
| 8 | Start over. | False | 0 | 0 | I don't have a matching record for that specific ask about Evelyn Carter.  I can help with status, medications, appointm |
| 9 | Who worked before me? | False | 0 | 0 | Daniel Kim covered Evelyn Carter before you from Jul 27, 6:39 PM to Jul 27, 11:44 PM. Their handoff is seen. They left o |
| 10 | Who works after me? | False | 0 | 0 | Maya Bennett is listed as next coverage for Evelyn Carter, but an exact start time is not on file yet. |
| 11 | Ask Maya if transportation is confirmed. | False | 0 | 0 | Verification status for Evelyn Carter (from care truth, not a clinical judgment): • Medication instruction (Metformin 50 |
| 12 | Tell the next caregiver Evelyn refused lunch. | False | 0 | 0 | Maya Bennett is listed as next coverage for Evelyn Carter, but an exact start time is not on file yet. |
| 13 | Move physical therapy to 4:00 PM. | False | 0 | 0 | I can help reschedule — which appointment should I move for Evelyn Carter?  Current appointments on file are listed abov |
| 14 | What still needs my attention today? | False | 0 | 0 | Here's what is still open for Evelyn Carter:  Waiting on: Marcus Carter, Maya Bennett. • Handoff still needs attention:  |
| 15 | What did Daniel leave unfinished? | False | 0 | 0 | Here's what is still open for Evelyn Carter:  Waiting on: Marcus Carter, Maya Bennett. • Handoff still needs attention:  |

## Divergence findings

1. **Operating plan (Q2–Q3):** Intents included `TASKS_NOW` but `composeAnswer` early-returned on `CHANGES_TODAY` because exclusive plan listed both. Public UI client path answered shift work correctly; API showed care-update dump. **Fixed in fc7af03** (drop CHANGES_TODAY from exclusive plan).
2. **Message (Q5):** `/answer` is information-only → no_match. Client `requestClass` routes `OPERATIONAL_ACTION`/`CARE_TEAM_MESSAGE` to in-app preview. Server understand returns verification bundle, not message executor.
3. **Cancel/Start over (Q7–Q8):** Meta/cancellation not owned by `/answer`; client cancel dismisses pending cards.
4. **Tell next caregiver (Q12):** API matched NEXT_COVERAGE via `next caregiver` regex. **Fixed in fc7af03** (exclude tell/message/refused phrasing).
5. **Humanization:** ISO/ID/tech counts 0 on answer text after b6fa721 sanitizer.

## Required after fc7af03 live
- Re-probe Q2/Q3 → TASKS_NOW content (handoff open + coming up), not care-update dump.
- Re-probe Q12 → not pure next-coverage only.
- Public browser smoke of founder set.