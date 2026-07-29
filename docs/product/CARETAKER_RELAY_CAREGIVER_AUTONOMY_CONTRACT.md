# Caretaker Relay — Caregiver Autonomy Contract

## Purpose

Relay reduces manual coordination by turning conversation into authorized care records, work, notifications, handoffs, reviews, reminders, and escalation — while keeping consequential authority deterministic.

## Operating loop (every supported care need)

| Question | Owner |
|----------|--------|
| What happened? | Event / observation projection |
| Who reported it? | Source actor on durable event |
| When did it happen? | Event occurrence time (recipient-local) |
| Confirmed / reported / corrected / pending / disputed? | Epistemic + truth state |
| Does anyone need to act? | Canonical **attention groups** |
| Who is eligible? | Relationship roles + allowed actions |
| Who is currently responsible? | Work item owner |
| What is due? | Work due_at / schedule |
| Who was notified? | CareNotification rows |
| What if no response? | Escalation policy on attention group / work |
| What changed after an action? | Receipt + projection refresh |
| What should the next caregiver know? | Handoff still_needs / what_changed |
| Where is history? | Timeline / corrections / voided MARs |
| Can Relay answer later? | Conversation focus (principal×recipient) |

## Relay may autonomously

Retrieve, summarize, connect follow-ups, structure candidates, save non-consequential observations after confirm, create work, identify resolvers, route notifications, update projections, prepare handoffs, remind, escalate no-response work, surface unfinished work, explain changes.

## Relay requires deterministic authority / confirmation for

Medication-plan changes, clinical orders, access grants/revocation, external booking, consequential schedule mutation, document-derived care truth, clinical decisions, permission expansion.

## Attention badge

`badge_count === attention_groups.length` with **zero tolerance**, single server function `buildAttentionGroups`.

## Medication candidates

Display list and ordinal resolver share `buildOrderedMedicationCandidatesFromLines` / `orderedMedicationCandidates` on focus.
