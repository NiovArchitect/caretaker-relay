# Final Evidence Pack — Judge Defense

**Generated:** 2026-07-25  
**Product freeze:** YES  
**Public:** https://care.niovlabs.com  
**APP SHA:** `5ee646fe2e54da5fc7f7feee2dd01d83f520efcc`  
**API SHA:** `cdd5cc097ab0d69daf7f6607b0cdae609c068abd`

## Index of evidence

| # | Evidence set | Count / status | Primary location |
|---|--------------|----------------|------------------|
| 1 | Smart 40 | 40 adversarial/human prompts (human-experience-proof) | `scripts/human-experience-proof.mjs` |
| 2 | Judge red-team | **121/121** | `scripts/judge-red-team.mjs` + prior closure |
| 3 | Brutal torture | **105/105** | `scripts/torture-collaboration.mjs` |
| 4 | Scenario orchestration | **32/32** | `scripts/scenarios-30-plus.mjs` / scenario-orchestration |
| 5 | Human proof | **95/95** | human-experience-proof run |
| 6 | Orientation proof | **20/20** | `scripts/orientation-browser-proof.mjs` |
| 7 | Button audit | **25/25** | `scripts/button-audit.mjs` |
| 8 | Monorepo test baseline | **3,423** tests (0 fail class in prior freeze; 16 skipped class as recorded) | caretaker-relay-foundation vitest |
| 9 | Task-time / burden | 8 flagship workflows; ~1430s controlled time saved; 71 steps reduced | `docs/reviews/CAREGIVER_TASK_TIME_AND_BURDEN_EVIDENCE.md` |
| 10 | Privacy / tenant isolation | Multi-tenant + product-isolation tests + live refuse prompts | foundation `PRODUCT_ISOLATION.md`, isolation scripts |
| 11 | Protocol 9-Delta | Live refuse invent protocol | adversarial-guard + torture + demo |
| 12 | Scheduling evidence | new / slots / multi-turn / book request / reschedule / cancel / collision / idempotency | human-experience matrix rows 25–40 |
| 13 | Documentation evidence | care notes, History, filters, role terminology | Care History UI + note pipeline |
| 14 | Scaling evidence | 1,000-event / multi-person lab scaling (prior campaign) | campaign reports |
| 15 | Human experience matrix | **51 proven / 3 N/A / 1 external block** | `HUMAN_EXPERIENCE_DIRECTIVE_COMPLETION_MATRIX.md` |
| 16 | ACL judge matrix | Mapped criteria → evidence | `ACL_JUDGE_EVIDENCE_MATRIX.md` |
| 17 | ACL final reassessment | Official themes ↔ demo | `ACL_FINAL_JUDGE_READINESS_REASSESSMENT.md` |
| 18 | Judge torture bank | 150+ prompts | `scripts/judge-torture-bank-execute.mjs` |
| 19 | Screenshots | Today / Care / People / Documents / mobile / tablet | `docs/reviews/current-export/screenshots/` |
| 20 | ChatGPT single-file review | Authoritative handoff | `/Users/genghishameha/Downloads/CARETAKER_RELAY_CHATGPT_REVIEW.txt` |

## Task-time highlight (controlled wording only)

| Workflow | Relay | Baseline | Quality |
|----------|------:|---------:|---------|
| Family orientation | ~16.8s / 4 steps | 180s / 14 | PASS |
| DSP orientation | ~15.5s / 4 steps | 210s / 16 | PASS |
| Natural care update | ~14.6s / 5 steps | 150s / 11 | PASS |
| Handoff | ~18.7s / 3 steps | 200s / 12 | PASS |
| Provider summary | ~0.4s / 1 step | 240s / 13 | PASS |
| Schedule new (lab) | ~0.3s / 3 steps | 180s / 10 | PASS |
| Reschedule | ~0.3s / 1 step | 200s / 11 | PASS |
| Clarification loop | ~23.7s / 4 steps | 160s / 9 | PASS |

**Wording:** “In controlled product testing…” — never population claim.

## Isolation / safety highlight

- Cross-recipient medication pull → refuse  
- Cross-tenant / all-patients dump → refuse  
- Protocol 9-Delta → refuse invent  
- False insulin / double dose → refuse + on-file meds  
- Role spoof via chat → auth identity wins  

## What is **not** in the pack

- Caregiver field validation (NONE / PAUSED)  
- Live OpenAI completion success (BLOCKED_EXTERNAL_QUOTA)  
- Live EHR booking (N/A by design)  
- Workforce management (N/A Track 1)  

## How to present the pack in 30 seconds

1. Public product live  
2. 51/55 internal requirements proven; freeze  
3. Safety numbers: 121 red / 105 torture / 95 human / Protocol 9-Delta  
4. Burden: controlled task-time table  
5. Honest boundaries: synthetic lab; recruitment paused; OpenAI external  

## Integrity

- No secrets/PHI in review exports (PASS posture)  
- No product code change in this judge-defense campaign unless P0/P1  
