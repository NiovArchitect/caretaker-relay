# Minimum Necessary Policy — Complete Matrix (Product)

**Date:** 2026-07-26  
**Enforcement:** Server `resolveDomainCapabilities` + `projectRecipientProfile` / `projectCurrentState`  
**Legal note:** Operational control design — not a legal determination of HIPAA minimum necessary.

## Domains (22)

demographics_basic, demographics_sensitive, preferences_routines, daily_observations, meals_hydration, mobility, symptoms, appointments, schedules_coverage, medication_plan, medication_admin, clinical_documents, diagnoses, emergency_profile, behavioral_notes, communications, legal_representative, insurance, access_records, audit_history, exports, handoffs.

## Capabilities

view_daily_care, view_medication_plan, record_medication_admin, view_clinical_documents, view_emergency_profile, view_legal_authority, export_record, manage_access, view_audit, view_demographics_full, view_insurance.

## Role → default posture (product)

| Role | Default domains | Notes |
|------|-----------------|-------|
| Recipient (self) | All | Self-access |
| Primary family caregiver | Near-all via `*` seed | Controlling authority for invite/revoke |
| Family/friend | Daily, appointments, limited meds per scope | Scope modifiable by controller |
| DSP / paid caregiver | Daily, schedule, meds if in categories | No manage_access / export unless granted |
| Clinician | Clinical + care plan categories | Not care-circle admin by default |
| Org admin | Access records only unless assigned | No automatic clinical dump |
| Personal representative | EXTERNAL authority proof | Legal capture EXTERNAL |

## API enforcement surfaces

- `GET .../profile` — projected profile + meds gated  
- `GET .../state` — projected state + redacted_domains  
- `GET .../timeline` — events filtered; audit gated  
- `GET .../export` — requires export capability  

Client must not be the sole filter.
