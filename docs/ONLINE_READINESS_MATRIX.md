# Online Readiness Matrix — Caretaker Relay

**Updated:** 2026-07-23

| COMPONENT | CURRENT STATE | TARGET STATE | GAP | ACTION | PROOF |
| --- | --- | --- | --- | --- | --- |
| Frontend | Vite SPA local 5180 | HTTPS static on Render | No live public URL | Deploy `render.yaml` + set `VITE_CARE_API_URL` | Fresh browser loads URL |
| API | Care API local 3100 | HTTPS care-app Docker | No live public URL; Render key 401 | Deploy `Dockerfile.care` + secrets | `/api/v1/health` 200 public |
| Foundation full API | Optional/legacy `render.yaml` | Prefer **care-app only** for Track 1 | Wrong default start (`server.ts`) | Use care blueprint | care health + care routes |
| Database | Local Docker 5434 | Isolated cloud Postgres | Online DB not provisioned | Founder creates PG/Supabase | Prisma durable after redeploy |
| Authentication | Lab login + JWT | Online JWT + multi-user login UX | UI auto-Sadeil | Later multi-user requirement | Separate tokens |
| Multi-user isolation | Server deny proven lab | Same online | No public multi-account UI | Deploy + isolation test | User A ⊄ User B |
| Care-circle authz | Domain + API | Same online | Partial UI | Keep server authoritative | Unauthorized 403 |
| AI understand | Fixture default | Fixture or live LLM online | Live LLM optional | Keep fixture for research smoke | Multi-event verify |
| Persistence | Prisma lab proven | Cloud Prisma | Online DB | Connect DATABASE_URL | Reload after redeploy |
| Email (Resend) | Foundation gated | Optional invites | Not required for Judge Loop | Defer | N/A |
| Domain | niovlabs.com exists | care.niovlabs.com | DNS not automated | Founder DNS + Render custom domain | HTTPS cert green |
| HTTPS | Local http | Forced TLS via Render | Deploy | Render provides TLS | Browser padlock |
| Secrets | Local examples | Render env sync:false | Dashboard paste | Founder | No secrets in Git |
| Audit | Domain/API lab | Same online | Deploy | — | Audit rows after actions |
| Synthetic household | Olivia seed lab | Seeded online DB | Online seed | Care API seed on boot when configured | Today shows Olivia |
| Judge access | Localhost only | Public URL | Deploy | URL + optional evaluator account | Remote Judge Loop |
| Research participant access | Localhost | Same public product URL | Deploy | Same as judge | Remote session |
| Deployment | Blueprints only | Live services | Founder credentials | Apply blueprints | Services running |
| CI/CD | autoDeploy false | Controlled deploys | OK | Keep manual first | — |
| Observability | Minimal logs | Basic health + logs | Optional | Render logs | Healthcheck |

**Online research environment overall:** **BLOCKED** pending founder Render/DB secrets apply — infrastructure **scaffolded**.
