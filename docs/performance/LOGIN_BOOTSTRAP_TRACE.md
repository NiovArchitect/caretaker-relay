# Login Bootstrap Trace — 2026-07-27

## Public measurement (before repair)

| Step | Timing |
|------|--------|
| App HTML | ~0.24s |
| API `/care/health` (warm) | ~0.22–0.27s |
| Lab principals | ~0.24s |
| **Login #1** | **~26.4s** |
| **Login #2 (warm process)** | **~24.2s** |
| **Register** | **~54.2s** |

## Root cause (evidence)

Not “frontend alone.” Health is sub-second while login is multi-second to multi-ten-second.

**Primary product cause:** `PrismaCareStore.flush()` after login/register re-upserted the **entire care graph** (people, relationships, events, updates, meds, …) on every auth write.

Login flow:

1. `foundationAuth.login` (bcrypt + multiple Foundation DB writes)  
2. Care principal link resolve  
3. `writeAudit` → marked store **dirty**  
4. `await flush()` → full-graph sequential Prisma upserts  

Register compounded this: structural create + **full flush** + login + **second full flush** (~54s).

## Repair

1. `writeAudit` sets `auditDirty` only (not structural `dirty`).  
2. `flush()` short-circuits to **audit-only** append when `!dirty && auditDirty`.  
3. Register skips second full flush on login (`skipCareFlush`).  
4. Client: **do not await** `warmCareApi()` on submit; progressive status after 2.5s.  
5. Today: parallel secondary fetches after shell paint.

## Hosting note

Render free-tier sleep can still add cold wake on first hit after idle. Classified separately from the full-flush defect. Prefer always-on API for competition.
