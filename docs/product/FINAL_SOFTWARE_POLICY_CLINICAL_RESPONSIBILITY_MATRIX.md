# SOFTWARE / POLICY / CLINICAL RESPONSIBILITY MATRIX

| Decision | Layer | Software may | Software must not |
|----------|-------|--------------|-------------------|
| Match active PRN order | A | Match by identity | Invent order |
| Record administration | A | Persist report + actor | Claim clinical necessity |
| Enforce interval | A | Block early re-dose | Override with advice |
| Reassessment due | A/B | Create one follow-up | Assign clinical diagnosis |
| Effectiveness result | A | Capture reported result | Assert medical outcome as truth |
| Role may administer | B | Enforce configured permission | Invent legal authority |
| Prescribe / change plan | C | Flag for review | Activate from chat |
| Causation | C | Decline | Answer as fact |
| Jurisdiction compliance claim | C | Disclaim | Claim certified MAR/eMAR/CMS/HIPAA |

DDS PRN reason+result informs Layer A charting fields in covered contexts only.  
CMS Part D LTC documentation informs order traceability concepts only.  
DailyMed/RxNorm inform identity only.  
ACL criteria inform product quality priorities, not clinical certification.
