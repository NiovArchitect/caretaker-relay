# Vendor / BAA Inventory

**Date:** 2026-07-26  
**Status:** PARTIAL — technical inventory; **executed BAAs EXTERNAL**

| Vendor / service | Data classes possible | BAA available? | Executed BAA in evidence? | Notes |
|------------------|----------------------|----------------|---------------------------|-------|
| Anthropic (LLM) | Care text / possible PHI in prompts | Vendor-dependent | **No** | Care API `CARE_UNDERSTAND_MODE=llm` |
| OpenAI (LLM optional) | Same | Vendor-dependent | **No** | Optional key |
| Render | App + API hosting, logs | Platform DPA/BAA path | **Not evidenced** | Public HTTPS |
| Postgres (DATABASE_URL host) | Care domain rows | Host-dependent | **Not evidenced** | Prisma Care* tables |
| Browser analytics | Unknown if any third-party | N/A | N/A | Prefer none for PHI |
| Email/SMS | Verification codes | Future | **Not integrated** | Token lifecycle only |
| STT (if used) | Voice transcripts | Vendor-dependent | **Not evidenced** | Voice understand path |

**Rule:** Do not send production PHI to any LLM vendor without executed BAAs and data processing agreements when HIPAA BA posture applies.
