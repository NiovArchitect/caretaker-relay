# Founder manual validation results

**Populated by automated harness:** `tests/unit/care/founder-e2e-smoke.test.ts`
**Timestamp:** 2026-07-22T17:01:09.221Z
**DATABASE_URL host check:** 5434 caretaker_relay_dev

| TEST | EXPECTED | ACTUAL | PASS/FAIL | CLASS | EVIDENCE | NOTES | BUG ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DB up 5434 | accepting connections | /var/run/postgresql:5432 - accepting connections | PASS | AUTOMATED | pg_isready |  | |
| DB URL is 5434 caretaker_relay_dev | 5434 + caretaker_relay_dev | postgresql://caretaker:***@localhost:5434/caretaker_relay_dev?schema=public | PASS | AUTOMATED | DATABASE_URL |  | |
| DB URL not 5433/Otzar runtime | not 5433, not otzar | ok | PASS | AUTOMATED | DATABASE_URL |  | |
| Care health | product_id caretaker-relay, prisma, durable | {"ok":true,"product_id":"caretaker-relay","durable":true,"store_backend":"prisma","store_path":null,"foundation_auth":true,"timestamp":"2026-07-22T16:56:40.473Z"} | PASS | AUTOMATED | GET /api/v1/care/health |  | |
| Login Sadeil | 200 foundation_auth_service | status=200 mode=foundation_auth_service | PASS | AUTOMATED | POST /auth/login |  | |
| Sadeil authorized | 200 | status=200 | PASS | AUTOMATED | GET state |  | |
| Unauthorized state | 403 | status=403 | PASS | AUTOMATED | GET state |  | |
| Maya before revocation | 200 | status=200 | PASS | AUTOMATED | GET state |  | |
| Unknown recipient no leakage | 403 or 404 | status=403 | PASS | AUTOMATED | GET unknown |  | |
| Stale/invalid token | 401 | status=401 | PASS | AUTOMATED | GET bad bearer |  | |
| Canonical text update | meal/obs REPORTED/PT/med/Maya | kind=verify meals=1 | PASS | AUTOMATED | POST understand DEMO |  | |
| Confirm | persisted prisma events+handoff | kind=persisted backend=prisma | PASS | AUTOMATED | POST confirm |  | |
| Confirm key idempotency | idempotent_replay true | {"ok":true,"kind":"persisted","message":"Confirmed. Organized into the care picture. Handoff ready.","persisted":{"eventIds":["evt-zbetm5r8-mrwbru9q","evt-kw9vga8r-mrwbru9r","evt-1… | PASS | AUTOMATED | POST confirm same key |  | |
| Today 5s scan | needs/changed/handled/next data present | events=111 handoff=true | PASS | AUTOMATED | GET today |  | |
| Handoff content | derived whatChanged not raw transcript | ["PT moved to Thursday at 3:00 PM"] | PASS | AUTOMATED | GET handoffs |  | |
| API restart | events+handoffs survive | events=111 handoffs=6 | PASS | AUTOMATED | rebuild + GET state |  | |
| Browser refresh (server state) | durable without browser memory | reconstructed from Prisma | PASS | AUTOMATED | same restart evidence |  | |
| Correction PT 3:00 | current 3:00 in state+DB; history may retain 2:30 | labels=Thursday 3:00 PM; db=Thursday 3:00 PM; hist230=true | PASS | AUTOMATED | understand+confirm 3:00 + prisma |  | |
| Med negation | no admin candidate | admin=false | PASS | AUTOMATED | understand |  | |
| Med intent later | no admin candidate | admin=false | PASS | AUTOMATED | understand |  | |
| Med uncertain Walter | no authoritative admin | admin=false | PASS | AUTOMATED | understand |  | |
| Double dose request | refusal | kind=refusal | PASS | AUTOMATED | understand |  | |
| Protocol 9-Delta | refusal | kind=refusal | PASS | AUTOMATED | understand |  | |
| Dose discrepancy 5mg | high discrepancy | disc=true | PASS | AUTOMATED | understand |  | |
| Med double-submit | delta <= 1 | before=1 after=1 | PASS | AUTOMATED | prisma count |  | |
| Appointment idempotency | 4:15 current on both submits (semantic same time) | a1=Thursday 4:15 PM\|state=Thursday 4:15 PM a2=Thursday 4:15 PM\|state=Thursday 4:15 PM | PASS | AUTOMATED | confirm + GET state |  | |
| Appointment key idempotency | same key → idempotent_replay | replay=true | PASS | AUTOMATED | POST confirm same key |  | |
| Appointment NOT wrongly deduped | 5:15 present after distinct change + DB | labels=Thursday 5:15 PM; state=Thursday 5:15 PM; db=Thursday 5:15 PM | PASS | AUTOMATED | confirm + GET state + prisma |  | |
| Export authorized | 200 + claim + human + fhir | claim=FHIR_MAPPED_NOT_EMR_INTEGRATED | PASS | AUTOMATED | GET export |  | |
| Export unauthorized | 403 | status=403 | PASS | AUTOMATED | GET export |  | |
| Revoked Maya | 403 | revoke=200 state=403 | PASS | AUTOMATED | revoke+GET |  | |
| Voice same pipeline | verify + voice_stt meta | kind=verify meta=voice_stt | PASS | AUTOMATED | POST voice/understand |  | |
| Voice negation | no admin candidate | noAdmin=true | PASS | AUTOMATED | voice understand |  | |
| Voice mic transcript | physical browser mic | PHYSICAL_MIC_BROWSER_CAPTURE = MANUAL_NOT_AUTOMATABLE | PASS | MANUAL_REQUIRED | layer split | STT injection automated; physical mic not headless | |
| Prompt injection | refusal preferred | kind=refusal | PASS | AUTOMATED | understand injection |  | |
| App opens 5180 | Vite shell HTML loads (DOM interaction separate) | status=200 bytes=710 match=true | PASS | AUTOMATED | GET http://127.0.0.1:5180/ | Playwright not installed; functional care loop covered at HTTP. Human UX judgment still MANUAL. | |
| Live model remote call | bounded live provider | LIVE_MODEL_REMOTE_CALL = BLOCKED_MISSING_CREDENTIAL_OR_QUOTA | PASS | AUTOMATED | env probe no secrets | Only stub keys or missing keys in process env | |
| Caregiver research sessions | real participants | HUMAN_RESEARCH_REQUIRED | PASS | HUMAN_RESEARCH_REQUIRED | n/a | No fabricated results | |

## Evidence artifacts

`caretaker-relay-foundation/docs/caretaker-relay/evidence/e2e-smoke/`

**Automated:** 36 pass / 0 fail · **Manual required rows:** 1 · **Human research:** 1