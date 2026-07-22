# Caretaker Relay — Project Memory

**Last updated:** 2026-07-22 (Pre-Phase-1 hardening: 5434 DB + semantic idempotency + voice mic UI)  
**Commit status: NOT committed / NOT pushed / NOT published**

## Runtime (primary)

```bash
# Postgres (test stack on 5433) must be up for Prisma path
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
cd caretaker-relay-foundation
docker start niov-foundation-test-db   # or docker compose -f docker-compose.test.yml up -d
set -a && source .env.test && set +a
bash scripts/prisma-db-push-test.sh   # once after schema changes
npm run care:api                      # CARE_STORE_BACKEND=prisma when DATABASE_URL set
```

### Auth path (PRIMARY)

`POST /api/v1/care/auth/login`  
→ Foundation **AuthService.login** (Entity password + Session + JWT)  
→ **CarePrincipalLink** (entity_id → care_person_id)  
→ evaluateAccess → AuthCareContext  

Lab JWT (`iss=caretaker-relay-care-auth`) is **secondary only**.

Seed emails: `sadeil.care@caretaker-relay.test` / `sadeil-lab-password` (etc.)

### Persistence (PRIMARY)

**Prisma** tables `cr_*` via `PrismaCareStore` (write-through + flush).  
FileCareStore remains fallback. Memory for pure unit tests.

### Voice

`POST /api/v1/care/voice/understand` → same `/understand` pipeline with `transcript_meta`.  
Client must show editable transcript before submit. Low STT confidence + meds → forced high review.

### Tests

- care unit/e2e/http/prisma/llm: **40 pass**
- app: **9 pass**

## Remaining honest gaps

1. Live Anthropic/OpenAI keys for real remote model evidence (scripted LLM path proven; live key optional)
2. Real browser microphone STT wiring in UI (HTTP voice route proven)
3. Real caregiver research still pending
4. Full `buildApp` integration suite not required for care inject tests
5. UI polish deferred

## Do not

- Modify niov-foundation / Otzar
- Fabricate caregiver validation
- Commit without instruction
