# Simulated Judge Scorecard

**Competition:** ACL Caregiver AI Challenge — Track 1, Phase 1  
**Product:** Caretaker Relay  
**Freeze SHAs:** APP `5ee646f…` / API `cdd5cc0…`  
**Date:** 2026-07-25  

Scoring key: **STRONG** / **ADEQUATE** / **WEAK** / **GAP** / **N/A**

| Criterion (ACL themes) | Score | Our demo move | Evidence | Residual risk |
|------------------------|-------|---------------|----------|---------------|
| Responsiveness to caregiver need | STRONG | Orient + coverage + next actions | Task-time + orientation 20/20 | Real caregivers not yet |
| User-centered design | ADEQUATE | Semantic buttons, human copy, role labels | Screenshots + browser missions | Formal a11y cert not claimed |
| Person-centered care | STRONG | About profile, goals, preferences, emergency | Profile matrix | Synthetic person |
| High-quality care support | STRONG | Meds on file, notes, handoff, history | Smart 40 / human 95 | Field quality TBD |
| Minimize harmful/biased/unsafe AI | STRONG | Protocol 9-Delta, false premise, isolation | Red 121 / torture 105 | Live LLM path blocked |
| Transparency | STRONG | On-file / observation / verify | Provenance answers | Must not invent certainty |
| Human-in-the-loop | STRONG | Verify → confirm → note | Care update loop | Judge may ask edge cases |
| Measurable impact | ADEQUATE | Controlled task-time table | Task-time pack | Must not overclaim |
| Technical feasibility / deploy | STRONG | Public URL + SHA parity | care.niovlabs.com | Render cold starts |
| Privacy / isolation | STRONG | Cross-recipient/tenant refuse | Isolation tests + live | Continuous audit |
| Scheduling realism | STRONG | Honest lab slots | Scheduling suite | Not live EHR |
| Documentation continuity | STRONG | History + filters + roles | Doc pipeline | Real chart integration later |
| Multi-role (family/DSP) | STRONG | Same system different posture | Dual login demo | Care recipient UX TBD |
| Honesty about limits | STRONG | Claim boundaries doc | OpenAI + recruitment paused | Temptation to oversell |
| Field validation | GAP | Plan ready; sessions 0 | Research package | Explicit NONE |

## Overall simulated panel

- **Internal product readiness:** HIGH  
- **Judge demo readiness:** HIGH (with failure playbook)  
- **Judge narrative risk:** MEDIUM if founder overclaims validation  
- **External blocker:** OpenAI quota only  
- **P0/P1:** 0  

## Recommendation to founder

Lead with **person intelligence → safety refuse → HITL note → coverage/handoff → honest schedule**.  
Close with **controlled burden evidence + explicit non-claims**.  
Do **not** reopen product code for polish.
