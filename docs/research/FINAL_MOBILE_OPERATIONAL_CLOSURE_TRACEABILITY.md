# Final Mobile Operational Closure Traceability

**Retrieval date:** 2026-07-28  
**Runtime baseline before this campaign:** APP `584038b` · API `595906d`  
**Sources:** ACL Track 1/2 judging criteria; WCAG 2.2 (W3C); NIST SP 800-63 (identity posture); HHS/ACL caregiver AI principles.

| Requirement | Source | Product behavior | Proof | Limitation |
|-------------|--------|------------------|-------|------------|
| HITL accountability | ACL Track 1 | Accept/decline/reassign/escalate; schedule confirm | Final smoke | — |
| Burden reduction | ACL | Explicit ownership without hallway re-ask | Open-work UI | — |
| Workflow integration | Track 2 | Decline → reassign → accept | API+UI | Browser e2e optional |
| Weak-evidence transparency | Tech readiness | Caregiver-reported med labels | Relay med answers | — |
| Keyboard / touch | WCAG 2.2 | 44px targets; focus-visible | CSS + mobile product e2e | Full SR partial |
| Privacy isolation | ACL + product posture | Authz before answer | unauth 0 | No HIPAA claim |
| Mobile-first operations | Product judgment | Column actions &lt;480px; priority open work | global.css | Multi-viewport e2e partial |

No certification claimed from alignment alone.
