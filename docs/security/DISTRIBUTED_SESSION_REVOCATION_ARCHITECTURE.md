# Distributed Session Revocation Architecture

1. Lab JWT mint tracks session id under principal list (shared store).
2. Logout/revoke writes `cr:sess:rev:{sid}` with TTL 12h.
3. validateBearerShared checks shared store then mirrors to process-local denylist.
4. Principal suspension: revokeAllForPrincipal + ACCOUNT_SUSPENDED status.
5. Foundation sessions: AuthService.logout terminates DB session (pre-existing).

Multi-instance PASS with shared Map (tests) or Redis (prod when configured).
