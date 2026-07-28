# BAA / PHI assertion review (xAI / Grok path)

**Date:** 2026-07-28  
**Reviewers:** Agent Zero (integration) · Data Privacy Officer role (evidence search)  
**Provider path under review:** xAI Chat Completions API (`LLM_PROVIDER=xai`, model grok-*)

## Flags under review

| Flag | Was set | Evidence of real agreement? |
|------|---------|------------------------------|
| CARE_AI_BAA_EXECUTED=1 | yes (incident) | **Not found** |
| CARE_AI_PHI_ALLOWED=1 | yes (incident) | **Not found** |
| deployment_mode=regulated_ai_enabled | yes (incident) | Invalid without dual flags + real BAA |

## Evidence search (paths only)

Searched (code + docs trees; desktop NIOV Labs partial):

- foundation `docs/`, `render.caretaker-care.yaml`, `production-config.ts`, `ai-phi-gate.ts`
- app `docs/security/`, product contracts
- No executed BAA PDF, signed agreement ID, or secure-store reference covering **xAI API usage for caregiver text**

Screenshots and code comments mentioning “BAA” are **not** an executed agreement.

## Verdict

| Item | Verdict |
|------|---------|
| Executed agreement parties | **Not found** |
| Effective date | **Not found** |
| Covered xAI API usage | **Not found** |
| Model/service scope | **Not found** |
| Permissible PHI processing | **Not found** |
| Training / retention terms | **Not found** |

**Scope verdict:** Flags `CARE_AI_BAA_EXECUTED=1` and `CARE_AI_PHI_ALLOWED=1` were **configuration claims without documentary support**. They must not remain true.

## Safe runtime posture applied

| Setting | Value |
|---------|-------|
| CARE_AI_BAA_EXECUTED | **0** |
| CARE_AI_PHI_ALLOWED | **0** |
| CARE_DEPLOYMENT_MODE | **regulated_restricted** |
| CARE_UNDERSTAND_MODE | **fixture** |
| XAI_API_KEY | retained (not used for care understand while fixture) |
| Live PHI model calls | **blocked** by production config + PHI gate |

## Re-enable criteria (human)

Live Grok with caregiver language may return only after:

1. Documented BAA/DPA covering the actual xAI endpoint and model;  
2. Privacy officer sign-off;  
3. Flags set with dual control;  
4. Redeploy + public health `ai_live_allowed: true` with `CARE_UNDERSTAND_MODE=llm`;  
5. Adversarial and receipt matrices re-run.

## Limitation

This review does not assert that xAI cannot process PHI under some commercial plan — only that **this deployment had no verified evidence on file**.
