# Caretaker Relay — Production Logo System

**Status:** PRODUCTION IMPLEMENTED — FOUNDER FINAL VISUAL REVIEW PENDING  
**Date:** 2026-07-26  

## Approved source image

| Field | Value |
|-------|--------|
| Path | `/Users/genghishameha/Desktop/NIOV Labs/CareTaker Relay/caretaker-relay-logo-approved.png` |
| Repo evidence copy | `docs/design/logo-source/caretaker-relay-logo-approved.png` |
| Dimensions | 1536 × 1024 |
| Format | RGBA PNG |
| Transparency | ~95.7% fully transparent; not an opaque black plate |
| Active area | ~x 168–1327, y 370–612 |

## Source interpretation

| Element | Meaning |
|---------|---------|
| Gold central person | Care recipient — dignity, preferences, continuity |
| Two cupped hands | Care circle — family, friends, DSP, clinicians (support, not control) |
| Open ring | Continuity without confinement |
| Clockwise upper arrow | Relay / handoff / verified context moving forward |
| Wordmark | Exact: **Caretaker Relay** (navy + teal) |

Brand message (internal): *Care is carried forward between trusted people without losing the person at the center.*  
Not placed as public slogan unless Brand Guardian + content approve.

## Production SVG geometry

- viewBox `0 0 64 64` symbol  
- Flat fills only — **no** glow, bloom, blur, filters, backdrop-filter  
- Central head circle + triangular torso (gold)  
- Two supporting hands + palm base (deep navy)  
- Lower open arc (navy) + upper open arc (teal)  
- Clockwise arrow head at upper-right (gold)  

## Colors (exact)

| Token | Hex | Use |
|-------|-----|-----|
| Ink | `#0B2430` | Caretaker word (color tone) |
| Ink navy | `#0A2F5C` | Hands, lower ring |
| Teal | `#0C5C6A` | Primary signal |
| Teal bright | `#1F8A9A` | Upper ring, Relay word |
| Gold | `#D4A017` | Person + arrow |
| Gold warm | `#C9893A` | Reserved / alternate human gold |
| White | `#F5FAFC` | Monochrome on dark |

Three principal mark colors in color mode: **navy, teal, gold**.

## Typography

- System/project stack: SF Pro / Inter / system-ui  
- Wordmark: weight 700, tracking −0.03em  
- “Caretaker” ink; “Relay” bright teal (color only — no glow)  
- No novelty or thin display fonts  

## Clear space

Minimum clear space ≈ **½ head diameter** (~2.7 units in 64 viewBox) on all sides of the symbol.  
Do not crowd with icons, badges, or dense UI chrome.

## Minimum sizes

| Variant | Minimum |
|---------|---------|
| Symbol (full detail) | **24px** |
| Micro / favicon | **16px** (same geometry, thicker strokes in favicon asset) |
| Horizontal lockup | **mark 24px + wordmark ≥ 14px effective** |
| Stacked lockup | **mark 40px** preferred |

## Variants

| Code | Use |
|------|-----|
| `layout="horizontal"` | Header, login title row |
| `layout="stacked"` | Login, onboarding entry |
| `layout="mark"` | Mobile compact, loading |
| `tone="color"` | Default light surfaces |
| `tone="ink"` | Documents / print |
| `tone="white"` | Dark surfaces |

## Prohibited

- Glow, bloom, haze, soft raster edges  
- Medical cross, heart, shield, chatbot sparkle, generic AI nodes  
- Stretching, rotation, recoloring outside tokens  
- Backdrop-filter / SVG blur on logo  
- Continuous logo animation  
- Wordmark inside favicon  

## Light / dark

- Light: `tone="color"` on powder/white surfaces  
- Dark: `tone="white"` or `tone="ink"` on deep-ink backgrounds  
