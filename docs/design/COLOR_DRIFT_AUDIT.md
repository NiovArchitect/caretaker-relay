# Color Drift Audit (public closure pass)

**Date:** 2026-07-23  
**Public app SHA:** 23e2ae0 (+ pending login-centering fix)  
**Authority:** MedixWeb pixel analysis (soft blue / deep teal / white glass)

## Classification of remaining hardcoded colors

| Location | Color / pattern | Class |
|----------|-----------------|-------|
| `:root` `--cr-page` `#e8f1f8` | Powder-blue stage | **MEDIXWEB-DERIVED** |
| `:root` `--cr-ink` `#0b3a4a` | Deep teal ink | **MEDIXWEB-DERIVED** |
| `:root` `--cr-accent*` | Teal interactive | **MEDIXWEB-DERIVED** |
| `:root` `--cr-cyan` `#2a9aab` | Highlight teal (alias family) | **MEDIXWEB-DERIVED** |
| `:root` `--cr-warning` / `--cr-orange` | Consequential verify | **SEMANTIC SAFETY** |
| `:root` `--cr-critical` | Error | **SEMANTIC SAFETY** |
| `:root` `--cr-success` | Success | **SEMANTIC SAFETY** |
| Gradients using `rgba(26,122,140,*)` | Accent soft washes | **MEDIXWEB-DERIVED** |
| Badge hex `#8a5a12` / `#9a3f18` | Warning text on badges | **SEMANTIC SAFETY** |
| Hero sky `#5ba3d0`…`#c5dff0` | Hero glass field | **MEDIXWEB-DERIVED** |
| Inline JSX style color-free (layout only) | — | OK |

## Removed / avoided this pass

- No return to orange primary CTAs (prior product chrome).
- No olive/yellow Dribbble chips forced into chrome (not in MedixWeb pixels).
- Login label “Principal” → “Choose caregiver” (language drift, not color).

## Residual risk

Component-local hex for badge contrast remains intentional for WCAG on warning chips. Prefer migrating those to tokens in a later pass without changing visual meaning.
