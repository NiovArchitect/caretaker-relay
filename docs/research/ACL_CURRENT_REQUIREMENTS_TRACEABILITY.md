# ACL Caregiver AI Challenge — Requirements Traceability

**Retrieval date:** 2026-07-26  
**Primary official sources:**
- https://acl.gov/caregiver-ai-challenge
- https://acl.gov/caregiver-ai-judging-track1
- https://acl.gov/caregiver-ai-definitions-faq
- https://acl.gov/caregiver-ai-application-outline
- https://acl.gov/caregiver-ai-tech-readiness-guide

Judges evaluate Track 1 applications against published ACL criteria (AI, usability, caregiving, home-based care). This matrix maps **official themes** (not invented criteria) to product behavior.

| Official theme / criterion | Product behavior | Role journey | Evidence | Complete? | Gap | Implementation decision | External dependency |
|----------------------------|------------------|--------------|----------|-----------|-----|-------------------------|---------------------|
| Caregiver burden reduction | Understand → verify → confirm loop; Today priorities; reminders; handoffs | Family / DSP | Ambient OS unit 11/11; live Today | PARTIAL→stronger | Full field validation | Complete bounded loop not full EHR | None |
| Usefulness for family caregivers | Family projection: appointments, transport, meals, mood, who helps next | Family/friend | Role projection API | PARTIAL | Field pilots | Server role projection | None |
| Support for DSPs | Shift projection, shift observation ingest, handoff action | DSP | ambient-care-os DSP tests | PARTIAL | Org assignment admin | Assignment-scoped data only | Org HR systems EXTERNAL |
| Care-recipient dignity & choice | Recipient claim path; privacy helpers list; consent/access revoke paths | Receiving care | Prior consent + projection.privacy | PARTIAL | Full privacy center UI | Self-control language + access APIs | Legal rep EXTERNAL |
| Collaboration | Coordination messages; notify_helpers action; coverage | All authorized | Notifications + actions | PARTIAL | SMS/email | In-app first | SMS/email EXTERNAL |
| Safety | Adversarial guard; med discrepancy; consequential confirm | All | Prior safety tests | PARTIAL | Clinical CDSS out of scope | No autonomous diagnosis | None |
| Privacy | Claim-only zero access; authorize; min-necessary projection | All | P0 + register smoke | PASS core | BAA ops | Server authz authority | BAA vendors |
| Transparency | Provenance event/report time; reported vs confirmed | Clinician / family | CareEvent ETL fields | PARTIAL | Full UI dual timestamps | Dual timestamps in events | None |
| Trustworthy AI | Verify before persist; role-aware retrieval; no broad dump | Relay | relay-answer roleAwareRelayState | PARTIAL | Eval harness depth | Human-in-loop | LLM vendor BAA |
| Accessibility | Existing a11y work; recipient communication prefs | Recipient | Prior docs | PARTIAL | Full WCAG audit this pass | Preserve prefs domains | None |
| Realistic implementation | Internal schedule + .ics; OAuth honest unavailable; no fake booking | All | calendarOAuthStatus EXTERNAL | PASS honesty | Live Google OAuth | One provider only if configured | Google OAuth optional |
| Population needs (ADRD, aging, I/DD framing) | Dementia watch projections; DSP notes; family framing | Family/DSP | Prior projections | PARTIAL | Specialized protocols | Framing not clinical claims | None |
| Scalability | Multi-tenant isolation tests; org notes | Org DSP | multi-tenant tests | PARTIAL | Agency admin product | Isolation preserved | None |
| Evidence / TRL | Live public product; unit/integration; deploy SHAs | Judges | care.niovlabs.com | PARTIAL | Smart-40 logs | TRL-oriented smoke | None |
| Aha moments | 1) Today orientation 2) Verify-confirm 3) Role briefing + handoff | Family/DSP | Product flows | PARTIAL | Polished judge script | Three journeys wired via APIs | None |
| Limitations honesty | External booking 501; OAuth unavailable message; no HIPAA-compliant claim | All | code paths | PASS | — | Never fake | Multiple EXTERNAL |

## Demonstration loop (competition-bounded)

1. Authorized multi-role ingest → `POST .../events`  
2. Provenance (actor, role, event/report time, authority)  
3. Timeline → `GET .../events`  
4. Current state → `GET .../state` + `GET .../projection`  
5. Role-aware Relay → `POST .../answer` (filtered state)  
6. Task/reminder/schedule side effects from ETL  
7. Notify authorized helpers  
8. Consequential propose → confirm → `.../actions`  
9. Internal schedule or `.ics` (OAuth only if configured)  
10. Verify outcome in state/timeline  
11. DSP handoff action  
12. Recipient privacy/helpers visibility  
13. Audit rows on ingest/actions  

## Non-claims

- Not a complete EHR  
- Not HIPAA-certified by this document  
- Not a national booking network  
- Not autonomous clinical decision support  
