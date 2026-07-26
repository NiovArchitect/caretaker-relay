# Role Journey Coherence Audit — 2026-07-26

| Role | Entry | AuthZ | Surfaces | Relay | Issues fixed |
|------|-------|-------|----------|-------|--------------|
| Pending / new account | Create account | 0 recipients | AuthorizationGate | Denied | Server register durable |
| Family caregiver | Lab or invite | Membership | Full care | Scoped | Existing user labels |
| Family/friend | Invite/approve | Limited scope | Subset | Min-necessary | Scope API |
| DSP / paid | Seed membership | Limited | Shift-relevant | Scoped | Field projection |
| Clinician | Seed | Clinical categories | Care/People | Scoped | No admin by default |
| Org admin | N/A product | — | — | — | EXTERNAL |
| Recipient self | Future | Self | All | All | Partial product |
| Personal rep | EXTERNAL | — | — | — | Legal EXTERNAL |
| Revoked | After revoke | None | Gate/deny | 403 | Immediate |
| Suspended | Suspend API | Account block | Deny | Deny | Session wipe |

Coherence: **COHERENT** for care product roles with EXTERNAL for rep/credentialing.
