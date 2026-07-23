# Caretaker Relay — Project Memory

**Last updated:** 2026-07-22 (Judge Loop slice implemented)  
**Long-term Grok memory also at:** `~/.grok/memory/caretaker-relay-acl-track1.md`

## Strategic status

| Item | Value |
| --- | --- |
| Challenge | ACL Caregiver AI Challenge |
| Track | **1 — AI Tools to Support Caregivers** (not Track 2) |
| Phase | **1 — Design** |
| Governing contract | Track 1 Product Constitution v1 |
| Constitution audit | `docs/PRODUCT_CONSTITUTION_GAP_AUDIT.md` |
| Traceability | `docs/ACL_TRACK1_TRACEABILITY.md` |
| Latest product slice | **Track 1 Judge Loop — Care Without Re-Explaining** (`docs/JUDGE_LOOP_SLICE_2026-07-22.md`) |
| **Next action** | **WAIT FOR REVIEW** — then real caregiver sessions (not more substrate) |

## Remote checkpoint (SAFE REMOTELY)

| Repo | Branch | Tip SHA (verified match remote) |
| --- | --- | --- |
| App | `checkpoint/caretaker-relay-track1-2026-07-22` | `bfb1fffa54ce9f6645e49bd1c0b70e1942299454` |
| Foundation | `checkpoint/caretaker-relay-track1-2026-07-22` | `3b764a2780d939f50385d445a5f7bac049e803c8` |

- App remote: `https://github.com/NiovArchitect/caretaker-relay.git`
- Foundation remote: `https://github.com/NiovArchitect/caretaker-relay-foundation.git`
- Detail: `docs/CHECKPOINT_2026-07-22.md`

## Paths

```
/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay
/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation
# DO NOT MODIFY for Track 1 product:
/Users/genghishameha/dev/NIOV Labs/github/niov-foundation
```

## Lab-validated engineering (honest)

- Real HTTP Care API + Foundation-backed auth + isolated Prisma (lab DB often **5434** / `cr-local-pg`)
- Care loop: understand → verify → confirm; audit/provenance; handoff; corrections (domain)
- Medication dose-units + CR-STRESS-030 **CLOSED** (strong `expectDisc: true`)
- Brutal stress: **68** scenarios; **P0=0**, **P1=0**
- Browser campaign survived: `docs/REAL_BROWSER_LIVE_MODEL_V1.md` + evidence JSON + screenshots
- Live remote model: **BLOCKED_CREDENTIALS**
- Physical mic: **MANUAL_NOT_AUTOMATABLE**
- Real caregiver validation: **none yet**
- Defensible TRL: **3** (lab)

## Runtime (lab)

```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
cd caretaker-relay-foundation
# isolated care DB (preferred)
docker compose -f docker-compose.local.yml up -d postgres   # if present / cr-local-pg on 5434
export DATABASE_URL='postgresql://caretaker:caretaker_local_only@localhost:5434/caretaker_relay_dev?schema=public'
export DIRECT_URL="$DATABASE_URL"
export JWT_SECRET=cr-local-dev-jwt-secret-not-for-production-32b
export CARE_STORE_BACKEND=prisma
export CARE_UNDERSTAND_MODE=fixture
npm run care:api   # :3100

# App
cd ../caretaker-relay
VITE_CARE_TRANSPORT=http VITE_CARE_API_URL=http://localhost:3100 npm run dev   # often :5180
```

Lab caregiver: Sadeil (`p-sadeil` / lab password per seed docs).

### Auth path (PRIMARY)

`POST /api/v1/care/auth/login` → Foundation AuthService → CarePrincipalLink → evaluateAccess.

### Persistence (PRIMARY)

Prisma `cr_*` via `PrismaCareStore`. FileCareStore fallback. Memory for pure unit tests.

## Product constitution audit (short)

- **Track 2 leakage in app UI:** none  
- **Keep:** four-tab IA (Today / Care / Circle / Relay), HITL verify, med non-recommendation, server auth, honest evidence tags  
- **Likely change after review:** de-lab chrome, Needs Attention framing, care-recipient UX, correction UX, med states on Care, family handoff copy  
- **Do not rebuild** good care-domain/Foundation substrate  

## Hard rules

- Do not modify **niov-foundation** or **Otzar** for Caretaker Track 1  
- Do not fabricate caregiver validation or partnerships  
- Do not claim live EMR / live remote model / physical mic reliability without evidence  
- Do not ship Track 2 workforce management in this product  
- Label `[FOUNDER HYPOTHESIS]` until real caregiver input exists  
