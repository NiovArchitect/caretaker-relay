# Caretaker Relay — Continuity Index

**Read in this order in a new session (zero chat history).**

| # | Document | Why |
| --- | --- | --- |
| 1 | `docs/CARETAKER_RELAY_MASTER_CONTINUITY.md` | Full handoff: what/why/where/SHAs/gate/do-nots |
| 2 | `docs/CARETAKER_RELAY_CURRENT_STATE.json` | Machine-readable recovery state |
| 3 | `docs/ONLINE_READINESS_CURRENT_STATE.md` | **Authoritative online-readiness audit boundary** (read before any deploy) |
| 4 | `docs/PRODUCT_CONSTITUTION_GAP_AUDIT.md` | Track 1 constitution audit vs product |
| 5 | `docs/ACL_TRACK1_TRACEABILITY.md` | Judging criteria ↔ capabilities |
| 6 | `docs/TRACK1_JUDGE_LOOP_EXTERNAL_REVIEW.md` | Judge Loop implementation + lab evidence |
| 7 | `docs/research/FIRST_CAREGIVER_RESEARCH_EXTERNAL_REVIEW.md` | Research methodology package |
| 8 | `docs/research/SESSION_1_ACTIVATION_EXTERNAL_REVIEW.md` | Founder decisions / Session 1 blockers |
| 9 | `docs/research/RESEARCH_BUILD_MANIFEST.md` | Frozen product SHAs for research |
| 10 | `docs/research/SESSION_1_MODERATOR_CARD.md` | One-page session runtime (when authorized) |
| 11 | `docs/research/SESSION_1_EXECUTION_GATE.md` | Go/no-go checklist for Session 1 |
| 12 | `docs/research/FOUNDER_DECISIONS_SESSION_1.md` | Resolved founder operational decisions |
| 13 | `docs/research/SESSION_1_READINESS_GATE.md` | Infrastructure vs recruitment status |
| 14 | `docs/ONLINE_DEPLOYMENT_ARCHITECTURE.md` | Internet product architecture (not Mac-local) |
| 15 | `docs/ONLINE_READINESS_MATRIX.md` | Online component gap matrix |
| 16 | `docs/PUBLIC_JUDGE_AND_CAREGIVER_ENTRY.md` | Judge + caregiver one-URL entry flows |

## Quick Git checks

```bash
cd "/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay"
git rev-parse HEAD
git merge-base --is-ancestor ff95159d8803feaca0e6e245d5a77ee28ee40c99 HEAD && echo product_freeze_ok
git diff --name-only ff95159..HEAD -- src   # should be empty while frozen

cd "/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation"
git rev-parse HEAD
# Product freeze: 9182c7511c1ffae9dc79082297ae92d7a5079b1a
# Deploy scaffold may sit above freeze (Dockerfile.care / CORS / blueprint only)
```

## Current gate (summary)

**ONLINE RESEARCH ENVIRONMENT: READY**  
**Canonical app:** https://care.niovlabs.com  
**Recruitment:** **ACTIVE** (Caregiver #1 authorized) — 0 invited / 0 scheduled / 0 completed  
**Session 1:** NOT STARTED  
**Product:** FROZEN during Session 1  
**Do not** automate participant contact · **Do not** put identifying data in Git  
**Do not touch Otzar Render resources** on the same workspace.

Authoritative online detail: `docs/ONLINE_READINESS_CURRENT_STATE.md`

## Evidence honesty

`CAREGIVER INPUT = NONE` · `CARE RECIPIENT INPUT = NONE` · `VALIDATED = NONE`
