# CARE RECIPIENT SELF IDENTITY CONTRACT

**Works for any preferred name / profile — not hard-coded to Evelyn/Olivia.**

## Distinctions

| Concept | Meaning |
|---------|---------|
| Account | Signed-in product identity (`p-acct-*` or lab principal) |
| Person | Human in the care-team model |
| Care recipient | Subject of care records (`cr-*`) |
| Relationship | Authorized link account/person → recipient |
| Self ownership | Verified `care_recipient` relationship: signed-in person is the subject |

## Forbidden self grants

- Names match  
- DOB match  
- Email resemblance  
- Knowing a recipient id alone  
- Selecting claim:self at registration  
- Same organization alone  
- Invitation intended for another role  

## Allowed linkage methods

### A. Recipient-created care space (Journey 1)

`POST /api/v1/care/recipient-self/setup`

```json
{ "preferred_name": "<any name>", "confirmation": "I am creating a care space for myself" }
```

Creates new recipient + `care_recipient` relationship + consent. Never merges by name.

### B. Verified invitation (Journey 2)

Authorized controller invites with `role: "care_recipient"` (aliases: `recipient_self`, `self`). Invitee accepts. Idempotent accept for same pair.

### C. Administrative match

Not implemented as free-form name search. Controlling authority may invite only.

## Self relationship fields

- account/person id  
- recipient id  
- relationship type: `care_recipient`  
- verification method: `recipient_created_care_space` | `invitation_accept`  
- status, start, revocation, audit  

## Access scope (self)

**May:** view own care plan, medications, appointments, demographics (scoped), record observations, request corrections, message care team (when product supports).

**Must not:** invite caregivers, change med schedule, reassign work, clinician review authority, other-recipient data, caregiver-private coordination.

## Security targets

- NAME-ONLY CLAIMS: 0  
- UNVERIFIED SELF CLAIMS: 0  
- CROSS-TENANT SELF CLAIMS: 0  
- DUPLICATE SELF RELATIONSHIPS: 0 (idempotent setup)  
