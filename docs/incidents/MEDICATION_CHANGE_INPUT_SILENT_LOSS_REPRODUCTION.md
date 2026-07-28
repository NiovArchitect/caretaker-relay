# Medication-change input silent loss — reproduction

**Date:** 2026-07-28  
**Public understand (before fix):** FIXTURE extractor returned zero candidates  
**Persona:** Marcus Carter (`p-sadeil`) · Recipient: Evelyn Carter (`cr-olivia`)

## Input

```
Evelyn has a new medicine tylenol added for a fever. please add with dosage 300mg
```

## Before (public API `POST /api/v1/care/understand`)

```json
{
  "kind": "verify",
  "bundle": {
    "items": [{
      "label": "I heard you, but I'm not sure what to file yet. You can correct me.",
      "candidateId": "uncertainty"
    }],
    "understood": {
      "candidates": [],
      "medicationEvents": [],
      "tasks": []
    }
  }
}
```

Confirming produced care note: **“No confirmed care items in this update.”** /  
**“Caregiver-verified care record”** despite no durable medication candidate.

Active medication plan: unchanged (correct).  
Pending plan-change visibility: **none** (defect).  
Handoff / Today / next-shift awareness: **none** (defect).

## Required after

| Path | Behavior |
|------|----------|
| Plan-change report | Durable `task`: Medication change needs verification · NOT active order |
| Fever | Separate `observation` |
| Administration “I gave Tylenol…” | `medication_administration` report only |
| Recommendation “Should I give…” | Note: no dosing advice; no plan change |
| Active plan | Unchanged until authorized review |

## Evidence

`docs/incidents/evidence/medication-change-before/`  
`docs/testing/MEDICATION_BOTH_PATH_RESULTS.json` (post-fix)
