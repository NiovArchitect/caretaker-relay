# Care Scheduling Orchestration

## HL7-informed layers (conceptual, not full EHR)

1. **Schedule / Slot** — free/busy availability (lab synthetic slots today)
2. **Appointment** — reserved event after confirmation
3. **Reminders / leave-by** — derived from **current** appointment start only

## Honesty rules

- Do **not** claim an external clinic booking completed without real provider integration or office confirmation.
- New appointment requests → offer available slots + draft confirmation.
- Reschedule → show current appointment + collect new time + verify before care-truth update.
- Leave-by labels must recompute from the appointment’s own start (no hardcoded 3:00 PM after a 4:30 PM change).
- Avoid duplicate appointment reminder noise for the same event.

## Multi-turn

Conversation memory holds scheduling intent; care truth updates only after explicit verification path.
