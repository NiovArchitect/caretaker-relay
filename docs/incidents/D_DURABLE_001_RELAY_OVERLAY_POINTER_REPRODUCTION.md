# D-DURABLE-001 — Relay overlay blocks Mark seen

## Reproduction (public, pre-repair)

| Viewport | Relay open | elementFromPoint at Mark seen center | Click |
|----------|------------|--------------------------------------|-------|
| 390×844 | yes | `div.relay-thread` inside `aside.relay-panel.is-open` | FAIL |
| 768×1024 | yes | `div.relay-thread` inside `aside.relay-panel.is-open` | FAIL |
| 1280×720 | yes | `button[data-testid=notification-seen]` | PASS |

## Root cause (not guesswork)

Under `@media (max-width: 1100px)`:

1. `.relay-panel.is-open` is `position: fixed; inset full viewport; width: 100%; z-index: 50`.
2. `.overlay-scrim` is `position: fixed; inset: 0; z-index: 40; pointer-events: auto` (display block).
3. Mark seen remains in the main document flow under the panel; Playwright reports it “visible” but hit-testing targets the Relay thread.

Desktop grid rail (`position: relative` in column) does **not** cover main notifications; no intercept.

## Required repair direction

- Mobile/tablet: do **not** cover the full viewport with an interactive layer that prevents care actions.
- Prefer non-modal sheet: only the visible Relay bounds capture pointers; care content remains usable.
- Scrim must not steal pointer events if non-modal (visual optional).
- Desktop rail behavior preserved.
- No hide of Mark seen; no force-close Relay requirement.
