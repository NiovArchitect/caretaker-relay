# Caretaker Relay — External Review Bundle

**Role:** LAYER 3 — external review index (links raw evidence + analysis)  
**Generated:** 2026-07-23T17:12:30Z  
**Campaign:** REAL PRODUCT RECONSTRUCTION / DEMO-SHELL STOP  
**Canonical URL:** https://care.niovlabs.com  
**Claimed deployed app SHA:** `2858c2a`  
**Recruitment:** PAUSED  
**Founder approval:** REQUIRED  
**Product modified by this handoff package:** NO  

This file is the **primary ChatGPT handoff**. It does **not** replace raw evidence under `docs/reviews/current-export/`.

GitHub is the canonical transfer mechanism. The founder must not be required to assemble or upload files manually.

---

## 1. Current product verdict

| Field | Value |
| --- | --- |
| Verdict | **NOT READY for recruitment** — real workflows partially restored after demo-shell rejection; founder behavior approval still required |
| Demo-shell drift | Founder-observed; reconstruction shipped at `2858c2a` |
| Terminal as system of record | **NO** — filesystem/Git is system of record |
| Evidence class | `[LAB RESULT]` — CAREGIVER INPUT NONE · VALIDATED NONE |

---

## 2. Current deployed SHA

| Item | Value | Evidence |
| --- | --- | --- |
| Claimed live app SHA | `2858c2a` | `docs/reviews/current-export/31_PUBLIC_DEPLOYMENT.txt` |
| Continuity deploy_shas.app | see CURRENT_STATE | `docs/reviews/current-export/docs/CARETAKER_RELAY_CURRENT_STATE.json` |
| App repo HEAD at package gen | see git state | `docs/reviews/current-export/20_GIT_STATE.txt` |

---

## 3. Capability classification (honest)

### REAL (server-connected durable lab paths)

- Auth login (lab principals) → JWT
- Understand → confirm → handoff persist
- Corrections supersession
- Today / state / circle / handoffs / export GETs
- Care object UI from GET `/state` (post-reconstruction)
- People membership from GET `/circle`
- Documents generate from GET `/export`
- Unauthorized 403

Evidence: `24_API_ROUTE_INVENTORY.txt`, `25_CONTROL_REALITY_MATRIX.md`, `tests/foundation-care.txt`, `tests/app-unit.txt`, `31_PUBLIC_DEPLOYMENT.txt`

### PARTIAL

- Lab auto-login as Marcus (not multi-identity product shell)
- Fixture understand mode (not live remote LLM)
- Today signal noise / open safety review accumulation
- Professional caregiver (Daniel) membership real; no UI principal switcher
- Multi-user API yes; multi-user UI switcher no
- Formal Playwright public e2e not re-run in this export (browser inventory + prior smoke only)

Evidence: `40_QUESTIONABLE_FLOW_SOURCE.md`, `25_CONTROL_REALITY_MATRIX.md`, `tests/browser-public.txt`

### SCRIPTED (historical / residual risk)

- **Prior product defect:** CTAs filled `JUDGE_DEMO_UTTERANCE` (founder-observed)
- Constant `JUDGE_DEMO_UTTERANCE` still exists for tests — must not bind product chrome
- Lab entry remains synthetic auto-login

Evidence: `23_PROMPT_INJECTION_CONTROLS.txt`, `22_DEMO_FIXTURE_SEARCH.txt`, `40_QUESTIONABLE_FLOW_SOURCE.md`

### STATIC

- Deprecated `handoff` seed object in scenario (must not be UI-wired)
- Policy copy / safety model text on Documents

Evidence: `40_QUESTIONABLE_FLOW_SOURCE.md`, `11_REAL_PRODUCT_BEHAVIOR_AUDIT.md`

### DEAD / ABSENT (honest)

- Human messaging threads (honest “not available”)
- Invitation lifecycle (honest absence)
- Document external Share (disabled labeled)
- Access revoke UI (API exists, UI absent)

Evidence: `25_CONTROL_REALITY_MATRIX.md`, screenshots `messages-honest.png`

---

## 4. Founder-observed failures (captured)

1. Layout still imperfect (not the goal of reconstruction campaign).  
2. Clickable actions pushed **pre-scripted prompts** into Relay (confirmed in prior source; fixed for product CTAs at `2858c2a`).  
3. Incomplete end-to-end entry/action/result for some controls.  
4. UI not consistently connected to real system capabilities.  
5. Demo shell over fixtures.  
6. PASS labels overstated shells/partials.  
7. PASS untrustworthy without browser→API→persist proof.

Raw audit: `11_REAL_PRODUCT_BEHAVIOR_AUDIT.md` / stable `docs/reviews/REAL_PRODUCT_BEHAVIOR_AUDIT.md`

---

## 5. Top issues

### P0

- Never reintroduce scripted-prompt-as-workflow CTAs (`23_PROMPT_INJECTION_CONTROLS.txt`).
- Terminal output is not authoritative; GitHub evidence package is.

### P1

- Invitation lifecycle still absent.  
- Human messaging still absent.  
- Multi-user UI switcher absent.  
- Today noise from historical open reviews.  
- Formal live Playwright campaign log missing from this export package (`tests/browser-public.txt` notes gap).

---

## 6. UX / interaction issues

- Identity triad present (Evelyn / Marcus) — screenshots under `screenshots/`  
- Relay must remain NL path only — product sample chip removed per reconstruction review  
- Attention → Care object navigation (not composer fill) — `attention-to-care.png`

---

## 7. Backend gaps

- No invitation routes  
- No message thread routes  
- Document draft persistence beyond export snapshot limited  
See `24_API_ROUTE_INVENTORY.txt`

---

## 8. Multi-user gaps

- Maya/Daniel login exist in lab API; product shell auto-enters Marcus only  
Evidence: `31_PUBLIC_DEPLOYMENT.txt`, audit, action matrix

---

## 9. Document / messaging / invitation gaps

| Area | Status | Evidence |
| --- | --- | --- |
| Documents | Generate via export REAL; Share DEAD labeled | `12_…ACTION_MATRIX`, screenshots |
| Messaging | Honest ABSENT | `messages-honest.png`, matrix |
| Invitation | Honest ABSENT | People page / matrix |

---

## 10. Screenshot index

See `docs/reviews/current-export/30_SCREENSHOT_INDEX.md`  
Files under `docs/reviews/current-export/screenshots/`

Screenshots prove UI only — not durable backend alone.

---

## 11. Test index (raw logs)

| Log | Path |
| --- | --- |
| App unit | `docs/reviews/current-export/tests/app-unit.txt` |
| Foundation care | `docs/reviews/current-export/tests/foundation-care.txt` |
| Product isolation | `docs/reviews/current-export/tests/product-isolation.txt` |
| Browser/public notes | `docs/reviews/current-export/tests/browser-public.txt` |
| Message/invite search | `docs/reviews/current-export/tests/message-invite-handoff-search.txt` |

Do not substitute “67/67 passed” for reading these files.

---

## 12. Raw evidence index

| Artifact | Path | Layer |
| --- | --- | --- |
| Manifest | `docs/reviews/current-export/00_MANIFEST.md` | INDEX |
| Real product review (copy) | `…/10_REAL_PRODUCT_REVIEW.md` | ANALYSIS copy |
| Behavior audit (copy) | `…/11_REAL_PRODUCT_BEHAVIOR_AUDIT.md` | ANALYSIS copy |
| Action matrix (copy) | `…/12_REAL_PRODUCT_ACTION_MATRIX.md` | ANALYSIS copy |
| Git state | `…/20_GIT_STATE.txt` | RAW |
| File inventory | `…/21_PRODUCT_FILE_INVENTORY.txt` | RAW |
| Demo/fixture search | `…/22_DEMO_FIXTURE_SEARCH.txt` | RAW |
| Prompt injection search | `…/23_PROMPT_INJECTION_CONTROLS.txt` | RAW |
| API routes | `…/24_API_ROUTE_INVENTORY.txt` | RAW |
| Control matrix | `…/25_CONTROL_REALITY_MATRIX.md` | ANALYSIS |
| Screenshots index | `…/30_SCREENSHOT_INDEX.md` | ANALYSIS |
| Public deploy | `…/31_PUBLIC_DEPLOYMENT.txt` | RAW |
| Questionable sources | `…/40_QUESTIONABLE_FLOW_SOURCE.md` | ANALYSIS |
| Secrets scan | `…/98_SECRETS_PHI_SCAN.txt` | RAW |
| Operating model docs | `…/docs/*` | RAW copies |
| Tests | `…/tests/*` | RAW |

### Stable repository paths (primary)

| Path | SHA256 prefix (at package gen) |
| --- | --- |
| `docs/reviews/CARETAKER_RELAY_EXTERNAL_REVIEW_BUNDLE.md` | (this file) |
| `docs/reviews/REAL_PRODUCT_BEHAVIOR_AUDIT.md` | `4f9e4f6dfef565cc` |
| `docs/reviews/CARETAKER_RELAY_REAL_PRODUCT_ACTION_MATRIX.md` | `26cad1130675ab9e` |
| `docs/reviews/current-export/00_MANIFEST.md` | (see file) |

---

## 13. Continuity / do-nots

- RECRUITMENT = PAUSED  
- Do not claim READY without founder approval  
- Do not treat terminal scrollback as evidence  
- ZIP backup is optional; **GitHub is primary ChatGPT handoff**

---

## 14. Integrity statement

Manifest required artifacts: see `00_MANIFEST.md`  
Secrets/PHI scan: `98_SECRETS_PHI_SCAN.txt`  
Integrity status file: `_INTEGRITY_STATUS.txt`

**End of external review bundle.**
