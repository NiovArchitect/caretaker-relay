# Official ACL / Care Coordination Research — Operating Model Inputs

**Date:** 2026-07-26  
**Purpose:** Ground signup, invitation, coverage, emergency, and empty-state design in ACL-aligned home/community caregiving practice.  
**Product:** Caretaker Relay Phase 1 lab (not a licensed provider network).

## Sources consulted (public)

| Source | Relevance |
|--------|-----------|
| Administration for Community Living (ACL) — acl.gov | Family caregiver support framing; community living |
| ACL National Family Caregiver Support Program (NFCSP) overview | Respite, counseling, training — not app dispatch |
| AHRQ care transitions / handoffs (MATCH, PSNet) | Handoff content: what changed, attention, contacts |
| CMS Person-Centered Planning concepts (public summaries) | Goals/preferences before clinical inventory |
| HIPAA covered-entity boundaries (general) | Who may access PHI; minimum necessary |
| Supported decision-making (public disability advocacy summaries) | Recipient not passive object; progressive consent |

## Findings mapped to product

### 1. Care circle governance
- Home/community care typically has a **primary family contact or authorized representative** who controls who is invited into sensitive information sharing.
- Ordinary helpers should not freely expand the circle without authority.
- **Product:** Invite UI only for primary circle contact; accept-with-code for invitees; server-side membership remains authoritative.

### 2. Progressive onboarding
- Family systems rarely complete a full medical intake on day one.
- Person-centered planning emphasizes goals, preferences, and what matters before dense clinical data.
- **Product:** Lightweight second recipient (Robert) is valid; empty fields mean “not on file”; enrich via Care + Relay verify.

### 3. Coverage vs marketplace
- NFCSP/respite programs are **resource pathways**, not app-employed staff.
- **Product:** Private-circle coverage requests only; explicit non-claims for marketplace, dispatch, and emergency staffing.

### 4. Emergency information
- Emergency cards help first responders when accurate and current.
- Unverified blood type is low value and high risk if wrong.
- **Product:** Show blood type only if on file; label provenance; never invent; emergency call disclaimer always present.

### 5. Relay role
- Tools should reduce re-explanation and surface open items — not replace clinicians or emergency services.
- **Product:** Ambient orientation + coordination messaging; no diagnose; no dose invent.

## Gaps intentionally external
- Field caregiver sessions with real households (EXTERNAL_PENDING)
- Partner agency integrations (EXTERNAL)
- Full self-serve revocation console (admin path)
- Paid shift marketplace (out of product scope)
