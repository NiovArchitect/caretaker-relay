# ACL Privacy & Security Traceability

**Date:** 2026-07-26

| ACL / privacy expectation | Product behavior | Evidence |
|---------------------------|------------------|----------|
| Dignity & choice | Recipient not auto-linked by role | `listAuthorizedCareSpaces` fail-closed |
| Human accountability | Display name required on create | `LoginGate` create form |
| Authorization before access | Zero recipients for new accounts | `AuthorizationGate` |
| Invitation path | Code bound without revealing recipient | `bindInviteToken` |
| Access request | Submit without data exposure | `submitAccessRequest` |
| No false compliance | Docs use HIPAA-ready language | `HIPAA_APPLICABILITY_MATRIX.md` |
| AI human-in-loop | Existing verify panels for consequential facts | Relay verify (prior) |
