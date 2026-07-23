# Caretaker Relay — Continuity Index

**Read in this order in a new session (zero chat history).**

| # | Document | Why |
| --- | --- | --- |
| 1 | `docs/CARETAKER_RELAY_MASTER_CONTINUITY.md` | Full handoff: what/why/where/SHAs/gate/do-nots |
| 2 | `docs/CARETAKER_RELAY_CURRENT_STATE.json` | Machine-readable recovery state |
| 3 | `docs/PRODUCT_CONSTITUTION_GAP_AUDIT.md` | Track 1 constitution audit vs product |
| 4 | `docs/ACL_TRACK1_TRACEABILITY.md` | Judging criteria ↔ capabilities |
| 5 | `docs/TRACK1_JUDGE_LOOP_EXTERNAL_REVIEW.md` | Judge Loop implementation + lab evidence |
| 6 | `docs/research/FIRST_CAREGIVER_RESEARCH_EXTERNAL_REVIEW.md` | Research methodology package |
| 7 | `docs/research/SESSION_1_ACTIVATION_EXTERNAL_REVIEW.md` | Founder decisions / Session 1 blockers |
| 8 | `docs/research/RESEARCH_BUILD_MANIFEST.md` | Frozen product SHAs for research |
| 9 | `docs/research/SESSION_1_MODERATOR_CARD.md` | One-page session runtime (when authorized) |
| 10 | `docs/research/SESSION_1_EXECUTION_GATE.md` | Go/no-go checklist for Session 1 |
| 11 | `docs/research/FOUNDER_DECISIONS_SESSION_1.md` | Resolved founder operational decisions |
| 12 | `docs/research/SESSION_1_READINESS_GATE.md` | Infrastructure vs recruitment status |
| 13 | `docs/ONLINE_DEPLOYMENT_ARCHITECTURE.md` | Internet product architecture (not Mac-local) |
| 14 | `docs/ONLINE_READINESS_MATRIX.md` | Online component gap matrix |

## Quick Git checks

```bash
cd "/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay"
git rev-parse HEAD
git merge-base --is-ancestor ff95159d8803feaca0e6e245d5a77ee28ee40c99 HEAD && echo product_freeze_ok
git diff --name-only ff95159..HEAD -- src   # should be empty while frozen

cd "/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation"
git rev-parse HEAD   # expect 9182c7511c1ffae9dc79082297ae92d7a5079b1a while frozen
```

## Current gate (summary)

**Session 1 BLOCKED** until founder decisions (consent, storage, retention, IRB-if-any) + real caregiver recruitment.  
**Do not** start product redesign or Session 1 without founder instruction.

## Evidence honesty

`CAREGIVER INPUT = NONE` · `CARE RECIPIENT INPUT = NONE` · `VALIDATED = NONE`
