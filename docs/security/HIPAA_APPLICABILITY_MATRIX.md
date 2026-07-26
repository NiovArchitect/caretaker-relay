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

## Rule areas vs technical evidence

| Area | Technical status | Legal / ops status |
|------|------------------|--------------------|
| Privacy Rule (uses/disclosures) | Server deny-by-default membership; invitations + access requests | EXTERNAL: CE/BA determination |
| Security Rule technical | TLS public; JWT sessions; central authorize; audit rows | EXTERNAL: full risk analysis |
| Minimum necessary | Scope categories on relationships; field filtering helpers | Partial — expand field policy matrix |
| Personal representatives | Model placeholders; no legal authority proof capture | EXTERNAL + product completion |
| Audit controls | CareAuditRow + actions on access/auth | Partial — retention / review process EXTERNAL |
| Breach Notification | None operational | EXTERNAL process + counsel |
| BAA with model providers | Keys configured; no executed BAA evidenced here | EXTERNAL |
| Workforce / MFA / IdP | Lab passwords + password accounts | EXTERNAL production IdP |

## Honest claim language

Use: “HIPAA-ready technical and operational controls designed for regulated deployments.”  
Avoid: “HIPAA compliant” without signed BAAs, risk analysis, and legal sign-off.
