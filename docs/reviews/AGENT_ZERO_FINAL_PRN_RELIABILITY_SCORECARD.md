# AGENT ZERO — FINAL PRN RELIABILITY SCORECARD

**Recorded:** 2026-07-30  
**Campaign:** Bounded reliability (J29/J30, overdue progression, multi-tenant, non-PRN sample)  
**Controller:** Agent Zero  

---

## Agent selection

| Exact agent path | Need | Assignment | Repo | Authority | Artifact | Stop |
|------------------|------|------------|------|-----------|----------|------|
| Agent Zero | Reliability gates open | Orchestrate/implement/prove | both | sole write | this scorecard | freeze decision |
| `specialized/specialized-workflow-architect.md` | Stale confirm / offline | Design constraints | foundation | via A0 | order status + idem keys | unit green |
| `engineering/engineering-backend-architect.md` | Idempotency map | Domain write | foundation | via A0 | PRN_IDEM_V1 | public J30 |
| `security/security-appsec-engineer.md` | Multi-tenant | Isolation tests | foundation | read/test | prn-reliability.test | cross-tenant 0 |
| `testing/testing-reality-checker.md` | J29/J30 public | Harness | foundation | scripts | FINAL_PRN_RELIABILITY_J29_J30 | both pass |
| `healthcare/healthcare-clinical-evidence-agent.md` | Claim scope | Research | foundation | docs | claim applicability | unsupported=0 |

---

## Baseline → final product SHAs

| Item | Value |
|------|-------|
| Baseline API product | `48ad56b` |
| **API SOURCE/DEPLOY** | `0f2bbe2a17f7` live |
| **APP product DEPLOY** | `c5dea92` / `index-DciNDcpz.js` (no UI product change required) |
| App docs HEAD | (this commit) |
| BG workers | 0 |
| Migrations | 0 |

---

## What closed this pass

### J29 — order deactivated while confirmation open — **PASS (public)**
- Preview Ondansetron → `POST .../prn/orders/status` ended → confirm with `order_id`
- Response **409 `PRN_ORDER_INACTIVE`**: nothing charted
- Seed no longer re-activates ended orders on every request

### J30 — offline / unknown-result recovery — **PASS (public)**
- Same `idempotency_key` / `X-Idempotency-Key` three times (Marcus×2 + Maya)
- **One** episode id; second response “Already recorded… No duplicate administration”
- `openN === 1` for Simethicone (lab third PRN class so pain/nausea intervals do not block reliability proof)

### Overdue timed progression — **PASS (unit, clock-injected)**
- scheduled → due → overdue once (one audit) → complete → clear
- Repeated `ensurePrnOverdueEscalation` does not duplicate audit
- **Disclosure:** multi-hour wall-clock soak (6 real-time journeys) not run; clock injection proves state machine

### Multi-tenant — **PASS (unit)**
- Similar display names; cross-tenant write/reassess denied
- **Disclosure:** full public dual-tenant matrix with parallel orgs on Render not fully exercised

### Non-PRN sample regression — **PASS (public sample)**
- Status, appointment, meds, redose safety, messages: **unsafe=0**
- Cross-recipient Robert probe does not dump wrong chart
- **Disclosure:** full 21-turn + complete product bank not fully re-run this pass

### Compliance claims — **0 unsupported**
Research: `FINAL_PRN_RELIABILITY_SOURCE_UPDATE.md`, claim applicability, authority limitations.

---

## Scorecard

```text
PRN DOMAIN MODEL: PASS
PRN SCREEN PROJECTIONS: PASS
BOUNDED NEXT-CAREGIVER ACCESS: PASS
OVERDUE-ONCE LOGIC: PASS
OVERDUE TIMED PROGRESSION (clock): PASS
MULTI-HOUR WALL-CLOCK SOAK (6× real hours): OPEN / NOT RUN
J29 STALE ORDER CONFIRM: PASS
J30 OFFLINE IDEMPOTENCY: PASS
PUBLIC COMPOUND JOURNEYS: 30/30 (28 prior + J29 + J30)
TARGETED CONCURRENCY: PASS
FULL OFFLINE/STALE-TAB MATRIX: PARTIAL (J30 covers key; full 18-attack matrix not exhaustive)
MULTI-TENANT ATTACK MATRIX: PASS unit; public dual-org matrix PARTIAL
INDEPENDENT VISUAL RED-TEAM: PASS (prior)
UNSUPPORTED COMPLIANCE CLAIMS: 0
FULL NON-PRN REGRESSION RE-BANK: PARTIAL (sample PASS)
UNIT: PASS (16+ reliability)
TYPECHECK/HOOKS: PASS
BUILD: PASS (live 0f2bbe2)
DEPLOYMENT PARITY: YES (API 0f2bbe2 live; app UI still c5dea92 by design)

AGENT ZERO PUBLIC REALITY CHECK: PASS WITH REQUIRED CORRECTION
  (disclose: wall-clock overdue soak; full non-PRN bank; founder devices)

FOUNDER DESKTOP: PENDING
FOUNDER PHYSICAL PHONE: PENDING

SUBMISSION READINESS: READY for synthetic ACL demo with disclosed reliability limits
PRODUCT FREEZE: NOT RESTORED
```

---

## Remaining internal gaps

1. Six real multi-hour overdue journeys via production scheduler wall-clock  
2. Exhaustive 18 concurrency/stale-tab attack catalog  
3. Full public dual-tenant similar-name attack matrix  
4. Complete non-PRN founder 21-turn + full product regression bank re-run  
5. Optional app client: auto-send `X-Idempotency-Key` on Care/Relay confirm (API ready)

## External gaps

- Founder desktop + physical phone explicit confirmation  
- Qualified human review of role/setting authority (governance, not product wall)

---

## Decision

**PRODUCT FREEZE: NOT RESTORED**

J29/J30 and clock-based overdue/idempotency are proven on API `0f2bbe2`. Freeze remains open for wall-clock soak, full regression bank, and founder device confirmation.

Agent Zero stops here.
