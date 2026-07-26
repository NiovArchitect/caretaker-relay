# Caretaker Relay — Care Operating Model (v1)

**Date:** 2026-07-26  
**Status:** APPROVED for Phase 1 lab product  
**Constraint:** Do not regress P0 frontend recovery (hooks order, light compositor).

## 1. Purpose

Caretaker Relay is a **permission-aware care continuity environment**: shared, verified, current care picture across family, paid support, and clinicians — not a generic chat app, not a workforce marketplace, not an EMR.

## 2. User types

| Type | Examples (lab) | Core job |
|------|----------------|----------|
| Care recipient | Evelyn, Robert | Dignity, preferences, consent |
| Primary circle admin | Marcus (primary family) | Setup, invite, revoke path, coverage asks |
| Family / friend caregiver | Maya | Day-to-day help, reports, handoffs |
| Paid caregiver / DSP | Daniel | Shift continuity, documentation |
| Clinician | Dr Shah, Dr Cole | Signal not noise; plan vs reported |
| Care coordinator / org admin | (future) | Assignments, policy |
| Emergency contact | On profile | Contact only; may lack care access |

## 3. Invitation authority (permission-driven)

| Action | Who (Phase 1 lab) | Notes |
|--------|-------------------|-------|
| Invite to circle | Primary family caregiver only | Server still enforces; UI hides invite for others |
| Accept invitation | Invited person with code | Join existing circle |
| View people | Any authorized member | Role-scoped fields |
| Message circle member | Authorized members | Recipient context preserved |
| Revoke access | Server/admin path | UI honest: no fake self-serve revoke |
| Add paid worker | Not self-assign | Org/primary authorization required |

Ordinary caregivers **may not** freely invite unless they hold primary/admin authority.

## 4. Coverage model (private circle first)

**In scope (product):**
- Ask authorized people for help covering time
- Track simple request: open / accepted / declined (client-honest for lab)
- Handoff after coverage

**Out of scope / EXTERNAL:**
- Public caregiver marketplace
- Dispatch of employed workers by Relay
- Emergency staffing guarantees

## 5. Onboarding progressive disclosure

1. Account + role intent  
2. Join circle **or** set up care for someone (authorized)  
3. Minimal recipient profile  
4. People already helping  
5. Emergency contacts  
6. Enrich over time (meds, routines) via Care / Relay verify  

## 6. Empty recipient (Robert lightweight)

Robert is a **second authorized space** with lightweight depth — not a bug and not Evelyn’s data.  
Empty experience must offer: orient, invite/join, ask for coverage, set up care facts progressively.

## 7. Relay ambient contract

- Daily/shift orientation, timed changes, open items  
- No diagnose, no dose invent, no chatty help-bot tone  
- Safety lines only when consequential  

## 8. Emergency

Authorized snapshot + disclaimer + call links. Blood type only if verified on file (not invented).
