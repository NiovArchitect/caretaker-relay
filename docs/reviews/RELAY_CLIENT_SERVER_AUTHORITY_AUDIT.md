# Relay Client/Server Authority Audit

**Date:** 2026-07-24  
**Campaign:** Server Intelligence Closure  
**Baseline before:** client `src/lib/relay/*` owned intelligence; server `/answer` was simpler.

## Classification

| Responsibility | Before | After (target/done) |
|----------------|--------|---------------------|
| Intent classification | CLIENT ONLY (`src/lib/relay/intents.ts`) | **SHARED LIBRARY** in `@caretaker-relay/care-domain/relay` · **SERVER executes** |
| Role/persona detection | CLIENT | **SERVER** via `roleLabelForPrincipal` + `classifyPersona` |
| Decision context | CLIENT | **SERVER** |
| Recipient binding | DUPLICATED | **SERVER** (body `care_recipient_id` + access check) |
| Authorization | SERVER ONLY | **SERVER ONLY** |
| Projection building | CLIENT | **SERVER** (`buildProjections` in care-domain) |
| Medication/appointment retrieval | SERVER store / CLIENT package | **SERVER store** |
| Follow-up reference resolution | CLIENT memory Map | **SERVER durable CareUpdate turns** |
| Conversation history | CLIENT session Map | **SERVER** `RELAY_TURN_V1` / `RELAY_FOCUS_V1` on CareUpdate |
| Role-conditioned composition | CLIENT answerEngine | **SERVER** `answerRelayQuestion` |
| Deterministic fast-path | CLIENT | **SERVER** `canAnswerDeterministically` |
| LLM synthesis | partial / quota blocked | **SERVER** reserved path; deterministic first |
| Grounding validation | CLIENT compose | **SERVER** (projections-only evidence) |
| Source refs | CLIENT | **SERVER** response fields |
| Persistence | none durable | **SERVER** CareUpdate + audit |
| UI rendering | CLIENT | **CLIENT ONLY** |
| Competing answer engine | CLIENT ran runAnswerEngine | **REMOVED** — client only POST `/answer` |

## Authority rule

**ONE** business implementation: `@caretaker-relay/care-domain`  
**Transports:** HTTP API (production) or in-process store via same `answerRelayQuestion` (package fallback)  
**Client must not invent a second algorithm.**

## Residual client files

`src/lib/relay/*` may remain as **unit-test fixtures / historical helpers** but `answerCareQuestion` no longer calls them for product authority.
