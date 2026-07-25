# Care Recipient Profile Architecture

## Model

`CareRecipient` carries optional `profile: CareRecipientProfile`.

- **Confirmed conditions** use `verification: CONFIRMED` and are never auto-promoted from caregiver observations.
- **Age** is always computed from `dateOfBirth` (deterministic).
- Missing fields return explicit “not on file” — never invented.

## Surfaces

| Surface | Role |
|---------|------|
| Care → About | Human profile + emergency snapshot |
| `GET /api/v1/care/recipients/:id/profile` | Authorized profile JSON |
| Relay Q&A | Age, diagnosis, identity, allergies, emergency intents |

## Access

Uses existing tenant/recipient relationship evaluation. Same truth; role-scoped projection may narrow later without a second store.

## Provenance

Profile fields carry source labels and verification where consequential (conditions, allergies, provider).
