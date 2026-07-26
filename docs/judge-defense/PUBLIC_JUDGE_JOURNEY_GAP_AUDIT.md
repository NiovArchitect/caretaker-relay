# Public Judge Journey Gap Audit
**Date:** 2026-07-26
**URL:** https://care.niovlabs.com

## Proven
- App deploy SHA f02cfa2 (prior) with aha markers in JS bundle
- API health 200; login with care_person_id works via API
- Human-readable export path works after warm (~20s cold)

## Instability
- Headless Playwright login→app-shell can timeout (API cold / latency)
- Shared lab notifications inflate attention
- Role switch requires re-login

## Required for PASS
1. Warm API once before demo
2. Mark all read on notifications
3. Scripted multi-role path with evidence screenshots
4. Retry policy for headless smoke

## Classification
**PARTIAL** until multi-role journey re-run green after this pass.
