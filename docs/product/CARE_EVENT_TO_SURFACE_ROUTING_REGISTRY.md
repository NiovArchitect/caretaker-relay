# Care event → surface routing registry

| Event / action | Care | Today | Open work | Schedule | Handoff | Notifications | Relay |
|----------------|------|-------|-----------|----------|---------|---------------|-------|
| medication_administration | history | if due window | — | — | whatChanged | if discrepancy | Q&A |
| med refusal / missed | history | Needs attention | optional task | — | stillNeeds | optional | Q&A |
| med plan change / discontinue | **pending** (not active plan) | Needs attention | task | — | stillNeeds | reviewer | Q&A |
| med supply | — | Needs attention | task | — | stillNeeds | helpers | Q&A |
| effect after med | observations | if urgent | — | — | watch | if escalate | Q&A |
| observation (fever/pain/…) | observations | if attention | — | — | watch | if policy | Q&A |
| meal | meals | glance | — | — | whatChanged | — | Q&A |
| appointment_* | — | if next | if transport | **primary** | whatChanged | — | Q&A |
| work_item * | — | ownership | **primary** | if linked | stillNeeds | assignee | Q&A |
| handoff | — | since last visit | — | — | **primary** | recipient | Q&A |
| access request | — | — | — | — | — | reviewer | limited |
| document candidate | after review only | — | — | — | optional | reviewer | after review |

Destinations must have a reason; not every event hits every screen.
