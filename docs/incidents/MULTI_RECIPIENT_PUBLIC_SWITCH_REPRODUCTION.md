# Multi-recipient public switch reproduction

**Date:** 2026-07-29  
**App:** https://care.niovlabs.com @ `2d928d7` / `index-CKAzvvON.js`  

## Principal

Marcus Carter (`p-sadeil`) authorized for Evelyn Carter + Robert Hale in client switcher.

## Distinct markers

| Space | Marker |
|-------|--------|
| Robert | ALPHA-ONLY work, ALPHA Podiatry appointment |
| Evelyn | BETA-ONLY work, Allegra / Metformin signal |

## After-repair public results

See `docs/testing/multi-recipient-switch/MULTI_RECIPIENT_SWITCH_AFTER_RESULTS.json`.

**OVERALL: PASS**

- Switch Evelyn → Robert: header + `data-active-recipient=cr-robert`  
- No Evelyn name in Robert header  
- No BETA work on Robert  
- ALPHA appointment visible on Robert  
- Switch back clean  
- Session restore shell PASS  
- Switcher still lists both  

## Evidence

`docs/incidents/evidence/multi-recipient-switch-after/`
