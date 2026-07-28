# API environment required manifest

**Service:** `caretaker-relay-care-api` (Render)  
**Product:** Caretaker Relay care API  
**Generated:** 2026-07-28  
**Rule:** Variable **names** only in public docs — never values.

Sources: `apps/api/src/care-app.ts`, `packages/care-domain/src/services/production-config.ts`, `packages/care-domain/src/services/ai-phi-gate.ts`, `apps/api/src/services/llm/llm.service.ts`, `render.caretaker-care.yaml`, `.env.example`.

## Classification legend

| Class | Meaning |
|-------|---------|
| required | Service cannot safely run without it in production |
| optional | Feature-gated; safe default when absent |
| provider-specific | Only when that LLM provider is selected |
| secret | Never log, commit, or print |
| derived | Computed from other config |
| deprecated | Do not set on new deploys |

## Core / identity

| Name | Class | Notes |
|------|-------|-------|
| NODE_ENV | required | production |
| PRODUCT_ID | required | caretaker-relay |
| PRODUCT_NAMESPACE | required | cr |
| AUDIT_PRODUCT_TAG | required | caretaker-relay |
| PORT | required | 3100 |

## Data / auth

| Name | Class | Notes |
|------|-------|-------|
| DATABASE_URL | required, secret | Prisma store |
| DIRECT_URL | optional, secret | migrations / direct DB |
| CARE_STORE_BACKEND | optional | defaults from DATABASE_URL → prisma |
| JWT_SECRET | required, secret | ≥16 chars; rotation invalidates sessions |
| ENCRYPTION_KEY | optional, secret | full foundation; care-app may not require |

## CORS / public origins

| Name | Class | Notes |
|------|-------|-------|
| CARETAKER_APP_URL | required (prod) | public app origin |
| CARE_CORS_ORIGINS | required (prod) | allowlist |
| PUBLIC_APP_URL | optional | alternate origin |
| CORS_ORIGIN | optional | legacy alias |

## Deployment mode / AI gates

| Name | Class | Notes |
|------|-------|-------|
| CARE_DEPLOYMENT_MODE | required (prod) | synthetic_demo \| consumer \| regulated_restricted \| regulated_ai_enabled |
| CARE_UNDERSTAND_MODE | required | fixture \| llm |
| CARE_AI_BAA_EXECUTED | required when live model | **attestation only** — not legal proof |
| CARE_AI_PHI_ALLOWED | required when live model | **attestation only** — not legal proof |
| CARE_AI_REQUIRE_BAA | optional | force hard block |
| CARE_AI_DATA_CLASS | optional | synthetic \| lab allows non-PHI path |
| CARE_LAB_LOGIN_ENABLED | optional | forbidden with regulated_* |

## LLM providers

| Name | Class | Notes |
|------|-------|-------|
| LLM_PROVIDER | provider-specific | anthropic \| openai \| xai \| grok |
| XAI_API_KEY | provider-specific, secret | Grok |
| XAI_BASE_URL | optional | default https://api.x.ai/v1 |
| XAI_MODEL / GROK_MODEL | optional | default grok-3 |
| OPENAI_API_KEY | provider-specific, secret | not auto-restored |
| OPENAI_MODEL | optional | |
| OPENAI_BASE_URL | optional | |
| ANTHROPIC_API_KEY | provider-specific, secret | |
| PREFERRED_LLM | deprecated | alias for LLM_PROVIDER |

## Session / multi-instance

| Name | Class | Notes |
|------|-------|-------|
| REDIS_URL | optional, secret | shared revocation; multi-instance requires it |
| REDIS_KEY_PREFIX | optional | default cr: |
| CARE_USE_REDIS_SESSION | optional | 0/1 |
| CARE_MULTI_INSTANCE | optional | |

## Current Render presence (names only) — 2026-07-28 post-incident

**Present (19):**  
AUDIT_PRODUCT_TAG, CARETAKER_APP_URL, CARE_AI_BAA_EXECUTED, CARE_AI_PHI_ALLOWED, CARE_CORS_ORIGINS, CARE_DEPLOYMENT_MODE, CARE_STORE_BACKEND, CARE_UNDERSTAND_MODE, DATABASE_URL, DIRECT_URL, JWT_SECRET, LLM_PROVIDER, NODE_ENV, PORT, PRODUCT_ID, PRODUCT_NAMESPACE, XAI_API_KEY, XAI_BASE_URL, XAI_MODEL

**Posture after PHI fail-closed:**  
CARE_DEPLOYMENT_MODE=regulated_restricted · CARE_UNDERSTAND_MODE=fixture · CARE_AI_BAA_EXECUTED=0 · CARE_AI_PHI_ALLOWED=0 · LLM_PROVIDER=xai (key retained, not used for care content)

| Check | Result |
|-------|--------|
| Missing required for fixture/regulated_restricted | **0** |
| OPENAI_API_KEY | **absent** (intentional; no auto-restore) |
| REDIS_URL | **absent** (warning: multi-instance session not fully shared) |
| ENCRYPTION_KEY | **absent** (optional for care-app path) |

## Patch discipline

- **Never** bulk-replace env with a partial list (Render PUT `/env-vars` replaces the full set).
- Prefer **single-key** `PUT /env-vars/{KEY}`.
- Backup name list before any multi-key change.

## UNKNOWN SECURITY-CRITICAL DEFAULTS

After reconciliation: **0** for the fixture fail-closed posture.  
Live-PHI Grok remains **blocked** until verified BAA/PHI evidence is recorded by a human privacy officer.
