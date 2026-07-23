# REAL-HOUSEHOLD CLOSURE CAMPAIGN — CONSOLIDATED REPORT

**Date:** 2026-07-23  
**Canonical URL:** https://care.niovlabs.com  
**App commit:** `1a5a23c` / feature `ef30a4a`  
**Foundation commit:** `653aca0`  
**Recruitment:** PAUSED  

---

## A. EXECUTIVE VERDICT

**PARTIAL**

Caretaker Relay is **technically closer** to a real multi-human continuity product:

- Independent principal **sign-in** (no auto-Marcus).
- Real **invitation create → accept → membership**.
- **Coordination messages** (human, care-scoped, persisted).
- Expanded natural-language extract for uncertain meds / PT conflict.
- API-level **three-principal household closure test** PASS.

It is **not** yet a full production PASS of the founder gate:

- Intelligence path is still **fixture/general-parser** unless `CARE_UNDERSTAND_MODE=llm` + live provider keys are active on Render (not proven live).
- Multi-human proof is **API + unit integration**, not a full multi-browser product E2E against production.
- Correction→Marcus re-observe path exists domain-side; not fully re-proven in the new household test as a separate correction API step after Maya writes.
- Caregiver input / care-recipient input still **NONE**.

---

## B. BEFORE → AFTER MATRIX

| Capability | Before | Implemented | After | Evidence |
| --- | --- | --- | --- | --- |
| Product entry | Auto-login Marcus | `LoginGate` + `POST /auth/login` | Explicit principal sign-in | UI + live smoke |
| Multi-principal | API only | Lab principal list + sessionStorage JWT | Marcus/Maya/Daniel selectable | `/auth/lab-principals`, `/me` |
| Invitation | Absent | Create/list/accept routes | Real pending→accepted membership | household-closure.test |
| Coordination | Honest absent | POST/GET coordination | Persisted human notes | household-closure.test |
| Understand | Fixture patterns | Expanded extract (blue pill / PT won’t work) | Still not full remote LLM proven | understand.ts |
| Continuity | Marcus-centric | Maya handoff read after confirm | API-level Maya sees handoffs | test |
| Authorization | 403 unauthorized | Same + invitee must match token | Unauthorized 403 | test |
| Demo prompts | Removed prior | Kept removed | No sample chip | prior reconstruction |

---

## C. THREE-PRINCIPAL TRACE (API-PROVEN)

Test: `tests/unit/care/household-closure.test.ts`

1. **Marcus** lab-login → JWT  
2. Marcus **revokes** Maya (to make invite meaningful)  
3. Marcus **creates invitation** for Maya → durable token  
4. **Maya** independent login  
5. Maya **accepts invitation** → relationship+consent active  
6. Marcus **understands** fresh multi-signal utterance (dizzy / blue one / PT won’t work)  
7. Uncertainty preserved on medication identity  
8. Marcus **confirms** → persisted + handoff  
9. Maya **GET handoffs** independently → length > 0  
10. Marcus **posts coordination** note  
11. Maya **GET coordination** sees dizziness note  
12. **Daniel** login → GET today 200  
13. **Unauthorized** GET state → **403**  
14. Second fresh utterance → verify  

**Not fully proven in browser multi-session product walkthrough against deployed stack.**

---

## D. INTELLIGENCE PROOF

| Item | Status |
| --- | --- |
| Previous path | `mode=fixture` deterministic extract |
| Production path available | `CARE_UNDERSTAND_MODE=llm` + Foundation `getLLMProvider()` in server.ts |
| Deployed live LLM | **Not proven** (fixture default unless env set with keys) |
| Parser expansion | Uncertain color-med; PT won’t work |
| Fresh utterances in test | Two novel multi-signal strings |
| Lookup table? | No — pattern extract, not hardcoded full strings |
| Uncertainty | UNCERTAIN med + verification items |

---

## E. AUTHORIZATION RED-TEAM (PARTIAL)

| Attack | Result |
| --- | --- |
| Unauthorized principal GET state | 403 |
| Accept invite as wrong principal | 403 WRONG_PRINCIPAL (code path) |
| Invite without * control | 403 FORBIDDEN (code path) |
| Client identity swap without JWT | Session requires server token |
| Full IDOR suite multi-circle | Not exhaustively automated this campaign |

---

## F. FAILURE / CHAOS

Not fully executed this campaign (P1 remaining). Covered: already-member 409 on invite when active; expired/invalid invite codes present.

---

## G. TEST RESULTS

| Suite | Result |
| --- | --- |
| App unit | 9/9 PASS |
| App build | PASS |
| Foundation care unit | **68/68 PASS** (incl. household-closure) |
| household-closure | 1/1 PASS ~0.8s |
| Browser multi-session live E2E | Not fully automated this pass |
| Live API smoke post-deploy | lab-principals OK; Marcus login OK; /me OK; web 200 |

---

## H. DEPLOYMENT EVIDENCE

| Item | Value |
| --- | --- |
| Foundation SHA | `653aca0` |
| App SHA | `ef30a4a` (+ `1a5a23c` bak cleanup) |
| API service | caretaker-relay-care-api |
| Web service | caretaker-relay-web |
| URL | https://care.niovlabs.com |
| Live principals endpoint | PASS |
| Live Marcus JWT | PASS |

---

## I. REMAINING GAPS

| Gap | Priority |
| --- | --- |
| Remote LLM understand not proven on Render | **P0** for “live intelligence” claim |
| Full multi-browser product E2E (Marcus/Maya/Daniel sessions) | **P0** for gate PASS |
| Maya correction → Marcus re-observe automated | **P1** |
| Exhaustive invite edge cases (replay, wrong circle) | **P1** |
| Chaos (double confirm, concurrent writes) | **P1** |
| Caregiver/recipient human validation | **P0** (external) |
| Federation identity beyond lab passwords | **P2** |

---

## J. TRUTHFUL FINAL STATE

```text
CAREGIVER INPUT = NONE
CARE RECIPIENT INPUT = NONE
TECHNICAL MULTI-HUMAN LOOP = PARTIAL (API-proven; browser multi-session incomplete)
LIVE INTELLIGENCE = PARTIAL (expanded parser; LLM env not proven live)
AUTHORIZATION/ISOLATION = PARTIAL (unauthorized 403 proven; not full red-team matrix)
INVITATION = PARTIAL→TECHNICAL REAL (API lifecycle; seed principals)
HUMAN COORDINATION = TECHNICAL REAL (persisted care-scoped notes)
PROVENANCE/CORRECTION = PARTIAL (prior domain; not re-walked full Maya correct path in new test)
FAILURE SAFETY = PARTIAL
DEPLOYMENT = YES (SHAs above)
RECRUITMENT = PAUSED
```

---

## K. FOUNDER WALKTHROUGH

**FOUNDER WALKTHROUGH: PARTIAL — technical loop available; full gate not closed**

Manual steps on https://care.niovlabs.com:

1. Open site → **Sign in as Marcus Carter** (lab password for p-sadeil).  
2. **People → Create invitation** for Maya → copy token.  
3. **Sign out** → sign in as **Maya Bennett**.  
4. People → paste token → **Accept invitation**.  
5. Sign out → Marcus → **Tell Relay** a messy never-scripted update → verify → confirm.  
6. Sign out → Maya → Today/handoff/coordination — confirm continuity.  
7. Sign out → **Daniel Kim** — confirm limited care access.  
8. Confirm unauthorized cannot enter meaningful Evelyn state.

If invitation fails because Maya already active: use revoke via API or invite Daniel first.

---

## PASS DEFINITION ASSESSMENT

Gate requirements not fully met. Campaign advances substrate honestly without fraudulent PASS.
