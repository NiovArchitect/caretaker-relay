# Consent & Access Experience

Controllers (via GET .../access):
- who_can_see_what (matrix)
- access_summary: last_access_at, last_surface per member
- scope modify: POST .../access/scope
- revoke: POST .../access/revoke

Pending requests: /access-requests
Reauthorization: scope modify + revoke + re-approve path
Last access: from CARE_DATA_VIEW / CARE_ANSWER audits (no PHI content)

PASS for server contract; richer history UI remains partial.
