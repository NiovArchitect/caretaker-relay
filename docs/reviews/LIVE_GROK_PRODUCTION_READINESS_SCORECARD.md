# LIVE GROK PRODUCTION-READINESS SCORECARD

**Date:** 2026-07-28  
**Controller:** Agent Zero  
**Mission:** Env recovery · secret review · BAA truth · JWT invalidation · PHI fail-closed · public care continuity  

---

## 1. Governing instructions read

| Path | Status |
|------|--------|
| `/Users/genghishameha/agency-agents/README.md` | read |
| `/Users/genghishameha/agency-agents/specialized/agents-orchestrator.md` | read |
| `/Users/genghishameha/dev/NIOV Labs/github/AGENT-ZERO/AGENTS.md` | read |

### Agents selected (dynamic)

| Agent | Evidence | Gap | Repo | Auth |
|-------|----------|-----|------|------|
| agents-orchestrator | Live Grok + env incident | Integration discipline | both | control |
| Security / privacy | BAA flags without evidence | PHI boundary | foundation | write env+gate |
| SRE / Render | Bulk env PUT wipe | Env reconciliation | ops | patch env |
| Session/IAM | JWT rotation | Stale session | foundation/public | test |
| Backend / LLM | Forced mode=llm → 500 | Fail closed | foundation | write |
| Reality checker | Care continuity | R2R regression | app scripts | run |
| Evidence collector | Required artifacts | Docs | app | write docs |

---

## 2. Runtime (after fail-closed)

| Item | Value |
|------|-------|
| APP deploy | `c3e4f14` |
| APP HEAD | `a5d2f37` (docs ahead; product deploy `c3e4f14`) |
| API deploy | **`d299ebd`** |
| API HEAD | **`d299ebd`** |
| understand_mode | **fixture** |
| llm_ready | **false** |
| llm_provider (configured) | xai (key present, **not** used for care understand) |
| ai_live_allowed | **false** |
| deployment_mode | **regulated_restricted** |
| CARE_AI_BAA_EXECUTED | **0** |
| CARE_AI_PHI_ALLOWED | **0** |
| store_backend | prisma |
| background workers | 0 |

---

## 3. BAA / PHI

| Check | Result |
|-------|--------|
| Executed BAA covering xAI API | **Not found** |
| Flags previously set to 1 without evidence | **Corrected to 0** |
| Live PHI model calls | **Blocked** |
| Document | `docs/security/BAA_PHI_ASSERTION_REVIEW.md` |

---

## 4. Environment reconciliation

| Check | Result |
|-------|--------|
| Manifest | `docs/operations/API_ENVIRONMENT_REQUIRED_MANIFEST.md` |
| Present required for fixture/regulated_restricted | **19 names** |
| MISSING REQUIRED ENV | **0** (fixture posture) |
| Bulk replace used this campaign | **No** (single-key PUT only after incident) |
| OPENAI_API_KEY | absent (no unapproved restore) |
| UNKNOWN SECURITY-CRITICAL DEFAULTS | **0** for fail-closed posture |

---

## 5. Secrets

| Check | Result |
|-------|--------|
| SECRETS COMMITTED TO GIT | **0** |
| SECRETS IN USER-VISIBLE ARTIFACTS | **0** |
| UNREVIEWED HIGH-RISK EXPOSURES | **0 open** (founder may rotate XAI key) |
| Document | `docs/security/ENVIRONMENT_INCIDENT_SECRET_REVIEW.md` |

---

## 6. JWT / sessions

| Check | Result |
|-------|--------|
| OLD JWT ACCEPTED | **0** (forged/garbage/pre-rotation placeholder → 401) |
| STALE WRITES AFTER TOKEN FAILURE | **0** |
| NEW LOGIN | **PASS** |
| VALID SESSION READ | **PASS** |
| Pre-rotation token available | No (incident) |
| Artifact | `docs/testing/JWT_ROTATION_SESSION_INVALIDATION_RESULTS.json` |

---

## 7. Live-Grok vs fail-closed posture

| Check | Result |
|-------|--------|
| Live Grok for care understand | **DISABLED** (pending real BAA) |
| Forced `mode=llm` | **403 LLM_PATH_DISABLED** |
| Fixture understand + confirm | **PASS** |
| Plan-change receipt destinations | **PASS** |
| R2R dual-browser | **PASS 6/6** `cross_screen_rate: 1` |
| Unauthorized understand | **403 ACCESS_DENIED** |
| Prompt-injection exfil | no secrets returned (FIXTURE path) |
| Provider timeout/rate-limit matrix on live Grok | **NOT RUN** (live PHI path disabled by policy) |
| LIVE GROK ACTION PROMPTS | **0 evaluated on live path** (correct fail-closed) |

---

## 8. Scorecard fields

```
LIVE GROK CARE PATH: DISABLED (BAA unproven)
PHI TO UNAPPROVED PROVIDER: 0 (blocked)
FORCED LLM BYPASS: 0 (403)
OLD JWT ACCEPTED: 0
STALE WRITES: 0
NEW LOGIN: PASS
RECEIPT-TO-REALITY: PASS 6/6
UNAUTHORIZED UNDERSTAND: 0 success
FALSE SUCCESS: 0
MISSING REQUIRED ENV: 0
BAA FLAGS TRUTHFUL: YES (0/0 after correction)
OPENAI FALLBACK RESTORED: NO
FOUNDER PHYSICAL-PHONE: PENDING
PRODUCT FREEZE: NOT RESTORED
```

---

## 9. Product files changed (this campaign)

**Foundation**

- `packages/care-domain/src/services/ai-phi-gate.ts`
- `apps/api/src/routes/care.routes.ts`

**App docs**

- `docs/operations/API_ENVIRONMENT_REQUIRED_MANIFEST.md`
- `docs/security/ENVIRONMENT_INCIDENT_SECRET_REVIEW.md`
- `docs/security/BAA_PHI_ASSERTION_REVIEW.md`
- `docs/testing/JWT_ROTATION_SESSION_INVALIDATION_RESULTS.json`
- `docs/reviews/LIVE_GROK_PRODUCTION_READINESS_SCORECARD.md`

**Migrations:** none  

---

## 10. Remaining internal gaps

1. Founder physical-phone confirmation  
2. Live Grok action / adversarial / provider-failure matrix **blocked until verified BAA**  
3. REDIS shared session revocation still not multi-instance safe (warning only)  
4. Full browser stale-tab PHI UI proof (API-level invalid token proven; multi-tab UI partial)  
5. Dosage-advice refusal message surface can be clearer on some phrasings  

## External gaps

1. Execute and file real xAI BAA/DPA before re-enabling `CARE_UNDERSTAND_MODE=llm`  
2. Optional: re-add OPENAI only with separate contract approval  
3. Founder phone  

---

## PRODUCT FREEZE

**NOT RESTORED**

Truthful regulated posture restored after false BAA flags. Care product continuity (fixture + receipts + next-shift) remains green. Live Grok is **not** production-ready for PHI-bearing caregiver language until contractual evidence exists.
