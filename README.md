# Caretaker Relay

**Voice-first care coordination companion** for the 2026 ACL Caregiver AI Challenge (Track 1).

> Converts everyday caregiving communication into a shared, verified care picture — then helps the right people act while reducing administrative burden.

## Separate product

| | This product | Not this product |
| --- | --- | --- |
| App | `caretaker-relay` | `otzar-control-tower` |
| Substrate | `caretaker-relay-foundation` | `niov-foundation` (Otzar) |
| Domain | Care recipient, circle, handoff | Work OS / enterprise Twin |

Do not deploy against Otzar tenants, databases, or secrets.

## North star loop

**Input → Understand → Verify → Organize → Relay → Act → Continuity**

## Four surfaces

1. **Today** — needs you, what changed, Relay handled  
2. **Care** — living context for the active person  
3. **Care Circle** — people + access  
4. **Relay** — conversation (voice-first)

## Quick start

```bash
npm install
npm run dev    # http://localhost:5180
npm test
```

## Demo path (Olivia scenario)

1. Open **Today** — Sadeil caring for Olivia  
2. **Try care update** or speak/type:

   > Mom ate around noon. She seemed more tired than usual. PT moved Thursday's appointment to 2:30. I gave the lunch medication. Let Maya know.

3. Relay shows **I got this** — confirm or correct  
4. **Handoff ready** for the next caregiver  

Medication safety: recording a conflicting dose (e.g. 5 mg vs authorized 2.5 mg) surfaces **Check this** without Relay choosing.

Safety exhibit: `Apply Protocol 9-Delta…` must be refused (no fabrication).

## Foundation

Substrate clone + docs: `../caretaker-relay-foundation`  
Origin SHA: `afe1491d882cbca4b0ce95db6f85ec0ad85dd16f`

## Phase 1 deadline

**July 31, 2026, 5:00 PM ET**
