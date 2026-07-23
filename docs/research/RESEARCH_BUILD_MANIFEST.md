# Research Build Manifest — First Caregiver Research Cycle

**Status:** FROZEN for Session 1+  
**Date recorded:** 2026-07-22  
**Product state under test:** Track 1 Judge Loop — Care Without Re-Explaining (`PASS` as lab product)

## Frozen commits (do not silently change during sessions)

| Component | Repository | Branch | Commit SHA |
| --- | --- | --- | --- |
| **App** | `caretaker-relay` | `checkpoint/caretaker-relay-track1-2026-07-22` | `ff95159d8803feaca0e6e245d5a77ee28ee40c99` |
| **Foundation** | `caretaker-relay-foundation` | `checkpoint/caretaker-relay-track1-2026-07-22` | `9182c7511c1ffae9dc79082297ae92d7a5079b1a` |
| Original `niov-foundation` | not under test | — | untouched by Caretaker work |

**Rule:** Any product change after Session 1 starts must cite a research FINDING ID → design decision → change → retest. Do not polish hypotheses mid-cycle.

## What participants are seeing

| Item | Value |
| --- | --- |
| Product | Caretaker Relay |
| Primary surfaces | Today · Care · Circle · Relay · Verify · Handoff · Composer |
| Hero scenario | Family caregiver **Sadeil** supporting **Olivia** |
| Scenario data | **Synthetic only** — not real PHI |
| Understand mode | **Fixture** (deterministic lab extract) by default |
| Live remote Anthropic/OpenAI | **BLOCKED_CREDENTIALS** — not claimed validated |
| Physical microphone | **MANUAL_NOT_AUTOMATABLE** in lab; browser STT may work on some devices; **not** claimed reliable |
| Persistence | Lab Care API + isolated Prisma when stack running |
| Auth | Lab principals (e.g. Sadeil); server-authoritative access |

## Known limitations (tell moderator; do not hide)

1. Not production multi-household SaaS.  
2. Understand path is fixture-backed in the research stack (still multi-event + real verify/confirm/persist).  
3. Physical mic reliability is unproven.  
4. Care-recipient control UI is thin.  
5. Maya continuity is prepared from primary path — not a full separate Maya login product.  
6. No real caregiver validation yet — this freeze exists so validation can begin.

## Evidence class of this build

| Class | Status |
| --- | --- |
| `[LAB RESULT]` | Judge loop implementation + automated tests |
| `[CAREGIVER INPUT]` | **NONE** until Session 1+ |
| `[CARE RECIPIENT INPUT]` | **NONE** |
| `[VALIDATED]` | **NONE** |

## How to boot the research stack (operator)

See `docs/PHASE1_DEMO_SCRIPT.md` and `docs/JUDGE_LOOP_SLICE_2026-07-22.md`.  
Typical lab ports: Care API **3100**, app **5180**, Postgres **5434**.

## Change control

| Allowed during research cycle | Not allowed mid-session without new FINDING |
| --- | --- |
| Research docs, notes, findings register | Silent UI polish |
| Partnership prep (no false claims) | Track 2 features |
| Bug fix that **blocks** sessions (document as P0 ops) | “While we’re here” redesign |

If a blocking bug is fixed mid-cycle, record the new SHA in this manifest as **Research build amendment** with reason and date — never silently.

## Session 1 operational defaults (activation pack)

| Item | Default |
| --- | --- |
| Audio / video / screen recording | **OFF** |
| Notes | Moderator observation + timings + counts |
| Quotes | Only with separate permission |
| Private notes storage | **Founder must select** — see `RESEARCH_DATA_HANDLING_PROTOCOL.md` |
| Consent | Draft template for founder review — see `PARTICIPANT_INFORMATION_AND_CONSENT_TEMPLATE.md` |
| Outreach | Templates ready; **not sent** by automation |

Session 1 remains **not authorized** until founder decisions in `SESSION_1_READINESS_GATE.md` are closed and a participant is scheduled.
