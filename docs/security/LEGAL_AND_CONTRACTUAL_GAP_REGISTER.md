# Legal and Contractual Gap Register

**Date:** 2026-07-26  
**Honesty rule:** No control listed as complete if evidence is only frontend or lab.

| ID | Gap | Type | Severity | Owner |
|----|-----|------|----------|-------|
| L-01 | CE vs BA vs consumer determination | Legal | Critical | Counsel |
| L-02 | Executed BAAs with AI vendors (Anthropic/OpenAI) | Contract | Critical | Legal/Procurement |
| L-03 | Hosting / DB subprocessors DPA/BAA | Contract | High | Legal/Ops |
| L-04 | State consumer health privacy (e.g. WA My Health My Data, CA) | Legal | High | Counsel |
| L-05 | Personal representative legal authority capture | Legal + product | High | Counsel + Eng |
| L-06 | Clinician credential verification | External process | High | Ops + partners |
| L-07 | DSP employer assignment verification | External process | High | Ops + agencies |
| L-08 | Breach notification runbooks | Ops + legal | High | Security lead |
| L-09 | Independent penetration test | External validation | High | Security |
| L-10 | Production IdP (OIDC) + MFA + recovery | Product + vendor | High | Eng |
| L-11 | SMTP/SMS for contact verification delivery | Vendor | Medium | Eng |
| L-12 | Formal HIPAA risk analysis (Security Rule) | Compliance | Critical | Counsel/CISO |
| L-13 | FTC HBNR applicability memo | Legal | Medium | Counsel |

## Technical gaps closed or reduced this pass

| ID | Item | Status |
|----|------|--------|
| T-01 | Server durable register (zero memberships) | Implemented |
| T-02 | Central `authorize()` contract | Implemented |
| T-03 | Access request / approve / deny API | Implemented |
| T-04 | Contact verification token lifecycle | Implemented (delivery EXTERNAL) |
| T-05 | Access matrix IDOR (who_can_see without membership) | Fixed |
| T-06 | Session logout API | Implemented (foundation sessions) |
