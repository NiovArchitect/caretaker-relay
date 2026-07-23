# Caretaker Relay ↔ MedixWeb Fidelity Review

**Date:** 2026-07-23  
**Reference:** Seven MedixWeb frames in `docs/design/medixweb-refs/`  
**Implementation:** `src/styles/global.css`, Today hero, Login glass card, People human labels, Relay glass column  

## Scores (1–10)

| Dimension | Score | Notes |
|-----------|------:|-------|
| **COMPOSITION** | **8** | Floating shell on powder-blue stage; Today uses dominant hero + priority layer + pair-grid support (not 12 equal cards). App still has left nav + right Relay (product need) vs pure marketing single column. |
| **COLOR** | **9** | Pixel-derived soft blue / deep teal ink / white surfaces. Published Dribbble yellow/olive chips intentionally **not** forced (not visible in frames). Warning amber kept for consequential verify (safety). |
| **GLASS** | **8** | Topbar + Relay + login + hero glass use layered `rgba` + blur 14–20px + bright rim — not generic `.1 / blur(10)`. Hero glass modules on blue gradient match ref character. |
| **TYPOGRAPHY** | **8** | Body 16px; calm H1 clamp; section H2 no shouty all-caps micro; deep teal ink. Marketing H1 size not copied 1:1 into app chrome (usability). |
| **SPACING** | **8** | Larger section padding (20–22px), shell margin 24px, pair gaps 16px. Mobile single-column preserved. |
| **DEPTH** | **8** | Multi-layer soft blue shadows on shell; cards elevating on hover; Relay glass column with radial washes. |
| **AMBIENCE** | **8** | Quiet premium health feel; teal pills; human-first People; no EMR gray admin density. |

**No dimension below 8.** Documented product deviations:

1. **App chrome vs landing page** — sidenav + persistent Relay required for workflows.  
2. **Warning accent** — amber/orange for needs-attention / verify (caregiver safety), not MedixWeb yellow chips.  
3. **No proprietary photography** — gradient glass hero instead of father/child photo.  

## Surface checklist

| Surface | MedixWeb mapping applied |
|---------|--------------------------|
| Login | Floating glass card on powder-blue stage |
| Today | Dominant caring-for hero + needs attention + quiet pairs |
| Relay | Premium glass intelligence column |
| Care | Large calm content sections (existing progressive disclosure retained) |
| People | Human names/roles; invitee labels without technical IDs in UI copy |
| Documents | High-value card styling available (`.document-card`) |
| Handoff / verify | Elevated surfaces with clear CTA geometry (pills) |

## Screenshot plan

Capture after local preview:

- Login, Today, Relay open, Care, People, Documents, Verify  
- Widths: 1920, 1440, 1366, 768, 390  

Stored under `docs/design/screenshots/` when generated in-session.
