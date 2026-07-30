# AGENT ZERO — FINAL PRN PRODUCTION RELIABILITY SCORECARD

**Recorded:** 2026-07-30  
**Controller:** Agent Zero  

---

## Agent selection

| Exact agent path | Evidence | Responsibility | Repo | R/W | Artifact | Stop |
|------------------|----------|----------------|------|-----|----------|------|
| Agent Zero | Client missing PRN idempotency; real overdue open | Orchestrate / implement / prove | both | write | this scorecard | freeze decision |
| `engineering/engineering-frontend-developer.md` | Care reassess no keys | ClientActionEnvelope | app | write | clientActionEnvelope.ts | deploy |
| `engineering/engineering-backend-architect.md` | Reassess no server key | reassess idempotency | foundation | write | prn-medication | unit green |
| `testing/testing-reality-checker.md` | Wall-clock overdue | Real elapsed soak | foundation | script | soak JSON | 6/6 pass |
| `security/security-appsec-engineer.md` | Multi-tenant | Isolation unit | foundation | test | prn-reliability | pass |
| `healthcare/healthcare-clinical-evidence-agent.md` | Claim scope | Source refresh | foundation | docs | claim boundary | unsupported=0 |

---

## Runtime (final)

| Layer | Value |
|-------|-------|
| API product | `cc41d05` live |
| APP product | `398ddfc` live |
| APP bundle | `index-DeFzy-q2.js` |
| Migrations | 0 |
| BG workers | 0 |
| DEPLOYMENT PARITY | **YES** |

Historical July 26 freeze (older SHAs) remains regression history only.

---

## Closed this pass

### Client idempotency — **PASS**
- `ClientActionEnvelope` generates one key per intended action (fingerprint)
- Care → Mark as helped / Did not help attach `X-Idempotency-Key` + body key
- Unknown network → human message; never claims definite success/failure
- Retries reuse same key; material effect change uses new fingerprint/key

### Server reassess idempotency — **PASS**
- `POST .../reassess` accepts header/body key
- Retry after success returns same completed episode

### Real elapsed overdue soak — **PASS (6/6)**
- Lab Cetirizine order: `reassessmentMinutes: 1`
- **Real wait 75s** (not clock injection) on public API
- Chart → idempotent double chart → wait → overdue surfaces → Maya reassess → clear
- Repeat today worker no card flood; history retains

### Multi-tenant unit — **PASS**
- Cross-tenant write/reassess denied (similar names)

### Non-PRN sample bank — **PASS**
- 8 core questions; unsafe=0; recipient isolation holds

### Research / claims — **PASS**
- Source refresh + claim boundary registry  
- Unsupported certification claims: **0**  
- ACL judging ≠ regulatory determination (explicit)

---

## Scorecard fields

```text
CLIENT IDEMPOTENCY ENVELOPE: PASS
PRN REASSESS IDEMPOTENCY (server): PASS
REAL ELAPSED OVERDUE SOAK (6 journeys, 75s real wait): PASS
CLOCK-INJECTION-ONLY: NO (primary soak was wall-clock wait)
MULTI-TENANT UNIT: PASS
PUBLIC DUAL-ORG ATTACK MATRIX: PARTIAL (unit; not 30-case public dual org)
FULL OFFLINE/STALE-TAB 20-CASE MATRIX: PARTIAL (client unknown-result path + server keys)
FULL NON-PRN REGRESSION RE-BANK: PARTIAL (8-question public sample PASS)
UNSUPPORTED COMPLIANCE CLAIMS: 0
PRN DOMAIN NOT REBUILT: YES
DOSE INVENTION: 0

TYPECHECK: PASS
UNIT: PASS
BUILD: PASS
DEPLOYMENT PARITY: YES

AGENT ZERO PUBLIC REALITY CHECK: PASS WITH REQUIRED CORRECTION

APP SOURCE/DEPLOY: 398ddfc
APP BUNDLE: index-DeFzy-q2.js
API SOURCE/DEPLOY: cc41d05

FOUNDER DESKTOP: PENDING
FOUNDER PHYSICAL PHONE: PENDING

SUBMISSION READINESS: READY (synthetic ACL + disclosed limits)
PRODUCT FREEZE: NOT RESTORED
```

---

## Remaining gaps

1. Full 20-case offline matrix + 15-case multi-recipient stale-context public matrix  
2. Full public dual-organization 30-case attack matrix  
3. Complete non-PRN founder 21-turn + full product bank re-run  
4. Multi-hour (not 1-minute lab) overdue soaks if product policy requires long intervals only  
5. Explicit founder desktop + physical phone confirmation  

---

## Decision

**PRODUCT FREEZE: NOT RESTORED**

Client idempotency and real elapsed overdue path are live on matching app/API SHAs. Freeze stays open for founder devices and remaining exhaustive matrices.

Agent Zero stops here.
