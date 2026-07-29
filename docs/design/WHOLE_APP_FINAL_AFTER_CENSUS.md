# Whole-app final after-census

**Live deploy product:** `932faef` / bundle `index-BSFBbPE9.js`  
**API:** `4394cc53`  

## Method

Authenticated public browser census via Playwright against https://care.niovlabs.com:

- Roles: family (Marcus), family friend (Maya), DSP (Daniel), clinician (Dr Shah), care-recipient self create path  
- Viewports: 390×844, 768×1024, 1366×768 (desktop deep Care sections)  
- Screens: Today, Care (+ shift/appointments/medications/history), People, Documents  
- Artifacts: `docs/design/screenshots/whole-app-final-after-census/`  
- JSON: `docs/testing/WHOLE_APP_FINAL_AFTER_CENSUS.json`

## Today regression-only

| Check | Result |
|-------|--------|
| No create-work | PASS |
| No full handoff inbox dump | PASS |
| No notif delivery ops | PASS |
| Compact handoff entry | PASS |
| Priorities ≤3 | PASS |
| Probe markers | PASS (0) |
| Scroll ≈ 1 viewport | PASS (~1.03 desktop) |
| All four roles desktop Today | PASS |

**TODAY: PASS — frozen (no redesign).**

## Screen verdicts (desktop evidence)

| Screen | Result | Notes |
|--------|--------|-------|
| Today | PASS | Signal-first held across roles |
| Care (default / sections) | PASS | shift, appointments, medications OK |
| Care → History | REPAIRED | Humanized + capped list; machine IDs scrubbed |
| People | PASS | |
| Documents | PASS | |
| Multi-recipient switcher | PASS | Evelyn + Robert |
| Care-recipient self entry | PASS | Create account only, no care dump |

## Role verdicts

| Role | Result |
|------|--------|
| Family | PASS (after Care history repair on `932faef`) |
| Family friend | PASS |
| DSP | PASS |
| Clinician | PASS |
| Care-recipient self | PASS |
| Multi-recipient | PASS (switcher) |

## Automation friction (not product FAIL)

On mobile/tablet, open Relay drawer can intercept pointer events on bottom nav without `force`/`evaluate` click. Side nav and bottom nav share `data-testid=nav-*`. Product navigation remains usable by users; harness must prefer visible controls and close Relay first.

## Defects repaired this campaign

1. Care History displayed raw `p-*` machine ids and long unfiltered lists → `humanCareLine` + slice(0,12) + more-count note.
