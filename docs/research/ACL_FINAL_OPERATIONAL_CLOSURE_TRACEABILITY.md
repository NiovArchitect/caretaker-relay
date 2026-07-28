# ACL Final Operational Closure Traceability

**Retrieval date:** 2026-07-28  
**Product:** Caretaker Relay (Track 1 caregiver AI; DSP workflow also maps to Track 2 operational integration)  
**Sources (authoritative only):**

| Source | URL |
|--------|-----|
| Track 1 Phase 1 judging criteria | https://acl.gov/caregiver-ai-judging-track1 |
| Track 2 Phase 1 judging criteria | https://acl.gov/caregiver-ai-judging-track2 |
| Caregiver AI Challenge overview / principles | https://acl.gov/caregiver-ai-challenge |
| Technology readiness guide (HITL / “I don’t know”) | https://acl.gov/caregiver-ai-tech-readiness-guide |
| Challenge definitions / FAQs | https://acl.gov/caregiver-ai-definitions-faq |

**Not claimed:** HIPAA certification, clinical device clearance, or formal ACL award status.  
Alignment below is **competition-principle mapping**, not regulatory certification.

---

## Judging principles → Caretaker Relay

### 1. Caregiver / direct-care burden reduction
| Field | Content |
|-------|---------|
| Official source | Track 1: support caregiver well-being and burden reduction; Challenge principles |
| Retrieval date | 2026-07-28 |
| Feature | Shift handoff inbox, explicit open-work claim, pre-shift briefing, Relay current-state answers |
| Browser journey | Sign in as DSP → My shift / Incoming handoff → ack info → accept one task → ask Relay “what remains unfinished?” |
| Evidence | Independent multi-shift smoke; product-surface + care-continuity Playwright |
| Remaining limitation | Full mobile offline capture not in scope |
| Judge-facing value | Less re-asking across shifts; unfinished work does not rely on memory alone |

### 2. Realistic workflow integration
| Field | Content |
|-------|---------|
| Official source | Track 1 Integration; Track 2 Integration into operational workflows |
| Retrieval date | 2026-07-28 |
| Feature | Observe → durable event → handoff → ack (info) → task accept/decline (work) → schedule proposal → confirm → correction fan-out |
| Browser journey | Three-shift continuity on isolated or lab recipient with live public API |
| Evidence | Holistic e2e smoke + public API work-item routes |
| Remaining limitation | External EHR/calendar connectors remain boundary-only |
| Judge-facing value | Mirrors real DSP shift change, not a demo chatbot |

### 3. Person-centered care
| Field | Content |
|-------|---------|
| Official source | Challenge Track 1 goal: safe, person-centered care at home |
| Retrieval date | 2026-07-28 |
| Feature | Recipient-scoped state; multi-recipient switch confirm; preferences when authorized |
| Browser journey | Family multi-recipient menu with confirm before switch |
| Evidence | product-surface multi-recipient e2e |
| Remaining limitation | Full preference taxonomy incomplete |
| Judge-facing value | Care truth stays about one person at a time |

### 4. Privacy, dignity, choice, recipient control
| Field | Content |
|-------|---------|
| Official source | Challenge AI principles / privacy posture; Track criteria on trust |
| Retrieval date | 2026-07-28 |
| Feature | Authz-before-retrieval; zero unauthorized answers; shared-device sign-out |
| Browser journey | Unauthorized / cross-tenant ask → denial without care content |
| Evidence | Public permission matrix + independent smoke zero_access / wrong_tenant |
| Remaining limitation | Not a formal HIPAA attestation |
| Judge-facing value | Wrong person never sees care content |

### 5. Human-in-the-loop review and correction
| Field | Content |
|-------|---------|
| Official source | Track 1 HITL accountability; Tech readiness HITL protocol |
| Retrieval date | 2026-07-28 |
| Feature | Med correction panel; correction awareness; schedule proposals require confirm; task accept not automatic |
| Browser journey | User B sees old report → User A corrects → User B sees awareness / acks |
| Evidence | Correction notifications + correction panel e2e |
| Remaining limitation | Same-tab multi-user browser video pack optional external polish |
| Judge-facing value | AI/Relay never silently rewrites consequential truth |

### 6. Transparency when evidence is weak
| Field | Content |
|-------|---------|
| Official source | Track 1: note when results based on weak data; tech readiness “I don’t know” |
| Retrieval date | 2026-07-28 |
| Feature | Caregiver-reported vs clinician-confirmed labels; no-data vs denied; handoff still-needs |
| Browser journey | Ask med administration after handoff-only note |
| Evidence | Med answers label “not clinician-confirmed” |
| Remaining limitation | Some older observation clusters still noisy on shared lab recipient |
| Judge-facing value | Uncertainty is visible, not smoothed away |

### 7. Flexible individualized care
| Field | Content |
|-------|---------|
| Official source | Challenge personalization / flexible care themes |
| Retrieval date | 2026-07-28 |
| Feature | Per-recipient shifts, open work, schedule proposals |
| Browser journey | Isolated recipient creation + three synthetic caregivers |
| Evidence | Holistic isolated-recipient smoke |
| Remaining limitation | I/DD & ADRD specialty packs are partial |
| Judge-facing value | Not one-size-fits-all template answers |

### 8. Safety and reliability
| Field | Content |
|-------|---------|
| Official source | Challenge safety / reliability principles |
| Retrieval date | 2026-07-28 |
| Feature | Atomic claim (ALREADY_OWNED); no silent task transfer on handoff ack; durable Prisma store |
| Browser journey | Two users claim same work item |
| Evidence | claimWorkItem ALREADY_OWNED |
| Remaining limitation | multi_instance_session_safe still false on Render health |
| Judge-facing value | Ownership cannot double-book silently |

### 9. Scheduling and transportation
| Field | Content |
|-------|---------|
| Official source | Challenge focus areas: processes, logistics |
| Retrieval date | 2026-07-28 |
| Feature | Open transport work items; governed schedule proposals from handoff language |
| Browser journey | Handoff “therapy rescheduled” → proposal → human confirm → next appointment updates |
| Evidence | schedule proposal API + Relay next appointment after confirm |
| Remaining limitation | Live clinic booking integration out of scope |
| Judge-facing value | Schedule text is not auto-truth |

### 10. Continuous communication
| Field | Content |
|-------|---------|
| Official source | Continuous person-centered coordination (challenge narrative) |
| Retrieval date | 2026-07-28 |
| Feature | Handoff lifecycle; notifications; Relay three-stage answers |
| Browser journey | Shift1 → Shift2 ack → Shift3 correction |
| Evidence | three distinct Relay answer sets (static_answers=0) |
| Remaining limitation | Push SMS/email not required for lab |
| Judge-facing value | Next shift inherits truth without hallway handoff only |

### 11. Accessibility and real conditions
| Field | Content |
|-------|---------|
| Official source | Usability criteria; usefulness for older adults / people with disabilities |
| Retrieval date | 2026-07-28 |
| Feature | Soft translucent UI; mobile account; keyboard targets; zoom re-smoke |
| Browser journey | 390 viewport account + shift; keyboard tab order; 200% zoom |
| Evidence | Holistic a11y smoke on final SHA |
| Remaining limitation | Formal axe suite still PARTIAL historically |
| Judge-facing value | Usable under fatigue and small screens |

### 12. Family caregiver and DSP experiences
| Field | Content |
|-------|---------|
| Official source | Track 1 family/friends/direct care; Track 2 workforce |
| Retrieval date | 2026-07-28 |
| Feature | Role-aware Relay; DSP shift workspace; family coordinator tools |
| Browser journey | Family creates shift; DSP accepts; family sees ownership |
| Evidence | care-continuity + product-surface e2e |
| Remaining limitation | Full agency payroll/workforce suite not productized |
| Judge-facing value | Both unpaid and paid helpers in one product loop |

### 13. I/DD and ADRD focus
| Field | Content |
|-------|---------|
| Official source | Challenge population focus (ACL community living) |
| Retrieval date | 2026-07-28 |
| Feature | Observation clusters; dementia watch when data exists; plain language |
| Browser journey | Mood/fatigue/mobility continuity questions |
| Evidence | Relay status synthesis from handoff + observations |
| Remaining limitation | Specialty clinical protocols not claimed |
| Judge-facing value | Everyday support language, not hospital EHR jargon |

### 14. Interoperability boundaries
| Field | Content |
|-------|---------|
| Official source | Tech readiness / challenge interoperability awareness |
| Retrieval date | 2026-07-28 |
| Feature | Durable events + export; synthetic facilities labeled; no fake clinic confirm |
| Browser journey | Appointment answers show public facility disclaimer where applicable |
| Evidence | Appointment answer provenance language |
| Remaining limitation | No production HL7/FHIR partner live |
| Judge-facing value | Honest about what is not integrated |

### 15. Supplement human connection (do not replace)
| Field | Content |
|-------|---------|
| Official source | Challenge: AI augments human judgment; HITL |
| Retrieval date | 2026-07-28 |
| Feature | Relay answers; humans accept work, confirm schedule, correct meds |
| Browser journey | Full care loop in mission statement |
| Evidence | Ack ≠ accept; proposal ≠ confirmed appointment |
| Remaining limitation | Voice companionship not primary product |
| Judge-facing value | Tool keeps people responsible for care |

---

## Runtime control snapshot (start of campaign)

| Item | Value |
|------|-------|
| APP git root | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay` |
| API git root | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation` |
| Branch | `checkpoint/caretaker-relay-track1-2026-07-22` |
| API HEAD / deploy | `1fb67d8` / live `1fb67d8` |
| APP product deploy | live `1274ce8` |
| APP repo HEAD | `e1b3606` (docs/e2e ahead of web product deploy) |
| API health | ok, prisma, multi_instance_session_safe=false |
| Public app | https://care.niovlabs.com HTTP 200 ~0.28s TTFB |
| Public API | https://caretaker-relay-care-api.onrender.com |

## Operational rules applied

- Evidence before claims; public runtime source of truth  
- PLAN → BUILD → QA → independent smoke  
- One integration controller (Agent Zero); one writer per repo  
- No silent schedule mutation; no silent task transfer on handoff ack  
- No unsupported HIPAA claim; no Neon/DATABASE_URL changes  
- Max three correction loops per domain; zero workers at phase boundaries  
