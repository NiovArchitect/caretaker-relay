# Dual-mode AI architecture

## Modes

| Mode | When | Interpreter | PHI BAA required |
|------|------|-------------|------------------|
| **A Deterministic** | Live model off, provider fail, non-synthetic recipient, force fixture | Fixture | No |
| **B Synthetic Grok** | Server marks universe synthetic + keys + llm ready | Grok → schema → executors | No |
| **C PHI Grok** | BAA+PHI flags **and** privacy approval | Grok | **Yes** |

## Server authority

- `CARE_AI_DATA_CLASS=synthetic|lab` — deployment-wide competition/lab universe  
- `recipient.dataClassification` — per-recipient  
- `SERVER_SYNTHETIC_RECIPIENT_IDS` — hard-coded lab IDs (`cr-olivia`, …)  
- **Client cannot set synthetic**

## Grok may / may not

**May:** interpret language, multi-fact candidates, uncertainty, suggested copy  
**Must not:** bind recipient/tenant, authorize, write care truth, approve plans/access/docs  

## Current public posture (2026-07-28)

- Mode B enabled for synthetic lab (`care_ai_data_class=synthetic`)  
- Mode C **disabled** (`CARE_AI_BAA_EXECUTED=0`, `CARE_AI_PHI_ALLOWED=0`)  
- Provider: xAI / grok-3 when Mode B  
