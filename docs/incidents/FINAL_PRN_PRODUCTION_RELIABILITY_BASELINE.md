# FINAL PRN PRODUCTION RELIABILITY BASELINE

**Recorded:** 2026-07-30T11:30:00Z  
**Controller:** Agent Zero  
**Rule:** No product code modified before this baseline was written.

## Public runtime

| Surface | Value |
|---------|-------|
| APP | https://care.niovlabs.com |
| API | https://caretaker-relay-care-api.onrender.com |
| Health | ok, prisma, regulated_restricted, understand_mode llm |
| Bundle | `assets/index-DciNDcpz.js`, `assets/index-Y4W5J38l.css` |

## Repository HEADs

| Repo | Branch | HEAD | Dirty |
|------|--------|------|-------|
| caretaker-relay-foundation | checkpoint/… | `649b11de3d1d8a37023c891e8f30218a8df56495` | untracked judge-browser-journeys.mjs |
| caretaker-relay | checkpoint/… | `813e10c290ea49417c43a467c41602386fb35856` | prior docs/e2e noise |

## Deploy SHAs

| Service | Status | Commit |
|---------|--------|--------|
| care-api | live | `0f2bbe2a17f7` |
| care-web | live | `c5dea925de33` |

## Known open gates (this campaign)

1. Client always attaches/persists X-Idempotency-Key on PRN confirm/reassess  
2. Real elapsed-time overdue (not only injected clock)  
3. Exhaustive offline/stale-tab matrix (client + public)  
4. Public dual-org multi-tenant matrix  
5. Full non-PRN regression bank  
6. Founder desktop / phone PENDING  

## Frozen PRN foundation

Accepted as of API `0f2bbe2` / app product `c5dea92` — do not rebuild domain.
