# FINAL DURABLE EXECUTION BASELINE

Recorded: 2026-07-30T01:45:07Z

## Runtime

| Surface | SHA / value |
|---------|-------------|
| App HEAD | `18dd296ab8d060645ca08b5b26234f2161ca8f86` |
| App public deploy | `50bf16665101360f962fd36ea5d5071df3e5f7bf` (live) |
| App bundle | `assets/index-D7f2xzwb.js` |
| API HEAD | `43388e5a6a0631dc9d52ec40a0981957628dea93` |
| API public deploy | `43388e5a6a0631dc9d52ec40a0981957628dea93` (live) |
| API health | `{"ok": true, "product_id": "caretaker-relay", "durable": true, "store_backend": "prisma", "store_path": null, "foundatio` |
| Background workers | 0 |

## Contracts under test

- **Message preview:** client `requestClass` CARE_TEAM_MESSAGE
- **Message execute (client today):** `askCaregiverClarification` → POST `/api/v1/care/clarifications`
- **Message durable coordination API:** POST `/api/v1/care/recipients/:id/coordination` + notification
- **Appointment execute (client today):** POST `/api/v1/care/recipients/:id/schedule`
- **Appointment reschedule lineage:** POST `/api/v1/care/recipients/:id/appointments/reschedule`
- **No-response escalation:** POST `/api/v1/care/recipients/:id/notifications/escalate-no-response`

## Lab principals

- Marcus Carter: `p-sadeil` / sadeil-lab-password
- Maya Bennett: `p-maya` / maya-lab-password
- Evelyn Carter: `cr-olivia`

Do not edit product code before this baseline file exists (this file).
