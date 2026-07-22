# Emergency Checkpoint — 2026-07-22

## Purpose

Preserve the validated Caretaker Relay Track 1 engineering state **before** any ACL Track 1 Product Constitution / UI redesign work, recoverable from **remote Git** if the local machine crashes.

**Emergency preservation checkpoint only — not a product release.**

## Repositories

### 1. Caretaker Relay app

| Field | Value |
| --- | --- |
| Path | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay` |
| Branch | `checkpoint/caretaker-relay-track1-2026-07-22` |
| Commit SHA | `f3feb6a9fbb3b7e516c7cd9ac179a82241a6b5c1` |
| Remote | `https://github.com/NiovArchitect/caretaker-relay.git` (private) |
| Push verified | **YES** |
| Scope | Caregiver app UI, HTTP Foundation client, Playwright browser E2E, Phase 1 evidence/docs |

### 2. Caretaker Relay Foundation (working copy)

| Field | Value |
| --- | --- |
| Path | `/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation` |
| Branch | `checkpoint/caretaker-relay-track1-2026-07-22` |
| Commit SHA | `fed2f594f7a39c02961d3ecdbe8f60d26363c255` |
| Remote | `https://github.com/NiovArchitect/caretaker-relay-foundation.git` (private) |
| Push verified | **YES** |
| Scope | care-domain, Care API, Prisma store, stress harness, dose-units P1 fix, lifecycle scripts |
| Note | **Independent** of original `niov-foundation` (untouched). |

### 3. Intentionally untouched

- `niov-foundation` original substrate — not modified; not pushed to
- Otzar / AVP / federation-cloud

## Campaign state (truthful)

| Item | Status |
| --- | --- |
| Brutal real-stack stress V1 | **68 scenarios PASS** |
| Medication unit P1 (CR-STRESS-030) | **CLOSED** — dose-units; strong `expectDisc: true` |
| Unresolved P0 | **0** |
| Unresolved P1 | **0** |
| Real browser DOM E2E | **PROVEN** — Playwright 18/18 |
| Live remote model | **BLOCKED_CREDENTIALS** |
| Physical mic | **MANUAL_NOT_AUTOMATABLE** |
| Overall TRL | **TRL 3** |

## Track 1 / Track 2 firewall

**ACL Caregiver AI Challenge — TRACK 1 — AI Tools to Support Caregivers — PHASE 1 — Design**

Track 1 and Track 2 are separate concurrent tracks. Caretaker Relay must **NOT** drift into Track 2 workforce-management. Foundation may remain extensible, but Track 2 workflows must not be exposed merely because Foundation can support them. **No redesign** until Product Constitution is supplied.

## NEXT INTENDED ACTION

**Establish the ACL Track 1 Caretaker Relay Product Constitution and Track 1/Track 2 firewall before further UI/product development.**

## Recovery

```bash
git clone https://github.com/NiovArchitect/caretaker-relay.git
cd caretaker-relay && git checkout checkpoint/caretaker-relay-track1-2026-07-22

git clone https://github.com/NiovArchitect/caretaker-relay-foundation.git
cd caretaker-relay-foundation && git checkout checkpoint/caretaker-relay-track1-2026-07-22
# foundation SHA: fed2f594f7a39c02961d3ecdbe8f60d26363c255
```
