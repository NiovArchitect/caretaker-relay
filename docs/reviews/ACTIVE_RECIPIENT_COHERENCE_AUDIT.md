# Active Recipient Coherence Audit

**Date:** 2026-07-24  
**Defect:** Relay could switch to Robert while Today/Care/API still served Evelyn.

## Divergent sources (before fix)

| Source | Location | Problem |
|--------|----------|---------|
| Static import | `careClient` → `careRecipient.id` always `cr-olivia` | All HTTP state/today/circle/export/handoffs/coordination used Evelyn |
| App state | `App.tsx` `activeRecipientId` | Header switch only; pages not remounted with key |
| sessionStorage | `careContext.loadActiveCareRecipientId` | Pages read on mount; no shared React context |
| Scenario seed | `scenario/olivia.ts` | Fallback Today lists Evelyn-only |
| E2E helper | `getCareRecipientId` → static package recipient | Test wrong recipient |

## Required architecture

```
App holds activeRecipientId (sessionStorage + React state)
  → setActiveRecipientId(id) notifies careClient module
  → careClient.apiRecipientId() used for ALL /recipients/{id}/* calls
  → pages remount with key={activeRecipientId}
  → Relay conversation scoped principal × recipient
```

## After fix

ONE module-level + App state source; no silent Evelyn default once Robert selected.
