# Compositor / CSS Audit
- Dozens of `backdrop-filter` + multi-layer shadows on shell, topbar, every `.section`, cards, relay
- Login ambient orbs: blur 80px + infinite animation + will-change
- Nested frost on scrolling lists is a known black-frame risk (esp. Safari)

## Action taken
- Disable backdrop-filter on sections/cards/workspace
- Cap shell/topbar/relay blur to ~8–12px
- Kill ambient animations
