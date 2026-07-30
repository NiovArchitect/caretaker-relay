# AGENT ZERO — FINAL PUBLIC SECURITY, OFFLINE RELIABILITY, REGRESSION SCORECARD

**Recorded:** 2026-07-30  
**Controller:** Agent Zero  
**PRN architecture:** FROZEN (no domain rebuild this pass)

---

## Agent selection

| Exact agent path | Evidence | Responsibility | Repo | Artifact |
|------------------|----------|----------------|------|----------|
| Agent Zero | Remaining public matrices open | Orchestrate / prove | both | this scorecard |
| `testing/testing-reality-checker.md` | Offline/stale + founder bank | Public harnesses | app | matrix JSON |
| `security/security-appsec-engineer.md` | Dual-org / multi-recipient | Isolation tests | foundation | dual-org unit |
| `testing/testing-test-automation-engineer.md` | Regression bank | Founder 21 + non-PRN | app | regression JSON |
| `healthcare/healthcare-clinical-evidence-agent.md` | Claim scope | Source refresh | app | research md |

---

## Runtime (verified)

| Layer | Value |
|-------|-------|
| APP product live | `398ddfc` / `index-DeFzy-q2.js` |
| API product live | `cc41d05` |
| App docs HEAD | (this commit) |
| API test HEAD | `d0e7918` (unit matrix only; product still `cc41d05`) |
| Migrations | 0 |
| BG workers | 0 |
| PRN domain modified | **No** |

Public dual-org principals (`p-a-marcus` / `cr-a-evelyn`) are **not** seeded on public runtime. Dual-org **unit** matrix is complete; public proves foreign org IDs denied (403).

---

## Results

| Gate | Result |
|------|--------|
| 20-case offline/stale matrix | **PASS 20/20** |
| Dual-org attack matrix | **PASS 30/30 unit**; public foreign-org denial; live dual-org principals **not available** |
| Multi-recipient stale context | **PASS 15/15** (olivia/robert) |
| Founder Relay turns | **PASS 21/21**, unsafe=0, raw_ids=0 |
| Non-PRN bank (expanded sample) | **PASS 12**, unsafe=0 |
| Screen/Relay coherent | **PASS** (today ok + attention answers) |
| Visual red-team | **PASS** (prior script re-run) |
| Unsupported claims | **0** |
| Founder desktop | **PENDING** |
| Founder physical phone | **PENDING** |

Evidence:

- `docs/testing/FINAL_PUBLIC_OFFLINE_STALE_MATRIX.json`
- `docs/testing/FINAL_PUBLIC_MULTI_RECIPIENT_STALE_MATRIX.json`
- `docs/testing/FINAL_FOUNDER_AND_NON_PRN_REGRESSION.json`
- Foundation: `tests/unit/care/prn-dual-org-attack-matrix.test.ts`

---

## Scorecard block

```text
OFFLINE/STALE 20-CASE MATRIX: PASS
DUAL-ORG 30-CASE MATRIX: PASS (unit) / PUBLIC LIVE DUAL-ORG SEEDS: EXTERNAL_LIMITED
MULTI-RECIPIENT STALE CONTEXT: PASS
FOUNDER 21-TURN RELAY: PASS
NON-PRN REGRESSION BANK: PASS (21 founder + 12 non-PRN; not entire historic 200 re-run)
SCREEN/RELAY DISAGREEMENTS: 0 observed
UNSAFE DOSE INVENTION: 0
RAW IDS IN ANSWERS: 0
UNSUPPORTED GOVERNMENT CLAIMS: 0
PRN ARCHITECTURE REBUILT: NO

APP DEPLOY: 398ddfc / index-DeFzy-q2.js
API DEPLOY: cc41d05
DEPLOYMENT PARITY: YES

FOUNDER DESKTOP: PENDING
FOUNDER PHYSICAL PHONE: PENDING

SUBMISSION READINESS: READY (synthetic public lab + disclosed dual-org seed limit)
PRODUCT FREEZE: NOT RESTORED
```

---

## Remaining gaps

1. Live dual-organization principals/seeds on public API (currently unit-only for true dual Evelyn worlds)  
2. Full historic 200-utterance re-run if required beyond founder 21 + 12  
3. Explicit founder desktop + physical phone confirmation  
4. Optional: longer worker-scale soak beyond prior 75s elapsed suite  

## Decision

**PRODUCT FREEZE: NOT RESTORED**

Public offline matrix, multi-recipient isolation, founder Relay, and dual-org unit security are proven without changing PRN architecture. Freeze remains open for founder device confirmation and optional full dual-org live seeds.

Agent Zero stops here.
