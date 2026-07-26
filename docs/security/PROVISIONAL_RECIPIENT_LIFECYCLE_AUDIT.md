# Provisional Recipient Lifecycle

**Date:** 2026-07-26

## States

draft → ready_to_activate (after explicit bind) → active | declined | expired | suspended | duplicate_review

Also modeled: invitation_pending, verification_pending, representative_review, organization_review (for future UI).

## Security rules

- No automatic merge by name  
- No search/discovery of existing recipient PHI  
- Bind requires explicit `care_recipient_id`  
- Decline/expire grant no access  
- Audit: CREATED / BOUND / ACTIVATED / DECLINED  

## API

- POST `/provisional-recipients`  
- GET `/provisional-recipients/mine`  
- POST `/provisional-recipients/:id/bind`  
- POST `/provisional-recipients/:id/activate`  
- POST `/provisional-recipients/:id/decline`  

## UX

AuthorizationGate provisional form → durable draft when JWT present.
