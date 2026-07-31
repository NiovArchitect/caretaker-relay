# CARETAKER RELAY — FINAL INTERNAL RELEASE (SELF + ROLE FIXTURES)

## Shipped

### API `c0b159e` · deploy `dep-d9m4958ae00c73bdhc10`

- `POST /api/v1/care/recipient-self/setup` — any preferred name
- `care_recipient` role + self access scopes (incl. medications)
- Invite role normalization (`recipient_self` → `care_recipient`)
- Provisional bind to existing recipient requires controlling authority

### App `3af981b` · bundle `index-DNKXOTHH.js` · deploy `dep-d9m495nlk1mc739o1n00`

- AuthorizationGate self path calls recipient-self setup and reloads into care space

## Proof highlights

- 8/8 role fixtures via product paths
- Recipient-self browser strip + H&P
- Wrong bind 403
- Clinical 30/30, shift 30/30, med 20/20, PRN 12/12, founder 21/21 generic 0
- Claim human success with `{}`

## Explicit non-claims

Internal freeze not restored. Full browser field matrices, Playwright suite, lint, AppSec, CI remain OPEN.
