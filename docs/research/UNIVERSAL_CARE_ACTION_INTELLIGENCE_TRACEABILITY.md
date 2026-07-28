# Universal care action intelligence — research traceability

**Retrieval date:** 2026-07-28  

| Source class | Product requirement | Implementation consequence | Limitation |
|--------------|---------------------|----------------------------|------------|
| Caregiver documentation practice (HHS/ACL caregiver support framing) | Preserve what caregivers report without inventing clinical truth | Durable REPORTED / pending verification candidates | Not certification |
| Medication reconciliation concepts (clinical safety literature) | Separate administration reports from plan changes | Distinct eventType paths; no silent plan mutation | Not a full eMAR system |
| Human-in-the-loop AI (NIST AI RMF themes) | Model output is candidate only | Confirm before durable truth; audit chain | LLM may be fixture-mode |
| WCAG / inclusive design | Ordinary family caregiver language | No enums, run tags, or developer copy on product UI | Full a11y matrix separate |
| Person-centered care | Prefer reported wording; soft normalize only when confident | Keep “as reported” + optional possible normalized name | Misspellings may stay as reported |

Research does not equal legal or regulatory certification.
