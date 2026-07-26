# Account Suspension Contract

- POST /api/v1/care/accounts/suspend { person_id, reason }
- POST /api/v1/care/accounts/reactivate { person_id }
- Effects: status suspended, all tracked sessions revoked, resolveBearer returns ACCOUNT_SUSPENDED
- Audit: ACCOUNT_SUSPENDED / ACCOUNT_REACTIVATED
- History attribution retained in care store
