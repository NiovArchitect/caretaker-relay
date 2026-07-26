# Color System Decision — Precision Relay v3

**Date:** 2026-07-26  
**Decision:** **APPROVED for product CSS** (Precision Relay)  
**P0 constraint:** No nested backdrop-filter on scrolling surfaces  

| Token | Value | Role |
|-------|-------|------|
| Stage 0/1 | `#f3f6f8` / `#e6eef2` | Calm powder field |
| Ink | `#0b2430` | Primary text |
| Accent | `#0c5c6a` | CTA / focus |
| Accent 2 | `#1f8a9a` | Gradient highlight |
| Warm | `#c9893a` | Human vitality (not danger) |
| OK | `#176b5c` | Success |
| Warn | `#b86e12` | Attention |
| Danger | `#a61f18` | Critical only |
| Comm | `#1a5f7a` | Human messaging |

## Accessibility
- Body text ink on solid white: high contrast  
- Accent on white for large text/buttons  
- Status colors never sole carrier of meaning  

## Performance
- Stage uses static radial/linear gradients only  
- Shell blur remains P0-capped (≤10–12px on non-scroll chrome)  

## Rejected
- Generic bright medical teal SaaS  
- Neon cyberpunk glow stacks  
- Per-card backdrop-filter  
