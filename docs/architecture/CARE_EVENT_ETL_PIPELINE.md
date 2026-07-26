# Authorized Care-Event ETL Pipeline

## Goal

One governed event system for caregiver reports, recipient reports, DSP documentation, clinician notes, appointments, medications, documents, and access changes — with full provenance.

## Canonical event (`src/lib/careEvent.ts`)

Required fields:

- `care_recipient_id` (authorized only)
- `type`
- `summary`
- `provenance.actor_principal_id`
- `provenance.authority_basis`
- `provenance.event_time` vs `report_time`
- `provenance.confidence` (`confirmed` | `reported` | `inferred` | `unknown`)
- optional `schedule_state`, `superseded_by`, `conflict_with`, lineage

## Authorization before ingest

1. Authenticated principal
2. Active membership (or provisional draft scope for draft-only writes)
3. Purpose + data-domain check (minimum necessary)
4. Audit write on success/deny

**Never** authorize by role claim, email similarity, shared browser, or fixture seed.

## Sources

| Source | Live | Planned |
|--------|------|---------|
| Caregiver / family reports (Relay) | Partial | Full |
| Recipient self-reports | Partial | Full |
| DSP shift documentation | Partial | Full |
| Clinician notes | Partial | Full |
| Appointments / schedule | Partial | Full |
| External calendar (Google/Apple) | No | EXTERNAL |
| Medication confirmation | Partial | Full |
| Documents | Partial | Full |
| Access / consent changes | Yes (API) | — |
| SMS / email delivery | No | EXTERNAL |

## Pipeline stages

```
ingest (authorized) → normalize → dedupe → conflict detect
  → current-state projection → timeline → notify (authorized)
  → Relay retrieval (role-scoped) → audit
```

## Schedule state machine

`proposed → requested → tentative → confirmed → completed | missed | cancelled`
Reschedule: `confirmed → rescheduled → confirmed` (new event_time; lineage parent).

## Consequential actions

Require human confirmation before execution (`CONSEQUENTIAL_ACTIONS` in `careEvent.ts`):

- notify helpers, reschedule, external book, medication plan change, revoke, export PHI, clinical escalate, shift handoff complete

## Corrections & conflicts

- Corrections create a new event with `superseded_by` on the prior
- Conflicts linked via `conflict_with[]`; UI shows both with confidence
- Never silently overwrite confirmed clinical data with reported observations

## Status

- **Client contract**: present
- **Server durable ETL tables / workers**: not fully shipped this release
- **No fake production seed ETL**
