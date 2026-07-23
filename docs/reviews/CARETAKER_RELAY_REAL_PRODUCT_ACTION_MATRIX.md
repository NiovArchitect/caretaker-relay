# Caretaker Relay — Real Product Action Matrix

**Date:** 2026-07-23  
**Supersedes:** prior “PASS” labels that described demo/static shells  
**Recruitment:** PAUSED  

Reality levels: **REAL** · **PARTIAL** · **SCRIPTED** · **STATIC** · **ABSENT** · **DEAD**

| CONTROL | EXPECTED BEHAVIOR | REALITY LEVEL | BACKEND ROUTE | PERSISTENCE | AUTH | TEST | STATUS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| App load / lab entry | Establish session for synthetic principal | PARTIAL (lab auto-login) | POST `/auth/login` | JWT session | foundation | unit + live smoke | Honest lab entry labeled in footer |
| Top: Caring for Evelyn | Persistent care recipient identity | REAL (display) | seed + login context | n/a | session | browser | PASS display |
| Session: Marcus · Family | Current user identity | REAL after login bind | login `display_name` | n/a | session | live smoke | PASS |
| Nav Today/Care/People/Documents | Switch surfaces | REAL | none | local | n/a | browser | PASS |
| **Tell Relay what happened** | Open Relay empty for natural language | REAL (no prefill) | none until Send | n/a | n/a | code audit | Fixed: was SCRIPTED |
| Relay Send | Understand multi-event update | REAL (fixture mode) | POST `/understand` | candidates | JWT | unit + API | PASS lab |
| Verify Confirm | Persist care truth + handoff | REAL | POST `/confirm` | Prisma | JWT | API smoke | PASS |
| Correct | Supersede prior fact | REAL | POST `/corrections` | Prisma | JWT | unit | PASS |
| Sample care update chip | — | **REMOVED** | — | — | — | — | Was SCRIPTED |
| Attention → Review | Open Care object (med path) | REAL navigation | GET `/state` | server | JWT | browser | Fixed: was SCRIPTED fill |
| Review latest handoff | Load latest **persisted** handoff | REAL | GET `/handoffs` | Prisma | JWT | live API | Fixed: no static fallback |
| Care medication open | Show schedule + source fields | REAL | GET `/state` | server | JWT | live API | Fixed: was STATIC |
| Care appointments / observations | Open real objects | REAL | GET `/state` | server | JWT | live API | Fixed |
| People list | Authorized membership | REAL | GET `/circle` | relationships | JWT | live API | Fixed: was static scenario |
| Invite caregiver | Full invite lifecycle | **ABSENT** | none | none | — | — | Honest: not shown as available |
| Messages mode | Human threads | **ABSENT** (honest shell) | none | none | — | — | Fixed: no fake chats |
| Documents Generate | Export from current truth | REAL | GET `/export` | export claim | JWT | live API | Fixed: no SEED_DOCS |
| Documents Share | External share | DEAD (disabled) | none | none | — | — | Honest disabled |
| Unauthorized access | Denied | REAL | any recipient route | n/a | 403 | API smoke | PASS |
| Track 2 workforce UI | Forbidden | ABSENT | — | — | — | — | PASS firewall |

## Counts (visible product chrome after reconstruction)

| Category | Count |
| --- | --- |
| Static/scripted **visible product** controls remaining | **1** (lab auto-login — intentional, labeled) |
| Fake/dead buttons still visible | **1** (Share disabled, labeled) |
| Removed scripted CTAs | Sample chip; attention→demo fill; Tell Relay→demo fill; SEED_DOCS list |

## Technical ID exceptions (never user-facing)

`cr-olivia`, `hh-olivia`, `p-sadeil`, `p-maya`, `p-walter`, `seedOlivia` flag.
