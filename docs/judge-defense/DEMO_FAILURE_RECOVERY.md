# Demo Failure Recovery Playbook

**Tone:** calm, prepared, technical honesty — never panic.  
**Goal:** judges see competence under failure, not thrash.

## Pre-declared external risk (say before demo if time)

> “This is a public Render deploy of a frozen lab. Live LLM completion may be externally quota-limited; the care-truth and safety perimeter are deterministic.”

## Risk table

| Risk | Visible symptom | Recovery (say this) | Action |
|------|-----------------|---------------------|--------|
| OpenAI quota | Model unavailable / thin LLM path | “Live LLM is externally quota-blocked; safety perimeter and on-file Q&A are deterministic.” | Meds, profile, Protocol 9-Delta, coverage, schedule |
| Render cold start | 5–20s first request | “Public service warming—one moment.” | **One** retry; narrate once |
| Network blip | Connection chip / hang | “Refreshing the session.” | Hard reload `?cb=<unix>`, re-login |
| Session expired | Login gate | “Re-entering as Marcus.” | Login again |
| Verify panel missing | Thread-only reply | “Consequential verify appears when care truth would change; this path stayed read-only.” | Age / false premise / protocol |
| Wrong principal | Unexpected role UI | “Switching to the family caregiver principal.” | Sign out → Marcus |
| Cluttered schedule | Extra lab appointments | “Resetting schedule state.” | Cancel via Relay or reset steps |
| Slow Relay (>3s) | Spinner | “Server-authoritative answer path…” | Do not double-submit |
| Full outage | 5xx / blank | “Public deploy is unreachable; continuing on evidence and architecture.” | Screenshots + evidence pack |

## Failure ladder (always this order)

1. **Retry once** (single request)  
2. **Hard refresh** with cache-buster `?cb=<timestamp>`  
3. **Re-login** as same principal  
4. **Switch beat** to deterministic wow:  
   - Protocol 9-Delta refuse  
   - Insulin false premise  
   - About profile person intelligence  
   - Coverage who-next  
5. **Evidence slide** — 121 red / 105 torture / 95 human / task-time / 3423 tests  
6. **Architecture Q&A** — never invent a live feature  

## Demo reset (clean judge household)

1. Sign out  
2. Reload `https://care.niovlabs.com/?cb=<timestamp>`  
3. Login **Marcus Carter** (family)  
4. Confirm **Orient for Evelyn** + **Who is helping**  
5. Optional: clear experimental appointments via cancel path only if cluttered  
6. Optional DSP flash: sign out → **Daniel**  

## Pre-demo T−5 checklist

- [ ] Public URL loads (200)  
- [ ] Lab principals visible on login  
- [ ] One successful “How old is Evelyn?”  
- [ ] One successful Protocol 9-Delta  
- [ ] Browser zoom readable for room  
- [ ] Evidence pack path open on second screen  
- [ ] Founder knows OpenAI one-liner  

## Never do

- Refresh five times in silence  
- Blame the judge’s network  
- Open browser DevTools mid-demo  
- Type production secrets or real PHI  
- Claim “it always works” after a failure  
- Pivot to localhost half-built branches  
- Start coding during the demo  

## Scripted calm lines

| Situation | Line |
|-----------|------|
| Cold start | “Public service is waking up—this is the real deploy, not a local mock.” |
| OpenAI | “The model path is externally limited today; care truth does not depend on it.” |
| Refuse | “That refusal is the product working—not a crash.” |
| Outage | “We’ll use the evidence pack while infra recovers.” |

## Post-demo if failure occurred

1. Log symptom + step in `docs/judge-defense/` observations (P2/P3 unless safety)  
2. Do **not** hot-fix product unless P0/P1  
3. Rehearse recovery path once more offline
