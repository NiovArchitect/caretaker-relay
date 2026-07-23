# Control → Reality Matrix

GENERATED_AT: 2026-07-23 (export package)
BASED ON: source inspection of caretaker-relay HEAD at package creation + prior live smoke notes
DEPLOYED SHA CLAIMED: 2858c2a

Reality levels: L0 STATIC DISPLAY · L1 LOCAL UI ONLY · L2 SERVER CONNECTED · L3 DURABLY PERSISTED · L4 MULTI-USER AUTHORIZED E2E · L5 EXTERNAL DELIVERY

| SCREEN | CONTROL | USER EXPECTATION | FRONTEND HANDLER | API | SERVER HANDLER | PERSISTENCE | AUTH | LEVEL | REALITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Shell | App load | Sign in | auto `careLabLogin(p-sadeil)` | POST `/auth/login` | care.routes login | JWT session | foundation | L2–L3 | PARTIAL (lab auto-login) | Honest lab entry |
| Shell | Care recipient chip | Who am I helping | local `careRecipient` display | seed + API state | scenario seed | n/a | session | L0–L2 | REAL display | Evelyn shown |
| Shell | Session label | Who am I | `getSessionIdentity` after login | login response | auth | n/a | JWT | L2 | REAL | Marcus |
| Shell | SideNav tabs | Navigate | `setTab` | none | none | local | n/a | L1 | REAL | OK |
| Today | Tell Relay what happened | Open NL entry | `openRelayForCareUpdate` empty draft | none until send | — | — | — | L1 | REAL (no prefill) | Fixed vs prior SCRIPTED |
| Today | Review latest handoff | Show continuity | `openLatestHandoff` → `fetchLatestHandoff` | GET `/handoffs` | care.routes | Prisma | JWT | L3–L4* | REAL fetch | *receive as other user not UI-switched |
| Today | Attention Open medication | Care object | `onReviewAttention` → Care tab | GET `/state` | care.routes | server | JWT | L2–L3 | REAL nav | Not prompt fill |
| Today | Attention cards list | Sparse needs me | `fetchTodayProjection` | GET `/today` | care.routes | server | JWT | L2–L3 | PARTIAL | Noise/dedupe still limited |
| Relay | Composer Send | Organize update | `proposeCareUpdate` | POST `/understand` | care.routes | candidates | JWT | L2 | REAL (fixture mode) | Not live LLM |
| Relay | Confirm | Persist truth | `confirmCareUpdateAsync` | POST `/confirm` | care.routes | Prisma + handoff | JWT | L3 | REAL | Lab path |
| Relay | Correct | Supersede | `applyCareCorrection` | POST `/corrections` | care.routes | Prisma | JWT | L3 | REAL | Lab path |
| Relay | Sample care chip | Try demo | — | — | — | — | — | — | REMOVED | Was SCRIPTED |
| Relay | Messages mode | Human chat | static honest empty | none | none | none | — | L0 | ABSENT honest | Not faked |
| Care | Med/Apt/Obs open | Object detail | `fetchCareState` + select | GET `/state` | care.routes | server | JWT | L2–L3 | REAL | Detail panel |
| People | Member cards | Membership | `fetchCircleMembers` | GET `/circle` | care.routes | relationships | JWT | L2–L3 | REAL | HTTP source |
| People | Invite | Invite lifecycle | none shown as available | none | none | none | — | — | ABSENT | Honest |
| Documents | Generate care summary | Export from truth | `fetchCareExportMarkdown` | GET `/export` | care.routes | export claim | JWT | L2–L3 | REAL | No SEED_DOCS |
| Documents | Share | External share | disabled button | none | none | none | — | L0 | DEAD labeled | Honest |
| Access revoke | Revoke access | — | not in UI | POST `/access/revoke` | care.routes | yes | JWT | L3 | API REAL / UI ABSENT | — |

## Founder-observed defect (historical)

Prior to 2858c2a: UI CTAs called `loadDemo` / `setDraft(JUDGE_DEMO_UTTERANCE)`. Evidence: 23_PROMPT_INJECTION_CONTROLS.txt historical + 40_QUESTIONABLE_FLOW_SOURCE.md.

## Gaps

- Invitation: no routes inventory for invite create/accept
- Messaging: no routes
- Multi-user UI principal switcher: absent (API multi-user exists for Maya login)
