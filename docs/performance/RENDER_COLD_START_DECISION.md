# Render Cold Start Decision — 2026-07-27

## Observation

- Service: `caretaker-relay-care-api` on Render  
- Health when warm: ~200–300 ms  
- Login when process warm but before flush fix: ~24–26 s (**product flush**, not only sleep)  
- First request after long idle may still include Render spin-up (seconds to tens of seconds)

## Classification

| Cause | Type | Fix owner |
|-------|------|-----------|
| Full Prisma care-graph flush on login | **Product** | Fixed this release |
| Sequential await warm then login | **Product** | Fixed this release |
| Free/sleeping instance wake | **Infrastructure** | Always-on plan recommended |

## Decision

1. **Ship product flush fix immediately** (required).  
2. **Recommend** moving public Care API to **always-on** Render instance for judge day.  
3. Keep fire-and-forget warm on login mount; never block UI paint.  
4. UX copy after 2.5s: “Secure care service is waking. Your access has not changed.”  
5. No aggressive self-ping loop; no unauthenticated judge bypass.

## Status

`INFRASTRUCTURE ROOT CAUSE: RENDER COLD START` may still apply after idle.  
`PRODUCT ROOT CAUSE: FULL_STORE_FLUSH_ON_LOGIN` addressed in this release.
