# FINAL CLINICAL RETRIEVAL CONTRACT

**Authority:** Physician validation (DR1)  
**Ownership:** Server answer path is primary; client requestClass is defense-in-depth.

## Request class

Read-only clinical questions → `INFORMATION_QUERY` / server clinical retrieve domain.

Never: CARE_REPORT, medication extract, verify card, durable write claim.

## Domains

vitals, oxygen, surgeries, therapies, comorbidities/diagnoses, code_status, diet, devices, orientation, mobility, allergies (existing path), medications (complete answer path).

## Missing data

Domain-specific gap language + authorized next step. Never taken/refused/missed for pure retrieve.

## Gates

READ QUERY → CARE UPDATE: 0  
READ QUERY → MEDICATION CLARIFICATION: 0  
WRONG-DOMAIN MISSING-DATA: 0  
