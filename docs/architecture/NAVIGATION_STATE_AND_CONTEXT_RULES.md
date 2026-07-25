# Navigation State and Recipient Context Rules

**Campaign:** Coherent Care Experience  
**Date:** 2026-07-25  
**Status:** Implemented (app shell + Relay panel)

## 1. Recipient context is a transaction boundary

Switching care recipient (e.g. Evelyn → Robert) must atomically rebind:

- Active care space id (persisted + API client)
- Today / Care / People / Documents projections
- Relay messages (reset with system banner)
- Coordination thread + composer target
- Handoffs, bundles, correction state, care focus
- Notification unread count (recipient-scoped when tagged)

**No previous-recipient content may remain visible** under the new recipient beyond an intentional loading state.

## 2. Recipient switch landing

Default after deliberate switch:

1. Land on **Today** (orientation)
2. Scroll to canonical top
3. Close Relay drawer / profile menu
4. Clear verification and coordination draft state

Rationale: NEW PERSON → ORIENT ME. Reduces orientation error (AHRQ handoff: authority + responsibility + current picture).

## 3. Primary surface entry

When navigating to **Today / Care / People / Documents** via main nav, scroll to top unless returning from an immediate detail/back interaction.

## 4. Chat surfaces

| Surface | Position rule |
|---------|----------------|
| Relay thread | Prefer latest messages |
| Coordination | Reload for active recipient; prefer latest; composer sticky |

## 5. Coordination is human chat

Coordination is **not** Relay AI chat. It is recipient-specific messaging among authorized humans. UI must always show **which recipient** the thread is about.

## 6. Notifications

- Unread badge is **clickable** → Today inbox region
- Count is capped and preferably recipient-scoped
- Label: “N new” with 99+ cap for lab noise

## 7. Caregiver observations

Ordinary wellbeing language (“feels very good today”) is **valid REPORTED observation**, not uninterpretable noise. Soft observations use submission-time defaults; they are not automatic clinical diagnoses and are not “Needs checking” merely because a caregiver said them.
