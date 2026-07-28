# Care data intake and destination contract

**Authority:** Public product behavior + care-domain executors  
**AI:** Fixture interpreter today; approved LLM may replace only the interpretation step later.

## Intake sources

### A. Relay natural language

| Kind | Roles | Scope | Evidence | Confirm | Executor | Destinations |
|------|-------|-------|----------|---------|----------|--------------|
| Question | any authorized | min necessary | retrieval | no write | answer engine | Relay thread only |
| Observation | caregiver/DSP/recipient* | observations | REPORTED | confirm if write | loop | Care, Today glance, handoff watch |
| Care update | caregiver/DSP | note/event | REPORTED | confirm | loop | Care timeline, handoff whatChanged |
| Action request | authorized | tasks/schedule | draft | confirm | loop / work-items | Open work, Today, notifications |
| Correction | authorized corrector | prior event | SUPERSEDE | confirm | correction path | Care history, handoff |
| Medication report | caregiver/DSP | meds | REPORTED | confirm | loop | Care meds, timeline, handoff |
| Plan-change report | caregiver | meds D | pending review | confirm | task + work-item | Care pending, Today, open work, handoff, notify |
| Schedule request | authorized | schedule B | draft | confirm | appointment candidates | Schedule, Today |
| Access request | requester | access | pending | confirm | access-request | Privacy, open work, notify |
| Invite | controlling | people A | pending | confirm | invitation | People, Privacy, notify |
| Document instruction | authorized | documents D | candidate | confirm | document ingest | Documents, proposals |

\* recipient path when self-report authorized.

### B. Structured UI input

Forms on Care, Schedule, People, Privacy, Documents — same authority rules as NL after confirm.

### C. Document intake

Text paste/upload → `ingestDocumentText` → proposals only → human confirm/reject → optional work/schedule.

### D. System events

Task transitions, schedule transitions, handoff ack, access decide, revoke — deterministic APIs.

### E. Future connectors

Calendar, SMS, EHR — **external** until implemented; never claimed as live.

## Missing-field behavior

1. State what was understood  
2. Preserve safe facts when present  
3. One focused clarification  
4. Never “I’m not sure what to file yet” without next step  

## Silent loss

**Prohibited.** Every input ends as: saved · routed · clarified · denied · cancelled · recoverably failed.

## Cross-references

- 50 categories: `CARETAKER_RELAY_50_ACTION_CONTRACT.md`  
- Surfaces: `CARE_EVENT_TO_SURFACE_ROUTING_REGISTRY.md`  
- Authority: `docs/architecture/CARE_INFORMATION_AUTHORITY_MATRIX.md`  
