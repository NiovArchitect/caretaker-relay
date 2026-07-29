# Conversational context loss — public reproduction (pre-edit)

**Date:** 2026-07-29  
**API:** 0202933 · **App:** 069c6e4  
**Evidence:** `docs/incidents/evidence/conversation-context-before/CONVERSATIONS.json`

## Conversations (Marcus / Evelyn, public API)

### A — Follow-up time
| Turn | Intent | Defect |
|------|--------|--------|
| How was Evelyn yesterday, did anything change? | YESTERDAY_WELLBEING | Fever + Tylenol — OK |
| At what time? | UNKNOWN_QUESTION | Generic domain fallback — FAIL |
| Who reported that? | UNKNOWN_QUESTION | Generic domain fallback — FAIL |
| Was it confirmed? | VERIFICATION_STATUS | Wrong scope (Metformin plan) — FAIL |

### B — Pronoun / med change
| Turn | Intent | Defect |
|------|--------|--------|
| What medication change is waiting? | WAITING_ON | Missed Allegra pending — PARTIAL |
| When was it reported? | MEDICATION_ADMINISTRATION_HISTORY | Bound to admin history not Allegra — FAIL |
| Who needs to review it? | UNKNOWN_QUESTION | FAIL |
| Has she taken it? | UNKNOWN_QUESTION | FAIL |

### C — Previous shift
| Turn | Intent | Defect |
|------|--------|--------|
| How was the previous shift? | PREVIOUS_SHIFT | Narrative OK |
| What time did that happen? | UNKNOWN_QUESTION | FAIL |
| Who corrected it? | UNKNOWN_QUESTION / docs | FAIL |
| What still needs to be done? | TASKS_REMAINING | OK-ish open list |

### D — Multi-referent
| Turn | Intent | Defect |
|------|--------|--------|
| What happened with the fever and Tylenol? | CHANGE_SINCE | Wall + probe residue — PARTIAL |
| At what time? | UNKNOWN_QUESTION | Should clarify fever vs Tylenol — FAIL |

## Other founder defects (observed / product contract)
- New response button still present in RelayPanel
- Med admin actions always offer both buttons regardless of current truth
- Schedule conflict copy may include Judge PT / Side 1
- Open-work / Today may show duplicate Allegra / needs-owner language
- Notification badge is raw row count (neglect signal)

## Agent selection (evidence-triggered)
| Agent | Evidence |
|-------|----------|
| Conversational memory / coreference | Follow-ups → UNKNOWN_QUESTION |
| Medication safety / state machine | Dual always-on admin buttons |
| Semantic dedupe / work ownership | Duplicate Allegra / Needs an owner |
| Notification systems | High badge count |
| Content design / layperson language | Judge PT / Side 1 |
| Frontend UX | New response button |
| Minimal-change engineering | Extend conversation-memory + UI only |

**Stop condition:** gaps closed or residual only founder-gated.  
**Workers at boundary:** 0
