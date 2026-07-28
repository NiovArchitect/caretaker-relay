# Holistic End-to-End Closure Matrix

**Created:** 2026-07-28 (before product edits)  
**Public truth:** care.niovlabs.com + caretaker-relay-care-api.onrender.com  
**API runtime:** 1fb67d8 · **APP product:** 1274ce8  

## Selected Agency Agents (dynamic)

| Path | Role | Why | Gap | Repo | R/W | Deliverable | Timeout | Stop |
|------|------|-----|-----|------|-----|-------------|---------|------|
| specialized/agents-orchestrator.md | Integration control | Single controller | All | — | R | Sequencing | session | freeze gate |
| product/product-manager.md | Product sequencing | Care loop completeness | Ownership/schedule | both | R | Acceptance criteria | 30m | matrix done |
| specialized/specialized-workflow-architect.md | Workflow | Ack ≠ accept | Open work | API | R | State model | 30m | model coded |
| design/design-ux-architect.md | UX | Per-item actions | Open-work UI | APP | R→W | Inbox actions | 45m | UI smoke |
| design/design-persona-walkthrough.md | DSP/family walk | Judge experience | Whole-app | APP | R | Journey list | 30m | smoke |
| engineering/engineering-backend-architect.md | Backend | Seed work + proposals | API | API | W | Routes | 60m | unit+smoke |
| engineering/engineering-minimal-change-engineer.md | Minimal repair | No rewrite | All | both | W | Diffs | 60m | review |
| engineering/engineering-frontend-developer.md | UI wire | Work actions | APP | APP | W | Components | 60m | e2e |
| healthcare/healthcare-clinical-evidence-agent.md | Med safety | Correction truth | Meds | API | R | Labels | 20m | unsafe=0 |
| specialized/healthcare-aging-parent-care-companion.md | Family care | Continuity language | Relay | API | R | Copy | 20m | — |
| engineering/engineering-privacy-engineer.md | Privacy | Isolation | Authz | API | R | Denials | 20m | 0 leaks |
| security/security-appsec-engineer.md | AppSec | Task/schedule authz | API | R | Matrix | 20m | 0 unauth |
| testing/testing-reality-checker.md | Reality | Public only | All | — | R | Gates | session | freeze |
| testing/testing-evidence-collector.md | Evidence | Scorecard | All | APP docs | W | JSON/MD | session | freeze |
| testing/testing-accessibility-auditor.md | A11y | Mobile/keyboard/zoom | APP | R | Results | 45m | final SHA |
| engineering/engineering-code-reviewer.md | Review | Minimal diffs | both | R | Approve | 30m | APPROVED |

**Not selected:** sales, marketing, game, XR, paid-media (no evidence trigger).

---

## Gaps

### G1 Task acceptance
| Field | Value |
|-------|-------|
| Role | Incoming DSP |
| Recipient state | Handoff sent with unfinished transport |
| Existing API | `POST .../work-items/:id/claim` (status claimed) |
| Existing UI | Lists unfinished text; no Accept button |
| Missing | Explicit accept after handoff ack; preview; accepted≠completed |
| Present live | Handoff ack only; stillNeedsAttention strings |
| Expected | Accept responsibility → owner + accepted + audit |
| Care consequence | Work dropped if assumed “acked = mine” |
| Privacy | Owner visible only in relationship circle |
| Judge | HITL + workflow integration |
| ACL | Burden reduction; HITL |
| Evidence | Prior smoke: open-work PARTIAL |
| Severity | P0 |
| Agents | workflow, backend, frontend, UX |
| Repair | Seed work items from handoff; accept action; UI |
| Gate | Accept smoke PASS; ALREADY_OWNED on second claim |

### G2 Task decline
| Field | Value |
|-------|-------|
| Role | Incoming DSP |
| Existing API | transition → declined (filtered as terminal — wrong) |
| Missing | Decline keeps task open; reason; escalate path |
| Severity | P0 |
| Repair | decline clears owner → available_to_claim; notify |
| Gate | Declined item still listable as needs owner |

### G3 Unassigned preservation
| Field | Value |
|-------|-------|
| Present | stillNeedsAttention strings only |
| Expected | Work items unassigned until accept |
| Severity | P0 |
| Gate | After handoff ack without accept: needs_owner ≥1 |

### G4 Reassignment
| Field | Value |
|-------|-------|
| Existing | create with owner_person_id |
| Missing | UI reassign from handoff |
| Severity | P1 |
| Gate | POST create with new owner after decline |

### G5 Clarification
| Field | Value |
|-------|-------|
| Existing | handoff lifecycle correction_required |
| Missing | Per-work-item clarification note |
| Severity | P1 |
| Gate | blocked + blocking_reason |

### G6 Escalation
| Field | Value |
|-------|-------|
| Existing | escalate-overdue + escalate on handoff lifecycle |
| Severity | P1 |
| Gate | escalate-overdue returns escalated items |

### G7–G8 Schedule proposal + confirm
| Field | Value |
|-------|-------|
| Present | Handoff text “Therapy rescheduled” does not move appointment |
| Expected | Proposal row; confirm updates next appointment |
| Severity | P0 |
| Gate | OLD appointment as next = 0 after confirm |

### G9–G10 Correction fan-out / ack
| Field | Value |
|-------|-------|
| Present | Notifications correctionish; panel UI |
| Missing | Full two-browser re-proof on final SHA |
| Severity | P1 |
| Gate | Two-user smoke |

### G11 Isolated recipient
| Field | Value |
|-------|-------|
| Present | Shared cr-olivia |
| Expected | Brand-new recipient + 3 caregivers |
| Severity | P0 |
| Gate | Isolated three-shift smoke PASS |

### G12 Three-shift Relay evolution
| Field | Value |
|-------|-------|
| Present | API SMOKE_PASS static=0 on cr-olivia |
| Expected | Same on isolated + browser-visible |
| Severity | P0 |
| Gate | static_answers=0 |

### G13–G15 Mobile / keyboard / zoom
| Field | Value |
|-------|-------|
| Present | Prior PARTIAL |
| Expected | Final SHA re-smoke |
| Severity | P1 |

### G16 Repeated-event dedupe
| Field | Value |
|-------|-------|
| Present | handoffHash collapses identical content |
| Expected | Legitimate repeats with distinct times preserved; pure retries idempotent |
| Severity | P1 |
| Gate | Unique stage markers; retry no double side effect |

### G17 Whole-app founder smoke
| Field | Value |
|-------|-------|
| Severity | P0 |
| Gate | Agent Zero scorecard; freeze only if internal gaps=0 |

---

## Pre-edit rules

- No product code until this matrix exists (**satisfied**).  
- No silent assignment on handoff acknowledge.  
- No silent schedule mutation from handoff text alone.  
