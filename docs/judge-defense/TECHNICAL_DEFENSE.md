# Technical Defense Brief (Judge-Facing)

**Product freeze SHAs**  
- APP: `5ee646fe2e54da5fc7f7feee2dd01d83f520efcc`  
- API: `cdd5cc097ab0d69daf7f6607b0cdae609c068abd`  
- Public: https://care.niovlabs.com  

## Architecture in one minute

1. **Care app (React/Vite)** — role-agnostic shell; Today / Care / People / Documents / Relay  
2. **Care API (Fastify + care-domain)** — server-authoritative answers, auth, notes, schedule  
3. **Care truth** — structured care records (profile, meds, appointments, notes, coverage)  
4. **Relay answer path** — intents + projections + adversarial guards; LLM optional for phrasing, not for inventing truth  
5. **HITL** — consequential care updates require verify → confirm before becoming care notes  

## How this is different from ChatGPT

| Dimension | ChatGPT | Caretaker Relay |
|-----------|---------|-----------------|
| Grounding | General knowledge | Care recipient record |
| Authority | Conversational | Auth identity + role + membership |
| Truth promotion | Free generation | On-file + verification state |
| Multi-party care | No care graph | Coverage, handoff, notes, people |
| Isolation | Session only | Tenant + recipient boundaries |
| Scheduling | Text | Schedule/Slot with collision honesty |
| Failure mode | Plausible invention | Refuse / UNKNOWN / escalate human |

## What the LLM actually does

- Optional natural-language assistance when available  
- Does **not** own care truth  
- Does **not** authorize dose changes  
- Does **not** bypass auth  
- When unavailable: deterministic answer path continues for on-file Q&A and safety refuses  

## Deterministic perimeter (always defendable)

- Medication list / instructions on file  
- Profile age, conditions, emergency snapshot  
- False premise refuse (insulin, double dose, fake protocol)  
- Cross-recipient refuse  
- Coverage who-now / who-next  
- Schedule slot list / collision / cancel language  
- Role authentication (cannot “pretend I’m Dr. Shah” via chat)  

## Hallucination controls

1. Adversarial guard (Protocol 9-Delta class)  
2. False-premise detection on meds / allergies  
3. “On file” / “don’t have” language patterns  
4. Human verify before care-note write  
5. No silent dose mutation from chat assertion  

## Isolation model

- **Tenant:** organization / lab household boundary  
- **Recipient:** active care space; Robert ≠ Evelyn without switch  
- **Role:** family / DSP / provider posture; auth token identity wins  
- **Minimum necessary:** no “all patients Dr. Shah sees” dump via chat  

## Scheduling honesty

- Lab availability slots shown  
- Draft → confirm → **request saved**  
- Not claimed as live EHR/clinic acceptance  
- Collision / unavailable surfaced  
- Reschedule / cancel intentional paths  

## Availability failure

If model path fails: product still answers from care truth; founder uses failure playbook; OpenAI remains external-only issue.

## Scaling evidence (lab)

Prior campaign: 1,000-event / multi-person lab scaling and monorepo suite (3,423 tests baseline). Not a production load certification for PHI-scale hospitals.

## What would need to happen for real deployment

1. Founder authorization to resume recruitment  
2. Caregiver + care-recipient validation cycles  
3. Production auth, BAAs, PHI hosting, audit retention as required  
4. Optional EHR / scheduling connectors with honest adapter contracts  
5. Live LLM quota / provider reliability SLA  
6. Clinical safety review for any expanded clinical surfaces  

Until then: **lab-ready Track 1 demonstration product**, not production medical system.
