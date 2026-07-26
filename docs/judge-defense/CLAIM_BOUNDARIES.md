# Claim Boundaries — What We May and May Not Say

**Audience:** Founder + judges  
**Rule:** Overclaiming loses trust faster than admitting a boundary.

## Authorized claims

| Claim | Wording | Evidence |
|-------|---------|----------|
| Care coordination companion | Shared care context for people helping one care recipient | Login copy + product shell |
| Person-centered orientation | In controlled testing, family/DSP reach orientation in ~15–17s | Task-time evidence |
| Natural language → verified care note | Caregiver speaks; system structures; human confirms | Care update loop + notes API |
| Safety perimeter | Refuses invented protocols, false med premises, cross-recipient mix | Protocol 9-Delta, red team, torture bank |
| Honest scheduling | Lab slots; request saved; not clinic-accepted | Schedule/Slot path |
| Role-aware same product | Family / DSP / provider share system with different posture | Multi-role login |
| Isolation | Tenant + recipient boundaries enforced server-side | Isolation tests + live refuse |
| Provenance language | “On file”, authorized, observation vs confirmed | Profile + answer patterns |
| Controlled burden reduction | “In controlled product testing…” time/step savings | Task-time pack |
| Public deploy | Live at care.niovlabs.com with SHA parity | Freeze verify |

## Forbidden / high-risk claims

| Claim | Why forbidden |
|-------|---------------|
| “Saves caregivers X minutes in real life” | No field validation; recruitment paused |
| “Validated with caregivers” | CAREGIVER INPUT: NONE |
| “HIPAA certified / BAA complete” | Not claimed; lab posture |
| “Books real clinic appointments” | Lab Schedule/Slot honesty only |
| “Diagnoses / clinical decision support” | Explicitly not |
| “Always online LLM” | OpenAI quota external block |
| “Autonomous care decisions” | HITL on consequential updates |
| “Replaces EHR / DSP workforce system” | Track 1 scope; workforce N/A |
| “100% hallucination-proof forever” | Perimeter strong; not omniscience |
| Synthetic data presented as real patients | Lab personas only |

## Synthetic vs real

| Layer | Status |
|-------|--------|
| Care recipients (Evelyn, Robert, …) | **Synthetic lab** |
| Caregivers (Marcus, Maya, Daniel, …) | **Synthetic lab principals** |
| Medications / conditions / appointments | **Synthetic lab fixtures** |
| Product behavior / APIs / isolation | **Real software** |
| Public deployment | **Real** |
| Caregiver interviews | **None yet** |
| Production PHI | **None in lab** |

## What is autonomous vs human

| Autonomous / deterministic | Human required |
|----------------------------|----------------|
| Answer from on-file care truth | Confirm care update → note |
| Refuse false premise / invent protocol | Clinical judgment always |
| Slot availability listing | Clinic acceptance of booking |
| Coverage projection | Actual human showing up |
| Isolation enforcement | Role assignment / membership |
| Reminder projection from appointments | Dose change authorization |

## OpenAI external blocker language

> “Live LLM completion is currently externally quota-blocked. The safety perimeter, care truth Q&A, scheduling honesty, and HITL paths run on the deterministic server path and remain demonstrable.”

Say once. Do not apologize repeatedly.
