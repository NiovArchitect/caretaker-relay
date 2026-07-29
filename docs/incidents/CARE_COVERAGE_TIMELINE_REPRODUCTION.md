# CareCoverageTimeline root-cause reproduction

**Recipient:** cr-olivia (Evelyn)  
**Principal under audit:** p-sadeil (Marcus)

## Disagreements observed (public)

| Consumer | Previous caregiver | Current coverage | Next caregiver | Source |
|----------|-------------------|------------------|----------------|--------|
| Relay PREVIOUS_SHIFT | Maya (from handoff copy) | “your current coverage” (vague) | not answered | answer-engine + handoff lines |
| My Shift UI | n/a | ongoing primary (app heuristic) | n/a | ShiftWorkspacePage roleLabel |
| GET /shifts | no Marcus row | 5 “active” shifts (Walter et al.) | scheduled rows | SHIFT_ASSIGN_V1 |
| GET /coverage | slots if seeded | Marcus helping_now seed | Maya next seed | CARE_COVER_V1 |
| Handoffs | many authors | mixed | many to Maya | CareHandoff list |
| Today / tasks | work assigned to Maya & unowned | Marcus sees all open signal work | n/a | work-items signal list |

## Root causes

1. **No single projection** — Relay, shifts, coverage slots, and UI each derive “who is on” independently.  
2. **Primary family has zero formal shifts** while work/attention still treat Marcus as active — coverage type not shared.  
3. **Previous caregiver** inferred from handoff text / seed names, not from completed shift/coverage ordered by end time.  
4. **Next caregiver** can fall back to care-team ordering rather than next scheduled/accepted coverage.  
5. **Handoff sender ≠ previous assigned caregiver** when campaigns create many sent handoffs to Maya.

## Required fix

Server-owned `buildCareCoverageTimeline(store, recipientId, principalId)` consumed by Relay, Today, My Shift, handoffs, and role filters.
