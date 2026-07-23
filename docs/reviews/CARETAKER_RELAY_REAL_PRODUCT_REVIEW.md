# Caretaker Relay — Real Product Reconstruction Review

**Date:** 2026-07-23  
**Canonical URL:** https://care.niovlabs.com  
**Founder status:** REJECTED prior A→Z as demo-shell; reconstruction required  
**Recruitment:** **PAUSED**  
**Evidence class:** `[LAB RESULT]` — no caregiver input, not validated  

---

## 1. Reality audit summary

Full inventory: [`REAL_PRODUCT_BEHAVIOR_AUDIT.md`](./REAL_PRODUCT_BEHAVIOR_AUDIT.md)

### Founder-critical defects confirmed

| Defect | Was | Root cause |
| --- | --- | --- |
| “Tell Relay what happened” | Filled `JUDGE_DEMO_UTTERANCE` | Demo harness wired as product CTA |
| “Review with Relay” on attention | Same prewritten fill | Escape-hatch to scripted prompt |
| Sample care update chip | Prefill script | Judge-loop affordance left in chrome |
| Handoff | Fallback to `ho-demo-static` | Static demo as product path |
| Documents | `SEED_DOCS` hard-coded bodies | Simulated document engine |
| People | Static `circle` scenario | API `/circle` unused |
| Care objects | Non-interactive static lists | No GET `/state` wiring |
| Messages | Static member cards | No thread model |

### Prior PASS claims superseded

Documents, Care interactivity, Human messaging, Invitation, and “READY FOR FOUNDER A→Z” were **downgraded**. Historical continuity keeps the record but marks supersession.

---

## 2. Architecture changes (this reconstruction)

### Principle restored

```text
CAREGIVER NEED → UX → BEHAVIOR → API → AUTH → DOMAIN → PERSISTENCE → UI
```

Not: fixture → button → prewritten prompt → simulated result.

### Frontend

| Area | Change |
| --- | --- |
| Today | Opens empty Relay; handoff loads via GET `/handoffs`; attention opens Care objects |
| Care | Fetches GET `/state`; clickable medications, appointments, observations, reviews, events with detail panel |
| People | Fetches GET `/circle`; honest “invitations not available” |
| Documents | Generates via GET `/export` (markdown); no SEED_DOCS |
| Handoff | No static demo fallback; empty state if none persisted |
| Relay | Sample chip removed; Messages mode honest “not available” |
| Session | Display name from login response |

### Client

New HTTP helpers: `careState`, `careCircle`, `careExport`, `careContext`.  
`fetchCareState`, `fetchCircleMembers`, `fetchCareExportMarkdown`, `fetchLatestHandoff`.  
Today attention: dedupe + cap 5. Removed fabricated static day fallback.

### Backend

No new routes required for this slice — **used existing real API** that UI had ignored.

---

## 3. Screens (post-reconstruction)

| Screen | Purpose |
| --- | --- |
| Today | Signal: needs attention, what changed, handled, next |
| Care | Real care objects from server state |
| People | Real membership + access scopes |
| Documents | Live export generation + safety framing |
| Relay | Natural language → understand → verify → confirm |

---

## 4. Workflow proof (required standard)

| Question | Answer after reconstruction |
| --- | --- |
| Who am I? | Session label from login (`Marcus Carter` lab) |
| Who am I helping? | Top chip: Evelyn Carter · Care recipient |
| What needs me? | Today from `/today` open reviews (deduped) |
| What changed? | Recent events from `/today` |
| What is next? | From latest handoff stillNeedsAttention when present |
| Open real care details? | Care → medication/etc from `/state` |
| See the source? | Detail JSON includes `source` when present |
| Correct it? | Relay correction → `/corrections` (unchanged real path) |
| Hand off to real user? | Confirm creates handoff; panel loads `/handoffs` |
| Can they receive? | Maya JWT can GET today/state (auth matrix) — multi-user UI switcher still lab-only |
| Message them? | **Not available** (honest) |
| Invite them? | **Not available** (honest) |
| Create document from truth? | Generate → `/export` |
| What AI changed? | Verify panel items + epistemic status |
| Corrections propagate? | Domain supersession (lab) |
| Unauthorized denied? | 403 |

---

## 5. Test results

| Suite | Result |
| --- | --- |
| App unit (`vitest`) | 9/9 PASS |
| Typecheck + production build | PASS |
| Live API: login / today / state / circle / handoffs / export | PASS (probed 2026-07-23) |
| Live API: understand → confirm | PASS (prior + same routes) |
| Public browser | Redeploy + smoke after ship |

---

## 6. Deployment proof

| Item | Value |
| --- | --- |
| App product commit | *(filled at ship)* |
| Foundation | `abbea1f` (Evelyn display names; no API shape change required) |
| Web service | `srv-d9h0l2n41pts73dksrmg` |
| Care API | `srv-d9h0ku3bc2fs739eo660` |
| Domain | https://care.niovlabs.com |

---

## 7. Remaining partials / known defects

1. **Lab auto-login** as Marcus — intentional for evaluator seed; not multi-identity product shell.  
2. **Understand mode** still fixture-backed (honest) — not live remote LLM.  
3. **Human messaging** absent until thread model + persistence exist.  
4. **Invitation lifecycle** absent until token/accept/membership exist.  
5. **Today noise** — historical open safety reviews can still accumulate in lab DB (dedupe helps; not a clinical queue).  
6. **Historical event raw excerpts** may still contain old names in **stored text** from prior demos; live principal display names are Evelyn/Marcus.  
7. **Share document** deliberately disabled.  
8. **Layout polish** not the goal of this campaign — behavior truthfulness is.

---

## 8. Screenshots index

Post-deploy evidence directory (when captured):

`evidence/real-product-2026-07-23/`

Expected captures: Today, Care med detail, People membership, Documents export, Handoff from API, Messages honest empty, Relay natural update.

---

## 9. Evidence honesty

```text
CAREGIVER INPUT = NONE
CARE RECIPIENT INPUT = NONE
VALIDATED = NONE
RECRUITMENT = PAUSED
FOUNDER VISUAL/BEHAVIOR APPROVAL = REQUIRED
```

**Do not recruit.**  
**Do not claim READY** until founder re-walks live product behavior.

---

## 10. Related files

- `docs/reviews/REAL_PRODUCT_BEHAVIOR_AUDIT.md`
- `docs/reviews/CARETAKER_RELAY_REAL_PRODUCT_ACTION_MATRIX.md`
- Continuity: `docs/CARETAKER_RELAY_CURRENT_STATE.json` (updated at ship)
