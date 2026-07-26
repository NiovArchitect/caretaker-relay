# Role × Purpose × Data Domain Matrix

**Date:** 2026-07-26

Actions: view | create | update | confirm | correct | resolve | export | share | administer_access

Purposes (product): care_continuity | shift_handoff | clinical_review | access_admin | emergency | export_record | coordination

| Role | Purpose | Allowed domains (summary) |
|------|---------|---------------------------|
| primary_family | care_continuity | * |
| primary_family | access_admin | access_records, audit |
| family_friend | care_continuity | daily, appointments, optional meds |
| paid_dsp | shift_handoff | daily, schedules, meds if scoped |
| clinician | clinical_review | clinical, diagnoses, plan |
| recipient | self | * |
| org_admin | access_admin | access_records only by default |
| personal_rep | care_continuity | EXTERNAL authority then scoped |

Enforcement code: `packages/care-domain/src/services/minimum-necessary.ts`
