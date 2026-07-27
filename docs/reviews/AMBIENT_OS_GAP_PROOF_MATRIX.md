# Ambient OS Gap Proof Matrix — 2026-07-27

**Deployed before this pass:** APP `6b173fe` · API `f51a25b`  
**Public:** https://care.niovlabs.com · https://caretaker-relay-care-api.onrender.com

| # | Gap | Expected | UI route | API route | Public reproduction | Result | Severity | Judge impact | Completion gate |
|---|-----|----------|----------|-----------|---------------------|--------|----------|--------------|-----------------|
| 1 | Five-role browser journeys | Full interactive journeys | Login → Today/People | auth + projection + events | No dedicated e2e harness for 5 roles | **FAIL** | High | Cannot prove role OS to judges | 5/5 browser smokes PASS |
| 2 | Recipient privacy center | Human access control center | People / Access | `/recipients/:id/privacy` | GET privacy → **404** (access matrix partial 200) | **FAIL** | High | Dignity/control incomplete | Privacy center smoke PASS |
| 3 | DSP shift lifecycle | Assign/decline/cover/expire | Shift Today | `/shifts`, `/assignments` | GET shifts → **404** | **FAIL** | High | DSP aha journey blocked | DSP lifecycle smoke PASS |
| 4 | Clinician evidence summary | Dedicated clinical surface | Today clinical | `/clinical-summary` | GET clinical-summary → **404** | **FAIL** | High | Clinician demo incomplete | Clinical surface smoke PASS |
| 5 | PHI-safe invite preview | Pre/post auth preview | Login invite | `/invitations/:token/preview` | GET preview → **404** | **FAIL** | Critical | PHI risk / trust | Invalid invite 0 PHI |
| 6 | Conflict resolution UI | Visible conflict workflow | Today/Care | `/conflicts` | GET conflicts → **404** | **FAIL** | High | Med safety aha blocked | Conflict resolve smoke PASS |
| 7 | Three judge aha journeys | Polished deterministic demos | Full product | multi-route | No public scripted journey bank | **FAIL** | High | Demo readiness | 3/3 journeys PASS |
| 8 | Performance evidence | Cold/warm/mobile timings | All | health + pages | No formal perf report this pass | **PARTIAL** | Med | UX polish | Timings documented |
| 9 | ETL worker resilience | Retry/idempotent side effects | n/a | `/etl/outbox`, `/etl/health` | GET etl/* → **404** | **FAIL** | Med | Reliability claim | Outbox recovery smoke |
| 10 | Accessibility proof | Mobile/keyboard/zoom | New surfaces | n/a | No a11y evidence pack | **PARTIAL** | Med | Inclusion | a11y checklist smoke |

## Proven already (do not rewrite)

- Durable events, ETL ingest, projections, schedule, ICS, actions, zero-access signup
- `/access` matrix with last_access for controllers
- Role projection + Relay retrieval

## Repair policy

Reproduce → minimal implement → smoke → deploy exact SHAs.
