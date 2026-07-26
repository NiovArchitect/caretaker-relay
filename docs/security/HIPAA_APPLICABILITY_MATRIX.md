# HIPAA Applicability Matrix — Caretaker Relay

**Date:** 2026-07-26  
**Internal classification:** **HIPAA-READY TECHNICAL AND OPERATIONAL CONTROLS**  
**Legal determination:** **EXTERNAL REQUIRED** before any “HIPAA compliant” claim.

## Deployment models

| Model | Likely HIPAA posture | Product implications |
|-------|----------------------|----------------------|
| A. Direct consumer app independent of CE | May be outside HIPAA; FTC HBNR / state laws still apply | Strong consumer privacy; no PHI access via role claim |
| B. Business associate to CE (provider, plan, agency) | HIPAA applies via BAA | BAAs, Security Rule safeguards, BA subcontractors |
| C. Professional acting independently | Case-by-case | Do not assume CE status |
| D. Hybrid consumer + org | Mixed | Segment environments; per-tenant contracts |
| E. White-label org-hosted | Org is typically CE or BA | Customer BAAs + config |
| F. Lab / demo / competition | Synthetic data preferred | Label lab; no compliance claim from demo shortcuts |

## Rule areas

| Area | Status | Notes |
|------|--------|-------|
| Privacy Rule (uses/disclosures) | Partial product model | Authorization paths required |
| Security Rule (administrative/physical/technical) | Partial implemented | Encrypt transit (TLS public); audit partial |
| Breach Notification | Process EXTERNAL | Needs runbooks + counsel |
| BAA with model providers | EXTERNAL | OpenAI/other — inventory required |
| Minimum necessary | Product enforced direction | Role + recipient scopes |
| Personal representative | Partial UX | Pending full legal authority capture |

## Honest claim language

Use: “HIPAA-ready technical and operational controls designed for regulated deployments.”  
Avoid: “HIPAA compliant” without signed BAAs, risk analysis, and legal sign-off.
