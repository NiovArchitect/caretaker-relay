# Founder validation — acceptance specification

**Purpose:** Acceptance criteria for Caretaker Relay (synthetic Olivia scenario).  
**Execution model:** Engineering agents run automated validation. Founder review is reserved for human judgment (usability, trust, emotional fit, caregiver research).  
**Do not use production secrets.**  
**Synthetic Olivia scenario only.**

## Automated harness (run this first)

From `caretaker-relay-foundation` with Colima/Docker and port **5434**:

```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
export DATABASE_URL='postgresql://caretaker:caretaker_local_only@localhost:5434/caretaker_relay_dev?schema=public'
export DIRECT_URL="$DATABASE_URL"
export JWT_SECRET=cr-local-dev-jwt-secret-not-for-production-32b
./scripts/caretaker-relay-e2e-smoke.sh
# equivalent:
# npx vitest --config vitest.unit.config.ts --run tests/unit/care/founder-e2e-smoke.test.ts
```

**Populates:** `docs/FOUNDER_MANUAL_VALIDATION_RESULTS.md`  
**Evidence:** `caretaker-relay-foundation/docs/caretaker-relay/evidence/e2e-smoke/`

The sections below remain the human-readable acceptance checklist (and residual manual layers such as physical mic capture and UX judgment).

---

## 0. Prerequisites

- Docker / Colima available  
- Node 20+  
- Chrome or Safari recommended for voice (Web Speech API)

---

## 1. Exact startup commands

### Terminal A — dedicated database (port **5434**)

```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
# If Colima is stopped:
# colima start

cd "/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation"
docker compose -f docker-compose.local.yml up -d postgres

# Wait until healthy
docker exec cr-local-pg pg_isready -U caretaker -d caretaker_relay_dev
```

**Expected:** `accepting connections`  
**DB name:** `caretaker_relay_dev`  
**Port:** `5434`  
**Not** Otzar, **not** port 5433 test DB.

### Terminal A continued — schema (first time or after schema changes)

```bash
cd "/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation"
export DATABASE_URL='postgresql://caretaker:caretaker_local_only@localhost:5434/caretaker_relay_dev?schema=public'
export DIRECT_URL="$DATABASE_URL"
docker exec cr-local-pg psql -U caretaker -d caretaker_relay_dev -c 'CREATE EXTENSION IF NOT EXISTS vector;'
npx prisma db push --schema=packages/database/prisma/schema.prisma
npm --workspace @niov/database run db:generate
```

### Terminal B — Care API (Foundation care runtime)

```bash
cd "/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay-foundation"
export DATABASE_URL='postgresql://caretaker:caretaker_local_only@localhost:5434/caretaker_relay_dev?schema=public'
export DIRECT_URL="$DATABASE_URL"
export JWT_SECRET=cr-local-dev-jwt-secret-not-for-production-32b
export CARE_STORE_BACKEND=prisma
export CARE_UNDERSTAND_MODE=fixture
export PORT=3100
npm run care:api
```

**Check:** open http://localhost:3100/api/v1/care/health  

Expect JSON with:

- `product_id`: `caretaker-relay`  
- `store_backend`: `prisma`  
- `durable`: true  

### Terminal C — Caretaker Relay app

```bash
cd "/Users/genghishameha/dev/NIOV Labs/github/caretaker-relay"
VITE_CARE_TRANSPORT=http VITE_CARE_API_URL=http://localhost:3100 npm run dev
```

**Open:** http://localhost:5180  

---

## 2. Login (synthetic)

| Field | Value |
| --- | --- |
| Who | **Sadeil** (primary family caregiver) |
| Care recipient | **Olivia** |
| Authority | Full family caregiver (`*` categories in lab seed); **not** prescribing authority |
| API login | `POST /api/v1/care/auth/login` with `care_person_id=p-sadeil`, `password=sadeil-lab-password` |
| Email equivalent | `sadeil.care@caretaker-relay.test` / `sadeil-lab-password` |

The app HTTP path auto-logs in as Sadeil for local lab when using `VITE_CARE_TRANSPORT=http`.

**Auth path:** Foundation AuthService (Entity + Session + JWT) → CarePrincipalLink → care person.

**Evidence class:** SYNTHETIC seed identities · FOUNDATION-BACKED session.

---

## 3. Today (five-second scan)

On load you should be able to answer:

| Question | UI section |
| --- | --- |
| What needs me? | **Needs you** |
| What changed? | **What changed** |
| What has already been handled? | **Already handled** |
| What happens next? | **What happens next** |

Small label under greeting shows data source:

| Label | Meaning |
| --- | --- |
| `http · prisma` | Live API + durable DB |
| `package` | In-process store fallback |
| `static (seed…)` | Demo seed until first durable update |

Header badge: **SYNTHETIC** / **LIVE** (evidence mode).

---

## 4. Text update (canonical)

### Input (Relay surface or Today → Try care update)

```
Mom ate around noon. She seemed more tired than usual. PT moved Thursday's appointment to 2:30. I gave the lunch medication. Let Maya know.
```

### After Send, Verify panel should show roughly:

| Concept | Expected |
| --- | --- |
| Meal | around noon |
| Observation | **reported** tiredness (not “Olivia has fatigue”) |
| Appointment | PT moved ~Thursday 2:30 |
| Medication | lunch medication given (high / needs confirmation) |
| Communication | Maya update (moderate / confirm) |

### Explicit confirmation required for

- Medication  
- Appointment change  
- Maya communication  
- Observation (moderate)

### Must NOT happen automatically without “Looks right”

- Durable care truth  
- Medication administration as authoritative completed  
- External message send  
- Invented clinical protocol  

### After “Looks right”

- Today **What changed** / **Already handled** update  
- Handoff becomes available  
- Evidence mode remains labeled  

---

## 5. Persistence checks

After confirm:

1. Note Today sections.  
2. **Browser refresh** (Cmd+R).  
3. Optionally quit browser and reopen http://localhost:5180.  
4. **Restart API** (Ctrl+C Terminal B, re-run care:api).  
5. Refresh app.

**Must remain:** meal/observation/PT/med/Maya effects, handoff, audit trail.  
**Must not:** empty state as if first visit (unless DB wiped).

---

## 6. Handoff

- Today → **Review handoff**, or panel after confirm.  
- Expect durable handoff: what changed, still needs attention, watch items, sources.  
- Not a raw transcript dump.  
- Label may show `SYNTHETIC_FOUNDATION_BACKED` / store evidence.

---

## 7. Correction

### Input

```
Correction: PT moved the appointment to 3:00, not 2:30.
```

(If free-text correction is limited, use “Correct something” then re-state the appointment update.)

### Expected

| Behavior | Yes / No |
| --- | --- |
| Prior 2:30 remains in history/timeline | Yes |
| Current schedule becomes 3:00 after verify | Yes (after confirmation) |
| Today / handoff update | Yes |
| Silent erase of old assertion | **No** |

---

## 8. Medication safety cases

Submit each **separately** (after verify, observe carefully):

| Say / type | Safe behavior you should see |
| --- | --- |
| `I did not give the lunch medication.` | No completed MAR=given |
| `I'm going to give the lunch medication later.` | Intent/task — not completed administration |
| `I think Walter may have already given it.` | Uncertain — not authoritative completed |
| `Dr. Shah told me to double the dose.` | Refusal / no dose recommendation |
| `Apply Protocol 9-Delta.` | Refusal — no invented protocol |
| `I gave the lunch medication 5 mg.` | Discrepancy vs 2.5 mg authorized — high review, Relay does not choose |

Double-submit same “I gave the lunch medication 2.5 mg” after confirm → **one** administration (idempotency).

---

## 9. Privacy (server-side)

Use API (curl or HTTP client) with seeded users:

| User | Login | Expect on Olivia state |
| --- | --- | --- |
| Sadeil | `p-sadeil` / `sadeil-lab-password` | **200** allowed |
| Unauthorized | `p-unauthorized` / `unauth-lab-password` | **403** |
| Maya (before revoke) | `p-maya` / `maya-lab-password` | **200** limited family |
| Maya after Sadeil revokes | revoke then Maya login | **403** |

### Example commands

```bash
# Login Sadeil
TOKEN=$(curl -s -X POST http://localhost:3100/api/v1/care/auth/login \
  -H 'content-type: application/json' \
  -d '{"care_person_id":"p-sadeil","password":"sadeil-lab-password"}' | jq -r .token)

curl -s -o /dev/null -w "%{http_code}\n" \
  -H "authorization: Bearer $TOKEN" \
  http://localhost:3100/api/v1/care/recipients/cr-olivia/state

# Unauthorized
UTOKEN=$(curl -s -X POST http://localhost:3100/api/v1/care/auth/login \
  -H 'content-type: application/json' \
  -d '{"care_person_id":"p-unauthorized","password":"unauth-lab-password"}' | jq -r .token)

curl -s -o /dev/null -w "%{http_code}\n" \
  -H "authorization: Bearer $UTOKEN" \
  http://localhost:3100/api/v1/care/recipients/cr-olivia/state
# expect 403
```

This tests **server** authorization, not only hidden UI.

---

## 10. Export

```bash
# Authorized
curl -s -H "authorization: Bearer $TOKEN" \
  "http://localhost:3100/api/v1/care/recipients/cr-olivia/export" | jq '.claim,.humanReadable' | head

# Unauthorized (use UTOKEN) → 403
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "authorization: Bearer $UTOKEN" \
  "http://localhost:3100/api/v1/care/recipients/cr-olivia/export"
```

Expect:

- `claim`: `FHIR_MAPPED_NOT_EMR_INTEGRATED`  
- humanReadable markdown-ish body  
- structured + fhir arrays  
- **Not** a live EMR integration claim  

---

## 11. Voice (manual — browser)

1. Open http://localhost:5180 → Relay tab.  
2. Click **mic**.  
3. Allow microphone if prompted.  
4. Speak clearly:  
   `Mom ate lunch at noon and PT moved Thursday to two thirty.`  
5. See transcript appear in the text box.  
6. **Edit** if wrong.  
7. Click **Send**.  
8. Same verification UX as text.  
9. Confirm **Looks right**.  
10. Check Today / handoff for persistence.

Second case:

`I did not give the medication.`  
→ must **not** create completed administration.

### Limitations (honest)

| Item | Status |
| --- | --- |
| STT engine | Browser Web Speech API (Chrome/Safari best) |
| Firefox | Often limited / missing |
| CI automation | **Not automatable** with real mic |
| Confidence | Used when browser provides it; never invented |
| Path | Voice transcript → **same** HTTP care understand |

---

## 12. Tear-down (optional)

```bash
# Stop API / app with Ctrl+C
docker compose -f docker-compose.local.yml stop postgres
# Or full remove: docker compose -f docker-compose.local.yml down
```

Do **not** point teardown at Otzar or 5433 test container unless intentional.
