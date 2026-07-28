# LLM-ready deterministic care orchestration

## Principle

The product works **with or without** a live LLM.  
Fixture mode is production-valid.  
An approved LLM may improve interpretation only.

## Pipeline (authoritative)

```text
authenticated request
→ bind tenant + recipient + principal (deterministic)
→ minimum-necessary domain envelope
→ interpreter (fixture OR approved LLM)
→ strict action-plan / candidate schema
→ schema validation (fail closed on garbage)
→ authority + permission policy
→ focused clarification (0–1 questions)
→ confirmation when consequential
→ deterministic executor
→ durable store
→ projections + notifications + handoff
→ execution receipt
→ human confirmation copy (from receipt)
→ audit
```

## Interpreter may propose

- intent / category  
- entities, times, uncertainty  
- missing fields  
- candidate actions  
- clarification text  
- draft user-visible summary  

## Interpreter must never control

- recipient or tenant  
- authorization / domain access  
- medication-plan approval  
- schedule finalization  
- task ownership mutations  
- access membership  
- document acceptance as truth  
- persistence  
- notifications  
- audit integrity  

## Current deployment

| Layer | State |
|-------|--------|
| Interpreter | **fixture** (`understand_mode=fixture`) |
| Live Grok | **disabled** — no PHI BAA evidence for xAI |
| Forced LLM | 403 `LLM_PATH_DISABLED` |
| Executors | care loop, work-items, invitations, access-request, documents, schedule |

## Re-enable LLM (external + technical)

1. Verified BAA/DPA covering xAI path  
2. Privacy officer sign-off  
3. `CARE_AI_BAA_EXECUTED=1`, `CARE_AI_PHI_ALLOWED=1`, `regulated_ai_enabled`, `CARE_UNDERSTAND_MODE=llm` via single-key patches  
4. Full adversarial + provider-failure matrix  
5. Schema validation gates remain mandatory  

## Fail closed

Malformed model output → deterministic structured fallback or clarification — **never** invent care truth or claim success.  
