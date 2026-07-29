# Final multi-recipient switch baseline

**Date:** 2026-07-29  
**Public app:** https://care.niovlabs.com  
**App deploy (start):** `246e950` / bundle `index-B-Rzq6vJ.js`  
**API deploy:** `4394cc53d18bba015ce7220865a91cc58c138176`  

## Agency selection

| Path | Evidence | Responsibility | Repo | R/W | Artifact | Timeout | Stop |
|------|----------|----------------|------|-----|----------|---------|------|
| *(none)* | Sole internal gap is multi-recipient UI switch; Agent Zero owns | repair + public proof | caretaker-relay | write | context + switch | — | isolation PASS |

## Multi-recipient principal

| Field | Value |
|-------|-------|
| Principal | Marcus Carter (`p-sadeil`) |
| Password path | Public lab sign-in |
| Recipient A | Evelyn Carter (`cr-olivia`) — full space |
| Recipient B | Robert Hale (`cr-robert`) — lightweight demo space |
| Client membership source | `listAuthorizedCareSpaces("p-sadeil")` → both CARE_SPACES |
| Unrelated C | Not in client switcher (e.g. server junk memberships not exposed in UI) |

## Storage / keys (pre-repair)

| Concern | Key / behavior |
|---------|----------------|
| Active recipient | `sessionStorage["cr.activeCareRecipientId"]` |
| Session | `sessionStorage["cr_care_session_v1"]` |
| API rid() | module `activeCareRecipientId` in careClient |
| Conversation memory | in-memory `principalId::recipientId` (partitioned) |
| Relay UI messages | **App-level single array** (risk: switch clears but in-flight may fill) |
| Context version | **missing** (pre-repair) |
| Switcher UI | Profile menu `switch-recipient-{id}` |

## Distinct markers seeded for leak detection

| Space | Marker |
|-------|--------|
| Robert A work | `ALPHA-ONLY: Call pharmacy about blue inhaler refill` |
| Evelyn B work | `BETA-ONLY: Confirm Evelyn evening Allegra review` |
| Robert appointment | `ALPHA Podiatry — Robert Hale only` / Harbor Foot Clinic ALPHA |

## Known switch behavior (pre-repair)

`switchRecipient` already: confirm dialog, clear draft/bundle/handoff, reset Relay messages to system line, remount workspace via `key={activeRecipientId}`, bind `setActiveCareRecipientId`.

**Gaps to prove/fix:** context_version rejection of in-flight Relay; partitioned Relay history restore; disable submit during switch; wrong-recipient flash; notification/badge coherency after switch.

## Non-goals

Login, handoff lifecycle storage, appointment lineage, timeline, badge math, med systems, auth architecture.
