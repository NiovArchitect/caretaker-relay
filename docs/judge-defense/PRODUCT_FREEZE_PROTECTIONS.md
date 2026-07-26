# Product Freeze Protections

**Purpose:** Prevent future agents (or humans in a hurry) from casually “improving” a closed product and breaking judge readiness.

## Freeze declaration

```
CARETAKER RELAY — HUMAN EXPERIENCE / JUDGE DEFENSE FREEZE
APP SHA:  5ee646fe2e54da5fc7f7feee2dd01d83f520efcc
API SHA:  cdd5cc097ab0d69daf7f6607b0cdae609c068abd
BRANCH:   checkpoint/caretaker-relay-track1-2026-07-22
PUBLIC:   https://care.niovlabs.com
MODE:     JUDGE DEFENSE + EVIDENCE ONLY
```

## Absolute do-not list (agents)

Do **not**:

- Redesign UI/UX  
- Add features  
- Refactor working product code  
- Change schemas, routing, relay behavior, scheduling, notes, notifications, care truth, auth, tenant logic  
- “Clean up” code or upgrade dependencies  
- Redeploy “just in case”  
- Change visual design or semantic button system  
- Fix cosmetic preferences  

## Only authorized product code change

**Reproducible P0 or P1** discovered during judge defense:

1. Document defect with repro  
2. Minimal fix only  
3. Prove + regress  
4. Restore freeze (new SHA recorded)  
5. Do not expand scope  

P2/P3 → document only in observations.

## Allowed work under freeze

- Docs under `docs/judge-defense/`, `docs/reviews/`, `docs/research/`  
- Evidence scripts that **call** public APIs (no product mutation)  
- Updating Downloads review file  
- Screenshots of existing UI  
- Judge Q&A / demo rehearsal notes  

## Agent guardrails file

See: `docs/judge-defense/AGENTS_FREEZE.md` (include in agent context).

## Git discipline

- Prefer branch `checkpoint/caretaker-relay-track1-2026-07-22` for demo  
- Do not force-push freeze branch  
- Do not merge speculative feature branches into freeze without founder  
- Working tree may hold docs-only changes; do not mix product edits  

## Deploy discipline

- Do not redeploy app/API merely because a docs campaign ran  
- If deploy required for P0/P1: record old SHA, new SHA, parity check  

## How to detect freeze break

| Signal | Meaning |
|--------|---------|
| APP HEAD ≠ freeze SHA without P0/P1 note | Freeze broken |
| UI redesign PR | Freeze broken |
| Schema migration on care-domain | Freeze broken unless P0 |
| “Improved” Relay copy changing refuse semantics | Freeze broken |

## Founder override

Only the founder may end the freeze or authorize recruitment / OpenAI work.
