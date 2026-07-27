# FINAL HARMONIZATION CLOSURE MATRIX

**Date:** 2026-07-27  
**Mode:** Prove first → reconcile → minimal repair → public browser → deploy exact SHAs  
**Baseline live:** APP `5101f53` · API `8aff0b8`  
**Do not reopen:** ownership/claim, since-last-visit, recipient-context 409, notification-ops labels, calendar truth, emergency card API, fast login (without reproduced defect)

## Governing instructions read

| Source | Path |
|---|---|
| Agency | `/Users/genghishameha/agency-agents/README.md` |
| Agency | `/Users/genghishameha/agency-agents/strategy/QUICKSTART.md` |
| Agency | `/Users/genghishameha/agency-agents/strategy/EXECUTIVE-BRIEF.md` |
| Agency | `/Users/genghishameha/agency-agents/strategy/nexus-strategy.md` |
| Agency | `/Users/genghishameha/agency-agents/specialized/agents-orchestrator.md` |
| Agent Zero | `/Users/genghishameha/dev/NIOV Labs/github/AGENT-ZERO/AGENTS.md` |
| Agent Zero | `/Users/genghishameha/dev/NIOV Labs/github/AGENT-ZERO/README.md` |

**Rules applied:** evidence before claims; reproduce before repair; PLAN→BUILD→QA; one writer/repo; max 3 correction loops/domain; no fake external delivery; no HIPAA-compliance claim; no broad rewrite of proven systems; no indefinite polling; zero workers at phase boundaries.

## Repo snapshot (pre-edit)

| Item | Value |
|---|---|
| API root | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation` |
| API branch | `checkpoint/caretaker-relay-track1-2026-07-22` |
| API HEAD | `8aff0b80d9feeaeac21484d26724ecca763297c1` |
| APP root | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay` |
| APP branch | `checkpoint/caretaker-relay-track1-2026-07-22` |
| APP HEAD | `a209f77be67cc8c2f2b2335183501771345ed803` (docs after `5101f53` deploy) |
| Deployed API | `8aff0b8` live |
| Deployed APP | `5101f53` live |
| Public health | OK durable prisma |
| Migrations | none planned (CareUpdate-encoded models) |

## Selected Agency Agents

| Agent path | Role | Gap | Auth | Artifact | Timeout | Stop |
|---|---|---|---|---|---|---|
| `engineering/engineering-backend-architect.md` | API design | handoff/escalation/recurrence | R | service design | 20m | routes sketched |
| `engineering/engineering-frontend-developer.md` | UI | logout/handoff/offline | R | surface map | 20m | diffs planned |
| `engineering/engineering-identity-access-engineer.md` | session IAM | shared-device | R | logout multi-tab | 15m | wipe complete |
| `engineering/engineering-privacy-engineer.md` | privacy | leave/rep authority | R | revoke/leave | 15m | no overclaim |
| `security/security-appsec-engineer.md` | AppSec | shared-device/adversarial | R | disclosure count | 15m | zero PHI leak |
| `healthcare/healthcare-clinical-evidence-agent.md` | evidence language | correction/labels | R | labeling rules | 10m | no diagnosis claims |
| `testing/testing-evidence-collector.md` | evidence | all | R | browser JSON | 30m | suite green |
| `testing/testing-reality-checker.md` | reality | deploy parity | R | gate | 15m | parity YES/NO |
| `testing/testing-accessibility-auditor.md` | a11y | mobile/keyboard/zoom | R | a11y notes | 15m | basic pass |
| `engineering/engineering-minimal-change-engineer.md` | minimal | all repairs | R/W guide | patch set | 30m | no rewrite |
| `engineering/engineering-code-reviewer.md` | review | final | R | APPROVED/REJECTED | 15m | ship gate |
| `engineering/engineering-sre.md` | deploy | SHAs | R | deploy IDs | 20m | live+parity |
| `design/design-ux-architect.md` | UX | acting-for / handoff | R | copy | 10m | restrained UI |
| `product/product-manager.md` | scope | freeze boundaries | R | gap list | 10m | no scope creep |

Agent Zero is process lead / integration controller / release gatekeeper (this session).

## Gap matrix

| # | Gap | Expected browser | Current browser | Current API | Data model | Public repro | Status | Sev | Repair | Closure gate |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Shared-device / account switch | Logout revokes server session; wipe all client caches; no PHI after new account | Client wipe partial; **server logout not called**; handoff/runtime caches may linger | Logout denylist exists | session denylist + shared revocation | Need browser A→B | **FAIL→repair** | P0 | App + API already | Logout calls API; full clearSession; multi-tab storage event |
| 2 | Multi-tab | Other tabs lose access on logout | No BroadcastChannel | Server revoke on next request | denylist | Need multi-tab e2e | **FAIL→repair** | P0 | App | `cr-session` storage event |
| 3 | Multi-recipient | Always “acting for X”; zero wrong recipient | Switch remount + work confirm; no global acting-for banner on Relay | context assert on work | rid() | Partial | **PARTIAL→repair** | P1 | App | Acting-for banner + Relay ambiguous clarify |
| 4 | Cross-role handoff E2E | draft→sent→ack→complete | Always “prepared”; no ack | projection hardcodes pending | CareHandoff no status | FAIL lifecycle | **FAIL→repair** | P0 | API+App | Handoff lifecycle CareUpdate + UI ack |
| 5 | Shift-end / no-replacement | boundary blocks silent expire; escalate | DSP routes exist; boundary not UI-wired | PASS domain | ShiftAssignment | Partial | **PARTIAL→repair** | P1 | API+App | Expire uses boundary; escalate path |
| 6 | Notification lifecycle | full delivered/seen/ack/declined/escalated | seen/ack/resolve UI partial | markSeen/Ack/Resolved | CareNotification | Partial | **PARTIAL→repair** | P1 | API+App | decline + escalate action + plain status |
| 7 | No-response escalation | deadline + alternate owner | ops labels only | escalate window label | ops | Partial | **PARTIAL→repair** | P1 | API | `escalateNoResponse` creates work + notify alt |
| 8 | Correction propagation | viewers notified; superseded not current | correction works; no notify | applyCorrection no notify | Correction | Partial | **FAIL→repair** | P0 | API | notify circle + CORRECTION type |
| 9 | Evidence labels | every statement labeled | since-last-visit badges | labels helper | epistemic | Partial | **PARTIAL→repair** | P2 | App | surface on handoff/Relay lines |
| 10 | Recurrence | series + exception + preview | rule field unused | recurrenceRule stored only | Appointment | FAIL expand | **FAIL→repair** | P1 | API | rule + exception + skip occurrence |
| 11 | Document-to-action | upload→extract→confirm→work | export only; text note extract | documents service no routes | document prepare | FAIL public | **FAIL→repair** | P1 | API+App | paste doc → propose actions → confirm |
| 12 | Offline/sync | pending queue + retry | online label only | N/A | none | Partial | **PARTIAL→repair** | P1 | App | outbox queue + failed retry |
| 13 | Emergency permissions | capability + audit UI | profile snapshot; API unused | emergency-card + audit | profile | Partial | **PARTIAL→repair** | P1 | App | wire emergency-card; show audit note |
| 14 | Representative authority | scoped rep without legal overclaim | privacy categories | privacy center | relationships | Partial | **PARTIAL→repair** | P2 | API+App | rep scope note + time-bound display |
| 15 | Leaving/removal | self-leave + revoke | revoke manager only | revoke | relationship | Partial | **FAIL→repair** | P1 | API+App | leave-self route + UI |
| 16 | Archive/closure | soft archive space | export only | export | none | Partial | **PARTIAL→repair** | P2 | API+App | archive CareUpdate flag |
| 17 | Flagship continuous | one Playwright journey | split suites | OK | — | Partial | **FAIL→repair** | P0 | e2e | single continuous flagship |
| 18 | Adversarial bank | isolation browser | thin unauth | 401/403 | — | Partial | **PARTIAL→repair** | P0 | e2e | bank coverage |
| 19 | Mobile/keyboard/zoom/a11y | pass surfaces | testids dense | — | — | Partial | **PARTIAL→repair** | P2 | e2e | viewport + tab order smoke |

## Proof sources

- Explore subagents on foundation + app (read-only, 2026-07-27)
- Prior live proof: work claim, 409 mismatch, 401 unauth, harmonized 4/4
- Code cites: `shared-session-revocation.ts`, `care-work-items.ts`, `harmonized-ops.ts`, `dsp-assignment.ts`, `notifications.ts`, `loop.ts` applyCorrection, `documents.ts`, `App.tsx` signOut, `TodayPage.tsx`, `HandoffPanel.tsx`

## Reconciliation decision

Proceed to **minimal product repairs** only for FAIL and high-severity PARTIAL rows above. Do not rewrite ownership, since-last-visit, calendar truth, flush/login, or privacy center core.

**Background workers after this phase:** 0 (explore agents completed).
