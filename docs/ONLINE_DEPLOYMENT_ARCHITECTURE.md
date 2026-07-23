# Caretaker Relay — Online Deployment Architecture

**Date:** 2026-07-23  
**Purpose:** Correct architecture — **internet-accessible product**, not Mac-local.  
**Research admin path** `/Users/genghishameha/CaretakerRelayResearch` is **NOT** the product environment.

## North star

Real caregivers and judges open **HTTPS URLs**. Care truth persists **server-side**. Auth and permissions are **server-authoritative**. The Judge Loop works online. No localhost dependency in the judge path.

## Separation of concerns

| Layer | What | Where |
| --- | --- | --- |
| **Product application** | UI + Care API + durable DB | Render (target) + Postgres (Supabase or Render) |
| **Research administration** | Contacts, consent, raw notes | `/Users/genghishameha/CaretakerRelayResearch` (outside Git) |

---

## Current architecture (repository truth)

### Frontend (`caretaker-relay`)

| Item | State |
| --- | --- |
| Framework | React 18 + Vite 6 |
| Build | `npm run build` → `dist/` |
| Dev | `vite` port **5180** |
| API client | `src/foundation/careHttpClient.ts` + `careClient.ts` |
| Env | `VITE_CARE_API_URL`, `VITE_CARE_TRANSPORT`, `VITE_CARE_MODE` |
| Deploy config (new) | `render.yaml` static site; optional `Dockerfile` nginx |
| Lab behavior | Auto lab login as Sadeil when HTTP available |

### Backend Care API (`caretaker-relay-foundation`)

| Item | State |
| --- | --- |
| Runtime | Fastify **care-app** (`apps/api/src/care-app.ts`) |
| Start | `npm run care:api` → `care:start` / `tsx src/care-app.ts` |
| Port | `PORT` / `CARE_API_PORT` default **3100** |
| Health | `GET /api/v1/health` and care health routes |
| Store | Prisma when `DATABASE_URL` set; else file/memory |
| Auth | Foundation AuthService login + lab-login; JWT |
| CORS | Env `CARE_CORS_ORIGINS` / `CARETAKER_APP_URL` (lab defaults loopback) |
| Blueprint (legacy) | `render.yaml` full API Docker → `server.ts` (Otzar-oriented) |
| Blueprint (care) | `render.caretaker-care.yaml` + `Dockerfile.care` → **care:start** |

### Database

| Item | State |
| --- | --- |
| Local lab | Docker Postgres **5434** (`cr-local-pg`) |
| Prisma | Foundation `@niov/database` |
| Supabase | Referenced in Foundation examples / Otzar patterns — **no Caretaker-specific project config in repo** |
| Online DB | **FOUNDER ACCESS REQUIRED** — create isolated Render Postgres or Supabase project for Caretaker only |

---

## Existing infrastructure audit

| Service | Status | Use for Caretaker |
| --- | --- | --- |
| **GitHub** | **ALREADY CONFIGURED** (`NiovArchitect/caretaker-relay`, `caretaker-relay-foundation`) | Source + blueprints |
| **Render** | **PARTIALLY CONFIGURED** (blueprint files exist; API key present but **Unauthorized**; CLI missing) | Host Care API + static UI |
| **Supabase** | **PARTIALLY / UNKNOWN** (env examples only; no project ID in Caretaker repo) | Optional Postgres provider |
| **Resend** | **PARTIALLY CONFIGURED** in Foundation activation email (env-gated) | **Not required** for Judge Loop smoke |
| **NIOV Labs domain** | **UNKNOWN / FOUNDER ACCESS** (niovlabs.com site public; DNS tooling not available here) | Recommend `care.niovlabs.com` or `relay.niovlabs.com` |
| **Cloudflare** | **UNKNOWN** | Optional DNS/CDN |
| **Postgres** | **ALREADY** for lab; online **NOT CONFIGURED** in this agent session | Durable care truth |

---

## Target online topology (smallest strong)

```text
GitHub (source)
    │
    ├─► Render Static: caretaker-relay-web
    │      HTTPS UI (Vite dist)
    │      VITE_CARE_API_URL=https://<care-api-host>
    │
    └─► Render Web (Docker): caretaker-relay-care-api
           care-app Fastify
           DATABASE_URL → isolated Postgres (Render PG or Supabase)
           CARETAKER_APP_URL → UI origin (CORS)
           JWT_SECRET (unique to Caretaker)

Research admin (private Mac path) ──✗── not product traffic
```

**Domain recommendation:** `care.niovlabs.com` (product) → Render static; API as `care-api.niovlabs.com` or `*.onrender.com` first.

**DNS:** Founder must attach custom domain in Render + DNS at registrar/Cloudflare. **Not applied automatically** (no verified DNS write access).

---

## Multi-user / persistence / judge access (current)

| Capability | Status | Notes |
| --- | --- | --- |
| Separate auth principals | **PARTIAL** | API supports login + access checks; UI auto-logins Sadeil lab |
| Session isolation | **PARTIAL** | Server JWT; no multi-login UI |
| Care-circle membership | **PARTIAL** | Domain + Circle UI (static-ish list) |
| Server-authoritative authz | **PROVEN** lab | Unauthorized deny browser e2e |
| Durable Prisma | **PROVEN** lab localhost | Online DB not provisioned here |
| Synthetic Olivia household | **PROVEN** lab seed | Online seed when Care API has DB + seed flags |
| Judge URL experience | **MISSING** public | Needs Render deploy + secrets |
| Resend email | **NOT REQUIRED** for first online smoke | Optional later for invites |

---

## Founder blockers (cannot complete without dashboard access)

1. **Valid Render API credentials** (current key returned **401 Unauthorized**)  
2. **Isolated Caretaker Postgres** (new Render DB or Supabase project — paste `DATABASE_URL`)  
3. **JWT_SECRET** unique for Caretaker online  
4. **CARETAKER_APP_URL / CARE_CORS_ORIGINS** set to real UI origin after UI deploys  
5. **VITE_CARE_API_URL** set at static build time  
6. **Custom domain DNS** (optional for first smoke; onrender.com URLs OK first)  
7. Optional: institutional policy for human research remains separate  

---

## What was implemented this online-readiness pass

| Change | Class |
| --- | --- |
| Care CORS accepts production origins from env | **DEPLOYMENT REQUIREMENT** |
| `Dockerfile.care` + `render.caretaker-care.yaml` | **DEPLOYMENT REQUIREMENT** |
| App `render.yaml` + `.env.production.example` | **DEPLOYMENT REQUIREMENT** |
| Vendored care packages for standalone UI build | **DEPLOYMENT REQUIREMENT** |
| Online architecture + matrix docs | Documentation |

**Product semantics (Judge Loop caregiver flows):** intentionally **not** redesigned.

---

## Apply blueprint (founder)

1. Create Render Postgres (or Supabase) **isolated** for Caretaker.  
2. Blueprint foundation repo: `render.caretaker-care.yaml` (or Dashboard create Docker service with `Dockerfile.care`).  
3. Set secrets; deploy Care API; confirm `GET /api/v1/health`.  
4. Blueprint app repo `render.yaml`; set `VITE_CARE_API_URL` to Care API public URL; deploy static.  
5. Set Care API `CARETAKER_APP_URL` / `CARE_CORS_ORIGINS` to static site origin; redeploy API.  
6. Open UI in fresh browser (not localhost); run Judge Loop smoke.  

---

## Evidence discipline

Online deploy readiness is **infrastructure**. It does **not** create `[CAREGIVER INPUT]` or `[VALIDATED]`.
