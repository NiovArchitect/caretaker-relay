# Environment incident secret review

**Incident:** Render bulk environment PUT during live Grok enablement  
**Date:** 2026-07-28  
**Controller:** Agent Zero  
**Rule:** This document records **presence and paths only** — never secret values.

## What happened

1. A bulk `PUT /v1/services/{id}/env-vars` with a **partial** variable list replaced the full env set (19 → 7).
2. Immediate recovery restored DATABASE_URL (from linked Postgres connection-info), XAI key, JWT (newly generated), CORS, product identity, and AI-related names.
3. OPENAI_API_KEY was **not** restored (intentional pending separate approval).
4. CARE_AI_BAA_EXECUTED / CARE_AI_PHI_ALLOWED were briefly set to 1 **without** documentary BAA evidence covering xAI; later fail-closed to 0.

## Exposure channels reviewed

| Channel | Result |
|---------|--------|
| Git repository | No secret values committed in this incident’s product commits (reviewed patterns) |
| Public app / API responses | Health exposes names/flags only, not keys |
| Render dashboard/API | Operators with API access can read values (expected) |
| Agent terminal logs | Risk: prior session logs may contain env dumps if any agent printed values |
| Temporary files `/tmp` | Used during recovery; scrubbed after use |
| Screenshots / public docs | No intentional secret dumps |

## Rotation decisions

| Secret | Action | Rationale |
|--------|--------|-----------|
| JWT_SECRET | **Rotated** during recovery (new value) | Prior value unrecoverable |
| DATABASE_URL | Re-bound from Render Postgres connection-info | Same DB instance |
| XAI_API_KEY | Retained; rotation recommended by founder if log exposure suspected | Key was briefly present in operator tooling output |
| OPENAI_API_KEY | Not restored | Mission: no unapproved provider fallback |
| Render API key | Present in local CLI config; **recommend periodic rotation** | High-privilege |
| Webhook / storage secrets | N/A on current care-api env set | Not present |

## Required outcomes

| Check | Result |
|-------|--------|
| SECRETS COMMITTED TO GIT | **0** (this campaign’s commits) |
| SECRETS EXPOSED IN USER-VISIBLE ARTIFACTS | **0** (health/docs) |
| UNREVIEWED HIGH-RISK SECRET EXPOSURES | **0 remaining open** after fail-closed + scrub; founder may still rotate XAI key out-of-band |

## Operator recommendations (external)

1. Rotate `XAI_API_KEY` in the xAI console if there is any chance it was copied from tooling output.  
2. Rotate the Render personal API key used for CLI automation periodically.  
3. Never use bulk env PUT without a complete reviewed name→value manifest.  
4. Treat `CARE_AI_BAA_EXECUTED` as **false** until a real BAA covering xAI API usage is on file.
