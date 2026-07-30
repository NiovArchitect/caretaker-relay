# FINAL CLINICAL AUTHORITY BOUNDARY

**Purpose:** Prevent AI, engineers, or software from being treated as clinical authority.

## Layer A — Software-verifiable safety

Testable in code/public runtime without a clinician:

- Correct recipient / tenant isolation  
- Active authorized order presence  
- Reported dose/route/reason/time fields  
- Interval comparison against recorded order  
- Actor identity and role permission  
- Idempotency of administration and reassessment  
- Reassessment creation and result capture  
- Correction lineage and audit  
- No dose invention language  

## Layer B — Configured organization policy

Organization-configurable; not universal law:

- Which roles assist vs administer vs reassess  
- Escalation windows and supervisor review  
- Setting-specific workflows  
- Late-entry and signature rules  

## Layer C — Qualified human authority

**Never automated as silent certainty:**

- Prescriber order creation/change  
- Pharmacist clinical review  
- Nursing delegation legality  
- Legal interpretation of jurisdiction  
- Clinical causation (“dizziness from lunch med”)  
- Patient-specific treatment decisions  

## Product rules

| Forbidden | Required |
|-----------|----------|
| AI presented as clinical authority | Human verification before charting |
| Software invents doses | Authorized order only |
| Universal compliance claims | Setting/jurisdiction limitations |
| Incomplete chart marked complete | Reason + result on PRN episode |

**AI OR SOFTWARE PRESENTED AS CLINICAL AUTHORITY: 0**
