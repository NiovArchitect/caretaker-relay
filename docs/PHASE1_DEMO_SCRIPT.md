# Phase 1 demo script (implemented behavior only)

**Evidence class:** LAB / SYNTHETIC scenario (Olivia)  
**Does not require real PHI.**

## Preconditions

```bash
# Terminal A — DB + Care API
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
cd caretaker-relay-foundation
docker compose -f docker-compose.local.yml up -d postgres
export DATABASE_URL='postgresql://caretaker:caretaker_local_only@localhost:5434/caretaker_relay_dev?schema=public'
export DIRECT_URL="$DATABASE_URL"
export JWT_SECRET=cr-local-dev-jwt-secret-not-for-production-32b
export CARE_STORE_BACKEND=prisma
export CARE_UNDERSTAND_MODE=fixture
npm run care:api

# Terminal B — App
cd caretaker-relay
VITE_CARE_TRANSPORT=http VITE_CARE_API_URL=http://localhost:3100 npm run dev
```

Lab login (via API or app HTTP path): Sadeil  
`care_person_id=p-sadeil` / `sadeil-lab-password`

## Script

1. **Sadeil opens Today** — Needs you / What changed / Already handled / What happens next (five-second scan).  
2. **Durable state** — After a prior session, reload proves continuity from Prisma 5434.  
3. **Voice or text care update** — Mic fills editable transcript **or** type the canonical utterance.  
4. **Review transcript** — Edit before Send (especially if low confidence).  
5. **Relay understands** — Verification “I got this” with epistemic labels.  
6. **Confirm** — Looks right.  
7. **Today updates** — What changed / handoff refresh.  
8. **Appointment** — PT moved reflected.  
9. **Medication** — Recorded safely; discrepancy path if dose wrong.  
10. **Maya update** — Communication prepared under policy.  
11. **Handoff** — Ready for next caregiver.  
12. **Source** — Why am I seeing this / provenance.  
13. **Correction** — That’s wrong path preserves history.  
14. **Privacy** — Unauthorized / revoked cannot see Olivia’s state (API demo).  
15. **Reload** — Browser refresh + API restart preserves state.

## Not claimed in demo

- Live EMR  
- Real caregiver validation  
- Autonomous clinical decisions  
- Remote model if keys unavailable (fixture path labeled honestly)
