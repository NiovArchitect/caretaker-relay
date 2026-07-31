# FINAL DOCTOR FINDING REPRODUCTION

## Method

1. Local unit classification via `classifyRequestClass` (app)  
2. Local unit answers via `answerClinicalRetrieve` (foundation)  
3. Public live Relay bank: **blocked** without lab login (`lab_login_enabled: false`)  

## Retrieve bank (local classification) — PASS

| Prompt | requestClass | Must not be CARE_REPORT med path |
|--------|--------------|----------------------------------|
| last vitals | INFORMATION_QUERY | PASS |
| vital signs | INFORMATION_QUERY | PASS |
| orientation status | INFORMATION_QUERY | PASS |
| any therapies | INFORMATION_QUERY | PASS |
| surgeries | INFORMATION_QUERY | PASS |
| other comorbidities | INFORMATION_QUERY | PASS |
| ambulation or mobility status | INFORMATION_QUERY | PASS |
| Is the patient on oxygen? | INFORMATION_QUERY | PASS |
| What medications is she on? | INFORMATION_QUERY | PASS |
| I gave her metformin | CARE_REPORT | PASS (correct write path) |

## Answer templates (local, empty profile) — PASS

| Domain | Contains med-entry language? | Gap language? |
|--------|------------------------------|---------------|
| vitals | No | Yes |
| oxygen | No | Yes |
| surgeries | No | Yes |
| therapies | No | Yes |
| orientation | No | Yes |
| mobility | No | Yes |
| code_status | No | Yes |

## Public pre-deploy

Physician screenshots and prior session traces established public defect class:

> “I heard you, but I could not form a durable care item…”

for retrieve phrases. That path is the **onlyUncertain** care-update fallthrough in `App.tsx` when server returns empty extract — **reproduced by code path analysis** against public bundle era without clinical-retrieve short-circuit.

## I can help / claim

Defect class: raw message / JSON / `ALREADY_OWNED` exposed. Client humanization added in `claimCareWorkItem`. Public end-to-end claim not re-executed this session (auth blocked).

## Status

| Item | Status |
|------|--------|
| Local classification | PASS |
| Local answer templates | PASS |
| Public post-repair Relay bank | PENDING_DEPLOY + AUTH |
| I can help public E2E | PENDING_DEPLOY + AUTH |
