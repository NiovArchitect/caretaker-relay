# Role-Specific Care Operating System — 2026-07-26

## Principle

Five “How you connect” choices are **claims only** until identity, relationship, invitation, assignment, approval, or consent is established.

They share:

- secure identity
- authorization / membership
- provenance and audit
- care-event truth model

They **diverge** after authorization:

| Surface | Family/friend | Receiving care | DSP | Clinician | Invited |
|---------|---------------|----------------|-----|-----------|---------|
| Onboarding gate | Invite / request / provisional | Invite / my profile / privacy | Assignment invite first | Clinical relationship first | Code first |
| Today title | Today’s care | Your day | This shift | Clinical summary | Accept invitation |
| Nav emphasis | Today / Care / People | My day / My helpers | Shift / Care plan | Summary / Records | Minimal until accept |
| Relay tone | Plain language, confirm | Speak to recipient | Shift briefing | Evidence-linked | Wait for accept |
| AI permissions | No diagnosis; confirm consequential | Ask before notify | Assignment scope only | No admin; provenance | None until accept |

## Claim vs active role

| Concept | Source | Grants access? |
|---------|--------|----------------|
| **Role claim** | Account creation path / onboarding draft | **Never** |
| **Active role** | Server membership for a specific recipient | Yes, scoped |

One principal may hold different active roles for different recipients.

Code: `src/lib/roleExperience.ts`

## Zero-access invariants (P0 preserved)

- Public register → 0 memberships
- Role claim → 0 recipients
- “Set up care for someone new” → provisional draft only
- No seed fallback after 403 / registered session
- No auto recipient match by name/email/browser

## Authorization path (all claims)

```
account → claim → zero recipients → authority pathway
  → recipient membership → purpose/data-domain scope → role experience
```

## Implementation status

| Area | Status |
|------|--------|
| Claim vs active model | Shipped (client) |
| Role-specific gate copy & order | Shipped |
| Role-specific Today / nav labels | Shipped |
| Role-specific Relay server retrieval | Partial (tone client; server authz shared) |
| ETL / care-event pipeline | Schema + docs; ingestion partial |
| External calendar / SMS / booking | EXTERNAL / not faked |
| Org credentialing | EXTERNAL |

## Related

- `docs/coherence/LOGIN_ENTRY_INTENT_MODEL.md`
- `docs/coherence/SAFE_NEW_CARE_SETUP_FLOW.md`
- `docs/architecture/CARE_EVENT_ETL_PIPELINE.md`
- `docs/security/P0_UNAUTHORIZED_DISCLOSURE_INCIDENT.md`
