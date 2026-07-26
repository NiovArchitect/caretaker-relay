# CARETAKER RELAY — LOGO REFINEMENT REVIEW

**Date:** 2026-07-26  
**Current emblem SHA:** `3645fd208649ad0202cdc1e3e648e8c289878556`  
**Current logo status:** **REJECTED** (founder)

## CURRENT LOGO
**REJECTED**

## CURRENT PROBLEMS (from rendered login + header evidence)

1. Central gold figure reads as a **map pin / location marker**, not a person.  
2. Supporting “hands” read as **claw-like / blob anatomy**, not support.  
3. Ring is **fragmented** with uneven weight and a pasted arrowhead.  
4. Too many competing shapes for <1s recognition.  
5. Collapses at small sizes; fails monochrome clarity.  
6. Premium ambient-AI product + generic stock-icon mark mismatch.  
7. Technical pass (tests/deploy) did **not** equal visual success.

Evidence: `docs/design/screenshots/logo-release/01-login-logo.png`, `03-header-logo.png`

## TEMPORARY LIVE DECISION
**Wordmark-only fallback** (refined typography) + **micro-mark favicon** (open ring + center only).

- Product chrome: no rejected emblem, no A/B/C until founder selects.  
- Prefer clean wordmark over a bad symbol.

## Comparison page
`docs/design/logo-refinement/comparison.html`  
Open locally in a browser for full size/monochrome matrix.

## OPTION A — Protected Relay
**Preview:** comparison.html `#opt-a`  
Center protected point, one supportive lower curve, one open relay arc. Max three primary shapes. No hands, no pin body, no triangle arrow.

## OPTION B — Human Continuity
**Preview:** comparison.html `#opt-b`  
Soft human (head + rounded body) + two interlocking handoff paths. No arrowhead.

## OPTION C — Relay Monogram
**Preview:** comparison.html `#opt-c`  
Abstract open C, protected center, continuity arc. Strongest favicon geometry.

## FAVICON OPTIONS
**Preview:** comparison.html section “Favicon micro-marks”  
Dedicated micro (ring + center); C@16; A@16.

## WORDMARK OPTIONS
**Preview:** comparison.html section “Wordmark options”  
W1 dual ink/teal · W2 single ink · W3 dark surface.

## AGENCY AGENT SCORES
See comparison.html table (totals /50):

| | Rejected | A | B | C | Wordmark |
|--|--|--|--|--|--|
| **Total** | **15** | **40** | **38** | **38** | **35** |

## RECOMMENDED OPTION
**A — Protected Relay**, with **C/micro** for favicon.  
Highest score; calm; monochrome-capable; no pin/claw artifacts.

## FOUNDER DECISION REQUIRED
**RESOLVED — A**

Founder selected **Option A (Protected Relay)** on 2026-07-26.

## PRODUCTION FOLLOW-THROUGH
- Runtime mark: `LogoOptionA` via `CaretakerRelaySymbol`
- Lockups: symbol + refined wordmark (login stacked, header horizontal)
- Favicon: micro-mark (open ring + protected center)
- App icon: Option A scaled
- Options B/C retained in `logoRefinements.tsx` for history only

## BACKGROUND WORKERS
**0**
