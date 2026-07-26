# Secure Access Model (Authoritative)

## Separation

1. **Authentication** — who is signed in (account / session).  
2. **Authorization** — which care recipients they may access (server membership).  
3. **Role claim** — self-description only until verified.

## Create account

- Requires preferred/display name + email + password.  
- Prefer durable `POST /api/v1/care/auth/register` (server).  
- Does **not** grant lab principal memberships.  
- Starts with **zero** authorized recipients.  
- Shows `AuthorizationGate` pathways.

## Lab demo sign-in

- Explicit principal selection.  
- Memberships from seed table only.  
- Labeled as lab; not production IdP.

## Pathways to recipient access

- Valid invitation accept (server).  
- Access request → approval (server).  
- Org assignment / professional relationship (future / EXTERNAL).  
- Lawful representative authority (future + legal EXTERNAL).  

## Server contract

```
authorize({ actor, recipient, action, dataDomain, purpose })
→ { allowed, reasonCode, authorizationSource, effectiveScope, audit }
```

Deny by default. Client gates are UX only.

## Fail closed

Unknown principals and pending accounts resolve to `cr-none` / zero memberships.
