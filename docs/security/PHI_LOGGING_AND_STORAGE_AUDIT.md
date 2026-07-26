# PHI Logging and Client Storage Audit

**Date:** 2026-07-26

| Surface | Risk | Mitigation |
|---------|------|------------|
| CareAuditRow.details | Free-form PHI | `redactAuditDetails` on new writes |
| Lab JWT in logs | Token leak | Never log Authorization header |
| Verification codes | OTP | Hash at rest; expose only CARE_EXPOSE_VERIFY_CODE |
| Invite tokens | Replay | Hash at rest after create |
| AI prompts | PHI | AI gate + no full prompts in audit by default |
| Browser sessionStorage | Token | Existing session key; clear on logout |
| Render logs | Ops | Correlation IDs preferred |
| CI logs | Secrets | No secrets in fixtures |

Redaction module: `packages/care-domain/src/services/phi-redact.ts`
