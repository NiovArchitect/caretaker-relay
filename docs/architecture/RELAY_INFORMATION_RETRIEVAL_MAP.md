# Relay Information Retrieval Map

| Question class | Primary sources | Notes |
|----------------|-----------------|-------|
| How is {person} doing? | Observations today, meds due, appointments, open loops, coverage | STATUS_SYNTHESIS |
| What changed? | Recent events, observations, handoff | CHANGE_SINCE |
| Medications | Schedules, administrations, discrepancies | MEDICATION_* |
| Appointments | Appointments, slots, leave-by | APPOINTMENT_* |
| Coverage / who next | Care coverage | CARE_COVERAGE |
| Profile / who is | Recipient profile | RECIPIENT_* |
| Provider said | Provider guidance, med authorizedBy | PROVIDER_* |
| Unresolved | Orchestration open loops | WAITING_ON |
| Verification status | Epistemic fields | VERIFICATION_STATUS |
| Handoff | Handoff records | HANDOFF_* |
| Documents | Care notes / documents API | DOCUMENT_PREP |
| Coordination | Human messages (not Relay AI) | separate surface |

Retrieval must respect **active recipient** and **role membership**. Never mix Robert into Evelyn answers without explicit switch.
