# Role Journey Coherence Audit — 2026-07-26 (updated role OS)

| Role | Entry | AuthZ | Surfaces | Relay | Status |
|------|-------|-------|----------|-------|--------|
| Pending / new account | Create account | 0 recipients | Role-specific AuthorizationGate | Denied | PASS |
| Family/friend claim | Path claim | 0 until invite/request/provisional | Family gate order + Today labels | Tone only until authz | PASS claim; authz path prior |
| Receiving care claim | Path claim | 0 until profile/invite | My day / helpers / privacy note | Recipient tone | PARTIAL product depth |
| DSP claim | Path claim | 0 until assignment | Shift gate + Shift nav | Briefing tone | PARTIAL assignment UX |
| Clinician claim | Path claim | 0 until verification | Clinical gate + Summary | Evidence tone | PARTIAL / EXTERNAL credentialing |
| Invited claim | Path claim | 0 until code accept | Invite-first gate | Wait | PARTIAL accept UX |
| Family caregiver active | Membership | Recipient-scoped | Full care | Scoped | PASS (lab/membership) |
| DSP active | Assignment | Time-bounded scope | Shift framing | Scoped | PARTIAL |
| Clinician active | Relationship | Clinical categories | Clinical framing | Provenance | PARTIAL |
| Recipient self active | Self membership | Self | Access control primary | Direct speech | PARTIAL |
| Org admin | N/A product | — | — | — | EXTERNAL |
| Personal rep | EXTERNAL | — | — | — | EXTERNAL |
| Revoked | After revoke | None | Gate/deny | 403 | PASS |
| Suspended | Suspend API | Account block | Deny | Deny | PASS |

See `ROLE_SPECIFIC_CARE_OS.md`. Coherence: **PARTIAL** for full ambient OS; **PASS** for claim-only zero-access + role-aware shell.
