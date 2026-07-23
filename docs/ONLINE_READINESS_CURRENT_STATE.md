# Caretaker Relay — Online Readiness Current State

**Checkpoint purpose:** Preserve exact online-readiness audit findings before context compaction.  
**Date:** 2026-07-23  
**Status:** ONLINE DEPLOYMENT AUDIT COMPLETED TO CURRENT BOUNDARY  
**Online research environment:** **NOT READY**  
**Recruitment:** **PAUSED**  
**Product redesign:** **NOT AUTHORIZED** by Render 401 (access blocker only)

**Do not resume deployment from chat memory.** Resume from this file + continuity docs + Git.

---

## Recovery order (cold context)

1. `docs/CARETAKER_RELAY_MASTER_CONTINUITY.md`
2. `docs/CARETAKER_RELAY_CURRENT_STATE.json`
3. `docs/CARETAKER_RELAY_CONTINUITY_INDEX.md`
4. **This file** (`docs/ONLINE_READINESS_CURRENT_STATE.md`)
5. Git inspect (branches, HEADs, remotes, status)
6. Re-verify external access (Render probe, etc.) — do not invent

---

## Executive summary

| Item | State |
| --- | --- |
| Product (Judge Loop) | Lab **PASS**; freeze SHAs intact |
| Research infrastructure (docs/private path) | **READY** |
| Online research environment (public HTTPS product) | **BLOCKED** |
| Public application URL | **NOT READY** (`null`) |
| Public API URL | **NOT READY** (`null`) |
| Render API access | **ACCESS BLOCKED** — HTTP **401 Unauthorized** |
| Online Postgres | **NOT PROVISIONED** for Caretaker |
| DNS / custom domain for product | **NOT APPLIED** for Caretaker Relay |
| Recruitment | **PAUSED** |
| Architecture redesign needed? | **NO** — design is scaffolded; credentials/DB missing |

**Current gate:** `ONLINE_RESEARCH_ENVIRONMENT_BLOCKED_FOUNDER_RENDER_DB_SECRETS`

**Next authorized action after founder resolves access:** Apply blueprints + secrets → public health + Judge Loop smoke → then founder may authorize recruitment.  
**Until then:** Do **not** deploy production, change DNS, recruit caregivers, or redesign the stack around the 401.

---

## 1. GitHub

| Field | Actual finding |
| --- | --- |
| **Current use** | Source of truth for app + foundation care clone; push/pull working under `NiovArchitect` |
| **App repo** | `https://github.com/NiovArchitect/caretaker-relay.git` |
| **Foundation repo** | `https://github.com/NiovArchitect/caretaker-relay-foundation.git` |
| **Branch (both)** | `checkpoint/caretaker-relay-track1-2026-07-22` |
| **App HEAD (at checkpoint write)** | `0bbdb0c892097cc2baf0528062cd68bc47676dcd` |
| **Foundation HEAD (at checkpoint write)** | `855c391ffe2dd69c08c92843943b842935f99494` |
| **Product freeze (do not regress semantics)** | App `ff95159d8803feaca0e6e245d5a77ee28ee40c99` · Foundation `9182c7511c1ffae9dc79082297ae92d7a5079b1a` |
| **`git diff freeze..HEAD -- src` (app)** | **Empty** (product UI/src frozen; deploy/docs only above freeze) |
| **gh auth** | Logged in as `NiovArchitect` (repo + workflow scopes) |
| **CI/CD (app)** | **No** `.github/workflows` in caretaker-relay |
| **CI/CD (foundation)** | Clone retains Otzar-oriented workflows (`ci.yml`, `deploy-production.yml`, etc.) — **not** proven as Caretaker online research deploy path |
| **Blueprint deploys** | Render blueprints set `autoDeploy: false` — **manual/controlled** first deploys intended |

**Protected (do not modify for Track 1):** `niov-foundation`, `otzar-*`

---

## 2. Render

### Configuration found (in repo)

| Artifact | Path | Role |
| --- | --- | --- |
| Web static blueprint | `caretaker-relay/render.yaml` | Service `caretaker-relay-web`, static runtime, `npm ci && npm run build`, publish `dist/`, SPA rewrite, `autoDeploy: false` |
| Care API blueprint | `caretaker-relay-foundation/render.caretaker-care.yaml` | Service `caretaker-relay-care-api`, Docker `Dockerfile.care`, health `/api/v1/health`, `autoDeploy: false` |
| Care Dockerfile | `caretaker-relay-foundation/Dockerfile.care` | Node 22 care-app; `npm --workspace @niov/api run care:start` |
| Legacy foundation blueprint | `caretaker-relay-foundation/render.yaml` | Full API / `server.ts` oriented — **prefer care blueprint for Track 1** |
| App Dockerfile | `caretaker-relay/Dockerfile` | Optional nginx static path |
| Production env example | `caretaker-relay/.env.production.example` | Documents `VITE_CARE_*` only (no secrets) |

### Authentication / API state (measured)

| Field | Actual |
| --- | --- |
| **`RENDER_API_KEY` in agent shell** | **Present** (length 32). Value **not** printed or committed. |
| **API probe** | `GET https://api.render.com/v1/services?limit=1` with `Authorization: Bearer $RENDER_API_KEY` → **HTTP 401** body `{"message":"Unauthorized"}` |
| **Interpretation** | **ACCESS / AUTHORIZATION blocker** — rejected or stale credential. **Not** evidence of wrong product architecture. |
| **Render CLI** | **Not installed** (`render` not in PATH) |
| **Live Render services for Caretaker** | **Unknown / not listable** while 401 persists. No public Caretaker onrender URLs recorded. |

### Operations currently blocked

- List / create / update Render services via API
- Apply blueprints programmatically
- Attach env vars / secrets via API
- Confirm whether any prior Caretaker services already exist on the account
- Automated deploys from this agent session

### What does **NOT** require rebuilding

- Judge Loop product semantics (freeze SHAs)
- Care-domain / care-app implementation (lab proven)
- Blueprint files already committed
- Vendor packages for standalone UI build
- Architecture choice of Render static UI + Docker Care API + isolated Postgres

**Do not** switch cloud providers solely to avoid fixing Render authentication.

---

## 3. Supabase

| Field | Actual finding |
| --- | --- |
| **Caretaker-specific project/ref in repo** | **None found** |
| **What exists** | Foundation clone carries historical Otzar/substrate **examples**, ADRs, and env **examples** mentioning Supabase patterns |
| **Database/auth/storage wired for Caretaker online** | **No** — not configured for Caretaker Relay product in this audit |
| **Agent env `SUPABASE_*`** | **Not set** in probe shell |
| **CLI** | `supabase` CLI **not** in PATH |
| **Role if used later** | Optional **Postgres provider** for isolated `DATABASE_URL` (alternative to Render Postgres) |
| **Unknowns** | Whether founder already has a private Supabase project usable for Caretaker; whether any shared NIOV Supabase should be **avoided** (isolation required) |

**Verdict:** **NOT CONFIGURED** for Caretaker online research (optional path only).

---

## 4. Resend

| Field | Actual finding |
| --- | --- |
| **Path found** | Foundation `apps/api/src/services/activation-email.service.ts` — env-gated on `RESEND_API_KEY` |
| **Agent env** | `RESEND_API_KEY` **not** present in probe shell |
| **Currently usable for Caretaker** | **No** (not wired into Judge Loop path; key not available here) |
| **Likely role** | Optional activation / invite email later — **not** required for minimum online research / Judge Loop |
| **Unknowns / blockers** | Account ownership; verified sending domain; whether care product should send email at all for formative research |

**Verdict:** **NOT NEEDED FOR INITIAL ONLINE RESEARCH** · **NOT CONFIGURED** for current gate.

---

## 5. NIOV Labs domain / DNS

| Field | Actual finding |
| --- | --- |
| **Apex** | `niovlabs.com` resolves; HTTPS redirects to `www.niovlabs.com` |
| **Public site hosting** | **Vercel** (`server: Vercel` on responses) |
| **DNS nameservers** | `ns33.domaincontrol.com` / `ns34.domaincontrol.com` (**GoDaddy Domain Control**) |
| **Cloudflare** | **Not observed** as front for public site (no Cloudflare markers on checked responses) |
| **Recommended product hostnames** | `care.niovlabs.com`, `relay.niovlabs.com` (docs only — aspirational) |
| **Caretaker Relay product hostname live** | **No** dedicated public Caretaker Relay app/API URL established in this audit |
| **DNS changes authorized/performed this pass** | **No** — agent has **no** DNS write access; **no** DNS mutations performed |
| **First smoke alternative** | `*.onrender.com` hostnames are **acceptable** before custom domain |

**Verdict:** Domain brand exists; **product DNS NOT READY**. Custom domain is **optional** for first online research smoke.

---

## 6. Cloudflare

| Field | Actual finding |
| --- | --- |
| **Status** | **Not in use** for observed `niovlabs.com` edge (Vercel + Domain Control NS) |
| **CLI** | `wrangler` not in PATH |
| **Need for initial research** | **NOT NEEDED** |

---

## 7. Database

| Field | Actual finding |
| --- | --- |
| **Local durable lab** | Docker Postgres `cr-local-pg` on host port **5434** (running at probe time) |
| **Also present** | `niov-foundation-test-db` on **5433** (foundation test — do not reuse for Caretaker online) |
| **Implementation** | Prisma via foundation `@niov/database`; Care API uses Prisma when `DATABASE_URL` set |
| **Online target** | **Isolated** cloud Postgres (Render Postgres **or** Supabase project dedicated to Caretaker) |
| **Online provisioned** | **No** |
| **Migration / deploy requirements** | `DATABASE_URL` (+ `DIRECT_URL` if needed) on Care API; Prisma generate in Docker build; schema push/migrate on first deploy; seed synthetic Olivia household for research |
| **Isolation rule** | **Do not** point Caretaker at Otzar / production NIOV databases |

---

## 8. Auth

| Field | Actual finding |
| --- | --- |
| **Real architecture** | Foundation AuthService + JWT; Care API server-authoritative access checks |
| **Lab UX** | UI auto lab-login as **Sadeil** when HTTP Care API available |
| **Multi-user / session** | API supports login/principals; **no** polished multi-login caregiver UI required for first smoke; separate JWT isolation **lab-proven** (unauthorized deny e2e) |
| **Online blockers** | Need deployed Care API + unique **`JWT_SECRET`** + CORS origins matching real UI origin |
| **Minimum for research** | Authenticated session for caregiver path + deny unauthorized; lab login acceptable if documented for research stack |

---

## 9. Frontend

| Field | Actual finding |
| --- | --- |
| **Stack** | React 18 + Vite 6 |
| **Dev** | Port **5180** |
| **Build** | `npm run build` → `dist/` |
| **Deploy** | Render static via `render.yaml`; needs `VITE_CARE_API_URL` at **build time** |
| **Standalone build fix** | `vendor/care-domain` + `vendor/product-identity` (`file:./vendor/...`) so Render build does not need monorepo siblings |
| **Env example** | `.env.production.example` (`VITE_CARE_TRANSPORT=http`, `VITE_CARE_MODE=fixture`) |
| **Public URL** | **NOT READY** |

---

## 10. Care API

| Field | Actual finding |
| --- | --- |
| **Entry** | `apps/api/src/care-app.ts` via `care:start` |
| **Port** | `PORT` / default **3100** |
| **Health** | `GET /api/v1/health` |
| **CORS** | Env `CARE_CORS_ORIGINS` and/or `CARETAKER_APP_URL` (production-capable; lab defaults loopback) |
| **Understand mode** | Blueprint default **`fixture`** (correct for research smoke) |
| **Docker** | `Dockerfile.care` committed |
| **Public URL** | **NOT READY** |

---

## 11. Foundation

| Field | Actual finding |
| --- | --- |
| **Role** | `caretaker-relay-foundation` = isolated Foundation clone for care runtime |
| **Deploy relationship** | Care API Docker service deploys **from foundation repo**, not full Otzar `server.ts` path |
| **Original `niov-foundation`** | **Do not modify** for Track 1 online work |
| **Runtime** | Care-domain + Prisma + auth packages in Docker image |

---

## 12. AI

| Field | Actual finding |
| --- | --- |
| **Default** | **Fixture** understand mode for research / online smoke |
| **Live remote LLM** | **BLOCKED_CREDENTIALS** (known limitation; not required for Judge Loop lab semantics) |
| **Online research** | Fixture is **acceptable** for Caregiver #1 / remote judge gate |

---

## 13. Judge access

| Field | Actual finding |
| --- | --- |
| **Lab** | Localhost Judge Loop **PASS** (Playwright 18/18 recorded) |
| **Remote public** | **Missing** — no public HTTPS app URL |
| **Target** | Public UI URL + Care API + durable DB + same Judge Loop semantics |

---

## 14. Caregiver remote access

| Field | Actual finding |
| --- | --- |
| **Current** | **Not available** online (localhost / lab only) |
| **Research admin** | `/Users/genghishameha/CaretakerRelayResearch` — **not** product traffic |
| **Target** | Same public product URL as judges (HTTPS) |

---

## 15. Synthetic household

| Field | Actual finding |
| --- | --- |
| **Lab** | Olivia household seed **proven** with local Prisma |
| **Online** | Requires online DB + Care API seed/bootstrap on configured backend |
| **Readiness** | **PARTIAL** (code/seed path exists; online DB absent) |

---

## 16. Ranked blocker table

| BLOCKER ID | COMPONENT | CURRENT CONDITION | WHY IT BLOCKS ONLINE USE | FOUNDER ACTION REQUIRED? | AGENT ACTION POSSIBLE AFTER RESOLUTION? | SEVERITY |
| --- | --- | --- | --- | --- | --- | --- |
| **B1** | Render API auth | `RENDER_API_KEY` present but API returns **401 Unauthorized** | Agent cannot list/create/deploy services or apply secrets via API | **YES** — issue valid API key or use Dashboard apply | **YES** — deploy/verify once access works | **P0** |
| **B2** | Online Postgres | No isolated Caretaker `DATABASE_URL` provisioned | No durable server-side care truth online | **YES** — create Render PG or dedicated Supabase; paste URL as secret | **YES** — wire env, migrate/seed, verify reload | **P0** |
| **B3** | Care API live service | Blueprint exists; service not confirmed live | No public HTTPS API / health | **YES** if only Dashboard; agent can apply after B1 | **YES** | **P0** |
| **B4** | Web static live service | Blueprint exists; no public UI URL | No public HTTPS application | After B1 + B3 (needs `VITE_CARE_API_URL`) | **YES** | **P0** |
| **B5** | CORS / app origin secrets | `CARETAKER_APP_URL` / `CARE_CORS_ORIGINS` unknown until UI URL exists | Browser calls blocked cross-origin | Set after first UI URL known | **YES** once URL known | **P0** |
| **B6** | JWT secret online | Not set on any live service | Auth cannot be production-safe online | Provide unique secret in Render (Dashboard or after B1) | **YES** | **P0** |
| **B7** | Public Judge Loop smoke | Not run online | Cannot claim online research environment ready | Optional witness; agent can run smoke after URLs | **YES** | **P1** (gate for recruitment) |
| **B8** | Custom domain DNS | Recommended hostnames not product-deployed; no DNS write by agent | Blocks branded URL only | **Optional** for first smoke | **YES** after founder DNS | **P2** (deferrable) |
| **B9** | Resend | Not configured / not required | Does **not** block Judge Loop research | No for initial gate | N/A | **P3** |
| **B10** | Live LLM | Credentials blocked | Does **not** block fixture research | Optional later | Optional | **P3** |
| **B11** | Multi-login UI polish | Lab auto-Sadeil | Soft limit for multi-caregiver study UX | Not required for Caregiver #1 gate if lab path documented | Later product change only with finding | **P2** research UX |

**Render 401 is B1 access — not architecture failure.**

---

## 17. Target architecture (repository truth)

```text
GitHub (NiovArchitect/caretaker-relay + caretaker-relay-foundation)
    │
    ├─► Render Static: caretaker-relay-web
    │      HTTPS caregiver UI (Vite dist)
    │      Build-time: VITE_CARE_API_URL = public Care API origin
    │
    └─► Render Docker: caretaker-relay-care-api
           care-app Fastify (Dockerfile.care)
           DATABASE_URL → isolated Postgres (Render PG or Supabase)
           JWT_SECRET (Caretaker-only)
           CARETAKER_APP_URL / CARE_CORS_ORIGINS → UI origin
           CARE_UNDERSTAND_MODE=fixture (research default)

Research admin: ~/CaretakerRelayResearch  ──✗── not product traffic
Original niov-foundation / Otzar         ──✗── do not modify for this gate
```

### Intended roles

| Component | Role | Priority |
| --- | --- | --- |
| **GitHub** | Source + blueprint origin | **REQUIRED NOW** |
| **Render** | Host public UI + Care API (HTTPS) | **REQUIRED NOW** |
| **Postgres (Render or Supabase)** | Durable care truth | **REQUIRED NOW** |
| **Supabase Auth/Storage** | Not required for first gate | **NOT NEEDED FOR INITIAL ONLINE RESEARCH** |
| **Resend** | Optional email later | **USEFUL LATER** |
| **NIOV Labs domain** | Branded URL | **USEFUL LATER** (onrender OK first) |
| **Cloudflare** | Optional DNS/CDN | **NOT NEEDED FOR INITIAL ONLINE RESEARCH** |
| **Caretaker Relay app** | Caregiver UI / Judge Loop surface | **REQUIRED NOW** |
| **Care API** | Real backend | **REQUIRED NOW** |
| **Foundation care runtime** | Domain logic, auth, Prisma in Docker | **REQUIRED NOW** |
| **Full Foundation/Otzar API** | Legacy `server.ts` path | **NOT NEEDED FOR INITIAL ONLINE RESEARCH** |

---

## 18. Minimum online research environment

Smallest stack for **Caregiver #1 / remote judge** testing:

| Requirement | How satisfied |
| --- | --- |
| Public HTTPS application URL | Render static `caretaker-relay-web` |
| Real backend/API | Render Docker Care API |
| Durable server-side state | Isolated Postgres + Prisma |
| Authentication / session isolation | JWT + server authz (lab login OK if documented) |
| Synthetic Olivia household | Seed online DB |
| Judge Loop | Same frozen product semantics |
| Verification / correction | Care API + UI (lab proven) |
| Handoff | Lab proven path online |
| Reload continuity | Prisma durability online |
| Unauthorized access denial | Server checks (lab proven; re-verify online) |

**Do not add:** Resend, Cloudflare, custom domain, live LLM, full Otzar stack, workforce features, multi-product infra.

**Gate proof:** Fresh browser (not localhost) → public UI → Judge Loop smoke → health 200 → reload preserves → unauthorized denied.

---

## 19. Founder actions required to unblock online deployment

Only actions the agent **cannot** perform:

### Action 1 — Render API credential

| | |
| --- | --- |
| **SERVICE** | Render |
| **PROBLEM** | Current `RENDER_API_KEY` yields HTTP **401 Unauthorized** |
| **WHAT FOUNDER MUST DO** | In Render Dashboard → Account Settings → API Keys: create a **new** API key with permission to manage services; replace the stale key in the **local shell environment** used by Grok (e.g. shell profile or secure env injection). Prefer Dashboard Blueprint apply if API key policy is restricted. |
| **WHAT NOT TO SHARE IN CHAT/TERMINAL** | Full API key value in chat transcripts; do not paste into Git commits |
| **HOW GROK WILL VERIFY** | Re-probe `GET https://api.render.com/v1/services?limit=1` → expect **200** (not 401); then list services (no secret printed) |

### Action 2 — Isolated Caretaker Postgres

| | |
| --- | --- |
| **SERVICE** | Render Postgres **or** Supabase (Postgres only) |
| **PROBLEM** | No online `DATABASE_URL` for Caretaker |
| **WHAT FOUNDER MUST DO** | Create a **new isolated** database for Caretaker Relay only. Paste `DATABASE_URL` (and `DIRECT_URL` if required) into Render Care API service env as secret — **not** into Git. |
| **WHAT NOT TO SHARE IN CHAT/TERMINAL** | Connection strings with passwords |
| **HOW GROK WILL VERIFY** | Care API health 200; Prisma operations succeed; reload continuity after process restart |

### Action 3 — Care API secrets on live service

| | |
| --- | --- |
| **SERVICE** | Render (`caretaker-relay-care-api`) |
| **PROBLEM** | Secrets `JWT_SECRET`, `DATABASE_URL`, CORS origins not applied to a live service |
| **WHAT FOUNDER MUST DO** | After service exists (Dashboard or agent post-B1): set `JWT_SECRET` (unique), `DATABASE_URL`, and after UI URL known set `CARETAKER_APP_URL` / `CARE_CORS_ORIGINS` |
| **WHAT NOT TO SHARE IN CHAT/TERMINAL** | JWT secret, DB URL |
| **HOW GROK WILL VERIFY** | Public `/api/v1/health`; browser UI can call API without CORS failure; auth works |

### Action 4 — Web build-time API URL

| | |
| --- | --- |
| **SERVICE** | Render (`caretaker-relay-web`) |
| **PROBLEM** | Static UI must bake public Care API origin at build |
| **WHAT FOUNDER MUST DO** | Set `VITE_CARE_API_URL` on static service to public Care API HTTPS origin; trigger rebuild |
| **WHAT NOT TO SHARE IN CHAT/TERMINAL** | No secret required for this var (public URL only) |
| **HOW GROK WILL VERIFY** | Load public UI; network calls hit Care API; Judge Loop smoke |

### Action 5 — Optional custom domain (deferrable)

| | |
| --- | --- |
| **SERVICE** | DNS at Domain Control (GoDaddy NS) + Render custom domains |
| **PROBLEM** | Branded hostname not attached |
| **WHAT FOUNDER MUST DO** | Only if desired: add CNAME/A records for chosen hostname → Render; enable HTTPS. **Not required** if `*.onrender.com` used for research. |
| **WHAT NOT TO SHARE IN CHAT/TERMINAL** | Registrar credentials |
| **HOW GROK WILL VERIFY** | `curl -I https://<hostname>` → 200; cert valid |

**Not founder-blocked for initial gate:** Resend, Cloudflare, live LLM, multi-login UI redesign.

---

## 20. Scaffold already committed (do not rebuild unnecessarily)

| Change | Class |
| --- | --- |
| Care CORS production env origins | Deployment requirement |
| `Dockerfile.care` + `render.caretaker-care.yaml` | Deployment requirement |
| App `render.yaml` + `.env.production.example` | Deployment requirement |
| Vendored care packages for standalone UI build | Deployment requirement |
| Online architecture + matrix docs | Documentation |

**Product Judge Loop semantics:** not redesigned for online scaffold.

---

## 21. Continuity references

| Doc | Role |
| --- | --- |
| `CARETAKER_RELAY_MASTER_CONTINUITY.md` | Full recovery handoff |
| `CARETAKER_RELAY_CURRENT_STATE.json` | Machine-readable gate |
| `CARETAKER_RELAY_CONTINUITY_INDEX.md` | Read order |
| `ONLINE_DEPLOYMENT_ARCHITECTURE.md` | Target topology detail |
| `ONLINE_READINESS_MATRIX.md` | Component gap matrix |
| **This file** | Authoritative online-readiness audit boundary |

---

## 22. Explicit non-actions at this checkpoint

- No further Render/Supabase/domain deployment
- No DNS changes
- No production deploy
- No caregiver recruitment
- No stack redesign because of 401
- No secrets printed or committed
- No PHI
- No Otzar / original foundation product changes for this checkpoint

---

**End of online readiness current state. STOP deployment until founder resolves true external access blockers and a new session recovers from disk.**
