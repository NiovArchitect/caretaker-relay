# Caretaker Relay — Online Readiness Current State

**Updated:** 2026-07-23  
**Status:** **ONLINE RESEARCH ENVIRONMENT READY** (public smoke proven)  
**Recruitment:** **PAUSED** (founder must authorize Caregiver #1)  
**Do not resume from chat memory.** Resume from this file + continuity docs + Git.

---

## Executive summary

| Item | State |
| --- | --- |
| Online research environment | **READY** |
| Public application URL | `https://caretaker-relay-web.onrender.com` |
| Public API URL | `https://caretaker-relay-care-api.onrender.com` |
| Render access | **WORKING** via Render CLI OAuth (`~/.render/cli.yaml`). Shell `RENDER_API_KEY` remains **stale 401** if set — **unset it** when using CLI. |
| Database | Render Postgres **`caretaker-relay-db`** (isolated; schema applied) |
| Auth | Foundation AuthService JWT + seeded lab principals |
| Understand mode | **fixture-backed** (`CARE_UNDERSTAND_MODE=fixture`) |
| Custom domain | **Not required yet** (onrender.com URLs in use) |
| Recruitment | **PAUSED** |

**Current gate:** `ONLINE_RESEARCH_ENVIRONMENT_READY_RECRUITMENT_PAUSED`  
**Next authorized action:** Founder may authorize caregiver recruitment.

---

## Canonical resource inventory (Caretaker Relay only)

| Resource | Name | ID | Notes |
| --- | --- | --- | --- |
| Web | `caretaker-relay-web` | `srv-d9h0l2n41pts73dksrmg` | Static site; branch `checkpoint/caretaker-relay-track1-2026-07-22` |
| Care API | `caretaker-relay-care-api` | `srv-d9h0ku3bc2fs739eo660` | Docker `Dockerfile.care` |
| Database | `caretaker-relay-db` | `dpg-d9h0ifjeo5us73d0l0eg-a` | DB name `caretaker_relay`; region oregon; plan basic_256mb |
| Workspace | My Workspace | `tea-d8t15kurnols73a0v2e0` | Shared account; **do not modify Otzar resources** |

**DO NOT TOUCH (other apps on same workspace):**

| Resource | Name | ID |
| --- | --- | --- |
| Otzar API | `otzar-api` | `srv-d8t17sm7r5hc73ed5h6g` |
| Otzar app | `otzar-app` | `srv-d8t1qpj7uimc73db2il0` |
| Otzar redis | `otzar-redis` | `red-d8t1pce8bjmc73e6msag` |
| Otzar postgres | `otzar-postgres` | `dpg-d9chaemcjfls73dei7ug-a` |

---

## Public URLs

| Role | URL |
| --- | --- |
| App | https://caretaker-relay-web.onrender.com |
| API | https://caretaker-relay-care-api.onrender.com |
| Health | https://caretaker-relay-care-api.onrender.com/api/v1/health |

---

## Git / deploy SHAs

| Component | SHA | Note |
| --- | --- | --- |
| Product freeze app | `ff95159d8803feaca0e6e245d5a77ee28ee40c99` | Judge Loop semantics |
| Product freeze foundation | `9182c7511c1ffae9dc79082297ae92d7a5079b1a` | Care domain freeze |
| App deploy tip | `b9f9b3e6710545a46954f0d65d58d3b69dce3c0c` | docs/scaffold (src still frozen) |
| Foundation deploy tip | `ccd887b240902bd7ad21c068cd11b60cfa878e85` | Dockerfile.care bcrypt fix |

Repos: temporarily set **public** so Render could fetch (Otzar pattern). Re-private after granting Render GitHub App access if desired.

---

## Secrets configured (names only — never values)

| Secret | Configured | Target |
| --- | --- | --- |
| `DATABASE_URL` | YES | caretaker-relay-care-api |
| `DIRECT_URL` | YES | caretaker-relay-care-api |
| `JWT_SECRET` | YES | caretaker-relay-care-api |
| `CARETAKER_APP_URL` | YES | `https://caretaker-relay-web.onrender.com` |
| `CARE_CORS_ORIGINS` | YES | web origin |
| `VITE_CARE_API_URL` | YES | web build → public Care API |
| Shell `RENDER_API_KEY` | STALE (401) | Prefer CLI OAuth; unset env key |

---

## Public smoke results (2026-07-23)

| Check | Result |
| --- | --- |
| Public HTTPS app | PASS (200 HTML; SPA assets load) |
| Public HTTPS API health | PASS (`ok:true`, prisma, durable) |
| No localhost in web bundle | PASS (baked `caretaker-relay-care-api.onrender.com`) |
| CORS web→API | PASS |
| Sadeil login | PASS (foundation_auth_service) |
| Maya login + Olivia today | PASS |
| Unauthorized / other-hh Olivia | PASS (403 `NO_RELATIONSHIP`) |
| No token | PASS (401) |
| Understand multi-event fixture | PASS |
| Medication ambiguity | PASS (UNCERTAIN; **0** confirmed med administrations) |
| Confirm / Today update | PASS |
| Correction | PASS (superseding event) |
| Handoff | PASS (Sadeil→Maya) |
| Reload / re-login | PASS |
| Service restart persistence | PASS (events remain after restart) |
| Live remote LLM | **NOT RUN** — fixture mode |

---

## Incident fixes during deploy (same services, no duplicates)

1. **Render API 401** — stale shell `RENDER_API_KEY`; fixed via `render login` OAuth CLI.  
2. **Private GitHub unfetchable** — Caretaker repos made public for Render fetch.  
3. **Dockerfile COPY shell redirect** — BuildKit failure; fixed.  
4. **Missing bcrypt** — nested `packages/auth/node_modules` copy + native toolchain.  
5. **Empty schema** — one-time `prisma db push` to **only** `caretaker-relay-db` / `caretaker_relay` (not Otzar).

---

## Minimum online research environment — satisfied

public HTTPS app · real Care API · durable Prisma · auth/session isolation · synthetic Olivia household · Judge Loop path · verify/confirm · correction · handoff · reload/restart continuity · unauthorized denial.

**Resend / custom domain / Cloudflare:** not required for this gate.

---

## Founder next step (recruitment only)

Recruitment remains **PAUSED** until founder explicitly authorizes Caregiver #1 outreach.  
Research admin path `~/CaretakerRelayResearch` is **not** product hosting.

---

**End of online readiness current state.**
