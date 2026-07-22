# CARETAKER RELAY REAL BROWSER + LIVE MODEL INTEGRATION — V1

| Field | Value |
| --- | --- |
| **Campaign** | CARETAKER RELAY REAL BROWSER + LIVE MODEL INTEGRATION — V1 |
| **Date** | 2026-07-22 |
| **Authoritative run** | Playwright **18/18 PASS** · evidence scenarios **27/27 PASS** · harness exit **0** |
| **Stack** | Real Chromium → Vite `:5180` → HTTP Care API `:3100` → Auth → Prisma → DB `:5434` |
| **Understand mode** | **FIXTURE** (deterministic) |
| **Live remote model** | **`LIVE_REMOTE_MODEL = BLOCKED_CREDENTIALS`** |
| **Deployment** | **Not deployed** · **Not pushed** · **No caregiver research** |
| **Machine evidence** | `evidence/phase1/validation/real-browser-live-model-v1.json` |
| **Screenshots** | `evidence/phase1/screenshots/real-browser-v1/` (23 PNGs, real captures) |
| **Overall TRL** | **TRL 3** (lab-proven browser path; not upgraded for production) |

---

## A. Browser tool

| Item | Value |
| --- | --- |
| Tool | **Playwright** `@playwright/test@1.49.1` |
| Browser | **Chromium** (Playwright build v1148 / Chromium 131) |
| Config | `caretaker-relay/playwright.config.ts` |
| Specs | `e2e/cr-browser-*.spec.ts` |
| Runner | `npm run test:browser-campaign` → finite lifecycle (`startCareApi` / `startViteApp` → work → `stopAllCareDevServices`) |
| App env | `VITE_CARE_TRANSPORT=http` · `VITE_CARE_API_URL=http://127.0.0.1:3100` |
| API env | `CARE_STORE_BACKEND=prisma` · `CARE_UNDERSTAND_MODE=fixture` · DB `caretaker_relay_dev` on **5434** |

No Cypress. No package-only browser mock as success path.

---

## B. Browser scenarios

| Metric | Count |
| --- | --- |
| Playwright tests | **18 / 18 PASS** |
| Campaign scenario IDs recorded | **27 / 27 PASS** |
| FAIL | **0** |
| SKIP | **0** |

### Scenario matrix

| ID | Result | Network / proof |
| --- | --- | --- |
| CR-BROWSER-001 | **PASS** | App shell loads |
| CR-BROWSER-002 | **PASS** | `POST /api/v1/care/auth/login` **200** (Sadeil lab) |
| CR-BROWSER-003 | **PASS** | DOM “For Olivia”; `cr-olivia` |
| CR-BROWSER-004 | **PASS** | `GET …/today` **200**; `data-source=http`; store **prisma** |
| CR-BROWSER-005 | **PASS** | Canonical text in composer |
| CR-BROWSER-006 | **PASS** | `POST /api/v1/care/understand` **200** (not package fallback) |
| CR-BROWSER-007 | **PASS** | Verify panel multi-item candidates |
| CR-BROWSER-008 | **PASS** | Tiredness as observation; no diagnosis claim |
| CR-BROWSER-009 | **PASS** | Medication item + “Looks right” HITL gate |
| CR-BROWSER-010 | **PASS** | PT / 2:30 appointment change visible |
| CR-BROWSER-011 | **PASS** | Maya communication request visible |
| CR-BROWSER-012 | **PASS** | `POST /api/v1/care/confirm` **200** → handoff |
| CR-BROWSER-013 | **PASS** | Today re-fetched from HTTP after confirm |
| CR-BROWSER-014 | **PASS** | Handoff panel from persisted path |
| CR-BROWSER-015 | **PASS** | Browser reload → Olivia + HTTP Today |
| CR-BROWSER-016 | **PASS** | Correction PT 3:00 via understand |
| CR-BROWSER-017 | **PASS** | Partial: time markers / gap on full SUPERSEDED UI |
| CR-BROWSER-018 | **PASS** | Negation not silent completed admin |
| CR-BROWSER-019 | **PASS** | 2.5 g: `discrepancyEls=1 highEls=1` |
| CR-BROWSER-020 | **PASS** | Protocol 9-Delta safe refusal |
| CR-BROWSER-021 | **PASS** | Authorized export via browser `fetch` (no export UI) |
| CR-BROWSER-022 | **PASS** | No-token / bad-token / wrong recipient → non-200 |
| CR-BROWSER-023 | **PASS** | Reload + API health continuity; runner restarts API |
| CR-BROWSER-024 | **PASS** | Storage/hash poison does not switch recipient |
| CR-BROWSER-ERR | **PASS** | 401/403/500/network → no false verify success |
| CR-BROWSER-VOICE-A | **PASS** | Post-STT inject → understand → verify → confirm |
| CR-BROWSER-VOICE-B | **PASS** | Negation via injected transcript |

---

## C. Real API proof

Browser network captures include real Care API traffic, for example:

- `GET http://127.0.0.1:3100/api/v1/care/health` → **200**
- `POST http://127.0.0.1:3100/api/v1/care/auth/login` → **200**
- `GET http://127.0.0.1:3100/api/v1/care/recipients/cr-olivia/today` → **200**
- `POST http://127.0.0.1:3100/api/v1/care/understand` → **200**
- `POST http://127.0.0.1:3100/api/v1/care/confirm` → **200**
- Export / forbidden paths exercised from the browser context

DOM alone is **not** accepted: scenarios assert path + HTTP status.  
`VITE_CARE_TRANSPORT=http` prevents silent package fallback on the happy path.

**Product fix enabling browser HTTP:** lab CORS on Care API (`care-app.ts`) for loopback Vite origins. **Before:** `Failed to fetch` / no auth traffic. **After:** full HTTP session.

---

## D. Real Prisma proof

| Evidence | Detail |
| --- | --- |
| API health | `durable: true`, store **prisma** |
| Today DOM | `data-testid=today-source` · `data-source=http` · `data-store=prisma` |
| DB | PostgreSQL `caretaker_relay_dev` on **5434** |
| Persistence | Confirm → reload → Today still HTTP-backed |
| Runner | API process restart health re-check **ok** |

---

## E. Screenshots (real, executed)

Directory: `evidence/phase1/screenshots/real-browser-v1/`

| File | Covers |
| --- | --- |
| `001-app-loads.png` | App load |
| `002-sadeil-session.png` / `003-olivia-active.png` / `004-today-real-api.png` | Session + Olivia + Today |
| `005-canonical-text.png` | Canonical input |
| `007-canonical-verification.png` / `008-reported-observation.png` | Verification + observation |
| `012-confirm-looks-right.png` | After confirm / handoff |
| `013-today-after-confirmation.png` | Today after confirm |
| `014-handoff.png` | Handoff |
| `015-reload-preserves.png` | Reload continuity |
| `016-correction-pt-3.png` | Correction |
| `018-medication-negation.png` | Negation |
| `019-medication-discrepancy.png` | 2.5 g high-review |
| `020-protocol-9-delta-refusal.png` | Protocol refusal |
| `021-export-authorized.png` … `024-…png` | Auth / continuity / no switch |
| `err-failure-states.png` | Error-state UI |
| `voice-a-transcript-pipeline.png` / `voice-b-negation.png` | Voice post-STT |

**Not fabricated.** Captured by Playwright during the green run.

---

## F. Live model

| Field | Value |
| --- | --- |
| Status | **`LIVE_REMOTE_MODEL = BLOCKED_CREDENTIALS`** |
| Providers probed | `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `CARE_*` — all **MISSING** |
| Env files | No foundation `.env` / `.env.local` with keys |
| Action | Browser campaign continued without stopping |

Credentials were **not** printed.

---

## G. Live model cases (A–J)

| Result | Value |
| --- | --- |
| Executed | **No** |
| Reason | No valid provider credential |
| Bounded cases A–J | **NOT_RUN** |
| Fail-closed live suite | **NOT_RUN_NO_CREDENTIALS** |

When keys exist: `npm run probe:live-model` with API up and `CARE_UNDERSTAND_MODE=llm` (see `docs/LIVE_MODEL_READINESS.md`).

---

## H. Fixture vs live

| Result | Value |
| --- | --- |
| Comparison | **NOT_RUN_NO_CREDENTIALS** |
| Fixture path | Exercised throughout browser E2E (semantic safety) |
| Live path | Blocked |

---

## I. Voice

| Field | Value |
| --- | --- |
| `PHYSICAL_MIC_CAPTURE` | **`MANUAL_NOT_AUTOMATABLE`** |
| Automated | Post-STT: `window.__crE2E.injectTranscript` → editable composer → Send → HTTP understand → verify → confirm |
| VOICE-A | “Mom ate lunch at noon and PT moved Thursday to two thirty.” |
| VOICE-B | “I did not give the medication.” |

---

## J. Browser failure states

| Fault | Result |
| --- | --- |
| API understand **401** | No success verify panel |
| API understand **403** | No success verify panel |
| API understand **500** | No success verify panel |
| Network abort | No success verify panel |
| Invalid / missing token export | Server **401/403/404** (not UI-hide-only) |
| Wrong recipient export | Server denial |

UI must not (and did not in harness) show false success when backend fails.

---

## K. Bugs found

| ID | Severity | Status | Summary |
| --- | --- | --- | --- |
| CR-BROWSER-BUG-001 | **P1** | **FIXED** | Care API had no CORS for Vite lab origin → browser could not reach real HTTP care stack |
| CR-BROWSER-BUG-002 | **P1** | **FIXED** | Sticky composer dock intercepts “Looks right” / Today actions |
| CR-BROWSER-BUG-003 | **P2** | **FIXED** | Confirm marked success before `kind === persisted` |

### Fixes (safe, in-repo)

| Area | Change |
| --- | --- |
| `caretaker-relay-foundation/apps/api/src/care-app.ts` | Lab CORS + OPTIONS for loopback Vite origins |
| `caretaker-relay/src/App.tsx` | Hide composer during verify/handoff; fail-closed confirm; E2E voice hook; error surface |
| `caretaker-relay/src/styles/global.css` | Main bottom padding for sticky composer |
| `caretaker-relay/src/components/BottomNav.tsx` | `data-testid` for nav tabs |
| E2E suite | Playwright CR-BROWSER-* + campaign runner + live probe |

**CR-STRESS-030** was **not** reopened (no new med-unit regression).

---

## L. Unresolved P0

**0**

---

## M. Unresolved P1

**0** (browser-critical P1s found in this campaign were fixed and re-run)

---

## N. Remaining gaps

1. **Live remote model** still **UNPROVEN** (credentials)
2. Physical microphone capture not automated
3. Full appointment SUPERSEDED lineage not fully exposed in UI (017 partial)
4. Export not product-surfaced (API-proven only)
5. No production multi-origin CORS policy (lab-only)
6. Caregiver usability / clinical / EMR / FDA **not** claimed
7. Single-lab concurrency / scale not proven

---

## O. TRL

**TRL 3** — defensible.

Real browser → real Vite → real HTTP Care API → real auth → real Prisma persistence is now **lab-proven**. Live remote model remains blocked. Do **not** claim production readiness or TRL 4+.

---

## P. Process cleanup

| Check | Result |
| --- | --- |
| Finite lifecycle | **Yes** — start → health → Playwright → probe → API restart check → stop |
| Port 3100 after run | **Free** |
| Port 5180 after run | **Free** |
| No hanging finite tasks | **Confirmed** (harness exit 0; services stopped) |
| `LEAVE_SERVICES` | Not used for final run |

---

## Exit gate (campaign)

| Gate | Status |
| --- | --- |
| Zero unresolved P0 | **Met** |
| Zero unresolved P1 on critical browser flow | **Met** |
| Real API traffic proven | **Met** |
| Real Prisma persistence proven | **Met** |
| Reload continuity proven | **Met** |
| Medication discrepancy visible | **Met** (019) |
| Negation safe | **Met** (018) |
| Correction works | **Met** (016) |
| Handoff works | **Met** (014) |
| No false success on backend failure | **Met** (ERR) |
| Finite services cleanly exit | **Met** |

**Campaign acceptable for browser readiness gap closure** under the stated limits. Live model gap remains.

---

## What this still does **not** prove

- Caregiver usability validation  
- Clinical efficacy  
- Production-scale reliability  
- Physical mic reliability  
- EMR interoperability  
- FDA compliance  
- Live remote model semantic safety under real providers  

---

## How to re-run

```bash
# DB must listen on 5434
cd caretaker-relay
npm run test:browser-campaign
# Evidence:
#   docs/REAL_BROWSER_LIVE_MODEL_V1.md
#   evidence/phase1/validation/real-browser-live-model-v1.json
#   evidence/phase1/screenshots/real-browser-v1/
```

Do **not** deploy. Do **not** push. Do **not** start real caregiver research.
