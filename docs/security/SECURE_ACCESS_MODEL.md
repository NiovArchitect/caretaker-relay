# Secure Access Model (Authoritative)

## Separation

1. **Authentication** — who is signed in (account).  
2. **Authorization** — which care recipients they may access.  
3. **Role claim** — self-description only until verified.

## Create account

- Requires preferred/display name + email.  
- Does **not** log in as a lab principal with memberships.  
- Starts with **zero** authorized recipients.  
- Shows `AuthorizationGate` pathways.

## Lab demo sign-in

- Explicit principal selection.  
- Memberships from seed table only.  
- Labeled as lab; not production IdP.

## Pathways to recipient access

- Valid invitation accept (server).  
- Access request → approval.  
- Org assignment / professional relationship (future).  
- Lawful representative authority (future + legal).  

## Fail closed

Unknown principals and pending-local accounts resolve to `cr-none`.
