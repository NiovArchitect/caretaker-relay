# FINAL RELAY SERVER PARITY BASELINE

Recorded: 2026-07-29T23:33:47Z

## Repositories

| Repo | Root | Branch | HEAD |
|------|------|--------|------|
| App (caretaker-relay) | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay` | `checkpoint/caretaker-relay-track1-2026-07-22` | `90a7441193faa51971892d6ce722444a6c8a2cd1` |
| API (caretaker-relay-foundation) | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation` | `checkpoint/caretaker-relay-track1-2026-07-22` | `b6fa721571a0ade0a0d9c096067f3d11dfd13357` |

## Public runtime (at baseline write)

| Surface | Value |
|---------|-------|
| App URL | https://care.niovlabs.com |
| API URL | https://caretaker-relay-care-api.onrender.com |
| App public deploy | `95b5e687a8b428ed351719c3e194d4969a9d2f50` status=live (dep-d9l8a4710e5c73d6i74g) |
| App bundle | `assets/index-C6YYw37E.js` |
| API public deploy | `b6fa721571a0ade0a0d9c096067f3d11dfd13357` status=live (dep-d9l8pl7lk1mc7389vk80) |
| Prior API deploy | `4394cc53d18bba015ce7220865a91cc58c138176` |
| Campaign-start Foundation HEAD | `a7916e9` |

## Verified at campaign start vs now

- Campaign-start claimed app source: `95b5e687` — public web still on that SHA until next app deploy.
- Campaign-start claimed API: `4394cc5` — **superseded** by live `b6fa721` (operating-plan intent + sanitizer).
- Follow-up local Foundation fix (not yet deployed): TASKS_NOW exclusive plan must not include CHANGES_TODAY (composeAnswer early-return bug); next-caregiver action exclusion.

## Diff prior API → current Foundation HEAD (stat)

```
packages/care-domain/src/relay/answer-engine.ts | 10 +++++++++
 packages/care-domain/src/relay/intents.ts       | 18 +++++++++++++++++
 packages/care-domain/src/relay/util.ts          | 27 +++++++++++++++++++++++++
 3 files changed, 55 insertions(+)
```

## Background workers

0 (phase boundary)

## Dirty state

### App
```
## checkpoint/caretaker-relay-track1-2026-07-22...origin/checkpoint/caretaker-relay-track1-2026-07-22
 M AGENTS.md
 M docs/incidents/evidence/mobile-half-screen-after/390x844-today.png
 M docs/reviews/AGENT_ZERO_FINAL_FREEZE_DECISION.md
 M docs/reviews/COHERENT_CARE_MASTER_COMPLETION_MATRIX.md
 M e2e/jump-latest-torture.spec.ts
 M evidence/phase1/validation/playwright-raw.json
 M scripts/holistic-e2e-closure-smoke.mjs
 M src/lib/humanCopy.ts
 M src/lib/relay/answerEngine.ts
 M vendor/care-domain/src/relay/answer-engine.ts
 M vendor/care-domain/src/relay/util.ts
?? docs/agent-zero/
?? docs/data/HANDOFF_LIFECYCLE_INVENTORY.md
?? docs/data/MARCUS_EVELYN_VISIBLE_DATA_LINEAGE_AUDIT.md
?? docs/design/PREMIUM_FINISH_RELEASE.md
?? docs/design/screenshots/care-1366.png
?? docs/design/screenshots/care-1920.png
?? docs/design/screenshots/care-390.png
?? docs/design/screenshots/care-768.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-desktop-1366-landing-today-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-desktop-1366-landing-today-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-desktop-1366-landing-today.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-desktop-1366-privacy.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-desktop-1366-today-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-desktop-1366-today-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-desktop-1366-today.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-mobile-390-landing-today-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-mobile-390-landing-today-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-mobile-390-landing-today.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-mobile-390-relay-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-mobile-390-relay-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-mobile-390-relay.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-mobile-390-today-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-mobile-390-today-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/daniel-dsp-mobile-390-today.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-care-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-care-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-care.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-documents.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-landing-today-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-landing-today-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-landing-today.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-people-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-people-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-people.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-privacy-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-privacy-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-privacy.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-today-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-today-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-desktop-1366-today.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-care-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-care-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-care.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-documents.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-landing-today-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-landing-today-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-landing-today.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-people-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-people-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-people.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-relay-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-relay-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-relay.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-today-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-today-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/marcus-caregiver-mobile-390-today.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-care-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-care-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-care.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-documents.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-landing-today-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-landing-today-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-landing-today.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-people-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-people-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-people.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-privacy.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-today-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-today-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-desktop-1366-today.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-care-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-care-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-care.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-documents.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-landing-today-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-landing-today-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-landing-today.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-people-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-people-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-people.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-relay-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-relay-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-relay.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-today-bottom.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-today-mid.png
?? docs/design/screenshots/care-recipient-clarity-before/maya-caregiver-mobile-390-today.png
?? docs/design/screenshots/documents-1366.png
?? docs/design/screenshots/documents-1920.png
?? docs/design/screenshots/documents-390.png
?? docs/design/screenshots/documents-768.png
?? docs/design/screenshots/human-readable-public-smoke/
?? docs/design/screenshots/login-center-1366.png
?? docs/design/screenshots/login-center-1440.png
?? docs/design/screenshots/login-center-1920.png
?? docs/design/screenshots/logo-option-a/
?? docs/design/screenshots/logo-release/
?? docs/design/screenshots/orb-soft-translucent/
?? docs/design/screenshots/people-1366.png
?? docs/design/screenshots/people-1920.png
?? docs/design/screenshots/people-390.png
?? docs/design/screenshots/people-768.png
?? docs/design/screenshots/public-login-centered-1366.png
?? docs/design/screenshots/public-login-centered-1440.png
?? docs/design/screenshots/public-login-centered-1920.png
?? docs/design/screenshots/public-login-centered-390.png
?? docs/design/screenshots/public-login-debug-1440.png
?? docs/design/screenshots/public-login-glass-1440.png
?? docs/design/screenshots/public-login-glass-1920.png
?? docs/design/screenshots/public-login-glass-390.png
?? docs/design/screenshots/public-login-glass-final-1440.png
?? docs/design/screenshots/public-premium-smoke/
?? docs/design/screenshots/public-v2/
?? docs/design/screenshots/public/
?? docs/design/screenshots/relay-1366.png
?? docs/design/screenshots/relay-1920.png
?? docs/design/screenshots/relay-390.png
?? docs/design/screenshots/relay-768.png
?? docs/design/screenshots/secure-onboarding/
?? docs/design/screenshots/today-1366.png
?? docs/incidents/FINAL_ROLE_ATTENTION_ESCALATION_BASELINE.md
?? docs/incidents/evidence/final-intent-signal-after/
?? docs/incidents/evidence/mobile-half-screen-after/1024x768-tab-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/1024x768-tab-today.png
?? docs/incidents/evidence/mobile-half-screen-after/320x568-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/320x568-today.png
?? docs/incidents/evidence/mobile-half-screen-after/360x800-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/360x800-today.png
?? docs/incidents/evidence/mobile-half-screen-after/375x667-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/375x667-today.png
?? docs/incidents/evidence/mobile-half-screen-after/390x844-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/393x852-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/393x852-today.png
?? docs/incidents/evidence/mobile-half-screen-after/412x915-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/412x915-today.png
?? docs/incidents/evidence/mobile-half-screen-after/430x932-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/430x932-today.png
?? docs/incidents/evidence/mobile-half-screen-after/568x320-land-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/568x320-land-today.png
?? docs/incidents/evidence/mobile-half-screen-after/667x375-land-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/667x375-land-today.png
?? docs/incidents/evidence/mobile-half-screen-after/768x1024-tab-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/768x1024-tab-today.png
?? docs/incidents/evidence/mobile-half-screen-after/820x1180-tab-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/820x1180-tab-today.png
?? docs/incidents/evidence/mobile-half-screen-after/844x390-land-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/844x390-land-today.png
?? docs/incidents/evidence/mobile-half-screen-after/915x412-land-today-full.png
?? docs/incidents/evidence/mobile-half-screen-after/915x412-land-today.png
?? docs/incidents/evidence/mobile-half-screen-after/PUBLIC_SMOKE.json
?? docs/incidents/evidence/mobile-half-screen-after/login-debug.png
?? docs/incidents/evidence/mobile-half-screen-after/public-care-390.png
?? docs/incidents/evidence/mobile-half-screen-after/public-documents-390.png
?? docs/incidents/evidence/mobile-half-screen-after/public-people-390.png
?? docs/incidents/evidence/mobile-half-screen-after/public-privacy-390.png
?? docs/incidents/evidence/mobile-half-screen-after/public-today-390.png
?? docs/incidents/evidence/mobile-half-screen-after/route-documents-390.png
?? docs/incidents/evidence/mobile-half-screen-after/route-people-390.png
?? docs/incidents/evidence/mobile-half-screen-after/route-privacy-390.png
?? docs/incidents/evidence/mobile-half-screen-after/route-relay-open-390.png
?? docs/incidents/evidence/mobile-half-screen-before/landscape-844x390.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-320x568-full.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-320x568.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-360x800-full.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-360x800.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-375x667-full.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-375x667.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-390x844-full.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-393x852-full.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-393x852.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-412x915-full.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-412x915.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-430x932-full.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-430x932.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-568x320-full.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-568x320.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-768x1024-full.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-768x1024.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-844x390-full.png
?? docs/incidents/evidence/mobile-half-screen-before/viewport-844x390.png
?? docs/incidents/evidence/p0-desktop-relay-missing/1280x720-after-scroll.png
?? docs/incidents/evidence/p0-desktop-relay-missing/1280x720-at-top.png
?? docs/incidents/evidence/p0-desktop-relay-missing/1366x768-after-scroll.png
?? docs/incidents/evidence/p0-desktop-relay-missing/1366x768-at-top.png
?? docs/incidents/evidence/p0-desktop-relay-missing/1440x900-after-scroll.png
?? docs/incidents/evidence/p0-desktop-relay-missing/1440x900-at-top.png
?? docs/incidents/evidence/p0-desktop-relay-missing/1512x982-after-scroll.png
?? docs/incidents/evidence/p0-desktop-relay-missing/1512x982-at-top.png
?? docs/incidents/evidence/p0-desktop-relay-missing/1920x1080-after-scroll.png
?? docs/incidents/evidence/p0-desktop-relay-missing/1920x1080-at-top.png
?? docs/incidents/evidence/p0-desktop-relay-missing/LOCAL_VERIFY.json
?? docs/incidents/evidence/p0-desktop-relay-missing/debug-local.png
?? docs/incidents/evidence/p0-relay-canned-after/
?? docs/incidents/evidence/relay-anchor-after/PUBLIC_SMOKE.json
?? docs/incidents/evidence/relay-anchor-after/SMOKE.json
?? docs/incidents/evidence/relay-anchor-after/SMOKE2.json
?? docs/incidents/evidence/relay-anchor-after/public-relay-390.png
?? docs/incidents/evidence/relay-anchor-after/public-today-390.png
?? docs/reviews/ACL_FINAL_JUDGE_READINESS_REASSESSMENT.md
?? docs/reviews/AGENT_ZERO_FINAL_COVERAGE_HANDOFF_APPOINTMENT_SCORECARD.md
?? docs/reviews/AGENT_ZERO_FINAL_NEXT_CAREGIVER_ROLE_BROWSER_SCORECARD.md
?? docs/reviews/AGENT_ZERO_FINAL_ROLE_ATTENTION_ESCALATION_SCORECARD.md
?? docs/reviews/AGENT_ZERO_RECIPIENT_SHIFT_HANDOFF_SIGNAL_SCORECARD.md
?? docs/reviews/FINAL_PUBLIC_BROWSER_CLOSURE_MATRIX.md
?? docs/reviews/FINAL_PUBLIC_BROWSER_SESSION_JUDGE_CLOSURE.md
?? docs/testing/CARE_COVERAGE_TIMELINE_AFTER.json
?? docs/testing/FINAL_A11Y_KEYBOARD_SR_SMOKE.json
?? docs/testing/FINAL_NEXT_CAREGIVER_ROLE_BROWSER_PROOF.json
?? docs/testing/FINAL_RELAY_FOUNDER_MATRIX_AFTER.json
?? docs/testing/FINAL_ROLE_ATTENTION_ESCALATION_SMOKE.json
?? docs/testing/FINAL_ROLE_ATTENTION_ESCALATION_SMOKE_FINAL.json
?? docs/testing/FINAL_ROLE_ATTENTION_ESCALATION_SMOKE_V2.json
?? docs/testing/HANDOFF_LIFECYCLE_INVENTORY.json
?? docs/testing/MULTI_ROLE_FINAL_JOURNEY.json
?? docs/testing/RECIPIENT_DATA_SPACE_ISOLATION_RESULTS.json
?? docs/testing/WORK_ATTENTION_ELIGIBILITY_AUDIT.json
?? docs/testing/login-repro/
?? e2e/final-public-browser-closure.spec.ts
?? e2e/helpers/jump-latest-telemetry.ts
?? e2e/judge-final-verification.spec.ts
?? memory-bank/
?? scripts/_dsp_browser_journey.mjs
?? scripts/_jl_single_failure_diag.mjs
?? scripts/agent-zero-independent-smoke.mjs
?? scripts/build_chatgpt_single_file_export.py
?? scripts/care-recipient-screenshot-census.mjs
?? scripts/judge-torture-bank-execute.mjs
?? scripts/jump-latest-bounded-11.mjs
?? scripts/jump-latest-harness-smoke.mjs
```

### Foundation
```
## checkpoint/caretaker-relay-track1-2026-07-22...origin/checkpoint/caretaker-relay-track1-2026-07-22
 M packages/care-domain/src/relay/answer-engine.ts
?? scripts/judge-browser-journeys.mjs
```

## Lab principals (synthetic)

- Family caregiver Marcus Carter: `p-sadeil` / `sadeil-lab-password`
- Care recipient Evelyn Carter: `cr-olivia`
- Caregiver Maya: `p-maya` / `maya-lab-password`
- DSP Walter: `p-walter` / `walter-lab-password`
- Clinician Dr Shah: `p-dr-shah` / `drshah-lab-password`

Do not treat these as PHI production identities.
