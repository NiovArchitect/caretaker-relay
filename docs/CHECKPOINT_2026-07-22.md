# Emergency Checkpoint — 2026-07-22

## Purpose

Preserve the validated Caretaker Relay Track 1 engineering state **before** any ACL Track 1 Product Constitution / UI redesign work, recoverable from **remote Git** if the local machine crashes.

**Emergency preservation checkpoint only — not a product release.**

## Crash recovery note (same day)

Post-crash inventory (2026-07-22) found both repositories already on branch `checkpoint/caretaker-relay-track1-2026-07-22` with **clean working trees**, **local commits present**, and **remote SHAs matching after `git fetch`**. No uncommitted Caretaker Relay work was discarded. This document records the **verified remote-safe** SHAs after recovery verification (app amend SHA corrected here from an earlier intermediate hash).

## Repositories

### 1. Caretaker Relay app

| Field | Value |
| --- | --- |
| Path | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay` |
| Branch | `checkpoint/caretaker-relay-track1-2026-07-22` |
| Checkpoint commit SHA | `e87fc6fdbbe060d3d12d39d4514166b45b1f5314` |
| Remote | `https://github.com/NiovArchitect/caretaker-relay.git` (private) |
| Remote branch | `origin/checkpoint/caretaker-relay-track1-2026-07-22` |
| Push verified | **YES** (local HEAD == remote SHA after fetch) |
| Working tree | Clean at recovery verification |
| Scope | Caregiver app UI, HTTP Foundation client, Playwright browser E2E, Phase 1 evidence/docs |

### 2. Caretaker Relay Foundation (working copy)

| Field | Value |
| --- | --- |
| Path | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation` |
| Branch | `checkpoint/caretaker-relay-track1-2026-07-22` |
| Checkpoint commit SHA | `fed2f594f7a39c02961d3ecdbe8f60d26363c255` |
| Remote | `https://github.com/NiovArchitect/caretaker-relay-foundation.git` (private) |
| Remote branch | `origin/checkpoint/caretaker-relay-track1-2026-07-22` |
| Push verified | **YES** (local HEAD == remote SHA after fetch) |
| Working tree | Clean at recovery verification |
| Scope | care-domain, Care API, Prisma store, stress harness, dose-units P1 fix, lifecycle scripts |
| Note | **Independent** of original `niov-foundation` (untouched). |

### 3. Intentionally untouched

- `niov-foundation` original substrate — not modified; not pushed to
- Otzar / AVP / federation-cloud

## Source Foundation relationship

Caretaker Relay care runtime lives in **`caretaker-relay-foundation`**, derived from Foundation substrate for care isolation. Original `niov-foundation` remains the reference substrate and must not receive Caretaker product commits by default.

## Current validated architecture (surviving evidence)

- Caretaker Relay app wired over **real HTTP** to Care API
- **Foundation-backed auth** (care principals / access)
- **Isolated Prisma/Postgres** persistence (`cr-local-pg` pattern; port 5434 in lab)
- Canonical care loop (understand → verify → confirm)
- Audit / provenance, handoff, corrections
- Medication semantic idempotency + **dose-units** normalization
- Founder smoke + care suite + brutal real-stack stress harness
- Finite service lifecycle management (no hanging stress processes expected after clean exit)

## Brutal stress state

| Item | Status |
| --- | --- |
| Campaign | Brutal real-stack stress V1 |
| Evidence | `evidence/phase1/validation/brutal-real-stack-v1.json` + foundation `docs/caretaker-relay/evidence/brutal-real-stack-v1/` |
| Full campaign scenarios | **68** (counts.total_scenarios_full_campaign) |
| Last auto-write subset in JSON | 20 scenarios all pass |
| Unresolved P0 | **0** |
| Unresolved P1 | **0** |

## Medication P1 — CR-STRESS-030

| Item | Status |
| --- | --- |
| Closure | **CLOSED** (`cr_stress_030_closure.status`) |
| Product fix | dose-units normalization in care-domain |
| Strong assertion | **Restored** — `expectDisc: true` for hostile `2.5 grams` vs mg order |
| Evidence note | Weakened intermediate assertion retained only as historical diagnostic; product fix returned original strong assert |
| Unit matrix | pass 20 / fail 0 (in stress JSON) |

## Browser campaign state (survived)

| Item | Status |
| --- | --- |
| Survived crash | **YES** |
| Doc | `docs/REAL_BROWSER_LIVE_MODEL_V1.md` |
| JSON | `evidence/phase1/validation/real-browser-live-model-v1.json` |
| Screenshots | `evidence/phase1/screenshots/real-browser-v1/` |
| E2E specs | `e2e/cr-browser-*.spec.ts`, `playwright.config.ts` |
| Result (evidenced) | **27/27 pass** (summary); Playwright core campaign previously recorded 18/18 in commit message |
| Stack path | Real Chromium → Vite → Care API → auth → Prisma |

## Campaign truth table

| Item | Status |
| --- | --- |
| Unresolved P0 | **0** |
| Unresolved P1 | **0** |
| Live remote Anthropic/OpenAI model | **BLOCKED_CREDENTIALS** (not proven) |
| Physical microphone | **MANUAL_NOT_AUTOMATABLE** (separate boundary) |
| Real caregiver validation | **NOT occurred** (explicitly in `notProven`) |
| Overall defensible TRL | **TRL 3** (lab stack proven; not production / not caregiver-validated) |
| Track 1 Product Constitution | **NOT yet supplied** |

## Known remaining gaps

- Live remote model path unproven without credentials
- Physical mic capture not automatable in this campaign
- No real caregiver usability / field validation
- No EMR interoperability / clinical efficacy / FDA claims
- Product Constitution / Track 1–2 firewall document still pending before UI/product redesign

## Strategic product decision

Caretaker Relay is targeting:

**ACL CAREGIVER AI CHALLENGE**  
**TRACK 1 — AI TOOLS TO SUPPORT CAREGIVERS**  
**PHASE 1 — DESIGN**

Track 1 and Track 2 are separate concurrent tracks. Winning Track 1 Phase 1 advances to Track 1 Phase 2.

Caretaker Relay must **NOT** drift into Track 2 organizational workforce-management functionality.

The forthcoming **Track 1 Product Constitution has NOT yet been supplied.**

## NEXT ACTION

**WAIT FOR THE ACL TRACK 1 PRODUCT CONSTITUTION / TRACK 2 FIREWALL BEFORE NEW PRODUCT OR UI DEVELOPMENT.**

## Recovery clone

```bash
git clone https://github.com/NiovArchitect/caretaker-relay.git
cd caretaker-relay && git checkout checkpoint/caretaker-relay-track1-2026-07-22
# verify: e87fc6fdbbe060d3d12d39d4514166b45b1f5314

git clone https://github.com/NiovArchitect/caretaker-relay-foundation.git
cd caretaker-relay-foundation && git checkout checkpoint/caretaker-relay-track1-2026-07-22
# verify: fed2f594f7a39c02961d3ecdbe8f60d26363c255
```
