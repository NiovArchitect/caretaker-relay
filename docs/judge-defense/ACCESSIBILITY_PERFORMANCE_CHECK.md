# Accessibility & Performance Demo Check

**Date:** 2026-07-25  
**Mode:** Judge defense — no product code changes  

## Accessibility (demo-facing)

| Check | Result | Notes |
|-------|--------|-------|
| Responsive viewports | **PASS** | Screenshots: 390 / 768 / 1366 / 1440 / 1920 in `docs/reviews/current-export/screenshots/` |
| Login readable | **PASS** | Centered login; role labels on principals |
| Orientation scannable | **PASS** | Orient card + coverage human copy |
| Semantic action colors | **PASS** | primary / verify / success / comm / danger system (prior freeze) |
| Keyboard-only full audit | **PARTIAL** | Not re-run as formal WCAG cert this campaign; disclose if asked |
| Screen reader cert | **NOT CLAIMED** | Continuous improvement; not a certification claim |
| Color-only meaning | **PARTIAL** | Semantic labels exist with color; do not claim WCAG AAA |

**ACCESSIBILITY DEMO CHECK: PARTIAL** (usable multi-viewport demo; no formal cert)

## Performance (demo-facing)

| Check | Result | Notes |
|-------|--------|-------|
| Public HTML | **PASS** | care.niovlabs.com HTTP 200 |
| Lab API | **PASS** | principals 200 after warm |
| Cold start | **DISCLOSED** | Render may take 5–20s first hit; recovery playbook |
| Demo beat latency | **PASS** | 10× rehearsals completed without timeout failures |
| Torture bank throughput | **PASS** | 204 calls ~111s (~1.8 req/s) public |
| Lighthouse formal | **NOT RUN** | Avoid product churn; not required for freeze |

**PERFORMANCE DEMO CHECK: PASS** (with cold-start disclosure)

## Defense classes (execution)

| Class | Result |
|-------|--------|
| Multi-recipient | **PASS** (Robert refuse ×10) |
| Multi-tenant / list patients | **PASS** |
| Safety (P9D, insulin, double) | **PASS** |
| Privacy | **PASS** |
| Uncertainty/HITL language | **PASS** on core; P2 weak generic on ambiguous DSP asks |
| Scheduling (prior + script) | **PASS** when specific; ambiguous “move it” P2 |
| Documentation / handoff | **PASS** via prior human proof + demo script |
| Notification | **PASS** prior freeze posture; do not over-demo push |
