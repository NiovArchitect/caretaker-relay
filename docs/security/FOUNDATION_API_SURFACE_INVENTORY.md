# Foundation API Surface Inventory

**Date:** 2026-07-26  
**Method:** Count of Fastify route registrations under `apps/api/src/routes`

| Surface | Approx routes | Auth posture | Care product relevance |
|---------|---------------|--------------|------------------------|
| Care (`care.routes.ts`) | ~55+ | Care authorize + membership | **Closed this product** |
| Health | few | Public | OK |
| Auth (foundation) | multiple | AuthService | Shared |
| Otzar / work-os / collab | large | Foundation session + org | **Out of Caretaker product boundary** |
| Connectors / OAuth | multiple | Privileged | Not care UX |
| Admin / hive / regulator | multiple | Admin middleware | Not care UX |
| Voice / LLM admin | multiple | Privileged | Partial care voice |

**Inventory count (all apps/api routes files):** ~118 method registrations (grep).  
**Care-protected sensitive:** all recipient-scoped care routes.  
**Unresolved for Caretaker:** non-care Foundation routes remain Otzar-era surface — **not exposed as Caretaker public product** when using `Dockerfile.care` / care-app entrypoint.

**Caretaker deploy posture:** Care-only Docker (`Dockerfile.care`) — full Foundation surface not public for this product.
