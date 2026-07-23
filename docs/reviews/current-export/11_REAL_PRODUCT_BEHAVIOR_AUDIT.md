# Caretaker Relay — Real Product Behavior Audit

**Status:** Authoritative pre-reconstruction inventory  
**Date:** 2026-07-23  
**Canonical URL:** https://care.niovlabs.com  
**Product commits at audit:** app `4d54c63` / foundation `abbea1f`  
**Verdict before reconstruction:** **DEMO-SHELL DRIFT — NOT READY**  
**Recruitment:** PAUSED  

This audit was written from **source + live API surface**, not from prior PASS labels.

## Reality standard

A control is **REAL** only if:

```text
USER ACTION → APP HANDLER → API → AUTH → DOMAIN LOGIC → PERSISTENCE → UI FEEDBACK
```

Labels used:

| Label | Meaning |
| --- | --- |
| **REAL** | Full path above works for that control |
| **PARTIAL** | Real backend exists but UI only partially wires it, or only one side works |
| **SCRIPTED** | Control inserts prewritten text / demo utterance instead of performing workflow |
| **STATIC** | Renders hard-coded or seed data only; no live fetch for interaction result |
| **DEAD** | Clickable or visible but no meaningful effect |

---

## A. Synthetic seed vs fake function (policy)

| Allowed | Not allowed |
| --- | --- |
| Seeded synthetic household (Evelyn/Marcus/Maya/Daniel) as **real DB principals** | UI that only **simulates** care workflows with composer fill |
| Seeded care history as starting lab state | Buttons labeled as care actions that only set React state / fill drafts |
| Evaluator lab login for known principals | Fake invite / fake delivery / fake share |

**Technical IDs (not user-visible):** `cr-olivia`, `hh-olivia`, `p-sadeil`, `p-maya`, `p-walter`, `seedOlivia` option flag.

---

## B. Inventory — every visible interactive control

### B1. Shell / navigation

| Screen | Control | User believes | Frontend | API | Domain | Persist | Auth | Result | Level | Seeded? | Prewritten prompt? | Demo handler? | Safe to show? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| All | SideNav Today/Care/People/Documents | Switch care surfaces | `setTab` local | none | none | none | n/a | view swap | **REAL** (nav only) | NO | NO | NO | YES |
| All | BottomNav (mobile) | Same | `setTab` | none | none | none | n/a | view swap | **REAL** | NO | NO | NO | YES |
| All | Relay open (mobile) | Open AI panel | `setRelayOpen` | none | none | none | n/a | drawer | **REAL** | NO | NO | NO | YES |
| All | Care recipient chip | Active recipient context | local from package `careRecipient` | login establishes session for synthetic principal | seed recipient | n/a | session | display | **PARTIAL** — display real name after domain rename; identity always synthetic auto-login, no choice | YES seed | NO | YES auto-login | YES (lab) |
| All | Session label Marcus | Current user | hard-wired `people.marcus` | login uses `p-sadeil` password | principal seed | n/a | JWT | display | **PARTIAL** — name from seed/API login response not bound into shell | YES | NO | YES auto-login | YES (lab) |

### B2. Today

| Control | User believes | Frontend | API | Domain | Persist | Level | Prewritten? | Safe? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Tell Relay what happened** (top + next) | Start natural care update | `loadDemo()` → **`setDraft(JUDGE_DEMO_UTTERANCE)`** | none until send | none | none | **SCRIPTED** | YES | **NO** as labeled workflow |
| **Review handoff for Maya** | Open real continuity for next caregiver | `setShowHandoff(true)` + `getLatestHandoff()` | may use last HTTP handoff **or** **static `ho-demo-static`** | handoff store if live | yes if prior confirm | **PARTIAL** | NO (but static fallback) | borderline |
| Needs attention **Review with Relay** | Work that specific issue | `onReviewAttention` → **fills JUDGE_DEMO_UTTERANCE** | none until send | none | none | **SCRIPTED** | YES | **NO** |
| Needs attention cards list | Sparse “needs me now” | `fetchTodayProjection` | GET `/today` when HTTP | openSafetyReviews + tasks | server | **PARTIAL** — real data path exists but **noisy** (all open reviews, no signal filter) and dose banner was mis-scoped (fixed med-only) | mixed | YES if cleaned |
| What changed / Handled / Next | Situational awareness | same projection | `/today` | events/handoff | server | **PARTIAL** | NO | YES if filtered |

### B3. Relay (AI)

| Control | User believes | Frontend | API | Domain | Persist | Level | Prewritten? | Safe? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Composer Send | Organize natural language | `proposeCareUpdate` | POST `/understand` | fixture extract / loop | candidates only until confirm | **REAL** (lab fixture path) | NO (user text) | YES |
| Voice mic | Dictate care update | STT → same understand | `/voice/understand` or text | same | same | **PARTIAL** (browser STT; mode often fixture) | NO | YES |
| **Sample care update** | “Try the product” | `loadDemo` fill | none | none | none | **SCRIPTED** | YES | **NO** as product CTA |
| Chip “What still needs me?” | Ask care question | fills draft only | none until send | `answerCareQuestion` if sent | none | **SCRIPTED** until send | YES | weak |
| Confirm looks right | Persist care truth | `confirmCareUpdateAsync` | POST `/confirm` | confirm + handoff create | Prisma | **REAL** | NO | YES |
| Correct something | Fix before/after save | correction mode + `/corrections` or re-understand | POST `/corrections` | supersession | yes | **REAL** when event ids exist | NO | YES |
| Mode **Messages (people)** | Human messaging | local mode toggle + **static member cards** | **none** | none | none | **STATIC / DEAD** | NO | **NO** as completed |

### B4. Care

| Control | User believes | Frontend | API | Domain | Persist | Level | Prewritten? | Safe? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Section tabs | Browse care objects | local `setSection` | **none** | static scenario lists | none | **STATIC** | NO | weak |
| Medication row | Open medication truth | **display only** (no click handler) | unused `/state` meds | schedules in store | n/a | **STATIC / DEAD** for interaction | NO | **NO** as object UX |
| Appointments / observations | Same | static `scenario/olivia` | unused | seed | n/a | **STATIC** | NO | weak |

### B5. People

| Control | User believes | Frontend | API | Domain | Persist | Level | Safe? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Member cards | Real membership | expand local `circle` from **static scenario** | **GET `/circle` unused by UI** | whoCanSeeWhat exists | relationships | **STATIC** UI over **REAL** API | weak |
| Invite caregiver | — | **not present** | none | none | none | **ABSENT** (honest absence) | N/A |
| Access revoke | — | **not present in UI** | POST `/access/revoke` exists | real | yes | **API REAL, UI ABSENT** | N/A |

### B6. Documents

| Control | User believes | Frontend | API | Domain | Persist | Level | Safe? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Prepared drafts list | Generated from care truth | **`SEED_DOCS` hard-coded bodies** | **export unused** | export service exists | no draft store | **STATIC** | **NO** as real engine |
| Share (human confirms) | Share document | **disabled button** | none | none | none | **DEAD** | honest if labeled |
| Safety model copy | Policy education | static text | none | n/a | n/a | STATIC (policy) | YES |

### B7. Handoff panel

| Control | User believes | Frontend | API | Domain | Persist | Level | Safe? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Open handoff | Continuity for Maya | live handoff **or `demoHandoff`** | GET handoffs / last confirm | store | yes when confirmed | **PARTIAL** | only if no static path |
| Continuity looks right | Acknowledge | `onClose` only | none | none | **no** | **DEAD** as “ack” | weak |

### B8. Entry / auth

| Control | User believes | Frontend | API | Domain | Persist | Level | Safe? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| App load | Sign in | **auto lab login** `p-sadeil` | POST `/auth/login` | foundation principal | session JWT | **SCRIPTED entry** (intentional lab) | YES only if labeled “lab eval entry” |

---

## C. Demo / scripted catalog (source)

| Artifact | Location | Classification |
| --- | --- | --- |
| `JUDGE_DEMO_UTTERANCE` / `loadDemo` | `App.tsx`, `careClient.ts` | **VISIBLE PRODUCT DEPENDENCY** — must not be workflow CTAs |
| `onReviewAttention` → same utterance | `App.tsx` | **VISIBLE PRODUCT DEFECT** |
| `fill-judge-update` Sample chip | `RelayPanel.tsx` | **VISIBLE PRODUCT DEPENDENCY** |
| `handoff` static `ho-demo-static` | `scenario/olivia.ts` | **VISIBLE FALLBACK** |
| `SEED_DOCS` | `DocumentsPage.tsx` | **VISIBLE PRODUCT DEPENDENCY** |
| `circle` static members | `scenario/olivia.ts` | UI seed; API unused |
| `createCareRuntime({ mode: "fixture" })` | bridge/client | **Lab understand mode** — OK if labeled; not live LLM |
| Auto-login `p-sadeil` | `careClient.ensureHttpSession` | **Lab entry** — OK if transparent |
| Messages cards | `RelayPanel` | **STATIC shell** |
| Unit/e2e fixtures | `tests/`, `e2e/` | **TEST-ONLY** — keep |

---

## D. Backend capabilities already REAL (underused by UI)

| Route | Capability |
| --- | --- |
| POST `/api/v1/care/auth/login` | Real JWT session for seeded principals |
| GET `/recipients/:id/today` | Real today projection |
| GET `/recipients/:id/state` | Full current care state (meds, events, reviews, handoffs) |
| GET `/recipients/:id/circle` | Membership / who-can-see-what |
| GET `/recipients/:id/access` | Access decision |
| POST `/recipients/:id/access/revoke` | Real revoke |
| POST `/understand` + `/confirm` | Real multi-event loop + durable handoff |
| POST `/corrections` | Real supersession |
| GET `/handoffs` | List persisted handoffs |
| GET `/timeline` | Events + corrections + audit |
| GET `/export` | JSON/markdown export from current truth |

**Missing backend for product claims:** human messaging threads, invitation lifecycle, document draft persistence, multi-user UI switcher.

---

## E. Prior PASS claims — supersession

| Prior claim | Honest status now |
| --- | --- |
| Documents PASS | **DOWNGRADED → STATIC** (`SEED_DOCS`) |
| Human messaging PARTIAL | **DOWNGRADED → STATIC shell** |
| Lay→lay handoff PASS | **DOWNGRADED → PARTIAL** (static demo fallback still present) |
| Care interactivity PASS | **DOWNGRADED → STATIC** (no object open path) |
| Invitation PARTIAL | **ABSENT** (not live) |
| READY FOR FOUNDER A→Z | **SUPERSEDED — REJECTED / NOT READY** |

Lab-only claims that remain valid: understand→confirm→persist via API; auth isolation; unauthorized 403; fixture extract multi-event.

---

## F. Reconstruction priority (founder order)

1. Remove all **scripted-prompt-as-workflow** CTAs from product chrome.  
2. Wire **Care objects** to GET `/state` (medication/appointment/observation detail).  
3. Wire **Handoff** to GET `/handoffs` only (no static fallback in UI).  
4. Wire **People** to GET `/circle`.  
5. Wire **Documents** to GET `/export` + generate draft from current state (not SEED_DOCS).  
6. Hide Messages until real message model exists; do not fake.  
7. Keep lab auto-login but label entry as lab; do not pretend multi-identity product shell.  
8. Today signal filter: dedupe/sparse open reviews; no redundant med spam.  
9. Relay remains natural-language path only for communication; not escape hatch for unfinished UI.

---

## G. Evidence honesty

```text
CAREGIVER INPUT = NONE
CARE RECIPIENT INPUT = NONE
VALIDATED = NONE
RECRUITMENT = PAUSED
This audit = [LAB RESULT] + source inspection
```

**End of audit. Implementation must follow this inventory.**
