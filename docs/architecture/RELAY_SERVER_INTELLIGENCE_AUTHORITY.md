# Relay Server Intelligence Authority

## North star

> Relay is a conversational projection over governed care truth.

The **server** owns interpretation, retrieval, persona projection, and memory.

## Path

```
USER
 → authenticated principal
 → active care recipient
 → authorization
 → durable conversation context (principal × recipient)
 → intent + decision context
 → deterministic retrieval plan
 → current care truth + history + instructions + uncertainty
 → role-authorized projection
 → deterministic answer OR bounded LLM synthesis
 → grounding (projections only)
 → plain-language answer + source_refs
 → persist private RelayTurn
 → UI renders
```

## Hybrid answering

| Path | When |
|------|------|
| Deterministic | Medication due, next appointment, team, open checks, handoff prep, most structured intents |
| LLM synthesis | Multi-source narrative when model available; never unrestricted DB access |

User never needs to know which path answered.

## Modules (care-domain)

- `relay/intents.ts`
- `relay/projections.ts`
- `relay/conversation-memory.ts`
- `relay/answer-engine.ts`
- `services/relay-answer.ts`

## API

`POST /api/v1/care/answer`

Returns: `answer`, `intent`, `persona`, `source_refs`, `conversation_id`, `turn_id`, `model_path`, `authority: "server"`.
