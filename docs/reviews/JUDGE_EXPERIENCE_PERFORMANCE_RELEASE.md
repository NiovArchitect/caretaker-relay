# Judge Experience Performance Release — 2026-07-27

## Defect
Founder-observed multi-second to multi-ten-second login; broken judge flow.

## Root causes
1. **P0 product:** full Prisma care-store flush on every login/register.
2. **Client:** await API warm before submit.
3. **Infrastructure:** possible Render free-tier sleep (secondary).

## Fixes
- Audit-only flush path
- Register skip second full flush
- Non-blocking warm + progressive status
- Parallel Today secondary fetches

## Security preserved
Zero-access register, no seed fallback, authz unchanged.
